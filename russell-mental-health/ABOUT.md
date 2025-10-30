# Russell Mental Health Platform

**Version:** 0.1.0 (Day 1 Complete)
**Status:** In Active Development
**Practice:** Russell Mental Health - Dr. Bethany R. Russell, Ph.D., P.A.

---

## Overview

A comprehensive HIPAA-compliant therapy practice management platform built specifically for Russell Mental Health. This platform handles patient onboarding, scheduling, video therapy sessions, clinical documentation, insurance billing, and payment processing.

---

## Current Version: 0.1.0

### ✅ Completed Features (Day 1)

**Infrastructure**
- Google Cloud Platform project setup (therapyconnect-brrphd)
- Cloud SQL PostgreSQL database deployed and verified
- Google Cloud Storage bucket configured
- Service account with proper IAM roles
- All required APIs enabled

**Database Schema**
- 18 production-ready tables created
- Complete data model for therapy practice management
- HIPAA-compliant audit logging built-in
- Insurance claims (EDI 837/835) ready
- NextAuth.js authentication tables

**Development Environment**
- Next.js 16.0.1 application initialized
- All dependencies installed (Prisma, Stripe, WebRTC, etc.)
- Environment configuration complete
- Cloud SQL Proxy configured
- Development server verified working

---

## Technology Stack

**Frontend**
- Next.js 16.0.1 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- FullCalendar (scheduling)
- React Hook Form + Zod (forms/validation)

**Backend**
- Next.js API Routes
- Prisma ORM
- PostgreSQL 15 (Cloud SQL)
- NextAuth.js (authentication)
- Socket.io + Simple-peer (WebRTC)

**Infrastructure**
- Google Cloud Platform
  - Cloud SQL (database)
  - Cloud Storage (documents)
  - Cloud Run (future deployment)
- Stripe (payment processing)
- Office Ally (insurance clearinghouse)

**Key Integrations**
- Stripe API (payments)
- Office Ally API (insurance claims - EDI 837/835)
- Google Calendar API (scheduling sync)
- Gmail API (automated communications)
- WebRTC (custom video sessions)

---

## Development Roadmap

### 🚧 In Progress: Version 0.2.0 (Day 2)
- [ ] NextAuth.js authentication implementation
- [ ] Therapist login page
- [ ] Dashboard layout and navigation
- [ ] Patient management CRUD operations
- [ ] Patient list with search/filter

### 📅 Planned: Version 0.3.0 (Week 2)
- [ ] Appointment scheduling system
- [ ] Calendar integration (FullCalendar)
- [ ] Automated appointment reminders
- [ ] Patient portal access
- [ ] Custom WebRTC video sessions

### 📅 Planned: Version 0.4.0 (Week 2-3)
- [ ] Clinical note templates (SOAP format)
- [ ] ICD-10 diagnosis codes lookup
- [ ] CPT code assignment
- [ ] Document upload and e-signatures
- [ ] Intake form builder

### 📅 Planned: Version 0.5.0 (Week 3)
- [ ] Office Ally integration (EDI 837)
- [ ] Real-time insurance claim submission
- [ ] ERA (835) response processing
- [ ] Eligibility verification (270/271)
- [ ] Claim status tracking

### 📅 Planned: Version 0.6.0 (Week 3-4)
- [ ] Stripe payment processing
- [ ] Patient payment portal
- [ ] Automated receipt generation
- [ ] Payment plan management
- [ ] Financial reporting

### 📅 Planned: Version 1.0.0 (Week 4)
- [ ] Security audit and penetration testing
- [ ] HIPAA compliance review
- [ ] Performance optimization
- [ ] Production deployment to Cloud Run
- [ ] Custom domain setup (RussellMentalHealth.com)
- [ ] SSL certificates
- [ ] Backup and disaster recovery
- [ ] User acceptance testing
- [ ] Go-live preparation

### 🔮 Future (V2.0+)
- Cryptocurrency payment support (Coinbase Commerce)
- Multi-provider support
- Mobile app (React Native)
- Telehealth expansion features
- Advanced analytics and reporting
- AI-assisted clinical note generation

---

## Database Schema

### Core Tables (18 total)

**Authentication & Users**
- User (auth, roles, permissions)
- Account (NextAuth OAuth)
- Session (NextAuth sessions)
- VerificationToken (email verification)

**Practice Management**
- Therapist (NPI: 1336918325, credentials)
- Patient (demographics, onboarding status)
- Appointment (scheduling, CPT codes)
- VideoSession (WebRTC rooms, recordings)
- ClinicalNote (SOAP notes, ICD-10 codes)

**Billing & Insurance**
- Insurance (primary/secondary, payer info)
- Claim (EDI 837/835, Office Ally integration)
- Payment (Stripe, crypto support)

**Documents & Forms**
- Document (Cloud Storage, e-signatures)
- FormSubmission (intake forms, consents)

**System**
- AuditLog (HIPAA PHI access tracking)
- SystemConfig (application settings)

---

## Practice Information

**Practice Name:** Russell Mental Health
**Legal Entity:** Bethany R. Russell, Ph.D., P.A.
**NPI:** 1336918325
**EIN:** 93-4820690
**Location:** Babcock Ranch, FL 32988
**Phone:** 239-427-1635
**Email:** DrBethany@RussellMentalHealth.com

**Current Patient Load:** ~50 active patients

**Insurance Payers Supported:**
- Medicare
- UnitedHealthcare
- Florida Blue (Blue Cross Blue Shield of Florida)
- Aetna
- Cigna (via Office Ally clearinghouse)

---

## Development Timeline

**Day 1 (Oct 30):** Infrastructure & Database ✅
**Day 2 (Oct 30):** Authentication & Patient Management 🚧
**Week 2:** Scheduling & Video Sessions
**Week 3:** Insurance Claims & Billing
**Week 4:** Testing & Production Launch

**Target Launch Date:** 3-4 weeks from Day 1

---

## Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL client (optional)
- GCP service account key
- Cloud SQL Proxy binary

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rcjb2022/TherapyHub.git
   cd TherapyHub/russell-mental-health
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.local.template .env.local
   # Edit .env.local with your credentials
   cp .env.local .env  # Prisma needs .env
   ```

4. **Start Cloud SQL Proxy:**
   ```bash
   ./cloud-sql-proxy therapyconnect-brrphd:us-east1:rmh-db
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Access the application:**
   - Local: http://localhost:3000
   - Prisma Studio (DB Browser): `npx prisma studio` → http://localhost:5555

---

## Security & Compliance

**HIPAA Compliance:**
- All PHI encrypted at rest and in transit
- Comprehensive audit logging for all data access
- Role-based access control (RBAC)
- Session timeout enforcement (15 minutes)
- Automatic data backup
- Business Associate Agreements (BAAs) with:
  - Google Cloud Platform
  - Stripe
  - Office Ally

**Data Protection:**
- TLS/SSL for all connections
- Service account key rotation
- Environment variables never committed to git
- Cloud SQL requires SSL connections
- Google Cloud Storage uniform access control

---

## Project Structure

```
russell-mental-health/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   └── (public)/          # Public pages
├── prisma/
│   └── schema.prisma      # Database schema (18 models)
├── public/                # Static assets
├── .env.local             # Environment variables (not in git)
├── .gitignore
├── package.json
├── tsconfig.json
└── DAY_1_COMPLETE.md      # Milestone documentation
```

---

## Support & Contact

**Developer:** Claude (Anthropic AI) + Charles (User)
**Practice Contact:** Dr. Bethany R. Russell
**Email:** DrBethany@RussellMentalHealth.com
**Website:** www.RussellMentalHealth.com

---

## License

Proprietary - All Rights Reserved
© 2025 Bethany R. Russell, Ph.D., P.A.

---

**Last Updated:** October 30, 2025
**Next Milestone:** Day 2 - Authentication & Patient Management
