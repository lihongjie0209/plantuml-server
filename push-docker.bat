@echo off
REM Push PlantUML Server to Docker Hub

echo Please make sure you are logged in to Docker Hub first:
echo docker login
echo.

set /p DOCKER_USERNAME="Enter your Docker Hub username: "
if "%DOCKER_USERNAME%"=="" (
    echo Username cannot be empty!
    exit /b 1
)

set IMAGE_NAME=plantuml-server
set TAG=latest
set FULL_IMAGE_NAME=%DOCKER_USERNAME%/%IMAGE_NAME%:%TAG%

echo.
echo Tagging image as %FULL_IMAGE_NAME%...
docker tag %IMAGE_NAME%:%TAG% %FULL_IMAGE_NAME%

if %ERRORLEVEL% neq 0 (
    echo Failed to tag image!
    exit /b 1
)

echo.
echo Pushing image to Docker Hub...
docker push %FULL_IMAGE_NAME%

if %ERRORLEVEL% neq 0 (
    echo Failed to push image!
    exit /b 1
)

echo.
echo Successfully pushed to Docker Hub!
echo Image: %FULL_IMAGE_NAME%
echo.
echo You can now pull it with:
echo docker pull %FULL_IMAGE_NAME%
