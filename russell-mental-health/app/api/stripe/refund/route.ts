// POST /api/stripe/refund - Process a refund for a charge (therapist only)
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { Decimal } from '@prisma/client/runtime/library'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { therapist: true },
    })

    if (!user || user.role !== 'THERAPIST') {
      return NextResponse.json(
        { error: 'Only therapists can process refunds' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { transactionId, amount, reason } = body

    // Validation
    if (!transactionId) {
      return NextResponse.json(
        { error: 'Missing required field: transactionId' },
        { status: 400 }
      )
    }

    // Fetch original transaction
    const originalTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        patient: true,
        refunds: true,
      },
    })

    if (!originalTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Verify transaction type and status
    if (originalTransaction.type !== 'charge') {
      return NextResponse.json(
        { error: 'Can only refund charge transactions' },
        { status: 400 }
      )
    }

    if (originalTransaction.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Can only refund succeeded charges' },
        { status: 400 }
      )
    }

    // Verify patient belongs to this therapist
    if (originalTransaction.patient.therapistId !== user.therapist!.id) {
      return NextResponse.json(
        { error: 'You can only refund charges for your own patients' },
        { status: 403 }
      )
    }

    if (!originalTransaction.stripeChargeId) {
      return NextResponse.json(
        { error: 'No Stripe charge ID found for this transaction' },
        { status: 400 }
      )
    }

    // Calculate refund amount
    const totalRefunded = originalTransaction.refunds.reduce(
      (sum, refund) => sum + Number(refund.amount),
      0
    )
    const refundAmount = amount || Number(originalTransaction.amount) - totalRefunded

    // Validate refund amount
    if (refundAmount <= 0) {
      return NextResponse.json(
        { error: 'Refund amount must be greater than 0' },
        { status: 400 }
      )
    }

    if (refundAmount > Number(originalTransaction.amount) - totalRefunded) {
      return NextResponse.json(
        { error: 'Refund amount exceeds remaining refundable amount' },
        { status: 400 }
      )
    }

    // Process Stripe refund
    try {
      const refund = await stripe.refunds.create({
        payment_intent: originalTransaction.stripeChargeId,
        amount: Math.round(refundAmount * 100), // Convert to cents
        reason: reason === 'duplicate' ? 'duplicate' : 'requested_by_customer',
        metadata: {
          originalTransactionId: originalTransaction.id,
          patientId: originalTransaction.patientId,
          refundedBy: user.email!,
          reason: reason || 'No reason provided',
        },
      })

      // Create refund transaction record
      const refundTransaction = await prisma.transaction.create({
        data: {
          patientId: originalTransaction.patientId,
          amount: new Decimal(refundAmount),
          type: 'refund',
          status: refund.status === 'succeeded' ? 'succeeded' : 'pending',
          stripeChargeId: refund.id,
          cardLast4: originalTransaction.cardLast4,
          description: reason || `Refund for charge ${originalTransaction.id}`,
          refundedFromId: originalTransaction.id,
          createdBy: user.id,
        },
      })

      // Update patient balance (refund increases what they owe)
      if (refund.status === 'succeeded') {
        await prisma.patient.update({
          where: { id: originalTransaction.patientId },
          data: {
            balance: {
              increment: new Decimal(refundAmount), // Add back to balance
            },
          },
        })
      }

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'CREATE',
          resource: 'Transaction',
          resourceId: refundTransaction.id,
          phi: true,
          details: {
            type: 'refund',
            amount: refundAmount,
            patientId: originalTransaction.patientId,
            originalTransactionId: originalTransaction.id,
            stripeRefundId: refund.id,
            status: refund.status,
            reason,
          },
        },
      })

      return NextResponse.json({
        success: true,
        refundTransaction,
        stripeRefundId: refund.id,
        status: refund.status,
      })
    } catch (stripeError: any) {
      console.error('Stripe refund failed:', stripeError)

      // Create failed refund transaction record
      const failedRefundTransaction = await prisma.transaction.create({
        data: {
          patientId: originalTransaction.patientId,
          amount: new Decimal(refundAmount),
          type: 'refund',
          status: 'failed',
          stripeError: stripeError.message,
          cardLast4: originalTransaction.cardLast4,
          description: reason || `Refund for charge ${originalTransaction.id}`,
          refundedFromId: originalTransaction.id,
          createdBy: user.id,
        },
      })

      // Create audit log for failed refund
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'CREATE',
          resource: 'Transaction',
          resourceId: failedRefundTransaction.id,
          phi: true,
          details: {
            type: 'refund',
            amount: refundAmount,
            patientId: originalTransaction.patientId,
            originalTransactionId: originalTransaction.id,
            status: 'failed',
            error: stripeError.message,
          },
        },
      })

      return NextResponse.json(
        {
          success: false,
          error: 'Refund failed',
          message: stripeError.message,
          transaction: failedRefundTransaction,
        },
        { status: 402 }
      )
    }
  } catch (error: any) {
    console.error('Error processing refund:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
