// import * as lancedb from "@lancedb/lancedb";
// import * as arrow from "apache-arrow";
// import { appDataDir, join } from "@tauri-apps/api/path";
// import { CHUNK_SCHEMA } from "./schema";
// import { Chunk } from "../index/chunking"; // Assuming this is where Chunk is defined

// class VectorDBManager {
//     private db: lancedb.Connection | null = null;
//     private table: lancedb.Table | null = null;
//     private embeddingDimension: number = 384;

//     constructor(embedDim: number) {
//         this.embeddingDimension = embedDim;
//     }

//     /**
//      * Connects to the DB and creates the table if it doesn't exist.
//      * This should be called once when the application starts.
//      */
//     public async initialize(force_recreate: boolean = false): Promise<void> {
//         if (this.table) return; // Already initialized

//         try {
//             const appData = await appDataDir();
//             const dbPath = await join(appData, ".lancedb");
//             this.db = await lancedb.connect(dbPath);

//             const tableNames = await this.db.tableNames();
//             if (tableNames.includes("chunks") && !force_recreate) {
//                 this.table = await this.db.openTable("chunks");
//                 console.log("[DB] Opened existing table 'chunks'.");
//             } else if (tableNames.includes("chunks") && force_recreate) {
//                 await this.db.dropTable("chunks");
//                 console.log("[DB] Dropped existing table 'chunks'.");
//             } else {
//                 const schema = new arrow.Schema([
//                     new arrow.Field(CHUNK_SCHEMA.VECTOR, new arrow.FixedSizeList(this.embeddingDimension, new arrow.Field("item", new arrow.Float32()))),
//                     new arrow.Field(CHUNK_SCHEMA.TEXT, new arrow.Utf8()),
//                     new arrow.Field(CHUNK_SCHEMA.SOURCE_BLOCK_IDS, new arrow.List(new arrow.Field("item", new arrow.Utf8()))),
//                     new arrow.Field("filePath", new arrow.Utf8()), // Add filePath to the schema
//                 ]);
//                 this.table = await this.db.createTable({ name: "chunks", data: [], schema: schema, existOk: true });
//                 console.log("[DB] Created new table 'chunks'.");
//             }
//         } catch (error) {
//             console.error(`[DB] Error initializing LanceDB:`, error);
//         }
//     }

//     /**
//      * Adds new chunks and their vectors to the database.
//      */
//     public async upsert(chunks: Chunk[], vectors: number[][], filePath: string): Promise<void> {
//         if (!this.table) throw new Error("Database not initialized.");

//         const data = chunks.map((chunk, i) => ({
//             vector: vectors[i],
//             text: chunk.text,
//             sourceBlockIds: chunk.sourceBlockIds,
//             filePath: filePath,
//         }));

//         await this.table.add(data);
//     }

//     /**
//      * Deletes all vectors associated with a specific file before re-indexing.
//      */
//     public async delete(filePath: string): Promise<void> {
//         if (!this.table) throw new Error("Database not initialized.");
//         await this.table.delete(`filePath = '${filePath}'`);
//     }

//     /**
//      * Searches for the most similar chunks to a given query vector.
//      */
//     // public async search(queryVector: number[], limit: number = 5): Promise<any[]> {
//     //     if (!this.table) throw new Error("Database not initialized.");

//     //     const results = await this.table
//     //         .search(queryVector)
//     //         .limit(limit)
//     //         .execute();
            
//     //     return results;
//     // }
// }

// export default VectorDBManager;
