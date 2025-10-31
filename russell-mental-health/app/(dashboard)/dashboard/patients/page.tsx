// Patient List Page
// View and search all patients

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import PatientTable from '@/components/dashboard/PatientTable'

interface SearchParams {
  search?: string
  status?: string
}

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  // Get the therapist's ID
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { therapist: true },
  })

  if (!user?.therapist) {
    return <div>Therapist profile not found</div>
  }

  // Build search query
  const searchQuery = params.search || ''
  const statusFilter = params.status || 'ACTIVE'

  // Fetch patients with search and filter
  const patients = await prisma.patient.findMany({
    where: {
      therapistId: user.therapist.id,
      status: statusFilter as any,
      ...(searchQuery
        ? {
            OR: [
              { firstName: { contains: searchQuery, mode: 'insensitive' } },
              { lastName: { contains: searchQuery, mode: 'insensitive' } },
              { email: { contains: searchQuery, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your patient roster and records
          </p>
        </div>
        <Link
          href="/dashboard/patients/new"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          Add Patient
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <form method="get" className="flex gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search by name or email..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            name="status"
            defaultValue={statusFilter}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="DISCHARGED">Discharged</option>
          </select>

          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Search
          </button>
        </form>
      </div>

      {/* Patient Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Found {patients.length} patient{patients.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Patient Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {patients.length > 0 ? (
          <PatientTable patients={patients} />
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-600">No patients found</p>
            <Link
              href="/dashboard/patients/new"
              className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Add your first patient
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
