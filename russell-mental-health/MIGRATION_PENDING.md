# Migration Needed: Add Form Change Tracking

**Status:** Pending - Prisma engine download issue

## Changes Made to Schema

### FormSubmission Model Updates:
1. Added `submittedBy` (String?) - UserId who submitted the form
2. Added `reviewedBy` (String?) - UserId who reviewed/completed the form
3. Added `changes` (Json?) - Change log array
4. Added relationships to User model for submitter and reviewer

### FormStatus Enum Updates:
- Changed `APPROVED` → `COMPLETED` (for standard forms)
- Added `REVIEWED` (for diagnostic forms)
- Added `REJECTED` (for forms that need resubmission)
- Added better documentation for each status

### User Model Updates:
- Added `submittedForms` relationship
- Added `reviewedForms` relationship

## How to Apply Migration

When Prisma engine is working, run:

```bash
cd russell-mental-health
npx prisma migrate dev --name add_form_change_tracking
```

OR (for development):

```bash
npx prisma db push
```

## Migration SQL (Manual Alternative)

If Prisma migration fails, you can apply these changes manually:

```sql
-- Add new columns to FormSubmission
ALTER TABLE "FormSubmission" ADD COLUMN "submittedBy" TEXT;
ALTER TABLE "FormSubmission" ADD COLUMN "reviewedBy" TEXT;
ALTER TABLE "FormSubmission" ADD COLUMN "changes" JSONB;

-- Update FormStatus enum
ALTER TYPE "FormStatus" RENAME VALUE 'APPROVED' TO 'COMPLETED';
ALTER TYPE "FormStatus" ADD VALUE IF NOT EXISTS 'REJECTED';
-- Note: REVIEWED already exists in enum

-- Add foreign key constraints
ALTER TABLE "FormSubmission"
  ADD CONSTRAINT "FormSubmission_submittedBy_fkey"
  FOREIGN KEY ("submittedBy") REFERENCES "User"("id") ON DELETE SET NULL;

ALTER TABLE "FormSubmission"
  ADD CONSTRAINT "FormSubmission_reviewedBy_fkey"
  FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL;

-- Add index on status
CREATE INDEX IF NOT EXISTS "FormSubmission_status_idx" ON "FormSubmission"("status");
```

## Testing After Migration

1. Go to a patient's forms page
2. Click "Patient Information" form
3. Should see existing data pre-populated
4. Make a change and submit
5. Form should show as SUBMITTED status
6. Therapist should be able to review and complete

---

**Created:** 2025-10-31
**Author:** Claude
**Status:** Waiting for Prisma engine to be available
