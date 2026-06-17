use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone)]
pub struct IcebergConfig {
    pub catalog_uri: String,  // https://catalog.cloudflarestorage.com/{account_id}/{bucket_name}
    pub warehouse: String,     // {account_id}_{bucket_name}
    pub api_token: String,
}

pub struct IcebergClient {
    client: Client,
    config: IcebergConfig,
    prefix: Option<String>,
}

#[derive(Deserialize)]
struct ConfigResponse {
    overrides: Overrides,
}

#[derive(Deserialize)]
struct Overrides {
    prefix: String,
}

#[derive(Deserialize)]
pub struct NamespaceList {
    pub namespaces: Vec<Vec<String>>,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct TableIdentifier {
    pub namespace: Vec<String>,
    pub name: String,
}

#[derive(Deserialize)]
pub struct TableList {
    pub identifiers: Vec<TableIdentifier>,
}

#[derive(Deserialize)]
pub struct TableMetadataResponse {
    pub metadata: TableMetadata,
}

#[derive(Deserialize)]
pub struct TableMetadata {
    pub schemas: Vec<Schema>,
    #[serde(rename = "current-schema-id")]
    pub current_schema_id: i32,
    pub location: String,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Schema {
    #[serde(rename = "schema-id")]
    pub schema_id: i32,
    #[serde(rename = "type")]
    pub schema_type: String,
    pub fields: Vec<Field>,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Field {
    pub id: i32,
    pub name: String,
    #[serde(rename = "type")]
    pub field_type: String,
    pub required: bool,
}

impl IcebergClient {
    pub fn new(config: IcebergConfig) -> Self {
        Self {
            client: Client::new(),
            config,
            prefix: None,
        }
    }

    async fn get_prefix(&mut self) -> Result<String, anyhow::Error> {
        if let Some(ref prefix) = self.prefix {
            return Ok(prefix.clone());
        }

        let url = format!("{}/v1/config?warehouse={}", self.config.catalog_uri, self.config.warehouse);

        let response = self.client
            .get(&url)
            .header("Authorization", format!("Bearer {}", self.config.api_token))
            .send()
            .await?;

        let status = response.status();
        let body_text = response.text().await?;

        if !status.is_success() {
            return Err(anyhow::anyhow!("API returned status {}: {}", status, body_text));
        }

        let config: ConfigResponse = serde_json::from_str(&body_text)
            .map_err(|e| anyhow::anyhow!("Failed to parse config response: {}. Body: {}", e, body_text))?;

        self.prefix = Some(config.overrides.prefix.clone());
        Ok(config.overrides.prefix)
    }

    pub async fn list_namespaces(&mut self) -> Result<Vec<String>, anyhow::Error> {
        let prefix = self.get_prefix().await?;
        let url = format!("{}/v1/{}/namespaces?warehouse={}",
            self.config.catalog_uri, prefix, self.config.warehouse);

        let response = self.client
            .get(&url)
            .header("Authorization", format!("Bearer {}", self.config.api_token))
            .send()
            .await?;

        let status = response.status();
        let body_text = response.text().await?;

        if !status.is_success() {
            return Err(anyhow::anyhow!("API returned status {}: {}", status, body_text));
        }

        let result: NamespaceList = serde_json::from_str(&body_text)
            .map_err(|e| anyhow::anyhow!("Failed to parse response: {}. Body: {}", e, body_text))?;

        Ok(result.namespaces.into_iter().map(|ns| ns.join(".")).collect())
    }

    pub async fn list_tables(&mut self, namespace: &str) -> Result<Vec<TableIdentifier>, anyhow::Error> {
        let prefix = self.get_prefix().await?;
        let url = format!("{}/v1/{}/namespaces/{}/tables?warehouse={}",
            self.config.catalog_uri, prefix, namespace, self.config.warehouse);

        let response = self.client
            .get(&url)
            .header("Authorization", format!("Bearer {}", self.config.api_token))
            .send()
            .await?;

        let status = response.status();
        let body_text = response.text().await?;

        if !status.is_success() {
            return Err(anyhow::anyhow!("API returned status {}: {}", status, body_text));
        }

        let result: TableList = serde_json::from_str(&body_text)
            .map_err(|e| anyhow::anyhow!("Failed to parse response: {}. Body: {}", e, body_text))?;

        Ok(result.identifiers)
    }

    pub async fn load_table(&mut self, namespace: &str, table: &str) -> Result<Schema, anyhow::Error> {
        let prefix = self.get_prefix().await?;
        let url = format!("{}/v1/{}/namespaces/{}/tables/{}?warehouse={}",
            self.config.catalog_uri, prefix, namespace, table, self.config.warehouse);

        let response = self.client
            .get(&url)
            .header("Authorization", format!("Bearer {}", self.config.api_token))
            .send()
            .await?;

        let status = response.status();
        let body_text = response.text().await?;

        if !status.is_success() {
            return Err(anyhow::anyhow!("API returned status {}: {}", status, body_text));
        }

        let result: TableMetadataResponse = serde_json::from_str(&body_text)
            .map_err(|e| anyhow::anyhow!("Failed to parse response: {}. Body: {}", e, body_text))?;

        // Find the current schema
        let current_schema = result.metadata.schemas
            .into_iter()
            .find(|s| s.schema_id == result.metadata.current_schema_id)
            .ok_or_else(|| anyhow::anyhow!("Current schema not found"))?;

        Ok(current_schema)
    }
}
