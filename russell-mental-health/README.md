# Russell Mental Health Platform

> **For complete project documentation, see the main [README.md](../README.md) in the TherapyHub root directory.**

---

## 🚀 Quick Links

**Main Documentation:**
- **[TherapyHub/README.md](../README.md)** - Complete project overview, features, and roadmap
- **[ABOUT.md](ABOUT.md)** - Detailed technical documentation
- **[TODO.md](TODO.md)** - Current tasks and Day 6 priorities
- **[CLAUDE.md](CLAUDE.md)** - Development guidelines and principles
- **[DAY_5_COMPLETE.md](DAY_5_COMPLETE.md)** - Latest milestone documentation
- **[../HANDOFF_DAY_6.md](../HANDOFF_DAY_6.md)** - Next session detailed plan

---

## Current Status

**Version:** 0.5.0 (Day 5 Complete - November 4, 2025)

**Latest Achievements:**
- ✅ Google Cloud Storage integration with HIPAA-compliant signed URLs
- ✅ File upload system for insurance cards, IDs, and legal documents
- ✅ Document library organized by category
- ✅ Complete billing & payment system (Stripe)
- ✅ All 7 intake forms with file upload functionality

**Next Up (Day 6 - November 5, 2025):**
- 🎯 Appointment Scheduling System (FullCalendar integration)
- 📊 Patient Dashboard Improvements

---

## Quick Start

```bash
# Terminal 1 - Start Cloud SQL Proxy
./cloud-sql-proxy therapyconnect-brrphd:us-east1:rmh-db

# Terminal 2 - Start Development Server
npm run dev

# Access Application
# http://localhost:3000
```

**Test Credentials:**
- Email: drbethany@russellmentalhealth.com
- Password: (configured during setup)

---

## Project Structure

```
russell-mental-health/
├── app/
│   ├── api/                    # API routes
│   ├── (auth)/                 # Authentication pages
│   ├── (dashboard)/            # Protected dashboard
│   └── (public)/               # Public pages
├── components/                 # React components
├── lib/                        # Utilities (auth, prisma, gcs)
├── prisma/
│   └── schema.prisma           # Database schema (18 models)
├── .env.local                  # Environment variables (not in git)
├── ABOUT.md                    # Full documentation
├── CLAUDE.md                   # Development guidelines
├── TODO.md                     # Current tasks
├── DAY_1_COMPLETE.md          # Day 1 milestone
├── DAY_2_COMPLETE.md          # Day 2 milestone
├── DAY_5_COMPLETE.md          # Day 5 milestone (latest)
└── README.md                   # This file
```

---

## Technology Stack

- **Frontend:** Next.js 16.0.1, React 19, TypeScript, Tailwind CSS
- **Backend:** Prisma ORM, PostgreSQL 15, NextAuth.js v5
- **Infrastructure:** Google Cloud (SQL, Storage), Stripe
- **Key Features:** HIPAA-compliant, audit logging, file uploads, payment processing

For complete stack details, see [../README.md](../README.md)

---

**📜 License:** Proprietary - All Rights Reserved
**© 2025** Bethany R. Russell, Ph.D., P.A.

---

<div align="center">
  <strong>Built with ❤️ for Russell Mental Health</strong>
  <br/>
  <sub>Babcock Ranch, FL | www.RussellMentalHealth.com</sub>
</div>
