// AI Service Type Definitions
// Multi-provider abstraction for Gemini, GROK, and future GEMMA

export interface AIProvider {
  name: string
  transcribe(audioBuffer: Buffer, options?: TranscriptionOptions): Promise<TranscriptResult>
  transcribeFromFile(filePath: string, options?: TranscriptionOptions): Promise<TranscriptResult>
  generateNotes(transcript: TranscriptResult, options?: NotesOptions): Promise<ClinicalNotes>
  translate(text: string, targetLanguage: string, options?: TranslationOptions): Promise<TranslationResult>
  summarize(transcript: TranscriptResult, options?: SummaryOptions): Promise<string>
}

export interface TranscriptionOptions {
  language?: string // ISO 639-1 code (en, es, pt, fr)
  speakerLabels?: string[] // ["Therapist", "Patient"]
  includeTimestamps?: boolean
  mimeType?: string // e.g. 'audio/webm', 'audio/mp3', 'audio/wav'
}

export interface TranscriptResult {
  fullText: string
  segments: TranscriptSegment[]
  language: string
  duration?: number
  speakerCount?: number
  generatedBy?: string
}

export interface TranscriptSegment {
  speaker: string // "Therapist" or "Patient"
  text: string
  start: number // seconds
  end: number // seconds
  confidence?: number // 0-1
}

export interface NotesOptions {
  format?: 'SOAP' | 'narrative' | 'structured'
  includeRiskAssessment?: boolean
  includeTreatmentPlan?: boolean
}

export interface ClinicalNotes {
  // SOAP Format
  subjective: string // What patient reported
  objective: string // Therapist observations
  assessment: string // Clinical assessment
  plan: string // Treatment plan

  // Additional sections
  chiefComplaints: string[]
  keyTopics: string[]
  interventionsUsed: string[]
  actionItems: string[]
  riskAssessment?: string
  progressNotes?: string

  // Metadata
  sessionDate: Date
  generatedBy: string // AI provider name
  confidence?: number
}

export interface TranslationOptions {
  sourceLanguage?: string
  preserveFormatting?: boolean
}

export interface TranslationResult {
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  confidence?: number
}

export interface SummaryOptions {
  maxLength?: number // words
  style?: 'brief' | 'detailed' | 'clinical'
  language?: string
}

// Error types
export class AIProviderError extends Error {
  constructor(
    message: string,
    public provider: string,
    public originalError?: Error
  ) {
    super(`[${provider}] ${message}`)
    this.name = 'AIProviderError'
  }
}

export class RateLimitError extends AIProviderError {
  constructor(provider: string, retryAfter?: number) {
    super(`Rate limit exceeded${retryAfter ? `, retry after ${retryAfter}s` : ''}`, provider)
    this.name = 'RateLimitError'
  }
}

export class QuotaExceededError extends AIProviderError {
  constructor(provider: string) {
    super('Quota exceeded for this provider', provider)
    this.name = 'QuotaExceededError'
  }
}
