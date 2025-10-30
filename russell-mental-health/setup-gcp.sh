#!/bin/bash
# Russell Mental Health - GCP Infrastructure Setup
# Project: therapyconnect-brrphd (392440201633)

set -e  # Exit on error

echo "🚀 Setting up Russell Mental Health infrastructure..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ID="therapyconnect-brrphd"
REGION="us-east1"
DB_INSTANCE="rmh-db"
DB_NAME="russell_mental_health"
BUCKET_NAME="rmh-documents-${PROJECT_ID}"
SERVICE_ACCOUNT_NAME="therapyhub"

echo -e "${BLUE}Project ID: ${PROJECT_ID}${NC}"
echo -e "${BLUE}Region: ${REGION}${NC}"
echo ""

# Step 1: Set current project
echo -e "${GREEN}[1/8] Setting GCP project...${NC}"
gcloud config set project ${PROJECT_ID}

# Step 2: Enable required APIs
echo -e "${GREEN}[2/8] Enabling required APIs...${NC}"
gcloud services enable sqladmin.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable calendar-json.googleapis.com
gcloud services enable gmail.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

echo "✓ APIs enabled"

# Step 3: Create Cloud SQL instance
echo -e "${GREEN}[3/8] Creating Cloud SQL instance (this takes 5-10 minutes)...${NC}"
gcloud sql instances create ${DB_INSTANCE} \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=${REGION} \
  --backup \
  --require-ssl \
  --database-flags=cloudsql.iam_authentication=on \
  || echo "Instance may already exist, continuing..."

echo "✓ Cloud SQL instance created"

# Step 4: Set postgres password
echo -e "${GREEN}[4/8] Setting postgres password...${NC}"
echo "Enter a secure password for the postgres user:"
read -s DB_PASSWORD
gcloud sql users set-password postgres \
  --instance=${DB_INSTANCE} \
  --password=${DB_PASSWORD}

echo "✓ Password set"

# Step 5: Create database
echo -e "${GREEN}[5/8] Creating database...${NC}"
gcloud sql databases create ${DB_NAME} \
  --instance=${DB_INSTANCE} \
  || echo "Database may already exist, continuing..."

echo "✓ Database created"

# Step 6: Create Cloud Storage bucket
echo -e "${GREEN}[6/8] Creating Cloud Storage bucket...${NC}"
gsutil mb -l ${REGION} gs://${BUCKET_NAME} \
  || echo "Bucket may already exist, continuing..."

# Enable uniform bucket-level access (required for HIPAA)
gsutil uniformbucketlevelaccess set on gs://${BUCKET_NAME}

# Set lifecycle rule to delete files after 7 years (HIPAA requires 6 years)
echo '[{"action": {"type": "Delete"}, "condition": {"age": 2555}}]' > /tmp/lifecycle.json
gsutil lifecycle set /tmp/lifecycle.json gs://${BUCKET_NAME}
rm /tmp/lifecycle.json

echo "✓ Bucket created and configured"

# Step 7: Create service account
echo -e "${GREEN}[7/8] Creating service account...${NC}"
gcloud iam service-accounts create ${SERVICE_ACCOUNT_NAME} \
  --display-name="TherapyHub Service Account" \
  || echo "Service account may already exist, continuing..."

SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Grant permissions
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/storage.admin"

echo "✓ Service account created and configured"

# Step 8: Create service account key
echo -e "${GREEN}[8/8] Creating service account key...${NC}"
gcloud iam service-accounts keys create service-account-key.json \
  --iam-account=${SERVICE_ACCOUNT_EMAIL}

echo "✓ Service account key saved to service-account-key.json"

# Get connection details
CONNECTION_NAME=$(gcloud sql instances describe ${DB_INSTANCE} --format="value(connectionName)")

echo ""
echo -e "${GREEN}✨ Setup complete!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📋 Configuration Details${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Project ID: ${PROJECT_ID}"
echo "Cloud SQL Instance: ${DB_INSTANCE}"
echo "Database Name: ${DB_NAME}"
echo "Connection Name: ${CONNECTION_NAME}"
echo "Storage Bucket: gs://${BUCKET_NAME}"
echo "Service Account: ${SERVICE_ACCOUNT_EMAIL}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}⚙️  Next Steps${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Copy .env.example to .env.local:"
echo "   cp .env.example .env.local"
echo ""
echo "2. Update .env.local with these values:"
echo ""
echo "   DATABASE_URL=\"postgresql://postgres:${DB_PASSWORD}@localhost/${DB_NAME}?host=/cloudsql/${CONNECTION_NAME}\""
echo "   GCP_PROJECT_ID=\"${PROJECT_ID}\""
echo "   GCS_BUCKET_NAME=\"${BUCKET_NAME}\""
echo "   GOOGLE_SERVICE_ACCOUNT_KEY=\"./service-account-key.json\""
echo ""
echo "3. Run database migrations:"
echo "   npx prisma generate"
echo "   npx prisma db push"
echo ""
echo "4. Start development server:"
echo "   npm run dev"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT: Add service-account-key.json to .gitignore"
echo "⚠️  Keep your database password secure!"
echo ""
