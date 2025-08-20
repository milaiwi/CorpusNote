// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

mod db;

pub struct DbConn(pub lancedb::connection::Connection);

// We then invoke a handler so that it can be accessed
// and used elsewhere (.invoke_handler(tauri::generate_handler![greet]))
fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let app_handle = app.handle();
      let app_data_path = app.path_resolver().app_data_dir().expect("Failed to get app data path");
      
      // Spawn the database initialization in the background
      tauri::async_runtime::spawn(async move {
        match db::init(app_data_path).await {
          Ok(conn) => {
            println!("Database initialized successfully");
            app_handle.manage(DbConn(conn));
          }
          Err(e) => {
            eprintln!("Failed to initialize database: {}", e);
          }
        }
      });
      
      Ok(())
    })
    .plugin(tauri_plugin_store::Builder::default().build())
    .invoke_handler(tauri::generate_handler![
      db::create_empty_table,
      db::table_exists,
      db::view_table,
      db::insert_chunks,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
