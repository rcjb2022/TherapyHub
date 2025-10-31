'use client'

// Universal Form Review Component
// Dynamically renders and allows editing of any form type

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface UniversalFormReviewProps {
  patientId: string
  formSubmission: any
  therapistId: string
}

const FORM_NAMES: Record<string, string> = {
  'patient-information': 'Patient Information',
  'medical-history': 'Medical History',
  'mental-health-history': 'Mental Health History',
  'insurance-information': 'Insurance Information',
  'hipaa-authorization': 'HIPAA Authorization',
  'payment-information': 'Payment Information',
  'parental-consent': 'Parental Consent',
}

const FIELD_LABELS: Record<string, string> = {
  // Patient Information
  firstName: 'First Name',
  lastName: 'Last Name',
  middleName: 'Middle Name',
  preferredName: 'Preferred Name',
  dateOfBirth: 'Date of Birth',
  ssn: 'Social Security Number',
  gender: 'Gender',
  maritalStatus: 'Marital Status',
  email: 'Email Address',
  phone: 'Phone Number',
  alternatePhone: 'Alternate Phone',
  street: 'Street Address',
  city: 'City',
  state: 'State',
  zip: 'ZIP Code',
  emergencyContactName: 'Emergency Contact Name',
  emergencyContactPhone: 'Emergency Contact Phone',
  emergencyContactRelationship: 'Emergency Contact Relationship',
  occupation: 'Occupation',
  employer: 'Employer',
  referredBy: 'Referred By',

  // Medical History
  currentMedications: 'Current Medications',
  drugAllergies: 'Drug Allergies',
  foodAllergies: 'Food Allergies',
  otherAllergies: 'Other Allergies',
  currentConditions: 'Current Medical Conditions',
  chronicIllnesses: 'Chronic Illnesses',
  pastSurgeries: 'Past Surgeries',
  hospitalizations: 'Hospitalizations',
  familyHeartDisease: 'Family History: Heart Disease',
  familyDiabetes: 'Family History: Diabetes',
  familyCancer: 'Family History: Cancer',
  familyMentalIllness: 'Family History: Mental Illness',
  familySubstanceAbuse: 'Family History: Substance Abuse',
  familyOther: 'Other Family History',
  primaryCarePhysician: 'Primary Care Physician',
  physicianPhone: 'Physician Phone',
  lastPhysicalExam: 'Last Physical Exam Date',
  smoker: 'Tobacco Use',
  alcoholUse: 'Alcohol Use',
  drugUse: 'Recreational Drug Use',
  exerciseFrequency: 'Exercise Frequency',
  additionalMedicalInfo: 'Additional Medical Information',

  // Mental Health History
  currentlyInTherapy: 'Currently in Therapy?',
  currentTherapist: 'Current Therapist Name',
  therapistPhone: 'Therapist Phone',
  seeingPsychiatrist: 'Seeing a Psychiatrist?',
  psychiatristName: 'Psychiatrist Name',
  psychiatristPhone: 'Psychiatrist Phone',
  currentMentalHealthMeds: 'Current Mental Health Medications',
  pastMentalHealthMeds: 'Past Mental Health Medications',
  previousDiagnoses: 'Previous Mental Health Diagnoses',
  diagnosedBy: 'Diagnosed By',
  previousTherapy: 'Previous Therapy History',
  previousHospitalizations: 'Previous Psychiatric Hospitalizations',
  previousInpatient: 'Previous Inpatient Treatment',
  currentSymptoms: 'Current Symptoms',
  symptomDuration: 'Symptom Duration',
  symptomsImpactDaily: 'Impact on Daily Life',
  suicidalThoughts: 'Suicidal Thoughts',
  suicideHistory: 'Suicide Attempt History',
  selfHarmHistory: 'Self-Harm History',
  substanceUseHistory: 'Substance Use History',
  substanceAbuseTreatment: 'Substance Abuse Treatment',
  familyMentalHealthHistory: 'Family Mental Health History',
  familySuicideHistory: 'Family Suicide History',
  currentStressors: 'Current Life Stressors',
  recentTrauma: 'Recent Trauma',
  therapyGoals: 'Goals for Therapy',
  whatHelpLooksLike: 'What Would "Feeling Better" Look Like?',
  additionalMentalHealthInfo: 'Additional Mental Health Information',

  // Insurance
  primaryInsuranceCompany: 'Primary Insurance Company',
  primaryPolicyNumber: 'Primary Policy Number',
  primaryGroupNumber: 'Primary Group Number',
  primaryPolicyHolderName: 'Primary Policy Holder Name',
  primaryPolicyHolderDOB: 'Primary Policy Holder DOB',
  primaryRelationshipToPatient: 'Primary Relationship to Patient',
  hasSecondaryInsurance: 'Has Secondary Insurance?',
  secondaryInsuranceCompany: 'Secondary Insurance Company',
  secondaryPolicyNumber: 'Secondary Policy Number',
  secondaryGroupNumber: 'Secondary Group Number',
  secondaryPolicyHolderName: 'Secondary Policy Holder Name',
  secondaryPolicyHolderDOB: 'Secondary Policy Holder DOB',
  secondaryRelationshipToPatient: 'Secondary Relationship to Patient',
  insurancePhone: 'Insurance Phone',
  additionalInsuranceInfo: 'Additional Insurance Information',

  // HIPAA
  consentToTreatment: 'Consent to Treatment',
  consentToTelehealth: 'Consent to Telehealth',
  consentToReleaseInfo: 'Consent to Release Information',
  consentToVoicemail: 'Consent to Voicemail',
  consentToText: 'Consent to Text Messages',
  consentToEmail: 'Consent to Email',
  receivedPrivacyNotice: 'Received Privacy Notice',
  understandConfidentiality: 'Understands Confidentiality',
  understandRights: 'Understands Rights',
  releaseToEmergencyContact: 'Release to Emergency Contact',
  signatureName: 'Signature Name',
  signatureDate: 'Signature Date',
  relationshipToPatient: 'Relationship to Patient',

  // Payment
  billingName: 'Billing Name',
  billingStreet: 'Billing Street',
  billingCity: 'Billing City',
  billingState: 'Billing State',
  billingZip: 'Billing ZIP',
  billingPhone: 'Billing Phone',
  cardholderName: 'Cardholder Name',
  preferredPaymentMethod: 'Preferred Payment Method',
  autoPayConsent: 'Auto-Pay Consent',
  understandFees: 'Understands Fees',
  sessionFee: 'Session Fee',
  cancellationPolicy: 'Acknowledges Cancellation Policy',
  additionalPaymentInfo: 'Additional Payment Information',

  // Parental Consent
  patientName: 'Patient Name',
  patientDOB: 'Patient Date of Birth',
  parentName: 'Parent/Guardian Name',
  parentRelationship: 'Relationship to Patient',
  parentEmail: 'Parent Email',
  parentPhone: 'Parent Phone',
  parentAddress: 'Parent Address',
  understandMinorRights: 'Understands Minor Rights',
  consentToEmergencyContact: 'Consents to Emergency Contact',
  consentToShareProgress: 'Consents to Share Progress',
  consentToLeaveVoicemail: 'Consents to Leave Voicemail',
}

export default function UniversalFormReview({
  patientId,
  formSubmission,
  therapistId
}: UniversalFormReviewProps) {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState(formSubmission.formData || {})

  const formName = FORM_NAMES[formSubmission.formType] || formSubmission.formType

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type, value } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData({ ...formData, [name]: checked })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/patients/${patientId}/forms/${formSubmission.id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData: formData,
          therapistId: therapistId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to complete form')
      }

      router.push(`/dashboard/patients/${patientId}`)
      router.refresh()
    } catch (err: any) {
      console.error('Error completing form:', err)
      setError(err.message || 'An unexpected error occurred')
      setIsLoading(false)
    }
  }

  const renderField = (key: string, value: any) => {
    const label = FIELD_LABELS[key] || key

    // Skip rendering empty/undefined values
    if (value === undefined || value === null || value === '') {
      return null
    }

    // Boolean checkbox fields
    if (typeof value === 'boolean') {
      return (
        <div key={key} className="flex items-center gap-3">
          <input
            type="checkbox"
            name={key}
            checked={value}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="text-sm text-gray-700">{label}</label>
        </div>
      )
    }

    // Textarea for long text fields
    if (typeof value === 'string' && value.length > 100) {
      return (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
          <textarea
            name={key}
            rows={4}
            value={value}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )
    }

    // Regular input fields
    return (
      <div key={key}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <input
          type={key.includes('date') || key.includes('DOB') ? 'date' : 'text'}
          name={key}
          value={value}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/dashboard/patients/${patientId}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Patient
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Review {formName}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Review submitted information and complete to save to patient record
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-yellow-50 px-3 py-1 text-sm text-yellow-800 border border-yellow-200">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Pending Review - Submitted {new Date(formSubmission.updatedAt).toLocaleDateString()}
        </div>
      </div>

      {/* Form */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Dynamic Form Fields */}
        <div className="space-y-6">
          {Object.entries(formData).map(([key, value]) => renderField(key, value))}
        </div>

        {Object.keys(formData).length === 0 && (
          <p className="text-sm text-gray-600">No form data available</p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4 border-t border-gray-200 pt-6 mt-8">
          <Link
            href={`/dashboard/patients/${patientId}`}
            className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleComplete}
            disabled={isLoading}
            className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Completing...' : 'Complete & Save to Patient Record'}
          </button>
        </div>
      </div>
    </div>
  )
}
