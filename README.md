# TherapyHub

A modern, HIPAA-compliant practice management platform for mental health professionals.

## Project Status

**Current Phase:** Planning & Architecture → **READY TO BUILD**
**Timeline:** 2-4 weeks aggressive MVP
**Target:** Single therapy practice (scaling to SaaS later)
**Branch:** `claude/therapynotes-platform-planning-011CUdbcjuxDKk4oBeqePW5V`

---

## 🚀 2-4 Week MVP Plan

**Building for:** Single therapy practice (your wife's practice)
**Team:** 2 developers
**Infrastructure:** Google Cloud Platform
**Target Launch:** End of November 2025

### Core MVP Features (Priority Order)

1. **Patient Onboarding** ⭐⭐⭐ - Intake forms, documents, e-signatures
2. **Live Video Sessions** ⭐⭐⭐ - WebRTC peer-to-peer encrypted video
3. **Billing** ⭐⭐⭐ - Stripe co-pays + superbill generation
4. **Scheduling** ⭐⭐ - Calendar, appointments, email reminders
5. **HIPAA Compliance** ⭐⭐⭐ - Built-in throughout (encryption, audit logs, BAAs)

**📖 See [MVP_2_WEEK_PLAN.md](./MVP_2_WEEK_PLAN.md) for detailed implementation plan**

---

## What is TherapyHub?

TherapyHub is a modern, HIPAA-compliant practice management system built specifically for therapy practices.

### MVP Features:
- 📄 **Patient Onboarding** - Custom intake forms, document upload, e-signatures
- 🎥 **Video Sessions** - HIPAA-compliant WebRTC video conferencing
- 💳 **Billing** - Stripe co-pay processing + superbill generation
- 📅 **Scheduling** - Appointment management with email reminders
- 👤 **Patient Management** - Records, session notes, document storage
- 🔒 **HIPAA Compliant** - Encryption, audit logs, BAAs, secure authentication

### Coming in V2:
- SMS reminders
- Insurance claims submission (EDI)
- Treatment plans & assessments
- Multi-therapist support
- Mobile apps

---

## Documentation

### 📘 Planning Documents

1. **[MVP_2_WEEK_PLAN.md](./MVP_2_WEEK_PLAN.md)** - **START HERE** ⭐
   - 2-4 week aggressive build plan
   - Week-by-week breakdown
   - Technology stack optimized for speed
   - Simplified database schema
   - GCP deployment strategy
   - HIPAA compliance checklist
   - Quick start commands

2. **[PLUG_AND_PLAY_STRATEGY.md](./PLUG_AND_PLAY_STRATEGY.md)** - **API Integration Guide** 🔌
   - Which APIs to use vs. build custom
   - Daily.co (video) - saves 5-7 days!
   - Stripe Checkout (payments) - 1 hour setup
   - SendGrid (email) - 2 hour setup
   - Cost breakdown by service
   - Updated timeline with plug & play

3. **[PLATFORM_PLANNING.md](./PLATFORM_PLANNING.md)** - Long-term vision (12-month SaaS plan)
   - Research findings (TherapyNotes.com analysis, open-source alternatives)
   - Complete feature requirements (10 core modules)
   - Architecture overview for enterprise scale
   - Cost estimates and revenue model
   - Comprehensive compliance considerations

4. **[TECH_STACK_DECISION.md](./TECH_STACK_DECISION.md)** - Technology deep dive
   - Full stack recommendations
   - Alternative options and trade-offs
   - Performance targets
   - Security best practices

---

## Quick Overview

### Technology Stack (MVP)

**Full-Stack Framework:**
- Next.js 14+ (App Router) - Frontend + Backend in one
- TypeScript - Type safety throughout
- Tailwind CSS - Rapid UI development

**Database & Storage:**
- PostgreSQL (Google Cloud SQL) - HIPAA-compliant
- Prisma ORM - Type-safe database access
- Google Cloud Storage - Document storage
- Redis (optional) - Caching

**Infrastructure:**
- Google Cloud Platform (existing account)
- Cloud Run - Containerized deployment
- Cloud Build - CI/CD automation

**Third-Party Services:**
- Stripe - Co-pay processing (existing account)
- Daily.co OR custom WebRTC - Video sessions
- SendGrid OR Gmail API - Email notifications

**Authentication:**
- NextAuth.js - Therapist login
- Magic links - Patient access (no passwords)

### MVP Timeline (2-4 Weeks)

| Week | Focus | Deliverables |
|------|-------|--------------|
| **Week 1** | Foundation + Onboarding | Project setup, auth, patient forms, documents, e-signatures |
| **Week 2** | Video + Scheduling | WebRTC/Daily.co integration, calendar, appointments, reminders |
| **Week 3** | Billing + Polish | Stripe integration, superbills, UI/UX improvements, testing |
| **Week 4** | Buffer | Fixes, documentation, training, final deployment |

**Launch Target:** End of November 2025

### Cost Estimates (MVP - Single Practice)

**Infrastructure (Monthly):** ~$40-140 + transaction fees
- Google Cloud Run: $10-50/month
- Cloud SQL (PostgreSQL): $20-50/month
- Cloud Storage: $5-10/month
- SendGrid: Free tier or $15/month
- Daily.co: Free tier (10k min/month) or $0.0025/min
- Stripe: 2.9% + $0.30 per transaction

**Very affordable for a single practice!**

---

## Build Approach: From Scratch ✅

After researching OpenEMR and other open-source alternatives, we're building from scratch because:

- ✅ Modern stack (Next.js, TypeScript) - faster development
- ✅ Purpose-built for therapy practices - no unnecessary features
- ✅ Native Stripe + WebRTC integration - easier to implement
- ✅ Full control over HIPAA compliance - no legacy code concerns
- ✅ Simpler to maintain and scale to SaaS later

OpenEMR would require extensive customization and is PHP-based (older tech).

---

## MVP Feature Details

### 1. Patient Onboarding ⭐⭐⭐
- **Patient registration** - Collect demographics, insurance info
- **Custom intake forms** - JSON-based form builder for flexible forms
- **Document upload** - Insurance cards, ID, consent forms to GCS
- **E-signatures** - HTML5 canvas for digital signatures
- **Onboarding workflow** - Therapist creates workflow, patient completes via magic link
- **Progress tracking** - See which patients completed onboarding

### 2. Video Sessions ⭐⭐⭐
- **WebRTC or Daily.co** - Encrypted peer-to-peer video
- **Waiting room** - Patients wait until therapist admits them
- **In-session controls** - Mute, camera on/off, end session
- **Session timer** - Track session duration
- **Session notes** - Take SOAP notes during/after session
- **HIPAA-compliant** - End-to-end encryption, no recording storage (initially)

### 3. Billing & Payments ⭐⭐⭐
- **Stripe integration** - Process co-pays securely
- **Payment at booking** - Optional payment when scheduling
- **Payment receipts** - Automatic email receipts
- **Superbill generation** - PDF superbills for insurance reimbursement
- **Payment history** - View all patient payments

### 4. Scheduling ⭐⭐
- **Calendar view** - Day/week/month views (FullCalendar)
- **Create appointments** - Schedule sessions with patients
- **Appointment types** - Initial consult, therapy session, etc.
- **Email reminders** - Automated reminders 24h before appointment
- **Patient appointment list** - Patients see upcoming appointments

### 5. Patient Management ⭐⭐
- **Patient list** - View all patients
- **Patient profiles** - Demographics, contact info, insurance details
- **Session notes** - Simple SOAP format notes
- **Document viewer** - Access uploaded documents
- **Audit logs** - Track all PHI access (HIPAA requirement)

### 6. HIPAA Compliance ⭐⭐⭐ (Built into everything)
- **Encryption at rest** - Cloud SQL, GCS automatic encryption
- **Encryption in transit** - HTTPS/TLS 1.3, WSS for video
- **Access controls** - Role-based permissions (therapist vs. patient)
- **Audit logging** - All PHI access logged with timestamp, user, action
- **Session timeout** - Auto-logout after 15 minutes
- **BAAs** - Sign Business Associate Agreements with GCP, Stripe, etc.

---

## Why Build Instead of Buy?

**TherapyNotes:** $59/month
**SimplePractice:** $39/month

**But they have:**
- ❌ Older, clunky interfaces
- ❌ Limited customization
- ❌ Vendor lock-in
- ❌ Ongoing costs ($500-700/year)

**TherapyHub will have:**
- ✅ Modern, clean interface
- ✅ Built exactly for your wife's workflow
- ✅ Full control and ownership
- ✅ ~$40-140/month infrastructure cost
- ✅ Can scale to SaaS later (potential revenue)

---

## HIPAA Compliance (Non-Negotiable)

Every feature is built with HIPAA compliance:

**Technical Safeguards:**
- ✅ Encryption at rest (AES-256) - Cloud SQL, GCS automatic
- ✅ Encryption in transit (TLS 1.3, WSS)
- ✅ Role-based access controls (therapist vs. patient)
- ✅ Audit logs for all PHI access
- ✅ Automatic logout (15 min inactivity)

**Administrative Safeguards:**
- ✅ BAAs with GCP, Stripe, Daily.co (if used)
- ✅ Incident response plan
- ✅ Data backup (Cloud SQL automated)

**We'll generate:**
- Privacy policy
- Terms of service
- Notice of Privacy Practices
- Risk assessment

---

## Next Steps (Ready to Start!)

### Before We Begin:

**Answer these questions:**
1. **Domain name** - Do you have one? (e.g., therapyhub.com, yourwife'spractice.com)
2. **GCP project** - Use existing or create new? What's the project ID?
3. **Stripe account** - Keys ready? (test mode initially)
4. **Video decision** - Daily.co (faster, 3 days) or custom WebRTC (5-7 days)?
5. **Email** - Gmail API (if using Workspace) or SendGrid?
6. **Practice details** - How many patients expected? Insurance types?
7. **Start date** - When do we start building? Today?

### Once We Start (Day 1):

```bash
# Create Next.js project
npx create-next-app@latest therapyhub --typescript --tailwind --app

# Install core dependencies
npm install @prisma/client next-auth stripe @fullcalendar/react

# Set up GCP project
gcloud init
gcloud sql instances create therapyhub-db --database-version=POSTGRES_15

# Deploy initial version
gcloud run deploy therapyhub
```

**I'll guide you through every step!**

---

## Project Structure (MVP - Simple)

```
therapyhub/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── (auth)/            # Login, signup
│   │   ├── (therapist)/       # Therapist dashboard, patients, calendar
│   │   ├── (patient)/         # Patient onboarding, appointments, documents
│   │   ├── video/             # Video session pages
│   │   └── api/               # API routes (backend)
│   ├── components/            # React components
│   ├── lib/                   # Utilities, API clients
│   └── prisma/                # Database schema
├── public/                    # Static assets
├── docs/                      # Planning documents
│   ├── MVP_2_WEEK_PLAN.md    # 2-4 week MVP plan (START HERE)
│   ├── PLATFORM_PLANNING.md   # Long-term SaaS vision
│   └── TECH_STACK_DECISION.md # Tech details
└── README.md                  # This file
```

**Simple monolith architecture for MVP - no microservices complexity!**

---

## Resources

### Quick Links
- 📖 [MVP_2_WEEK_PLAN.md](./MVP_2_WEEK_PLAN.md) - Detailed build plan
- 🔐 [GCP Healthcare Compliance](https://cloud.google.com/security/compliance/hipaa)
- 💳 [Stripe API Docs](https://stripe.com/docs/api)
- ⚛️ [Next.js Docs](https://nextjs.org/docs)
- 🎥 [Daily.co Docs](https://docs.daily.co/) (if using)

### Competitors (for reference)
- [TherapyNotes](https://www.therapynotes.com/) - $59/month
- [SimplePractice](https://www.simplepractice.com/) - $39/month

---

**Last Updated:** October 30, 2025
**Status:** ✅ Planning Complete → Ready to Build
**Next Milestone:** Answer pre-build questions & start Day 1!
