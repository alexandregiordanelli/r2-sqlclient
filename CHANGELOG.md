# Changelog

All notable changes to R2 SQL Client will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-06-17

### 🎉 Initial Release

The first public release of R2 SQL Client with core functionality for querying Cloudflare R2 SQL.

### Added

#### Core Features
- **R2 SQL Integration** - Direct HTTP API connection to Cloudflare R2 SQL
- **Apache Iceberg Catalog** - Full schema exploration with namespaces and tables
- **SQL Query Editor** - Monaco Editor with syntax highlighting and shortcuts
- **Advanced Results Grid** - Professional data grid with multiple features:
  - Column sorting (single and multi-column with Shift+Click)
  - Global search across all columns
  - Per-column filtering
  - Column visibility toggle
  - Pagination (50/100/200/500 rows per page)
  - Cell content expansion modal
  - Copy to clipboard functionality

#### AI Features
- **AI Query Assistant** - OpenAI GPT-4 integration for natural language to SQL
- **Schema-Aware Generation** - AI loads actual table schemas for accurate queries
- **Smart Caching** - Schema cache for instant AI query generation

#### UX Features
- **Compact UI** - Ultra-compact interface (24px row height) for maximum data density
- **Resizable Editor** - Drag to resize query editor height
- **Collapsible Sidebar** - Toggle schema explorer visibility
- **Connection Persistence** - Saved credentials with auto-reconnect
- **Schema Caching** - Instant expand/collapse with cached schemas
- **Query Cancellation** - Stop long-running queries
- **LIMIT Warning** - Alert when queries lack LIMIT clause

#### Technical
- **Tauri 2.11** - Native desktop performance
- **React 18** - Modern UI with hooks
- **TypeScript** - Full type safety
- **Rust Backend** - Fast, secure HTTP client
- **TanStack Table** - Feature-rich data grid library
- **Zustand** - Lightweight state management

### Technical Details

**Frontend Stack:**
- React 18.3
- TypeScript 5.6
- TanStack Table 8.20
- Monaco Editor 4.6
- Zustand 4.5
- TailwindCSS 3.4
- Lucide React (icons)

**Backend Stack:**
- Tauri 2.11
- Rust 1.80
- reqwest 0.12 (HTTP client)
- tokio 1.0 (async runtime)
- serde 1.0 (JSON)

**APIs:**
- Cloudflare R2 SQL HTTP API
- Apache Iceberg REST Catalog API
- OpenAI API (optional, for AI features)

### Known Limitations

- No offline mode (requires active internet connection)
- Query timeout: 60 seconds (R2 SQL limitation)
- AI Assistant requires OpenAI API key
- Single query editor (no tabs yet)
- Results limited by browser memory (~1M rows recommended max)

### Security

- Credentials stored locally using localStorage
- No telemetry or analytics
- API keys never leave your machine
- Native desktop app (sandboxed by Tauri)

---

## [Unreleased]

### Planned Features

- [ ] Export results (CSV, JSON, Parquet)
- [ ] Query history and favorites
- [ ] Multiple editor tabs
- [ ] Column resizing (drag borders)
- [ ] Row selection with checkboxes
- [ ] SQL autocomplete and snippets
- [ ] Dark/Light theme toggle
- [ ] Connection profiles management
- [ ] Advanced filter operators (>, <, BETWEEN)
- [ ] Chart visualization
- [ ] Keyboard shortcuts customization

---

[1.0.0]: https://github.com/yourusername/r2-sqlclient/releases/tag/v1.0.0
