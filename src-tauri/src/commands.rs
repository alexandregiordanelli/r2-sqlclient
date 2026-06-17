use crate::iceberg_client::{IcebergClient, IcebergConfig, Schema, TableIdentifier};
use crate::r2sql_client::{QueryResponse, R2SqlClient, R2SqlConfig};
use std::sync::Arc;
use tauri::State;
use tokio::sync::Mutex;

pub struct AppState {
    pub r2sql_client: Arc<Mutex<Option<R2SqlClient>>>,
    pub iceberg_client: Arc<Mutex<Option<IcebergClient>>>,
}

#[tauri::command]
pub async fn connect(
    catalog_uri: String,
    api_token: String,
    state: State<'_, AppState>,
) -> Result<String, String> {
    // Extract account_id and bucket_name from catalog URI
    // Format: https://catalog.cloudflarestorage.com/{account_id}/{bucket_name}
    let uri_parts: Vec<&str> = catalog_uri.trim_end_matches('/').split('/').collect();

    if uri_parts.len() < 5 {
        return Err("Invalid Catalog URI format. Expected: https://catalog.cloudflarestorage.com/{account_id}/{bucket_name}".to_string());
    }

    let account_id = uri_parts[uri_parts.len() - 2].to_string();
    let bucket_name = uri_parts[uri_parts.len() - 1].to_string();
    let warehouse = format!("{account_id}_{bucket_name}");

    // Initialize R2 SQL client
    let r2sql_config = R2SqlConfig {
        account_id: account_id.clone(),
        bucket_name: bucket_name.clone(),
        api_token: api_token.clone(),
    };
    let r2sql_client = R2SqlClient::new(r2sql_config);

    // Initialize Iceberg catalog client
    let iceberg_config = IcebergConfig {
        catalog_uri: catalog_uri.clone(),
        warehouse,
        api_token: api_token.clone(),
    };
    let mut iceberg_client = IcebergClient::new(iceberg_config);

    // Test connection by listing namespaces
    iceberg_client
        .list_namespaces()
        .await
        .map_err(|e| format!("Connection failed: {e}"))?;

    // Store clients in state
    *state.r2sql_client.lock().await = Some(r2sql_client);
    *state.iceberg_client.lock().await = Some(iceberg_client);

    Ok("Connected successfully".to_string())
}

#[tauri::command]
pub async fn list_namespaces(state: State<'_, AppState>) -> Result<Vec<String>, String> {
    let mut guard = state.iceberg_client.lock().await;
    let client = guard.as_mut().ok_or("Not connected")?;

    client
        .list_namespaces()
        .await
        .map_err(|e| format!("Failed to list namespaces: {e}"))
}

#[tauri::command]
pub async fn list_tables(
    namespace: String,
    state: State<'_, AppState>,
) -> Result<Vec<TableIdentifier>, String> {
    let mut guard = state.iceberg_client.lock().await;
    let client = guard.as_mut().ok_or("Not connected")?;

    client
        .list_tables(&namespace)
        .await
        .map_err(|e| format!("Failed to list tables: {e}"))
}

#[tauri::command]
pub async fn get_table_schema(
    namespace: String,
    table: String,
    state: State<'_, AppState>,
) -> Result<Schema, String> {
    let mut guard = state.iceberg_client.lock().await;
    let client = guard.as_mut().ok_or("Not connected")?;

    let schema = client
        .load_table(&namespace, &table)
        .await
        .map_err(|e| format!("Failed to load table: {e}"))?;

    Ok(schema)
}

#[tauri::command]
pub async fn execute_query(
    sql: String,
    state: State<'_, AppState>,
) -> Result<QueryResponse, String> {
    let guard = state.r2sql_client.lock().await;
    let client = guard.as_ref().ok_or("Not connected")?;

    client
        .execute_query(&sql)
        .await
        .map_err(|e| format!("Query failed: {e}"))
}
