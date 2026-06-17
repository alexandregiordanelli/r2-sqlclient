mod commands;
mod iceberg_client;
mod r2sql_client;

use commands::AppState;
use std::sync::Arc;
use tokio::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .manage(AppState {
            r2sql_client: Arc::new(Mutex::new(None)),
            iceberg_client: Arc::new(Mutex::new(None)),
        })
        .invoke_handler(tauri::generate_handler![
            commands::connect,
            commands::list_namespaces,
            commands::list_tables,
            commands::get_table_schema,
            commands::execute_query
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
