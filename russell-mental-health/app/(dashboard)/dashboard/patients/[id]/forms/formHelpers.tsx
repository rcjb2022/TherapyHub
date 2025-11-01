'use client'

import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

// Define the order of forms that patients need to complete
export const FORM_ORDER = [
  { type: 'patient-information', title: 'Patient Information' },
  { type: 'medical-history', title: 'Medical History' },
  { type: 'mental-health-history', title: 'Mental Health History' },
  { type: 'insurance-information', title: 'Insurance Information' },
  { type: 'hipaa-authorization', title: 'HIPAA Authorization' },
  { type: 'payment-information', title: 'Payment Information' },
]

// Helper to determine next form to complete
export async function determineNextForm(patientId: string) {
  try {
    const response = await fetch(`/api/patients/${patientId}/forms`)
    if (!response.ok) return { next: null, completedCount: 0 }

    const forms = await response.json()
    const completedFormTypes = forms
      .filter((f: any) => f.status === 'SUBMITTED' || f.status === 'COMPLETED')
      .map((f: any) => f.formType)

    const completedCount = completedFormTypes.length

    // Find the next incomplete form
    for (const form of FORM_ORDER) {
      if (!completedFormTypes.includes(form.type)) {
        return { next: form, completedCount }
      }
    }

    // All forms completed
    return { next: null, completedCount }
  } catch (err) {
    console.error('Error determining next form:', err)
    return { next: null, completedCount: 0 }
  }
}

// Shared success message component
interface FormSuccessMessageProps {
  patientId: string
  nextForm: { type: string; title: string } | null
  completedCount: number
}

export function FormSuccessMessage({ patientId, nextForm, completedCount }: FormSuccessMessageProps) {
  const router = useRouter()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-lg border border-green-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-green-100 p-3">
            <CheckCircleIcon className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Thank you!</h2>
          <p className="mb-6 text-lg text-gray-600">Your form has been submitted successfully.</p>

          {/* Progress indicator */}
          <div className="mb-8 w-full max-w-md">
            <div className="mb-2 flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{completedCount} of {FORM_ORDER.length} forms completed</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-green-600 transition-all duration-500"
                style={{ width: `${(completedCount / FORM_ORDER.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Next form button or completion message */}
          {nextForm ? (
            <div className="space-y-3 w-full max-w-md">
              <button
                onClick={() => router.push(`/dashboard/patients/${patientId}/forms/${nextForm.type}`)}
                className="w-full rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors font-medium"
              >
                Next Form: {nextForm.title}
              </button>
              <button
                onClick={() => router.push(`/dashboard/patient`)}
                className="w-full rounded-md border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <div className="space-y-3 w-full max-w-md">
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <p className="text-green-800 font-medium">
                  🎉 All forms completed! Your information has been submitted for review.
                </p>
              </div>
              <button
                onClick={() => router.push(`/dashboard/patient`)}
                className="w-full rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors font-medium"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
