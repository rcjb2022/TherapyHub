# TherapyHub Technology Stack - Final Recommendations

## Quick Decision Summary

### ✅ Recommended: Build from Scratch
**Why?** Modern tech stack, purpose-built for therapy practices, better long-term maintainability

### ❌ Not Recommended: Build on OpenEMR
**Why?** PHP-based, heavy customization required, unnecessary medical features

---

## Core Technology Stack

### Backend
```
Runtime:      Node.js 20+
Language:     TypeScript 5+
Framework:    NestJS
API:          REST + GraphQL
Auth:         Passport.js + JWT
Real-time:    Socket.io
```

**Why NestJS?**
- Built-in dependency injection
- Excellent TypeScript support
- Modular architecture (perfect for our 10 modules)
- Strong community and documentation
- Built-in support for validation, guards, interceptors
- Easy testing setup

### Frontend
```
Framework:    Next.js 14+ (React 18+)
Language:     TypeScript 5+
Styling:      Tailwind CSS + Headless UI
State:        Zustand or Redux Toolkit
Forms:        React Hook Form + Zod
Calendar:     FullCalendar
API Client:   TanStack Query (React Query)
```

**Why Next.js?**
- Server-side rendering for better performance
- Built-in routing and API routes
- Image optimization
- Best developer experience
- Easy deployment (Vercel)
- Excellent SEO

### Database & Cache
```
Primary DB:   PostgreSQL 15+
Cache:        Redis 7+
ORM:          Prisma (or TypeORM)
Migrations:   Prisma Migrate
```

**Why PostgreSQL?**
- ACID compliance (critical for billing/claims)
- Excellent JSON support
- Strong ecosystem
- Great performance
- HIPAA-compliant configurations available

### File Storage
```
Primary:      AWS S3 (or GCP Cloud Storage)
Encryption:   Server-side encryption (AES-256)
CDN:          CloudFront (or Cloud CDN)
```

### Infrastructure
```
Hosting:      AWS or Google Cloud Platform
Compute:      ECS (AWS) or Cloud Run (GCP)
Database:     RDS (AWS) or Cloud SQL (GCP)
CI/CD:        GitHub Actions
Monitoring:   DataDog or New Relic
Logging:      CloudWatch or ELK Stack
Errors:       Sentry
```

**Recommendation:** Start with **GCP** if using Google Meet heavily, otherwise **AWS** for maturity

---

## Third-Party Services

### Payment Processing
```
Provider:     Stripe (you already have account)
Integration:  Stripe API v3
Use Cases:    Co-pays, payment plans, subscriptions
```

### Video Conferencing
```
Phase 1:      Google Meet API (faster to implement)
Phase 2:      WebRTC (Jitsi or custom) - more control
```

### Insurance & Billing
```
Clearinghouse: Office Ally (most affordable)
Alternative:   Availity or Change Healthcare
Features:      EDI 837 (claims), EDI 835 (ERA), eligibility verification
```

### Communications
```
SMS/Voice:    Twilio
Email:        SendGrid or AWS SES
Pricing:      ~$0.01 per SMS, varies for voice
```

### Calendar Integration
```
Google:       Google Calendar API
Microsoft:    Microsoft Graph API
```

---

## Development Tools

### Code Quality
```
Linting:      ESLint + Prettier
Testing:      Jest + React Testing Library
E2E:          Playwright or Cypress
Type Check:   TypeScript strict mode
```

### Project Structure
```
Monorepo:     Nx or Turborepo
Structure:
  /apps
    /web           (Next.js frontend)
    /api           (NestJS backend)
    /patient-portal (Patient-facing app)
  /packages
    /ui            (Shared components)
    /types         (Shared TypeScript types)
    /config        (Shared configs)
```

---

## Quick Start Command Summary

### Initial Setup
```bash
# Install Node.js 20+
nvm install 20
nvm use 20

# Create monorepo with Nx
npx create-nx-workspace@latest therapyhub

# Add Next.js frontend
nx g @nx/next:app web

# Add NestJS backend
nx g @nx/nest:app api

# Install core dependencies
npm install @prisma/client zod stripe @nestjs/jwt passport-jwt
npm install -D prisma typescript @types/node

# Initialize Prisma
npx prisma init
```

---

## Environment Variables Template

Create `.env.local` for frontend and `.env` for backend:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/therapyhub"

# Redis
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-secret-key-here"
JWT_EXPIRATION="7d"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="therapyhub-documents"

# Google APIs
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_MEET_API_KEY="..."

# Twilio
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1..."

# SendGrid
SENDGRID_API_KEY="..."
SENDGRID_FROM_EMAIL="noreply@therapyhub.com"

# Clearinghouse (Office Ally)
OFFICE_ALLY_USER="..."
OFFICE_ALLY_PASSWORD="..."
OFFICE_ALLY_API_KEY="..."

# Application
NODE_ENV="development"
APP_URL="http://localhost:3000"
API_URL="http://localhost:3001"
```

---

## Cost Breakdown (Monthly)

### Development Phase
```
Developers (3):        $25,000-$35,000/month
Designer (1):          $7,000-$10,000/month
DevOps (0.5):          $4,000-$5,000/month
PM (0.5):              $4,000-$5,000/month
Total:                 ~$40,000-$55,000/month
```

### Infrastructure (Production, at scale)
```
AWS/GCP Compute:       $200-$500/month
Database:              $200-$400/month
Storage (S3):          $50-$100/month
CDN:                   $50-$100/month
Monitoring:            $100-$200/month
Total Infrastructure:  ~$600-$1,300/month
```

### Third-Party Services
```
Stripe:                2.9% + $0.30 per transaction
Office Ally:           ~$100-$150/month per provider
Twilio:                ~$0.01 per SMS (variable)
SendGrid:              $20-$100/month
Google Meet:           Variable based on usage
Sentry:                $26-$80/month
Total Services:        ~$200-$500/month + transaction fees
```

---

## Performance Targets

```
Page Load Time:        < 2 seconds
API Response Time:     < 200ms (p95)
Database Queries:      < 100ms (p95)
Video Call Latency:    < 200ms
Uptime:                99.9% (SLA)
Concurrent Users:      1,000+ per instance
```

---

## Security Checklist

- [ ] HTTPS everywhere (TLS 1.3)
- [ ] Database encryption at rest (AES-256)
- [ ] Password hashing (bcrypt, 12 rounds minimum)
- [ ] JWT token expiration (short-lived + refresh tokens)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization, CSP headers)
- [ ] CSRF protection (tokens)
- [ ] Rate limiting (express-rate-limit)
- [ ] CORS configuration (restrict origins)
- [ ] Security headers (helmet.js)
- [ ] Audit logging (all PHI access)
- [ ] Role-based access control (RBAC)
- [ ] Regular dependency updates (Dependabot)
- [ ] Vulnerability scanning (Snyk)

---

## HIPAA Compliance Checklist

### Technical Safeguards
- [ ] Encryption in transit (TLS 1.3)
- [ ] Encryption at rest (AES-256)
- [ ] Access controls (RBAC)
- [ ] Audit logs (all PHI access)
- [ ] Automatic logout (15 min inactivity)
- [ ] Unique user identification
- [ ] Emergency access procedures

### Administrative Safeguards
- [ ] Security risk assessment (annual)
- [ ] Workforce training (HIPAA compliance)
- [ ] Incident response plan
- [ ] Business Associate Agreements (all vendors)
- [ ] Data backup procedures
- [ ] Disaster recovery plan
- [ ] Access authorization procedures

### Physical Safeguards
- [ ] Use HIPAA-compliant cloud providers
- [ ] Facility access controls (via cloud provider)
- [ ] Workstation security policies
- [ ] Device and media controls

### Required BAAs (Business Associate Agreements)
- [ ] AWS or GCP
- [ ] Stripe
- [ ] Twilio
- [ ] SendGrid
- [ ] Office Ally (clearinghouse)
- [ ] Backup provider
- [ ] Monitoring/logging provider

---

## Timeline by Phase

### Phase 1: Foundation (2 months)
**Tech Setup:**
- Nx monorepo with Next.js + NestJS
- PostgreSQL + Prisma ORM
- Authentication (Passport + JWT)
- AWS S3 file storage
- CI/CD pipeline (GitHub Actions)

### Phase 2: Scheduling (1 month)
**Tech Focus:**
- FullCalendar integration
- Google Calendar API
- Outlook API (Microsoft Graph)
- Twilio SMS for reminders

### Phase 3: Telehealth (1 month)
**Tech Focus:**
- Google Meet API integration
- WebRTC fallback planning
- Socket.io for real-time features

### Phase 4: Clinical Docs (1 month)
**Tech Focus:**
- Rich text editor (Tiptap or Slate)
- Form builder (React Hook Form + dynamic)
- E-signature (canvas-based)

### Phase 5: Payments (1 month)
**Tech Focus:**
- Stripe API integration
- Payment intents
- Webhooks for automation
- PCI compliance (via Stripe)

### Phase 6: Insurance Billing (3 months)
**Tech Focus:**
- Office Ally API integration
- EDI 837/835 parsing
- X12 format handling
- ICD-10/CPT code databases

### Phase 7: Onboarding (1 month)
**Tech Focus:**
- Workflow engine (custom or Bull queue)
- Document generation (PDFKit or Puppeteer)
- Email automation

### Phase 8: Reporting (1 month)
**Tech Focus:**
- Chart.js or Recharts
- PDF generation
- Excel export (ExcelJS)
- Custom report builder

---

## Alternative Stack Options (If Team Preference Differs)

### Option B: Python Backend
```
Backend:      FastAPI + Python 3.11+
ORM:          SQLAlchemy 2.0
Frontend:     Same (Next.js)
```

**Pros:** Great for data science features, strong ML ecosystem
**Cons:** Less JavaScript synergy, smaller ecosystem for real-time features

### Option C: Full TypeScript with Different Frontend
```
Backend:      Same (NestJS)
Frontend:     Vue 3 + Nuxt 3
```

**Pros:** Vue is simpler, Nuxt 3 is excellent
**Cons:** Smaller ecosystem than React, fewer component libraries

---

## Key Decisions to Make

Before starting development, finalize:

1. **AWS vs. GCP?**
   - GCP if using Google Meet extensively
   - AWS for broader ecosystem and maturity

2. **Monorepo vs. Separate Repos?**
   - Recommend: Monorepo with Nx (better code sharing)

3. **ORM: Prisma vs. TypeORM?**
   - Recommend: Prisma (better DX, type safety)

4. **State Management: Zustand vs. Redux Toolkit?**
   - Recommend: Zustand (simpler) or Redux Toolkit (more structured)

5. **Testing Strategy?**
   - Unit tests: Jest (aim for >80% coverage)
   - Integration tests: Supertest for API
   - E2E tests: Playwright (recommend over Cypress)

6. **Deployment Strategy?**
   - Docker containers + ECS/Cloud Run
   - Blue-green deployments for zero downtime

---

## Next Actions

1. **Review this stack with your team**
2. **Set up development environment** (see Quick Start above)
3. **Create initial project structure** (monorepo)
4. **Set up CI/CD pipeline** (GitHub Actions)
5. **Design database schema** (start with ERD)
6. **Create design system** (Figma or similar)
7. **Begin Phase 1 implementation**

---

**Questions?** Review the main PLATFORM_PLANNING.md document for more details on features, timeline, and business considerations.
