# 📖 README_QR.md - Quick Reference

> ## 🚨 **Main Documentation Location**
>
> **This is a QUICK REFERENCE guide for developers working in the `russell-mental-health/` directory.**
>
> **For complete project documentation, roadmap, features, and setup instructions:**
>
> ### 👉 **See [../README.md](../README.md)** (Main Project README - The Source of Truth)
>
> The main README in the TherapyHub root directory contains the full, detailed documentation.
>
> **This file (README_QR.md) provides:**
> - Quick start commands for already-configured environments
> - Documentation index with links to all docs
> - Current status snapshot
> - Essential info for daily development

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
| [DAY_6_COMPLETE.md](DAY_6_COMPLETE.md) | Latest milestone (Day 6) |
| [DAY_5_COMPLETE.md](DAY_5_COMPLETE.md) | Previous milestone (Day 5) |
| [../HANDOFF_DAY_6.md](../HANDOFF_DAY_6.md) | Session handoff |
| [../TOMORROW_PROMPTS_DAY_7.md](../TOMORROW_PROMPTS_DAY_7.md) | Next session detailed plan |

---

## 📊 Current Status (v0.6.0 - Day 6 Complete)

**Latest Achievements:**
- ✅ Full appointment scheduling system (FullCalendar + Luxon)
- ✅ Eastern Time display with automatic DST handling
- ✅ Create, edit, delete, drag-and-drop appointments
- ✅ One-time payments with Stripe Elements (card not saved)
- ✅ Prepayment support up to $500 (builds account credit)
- ✅ Critical bug fixes (patient payment auth, timezone display)

**Next Up (Day 7 - Nov 7, 2025):**
- 🎯 Google Calendar Integration (two-way sync)
- 📧 Email Reminders (Gmail API)
- 🔔 Appointment Conflict Detection

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
└── README_QR.md                # ← This quick reference file
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

**Version:** 0.6.0 | **License:** Proprietary | **© 2025** Bethany R. Russell, Ph.D., P.A.

<div align="center">
  <sub>Russell Mental Health | Babcock Ranch, FL | www.RussellMentalHealth.com</sub>
</div>
