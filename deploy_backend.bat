@echo off
set /p PROJECT_ID="Enter your Google Cloud Project ID: "

echo.
echo Deploying Backend to Cloud Run (Project: %PROJECT_ID%)...
echo building from Root context using backend/Dockerfile...
echo.

call gcloud builds submit . --config cloudbuild.yaml --project %PROJECT_ID%

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Build Failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Build Successful! Deploying to Cloud Run...
echo.

call gcloud run deploy medisewa ^
  --image gcr.io/%PROJECT_ID%/medisewa ^
  --platform managed ^
  --region us-central1 ^
  --allow-unauthenticated ^
  --update-env-vars "DEBUG=False" ^
  --project %PROJECT_ID%

echo.
echo Deployment Complete!
pause
