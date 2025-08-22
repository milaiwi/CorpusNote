use std::{path::PathBuf, sync::Arc};

use arrow_array::{FixedSizeListArray, Int32Array, ListArray, RecordBatch, RecordBatchIterator, StringArray, types::Float32Type, Float32Array};
use arrow_schema::{DataType, Field, Schema};
use arrow::buffer::OffsetBuffer;

use lancedb::connection::Connection;
use lancedb::query::{ExecutableQuery, QueryBase};
use lancedb::{connect, Table as LanceDbTable, index::Index};
use lancedb::index::scalar::FtsIndexBuilder;
use lance_index::scalar::FullTextSearchQuery;

// Scanning / printing our table out
use futures::TryStreamExt;
use arrow::util::pretty::print_batches;

use tauri::State;
use crate::DbConn;

#[derive(serde::Deserialize, serde::Serialize)]
pub struct Chunk {
    pub file_path: String,
    pub text: String,
    pub source_block_ids: Vec<String>,
    pub embedding: Vec<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub score: Option<f32>,
}

// --------------------- initialize the database connection ---------------------
pub async fn init(app_data_path: PathBuf) -> lancedb::Result<Connection> {
    println!("Initializing database connection");
    let db_dir = app_data_path.join("lancedb");
    println!("Database path is located at: {}", db_dir.display());

    let db_uri = match db_dir.to_str() {
        Some(s) => s,
        None => {
            return Err(lancedb::Error::InvalidInput {
                message: format!("Path is not valid UTF-8: {}", db_dir.display()),
            });
        }
    };
    
    let db = connect(db_uri).execute().await?;
    Ok(db)
}

// --------------------- check if table exists ---------------------
#[tauri::command]
pub async fn table_exists(db: State<'_, DbConn>, name: String) -> Result<bool, String> {
    println!("Checking if table '{}' exists", name);
    
    match db.0.table_names().execute().await {
        Ok(table_names) => {
            let exists = table_names.iter().any(|table_name| table_name == &name);
            println!("Table '{}' exists: {}", name, exists);
            Ok(exists)
        }
        Err(e) => {
            println!("Error checking table names: {}", e);
            Err(format!("Failed to check table names: {e}"))
        }
    }
}

// --------------------- create & populate your target table ---------------------
#[tauri::command]
pub async fn create_empty_table(db: State<'_, DbConn>, name: String, embed_dim: i32) -> Result<String, String> {
  println!("Creating empty table: {}", name);

  let schema = Arc::new(Schema::new(vec![
      Field::new("id",        DataType::Int32, false),
      Field::new("file_path", DataType::Utf8,  false),
      Field::new("source_block_ids",  DataType::List(Arc::new(Field::new("item", DataType::Utf8, false))),  false),
      Field::new("text",      DataType::Utf8,  false),
      Field::new(
          "embedding",
          DataType::FixedSizeList(
              Arc::new(Field::new("item", DataType::Float32, false)),
              embed_dim,
          ),
          false,
      ),
  ]));

  // Create the table
  let tbl = db.0.create_empty_table(&name, schema).execute().await
    .map_err(|e| e.to_string())?;

  create_fts_index_for_table(&tbl).await?;
  Ok(format!("Table '{}' created successfully", name))
}

// --------------------- insert chunks into the table ---------------------
#[tauri::command]
pub async fn insert_chunks(db: State<'_, DbConn>, name: String, chunks: Vec<Chunk>, embed_dim: i32) -> Result<String, String> {
    println!("Inserting {} chunks into table: {}", chunks.len(), name);
    
    // First check if the table exists, create it if it doesn't
    let table_exists = table_exists(db.clone(), name.clone()).await?;
    if !table_exists {
        println!("Table '{}' does not exist, creating it first", name);
        create_empty_table(db.clone(), name.clone(), embed_dim).await?;
    }
    
    // Now proceed with inserting chunks
    insert_chunks_into_existing_table(db, name, chunks, embed_dim).await
}

// Helper function to insert chunks into an existing table
async fn insert_chunks_into_existing_table(db: State<'_, DbConn>, name: String, chunks: Vec<Chunk>, embed_dim: i32) -> Result<String, String> {
    println!("Inserting {} chunks into existing table: {}", chunks.len(), name);
    
    // Open the table
    let tbl: LanceDbTable = db.0.open_table(&name).execute().await
        .map_err(|e| format!("Failed to open table: {e}"))?;
    
    // Get the table schema
    let schema = tbl.schema().await
        .map_err(|e| format!("Failed to get schema: {e}"))?;
    
    // Validate that all chunks have the correct embedding dimension
    for (i, chunk) in chunks.iter().enumerate() {
        if chunk.embedding.len() != embed_dim as usize {
            return Err(format!("Chunk {} has embedding dimension {}, expected {}", 
                i, chunk.embedding.len(), embed_dim));
        }
    }
    
    // Generate random 32-bit integer IDs for each chunk
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    use std::time::{SystemTime, UNIX_EPOCH};
    
    let mut ids = Vec::with_capacity(chunks.len());
    for (i, chunk) in chunks.iter().enumerate() {
        let mut hasher = DefaultHasher::new();
        // Hash the chunk content and current timestamp to generate a unique ID
        chunk.file_path.hash(&mut hasher);
        chunk.text.hash(&mut hasher);
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos()
            .hash(&mut hasher);
        i.hash(&mut hasher);
        
        let id = hasher.finish() as i32;
        ids.push(id);
    }
    
    // Build Arrow arrays from the chunks
    let ids = Int32Array::from(ids);
    let paths = StringArray::from(chunks.iter().map(|c| c.file_path.as_str()).collect::<Vec<_>>());
    
    // Create ListArray for source_block_ids manually
    let mut offsets = Vec::with_capacity(chunks.len() + 1);
    let mut values = Vec::new();
    offsets.push(0);
    
    for chunk in &chunks {
        for block_id in &chunk.source_block_ids {
            values.push(Some(block_id.as_str()));
        }
        offsets.push(values.len() as i32);
    }
    
    let values_array = StringArray::from(values);
    let source_block_ids = ListArray::try_new(
        Arc::new(Field::new("item", DataType::Utf8, false)),
        OffsetBuffer::new(offsets.into()),
        Arc::new(values_array),
        None,
    ).map_err(|e| format!("Failed to create ListArray: {e}"))?;
    
    let texts = StringArray::from(chunks.iter().map(|c| c.text.as_str()).collect::<Vec<_>>());
    
    // Convert embeddings to FixedSizeListArray
    println!("Embed dim is size {}", embed_dim);
    let embedding = FixedSizeListArray::from_iter_primitive::<Float32Type, _, _>(
        chunks.iter().map(|chunk| {
            let row: Vec<Option<f32>> = chunk.embedding.iter().map(|&x| Some(x)).collect();
            Some(row)
        }),
        embed_dim,
    );
    
    // Create the RecordBatch
    let batch = RecordBatch::try_new(
        schema.clone(),
        vec![
            Arc::new(ids),
            Arc::new(paths),
            Arc::new(source_block_ids),
            Arc::new(texts),
            Arc::new(embedding),
        ],
    )
    .map_err(|e| format!("Failed to create batch: {e}"))?;
    
    // Insert the data
    let reader = RecordBatchIterator::new(vec![batch].into_iter().map(Ok), schema);
    tbl.add(reader).execute().await
        .map_err(|e| format!("Failed to add data: {e}"))?;
    
    Ok(format!("Successfully inserted {} chunks into table '{}'", chunks.len(), name))
}

// --------------------- search the table ---------------------
#[tauri::command]
pub async fn search(db: State<'_, DbConn>, name: String, query: String, query_vector: Vec<f32>, limit: Option<usize>) -> Result<String, String> {

    let tbl: LanceDbTable = db.0.open_table(&name).execute().await
        .map_err(|e| format!("Failed to open table: {e}"))?;

    let query_limit = limit.unwrap_or(10);

    let indices = tbl.list_indices().await.map_err(|e| e.to_string())?;
    let fts_index_exists = indices.iter().any(|index| index.index_type.to_string() == "FTS");
    println!("FTS index exists: {}", fts_index_exists);

    let mut stream = tbl.query()
        .nearest_to(query_vector)
        .map_err(|e| format!("Failed to execute query: {e}"))?
        .full_text_search(FullTextSearchQuery::new(query.clone()))
        .limit(query_limit as usize)
        .execute()
        .await
        .map_err(|e| format!("Failed to execute query: {e}"))?;

    let mut results: Vec<Chunk> = Vec::new();

    while let Some(batch_result) = stream.try_next().await.map_err(|e| e.to_string())? {
        let batch = batch_result;

        let file_path_array = batch.column_by_name("file_path").unwrap().as_any().downcast_ref::<StringArray>().unwrap();
        let text_array = batch.column_by_name("text").unwrap().as_any().downcast_ref::<StringArray>().unwrap();
        let source_block_ids_array = batch.column_by_name("source_block_ids").unwrap().as_any().downcast_ref::<ListArray>().unwrap();
        let embedding_array = batch.column_by_name("embedding").unwrap().as_any().downcast_ref::<FixedSizeListArray>().unwrap();
        let score_array = batch.column_by_name("_score").unwrap().as_any().downcast_ref::<Float32Array>().unwrap();

        for i in 0..batch.num_rows() {
            let source_block_ids_list = source_block_ids_array.value(i);
            let source_block_ids_str_array = source_block_ids_list.as_any().downcast_ref::<StringArray>().unwrap();
            
            results.push(Chunk {
                file_path: file_path_array.value(i).to_string(),
                text: text_array.value(i).to_string(),
                source_block_ids: source_block_ids_str_array.iter().map(|v| v.unwrap().to_string()).collect(),
                embedding: embedding_array.value(i).as_any().downcast_ref::<Float32Array>().unwrap().values().to_vec(),
                score: Some(score_array.value(i)),
            });
        }
    }
    
    serde_json::to_string(&results).map_err(|e| e.to_string())
}


// --------------------- create FTS index ---------------------
async fn create_fts_index_for_table(table: &LanceDbTable) -> Result<String, String> {
    println!("Creating FTS index for table...");
    
    table.create_index(&["text"], Index::FTS(FtsIndexBuilder::default()))
        .execute()
        .await
        .map_err(|e| e.to_string())?;
    
    Ok(format!("Successfully created FTS index on 'text' column."))
}

// --------------------- view the table ---------------------
#[tauri::command]
pub async fn view_table(db: State<'_, DbConn>, name: String, limit: usize) -> Result<String, String> {
  println!("Viewing table: {}", name);
  let tbl: LanceDbTable = db.0.open_table(name).execute().await
        .map_err(|e| format!("Failed to open table: {e}"))?;
    
  let stream = tbl.query().limit(limit).execute().await
        .map_err(|e| format!("Failed to execute query: {e}"))?;
    
  let batches = stream.try_collect::<Vec<_>>().await
        .map_err(|e| format!("Failed to collect batches: {e}"))?;
    
  print_batches(&batches).map_err(|e| format!("Failed to print batches: {e}"))?;

  Ok(format!("Successfully viewed table with {} batches", batches.len()))
}
  