// POST /api/stripe/charge - Create a charge against patient's card on file
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { sendFailedChargeNotification } from '@/lib/email'
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
      include: { therapist: true, patient: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    const { patientId, amount, description } = body

    // Validation
    if (!patientId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId, amount' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Fetch patient with payment method info
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        forms: {
          where: { formType: 'payment-information' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Access control: Only therapist can charge patients
    if (user.role !== 'THERAPIST') {
      return NextResponse.json(
        { error: 'Only therapists can charge patients' },
        { status: 403 }
      )
    }

    // Verify patient belongs to this therapist
    if (patient.therapistId !== user.therapist!.id) {
      return NextResponse.json(
        { error: 'You can only charge your own patients' },
        { status: 403 }
      )
    }

    // Get payment method from form
    const paymentForm = patient.forms[0]
    if (!paymentForm) {
      return NextResponse.json(
        { error: 'Patient has not added a payment method' },
        { status: 400 }
      )
    }

    const paymentMethodData = paymentForm.formData as any
    const stripePaymentMethodId = paymentMethodData?.stripePaymentMethodId
    const cardLast4 = paymentMethodData?.cardLast4

    if (!stripePaymentMethodId) {
      return NextResponse.json(
        { error: 'No valid payment method found for patient' },
        { status: 400 }
      )
    }

    // Ensure patient has a Stripe Customer
    let stripeCustomerId = patient.stripeCustomerId

    if (!stripeCustomerId) {
      // Create Stripe Customer
      const customer = await stripe.customers.create({
        email: patient.email,
        name: `${patient.firstName} ${patient.lastName}`,
        metadata: {
          patientId: patient.id,
        },
      })

      stripeCustomerId = customer.id

      // Save customer ID to patient record
      await prisma.patient.update({
        where: { id: patient.id },
        data: { stripeCustomerId: customer.id },
      })
    }

    // Attach payment method to customer if not already attached
    try {
      await stripe.paymentMethods.attach(stripePaymentMethodId, {
        customer: stripeCustomerId,
      })
    } catch (attachError: any) {
      // Payment method might already be attached, that's okay
      if (attachError.code === 'resource_already_exists') {
        // Already attached, continue
      } else if (attachError.code === 'payment_method_not_available') {
        // Payment method was used without customer and can't be reused
        return NextResponse.json(
          {
            success: false,
            error: 'Payment method expired',
            message: 'This payment method can no longer be used. Please ask the patient to update their payment method.',
            needsNewPaymentMethod: true,
          },
          { status: 400 }
        )
      } else {
        console.error('Payment method attach error:', attachError)
        throw attachError
      }
    }

    // Create Stripe PaymentIntent
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        customer: stripeCustomerId, // Use customer ID
        payment_method: stripePaymentMethodId,
        confirm: true,
        off_session: true, // Charge without customer present
        receipt_email: patient.email, // Stripe sends automatic receipt
        description: description || `Therapy charge for ${patient.firstName} ${patient.lastName}`,
        metadata: {
          patientId: patient.id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          chargedBy: user.email!,
        },
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
          description: description || `Therapy charge`,
          createdBy: user.id,
        },
      })

      // Update patient balance if charge succeeded
      if (paymentIntent.status === 'succeeded') {
        await prisma.patient.update({
          where: { id: patient.id },
          data: {
            balance: {
              increment: new Decimal(amount), // Add to what they owe
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
            type: 'charge',
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
      // Stripe charge failed
      console.error('Stripe charge failed:', stripeError)

      // Create failed transaction record
      const failedTransaction = await prisma.transaction.create({
        data: {
          patientId: patient.id,
          amount: new Decimal(amount),
          type: 'charge',
          status: 'failed',
          stripeError: stripeError.message,
          cardLast4: cardLast4,
          description: description || `Therapy charge`,
          createdBy: user.id,
        },
      })

      // Create audit log for failed charge
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'CREATE',
          resource: 'Transaction',
          resourceId: failedTransaction.id,
          phi: true,
          details: {
            type: 'charge',
            amount,
            patientId: patient.id,
            status: 'failed',
            error: stripeError.message,
          },
        },
      })

      // Send failed charge notifications to therapist and patient
      await sendFailedChargeNotification({
        patientEmail: patient.email,
        patientName: `${patient.firstName} ${patient.lastName}`,
        therapistEmail: user.email!,
        therapistName: user.name!,
        amount,
        errorMessage: stripeError.message || 'Unknown error',
        patientId: patient.id,
      })

      return NextResponse.json(
        {
          success: false,
          error: 'Charge failed',
          message: stripeError.message,
          transaction: failedTransaction,
        },
        { status: 402 } // 402 Payment Required
      )
    }
  } catch (error: any) {
    console.error('Error processing charge:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
