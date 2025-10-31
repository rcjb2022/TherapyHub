# CLAUDE.md - Development Guidelines & Preferences

**Project:** Russell Mental Health Platform
**Repository:** TherapyHub/russell-mental-health
**Branch:** `claude/therapynotes-platform-planning-011CUdbcjuxDKk4oBeqePW5V`

---

## 🎯 Core Principles

### 1. Production Code Only
- ❌ **NO mock data or simulated code**
- ❌ **NO placeholder implementations**
- ✅ **ALL code must be production-ready**
- ✅ **Real database operations only**
- ✅ **Proper error handling required**
- ✅ **HIPAA-compliant from the start**

### 2. Test Before Moving On
- ✅ **Test everything locally before proceeding**
- ✅ **Debug issues immediately when they occur**
- ✅ **Verify in browser and check console logs**
- ✅ **User must confirm feature works before moving to next task**
- ❌ **Never assume code works without testing**

### 3. Model Selection Strategy
- **Default Model:** Sonnet 4.5 (fast, efficient for most tasks)
- **For Persistent Problems:** Switch to Opus 4.1
  - Use Opus when same bug occurs 2+ times
  - Use Opus for complex debugging
  - Use Opus for architectural decisions
  - Switch back to Sonnet once problem is resolved
- **User will request model switch explicitly**

### 4. Consistency is Key
- Follow established patterns throughout codebase
- Use same form structure for all forms
- Maintain consistent error handling approach
- Keep UI/UX patterns uniform across pages
- Document any new patterns introduced

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

**Two-Step Process:**

1. **Patient Fills Out Form** (or Therapist fills on behalf of patient)
   - Form submitted with status: `SUBMITTED`
   - Goes to therapist for review

2. **Therapist Reviews & Approves**
   - Therapist sees form with "Accept & Save" button
   - Therapist can edit if needed
   - On approval: status changes to `APPROVED`
   - Only then does data update patient record

**Form Statuses:**
- `DRAFT` - Patient started but didn't submit
- `SUBMITTED` - Patient submitted, pending therapist review
- `APPROVED` - Therapist approved, data saved to patient record
- `REJECTED` - Therapist rejected, patient must resubmit

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
- Submits for therapist approval
- Other fields remain unchanged

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

---

## 🎯 Current Priorities (as of Oct 31, 2025)

### Immediate (Nov 1 Session):
1. Fix form update functionality (pre-populate existing data)
2. Implement therapist review/approval workflow
3. Build Medical History form
4. Build Insurance Information form
5. Build HIPAA Authorization form
6. Build Parental Consent form (conditional)
7. Build Payment Information form (Stripe)

### Next Priority:
1. Build diagnostic forms library infrastructure
2. Appointment scheduling system
3. Patient portal login

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
