/**
 * Caption Helper - Convert transcripts to WebVTT format
 * Supports multi-language captions for video playback
 */

import type { TranscriptResult } from './ai/types'

/**
 * Convert AI transcript to WebVTT caption file format
 * WebVTT is the standard for HTML5 video captions
 */
export function transcriptToWebVTT(transcript: TranscriptResult): string {
  const lines: string[] = []

  // WebVTT header
  lines.push('WEBVTT')
  lines.push('')

  // Add each segment as a caption cue
  transcript.segments.forEach((segment, index) => {
    // Format timestamps in WebVTT format: HH:MM:SS.mmm
    const start = formatTimestamp(segment.start)
    const end = formatTimestamp(segment.end)

    // Cue timing line
    lines.push(`${start} --> ${end}`)

    // Speaker label (if available)
    const speakerPrefix = segment.speaker ? `[${segment.speaker}] ` : ''

    // Caption text
    lines.push(`${speakerPrefix}${segment.text}`)

    // Blank line between cues
    lines.push('')
  })

  return lines.join('\n')
}

/**
 * Format seconds to WebVTT timestamp format: HH:MM:SS.mmm
 */
function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const milliseconds = Math.floor((seconds % 1) * 1000)

  return `${padZero(hours, 2)}:${padZero(minutes, 2)}:${padZero(secs, 2)}.${padZero(milliseconds, 3)}`
}

/**
 * Pad number with leading zeros
 */
function padZero(num: number, length: number): string {
  return num.toString().padStart(length, '0')
}

/**
 * Generate filename for caption file
 */
export function getCaptionFilename(
  appointmentId: string,
  timestamp: number,
  language: string
): string {
  return `${appointmentId}-${timestamp}-${language}.vtt`
}

/**
 * Detect language from transcript
 * Simple heuristic - can be improved with proper language detection
 */
export function detectLanguage(text: string): string {
  // Spanish indicators
  const spanishKeywords = ['¿', '¡', 'qué', 'cómo', 'está', 'muy', 'yo', 'tú', 'sí', 'también']
  const spanishCount = spanishKeywords.filter(keyword =>
    text.toLowerCase().includes(keyword)
  ).length

  // If significant Spanish indicators, assume Spanish
  if (spanishCount >= 3) {
    return 'es'
  }

  // Default to English
  return 'en'
}
