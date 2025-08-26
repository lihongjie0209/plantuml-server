@echo off
REM Build and run PlantUML Server with Docker

echo Building PlantUML Server Docker image...
docker build -t plantuml-server:latest .

if %ERRORLEVEL% neq 0 (
    echo Build failed!
    exit /b 1
)

echo Build successful!
echo.
echo To run the container:
echo docker run -p 9090:9090 plantuml-server:latest
echo.
echo Or use Docker Compose:
echo docker-compose up -d
echo.
echo Access the application at: http://localhost:9090
