'use client'

import { useState } from 'react'

interface ChargeCardFormProps {
  patientId: string
  currentBalance: number
  cardLast4: string
  onSuccess?: () => void
}

export function ChargeCardForm({
  patientId,
  currentBalance,
  cardLast4,
  onSuccess,
}: ChargeCardFormProps) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validation
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount greater than $0')
      return
    }

    // Confirm before charging
    if (!confirm(`Charge $${amountNum.toFixed(2)} to card ending in ${cardLast4}?`)) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/stripe/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId,
          amount: amountNum,
          description: description || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        // Check if payment method needs to be updated
        if (data.needsNewPaymentMethod) {
          setError(`${data.message} Click here to update: /dashboard/patients/${patientId}/forms/payment-information`)
        } else {
          setError(data.message || data.error || 'Charge failed')
        }
        return
      }

      setSuccess(`Successfully charged $${amountNum.toFixed(2)}!`)
      setAmount('')
      setDescription('')

      // Call onSuccess callback after short delay
      setTimeout(() => {
        if (onSuccess) onSuccess()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to process charge')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <h3 className="text-lg font-semibold mb-4">Charge Card on File</h3>

      <div className="mb-4 text-sm text-gray-600">
        <p>Current Balance: <span className="font-semibold text-lg">${currentBalance.toFixed(2)}</span></p>
        <p>Card on File: •••• •••• •••• {cardLast4}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount to Charge ($)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0.01"
            placeholder="150.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Therapy session - 11/1/2025"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-semibold">Charge Failed</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            <p className="font-semibold">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Processing...' : 'Charge Card'}
        </button>
      </form>
    </div>
  )
}
