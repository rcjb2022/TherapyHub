// GET /api/payments/history - Fetch payment history for a patient
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { therapist: true, patient: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const patientId = searchParams.get('patientId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Access control
    let whereClause: any = {}

    if (user.role === 'THERAPIST') {
      // Therapist can view any patient's history (with additional validation)
      if (!patientId) {
        return NextResponse.json(
          { error: 'patientId is required for therapist' },
          { status: 400 }
        )
      }

      // Verify patient belongs to this therapist
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
      })

      if (!patient) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
      }

      if (patient.therapistId !== user.therapist!.id) {
        return NextResponse.json(
          { error: 'You can only view your own patients' },
          { status: 403 }
        )
      }

      whereClause.patientId = patientId
    } else if (user.role === 'PATIENT') {
      // Patient can only view their own history
      if (!user.patient) {
        return NextResponse.json(
          { error: 'Patient profile not found' },
          { status: 404 }
        )
      }

      whereClause.patientId = user.patient.id
    } else {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 403 })
    }

    // Fetch transactions
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        refundedFrom: {
          select: {
            id: true,
            amount: true,
            createdAt: true,
          },
        },
      },
    })

    // Calculate running balance
    let runningBalance = 0
    const transactionsWithBalance = transactions.map((tx) => {
      // Update running balance based on transaction type
      if (tx.status === 'succeeded') {
        if (tx.type === 'charge') {
          runningBalance += Number(tx.amount)
        } else if (tx.type === 'payment') {
          runningBalance -= Number(tx.amount)
        } else if (tx.type === 'refund') {
          runningBalance += Number(tx.amount)
        }
      }

      return {
        id: tx.id,
        patientId: tx.patientId,
        patientName: `${tx.patient.firstName} ${tx.patient.lastName}`,
        amount: Number(tx.amount),
        type: tx.type,
        status: tx.status,
        description: tx.description,
        cardLast4: tx.cardLast4,
        stripeChargeId: tx.stripeChargeId,
        stripeError: tx.stripeError,
        refundedFromId: tx.refundedFromId,
        refundedFrom: tx.refundedFrom,
        createdBy: tx.createdBy,
        createdAt: tx.createdAt.toISOString(),
        runningBalance: runningBalance,
      }
    })

    // Get total count for pagination
    const totalCount = await prisma.transaction.count({ where: whereClause })

    return NextResponse.json({
      success: true,
      transactions: transactionsWithBalance,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    })
  } catch (error: any) {
    console.error('Payment history error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch payment history',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
