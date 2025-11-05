# 📖 Russell Mental Health - Quick Reference

> ## 🚨 **Main Documentation Location**
>
> **This is a quick reference guide for developers working in this directory.**
>
> **For complete project documentation, roadmap, features, and setup instructions:**
>
> ### 👉 **See [../README.md](../README.md)** (Main Project README)
>
> The main README in the TherapyHub root directory contains the full, detailed documentation.

---

## ⚡ Quick Start (For Developers Already Set Up)

**Start Development Servers:**

```bash
# Terminal 1 - Start Cloud SQL Proxy
./cloud-sql-proxy therapyconnect-brrphd:us-east1:rmh-db

# Terminal 2 - Start Development Server
npm run dev
```

**Access:** http://localhost:3000

**Credentials:** drbethany@russellmentalhealth.com

---

## 📚 Documentation Index

| Document | Purpose |
|----------|---------|
| **[../README.md](../README.md)** | 📖 **MAIN README** - Complete project docs, roadmap, all features |
| [ABOUT.md](ABOUT.md) | Detailed technical documentation |
| [TODO.md](TODO.md) | Current tasks & Day 6 priorities |
| [CLAUDE.md](CLAUDE.md) | Development guidelines & principles |
| [DAY_5_COMPLETE.md](DAY_5_COMPLETE.md) | Latest milestone (Day 5) |
| [../HANDOFF_DAY_6.md](../HANDOFF_DAY_6.md) | Next session detailed plan |

---

## 📊 Current Status (v0.5.0 - Day 5 Complete)

**Latest Achievements:**
- ✅ Google Cloud Storage integration (HIPAA-compliant signed URLs)
- ✅ File upload system (insurance cards, IDs, legal documents)
- ✅ Document library organized by category
- ✅ Complete billing & payment system (Stripe)
- ✅ All 7 intake forms with file upload functionality

**Next Up (Day 6 - Nov 5, 2025):**
- 🎯 Appointment Scheduling System (FullCalendar)
- 📊 Patient Dashboard Improvements

**For full roadmap:** See [../README.md](../README.md)

---

## 🏗 Project Structure

```
russell-mental-health/          # ← You are here
├── app/
│   ├── api/                    # API routes
│   ├── (auth)/                 # Authentication pages
│   ├── (dashboard)/            # Protected dashboard
│   └── (public)/               # Public pages
├── components/                 # React components
├── lib/                        # Utilities (auth, prisma, gcs)
├── prisma/
│   └── schema.prisma           # Database schema (18 models)
├── ABOUT.md
├── TODO.md
├── CLAUDE.md
└── README.md                   # ← This quick reference file
```

---

## 🛠 Tech Stack Summary

- **Framework:** Next.js 16.0.1 + React 19 + TypeScript
- **Database:** Prisma + PostgreSQL 15 (Cloud SQL)
- **Auth:** NextAuth.js v5
- **Storage:** Google Cloud Storage
- **Payments:** Stripe

**For complete tech stack:** See [../README.md](../README.md#-technology-stack)

---

## 💡 Need Help?

- **Complete Documentation:** [../README.md](../README.md)
- **Current Tasks:** [TODO.md](TODO.md)
- **Development Guidelines:** [CLAUDE.md](CLAUDE.md)
- **Latest Milestone:** [DAY_5_COMPLETE.md](DAY_5_COMPLETE.md)

---

**Version:** 0.5.0 | **License:** Proprietary | **© 2025** Bethany R. Russell, Ph.D., P.A.

<div align="center">
  <sub>Russell Mental Health | Babcock Ranch, FL | www.RussellMentalHealth.com</sub>
</div>
