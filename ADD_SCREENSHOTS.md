# 📸 How to Add Screenshots

## Quick Guide

You provided 2 screenshots. Here's how to add them to the repository:

### Method 1: Local Files (Recommended)

1. **Save the screenshots** you provided to this directory:
   ```
   docs/screenshots/main-interface.png
   docs/screenshots/ai-assistant.png
   ```

2. **Commit and push**:
   ```bash
   cd /Users/alexandregiordanelli/Downloads/r2-sqlclient
   git add docs/screenshots/*.png
   git commit -m "docs: add application screenshots"
   git push
   ```

3. **Verify** - Go to README on GitHub and screenshots should appear

### Method 2: GitHub Upload (Alternative)

If you prefer to upload directly to GitHub:

1. Go to: https://github.com/alexandregiordanelli/r2-sqlclient
2. Navigate to `docs/screenshots/`
3. Click "Add file" → "Upload files"
4. Drag and drop both PNG files
5. Commit directly to master

### Method 3: Using GitHub Issues (Easiest)

This method works if you just want quick image hosting:

1. Go to: https://github.com/alexandregiordanelli/r2-sqlclient/issues/new
2. Title: "Add application screenshots"
3. In the description, **drag and drop** both screenshot images
4. GitHub will upload them and show markdown like:
   ```markdown
   ![image](https://github.com/user-attachments/assets/abc123/main.png)
   ```
5. **Copy those URLs**
6. Edit README.md and replace:
   ```markdown
   ![Main Interface](docs/screenshots/main-interface.png)
   ```
   with:
   ```markdown
   ![Main Interface](https://github.com/user-attachments/assets/YOUR-URL-HERE.png)
   ```

## Screenshots You Provided

### Screenshot 1: Main Interface
- **Shows**: Full application with schema explorer, SQL editor, and results grid
- **Query visible**: `SELECT * FROM default.voices WHERE task_count > 10 and like_count > 10`
- **Features shown**:
  - Schema tree on left (default namespace expanded)
  - Voices table columns visible
  - Query results with 13,065 rows
  - Pagination showing "Page 1 / 262"
  - Global search bar
  - Columns visibility toggle
  - Multiple column filters active
  - Per page: 50 rows
  - Stats: 472 files, 116.02 MB

### Screenshot 2: AI Assistant
- **Shows**: AI Query Assistant modal open
- **Prompt example**: "Show me the top 10 users by total transaction amount in the last 30 days"
- **Features shown**:
  - Natural language input textarea
  - "Generate Query" button with sparkle icon
  - Tip text at bottom
  - Modal overlay on top of results grid

## File Names

Make sure to use these EXACT file names:
- ✅ `main-interface.png`
- ✅ `ai-assistant.png`

❌ NOT: `Main-Interface.PNG`, `ai_assistant.jpg`, etc.

## Current Status

After you add the screenshots, the README will automatically display them!

The repository is already configured to show them at:
- https://github.com/alexandregiordanelli/r2-sqlclient#-screenshots
