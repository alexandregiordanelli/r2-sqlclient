#!/bin/bash

# GitHub Repository Setup Script
# Configures labels, topics, and settings

set -e

REPO="alexandregiordanelli/r2-sqlclient"

echo "🔧 Configuring GitHub repository: $REPO"
echo "========================================="
echo ""

# Add topics
echo "📌 Adding repository topics..."
gh repo edit $REPO --add-topic tauri
gh repo edit $REPO --add-topic rust
gh repo edit $REPO --add-topic react
gh repo edit $REPO --add-topic typescript
gh repo edit $REPO --add-topic sql
gh repo edit $REPO --add-topic cloudflare
gh repo edit $REPO --add-topic r2
gh repo edit $REPO --add-topic iceberg
gh repo edit $REPO --add-topic desktop-app
gh repo edit $REPO --add-topic sql-client
gh repo edit $REPO --add-topic ai
gh repo edit $REPO --add-topic gpt4
echo "✓ Topics added"

# Create labels
echo ""
echo "🏷️  Creating labels..."

# Priority labels
gh label create "priority: critical" --color "d73a4a" --description "Critical priority" --repo $REPO 2>/dev/null || echo "  Label already exists: priority: critical"
gh label create "priority: high" --color "ff6600" --description "High priority" --repo $REPO 2>/dev/null || echo "  Label already exists: priority: high"
gh label create "priority: medium" --color "fbca04" --description "Medium priority" --repo $REPO 2>/dev/null || echo "  Label already exists: priority: medium"
gh label create "priority: low" --color "0e8a16" --description "Low priority" --repo $REPO 2>/dev/null || echo "  Label already exists: priority: low"

# Type labels
gh label create "good first issue" --color "7057ff" --description "Good for newcomers" --repo $REPO 2>/dev/null || echo "  Label already exists: good first issue"
gh label create "help wanted" --color "008672" --description "Extra attention is needed" --repo $REPO 2>/dev/null || echo "  Label already exists: help wanted"

# Status labels
gh label create "in progress" --color "fbca04" --description "Currently being worked on" --repo $REPO 2>/dev/null || echo "  Label already exists: in progress"

echo "✓ Labels created"

# Enable features
echo ""
echo "⚙️  Enabling repository features..."
gh repo edit $REPO --enable-issues
gh repo edit $REPO --enable-wiki
echo "✓ Features enabled"

echo ""
echo "✅ Repository configuration complete!"
echo ""
echo "Next steps:"
echo "1. Go to https://github.com/$REPO/settings/security_analysis"
echo "2. Enable Dependabot alerts and security updates"
echo "3. Add screenshots to docs/screenshots/"
echo "4. Create first release: git tag -a v1.0.0 -m 'v1.0.0' && git push origin v1.0.0"
echo ""
