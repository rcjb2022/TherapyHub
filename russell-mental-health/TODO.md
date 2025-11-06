# Russell Mental Health Platform - TODO List

**Version:** 0.7.0
**Last Updated:** November 6, 2025 (Day 7 - Complete)
**Status:** Patient UX & Video Session Foundation COMPLETE ✅ - Ready for Video Recording & AI Features 🎬

---

## ✅ Completed Today (Day 7 - Nov 6, 2025)

### Patient UX Improvements 👥 ⭐
- [x] **Patient Dashboard "Today's Schedule"**
  - Matches therapist dashboard style exactly
  - In-progress session highlighting (green border + badge)
  - Color-coded appointments (Green=Current, Blue=Upcoming, Gray=Cancelled)
  - Large join buttons appear 30 minutes before appointment
  - Empty state when no appointments today
  - Links to full calendar view

- [x] **Enhanced Calendar Modal Redesign**
  - Large prominent blue button (py-6, text-lg) - impossible to miss
  - Color-coded sections (blue=therapist, green=date/time)
  - Professional layout with borders and spacing
  - Next.js Link integration for instant navigation
  - Mobile responsive design
  - Help text when join button not available

- [x] **Session Vault Foundation**
  - Created `/dashboard/video` placeholder page (therapist only)
  - Documented future features: recordings, AI transcription, SOAP notes
  - Access control (patients redirected)
  - Ready for Day 8 implementation

- [x] **UX Consistency Achievement**
  - Patient experience now matches therapist experience exactly
  - Consistent join flow (30-min window, waiting room)
  - Consistent color coding across all pages
  - Consistent button styling and sizing

### Bug Fixes 🐛 ⭐
- [x] **AppointmentModal Button Styling**
  - Save button now clearly defined with explicit blue styling
  - Matches other action buttons throughout app

- [x] **React useCallback Implementation**
  - Wrapped fetch functions in useCallback
  - Added proper useEffect dependencies
  - Prevents stale closures (Gemini code review)

- [x] **Video Session Authorization Fix**
  - Fixed therapist redirect issue
  - Now fetches full user object with relations
  - Checks BOTH role AND ID for security

- [x] **Patient Dashboard Icon Import**
  - Added missing VideoCameraIcon import
  - Fixed ReferenceError crash

- [x] **Critical: Calendar Join Button Routing**
  - Patient calendar was bypassing waiting room
  - Fixed to route through `/dashboard/video-session/[id]`
  - Security flow now consistent everywhere

- [x] **Time Window Standardization**
  - Changed from 15 minutes to 30 minutes everywhere
  - Updated all help text
  - Fixed end time checking logic

---

## ✅ Completed Earlier (Day 6 - Nov 6, 2025)

### Appointment Scheduling System 🗓️ ⭐
- [x] **FullCalendar Integration with Luxon Timezone Support**
  - Installed @fullcalendar/luxon2 and luxon packages
  - Proper Eastern Time display for ALL users globally
  - Handles DST transitions automatically
  - Added "All times shown in Eastern Time (ET)" indicators

- [x] **Complete Calendar System**
  - Therapist calendar at `/dashboard/calendar`
  - Patient calendar at `/dashboard/appointments` (read-only)
  - Day, Week, Month views with 15-minute time slots
  - Color-coded events (Blue=Scheduled, Green=Completed, Gray=Cancelled)
  - 24-hour scheduling support for crisis appointments

- [x] **Appointment CRUD Operations**
  - Create appointments with comprehensive modal
  - Edit appointments (click event to modify)
  - Delete/cancel appointments with status tracking
  - Drag-and-drop rescheduling
  - Real-time calendar updates

- [x] **Appointment Features**
  - Patient selection dropdown (active patients only)
  - 15-minute interval time picker dropdown (replaced scrolling input)
  - Duration options: 30, 45, 60, 90 minutes
  - Appointment types: Initial, Therapy, Medication, Assessment, Crisis, Family
  - Session types: Office, Telehealth, Phone
  - CPT codes: 90791, 90832, 90834, 90837, 90839, 90846, 90847, 90853, 96127
  - Recurring appointments: Daily, Weekly, Monthly (up to 90 days)
  - Google Meet link auto-generation for telehealth
  - Notes field for session-specific information

### Enhanced Patient Payment System 💳 ⭐
- [x] **One-Time Payment Feature**
  - Stripe Elements integration (CardElement)
  - Card entry without saving to Stripe Customer
  - API endpoint: `/api/stripe/one-time-payment`
  - Payment processed securely (PCI compliant)

- [x] **Tabbed Payment Interface**
  - PatientBillingClient wrapper component
  - Two tabs: "Pay with Saved Card" | "One-Time Payment"
  - Seamless switching between payment methods
  - Clean, intuitive UI

- [x] **Prepayment Feature**
  - Allow prepayments up to $500 when balance is $0
  - Creates account credit (negative balance)
  - Balance display adapts:
    - Positive: "Outstanding Balance" (red)
    - Zero: "Current Balance" (green) + prepayment notice
    - Negative: "Account Credit" (green)
  - Button text adapts: "Pay Balance" vs "Prepay $100"

### Critical Bug Fixes (Gemini + User Feedback) 🐛 ⭐
- [x] **Patient Payment Authorization (CRITICAL)**
  - Fixed 403 error preventing patients from paying own bills
  - Updated `/api/stripe/charge` to allow THERAPIST OR PATIENT
  - Proper authorization checks for each role
  - Patients can now successfully pay!

- [x] **Timezone Display Issue (CRITICAL)**
  - Calendar was showing UTC times instead of Eastern
  - Root cause: FullCalendar needs Luxon plugin for named timezones
  - Installed @fullcalendar/luxon2 + luxon packages
  - Now `timeZone="America/New_York"` works correctly
  - Times display accurately for all users globally

- [x] **Server/Client Component Error**
  - Removed `onSuccess` callback (can't pass from Server to Client)
  - Use `router.refresh()` inside Client Component
  - Cleaner code, faster refresh, follows Next.js 13+ patterns

- [x] **Null Assertion Safety**
  - Added null check for `user.therapist` before accessing `.id`
  - Prevents runtime crashes if therapist profile missing
  - More robust error handling

- [x] **Stripe PaymentIntent Error**
  - Set `payment_method_types: ['card']` to avoid redirect methods
  - Fixes "must provide return_url" error
  - Card payments work perfectly

- [x] **Time Picker UX Issue**
  - Replaced native time input with 15-minute dropdown
  - User feedback: "Makes it faster, no scrolling through 60 minutes"
  - Format: "9:00 AM", "9:15 AM", etc.
  - Much better scheduling experience

---

## ✅ Completed Earlier (Day 5 - Nov 4, 2025)

### File Upload System & Document Management 📁 ⭐
- [x] **Google Cloud Storage Integration**
  - Installed @google-cloud/storage package
  - Created lib/gcs.ts helper (upload, delete, signed URLs)
  - HIPAA-compliant signed URLs with 7-day expiration
  - Smart detection: file paths OR JSON service account keys
  - Production-ready with proper error handling

- [x] **File Upload API & Component**
  - Created /api/upload endpoint with authentication and validation
  - Built FileUpload component (drag-and-drop, preview, remove)
  - Supports JPG, PNG, GIF, PDF (max 10MB)
  - Client and server-side validation

- [x] **Form File Uploads (3/3 Forms Complete)**
  - Insurance Information Form: Card front + back uploads
  - Patient Information Form: Government ID uploads (Driver's License/Passport)
  - Parental Consent Form: Legal document uploads with custody status

- [x] **Document Library System**
  - Created /dashboard/patients/[id]/documents page
  - Organized by category (Insurance, Identification, Legal)
  - Image previews with lazy loading
  - Fast PDF viewing (no base64 encoding)
  - Empty state with helpful guidance

- [x] **Bug Fixes & Code Quality**
  - Fixed GCS initialization (absolute path support)
  - Fixed Prisma query to use correct FormStatus enum values
  - Applied functional setState pattern to prevent race conditions
  - Proper React keys using doc.url
  - Removed all fallback/mock code per CLAUDE.md

---

## ✅ Completed Earlier (Days 1-4)

### Day 4 (Nov 1-2, 2025) - Complete Billing & Payment System 💳 ✅
- [x] Created Transaction model in Prisma schema (charge, payment, refund types)
- [x] Added Patient balance tracking (Decimal precision)
- [x] Added Stripe Customer integration
- [x] Created /api/stripe/charge endpoint (therapist charges patient)
- [x] Created /api/stripe/refund endpoint (full/partial refunds)
- [x] Created /api/payments/history endpoint (paginated transaction history)
- [x] Built ChargeCardForm component (therapist UI)
- [x] Built PayBillForm component (patient UI with $500 cap)
- [x] Built PaymentHistoryTable component (shared component)
- [x] Created therapist billing dashboard (/dashboard/billing)
- [x] Created patient billing page (/patient/billing)
- [x] Updated therapist patient detail page with billing section
- [x] Updated patient dashboard with outstanding balance card
- [x] Updated therapist dashboard with outstanding balances card
- [x] Email notifications for transactions (console logging until SendGrid configured)
- [x] Color-coded UI (red for negative balances, green for credits)
- [x] Fixed Decimal serialization issues
- [x] Complete payment flow tested (charge, payment, refund, failures)

### Day 3 (Nov 1, 2025) - Patient Portal & Forms Polish ✅
- [x] Created shared FormSuccessMessage component
- [x] Added success screens to all 6 patient forms
- [x] Progress indicator showing X of 6 forms completed
- [x] "Next Form" button for guided workflow
- [x] Celebration message when all forms complete
- [x] Fixed forms not showing as completed after therapist review
- [x] Added COMPLETED status to isComplete checks
- [x] Full end-to-end workflow validated

---

## 🎯 Immediate Priorities (Day 6 - Nov 5, 2025)

### 1. Appointment Scheduling System 🗓️
**Priority:** HIGH - Core clinical workflow feature
**Estimated Time:** 6-8 hours (full day)

#### Phase 1: Calendar Foundation (2-3 hours)
**Install and Configure FullCalendar:**
```bash
npm install @fullcalendar/core @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
```

**Tasks:**
- [ ] Create `/dashboard/calendar` page
- [ ] Set up FullCalendar with day/week/month views
- [ ] Create Appointment model in Prisma schema
- [ ] Run `npx prisma db push` to update database
- [ ] Style calendar to match app theme

**Files to Create:**
- `app/(dashboard)/dashboard/calendar/page.tsx` - Calendar page (server component)
- `components/AppointmentCalendar.tsx` - Calendar component (client component)
- Update `prisma/schema.prisma` - Add Appointment model

**🚦 STOP & TEST:** Calendar displays, can switch views, no errors

---

#### Phase 2: Create Appointments (2-3 hours)
**Appointment Creation Modal:**

**Tasks:**
- [ ] Create "New Appointment" button on calendar
- [ ] Build AppointmentModal component
- [ ] Patient selection dropdown (active patients only)
- [ ] Date/time picker integration
- [ ] Duration selector (30/45/60/90 minutes)
- [ ] Appointment type dropdown (Initial, Follow-up, Assessment, etc.)
- [ ] CPT code selector (90791, 90834, 90837, 90846, 90847, etc.)
- [ ] Notes textarea
- [ ] Create API endpoint: `/api/appointments` (POST)
- [ ] Validate appointment doesn't conflict with existing appointments

**Files to Create:**
- `components/AppointmentModal.tsx` - Create/edit appointment form
- `app/api/appointments/route.ts` - Create appointment endpoint
- `lib/appointment-utils.ts` - Conflict detection, CPT codes list

**🚦 STOP & TEST:** Can create appointment, appears on calendar, saves to database

---

#### Phase 3: View & Edit Appointments (1-2 hours)
**Appointment Management:**

**Tasks:**
- [ ] Click appointment to view details
- [ ] Edit appointment (all fields)
- [ ] Update API endpoint: `/api/appointments/[id]` (PATCH)
- [ ] Delete/cancel appointment with confirmation
- [ ] Status field (Scheduled, Completed, No-Show, Cancelled)
- [ ] Display patient name and appointment type on calendar event
- [ ] Color-code by appointment type or status

**Files to Update:**
- `components/AppointmentModal.tsx` - Add edit mode
- `app/api/appointments/[id]/route.ts` - Update/delete endpoints

**🚦 STOP & TEST:** Can edit appointments, changes reflect on calendar, can cancel

---

#### Phase 4: Drag-and-Drop Rescheduling (30-60 min)
**Enhanced UX:**

**Tasks:**
- [ ] Enable FullCalendar drag-and-drop
- [ ] Update appointment time on drop
- [ ] Validate no conflicts on drop
- [ ] Show loading state during update
- [ ] Error handling if reschedule fails

**Files to Update:**
- `components/AppointmentCalendar.tsx` - Add drag handlers

**🚦 STOP & TEST:** Can drag appointments to new times, conflicts prevented

---

### 2. Patient Dashboard Improvements 📊
**Priority:** MEDIUM - Enhanced patient experience
**Estimated Time:** 1-2 hours

**Tasks:**
- [ ] Show upcoming appointments widget (next 5)
- [ ] Display form completion count (X of 7 complete)
- [ ] Add "Recent Activity" feed (last 10 actions)
- [ ] Link to completed forms (read-only view)
- [ ] Show latest payment/balance if applicable

**Files to Update:**
- `app/(dashboard)/dashboard/patient/page.tsx` - Add widgets

**🚦 STOP & TEST:** Patient sees appointments, form count, activity feed

---

## ✅ Completed (Days 1-2)

### Day 1 (Oct 30, 2025)
- [x] GCP infrastructure setup (Cloud SQL, Cloud Storage, IAM)
- [x] Prisma schema with 18 tables
- [x] Next.js 16.0.1 application initialized
- [x] All dependencies installed
- [x] Environment configuration complete
- [x] Development server running

### Day 2 (Oct 31, 2025)
- [x] NextAuth.js authentication configured
- [x] Therapist login page
- [x] Dashboard with real-time statistics
- [x] Patient management (list, create, view, edit)
- [x] All 7 intake forms created and working
- [x] Forms pre-population logic
- [x] Form submission tracking (DRAFT → SUBMITTED → COMPLETED)
- [x] Universal form review component
- [x] Pending Forms dashboard card
- [x] Dedicated pending forms review page
- [x] Complete workflow (therapist can review and complete forms)
- [x] Fixed multiple bugs (async params, FK constraints, hydration)

### Day 3 (Nov 1, 2025)
- [x] Patient portal login and access working
- [x] Form success messages with progress indicators
- [x] Next form navigation for guided patient workflow
- [x] Fixed form completion status display bug
- [x] Full end-to-end patient forms workflow tested and working
- [x] Forms show proper completion status across all views

---

## 📋 Backlog - Week 2

### Appointment Scheduling System
- [ ] **FullCalendar integration**
  - [ ] Install FullCalendar packages
  - [ ] Create calendar page component
  - [ ] Day/week/month view switching
  - [ ] Click to create appointment
  - [ ] Drag-and-drop rescheduling

- [ ] **Appointment management**
  - [ ] Create appointment form
  - [ ] Select patient from dropdown
  - [ ] Set date, time, duration
  - [ ] Choose appointment type (initial, therapy, assessment)
  - [ ] Select CPT code
  - [ ] Add notes

- [ ] **Appointment workflow**
  - [ ] View appointment details
  - [ ] Edit appointment
  - [ ] Cancel appointment (with reason)
  - [ ] Mark as completed
  - [ ] No-show tracking
  - [ ] Appointment history

- [ ] **Reminders & notifications**
  - [ ] Google Calendar sync (two-way)
  - [ ] Email reminders (Gmail API)
  - [ ] SMS reminders (Twilio) - optional
  - [ ] Configurable reminder timing (24h, 1h before)

### Clinical Documentation
- [ ] **Clinical note templates**
  - [ ] SOAP note format (Subjective, Objective, Assessment, Plan)
  - [ ] Progress note template
  - [ ] Initial consultation note
  - [ ] Termination summary note

- [ ] **Diagnosis & coding**
  - [ ] ICD-10 code lookup and search
  - [ ] Add diagnoses to session notes
  - [ ] CPT code assignment (90791, 90834, 90837, etc.)
  - [ ] Modifiers for telehealth (95)

- [ ] **Note management**
  - [ ] Create note for appointment
  - [ ] Edit draft notes
  - [ ] Sign and lock notes
  - [ ] View note history
  - [ ] Print notes to PDF
  - [ ] Search notes by content

### Document Management
- [ ] **Upload documents**
  - [ ] Upload to Cloud Storage
  - [ ] Document categories (intake, insurance, clinical, billing)
  - [ ] File type validation (PDF, JPG, PNG)
  - [ ] Size limits (10MB max)

- [ ] **Document viewing**
  - [ ] List all documents for patient
  - [ ] Preview documents in browser
  - [ ] Download documents
  - [ ] Delete documents (with audit log)

- [ ] **E-signatures**
  - [ ] Signature pad component
  - [ ] Sign consent forms
  - [ ] Sign treatment plans
  - [ ] Store signature with timestamp

---

## 📋 Backlog - Week 3

### Insurance & Billing (Office Ally Integration)
- [ ] **EDI 837 (Claims Submission)**
  - [ ] Create claim from completed appointment
  - [ ] Generate EDI 837 file
  - [ ] Submit to Office Ally API
  - [ ] Store claim number and status

- [ ] **EDI 835 (Payment Posting)**
  - [ ] Receive ERA (835) responses
  - [ ] Parse payment information
  - [ ] Post payments to patient accounts
  - [ ] Handle adjustments and denials

- [ ] **EDI 270/271 (Eligibility Verification)**
  - [ ] Check insurance eligibility before appointment
  - [ ] Display coverage details
  - [ ] Store verification results
  - [ ] Alert if eligibility issues

- [ ] **Claim management**
  - [ ] View all claims (pending, paid, denied)
  - [ ] Resubmit denied claims
  - [ ] Add denial notes
  - [ ] Claim aging report
  - [ ] Revenue cycle dashboard

### Video Sessions (WebRTC)
- [ ] **Video room setup**
  - [ ] Create unique room for each appointment
  - [ ] Generate secure room URLs
  - [ ] Send room link to patient

- [ ] **Video functionality**
  - [ ] Therapist joins room
  - [ ] Patient joins room
  - [ ] Audio/video controls (mute, camera off)
  - [ ] Screen sharing
  - [ ] Chat during session

- [ ] **Session recording (optional)**
  - [ ] Request recording consent
  - [ ] Start/stop recording
  - [ ] Store recording in Cloud Storage
  - [ ] Playback recordings

- [ ] **Session quality**
  - [ ] Network quality monitoring
  - [ ] Fallback to audio-only if video fails
  - [ ] Connection status indicators
  - [ ] Auto-reconnect on disconnect

### Payment Processing (Stripe)
- [ ] **Payment methods**
  - [ ] View saved payment methods (last 4 digits only)
  - [ ] Add new payment method
  - [ ] Update payment method
  - [ ] Remove payment method
  - [ ] Set default payment method

- [ ] **Process payments**
  - [ ] Charge co-pay at time of service
  - [ ] Charge patient responsibility after insurance
  - [ ] Process payment plans
  - [ ] Handle failed payments

- [ ] **Payment history**
  - [ ] View all payments for patient
  - [ ] Filter by date, status
  - [ ] Export to CSV/PDF
  - [ ] Send receipt via email

- [ ] **Refunds**
  - [ ] Initiate refund
  - [ ] Partial or full refund
  - [ ] Track refund status
  - [ ] Update patient balance

---

## 📋 Backlog - Week 4

### Reports & Analytics
- [ ] **Patient reports**
  - [ ] Patient demographics report
  - [ ] New patients by month
  - [ ] Patient status breakdown
  - [ ] Referral source tracking

- [ ] **Clinical reports**
  - [ ] Diagnosis distribution (ICD-10)
  - [ ] Service utilization (CPT codes)
  - [ ] Session duration averages
  - [ ] Treatment plan progress

- [ ] **Financial reports**
  - [ ] Revenue by month/quarter/year
  - [ ] Collections report
  - [ ] Outstanding balances
  - [ ] Payer mix analysis

- [ ] **Operational reports**
  - [ ] Appointment no-show rate
  - [ ] Cancellation rate
  - [ ] Average wait time
  - [ ] Calendar utilization

### Security & Compliance
- [ ] **Security audit**
  - [ ] Penetration testing
  - [ ] Vulnerability scanning
  - [ ] Code security review
  - [ ] Dependency audit

- [ ] **HIPAA compliance**
  - [ ] Final compliance review
  - [ ] Risk assessment documentation
  - [ ] Policies and procedures
  - [ ] Privacy policy
  - [ ] Terms of service
  - [ ] BAA review (GCP, Stripe, Office Ally)

- [ ] **Incident response**
  - [ ] Incident response plan
  - [ ] Breach notification procedures
  - [ ] Data backup testing
  - [ ] Disaster recovery testing

### Production Deployment
- [ ] **Cloud Run setup**
  - [ ] Build Docker container
  - [ ] Configure Cloud Run service
  - [ ] Environment variables in Secret Manager
  - [ ] Database migration to production
  - [ ] SSL certificate setup

- [ ] **Domain & DNS**
  - [ ] Custom domain (RussellMentalHealth.com)
  - [ ] DNS configuration
  - [ ] SSL certificate
  - [ ] Email forwarding

- [ ] **Monitoring & alerts**
  - [ ] Set up Cloud Monitoring
  - [ ] Error alerting (email/SMS)
  - [ ] Uptime monitoring
  - [ ] Performance monitoring
  - [ ] Database monitoring

- [ ] **Go-live preparation**
  - [ ] User acceptance testing
  - [ ] Staff training
  - [ ] Patient communication
  - [ ] Create video tutorials
  - [ ] Support documentation
  - [ ] Soft launch (limited patients)
  - [ ] Full launch
  - [ ] Post-launch monitoring

---

## 🔮 Future Enhancements (Version 2.0+)

### Advanced Features
- [ ] Cryptocurrency payment support (Coinbase Commerce)
- [ ] Multi-provider support (multiple therapists)
- [ ] Multi-location support
- [ ] Mobile app (React Native)
- [ ] AI-assisted clinical note generation
- [ ] Automated treatment plan suggestions
- [ ] Outcome measurement tracking
- [ ] Group therapy session management
- [ ] Sliding scale fee calculator
- [ ] Waitlist automation with priority scoring

### Specialized Assessments
- [ ] Autism Spectrum Disorder (ASD) evaluation forms
- [ ] Immigration psychological evaluation templates
- [ ] ADHD assessment battery
- [ ] Depression screening (PHQ-9)
- [ ] Anxiety screening (GAD-7)
- [ ] Trauma screening (PCL-5)
- [ ] Substance use assessment (AUDIT, DAST)
- [ ] Cognitive assessment tools
- [ ] Automated scoring and interpretation

### Business Intelligence
- [ ] Advanced analytics dashboard
- [ ] Predictive analytics (no-show prediction)
- [ ] Revenue forecasting
- [ ] Patient retention analysis
- [ ] Marketing ROI tracking
- [ ] Referral source effectiveness
- [ ] Payer performance comparison
- [ ] Benchmarking against industry standards

### SaaS Platform (Long-term Vision)
- [ ] Multi-tenant architecture
- [ ] Tenant onboarding workflow
- [ ] Subscription management (Stripe Billing)
- [ ] Usage-based pricing tiers
- [ ] White-label options
- [ ] Public API for integrations
- [ ] Marketplace for add-ons
- [ ] Partner program
- [ ] Affiliate system

---

## 🐛 Known Issues

### Current Issues
- None reported - Day 2 ended with clean slate! ✅

### Fixed Issues (Historical)
- [x] Edit patient showing wrong data (fixed Day 2 - controlled components)
- [x] Form save failures due to undefined patientId (fixed Day 2 - async params)
- [x] Foreign key constraint on reviewedBy (fixed Day 2 - use User ID)
- [x] React hydration warnings on dates (fixed Day 2 - suppressHydrationWarning)
- [x] 404 on form review pages (fixed Day 2 - universal component)

---

## 📝 Notes for Next Session (Day 8 - Nov 7, 2025)

### What's Working Perfectly:
- ✅ Complete appointment scheduling system (FullCalendar + Luxon)
- ✅ Patient & therapist UX fully consistent
- ✅ Today's Schedule on both dashboards
- ✅ Video session waiting room operational
- ✅ Large prominent join buttons everywhere
- ✅ 30-minute join window standardized
- ✅ Color-coded appointments (green/blue/gray)
- ✅ Mobile responsive design throughout
- ✅ Security: patients only see own data
- ✅ HIPAA-compliant authorization (role + ID)
- ✅ All calendar features tested and validated
- ✅ Session Vault foundation documented

### Focus for Day 8 (Nov 7, 2025): 🎬⭐

**Priority 1: Video Session Recording (WebRTC)**
- [ ] Install simple-peer and socket.io packages
- [ ] Implement MediaRecorder API for recording
- [ ] Record both therapist and patient streams
- [ ] Save recordings to Google Cloud Storage
- [ ] Set 30-day automatic deletion (HIPAA retention)
- [ ] Recording controls (start/stop) for therapist
- [ ] Privacy: recording consent flow
- [ ] Visual indicator when recording (red dot)
- [ ] Link recordings to appointments in database

**Priority 2: Gemini AI Integration**
- [ ] Set up Gemini API authentication
- [ ] Auto-transcribe recorded sessions
- [ ] Generate SOAP notes from transcripts
- [ ] Extract key themes and topics
- [ ] Treatment plan suggestions
- [ ] Session summary generation
- [ ] Therapist review and edit interface

**Priority 3: Session Vault UI**
- [ ] Replace `/dashboard/video` placeholder with real UI
- [ ] Sessions list table (date, patient, duration, recording status)
- [ ] Filter by patient, date range, recording status
- [ ] Search functionality
- [ ] Session detail modal
- [ ] Video player component (HTML5 with controls)
- [ ] Transcript viewer with timestamps
- [ ] SOAP notes editor
- [ ] Export to PDF

### Development Philosophy:
- ✅ Build → Test → Iterate at logical checkpoints
- ✅ Test recording with 30-second clips first
- ✅ HIPAA compliance: encrypt at rest and in transit
- ✅ Privacy first: explicit consent required
- ✅ Error handling: recording can fail, handle gracefully
- ✅ All code production-ready from day 1

### Required Setup for Day 8:
```bash
# Install WebRTC and AI packages
npm install simple-peer socket.io socket.io-client
npm install @google-ai/generativelanguage

# Enable GCP APIs
# - Gemini API
# - Cloud Speech-to-Text (optional)

# Add environment variables
GEMINI_API_KEY=your_gemini_api_key
```

### Server Startup Commands:
```bash
# Terminal 1 - Cloud SQL Proxy
./cloud-sql-proxy therapyconnect-brrphd:us-east1:rmh-db

# Terminal 2 - Dev Server
cd russell-mental-health && npm run dev

# Optional - Database Browser
npx prisma studio
```

### Test Credentials:
**Therapist:**
- Email: drbethany@russellmentalhealth.com
- Password: (set during Day 1)

**Patient:**
- Check Prisma Studio for existing patients
- Or create new patient via therapist dashboard

---

**Last Updated:** November 6, 2025 (End of Day 7)
**Next Session:** November 7, 2025 (Day 8)
**Current Branch:** `claude/resume-code-execution-011CUqQDV9KYqCM9M9Qf8jB9`
**Status:** ✅ Patient UX & Video Foundation COMPLETE - Ready for Video Recording & AI 🎬⭐
