// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use arrow::array::{
    builder::{ListBuilder, StringBuilder},
    Array, FixedSizeListArray, Float32Array, RecordBatch, StringArray,
};
use arrow::datatypes::{DataType, Field, Schema};
use lancedb::connection::Connection;
use lancedb::table::Table;
use serde::Deserialize;
use std::sync::{Arc, Mutex};
use tauri::api::path::app_data_dir;
use tauri::Config;

pub struct DbManager {
    db: Option<Connection>,
    table: Option<Table>,
}

// Struct to deserialize the chunk data coming from the frontend
#[derive(Deserialize, Debug)]
struct Chunk {
    text: String,
    #[serde(rename = "sourceBlockIds")]
    source_block_ids: Vec<String>,
}

// Command to initialize the database, equivalent to your `initialize` method
#[derive(serde::Deserialize)]
struct InitializeArgs {
    #[serde(rename = "embedDim")]
    embed_dim: u32,
    #[serde(rename = "forceRecreate")]
    force_recreate: bool,
}

#[tauri::command]
async fn db_initialize(
    args: InitializeArgs,
    state: tauri::State<'_, Mutex<DbManager>>,
) -> Result<(), String> {
    println!("[DB] db_initialize called with embedDim: {}, forceRecreate: {}", args.embed_dim, args.force_recreate);
    // Lock the state only to check the initial condition.
    {
        let manager = state.lock().unwrap();
        if manager.table.is_some() && !args.force_recreate {
            println!("[DB] Table already initialized.");
            return Ok(());
        }
    } // The lock is automatically released here when `manager` goes out of scope.

    // Now, perform all async operations without holding the lock.
    let app_data_path = app_data_dir(&Config::default()).unwrap();
    let db_path = app_data_path.join(".lancedb");
    let db = lancedb::connect(db_path.to_str().unwrap())
        .execute()
        .await
        .map_err(|e| e.to_string())?;

    let table_names = db
        .table_names()
        .execute()
        .await
        .map_err(|e| e.to_string())?;

    if table_names.contains(&"chunks".to_string()) && args.force_recreate {
        db.drop_table("chunks").await.map_err(|e| e.to_string())?;
        println!("[DB] Dropped existing table 'chunks'.");
    }

    let final_table;
    if !table_names.contains(&"chunks".to_string()) || args.force_recreate {
        let schema = Arc::new(Schema::new(vec![
            Field::new(
                "vector",
                DataType::FixedSizeList(
                    Arc::new(Field::new("item", DataType::Float32, true)),
                    args.embed_dim as i32,
                ),
                false,
            ),
            Field::new("text", DataType::Utf8, false),
            Field::new(
                "sourceBlockIds",
                DataType::List(Arc::new(Field::new("item", DataType::Utf8, true))),
                false,
            ),
            Field::new("filePath", DataType::Utf8, false),
        ]));

        final_table = db
            .create_empty_table("chunks", schema)
            .execute()
            .await
            .map_err(|e| e.to_string())?;
        println!("[DB] Created new table 'chunks'.");
    } else {
        final_table = db
            .open_table("chunks")
            .execute()
            .await
            .map_err(|e| e.to_string())?;
        println!("[DB] Opened existing table 'chunks'.");
    }

    // Re-lock the state at the very end to write the results.
    {
        let mut manager = state.lock().unwrap();
        manager.table = Some(final_table);
        manager.db = Some(db);
    }

    Ok(())
}

// Command to upsert data, equivalent to your `upsert` method
#[tauri::command]
async fn db_upsert(
    chunks: Vec<Chunk>,
    vectors: Vec<Vec<f32>>,
    file_path: String,
    state: tauri::State<'_, Mutex<DbManager>>,
) -> Result<(), String> {
    // Get the table reference without holding the lock across async operations
    let table = {
        let manager = state.lock().unwrap();
        manager.table.clone()
    };
    
    if let Some(table) = table {
        let num_rows = chunks.len();
        let schema = table.schema().await.map_err(|e| e.to_string())?;

        // 1. Create `filePath` array
        let file_path_array = Arc::new(StringArray::from(vec![file_path; num_rows]));

        // 2. Create `text` array
        let text_array = Arc::new(StringArray::from(
            chunks.iter().map(|c| c.text.clone()).collect::<Vec<_>>(),
        ));

        // 3. Create `sourceBlockIds` list array
        let string_builder = StringBuilder::new();
        let mut list_builder = ListBuilder::new(string_builder);
        for chunk in chunks.iter() {
            for id in chunk.source_block_ids.iter() {
                list_builder.values().append_value(id);
            }
            list_builder.append(true);
        }
        let source_block_ids_array = Arc::new(list_builder.finish());

        // 4. Create `vector` fixed size list array
        let flat_vectors: Vec<f32> = vectors.into_iter().flatten().collect();
        let vector_values = Float32Array::from(flat_vectors);
        let vector_field = schema.field_with_name("vector").unwrap();
        let embed_dim = if let DataType::FixedSizeList(_, dim) = vector_field.data_type() {
            *dim
        } else {
            return Err("Vector dimension not found in schema".to_string());
        };
        let vector_array = Arc::new(
            FixedSizeListArray::new(
                Arc::new(Field::new("item", DataType::Float32, true)),
                embed_dim,
                Arc::new(vector_values),
                None,
            ),
        );

        // 5. Create RecordBatch
        let batch = RecordBatch::try_new(
            schema.clone(),
            vec![
                vector_array as Arc<dyn Array>,
                text_array as Arc<dyn Array>,
                source_block_ids_array as Arc<dyn Array>,
                file_path_array as Arc<dyn Array>,
            ],
        )
        .map_err(|e| e.to_string())?;

        // 6. Add to table
        let reader = arrow::record_batch::RecordBatchIterator::new(
            vec![Ok(batch)].into_iter(),
            schema.clone(),
        );
        table
            .add(reader)
            .execute()
            .await
            .map_err(|e| e.to_string())?;

        println!("[DB] Upserted {} chunks.", num_rows);
        Ok(())
    } else {
        Err("Database not initialized.".to_string())
    }
}

// Command to delete data, equivalent to your `delete` method
#[tauri::command]
async fn db_delete(
    _file_path: String,
    _state: tauri::State<'_, Mutex<DbManager>>,
) -> Result<(), String> {
    // TODO: Implement this
    Ok(())
}

// We then invoke a handler so that it can be accessed
// and used elsewhere (.invoke_handler(tauri::generate_handler![greet]))
fn main() {
    let db_manager = Mutex::new(DbManager {
        db: None,
        table: None,
    });

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .manage(db_manager)
        .invoke_handler(tauri::generate_handler![
            db_initialize,
            db_upsert,
            db_delete,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
