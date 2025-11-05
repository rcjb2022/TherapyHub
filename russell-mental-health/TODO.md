# Russell Mental Health Platform - TODO List

**Version:** 0.5.0
**Last Updated:** November 4, 2025 (Day 5 - Complete)
**Status:** File Upload System COMPLETE ✅ - Ready for Appointment Scheduling 🚀

---

## ✅ Completed Today (Day 5 - Nov 4, 2025)

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

## 📝 Notes for Next Session (Day 6 - Nov 5, 2025)

### What's Working Perfectly:
- ✅ Authentication & session management (therapist + patient)
- ✅ Dashboard with real-time stats
- ✅ Patient CRUD operations
- ✅ All 7 intake forms working with file uploads
- ✅ Forms pre-populate and save correctly
- ✅ Form success messages with progress tracking
- ✅ Universal review component (therapist side)
- ✅ Pending forms workflow complete
- ✅ Status tracking (DRAFT → SUBMITTED → COMPLETED)
- ✅ Complete billing & payment system (Stripe integration)
- ✅ File upload system (Google Cloud Storage)
- ✅ Document library with organized categories
- ✅ HIPAA-compliant signed URLs for documents
- ✅ Full end-to-end workflow tested and validated

### Focus for Day 6 (Nov 5, 2025):
1. **Appointment Scheduling System** - FullCalendar integration (4 phases)
   - Phase 1: Calendar foundation with day/week/month views
   - Phase 2: Create appointments with patient selection, CPT codes
   - Phase 3: View/edit/cancel appointments
   - Phase 4: Drag-and-drop rescheduling
2. **Patient Dashboard Improvements** - Appointments widget, form completion count
3. **Build-Test-Iterate** - Test at each checkpoint before continuing

### Development Philosophy:
- ✅ No mock data or placeholders ever (CLAUDE.md principle)
- ✅ Build → Test → Iterate at logical checkpoints
- ✅ Fix issues immediately before moving on
- ✅ All code production-ready from day 1

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

**Stripe Test Cards:**
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- Insufficient Funds: 4000 0000 0000 9995

---

**Last Updated:** November 4, 2025 (End of Day 5)
**Next Session:** November 5, 2025 (Day 6)
**Current Branch:** `claude/finish-interrupted-work-011CUoiaquueU6CvhophKZ8i`
**Status:** ✅ File Upload System COMPLETE - Ready for Appointment Scheduling 🚀
