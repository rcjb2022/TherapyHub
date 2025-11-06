# 📅 Tomorrow's Session Prompts - Day 7

**Date:** November 7, 2025
**Focus:** Google Calendar Integration + Appointment Enhancements

---

## 🚀 Session Start Prompt

```
Good morning! Ready to start Day 7.

Today's focus:
1. Google Calendar two-way sync
2. Appointment conflict detection
3. Email reminders via Gmail API

Current status: Calendar system complete from Day 6, all features tested and working.

Let's start with Google Calendar integration. I have my Google Cloud project set up.
What credentials do we need to configure?
```

---

## 📋 Priority 1: Google Calendar Integration

### Initial Setup Prompt
```
Let's set up Google Calendar integration for TherapyHub appointments.

Requirements:
- Two-way sync (app → Google Calendar, Google Calendar → app)
- When therapist creates appointment in TherapyHub, create in Google Calendar
- When therapist creates appointment in Google Calendar, import to TherapyHub
- Include Google Meet links for telehealth appointments
- Handle recurring appointments
- Sync updates and deletions

What's the first step? Do we need OAuth2 or service account?
```

### After Authentication Setup
```
Authentication configured. Now let's implement:
1. Create appointment in Google Calendar when created in TherapyHub
2. Update Google Calendar when appointment edited
3. Delete from Google Calendar when cancelled
4. Include patient name (HIPAA-safe format), appointment type, Google Meet link

Start with create functionality. Show me the code for lib/google-calendar.ts helper.
```

### Testing Prompt
```
Let's test Google Calendar integration:
1. Create appointment in TherapyHub for tomorrow 2pm
2. Verify it appears in Google Calendar
3. Edit the appointment (change time to 3pm)
4. Verify Google Calendar updates
5. Cancel the appointment
6. Verify it's removed from Google Calendar

Show me the calendar at calendar.google.com after each step.
```

---

## 📋 Priority 2: Appointment Conflicts & Validation

### Implementation Prompt
```
Now let's add appointment conflict detection:

Requirements:
- Check for overlapping appointments before saving
- Display warning if conflict detected
- Allow override with confirmation ("Book anyway")
- Show existing appointments in time slot
- Optional: Add buffer time (5-15 minutes between appointments)
- Optional: Enforce business hours (9am-5pm, configurable)

Let's start with basic conflict detection in appointment-utils.ts
```

### Testing Prompt
```
Test conflict detection:
1. Create appointment: Patient A, tomorrow 2:00pm-3:00pm
2. Try to create: Patient B, tomorrow 2:30pm-3:30pm
3. Should show warning: "Conflicts with existing appointment"
4. Try to create: Patient C, tomorrow 3:00pm-4:00pm (exact end/start)
5. Should allow (no overlap)

Verify the validation logic works correctly.
```

---

## 📋 Priority 3: Email Reminders

### Setup Prompt
```
Let's add email reminders for appointments using Gmail API:

Requirements:
- 24-hour reminder (sent day before at appointment time)
- 1-hour reminder (sent 1 hour before)
- Include: Date, time, therapist name, Google Meet link (if telehealth)
- Track reminder sent status in database
- Resend if appointment rescheduled

First, let's set up Gmail API authentication and create email templates.
```

### Email Template Prompt
```
Create professional email templates for:

1. 24-hour reminder:
   Subject: "Reminder: Appointment Tomorrow with Dr. Russell"
   Body: Include date, time, location/meet link, cancellation policy

2. 1-hour reminder:
   Subject: "Your Appointment Starts in 1 Hour"
   Body: Brief reminder with immediate details

Use HTML formatting for professional appearance.
```

### Scheduling Prompt
```
How do we schedule reminders?
Options:
1. Cron job (check every hour for upcoming appointments)
2. Queue system (schedule specific send times)
3. Cloud Scheduler (GCP)

Which approach is best for this project? Let's implement the simplest reliable method.
```

---

## 🐛 If Issues Arise

### Timezone Issues
```
Appointments showing wrong times in Google Calendar. Let's debug:
1. Check timezone being passed to Google Calendar API
2. Verify we're sending "America/New_York" timezone
3. Test with appointment at specific time
4. Compare TherapyHub calendar vs Google Calendar

Show me the createCalendarEvent function and the timezone handling.
```

### Conflict Detection False Positives
```
Conflict detection flagging appointments that don't actually overlap.
Let's review the logic:
1. Show me the checkConflicts function
2. Walk through example: Apt 1 (2pm-3pm), Apt 2 (3pm-4pm)
3. Should these conflict? No (exact end/start is OK)
4. Fix the comparison logic

Remember: endTime === startTime is NOT a conflict.
```

### Email Sending Failures
```
Emails not sending. Let's troubleshoot:
1. Check Gmail API credentials
2. Verify OAuth scopes include gmail.send
3. Test with simple test email first
4. Check error logs for specific issue
5. Verify email format (proper headers, body)

Start with simplest test: Can we send ANY email?
```

---

## 🧪 End of Day Testing Checklist

### Before Marking Complete
```
Let's verify everything works end-to-end:

Google Calendar Integration:
- [ ] Create appointment in TherapyHub → appears in Google Calendar
- [ ] Edit appointment → Google Calendar updates
- [ ] Delete appointment → removed from Google Calendar
- [ ] Telehealth appointment → Google Meet link included
- [ ] Recurring appointment → multiple events created

Conflict Detection:
- [ ] Overlapping appointments blocked
- [ ] Adjacent appointments allowed (3pm end, 3pm start OK)
- [ ] Warning message clear and helpful
- [ ] Override option works if needed

Email Reminders:
- [ ] 24-hour reminder sent
- [ ] 1-hour reminder sent
- [ ] Email includes all details
- [ ] Google Meet link clickable
- [ ] Reminder status tracked in database

All tests passing? Great! Let's document Day 7 and prepare handoff.
```

---

## 📝 Documentation Prompts

### After All Features Complete
```
Day 7 complete! Let's update documentation:

1. Create DAY_7_COMPLETE.md (follow Day 6 format)
2. Update TODO.md (mark completed, add Day 8 priorities)
3. Update README.md (add Day 7 achievements)
4. Update README_QR.md (current status snapshot)
5. Create HANDOFF_DAY_7.md
6. Create TOMORROW_PROMPTS_DAY_8.md

Start with DAY_7_COMPLETE.md - include:
- Google Calendar integration details
- Conflict detection implementation
- Email reminder system
- All bug fixes
- Test results
- Key learnings

Make it comprehensive like Day 6's documentation!
```

---

## 🎯 Success Criteria

**Day 7 is complete when:**
- ✅ Appointments sync to Google Calendar (two-way)
- ✅ Google Meet links auto-generate for telehealth
- ✅ Conflict detection prevents double-booking
- ✅ Email reminders send automatically (24h & 1h)
- ✅ All features tested end-to-end
- ✅ All code committed and pushed
- ✅ Full documentation created

---

## 💡 Tips for Success

1. **Test Incrementally** - Don't build all 3 features before testing
2. **Use Real Google Calendar** - Test with actual calendar.google.com
3. **Check Email Delivery** - Verify emails actually arrive in inbox
4. **Handle Timezones Carefully** - Google Calendar uses same timezone approach
5. **Log Everything** - Console.log API responses for debugging
6. **Ask Questions** - If Google API confusing, ask for clarification

---

## 🔗 Helpful Resources

**Google Calendar API:**
- Documentation: https://developers.google.com/calendar/api
- Events.insert: Create calendar events
- Events.update: Update events
- Events.delete: Delete events

**Gmail API:**
- Documentation: https://developers.google.com/gmail/api
- Send email: messages.send
- Format: RFC 2822 (use nodemailer or similar)

**OAuth2:**
- Scopes needed:
  - `https://www.googleapis.com/auth/calendar`
  - `https://www.googleapis.com/auth/gmail.send`

---

**Good luck with Day 7!** 🚀
