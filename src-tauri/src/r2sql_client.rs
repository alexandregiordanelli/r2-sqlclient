use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone)]
pub struct R2SqlConfig {
    pub account_id: String,
    pub bucket_name: String,
    pub api_token: String,
}

pub struct R2SqlClient {
    client: Client,
    config: R2SqlConfig,
}

#[derive(Serialize)]
struct QueryRequest {
    query: String,
}

#[derive(Deserialize, Serialize)]
pub struct QueryResponse {
    pub result: Option<QueryResult>,
    pub success: bool,
    pub errors: Vec<serde_json::Value>,
    pub messages: Vec<serde_json::Value>,
}

#[derive(Deserialize, Serialize)]
pub struct QueryResult {
    pub rows: Vec<serde_json::Value>,
    pub schema: Vec<SchemaField>,
    pub metrics: Option<QueryMetrics>,
}

#[derive(Deserialize, Serialize)]
pub struct SchemaField {
    pub name: String,
}

#[derive(Deserialize, Serialize)]
pub struct QueryMetrics {
    pub files_scanned: Option<u64>,
    pub bytes_scanned: Option<u64>,
}

impl R2SqlClient {
    pub fn new(config: R2SqlConfig) -> Self {
        Self {
            client: Client::new(),
            config,
        }
    }

    pub async fn execute_query(&self, sql: &str) -> Result<QueryResponse, anyhow::Error> {
        use std::time::Duration;

        let url = format!(
            "https://api.sql.cloudflarestorage.com/api/v1/accounts/{}/r2-sql/query/{}",
            self.config.account_id,
            self.config.bucket_name
        );

        // Set a 60 second timeout for queries
        let response = tokio::time::timeout(
            Duration::from_secs(60),
            self.client
                .post(&url)
                .header("Authorization", format!("Bearer {}", self.config.api_token))
                .header("Content-Type", "application/json")
                .timeout(Duration::from_secs(60))
                .json(&QueryRequest {
                    query: sql.to_string(),
                })
                .send()
        )
        .await
        .map_err(|_| anyhow::anyhow!("Query timeout after 60 seconds. Try adding a LIMIT clause to your query."))??;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            return Err(anyhow::anyhow!("Query failed: {error_text}"));
        }

        let result: QueryResponse = response.json().await?;
        Ok(result)
    }
}
