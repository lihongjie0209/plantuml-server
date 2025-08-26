@echo off
REM Advanced Docker Hub push script with multiple tags

setlocal enabledelayedexpansion

echo ====================================
echo PlantUML Server Docker Hub Publisher
echo ====================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: Docker is not running or not installed!
    exit /b 1
)

REM Get Docker Hub username
set /p DOCKER_USERNAME="Enter your Docker Hub username: "
if "%DOCKER_USERNAME%"=="" (
    echo Username cannot be empty!
    exit /b 1
)

REM Set variables
set IMAGE_NAME=plantuml-server
set LOCAL_IMAGE=%IMAGE_NAME%:latest

REM Check if local image exists
docker image inspect %LOCAL_IMAGE% >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: Local image %LOCAL_IMAGE% not found!
    echo Please build the image first with: docker build -t %LOCAL_IMAGE% .
    exit /b 1
)

REM Get version from pom.xml
for /f "tokens=2 delims=<>" %%i in ('findstr "<version>" pom.xml ^| findstr -v "<?xml" ^| findstr -v "maven" ^| findstr -v "quarkus" ^| head -1') do set VERSION=%%i
if "%VERSION%"=="" set VERSION=1.0.0-SNAPSHOT

echo.
echo Local image: %LOCAL_IMAGE%
echo Docker Hub repository: %DOCKER_USERNAME%/%IMAGE_NAME%
echo Version: %VERSION%
echo.

REM Create tags
set TAGS=latest %VERSION%
for %%t in (%TAGS%) do (
    set FULL_NAME=%DOCKER_USERNAME%/%IMAGE_NAME%:%%t
    echo Tagging as !FULL_NAME!...
    docker tag %LOCAL_IMAGE% !FULL_NAME!
    
    if !ERRORLEVEL! neq 0 (
        echo Failed to tag image as !FULL_NAME!!
        exit /b 1
    )
)

echo.
echo ==============================
echo Ready to push the following images:
for %%t in (%TAGS%) do (
    echo - %DOCKER_USERNAME%/%IMAGE_NAME%:%%t
)
echo ==============================
echo.

set /p CONFIRM="Continue with push? (y/N): "
if /i not "%CONFIRM%"=="y" (
    echo Push cancelled.
    exit /b 0
)

echo.
echo Pushing images to Docker Hub...
echo.

for %%t in (%TAGS%) do (
    set FULL_NAME=%DOCKER_USERNAME%/%IMAGE_NAME%:%%t
    echo Pushing !FULL_NAME!...
    docker push !FULL_NAME!
    
    if !ERRORLEVEL! neq 0 (
        echo Failed to push !FULL_NAME!!
        exit /b 1
    )
    echo Successfully pushed !FULL_NAME!
    echo.
)

echo ==============================
echo All images pushed successfully!
echo ==============================
echo.
echo Your PlantUML Server is now available on Docker Hub:
for %%t in (%TAGS%) do (
    echo docker pull %DOCKER_USERNAME%/%IMAGE_NAME%:%%t
)
echo.
echo To run the container:
echo docker run -p 9090:9090 %DOCKER_USERNAME%/%IMAGE_NAME%:latest
