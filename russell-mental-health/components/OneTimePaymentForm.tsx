'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

// Time to wait before refreshing data after successful payment (ms)
const REFRESH_DELAY_MS = 1500

interface OneTimePaymentFormProps {
  patientId: string
  currentBalance: number
}

export function OneTimePaymentForm({
  patientId,
  currentBalance,
}: OneTimePaymentFormProps) {
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()

  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet')
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setError('Card element not found')
      return
    }

    // Validate amount
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (amountNum > Math.max(currentBalance, 500)) {
      setError(`Payment cannot exceed ${currentBalance > 500 ? '$500.00' : `$${currentBalance.toFixed(2)}`}`)
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Create payment method from card element
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      })

      if (pmError) {
        throw new Error(pmError.message)
      }

      if (!paymentMethod) {
        throw new Error('Failed to create payment method')
      }

      // Process payment via API
      const response = await fetch('/api/stripe/one-time-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          amount: amountNum,
          paymentMethodId: paymentMethod.id,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Payment failed')
      }

      setSuccess(`Payment of $${amountNum.toFixed(2)} processed successfully!`)
      setAmount('')
      cardElement.clear()

      // Refresh page data after short delay
      setTimeout(() => {
        router.refresh()
      }, REFRESH_DELAY_MS)
    } catch (err: any) {
      console.error('Payment error:', err)
      setError(err.message || 'Failed to process payment')
    } finally {
      setLoading(false)
    }
  }

  if (currentBalance <= 0) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-lg font-semibold text-green-900">All Paid Up! ✓</p>
        <p className="mt-1 text-sm text-green-700">
          You have no outstanding balance.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">{success}</p>
        </div>
      )}

      {/* Current Balance */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-600">Outstanding Balance</p>
        <p className="text-3xl font-bold text-red-600">
          ${currentBalance.toFixed(2)}
        </p>
      </div>

      {/* Multiple Payments Warning */}
      {currentBalance > 500 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            ℹ️ Your balance exceeds $500. Maximum single payment is $500. You may
            need to make multiple payments.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount to Pay
          </label>
          <div className="flex items-center">
            <span className="text-xl font-semibold text-gray-700">$</span>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              max={Math.max(currentBalance, 500)}
              disabled={loading}
              className="ml-2 block w-full rounded-md border-gray-300 px-3 py-2 text-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
              required
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Maximum: ${Math.max(currentBalance, 500).toFixed(2)}
          </p>
        </div>

        {/* Card Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <div className="rounded-md border border-gray-300 p-3 bg-white">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#1f2937',
                    '::placeholder': {
                      color: '#9ca3af',
                    },
                  },
                  invalid: {
                    color: '#ef4444',
                  },
                },
              }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            This card will not be saved for future payments
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !stripe}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {loading ? 'Processing...' : `Pay $${amount || '0.00'}`}
        </button>

        <p className="text-center text-xs text-gray-500">
          You will receive an email receipt after payment
        </p>
      </form>
    </div>
  )
}
