# TherapyHub - Updated Plan for Russell Mental Health

**Practice:** Russell Mental Health (www.RussellMentalHealth.com)
**Email:** DrBethany@RussellMentalHealth.com
**Existing Apps:** MpowerMe.app
**Timeline:** 3-4 weeks (realistic with insurance integration)
**Infrastructure:** New Google Cloud Project

---

## 🚨 CRITICAL REQUIREMENTS (Updated)

### Must-Have Features (No Compromises):

1. **Real-time Insurance Claims Submission** ⭐⭐⭐
   - Electronic claims (EDI 837 format)
   - Real-time eligibility verification (EDI 270/271)
   - ERA processing (EDI 835)
   - Claim status tracking (EDI 276/277)
   - **Why:** Dr. Bethany is horrible at manual superbills

2. **Patient Onboarding** ⭐⭐⭐
   - Custom intake forms
   - Document upload
   - E-signatures

3. **Video Sessions** ⭐⭐⭐
   - Custom WebRTC (you've built it before) OR Google Meet API
   - HIPAA-compliant

4. **Scheduling** ⭐⭐⭐
   - Therapist calendar (Google Calendar sync)
   - **Patient calendar** - isolated view (only THEIR appointments, not others)
   - Appointment reminders

5. **Billing** ⭐⭐⭐
   - Stripe co-pay processing
   - Insurance integration (primary focus)
   - Payment receipts

6. **Patient Management** ⭐⭐
   - 50 patients currently
   - Session notes
   - Document storage

---

## 🏥 Practice Details

**Provider:** Dr. Bethany R. Russell, Ph.D., LMHC, RPT, NCC
**License:** Florida Licensed Mental Health Counselor
**Certifications:** Registered Play Therapist (RPT), ADOS-2 & MIGDAS certified
**Location:** Babcock Ranch, Florida 32988
**Phone:** 239-427-1635
**Current Patient Load:** 50 patients

**Practice Focus:**
- Children, adolescents, and families
- Virtual practice (telehealth primary)
- Also Assistant Professor at FGCU (may need flexible scheduling)
- President, Florida Association of Counselor Educators

**Insurance Payers:**
- Aetna ✅
- BlueCross BlueShield (Florida Blue) ✅
- Cigna ✅
- Medicare ✅
- Optum/UnitedHealthcare ✅
- CCA Referrals ✅
- Private Pay (multiple payment types)

**Payment Acceptance (UNIQUE):**
- Credit card (Stripe) ✅
- **Cryptocurrency** (Bitcoin, Ethereum) 🔶 **Need to plan for this**
- Check
- Insurance

**Session Types:**
- 90% Individual therapy (children, adolescents, adults)
- 10% Family counseling / Couples therapy

**Specialized Services (Non-Standard):**
1. **ASD Assessments** (ADOS-2, MIGDAS certified)
   - Multi-session structured assessments
   - Comprehensive diagnostic reports
   - Different billing codes
2. **Immigration Mental Health Evaluations**
   - Legal documentation requirements
   - Specific report formats
   - Court submission
3. **Social Investigations** (Court-related)
   - Legal compliance
   - Documentation standards
   - Expert testimony potential
4. **Play Therapy** (RPT specialized)
   - Different documentation style
   - Specific progress note format

**Therapeutic Approaches:**
- Adlerian principles
- Play therapy (primary for children)
- Expressive arts
- Trauma-informed care
- Family systems
- Mindfulness-based

**Areas of Expertise:**
- Anxiety and mood disorders
- Behavioral challenges
- Family conflict
- Grief and loss
- Life transitions
- School difficulties
- Self-esteem concerns
- Chronic illness adaptation
- Sensory Processing Sensitivity
- Autism Spectrum Disorder
- Personality disorders

---

## 🔌 Technology Stack (Google Ecosystem + Insurance)

### Backend & Frontend
```
Next.js 14+ (App Router) - Full-stack TypeScript
Tailwind CSS - UI styling
PostgreSQL (Google Cloud SQL) - Database
Prisma ORM - Type-safe DB access
Google Cloud Storage - Document storage
```

### Google Workspace Integration (Already Using)
```
Gmail API - DrBethany@RussellMentalHealth.com
Google Calendar API - Appointment sync
Google Meet API - Meeting creation (optional)
Google Identity - OAuth authentication
```

### Video Options (You Choose)

**Option 1: Custom WebRTC (RECOMMENDED since you've built it)**
- **Pros:**
  - FREE, no ongoing costs
  - Full control
  - Peer-to-peer encryption (most secure)
  - You already know how to build it
- **Cons:**
  - 3-5 days to implement
  - Need TURN server (can use Google's or Twilio's)
- **Libraries:** simple-peer, PeerJS, or Socket.io + WebRTC

**Option 2: Google Meet API**
- **Pros:**
  - HIPAA-compliant with Workspace BAA
  - Already in Google ecosystem
  - Creates meeting links programmatically
- **Cons:**
  - Can't embed video UI (redirects to meet.google.com)
  - Less control
  - Patients need Google accounts (or guest access)
- **Use Case:** Good for quick meeting link generation

**My Recommendation:** **Custom WebRTC** - You know it, it's free, more control

### Insurance Clearinghouse (CRITICAL)

**Option 1: Office Ally (RECOMMENDED)**
- **Cost:** FREE basic clearinghouse
- **Payers:** Supports all yours (Medicare, UnitedHealth, Florida Blue, Aetna)
- **API:** FHIR API + REST API available
- **Features:**
  - Real-time eligibility (270/271)
  - Claims submission (837P for professional)
  - ERA processing (835)
  - Claim status (276/277)
- **Proven:** 80,000+ healthcare organizations
- **Setup Time:** 1-2 weeks (EDI format is complex)

**Option 2: ClaimMD**
- **Cost:** $25-100/month
- **API:** Modern REST API, easier than Office Ally
- **Setup Time:** 1 week (simpler API)
- **Pros:** Better documentation, modern API
- **Cons:** Monthly cost

**My Recommendation:** **Office Ally** - Free, proven, supports all your payers

### Payments
```
Stripe - Co-pay and private pay processing
Already have account ✅
```

### Email & Notifications
```
Gmail API - Use existing Workspace email
Transactional emails via DrBethany@RussellMentalHealth.com
```

---

## 📊 Updated Architecture (ChatGPT's Approach + Ours)

```
┌─────────────────────────────────────────────────────────────────┐
│                    React Frontend (Next.js)                      │
│              [Therapist Dashboard] | [Patient Portal]            │
└─────────────────────────────────────────────────────────────────┘
                            │
                            v
┌─────────────────────────────────────────────────────────────────┐
│                  API Layer (Next.js API Routes)                  │
│              Authentication | Authorization | Validation         │
└─────────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        v                   v                   v
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Cloud SQL   │  │     GCS      │  │  WebRTC/     │
│ (PostgreSQL) │  │  (Documents) │  │  Meet API    │
└──────────────┘  └──────────────┘  └──────────────┘
        │                   │                   │
        v                   v                   v
┌──────────────────────────────────────────────────────────────────┐
│                     External APIs                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Office Ally  │  │    Stripe    │  │    Gmail     │          │
│  │  Insurance   │  │   Payments   │  │     API      │          │
│  │ (837/835/    │  │              │  │              │          │
│  │  270/276)    │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐                                                │
│  │   Google     │                                                │
│  │  Calendar    │                                                │
│  │     API      │                                                │
│  └──────────────┘                                                │
└──────────────────────────────────────────────────────────────────┘
        │
        v
┌─────────────────────────────────────────────────────────────────┐
│           Google Cloud Logging (Audit Logs - HIPAA)             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗓️ Realistic Timeline: 3-4 Weeks

### Week 1: Foundation + Patient Management
**Days 1-2: Project Setup**
- Create Next.js project
- Set up new GCP project
- Configure Cloud SQL (PostgreSQL)
- Set up Cloud Storage
- Configure Google Workspace OAuth
- Set up Prisma ORM with initial schema
- Deploy to Cloud Run (staging)

**Days 3-4: Authentication & Patient Management**
- Google OAuth for therapist login
- Patient magic link authentication
- Patient list & profiles
- Basic patient CRUD operations
- Audit logging setup

**Days 5-7: Onboarding**
- Custom intake form builder
- Document upload to GCS
- E-signature capture (HTML5 canvas)
- Patient onboarding workflow

### Week 2: Scheduling + Video
**Days 8-9: Scheduling System**
- Calendar UI (FullCalendar)
- Create/edit appointments
- Google Calendar API sync
- **Patient calendar view (isolated - only their appointments)**
- Appointment types (individual, couples, family)

**Days 10-12: Video Integration**
- **Option A:** Custom WebRTC implementation (3-4 days)
  - WebRTC signaling server (Socket.io)
  - Video room creation
  - Peer-to-peer connection
  - Waiting room
  - In-session controls
- **Option B:** Google Meet API (1-2 days)
  - Meeting link generation
  - Calendar integration
  - Patient access flow

**Days 13-14: Email & Reminders**
- Gmail API setup with Workspace
- Appointment reminder emails
- Confirmation emails
- Patient invitation emails

### Week 3: Insurance Integration (CRITICAL - Complex!)
**Days 15-17: Office Ally Setup & Integration**
- Office Ally account setup
- Enroll practice with payers (Medicare, UnitedHealth, etc.)
- Understand EDI formats (837, 835, 270, 276)
- Set up API credentials
- Test connection

**Days 18-19: Claims Submission (EDI 837)**
- Build claims data structure
- Map appointment + diagnosis + procedure codes to 837 format
- Submit test claims
- Handle claim validation errors
- Store claim submission records

**Days 20-21: Eligibility & ERA**
- Real-time eligibility checks (270/271)
- Display eligibility before appointment
- ERA processing (835 - payment posting)
- Claim status checking (276/277)
- Denial tracking

### Week 4: Payments + Polish
**Days 22-23: Stripe Integration**
- Stripe co-pay collection
- Payment intents
- Payment receipts
- Payment history
- Refund handling

**Days 24-25: Session Notes & Clinical**
- SOAP notes interface
- CPT codes for billing
- ICD-10 diagnosis codes
- Link notes to claims

**Days 26-27: Testing & Polish**
- End-to-end testing
- UI/UX refinements
- Mobile responsiveness
- Error handling
- HIPAA compliance review

**Day 28: Deployment & Training**
- Production deployment
- Train Dr. Bethany
- Documentation
- Go live!

---

## 🔐 HIPAA Compliance (ChatGPT's Checklist + Ours)

### A. Google Cloud Setup
- [x] Sign BAA with Google Cloud
- [x] Use only BAA-covered services:
  - Cloud SQL ✅
  - Cloud Storage ✅
  - Cloud Run ✅
  - Google Calendar API ✅ (with Workspace BAA)
  - Gmail API ✅ (with Workspace BAA)
  - Google IAM ✅
  - Cloud Logging ✅
- [x] Enable encryption at rest (automatic)
- [x] Enable encryption in transit (HTTPS/TLS)
- [x] VPC network isolation
- [x] Firewall rules (restrict access)

### B. Database & Storage
- [x] Cloud SQL encryption at rest
- [x] Cloud SQL encrypted backups
- [x] Cloud Storage server-side encryption
- [x] No PHI in logs (sanitize)
- [x] Automated backups (daily)
- [x] Test restoration process

### C. Application Security
- [x] HTTPS everywhere (TLS 1.3)
- [x] Secure session management
- [x] Auto-logout after 15 min inactivity
- [x] Input validation/sanitization
- [x] SQL injection prevention (Prisma ORM)
- [x] XSS prevention (React escaping)
- [x] CSRF protection (Next.js built-in)
- [x] Rate limiting on APIs

### D. Access Controls
- [x] Google IAM for infrastructure
- [x] Role-based access (therapist vs. patient)
- [x] Least privilege principle
- [x] MFA for admin access
- [x] Audit logs for all PHI access
- [x] Patient data isolation

### E. Third-Party Services (BAAs Required)
- [x] Google Cloud Platform - BAA
- [x] Google Workspace - BAA (already have)
- [x] Stripe - BAA
- [x] Office Ally - BAA
- [x] WebRTC TURN servers (if using Twilio) - BAA

### F. Video Conferencing
- [x] WebRTC: Peer-to-peer encryption (most secure)
- [x] OR Google Meet: Workspace BAA covers it
- [x] No recording storage (initially)
- [x] Secure room URLs (random, hard to guess)

### G. Policies & Documentation
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Notice of Privacy Practices
- [ ] Incident response plan
- [ ] Risk assessment
- [ ] HIPAA training materials

**I'll help generate these documents**

---

## 🎯 Patient Calendar Isolation Design

### Requirements:
- Patients see ONLY their appointments
- Cannot see other patients' appointments
- Cannot see therapist's full schedule
- Clean, simple view

### Implementation:
```javascript
// API endpoint: /api/patient/appointments
// Returns only appointments for authenticated patient

export async function GET(req) {
  const patientId = await getPatientIdFromSession(req);

  // Query only THIS patient's appointments
  const appointments = await prisma.appointment.findMany({
    where: {
      patientId: patientId, // Isolate by patient
    },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      appointmentType: true,
      status: true,
      videoRoomUrl: true,
      // DO NOT include other patients' data
    },
  });

  return Response.json(appointments);
}

// Frontend: Simple list view (not full calendar)
<PatientAppointmentList>
  {appointments.map(appt => (
    <AppointmentCard
      date={appt.startTime}
      type={appt.appointmentType}
      status={appt.status}
      joinButton={appt.videoRoomUrl}
    />
  ))}
</PatientAppointmentList>
```

**Design:**
- List view (not calendar grid) for patients
- Shows only upcoming appointments
- "Join Video Session" button when appointment starts
- Past appointments in separate "History" section

---

## 💰 Updated Cost Breakdown

### Monthly Infrastructure
| Service | Cost | Notes |
|---------|------|-------|
| **Google Cloud Run** | $20-50 | Pay per use |
| **Cloud SQL (PostgreSQL)** | $25-75 | Small instance for 50 patients |
| **Cloud Storage** | $5-15 | Document storage |
| **Cloud Logging** | $10-20 | Audit logs |
| **Office Ally** | $0 | FREE clearinghouse! |
| **Stripe** | 2.9% + $0.30 | Per transaction |
| **WebRTC TURN (if needed)** | $0-10 | Twilio STUN/TURN or Google's |
| **TOTAL** | **$60-170/month** | Very reasonable! |

### One-Time Setup Costs
| Item | Cost | Notes |
|------|------|-------|
| Domain (already have) | $0 | RussellMentalHealth.com |
| SSL Certificate | $0 | Let's Encrypt / GCP managed |
| Office Ally enrollment | $0 | Free |
| Development time | Priceless | 3-4 weeks with you + me |

---

## 📋 Pre-Build Checklist

### Information Needed:
- [x] Domain: RussellMentalHealth.com ✅
- [x] Email: DrBethany@RussellMentalHealth.com ✅
- [x] Existing apps: MpowerMe.app ✅
- [x] Patient count: 50 ✅
- [x] Insurance: Medicare, UnitedHealth, Florida Blue, Aetna, Private Pay ✅
- [x] Session types: 90% individual, 10% couples/family ✅
- [ ] **NEW GCP Project ID** - Need to create
- [ ] **Stripe API keys** - Get test keys
- [ ] **Office Ally account** - Need to register
- [ ] **NPI number** (for insurance) - Dr. Bethany's provider NPI
- [ ] **Tax ID (EIN)** - For insurance billing
- [ ] **Practice address** - For insurance enrollment

### Decisions Needed:
- [ ] **Video:** Custom WebRTC or Google Meet API?
  - **Recommendation:** WebRTC (you know it, free, more control)
- [ ] **Insurance clearinghouse:** Office Ally or ClaimMD?
  - **Recommendation:** Office Ally (free, proven)
- [ ] **Session recording:** Store recordings or not?
  - **Recommendation:** Not initially (simpler, less storage/compliance)

---

## 🚀 Day 1 Commands (Once We Start)

```bash
# Create Next.js project
npx create-next-app@latest russell-mental-health --typescript --tailwind --app
cd russell-mental-health

# Install dependencies
npm install @prisma/client next-auth @next-auth/prisma-adapter
npm install stripe @stripe/stripe-js
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid
npm install react-hook-form zod @hookform/resolvers
npm install socket.io socket.io-client  # For WebRTC signaling
npm install simple-peer  # For WebRTC
npm install googleapis  # For Gmail & Calendar APIs
npm install -D prisma

# Initialize Prisma
npx prisma init

# Set up GCP (you'll need to authenticate)
gcloud init
gcloud projects create russell-mental-health-[unique-id]
gcloud config set project russell-mental-health-[unique-id]

# Create Cloud SQL instance
gcloud sql instances create rmh-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-east1 \
  --backup

# Create database
gcloud sql databases create therapyhub --instance=rmh-db

# Create Cloud Storage bucket
gsutil mb -l us-east1 gs://rmh-documents-[unique-id]
gsutil encryption default -k [KMS-KEY] gs://rmh-documents-[unique-id]

# Enable APIs
gcloud services enable sqladmin.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable calendar-json.googleapis.com
gcloud services enable gmail.googleapis.com
```

---

## 🤔 ChatGPT's Suggestions - My Thoughts

| ChatGPT Suggestion | My Opinion | Reasoning |
|-------------------|------------|-----------|
| **Node/Express or FastAPI backend** | ✅ Agree, but use Next.js | Next.js = frontend + backend in one, faster dev |
| **Google Meet API for video** | ⚠️ Partial | Meet API can't embed UI, custom WebRTC better |
| **Insurance clearinghouse API** | ✅ 100% Agree | Office Ally is perfect, free, supports all payers |
| **Google Calendar integration** | ✅ Agree | Already using Workspace, easy integration |
| **Stripe for payments** | ✅ Agree | Already have account, standard choice |
| **Separate frontend/backend** | ❌ Disagree | Next.js monolith faster for MVP |
| **Google IAM for access control** | ✅ Agree | Essential for HIPAA |
| **Audit logging in Cloud Logging** | ✅ Agree | Required for HIPAA compliance |

**ChatGPT's approach is solid! Main difference:** I'd use Next.js monolith instead of separate frontend/backend for faster MVP development.

---

## ✅ Next Steps (Today)

1. **Answer these questions:**
   - Video: WebRTC or Google Meet API? (**I recommend WebRTC**)
   - Insurance: Office Ally or ClaimMD? (**I recommend Office Ally**)
   - Do you want session recording? (Not recommended for MVP)

2. **Get this information:**
   - Dr. Bethany's NPI number
   - Practice Tax ID (EIN)
   - Practice physical address
   - Stripe test API keys

3. **Create accounts:**
   - New GCP project
   - Office Ally clearinghouse account (free)
   - Confirm Stripe access

4. **Review:**
   - Look at RussellMentalHealth.com for branding/style
   - Confirm the 3-4 week timeline works
   - Approve the architecture above

**Once you confirm, we start Day 1 immediately!**

---

**This is realistic, achievable, and accounts for the insurance integration complexity. Let's do this! 🚀**
