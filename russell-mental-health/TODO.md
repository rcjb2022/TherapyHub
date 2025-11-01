# Russell Mental Health Platform - TODO List

**Version:** 0.4.0
**Last Updated:** November 1, 2025 (Day 4 - In Progress)
**Status:** Billing & Payment System IN PROGRESS 🟡 (36% complete - 5/14 tasks done)

---

## ✅ Completed Today (Day 4 - Nov 1, 2025)

### Complete Billing & Payment System 💳 (5/14 tasks complete)
- [x] Created Transaction model in Prisma schema
  - All amounts stored as positive numbers
  - Type field: "charge", "payment", "refund"
  - Refund tracking with relations
  - Full audit trail
- [x] Added Patient balance tracking (Decimal field)
- [x] Added Stripe Customer integration (stripeCustomerId field)
- [x] Created /api/stripe/charge endpoint (therapist charges patient)
- [x] Created /api/stripe/refund endpoint (therapist refunds charges)
- [x] Built ChargeCardForm component (therapist UI)
- [x] Updated therapist patient detail page with billing section
- [x] Fixed Decimal serialization issues
- [x] Tested charge functionality - WORKING ✅

---

## ✅ Completed Earlier (Day 3 - Nov 1, 2025)

### Patient Forms Success Messages ✅
- [x] Created shared FormSuccessMessage component
- [x] Added success screens to all 6 patient forms
- [x] Progress indicator showing X of 6 forms completed
- [x] "Next Form" button for guided workflow
- [x] Celebration message when all forms complete
- [x] Applied to: Patient Information, Medical History, Mental Health History, Insurance, HIPAA, Payment

### Form Status Display Bug Fix ✅
- [x] Fixed forms not showing as completed after therapist review
- [x] Added COMPLETED status to isComplete checks
- [x] Updated API routes to set completedAt for COMPLETED status
- [x] Forms now display green checkmark and "Completed" badge correctly

### Tested & Working ✅
- [x] Patient can log in
- [x] Patient sees their pending forms
- [x] Patient can fill out and submit forms
- [x] Success message displays with progress bar
- [x] Forms appear as SUBMITTED for therapist
- [x] Therapist can review and complete forms
- [x] Forms show as completed on patient forms page
- [x] Full end-to-end workflow validated

---

## 🎯 Immediate Priorities (Continue Day 4 - Nov 1)

### 1. Complete Billing System (9 remaining tasks) 💳
**Priority:** HIGH - Core feature for practice revenue

**Backend:**
- [ ] **Create /api/payments/history endpoint**
  - GET endpoint with pagination
  - Access control (therapist sees all, patient sees only their own)
  - Returns transaction history sorted by date

**Shared Components:**
- [ ] **Build PaymentHistoryTable component**
  - Works for both patient and therapist views
  - Shows: Date, Type, Amount, Card, Status, Running Balance
  - Color-coded rows (charges red, payments green, refunds yellow)
  - Refund button for therapists
  - Retry button for failed charges

**Patient-Side:**
- [ ] **Build PayBillForm component**
  - Patient pays their outstanding balance
  - Max payment: Math.max(balance, $500)
  - Validation and error handling

- [ ] **Update patient dashboard card**
  - Show outstanding balance
  - Link to patient billing page

- [ ] **Create patient billing page**
  - Route: /patient/billing
  - PayBillForm + PaymentHistoryTable

**Therapist-Side:**
- [ ] **Create therapist billing page**
  - Route: /dashboard/billing
  - See all patients with balances
  - Quick charge functionality
  - All payment history across patients

- [ ] **Update therapist dashboard card**
  - Show total outstanding balances
  - Count of patients with balances
  - Link to billing page

**Additional:**
- [ ] **Add email notifications for failed charges**
  - SendGrid integration
  - Notify therapist and patient

- [ ] **Test complete payment flow**
  - Charge, payment, refund, failures

### 2. Stripe Payment Integration 💳
**Priority:** COMPLETE ✅ (Done in Day 3-4)

- [x] Install and configure Stripe
- [x] Create PaymentMethodInput component
- [x] Update Payment Information form
- [x] Test Stripe integration
- [x] PCI compliance verified

### 3. Forms Text Review & Polish ✨
**Priority:** MEDIUM - Needs user input

- [ ] **User reviews all 7 forms**
  - [ ] Patient Information form
  - [ ] Medical History form
  - [ ] Mental Health History form
  - [ ] Insurance Information form
  - [ ] HIPAA Authorization form
  - [ ] Payment Information form
  - [ ] Parental Consent form

- [ ] **Make requested changes**
  - [ ] Update field labels for clarity
  - [ ] Fix typos or grammar issues
  - [ ] Improve help text and descriptions
  - [ ] Ensure consistent terminology

- [ ] **Final workflow testing**
  - [ ] Patient submits all 7 forms
  - [ ] Therapist reviews all forms
  - [ ] Therapist completes all forms
  - [ ] Verify data updates correctly
  - [ ] Test edge cases and error scenarios

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

## 📝 Notes for Next Session (Day 4)

### What's Working Perfectly:
- ✅ Authentication & session management (therapist + patient)
- ✅ Dashboard with real-time stats
- ✅ Patient CRUD operations
- ✅ All 6 intake forms working (Patient Info, Medical, Mental Health, Insurance, HIPAA, Payment)
- ✅ Forms pre-populate and save correctly
- ✅ Form success messages with progress tracking
- ✅ Universal review component (therapist side)
- ✅ Pending forms workflow complete
- ✅ Status tracking (DRAFT → SUBMITTED → COMPLETED)
- ✅ Forms display completion status correctly
- ✅ Full end-to-end workflow tested and validated

### Ready for Next Phase:
- Stripe payment integration for Payment Information form
- User reviews forms for content/text improvements
- Additional features (appointments, clinical notes, etc.)

### Focus for Nov 2:
1. **Stripe integration** - Secure payment method collection
2. **Content review** - Review all form text with user
3. **Patient dashboard improvements** - Show completed forms, upcoming appointments
4. **Start appointment scheduling** - FullCalendar integration

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
- Not yet created - TODO for Day 3

---

**Last Updated:** November 1, 2025 (End of Day 3)
**Next Session:** November 2, 2025 (Day 4)
**Current Branch:** `claude/continue-work-011CUgMLQttSG6rB5qBGKeDJ` (all code consolidated here)
**Status:** ✅ Patient forms workflow COMPLETE - Full end-to-end working perfectly
