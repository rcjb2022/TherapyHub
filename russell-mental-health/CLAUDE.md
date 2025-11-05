# CLAUDE.md - Development Guidelines & Preferences

**Project:** Russell Mental Health Platform
**Repository:** TherapyHub/russell-mental-health
**Branch:** `claude/therapynotes-platform-planning-011CUdbcjuxDKk4oBeqePW5V`

---

## 🎯 Core Principles

### 1. Production Code Only
- ❌ **NO mock data or simulated code**
- ❌ **NO placeholder implementations**
- ❌ **NO fallback code or "temporary" workarounds**
- ✅ **ALL code must be production-ready**
- ✅ **Real database operations only**
- ✅ **Proper error handling required**
- ✅ **HIPAA-compliant from the start**

**Example - What NOT to Do:**
```typescript
// ❌ BAD - Fallback code
if (isGCSConfigured) {
  fileUrl = await uploadToGCS(...)
} else {
  // Fallback to base64 for local testing
  fileUrl = `data:${file.type};base64,${base64}`
}
```

**Example - What TO Do:**
```typescript
// ✅ GOOD - Real implementation only
const fileUrl = await uploadToGCS(buffer, fileName, file.type)
return NextResponse.json({ success: true, url: fileUrl })
```

### 2. Incremental Build-Test-Iterate Approach
**CRITICAL: Break large projects into logical checkpoints and test at each step**

- ✅ **Break features into logical phases** with clear stopping points
- ✅ **Build → Test → Iterate** at each checkpoint before continuing
- ✅ **NEVER build everything before testing** - catch issues early
- ✅ **Test at stopping points** to validate functionality works
- ✅ **Wait for user confirmation** before moving to next phase
- ❌ **Never assume code works without testing**
- ❌ **Never get too far down the road** without validating functionality

**Example - Appointment Scheduling (Correct Approach):**
```
✅ Phase 1: Calendar Foundation
   - Build basic calendar with day/week/month views
   - 🚦 STOP & TEST: Calendar displays, can switch views, no errors
   - Wait for user: "Calendar works, proceed to Phase 2"

✅ Phase 2: Create Appointments
   - Build appointment creation form and API
   - 🚦 STOP & TEST: Can create appointment, appears on calendar, saves to DB
   - Wait for user: "Creating appointments works, proceed to Phase 3"

✅ Phase 3: Edit/Delete Appointments
   - Build edit and delete functionality
   - 🚦 STOP & TEST: Can edit, changes reflect, can delete
   - Wait for user: "Edit/delete works, proceed to Phase 4"

✅ Phase 4: Drag-and-Drop
   - Add drag-and-drop rescheduling
   - 🚦 STOP & TEST: Drag works, conflicts prevented
   - Wait for user: "Complete! All appointment features working"
```

**Example - What NOT to Do:**
```
❌ Bad Approach:
   - Build entire calendar system
   - Add all CRUD operations
   - Implement drag-and-drop
   - Add conflict detection
   - Add Google Calendar sync
   - THEN test everything at once

   Problem: If something breaks, hard to know where the issue is!
```

### 3. Test Before Moving On
- ✅ **Test everything locally before proceeding**
- ✅ **Debug issues immediately when they occur**
- ✅ **Verify in browser and check console logs**
- ✅ **User must confirm feature works before moving to next task**
- ❌ **Never assume code works without testing**

### 4. Model Selection Strategy
- **Default Model:** Sonnet 4.5 (fast, efficient for most tasks)
- **For Persistent Problems:** Switch to Opus 4.1
  - Use Opus when same bug occurs 2+ times
  - Use Opus for complex debugging
  - Use Opus for architectural decisions
  - Switch back to Sonnet once problem is resolved
- **User will request model switch explicitly**

### 5. Consistency is Key
- Follow established patterns throughout codebase
- Use same form structure for all forms
- Maintain consistent error handling approach
- Keep UI/UX patterns uniform across pages
- Document any new patterns introduced

---

## 🗄️ Development Environment

### Database Setup
- **Database:** PostgreSQL (via Google Cloud SQL)
- **Instance:** `therapyconnect-brrphd:us-east1:rmh-db`
- **Database Name:** `russell_mental_health`
- **Connection:** Via Cloud SQL Proxy

### Starting the Database (Required for Development)

**Terminal 1 - Start Cloud SQL Proxy:**
```bash
cd russell-mental-health
./cloud-sql-proxy therapyconnect-brrphd:us-east1:rmh-db
```
Keep this running! It will show:
```
Listening on 127.0.0.1:5432
The proxy has started successfully and is ready for new connections!
```

**Terminal 2 - Run Dev Server:**
```bash
cd russell-mental-health
npm run dev
```

### Database Schema Updates

When updating Prisma schema:
1. Make sure Cloud SQL Proxy is running
2. Run `npx prisma db push` to sync schema with database
3. Restart dev server if needed

**Important:** Always keep the Cloud SQL Proxy running while developing!

---

## 📚 Daily Documentation Requirements

### End of Each Session - ALWAYS Update:

1. **TODO.md**
   - Mark completed tasks with ✅
   - Update "In Progress" section
   - Add new tasks discovered during session
   - Update "Next Session" notes
   - Include any blockers or issues

2. **README.md**
   - Update version number if milestone reached
   - Update "Current Phase" section
   - Add completed features to relevant section
   - Update roadmap progress

3. **ABOUT.md**
   - Add to version history if significant changes
   - Update "Current Version" section
   - Document any new features or bug fixes
   - Keep roadmap synchronized

4. **Daily Recap Document**
   - Create `DAY_X_COMPLETE.md` for each major milestone
   - Document what was built
   - List bugs fixed
   - Include test results
   - Note any technical decisions made

### Commit Messages
- Clear, descriptive commit messages
- Group related changes together
- Reference issues/features being addressed
- Follow format: "Action: Description"

---

## 📖 README Structure & Conventions

### Two README Files - Different Purposes

**CRITICAL: We maintain TWO README files that serve different purposes:**

#### 1. **Main README** (`TherapyHub/README.md`) - The Source of Truth
**Location:** Repository root (TherapyHub/README.md)
**Purpose:** Complete, detailed project documentation
**Audience:** Anyone discovering the project (GitHub visitors, new developers, stakeholders)

**Style & Content:**
- ✅ **Detailed and comprehensive** - Full project overview
- ✅ **Complete feature list** - All completed work documented by day
- ✅ **Full roadmap** - All versions (0.2.0 → 1.0.0) with complete task lists
- ✅ **Technology stack** - Comprehensive list with version numbers
- ✅ **Setup instructions** - Full setup process from scratch
- ✅ **Cost analysis** - Monthly costs, savings comparison
- ✅ **Project philosophy** - Why we built this, comparisons to commercial solutions
- ✅ **Contact information** - Practice details, team info
- ✅ **All milestones** - Links to all DAY_X_COMPLETE.md documents

**Update Frequency:** ⚠️ **End of EVERY session where significant work is completed**

**What to Update:**
- Version number (header and "Current Version" section)
- Status banner at top
- Completed features organized by day
- Roadmap progress (move items from "Planned" to "Completed")
- Technology stack (when new packages added)
- Documentation links (when new docs created)
- Last updated date at bottom

---

#### 2. **Quick Reference** (`russell-mental-health/README_QR.md`) - For Active Development
**Location:** App directory (russell-mental-health/README_QR.md)
**Purpose:** Quick reference for developers already working on the project
**Audience:** Developers navigating to the app directory during active development

**Style & Content:**
- ✅ **Prominent banner** pointing to main README (🚨 emoji for visibility)
- ✅ **Quick start commands** - Just the commands, assume environment is configured
- ✅ **Documentation index** - Table with links to all relevant docs
- ✅ **Current status snapshot** - Latest version, recent achievements, what's next
- ✅ **Project structure** - Visual tree of directory structure with "You are here" marker
- ✅ **Tech stack summary** - Brief list, links to main README for details
- ❌ **No duplication** - Does NOT repeat detailed content from main README
- ❌ **No setup instructions** - Assumes developer is already set up
- ❌ **No full roadmap** - Just current status and next milestone

**Update Frequency:** ⚠️ **When main README is updated**

**What to Update:**
- Current status section (version, latest achievements, next up)
- Version number in header
- Any changes to quick start commands
- Documentation index (if new docs added)

---

### Updating Both READMEs - Step-by-Step

**When completing a session with significant changes:**

**Step 1: Update Main README** (`TherapyHub/README.md`)
```markdown
# TherapyHub - Russell Mental Health Platform

**Version:** 0.X.0 (Day X Complete)  ← Update version
**Status:** 🚀 [Feature] Complete - Ready for [Next Feature]  ← Update status

## 🎉 Project Status: Day X Complete!
← Add new completed features as bullet points

### ✅ Completed (Day X - Nov X, 2025)
← Add comprehensive section for the day's work

### 🚧 In Progress: Version 0.X.0 (Day X - Nov X, 2025)
← Move to "In Progress" section with next priorities

**Last Updated:** November X, 2025 (End of Day X)  ← Update bottom
```

**Step 2: Update Quick Reference** (`russell-mental-health/README_QR.md`)
```markdown
## 📊 Current Status (v0.X.0 - Day X Complete)  ← Update version

**Latest Achievements:**
← Update with 3-5 bullet points of recent work

**Next Up (Day X - November X, 2025):**
← Update with next priorities

**Version:** 0.X.0 | ...  ← Update footer version
```

**Step 3: Verify Consistency**
- [ ] Version numbers match in both files
- [ ] Status descriptions are consistent
- [ ] Quick Reference links correctly to Main README
- [ ] Latest achievements in Quick Reference match Main README
- [ ] Documentation links are up to date

---

### Common Mistakes to Avoid

❌ **DON'T duplicate detailed content in README_QR.md**
- Quick Reference should point to Main README, not duplicate it

❌ **DON'T forget to update BOTH files**
- Main README gets full details, Quick Reference gets status snapshot

❌ **DON'T write setup instructions in README_QR.md**
- That's in Main README only (Quick Reference assumes setup done)

❌ **DON'T skip the prominent banner in README_QR.md**
- Always keep the 🚨 banner directing to Main README

❌ **DON'T update version numbers in only one file**
- Version must be synchronized across both READMEs

✅ **DO keep README_QR.md concise and actionable**
- Commands, links, current status - that's it

✅ **DO make Main README comprehensive**
- Anyone should be able to understand the entire project from it

✅ **DO update both when milestones reached**
- End of session with significant work = update both

---

### README Checklist (End of Session)

**Main README (`TherapyHub/README.md`):**
- [ ] Version number updated in header
- [ ] Status banner updated with current state
- [ ] New "Completed (Day X)" section added if milestone reached
- [ ] Features added to relevant sections
- [ ] Roadmap updated (tasks moved from Planned → Completed)
- [ ] Technology stack updated if new packages added
- [ ] Documentation links updated if new docs created
- [ ] "Last Updated" date at bottom changed

**Quick Reference (`russell-mental-health/README_QR.md`):**
- [ ] Version number updated in "Current Status" section
- [ ] "Latest Achievements" updated with 3-5 recent items
- [ ] "Next Up" section updated with next priorities
- [ ] Documentation index updated if new docs added
- [ ] Version number updated in footer
- [ ] Prominent banner still points to Main README

---

## 📋 Forms System Requirements

### Standard Patient Forms (6 Required)
All patients must complete these forms:

1. **Patient Information**
   - Demographics, contact info, emergency contact
   - Status: ✅ Complete

2. **Medical History**
   - Current medications, past treatment, family history
   - Status: 🚧 To be built

3. **Insurance Information**
   - Primary/secondary insurance details
   - Must update Insurance table in database
   - Status: 🚧 To be built

4. **HIPAA Authorization**
   - HIPAA consent, telehealth consent, voicemail consent
   - Electronic signature required
   - Status: 🚧 To be built

5. **Parental Consent**
   - Conditional: Only for patients under 18
   - Parent/guardian signature required
   - Status: 🚧 To be built

6. **Payment Information**
   - Credit card on file (Stripe tokenization)
   - Billing address, auto-pay consent
   - Status: 🚧 To be built

### Forms Workflow - CRITICAL

**Standard Forms (6 Required) - Two Workflows:**

**Workflow A: Patient Fills Out Form**
1. Patient fills and submits → Status: `SUBMITTED`
2. Form data stored but NOT applied to patient record yet
3. Therapist reviews form (can edit if needed)
4. Therapist clicks "Complete & Save" → Status: `COMPLETED`
5. Data now updates patient record

**Workflow B: Therapist Fills Out Form**
1. Therapist fills form on behalf of patient
2. Therapist saves → Status: `COMPLETED` immediately
3. Data updates patient record (no review needed)

**Standard Form Statuses:**
- `DRAFT` - Patient started but didn't submit
- `SUBMITTED` - Patient submitted, pending therapist review
- `COMPLETED` - Final status, data saved to patient record
- `REJECTED` - Therapist rejected, patient must resubmit

**Where Therapist Reviews Forms:**
- **Priority:** On patient detail page (pending forms section)
- **Ideal:** Both patient page AND dedicated review queue at `/dashboard/pending-forms`
- If dashboard card created, make it clickable (consistency!)

**Diagnostic/Additional Forms - Different Workflow:**

**Form Statuses:**
- `DRAFT` - Patient started but didn't submit
- `SUBMITTED` - Patient submitted to therapist
- `REVIEWED` - Therapist reviewed and saved (final status)

These forms track clinical progress over time, so "REVIEWED" indicates therapist has assessed the diagnostic results.

### Form Update Requirements

**Problem:** Currently forms are blank when editing - user must re-enter all data

**Solution Required:**
- ✅ Pre-populate form with existing data when editing
- ✅ Allow partial updates (change only specific fields)
- ✅ Show "Last Updated" timestamp
- ✅ Track change history for HIPAA compliance
- ✅ Works for both patient AND therapist edits

**Example:**
- Patient moves to new address
- Opens "Update Patient Information" form
- Form shows all current data
- Patient changes only address fields
- Submits for therapist to complete
- Other fields remain unchanged

### Payment Information Form - Special Rules

**Auto-Update (No Therapist Review):**
- Patient submits payment form → Stripe tokenizes card
- If Stripe issues token successfully → Auto-update to `COMPLETED`
- Data updates patient record immediately (no therapist review needed)

**Alerts for Therapist:**
- ⚠️ Alert if payment fails (Stripe rejects card)
- ⚠️ Alert if patient removes ALL payment methods
- 💳 Show last 4 digits of card only (PCI compliance)

**Storage:**
- Never store actual card numbers in database
- Store Stripe token + last 4 digits + expiration date
- Stripe handles all sensitive card data

### Insurance Information Form - Confirmation Required

**Current Implementation (V1):**
- Patient submits insurance info → Status: `SUBMITTED`
- Therapist reviews and confirms → Status: `COMPLETED`
- Updates Insurance table in database

**Future Integration (V2):**
- Office Ally will perform automatic insurance verification
- Real-time eligibility checks (EDI 270/271)
- Auto-verify benefits and coverage

**Design Note:** Build with future Office Ally integration in mind, but manual confirmation for now.

### Version History & Change Tracking

**Standard Forms (6 Required):**
- ✅ Track WHO made changes (Patient vs Therapist + user ID)
- ✅ Track WHEN changes were made (timestamp)
- ✅ Track WHAT changed (change log: "address.street changed from X to Y")
- ❌ Do NOT store full form versions
- Purpose: HIPAA compliance and audit trail

**Diagnostic/Additional Forms:**
- ✅ Store full timestamped versions of each submission
- ✅ Track when each version was submitted
- ✅ Track who submitted (patient or therapist)
- ❌ Do NOT need detailed change logs
- Purpose: Show clinical progress/regression over time

**Example - Standard Form:**
```
Patient Information - Change Log:
- 2025-10-31 10:30 AM - Patient updated address.street: "123 Old St" → "456 New Ave"
- 2025-10-31 10:35 AM - Therapist completed form
```

**Example - Diagnostic Form (PHQ-9):**
```
PHQ-9 Depression Screening:
- Version 1: 2025-09-15 - Score: 18 (Moderate-Severe Depression)
- Version 2: 2025-10-15 - Score: 12 (Moderate Depression) ← Improvement
- Version 3: 2025-11-15 - Score: 8 (Mild Depression) ← Continued progress
```

### Diagnostic Forms Library (Version 1 Foundation, Version 2 Content)

**Version 1 - Build Infrastructure:**
- ✅ Form library system
- ✅ Ability to "assign" additional forms to specific patients
- ✅ Conditional forms (only show if assigned)
- ✅ Same review/approval workflow as standard forms
- ✅ Form completion tracking

**Version 2 - Add Content:**
- PHQ-9 (Depression screening)
- GAD-7 (Anxiety screening)
- PCL-5 (PTSD screening)
- ASRS (ADHD screening)
- Autism evaluation forms
- Immigration evaluation forms
- Other diagnostic tools

**How It Works:**
1. Therapist goes to patient's Forms page
2. Clicks "Add Diagnostic Form"
3. Selects from library (e.g., PHQ-9)
4. Form appears in patient's forms list
5. Patient fills out form
6. Therapist reviews and approves
7. Results saved and available for clinical notes

---

## 🏗️ Technical Standards

### Code Quality
- TypeScript strict mode enabled
- No `any` types (use proper typing)
- Error handling in all API routes
- Console.log for debugging (remove before production)
- Meaningful variable and function names

### Database Operations
- Always use Prisma transactions for multi-step operations
- Include audit logging for all PHI access
- Never expose sensitive data in API responses
- Validate all inputs before database operations

### Security
- All routes require authentication
- Verify user permissions before data access
- Never trust client-side data
- Sanitize all inputs
- Use environment variables for secrets

### UI/UX Consistency
- Same button styles throughout app
- Consistent form layouts
- Error messages appear at top of form
- Loading states for all async operations
- Success messages after saves

---

## 🐛 Debugging Protocol

### When Bug Occurs:

1. **First Attempt (Sonnet 4.5)**
   - Check console logs (both browser and server)
   - Verify API response in Network tab
   - Check database state with Prisma Studio
   - Review recent code changes

2. **Second Attempt (Still Sonnet)**
   - Add comprehensive logging
   - Test with simplified data
   - Check for typos/syntax errors
   - Verify all async operations complete

3. **Third Attempt (Switch to Opus 4.1)**
   - User explicitly requests: "Switch to Opus 4.1"
   - Deep dive into issue
   - Consider architectural problems
   - May require refactoring

4. **After Fix (Back to Sonnet)**
   - Verify fix works
   - Update tests
   - Document solution
   - Continue with Sonnet 4.5

### Common Issues Checklist:
- [ ] Next.js 15 params - did you await them?
- [ ] Controlled components - using value + onChange?
- [ ] API routes - proper error handling?
- [ ] Database queries - checking for null?
- [ ] Authentication - session verified?
- [ ] TypeScript errors - proper types used?

---

## 📊 Session Structure

### Start of Session:
1. Read TODO.md to understand priorities
2. Check for any notes from previous session
3. Verify development environment is running
4. Review any user-reported issues
5. Confirm which tasks to work on

### During Session:
1. Work on ONE feature at a time
2. Test immediately after implementation
3. Debug before moving on
4. Commit working code frequently
5. Update TODO.md as tasks complete

### End of Session:
1. Ensure all code is committed and pushed
2. Update all documentation (TODO, README, ABOUT)
3. Create daily recap if milestone reached
4. Leave clear notes for next session
5. Summarize what works and what's pending

---

## 🔄 Git Workflow

### Branching:
- Work on feature branch provided
- Never commit to main directly
- Descriptive branch names

### Commits:
- Commit working code frequently
- Group related changes
- Clear commit messages
- Always include what was fixed/added

### Before Committing:
- [ ] Code compiles without errors
- [ ] No TypeScript errors
- [ ] Tested locally and works
- [ ] Console.log removed (or commented)
- [ ] Documentation updated

---

## 📞 Communication Preferences

### User Expectations:
- Clear explanations of what was done
- Highlight any issues or blockers
- Ask questions if requirements unclear
- Provide specific file paths when referencing code
- Show relevant code snippets in responses

### When to Ask Questions:
- Requirements are ambiguous
- Multiple valid approaches exist
- Security/HIPAA implications
- Breaking changes needed
- User input required for decision

### What NOT to Do:
- Don't make assumptions about data
- Don't skip error handling
- Don't use mock/fake data
- Don't move on before testing
- Don't commit broken code
- **Don't assume files don't exist - ALWAYS check first**
- **Don't overwrite existing configuration files without asking**
- **Don't recreate files that might already exist**

### CRITICAL: Verify Before Creating/Modifying
**ALWAYS follow this protocol:**

1. **Check if file exists:**
   ```bash
   test -f filename && echo "EXISTS" || echo "DOES NOT EXIST"
   ```

2. **If file exists, ASK before modifying:**
   - "I see you have a .env.local file. Would you like me to add the Stripe keys to it, or do you want to add them manually?"
   - "There's an existing configuration. Should I update it or create a new one?"

3. **Read existing file before modifications:**
   - Always read the full file first
   - Understand what's already there
   - Only modify what's necessary

4. **When unsure, ASK:**
   - "Do you already have this set up?"
   - "Should I proceed with creating this, or does it exist already?"
   - Better to ask than to overwrite

**Examples of What to Verify:**
- `.env` or `.env.local` files
- Configuration files
- Package files already in place
- Existing database connections
- API keys or credentials already configured
- Any file that might contain user-specific data

---

## 🎯 Current Priorities (as of Oct 31, 2025)

### Immediate (Nov 1 Session):

**Phase 1: Fix Current Patient Information Form**
1. Add form pre-population for updates (loads existing data)
2. Implement therapist review/complete workflow
3. Add change tracking (who, when, what changed)
4. Test thoroughly with both patient and therapist workflows

**Phase 2: Build Remaining Standard Forms**
5. Medical History form (same pattern as Patient Info)
6. Insurance Information form (updates Insurance table, requires confirmation)
7. HIPAA Authorization form (with e-signature capability)
8. Parental Consent form (conditional: only if patient under 18)
9. Payment Information form (Stripe integration, auto-complete if token issued)

**Phase 3: Build Forms Library Infrastructure**
10. Diagnostic forms library table/system
11. Form assignment functionality (therapist assigns to patient)
12. Version tracking for diagnostic forms
13. Ready for diagnostic form content in V2

### After Forms Complete (Week 2):
1. Appointment scheduling system
2. Patient portal login (separate from therapist)
3. Calendar integration and reminders

---

## 📝 Notes

**Last Updated:** October 31, 2025
**Current Version:** 0.2.0
**Active Branch:** `claude/therapynotes-platform-planning-011CUdbcjuxDKk4oBeqePW5V`

**Important Patterns Established:**
- Next.js 15 requires `await params` in API routes
- Forms use controlled components (value + onChange)
- API routes include comprehensive logging
- All patient data updates require audit logs
- Gender options: male, female, other, prefer-not-to-say

---

## 🚀 Quick Reference

**Start Dev Environment:**
```bash
# Terminal 1: Cloud SQL Proxy
./cloud-sql-proxy therapyconnect-brrphd:us-east1:rmh-db

# Terminal 2: Dev Server
cd russell-mental-health && npm run dev

# Optional: Database Browser
npx prisma studio
```

**Test Credentials:**
- Email: drbethany@russellmentalhealth.com
- Password: (set during Day 1)

**Useful Commands:**
```bash
git status                  # Check what's changed
git add .                   # Stage all changes
git commit -m "message"     # Commit changes
git push                    # Push to remote
npx prisma studio          # Open DB browser
```

---

**Remember: Consistency, Testing, and Documentation are the three pillars of this project!**
