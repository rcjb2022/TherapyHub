# TherapyHub

A comprehensive practice management platform for mental health professionals.

## Project Status

**Current Phase:** Planning & Architecture
**Branch:** `claude/therapynotes-platform-planning-011CUdbcjuxDKk4oBeqePW5V`

---

## What is TherapyHub?

TherapyHub is a modern, full-featured practice management system designed specifically for therapy practices. It provides everything needed to run a successful practice:

- 📅 **Scheduling** - Appointment management with automated reminders
- 💳 **Billing** - Insurance claims and co-pay processing via Stripe
- 🎥 **Telehealth** - Integrated video sessions (Google Meet / WebRTC)
- 📋 **Clinical Documentation** - SOAP notes, treatment plans, assessments
- 📄 **Onboarding** - Automated patient onboarding with e-signatures
- 📊 **Reporting** - Financial and clinical analytics
- 🔒 **HIPAA Compliant** - Built with security and compliance from day one

---

## Documentation

### 📘 Planning Documents

1. **[PLATFORM_PLANNING.md](./PLATFORM_PLANNING.md)** - Comprehensive platform plan
   - Research findings (TherapyNotes.com analysis, open-source alternatives)
   - Complete feature requirements (10 core modules)
   - Architecture overview and database schema
   - Implementation roadmap (12-month phased approach)
   - Cost estimates and revenue model
   - Compliance and security considerations
   - Risk analysis and success metrics

2. **[TECH_STACK_DECISION.md](./TECH_STACK_DECISION.md)** - Technology stack recommendations
   - Final technology decisions
   - Quick start guide
   - Environment setup
   - Performance targets
   - Security and HIPAA checklists
   - Timeline by phase

---

## Quick Overview

### Recommended Technology Stack

**Backend:**
- Node.js + TypeScript
- NestJS framework
- PostgreSQL database
- Redis cache
- AWS S3 storage

**Frontend:**
- Next.js + React
- TypeScript
- Tailwind CSS
- TanStack Query

**Infrastructure:**
- AWS or Google Cloud Platform
- Docker containers
- GitHub Actions for CI/CD

**Third-Party Integrations:**
- Stripe (payments)
- Office Ally (insurance clearinghouse)
- Google Meet API (video)
- Twilio (SMS/voice)
- SendGrid (email)

### Implementation Timeline

| Phase | Duration | Features |
|-------|----------|----------|
| Phase 1 | 2 months | Foundation, auth, basic patient records |
| Phase 2 | 1 month | Scheduling & appointments |
| Phase 3 | 1 month | Telehealth integration |
| Phase 4 | 1 month | Clinical documentation |
| Phase 5 | 1 month | Payment processing (Stripe) |
| Phase 6 | 3 months | Insurance billing & claims |
| Phase 7 | 1 month | Onboarding automation |
| Phase 8 | 1 month | Reporting & analytics |
| Phase 9 | 1 month | Polish & launch prep |

**Total Timeline:** 12 months for full build (6 months for MVP)

### Cost Estimates

**Development (12 months):** ~$520k-$710k
- 3 Full-stack Developers
- 1 UI/UX Designer
- Part-time DevOps, QA, PM

**Infrastructure (Monthly):** ~$800-$1,800
- Cloud hosting, databases, storage
- Third-party service fees
- Monitoring and logging

---

## Build Approach: From Scratch vs. OpenEMR

### ✅ Recommended: Build from Scratch

**Rationale:**
- Modern technology stack (Node.js, React, TypeScript)
- Purpose-built for therapy practices
- Cleaner codebase, better UX
- Native Stripe and Google Meet integration
- Cloud-native architecture
- Easier to maintain and scale

### ❌ Not Recommended: Build on OpenEMR

**Why not:**
- PHP-based (older tech)
- Heavy customization required for mental health
- Includes unnecessary medical features
- Steeper learning curve
- Less control over core architecture

---

## Core Features (10 Modules)

### 1. User Management & Authentication
Multi-tenant architecture with role-based access control, HIPAA-compliant audit logging

### 2. Patient Management
Patient records, portal access, document storage, secure messaging, custom intake forms

### 3. Scheduling System
Calendar views, multi-provider scheduling, recurring appointments, automated reminders, calendar sync

### 4. Telehealth / Video Conferencing
HIPAA-compliant video sessions, waiting room, screen sharing, session recording

### 5. Clinical Documentation
SOAP notes, progress notes, treatment plans, assessments (PHQ-9, GAD-7), custom form builder

### 6. Billing & Insurance
Fee schedules, real-time eligibility, claims submission (837), ERA processing (835), denial management

### 7. Payment Processing
Stripe integration, co-pay collection, payment portal, receipts, refunds, payment history

### 8. Onboarding & Documentation
Automated workflows, document templates, e-signatures, form tracking, patient portal

### 9. Reporting & Analytics
Financial reports, clinical reports, appointment statistics, custom report builder, data export

### 10. Administration
Practice settings, provider management, insurance payers, system configuration, HIPAA tools

---

## Competitive Analysis

| Feature | TherapyNotes | SimplePractice | **TherapyHub** |
|---------|--------------|----------------|----------------|
| Scheduling | ✅ | ✅ | ✅ |
| Telehealth | ✅ ($15/mo) | ✅ | ✅ (included) |
| Insurance | ✅ | ✅ | ✅ |
| Payments | ✅ | ✅ | ✅ (Stripe) |
| Patient Portal | ✅ | ✅ | ✅ |
| Modern UI | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Tech Stack | Legacy | Legacy | **Modern** |
| Pricing (Solo) | $59/mo | $39/mo | TBD |

---

## HIPAA Compliance

TherapyHub is designed with HIPAA compliance from the ground up:

**Technical Safeguards:**
- ✅ Encryption at rest (AES-256)
- ✅ Encryption in transit (TLS 1.3)
- ✅ Role-based access controls
- ✅ Audit logs for all PHI access
- ✅ Automatic logout after inactivity
- ✅ 2FA support

**Administrative Safeguards:**
- Business Associate Agreements (BAAs)
- Annual security risk assessments
- Workforce HIPAA training
- Incident response plan
- Disaster recovery procedures

---

## MVP Option (6 Months)

If you need to launch faster, we recommend an MVP with:

**Included:**
- ✅ Authentication & user management
- ✅ Basic patient records
- ✅ Scheduling & calendar
- ✅ Google Meet integration
- ✅ Basic clinical notes (SOAP)
- ✅ Stripe payments (co-pays)
- ✅ Basic reporting

**Deferred to Post-MVP:**
- Insurance billing (manual workaround)
- Automated onboarding (manual initially)
- Advanced features

**MVP Timeline:** 6 months
**MVP Budget:** ~$300k-$400k

---

## Next Steps

### Immediate Actions (Week 1-2)

1. ✅ **Review Planning Documents** - Review the comprehensive planning docs
2. ⬜ **Finalize Technology Stack** - Confirm stack decisions with team
3. ⬜ **Set Up Development Environment** - Create repos, CI/CD, monitoring
4. ⬜ **Design Database Schema** - Create ERD for all modules
5. ⬜ **Create Design System** - Wireframes, component library, style guide
6. ⬜ **Vendor Setup** - AWS/GCP, Stripe, Twilio, SendGrid, clearinghouse
7. ⬜ **Compliance Preparation** - HIPAA checklist, BAA templates

### Key Questions to Answer

1. **Target Market**: Solo practitioners, group practices, or both?
2. **Geography**: US only initially, or international?
3. **Team**: Do you have a development team, or need to hire?
4. **Timeline**: Full build (12 months) or MVP (6 months)?
5. **Budget**: Does the ~$520k-$710k estimate align with resources?

---

## Project Structure (Planned)

```
therapyhub/
├── apps/
│   ├── web/              # Next.js frontend (therapist app)
│   ├── api/              # NestJS backend
│   └── patient-portal/   # Patient-facing portal
├── packages/
│   ├── ui/               # Shared component library
│   ├── types/            # Shared TypeScript types
│   ├── config/           # Shared configuration
│   └── utils/            # Shared utilities
├── docs/
│   ├── architecture/     # Architecture diagrams
│   ├── api/              # API documentation
│   └── deployment/       # Deployment guides
├── PLATFORM_PLANNING.md  # Comprehensive planning doc
├── TECH_STACK_DECISION.md # Tech stack details
└── README.md             # This file
```

---

## Resources

### Compliance
- [HIPAA Survival Guide](https://www.hhs.gov/hipaa/index.html)
- [AWS HIPAA Compliance](https://aws.amazon.com/compliance/hipaa-compliance/)
- [GCP Healthcare Compliance](https://cloud.google.com/security/compliance/hipaa)

### Technology
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Prisma Documentation](https://www.prisma.io/docs)

### Inspiration
- [TherapyNotes](https://www.therapynotes.com/)
- [SimplePractice](https://www.simplepractice.com/)
- [OpenEMR](https://www.open-emr.org/)

---

## Contributing

This project is in the planning phase. Once development begins, contribution guidelines will be added.

---

## License

TBD

---

## Contact

For questions about this planning document or the project, please reach out to the project team.

---

**Last Updated:** October 30, 2025
**Status:** Planning Phase
**Next Milestone:** Technology Stack Finalization & Development Environment Setup
