'use client'

// Client component for Parental Consent Form
// Required for patients under 18 - Parent/Guardian consent

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import FileUpload from '@/components/FileUpload'

interface ParentalConsentFormProps {
  patientId: string
}

export default function ParentalConsentForm({ patientId }: ParentalConsentFormProps) {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState('')
  const [existingFormId, setExistingFormId] = useState<string | null>(null)
  const [isUpdate, setIsUpdate] = useState(false)
  const [formData, setFormData] = useState({
    // Patient Information
    patientName: '',
    patientDOB: '',

    // Parent/Guardian Information
    parentName: '',
    parentRelationship: '',
    parentEmail: '',
    parentPhone: '',
    parentAddress: '',

    // Custody Information
    custodyStatus: '',
    custodyDescription: '',
    custodyDocument: '',

    // Consent Agreements
    consentToTreatment: false,
    understandConfidentiality: false,
    understandMinorRights: false,
    consentToEmergencyContact: false,
    consentToShareProgress: false,

    // Additional Consents
    consentToTelehealth: false,
    consentToLeaveVoicemail: false,

    // Electronic Signature
    signatureName: '',
    signatureDate: '',
  })

  // Load existing form data if it exists
  useEffect(() => {
    const loadExistingForm = async () => {
      try {
        setIsFetching(true)

        const response = await fetch(`/api/patients/${patientId}/forms?formType=parental-consent`)

        if (response.ok) {
          const forms = await response.json()
          const existingForm = forms.find((f: any) => f.formType === 'parental-consent')

          if (existingForm) {
            setExistingFormId(existingForm.id)
            setIsUpdate(true)

            if (existingForm.formData) {
              setFormData({
                patientName: existingForm.formData.patientName || '',
                patientDOB: existingForm.formData.patientDOB || '',
                parentName: existingForm.formData.parentName || '',
                parentRelationship: existingForm.formData.parentRelationship || '',
                parentEmail: existingForm.formData.parentEmail || '',
                parentPhone: existingForm.formData.parentPhone || '',
                parentAddress: existingForm.formData.parentAddress || '',
                custodyStatus: existingForm.formData.custodyStatus || '',
                custodyDescription: existingForm.formData.custodyDescription || '',
                custodyDocument: existingForm.formData.custodyDocument || '',
                consentToTreatment: existingForm.formData.consentToTreatment || false,
                understandConfidentiality: existingForm.formData.understandConfidentiality || false,
                understandMinorRights: existingForm.formData.understandMinorRights || false,
                consentToEmergencyContact: existingForm.formData.consentToEmergencyContact || false,
                consentToShareProgress: existingForm.formData.consentToShareProgress || false,
                consentToTelehealth: existingForm.formData.consentToTelehealth || false,
                consentToLeaveVoicemail: existingForm.formData.consentToLeaveVoicemail || false,
                signatureName: existingForm.formData.signatureName || '',
                signatureDate: existingForm.formData.signatureDate || '',
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

    // Validate required consents
    if (!formData.consentToTreatment) {
      setError('You must consent to treatment for your child/minor to proceed')
      setIsLoading(false)
      return
    }

    if (!formData.understandConfidentiality || !formData.understandMinorRights) {
      setError('You must acknowledge understanding of confidentiality and minor rights')
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
        formType: 'parental-consent',
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
          {isUpdate ? 'Update Parental Consent' : 'Parental Consent for Treatment of Minor'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {isUpdate
            ? 'Update parental consent information'
            : 'Parent/Guardian consent required for treatment of patient under 18'}
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

        {/* Patient Information */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Patient Information</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Full Name *
              </label>
              <input
                type="text"
                name="patientName"
                required
                value={formData.patientName}
                onChange={handleChange}
                placeholder="Minor's full legal name"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Date of Birth *
              </label>
              <input
                type="date"
                name="patientDOB"
                required
                value={formData.patientDOB}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Parent/Guardian Information */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Parent/Guardian Information</h2>
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent/Guardian Full Name *
                </label>
                <input
                  type="text"
                  name="parentName"
                  required
                  value={formData.parentName}
                  onChange={handleChange}
                  placeholder="Your full legal name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship to Patient *
                </label>
                <select
                  name="parentRelationship"
                  required
                  value={formData.parentRelationship}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="mother">Mother</option>
                  <option value="father">Father</option>
                  <option value="legal-guardian">Legal Guardian</option>
                  <option value="stepparent">Stepparent</option>
                  <option value="grandparent">Grandparent</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="parentEmail"
                  required
                  value={formData.parentEmail}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="parentPhone"
                  required
                  value={formData.parentPhone}
                  onChange={handleChange}
                  placeholder="(239) 555-0100"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                name="parentAddress"
                required
                value={formData.parentAddress}
                onChange={handleChange}
                placeholder="Full address (street, city, state, zip)"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custody Status *
              </label>
              <select
                name="custodyStatus"
                required
                value={formData.custodyStatus}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="full">Full Custody (as determined by a Court of Law)</option>
                <option value="shared">Shared Custody (as determined by a Court of Law)</option>
                <option value="na">Not Applicable</option>
              </select>
            </div>

            {formData.custodyStatus === 'shared' && (
              <>
                <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                  <p className="text-sm text-yellow-800 font-medium">
                    ⚠️ Shared Custody Requirements: BOTH parents must consent to treatment, OR you must upload a Judicial Order or applicable Legal Document authorizing treatment.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (if applicable)
                  </label>
                  <textarea
                    name="custodyDescription"
                    rows={2}
                    value={formData.custodyDescription}
                    onChange={handleChange}
                    placeholder="Please describe custody arrangement if applicable"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <FileUpload
                    label="Judicial Order / Legal Document (Optional)"
                    name="custodyDocument"
                    required={false}
                    patientId={patientId}
                    fileType="legal-document"
                    currentFileUrl={formData.custodyDocument}
                    onUploadComplete={(url) => setFormData(prev => ({ ...prev, custodyDocument: url }))}
                    helpText="Upload Judicial Order or Legal Document authorizing treatment (JPG, PNG, GIF, or PDF)"
                  />
                </div>
              </>
            )}

            {(formData.custodyStatus === 'full' || formData.custodyStatus === 'na') && formData.custodyStatus && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (if applicable)
                </label>
                <textarea
                  name="custodyDescription"
                  rows={2}
                  value={formData.custodyDescription}
                  onChange={handleChange}
                  placeholder="Please describe if applicable"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Consent to Treatment */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Consent for Treatment</h2>
          <div className="rounded-lg bg-gray-50 p-4 mb-4">
            <p className="text-sm text-gray-700 mb-3">
              I, the undersigned parent/legal guardian, hereby consent to mental health evaluation, treatment, and services
              for the above-named minor by Russell Mental Health and its staff. I understand that I have the right to refuse or
              withdraw this consent at any time.
            </p>
            <p className="text-sm text-gray-700 mb-3">
              I understand that as the parent/guardian, I have the right to receive information about my child's treatment, progress,
              and any significant events that occur during treatment.
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
              <strong>I consent to mental health treatment for my child/minor *</strong>
            </span>
          </label>
        </div>

        {/* Confidentiality and Minor Rights */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Confidentiality & Minor Rights</h2>
          <div className="rounded-lg bg-gray-50 p-4 mb-4">
            <p className="text-sm text-gray-700 mb-3">
              <strong>Understanding Confidentiality with Minors:</strong> While treatment of minors involves some degree of confidentiality
              between the therapist and patient, parents/guardians have the legal right to general information about treatment progress
              and significant issues.
            </p>
            <p className="text-sm text-gray-700 mb-3">
              The therapist will work with both the minor and parent/guardian to establish appropriate boundaries regarding what information
              will be shared. Some information may be kept confidential to build trust with the minor, except in cases where there is:
            </p>
            <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
              <li>Risk of harm to self or others</li>
              <li>Abuse or neglect</li>
              <li>Court order requiring disclosure</li>
            </ul>
          </div>
          <div className="space-y-3">
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
                <strong>I understand the confidentiality policies regarding treatment of minors *</strong>
              </span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="understandMinorRights"
                checked={formData.understandMinorRights}
                onChange={handleChange}
                required
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                <strong>I understand my rights and my child's rights regarding treatment and confidentiality *</strong>
              </span>
            </label>
          </div>
        </div>

        {/* Additional Consents */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Additional Authorizations</h2>
          <div className="space-y-3">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="consentToEmergencyContact"
                checked={formData.consentToEmergencyContact}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                I authorize the therapist to contact me immediately in case of emergency involving my child
              </span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="consentToShareProgress"
                checked={formData.consentToShareProgress}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                I consent to receiving regular updates about my child's progress in treatment
              </span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="consentToTelehealth"
                checked={formData.consentToTelehealth}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                I consent to telehealth (video/phone) sessions for my child
              </span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="consentToLeaveVoicemail"
                checked={formData.consentToLeaveVoicemail}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                I consent to voicemail messages being left on my phone regarding my child's appointments
              </span>
            </label>
          </div>
        </div>

        {/* Electronic Signature */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Electronic Signature</h2>
          <p className="text-sm text-gray-600 mb-4">
            By typing your name below, you are providing your electronic signature as the parent/legal guardian and agreeing to all
            consents and authorizations above.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parent/Guardian Full Name (Electronic Signature) *
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
            {isLoading ? 'Saving...' : isUpdate ? 'Update Parental Consent' : 'Sign and Submit'}
          </button>
        </div>
      </form>
    </div>
  )
}
