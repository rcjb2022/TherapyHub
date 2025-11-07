# Tomorrow's Prompts: Day 9 - Recording & AI Integration

**Date:** November 8, 2025 (Saturday)
**Session:** Day 9
**Focus:** Phase 6 - Session Recording, AI Transcription, Auto-Generated Notes
**Branch:** `claude/day-9-recording-ai-[SESSION_ID]` (create new branch)

---

## 🎯 Day 9 Mission

**Primary Goal:** Implement session recording, AI transcription, and auto-generated clinical notes

**Success Criteria:**
- ✅ Video sessions can be recorded
- ✅ Recordings stored securely in cloud storage
- ✅ AI transcribes session audio
- ✅ Clinical notes auto-generated from transcript
- ✅ Therapist can review and edit notes
- ✅ Everything HIPAA-compliant

---

## 📋 Phase Breakdown (Incremental Approach)

### **Phase 1: Database Schema & Storage Setup** (30 min)
→ Create Recording model, set up cloud storage

### **Phase 2: Basic Recording Capture** (45 min)
→ Capture MediaStream, test locally

### **Phase 3: Cloud Upload** (45 min)
→ Upload recording to GCS/S3, get URL

### **Phase 4: Database Integration** (30 min)
→ Store recording metadata with appointment

### **Phase 5: Playback Interface** (45 min)
→ View past recordings securely

### **Phase 6: AI Transcription** (60 min)
→ Gemini API transcription integration

### **Phase 7: Auto-Generated Notes** (60 min)
→ AI analyzes transcript, generates clinical notes

### **Phase 8: Testing & Polish** (45 min)
→ End-to-end testing, error handling

**Total Estimated Time:** 5-6 hours
**Break into 2 sessions if needed**

---

## 🚀 Start-of-Session Prompt

```
Good morning! Let's continue Day 9 of the TherapyHub build.

Today's goal: Implement session recording, AI transcription, and auto-generated clinical notes.

Please read these files first:
1. /docs/sessions/HANDOFF_DAY_8.md
2. /docs/sessions/TOMORROW_PROMPTS_DAY_9.md (this file)
3. /docs/TODO.md

Let's start with Phase 1: Database Schema & Storage Setup.

Quick test first: Can you verify the WebRTC video session is still working from yesterday? Just join a test session to confirm everything is operational before we start adding recording.
```

---

## 📖 Phase 1: Database Schema & Storage Setup

### **Objective:** Create database schema for recordings and configure cloud storage

### **Prompt:**

```
Let's start Phase 1: Database Schema & Storage Setup

Step 1: Create Recording model in Prisma schema

Add this to prisma/schema.prisma:

model Recording {
  id              String   @id @default(cuid())
  appointmentId   String
  videoUrl        String   // GCS/S3 URL
  transcriptUrl   String?  // JSON URL
  duration        Int?     // Seconds
  fileSize        Int?     // Bytes
  startedAt       DateTime @default(now())
  endedAt         DateTime?
  status          RecordingStatus @default(RECORDING)

  appointment     Appointment @relation(fields: [appointmentId], references: [id])

  @@index([appointmentId])
  @@index([startedAt])
}

enum RecordingStatus {
  RECORDING
  PROCESSING
  COMPLETED
  FAILED
}

Also update the Appointment model to add:
  recordings  Recording[]

Step 2: Run database migration
npx prisma db push

Step 3: Verify schema updated
npx prisma studio  (check Recording table exists)

Step 4: Decision on storage provider
Recommend Google Cloud Storage (already using GCP):
- Same project as database
- HIPAA-compliant
- Good pricing
- Easy integration

Do you want to use Google Cloud Storage, or prefer AWS S3?

After you decide, we'll set up the storage configuration.
```

### **Expected Response:**
User chooses storage provider (likely GCS)

### **Follow-up Prompt:**

```
Great! Let's configure Google Cloud Storage.

Step 1: Create GCS bucket (you'll need to do this in GCP Console)
- Bucket name: therapyhub-recordings
- Location: us-east1 (match database region)
- Storage class: Standard
- Access control: Uniform
- Encryption: Google-managed

Step 2: Create service account
- Name: therapyhub-recording-service
- Role: Storage Object Admin
- Download JSON key

Step 3: Add to .env.local:
GCS_BUCKET_NAME="therapyhub-recordings"
GCS_PROJECT_ID="[your-project-id]"
GCS_SERVICE_ACCOUNT_KEY='[paste JSON key]'

Step 4: Install dependencies:
npm install @google-cloud/storage

Let me know when you've completed the GCS setup, or if you need help with any step.
```

---

## 📖 Phase 2: Basic Recording Capture

### **Objective:** Capture MediaStream from WebRTC and save locally

### **Prompt:**

```
Phase 2: Basic Recording Capture

Let's add recording capability to the VideoRoom component.

Step 1: Create recording utility
Create: lib/recording/captureStream.ts

This file should:
- Use MediaRecorder API
- Support video/webm codec
- Chunk data every 1 second
- Return Blob when stopped
- Handle errors gracefully

Step 2: Add recording state to VideoRoom
In components/video/VideoRoom.tsx, add:
- isRecording state
- recordedChunks ref
- mediaRecorder ref
- startRecording function
- stopRecording function

Step 3: Add recording button to UI
- Red dot indicator when recording
- Start/Stop button
- Recording duration timer

Step 4: Test locally
- Start recording
- Record for 10 seconds
- Stop recording
- Download Blob to file
- Verify video plays

IMPORTANT: Don't upload to cloud yet. Just test the capture works locally.

🚦 STOP & TEST: Can you record video and download it locally?
```

### **Testing Checklist:**
- [ ] Recording starts when button clicked
- [ ] Red dot indicator visible
- [ ] Duration timer counts up
- [ ] Recording stops when button clicked
- [ ] Can download .webm file
- [ ] Downloaded file plays in video player
- [ ] No console errors

---

## 📖 Phase 3: Cloud Upload

### **Objective:** Upload recorded Blob to Google Cloud Storage

### **Prompt:**

```
Phase 3: Cloud Upload

Great! Recording capture is working. Now let's upload to GCS.

Step 1: Create upload utility
Create: lib/recording/uploadToStorage.ts

This file should:
- Accept Blob and appointmentId
- Convert Blob to Buffer
- Generate unique filename (timestamp + appointmentId)
- Upload to GCS bucket
- Return public URL (signed URL for security)
- Handle upload errors
- Add retry logic (3 attempts)

Step 2: Create API endpoint
Create: app/api/recordings/upload/route.ts

POST endpoint that:
- Receives recording Blob
- Validates user has permission
- Calls uploadToStorage
- Returns URL

Step 3: Update VideoRoom to upload
When stopRecording is called:
- Convert chunks to Blob
- POST to /api/recordings/upload
- Show upload progress
- Store URL in state

Step 4: Test upload
- Record 10-second video
- Verify uploads to GCS
- Check GCS console (file should be there)
- Verify returned URL works

🚦 STOP & TEST: Can you upload recording to GCS and get working URL?
```

### **Security Considerations:**
```
⚠️ IMPORTANT: Use signed URLs, not public URLs
- Signed URL expires after 1 hour
- Only accessible by authorized users
- Include in storage configuration

Example signed URL generation:
const [url] = await file.getSignedUrl({
  version: 'v4',
  action: 'read',
  expires: Date.now() + 60 * 60 * 1000 // 1 hour
})
```

---

## 📖 Phase 4: Database Integration

### **Objective:** Store recording metadata in database

### **Prompt:**

```
Phase 4: Database Integration

Now let's save recording metadata to the database.

Step 1: Create recording API endpoints

Create: app/api/recordings/route.ts
POST: Create new recording record
- appointmentId required
- status: RECORDING
- startedAt: now()
- Returns recording ID

GET: List recordings for appointment
- Filter by appointmentId
- Only return if user is participant
- Return array of recordings

Create: app/api/recordings/[id]/route.ts
GET: Get single recording
- Return recording details
- Check authorization
- Generate fresh signed URL

PATCH: Update recording
- Update status (COMPLETED, FAILED)
- Add endedAt, duration, fileSize
- Add videoUrl, transcriptUrl

DELETE: Delete recording
- Only therapist can delete
- Delete from GCS
- Soft delete in DB (mark as DELETED)

Step 2: Update VideoRoom component

When recording starts:
- POST to /api/recordings (create record)
- Store recordingId in state

When recording stops:
- Upload to GCS
- PATCH /api/recordings/[id] with videoUrl
- Update status to COMPLETED

Step 3: Add to appointment details
In AppointmentDetailsModal.tsx:
- Fetch recordings for appointment
- Show list of past recordings
- "View Recording" button for each

🚦 STOP & TEST: Can you see recordings listed in appointment modal?
```

### **Testing Checklist:**
- [ ] Recording created in DB when started
- [ ] Recording updated when upload completes
- [ ] Recordings visible in appointment modal
- [ ] Only participants can view
- [ ] URLs expire after 1 hour

---

## 📖 Phase 5: Playback Interface

### **Objective:** View past recordings securely

### **Prompt:**

```
Phase 5: Playback Interface

Let's build a nice interface to view recordings.

Step 1: Create recording playback component
Create: components/recording/RecordingPlayback.tsx

Features:
- HTML5 video player
- Playback controls (play/pause/seek)
- Show recording date/time
- Show duration
- Download button
- Participant names
- Loading state while generating signed URL

Step 2: Create recording list component
Create: components/recording/RecordingList.tsx

Features:
- List all recordings for appointment
- Thumbnail preview (if available)
- Recording date/time
- Duration
- Status badge (RECORDING, COMPLETED, PROCESSING)
- Click to open playback modal

Step 3: Integrate with appointment modal
In AppointmentDetailsModal.tsx:
- Add "Recordings" tab/section
- Show RecordingList
- Click recording opens playback modal

Step 4: Add recording route (optional)
Create: app/(dashboard)/dashboard/recordings/[id]/page.tsx

Dedicated page for viewing recording:
- Full-screen video player
- Appointment details sidebar
- Transcript (if available)
- Clinical notes (if available)

🚦 STOP & TEST: Can you view a past recording with full controls?
```

### **UI/UX Considerations:**
```
Recording Playback Should Include:
✅ Patient name (for therapist) or "Your Session" (for patient)
✅ Date and time of recording
✅ Duration
✅ Playback controls
✅ Volume control
✅ Fullscreen option
✅ Download button (for therapist only)
❌ Share button (HIPAA - no sharing)
❌ Public links (must be signed/expiring)
```

---

## 📖 Phase 6: AI Transcription

### **Objective:** Use Gemini API to transcribe recording audio

### **Prompt:**

```
Phase 6: AI Transcription

Now let's add AI transcription using Gemini.

Step 1: Install Gemini SDK
npm install @google/generative-ai

Step 2: Add Gemini API key to .env.local
GEMINI_API_KEY="[your-key-from-google-ai-studio]"

Step 3: Create transcription utility
Create: lib/recording/transcription.ts

Features:
- Extract audio from video
- Send to Gemini API for transcription
- Use gemini-pro or gemini-1.5-pro
- Return transcript with timestamps
- Speaker diarization (identify speakers)
- Format as JSON:
  {
    "segments": [
      {
        "speaker": "Therapist",
        "text": "How have you been feeling?",
        "startTime": 0.0,
        "endTime": 3.2
      },
      {
        "speaker": "Patient",
        "text": "I've been doing better this week.",
        "startTime": 3.5,
        "endTime": 7.1
      }
    ]
  }

Step 4: Create transcription API endpoint
Create: app/api/recordings/[id]/transcribe/route.ts

POST endpoint that:
- Gets recording from database
- Downloads video from GCS
- Extracts audio
- Sends to Gemini
- Saves transcript to GCS
- Updates recording with transcriptUrl
- Returns transcript

Step 5: Add "Transcribe" button
In RecordingPlayback.tsx:
- "Generate Transcript" button
- Shows loading state
- POST to transcribe endpoint
- Display transcript when ready

Step 6: Display transcript
Create: components/recording/TranscriptView.tsx

Features:
- Scrollable transcript
- Speaker labels
- Timestamps
- Click timestamp to jump to video time
- Search functionality
- Copy text

🚦 STOP & TEST: Can you generate and view transcript?
```

### **Gemini API Example:**
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

// For audio transcription
const prompt = `
Transcribe this therapy session audio.
Identify two speakers: Therapist and Patient.
Return JSON format with speaker labels and timestamps.
`

const result = await model.generateContent([
  { text: prompt },
  {
    inlineData: {
      mimeType: 'audio/webm',
      data: audioBase64
    }
  }
])

const transcript = JSON.parse(result.response.text())
```

---

## 📖 Phase 7: Auto-Generated Notes

### **Objective:** AI generates clinical notes from transcript

### **Prompt:**

```
Phase 7: Auto-Generated Clinical Notes

This is the big feature! AI writes therapy notes automatically.

Step 1: Create note generation utility
Create: lib/recording/generateNotes.ts

Use Gemini API to analyze transcript and generate:
1. Session Summary (3-5 sentences)
2. Chief Complaints (bullet points)
3. Key Topics Discussed (bullet points)
4. Treatment Progress (assessment)
5. Therapeutic Interventions Used
6. Action Items / Homework Assigned
7. Plan for Next Session
8. Clinical Observations

Prompt template for Gemini:
"You are an experienced licensed therapist reviewing a therapy session transcript.
Generate professional clinical notes following standard SOAP format.
Be objective, professional, and clinically accurate.
Include specific examples from the transcript.
Transcript: [full transcript]"

Step 2: Create note generation endpoint
Create: app/api/recordings/[id]/notes/route.ts

POST endpoint that:
- Gets recording and transcript
- If no transcript, generate it first
- Calls generateNotes utility
- Saves notes to database (new SessionNotes table)
- Returns generated notes

Step 3: Add SessionNotes model to Prisma
model SessionNotes {
  id              String   @id @default(cuid())
  appointmentId   String   @unique
  recordingId     String?
  summary         String   @db.Text
  chiefComplaints String   @db.Text
  keyTopics       String   @db.Text
  progress        String   @db.Text
  interventions   String   @db.Text
  actionItems     String   @db.Text
  nextSession     String   @db.Text
  observations    String   @db.Text
  aiGenerated     Boolean  @default(true)
  reviewed        Boolean  @default(false)
  reviewedBy      String?
  reviewedAt      DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  appointment     Appointment @relation(fields: [appointmentId], references: [id])

  @@index([appointmentId])
}

Step 4: Create notes review interface
Create: components/recording/NotesReview.tsx

Features:
- Display generated notes
- Editable fields (therapist can modify)
- "Approve" button
- "Regenerate" button
- Save edits
- Mark as reviewed

Step 5: Add to appointment workflow
After session ends:
- Show "Generate Notes" button
- Loading state (can take 30-60 seconds)
- Display draft notes
- Therapist reviews and approves
- Saved to patient record

🚦 STOP & TEST: Can you generate clinical notes from recording?
```

### **Clinical Notes Format:**
```markdown
# Session Notes

**Date:** November 8, 2025
**Duration:** 45 minutes
**Session Type:** Individual Therapy
**Patient:** [Name]
**Therapist:** [Name]

## Summary
[AI-generated 3-5 sentence summary of session]

## Chief Complaints
- [Complaint 1]
- [Complaint 2]
- [Complaint 3]

## Key Topics Discussed
- [Topic 1]
- [Topic 2]
- [Topic 3]

## Treatment Progress
[AI assessment of progress since last session]

## Therapeutic Interventions Used
- [Intervention 1]
- [Intervention 2]
- [Intervention 3]

## Action Items / Homework
- [ ] [Action item 1]
- [ ] [Action item 2]

## Plan for Next Session
[What to focus on next time]

## Clinical Observations
[Any notable observations about patient mood, behavior, etc.]

---
*Generated by AI • Reviewed by [Therapist Name] • [Date]*
```

---

## 📖 Phase 8: Testing & Polish

### **Objective:** End-to-end testing and error handling

### **Prompt:**

```
Phase 8: Testing & Polish

Let's do comprehensive testing and add error handling.

Step 1: End-to-End Test Scenario
1. Create test appointment
2. Join video session (therapist + patient)
3. Start recording
4. Have 2-minute conversation
5. Stop recording
6. Verify recording uploaded
7. Generate transcript
8. Generate clinical notes
9. Review and approve notes
10. Verify notes saved to patient record

Run through this entire flow and report any issues.

Step 2: Error Handling Checklist
- [ ] Recording fails to start → Show error message, allow retry
- [ ] Upload fails → Show error, allow retry, save locally as backup
- [ ] Transcription fails → Show error, allow retry, can skip and transcribe later
- [ ] Note generation fails → Show error, allow manual entry
- [ ] Storage quota exceeded → Alert user, prevent recording start
- [ ] Network disconnects during recording → Auto-save chunks, resume upload
- [ ] User closes tab during recording → Warn before leaving
- [ ] Recording expires (signed URL) → Auto-refresh URL

Step 3: User Experience Polish
- [ ] Loading states for all async operations
- [ ] Progress indicators for uploads
- [ ] Success messages after saves
- [ ] Clear error messages (not technical jargon)
- [ ] Confirmation before deleting recordings
- [ ] Keyboard shortcuts (space to pause, etc.)
- [ ] Mobile-responsive design
- [ ] Accessibility (screen reader support)

Step 4: Performance Optimization
- [ ] Lazy load recordings (don't load all at once)
- [ ] Compress videos before upload
- [ ] Stream large files (don't load entire file in memory)
- [ ] Cache signed URLs (refresh before expiry)
- [ ] Paginate recording list
- [ ] Background processing for transcription

Step 5: Security Audit
- [ ] Authorization on all endpoints
- [ ] No sensitive data in URLs
- [ ] Encrypted storage
- [ ] Audit logging for access
- [ ] Rate limiting on API endpoints
- [ ] Input validation
- [ ] XSS protection
- [ ] CSRF tokens

🚦 STOP & TEST: Run full end-to-end test. Everything should work smoothly.
```

---

## 🐛 Common Issues & Solutions

### **Issue: Recording won't start**
**Check:**
- Browser permissions granted?
- HTTPS enabled? (required for MediaRecorder)
- Codec supported? (try video/webm;codecs=vp9)
- Console errors?

**Solution:**
```javascript
// Check for MediaRecorder support
if (!MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
  console.error('video/webm is not supported')
  // Try fallback codec
}
```

### **Issue: Upload fails**
**Check:**
- GCS credentials correct?
- Bucket permissions set?
- File size limits?
- Network connectivity?

**Solution:**
```typescript
// Add retry logic
const uploadWithRetry = async (blob, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await uploadToGCS(blob)
    } catch (err) {
      if (i === retries - 1) throw err
      await sleep(1000 * Math.pow(2, i)) // Exponential backoff
    }
  }
}
```

### **Issue: Gemini API rate limits**
**Solution:**
```typescript
// Add rate limiting
const rateLimiter = new RateLimiter({
  tokensPerInterval: 10,
  interval: 'minute'
})

await rateLimiter.removeTokens(1)
const result = await model.generateContent(...)
```

### **Issue: Transcript quality poor**
**Check:**
- Audio quality sufficient?
- Enough context provided to Gemini?
- Using best model (gemini-1.5-pro)?

**Solution:**
```typescript
// Improve prompt
const improvedPrompt = `
You are a professional medical transcriptionist.
This is a therapy session between a licensed therapist and their patient.
Accurately transcribe every word spoken.
Identify speakers as "Therapist" and "Patient".
Include timestamps every 5 seconds.
Use proper punctuation and grammar.
If audio is unclear, note it as [inaudible].
`
```

---

## 🔒 HIPAA Compliance Checklist

### **Required for Production:**

**Encryption:**
- [ ] Recordings encrypted at rest (GCS default encryption)
- [ ] Uploads encrypted in transit (HTTPS)
- [ ] Signed URLs with expiration
- [ ] No sensitive data in URLs or logs

**Access Control:**
- [ ] Only appointment participants can view
- [ ] Authorization on all API endpoints
- [ ] Audit logging for all access
- [ ] Role-based permissions (therapist can delete, patient cannot)

**Data Retention:**
- [ ] Define retention policy (7 years recommended)
- [ ] Automatic deletion after retention period
- [ ] Patient can request deletion
- [ ] Secure deletion (not just soft delete)

**Audit Trail:**
- [ ] Log who accessed recordings
- [ ] Log when recordings were accessed
- [ ] Log all modifications
- [ ] Log deletions
- [ ] Audit logs cannot be tampered with

**Business Associate Agreement (BAA):**
- [ ] Sign BAA with Google Cloud (if using GCS)
- [ ] Sign BAA with AI provider (Google Gemini)
- [ ] Document data flow
- [ ] Incident response plan

---

## 📊 Success Metrics (End of Day 9)

### **Must Have (MVP):**
- ✅ Can record video sessions
- ✅ Recordings stored in cloud
- ✅ Can playback recordings
- ✅ Basic transcript generated
- ✅ Basic notes generated

### **Should Have:**
- ✅ Error handling for common issues
- ✅ Loading states and progress indicators
- ✅ Authorization and access control
- ✅ Transcript with speaker labels
- ✅ Notes editable by therapist

### **Nice to Have:**
- ⭐ Timestamp sync (click transcript → jump to video)
- ⭐ Search within transcript
- ⭐ Multiple AI models (fallback if one fails)
- ⭐ Recording quality settings
- ⭐ Automatic transcript generation (no button needed)

---

## 🎯 End-of-Session Checklist

**Before Wrapping Up Day 9:**

**Code:**
- [ ] All files committed
- [ ] Branch pushed to remote
- [ ] No console errors
- [ ] TypeScript compiles
- [ ] Tested end-to-end

**Documentation:**
- [ ] Update TODO.md
- [ ] Update ABOUT.md
- [ ] Update README.md
- [ ] Create DAY_9_COMPLETE.md
- [ ] Create HANDOFF_DAY_9.md
- [ ] Create TOMORROW_PROMPTS_DAY_10.md

**Database:**
- [ ] Schema updated
- [ ] Migrations run
- [ ] Test data created
- [ ] Verify in Prisma Studio

**Environment:**
- [ ] .env.local updated
- [ ] GCS configured
- [ ] Gemini API key set
- [ ] All secrets documented

---

## 💬 End-of-Session Wrap-Up Prompt

```
Great work today! We've completed Day 9 - Recording & AI Integration.

Let's wrap up the session properly:

1. Commit all code changes
2. Push to remote branch
3. Update all documentation:
   - docs/TODO.md (mark completed tasks)
   - docs/ABOUT.md (add Day 9 to version history)
   - README.md (update with Day 9 features)
   - russell-mental-health/README_QR.md (update status)
   - Create docs/daily/DAY_9_COMPLETE.md
   - Create docs/sessions/HANDOFF_DAY_9.md
   - Create docs/sessions/TOMORROW_PROMPTS_DAY_10.md

4. Test one more time:
   - Record session
   - Generate transcript
   - Generate notes
   - Verify everything works

5. Create summary of:
   - What we built today
   - What's working
   - What's next (Day 10)

Please follow the documentation format from Day 8 (docs/daily/DAY_8_COMPLETE.md) for consistency.

After documentation is complete, display the prompt for tomorrow (Day 10) so I can copy it.
```

---

## 🚀 Quick Reference

### **Useful Commands:**
```bash
# Start dev server
npm run dev:all

# Database
npx prisma studio
npx prisma db push

# Check recording in GCS
gsutil ls gs://therapyhub-recordings/

# Test Gemini API
curl -H 'Content-Type: application/json' \
     -d '{"contents":[{"parts":[{"text":"Test"}]}]}' \
     -X POST "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=API_KEY"
```

### **File Locations:**
```
lib/recording/              ← Recording utilities
app/api/recordings/         ← API endpoints
components/recording/       ← UI components
prisma/schema.prisma       ← Database models
```

---

**Ready for Day 9:** 🎬🎤📝✨

You're about to build the most impactful feature of the entire system - AI-powered clinical note generation. This will save therapists 30-45 minutes per session and improve documentation quality. Let's make it happen!

**Remember:** Build incrementally, test at each phase, and ask questions if anything is unclear. You've got this! 🚀
