#!/bin/bash

# R2 SQL Client - Setup Script
# Automated setup for development environment

set -e

echo "🚀 R2 SQL Client - Development Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION installed"
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js 18+"
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check pnpm
echo "📦 Checking pnpm..."
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm -v)
    echo -e "${GREEN}✓${NC} pnpm $PNPM_VERSION installed"
else
    echo -e "${YELLOW}⚠${NC} pnpm not found. Installing..."
    npm install -g pnpm
    echo -e "${GREEN}✓${NC} pnpm installed"
fi

# Check Rust
echo "🦀 Checking Rust..."
if command -v cargo &> /dev/null; then
    RUST_VERSION=$(rustc --version | cut -d' ' -f2)
    echo -e "${GREEN}✓${NC} Rust $RUST_VERSION installed"
else
    echo -e "${RED}✗${NC} Rust not found. Please install Rust:"
    echo "   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

# Install Node dependencies
echo ""
echo "📥 Installing Node.js dependencies..."
pnpm install
echo -e "${GREEN}✓${NC} Dependencies installed"

# Check for .env file
echo ""
echo "🔑 Checking environment configuration..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
else
    echo -e "${YELLOW}⚠${NC} .env file not found"
    if [ -f ".env.example" ]; then
        read -p "   Create .env from .env.example? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cp .env.example .env
            echo -e "${GREEN}✓${NC} .env file created"
            echo -e "${YELLOW}⚠${NC} Please edit .env and add your API keys"
        fi
    fi
fi

# Build Rust backend
echo ""
echo "🔨 Building Rust backend..."
cd src-tauri
cargo build
cd ..
echo -e "${GREEN}✓${NC} Backend built successfully"

# Summary
echo ""
echo "✅ Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. (Optional) Edit .env and add your OpenAI API key for AI features"
echo "2. Run the app: ${GREEN}pnpm tauri dev${NC}"
echo "3. Start coding! 🎉"
echo ""
echo "Useful commands:"
echo "  ${GREEN}pnpm tauri dev${NC}    - Run in development mode"
echo "  ${GREEN}pnpm tauri build${NC}  - Build for production"
echo "  ${GREEN}pnpm lint${NC}         - Run linter"
echo "  ${GREEN}pnpm test${NC}         - Run tests"
echo ""
echo "Documentation:"
echo "  README.md          - Project overview"
echo "  GETTING_STARTED.md - Detailed setup guide"
echo "  CONTRIBUTING.md    - Contribution guidelines"
echo ""
