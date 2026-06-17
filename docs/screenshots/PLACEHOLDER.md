# Screenshot Placeholders

## Add Your Screenshots Here

The user provided 2 screenshots that need to be saved:

### 1. main-interface.png
- **Description**: Main application interface
- **Shows**: Schema explorer (left), SQL editor (center), results grid with data
- **Features visible**: Sorting, filtering, pagination, column visibility
- **Size**: ~2800x1578px (resize to ~1920x1080 for README)

### 2. ai-assistant.png
- **Description**: AI Query Assistant modal
- **Shows**: Natural language prompt input, "Generate Query" button
- **Features visible**: AI-powered query generation
- **Size**: ~2774x1560px (resize to ~1920x1080 for README)

## How to Add

1. Save the screenshots with these exact names:
   - `main-interface.png`
   - `ai-assistant.png`

2. Optimize them (reduce file size):
   ```bash
   # Using ImageMagick
   convert main-interface.png -resize 1920x1080 -quality 85 main-interface.png
   convert ai-assistant.png -resize 1920x1080 -quality 85 ai-assistant.png
   ```

3. Commit and push:
   ```bash
   git add docs/screenshots/*.png
   git commit -m "docs: add application screenshots"
   git push
   ```

4. Verify they appear in the README on GitHub

## Alternative: Use GitHub Issues

If you can't add files locally:

1. Go to: https://github.com/alexandregiordanelli/r2-sqlclient/issues/new
2. Upload images by dragging them into the issue description
3. GitHub will generate URLs like: `https://github.com/user-attachments/assets/...`
4. Copy those URLs and update README.md

## Current Status

- [ ] main-interface.png - **MISSING** (placeholder only)
- [ ] ai-assistant.png - **MISSING** (placeholder only)

The README currently references these files, but they will show as broken images until you add them.
