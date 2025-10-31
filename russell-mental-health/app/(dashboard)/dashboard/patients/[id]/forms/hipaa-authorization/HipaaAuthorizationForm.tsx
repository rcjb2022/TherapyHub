'use client'

// Client component for HIPAA Authorization Form
// Treatment consent, telehealth consent, privacy policies, e-signature

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface HipaaAuthorizationFormProps {
  patientId: string
}

export default function HipaaAuthorizationForm({ patientId }: HipaaAuthorizationFormProps) {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState('')
  const [existingFormId, setExistingFormId] = useState<string | null>(null)
  const [isUpdate, setIsUpdate] = useState(false)
  const [formData, setFormData] = useState({
    // Consent Agreements
    consentToTreatment: false,
    consentToTelehealth: false,
    consentToReleaseInfo: false,
    consentToVoicemail: false,
    consentToText: false,
    consentToEmail: false,

    // HIPAA Acknowledgments
    receivedPrivacyNotice: false,
    understandConfidentiality: false,
    understandRights: false,

    // Emergency Contact Release
    emergencyContactName: '',
    emergencyContactPhone: '',
    releaseToEmergencyContact: false,

    // Electronic Signature
    signatureName: '',
    signatureDate: '',
    relationshipToPatient: 'self',
  })

  // Load existing form data if it exists
  useEffect(() => {
    const loadExistingForm = async () => {
      try {
        setIsFetching(true)

        const response = await fetch(`/api/patients/${patientId}/forms?formType=hipaa-authorization`)

        if (response.ok) {
          const forms = await response.json()
          const existingForm = forms.find((f: any) => f.formType === 'hipaa-authorization')

          if (existingForm) {
            setExistingFormId(existingForm.id)
            setIsUpdate(true)

            if (existingForm.formData) {
              setFormData({
                consentToTreatment: existingForm.formData.consentToTreatment || false,
                consentToTelehealth: existingForm.formData.consentToTelehealth || false,
                consentToReleaseInfo: existingForm.formData.consentToReleaseInfo || false,
                consentToVoicemail: existingForm.formData.consentToVoicemail || false,
                consentToText: existingForm.formData.consentToText || false,
                consentToEmail: existingForm.formData.consentToEmail || false,
                receivedPrivacyNotice: existingForm.formData.receivedPrivacyNotice || false,
                understandConfidentiality: existingForm.formData.understandConfidentiality || false,
                understandRights: existingForm.formData.understandRights || false,
                emergencyContactName: existingForm.formData.emergencyContactName || '',
                emergencyContactPhone: existingForm.formData.emergencyContactPhone || '',
                releaseToEmergencyContact: existingForm.formData.releaseToEmergencyContact || false,
                signatureName: existingForm.formData.signatureName || '',
                signatureDate: existingForm.formData.signatureDate || '',
                relationshipToPatient: existingForm.formData.relationshipToPatient || 'self',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    // Validate required consents
    if (!formData.consentToTreatment) {
      setError('You must consent to treatment to proceed')
      setIsLoading(false)
      return
    }

    if (!formData.receivedPrivacyNotice || !formData.understandConfidentiality || !formData.understandRights) {
      setError('You must acknowledge all HIPAA privacy notices to proceed')
      setIsLoading(false)
      return
    }

    if (!formData.signatureName) {
      setError('Electronic signature is required')
      setIsLoading(false)
      return
    }

    try {
      const payload = {
        formType: 'hipaa-authorization',
        formData: {
          ...formData,
          signatureDate: new Date().toISOString().split('T')[0], // Auto-set today's date
        },
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

      router.push(`/dashboard/patients/${patientId}/forms`)
      router.refresh()
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
          {isUpdate ? 'Update HIPAA Authorization' : 'HIPAA Authorization & Consent Forms'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {isUpdate
            ? 'Update your consent and authorization preferences'
            : 'Review and sign consent forms and privacy notices'}
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

        {/* Consent to Treatment */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Consent to Treatment</h2>
          <div className="rounded-lg bg-gray-50 p-4 mb-4">
            <p className="text-sm text-gray-700 mb-3">
              I voluntarily consent to receive mental health assessment, care, treatment, or services and authorize Russell Mental Health
              and its staff to provide such care, treatment, or services as are considered necessary and advisable.
            </p>
            <p className="text-sm text-gray-700 mb-3">
              I understand that I have the right to refuse treatment or withdraw this consent at any time, and that such refusal or
              withdrawal will not affect my right to future care or treatment nor result in the transfer of my financial responsibility for previously rendered services.
            </p>
          </div>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="consentToTreatment"
              checked={formData.consentToTreatment}
              onChange={handleChange}
              required
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              <strong>I consent to treatment *</strong>
            </span>
          </label>
        </div>

        {/* Telehealth Consent */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Telehealth Services Consent</h2>
          <div className="rounded-lg bg-gray-50 p-4 mb-4">
            <p className="text-sm text-gray-700 mb-3">
              I understand that telehealth services involve the use of electronic communications to enable health care providers at different
              locations to share individual patient information for the purpose of improving patient care.
            </p>
            <p className="text-sm text-gray-700 mb-3">
              I understand that the electronic systems used will incorporate network and software security protocols to protect the
              confidentiality of patient identification and imaging data, and will include measures to safeguard the data and to ensure its integrity.
            </p>
          </div>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="consentToTelehealth"
              checked={formData.consentToTelehealth}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              I consent to receive services via telehealth (video or phone sessions)
            </span>
          </label>
        </div>

        {/* Communication Preferences */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Communication Preferences</h2>
          <p className="text-sm text-gray-600 mb-4">
            Please indicate how you would like us to contact you. Note that some communication methods may not be completely secure.
          </p>
          <div className="space-y-3">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="consentToVoicemail"
                checked={formData.consentToVoicemail}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                I consent to voicemail messages being left on my phone
              </span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="consentToText"
                checked={formData.consentToText}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                I consent to text message (SMS) communication for appointment reminders and general information
              </span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="consentToEmail"
                checked={formData.consentToEmail}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                I consent to email communication for appointment reminders and general information
              </span>
            </label>
          </div>
        </div>

        {/* Release of Information to Emergency Contact */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Emergency Contact Authorization</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact Name
              </label>
              <input
                type="text"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                placeholder="Full name"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact Phone
              </label>
              <input
                type="tel"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                placeholder="(239) 555-0100"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="releaseToEmergencyContact"
              checked={formData.releaseToEmergencyContact}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              I authorize Russell Mental Health to contact this person in case of emergency and to share necessary medical information
            </span>
          </label>
        </div>

        {/* HIPAA Privacy Notice Acknowledgment */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">HIPAA Privacy Notice Acknowledgment</h2>
          <div className="rounded-lg bg-gray-50 p-4 mb-4">
            <p className="text-sm text-gray-700 mb-3">
              The Health Insurance Portability and Accountability Act (HIPAA) provides safeguards to protect your privacy. A Notice of Privacy
              Practices has been provided to you, which more fully describes how your health information may be used and disclosed.
            </p>
          </div>
          <div className="space-y-3">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="receivedPrivacyNotice"
                checked={formData.receivedPrivacyNotice}
                onChange={handleChange}
                required
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                <strong>I have received and reviewed the Notice of Privacy Practices *</strong>
              </span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="understandConfidentiality"
                checked={formData.understandConfidentiality}
                onChange={handleChange}
                required
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                <strong>I understand my rights regarding confidentiality of my medical information *</strong>
              </span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="understandRights"
                checked={formData.understandRights}
                onChange={handleChange}
                required
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                <strong>I understand my rights to access, amend, and receive an accounting of disclosures of my health information *</strong>
              </span>
            </label>
          </div>
        </div>

        {/* Electronic Signature */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Electronic Signature</h2>
          <p className="text-sm text-gray-600 mb-4">
            By typing your name below, you are providing your electronic signature and agreeing to all consents and acknowledgments above.
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name (Electronic Signature) *
              </label>
              <input
                type="text"
                name="signatureName"
                required
                value={formData.signatureName}
                onChange={handleChange}
                placeholder="Type your full legal name"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship to Patient *
              </label>
              <select
                name="relationshipToPatient"
                required
                value={formData.relationshipToPatient}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="self">Self</option>
                <option value="parent">Parent/Legal Guardian</option>
                <option value="spouse">Spouse</option>
                <option value="other">Other Authorized Person</option>
              </select>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Date signed: {new Date().toLocaleDateString()} (automatically recorded)
          </p>
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
            {isLoading ? 'Saving...' : isUpdate ? 'Update Authorization' : 'Sign and Submit'}
          </button>
        </div>
      </form>
    </div>
  )
}
