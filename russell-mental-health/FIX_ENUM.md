# Database Enum Update Required

## Issue
The `FormStatus` enum in the database is missing the `COMPLETED` value.

## Quick Fix - Run on your machine:

```bash
cd russell-mental-health
npx prisma db push
```

## Manual SQL Fix (if db push doesn't work):

Connect to your PostgreSQL database and run:

```sql
-- Add COMPLETED to the enum if it doesn't exist
ALTER TYPE "FormStatus" ADD VALUE IF NOT EXISTS 'COMPLETED';

-- Verify the enum values
SELECT unnest(enum_range(NULL::\"FormStatus\"));
```

Expected result should show:
- DRAFT
- SUBMITTED
- COMPLETED
- REVIEWED
- REJECTED

## After fixing, restart your dev server:
```bash
npm run dev
```
