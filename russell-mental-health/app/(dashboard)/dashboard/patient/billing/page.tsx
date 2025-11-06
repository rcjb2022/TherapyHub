// Patient Billing Page
// Patient can pay their bill and view payment history

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { PayBillForm } from '@/components/PayBillForm'
import { PaymentHistoryTable } from '@/components/PaymentHistoryTable'

export default async function PatientBillingPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Only patients can access this page
  if (session.user.role !== 'PATIENT') {
    redirect('/dashboard')
  }

  // Get patient data
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      patient: {
        include: {
          therapist: {
            include: {
              user: true,
            },
          },
          forms: {
            where: {
              formType: 'payment-information',
              status: {
                in: ['SUBMITTED', 'COMPLETED'],
              },
            },
            orderBy: {
              updatedAt: 'desc',
            },
            take: 1,
          },
        },
      },
    },
  })

  if (!user?.patient) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-900">Patient Profile Not Found</h2>
        <p className="mt-2 text-sm text-red-700">
          Your account is not linked to a patient profile. Please contact your therapist.
        </p>
      </div>
    )
  }

  const patient = user.patient

  // Get payment method info
  const paymentForm = patient.forms[0]
  const hasPaymentMethod = paymentForm && paymentForm.formData

  let cardLast4 = ''
  if (hasPaymentMethod) {
    const formData = paymentForm.formData as any
    cardLast4 = formData.cardLast4 || ''
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/dashboard/patient"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your billing and view payment history
        </p>
      </div>

      {/* Payment Method Check */}
      {!hasPaymentMethod && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <h2 className="text-lg font-semibold text-yellow-900">No Payment Method on File</h2>
          <p className="mt-2 text-sm text-yellow-700">
            Please add a payment method before making payments.
          </p>
          <Link
            href="/dashboard/patient/forms/payment-information"
            className="mt-4 inline-block rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
          >
            Add Payment Method
          </Link>
        </div>
      )}

      {/* Current Balance & Payment Form */}
      {hasPaymentMethod && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-gray-900">Make a Payment</h2>
          <PayBillForm
            patientId={patient.id}
            currentBalance={Number(patient.balance)}
            cardLast4={cardLast4}
          />
        </div>
      )}

      {/* Payment History */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Payment History</h2>
        <PaymentHistoryTable
          patientId={patient.id}
          viewerRole="patient"
        />
      </div>

      {/* Help Section */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="font-medium text-gray-900">Questions about billing?</h3>
        <p className="mt-2 text-sm text-gray-600">
          Contact {patient.therapist.user.name} at{' '}
          <a
            href={`mailto:${patient.therapist.user.email}`}
            className="text-blue-600 hover:text-blue-700"
          >
            {patient.therapist.user.email}
          </a>
        </p>
      </div>
    </div>
  )
}
