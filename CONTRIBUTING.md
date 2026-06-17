# Contributing to R2 SQL Client

Thank you for your interest in contributing! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title** describing the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details**:
  - OS and version
  - Tauri version
  - Node.js version
  - Rust version

### Suggesting Features

Feature requests are welcome! Please provide:

- **Clear description** of the feature
- **Use case** - why is this feature needed?
- **Proposed implementation** (if you have ideas)
- **Examples** from other tools (if applicable)

### Pull Requests

1. **Fork** the repository
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/amazing-feature
   # or
   git checkout -b fix/bug-description
   ```

3. **Make your changes**:
   - Follow the code style (see below)
   - Write clear commit messages
   - Add tests if applicable
   - Update documentation

4. **Test thoroughly**:
   ```bash
   # Frontend
   pnpm lint
   pnpm build
   
   # Backend
   cd src-tauri && cargo test
   cd src-tauri && cargo clippy
   
   # Full app
   pnpm tauri dev
   pnpm tauri build
   ```

5. **Commit** with descriptive messages:
   ```bash
   git commit -m "feat: add column resizing to results grid"
   git commit -m "fix: resolve schema caching issue"
   git commit -m "docs: update installation instructions"
   ```

6. **Push** to your fork:
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request** with:
   - Clear title and description
   - Reference to related issues
   - Screenshots/GIFs for UI changes
   - Checklist of changes

## 📝 Code Style

### TypeScript/React

- Use **functional components** with hooks
- Use **TypeScript** strict mode
- Follow **React best practices**:
  - Keep components small and focused
  - Use custom hooks for logic reuse
  - Avoid prop drilling (use Zustand stores)
- **Naming conventions**:
  - Components: PascalCase (`ResultsGrid.tsx`)
  - Hooks: camelCase with `use` prefix (`useQueryStore`)
  - Files: match component name
- **Formatting**: Prettier (auto-format on save)

### Rust

- Follow **Rust conventions** (rustfmt)
- Use **meaningful names** for functions and variables
- **Document public APIs** with doc comments
- **Handle errors** properly (use `Result<T, E>`)
- **Async/await** with Tokio for I/O
- Run `cargo clippy` before committing

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding tests
- `chore:` - Build/tooling changes

Examples:
```
feat: add CSV export functionality
fix: resolve pagination bug with large datasets
docs: update API token creation guide
refactor: extract table filtering logic to hook
```

## 🏗️ Project Structure

### Frontend (`src/`)

```
src/
├── components/          # React components
│   ├── *.tsx           # One component per file
│   └── tests/          # Component tests
├── stores/             # Zustand state stores
│   └── *.ts            # One store per domain
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── App.tsx             # Main application
```

### Backend (`src-tauri/`)

```
src-tauri/
├── src/
│   ├── *_client.rs     # API clients
│   ├── commands.rs     # Tauri commands
│   ├── lib.rs          # Library entry
│   └── main.rs         # Binary entry
├── tests/              # Integration tests
└── Cargo.toml          # Dependencies
```

## 🧪 Testing

### Frontend Tests

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

### Backend Tests

```bash
cd src-tauri

# Unit tests
cargo test

# Integration tests
cargo test --test '*'

# With output
cargo test -- --nocapture
```

## 🐛 Debugging

### Frontend

- **React DevTools**: Browser extension
- **Console logs**: `console.log()` in TypeScript
- **Zustand DevTools**: Enable in stores

### Backend

- **println!** or **dbg!** macros for quick debugging
- **env_logger** for structured logging:
  ```bash
  RUST_LOG=debug pnpm tauri dev
  ```
- **Rust Analyzer** in VSCode for inline errors

### Tauri

- **DevTools**: Open with `Ctrl+Shift+I` (or `Cmd+Option+I` on Mac)
- **IPC logs**: Check console for frontend ↔ backend communication
- **Build logs**: `pnpm tauri build --debug`

## 📚 Resources

### Documentation

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [React Documentation](https://react.dev/)
- [TanStack Table](https://tanstack.com/table/latest)
- [Cloudflare R2 SQL API](https://developers.cloudflare.com/r2-sql/)
- [Apache Iceberg REST API](https://iceberg.apache.org/docs/latest/rest-catalog/)

### Learning

- [Rust Book](https://doc.rust-lang.org/book/)
- [Async Rust](https://rust-lang.github.io/async-book/)
- [React Hooks](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🎯 Good First Issues

Looking for something to work on? Check issues labeled:

- `good first issue` - Easy tasks for newcomers
- `help wanted` - Need community help
- `documentation` - Improve docs
- `bug` - Fix existing bugs

## 💬 Communication

- **GitHub Issues** - Bug reports and features
- **GitHub Discussions** - Questions and ideas
- **Pull Requests** - Code reviews

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be added to:
- `CONTRIBUTORS.md` file
- GitHub contributors list
- Release notes (for significant contributions)

Thank you for making R2 SQL Client better! 🎉
