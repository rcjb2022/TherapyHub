# Russell Mental Health - Specialized Features & Requirements

**Based on:** www.RussellMentalHealth.com practice details
**Provider:** Dr. Bethany R. Russell, Ph.D., LMHC, RPT, NCC

---

## 🎯 Unique Aspects of This Practice

Dr. Russell's practice is **more complex** than a typical therapy practice due to:

1. **Specialized Assessments** (ASD, Immigration, Court)
2. **Play Therapy specialization** (RPT certified)
3. **Academic role** (FGCU Assistant Professor)
4. **Cryptocurrency acceptance** (Bitcoin, Ethereum)
5. **Legal/Court documentation** requirements

---

## 💰 Cryptocurrency Payment Integration

###Requirement
Accept **Bitcoin** and **Ethereum** for private pay sessions

### Recommended Solutions

**Option 1: Coinbase Commerce (EASIEST)**
- **Setup Time:** 2-3 hours
- **Cost:** 1% fee
- **Features:**
  - Accept BTC, ETH, USDC, DOGE
  - Automatic conversion to USD (optional)
  - Hosted checkout page
  - Webhook notifications
  - No KYC for customers
- **API Example:**
```javascript
const commerce = require('coinbase-commerce-node');
const Charge = commerce.resources.Charge;

const chargeData = {
  name: 'Therapy Session',
  description: 'Individual therapy session - 50 minutes',
  local_price: {
    amount: '150.00',
    currency: 'USD'
  },
  pricing_type: 'fixed_price',
  redirect_url: 'https://russellmentalhealth.com/payment/success',
  cancel_url: 'https://russellmentalhealth.com/payment/cancel'
};

const charge = await Charge.create(chargeData);
// Redirect patient to: charge.hosted_url
```

**Option 2: BitPay**
- **Setup Time:** 3-4 hours
- **Cost:** 1% fee
- **Features:**
  - Accept BTC, ETH, BCH, DOGE, USDC
  - Automatic USD settlement
  - Business-focused features
  - Tax reporting tools
  - Invoice system
- **Better for:** If she needs detailed tax reporting

**Option 3: Strike (Bitcoin Only)**
- **Setup Time:** 2-3 hours
- **Cost:** 0% fee (Lightning Network)
- **Features:**
  - Bitcoin-only via Lightning
  - Instant settlement
  - Lowest fees
- **Limitation:** No Ethereum support

### Recommendation
**Start with Coinbase Commerce:**
- Easiest integration
- Supports both BTC and ETH
- No customer KYC required
- Can add in Week 4 or post-MVP

### Implementation Priority
- **MVP:** Credit card (Stripe) + Insurance only
- **V2 (Week 4 or later):** Add crypto option

---

## 🧩 Specialized Assessment Workflows

### 1. ASD (Autism Spectrum Disorder) Assessments

**Dr. Russell's Credentials:**
- ADOS-2 certified (Autism Diagnostic Observation Schedule)
- MIGDAS certified (Monteiro Interview Guidelines for Diagnosing the Autism Spectrum)

**Assessment Process:**
- **Duration:** 2-4 sessions (multi-session protocol)
- **Components:**
  - Parent interview
  - ADOS-2 administration (1-2 hours)
  - Behavioral observation
  - Questionnaires (CARS, SRS, etc.)
  - Report writing (comprehensive diagnostic report)
- **Deliverable:** Comprehensive psychological evaluation report
- **Use Cases:** School accommodations, disability services, treatment planning

**Billing Codes (CPT):**
- 96110 - Developmental screening
- 96112 - Developmental test administration (first hour)
- 96113 - Developmental test administration (each additional hour)
- 96127 - Brief emotional/behavioral assessment
- 90791 - Psychiatric diagnostic evaluation

**Platform Requirements:**
- **Scheduling:** Multi-session appointment series
- **Documentation:** Structured assessment templates
- **Report Generation:** Comprehensive PDF reports (different from progress notes)
- **File Storage:** Store assessment protocols, questionnaires, raw scores
- **Billing:** Different CPT codes, higher reimbursement rates

**Implementation Timeline:**
- **MVP:** Manual scheduling, basic notes
- **V2:** Specialized ASD assessment workflow with templates

---

### 2. Immigration Mental Health Evaluations

**Purpose:** Support immigration cases (asylum, VAWA, U-Visa, hardship waivers, etc.)

**Evaluation Process:**
- **Duration:** 1-3 sessions
- **Components:**
  - Clinical interview (2-3 hours)
  - Mental status examination
  - Trauma assessment
  - Psychological testing (if needed)
  - Review of records/documents
  - Report writing (legal standard)
- **Deliverable:** Detailed psychological evaluation report for USCIS/immigration court

**Report Requirements:**
- Professional letterhead
- Detailed background/history
- Clinical findings
- DSM-5 diagnosis (if applicable)
- Prognosis
- Professional opinion on immigration case
- Must meet USCIS standards

**Platform Requirements:**
- **Documentation:** Immigration evaluation templates
- **Report Format:** Court-ready PDF with specific formatting
- **Confidentiality:** Special rules (may be submitted to courts)
- **Billing:** Usually private pay (not insurance)
- **File Storage:** Secure storage for legal documents

**Implementation Timeline:**
- **MVP:** Use standard progress notes, manual report generation
- **V2:** Immigration-specific templates and workflows

---

### 3. Social Investigations (Court-Related)

**Purpose:** Court-ordered evaluations for family law cases

**Investigation Process:**
- **Duration:** Varies by court order
- **Components:**
  - Interviews with parties
  - Observations
  - Home visits (if required)
  - Record review
  - Collateral contacts
  - Report to court
- **Deliverable:** Social investigation report for judge

**Legal Considerations:**
- Court-ordered (specific requirements)
- Subpoena-able records
- Expert witness testimony potential
- Discovery rules apply
- Confidentiality different from standard therapy

**Platform Requirements:**
- **Documentation:** Court-specific templates
- **Audit Trail:** Detailed logging (legal scrutiny)
- **Report Format:** Court-ordered format
- **Billing:** Usually paid by court or attorneys
- **Security:** Extra secure (legal proceedings)

**Implementation Timeline:**
- **MVP:** Track as special appointment type, manual documentation
- **V2:** Court investigation workflow

---

## 🎨 Play Therapy Specialization

**Dr. Russell's Credentials:**
- Registered Play Therapist (RPT)
- Primary modality for children

**Play Therapy Approach:**
- Child-centered play therapy
- Expressive arts
- Developmentally appropriate
- Non-directive and directive techniques
- Parent consultation

**Documentation Needs:**
- **Progress Notes:** Different from talk therapy
  - Play activities used
  - Themes observed
  - Child's behavior/affect
  - Interpretations
  - Parent consultation notes
- **Treatment Plans:** Developmentally appropriate goals
- **Outcome Measurement:** Play-based assessments

**Platform Requirements:**
- **Session Notes:** Play therapy-specific templates
  - Activity log
  - Theme tracking
  - Developmental observations
- **Parent Communication:** Separate parent consultation notes
- **Treatment Planning:** Child-appropriate goal templates

**Implementation Timeline:**
- **MVP:** Standard progress notes with notes field
- **V2:** Play therapy-specific templates and tracking

---

## 📚 Academic Role Considerations

**Dr. Russell's Dual Role:**
- Private practitioner
- Assistant Professor at Florida Gulf Coast University
- President, Florida Association of Counselor Educators

**Scheduling Implications:**
- May have irregular availability (teaching schedule)
- Academic calendar (semester breaks, finals week)
- Conference travel
- Research commitments

**Platform Requirements:**
- **Flexible Scheduling:** Block out academic commitments
- **Availability Management:** Easy to mark unavailable times
- **Calendar Integration:** Sync with Google Calendar (academic + clinical)

**Implementation:**
- MVP includes this via Google Calendar sync ✅

---

## 📊 CPT Codes for Specialized Services

### Standard Therapy
- 90791 - Diagnostic evaluation
- 90832 - Psychotherapy, 30 min
- 90834 - Psychotherapy, 45 min (most common)
- 90837 - Psychotherapy, 60 min
- 90846 - Family therapy without patient
- 90847 - Family therapy with patient

### Play Therapy
- Same codes as above (play therapy is a modality, not separate code)
- May use 90846/90847 for parent sessions

### ASD Assessments
- 96110 - Developmental screening ($20-40)
- 96112 - Developmental test admin, first hour ($75-150)
- 96113 - Each additional hour ($50-100)
- 96127 - Brief emotional/behavioral assessment ($15-30)
- 90791 - Diagnostic evaluation ($150-300)

### Immigration/Court Evaluations
- Usually billed privately, not insurance
- Flat fees: $500-2500 depending on complexity

---

## 🎯 MVP vs. V2 Feature Planning

### MVP (Week 1-3):
**Include:**
- ✅ Standard therapy sessions (90834, 90837, 90846, 90847)
- ✅ Individual, couples, family appointment types
- ✅ Insurance billing for standard therapy
- ✅ Credit card payments (Stripe)
- ✅ Basic progress notes (SOAP format)
- ✅ Patient onboarding
- ✅ Video sessions
- ✅ Google Calendar sync
- ✅ Document storage

**Exclude (Manual Workaround):**
- ❌ ASD assessment workflows (schedule as multiple standard appointments)
- ❌ Immigration evaluation templates (use regular notes, export to Word for formatting)
- ❌ Court investigation tracking (use appointment notes field)
- ❌ Play therapy-specific templates (use regular progress notes)
- ❌ Cryptocurrency payments (accept manually, track in system)

### V2 (Post-MVP):
**Add in Priority Order:**
1. **Cryptocurrency integration** (Week 4 or Month 2) - 2-3 days
2. **Play therapy templates** (Month 2) - 2-3 days
3. **ASD assessment workflow** (Month 2-3) - 1 week
4. **Immigration evaluation templates** (Month 3) - 3-4 days
5. **Court investigation tracking** (Month 3-4) - 3-4 days

---

## 📋 Additional Information Needed

### For Insurance Billing:
- [ ] Dr. Russell's NPI number (National Provider Identifier)
- [ ] Practice Tax ID / EIN
- [ ] Current payer enrollment status:
  - [ ] Aetna - enrolled?
  - [ ] Cigna - enrolled?
  - [ ] Florida Blue/BCBS - enrolled?
  - [ ] Medicare - enrolled?
  - [ ] UnitedHealthcare/Optum - enrolled?
  - [ ] CCA Referrals - enrolled?
- [ ] CAQH profile (required by many payers)

### For Specialized Services:
- [ ] Typical fee schedule for ASD assessments (how much does she charge?)
- [ ] Immigration evaluation fee structure
- [ ] Court investigation fee structure
- [ ] How are these currently billed/tracked?

### For Crypto Payments:
- [ ] Does she currently accept crypto? If so, what's the process?
- [ ] Does she want automatic USD conversion or hold crypto?
- [ ] What percentage of patients pay via crypto?

---

## 🚀 Implementation Strategy

### Phase 1: MVP (Weeks 1-3)
**Goal:** Get core therapy practice functional
- Standard therapy sessions only
- Insurance + credit card payments only
- Basic documentation
- Video sessions
- Patient onboarding

**Specialized services handled manually:**
- ASD assessments = schedule as 2-3 regular appointments
- Immigration evals = use regular progress notes
- Crypto = accept offline, manually record payment

### Phase 2: Specialized Features (Month 2-3)
**Goal:** Add practice-specific enhancements
- Crypto payment integration
- Play therapy templates
- ASD assessment workflows
- Immigration/court templates

### Phase 3: Advanced Features (Month 4+)
**Goal:** Optimize and scale
- Outcome measurement tools
- Advanced reporting
- Research data collection (if needed for academic work)
- Student practicum management (if she supervises students)

---

## 💡 Key Insights

1. **Dr. Russell's practice is more complex than typical** due to specialized assessments
2. **MVP should focus on standard therapy** - 90% of her work
3. **Specialized services can be added iteratively** after core works
4. **Crypto is nice-to-have** - don't let it block launch
5. **Play therapy documentation** can use standard notes initially
6. **Insurance billing is still #1 priority** - most revenue comes from standard therapy sessions

---

**Recommendation:** Build MVP for standard therapy practice first (Week 1-3), then add specialized features based on Dr. Russell's feedback (Week 4+).

This approach gets her operational quickly while leaving room for practice-specific enhancements!
