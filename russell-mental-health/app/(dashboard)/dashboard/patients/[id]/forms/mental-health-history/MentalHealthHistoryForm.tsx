'use client'

// Client component for Mental Health History Form
// Psychiatric history, therapy/psychiatrist visits, mental health medications

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface MentalHealthHistoryFormProps {
  patientId: string
}

export default function MentalHealthHistoryForm({ patientId }: MentalHealthHistoryFormProps) {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState('')
  const [existingFormId, setExistingFormId] = useState<string | null>(null)
  const [isUpdate, setIsUpdate] = useState(false)
  const [formData, setFormData] = useState({
    // Current Treatment
    currentlyInTherapy: '',
    currentTherapist: '',
    therapistPhone: '',
    seeingPsychiatrist: '',
    psychiatristName: '',
    psychiatristPhone: '',

    // Mental Health Medications
    currentMentalHealthMeds: '',
    pastMentalHealthMeds: '',

    // Previous Diagnoses
    previousDiagnoses: '',
    diagnosedBy: '',

    // Previous Treatment
    previousTherapy: '',
    previousHospitalizations: '',
    previousInpatient: '',

    // Symptoms
    currentSymptoms: '',
    symptomDuration: '',
    symptomsImpactDaily: '',

    // Self-Harm & Safety
    suicidalThoughts: '',
    suicideHistory: '',
    selfHarmHistory: '',

    // Substance Use (Mental Health Related)
    substanceUseHistory: '',
    substanceAbuseTreatment: '',

    // Family Mental Health History
    familyMentalHealthHistory: '',
    familySuicideHistory: '',

    // Current Stressors
    currentStressors: '',
    recentTrauma: '',

    // Goals for Therapy
    therapyGoals: '',
    whatHelpLooksLike: '',

    // Additional Information
    additionalMentalHealthInfo: '',
  })

  // Load existing form data if it exists
  useEffect(() => {
    const loadExistingForm = async () => {
      try {
        setIsFetching(true)

        const response = await fetch(`/api/patients/${patientId}/forms?formType=mental-health-history`)

        if (response.ok) {
          const forms = await response.json()
          const existingForm = forms.find((f: any) => f.formType === 'mental-health-history')

          if (existingForm) {
            setExistingFormId(existingForm.id)
            setIsUpdate(true)

            if (existingForm.formData) {
              setFormData({
                currentlyInTherapy: existingForm.formData.currentlyInTherapy || '',
                currentTherapist: existingForm.formData.currentTherapist || '',
                therapistPhone: existingForm.formData.therapistPhone || '',
                seeingPsychiatrist: existingForm.formData.seeingPsychiatrist || '',
                psychiatristName: existingForm.formData.psychiatristName || '',
                psychiatristPhone: existingForm.formData.psychiatristPhone || '',
                currentMentalHealthMeds: existingForm.formData.currentMentalHealthMeds || '',
                pastMentalHealthMeds: existingForm.formData.pastMentalHealthMeds || '',
                previousDiagnoses: existingForm.formData.previousDiagnoses || '',
                diagnosedBy: existingForm.formData.diagnosedBy || '',
                previousTherapy: existingForm.formData.previousTherapy || '',
                previousHospitalizations: existingForm.formData.previousHospitalizations || '',
                previousInpatient: existingForm.formData.previousInpatient || '',
                currentSymptoms: existingForm.formData.currentSymptoms || '',
                symptomDuration: existingForm.formData.symptomDuration || '',
                symptomsImpactDaily: existingForm.formData.symptomsImpactDaily || '',
                suicidalThoughts: existingForm.formData.suicidalThoughts || '',
                suicideHistory: existingForm.formData.suicideHistory || '',
                selfHarmHistory: existingForm.formData.selfHarmHistory || '',
                substanceUseHistory: existingForm.formData.substanceUseHistory || '',
                substanceAbuseTreatment: existingForm.formData.substanceAbuseTreatment || '',
                familyMentalHealthHistory: existingForm.formData.familyMentalHealthHistory || '',
                familySuicideHistory: existingForm.formData.familySuicideHistory || '',
                currentStressors: existingForm.formData.currentStressors || '',
                recentTrauma: existingForm.formData.recentTrauma || '',
                therapyGoals: existingForm.formData.therapyGoals || '',
                whatHelpLooksLike: existingForm.formData.whatHelpLooksLike || '',
                additionalMentalHealthInfo: existingForm.formData.additionalMentalHealthInfo || '',
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
        formType: 'mental-health-history',
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
          {isUpdate ? 'Update Mental Health History' : 'Mental Health History Form'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {isUpdate
            ? 'Update your mental health history and current treatment information'
            : 'Complete your mental health history and current treatment information'}
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

        {/* Current Treatment */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Current Treatment</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Are you currently in therapy? *
              </label>
              <select
                name="currentlyInTherapy"
                required
                value={formData.currentlyInTherapy}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {formData.currentlyInTherapy === 'yes' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Therapist Name
                  </label>
                  <input
                    type="text"
                    name="currentTherapist"
                    value={formData.currentTherapist}
                    onChange={handleChange}
                    placeholder="Dr. Jane Smith"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Therapist Phone Number
                  </label>
                  <input
                    type="tel"
                    name="therapistPhone"
                    value={formData.therapistPhone}
                    onChange={handleChange}
                    placeholder="(239) 555-0100"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Are you currently seeing a psychiatrist? *
              </label>
              <select
                name="seeingPsychiatrist"
                required
                value={formData.seeingPsychiatrist}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {formData.seeingPsychiatrist === 'yes' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Psychiatrist Name
                  </label>
                  <input
                    type="text"
                    name="psychiatristName"
                    value={formData.psychiatristName}
                    onChange={handleChange}
                    placeholder="Dr. John Doe"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Psychiatrist Phone Number
                  </label>
                  <input
                    type="tel"
                    name="psychiatristPhone"
                    value={formData.psychiatristPhone}
                    onChange={handleChange}
                    placeholder="(239) 555-0200"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mental Health Medications */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Mental Health Medications</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Mental Health Medications
              </label>
              <textarea
                name="currentMentalHealthMeds"
                rows={4}
                value={formData.currentMentalHealthMeds}
                onChange={handleChange}
                placeholder="List all current medications for mental health (include dosage and prescribing doctor)&#10;Example: Sertraline (Zoloft) 50mg daily - Dr. Smith, Buspirone 10mg twice daily - Dr. Johnson"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Past Mental Health Medications (that you no longer take)
              </label>
              <textarea
                name="pastMentalHealthMeds"
                rows={3}
                value={formData.pastMentalHealthMeds}
                onChange={handleChange}
                placeholder="List medications tried in the past and why you stopped (side effects, not effective, etc.)"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Previous Diagnoses */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Previous Mental Health Diagnoses</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Have you been diagnosed with any mental health conditions? *
              </label>
              <textarea
                name="previousDiagnoses"
                rows={4}
                required
                value={formData.previousDiagnoses}
                onChange={handleChange}
                placeholder="List any previous mental health diagnoses (e.g., Depression, Anxiety, PTSD, Bipolar, etc.) or write 'None'"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Who diagnosed you?
              </label>
              <input
                type="text"
                name="diagnosedBy"
                value={formData.diagnosedBy}
                onChange={handleChange}
                placeholder="Psychiatrist, psychologist, therapist, primary care doctor"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Previous Treatment */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Previous Mental Health Treatment</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Previous Therapy/Counseling History
              </label>
              <textarea
                name="previousTherapy"
                rows={4}
                value={formData.previousTherapy}
                onChange={handleChange}
                placeholder="Describe previous therapy experiences (when, with whom, what type of therapy, how long, what was helpful or not helpful)"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Previous Psychiatric Hospitalizations
              </label>
              <textarea
                name="previousHospitalizations"
                rows={3}
                value={formData.previousHospitalizations}
                onChange={handleChange}
                placeholder="List any psychiatric hospital stays (dates, reasons, locations)"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Previous Inpatient or Residential Treatment
              </label>
              <textarea
                name="previousInpatient"
                rows={3}
                value={formData.previousInpatient}
                onChange={handleChange}
                placeholder="List any inpatient, residential, or intensive outpatient programs"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Current Symptoms */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Current Symptoms & Concerns</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What symptoms or concerns are you currently experiencing? *
              </label>
              <textarea
                name="currentSymptoms"
                rows={4}
                required
                value={formData.currentSymptoms}
                onChange={handleChange}
                placeholder="Describe your current symptoms (mood, anxiety, sleep, thoughts, behaviors, etc.)"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How long have you been experiencing these symptoms?
              </label>
              <input
                type="text"
                name="symptomDuration"
                value={formData.symptomDuration}
                onChange={handleChange}
                placeholder="Example: 6 months, 2 years, since childhood"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How do these symptoms impact your daily life?
              </label>
              <textarea
                name="symptomsImpactDaily"
                rows={3}
                value={formData.symptomsImpactDaily}
                onChange={handleChange}
                placeholder="Impact on work, relationships, self-care, activities, etc."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Safety Assessment */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Safety Assessment</h2>
          <p className="mb-4 text-sm text-gray-600">
            Your honest answers help us provide the best care and ensure your safety.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Are you currently experiencing thoughts of suicide? *
              </label>
              <select
                name="suicidalThoughts"
                required
                value={formData.suicidalThoughts}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="no">No</option>
                <option value="sometimes">Sometimes, but no plan</option>
                <option value="yes-with-plan">Yes, with a plan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                History of Suicide Attempts
              </label>
              <textarea
                name="suicideHistory"
                rows={3}
                value={formData.suicideHistory}
                onChange={handleChange}
                placeholder="If applicable, describe any previous suicide attempts (when, method, outcome)"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                History of Self-Harm
              </label>
              <textarea
                name="selfHarmHistory"
                rows={3}
                value={formData.selfHarmHistory}
                onChange={handleChange}
                placeholder="If applicable, describe any history of self-harm behaviors (cutting, burning, etc.)"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Substance Use */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Substance Use History</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                History of Substance Use or Abuse
              </label>
              <textarea
                name="substanceUseHistory"
                rows={4}
                value={formData.substanceUseHistory}
                onChange={handleChange}
                placeholder="Describe any history of alcohol or drug use/abuse (substances used, frequency, duration, impact)"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Previous Substance Abuse Treatment
              </label>
              <textarea
                name="substanceAbuseTreatment"
                rows={3}
                value={formData.substanceAbuseTreatment}
                onChange={handleChange}
                placeholder="List any previous treatment for substance use (rehab, AA/NA, outpatient programs, etc.)"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Family Mental Health History */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Family Mental Health History</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Family History of Mental Illness
              </label>
              <textarea
                name="familyMentalHealthHistory"
                rows={4}
                value={formData.familyMentalHealthHistory}
                onChange={handleChange}
                placeholder="List any mental health conditions in blood relatives (parents, siblings, grandparents, etc.)"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Family History of Suicide
              </label>
              <textarea
                name="familySuicideHistory"
                rows={2}
                value={formData.familySuicideHistory}
                onChange={handleChange}
                placeholder="If applicable, describe any family history of suicide or suicide attempts"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Current Stressors */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Current Stressors & Trauma</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Life Stressors
              </label>
              <textarea
                name="currentStressors"
                rows={4}
                value={formData.currentStressors}
                onChange={handleChange}
                placeholder="Describe current stressors (work, relationships, financial, family, health, etc.)"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recent Trauma or Significant Life Events
              </label>
              <textarea
                name="recentTrauma"
                rows={4}
                value={formData.recentTrauma}
                onChange={handleChange}
                placeholder="Describe any recent traumatic events or major life changes (loss, abuse, accidents, etc.)"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Goals for Therapy */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Goals for Therapy</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What are your goals for therapy? *
              </label>
              <textarea
                name="therapyGoals"
                rows={4}
                required
                value={formData.therapyGoals}
                onChange={handleChange}
                placeholder="What do you hope to achieve through therapy? What would you like to work on?"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What would "feeling better" look like for you?
              </label>
              <textarea
                name="whatHelpLooksLike"
                rows={3}
                value={formData.whatHelpLooksLike}
                onChange={handleChange}
                placeholder="How would you know therapy is working? What would be different in your life?"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Additional Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Is there anything else about your mental health history we should know?
            </label>
            <textarea
              name="additionalMentalHealthInfo"
              rows={4}
              value={formData.additionalMentalHealthInfo}
              onChange={handleChange}
              placeholder="Include anything else that may be relevant to your mental health care"
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
            {isLoading ? 'Saving...' : isUpdate ? 'Update Mental Health History' : 'Submit for Review'}
          </button>
        </div>
      </form>
    </div>
  )
}
