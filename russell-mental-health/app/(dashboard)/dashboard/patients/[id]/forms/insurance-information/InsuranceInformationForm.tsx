'use client'

// Client component for Insurance Information Form
// Primary and secondary insurance details

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FormSuccessMessage, determineNextForm } from '../formHelpers'

interface InsuranceInformationFormProps {
  patientId: string
}

export default function InsuranceInformationForm({ patientId }: InsuranceInformationFormProps) {
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
    // Primary Insurance
    primaryInsuranceCompany: '',
    primaryPolicyNumber: '',
    primaryGroupNumber: '',
    primaryPolicyHolderName: '',
    primaryPolicyHolderDOB: '',
    primaryRelationshipToPatient: '',

    // Insurance Card Images (required by insurance company)
    insuranceCardFrontUploaded: '',
    insuranceCardBackUploaded: '',

    // Secondary Insurance
    hasSecondaryInsurance: '',
    secondaryInsuranceCompany: '',
    secondaryPolicyNumber: '',
    secondaryGroupNumber: '',
    secondaryPolicyHolderName: '',
    secondaryPolicyHolderDOB: '',
    secondaryRelationshipToPatient: '',

    // Additional Information
    insurancePhone: '',
    additionalInsuranceInfo: '',
  })

  // Load existing form data if it exists
  useEffect(() => {
    const loadExistingForm = async () => {
      try {
        setIsFetching(true)

        const response = await fetch(`/api/patients/${patientId}/forms?formType=insurance-information`)

        if (response.ok) {
          const forms = await response.json()
          const existingForm = forms.find((f: any) => f.formType === 'insurance-information')

          if (existingForm) {
            setExistingFormId(existingForm.id)
            setIsUpdate(true)

            if (existingForm.formData) {
              setFormData({
                primaryInsuranceCompany: existingForm.formData.primaryInsuranceCompany || '',
                primaryPolicyNumber: existingForm.formData.primaryPolicyNumber || '',
                primaryGroupNumber: existingForm.formData.primaryGroupNumber || '',
                primaryPolicyHolderName: existingForm.formData.primaryPolicyHolderName || '',
                primaryPolicyHolderDOB: existingForm.formData.primaryPolicyHolderDOB || '',
                primaryRelationshipToPatient: existingForm.formData.primaryRelationshipToPatient || '',
                insuranceCardFrontUploaded: existingForm.formData.insuranceCardFrontUploaded || '',
                insuranceCardBackUploaded: existingForm.formData.insuranceCardBackUploaded || '',
                hasSecondaryInsurance: existingForm.formData.hasSecondaryInsurance || '',
                secondaryInsuranceCompany: existingForm.formData.secondaryInsuranceCompany || '',
                secondaryPolicyNumber: existingForm.formData.secondaryPolicyNumber || '',
                secondaryGroupNumber: existingForm.formData.secondaryGroupNumber || '',
                secondaryPolicyHolderName: existingForm.formData.secondaryPolicyHolderName || '',
                secondaryPolicyHolderDOB: existingForm.formData.secondaryPolicyHolderDOB || '',
                secondaryRelationshipToPatient: existingForm.formData.secondaryRelationshipToPatient || '',
                insurancePhone: existingForm.formData.insurancePhone || '',
                additionalInsuranceInfo: existingForm.formData.additionalInsuranceInfo || '',
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const payload = {
        formType: 'insurance-information',
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
          {isUpdate ? 'Update Insurance Information' : 'Insurance Information Form'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {isUpdate
            ? 'Update your insurance information'
            : 'Provide your insurance information for billing purposes'}
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

        {/* Primary Insurance */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Primary Insurance</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Company *
              </label>
              <input
                type="text"
                name="primaryInsuranceCompany"
                required
                value={formData.primaryInsuranceCompany}
                onChange={handleChange}
                placeholder="Blue Cross Blue Shield, Aetna, UnitedHealthcare, etc."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Policy/Member ID Number *
              </label>
              <input
                type="text"
                name="primaryPolicyNumber"
                required
                value={formData.primaryPolicyNumber}
                onChange={handleChange}
                placeholder="Policy number from insurance card"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Number
              </label>
              <input
                type="text"
                name="primaryGroupNumber"
                value={formData.primaryGroupNumber}
                onChange={handleChange}
                placeholder="Group number (if applicable)"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Policy Holder Name *
              </label>
              <input
                type="text"
                name="primaryPolicyHolderName"
                required
                value={formData.primaryPolicyHolderName}
                onChange={handleChange}
                placeholder="Full name of person who holds the insurance policy"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Policy Holder Date of Birth *
              </label>
              <input
                type="date"
                name="primaryPolicyHolderDOB"
                required
                value={formData.primaryPolicyHolderDOB}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship to Patient *
              </label>
              <select
                name="primaryRelationshipToPatient"
                required
                value={formData.primaryRelationshipToPatient}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="self">Self</option>
                <option value="spouse">Spouse</option>
                <option value="parent">Parent</option>
                <option value="child">Child</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Customer Service Phone
              </label>
              <input
                type="tel"
                name="insurancePhone"
                value={formData.insurancePhone}
                onChange={handleChange}
                placeholder="Phone number on back of insurance card"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Secondary Insurance */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Secondary Insurance (Optional)</h2>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Do you have secondary insurance? *
            </label>
            <select
              name="hasSecondaryInsurance"
              required
              value={formData.hasSecondaryInsurance}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>

          {formData.hasSecondaryInsurance === 'yes' && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Insurance Company
                </label>
                <input
                  type="text"
                  name="secondaryInsuranceCompany"
                  value={formData.secondaryInsuranceCompany}
                  onChange={handleChange}
                  placeholder="Secondary insurance company name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Policy/Member ID Number
                </label>
                <input
                  type="text"
                  name="secondaryPolicyNumber"
                  value={formData.secondaryPolicyNumber}
                  onChange={handleChange}
                  placeholder="Policy number"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Number
                </label>
                <input
                  type="text"
                  name="secondaryGroupNumber"
                  value={formData.secondaryGroupNumber}
                  onChange={handleChange}
                  placeholder="Group number (if applicable)"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Policy Holder Name
                </label>
                <input
                  type="text"
                  name="secondaryPolicyHolderName"
                  value={formData.secondaryPolicyHolderName}
                  onChange={handleChange}
                  placeholder="Full name of policy holder"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Policy Holder Date of Birth
                </label>
                <input
                  type="date"
                  name="secondaryPolicyHolderDOB"
                  value={formData.secondaryPolicyHolderDOB}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship to Patient
                </label>
                <select
                  name="secondaryRelationshipToPatient"
                  value={formData.secondaryRelationshipToPatient}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="self">Self</option>
                  <option value="spouse">Spouse</option>
                  <option value="parent">Parent</option>
                  <option value="child">Child</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Additional Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Insurance Notes
            </label>
            <textarea
              name="additionalInsuranceInfo"
              rows={3}
              value={formData.additionalInsuranceInfo}
              onChange={handleChange}
              placeholder="Any additional information about your insurance coverage"
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
            {isLoading ? 'Saving...' : isUpdate ? 'Update Insurance Information' : 'Submit for Review'}
          </button>
        </div>
      </form>
    </div>
  )
}
