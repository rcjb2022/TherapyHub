# 📅 Tomorrow's Session Prompts - Day 8

**Date:** November 7, 2025
**Focus:** Video Recording (WebRTC) + Gemini AI Integration + Session Vault UI

---

## 🚀 Session Start Prompt

```
Good morning! Ready to start Day 8.

Day 7 Status: ✅ COMPLETE
- Patient UX improvements finished
- "Today's Schedule" working on both dashboards
- Calendar modal redesigned with large blue button
- Video session waiting room working
- All join flows consistent (30-min window)
- 6 bugs fixed, all features tested

Today's Focus (Day 8):
1. Video Session Recording (WebRTC)
   - Record video sessions
   - Save to Google Cloud Storage
   - 30-day retention policy

2. Gemini AI Integration
   - Auto-transcribe sessions
   - Generate SOAP notes from transcripts
   - Treatment plan suggestions

3. Session Vault UI
   - List past sessions
   - Video player
   - Transcript viewer
   - SOAP notes editor

Current working state:
- Full calendar system ✓
- Patient and therapist UX consistent ✓
- Video waiting room operational ✓
- Ready for recording features ✓

Let's start with WebRTC video recording. What packages do we need?
```

---

## 📋 Priority 1: Video Session Recording (WebRTC) 🎬

### Initial Setup Prompt
```
Let's implement video session recording for therapy sessions.

Requirements:
- Record both therapist and patient video/audio streams
- Save recording to Google Cloud Storage
- 30-day automatic deletion (HIPAA retention)
- Privacy: Recording only with consent
- Start/stop recording controls for therapist

Technology options:
1. simple-peer + MediaRecorder API
2. Daily.co API (third-party)
3. Agora.io (third-party)

Which approach is best for HIPAA compliance and cost?
Show me the architecture plan.
```

### After Package Installation
```
Packages installed. Now let's build the recording system:

Phase 1: Recording Infrastructure
- Create RecordingControls component (start/stop buttons)
- Implement MediaRecorder API
- Capture both audio and video streams
- Store chunks in memory during recording
- Combine chunks when recording stops

Phase 2: Storage
- Upload recording to GCS
- Generate signed URL for playback
- Store metadata in database (appointment link, duration, file size)
- Set 30-day expiration on GCS object

Phase 3: Privacy & Consent
- Recording consent checkbox before session
- Visual indicator when recording (red dot)
- Stop recording button for therapist
- Patient can see if session is being recorded

Show me the implementation for RecordingControls component.
```

### Testing Prompt
```
Let's test the video recording system:

Test 1: Basic Recording
1. Therapist starts session
2. Click "Start Recording" button
3. Record for 30 seconds
4. Click "Stop Recording"
5. Verify file uploads to GCS
6. Check database for recording metadata

Test 2: Playback
1. Go to Session Vault
2. Find recorded session
3. Click to play
4. Verify video and audio quality

Test 3: Consent Flow
1. Patient joins without consent
2. Should see consent checkbox
3. Cannot proceed without checking
4. After consent, join session normally

Test 4: 30-Day Expiration
1. Check GCS bucket settings
2. Verify lifecycle policy set to 30 days
3. Test that old recordings auto-delete

All tests passing? Great! Move to Gemini AI.
```

---

## 📋 Priority 2: Gemini AI Integration ⭐

### Setup Prompt
```
Let's integrate Gemini API for AI-powered session analysis.

Features to implement:
1. Auto-transcribe recorded sessions
2. Generate SOAP notes from transcripts
3. Extract key themes and topics
4. Treatment plan suggestions
5. Session summary

First, set up Gemini API:
- Get API key from Google AI Studio
- Install @google-ai/generativelanguage package
- Test basic prompt/response
- Implement transcript analysis

Show me the setup steps and test prompt.
```

### Transcription Prompt
```
Let's implement automatic transcription:

Workflow:
1. After session ends and recording uploaded
2. Extract audio from video file
3. Send audio to Gemini for transcription
4. Store transcript in database
5. Link transcript to appointment

Database schema update needed:
- Add SessionTranscript model
  - appointmentId (link to appointment)
  - transcript (full text)
  - generatedAt (timestamp)
  - reviewed (boolean)
  - reviewedBy (User ID)

Show me the transcription implementation.
```

### SOAP Notes Generation
```
Create AI-powered SOAP note generation from transcripts:

Prompt engineering for Gemini:
"Analyze the following therapy session transcript and generate SOAP notes:

Transcript:
{transcript_text}

Generate:
- Subjective: Patient's reported symptoms, feelings, concerns
- Objective: Observable behaviors, appearance, affect
- Assessment: Clinical impression, diagnosis considerations
- Plan: Treatment recommendations, homework, next steps

Format as structured JSON."

Implementation:
- Create lib/gemini-soap.ts
- analyzeSoapNotes(transcript) function
- Returns structured SOAP data
- Therapist can edit before saving

Show me the Gemini prompt and implementation.
```

### Treatment Plan Suggestions
```
Add treatment plan suggestion feature:

Gemini analyzes:
- Session transcript
- Previous session notes (if available)
- Diagnosis codes (ICD-10)
- Treatment history

Suggests:
- Therapy approach (CBT, DBT, etc.)
- Homework assignments
- Session frequency
- Medication considerations (if applicable)
- Progress indicators

Therapist reviews and customizes before saving.

Show me the treatment plan prompt engineering.
```

---

## 📋 Priority 3: Session Vault UI 🎬

### Design Prompt
```
Let's design the Session Vault interface for therapists.

Page: /dashboard/video (replace placeholder from Day 7)

Layout:
1. Header
   - Title: "Session Vault"
   - Search box (patient name, date)
   - Filter dropdown (All / Recorded / Not Recorded)

2. Sessions Table
   - Columns: Date | Patient | Duration | Status | Recording | Actions
   - Status: Completed, Cancelled, No-Show
   - Recording: ✓ Available | - Not Recorded
   - Actions: View | Transcript | SOAP Notes

3. Session Detail Modal
   - Video player (if recorded)
   - Tabs: Video | Transcript | SOAP Notes | Analysis
   - Edit and save buttons
   - Export to PDF

Show me the Sessions Table component design.
```

### Implementation Prompt
```
Build the Session Vault page:

Components needed:
1. SessionVaultPage (server component)
   - Fetch all completed appointments for therapist
   - Include patient info, recording status
   - Pass to client components

2. SessionsTable (client component)
   - Display sessions in table
   - Search and filter functionality
   - Click row to open detail modal

3. SessionDetailModal (client component)
   - Video player with controls
   - Transcript display with timestamps
   - SOAP notes editor
   - AI analysis results

4. VideoPlayer (client component)
   - HTML5 video element
   - Playback controls (play, pause, speed, fullscreen)
   - Progress bar with timestamps

Show me SessionsTable implementation first.
```

### Video Player Component
```
Build the video player for recorded sessions:

Features:
- HTML5 <video> element
- Custom controls (play/pause, volume, fullscreen)
- Playback speed (0.5x, 1x, 1.5x, 2x)
- Timestamp markers for key moments
- Transcript synchronized with video (click transcript, jump to time)

Use signed URLs from GCS (7-day expiration, regenerate if expired)

Show me the VideoPlayer component code.
```

---

## 🐛 If Issues Arise

### Recording Not Working
```
Video recording fails or produces empty file.

Debug steps:
1. Check MediaRecorder support
   - console.log(MediaRecorder.isTypeSupported('video/webm'))
   - Try different codecs (webm, mp4)

2. Check browser permissions
   - Camera and microphone access granted?
   - Log getUserMedia() response

3. Check recording state
   - Log MediaRecorder.state during recording
   - Verify chunks being captured

4. Check file upload
   - Log upload response from GCS
   - Verify file exists in bucket

Show me MediaRecorder implementation and error logs.
```

### Gemini API Errors
```
Gemini API not responding or returning errors.

Troubleshoot:
1. Verify API key valid
2. Check request format
3. Look at error response
4. Test with simpler prompt first
5. Check quota limits

Common issues:
- Invalid API key
- Prompt too long (token limit)
- Rate limiting
- Model not available in region

Show me the Gemini API call and error message.
```

### GCS Upload Failures
```
Video files not uploading to Cloud Storage.

Check:
1. Service account permissions
2. Bucket name correct
3. File size within limits
4. Network timeout settings
5. CORS configuration

Show me the upload function and error logs.
```

---

## 🧪 End of Day Testing Checklist

```
Comprehensive testing before marking Day 8 complete:

Video Recording:
- [ ] Can start recording during session ✓
- [ ] Can stop recording ✓
- [ ] File uploads to GCS ✓
- [ ] Recording linked to appointment in DB ✓
- [ ] 30-day expiration policy set ✓
- [ ] Consent flow works ✓

Gemini AI:
- [ ] Transcription generates from recording ✓
- [ ] SOAP notes generated from transcript ✓
- [ ] Notes make clinical sense ✓
- [ ] Therapist can edit AI suggestions ✓
- [ ] Treatment plans suggested ✓

Session Vault:
- [ ] Sessions list displays past appointments ✓
- [ ] Can filter by patient ✓
- [ ] Video player works ✓
- [ ] Transcript displays ✓
- [ ] SOAP notes editor works ✓
- [ ] Can export to PDF ✓

All passing? Perfect! Document Day 8 and prepare for Day 9.
```

---

## 📝 Documentation Prompts

```
Day 8 complete! Update all documentation:

1. Create DAY_8_COMPLETE.md
   - Video recording implementation
   - Gemini AI integration
   - Session Vault UI
   - All bug fixes
   - Test results

2. Update TODO.md
   - Mark Day 8 complete ✅
   - Add Day 9 priorities
   - Update next session notes

3. Update README.md (main)
   - Version 0.8.0 (Day 8 Complete)
   - Add video features
   - Update roadmap

4. Update README_QR.md
   - Current status v0.8.0
   - Latest achievements
   - Next priorities

5. Update ABOUT.md
   - Version history
   - New features documented

6. Create HANDOFF_DAY_8.md
   - What works
   - Day 9 focus
   - Setup notes

7. Create TOMORROW_PROMPTS_DAY_9.md
   - Advanced video features
   - Analytics
   - Performance optimization

Make it comprehensive!
```

---

## 🎯 Success Criteria

**Day 8 is complete when:**
- ✅ Video sessions can be recorded
- ✅ Recordings saved to GCS with 30-day expiration
- ✅ Gemini AI transcribes sessions
- ✅ SOAP notes auto-generated from transcripts
- ✅ Session Vault UI functional
- ✅ Video player works
- ✅ Therapist can review and edit AI suggestions
- ✅ All features tested end-to-end
- ✅ HIPAA compliance maintained
- ✅ Documentation complete

---

## 💡 Tips for Success

1. **Test Recording Early** - Don't build full UI before testing MediaRecorder
2. **Start with Small Files** - Test with 30-second recordings first
3. **Gemini API Limits** - Be aware of token limits and rate limits
4. **HIPAA Compliance** - Ensure recordings encrypted at rest and in transit
5. **User Consent** - Always get explicit consent before recording
6. **Privacy First** - Build privacy controls from start, not afterthought
7. **Error Handling** - Recording can fail for many reasons, handle gracefully
8. **Storage Costs** - Monitor GCS costs, video files are large

---

## 🔗 Helpful Resources

**WebRTC Recording:**
- MediaRecorder API: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
- simple-peer: https://github.com/feross/simple-peer

**Gemini API:**
- Docs: https://ai.google.dev/docs
- Pricing: https://ai.google.dev/pricing
- API Reference: https://ai.google.dev/api

**GCS Lifecycle:**
- Object Lifecycle Management: https://cloud.google.com/storage/docs/lifecycle

---

## 🚀 Day 9 Preview

**Advanced Features:**
- Real-time session analytics
- Multi-participant sessions (family therapy)
- Session quality monitoring
- Performance optimization
- Advanced search (semantic search in transcripts)
- Session highlights and key moments
- Patient progress visualization

---

**Good luck with Day 8!** 🎬⭐

Focus on getting recording working first, then add AI features, then polish UI. Build → Test → Iterate!
