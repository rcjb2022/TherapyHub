// Google Cloud Storage helper
// Handles secure file uploads to GCS bucket with HIPAA-compliant signed URLs

import { Storage } from '@google-cloud/storage'

// Initialize Google Cloud Storage
// Credentials come from environment variables
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  // Support both file path and JSON string for service account key
  ...(process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    ? process.env.GOOGLE_SERVICE_ACCOUNT_KEY.startsWith('{')
      ? { credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY) } // JSON string
      : { keyFilename: process.env.GOOGLE_SERVICE_ACCOUNT_KEY } // File path
    : {}),
})

const bucketName = process.env.GCS_BUCKET_NAME || ''

/**
 * Tiered expiration policies based on data sensitivity
 * Following principle of least privilege - shorter expiration for more sensitive data
 */
const EXPIRATION_POLICIES = {
  // 1 hour for highly sensitive PHI (recordings, clinical notes, transcripts)
  PHI_CRITICAL: 60 * 60, // 3600 seconds

  // 24 hours for moderate sensitivity (summaries, translations, general forms)
  PHI_MODERATE: 24 * 60 * 60, // 86400 seconds

  // 7 days for low sensitivity static documents (insurance cards, IDs)
  PHI_LOW: 7 * 24 * 60 * 60, // 604800 seconds
} as const

/**
 * Document type classification for expiration policy
 */
type DocumentCategory =
  | 'RECORDING'           // Video/audio session recordings
  | 'TRANSCRIPT'          // AI-generated transcripts
  | 'CLINICAL_NOTES'      // SOAP/DAP/BIRP notes
  | 'SOAP_NOTES'
  | 'DAP_NOTES'
  | 'BIRP_NOTES'
  | 'SUMMARY'             // Session summaries
  | 'TRANSLATION'         // Translated documents
  | 'TREATMENT_PLAN'      // Treatment plans
  | 'ANALYSIS'            // Session analysis
  | 'INTAKE_FORM'         // Patient intake forms
  | 'CONSENT_FORM'        // Consent documents
  | 'INSURANCE_CARD'      // Insurance card images
  | 'ID_DOCUMENT'         // ID scans
  | 'PROGRESS_NOTE'       // Progress notes
  | 'ASSESSMENT_REPORT'   // Assessments
  | 'OTHER'               // Other documents

/**
 * Determine expiration time based on document type and sensitivity
 * @param documentType - Type of document being accessed
 * @returns Expiration time in seconds
 */
export function getExpirationTime(documentType?: DocumentCategory): number {
  if (!documentType) {
    // Default to moderate for unknown types (24 hours)
    return EXPIRATION_POLICIES.PHI_MODERATE
  }

  switch (documentType) {
    // PHI CRITICAL (1 hour) - Active session data, highly sensitive
    case 'RECORDING':
    case 'TRANSCRIPT':
    case 'CLINICAL_NOTES':
    case 'SOAP_NOTES':
    case 'DAP_NOTES':
    case 'BIRP_NOTES':
      return EXPIRATION_POLICIES.PHI_CRITICAL

    // PHI LOW (7 days) - Static documents, don't change
    case 'INSURANCE_CARD':
    case 'ID_DOCUMENT':
      return EXPIRATION_POLICIES.PHI_LOW

    // PHI MODERATE (24 hours) - All other documents
    case 'SUMMARY':
    case 'TRANSLATION':
    case 'TREATMENT_PLAN':
    case 'ANALYSIS':
    case 'INTAKE_FORM':
    case 'CONSENT_FORM':
    case 'PROGRESS_NOTE':
    case 'ASSESSMENT_REPORT':
    case 'OTHER':
    default:
      return EXPIRATION_POLICIES.PHI_MODERATE
  }
}

/**
 * Upload a file to Google Cloud Storage with HIPAA-compliant signed URL
 * @param file - File buffer to upload
 * @param fileName - Name to save the file as (will be sanitized)
 * @param contentType - MIME type of the file
 * @param documentType - Optional document type for tiered expiration
 * @returns Signed URL with expiration based on document type
 */
export async function uploadToGCS(
  file: Buffer,
  fileName: string,
  contentType: string,
  documentType?: DocumentCategory
): Promise<string> {
  try {
    const bucket = storage.bucket(bucketName)

    // Create a unique filename with timestamp
    const timestamp = Date.now()
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const uniqueFileName = `${timestamp}-${sanitizedFileName}`

    // Upload file to GCS
    const blob = bucket.file(uniqueFileName)

    await blob.save(file, {
      contentType: contentType,
      metadata: {
        cacheControl: 'public, max-age=31536000',
        uploadedAt: new Date().toISOString(),
        documentType: documentType || 'OTHER',
      },
    })

    // Generate signed URL with tiered expiration based on document sensitivity
    const expirationSeconds = getExpirationTime(documentType)
    const [signedUrl] = await blob.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + expirationSeconds * 1000,
    })

    return signedUrl
  } catch (error) {
    console.error('❌ GCS Upload Error:', error)
    console.error('Project ID:', process.env.GCP_PROJECT_ID)
    console.error('Bucket Name:', process.env.GCS_BUCKET_NAME)
    console.error('Has Service Account Key:', !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
    throw error
  }
}

/**
 * Delete a file from Google Cloud Storage
 * @param fileUrl - Signed URL or filename to delete
 */
export async function deleteFromGCS(fileUrl: string): Promise<void> {
  try {
    // Extract filename from signed URL (before query params)
    const fileName = fileUrl.split('/').pop()?.split('?')[0]

    if (!fileName) {
      throw new Error('Invalid file URL')
    }

    const bucket = storage.bucket(bucketName)
    await bucket.file(fileName).delete()
  } catch (error) {
    console.error('Error deleting from GCS:', error)
    throw error
  }
}

/**
 * Generate a new signed URL for an existing file (useful for expired URLs)
 * @param fileName - Name of the file in GCS
 * @param documentType - Optional document type for tiered expiration
 * @returns New signed URL with expiration based on document type
 */
export async function getSignedUrl(
  fileName: string,
  documentType?: DocumentCategory
): Promise<string> {
  try {
    const bucket = storage.bucket(bucketName)
    const blob = bucket.file(fileName)

    // Use tiered expiration based on document type
    const expirationSeconds = getExpirationTime(documentType)
    const [signedUrl] = await blob.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + expirationSeconds * 1000,
    })

    return signedUrl
  } catch (error) {
    console.error('Error generating signed URL:', error)
    throw error
  }
}

/**
 * Get expiration time in human-readable format for debugging
 * @param documentType - Type of document
 * @returns Human-readable expiration time
 */
export function getExpirationDescription(documentType?: DocumentCategory): string {
  const seconds = getExpirationTime(documentType)
  const hours = seconds / 3600

  if (hours < 1) {
    return `${Math.floor(seconds / 60)} minutes`
  } else if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  } else {
    const days = hours / 24
    return `${days} day${days !== 1 ? 's' : ''}`
  }
}
