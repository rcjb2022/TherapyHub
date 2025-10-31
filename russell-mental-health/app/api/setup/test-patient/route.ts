// Setup Test Patient API
// Call this endpoint to create a test patient user
// GET /api/setup/test-patient

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Simple credentials
    const email = 'patient@test.com'
    const password = 'password123'
    const hashedPassword = await bcrypt.hash(password, 12)

    console.log('🔧 Creating test patient user...')

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.log('⚠️  User already exists, deleting...')
      await prisma.user.delete({ where: { email } })
    }

    // Get or create a test patient
    let patient = await prisma.patient.findFirst({
      where: { email: 'patient@test.com' },
    })

    if (!patient) {
      console.log('Creating new test patient record...')

      // Get therapist
      const therapist = await prisma.therapist.findFirst()

      if (!therapist) {
        return NextResponse.json(
          { error: 'No therapist found! Please create a therapist first.' },
          { status: 404 }
        )
      }

      patient = await prisma.patient.create({
        data: {
          therapistId: therapist.id,
          firstName: 'Test',
          lastName: 'Patient',
          email: 'patient@test.com',
          phone: '555-0100',
          dateOfBirth: new Date('1990-01-01'),
          status: 'ACTIVE',
        },
      })

      console.log('✅ Created test patient:', patient.firstName, patient.lastName)
    }

    // Create patient user
    const user = await prisma.user.create({
      data: {
        email: email,
        name: `${patient.firstName} ${patient.lastName}`,
        password: hashedPassword,
        role: 'PATIENT',
        patient: {
          connect: { id: patient.id },
        },
      },
    })

    console.log('✅ Test patient user created successfully!')

    return NextResponse.json({
      success: true,
      message: 'Test patient user created successfully!',
      credentials: {
        email: email,
        password: password,
        name: user.name,
        patientId: patient.id,
      },
      loginUrl: '/login',
    })
  } catch (error: any) {
    console.error('❌ Error creating test patient:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create test patient' },
      { status: 500 }
    )
  }
}
