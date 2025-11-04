// API Route for File Uploads to Google Cloud Storage
// Handles insurance cards, legal documents, ID uploads, etc.

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToGCS } from '@/lib/gcs'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileType = formData.get('fileType') as string // 'insurance-card', 'legal-document', 'id-document', etc.
    const patientId = formData.get('patientId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, GIF, and PDF files are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create organized filename: fileType/patientId/timestamp-filename
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${fileType}/${patientId}/${sanitizedFileName}`

    // Upload to Google Cloud Storage and get signed URL
    const signedUrl = await uploadToGCS(buffer, fileName, file.type)

    // Return the signed URL
    return NextResponse.json({
      success: true,
      url: signedUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file. Please try again.' },
      { status: 500 }
    )
  }
}
