# TherapyHub - Plug & Play API Strategy

**Goal:** Maximize use of existing APIs to build in 2-4 weeks, minimize custom code

---

## ✅ HIGH PRIORITY - Use These Plug & Play APIs

### 1. Video Conferencing ⭐⭐⭐

**Best Option: Daily.co**
- **Why:** HIPAA-compliant, BAA available, free tier (10k min/month)
- **Setup Time:** 2-3 hours
- **Integration:** Dead simple - embed iframe or use their React SDK
- **Cost:** $0 for free tier, then $0.0025/min ($2.50 per 1000 min)
- **Features:** HD video, screen share, recording, waiting rooms built-in
- **Code Example:**
```javascript
import Daily from '@daily-co/daily-js';
const callFrame = Daily.createFrame();
callFrame.join({ url: 'https://yourname.daily.co/room-name' });
```

**Alternative: Google Meet API**
- **Why NOT recommended:** Limited API, mostly for scheduling, not embedding
- **Issues:** Can't embed in your app, redirects to meet.google.com
- **Better for:** Just generating meeting links (very simple)

**Alternative: Whereby**
- **Why:** Similar to Daily.co, embeddable, HIPAA-ready
- **Cost:** More expensive than Daily.co

**Alternative: Twilio Video**
- **Why:** More complex, programmable, enterprise-grade
- **Setup Time:** 1-2 days (more code than Daily.co)
- **Cost:** Similar to Daily.co

**RECOMMENDATION: Use Daily.co - saves you 5-7 days vs custom WebRTC**

---

### 2. Payments ⭐⭐⭐

**Stripe (You already have account!)**
- **Setup Time:** 2-4 hours
- **HIPAA:** BAA available
- **Options:**
  - **Stripe Checkout:** Hosted payment page (easiest, 1 hour setup)
  - **Stripe Payment Intents:** Custom UI (2-3 hours)
  - **Stripe Payment Links:** One-click payment links (30 min setup)

**Code Example:**
```javascript
// Option 1: Stripe Checkout (easiest)
const session = await stripe.checkout.sessions.create({
  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: { name: 'Therapy Session Co-pay' },
      unit_amount: 3000, // $30.00
    },
    quantity: 1,
  }],
  mode: 'payment',
  success_url: 'https://yoursite.com/success',
  cancel_url: 'https://yoursite.com/cancel',
});

// Option 2: Payment Intents (more control)
const paymentIntent = await stripe.paymentIntents.create({
  amount: 3000,
  currency: 'usd',
  payment_method_types: ['card'],
});
```

**RECOMMENDATION: Use Stripe Checkout for MVP - 1 hour setup**

---

### 3. Email ⭐⭐⭐

**Best Option: SendGrid**
- **Setup Time:** 1-2 hours
- **HIPAA:** BAA available
- **Free Tier:** 100 emails/day (plenty for MVP)
- **Cost:** $15/month for 40k emails
- **Templates:** Built-in template editor
- **Code Example:**
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: 'patient@example.com',
  from: 'practice@yoursite.com',
  subject: 'Appointment Reminder',
  text: 'Your appointment is tomorrow at 2pm',
  html: '<strong>Your appointment is tomorrow at 2pm</strong>',
});
```

**Alternative: Gmail API**
- **Setup Time:** 2-3 hours (OAuth setup)
- **HIPAA:** BAA available through Workspace
- **Pros:** Free if already using Workspace
- **Cons:** OAuth complexity, rate limits

**Alternative: Resend**
- **Setup Time:** 30 minutes (very modern, simple)
- **Cost:** $20/month for 50k emails
- **Pros:** Beautiful API, great DX
- **Cons:** Newer, less proven than SendGrid

**RECOMMENDATION: SendGrid - best balance of ease and features**

---

### 4. Calendar Integration ⭐⭐

**Google Calendar API**
- **Setup Time:** 3-4 hours (OAuth setup)
- **Use Case:** Sync appointments to therapist's Google Calendar
- **Code Example:**
```javascript
const {google} = require('googleapis');
const calendar = google.calendar({version: 'v3', auth});

await calendar.events.insert({
  calendarId: 'primary',
  resource: {
    summary: 'Therapy Session with John Doe',
    start: { dateTime: '2025-11-01T14:00:00-07:00' },
    end: { dateTime: '2025-11-01T15:00:00-07:00' },
  },
});
```

**Microsoft Graph API (Outlook)**
- Similar setup for Outlook integration

**RECOMMENDATION: Add Google Calendar sync - takes 3-4 hours, nice to have**

---

### 5. SMS Reminders ⭐ (V2, not MVP)

**Twilio**
- **Setup Time:** 1-2 hours
- **HIPAA:** BAA available
- **Cost:** $0.01 per SMS (very cheap)
- **Code Example:**
```javascript
const twilio = require('twilio');
const client = twilio(accountSid, authToken);

await client.messages.create({
  body: 'Reminder: Therapy appointment tomorrow at 2pm',
  from: '+1234567890',
  to: '+1987654321'
});
```

**RECOMMENDATION: Skip for MVP, add in V2 - focus on email first**

---

## 🤔 MEDIUM PRIORITY - Evaluate These

### 6. Insurance Clearinghouse APIs ⭐⭐

**For MVP: SKIP - Use Manual Superbills**
- Generate PDF superbills (use Puppeteer or PDFKit)
- Wife manually submits to insurance
- Saves 2-3 weeks of integration work

**For V2: Office Ally API**
- **Setup Time:** 1-2 weeks (complex EDI 837/835 format)
- **HIPAA:** BAA available
- **Cost:** ~$100-150/month per provider
- **Features:**
  - Real-time eligibility verification
  - Electronic claims submission (EDI 837)
  - ERA processing (EDI 835)
  - Claims tracking

**Other Options:**
- **Availity API** - Similar to Office Ally
- **Change Healthcare API** - Enterprise-grade, expensive
- **Waystar API** - Modern API, easier than EDI
- **PokitDok (formerly)** - Acquired, less reliable now

**Real-time Eligibility APIs:**
- Available from clearinghouses
- Usually $0.10-0.25 per check
- Requires clearinghouse account

**RECOMMENDATION:
- MVP: Generate superbill PDFs, manual submission
- V2 (3-6 months): Add Office Ally API for electronic claims**

---

### 7. E-Signatures ⭐⭐

**Option 1: DocuSign API**
- **Setup Time:** 4-6 hours
- **HIPAA:** BAA available
- **Cost:** $10/month per user + $0.50 per envelope
- **Pros:** Industry standard, legally binding
- **Cons:** Expensive for high volume

**Option 2: HelloSign (Dropbox Sign)**
- **Setup Time:** 3-4 hours
- **HIPAA:** BAA available (Dropbox Business)
- **Cost:** $15/month per user
- **Pros:** Simpler API than DocuSign

**Option 3: Custom HTML5 Canvas**
- **Setup Time:** 2-3 hours
- **HIPAA:** Your responsibility
- **Cost:** $0
- **Code Example:**
```javascript
// Very simple signature capture
<canvas id="signature-pad" />
const canvas = document.getElementById('signature-pad');
const signaturePad = new SignaturePad(canvas);
const dataUrl = signaturePad.toDataURL(); // Save as image
```

**RECOMMENDATION: Start with HTML5 canvas for MVP - it's actually very simple for basic signatures. Add DocuSign later if needed for legal requirements.**

---

### 8. PDF Generation (Superbills) ⭐⭐

**Option 1: Puppeteer**
- **Setup Time:** 2-3 hours
- **How:** Render HTML → PDF (headless Chrome)
- **Pros:** Beautiful PDFs, can use HTML/CSS
- **Code Example:**
```javascript
const puppeteer = require('puppeteer');
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setContent(htmlContent);
const pdf = await page.pdf({ format: 'A4' });
```

**Option 2: PDFKit**
- **Setup Time:** 3-4 hours
- **How:** Programmatic PDF generation
- **Pros:** Lighter weight than Puppeteer
- **Cons:** More code to position elements

**Option 3: React-PDF**
- **Setup Time:** 3-4 hours
- **How:** Define PDF as React components
- **Pros:** React syntax, nice abstraction

**RECOMMENDATION: Puppeteer - easiest for nice-looking superbills**

---

## ❌ DON'T USE / BUILD CUSTOM

### 9. Form Builders

**Skip TypeForm/JotForm:**
- HIPAA compliance requires paid plans
- External dependencies
- Less control

**Build Simple Custom Forms:**
- **Setup Time:** 2-3 hours with React Hook Form + Zod
- **Code Example:**
```javascript
const { register, handleSubmit } = useForm();

<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register('firstName')} />
  <input {...register('email')} />
  <button type="submit">Submit</button>
</form>
```

**RECOMMENDATION: Build custom with React Hook Form - more control, HIPAA compliant**

---

### 10. Scheduling UI

**Skip Cal.com/Calendly:**
- Patient-facing scheduling is complex to embed securely
- HIPAA concerns with external services

**Build Custom with FullCalendar:**
- **Setup Time:** 4-6 hours
- **Library:** FullCalendar (React)
- **Code Example:**
```javascript
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

<FullCalendar
  plugins={[dayGridPlugin]}
  initialView="dayGridMonth"
  events={appointments}
/>
```

**RECOMMENDATION: Build custom calendar with FullCalendar - gives you full control**

---

## 🎯 FINAL RECOMMENDATIONS

### Use These Plug & Play APIs (Will Save ~2 weeks):

1. **Daily.co** (video) - ⏱️ Saves 5-7 days
2. **Stripe Checkout** (payments) - ⏱️ Saves 1-2 days
3. **SendGrid** (email) - ⏱️ Saves 1 day
4. **Google Calendar API** (sync) - ⏱️ Nice to have, 3-4 hours
5. **Puppeteer** (PDF superbills) - ⏱️ Saves 1 day

**Total Time Saved: ~8-10 days → Makes 2-4 week timeline VERY achievable**

### Build Custom (Better Control + HIPAA):

1. **Scheduling UI** - FullCalendar (4-6 hours)
2. **Patient Forms** - React Hook Form (2-3 hours)
3. **E-Signatures** - HTML5 Canvas (2-3 hours)
4. **Patient Management** - Custom (core business logic)

### Skip for MVP (Add in V2):

1. **Insurance clearinghouse APIs** - Too complex, use manual superbills
2. **SMS reminders** - Email is enough for MVP
3. **Complex integrations** - Keep it simple

---

## 📊 Cost Breakdown (Monthly)

| Service | MVP Cost | Notes |
|---------|----------|-------|
| **GCP (Cloud Run, SQL, Storage)** | $40-100 | Pay per use |
| **Daily.co** | $0-50 | Free tier 10k min, then $2.50/1000min |
| **Stripe** | 2.9% + $0.30 | Per transaction |
| **SendGrid** | $0-15 | Free tier 100/day, or $15/month |
| **Google Calendar API** | $0 | Free with Workspace |
| **Puppeteer** | $0 | Open source library |
| **TOTAL** | **$40-165 + tx fees** | Very affordable! |

---

## 🚀 Updated Implementation Plan

### Week 1: Foundation
- **Day 1-2:** Next.js setup, auth, database
- **Day 3:** Stripe Checkout integration (1 hour!)
- **Day 4:** SendGrid email setup (2 hours!)
- **Day 5-7:** Patient onboarding forms (custom, simple)

### Week 2: Video & Calendar
- **Day 8-9:** Daily.co video integration (4-6 hours!)
- **Day 10-11:** Calendar UI with FullCalendar
- **Day 12:** Google Calendar sync (4 hours!)
- **Day 13-14:** Testing & fixes

### Week 3: Billing & Polish
- **Day 15-16:** Puppeteer superbill generation (4 hours!)
- **Day 17:** HTML5 signature capture (3 hours!)
- **Day 18-19:** UI polish
- **Day 20-21:** End-to-end testing

### Week 4: Launch
- **Day 22-28:** Fixes, documentation, training, deploy

**With plug & play APIs, this timeline is VERY achievable!**

---

## 🔑 Key Takeaways

1. **Daily.co saves ~1 week** vs custom WebRTC
2. **Stripe Checkout saves ~2 days** vs custom payment UI
3. **SendGrid saves ~1 day** vs custom email infrastructure
4. **Skip insurance APIs for MVP** - saves ~2-3 weeks
5. **Build simple custom forms** - more HIPAA control

**Bottom Line: Use plug & play for infrastructure (video, payments, email), build custom for core business logic (scheduling, patient management, forms).**

---

## 📝 Next Steps

Once you confirm you like this approach, I'll:

1. Set up Daily.co account and get API keys
2. Configure Stripe Checkout (you have account)
3. Set up SendGrid account
4. Start building with these integrations

**Ready to proceed with this plug & play strategy?**
