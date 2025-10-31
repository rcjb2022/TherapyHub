# Russell Mental Health Platform

> **A modern, HIPAA-compliant therapy practice management system built for Russell Mental Health**

**Version:** 0.3.0 | **Status:** 🚀 Production-Ready Forms Workflow | **License:** Proprietary

---

## 🎯 Overview

Custom-built practice management platform replacing expensive commercial solutions (TherapyNotes, SimplePractice) with a tailored system costing **~$20-45/month** vs **$40-60/month**, saving **$240-600/year** while providing complete control over features and data.

**Built for:** Dr. Bethany R. Russell, Ph.D., P.A. - Russell Mental Health, Babcock Ranch, FL

---

## ✨ Key Features (v0.3.0)

### 🔐 Authentication & Security
- NextAuth.js authentication with JWT tokens
- Role-based access control (RBAC)
- Session timeout (15 minutes)
- HIPAA-compliant audit logging

### 📊 Dashboard
- Real-time statistics (Active Patients, Appointments, Revenue, Pending Forms)
- Clickable navigation cards
- Recent activity feed
- Pending forms alerting system

### 👥 Patient Management
- Complete CRUD operations
- Advanced search and filtering
- Patient detail pages with full history
- Insurance information tracking

### 📝 Forms System (All 7 Standard Intake Forms)
1. **Patient Information** - Demographics and contact details
2. **Medical History** - Medical conditions, medications, allergies
3. **Mental Health History** - Symptoms, previous treatment, safety assessment
4. **Insurance Information** - Primary/secondary insurance
5. **HIPAA Authorization** - Consents and privacy notices
6. **Payment Information** - Billing and payment methods
7. **Parental Consent** - For minors under 18

### 🔄 Forms Workflow
- Status tracking: DRAFT → SUBMITTED → COMPLETED
- Pre-population with existing data
- Universal review component (one component handles all 7 forms)
- Therapist can edit before completing
- Reviewer and completion timestamp tracking
- 150+ field labels mapped to human-readable names

### 📋 Pending Forms Management
- Dashboard card showing count of pending forms
- Dedicated review page showing all patients with pending forms
- Direct navigation from dashboard to review workflow
- Yellow color-coded pending status throughout app

---

## 🛠 Technology Stack

**Frontend:**
- Next.js 16.0.1 (App Router + Turbopack)
- React 19
- TypeScript 5.0+
- Tailwind CSS 3.4+
- Hero Icons 2.0

**Backend:**
- Next.js API Routes
- Prisma ORM 6.0+
- PostgreSQL 15 (Google Cloud SQL)
- NextAuth.js v5

**Infrastructure:**
- Google Cloud Platform (Cloud SQL, Cloud Storage)
- Stripe (payment processing)
- Office Ally (insurance clearinghouse)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- GCP service account key
- Cloud SQL Proxy binary

### Setup

```bash
# 1. Clone repository
git clone https://github.com/rcjb2022/TherapyHub.git
cd TherapyHub/russell-mental-health

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.local.template .env.local
# Edit .env.local with your credentials
cp .env.local .env

# 4. Start Cloud SQL Proxy (Terminal 1)
./cloud-sql-proxy therapyconnect-brrphd:us-east1:rmh-db

# 5. Start dev server (Terminal 2)
npm run dev

# 6. Access application
# http://localhost:3000
```

**Test Credentials:**
- Email: drbethany@russellmentalhealth.com
- Password: (configured during setup)

---

## 📁 Project Structure

```
russell-mental-health/
├── app/
│   ├── api/                  # API routes
│   ├── (auth)/               # Authentication pages
│   ├── (dashboard)/          # Protected dashboard
│   └── (public)/             # Public pages
├── components/               # React components
├── lib/                      # Utilities (auth, prisma)
├── prisma/
│   └── schema.prisma         # Database schema (18 models)
├── .env.local               # Environment variables (not in git)
├── ABOUT.md                 # Full documentation
├── README.md                # This file
├── TODO.md                  # Current tasks
├── DAY_1_COMPLETE.md        # Day 1 milestone
└── DAY_2_COMPLETE.md        # Day 2 milestone
```

---

## 📊 Database Schema

**18 Tables:**
- **Auth:** User, Account, Session, VerificationToken
- **Practice:** Therapist, Patient, Appointment, VideoSession, ClinicalNote
- **Billing:** Insurance, Claim, Payment
- **Documents:** Document, FormSubmission
- **System:** AuditLog, SystemConfig

See `prisma/schema.prisma` for full schema.

---

## 💰 Cost Savings

| Service | Commercial | Russell MH | Savings |
|---------|-----------|------------|---------|
| TherapyNotes | $59/month | $20-45/month | **$14-39/mo** |
| SimplePractice | $39/month | $20-45/month | **$0-19/mo** |
| **Annual Savings** | - | - | **$240-600/year** |

**Plus:**
- ✅ Complete data ownership
- ✅ No vendor lock-in
- ✅ Unlimited customization
- ✅ Scalable to SaaS platform

---

## 🔐 Security & HIPAA Compliance

- ✅ PHI encrypted at rest (AES-256)
- ✅ Connections encrypted in transit (TLS 1.3)
- ✅ Comprehensive audit logging
- ✅ Role-based access control
- ✅ Session timeout enforcement
- ✅ Automatic daily backups
- ✅ Business Associate Agreements (GCP, Stripe)

---

## 📅 Development Progress

**Day 1 (Oct 30, 2025):** ✅
- GCP infrastructure setup
- Database schema (18 tables)
- Application initialization

**Day 2 (Oct 31, 2025):** ✅
- Authentication system
- Dashboard and navigation
- Patient management CRUD
- All 7 intake forms
- Universal review component
- Pending forms workflow

**Day 3 (Nov 1, 2025):** 🚧 In Progress
- Patient portal testing
- Stripe payment integration
- Forms text review

---

## 📚 Documentation

- **`README.md`** - This file (quick start and overview)
- **`ABOUT.md`** - Complete documentation, roadmap, and technical details
- **`TODO.md`** - Current task list and priorities
- **`DAY_1_COMPLETE.md`** - Day 1 milestone documentation
- **`DAY_2_COMPLETE.md`** - Day 2 milestone documentation
- **`CLAUDE.md`** - Claude AI development guidelines
- **`prisma/schema.prisma`** - Database schema documentation

---

## 🎯 Roadmap

### ✅ v0.3.0 - Forms Workflow (Current)
- Authentication and security
- Patient management
- All 7 intake forms
- Therapist review workflow

### 🚧 v0.4.0 - Patient Portal (Next)
- Patient login and dashboard
- Stripe payment integration
- Forms text polish

### 📅 v0.5.0 - Scheduling (Week 2)
- Appointment scheduling
- Calendar integration
- Google Calendar sync
- Automated reminders

### 📅 v0.6.0 - Clinical Notes (Week 2-3)
- SOAP note templates
- ICD-10 diagnosis lookup
- CPT code assignment
- Document upload and e-signatures

### 📅 v0.7.0 - Insurance Billing (Week 3)
- Office Ally integration
- EDI 837/835 processing
- Eligibility verification
- Claim tracking

### 📅 v1.0.0 - Production Launch (Week 4)
- Security audit
- HIPAA compliance review
- Cloud Run deployment
- Custom domain setup
- Go-live! 🚀

---

## 👥 Team

**Practice Owner:**
- Dr. Bethany R. Russell, Ph.D.
- Licensed Clinical Psychologist
- NPI: 1336918325

**Development:**
- Lead Developer: Claude (Anthropic AI)
- Project Manager: Charles

**Contact:**
- Practice: DrBethany@RussellMentalHealth.com
- Phone: 239-427-1635
- Website: www.RussellMentalHealth.com

---

## 📜 License

**Proprietary - All Rights Reserved**

© 2025 Bethany R. Russell, Ph.D., P.A.

This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

## 🙏 Acknowledgments

- **Google Cloud Platform** - Infrastructure
- **Stripe** - Payment processing
- **Office Ally** - Insurance clearinghouse
- **Anthropic** - AI development assistance
- **Vercel** - Next.js framework
- **Prisma** - Database toolkit

---

**Last Updated:** October 31, 2025 (End of Day 2)
**Current Version:** 0.3.0
**Status:** ✅ Core therapist workflow complete, ready for patient testing
**Next Milestone:** Patient portal access + Stripe integration (Day 3)

---

<div align="center">
  <strong>Built with ❤️ for Russell Mental Health</strong>
  <br/>
  <sub>Babcock Ranch, FL | www.RussellMentalHealth.com</sub>
</div>
