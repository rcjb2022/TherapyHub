// Google Cloud Storage helper
// Handles secure file uploads to GCS bucket with HIPAA-compliant signed URLs

import { Storage } from '@google-cloud/storage'

// Initialize Google Cloud Storage
// Credentials come from environment variables
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
    : undefined,
})

const bucketName = process.env.GCS_BUCKET_NAME || ''

/**
 * Upload a file to Google Cloud Storage with HIPAA-compliant signed URL
 * @param file - File buffer to upload
 * @param fileName - Name to save the file as (will be sanitized)
 * @param contentType - MIME type of the file
 * @returns Signed URL with 7-day expiration
 */
export async function uploadToGCS(
  file: Buffer,
  fileName: string,
  contentType: string
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
      },
    })

    // Generate signed URL with 7-day expiration (HIPAA compliant)
    // Files are NOT made public - only accessible via signed URLs
    const [signedUrl] = await blob.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    return signedUrl
  } catch (error) {
    console.error('Error uploading to GCS:', error)
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
 * @returns New signed URL with 7-day expiration
 */
export async function getSignedUrl(fileName: string): Promise<string> {
  try {
    const bucket = storage.bucket(bucketName)
    const blob = bucket.file(fileName)

    const [signedUrl] = await blob.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    return signedUrl
  } catch (error) {
    console.error('Error generating signed URL:', error)
    throw error
  }
}
