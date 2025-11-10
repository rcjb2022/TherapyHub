// GROK (xAI) Provider - Fallback AI Service
// Uses grok-4-fast model for transcription, notes, and translation

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

export class GrokProvider implements AIProvider {
  name = 'grok'
  private apiKey: string
  private model: string
  private baseUrl: string

  constructor(apiKey?: string, model: string = 'grok-4-fast') {
    const key = apiKey || process.env.GROK_API_KEY
    if (!key) {
      throw new Error('GROK_API_KEY is required')
    }
    this.apiKey = key
    this.model = model
    this.baseUrl = 'https://api.x.ai/v1'
  }

  private async makeRequest(messages: any[]): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.2, // Lower temperature for clinical accuracy
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        if (response.status === 429) {
          throw new RateLimitError('grok')
        }
        throw new Error(`GROK API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error: any) {
      if (error instanceof RateLimitError) {
        throw error
      }
      throw new AIProviderError(`GROK request failed: ${error.message}`, 'grok', error)
    }
  }

  async transcribe(audioBuffer: Buffer, options?: TranscriptionOptions): Promise<TranscriptResult> {
    // Note: GROK may not support direct audio input like Gemini
    // This is a text-based approximation - in production, you'd use a dedicated STT service
    // For now, we'll return an error suggesting to use Gemini for audio transcription
    throw new AIProviderError(
      'GROK does not support audio transcription. Please use Gemini provider for transcription.',
      'grok'
    )
  }

  async transcribeFromFile(filePath: string, options?: TranscriptionOptions): Promise<TranscriptResult> {
    // GROK doesn't support audio/video transcription
    throw new AIProviderError(
      'GROK does not support audio transcription. Please use Gemini provider for transcription.',
      'grok'
    )
  }

  async generateNotes(transcript: TranscriptResult, options?: NotesOptions): Promise<ClinicalNotes> {
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

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "subjective": "What the patient reported",
  "objective": "Therapist's clinical observations",
  "assessment": "Clinical assessment and diagnostic impressions",
  "plan": "Treatment plan and next steps",
  "chiefComplaints": ["complaint1", "complaint2"],
  "keyTopics": ["topic1", "topic2"],
  "interventionsUsed": ["intervention1", "intervention2"],
  "actionItems": ["action1", "action2"],
  ${options?.includeRiskAssessment ? '"riskAssessment": "Risk assessment findings",' : ''}
  "progressNotes": "Overall session progress"
}
`

      const response = await this.makeRequest([
        { role: 'system', content: 'You are a clinical psychologist assistant specialized in generating SOAP notes from therapy session transcripts.' },
        { role: 'user', content: prompt },
      ])

      // Clean response (remove markdown code blocks if present)
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed = JSON.parse(cleanedResponse)

      return {
        ...parsed,
        sessionDate: new Date(),
        generatedBy: 'grok',
      }
    } catch (error: any) {
      if (error instanceof RateLimitError) {
        throw error
      }
      throw new AIProviderError('Note generation failed', 'grok', error)
    }
  }

  async translate(
    text: string,
    targetLanguage: string,
    options?: TranslationOptions
  ): Promise<TranslationResult> {
    try {
      const sourceHint = options?.sourceLanguage
        ? `The source language is ${options.sourceLanguage}`
        : 'Detect the source language automatically'

      const prompt = `
Translate the following clinical text to ${targetLanguage}.

Requirements:
- Maintain clinical terminology accuracy
- ${options?.preserveFormatting ? 'Preserve all formatting (paragraphs, lists, etc.)' : ''}
- ${sourceHint}
- Use appropriate professional medical terminology

Text to translate:
${text}

Return ONLY a valid JSON object (no markdown, no code blocks):
{
  "translatedText": "translated content",
  "sourceLanguage": "source language ISO code",
  "targetLanguage": "${targetLanguage}"
}
`

      const response = await this.makeRequest([
        { role: 'system', content: 'You are a professional medical translator.' },
        { role: 'user', content: prompt },
      ])

      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed = JSON.parse(cleanedResponse)

      return parsed
    } catch (error: any) {
      if (error instanceof RateLimitError) {
        throw error
      }
      throw new AIProviderError('Translation failed', 'grok', error)
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

Provide ONLY the summary text. No JSON, no additional formatting, no code blocks.
`

      const response = await this.makeRequest([
        { role: 'system', content: 'You are a clinical psychologist assistant.' },
        { role: 'user', content: prompt },
      ])

      return response.trim()
    } catch (error: any) {
      if (error instanceof RateLimitError) {
        throw error
      }
      throw new AIProviderError('Summarization failed', 'grok', error)
    }
  }
}
