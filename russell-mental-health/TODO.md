# Russell Mental Health Platform - TODO List

**Version:** 0.3.0
**Last Updated:** October 31, 2025 (End of Day 2)
**Status:** Core Forms Workflow Complete - Ready for Patient Testing

---

## 🎯 Immediate Priorities (Day 3 - Nov 1)

### 1. Patient Portal Access & Testing 👤
**Priority:** HIGH - Need to test complete workflow

- [ ] **Create patient test user**
  - [ ] Use Prisma Studio or API to create patient user
  - [ ] Link patient to existing Patient record
  - [ ] Set temporary password
  - [ ] Document credentials for testing

- [ ] **Test patient-side form access**
  - [ ] Patient can log in
  - [ ] Patient sees their pending forms
  - [ ] Patient can fill out forms
  - [ ] Patient can submit forms
  - [ ] Forms appear as SUBMITTED for therapist
  - [ ] Patient cannot access other patients' data

- [ ] **Patient portal dashboard (optional)**
  - [ ] Show pending forms count
  - [ ] Show completed forms (read-only)
  - [ ] Simple navigation
  - [ ] Logout functionality

### 2. Stripe Payment Integration 💳
**Priority:** HIGH - Core feature for practice

- [ ] **Install and configure Stripe**
  - [ ] `npm install @stripe/stripe-js @stripe/react-stripe-js`
  - [ ] Set up Stripe provider in app layout
  - [ ] Configure test API keys (already have them in .env.local)
  - [ ] Create Stripe webhook endpoint for events

- [ ] **Create PaymentMethodInput component**
  - [ ] Use Stripe CardElement for secure input
  - [ ] Style to match existing form design
  - [ ] Add validation and error handling
  - [ ] Loading states

- [ ] **Update Payment Information form**
  - [ ] Replace placeholder card fields with Stripe Elements
  - [ ] Tokenize card on submit (NEVER store actual card numbers!)
  - [ ] Store Stripe token + last 4 digits + expiration
  - [ ] Auto-complete form when Stripe succeeds
  - [ ] Handle Stripe errors with user-friendly messages

- [ ] **Test Stripe integration**
  - [ ] Test card 4242 4242 4242 4242 (success)
  - [ ] Test card 4000 0000 0000 0002 (decline)
  - [ ] Verify no card data in database (PCI compliance)
  - [ ] Test error handling

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

## 📝 Notes for Next Session (Day 3)

### What's Working Perfectly:
- ✅ Authentication & session management
- ✅ Dashboard with real-time stats
- ✅ Patient CRUD operations
- ✅ All 7 intake forms working
- ✅ Forms pre-populate and save correctly
- ✅ Universal review component (therapist side)
- ✅ Pending forms workflow complete
- ✅ Status tracking (DRAFT → SUBMITTED → COMPLETED)

### What Needs Testing:
- Patient-side form access (need patient credentials)
- Complete end-to-end workflow (patient → submit → therapist → complete)
- Stripe payment integration

### Focus for Nov 1:
1. **Create patient test user** and test patient-side forms
2. **Stripe integration** for secure payment processing
3. **User reviews forms** for textual improvements
4. Optional: Patient portal dashboard

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

**Last Updated:** October 31, 2025 (End of Day 2)
**Next Session:** November 1, 2025 (Day 3)
**Current Branch:** `claude/therapynotes-platform-planning-011CUdbcjuxDKk4oBeqePW5V`
**Status:** ✅ Core therapist workflow complete, ready for patient testing
