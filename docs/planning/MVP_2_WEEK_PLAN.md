# TherapyHub MVP - 2-4 Week Build Plan

**Target Timeline:** 2-4 weeks
**Team:** 2 developers (you + Claude)
**Purpose:** Single practice (your wife's therapy practice)
**Infrastructure:** Google Cloud Platform (existing account)

---

## Reality Check: What's Achievable in 2-4 Weeks

Building a HIPAA-compliant therapy platform in 2-4 weeks is **extremely aggressive** but possible if we:
1. Focus ONLY on must-have features
2. Use rapid development tools
3. Accept some technical debt to fix later
4. Work in parallel where possible
5. Use pre-built solutions where available

---

## Core MVP Features (Priority Order)

### 1. Patient Onboarding ⭐⭐⭐ (MUST HAVE)
- Patient registration form
- Intake forms (custom forms builder - simple version)
- Document upload (consent forms, insurance cards, etc.)
- E-signature capture (HTML5 canvas)
- Document storage (Google Cloud Storage)
- Patient can complete forms before first session

### 2. Live Video Sessions ⭐⭐⭐ (MUST HAVE)
- WebRTC peer-to-peer video (encrypted by default)
- Simple waiting room
- Session initiation by therapist
- Patient joins via link (no account needed initially)
- Session timer
- Basic quality controls (mute, camera on/off)

### 3. Billing ⭐⭐⭐ (MUST HAVE)
- Stripe integration for co-pay collection
- Payment at time of booking or check-in
- Payment receipts
- Basic superbill generation (PDF) for insurance claims
- Patient payment history

### 4. Scheduling ⭐⭐ (IMPORTANT)
- Calendar view for therapist
- Appointment creation/editing
- Patient can see their appointments
- Email reminders (via SendGrid or Gmail API)
- Basic availability blocking

### 5. Patient Management ⭐⭐ (IMPORTANT)
- Patient list
- Patient profiles (demographics, contact info)
- Session notes (simple SOAP format)
- Patient document access

### 6. HIPAA Compliance ⭐⭐⭐ (MUST HAVE - Built-in throughout)
- Encryption at rest (GCS, Cloud SQL)
- Encryption in transit (HTTPS, WSS for video)
- Audit logging (who accessed what PHI, when)
- Session timeout (15 min)
- Secure authentication
- BAAs for all services (GCP, Stripe, etc.)

---

## What We're NOT Building (Yet)

❌ Multi-tenant (multiple practices)
❌ Insurance claims submission (use superbills + manual submission initially)
❌ Real-time eligibility verification
❌ Complex scheduling (recurring, waitlist, etc.)
❌ Patient portal (separate login) - patients use magic links initially
❌ Mobile apps
❌ Advanced reporting
❌ Treatment plans / assessments (PHQ-9, etc.)
❌ Group therapy sessions
❌ SMS reminders (email only initially)
❌ Complex role-based access (just therapist vs. patient)

---

## Technology Stack (Optimized for Speed)

### Backend + Frontend: All-in-One

**Framework: Next.js 14+ (App Router)**
- Full-stack in one codebase
- API routes for backend
- React for frontend
- TypeScript for type safety
- Fast development, easy deployment

**Why Next.js over separate backend?**
- Faster development (one codebase)
- Built-in API routes
- Server components for performance
- Easy deployment to GCP Cloud Run

### Database

**PostgreSQL (Google Cloud SQL)**
- HIPAA-compliant with encryption
- Native GCP integration
- Use Prisma ORM for rapid schema development

### Storage

**Google Cloud Storage**
- HIPAA-compliant
- Direct integration with GCP
- Encrypted at rest automatically

### Authentication

**NextAuth.js (Auth.js)**
- Built for Next.js
- Fast setup
- Email magic links for patients (no passwords to manage)
- Session management

### Video (WebRTC)

**Simple-peer or PeerJS**
- Simple WebRTC wrapper
- Peer-to-peer = more secure, less infrastructure
- Use GCP for STUN/TURN servers (if needed)

**Alternative: Daily.co API**
- HIPAA-compliant video API
- $0 for first 10,000 minutes
- Much faster to implement than custom WebRTC
- Has BAA available
- **Recommendation: Use Daily.co to save time, move to native WebRTC later**

### Payments

**Stripe**
- You already have account
- Fast integration
- PCI compliant (no card storage on our end)
- Has BAA available

### Email

**Google Gmail API or SendGrid**
- Gmail API if using workspace (easiest)
- SendGrid if need transactional email features
- Both have BAA available

### Deployment

**Google Cloud Run**
- Containerized Next.js app
- Auto-scaling
- Pay per use
- Easy CI/CD with Cloud Build

---

## Architecture (Simplified)

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Application                      │
│                    (Frontend + Backend)                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Therapist  │  │   Patient    │  │    Video     │     │
│  │     Pages    │  │    Pages     │  │    Session   │     │
│  │  (Protected) │  │  (Magic Link)│  │   (WebRTC)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Routes (Backend)                     │  │
│  │  /api/auth  /api/patients  /api/appointments         │  │
│  │  /api/billing  /api/documents  /api/video            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Cloud SQL  │  │     GCS      │  │    Redis     │
│ (PostgreSQL) │  │  (Documents) │  │   (Cache)    │
└──────────────┘  └──────────────┘  └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                External Services (all with BAAs)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Stripe    │  │   Daily.co   │  │   SendGrid   │     │
│  │   Payments   │  │     Video    │  │     Email    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema (Minimal)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  role          Role      @default(PATIENT)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relationships
  patientsManaged Patient[] @relation("TherapistPatients")
  appointments    Appointment[]
  sessions        Session[]
  auditLogs       AuditLog[]
}

enum Role {
  THERAPIST
  PATIENT
  ADMIN
}

model Patient {
  id            String    @id @default(cuid())
  userId        String?   @unique
  therapistId   String

  // Demographics
  firstName     String
  lastName      String
  email         String
  phone         String?
  dateOfBirth   DateTime
  address       Json?

  // Insurance
  insuranceProvider String?
  insuranceId   String?

  // Status
  onboardingComplete Boolean @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relationships
  user          User?     @relation("TherapistPatients", fields: [therapistId], references: [id])
  therapist     User      @relation(fields: [therapistId], references: [id])
  appointments  Appointment[]
  documents     Document[]
  payments      Payment[]
  sessions      Session[]
}

model Appointment {
  id            String    @id @default(cuid())
  patientId     String
  therapistId   String
  startTime     DateTime
  endTime       DateTime
  status        AppointmentStatus @default(SCHEDULED)
  notes         String?

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relationships
  patient       Patient   @relation(fields: [patientId], references: [id])
  therapist     User      @relation(fields: [therapistId], references: [id])
  payment       Payment?
  session       Session?
}

enum AppointmentStatus {
  SCHEDULED
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}

model Session {
  id            String    @id @default(cuid())
  appointmentId String    @unique
  patientId     String
  therapistId   String

  // Session details
  startedAt     DateTime?
  endedAt       DateTime?
  duration      Int?      // minutes
  notes         String?   // SOAP notes

  // Video
  videoRoomId   String?
  videoUrl      String?

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relationships
  appointment   Appointment @relation(fields: [appointmentId], references: [id])
  patient       Patient   @relation(fields: [patientId], references: [id])
  therapist     User      @relation(fields: [therapistId], references: [id])
}

model Document {
  id            String    @id @default(cuid())
  patientId     String

  name          String
  type          DocumentType
  gcsPath       String    // Google Cloud Storage path
  url           String    // Signed URL (temporary)
  mimeType      String
  size          Int       // bytes

  // Signatures
  requiresSignature Boolean @default(false)
  signedAt      DateTime?
  signatureData String?   // Base64 signature image

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relationships
  patient       Patient   @relation(fields: [patientId], references: [id])
}

enum DocumentType {
  INTAKE_FORM
  CONSENT_FORM
  INSURANCE_CARD
  ID_DOCUMENT
  TREATMENT_PLAN
  PROGRESS_NOTE
  SUPERBILL
  OTHER
}

model Payment {
  id            String    @id @default(cuid())
  patientId     String
  appointmentId String?   @unique

  amount        Int       // cents
  currency      String    @default("usd")
  status        PaymentStatus

  // Stripe
  stripePaymentIntentId String?
  stripePaymentMethodId String?

  description   String?
  receiptUrl    String?

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relationships
  patient       Patient   @relation(fields: [patientId], references: [id])
  appointment   Appointment? @relation(fields: [appointmentId], references: [id])
}

enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  REFUNDED
}

model AuditLog {
  id            String    @id @default(cuid())
  userId        String
  action        String
  resource      String    // e.g., "Patient", "Document"
  resourceId    String
  ipAddress     String?
  userAgent     String?
  details       Json?

  createdAt     DateTime  @default(now())

  // Relationships
  user          User      @relation(fields: [userId], references: [id])
}
```

---

## Week-by-Week Plan

### Week 1: Foundation + Onboarding

**Days 1-2: Project Setup**
- ✅ Initialize Next.js project with TypeScript
- ✅ Set up Prisma with Cloud SQL
- ✅ Configure authentication (NextAuth.js)
- ✅ Set up GCS for document storage
- ✅ Deploy initial version to Cloud Run
- ✅ Set up CI/CD with Cloud Build

**Days 3-4: Patient Onboarding**
- ✅ Patient registration form
- ✅ Custom intake form builder (simple JSON-based)
- ✅ Document upload to GCS
- ✅ E-signature capture (HTML5 canvas)
- ✅ Therapist can create onboarding workflows
- ✅ Patient can complete forms via magic link

**Days 5-7: Patient Management**
- ✅ Patient list view
- ✅ Patient profile page
- ✅ Patient document viewer
- ✅ Basic session notes (SOAP format)
- ✅ Audit logging setup

### Week 2: Video + Scheduling

**Days 8-10: Video Sessions**
- ✅ Daily.co API integration OR custom WebRTC
- ✅ Therapist can create video room
- ✅ Patient joins via secure link
- ✅ Waiting room interface
- ✅ In-session controls (mute, camera, end)
- ✅ Session timer and notes interface

**Days 11-12: Scheduling**
- ✅ Calendar view (FullCalendar)
- ✅ Create/edit appointments
- ✅ Patient appointment list
- ✅ Email reminders (SendGrid or Gmail API)

**Days 13-14: Testing & Fixes**
- ✅ Test all flows end-to-end
- ✅ Fix critical bugs
- ✅ Security audit (basic)
- ✅ HIPAA compliance review

### Week 3: Billing + Polish

**Days 15-17: Billing**
- ✅ Stripe integration
- ✅ Payment at booking or check-in
- ✅ Payment confirmation emails
- ✅ Payment receipts
- ✅ Superbill PDF generation
- ✅ Payment history

**Days 18-19: Polish**
- ✅ UI/UX improvements
- ✅ Mobile responsiveness
- ✅ Error handling
- ✅ Loading states
- ✅ Notifications

**Days 20-21: Documentation & Training**
- ✅ User documentation
- ✅ Train your wife on the system
- ✅ Test with real patients (if possible)
- ✅ Final deployment

### Week 4: Buffer (If Needed)

**Days 22-28: Refinements**
- ✅ Address feedback from testing
- ✅ Performance optimization
- ✅ Additional features if time permits
- ✅ Prepare for production launch

---

## Daily Development Workflow

**Recommended Approach:**

1. **Morning:** Plan the day, pick 2-3 features to build
2. **Work Session:** I (Claude) generate code, you review and test
3. **Evening:** Deploy to staging, test end-to-end
4. **Repeat:** Move to next feature

**Parallel Work:**
- I can work on backend APIs while you work on UI
- I can write tests while you do manual testing
- We can tackle different features simultaneously

---

## Critical Path Items (Must Not Slip)

1. **HIPAA Compliance** - Non-negotiable, built-in from day 1
2. **Video Sessions** - Core value proposition
3. **Patient Onboarding** - Can't operate without this
4. **Basic Billing** - Revenue/operations requirement

Everything else can be simplified or deferred.

---

## Technology Decisions

### Video: Daily.co vs. Custom WebRTC

**Daily.co (Recommended for MVP):**
- ✅ 10,000 free minutes/month
- ✅ HIPAA-compliant with BAA
- ✅ 2-3 days to implement
- ✅ Reliable, maintained
- ✅ Recording, screen sharing built-in
- ❌ Third-party dependency
- ❌ Costs after free tier

**Custom WebRTC:**
- ✅ Full control
- ✅ No ongoing costs (just TURN server)
- ✅ Direct peer-to-peer (more secure)
- ❌ 5-7 days to implement properly
- ❌ You maintain it
- ❌ Browser compatibility testing needed

**Recommendation:** Start with **Daily.co** to save 3-5 days. Move to custom WebRTC in v2 if needed.

### Forms: Custom Builder vs. TypeForm/JotForm

**Custom Form Builder:**
- ✅ Full control and HIPAA compliance
- ✅ Integrated with your system
- ❌ 3-4 days to build

**TypeForm/JotForm with BAA:**
- ✅ 1 day to integrate
- ✅ Great UX
- ❌ Monthly cost
- ❌ External dependency

**Recommendation:** **Custom builder** (simple JSON schema-based). More control, better integration.

### Database: Cloud SQL vs. Firebase

**Cloud SQL (Recommended):**
- ✅ Full SQL control
- ✅ Native GCP integration
- ✅ Better for complex queries (billing, scheduling)
- ✅ Prisma ORM (great DX)

**Firebase:**
- ✅ Faster setup (maybe 1 day saved)
- ❌ NoSQL = harder for relational data
- ❌ More expensive for documents

**Recommendation:** **Cloud SQL** with PostgreSQL

---

## Cost Estimates (Monthly)

### GCP Services
- Cloud Run: ~$10-50/month (low traffic)
- Cloud SQL (PostgreSQL): ~$20-50/month (small instance)
- Cloud Storage: ~$5-10/month
- Cloud Build: Free tier likely sufficient
- **Subtotal:** ~$40-110/month

### Third-Party Services
- Stripe: 2.9% + $0.30 per transaction (variable)
- Daily.co: $0 (free tier), then $0.0025/min
- SendGrid: Free tier (100 emails/day) or $15/month
- **Subtotal:** ~$0-30/month + transaction fees

**Total:** ~$40-140/month + transaction fees

Very affordable for a single practice!

---

## HIPAA Compliance Checklist

### Technical Safeguards
- [x] Encryption in transit (HTTPS/TLS 1.3)
- [x] Encryption at rest (Cloud SQL, GCS automatic)
- [x] Access controls (NextAuth + role checks)
- [x] Audit logging (all PHI access tracked)
- [x] Session timeout (15 minutes)
- [x] Password requirements (NextAuth handles)
- [ ] Automatic logout on inactivity

### Administrative Safeguards
- [ ] BAA with Google Cloud Platform
- [ ] BAA with Stripe
- [ ] BAA with Daily.co (if using)
- [ ] BAA with SendGrid (if using)
- [ ] Workforce training (your wife)
- [ ] Incident response plan (document)
- [ ] Data backup procedures (Cloud SQL automated)

### Physical Safeguards
- [x] Use HIPAA-compliant cloud (GCP)
- [x] Workstation security (use guidelines)

### Documentation Needed
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Notice of privacy practices (NPP)
- [ ] BAAs with all vendors
- [ ] Incident response plan
- [ ] Risk assessment (simple)

**Note:** I can help generate these documents.

---

## Risk Mitigation

### Biggest Risks

**Risk 1: Timeline Slippage**
- **Mitigation:** Ruthlessly prioritize. Cut features if needed. Video + Onboarding + Billing = MVP.

**Risk 2: HIPAA Non-Compliance**
- **Mitigation:** Built-in from day 1. Use compliant services only. Get BAAs immediately.

**Risk 3: Video Quality Issues**
- **Mitigation:** Use Daily.co (proven). Test extensively. Have backup plan (Google Meet link).

**Risk 4: Stripe Integration Complexity**
- **Mitigation:** Use Stripe Checkout (simplest). Delay advanced features.

**Risk 5: Scope Creep**
- **Mitigation:** Firm MVP scope. Write down "v2" features separately.

---

## V2 Features (After Launch)

Once wife is using the system and it's stable, add:

1. **SMS reminders** (Twilio)
2. **Treatment plans and assessments**
3. **Patient portal** (separate login vs. magic links)
4. **Insurance claims submission** (not just superbills)
5. **Recurring appointments**
6. **Group therapy sessions**
7. **Custom WebRTC** (replace Daily.co)
8. **Mobile apps** (React Native)
9. **Advanced reporting**
10. **Multi-therapist support** (if she adds staff)

---

## Deployment Strategy

### Environment Setup

**Development:**
- Local Next.js (`npm run dev`)
- Local PostgreSQL or Cloud SQL proxy
- Use `.env.local` for secrets

**Staging:**
- Cloud Run instance (staging subdomain)
- Cloud SQL (staging database)
- Test with real data copies

**Production:**
- Cloud Run instance (main domain)
- Cloud SQL (production database)
- Automated backups
- Monitoring (Cloud Monitoring)

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to GCP

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: google-github-actions/setup-gcloud@v1
      - run: |
          gcloud builds submit --tag gcr.io/PROJECT_ID/therapyhub
          gcloud run deploy therapyhub --image gcr.io/PROJECT_ID/therapyhub
```

---

## Quick Start Commands

```bash
# Create Next.js project
npx create-next-app@latest therapyhub --typescript --tailwind --app

cd therapyhub

# Install dependencies
npm install @prisma/client @auth/prisma-adapter next-auth
npm install stripe @stripe/stripe-js
npm install @fullcalendar/react @fullcalendar/daygrid
npm install react-hook-form zod
npm install @google-cloud/storage
npm install simple-peer socket.io socket.io-client
npm install -D prisma

# Initialize Prisma
npx prisma init

# Set up GCP
gcloud init
gcloud projects create therapyhub-[unique-id]
gcloud sql instances create therapyhub-db --database-version=POSTGRES_15 --tier=db-f1-micro --region=us-central1

# Create database
gcloud sql databases create therapyhub --instance=therapyhub-db

# Create Cloud Storage bucket
gsutil mb -l us-central1 gs://therapyhub-documents-[unique-id]

# Run migrations
npx prisma migrate dev --name init

# Start development
npm run dev
```

---

## Success Criteria (MVP Launch)

### Must Have Before Launch:
- ✅ Your wife can log in securely
- ✅ Patients can complete onboarding forms
- ✅ E-signatures work correctly
- ✅ Video sessions work reliably
- ✅ Appointments can be scheduled
- ✅ Stripe payments process correctly
- ✅ Superbills can be generated
- ✅ All PHI is encrypted
- ✅ Audit logs capture all access
- ✅ BAAs are signed with all vendors
- ✅ System is deployed and accessible
- ✅ Basic documentation exists

### Nice to Have (Can Add Later):
- Automated email reminders
- Mobile-optimized UI
- Advanced reporting
- Multiple therapist support

---

## Next Steps (Today/Tomorrow)

1. **Confirm this plan works for you**
2. **Set up GCP project and services** (if not already done)
3. **Get Stripe API keys** (test mode initially)
4. **Decide: Daily.co or custom WebRTC?** (I recommend Daily.co for speed)
5. **Begin Day 1: Project setup**

---

## Questions for You

1. **Domain name:** Do you have a domain for this? (e.g., therapyhub.com)
2. **Stripe account:** Ready to go? Need help setting up?
3. **GCP project:** Do you want to use existing project or create new one?
4. **Wife's practice details:**
   - How many patients initially?
   - Session types (individual only, or group too)?
   - Insurance types accepted?
5. **Start date:** When do you want to begin building? Now?

---

**This is aggressive but achievable if we stay focused!**

Let me know if you want to adjust anything, and we can start building immediately. 🚀
