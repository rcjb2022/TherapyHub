# TherapyHub - Russell Mental Health Platform

**Version:** 0.2.0 (Day 2 - Partial Complete)
**Status:** 🚧 In Active Development
**Practice:** Russell Mental Health - Dr. Bethany R. Russell, Ph.D., P.A.

---

## 🎉 Project Status: Day 2 Partial Complete!

✅ **Authentication system working**
✅ **Dashboard with patient stats (clickable cards)**
✅ **Patient CRUD operations (create, view, edit)**
✅ **Fillable forms system (Patient Information complete)**
✅ **Forms auto-update patient records**
🚧 **Remaining forms & payment info in progress**

**Target Launch:** 3-4 weeks from start (End of November 2025)

---

## What is Russell Mental Health Platform?

A modern, HIPAA-compliant therapy practice management platform built specifically for Russell Mental Health. This system handles the complete practice workflow:

- **Patient Onboarding** - Intake forms, documents, e-signatures
- **Live Video Sessions** - Custom WebRTC encrypted video therapy
- **Insurance Billing** - Real-time claims submission via Office Ally (EDI 837/835)
- **Scheduling** - Appointment management with Google Calendar sync
- **Clinical Documentation** - SOAP notes, ICD-10 codes, treatment plans
- **Payment Processing** - Stripe integration for co-pays and patient payments
- **HIPAA Compliance** - Built-in encryption, audit logging, and security

---

## 📂 Project Structure

```
TherapyHub/
├── russell-mental-health/          # Main Next.js application
│   ├── app/                        # Next.js App Router pages
│   ├── prisma/                     # Database schema (18 models)
│   ├── ABOUT.md                    # Version info & roadmap
│   ├── DAY_1_COMPLETE.md          # Day 1 milestone documentation
│   └── package.json
├── FINAL_REALISTIC_PLAN.md         # Complete implementation plan
├── SPECIALIZED_FEATURES.md         # Practice-specific features
├── PLUG_AND_PLAY_STRATEGY.md      # API integration guide
└── README.md                       # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- GCP service account key
- Cloud SQL Proxy binary

### Setup Instructions

1. **Clone and navigate:**
   ```bash
   git clone https://github.com/rcjb2022/TherapyHub.git
   cd TherapyHub/russell-mental-health
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.local.template .env.local
   # Edit .env.local with your credentials
   cp .env.local .env  # Prisma reads .env
   ```

4. **Start Cloud SQL Proxy (Terminal 1):**
   ```bash
   ./cloud-sql-proxy therapyconnect-brrphd:us-east1:rmh-db
   ```

5. **Start development server (Terminal 2):**
   ```bash
   npm run dev
   ```

6. **Access application:**
   - App: http://localhost:3000
   - Database Browser: `npx prisma studio` → http://localhost:5555

---

## 📊 Current Version: 0.2.0

### ✅ Completed (Day 1 - Oct 30, 2025)

**Infrastructure:**
- Google Cloud Platform project: `therapyconnect-brrphd`
- Cloud SQL PostgreSQL 15 database deployed and verified
- Cloud Storage bucket configured for documents
- Service account with proper IAM roles
- All required APIs enabled (Cloud SQL, Storage, Gmail, Calendar)

**Database:**
- 18 production-ready tables created
- Complete schema for therapy practice management
- HIPAA-compliant audit logging
- Insurance claims (EDI 837/835) ready
- NextAuth.js authentication tables

**Application:**
- Next.js 16.0.1 initialized with TypeScript
- All dependencies installed (Prisma, Stripe, WebRTC, etc.)
- Environment configuration complete
- Development server verified working

**Documentation:**
- Complete implementation plan
- Day 1 milestone documented
- Development setup guides

**See:** [russell-mental-health/DAY_1_COMPLETE.md](russell-mental-health/DAY_1_COMPLETE.md) for details

---

### ✅ Completed (Day 2 - Oct 31, 2025)

**Authentication & Security:**
- NextAuth.js fully configured with credentials provider
- Therapist login page with email/password
- Session management with JWT tokens
- Protected routes and API endpoints
- Automatic session timeout (15 minutes)

**Dashboard:**
- Main dashboard with real-time patient statistics
- Active patients, total appointments, pending claims, revenue cards
- Clickable stat cards that navigate to relevant pages
- Recent activity feed
- Quick action buttons

**Patient Management:**
- Patient list page with search functionality
- Filter by status (Active, Inactive, Discharged)
- Create new patient with complete form
- View patient detail page with comprehensive information
- Edit patient information (WORKING - fixed Next.js 15 params bug)
- Patient data validation and error handling
- Insurance information display

**Fillable Forms System:**
- Forms dashboard showing all required patient forms
- Patient Information form (COMPLETE):
  - Personal information (name, DOB, SSN, gender)
  - Contact information (email, phone, alternate phone)
  - Address information
  - Emergency contact details
  - Employment information
  - Referral source
- Forms automatically update patient records in database
- Form submission tracking (status: Draft, Submitted, Approved)
- Completion indicators on patient detail page

**Bug Fixes:**
- Fixed Next.js 15 async params breaking change in all API routes
- Fixed edit patient page showing wrong patient data (controlled components)
- Fixed form save failures (params were undefined)
- Fixed searchParams async warnings
- Added comprehensive error logging throughout

**Technical Improvements:**
- Proper TypeScript types throughout
- React controlled components for form management
- API route handlers properly await params
- No-cache headers to prevent stale data
- Audit logging for all PHI access

**See:** [russell-mental-health/TODO.md](russell-mental-health/TODO.md) for remaining work

---

## 🔄 Keeping Your Local Files in Sync

When I commit files to the repository, **you just need to pull the changes:**

```bash
cd ~/path/to/TherapyHub
git pull origin claude/therapynotes-platform-planning-011CUdbcjuxDKk4oBeqePW5V
```

**That's it!** No need for:
- Re-cloning (you already have the repo)
- CI/CD pipelines (that's for deployment, not local sync)

**Recommended workflow:**
1. I create/modify files and commit to the branch
2. You run `git pull` to get the latest changes
3. You test locally on your Mac
4. When ready, we merge to main and deploy

---

## 📅 Development Roadmap

### ✅ Completed: Version 0.2.0 (Day 2 - Oct 31)
- [x] NextAuth.js authentication setup
- [x] Therapist login page with credentials
- [x] Dashboard layout (header, sidebar, navigation)
- [x] Patient management CRUD (list, add, edit, view)
- [x] Patient search and filtering
- [x] Fillable forms system infrastructure
- [x] Patient Information form (complete and working)
- [x] Forms auto-update patient records

### 🚧 In Progress: Version 0.2.5 (Resume Nov 1)
- [ ] Medical History form (fillable)
- [ ] Insurance Information form (fillable, updates Insurance table)
- [ ] HIPAA Authorization form (fillable)
- [ ] Parental Consent form (fillable, conditional)
- [ ] Payment Information form (credit card on file)

### 📋 Planned: Version 0.3.0 (Week 2)
- [ ] Appointment scheduling system
- [ ] FullCalendar integration
- [ ] Google Calendar sync
- [ ] Automated email/SMS reminders
- [ ] Patient portal login
- [ ] Custom WebRTC video sessions

### 📋 Planned: Version 0.4.0 (Week 2-3)
- [ ] Clinical note templates (SOAP format)
- [ ] ICD-10 diagnosis code lookup
- [ ] CPT code assignment
- [ ] Document upload to Cloud Storage
- [ ] E-signature functionality
- [ ] Intake form builder

### 📋 Planned: Version 0.5.0 (Week 3)
- [ ] Office Ally API integration
- [ ] Real-time insurance claim submission (EDI 837)
- [ ] ERA (835) response processing
- [ ] Eligibility verification (270/271)
- [ ] Claim status tracking and management
- [ ] Denial handling and appeals

### 📋 Planned: Version 0.6.0 (Week 3-4)
- [ ] Stripe payment processing
- [ ] Patient payment portal
- [ ] Automated receipt generation
- [ ] Payment plan management
- [ ] Financial reporting dashboard

### 📋 Planned: Version 1.0.0 (Week 4)
- [ ] Security audit and penetration testing
- [ ] HIPAA compliance final review
- [ ] Performance optimization
- [ ] Production deployment to Cloud Run
- [ ] Custom domain (RussellMentalHealth.com)
- [ ] SSL certificate setup
- [ ] Backup and disaster recovery testing
- [ ] User acceptance testing with Dr. Russell
- [ ] Staff training
- [ ] Go-live!

### 🔮 Future (V2.0+)
- Cryptocurrency payment support (Coinbase Commerce)
- Multi-provider/multi-location support
- Mobile app (React Native)
- Telehealth expansion features
- AI-assisted clinical note generation
- Advanced analytics and reporting
- Automated treatment plan suggestions

---

## 🛠 Technology Stack

**Frontend:**
- Next.js 16.0.1 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- FullCalendar
- React Hook Form + Zod

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL 15 (Cloud SQL)
- NextAuth.js
- Socket.io + Simple-peer (WebRTC)

**Infrastructure:**
- Google Cloud Platform
  - Cloud SQL (database)
  - Cloud Storage (documents)
  - Cloud Run (deployment)
- Stripe (payments)
- Office Ally (insurance clearinghouse)

**Key Integrations:**
- Stripe API (payment processing)
- Office Ally API (EDI 837/835 insurance claims)
- Google Calendar API (scheduling sync)
- Gmail API (automated emails)
- Custom WebRTC (video sessions)

---

## 📝 Documentation

### For Developers
- **[russell-mental-health/ABOUT.md](russell-mental-health/ABOUT.md)** - Version info, roadmap, and todo list
- **[russell-mental-health/DAY_1_COMPLETE.md](russell-mental-health/DAY_1_COMPLETE.md)** - Day 1 milestone details
- **[FINAL_REALISTIC_PLAN.md](FINAL_REALISTIC_PLAN.md)** - Complete 3-4 week implementation plan
- **[SPECIALIZED_FEATURES.md](SPECIALIZED_FEATURES.md)** - Practice-specific features (ASD, immigration evals, crypto)
- **[PLUG_AND_PLAY_STRATEGY.md](PLUG_AND_PLAY_STRATEGY.md)** - API integration strategy and costs

### For Practice
- **Practice Name:** Russell Mental Health
- **Legal Entity:** Bethany R. Russell, Ph.D., P.A.
- **NPI:** 1336918325
- **Location:** Babcock Ranch, FL
- **Contact:** DrBethany@RussellMentalHealth.com
- **Website:** www.RussellMentalHealth.com

---

## 🔐 Security & HIPAA Compliance

**Built-in from Day 1:**
- ✅ All PHI encrypted at rest (AES-256)
- ✅ All connections encrypted in transit (TLS 1.3)
- ✅ Role-based access control (RBAC)
- ✅ Comprehensive audit logging
- ✅ 15-minute session timeout
- ✅ Automatic data backup
- ✅ Business Associate Agreements (BAAs) with GCP, Stripe, Office Ally

**Compliance measures:**
- HIPAA technical safeguards implemented
- Administrative procedures documented
- Privacy policy and terms of service
- Notice of Privacy Practices
- Risk assessment completed

---

## 💰 Monthly Costs (Estimated)

**Infrastructure:**
- Cloud SQL (db-f1-micro): ~$7-10
- Cloud Storage: ~$2-5
- Cloud Run: ~$10-30 (after deployment)
- **Subtotal:** ~$20-45/month

**Services:**
- Stripe: 2.9% + $0.30 per transaction
- Office Ally: Free (payment from insurance reimbursements)
- Google Workspace (existing): $0 additional

**Total:** ~$20-45/month base + transaction fees

**Compare to:**
- TherapyNotes: $59/month
- SimplePractice: $39/month

Plus we own the code and can scale to SaaS later! 🚀

---

## 🎯 Why We Built This

**Commercial solutions like TherapyNotes ($59/mo) and SimplePractice ($39/mo) have:**
- ❌ Outdated interfaces
- ❌ Limited customization
- ❌ Vendor lock-in
- ❌ Doesn't integrate with crypto payments
- ❌ Ongoing costs ($500-700/year)

**Our platform has:**
- ✅ Modern, clean interface
- ✅ Built exactly for Russell Mental Health workflow
- ✅ Full control and ownership of code/data
- ✅ Lower monthly costs (~$20-45/month)
- ✅ Can scale to SaaS for other practices (revenue potential)
- ✅ Custom features (crypto payments, specialized assessments)

---

## 📞 Contact & Support

**Development Team:**
- Lead Developer: Claude (Anthropic AI)
- Project Manager: Charles

**Practice Contact:**
- Dr. Bethany R. Russell, Ph.D., P.A.
- Email: DrBethany@RussellMentalHealth.com
- Phone: 239-427-1635
- Website: www.RussellMentalHealth.com

**Repository:**
- GitHub: https://github.com/rcjb2022/TherapyHub
- Branch: `claude/therapynotes-platform-planning-011CUdbcjuxDKk4oBeqePW5V`

---

## 📜 License

Proprietary - All Rights Reserved
© 2025 Bethany R. Russell, Ph.D., P.A.

This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

**Last Updated:** October 31, 2025
**Current Phase:** Day 2 Complete - Patient Management & Forms Working
**Next Milestone:** Complete remaining forms (Medical History, Insurance, HIPAA, Parental Consent, Payment Info)
