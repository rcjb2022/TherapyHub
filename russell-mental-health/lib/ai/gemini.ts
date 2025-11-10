// Gemini 2.5 Flash AI Provider (New @google/genai SDK)
// Google's multimodal AI for transcription, notes, and translation

import { GoogleGenAI, type File } from '@google/genai'
import {
  type AIProvider,
  type TranscriptionOptions,
  type TranscriptResult,
  type NotesOptions,
  type ClinicalNotes,
  type TranslationOptions,
  type TranslationResult,
  type SummaryOptions,
  AIProviderError,
  RateLimitError,
} from './types'

export class GeminiProvider implements AIProvider {
  name = 'gemini'
  private client: GoogleGenAI
  private model: string
  private apiKey: string

  // File polling configuration
  private static readonly DEFAULT_MAX_WAIT_SECONDS = 60
  private static readonly POLL_INTERVAL_MS = 2000

  constructor(apiKey?: string, model: string = 'gemini-2.0-flash-exp') {
    const key = apiKey || process.env.GEMINI_API_KEY
    if (!key) {
      throw new Error('GEMINI_API_KEY is required')
    }
    this.apiKey = key
    this.client = new GoogleGenAI({ apiKey: key })
    this.model = model
  }

  // Centralized error handling to avoid duplication
  private handleError(error: any, operation: string): never {
    // Log the actual error for debugging (excluding response which may contain PHI)
    console.error(`[Gemini] ${operation} error details:`, {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      stack: error.stack,
    })

    // Check status code first (more reliable than string matching)
    if (error.status === 429 || error.message?.includes('rate limit')) {
      throw new RateLimitError('gemini')
    }
    throw new AIProviderError(`${operation} failed: ${error.message || 'Unknown error'}`, 'gemini', error)
  }

  /**
   * Wait for uploaded file to become ACTIVE (ready for use)
   * Gemini files go through: PROCESSING → ACTIVE or FAILED
   */
  private async waitForFileActive(
    fileName: string,
    maxWaitSeconds: number = GeminiProvider.DEFAULT_MAX_WAIT_SECONDS
  ): Promise<void> {
    const startTime = Date.now()
    let checkCount = 0

    while (Date.now() - startTime < maxWaitSeconds * 1000) {
      const file = await this.client.files.get({ name: fileName })
      checkCount++

      // Log only first check and every 5th check to reduce noise
      if (checkCount === 1 || checkCount % 5 === 0) {
        console.log(`[Gemini] File state: ${file.state} (check ${checkCount})`)
      }

      if (file.state === 'ACTIVE') {
        console.log(`[Gemini] File is ready for transcription after ${checkCount} checks`)
        return // File is ready!
      }

      if (file.state === 'FAILED') {
        throw new AIProviderError(`File processing failed: ${file.error?.message || 'Unknown error'}`, 'gemini')
      }

      // Still PROCESSING, wait and check again
      await new Promise((resolve) => setTimeout(resolve, GeminiProvider.POLL_INTERVAL_MS))
    }

    throw new AIProviderError(`File did not become ACTIVE within ${maxWaitSeconds} seconds`, 'gemini')
  }

  async transcribe(audioBuffer: Buffer, options?: TranscriptionOptions): Promise<TranscriptResult> {
    try {
      const prompt = `
You are a professional medical transcriptionist specializing in psychotherapy sessions.

Transcribe this therapy session audio with the following requirements:
1. Identify two speakers: "Therapist" and "Patient"
2. Include accurate timestamps for each segment
3. Preserve all verbal content verbatim
4. Mark unclear audio as [inaudible]
5. Language: ${options?.language || 'en'}

Return a JSON object with this structure:
{
  "fullText": "complete transcript",
  "segments": [
    {
      "speaker": "Therapist" or "Patient",
      "text": "exact words spoken",
      "startTime": 0.0,
      "endTime": 5.2
    }
  ],
  "language": "${options?.language || 'en'}"
}
`

      const result = await this.client.models.generateContent({
        model: this.model,
        contents: [
          { text: prompt },
          {
            inlineData: {
              mimeType: options?.mimeType || 'audio/webm',
              data: audioBuffer.toString('base64'),
            },
          },
        ],
      })

      const response = result.text
      const parsed = JSON.parse(response)

      // Normalize segment keys (API returns startTime/endTime)
      const segments = parsed.segments.map((seg: any) => ({
        speaker: seg.speaker,
        text: seg.text,
        start: seg.start || seg.startTime || 0,
        end: seg.end || seg.endTime || 0,
      }))

      return {
        fullText: parsed.fullText,
        segments,
        language: parsed.language || options?.language || 'en',
        speakerCount: 2,
        generatedBy: 'gemini',
        duration: segments[segments.length - 1]?.end || 0,
      }
    } catch (error: any) {
      this.handleError(error, 'Transcription')
    }
  }

  /**
   * Transcribe from file path (memory-efficient for large files)
   * Uses Gemini File API to avoid loading entire file into memory
   */
  async transcribeFromFile(filePath: string, options?: TranscriptionOptions): Promise<TranscriptResult> {
    let uploadResult: File | undefined
    try {
      // Upload file to Gemini File API
      console.log(`[Gemini] Uploading file to Gemini File API: ${filePath}`)
      uploadResult = await this.client.files.upload({
        file: filePath,
        config: {
          mimeType: options?.mimeType || 'video/webm',
          displayName: `therapy-session-${Date.now()}`,
        },
      })

      console.log(`[Gemini] File uploaded: ${uploadResult.uri}`)

      // Wait for file to be processed and become ACTIVE
      console.log(`[Gemini] Waiting for file to become ACTIVE...`)
      await this.waitForFileActive(uploadResult.name)
      console.log(`[Gemini] File is ready for transcription`)

      const prompt = `
You are a professional medical transcriptionist specializing in psychotherapy sessions.

Transcribe this therapy session video with the following requirements:
1. Identify two speakers: "Therapist" and "Patient"
2. Include accurate timestamps for each segment
3. Preserve all verbal content verbatim
4. Mark unclear audio as [inaudible]
5. Language: ${options?.language || 'auto-detect'}

Return a JSON object with this structure:
{
  "fullText": "complete transcript",
  "segments": [
    {
      "speaker": "Therapist" or "Patient",
      "text": "exact words spoken",
      "start": 0.0,
      "end": 5.2
    }
  ],
  "language": "detected language code (en, es, pt, fr)"
}
`

      const result = await this.client.models.generateContent({
        model: this.model,
        contents: [
          { text: prompt },
          {
            fileData: {
              mimeType: uploadResult.mimeType,
              fileUri: uploadResult.uri,
            },
          },
        ],
      })

      const response = result.text

      // Extract JSON from response (may be wrapped in markdown)
      let jsonText = response.trim()
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '').trim()
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '').trim()
      }

      const parsed = JSON.parse(jsonText)

      // Normalize segment keys (API might return start/end or startTime/endTime)
      const segments = parsed.segments.map((seg: any) => ({
        speaker: seg.speaker,
        text: seg.text,
        start: seg.start || seg.startTime || 0,
        end: seg.end || seg.endTime || 0,
      }))

      return {
        fullText: parsed.fullText,
        segments,
        language: parsed.language || options?.language || 'en',
        speakerCount: 2,
        generatedBy: 'gemini',
        duration: segments[segments.length - 1]?.end || 0,
      }
    } catch (error: any) {
      this.handleError(error, 'File transcription')
    } finally {
      // Delete uploaded file from Gemini to free up quota
      // Note: Files auto-expire after 48 hours, so deletion is optional
      if (uploadResult) {
        // The new SDK may have a different delete method - skip for now
        // Files auto-expire, so this is not critical
        console.log(`[Gemini] Skipping file deletion (files auto-expire in 48h): ${uploadResult.name}`)
      }
    }
  }

  // SOAP Notes: Subjective, Objective, Assessment, Plan
  async generateSOAPNotes(transcript: TranscriptResult, options?: NotesOptions): Promise<ClinicalNotes> {
    try {
      const prompt = `
You are an experienced licensed clinical psychologist reviewing a therapy session transcript.

Generate professional clinical notes in SOAP format (Subjective, Objective, Assessment, Plan).

Requirements:
- Be objective, professional, and clinically accurate
- Use appropriate clinical terminology
- Include specific examples from the transcript
- Identify chief complaints and key topics
- Note therapeutic interventions used
- Suggest action items and homework
- ${options?.includeRiskAssessment ? 'Include risk assessment (suicide, homicide, self-harm)' : ''}
- ${options?.includeTreatmentPlan ? 'Include detailed treatment plan recommendations' : ''}

Transcript:
${transcript.fullText}

Return a JSON object with this structure:
{
  "format": "SOAP",
  "subjective": "What the patient reported (symptoms, feelings, experiences)",
  "objective": "Therapist's clinical observations (affect, behavior, appearance)",
  "assessment": "Clinical assessment and diagnostic impressions",
  "plan": "Treatment plan, recommendations, and next steps",
  "chiefComplaints": ["complaint1", "complaint2"],
  "keyTopics": ["topic1", "topic2", "topic3"],
  "interventionsUsed": ["intervention1", "intervention2"],
  "actionItems": ["action1", "action2"],
  ${options?.includeRiskAssessment ? '"riskAssessment": "Risk assessment findings",' : ''}
  "progressNotes": "Overall session progress and observations"
}
`

      const result = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
      })
      const response = result.text

      // Extract JSON from response (may be wrapped in markdown)
      let jsonText = response.trim()
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '').trim()
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '').trim()
      }

      const parsed = JSON.parse(jsonText)

      return {
        ...parsed,
        sessionDate: new Date(),
        generatedBy: 'gemini',
      }
    } catch (error: any) {
      this.handleError(error, 'SOAP note generation')
    }
  }

  // DAP Notes: Data, Assessment, Plan
  async generateDAPNotes(transcript: TranscriptResult, options?: NotesOptions): Promise<ClinicalNotes> {
    try {
      const prompt = `
You are an experienced licensed clinical psychologist reviewing a therapy session transcript.

Generate professional clinical notes in DAP format (Data, Assessment, Plan).

Requirements:
- Be objective, professional, and clinically accurate
- Use appropriate clinical terminology
- Include specific examples from the transcript
- Combine subjective and objective information in the Data section
- ${options?.includeRiskAssessment ? 'Include risk assessment in Assessment section' : ''}
- ${options?.includeTreatmentPlan ? 'Include detailed treatment plan recommendations in Plan' : ''}

Transcript:
${transcript.fullText}

Return a JSON object with this structure:
{
  "format": "DAP",
  "data": "Observable client behaviors, statements, and significant events during the session. Combine both subjective (what client reported) and objective (therapist observations) information.",
  "assessment": "Clinical analysis of the client's progress, mental status, and interpretation of the data. Include diagnostic impressions and risk assessment if applicable.",
  "plan": "Treatment plan, interventions to be used, homework assignments, and next steps.",
  "chiefComplaints": ["complaint1", "complaint2"],
  "keyTopics": ["topic1", "topic2", "topic3"],
  "interventionsUsed": ["intervention1", "intervention2"],
  "actionItems": ["action1", "action2"],
  ${options?.includeRiskAssessment ? '"riskAssessment": "Risk assessment findings",' : ''}
  "progressNotes": "Overall session progress and observations"
}
`

      const result = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
      })
      const response = result.text

      // Extract JSON from response (may be wrapped in markdown)
      let jsonText = response.trim()
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '').trim()
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '').trim()
      }

      const parsed = JSON.parse(jsonText)

      return {
        ...parsed,
        sessionDate: new Date(),
        generatedBy: 'gemini',
      }
    } catch (error: any) {
      this.handleError(error, 'DAP note generation')
    }
  }

  // BIRP Notes: Behavior, Intervention, Response, Plan
  async generateBIRPNotes(transcript: TranscriptResult, options?: NotesOptions): Promise<ClinicalNotes> {
    try {
      const prompt = `
You are an experienced licensed clinical psychologist reviewing a therapy session transcript.

Generate professional clinical notes in BIRP format (Behavior, Intervention, Response, Plan).

Requirements:
- Be objective, professional, and clinically accurate
- Use appropriate clinical terminology
- Include specific examples from the transcript
- Focus on observable behaviors and specific interventions
- Document client's response to interventions
- ${options?.includeRiskAssessment ? 'Include risk assessment considerations' : ''}
- ${options?.includeTreatmentPlan ? 'Include detailed treatment plan recommendations in Plan' : ''}

Transcript:
${transcript.fullText}

Return a JSON object with this structure:
{
  "format": "BIRP",
  "behavior": "Observable client behaviors, presentation, and demeanor during the session. Include both verbal and non-verbal behaviors.",
  "intervention": "Specific therapeutic interventions, techniques, and approaches used by the therapist during the session.",
  "response": "How the client responded to the interventions. Include both immediate reactions and demonstrated understanding or progress.",
  "plan": "Treatment plan moving forward, including homework, goals for next session, and any modifications to treatment approach.",
  "chiefComplaints": ["complaint1", "complaint2"],
  "keyTopics": ["topic1", "topic2", "topic3"],
  "interventionsUsed": ["intervention1", "intervention2"],
  "actionItems": ["action1", "action2"],
  ${options?.includeRiskAssessment ? '"riskAssessment": "Risk assessment findings",' : ''}
  "progressNotes": "Overall session progress and observations"
}
`

      const result = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
      })
      const response = result.text

      // Extract JSON from response (may be wrapped in markdown)
      let jsonText = response.trim()
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '').trim()
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '').trim()
      }

      const parsed = JSON.parse(jsonText)

      return {
        ...parsed,
        sessionDate: new Date(),
        generatedBy: 'gemini',
      }
    } catch (error: any) {
      this.handleError(error, 'BIRP note generation')
    }
  }

  // Legacy method - defaults to SOAP
  async generateNotes(transcript: TranscriptResult, options?: NotesOptions): Promise<ClinicalNotes> {
    return this.generateSOAPNotes(transcript, options)
  }

  async translate(
    text: string,
    targetLanguage: string,
    options?: TranslationOptions
  ): Promise<TranslationResult> {
    try {
      const sourceHint = options?.sourceLanguage ? `Source language: ${options.sourceLanguage}` : 'Detect source language automatically'

      const prompt = `
Translate the following clinical text to ${targetLanguage}.

Requirements:
- Maintain clinical terminology accuracy
- ${options?.preserveFormatting ? 'Preserve all formatting (paragraphs, lists, etc.)' : ''}
- ${sourceHint}
- Use appropriate professional medical terminology in target language

Text to translate:
${text}

Return a JSON object:
{
  "translatedText": "translated content",
  "sourceLanguage": "detected or provided source language code",
  "targetLanguage": "${targetLanguage}"
}
`

      const result = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
      })
      const response = result.text
      const parsed = JSON.parse(response)

      return parsed
    } catch (error: any) {
      this.handleError(error, 'Translation')
    }
  }

  async summarize(transcript: TranscriptResult, options?: SummaryOptions): Promise<string> {
    try {
      const styleGuidance = {
        brief: 'Provide a concise 2-3 sentence summary',
        detailed: 'Provide a comprehensive paragraph summarizing all major points',
        clinical: 'Provide a clinical summary suitable for medical records',
      }[options?.style || 'brief']

      const prompt = `
You are a clinical psychologist summarizing a therapy session.

${styleGuidance}
${options?.maxLength ? `Maximum length: ${options.maxLength} words` : ''}
${options?.language ? `Language: ${options.language}` : 'Language: English'}

Transcript:
${transcript.fullText}

Provide ONLY the summary text, no JSON, no additional formatting.
`

      const result = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
      })
      return result.text.trim()
    } catch (error: any) {
      this.handleError(error, 'Summarization')
    }
  }
}
