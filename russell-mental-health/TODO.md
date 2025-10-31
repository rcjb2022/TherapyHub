# Russell Mental Health Platform - TODO List

**Version:** 0.2.0
**Last Updated:** October 31, 2025
**Status:** Day 2 Partial Complete - Resuming November 1

---

## 🎯 Immediate Priorities (Resume Nov 1)

### High Priority - Complete Forms System

- [ ] **Medical History Form** (fillable)
  - Current medications
  - Past mental health treatment
  - Substance use history
  - Family mental health history
  - Current symptoms checklist
  - Suicidal ideation screening
  - Previous diagnoses
  - Allergies

- [ ] **Insurance Information Form** (fillable)
  - Primary insurance details
  - Secondary insurance (if applicable)
  - Policy holder information
  - Group number, policy number
  - Insurance phone and address
  - **Must update Insurance table** in database when submitted
  - Pre-authorization requirements

- [ ] **HIPAA Authorization Form** (fillable)
  - HIPAA consent language
  - Electronic signature capability
  - Date and timestamp
  - Consent to telehealth
  - Consent to leave voicemails
  - Release of information authorization

- [ ] **Parental Consent Form** (fillable, conditional)
  - Only shown if patient is under 18
  - Parent/guardian information
  - Relationship to patient
  - Electronic signature from parent
  - Emergency contact authorization

- [ ] **Payment Information Form** (fillable)
  - Credit card on file
  - Billing address
  - Consent for automatic billing
  - Payment plan options
  - **Integration with Stripe tokenization**

---

## ✅ Completed (Day 1-2)

### Day 1 (Oct 30, 2025)
- [x] GCP infrastructure setup
- [x] Cloud SQL PostgreSQL database
- [x] Prisma schema with 18 tables
- [x] Next.js 16.0.1 application initialized
- [x] All dependencies installed
- [x] Environment configuration
- [x] Development server running

### Day 2 (Oct 31, 2025)
- [x] NextAuth.js authentication
- [x] Therapist login page
- [x] Dashboard with stats (clickable cards)
- [x] Patient list with search
- [x] Create new patient
- [x] View patient details
- [x] Edit patient (FIXED - Next.js 15 params bug)
- [x] Forms dashboard
- [x] Patient Information form (complete)
- [x] Forms auto-update patient records
- [x] Comprehensive error logging

---

## 📋 Backlog - Week 2

### Appointment Scheduling
- [ ] FullCalendar integration
- [ ] Create appointment form
- [ ] View appointments by day/week/month
- [ ] Edit/cancel appointments
- [ ] Appointment status tracking
- [ ] Google Calendar sync
- [ ] Automated email reminders (Gmail API)
- [ ] SMS reminders (Twilio)
- [ ] Recurring appointment support
- [ ] Waitlist management

### Patient Portal
- [ ] Patient login system (separate from therapist)
- [ ] Patient dashboard
- [ ] View upcoming appointments
- [ ] Complete intake forms online
- [ ] Upload documents (ID, insurance card)
- [ ] View payment history
- [ ] Make payments
- [ ] Secure messaging with therapist

### Clinical Notes
- [ ] Session note templates (SOAP format)
- [ ] Progress note templates
- [ ] ICD-10 diagnosis code lookup and selection
- [ ] CPT code assignment (90791, 90834, 90837, etc.)
- [ ] Treatment plan builder
- [ ] Goals and objectives tracking
- [ ] Digital signature for notes
- [ ] Lock notes after signing
- [ ] Print notes to PDF

---

## 📋 Backlog - Week 3

### Document Management
- [ ] Upload documents to Cloud Storage
- [ ] Document categories (intake, insurance, clinical, billing)
- [ ] View/download documents
- [ ] Delete documents (with audit log)
- [ ] Document expiration tracking (insurance cards)
- [ ] E-signature for consent forms
- [ ] Automated document requests

### Video Sessions (WebRTC)
- [ ] Create video session room
- [ ] Join video session (therapist)
- [ ] Join video session (patient)
- [ ] Screen sharing
- [ ] Session recording (with consent)
- [ ] Chat during session
- [ ] Session quality monitoring
- [ ] Fallback to audio-only
- [ ] End session and auto-create note template

### Insurance & Billing
- [ ] Office Ally API integration
- [ ] Create insurance claim (EDI 837)
- [ ] Submit claim to Office Ally
- [ ] Check claim status
- [ ] Receive ERA (EDI 835) responses
- [ ] Post payments from insurance
- [ ] Handle denials and resubmissions
- [ ] Eligibility verification (EDI 270/271)
- [ ] Claim aging report
- [ ] Revenue cycle dashboard

---

## 📋 Backlog - Week 4

### Payment Processing
- [ ] Stripe integration for card payments
- [ ] Patient payment portal
- [ ] Process co-pay at time of service
- [ ] Process patient responsibility after insurance
- [ ] Payment plans for large balances
- [ ] Automated receipt generation (email)
- [ ] Refund processing
- [ ] Payment history report
- [ ] Outstanding balance alerts

### Reports & Analytics
- [ ] Patient demographics report
- [ ] Appointment no-show rate
- [ ] Revenue by month/quarter
- [ ] Claims submission success rate
- [ ] Outstanding claims report
- [ ] Patient satisfaction surveys
- [ ] Diagnosis distribution (ICD-10)
- [ ] Service utilization (CPT codes)
- [ ] Export reports to Excel/PDF

### Security & Compliance
- [ ] Security audit
- [ ] Penetration testing
- [ ] HIPAA compliance final review
- [ ] Risk assessment documentation
- [ ] Incident response plan
- [ ] Data backup testing
- [ ] Disaster recovery testing
- [ ] Privacy policy finalization
- [ ] Terms of service
- [ ] BAA agreements review

---

## 🚀 Production Deployment (Week 4)

### Cloud Run Deployment
- [ ] Build Docker container
- [ ] Configure Cloud Run service
- [ ] Environment variables in Secret Manager
- [ ] Database migration to production
- [ ] SSL certificate setup
- [ ] Custom domain configuration (RussellMentalHealth.com)
- [ ] Set up Cloud CDN
- [ ] Configure Cloud Armor (DDoS protection)
- [ ] Set up monitoring and alerts
- [ ] Load testing
- [ ] Staging environment for testing

### Go-Live Preparation
- [ ] User acceptance testing with Dr. Russell
- [ ] Staff training (if applicable)
- [ ] Patient communication about new portal
- [ ] Data migration from existing system (if any)
- [ ] Create video tutorials
- [ ] Support documentation
- [ ] Emergency contact procedures
- [ ] Soft launch (limited patients)
- [ ] Full launch
- [ ] Post-launch monitoring

---

## 🔮 Future Enhancements (Version 2.0+)

### Advanced Features
- [ ] Cryptocurrency payment support (Coinbase Commerce)
- [ ] Multi-provider support
- [ ] Multi-location support
- [ ] Mobile app (React Native)
- [ ] AI-assisted clinical note generation
- [ ] Automated treatment plan suggestions
- [ ] Outcome measurement tracking
- [ ] Group therapy session management
- [ ] Sliding scale fee calculator
- [ ] Waitlist automation

### Specialized Assessments
- [ ] Autism Spectrum Disorder (ASD) evaluation forms
- [ ] Immigration psychological evaluation forms
- [ ] ADHD assessment battery
- [ ] Depression/anxiety screening (PHQ-9, GAD-7)
- [ ] Trauma screening (PCL-5)
- [ ] Substance use assessment
- [ ] Cognitive assessment tools
- [ ] Automated scoring and interpretation

### Business Intelligence
- [ ] Advanced analytics dashboard
- [ ] Predictive analytics (appointment no-shows)
- [ ] Revenue forecasting
- [ ] Patient retention analysis
- [ ] Marketing ROI tracking
- [ ] Referral source tracking
- [ ] Payer mix analysis
- [ ] Benchmarking against industry standards

### SaaS Platform (Long-term)
- [ ] Multi-tenant architecture
- [ ] Tenant onboarding workflow
- [ ] Subscription management
- [ ] Usage-based billing
- [ ] White-label options
- [ ] API for third-party integrations
- [ ] Marketplace for add-ons
- [ ] Partner program

---

## 🐛 Known Issues

### Fixed in Day 2
- [x] Edit patient page showing wrong patient data (fixed with controlled components)
- [x] Form save failures due to undefined patientId (fixed with Next.js 15 async params)
- [x] SearchParams async warnings (fixed with await)
- [x] Gender options showing "non-binary" instead of "other" (fixed)

### Current Issues
- None reported

---

## 📝 Notes for Next Session

**What's Working:**
- Authentication ✅
- Dashboard ✅
- Patient CRUD ✅
- Patient Information form ✅
- Forms update patient records ✅

**Focus for Nov 1:**
1. Complete Medical History form
2. Complete Insurance Information form (must update Insurance table)
3. Complete HIPAA Authorization form
4. Complete Parental Consent form (conditional logic)
5. Complete Payment Information form (Stripe integration)

**Test Credentials:**
- Email: drbethany@russellmentalhealth.com
- Password: (the one we set up in Day 1)

**Server Startup:**
1. Terminal 1: `./cloud-sql-proxy therapyconnect-brrphd:us-east1:rmh-db`
2. Terminal 2: `cd russell-mental-health && npm run dev`
3. Browser: http://localhost:3000

**Database:**
- Prisma Studio: `npx prisma studio` → http://localhost:5555

---

**Last Updated:** October 31, 2025
**Next Session:** November 1, 2025
**Current Branch:** `claude/therapynotes-platform-planning-011CUdbcjuxDKk4oBeqePW5V`
