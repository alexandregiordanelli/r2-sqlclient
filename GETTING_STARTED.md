# Getting Started with R2 SQL Client

Welcome! This guide will help you get up and running with R2 SQL Client in minutes.

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js** 18 or higher ([Download](https://nodejs.org/))
- ✅ **pnpm** package manager ([Install](https://pnpm.io/installation))
- ✅ **Rust** 1.70 or higher ([Install](https://rustup.rs/))
- ✅ **Cloudflare Account** with R2 enabled
- ✅ **R2 Bucket** with Data Catalog enabled

## 🚀 Quick Start (5 minutes)

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/r2-sqlclient.git
cd r2-sqlclient

# Install dependencies
pnpm install
```

### 2. (Optional) Configure AI Assistant

If you want to use the AI Query Assistant:

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your OpenAI API key
# VITE_OPENAI_API_KEY=sk-proj-xxxxx
```

**Get OpenAI API Key:**
1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create new key
3. Copy and paste into `.env`

### 3. Run the Application

```bash
# Development mode (hot reload)
pnpm tauri dev

# Or build for production
pnpm tauri build
```

## 🔑 Setting Up Cloudflare R2 SQL

### Step 1: Enable R2 Data Catalog

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Enable catalog on your bucket
wrangler r2 bucket catalog enable YOUR_BUCKET_NAME

# Verify it's enabled
wrangler r2 bucket catalog get YOUR_BUCKET_NAME
```

### Step 2: Create API Token

1. Go to [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **"Create Token"**
3. Select **"Custom Token"**
4. Add permissions:
   - **Workers R2 SQL**: Read
   - **Workers R2 Data Catalog**: Write
   - **Workers R2 Storage**: Edit (or Admin Read & Write)
5. Select your **Account** in Account Resources
6. Click **"Continue to summary"**
7. Click **"Create Token"**
8. **Copy the token** (shown only once!)

### Step 3: Get Your Connection Details

You need:
- **Account ID**: Found in Cloudflare dashboard URL
- **Bucket Name**: Your R2 bucket name
- **Catalog URI**: Format: `https://catalog.cloudflarestorage.com/{account_id}/{bucket_name}`
- **API Token**: From step 2

Example:
```
Account ID: f1d76e65fba40d8dbafd64bc9059a99c
Bucket Name: my-data
Catalog URI: https://catalog.cloudflarestorage.com/f1d76e65fba40d8dbafd64bc9059a99c/my-data
```

## 💾 Creating Your First Table

If you don't have tables yet, create one:

```bash
# Install PyIceberg
pip install pyiceberg

# Python script to create a table
python3 << EOF
from pyiceberg.catalog import load_catalog

# Configure catalog
catalog = load_catalog("r2", **{
    "uri": "https://catalog.cloudflarestorage.com/YOUR_ACCOUNT_ID/YOUR_BUCKET",
    "credential": "YOUR_API_TOKEN",
    "warehouse": "YOUR_ACCOUNT_ID_YOUR_BUCKET"
})

# Create namespace
catalog.create_namespace("default")

# Create table (example)
from pyiceberg.schema import Schema
from pyiceberg.types import StringType, LongType, NestedField

schema = Schema(
    NestedField(1, "id", StringType(), required=True),
    NestedField(2, "name", StringType(), required=True),
    NestedField(3, "created_at", LongType(), required=True)
)

catalog.create_table("default.users", schema=schema)
print("Table created!")
EOF
```

## 🎯 First Query

1. **Launch the app**: `pnpm tauri dev`
2. **Click "Connect"** in the top-right
3. **Enter your credentials**:
   - Catalog URI: `https://catalog.cloudflarestorage.com/{account_id}/{bucket_name}`
   - API Token: `your-token`
4. **Click "Connect"**
5. **Browse schema**: Expand namespaces and tables
6. **Write a query**:
   ```sql
   SELECT * FROM default.users LIMIT 10;
   ```
7. **Execute**: Press `Ctrl+Enter` or click "Execute"

## 🤖 Using AI Assistant

1. Click **"AI Assist"** button
2. Type in natural language:
   ```
   Show me the 10 most recent users
   ```
3. Review the generated SQL
4. Click **"Use This Query"**
5. Execute!

## 📚 Common Tasks

### Query All Tables

```sql
-- List tables in a namespace
SHOW TABLES IN default;

-- Query specific table
SELECT * FROM default.users LIMIT 100;

-- Join tables
SELECT u.name, o.total
FROM default.users u
JOIN default.orders o ON u.id = o.user_id
LIMIT 50;

-- Aggregations
SELECT 
  DATE_TRUNC('day', created_at) as day,
  COUNT(*) as user_count
FROM default.users
GROUP BY day
ORDER BY day DESC;
```

### Filter Results

Use the **global search** bar or **per-column filters**:

1. **Global Search**: Type in top search bar to filter all columns
2. **Column Filter**: Type in input below each column header
3. **Combine**: Use both together for precise filtering

### Sort Data

- **Single column**: Click column header
- **Multiple columns**: Shift+Click additional columns
- **Remove sort**: Click again to cycle through asc → desc → none

### Hide Columns

1. Click **"Columns"** button in toolbar
2. Uncheck columns you don't need
3. Grid updates instantly

## 🔧 Troubleshooting

### Connection Fails

**Error**: "Connection failed: 404 Not Found"

**Solution**:
- Verify Data Catalog is enabled: `wrangler r2 bucket catalog get BUCKET`
- Check Catalog URI format
- Ensure API token has correct permissions

### No Tables Showing

**Cause**: Bucket has no Iceberg tables

**Solution**:
- Create tables using PyIceberg, Spark, or other tools
- Verify tables exist: `wrangler r2 bucket catalog list-tables BUCKET`

### Query Timeout

**Error**: "Query timeout after 60s"

**Solution**:
- Add `LIMIT` clause to reduce data scanned
- Use `WHERE` filters to narrow results
- Break into smaller queries

### AI Assistant Not Working

**Error**: "API Error: 401"

**Solution**:
- Check `.env` file exists
- Verify `VITE_OPENAI_API_KEY` is set correctly
- Restart dev server: `pnpm tauri dev`

## 📖 Next Steps

- Read the [README](README.md) for full feature list
- Check [ARCHITECTURE](ARCHITECTURE.md) for technical details
- See [CONTRIBUTING](CONTRIBUTING.md) to contribute
- Browse [GitHub Issues](https://github.com/yourusername/r2-sqlclient/issues) for known issues

## 💬 Get Help

- 📖 [Documentation](https://github.com/yourusername/r2-sqlclient/wiki)
- 💬 [Discussions](https://github.com/yourusername/r2-sqlclient/discussions)
- 🐛 [Report Bug](https://github.com/yourusername/r2-sqlclient/issues/new?template=bug_report.md)
- ✨ [Request Feature](https://github.com/yourusername/r2-sqlclient/issues/new?template=feature_request.md)

---

**Happy Querying!** 🚀
