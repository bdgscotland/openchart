#!/bin/bash

# OpenChart Development Startup Script
# This script handles all startup operations for the OpenChart service

set -e  # Exit on error

echo "🚀 Starting OpenChart Development Environment..."
echo "================================================"

# Check Node.js version
echo "✅ Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ required. Current version: $(node -v)"
    exit 1
fi
echo "   Node.js $(node -v) detected"

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies up to date"
fi

# Type checking
echo "🔍 Running TypeScript type checking..."
npx tsc --noEmit || {
    echo "⚠️  TypeScript errors detected (continuing anyway)"
}

# Lint checking
echo "🧹 Running linter..."
npm run lint || {
    echo "⚠️  Linting warnings detected (continuing anyway)"
}

# Clean any previous build artifacts
echo "🧹 Cleaning previous build artifacts..."
rm -rf dist

# Start development server
echo ""
echo "================================================"
echo "🎨 Starting OpenChart on http://localhost:5173"
echo "================================================"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start Vite dev server
npm run dev