// API endpoint to generate fresh signed URLs from GCS paths
// This allows viewing old documents by creating new signed URLs

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSignedUrl } from '@/lib/gcs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { gcsPath, documentType } = body

    if (!gcsPath) {
      return NextResponse.json({ error: 'gcsPath is required' }, { status: 400 })
    }

    // Generate fresh signed URL with tiered expiration
    const signedUrl = await getSignedUrl(gcsPath, documentType)

    return NextResponse.json({
      success: true,
      url: signedUrl,
      expiresIn: documentType, // For debugging
    })
  } catch (error: any) {
    console.error('[Generate URL API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate signed URL' },
      { status: 500 }
    )
  }
}
