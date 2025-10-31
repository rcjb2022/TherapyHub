// Dashboard Home Page
// Overview and quick stats for therapist

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { UsersIcon, CalendarIcon, ClipboardDocumentCheckIcon, CurrencyDollarIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  // Fetch dashboard statistics
  const stats = await Promise.all([
    prisma.patient.count({ where: { status: 'ACTIVE' } }),
    prisma.appointment.count({
      where: {
        startTime: { gte: new Date() },
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
      },
    }),
    prisma.claim.count({ where: { status: 'PENDING_SUBMISSION' } }),
    prisma.payment.aggregate({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
        status: 'SUCCEEDED',
      },
      _sum: { amount: true },
    }),
    prisma.formSubmission.count({ where: { status: 'SUBMITTED' } }),
  ])

  const [activePatients, upcomingAppointments, pendingClaims, monthlyRevenue, pendingForms] = stats

  const statCards = [
    {
      name: 'Active Patients',
      value: activePatients.toString(),
      icon: UsersIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/dashboard/patients',
    },
    {
      name: 'Upcoming Appointments',
      value: upcomingAppointments.toString(),
      icon: CalendarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/dashboard/calendar',
    },
    {
      name: 'Pending Forms',
      value: pendingForms.toString(),
      icon: DocumentTextIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      href: '/dashboard/pending-forms',
    },
    {
      name: 'Pending Claims',
      value: pendingClaims.toString(),
      icon: ClipboardDocumentCheckIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      href: '/dashboard/claims',
    },
    {
      name: 'Monthly Revenue',
      value: `$${((monthlyRevenue._sum.amount || 0) / 100).toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      href: '/dashboard/billing',
    },
  ]

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to Russell Mental Health practice management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-gray-300 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`rounded-full p-3 ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's Schedule */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h2>
          <p className="text-sm text-gray-600">No appointments scheduled for today</p>
          <button className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            View Calendar
          </button>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <p className="text-sm text-gray-600">No recent activity</p>
          <button className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  )
}
