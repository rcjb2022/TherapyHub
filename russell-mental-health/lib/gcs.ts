// Google Cloud Storage helper
// Handles file uploads to GCS bucket with signed URLs for HIPAA compliance

import { Storage } from '@google-cloud/storage'

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
})

const bucketName = process.env.GCS_BUCKET_NAME || ''

/**
 * Upload a file to Google Cloud Storage
 * @param file - File buffer to upload
 * @param fileName - Name to save the file as
 * @param contentType - MIME type of the file
 * @returns Signed URL of the uploaded file (valid for 7 days)
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
    const uniqueFileName = `${timestamp}-${fileName.replace(/[^a-zA-Z0-9.-/]/g, '_')}`

    // Upload file to GCS
    const blob = bucket.file(uniqueFileName)
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: contentType,
        // Add metadata for tracking
        metadata: {
          uploadedAt: new Date().toISOString(),
        },
      },
    })

    return new Promise((resolve, reject) => {
      blobStream.on('error', (err) => {
        console.error('GCS upload error:', err)
        reject(err)
      })

      blobStream.on('finish', async () => {
        // Generate a signed URL that expires in 7 days (HIPAA compliant)
        // This is more secure than making files permanently public
        const [signedUrl] = await blob.getSignedUrl({
          version: 'v4',
          action: 'read',
          expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        resolve(signedUrl)
      })

      blobStream.end(file)
    })
  } catch (error) {
    console.error('Error uploading to GCS:', error)
    throw error
  }
}

/**
 * Get a fresh signed URL for an existing file
 * @param fileName - Name of the file in GCS
 * @returns New signed URL (valid for 7 days)
 */
export async function getSignedUrl(fileName: string): Promise<string> {
  try {
    const bucket = storage.bucket(bucketName)
    const file = bucket.file(fileName)

    const [signedUrl] = await file.getSignedUrl({
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

/**
 * Delete a file from Google Cloud Storage
 * @param fileUrl - Signed URL or filename of the file to delete
 */
export async function deleteFromGCS(fileUrl: string): Promise<void> {
  try {
    // Extract filename from signed URL or direct filename
    let fileName: string
    if (fileUrl.includes('storage.googleapis.com')) {
      // Extract from URL format: https://storage.googleapis.com/bucket/filename?...
      const urlParts = fileUrl.split('/')
      const bucketIndex = urlParts.indexOf(bucketName)
      if (bucketIndex === -1) {
        throw new Error('Invalid GCS URL')
      }
      fileName = urlParts.slice(bucketIndex + 1).join('/').split('?')[0]
    } else {
      fileName = fileUrl
    }

    const bucket = storage.bucket(bucketName)
    await bucket.file(fileName).delete()
  } catch (error) {
    console.error('Error deleting from GCS:', error)
    throw error
  }
}

