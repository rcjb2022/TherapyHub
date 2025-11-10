// AI Service Provider with Automatic Fallback
// Primary: Gemini 2.5 Flash → Fallback: GROK (xAI) → Future: GEMMA (self-hosted)

import { GeminiProvider } from './gemini'
import { GrokProvider } from './grok'
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
  QuotaExceededError,
} from './types'

export class AIService implements AIProvider {
  name = 'multi-provider'
  private providers: AIProvider[]

  constructor() {
    // Initialize providers in priority order
    this.providers = []

    // Primary: Gemini 2.5 Flash
    try {
      this.providers.push(new GeminiProvider())
      console.log('✅ Gemini provider initialized')
    } catch (error) {
      console.warn('⚠️ Gemini provider not available:', (error as Error).message)
    }

    // Fallback: GROK (xAI)
    try {
      this.providers.push(new GrokProvider())
      console.log('✅ GROK fallback provider initialized')
    } catch (error) {
      console.warn('⚠️ GROK provider not available:', (error as Error).message)
    }

    if (this.providers.length === 0) {
      throw new Error('No AI providers available. Please configure GEMINI_API_KEY or GROK_API_KEY.')
    }

    console.log(`🤖 AI Service ready with ${this.providers.length} provider(s)`)
  }

  private async executeWithFallback<T>(
    operation: (provider: AIProvider) => Promise<T>,
    operationName: string
  ): Promise<T> {
    const errors: Array<{ provider: string; error: Error }> = []

    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[i]

      try {
        console.log(`[AI Service] Attempting ${operationName} with ${provider.name}...`)
        const result = await operation(provider)
        console.log(`[AI Service] ✅ ${operationName} succeeded with ${provider.name}`)
        return result
      } catch (error: any) {
        console.error(`[AI Service] ❌ ${operationName} failed with ${provider.name}:`, error.message)
        errors.push({ provider: provider.name, error })

        // If rate limited or quota exceeded, try next provider immediately
        if (error instanceof RateLimitError || error instanceof QuotaExceededError) {
          console.log(`[AI Service] Rate limit/quota exceeded for ${provider.name}, trying next provider...`)
          continue
        }

        // For other errors, also try next provider
        if (i < this.providers.length - 1) {
          console.log(`[AI Service] Falling back to next provider...`)
          continue
        }
      }
    }

    // All providers failed
    const errorMessages = errors.map((e) => `${e.provider}: ${e.error.message}`).join('; ')
    throw new AIProviderError(
      `${operationName} failed with all providers: ${errorMessages}`,
      'multi-provider'
    )
  }

  async transcribe(audioBuffer: Buffer, options?: TranscriptionOptions): Promise<TranscriptResult> {
    return this.executeWithFallback(
      (provider) => provider.transcribe(audioBuffer, options),
      'transcription'
    )
  }

  async transcribeFromFile(filePath: string, options?: TranscriptionOptions): Promise<TranscriptResult> {
    return this.executeWithFallback(
      (provider) => provider.transcribeFromFile(filePath, options),
      'file transcription'
    )
  }

  async generateNotes(transcript: TranscriptResult, options?: NotesOptions): Promise<ClinicalNotes> {
    return this.executeWithFallback(
      (provider) => provider.generateNotes(transcript, options),
      'note generation'
    )
  }

  async translate(
    text: string,
    targetLanguage: string,
    options?: TranslationOptions
  ): Promise<TranslationResult> {
    return this.executeWithFallback(
      (provider) => provider.translate(text, targetLanguage, options),
      'translation'
    )
  }

  async summarize(transcript: TranscriptResult, options?: SummaryOptions): Promise<string> {
    return this.executeWithFallback(
      (provider) => provider.summarize(transcript, options),
      'summarization'
    )
  }

  // Utility: Get current provider status
  getStatus(): { available: number; providers: string[] } {
    return {
      available: this.providers.length,
      providers: this.providers.map((p) => p.name),
    }
  }

  // Utility: Test provider connection
  async testConnection(): Promise<boolean> {
    try {
      const mockTranscript: TranscriptResult = {
        fullText: 'Test session',
        segments: [{ speaker: 'Therapist', text: 'Hello', start: 0, end: 1 }],
        language: 'en',
      }

      await this.summarize(mockTranscript, { style: 'brief' })
      return true
    } catch (error) {
      console.error('[AI Service] Connection test failed:', error)
      return false
    }
  }
}

// Export singleton instance
let aiServiceInstance: AIService | null = null

export function getAIService(): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService()
  }
  return aiServiceInstance
}

// Export for type checking
export type { AIProvider } from './types'
export * from './types'
