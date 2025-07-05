// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// We define functions here like (fn greet(..) { ... } )
// TODO: Define for File APIs

// We then invoke a handler so that it can be accessed
// and used elsewhere (.invoke_handler(tauri::generate_handler![greet]))
fn main() {
  tauri::Builder::default()
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
