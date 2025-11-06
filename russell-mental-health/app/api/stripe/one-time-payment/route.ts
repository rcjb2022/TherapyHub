// POST /api/stripe/one-time-payment - Create a one-time payment (no card saved)
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

    // Get current user (must be patient)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { patient: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only patients can make one-time payments
    if (user.role !== 'PATIENT') {
      return NextResponse.json(
        { error: 'Only patients can make one-time payments' },
        { status: 403 }
      )
    }

    if (!user.patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    const { amount, paymentMethodId } = body

    // Validation
    if (!amount || !paymentMethodId) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, paymentMethodId' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    const patient = user.patient

    // Ensure patient has a Stripe Customer (for receipt emails)
    let stripeCustomerId = patient.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: patient.email,
        name: `${patient.firstName} ${patient.lastName}`,
        metadata: {
          patientId: patient.id,
        },
      })

      stripeCustomerId = customer.id

      await prisma.patient.update({
        where: { id: patient.id },
        data: { stripeCustomerId: customer.id },
      })
    }

    // Get last 4 digits of card
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)
    const cardLast4 = paymentMethod.card?.last4 || 'unknown'

    // Create one-time PaymentIntent (payment method NOT saved to customer)
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        payment_method: paymentMethodId,
        payment_method_types: ['card'], // Only accept card payments
        confirm: true,
        receipt_email: patient.email,
        description: `One-time payment for ${patient.firstName} ${patient.lastName}`,
        metadata: {
          patientId: patient.id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          paymentType: 'one-time',
        },
        // DO NOT include customer ID - this prevents saving the card
      })

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          patientId: patient.id,
          amount: new Decimal(amount),
          type: 'charge',
          status: paymentIntent.status === 'succeeded' ? 'succeeded' : 'pending',
          stripeChargeId: paymentIntent.id,
          cardLast4: cardLast4,
          description: 'One-time payment',
          createdBy: user.id,
        },
      })

      // Update patient balance if charge succeeded
      if (paymentIntent.status === 'succeeded') {
        await prisma.patient.update({
          where: { id: patient.id },
          data: {
            balance: {
              decrement: new Decimal(amount),
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
          resourceId: transaction.id,
          phi: true,
          details: {
            type: 'one-time-payment',
            amount,
            patientId: patient.id,
            stripeChargeId: paymentIntent.id,
            status: paymentIntent.status,
          },
        },
      })

      return NextResponse.json({
        success: true,
        transaction,
        stripePaymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
      })
    } catch (stripeError: any) {
      console.error('Stripe payment failed:', stripeError)

      // Create failed transaction record
      const failedTransaction = await prisma.transaction.create({
        data: {
          patientId: patient.id,
          amount: new Decimal(amount),
          type: 'charge',
          status: 'failed',
          stripeError: stripeError.message,
          cardLast4: cardLast4,
          description: 'One-time payment (failed)',
          createdBy: user.id,
        },
      })

      return NextResponse.json(
        {
          success: false,
          error: 'Payment failed',
          message: stripeError.message,
          transaction: failedTransaction,
        },
        { status: 402 }
      )
    }
  } catch (error: any) {
    console.error('Error processing one-time payment:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
