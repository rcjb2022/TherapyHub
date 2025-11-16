// API Route for File Uploads to Google Cloud Storage
// Handles insurance cards, legal documents, ID uploads, etc.
// RBAC: Patients upload for themselves, Therapists for their patients, Admins for any patient

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToGCS } from '@/lib/gcs'
import { prisma } from '@/lib/prisma'

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

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
    }

    // Get user with relations for RBAC
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        patient: true,
        therapist: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // RBAC: Verify user can upload for this patient
    if (session.user.role === 'PATIENT') {
      // Patients can only upload files for themselves
      if (!user.patient || user.patient.id !== patientId) {
        return NextResponse.json(
          { error: 'Forbidden - patients can only upload files for themselves' },
          { status: 403 }
        )
      }
    } else if (session.user.role === 'THERAPIST') {
      // Therapists can only upload files for their own patients
      if (!user.therapist) {
        return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 })
      }

      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
      })

      if (!patient) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
      }

      if (patient.therapistId !== user.therapist.id) {
        return NextResponse.json(
          { error: 'Forbidden - therapists can only upload files for their own patients' },
          { status: 403 }
        )
      }
    } else if (session.user.role === 'ADMIN') {
      // Admins can upload for any patient - just verify patient exists
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
      })

      if (!patient) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
      }
    } else {
      return NextResponse.json({ error: 'Forbidden - insufficient permissions' }, { status: 403 })
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

    // Map fileType to DocumentCategory for tiered expiration
    const getDocumentCategory = (fileType: string) => {
      switch (fileType) {
        case 'insurance-card':
          return 'INSURANCE_CARD' as const
        case 'id-document':
          return 'ID_DOCUMENT' as const
        case 'consent-form':
          return 'CONSENT_FORM' as const
        case 'intake-form':
          return 'INTAKE_FORM' as const
        default:
          return 'OTHER' as const
      }
    }

    // Upload to Google Cloud Storage with tiered expiration based on document type
    const documentCategory = getDocumentCategory(fileType)

    // Upload and get both signed URL (for immediate use) and GCS path (for storage)
    const { signedUrl, gcsPath } = await uploadToGCS(buffer, fileName, file.type, documentCategory)

    // Audit log - track all file uploads (PHI)
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPLOAD',
        resource: 'Document',
        resourceId: patientId,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        phi: true,
        details: {
          fileType,
          fileName: file.name,
          fileSize: file.size,
          documentCategory,
          gcsPath,
        },
      },
    })

    // Return BOTH signed URL (temporary, for immediate display) and GCS path (permanent, for database storage)
    return NextResponse.json({
      success: true,
      url: signedUrl,           // Temporary signed URL for immediate use
      gcsPath: gcsPath,          // Permanent GCS path for database storage
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    })
  } catch (error: any) {
    console.error('[Upload API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file. Please try again.' },
      { status: 500 }
    )
  }
}
