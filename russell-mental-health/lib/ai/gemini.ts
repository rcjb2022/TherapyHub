// Gemini 2.5 Flash AI Provider
// Google's multimodal AI for transcription, notes, and translation

import { GoogleGenerativeAI } from '@google/generative-ai'
import type {
  AIProvider,
  TranscriptionOptions,
  TranscriptResult,
  NotesOptions,
  ClinicalNotes,
  TranslationOptions,
  TranslationResult,
  SummaryOptions,
  AIProviderError,
  RateLimitError,
} from './types'

export class GeminiProvider implements AIProvider {
  name = 'gemini'
  private client: GoogleGenerativeAI
  private model: string

  constructor(apiKey?: string, model: string = 'gemini-2.0-flash-exp') {
    const key = apiKey || process.env.GEMINI_API_KEY
    if (!key) {
      throw new Error('GEMINI_API_KEY is required')
    }
    this.client = new GoogleGenerativeAI(key)
    this.model = model
  }

  // Centralized error handling to avoid duplication
  private handleError(error: any, operation: string): never {
    if (error.message?.includes('rate limit') || error.message?.includes('429')) {
      throw new RateLimitError('gemini')
    }
    throw new AIProviderError(`${operation} failed`, 'gemini', error)
  }

  async transcribe(audioBuffer: Buffer, options?: TranscriptionOptions): Promise<TranscriptResult> {
    try {
      const model = this.client.getGenerativeModel({ model: this.model })

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

      const result = await model.generateContent([
        { text: prompt },
        {
          inlineData: {
            mimeType: options?.mimeType || 'audio/webm',
            data: audioBuffer.toString('base64'),
          },
        },
      ])

      const response = result.response.text()
      const parsed = JSON.parse(response)

      return {
        fullText: parsed.fullText,
        segments: parsed.segments,
        language: parsed.language || options?.language || 'en',
        speakerCount: 2,
      }
    } catch (error: any) {
      this.handleError(error, 'Transcription')
    }
  }

  async generateNotes(transcript: TranscriptResult, options?: NotesOptions): Promise<ClinicalNotes> {
    try {
      const model = this.client.getGenerativeModel({ model: this.model })

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

      const result = await model.generateContent(prompt)
      const response = result.response.text()
      const parsed = JSON.parse(response)

      return {
        ...parsed,
        sessionDate: new Date(),
        generatedBy: 'gemini',
      }
    } catch (error: any) {
      this.handleError(error, 'Note generation')
    }
  }

  async translate(
    text: string,
    targetLanguage: string,
    options?: TranslationOptions
  ): Promise<TranslationResult> {
    try {
      const model = this.client.getGenerativeModel({ model: this.model })

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

      const result = await model.generateContent(prompt)
      const response = result.response.text()
      const parsed = JSON.parse(response)

      return parsed
    } catch (error: any) {
      this.handleError(error, 'Translation')
    }
  }

  async summarize(transcript: TranscriptResult, options?: SummaryOptions): Promise<string> {
    try {
      const model = this.client.getGenerativeModel({ model: this.model })

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

      const result = await model.generateContent(prompt)
      return result.response.text().trim()
    } catch (error: any) {
      this.handleError(error, 'Summarization')
    }
  }
}
