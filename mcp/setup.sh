#!/bin/bash

# PlantUML MCP Server Setup Script

echo "🚀 Setting up PlantUML MCP Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build the project"
    exit 1
fi

echo "✅ Project built successfully"

# Check if PlantUML server is running
echo "🔍 Checking PlantUML server..."
if curl -f -s "http://localhost:9090/api/plantuml/health" > /dev/null; then
    echo "✅ PlantUML server is running"
else
    echo "⚠️  PlantUML server is not running on localhost:9090"
    echo "   Please start the PlantUML server first:"
    echo "   cd .. && ./mvnw compile quarkus:dev"
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "To start the MCP server:"
echo "  npm start"
echo ""
echo "To run in development mode:"
echo "  npm run dev"
echo ""
echo "Environment variables:"
echo "  PLANTUML_SERVER_URL=http://localhost:9090 (default)"
