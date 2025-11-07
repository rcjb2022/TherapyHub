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
| [../docs/ABOUT.md](../docs/ABOUT.md) | Detailed technical documentation |
| [../docs/TODO.md](../docs/TODO.md) | Current tasks & Day 9 priorities |
| [../docs/CLAUDE.md](../docs/CLAUDE.md) | Development guidelines & principles |
| [../docs/daily/DAY_8_COMPLETE.md](../docs/daily/DAY_8_COMPLETE.md) | Latest milestone (Day 8) |
| [../docs/daily/DAY_7_COMPLETE.md](../docs/daily/DAY_7_COMPLETE.md) | Previous milestone (Day 7) |
| [../docs/sessions/HANDOFF_DAY_8.md](../docs/sessions/HANDOFF_DAY_8.md) | Session handoff |
| [../docs/sessions/TOMORROW_PROMPTS_DAY_9.md](../docs/sessions/TOMORROW_PROMPTS_DAY_9.md) | Next session detailed plan |

---

## 📊 Current Status (v0.8.0 - Day 8 Complete)

**Latest Achievements:**
- ✅ WebRTC peer-to-peer video sessions fully operational
- ✅ Fixed duplicate signaling issues (clean single offer/answer exchange)
- ✅ End Session button with proper media cleanup (camera turns off)
- ✅ Google Meet preserved as fallback option
- ✅ Room ID strategy (appointment.id) ready for recording linkage
- ✅ Full appointment scheduling system (FullCalendar + Luxon)
- ✅ Patient & therapist UX fully consistent
- ✅ One-time payments with Stripe Elements

**Next Up (Day 9 - Nov 8, 2025):**
- 🎥 Video Session Recording (MediaRecorder API)
- 🤖 Gemini AI Integration (transcription, SOAP notes)
- 📁 Session Vault UI (video player, transcript viewer)
- 🔒 Recording consent and privacy controls

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
- **Current Tasks:** [../docs/TODO.md](../docs/TODO.md)
- **Development Guidelines:** [../docs/CLAUDE.md](../docs/CLAUDE.md)
- **Latest Milestone:** [../docs/daily/DAY_8_COMPLETE.md](../docs/daily/DAY_8_COMPLETE.md)

---

**Version:** 0.8.0 | **License:** Proprietary | **© 2025** Bethany R. Russell, Ph.D., P.A.

<div align="center">
  <sub>Russell Mental Health | Babcock Ranch, FL | www.RussellMentalHealth.com</sub>
</div>
