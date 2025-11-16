# Day 11 Quick Start Prompts

**Date:** November 17, 2025
**Version:** 0.10.0 → 0.10.0 (Complete)
**Goal:** Testing, Polish & Documentation
**Estimated Time:** 10-13 hours (full day)

---

## 🚀 Start of Session Prompt

**Copy/Paste This to Start Day 11:**

```
Hello Claude! Today is Day 11 (November 17, 2025).

READ FIRST:
1. /home/user/TherapyHub/docs/sessions/HANDOFF_DAY_11.md
2. /home/user/TherapyHub/docs/TODO.md
3. /home/user/TherapyHub/docs/CLAUDE.md

CONTEXT:
- Day 10 completed: Security hardening (10 commits, 8 bugs fixed)
- Day 10 deferred: Testing, UI/UX polish, performance, documentation
- Today's focus: Complete v0.10.0 with all testing and polish

TEST CREDENTIALS:
- Email: dr.russell@russellmentalhealth.com
- Password: (set during Day 1)
- NOTE: drbethany email is REAL, not a test account!

START WITH:
Priority 1 - Session Timeout Testing (1 hour)
```

---

## 📋 Quick Reference Checklist

### Phase 1: Session Timeout Testing (1 hour)

**Prompt:**
```
Let's test the session timeout functionality. To do this efficiently:

1. Temporarily reduce session timeouts in lib/auth.ts:
   - PATIENT: 2 minutes
   - THERAPIST: 5 minutes
   - ADMIN: 3 minutes

2. Test therapist session:
   - Log in as dr.russell@russellmentalhealth.com
   - Wait ~4 minutes
   - Verify warning modal appears
   - Verify countdown timer (MM:SS)
   - Click "Stay Logged In"
   - Verify session extends

3. Test auto-logout:
   - Log in again
   - Wait for full timeout
   - Verify redirect to /login?expired=true

4. Restore original timeouts (60min/8hrs/4hrs)

5. COMMIT: "Test and validate session timeout functionality"

Let's start with step 1 - update the session timeouts for testing.
```

---

### Phase 2: Dependency Update (1 hour)

**Prompt:**
```
Let's update all dependencies to latest versions:

1. Run: npm outdated

2. Review the output and tell me:
   - Which packages have updates available?
   - Are there any security vulnerabilities?

3. Run: npm update (non-breaking updates)

4. For major version updates, we'll update one at a time:
   - npm install package-name@latest
   - Test after each

5. After all updates, test critical workflows:
   - Login
   - Create patient
   - Create appointment
   - Video session page loads
   - AI features

6. COMMIT: "Update dependencies to latest versions"

Let's start with npm outdated.
```

---

### Phase 3: End-to-End Testing (3-4 hours)

**Prompt for 3.1 - Patient Onboarding:**
```
Let's test the complete patient onboarding workflow:

SETUP:
1. Open browser to http://localhost:3000
2. Log in as dr.russell@russellmentalhealth.com

TEST CHECKLIST:
1. Create new patient:
   - Click "Patients" → "Add New Patient"
   - Fill in: Test Patient (first name), Smith (last name)
   - Email: testpatient@example.com
   - Save

2. Navigate to patient detail page

3. Upload documents:
   - Insurance card (front + back)
   - Government ID
   - Verify files upload successfully
   - Check that gcsPath is stored (not signed URL)

4. Complete a form as therapist:
   - Fill in patient information
   - Save as COMPLETED
   - Verify data updates in database

5. Authorization tests:
   - Open incognito window
   - Try to access patient detail page directly
   - Should get 403 or redirect to login

Document results with ✅ or ❌ for each step.

Ready to begin?
```

**Prompt for 3.2 - Appointments:**
```
Let's test the appointment scheduling workflow:

1. Go to Calendar page
2. Create new appointment:
   - Click time slot
   - Select patient
   - Choose telehealth
   - Enter CPT code: 90834
   - Save

3. Edit appointment:
   - Click appointment
   - Change time
   - Verify changes

4. Drag-and-drop:
   - Drag appointment to new time
   - Verify updates

5. Create recurring appointment:
   - Weekly for 4 weeks
   - Verify all 4 appear

6. Delete appointment:
   - Click → Delete
   - Verify removed

Document results.
```

**Prompt for 3.3 - Video Sessions:**
```
Let's test video sessions with 2-tab test:

TAB 1 (Therapist):
1. Create telehealth appointment (next 30 min)
2. Go to video session page
3. Allow camera/microphone
4. See waiting room

TAB 2 (Patient - Incognito):
1. Log in as patient
2. Go to video session page
3. Allow camera/microphone
4. Join session

VERIFY:
- WebRTC connection establishes
- Both see each other's video
- Recording starts
- End session works
- Recording saved to GCS

Document results and any errors.
```

**Prompt for 3.4 - AI Features:**
```
Let's test the AI processing pipeline:

1. Go to Session Vault
2. Find recent recording
3. Generate Transcript:
   - Click button
   - Wait for completion
   - Verify Therapist/Patient labels
   - Verify session date correct

4. Generate Clinical Notes (SOAP):
   - Click "Generate Notes"
   - Select SOAP
   - Verify all sections present
   - Verify no placeholder text

5. Generate Summary:
   - Click "Generate Summary"
   - Verify plain text (no JSON)

6. Translate to Spanish:
   - Click "Translate"
   - Select Spanish
   - Verify translation accurate
   - Verify no markdown code blocks

7. Test Copy functionality:
   - Copy transcript
   - Copy notes
   - Copy summary
   - Paste to verify

Document results and any errors.
```

**Prompt for 3.5 - Billing:**
```
Let's test billing workflows:

1. Charge patient $100:
   - Go to patient page
   - Click "Charge Card"
   - Enter $100, description: "Session 11/17/25"
   - Submit
   - Verify balance updates

2. Patient pays:
   - Switch to patient account (incognito)
   - Go to Billing page
   - Verify $100 balance shown
   - Pay with saved card
   - Verify balance = $0

3. Prepayment:
   - Pay additional $100
   - Verify shows as credit (-$100)
   - Verify display: "Account Credit"

4. Refund:
   - Switch back to therapist
   - Find transaction
   - Refund $50
   - Verify balance adjusts

Document results.
```

---

### Phase 4: UI/UX Polish (2-3 hours)

**Prompt for 4.1 - Loading States:**
```
Let's add loading states throughout the app:

1. Install react-hot-toast:
   npm install react-hot-toast

2. Add Toaster to dashboard layout:
   - File: app/(dashboard)/dashboard/layout.tsx
   - Import: import { Toaster } from 'react-hot-toast'
   - Add: <Toaster position="top-right" />

3. Add loading skeletons to:
   - Dashboard stat cards (app/(dashboard)/dashboard/page.tsx)
   - Patient list (app/(dashboard)/dashboard/patients/page.tsx)
   - Calendar (components/AppointmentCalendar.tsx)

Pattern:
{loading ? (
  <div className="animate-pulse bg-gray-200 h-20 rounded-lg" />
) : (
  <ActualContent />
)}

COMMIT after each file: "Add loading states to [component]"

Let's start with the dashboard layout and Toaster.
```

**Prompt for 4.2 - Error Messages:**
```
Let's improve error messages:

Create a helper function:
File: lib/error-messages.ts

export function getUserFriendlyError(error: any): string {
  const errorMessage = error?.message || error?.toString() || ''

  if (errorMessage.includes('ERR_NETWORK')) {
    return 'Connection issue. Please check your internet and try again.'
  }
  if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
    return "You don't have permission to view this. Please contact your therapist."
  }
  if (errorMessage.includes('500') || errorMessage.includes('Internal')) {
    return 'Something went wrong. Please try again or contact support.'
  }
  if (errorMessage.includes('JWT') || errorMessage.includes('token')) {
    return 'Your session has expired. Please log in again.'
  }
  if (errorMessage.includes('ExpiredToken')) {
    return 'This link has expired. Generating a new one...'
  }

  return 'An error occurred. Please try again.'
}

Then update error displays in:
- Dashboard page
- Patient pages
- Video session
- AI features

COMMIT: "Add user-friendly error messages"
```

**Prompt for 4.3 - Success Notifications:**
```
Add success notifications using toast:

Examples:
import toast from 'react-hot-toast'

// In patient creation:
toast.success('Patient created successfully')

// In appointment creation:
toast.success('Appointment scheduled')

// In billing:
toast.success(`Payment received - $${amount}`)

// In AI generation:
toast.success('Transcript generated')
toast.success('Clinical notes generated')

Update all success actions in:
- Patient CRUD
- Appointments
- Billing
- AI features
- Session timeout extend

COMMIT: "Add success toast notifications"
```

**Prompt for 4.4 - Help System:**
```
Let's create a Tooltip component and add help text:

1. Create components/Tooltip.tsx (see HANDOFF_DAY_11.md for code)

2. Add tooltips to:
   - Dashboard stats
   - CPT code field
   - Session Vault heading
   - Document categories
   - Payment fields

Example:
<label className="flex items-center gap-1">
  CPT Code
  <Tooltip content="Common codes: 90834 (45min), 90837 (60min)" />
</label>

COMMIT: "Add in-app help system with tooltips"
```

---

### Phase 5: Performance (1-2 hours)

**Prompt for 5.1 - Lighthouse:**
```
Let's run Lighthouse audits:

1. Open Chrome DevTools → Lighthouse
2. Generate reports for:
   - Dashboard: http://localhost:3000/dashboard
   - Patients: http://localhost:3000/dashboard/patients
   - Calendar: http://localhost:3000/dashboard/calendar

3. Share the scores for:
   - Performance
   - Accessibility
   - Best Practices
   - SEO

4. If any score < 90, we'll identify and fix issues.

Let's start with the dashboard page.
```

**Prompt for 5.2 - Database Optimization:**
```
Let's review and optimize database queries:

1. Check current Prisma queries in:
   - app/api/patients/route.ts
   - app/api/appointments/route.ts
   - app/(dashboard)/dashboard/page.tsx

2. Look for:
   - Missing `select` (fetching all fields)
   - Missing pagination (`take`, `skip`)
   - Deep includes (too many relations)

3. Add indexes to schema.prisma if missing:
   @@index([therapistId])
   @@index([patientId])
   @@index([startTime])

4. Run: npx prisma db push

COMMIT: "Optimize database queries and add indexes"
```

---

### Phase 6: Documentation (2 hours)

**Prompt for 6.1 - User Guides:**
```
Let's create user guides:

1. Therapist Quick Start Guide:
   File: /docs/guides/THERAPIST_QUICK_START.md
   Sections:
   - Getting Started (login)
   - Dashboard Overview
   - Managing Patients
   - Scheduling Appointments
   - Video Sessions
   - AI Clinical Documentation
   - Billing

2. Patient Quick Start Guide:
   File: /docs/guides/PATIENT_QUICK_START.md
   Sections:
   - First Login
   - Completing Intake Forms
   - Appointments
   - Joining Video Sessions
   - Making Payments
   - Privacy & Security

3. Video Session Troubleshooting:
   File: /docs/guides/VIDEO_SESSION_TROUBLESHOOTING.md
   Sections:
   - System Requirements
   - Common Issues (camera, audio, connection)
   - Google Meet Fallback
   - Support Contact

Use the templates in HANDOFF_DAY_11.md.

COMMIT: "Add user documentation guides"
```

**Prompt for 6.2 - Technical Docs:**
```
Let's update technical documentation:

1. Update ABOUT.md:
   - Add "Version 0.10.0 (November 16, 2025)" section
   - List all security improvements
   - List all testing completed
   - List all UI/UX improvements

2. Update README.md:
   - Update version: 0.10.0
   - Update status: "Security hardened and tested"
   - Add Day 10-11 completed features

3. Update README_QR.md:
   - Update "Current Status" section
   - Update "Latest Achievements"
   - Update "Next Up" to Day 12

COMMIT: "Update technical documentation for v0.10.0"
```

---

## 🎯 Final Checkpoint

**Prompt:**
```
Before we wrap up Day 11, let's verify everything:

CHECKLIST:
- [ ] Session timeout tested and working
- [ ] Dependencies updated (npm outdated shows nothing critical)
- [ ] All 5 end-to-end workflows tested
- [ ] Loading states added
- [ ] Error messages improved
- [ ] Success notifications added
- [ ] Help tooltips added
- [ ] Lighthouse scores >90 (or issues documented)
- [ ] Database queries optimized
- [ ] User guides created (3 files)
- [ ] Technical docs updated (ABOUT, README, README_QR)

Once confirmed, we'll:
1. Create final commit
2. Push to remote
3. Prepare for merge to main

Are we ready?
```

---

## 📝 End of Day Prompt

**Prompt:**
```
Day 11 is complete! Let's wrap up:

1. Create DAY_11_COMPLETE.md following CLAUDE.md format
2. Update TODO.md with Day 11 completion
3. Create HANDOFF_DAY_12.md for next session
4. Final commit and push

After that, we'll be ready for Day 12: Insurance Billing Integration (Office Ally API).
```

---

## 🔗 Reference Links

**Key Files:**
- HANDOFF: `/home/user/TherapyHub/docs/sessions/HANDOFF_DAY_11.md`
- TODO: `/home/user/TherapyHub/docs/TODO.md`
- GUIDELINES: `/home/user/TherapyHub/docs/CLAUDE.md`
- DAY 10 SUMMARY: `/home/user/TherapyHub/docs/daily/DAY_10_COMPLETE.md`

**Server Commands:**
```bash
# Terminal 1
cd /home/user/TherapyHub/russell-mental-health
./cloud-sql-proxy therapyconnect-brrphd:us-east1:rmh-db

# Terminal 2
npm run dev
```

**Test Account:**
- Email: dr.russell@russellmentalhealth.com
- Password: (set during Day 1)

---

**Remember:**
- ✅ Test after EVERY change
- ✅ Commit working code frequently
- ✅ Use test account (NOT drbethany email)
- ✅ Follow incremental build-test-iterate approach
- ✅ Document all test results (✅ or ❌)

Good luck with Day 11! 🚀
