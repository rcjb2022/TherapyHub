# Russell Mental Health - Getting Started

**Status:** 🚧 Day 1 - Project initialization complete!
**Next:** Set up Google Cloud and run the app locally

---

## ✅ What's Been Done (Day 1 - Part 1)

- [x] Next.js 14 project created with TypeScript & Tailwind CSS
- [x] All dependencies installed (Prisma, NextAuth, Stripe, WebRTC, Google APIs, etc.)
- [x] Complete database schema designed (18 models, HIPAA-compliant)
- [x] Environment variables template created (.env.example)

---

## 🎯 Immediate Next Steps

### Step 1: Set Up Google Cloud Project (15-20 minutes)

```bash
# 1. Create new GCP project
gcloud projects create russell-mental-health-prod --name="Russell Mental Health"

# 2. Set as current project
gcloud config set project russell-mental-health-prod

# 3. Enable required APIs
gcloud services enable sqladmin.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable calendar-json.googleapis.com
gcloud services enable gmail.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# 4. Create Cloud SQL instance (PostgreSQL)
gcloud sql instances create rmh-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-east1 \
  --backup \
  --require-ssl

# 5. Set a password for the postgres user
gcloud sql users set-password postgres \
  --instance=rmh-db \
  --password=YOUR_SECURE_PASSWORD

# 6. Create the database
gcloud sql databases create russell_mental_health --instance=rmh-db

# 7. Get the connection string
gcloud sql instances describe rmh-db --format="value(connectionName)"
# Output format: PROJECT_ID:REGION:INSTANCE_NAME
```

### Step 2: Create Google Cloud Storage Bucket

```bash
# 1. Create bucket for documents (HIPAA-compliant)
gsutil mb -l us-east1 gs://rmh-documents-prod

# 2. Enable encryption (automatic but verify)
gsutil encryption set -k YOUR_KMS_KEY gs://rmh-documents-prod

# 3. Set lifecycle rules (optional - delete files after X years)
gsutil lifecycle set lifecycle.json gs://rmh-documents-prod
```

### Step 3: Set Up Service Account

```bash
# 1. Create service account
gcloud iam service-accounts create therapyhub \
  --display-name="TherapyHub Service Account"

# 2. Grant permissions
gcloud projects add-iam-policy-binding russell-mental-health-prod \
  --member="serviceAccount:therapyhub@russell-mental-health-prod.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding russell-mental-health-prod \
  --member="serviceAccount:therapyhub@russell-mental-health-prod.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# 3. Create and download key
gcloud iam service-accounts keys create service-account-key.json \
  --iam-account=therapyhub@russell-mental-health-prod.iam.gserviceaccount.com

# ⚠️ Keep this file secure! Add to .gitignore
```

### Step 4: Configure Environment Variables

```bash
# 1. Copy the example file
cp .env.example .env.local

# 2. Edit .env.local with your values
nano .env.local
```

**Fill in these critical values:**

```bash
# Database (from Step 1)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@/russell_mental_health?host=/cloudsql/PROJECT:REGION:rmh-db"

# NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"

# Google Cloud
GCP_PROJECT_ID="russell-mental-health-prod"
GCS_BUCKET_NAME="rmh-documents-prod"
GOOGLE_SERVICE_ACCOUNT_KEY="./service-account-key.json"

# Stripe (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# Practice info (already known)
PRACTICE_NPI="1336918325"
PRACTICE_EIN="93-4820690"
PRACTICE_LEGAL_NAME="Bethany R. Russell, Ph.D., P.A."
```

### Step 5: Run Database Migrations

```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Push schema to database (creates tables)
npx prisma db push

# 3. (Optional) Open Prisma Studio to view database
npx prisma studio
```

### Step 6: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

---

## 📁 Project Structure

```
russell-mental-health/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   └── signup/
│   ├── (therapist)/              # Therapist dashboard
│   │   ├── dashboard/
│   │   ├── patients/
│   │   ├── calendar/
│   │   ├── billing/
│   │   └── settings/
│   ├── (patient)/                # Patient portal
│   │   ├── onboarding/
│   │   ├── appointments/
│   │   └── documents/
│   ├── video/                    # Video session pages
│   │   ├── [roomId]/
│   │   └── waiting-room/
│   └── api/                      # API routes
│       ├── auth/                 # NextAuth.js
│       ├── patients/
│       ├── appointments/
│       ├── video/
│       ├── billing/
│       ├── claims/
│       └── webhooks/
├── components/                   # React components
│   ├── ui/                       # Base UI components
│   ├── forms/                    # Form components
│   ├── calendar/                 # Calendar components
│   ├── video/                    # WebRTC components
│   └── layouts/                  # Layout components
├── lib/                          # Utility libraries
│   ├── db.ts                     # Prisma client
│   ├── auth.ts                   # NextAuth config
│   ├── stripe.ts                 # Stripe client
│   ├── google/                   # Google APIs
│   │   ├── gmail.ts
│   │   ├── calendar.ts
│   │   └── storage.ts
│   ├── office-ally/              # Office Ally integration
│   │   ├── client.ts
│   │   ├── claims.ts
│   │   └── eligibility.ts
│   ├── webrtc/                   # WebRTC utilities
│   │   ├── signaling.ts
│   │   └── peer-connection.ts
│   └── audit-log.ts              # HIPAA audit logging
├── prisma/
│   └── schema.prisma             # Database schema ✅
├── public/                       # Static assets
├── .env.example                  # Environment template ✅
├── .env.local                    # Your actual env vars (create this)
└── GETTING_STARTED.md            # This file

```

---

## 🎯 Development Roadmap

### Week 1: Foundation (Days 1-7)
- [x] **Day 1 (Today):** Project setup, database schema, GCP configuration
- [ ] **Day 2:** Authentication (NextAuth.js with Google OAuth)
- [ ] **Day 3:** Patient management CRUD
- [ ] **Day 4:** Onboarding forms & documents
- [ ] **Day 5:** Document upload to GCS
- [ ] **Day 6:** E-signature capture
- [ ] **Day 7:** Audit logging + basic UI polish

### Week 2: Scheduling & Video (Days 8-14)
- [ ] **Day 8:** Calendar UI (FullCalendar)
- [ ] **Day 9:** Appointment CRUD + patient calendar isolation
- [ ] **Day 10:** Google Calendar sync
- [ ] **Day 11:** WebRTC signaling server (Socket.io)
- [ ] **Day 12:** WebRTC video UI (peer-to-peer)
- [ ] **Day 13:** Waiting room + session controls
- [ ] **Day 14:** Email reminders (Gmail API)

### Week 3: Insurance Integration (Days 15-21)
- [ ] **Day 15:** Office Ally API setup + authentication
- [ ] **Day 16:** Eligibility verification (270/271)
- [ ] **Day 17:** Claims generation (EDI 837)
- [ ] **Day 18:** Claims submission to Office Ally
- [ ] **Day 19:** ERA processing (EDI 835)
- [ ] **Day 20:** Claim status tracking
- [ ] **Day 21:** Denial management workflow

### Week 4: Billing & Launch (Days 22-28)
- [ ] **Day 22:** Stripe integration (Payment Intents)
- [ ] **Day 23:** Co-pay collection workflow
- [ ] **Day 24:** Payment receipts + history
- [ ] **Day 25:** Clinical notes (SOAP format)
- [ ] **Day 26:** End-to-end testing
- [ ] **Day 27:** HIPAA compliance audit
- [ ] **Day 28:** Production deployment + training

---

## 🔧 Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npx prisma studio        # Visual database browser
npx prisma generate      # Regenerate Prisma Client
npx prisma db push       # Push schema changes to DB
npx prisma migrate dev   # Create a migration
npx prisma db seed       # Seed database (when we create seed file)

# Linting & Formatting
npm run lint             # Run ESLint
npm run format           # Format code with Prettier

# Testing (to be added)
npm run test             # Run tests
npm run test:e2e         # Run E2E tests
```

---

## 🔐 Security Checklist

Before going to production:

- [ ] Change all default passwords
- [ ] Generate new NEXTAUTH_SECRET (production)
- [ ] Use Stripe live keys (not test keys)
- [ ] Enable Cloud SQL SSL connections
- [ ] Set up GCS bucket encryption with KMS
- [ ] Configure Cloud SQL backup schedule
- [ ] Set up monitoring & alerting (Cloud Monitoring)
- [ ] Enable audit logging
- [ ] Sign BAAs with:
  - [ ] Google Cloud Platform
  - [ ] Stripe
  - [ ] Office Ally
  - [ ] Any other service handling PHI
- [ ] Configure session timeout (15 minutes)
- [ ] Set up rate limiting on API routes
- [ ] Enable CORS properly
- [ ] Add security headers (helmet middleware)

---

## 📞 Need Help?

**Office Ally API Info:**
- You've opened an account ✅
- Waiting on API credentials from them
- Once you get credentials, add to `.env.local`

**Stripe Setup:**
- Log into https://dashboard.stripe.com
- Go to Developers → API Keys
- Copy test keys to `.env.local`
- We'll switch to live keys before production

**Google Cloud Issues:**
- Make sure billing is enabled on GCP project
- Check that all APIs are enabled
- Verify service account has correct permissions

---

## 🚀 You're Ready!

Once you complete Steps 1-6 above, you'll have:
- ✅ Running Next.js app
- ✅ Database connected
- ✅ All infrastructure set up
- ✅ Ready to start building features!

**Next up:** Let's build authentication (NextAuth.js) tomorrow! 🎯
