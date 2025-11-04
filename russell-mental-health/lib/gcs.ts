// Google Cloud Storage helper
// Handles file uploads to GCS bucket

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
 * @returns Public URL of the uploaded file
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
    const uniqueFileName = `${timestamp}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    // Upload file to GCS
    const blob = bucket.file(uniqueFileName)
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: contentType,
      },
    })

    return new Promise((resolve, reject) => {
      blobStream.on('error', (err) => {
        console.error('GCS upload error:', err)
        reject(err)
      })

      blobStream.on('finish', async () => {
        // Make the file public
        await blob.makePublic()

        // Get the public URL
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${uniqueFileName}`
        resolve(publicUrl)
      })

      blobStream.end(file)
    })
  } catch (error) {
    console.error('Error uploading to GCS:', error)
    throw error
  }
}

/**
 * Delete a file from Google Cloud Storage
 * @param fileUrl - Public URL of the file to delete
 */
export async function deleteFromGCS(fileUrl: string): Promise<void> {
  try {
    // Extract filename from URL
    const fileName = fileUrl.split('/').pop()
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
