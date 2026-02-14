# Helper script to deploy to Cloud Run
# Usage: ./deploy.sh [PROJECT_ID] [REGION]

PROJECT_ID=${1:-your-project-id}
REGION=${2:-us-central1}
SERVICE_NAME="medisewa-backend"

echo "Deploying $SERVICE_NAME to project $PROJECT_ID in region $REGION..."

# Submit build to Cloud Build
# We build from the root directory so Docker context includes everything, 
# but the Dockerfile is in backend/Dockerfile
gcloud builds submit .. --config ../cloudbuild.yaml

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --update-env-vars "DEBUG=False,SECRET_KEY=change-this-in-production-console"
