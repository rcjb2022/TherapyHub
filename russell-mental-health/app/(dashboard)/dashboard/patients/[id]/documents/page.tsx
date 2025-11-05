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

  // Only therapists can view patient documents
  if (session.user.role !== 'THERAPIST') {
    redirect('/dashboard')
  }

  // Fetch patient with all forms (submitted, completed, or reviewed)
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      forms: {
        where: {
          status: {
            in: ['SUBMITTED', 'COMPLETED', 'REVIEWED'],
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!patient) {
    notFound()
  }

  // Extract all uploaded documents from forms
  type Document = {
    label: string
    url: string
    formType: string
    uploadedAt: Date
  }

  const documents: {
    insuranceCards: Document[]
    identification: Document[]
    legalDocuments: Document[]
  } = {
    insuranceCards: [],
    identification: [],
    legalDocuments: [],
  }

  patient.forms.forEach((form) => {
    const formData = form.formData as Record<string, any>

    // Insurance cards
    if (formData.insuranceCardFront) {
      documents.insuranceCards.push({
        label: 'Insurance Card - Front',
        url: formData.insuranceCardFront,
        formType: form.formType,
        uploadedAt: form.createdAt,
      })
    }
    if (formData.insuranceCardBack) {
      documents.insuranceCards.push({
        label: 'Insurance Card - Back',
        url: formData.insuranceCardBack,
        formType: form.formType,
        uploadedAt: form.createdAt,
      })
    }

    // Identification documents
    if (formData.idFront) {
      const idType = formData.idType === 'drivers-license' ? "Driver's License" : 'Passport'
      documents.identification.push({
        label: `${idType} - Front`,
        url: formData.idFront,
        formType: form.formType,
        uploadedAt: form.createdAt,
      })
    }
    if (formData.idBack) {
      documents.identification.push({
        label: "Driver's License - Back",
        url: formData.idBack,
        formType: form.formType,
        uploadedAt: form.createdAt,
      })
    }

    // Legal documents
    if (formData.custodyDocument) {
      documents.legalDocuments.push({
        label: 'Judicial Order / Legal Document',
        url: formData.custodyDocument,
        formType: form.formType,
        uploadedAt: form.createdAt,
      })
    }
  })

  const totalDocuments =
    documents.insuranceCards.length + documents.identification.length + documents.legalDocuments.length

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/dashboard/patients/${id}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Patient
        </Link>

        <h1 className="text-3xl font-bold text-gray-900">
          Documents Library - {patient.firstName} {patient.lastName}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {totalDocuments} document{totalDocuments !== 1 ? 's' : ''} uploaded
        </p>
      </div>

      {totalDocuments === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-sm font-semibold text-gray-900">No documents uploaded</h3>
          <p className="mt-2 text-sm text-gray-500">
            Patient hasn't uploaded any documents yet.{' '}
            <Link href={`/dashboard/patients/${id}/forms`} className="text-blue-600 hover:text-blue-700">
              Go to forms
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Insurance Cards */}
          {documents.insuranceCards.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Insurance Cards ({documents.insuranceCards.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.insuranceCards.map((doc) => (
                  <DocumentCard key={doc.url} doc={doc} />
                ))}
              </div>
            </div>
          )}

          {/* Identification Documents */}
          {documents.identification.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Identification Documents ({documents.identification.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.identification.map((doc) => (
                  <DocumentCard key={doc.url} doc={doc} />
                ))}
              </div>
            </div>
          )}

          {/* Legal Documents */}
          {documents.legalDocuments.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Legal Documents ({documents.legalDocuments.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.legalDocuments.map((doc) => (
                  <DocumentCard key={doc.url} doc={doc} />
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
  // Determine if image or PDF based on URL
  const isImage = doc.url.match(/\.(jpg|jpeg|png|gif)(\?|$)/i)
  const isPDF = doc.url.match(/\.pdf(\?|$)/i)

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-3">
        {isImage ? (
          <div className="aspect-video rounded border border-gray-300 overflow-hidden bg-white">
            <img
              src={doc.url}
              alt={doc.label}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
        ) : isPDF ? (
          <div className="aspect-video rounded border border-gray-300 flex items-center justify-center bg-gray-50">
            <DocumentIcon className="h-16 w-16 text-red-600" />
          </div>
        ) : (
          <div className="aspect-video rounded border border-gray-300 flex items-center justify-center bg-gray-50">
            <DocumentIcon className="h-16 w-16 text-gray-400" />
          </div>
        )}
      </div>

      <h3 className="font-semibold text-gray-900 text-sm mb-1">{doc.label}</h3>
      <p className="text-xs text-gray-500 mb-1">
        From: {doc.formType.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
      </p>
      <p className="text-xs text-gray-500 mb-3">Uploaded: {doc.uploadedAt.toLocaleDateString()}</p>

      <a
        href={doc.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full rounded bg-blue-600 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        {isPDF ? 'Open PDF' : 'View Full Size'}
      </a>
    </div>
  )
}
