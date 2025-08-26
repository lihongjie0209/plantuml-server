@echo off
REM PlantUML MCP Server Setup Script for Windows

echo 🚀 Setting up PlantUML MCP Server...

REM Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

echo ✅ Node.js detected

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

echo ✅ Dependencies installed

REM Build the project
echo 🔨 Building the project...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to build the project
    exit /b 1
)

echo ✅ Project built successfully

REM Check if PlantUML server is running
echo 🔍 Checking PlantUML server...
curl -f -s "http://localhost:9090/api/plantuml/health" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo ✅ PlantUML server is running
) else (
    echo ⚠️  PlantUML server is not running on localhost:9090
    echo    Please start the PlantUML server first:
    echo    cd .. ^&^& .\mvnw.cmd compile quarkus:dev
)

echo.
echo 🎉 Setup completed!
echo.
echo To start the MCP server:
echo   npm start
echo.
echo To run in development mode:
echo   npm run dev
echo.
echo Environment variables:
echo   PLANTUML_SERVER_URL=http://localhost:9090 (default)
