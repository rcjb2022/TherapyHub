'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Time to wait before refreshing data after successful payment (ms)
const REFRESH_DELAY_MS = 1500

interface PayBillFormProps {
  patientId: string
  currentBalance: number
  cardLast4: string
}

export function PayBillForm({
  patientId,
  currentBalance,
  cardLast4,
}: PayBillFormProps) {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [showCustomAmount, setShowCustomAmount] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Max payment: Always $500 (allows prepayments)
  const maxPayment = 500

  // Default payment button amount
  const defaultPaymentAmount = currentBalance > 0 ? Math.min(currentBalance, 500) : 100

  const handlePayFull = async () => {
    await processPayment(defaultPaymentAmount)
  }

  const handlePayCustom = async () => {
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (amountNum > maxPayment) {
      setError(`Payment cannot exceed $${maxPayment.toFixed(2)}`)
      return
    }

    await processPayment(amountNum)
  }

  const processPayment = async (amountToPay: number) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const response = await fetch('/api/stripe/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          amount: amountToPay,
          description: 'Patient payment',
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Payment failed')
      }

      setSuccess(`Payment of $${amountToPay.toFixed(2)} processed successfully!`)
      setAmount('')
      setShowCustomAmount(false)

      // Refresh the page data after short delay to show updated balance
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
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              {currentBalance > 0 ? 'Outstanding Balance' : currentBalance < 0 ? 'Account Credit' : 'Current Balance'}
            </p>
            <p className={`text-3xl font-bold ${currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ${Math.abs(currentBalance).toFixed(2)}
            </p>
            {currentBalance <= 0 && (
              <p className="text-xs text-gray-500 mt-1">
                You can prepay up to $500.00
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Card on File</p>
            <p className="text-lg font-medium text-gray-900">•••• {cardLast4}</p>
            <a
              href={`/dashboard/patient/forms/payment-information`}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Update Card
            </a>
          </div>
        </div>
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

      {/* Pay Full Balance Button */}
      <div>
        <button
          onClick={handlePayFull}
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {loading ? (
            'Processing...'
          ) : currentBalance > 500 ? (
            'Pay $500.00 Now'
          ) : currentBalance > 0 ? (
            `Pay Full Balance ($${currentBalance.toFixed(2)})`
          ) : (
            `Prepay $${defaultPaymentAmount.toFixed(2)}`
          )}
        </button>
        <p className="mt-2 text-center text-xs text-gray-500">
          You will receive an email receipt after payment
        </p>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <button
            onClick={() => setShowCustomAmount(!showCustomAmount)}
            className="bg-white px-2 text-gray-500 hover:text-gray-700"
          >
            {showCustomAmount ? 'Hide' : 'Pay'} Other Amount
          </button>
        </div>
      </div>

      {/* Custom Amount Section */}
      {showCustomAmount && (
        <div className="space-y-3">
          <div>
            <label htmlFor="custom-amount" className="block text-sm font-medium text-gray-700">
              Enter Amount
            </label>
            <div className="mt-1 flex items-center">
              <span className="text-xl font-semibold text-gray-700">$</span>
              <input
                type="number"
                id="custom-amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                max={maxPayment}
                disabled={loading}
                className="ml-2 block w-full rounded-md border-gray-300 px-3 py-2 text-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Maximum: ${maxPayment.toFixed(2)}
            </p>
          </div>

          <button
            onClick={handlePayCustom}
            disabled={loading || !amount}
            className="w-full rounded-lg bg-gray-800 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Pay Custom Amount'}
          </button>
        </div>
      )}
    </div>
  )
}
