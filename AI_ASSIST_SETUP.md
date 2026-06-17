# AI Query Assistant Setup

## Quick Start

1. Get your OpenAI API key:
   - Go to https://platform.openai.com/api-keys
   - Create an account or sign in
   - Create a new API key

2. Create `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your API key:
   ```
   VITE_OPENAI_API_KEY=sk-proj-xxxxx
   ```

4. Restart the dev server:
   ```bash
   pnpm tauri dev
   ```

## Features

### 🤖 AI Query Generation
- Natural language to SQL conversion
- Context-aware: uses your actual schema
- R2 SQL syntax compliance
- Automatic LIMIT clause addition
- Performance optimizations

### 📊 Pagination
- 100 rows per page (default)
- Adjustable page size: 50, 100, 200, 500
- First/Previous/Next/Last navigation
- Shows current page and total pages

## Usage Examples

### AI Assist Prompts:

**Basic queries:**
```
"Show me all records from voices table"
→ SELECT * FROM default.voices LIMIT 100;
```

**Aggregations:**
```
"Count how many voices by type"
→ SELECT type, COUNT(*) as count FROM default.voices GROUP BY type;
```

**Filtering:**
```
"Show voices created in the last 30 days with more than 100 likes"
→ SELECT * FROM default.voices 
  WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '30 days' 
  AND like_count > 100 
  LIMIT 100;
```

**Top N queries:**
```
"Top 10 most liked voices"
→ SELECT * FROM default.voices 
  ORDER BY like_count DESC 
  LIMIT 10;
```

**Complex analytics:**
```
"Average audio duration by train mode"
→ SELECT train_mode, AVG(audio_duration_ms) as avg_duration 
  FROM default.voices 
  GROUP BY train_mode;
```

## Tips

1. **Be specific** - mention table names, columns, and conditions clearly
2. **Use natural language** - no need to know SQL syntax
3. **Schema awareness** - AI knows your available tables and namespaces
4. **Review before executing** - always check the generated query
5. **Iterate** - refine your prompt if the query isn't quite right

## Troubleshooting

**"API Error" message:**
- Check your API key is correct in `.env`
- Verify you have credits in your OpenAI account
- Check your internet connection

**Generated query fails:**
- Table might not exist - check Schema Explorer
- Column names might be wrong - expand table to see columns
- Try rephrasing your prompt with more context

**No pagination controls:**
- Pagination only appears when result has > 100 rows
- Try queries without LIMIT or with LIMIT > 100
