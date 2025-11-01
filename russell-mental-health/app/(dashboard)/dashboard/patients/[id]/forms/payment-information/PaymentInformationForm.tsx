'use client'

// Client component for Payment Information Form
// Credit card on file and billing information
// NOTE: Full Stripe integration to be added later

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FormSuccessMessage, determineNextForm } from '../formHelpers'

interface PaymentInformationFormProps {
  patientId: string
}

export default function PaymentInformationForm({ patientId }: PaymentInformationFormProps) {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState('')
  const [existingFormId, setExistingFormId] = useState<string | null>(null)
  const [isUpdate, setIsUpdate] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [nextForm, setNextForm] = useState<{ type: string; title: string } | null>(null)
  const [completedCount, setCompletedCount] = useState(0)
  const [formData, setFormData] = useState({
    // Billing Name & Address
    billingName: '',
    billingStreet: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingPhone: '',

    // Credit Card (Placeholder - Stripe integration later)
    cardholderName: '',
    // NOTE: DO NOT store actual card numbers!
    // Future: Stripe Elements will tokenize card data

    // Payment Preferences
    preferredPaymentMethod: '',
    autoPayConsent: false,

    // Fee Agreement
    understandFees: false,
    sessionFee: '',
    cancellationPolicy: false,

    // Additional Information
    additionalPaymentInfo: '',
  })

  // Load existing form data if it exists
  useEffect(() => {
    const loadExistingForm = async () => {
      try {
        setIsFetching(true)

        const response = await fetch(`/api/patients/${patientId}/forms?formType=payment-information`)

        if (response.ok) {
          const forms = await response.json()
          const existingForm = forms.find((f: any) => f.formType === 'payment-information')

          if (existingForm) {
            setExistingFormId(existingForm.id)
            setIsUpdate(true)

            if (existingForm.formData) {
              setFormData({
                billingName: existingForm.formData.billingName || '',
                billingStreet: existingForm.formData.billingStreet || '',
                billingCity: existingForm.formData.billingCity || '',
                billingState: existingForm.formData.billingState || '',
                billingZip: existingForm.formData.billingZip || '',
                billingPhone: existingForm.formData.billingPhone || '',
                cardholderName: existingForm.formData.cardholderName || '',
                preferredPaymentMethod: existingForm.formData.preferredPaymentMethod || '',
                autoPayConsent: existingForm.formData.autoPayConsent || false,
                understandFees: existingForm.formData.understandFees || false,
                sessionFee: existingForm.formData.sessionFee || '',
                cancellationPolicy: existingForm.formData.cancellationPolicy || false,
                additionalPaymentInfo: existingForm.formData.additionalPaymentInfo || '',
              })
            }
          }
        }
      } catch (err) {
        console.error('Error loading existing form:', err)
      } finally {
        setIsFetching(false)
      }
    }

    loadExistingForm()
  }, [patientId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type, value } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData({ ...formData, [name]: checked })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate required acknowledgments
    if (!formData.understandFees) {
      setError('You must acknowledge understanding of fees')
      setIsLoading(false)
      return
    }

    if (!formData.cancellationPolicy) {
      setError('You must acknowledge the cancellation policy')
      setIsLoading(false)
      return
    }

    try {
      const payload = {
        formType: 'payment-information',
        formData: formData,
        status: 'SUBMITTED',
      }

      const response = await fetch(`/api/patients/${patientId}/forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.message || 'Failed to save form')
      }

      // Determine next form and show success message
      const { next, completedCount: count } = await determineNextForm(patientId)
      setNextForm(next)
      setCompletedCount(count)
      setShowSuccess(true)
      setIsLoading(false)
    } catch (err: any) {
      console.error('Error submitting form:', err)
      setError(err.message || 'An unexpected error occurred')
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    )
  }

  // Show success message after submission
  if (showSuccess) {
    return <FormSuccessMessage patientId={patientId} nextForm={nextForm} completedCount={completedCount} />
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/dashboard/patients/${patientId}/forms`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Forms
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isUpdate ? 'Update Payment Information' : 'Payment Information & Fee Agreement'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {isUpdate
            ? 'Update your payment information and billing details'
            : 'Provide payment information and review fee agreement'}
        </p>
        {isUpdate && (
          <div className="mt-2 inline-flex items-center gap-2 rounded-md bg-blue-50 px-3 py-1 text-sm text-blue-700">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Updating existing information
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Billing Information */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Billing Information</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Billing Name *
              </label>
              <input
                type="text"
                name="billingName"
                required
                value={formData.billingName}
                onChange={handleChange}
                placeholder="Full name as it appears on card"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Billing Street Address *
              </label>
              <input
                type="text"
                name="billingStreet"
                required
                value={formData.billingStreet}
                onChange={handleChange}
                placeholder="Street address"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="billingCity"
                  required
                  value={formData.billingCity}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  name="billingState"
                  required
                  maxLength={2}
                  placeholder="FL"
                  value={formData.billingState}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  name="billingZip"
                  required
                  placeholder="32988"
                  value={formData.billingZip}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Billing Phone Number *
              </label>
              <input
                type="tel"
                name="billingPhone"
                required
                value={formData.billingPhone}
                onChange={handleChange}
                placeholder="(239) 555-0100"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Payment Method</h2>
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Secure credit card processing via Stripe will be added in a future update.
              For now, please provide your payment preferences and our staff will contact you to securely collect payment information.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                name="cardholderName"
                value={formData.cardholderName}
                onChange={handleChange}
                placeholder="Name as it appears on card"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Payment Method *
              </label>
              <select
                name="preferredPaymentMethod"
                required
                value={formData.preferredPaymentMethod}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="credit-card">Credit Card</option>
                <option value="debit-card">Debit Card</option>
                <option value="hsa-fsa">HSA/FSA Card</option>
                <option value="other">Other (to be discussed)</option>
              </select>
            </div>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="autoPayConsent"
                checked={formData.autoPayConsent}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                I consent to automatic payment after each session (card will be charged the session fee)
              </span>
            </label>
          </div>
        </div>

        {/* Fee Agreement */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Fee Agreement & Policies</h2>

          <div className="rounded-lg bg-gray-50 p-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Session Fees</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Individual Therapy Session (50 minutes): $150</li>
              <li>Initial Evaluation (60 minutes): $200</li>
              <li>Group Therapy Session: $50</li>
              <li>Family Therapy Session (60 minutes): $175</li>
            </ul>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Cancellation Policy</h3>
            <p className="text-sm text-gray-700">
              Cancellations must be made at least 24 hours in advance. Late cancellations or no-shows will be charged
              the full session fee unless due to emergency circumstances.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                My session fee is: *
              </label>
              <input
                type="text"
                name="sessionFee"
                required
                value={formData.sessionFee}
                onChange={handleChange}
                placeholder="$150 (or as discussed with therapist)"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="understandFees"
                checked={formData.understandFees}
                onChange={handleChange}
                required
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                <strong>I understand and agree to the fee structure and payment terms *</strong>
              </span>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="cancellationPolicy"
                checked={formData.cancellationPolicy}
                onChange={handleChange}
                required
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                <strong>I understand and agree to the 24-hour cancellation policy *</strong>
              </span>
            </label>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Additional Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Payment Notes
            </label>
            <textarea
              name="additionalPaymentInfo"
              rows={3}
              value={formData.additionalPaymentInfo}
              onChange={handleChange}
              placeholder="Any special payment arrangements or notes"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4 border-t border-gray-200 pt-6">
          <Link
            href={`/dashboard/patients/${patientId}/forms`}
            className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : isUpdate ? 'Update Payment Information' : 'Submit for Review'}
          </button>
        </div>
      </form>
    </div>
  )
}
