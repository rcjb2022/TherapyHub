// Patient Documents Library Page
// Centralized view of all uploaded documents for a specific patient

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, DocumentIcon } from '@heroicons/react/24/outline'

export default async function PatientDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Await params (Next.js 15+ requirement)
  const { id } = await params

  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Get therapist
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { therapist: true },
  })

  if (!user?.therapist) {
    return <div>Therapist not found</div>
  }

  // Fetch patient and all completed forms
  const patient = await prisma.patient.findFirst({
    where: {
      id: id,
      therapistId: user.therapist.id,
    },
    include: {
      forms: {
        where: {
          status: {
            in: ['SUBMITTED', 'COMPLETED'],
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!patient) {
    notFound()
  }

  // Extract uploaded documents from form data
  interface DocumentItem {
    label: string
    url: string
    formType: string
    uploadedAt: Date
  }

  const documents: {
    insuranceCards: DocumentItem[]
    identification: DocumentItem[]
    legalDocuments: DocumentItem[]
  } = {
    insuranceCards: [],
    identification: [],
    legalDocuments: [],
  }

  patient.forms.forEach((form) => {
    const formData = form.formData as any

    // Insurance Cards
    if (form.formType === 'insurance-information') {
      if (formData.insuranceCardFrontUploaded) {
        documents.insuranceCards.push({
          label: 'Insurance Card (Front)',
          url: formData.insuranceCardFrontUploaded,
          formType: 'Insurance Information',
          uploadedAt: form.updatedAt,
        })
      }
      if (formData.insuranceCardBackUploaded) {
        documents.insuranceCards.push({
          label: 'Insurance Card (Back)',
          url: formData.insuranceCardBackUploaded,
          formType: 'Insurance Information',
          uploadedAt: form.updatedAt,
        })
      }
    }

    // Identification Documents
    if (form.formType === 'patient-information') {
      if (formData.idFrontUrl) {
        const idTypeLabel = formData.idType === 'passport' ? 'Passport' : 'ID (Front)'
        documents.identification.push({
          label: idTypeLabel,
          url: formData.idFrontUrl,
          formType: 'Patient Information',
          uploadedAt: form.updatedAt,
        })
      }
      if (formData.idBackUrl) {
        documents.identification.push({
          label: 'ID (Back)',
          url: formData.idBackUrl,
          formType: 'Patient Information',
          uploadedAt: form.updatedAt,
        })
      }
    }

    // Legal Documents
    if (form.formType === 'parental-consent') {
      if (formData.custodyDocumentUrl) {
        documents.legalDocuments.push({
          label: 'Custody Document / Judicial Order',
          url: formData.custodyDocumentUrl,
          formType: 'Parental Consent',
          uploadedAt: form.updatedAt,
        })
      }
    }
  })

  const totalDocuments =
    documents.insuranceCards.length + documents.identification.length + documents.legalDocuments.length

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/dashboard/patients/${id}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Patient
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {patient.firstName} {patient.lastName} - Document Library
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              View all uploaded documents for this patient
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 px-4 py-2 border border-blue-200">
            <p className="text-sm font-medium text-blue-900">
              {totalDocuments} {totalDocuments === 1 ? 'Document' : 'Documents'}
            </p>
          </div>
        </div>
      </div>

      {totalDocuments === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 shadow-sm text-center">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h3>
          <p className="text-sm text-gray-600 mb-4">
            This patient hasn't uploaded any documents yet. Documents are uploaded through intake forms.
          </p>
          <Link
            href={`/dashboard/patients/${id}/forms`}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            View Forms
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Insurance Cards */}
          {documents.insuranceCards.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  {documents.insuranceCards.length}
                </span>
                Insurance Cards
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.insuranceCards.map((doc, index) => (
                  <DocumentCard key={index} doc={doc} />
                ))}
              </div>
            </div>
          )}

          {/* Identification Documents */}
          {documents.identification.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                  {documents.identification.length}
                </span>
                Identification Documents
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.identification.map((doc, index) => (
                  <DocumentCard key={index} doc={doc} />
                ))}
              </div>
            </div>
          )}

          {/* Legal Documents */}
          {documents.legalDocuments.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                  {documents.legalDocuments.length}
                </span>
                Legal Documents
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.legalDocuments.map((doc, index) => (
                  <DocumentCard key={index} doc={doc} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Document Card Component
function DocumentCard({ doc }: { doc: { label: string; url: string; formType: string; uploadedAt: Date } }) {
  // Handle both GCS URLs and legacy base64 data URLs
  const isBase64 = doc.url.startsWith('data:')
  const isImage = isBase64
    ? doc.url.startsWith('data:image/')
    : doc.url.match(/\.(jpg|jpeg|png|gif)$/i)
  const isPDF = isBase64
    ? doc.url.startsWith('data:application/pdf')
    : doc.url.match(/\.pdf$/i)

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 hover:border-blue-300 hover:shadow-md transition-all">
      <div className="mb-3">
        {isImage ? (
          <div className="aspect-video rounded border border-gray-300 overflow-hidden bg-white">
            <img src={doc.url} alt={doc.label} className="w-full h-full object-contain" />
          </div>
        ) : isPDF ? (
          <div className="aspect-video rounded border border-gray-300 overflow-hidden bg-white flex items-center justify-center">
            <DocumentIcon className="w-16 h-16 text-red-500" />
          </div>
        ) : null}
      </div>
      <div className="space-y-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{doc.label}</h3>
          <p className="text-xs text-gray-600">{doc.formType}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {new Date(doc.uploadedAt).toLocaleDateString()}
          </p>
          {isPDF && (
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Open PDF
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
