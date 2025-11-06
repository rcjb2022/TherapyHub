# Day 6 Development Plan - Appointment Scheduling System
**Date:** November 5, 2025
**Version:** 0.6.0 Target
**Approach:** Google Calendar API Integration (Hybrid Architecture)
**Status:** APPROVED - Ready to implement

---

## 🎯 Executive Summary

**Goal:** Build production-ready appointment scheduling system using Google Calendar API + FullCalendar UI

**Why Google Calendar Integration:**
- ✅ Appointments sync to therapist's phone/watch/device automatically
- ✅ Patients receive calendar invites on their devices
- ✅ Google Meet links generated automatically (fallback for WebRTC)
- ✅ Recurring appointments handled by Google (complex logic solved)
- ✅ Native notifications work out of the box
- ✅ Practice can see patients IMMEDIATELY after Day 6 completion
- ✅ Cross-device sync automatic

**Architecture:**
```
Our Database (Appointments table) - Clinical data, CPT codes, notes
    ↕️ (two-way sync)
Google Calendar API (DrBethany@RussellMentalHealth.com) - Scheduling source of truth
    ↕️ (display)
FullCalendar UI - Beautiful in-app interface
```

---

## ⚙️ Configuration Decisions (APPROVED)

### Google Calendar Setup:
- **Primary Calendar:** DrBethany@RussellMentalHealth.com (Google Workspace account)
- **OAuth Credentials:** ALREADY CREATED ✅ (Client ID + Secret available)
- **Future Therapists:** Each gets own Google Workspace account (DrFirstname@RussellMentalHealth.com)

### Appointment Settings:
- **Available Hours:** 8 AM - 8 PM, 7 days/week
- **Time Slots:** 15-minute intervals
- **Back-to-Back:** ALLOWED (therapists end early)
- **Default View:** Current week view
- **Default Therapist:** Dr. Bethany R. Russell, Ph.D.
- **Multi-Therapist:** Supported (dropdown selection)

### Recurring Appointments:
- **Importance:** HIGH - Most patients book recurring schedules
- **Max Duration:** 90 days unless specifically stated otherwise
- **Options:** None, Weekly, Bi-weekly, Monthly
- **Handled By:** Google Calendar (we just pass the recurrence rule)

### Notifications:
- **Calendar Invites:** Google Calendar sends automatically ✅
- **Custom Emails:** Nice-to-have for later (when we scale)
- **Patient Receives:** Google Calendar invite with Meet link

### Nice-to-Have Features (If Easy):
- Buffer time indicator (yellow line for back-to-back appointments)
- Custom appointment confirmation emails
- Patient dashboard appointment widget

---

## 📋 Phase-by-Phase Implementation Plan

### Phase 1: Google Calendar API Setup (2 hours)

**Objective:** Connect to Google Calendar API and test basic operations

#### 1.1 - Environment Configuration (15 min)
**Tasks:**
- Add OAuth credentials to `.env.local`:
  ```env
  GOOGLE_CLIENT_ID="[existing client id]"
  GOOGLE_CLIENT_SECRET="[existing client secret]"
  GOOGLE_CALENDAR_ID="drbethany@russellmentalhealth.com"
  GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
  ```
- Verify Google Calendar API is enabled in GCP project
- Check OAuth scopes include:
  - `https://www.googleapis.com/auth/calendar`
  - `https://www.googleapis.com/auth/calendar.events`

#### 1.2 - Install Packages (15 min)
```bash
npm install googleapis
npm install @fullcalendar/core @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction @fullcalendar/google-calendar
```
- Verify no dependency conflicts
- Check package.json updates
- Test dev server still starts

#### 1.3 - Google Calendar Service Library (1 hour)
**Create:** `lib/google-calendar.ts`

**Functions to implement:**
```typescript
// Initialize Google Calendar client
export function getCalendarClient(): calendar_v3.Calendar

// Create calendar event with Google Meet link
export async function createCalendarEvent(params: {
  summary: string          // "Patient: John Doe - Initial Consultation"
  description: string      // Notes, CPT code
  startTime: Date
  endTime: Date
  attendees: string[]      // [patient email]
  recurrence?: string[]    // ["RRULE:FREQ=WEEKLY;COUNT=13"] for recurring
}): Promise<{ eventId: string; meetLink: string }>

// Update calendar event
export async function updateCalendarEvent(
  eventId: string,
  updates: Partial<CalendarEvent>
): Promise<void>

// Delete calendar event
export async function deleteCalendarEvent(
  eventId: string,
  deleteAll?: boolean  // For recurring events
): Promise<void>

// List events in date range
export async function listCalendarEvents(
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]>

// Check for scheduling conflicts
export async function checkConflicts(
  startTime: Date,
  endTime: Date,
  excludeEventId?: string
): Promise<boolean>
```

**Key Implementation Details:**
- Use service account authentication
- Always include `conferenceData` to generate Meet links
- Handle Google Calendar API rate limits
- Proper error handling with descriptive messages
- Audit logging for all calendar operations

#### 1.4 - Test Google Calendar API (30 min)
**Create test script or API endpoint:**
- Create test appointment via API
- Verify appears in DrBethany@RussellMentalHealth.com calendar
- Verify Google Meet link is generated
- Test updating event
- Test deleting event
- Test listing events

**🚦 STOP & TEST - Phase 1 Checkpoint:**
- [ ] `.env.local` has Google OAuth credentials
- [ ] Can initialize Google Calendar client without errors
- [ ] Can create event in Google Calendar via our code
- [ ] Event appears in Dr. Bethany's Google Calendar (check web interface)
- [ ] Google Meet link is automatically generated
- [ ] Can read events back from Google Calendar
- [ ] Can update and delete events
- [ ] No console errors

**USER APPROVAL REQUIRED:** "Phase 1 working, proceed to Phase 2"

---

### Phase 2: Database Model + Basic UI (2 hours)

**Objective:** Create Appointment model and basic calendar interface

#### 2.1 - Appointment Prisma Model (30 min)
**Update:** `prisma/schema.prisma`

```prisma
model Appointment {
  id                String   @id @default(cuid())
  patientId         String
  therapistId       String   // User.id of therapist
  startTime         DateTime
  endTime           DateTime
  duration          Int      // Minutes: 30, 45, 60, 90
  type              String   // "initial", "follow-up", "assessment", "family"
  status            String   @default("scheduled") // "scheduled", "completed", "cancelled", "no-show"
  cptCode           String?  // "90791", "90834", etc.
  notes             String?  @db.Text

  // Google Calendar Integration
  googleEventId     String   @unique  // Links to Google Calendar event
  googleMeetLink    String?  // Store the Meet link

  // Recurring Appointments
  isRecurring       Boolean  @default(false)
  recurringPattern  String?  // "weekly", "biweekly", "monthly"
  recurringParentId String?  // First event in recurring series
  recurringUntil    DateTime? // End date for recurrence (max 90 days)

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  patient           Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)
  therapist         User     @relation("TherapistAppointments", fields: [therapistId], references: [id])

  @@index([patientId])
  @@index([therapistId])
  @@index([startTime])
  @@index([status])
}

// Update User model to add relation
model User {
  // ... existing fields ...
  appointments      Appointment[] @relation("TherapistAppointments")
}
```

**Tasks:**
- Add Appointment model to schema
- Add relation to User model
- Run `npx prisma db push`
- Verify in Prisma Studio (new Appointment table exists)
- Test creating appointment record manually in Studio

#### 2.2 - Calendar Page (Server Component) (30 min)
**Create:** `app/(dashboard)/dashboard/calendar/page.tsx`

```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AppointmentCalendar from '@/components/AppointmentCalendar'

export default async function CalendarPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  // Fetch therapist info if needed
  // For now, default to Dr. Bethany

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Appointment Calendar</h1>
        <p className="mt-1 text-sm text-gray-600">
          Schedule and manage patient appointments
        </p>
      </div>

      <AppointmentCalendar />
    </div>
  )
}
```

#### 2.3 - FullCalendar Component (Client Component) (45 min)
**Create:** `components/AppointmentCalendar.tsx`

```typescript
'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useState } from 'react'

export default function AppointmentCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleDateClick = (arg: DateClickArg) => {
    setSelectedDate(arg.date)
    setIsModalOpen(true)
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* New Appointment Button */}
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + New Appointment
        </button>
      </div>

      {/* FullCalendar */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        slotDuration="00:15:00"
        allDaySlot={false}
        height="auto"
        dateClick={handleDateClick}
        events="/api/appointments/calendar" // API endpoint to fetch events
        editable={true}
        eventDrop={handleEventDrop}
        eventClick={handleEventClick}
      />

      {/* Appointment Modal - To be built in Phase 3 */}
      {isModalOpen && (
        <div>Modal placeholder</div>
      )}
    </div>
  )
}
```

**Styling:**
- Match existing dashboard theme (Tailwind)
- Colors consistent with app palette
- Responsive design

#### 2.4 - Navigation Link (15 min)
**Update:** Dashboard sidebar navigation

**Add Calendar link:**
```typescript
{
  name: 'Calendar',
  href: '/dashboard/calendar',
  icon: CalendarIcon, // from @heroicons/react/24/outline
  current: pathname === '/dashboard/calendar'
}
```

**🚦 STOP & TEST - Phase 2 Checkpoint:**
- [ ] Appointment table exists in database (check Prisma Studio)
- [ ] Calendar page loads at `/dashboard/calendar`
- [ ] Calendar shows week view by default
- [ ] Shows 8 AM - 8 PM time range
- [ ] 15-minute slot intervals visible
- [ ] Can switch between day/week/month views
- [ ] "New Appointment" button appears
- [ ] Clicking button shows modal placeholder
- [ ] Calendar link in sidebar works
- [ ] No console errors

**USER APPROVAL REQUIRED:** "Phase 2 working, proceed to Phase 3"

---

### Phase 3: Create Appointments (2-3 hours)

**Objective:** Full appointment creation workflow with Google Calendar sync

#### 3.1 - CPT Codes Utility (15 min)
**Create:** `lib/appointment-utils.ts`

```typescript
export const CPT_CODES = [
  { code: '90791', description: 'Psychiatric Diagnostic Evaluation', duration: 60 },
  { code: '90834', description: 'Psychotherapy, 45 minutes', duration: 45 },
  { code: '90837', description: 'Psychotherapy, 60 minutes', duration: 60 },
  { code: '90846', description: 'Family therapy without patient', duration: 60 },
  { code: '90847', description: 'Family therapy with patient', duration: 60 },
  { code: '90853', description: 'Group psychotherapy', duration: 60 },
] as const

export const APPOINTMENT_TYPES = [
  { value: 'initial', label: 'Initial Consultation' },
  { value: 'follow-up', label: 'Follow-up Session' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'family', label: 'Family Therapy' },
] as const

export const RECURRING_OPTIONS = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly' },
] as const

export function generateRecurrenceRule(
  pattern: string,
  startDate: Date,
  endDate?: Date
): string[] {
  // Max 90 days if no end date specified
  const maxEndDate = new Date(startDate)
  maxEndDate.setDate(maxEndDate.getDate() + 90)
  const until = endDate && endDate < maxEndDate ? endDate : maxEndDate

  const untilStr = until.toISOString().split('T')[0].replace(/-/g, '')

  switch (pattern) {
    case 'weekly':
      return [`RRULE:FREQ=WEEKLY;UNTIL=${untilStr}`]
    case 'biweekly':
      return [`RRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=${untilStr}`]
    case 'monthly':
      return [`RRULE:FREQ=MONTHLY;UNTIL=${untilStr}`]
    default:
      return []
  }
}
```

#### 3.2 - Appointment Modal Component (1.5 hours)
**Create:** `components/AppointmentModal.tsx`

**Features:**
- Patient selection (dropdown with search)
- Therapist selection (default Dr. Bethany, support multiple)
- Date picker
- Time picker (8 AM - 8 PM, 15-min intervals)
- Duration selector (30/45/60/90 minutes)
- Appointment type dropdown
- CPT code selector (optional)
- Notes textarea
- **Recurring options:**
  - Radio buttons: None, Weekly, Bi-weekly, Monthly
  - If selected: Show end date picker (max 90 days)
- Cancel/Save buttons
- Loading state during save
- Error display

**Form Validation:**
- Required: patient, therapist, date, time, duration, type
- Start time must be in future (or allow same day?)
- End time calculated from start + duration
- Check for conflicts before saving

#### 3.3 - Create Appointment API (1 hour)
**Create:** `app/api/appointments/route.ts`

**POST Handler:**
```typescript
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { patientId, therapistId, startTime, duration, type, cptCode, notes, recurring } = body

    // 1. Validation
    // - Required fields
    // - Patient exists and is active
    // - Therapist exists
    // - Start time valid
    // - Duration valid (30/45/60/90)

    // 2. Calculate end time
    const endTime = new Date(startTime)
    endTime.setMinutes(endTime.getMinutes() + duration)

    // 3. Check for scheduling conflicts
    const hasConflict = await checkConflicts(startTime, endTime)
    if (hasConflict) {
      return NextResponse.json({ error: 'Scheduling conflict' }, { status: 400 })
    }

    // 4. Get patient details
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { firstName: true, lastName: true, email: true }
    })

    // 5. Create event in Google Calendar
    const recurrenceRule = recurring !== 'none'
      ? generateRecurrenceRule(recurring, new Date(startTime))
      : undefined

    const { eventId, meetLink } = await createCalendarEvent({
      summary: `${patient.firstName} ${patient.lastName} - ${type}`,
      description: `Type: ${type}\nCPT Code: ${cptCode || 'Not specified'}\nNotes: ${notes || 'None'}`,
      startTime: new Date(startTime),
      endTime,
      attendees: patient.email ? [patient.email] : [],
      recurrence: recurrenceRule
    })

    // 6. Create appointment in our database
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        therapistId,
        startTime: new Date(startTime),
        endTime,
        duration,
        type,
        status: 'scheduled',
        cptCode,
        notes,
        googleEventId: eventId,
        googleMeetLink: meetLink,
        isRecurring: recurring !== 'none',
        recurringPattern: recurring !== 'none' ? recurring : null,
      },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        therapist: { select: { name: true } }
      }
    })

    // 7. Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        entity: 'Appointment',
        entityId: appointment.id,
        details: `Created appointment for ${patient.firstName} ${patient.lastName}`
      }
    })

    return NextResponse.json({ success: true, appointment })

  } catch (error) {
    console.error('Create appointment error:', error)
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
  }
}
```

**GET Handler (for calendar display):**
```typescript
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    // Fetch from Google Calendar (source of truth)
    const events = await listCalendarEvents(
      new Date(start),
      new Date(end)
    )

    // Transform to FullCalendar format
    const calendarEvents = events.map(event => ({
      id: event.id,
      title: event.summary,
      start: event.start.dateTime,
      end: event.end.dateTime,
      url: event.hangoutLink, // Google Meet link
      backgroundColor: getEventColor(event.status),
      extendedProps: {
        meetLink: event.hangoutLink,
        status: event.status
      }
    }))

    return NextResponse.json(calendarEvents)

  } catch (error) {
    console.error('Fetch appointments error:', error)
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}
```

#### 3.4 - Wire Up Modal to Calendar (30 min)
**Update:** `components/AppointmentCalendar.tsx`

- Connect modal to form submission
- Call API on save
- Show loading state
- Handle success (close modal, refresh calendar)
- Handle errors (display error message)
- Pre-fill date/time when clicking calendar slot

**🚦 STOP & TEST - Phase 3 Checkpoint:**
- [ ] Can click "New Appointment" button
- [ ] Modal opens with complete form
- [ ] Patient dropdown shows active patients
- [ ] Therapist dropdown shows therapists (Dr. Bethany default)
- [ ] Can select date and time (15-min intervals, 8 AM-8 PM)
- [ ] Can select duration (30/45/60/90)
- [ ] Can select type and CPT code
- [ ] Can add notes
- [ ] **Recurring options work:**
  - [ ] Can select weekly/biweekly/monthly
  - [ ] End date picker appears
  - [ ] Max 90 days enforced
- [ ] Save button creates appointment
- [ ] Appointment appears on calendar immediately
- [ ] Appointment saved in our database (check Prisma Studio)
- [ ] **Appointment created in Google Calendar:**
  - [ ] Check DrBethany@RussellMentalHealth.com calendar
  - [ ] Event shows correct date/time
  - [ ] Google Meet link generated
  - [ ] Patient added as attendee (if email exists)
- [ ] **Recurring appointments:**
  - [ ] Series appears on calendar
  - [ ] All events visible in Google Calendar
- [ ] Error messages display for validation failures
- [ ] Cannot create conflicting appointments

**USER APPROVAL REQUIRED:** "Phase 3 working, proceed to Phase 4"

---

### Phase 4: Edit, Delete & Drag-Drop (1-2 hours)

**Objective:** Full appointment management capabilities

#### 4.1 - View/Edit Appointment (45 min)
**Update:** `components/AppointmentModal.tsx`

**Add Edit Mode:**
- Detect if opening existing appointment vs new
- Load appointment data into form
- Patient field read-only in edit mode
- Show "Edit" and "Delete" buttons
- Edit button enables form fields
- Save updates both Google Calendar and database

**Handle Recurring Events:**
- Show option: "Update this event only" vs "Update all events in series"
- If "all events": Pass to Google Calendar API appropriately
- Update our database records accordingly

**Update API:**
**Create:** `app/api/appointments/[id]/route.ts`

```typescript
// PATCH - Update appointment
export async function PATCH(request: NextRequest) {
  const id = params.id // appointment ID
  const body = await request.json()
  const { updateAll } = body // For recurring events

  // 1. Get existing appointment
  const existing = await prisma.appointment.findUnique({ where: { id } })

  // 2. Validation (same as create)

  // 3. Update Google Calendar
  await updateCalendarEvent(existing.googleEventId, {
    summary: ...,
    startTime: ...,
    endTime: ...,
    // Include recurrence handling if updateAll is true
  })

  // 4. Update database
  const updated = await prisma.appointment.update({
    where: { id },
    data: { ... }
  })

  // 5. Audit log

  return NextResponse.json({ success: true, appointment: updated })
}
```

#### 4.2 - Delete Appointment (30 min)
**Add Delete Functionality:**

- Delete button in modal
- Confirmation dialog: "Are you sure you want to delete this appointment?"
- For recurring: "Delete only this appointment" vs "Delete all events in series"
- Delete from both Google Calendar and database
- Show success message
- Refresh calendar

**DELETE API Handler:**
```typescript
export async function DELETE(request: NextRequest) {
  const id = params.id
  const { deleteAll } = await request.json() // For recurring

  // 1. Get appointment
  const appointment = await prisma.appointment.findUnique({ where: { id } })

  // 2. Delete from Google Calendar
  await deleteCalendarEvent(appointment.googleEventId, deleteAll)

  // 3. Delete from database (or mark as cancelled)
  await prisma.appointment.update({
    where: { id },
    data: { status: 'cancelled' }
  })
  // OR: await prisma.appointment.delete({ where: { id } })

  // 4. Audit log

  return NextResponse.json({ success: true })
}
```

#### 4.3 - Drag-and-Drop Rescheduling (30 min)
**Update:** `components/AppointmentCalendar.tsx`

**Enable Drag-Drop:**
```typescript
const handleEventDrop = async (info: EventDropArg) => {
  try {
    // Show loading state

    // Calculate new times
    const newStart = info.event.start
    const newEnd = info.event.end

    // Check for conflicts at new time
    const hasConflict = await fetch('/api/appointments/check-conflict', {
      method: 'POST',
      body: JSON.stringify({
        startTime: newStart,
        endTime: newEnd,
        excludeId: info.event.id
      })
    }).then(r => r.json())

    if (hasConflict.conflict) {
      alert('Cannot reschedule: scheduling conflict')
      info.revert() // Revert to original position
      return
    }

    // Update appointment
    const response = await fetch(`/api/appointments/${info.event.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        startTime: newStart,
        endTime: newEnd
      })
    })

    if (!response.ok) {
      alert('Failed to reschedule appointment')
      info.revert()
    }

  } catch (error) {
    console.error('Drag drop error:', error)
    info.revert()
  }
}
```

**Features:**
- Visual feedback during drag
- Loading state during update
- Error handling with revert
- Success confirmation

#### 4.4 - Click Event to View/Edit (15 min)
**Update:** `components/AppointmentCalendar.tsx`

```typescript
const handleEventClick = (info: EventClickArg) => {
  // Load appointment details
  // Open modal in view mode
  setSelectedAppointment(info.event.id)
  setIsModalOpen(true)
}
```

**🚦 STOP & TEST - Phase 4 Checkpoint:**
- [ ] Can click appointment on calendar
- [ ] Modal opens showing appointment details
- [ ] Can click "Edit" button
- [ ] Form fields become editable
- [ ] Can update all fields (except patient)
- [ ] Save updates both Google Calendar and database
- [ ] Changes reflect on calendar immediately
- [ ] **For recurring appointments:**
  - [ ] Option to update "this event" or "all events" shown
  - [ ] "This event only" updates single instance
  - [ ] "All events" updates entire series
- [ ] Can click "Delete" button
- [ ] Confirmation dialog appears
- [ ] Delete removes from both places
- [ ] **Drag-and-drop works:**
  - [ ] Can drag appointment to new time
  - [ ] Visual feedback during drag
  - [ ] Database updates on drop
  - [ ] Google Calendar updates on drop
  - [ ] Cannot drop on conflicting time (reverts)
  - [ ] Error handling works (shows message, reverts)
- [ ] Status updates work (scheduled → completed, etc.)
- [ ] Colors change based on status

**USER APPROVAL REQUIRED:** "Phase 4 complete! Core appointment system working!"

---

### Phase 5: Patient Access & Polish (1 hour)

**Objective:** Patient-facing features and UI polish

#### 5.1 - Patient Calendar View (30 min)
**Create:** `app/(dashboard)/dashboard/patient/appointments/page.tsx`

**Features:**
- Read-only calendar showing ONLY patient's appointments
- List view showing upcoming appointments (next 10)
- "Join Session" button if appointment is within 15 minutes
- Click "Join Session" → Opens Google Meet link
- Show appointment details (type, therapist, date/time)
- No create/edit/delete capabilities

#### 5.2 - Calendar Invite Email (Already handled by Google!)
**Automatic Features:**
- When appointment created with patient email as attendee
- Google Calendar automatically sends invitation
- Patient can accept/decline
- Shows on patient's device calendar
- Patient gets notification 15 min before (Google's default)

**✅ This is already done by Google Calendar - no development needed!**

#### 5.3 - UI Polish (30 min)
**Enhancements:**
- Color coding by status:
  - Scheduled: Blue (#3B82F6)
  - Completed: Green (#10B981)
  - Cancelled: Gray (#6B7280)
  - No-Show: Red (#EF4444)
- Show patient name + appointment type on event
- Hover tooltip with more details
- Responsive design for mobile/tablet
- Loading states for all async operations
- Success/error toast notifications

**Optional (If Simple):**
- Yellow indicator line for back-to-back appointments
- Show "Buffer: 0 min" warning label

**🚦 STOP & TEST - Phase 5 Checkpoint:**
- [ ] Patient can access their appointments page
- [ ] Shows only their appointments (not other patients)
- [ ] "Join Session" button appears when appropriate
- [ ] Google Meet link opens correctly
- [ ] Patient received calendar invite email (check)
- [ ] Appointment appears on patient's phone/device calendar
- [ ] Color coding works correctly
- [ ] UI looks polished and professional
- [ ] Responsive on mobile/tablet
- [ ] All loading states work
- [ ] Notifications display properly

**USER APPROVAL REQUIRED:** "Phase 5 complete! Patient features working!"

---

## ✅ Success Criteria (End of Day 6)

### Must Have (Core Features):
- [ ] Google Calendar API fully integrated
- [ ] OAuth authentication working
- [ ] Can create one-time appointments
- [ ] Can create recurring appointments (weekly, bi-weekly, monthly)
- [ ] Recurring appointments limited to 90 days max
- [ ] Appointments sync to DrBethany@RussellMentalHealth.com calendar
- [ ] Google Meet links generated automatically
- [ ] Patients receive calendar invites
- [ ] Appointments appear on patient's device calendar
- [ ] FullCalendar displays events beautifully
- [ ] Day/Week/Month views work
- [ ] 8 AM - 8 PM hours, 15-min slots, 7 days/week
- [ ] Can view appointment details
- [ ] Can edit appointments (this event or all events)
- [ ] Can delete/cancel appointments
- [ ] Drag-and-drop rescheduling works
- [ ] Conflict prevention works
- [ ] Multi-therapist support (default Dr. Bethany)
- [ ] CPT code selection
- [ ] Appointment types (initial, follow-up, assessment, family)
- [ ] All data persists in database AND Google Calendar
- [ ] Patient can view their appointments
- [ ] "Join Session" button opens Google Meet
- [ ] No console errors
- [ ] All changes committed and pushed

### Nice to Have (If Time):
- [ ] Patient dashboard appointment widget
- [ ] Back-to-back appointment indicator
- [ ] Custom email notifications
- [ ] Appointment reminders (Google handles this, but maybe enhance)

---

## 📚 Documentation Updates (End of Day)

**Required Updates:**
- [ ] **TODO.md** - Mark Day 6 tasks complete, add Day 7 priorities
- [ ] **Create DAY_6_COMPLETE.md** - Document all achievements
- [ ] **Update README.md** - Version 0.6.0 with appointment features
- [ ] **Update README_QR.md** - Current status snapshot
- [ ] **Create HANDOFF_DAY_7.md** - Plan for WebRTC video sessions (or next priority)
- [ ] **Commit all code** - Push to branch
- [ ] **Test credentials updated** - Document any new test scenarios

---

## 🔧 Technical Implementation Notes

### Google Calendar API Best Practices:
1. **Rate Limiting:** Google Calendar API has quotas (10,000 requests/day for Calendar v3)
   - Cache calendar events when possible
   - Batch operations if creating multiple appointments

2. **Error Handling:**
   - Handle 401 (unauthorized) - OAuth token expired
   - Handle 403 (forbidden) - Insufficient permissions
   - Handle 409 (conflict) - Event already exists
   - Handle 429 (rate limit) - Too many requests

3. **Conference Data:**
   - Must include `conferenceDataVersion: 1` in request
   - Use `requestId` for idempotency
   - Check for `hangoutLink` in response

4. **Recurring Events:**
   - Use RRULE format (RFC 5545)
   - `FREQ=WEEKLY;UNTIL=20251231T235959Z`
   - Always include UNTIL date (90 day max)
   - Updating recurring: Can update single instance or all

### Database Sync Strategy:
```
Source of Truth: Google Calendar
Our Database: Clinical data + reference to Google events

Create Flow:
1. Validate in our app
2. Create in Google Calendar → get eventId
3. Save to our database with eventId

Update Flow:
1. Update in our database
2. Update in Google Calendar using eventId
3. Confirm success

Read Flow:
1. Fetch from Google Calendar (for display)
2. Join with our database (for clinical data)

Delete Flow:
1. Mark cancelled in our database
2. Delete from Google Calendar
```

### FullCalendar Configuration:
```javascript
{
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
  slotMinTime: '08:00:00',
  slotMaxTime: '20:00:00',
  slotDuration: '00:15:00',
  allDaySlot: false,
  editable: true,
  eventDurationEditable: true,
  eventStartEditable: true,
  height: 'auto',
  events: '/api/appointments/calendar',
  eventClick: handleEventClick,
  eventDrop: handleEventDrop,
  dateClick: handleDateClick,
}
```

---

## ⚠️ Common Pitfalls to Avoid

1. **DON'T create mock/placeholder appointments** - All must be real
2. **DON'T skip Google Calendar sync** - Must update both places
3. **DON'T forget recurring appointment limits** - Max 90 days
4. **DON'T allow scheduling conflicts** - Validate before saving
5. **DON'T forget audit logging** - Track all appointment changes
6. **DON'T use blocking operations** - All API calls should be async
7. **DON'T forget error handling** - Every API call needs try/catch
8. **DON'T proceed to next phase without user approval** - STOP & TEST

---

## 🔄 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface                            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ FullCalendar │    │ Appointment  │    │  Patient     │  │
│  │    View      │◄──►│    Modal     │    │  Calendar    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Layer                                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ /api/        │    │ /api/        │    │ /api/        │  │
│  │ appointments │◄──►│appointments  │◄──►│ appointments │  │
│  │              │    │  /[id]       │    │  /calendar   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
└──────────┬──────────────────┬───────────────────────────────┘
           │                  │
           ▼                  ▼
┌────────────────────┐ ┌─────────────────────────────────────┐
│   Our Database     │ │   Google Calendar API               │
│  ┌──────────────┐  │ │  ┌──────────────┐  ┌─────────────┐ │
│  │ Appointments │  │ │  │   Calendar   │  │  Meet Link  │ │
│  │  (Clinical)  │◄─┼─┤►│    Events    │  │ (Auto-gen)  │ │
│  └──────────────┘  │ │  └──────────────┘  └─────────────┘ │
│  ┌──────────────┐  │ │         │                          │
│  │ Audit Logs   │  │ │         │                          │
│  └──────────────┘  │ │         ▼                          │
└────────────────────┘ │  ┌─────────────────────┐           │
                       │  │ Email Invitations   │           │
                       │  │ to Patient          │           │
                       │  └─────────────────────┘           │
                       │         │                          │
                       │         ▼                          │
                       │  ┌─────────────────────┐           │
                       │  │ Patient's Device    │           │
                       │  │ Calendar (Phone)    │           │
                       │  └─────────────────────┘           │
                       └─────────────────────────────────────┘
```

---

## 📝 Test Scenarios

### Scenario 1: Create One-Time Appointment
1. Click "New Appointment"
2. Select patient "John Doe"
3. Select therapist "Dr. Bethany R. Russell"
4. Select date: Tomorrow at 2:00 PM
5. Duration: 45 minutes
6. Type: Initial Consultation
7. CPT Code: 90791
8. Notes: "First session"
9. Recurring: None
10. Click Save
11. **Verify:**
    - Appears on calendar immediately
    - Saved in database (check Prisma Studio)
    - Created in Google Calendar (check web interface)
    - Google Meet link generated
    - Patient receives email invitation

### Scenario 2: Create Recurring Appointment
1. Click "New Appointment"
2. Select patient "Jane Smith"
3. Select date: Next Monday at 10:00 AM
4. Duration: 60 minutes
5. Type: Follow-up Session
6. Recurring: Weekly
7. End date: 12 weeks from start (should be allowed, < 90 days)
8. Click Save
9. **Verify:**
    - All 12 appointments appear on calendar
    - All created in Google Calendar
    - Can update "this event only"
    - Can update "all events"
    - Can delete "this event only"
    - Can delete "all events"

### Scenario 3: Scheduling Conflict
1. Create appointment: Tomorrow 3:00 PM - 4:00 PM
2. Try to create overlapping: Tomorrow 3:30 PM - 4:30 PM
3. **Verify:**
    - Error message displayed
    - Second appointment NOT created
    - Can create at different time (4:00 PM - 5:00 PM)

### Scenario 4: Drag-and-Drop Reschedule
1. Create appointment: Tomorrow 2:00 PM
2. Drag to tomorrow 3:00 PM
3. **Verify:**
    - Visual feedback during drag
    - Updates in database
    - Updates in Google Calendar
    - Patient receives updated calendar invite

### Scenario 5: Patient View
1. Log in as patient
2. Navigate to appointments page
3. **Verify:**
    - Sees only their appointments
    - Can see appointment details
    - "Join Session" button appears 15 min before
    - Click "Join Session" opens Google Meet
    - Calendar invite received on their phone

---

## 🎯 Day 7 Preview

**After Day 6 is complete, next priorities will be:**

**Option A: WebRTC Custom Video Sessions**
- Replace Google Meet with our own video interface
- Keep Google Meet as fallback
- Built-in recording capabilities
- Custom UI matching our brand

**Option B: Clinical Notes System**
- SOAP note templates
- Link notes to appointments
- ICD-10 diagnosis codes
- CPT code tracking
- Sign and lock notes

**Option C: Enhanced Patient Dashboard**
- Upcoming appointments widget
- Form completion progress
- Recent activity feed
- Outstanding balance display
- Quick actions

**Decision:** User will decide based on priority

---

## 📞 Questions & Clarifications

### Answered:
- ✅ Use DrBethany@RussellMentalHealth.com Google Workspace calendar
- ✅ OAuth credentials already created (client ID + secret)
- ✅ Google calendar invites sufficient for now (custom emails later)
- ✅ Recurring max 90 days unless specified
- ✅ Buffer indicator: Only if simple, otherwise skip
- ✅ Each therapist gets own Google Workspace calendar
- ✅ 8 AM - 8 PM, 15-min intervals, 7 days/week
- ✅ Back-to-back appointments allowed
- ✅ Default view: Current week
- ✅ Default therapist: Dr. Bethany (support multiple)

### Pending:
- None - all clarifications received!

---

## 💾 Backup & Version Control

**This document created:** November 5, 2025
**Last updated:** November 5, 2025
**Branch:** `claude/finish-interrupted-work-011CUoiaquueU6CvhophKZ8i`
**Status:** APPROVED - Ready for implementation

**Commit this document immediately after creation!**

---

**🎯 READY TO BUILD! LET'S CRUSH DAY 6! 🚀**
