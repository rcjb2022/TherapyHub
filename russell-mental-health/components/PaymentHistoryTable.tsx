'use client'

import { useState, useEffect } from 'react'

interface Transaction {
  id: string
  patientId: string
  patientName: string
  amount: number
  type: 'charge' | 'payment' | 'refund'
  status: 'succeeded' | 'failed' | 'pending'
  description: string | null
  cardLast4: string | null
  stripeChargeId: string | null
  stripeError: string | null
  refundedFromId: string | null
  refundedFrom?: {
    id: string
    amount: number
    createdAt: string
  }
  createdBy: string
  createdAt: string
  runningBalance: number
}

interface PaymentHistoryTableProps {
  patientId: string
  viewerRole: 'patient' | 'therapist'
  onRefund?: (transactionId: string) => void
  onRetry?: (transactionId: string) => void
}

export function PaymentHistoryTable({
  patientId,
  viewerRole,
  onRefund,
  onRetry,
}: PaymentHistoryTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHistory()
  }, [patientId])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/payments/history?patientId=${patientId}&limit=50&offset=0`
      )
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to fetch payment history')
      }

      setTransactions(data.transactions || [])
    } catch (err: any) {
      console.error('Failed to fetch payment history:', err)
      setError(err.message || 'Failed to load payment history')
    } finally {
      setLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'charge':
        return 'text-red-700 bg-red-50'
      case 'payment':
        return 'text-green-700 bg-green-50'
      case 'refund':
        return 'text-yellow-700 bg-yellow-50'
      default:
        return 'text-gray-700 bg-gray-50'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'text-green-700 bg-green-100'
      case 'failed':
        return 'text-red-700 bg-red-100'
      case 'pending':
        return 'text-yellow-700 bg-yellow-100'
      default:
        return 'text-gray-700 bg-gray-100'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-500">Loading payment history...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">Error: {error}</p>
        <button
          onClick={fetchHistory}
          className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-sm text-gray-600">No payment history yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Date
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Description
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Type
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Amount
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Card
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Balance
            </th>
            {viewerRole === 'therapist' && (
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {transactions.map((tx) => {
            const rowBgColor =
              tx.type === 'charge'
                ? 'bg-red-50/30'
                : tx.type === 'payment'
                  ? 'bg-green-50/30'
                  : tx.type === 'refund'
                    ? 'bg-yellow-50/30'
                    : ''

            return (
              <tr key={tx.id} className={rowBgColor}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {formatDate(tx.createdAt)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {tx.description || (
                    <span className="italic text-gray-400">No description</span>
                  )}
                  {tx.refundedFromId && (
                    <div className="mt-1 text-xs text-gray-500">
                      Refund for charge on{' '}
                      {tx.refundedFrom && formatDate(tx.refundedFrom.createdAt)}
                    </div>
                  )}
                  {tx.status === 'failed' && tx.stripeError && (
                    <div className="mt-1 text-xs text-red-600">
                      Error: {tx.stripeError}
                    </div>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${getTypeColor(tx.type)}`}
                  >
                    {tx.type}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span
                    className={`font-semibold ${tx.type === 'charge' ? 'text-red-600' : tx.type === 'payment' ? 'text-green-600' : 'text-yellow-600'}`}
                  >
                    {tx.type === 'charge' ? '-' : '+'}${tx.amount.toFixed(2)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {tx.cardLast4 ? `•••• ${tx.cardLast4}` : '-'}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${getStatusColor(tx.status)}`}
                  >
                    {tx.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  ${tx.runningBalance.toFixed(2)}
                </td>
                {viewerRole === 'therapist' && (
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {tx.type === 'charge' && tx.status === 'succeeded' && (
                      <button
                        onClick={() => onRefund?.(tx.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Refund
                      </button>
                    )}
                    {tx.status === 'failed' && (
                      <button
                        onClick={() => onRetry?.(tx.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Retry
                      </button>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
