# 🚀 Quick Setup Guide - Run This Now!

**Project:** therapyconnect-brrphd (392440201633) ✅

You've created the GCP project! Now let's set up the infrastructure.

---

## Step 1: Run the Setup Script (5-10 minutes)

This script will create:
- Cloud SQL database (PostgreSQL)
- Cloud Storage bucket (for documents)
- Service account with permissions

```bash
cd /home/user/TherapyHub/russell-mental-health
./setup-gcp.sh
```

**During the script:**
- It will ask for a **database password** - create a strong one and save it!
- It takes 5-10 minutes (Cloud SQL creation is slow)
- When done, it will show your connection details

---

## Step 2: Create OAuth Credentials (3 minutes)

We need OAuth credentials for Google Calendar & Gmail integration:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **therapyconnect-brrphd**
3. Go to **APIs & Services → Credentials**
4. Click **+ CREATE CREDENTIALS → OAuth client ID**
5. Choose **Web application**
6. Name it: "Russell Mental Health"
7. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-domain.com/api/auth/callback/google` (for production)
8. Click **Create**
9. Copy the **Client ID** and **Client Secret**

---

## Step 3: Get Stripe Test Keys (2 minutes)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Make sure you're in **TEST MODE** (toggle in top right)
3. Copy these keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`)

---

## Step 4: Configure Environment Variables (5 minutes)

```bash
# Copy the template
cp .env.local.template .env.local

# Edit the file
nano .env.local
```

**Fill in these values:**

```bash
# From setup-gcp.sh output:
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost/russell_mental_health?host=/cloudsql/therapyconnect-brrphd:us-east1:rmh-db"

# Generate this:
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# From Google Cloud Console (Step 2):
GOOGLE_CLIENT_ID="your-oauth-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-oauth-client-secret"

# From Stripe Dashboard (Step 3):
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# Office Ally (fill in when you get the email):
OFFICE_ALLY_API_KEY="waiting-for-email"
OFFICE_ALLY_USER_ID="waiting-for-email"
```

**Everything else is pre-filled!** Including:
- ✅ GCP Project ID
- ✅ Project Number
- ✅ Storage Bucket Name
- ✅ Service Account Email
- ✅ Practice NPI (1336918325)
- ✅ Practice EIN (93-4820690)
- ✅ Practice Details

---

## Step 5: Install Cloud SQL Proxy (For Local Development)

```bash
# Download Cloud SQL Proxy
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.linux.amd64

# Make it executable
chmod +x cloud-sql-proxy

# Run it in the background
./cloud-sql-proxy therapyconnect-brrphd:us-east1:rmh-db &
```

---

## Step 6: Run Database Migrations (2 minutes)

```bash
# Generate Prisma Client (reads schema.prisma)
npx prisma generate

# Push schema to database (creates all 18 tables)
npx prisma db push

# Optional: Open Prisma Studio to view database
npx prisma studio
```

You should see output like:
```
✔ Generated Prisma Client
🚀 Your database is now in sync with your schema.
```

---

## Step 7: Start the Development Server! 🎉

```bash
npm run dev
```

Open http://localhost:3000

You should see the Next.js welcome page!

---

## ✅ Checklist - Did You Complete Everything?

- [ ] Ran `./setup-gcp.sh` successfully
- [ ] Database password saved somewhere secure
- [ ] Created OAuth credentials in GCP Console
- [ ] Got Stripe test keys
- [ ] Filled in `.env.local` file
- [ ] Installed Cloud SQL Proxy
- [ ] Ran `npx prisma generate`
- [ ] Ran `npx prisma db push`
- [ ] Started dev server with `npm run dev`
- [ ] Visited http://localhost:3000

---

## 🔧 Troubleshooting

### "Cannot connect to database"
- Make sure Cloud SQL Proxy is running
- Check DATABASE_URL in .env.local
- Verify database password is correct

### "Prisma schema not found"
- Make sure you're in the `russell-mental-health` directory
- Check that `prisma/schema.prisma` exists

### "APIs not enabled"
- Run `./setup-gcp.sh` again (it will skip existing resources)

### "Permission denied"
- Make sure you're authenticated: `gcloud auth login`
- Verify project is set: `gcloud config get-value project`

---

## 📞 What's Next?

Once your dev server is running:
1. **Tell me!** I'll start building authentication (NextAuth.js)
2. **Wait for Office Ally email** - we'll integrate when credentials arrive
3. **Tomorrow:** We build patient management, onboarding, and UI!

---

## 🎯 Current Status

```
✅ Day 1 Part 1: Next.js app created, database schema designed
✅ Day 1 Part 2: GCP project created (therapyconnect-brrphd)
⏳ Day 1 Part 3: Running setup script (YOU ARE HERE)
→  Day 1 Part 4: Environment configured, database migrated
→  Day 2: Build authentication + patient management
→  Day 3-7: Onboarding, documents, UI
→  Week 2: Scheduling + WebRTC video
→  Week 3: Office Ally insurance integration
→  Week 4: Stripe billing + launch!
```

---

**Questions? Stuck? Let me know and I'll help debug!**

Otherwise, run `./setup-gcp.sh` and let's keep building! 🚀
