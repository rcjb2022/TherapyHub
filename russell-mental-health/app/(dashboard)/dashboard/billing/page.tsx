// Therapist Billing Page
// View all patient balances, quick charge, and payment history

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CurrencyDollarIcon, UsersIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default async function TherapistBillingPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Only therapists can access this page
  if (session.user.role !== 'THERAPIST') {
    redirect('/dashboard')
  }

  // Get therapist data
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      therapist: {
        include: {
          patients: {
            where: {
              status: 'ACTIVE',
            },
            orderBy: {
              balance: 'desc',
            },
            include: {
              forms: {
                where: {
                  formType: 'payment-information',
                  status: {
                    in: ['SUBMITTED', 'COMPLETED'],
                  },
                },
                orderBy: {
                  updatedAt: 'desc',
                },
                take: 1,
              },
              transactions: {
                where: {
                  status: 'failed',
                },
                orderBy: {
                  createdAt: 'desc',
                },
                take: 1,
              },
            },
          },
        },
      },
    },
  })

  if (!user?.therapist) {
    redirect('/dashboard')
  }

  const therapist = user.therapist

  // Calculate statistics
  const allPatients = therapist.patients
  const patientsWithBalance = allPatients.filter((p) => Number(p.balance) > 0)
  const totalOutstanding = patientsWithBalance.reduce(
    (sum, p) => sum + Number(p.balance),
    0
  )
  const patientsWithFailedCharges = allPatients.filter(
    (p) => p.transactions.length > 0
  ).length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing & Outstanding Balances</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage patient billing and view payment history
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
              <p className="mt-2 text-3xl font-bold text-red-600">
                ${totalOutstanding.toFixed(2)}
              </p>
            </div>
            <div className="rounded-full bg-red-50 p-3">
              <CurrencyDollarIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Patients with Balances</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {patientsWithBalance.length}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                of {allPatients.length} total patients
              </p>
            </div>
            <div className="rounded-full bg-blue-50 p-3">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed Charges</p>
              <p className="mt-2 text-3xl font-bold text-yellow-600">
                {patientsWithFailedCharges}
              </p>
              <p className="mt-1 text-xs text-gray-500">Need retry</p>
            </div>
            <div className="rounded-full bg-yellow-50 p-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Patients with Outstanding Balances */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">
          Outstanding Balances
          {patientsWithBalance.length > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
              {patientsWithBalance.length} patients
            </span>
          )}
        </h2>

        {patientsWithBalance.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-sm text-gray-600">
              No outstanding balances. All patients are paid up! ✓
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Patient Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Balance
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Card on File
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {patientsWithBalance.map((patient) => {
                  const hasPaymentMethod = patient.forms.length > 0
                  const cardLast4 = hasPaymentMethod
                    ? ((patient.forms[0].formData as any)?.cardLast4 || '')
                    : ''
                  const hasFailed = patient.transactions.length > 0

                  return (
                    <tr key={patient.id} className={hasFailed ? 'bg-yellow-50/30' : ''}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Link
                          href={`/dashboard/patients/${patient.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          {patient.firstName} {patient.lastName}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-red-600">
                        ${Number(patient.balance).toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {hasPaymentMethod ? (
                          `•••• ${cardLast4}`
                        ) : (
                          <span className="text-yellow-600">No card</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {hasFailed ? (
                          <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                            Failed Charge
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <Link
                          href={`/dashboard/patients/${patient.id}#billing`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          View / Charge
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* All Patients (Even Zero Balance) */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">
          All Patients
          <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            {allPatients.length} total
          </span>
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Patient Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Balance
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Card on File
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {allPatients.map((patient) => {
                const hasPaymentMethod = patient.forms.length > 0
                const cardLast4 = hasPaymentMethod
                  ? ((patient.forms[0].formData as any)?.cardLast4 || '')
                  : ''

                return (
                  <tr key={patient.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <Link
                        href={`/dashboard/patients/${patient.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        {patient.firstName} {patient.lastName}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`font-semibold ${Number(patient.balance) > 0 ? 'text-red-600' : 'text-green-600'}`}
                      >
                        ${Number(patient.balance).toFixed(2)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {hasPaymentMethod ? (
                        `•••• ${cardLast4}`
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <Link
                        href={`/dashboard/patients/${patient.id}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
