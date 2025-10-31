# TODO List - October 31, 2025

## ✅ COMPLETED TODAY

### Forms System - All 7 Standard Intake Forms
- [x] Fixed client/server component separation issue (async params)
- [x] Created Patient Information form with pre-population
- [x] Created Medical History form with pre-population
- [x] Created Mental Health History form with pre-population (psychiatrist, medications, safety assessment)
- [x] Created Insurance Information form with pre-population
- [x] Created HIPAA Authorization form with pre-population (e-signature, consents)
- [x] Created Payment Information form with pre-population (Stripe placeholder)
- [x] Created Parental Consent form with pre-population (for minors under 18)
- [x] All forms include:
  - Pre-population logic (loads existing data)
  - Update vs Complete UI modes
  - Blue "Updating existing information" badge
  - Consistent styling and validation
  - Required field marking (*)
  - Error handling and loading states
- [x] Fixed "Patient not found" error (async params in all page.tsx files)
- [x] Verified all forms save and pre-populate correctly

---

## 🚧 IN PROGRESS / TODO TODAY

### Phase 1: Complete Core Forms Workflow ⚡ (HIGH PRIORITY - DO FIRST)
**Goal:** Therapist can review and complete submitted patient forms

- [ ] **Add therapist review UI:**
  - [ ] Show forms with SUBMITTED status on patient detail page
  - [ ] Add "Review" button next to submitted forms
  - [ ] Create review page/modal that displays submitted form data
  - [ ] Allow therapist to edit form data if needed
  - [ ] Add "Complete & Save to Patient Record" button

- [ ] **Implement complete workflow logic:**
  - [ ] When therapist clicks "Complete", status changes to COMPLETED
  - [ ] Update patient record with form data (Insurance table, etc.)
  - [ ] Track who completed the form (submittedBy, reviewedBy fields)
  - [ ] Show completion timestamp

- [ ] **Update forms list display:**
  - [ ] Show different badges for each status (Draft, Submitted, Completed)
  - [ ] Color coding: yellow for pending, green for completed
  - [ ] Display "Pending Review" vs "Completed" clearly

- [ ] **Test complete workflow:**
  - [ ] Patient fills form → SUBMITTED status
  - [ ] Therapist reviews → can see all data
  - [ ] Therapist completes → COMPLETED status
  - [ ] Data updates patient record
  - [ ] Verify change tracking works

---

### Phase 2: Stripe Payment Integration 💳 (DO SECOND)
**Goal:** Secure payment processing with Stripe Elements

- [ ] **Install and configure Stripe:**
  - [ ] Install @stripe/stripe-js and @stripe/react-stripe-js
  - [ ] Set up Stripe provider in app
  - [ ] Configure test API keys (already have them)
  - [ ] Create Stripe webhook endpoint for events

- [ ] **Create Stripe Elements components:**
  - [ ] Create PaymentMethodInput component with Stripe Elements
  - [ ] Add CardElement for secure card input
  - [ ] Style to match existing form design
  - [ ] Add loading and error states

- [ ] **Update Payment Information form:**
  - [ ] Replace placeholder card fields with Stripe Elements
  - [ ] Tokenize card on submit (NEVER store actual card numbers!)
  - [ ] Store Stripe token + last 4 digits + expiration
  - [ ] Auto-complete payment form when Stripe succeeds (per CLAUDE.md)
  - [ ] Handle Stripe errors gracefully with user-friendly messages

- [ ] **Add payment method management:**
  - [ ] View saved payment methods (last 4 digits only)
  - [ ] Add new payment method
  - [ ] Update existing payment method
  - [ ] Remove payment method (with warning if last one)
  - [ ] Set default payment method

- [ ] **Test Stripe integration:**
  - [ ] Test successful card tokenization
  - [ ] Test Stripe test cards (4242 4242 4242 4242)
  - [ ] Test card decline scenarios
  - [ ] Test error handling
  - [ ] Verify PCI compliance (no card data in database)

---

### Phase 3: Review & Polish ✨ (DO THIRD)
**Goal:** Review all forms for textual improvements and polish UX

- [ ] **User reviews all 7 forms for text changes:**
  - [ ] Patient Information - review wording, labels, descriptions
  - [ ] Medical History - review questions and field labels
  - [ ] Mental Health History - review sensitive language
  - [ ] Insurance Information - review insurance terminology
  - [ ] HIPAA Authorization - review legal language
  - [ ] Payment Information - review fee agreement text
  - [ ] Parental Consent - review parental rights language

- [ ] **Make requested textual changes:**
  - [ ] Update form titles and descriptions
  - [ ] Improve field labels for clarity
  - [ ] Fix any typos or grammar issues
  - [ ] Ensure consistent terminology across all forms

- [ ] **Test complete end-to-end workflow:**
  - [ ] Patient submits all 7 forms
  - [ ] Therapist reviews all forms
  - [ ] Therapist completes all forms
  - [ ] Data updates patient record correctly
  - [ ] Insurance table updates
  - [ ] Payment information saves securely
  - [ ] All pre-population works on updates

- [ ] **Fix any discovered bugs:**
  - [ ] Address any issues found during testing
  - [ ] Verify all error messages are user-friendly
  - [ ] Ensure loading states display correctly

---

### Phase 4: Patient Portal Access 👥 (DO LAST IF TIME)
**Goal:** Patients can access and submit their own forms

- [ ] **Create patient dashboard:**
  - [ ] Patient sees their pending forms
  - [ ] Patient can click to complete each form
  - [ ] Patient sees form status (Draft, Submitted, Completed)
  - [ ] Patient cannot access other patients' forms

- [ ] **Update forms access control:**
  - [ ] Verify patient can only access their own forms
  - [ ] Patient can view completed forms (read-only)
  - [ ] Patient can update submitted forms before therapist completes
  - [ ] Patient cannot edit forms after COMPLETED status

- [ ] **Add patient notifications:**
  - [ ] Show badge/count of pending forms
  - [ ] Show which forms are required
  - [ ] Show which forms have been completed

- [ ] **Test patient workflow:**
  - [ ] Patient logs in
  - [ ] Patient sees forms dashboard
  - [ ] Patient completes forms
  - [ ] Forms submit to therapist successfully
  - [ ] Patient can view completed forms

---

## 📝 NOTES

### Technical Decisions Made Today:
- Used client/server component separation for Next.js 15+ App Router
- All forms follow consistent pattern (pre-population, update mode, validation)
- Async params must be awaited in page.tsx files
- Mental Health History form includes psychiatrist/medications as requested
- Parental Consent form added for minors under 18

### Next Session Priorities:
1. Complete therapist review workflow (critical path)
2. Integrate Stripe payment processing (hardest technical work)
3. Review and polish all form text
4. Add patient portal access if time allows

### Context Usage:
- Used: ~100k tokens (50%)
- Remaining: ~100k tokens (50%)
- Good buffer for remaining work

---

## 🎯 SUCCESS CRITERIA FOR TODAY

**Minimum (Must Have):**
- ✅ All 7 forms created and working
- ✅ Forms save and pre-populate correctly
- ✅ No "patient not found" errors
- [ ] Therapist can review and complete forms
- [ ] Stripe integration working with test cards

**Stretch Goals (Nice to Have):**
- [ ] All textual changes reviewed and applied
- [ ] Patient portal access implemented
- [ ] Complete end-to-end workflow tested

---

**END OF DAY: Commit all work, push to branch, update documentation**
