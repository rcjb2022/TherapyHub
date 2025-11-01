'use client'

// Client component for Medical History Form
// Physical health history, medications, allergies, surgeries

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FormSuccessMessage, determineNextForm } from '../formHelpers'

interface MedicalHistoryFormProps {
  patientId: string
}

export default function MedicalHistoryForm({ patientId }: MedicalHistoryFormProps) {
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
    // Current Medications
    currentMedications: '',

    // Allergies
    drugAllergies: '',
    foodAllergies: '',
    otherAllergies: '',

    // Medical Conditions
    currentConditions: '',
    chronicIllnesses: '',

    // Surgical History
    pastSurgeries: '',
    hospitalizations: '',

    // Family Medical History
    familyHeartDisease: false,
    familyDiabetes: false,
    familyCancer: false,
    familyMentalIllness: false,
    familySubstanceAbuse: false,
    familyOther: '',

    // Current Health Status
    primaryCarePhysician: '',
    physicianPhone: '',
    lastPhysicalExam: '',

    // Lifestyle
    smoker: '',
    alcoholUse: '',
    drugUse: '',
    exerciseFrequency: '',

    // Additional Notes
    additionalMedicalInfo: '',
  })

  // Load existing form data if it exists
  useEffect(() => {
    const loadExistingForm = async () => {
      try {
        setIsFetching(true)

        const response = await fetch(`/api/patients/${patientId}/forms?formType=medical-history`)

        if (response.ok) {
          const forms = await response.json()
          const existingForm = forms.find((f: any) => f.formType === 'medical-history')

          if (existingForm) {
            setExistingFormId(existingForm.id)
            setIsUpdate(true)

            if (existingForm.formData) {
              setFormData({
                currentMedications: existingForm.formData.currentMedications || '',
                drugAllergies: existingForm.formData.drugAllergies || '',
                foodAllergies: existingForm.formData.foodAllergies || '',
                otherAllergies: existingForm.formData.otherAllergies || '',
                currentConditions: existingForm.formData.currentConditions || '',
                chronicIllnesses: existingForm.formData.chronicIllnesses || '',
                pastSurgeries: existingForm.formData.pastSurgeries || '',
                hospitalizations: existingForm.formData.hospitalizations || '',
                familyHeartDisease: existingForm.formData.familyHeartDisease || false,
                familyDiabetes: existingForm.formData.familyDiabetes || false,
                familyCancer: existingForm.formData.familyCancer || false,
                familyMentalIllness: existingForm.formData.familyMentalIllness || false,
                familySubstanceAbuse: existingForm.formData.familySubstanceAbuse || false,
                familyOther: existingForm.formData.familyOther || '',
                primaryCarePhysician: existingForm.formData.primaryCarePhysician || '',
                physicianPhone: existingForm.formData.physicianPhone || '',
                lastPhysicalExam: existingForm.formData.lastPhysicalExam || '',
                smoker: existingForm.formData.smoker || '',
                alcoholUse: existingForm.formData.alcoholUse || '',
                drugUse: existingForm.formData.drugUse || '',
                exerciseFrequency: existingForm.formData.exerciseFrequency || '',
                additionalMedicalInfo: existingForm.formData.additionalMedicalInfo || '',
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

    try {
      const payload = {
        formType: 'medical-history',
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
          {isUpdate ? 'Update Medical History' : 'Medical History Form'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {isUpdate
            ? 'Update your medical history and current health information'
            : 'Complete your medical history and current health information'}
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

        {/* Current Medications */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Current Medications</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              List all current medications (include dosage and frequency)
            </label>
            <textarea
              name="currentMedications"
              rows={4}
              value={formData.currentMedications}
              onChange={handleChange}
              placeholder="Example: Lisinopril 10mg once daily, Metformin 500mg twice daily"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Allergies */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Allergies</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drug/Medication Allergies
              </label>
              <textarea
                name="drugAllergies"
                rows={2}
                value={formData.drugAllergies}
                onChange={handleChange}
                placeholder="List any medications you're allergic to and the reaction"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Food Allergies
              </label>
              <input
                type="text"
                name="foodAllergies"
                value={formData.foodAllergies}
                onChange={handleChange}
                placeholder="Example: Peanuts, Shellfish, Dairy"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other Allergies (Environmental, Latex, etc.)
              </label>
              <input
                type="text"
                name="otherAllergies"
                value={formData.otherAllergies}
                onChange={handleChange}
                placeholder="Example: Pollen, Latex, Pet dander"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Medical Conditions */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Medical Conditions</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Medical Conditions
              </label>
              <textarea
                name="currentConditions"
                rows={3}
                value={formData.currentConditions}
                onChange={handleChange}
                placeholder="List any current medical conditions, diagnoses, or health concerns"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chronic Illnesses
              </label>
              <textarea
                name="chronicIllnesses"
                rows={3}
                value={formData.chronicIllnesses}
                onChange={handleChange}
                placeholder="Example: Diabetes, Hypertension, Asthma, Heart disease"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Surgical History */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Surgical & Hospital History</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Past Surgeries
              </label>
              <textarea
                name="pastSurgeries"
                rows={3}
                value={formData.pastSurgeries}
                onChange={handleChange}
                placeholder="List any surgeries you've had and approximate dates"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hospitalizations
              </label>
              <textarea
                name="hospitalizations"
                rows={3}
                value={formData.hospitalizations}
                onChange={handleChange}
                placeholder="List any hospitalizations and reasons"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Family Medical History */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Family Medical History</h2>
          <p className="mb-4 text-sm text-gray-600">Check any conditions that run in your family</p>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="familyHeartDisease"
                checked={formData.familyHeartDisease}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Heart Disease</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="familyDiabetes"
                checked={formData.familyDiabetes}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Diabetes</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="familyCancer"
                checked={formData.familyCancer}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Cancer</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="familyMentalIllness"
                checked={formData.familyMentalIllness}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Mental Illness</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="familySubstanceAbuse"
                checked={formData.familySubstanceAbuse}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Substance Abuse</span>
            </label>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other Family History
              </label>
              <input
                type="text"
                name="familyOther"
                value={formData.familyOther}
                onChange={handleChange}
                placeholder="List any other significant family medical history"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Primary Care Physician */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Primary Care Physician</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Physician Name
              </label>
              <input
                type="text"
                name="primaryCarePhysician"
                value={formData.primaryCarePhysician}
                onChange={handleChange}
                placeholder="Dr. Jane Smith"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Physician Phone
              </label>
              <input
                type="tel"
                name="physicianPhone"
                value={formData.physicianPhone}
                onChange={handleChange}
                placeholder="(239) 555-0100"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Physical Exam Date
              </label>
              <input
                type="date"
                name="lastPhysicalExam"
                value={formData.lastPhysicalExam}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Lifestyle */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Lifestyle</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tobacco Use
              </label>
              <select
                name="smoker"
                value={formData.smoker}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="never">Never</option>
                <option value="former">Former smoker</option>
                <option value="current">Current smoker</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alcohol Use
              </label>
              <select
                name="alcoholUse"
                value={formData.alcoholUse}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="none">None</option>
                <option value="occasional">Occasional (1-2 drinks/week)</option>
                <option value="moderate">Moderate (3-7 drinks/week)</option>
                <option value="heavy">Heavy (8+ drinks/week)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recreational Drug Use
              </label>
              <select
                name="drugUse"
                value={formData.drugUse}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="none">None</option>
                <option value="past">Past use (not current)</option>
                <option value="current">Current use</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exercise Frequency
              </label>
              <select
                name="exerciseFrequency"
                value={formData.exerciseFrequency}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="none">None</option>
                <option value="rarely">Rarely (less than once/week)</option>
                <option value="sometimes">Sometimes (1-2 times/week)</option>
                <option value="often">Often (3-4 times/week)</option>
                <option value="daily">Daily (5+ times/week)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Additional Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Any other medical information we should know?
            </label>
            <textarea
              name="additionalMedicalInfo"
              rows={4}
              value={formData.additionalMedicalInfo}
              onChange={handleChange}
              placeholder="Include anything else about your medical history that may be relevant to your care"
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
            {isLoading ? 'Saving...' : isUpdate ? 'Update Medical History' : 'Submit for Review'}
          </button>
        </div>
      </form>
    </div>
  )
}
