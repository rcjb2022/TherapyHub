'use client'

import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { useState } from 'react'
import { StripeCardElementChangeEvent } from '@stripe/stripe-js'

interface PaymentMethodInputProps {
  onPaymentMethodCreated: (paymentMethodId: string, last4: string, expMonth: number, expYear: number) => void
  onError: (error: string) => void
}

export function PaymentMethodInput({ onPaymentMethodCreated, onError }: PaymentMethodInputProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardComplete, setCardComplete] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)

  const handleCardChange = (event: StripeCardElementChangeEvent) => {
    setCardComplete(event.complete)
    setCardError(event.error ? event.error.message : null)
  }

  const handleSubmit = async () => {
    if (!stripe || !elements || !cardComplete) {
      return
    }

    setIsProcessing(true)
    setCardError(null)

    try {
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      // Create a payment method (tokenizes the card - NO card data stored on our server!)
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!paymentMethod) {
        throw new Error('Failed to create payment method')
      }

      // Extract safe metadata (last 4 digits, expiration)
      const last4 = paymentMethod.card?.last4 || ''
      const expMonth = paymentMethod.card?.exp_month || 0
      const expYear = paymentMethod.card?.exp_year || 0

      // Return the payment method ID and metadata (NOT the full card!)
      onPaymentMethodCreated(paymentMethod.id, last4, expMonth, expYear)
    } catch (err: any) {
      console.error('Payment method creation error:', err)
      setCardError(err.message || 'An error occurred')
      onError(err.message || 'An error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1f2937',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        '::placeholder': {
          color: '#9ca3af',
        },
      },
      invalid: {
        color: '#ef4444',
      },
    },
  }

  return (
    <div>
      <div className="rounded-md border border-gray-300 p-4 bg-white">
        <CardElement options={cardElementOptions} onChange={handleCardChange} />
      </div>

      {cardError && (
        <p className="mt-2 text-sm text-red-600">{cardError}</p>
      )}

      <div className="mt-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!stripe || !cardComplete || isProcessing}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? 'Processing...' : 'Save Payment Method'}
        </button>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        🔒 Your card information is encrypted and never stored on our servers. We use Stripe for secure payment processing.
      </p>
    </div>
  )
}
