'use client'

import { useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { PayBillForm } from './PayBillForm'
import { OneTimePaymentForm } from './OneTimePaymentForm'

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PatientBillingClientProps {
  patientId: string
  currentBalance: number
  hasPaymentMethod: boolean
  cardLast4: string
}

export function PatientBillingClient({
  patientId,
  currentBalance,
  hasPaymentMethod,
  cardLast4,
}: PatientBillingClientProps) {
  const [paymentMethod, setPaymentMethod] = useState<'saved' | 'onetime'>(
    hasPaymentMethod ? 'saved' : 'onetime'
  )

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Payment Method Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {hasPaymentMethod && (
            <button
              onClick={() => setPaymentMethod('saved')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                paymentMethod === 'saved'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pay with Saved Card
            </button>
          )}
          <button
            onClick={() => setPaymentMethod('onetime')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              paymentMethod === 'onetime'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            One-Time Payment
          </button>
        </nav>
      </div>

      {/* Payment Form Content */}
      <div className="p-6">
        {paymentMethod === 'saved' && hasPaymentMethod ? (
          <>
            <h2 className="mb-6 text-lg font-semibold text-gray-900">
              Pay with Saved Card
            </h2>
            <PayBillForm
              patientId={patientId}
              currentBalance={currentBalance}
              cardLast4={cardLast4}
            />
          </>
        ) : (
          <>
            <h2 className="mb-6 text-lg font-semibold text-gray-900">
              One-Time Payment
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Enter your card details below. Your card will not be saved for future payments.
            </p>
            <Elements stripe={stripePromise}>
              <OneTimePaymentForm
                patientId={patientId}
                currentBalance={currentBalance}
              />
            </Elements>
          </>
        )}
      </div>
    </div>
  )
}
