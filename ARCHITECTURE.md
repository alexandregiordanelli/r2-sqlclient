# Architecture Documentation

## 🏗️ Overview

R2 SQL Client is built as a desktop application using **Tauri**, which combines a **Rust backend** with a **React frontend**. This architecture provides native performance, security, and cross-platform compatibility.

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Desktop Application                   │
│                      (Tauri Window)                      │
├──────────────────────┬──────────────────────────────────┤
│   React Frontend     │       Rust Backend               │
│   (WebView)          │       (Native)                   │
├──────────────────────┼──────────────────────────────────┤
│                      │                                   │
│  ┌────────────────┐ │  ┌─────────────────────────────┐ │
│  │ UI Components  │ │  │  Tauri Commands             │ │
│  │ - Schema Tree  │ │  │  - connect()                │ │
│  │ - SQL Editor   │ │  │  - list_namespaces()        │ │
│  │ - Results Grid │ │  │  - execute_query()          │ │
│  │ - AI Assistant │ │  │  ...                        │ │
│  └────────────────┘ │  └─────────────────────────────┘ │
│                      │                                   │
│  ┌────────────────┐ │  ┌─────────────────────────────┐ │
│  │ State Stores   │ │  │  HTTP Clients               │ │
│  │ (Zustand)      │ │  │  - R2SqlClient              │ │
│  │ - connection   │ │  │  - IcebergClient            │ │
│  │ - schema       │ │  │  (reqwest)                  │ │
│  │ - query        │ │  └─────────────────────────────┘ │
│  └────────────────┘ │           │                       │
│         │            │           │                       │
│         └────────────┼───────────┘                       │
│           IPC        │                                   │
└──────────────────────┴───────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
    ┌─────▼─────┐ ┌───▼────┐ ┌────▼─────┐
    │ R2 SQL    │ │Iceberg │ │ OpenAI   │
    │ API       │ │Catalog │ │ API      │
    └───────────┘ └────────┘ └──────────┘
```

## 🎨 Frontend Architecture

### Component Hierarchy

```
App.tsx
├── ConnectionDialog
├── ErrorBoundary
│   ├── SchemaExplorer
│   │   └── (tree of namespaces/tables)
│   ├── QueryEditor
│   │   ├── Monaco Editor
│   │   └── AIQueryAssist
│   └── ResultsGrid
│       ├── TanStack Table
│       └── CellModal
```

### State Management (Zustand)

**connectionStore.ts**
```typescript
{
  config: ConnectionConfig | null,
  isConnected: boolean,
  error: string | null,
  connect(config),
  disconnect()
}
```

**schemaStore.ts**
```typescript
{
  namespaces: string[],
  tables: TableIdentifier[],
  tableSchema: Schema | null,
  loadNamespaces(),
  loadTables(namespace),
  loadTableSchema(namespace, table)
}
```

**queryStore.ts**
```typescript
{
  sql: string,
  result: QueryResponse | null,
  loading: boolean,
  error: string | null,
  setSql(sql),
  executeQuery(),
  cancelQuery()
}
```

### Data Flow

```
User Action → Component → Store Action → Tauri Command → Rust Backend
                ↑                                              ↓
                └──────────── Store Update ←──────────── API Response
```

## 🦀 Backend Architecture

### Module Structure

```
src-tauri/src/
├── main.rs              # Entry point, Tauri builder
├── commands.rs          # Tauri command handlers
├── r2sql_client.rs      # R2 SQL HTTP client
└── iceberg_client.rs    # Iceberg catalog HTTP client
```

### Key Components

#### 1. Tauri Commands (`commands.rs`)

Exposes async functions to the frontend:

```rust
#[tauri::command]
async fn connect(...) -> Result<String, String>

#[tauri::command]
async fn execute_query(sql: String) -> Result<QueryResponse, String>
```

#### 2. R2 SQL Client (`r2sql_client.rs`)

HTTP client for Cloudflare R2 SQL API:

```rust
pub struct R2SqlClient {
    client: Client,  // reqwest
    config: R2SqlConfig,
}

impl R2SqlClient {
    pub async fn execute_query(&self, sql: &str) -> Result<QueryResponse>
}
```

**Endpoint:**
```
POST https://api.sql.cloudflarestorage.com/api/v1/accounts/{ID}/r2-sql/query/{BUCKET}
```

#### 3. Iceberg Client (`iceberg_client.rs`)

HTTP client for Apache Iceberg REST Catalog:

```rust
pub struct IcebergClient {
    client: Client,
    config: IcebergConfig,
    prefix: Option<String>,  // Cached from /v1/config
}

impl IcebergClient {
    pub async fn list_namespaces(&mut self) -> Result<Vec<String>>
    pub async fn list_tables(&mut self, namespace: &str) -> Result<Vec<TableIdentifier>>
    pub async fn load_table(&mut self, namespace: &str, table: &str) -> Result<Schema>
}
```

**Endpoints:**
```
GET /v1/config?warehouse={warehouse}
GET /v1/{prefix}/namespaces?warehouse={warehouse}
GET /v1/{prefix}/namespaces/{ns}/tables?warehouse={warehouse}
GET /v1/{prefix}/namespaces/{ns}/tables/{table}?warehouse={warehouse}
```

## 🔄 Data Flow Examples

### 1. Connection Flow

```
User clicks "Connect"
  ↓
ConnectionDialog submits credentials
  ↓
connectionStore.connect(config)
  ↓
Tauri: invoke('connect', { catalogUri, apiToken })
  ↓
Rust: connect() command
  ↓
  ├─→ Create R2SqlClient
  ├─→ Create IcebergClient
  └─→ Test connection (list_namespaces)
       ↓
       HTTP GET /v1/config?warehouse=...
       ↓
       HTTP GET /v1/{prefix}/namespaces?warehouse=...
       ↓
       ← Returns namespaces
  ↓
Store clients in AppState (Mutex)
  ↓
← Returns "Connected successfully"
  ↓
Frontend updates UI (green dot, load namespaces)
```

### 2. Query Execution Flow

```
User types SQL and clicks Execute
  ↓
queryStore.executeQuery()
  ↓
Tauri: invoke('execute_query', { sql })
  ↓
Rust: execute_query(sql) command
  ↓
Get R2SqlClient from AppState
  ↓
HTTP POST /api/v1/accounts/{id}/r2-sql/query/{bucket}
  Body: {"query": "SELECT ..."}
  ↓
← R2 SQL API response: { result: { rows, schema, metrics } }
  ↓
Deserialize to QueryResponse
  ↓
← Return to frontend
  ↓
queryStore updates with result
  ↓
ResultsGrid re-renders with TanStack Table
```

### 3. AI Query Generation Flow

```
User clicks "AI Assist" and enters prompt
  ↓
AIQueryAssist component
  ↓
Load schemas for all tables
  ↓
For each table:
  invoke('get_table_schema', { namespace, table })
  ↓
  Cache in Map<string, Schema>
  ↓
Build schema context string
  ↓
HTTP POST https://api.openai.com/v1/chat/completions
  Headers: Authorization: Bearer {OPENAI_KEY}
  Body: {
    model: "gpt-4o",
    messages: [
      { role: "system", content: "{R2_SQL_DOCS + SCHEMA_CONTEXT}" },
      { role: "user", content: "{USER_PROMPT}" }
    ]
  }
  ↓
← OpenAI response with generated SQL
  ↓
Display SQL in modal
  ↓
User clicks "Use This Query"
  ↓
Insert into Monaco Editor
```

## 🔐 Security Model

### 1. Tauri Security

- **IPC Validation**: All commands validated by Tauri
- **CSP (Content Security Policy)**: Restricts resource loading
- **Sandboxing**: Limited syscall access
- **No `eval()`**: React + TypeScript, no dynamic code execution

### 2. Credential Storage

- **localStorage** (browser): Stores connection config
- **Future**: Consider Tauri's secure storage plugin

### 3. API Communication

- **HTTPS Only**: All API calls use TLS
- **Certificate Validation**: Enforced by reqwest
- **Token-based Auth**: API tokens, not passwords

## ⚡ Performance Optimizations

### 1. Frontend

- **Schema Caching**: Loaded schemas cached in Map
- **Virtualization**: TanStack Table virtual scrolling (disabled for simplicity)
- **Pagination**: 100 rows per page default
- **Debouncing**: Search/filter inputs debounced
- **Memo**: useMemo for expensive computations

### 2. Backend

- **Connection Pooling**: reqwest reuses HTTP connections
- **Async I/O**: Tokio async runtime
- **Prefix Caching**: Iceberg prefix cached per connection
- **Streaming**: Query results streamed (future enhancement)

### 3. Rendering

- **Fixed Row Heights**: 24px for efficient rendering
- **Truncate**: CSS truncate instead of JS substring
- **Sticky Headers**: CSS sticky for smooth scrolling

## 📊 Data Models

### Frontend Types (TypeScript)

```typescript
interface ConnectionConfig {
  catalogUri: string;
  apiToken: string;
}

interface QueryResponse {
  result: {
    rows: any[];
    schema: SchemaField[];
    metrics?: QueryMetrics;
  };
  success: boolean;
}

interface SchemaField {
  name: string;
  type: string;
}

interface TableIdentifier {
  namespace: string[];
  name: string;
}
```

### Backend Types (Rust)

```rust
#[derive(Deserialize, Serialize)]
pub struct QueryResponse {
    pub result: Option<QueryResult>,
    pub success: bool,
}

#[derive(Deserialize, Serialize)]
pub struct QueryResult {
    pub rows: Vec<serde_json::Value>,
    pub schema: Vec<SchemaField>,
    pub metrics: Option<QueryMetrics>,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Schema {
    pub schema_id: i32,
    pub fields: Vec<Field>,
}
```

## 🧩 Extension Points

### Adding New Features

1. **New Tauri Command**:
   - Add function to `commands.rs`
   - Register in `main.rs`
   - Call from frontend with `invoke()`

2. **New UI Component**:
   - Create in `src/components/`
   - Add to component tree
   - Connect to store if needed

3. **New API Endpoint**:
   - Add method to client (`r2sql_client.rs` or `iceberg_client.rs`)
   - Add Tauri command wrapper
   - Expose to frontend

## 📚 Dependencies

### Key Libraries

**Frontend:**
- `@tanstack/react-table` - Data grid
- `monaco-editor` - Code editor
- `zustand` - State management
- `lucide-react` - Icons

**Backend:**
- `tauri` - Desktop framework
- `reqwest` - HTTP client
- `tokio` - Async runtime
- `serde` - JSON serialization

## 🎯 Future Architecture Plans

- [ ] **Plugin System**: Support custom data sources
- [ ] **Workers**: Offload heavy computation to Web Workers
- [ ] **Streaming**: Stream large query results
- [ ] **SQLite Cache**: Local query result cache
- [ ] **Multi-Window**: Multiple query editors in separate windows
- [ ] **Extension API**: Allow community extensions

---

For implementation details, see source code in `src/` and `src-tauri/src/`.
