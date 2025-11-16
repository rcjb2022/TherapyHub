# Russell Mental Health Platform - TODO List

**Version:** 0.10.0
**Last Updated:** November 16, 2025 (Day 10 - Complete)
**Status:** Security Hardening COMPLETE ✅ - Ready for Final Testing 🎯

---

## ✅ Completed Today (Day 10 - Nov 16, 2025)

### Security Hardening & Production Polish 🔐 ⭐
- [x] **Critical Security Fixes**
  - Fixed secret key exposure (moved GCS operations server-side)
  - Created `/api/session-documents/[documentId]/content` endpoint
  - All service account credentials now server-side only
  - Verified no secrets visible in DevTools

- [x] **Tiered Signed URL Expiration**
  - PHI_CRITICAL: 1 hour (recordings, transcripts, clinical notes)
  - PHI_MODERATE: 24 hours (default for unspecified documents)
  - PHI_LOW: 7 days (insurance cards, government IDs)
  - Implemented `getExpirationTime()` function in `lib/gcs.ts`

- [x] **Expired Signed URL Fix (CRITICAL)**
  - Root cause: Storing signed URLs in database (expire after 7 days)
  - Solution: Store GCS paths permanently, generate fresh URLs on page load
  - Modified `uploadToGCS()` to return both `signedUrl` and `gcsPath`
  - Updated `FileUpload` component to store gcsPath
  - Updated documents page to generate fresh URLs from stored paths
  - Backward compatible with old signed URLs

- [x] **Comprehensive RBAC Implementation**
  - Phase 1.3: Patient detail endpoints (`/api/patients/[id]`)
    - PATIENT: Can only access own data
    - THERAPIST: Can access only assigned patients
    - ADMIN: Can access all patients
  - Phase 1.4: Patient list/create (`/api/patients`)
    - Patients cannot list other patients
    - Therapists see only their patients
    - Admins see all patients
  - Phase 1.5: Therapist endpoint (`/api/therapists`)
    - Patients see only assigned therapist
    - Therapists/admins see all therapists
  - Phase 1.6: Upload endpoint (`/api/upload`)
    - Patients can only upload for themselves
    - Therapists can only upload for their patients
    - Audit logging with IP/user agent

- [x] **Role-Based Session Timeouts**
  - PATIENT: 60 minutes (covers full therapy session)
  - THERAPIST: 8 hours (full work day)
  - ADMIN: 4 hours (moderate security)
  - Warning modal 5 minutes before expiration
  - "Stay Logged In" button extends session
  - Auto-logout at expiration
  - SessionMonitor component created
  - SessionWarningModal component created

### Critical Bug Fixes (Day 10) 🐛 ⭐
- [x] Fixed secret key exposure in client components
- [x] Fixed expired signed URL issue (store GCS paths, not URLs)
- [x] Fixed missing authorization on patient API endpoints
- [x] Fixed missing authorization on therapist API endpoint
- [x] Fixed missing authorization on upload API endpoint
- [x] Fixed Prisma audit log field names (resource/resourceId)
- [x] Fixed Next.js 15 params handling in document viewer
- [x] Fixed generateFreshUrl logic error (was returning old URL)

### Documentation & Handoff 📝 ⭐
- [x] **End-of-Day Documentation Created**
  - DAY_10_COMPLETE.md (comprehensive day summary)
  - Updated TODO.md (this file)
  - Updated ABOUT.md with v0.10.0
  - HANDOFF_DAY_11.md (session handoff)
  - TOMORROW_PROMPTS_DAY_11.md (detailed prompts)
  - All following CLAUDE.md format and style

### Commits Made 🔄
- [x] "Add @headlessui/react dependency for session timeout modal"
- [x] "Implement role-based session timeouts with warning modal"
- [x] "Phase 1.6: Add comprehensive RBAC to /api/upload route"
- [x] "Phase 1.5: Add RBAC to /api/therapists route"
- [x] "Phase 1.4: Add comprehensive RBAC to /api/patients route"
- [x] "Fix: Extract filename from old signed URLs before generating fresh URLs"
- [x] "CRITICAL: Fix expired signed URL issue - store GCS paths, generate fresh URLs"
- [x] "CRITICAL: Fix missing authorization on patient API"
- [x] "Implement tiered signed URL expiration policy (1h/24h/7d)"

---

## ✅ Completed Earlier (Day 9 - Nov 10, 2025)

### AI-Powered Session Analysis & Document Management 🤖 ⭐
- [x] **AI Clinical Notes Generation**
  - SOAP, DAP, and BIRP format support
  - Gemini AI integration with speaker diarization
  - Session date preservation (not generation date)
  - Type-safe format handling
  - Enhanced prompts to avoid template text

- [x] **Summary Generation & Translation**
  - Clinical-style summary generation
  - 7-language translation (Spanish, Portuguese, French, German, Italian, Japanese, Chinese)
  - Prevents duplicate translations
  - Markdown code block stripping fix
  - Translation modal UI with language selector

- [x] **Session Vault UI Enhancement**
  - Document type filtering
  - Color-coded document badges
  - Copy-to-clipboard functionality for all types
  - Plain text document handling
  - Professional mobile-responsive design

- [x] **30-Day Deletion & Cleanup System**
  - HIPAA compliance: 30-day video retention
  - 7-year clinical document retention (FL Statute 456.057)
  - Automatic expiration tracking
  - Cleanup API endpoint with GCS integration
  - Audit logging for deletions

### Critical Bug Fixes (Day 9) 🐛 ⭐
- [x] Fixed translation JSON parsing error (Gemini markdown wrapping)
- [x] Fixed translation UI visibility issue
- [x] Fixed clinical notes copy bug (showing "undefined")
- [x] Fixed session date vs generation date bug
- [x] Fixed summary display JSON parse error
- [x] Fixed "View Session Vault" 404 error
- [x] Fixed translation API "bucket is not defined" error

### Documentation & Handoff 📝 ⭐
- [x] **End-of-Day Documentation Created**
  - DAY_9_COMPLETE.md (comprehensive day summary)
  - DAY_10_DEVELOPMENT_PLAN.md (testing & polish strategy)
  - HANDOFF_DAY_10.md (session handoff)
  - TOMORROW_PROMPTS_DAY_10.md (detailed prompts)
  - All following CLAUDE.md format and style

### Commits Made 🔄
- [x] "Add Day 9 wrap-up documentation and Day 10 planning"
- [x] "Add DAY_9_COMPLETE.md from previous session"

---

## ✅ Completed Earlier (Day 8 - Nov 7, 2025)

### WebRTC Video Session Integration 🎥 ⭐
- [x] **Fixed WebRTC Connection Issues**
  - Eliminated duplicate signaling (was 13 offers per connection)
  - Fixed "InvalidStateError: Called in wrong state: stable"
  - Prevented multiple room joins with hasJoinedRoomRef
  - Added peer existence checks before creating connections
  - Fixed camera staying on after session end
  - Clean single offer/answer exchange per connection

- [x] **State Management Improvements**
  - Changed participantsMap to participantsMapRef for persistence
  - Fixed "Unknown User" display after re-renders
  - Proper cleanup: removeAllListeners before destroy
  - Eliminated React warnings about state updates on unmounted components

- [x] **WebRTC Session Integration**
  - Created WebRTCSession.tsx wrapper component (294 lines)
  - Integrated with existing appointment system
  - Updated VideoSessionClient to use WebRTC as primary
  - Passes userId, userName for peer identification
  - Uses appointment.id as room ID (enables future recording linkage)

- [x] **Google Meet Fallback Preserved**
  - Google Meet displayed as fallback option
  - "Having connection issues? Switch to Google Meet" overlay
  - All existing Google Meet links still functional
  - Seamless fallback for network issues

- [x] **End Session Functionality**
  - Added End Session button with confirmation modal
  - Stops all media tracks (camera turns off)
  - Destroys all peer connections properly
  - Emits leave-room event to server
  - Returns to dashboard on confirmation

- [x] **UI/UX Enhancements**
  - Updated AppointmentDetailsModal to show WebRTC + fallback
  - Recording notice: "Sessions are recorded for your records"
  - Google Meet backup link with copy button
  - Session details sidebar with appointment info
  - Connection status indicators (connecting, connected, error)

- [x] **Type Safety & Bug Fixes**
  - Installed @types/simple-peer for TypeScript
  - Fixed video-test page socket cleanup
  - Comprehensive error handling with try-catch blocks
  - Fixed resource cleanup order (prevent memory leaks)

- [x] **Testing & Validation**
  - Two-tab testing: clean logs, no duplicate signaling
  - Camera properly stops after session end
  - No React warnings in console
  - Peer connections established reliably
  - Authorization checks working (role + ID verification)

### Documentation & Handoff 📝 ⭐
- [x] **End-of-Day Documentation Created**
  - DAY_8_COMPLETE.md (comprehensive day summary)
  - HANDOFF_DAY_8.md (session handoff for Day 9)
  - TOMORROW_PROMPTS_DAY_9.md (detailed 8-phase workflow)
  - All following CLAUDE.md format and style

### Commits Made 🔄
- [x] "Integrate WebRTC video sessions with Google Meet fallback"
- [x] "Add End Session button and fix Gemini code review feedback"
- [x] "Fix WebRTC connection issues: duplicate signaling and race conditions"
- [x] "Phase 2: WebRTC peer-to-peer video connection"

---

## ✅ Completed Earlier (Day 7 - Nov 6, 2025)

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

## 📝 Notes for Next Session (Day 11 - Nov 17, 2025)

### What's Working Perfectly:
- ✅ Complete appointment scheduling system (FullCalendar + Luxon)
- ✅ Patient & therapist UX fully consistent
- ✅ Today's Schedule on both dashboards
- ✅ **WebRTC peer-to-peer video sessions operational** 🎥
- ✅ **Video recording with MediaRecorder API** 🎥
- ✅ **AI transcription with Gemini** 🤖
- ✅ **Clinical notes generation (SOAP/DAP/BIRP)** 🤖
- ✅ **7-language translation support** 🌍
- ✅ **Session Vault document management** 📚
- ✅ **30-day automatic deletion (HIPAA compliance)** 🗑️
- ✅ **Comprehensive RBAC on all API endpoints** 🛡️
- ✅ **Tiered signed URL expiration (1h/24h/7d)** 🔒
- ✅ **GCS path storage for long-term access** 📁
- ✅ **Role-based session timeouts (PATIENT: 60min, THERAPIST: 8hrs, ADMIN: 4hrs)** ⏰
- ✅ **Session timeout warning modal with extend capability** ⏰
- ✅ Security: patients only see own data
- ✅ HIPAA-compliant authorization (role + ID)
- ✅ All service account credentials server-side only

### Focus for Day 11 (Nov 17, 2025): 🎯⭐

**Goal: Final Testing & Production Readiness (v0.10.0 → v1.0.0)**

**Priority 1: Session Timeout Testing (1 hour)** ⏰
- [ ] Test session timeout warning modal
  - Option A: Wait for actual timeout (60 min for patient, 8 hrs for therapist)
  - Option B: Temporarily reduce timeout constants for testing
- [ ] Verify "Stay Logged In" button works
- [ ] Verify auto-logout at expiration
- [ ] Test different session durations for PATIENT/THERAPIST/ADMIN
- [ ] Verify countdown timer accuracy
- [ ] Test session refresh mechanism

**Priority 2: Complete Security Audit (2-3 hours)** 🔐
- [ ] Review all remaining API endpoints for RBAC
- [ ] Check for any remaining client-side GCS operations
- [ ] Verify all PHI access is audit logged
- [ ] Test authorization bypasses (try to access other users' data)
- [ ] Review all Prisma queries for proper filtering
- [ ] Verify session timeout enforcement
- [ ] Check for XSS vulnerabilities
- [ ] Review input validation (Zod schemas)

**Priority 3: Comprehensive End-to-End Testing (3-4 hours)** 🧪
- [ ] Patient onboarding workflow (all 7 forms)
- [ ] Appointment scheduling (create, edit, drag-drop, delete)
- [ ] Video session with recording (2-user test)
- [ ] AI processing pipeline (transcript → notes → summary → translation)
- [ ] Session Vault document management
- [ ] Document uploads (insurance cards, IDs)
- [ ] Billing workflows (charge, payment, refund)
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Mobile responsiveness (iOS, Android)
- [ ] Authorization testing (patients can't access others' data)

**Priority 4: UI/UX Polish (2-3 hours)** ✨
- [ ] Loading states (skeletons for all async operations)
- [ ] Error messages (user-friendly, actionable)
- [ ] Success feedback (toast notifications or better)
- [ ] Help text (tooltips for complex features)
- [ ] Empty states (helpful guidance when no data)
- [ ] Form validation messages (clear, specific)
- [ ] Mobile touch optimizations
- [ ] Consistent button styling throughout
- [ ] Consistent spacing and layout

**Priority 5: Performance Optimization (1-2 hours)** ⚡
- [ ] Lighthouse audit (target >90 on all pages)
- [ ] Core Web Vitals measurement (LCP, FID, CLS)
- [ ] Database query optimization (indexes, select fields)
- [ ] API response time testing (<200ms for non-AI)
- [ ] Frontend bundle size analysis
- [ ] Lazy loading implementation
- [ ] Image optimization

**Priority 6: Bug Fixes & Edge Cases (1-2 hours)** 🐛
- [ ] Empty state handling
- [ ] Very long text handling
- [ ] Special characters in inputs
- [ ] Duplicate submission prevention
- [ ] Network failure scenarios
- [ ] Session expiration during forms
- [ ] File upload failures
- [ ] AI processing failures

**Priority 7: Documentation (1-2 hours)** 📝
- [ ] In-app help text (tooltips, field descriptions)
- [ ] Therapist quick start guide
- [ ] Patient quick start guide
- [ ] Video session guide (troubleshooting)
- [ ] Session timeout behavior documentation
- [ ] Security features documentation
- [ ] Update README.md with v0.10.0 features
- [ ] Update README_QR.md with current status

### Success Criteria for v0.10.0:
- ✅ All security features tested and working
- ✅ Session timeout fully validated
- ✅ No critical bugs
- ✅ All RBAC enforcement verified
- ✅ UI professional and polished
- ✅ Documentation updated
- ✅ Ready for v1.0.0 planning

### What Needs Testing (High Priority):
- [ ] **Session timeout warning modal** (not fully tested yet due to time constraints)
- [ ] **"Stay Logged In" functionality**
- [ ] **Auto-logout at session expiration**
- [ ] **Different session durations for roles**
- [ ] Cross-browser testing (Safari, Firefox)
- [ ] Mobile testing (iOS, Android)

### Development Philosophy:
- ✅ Test systematically (use checklists)
- ✅ Think like a user (intuitive, helpful)
- ✅ Security first (verify authorization everywhere)
- ✅ Performance matters (fast, responsive)
- ✅ Polish separates good from great software
- ✅ Listen to user feedback carefully
- ✅ Investigate thoroughly before assuming

### Server Startup Commands:
```bash
# Terminal 1 - Cloud SQL Proxy
cd /home/user/TherapyHub/russell-mental-health
./cloud-sql-proxy therapyconnect-brrphd:us-east1:rmh-db

# Terminal 2 - Dev Server
npm run dev

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

**Last Updated:** November 16, 2025 (End of Day 10)
**Next Session:** November 17, 2025 (Day 11)
**Current Branch:** `main` (merged from `claude/day-10-production-polish-01V2ZH4fvsvhHwdrQ4V49AaU`)
**Status:** ✅ Security Hardening COMPLETE - Ready for Final Testing 🎯⭐
