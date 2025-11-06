// Dashboard Home Page
// Overview and quick stats for therapist

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UsersIcon, CalendarIcon, ClipboardDocumentCheckIcon, CurrencyDollarIcon, DocumentTextIcon, VideoCameraIcon } from '@heroicons/react/24/outline'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Redirect patients to their own dashboard
  if (session.user.role === 'PATIENT') {
    redirect('/dashboard/patient')
  }

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
    // Outstanding balances
    prisma.patient.findMany({
      where: {
        status: 'ACTIVE',
        balance: { gt: 0 },
      },
      select: {
        balance: true,
      },
    }),
  ])

  const [activePatients, upcomingAppointments, pendingClaims, monthlyRevenue, pendingForms, patientsWithBalances] = stats

  // Calculate total outstanding balances
  const totalOutstanding = patientsWithBalances.reduce(
    (sum, p) => sum + Number(p.balance),
    0
  )
  const patientsWithBalanceCount = patientsWithBalances.length

  // Fetch today's appointments (all status: scheduled, cancelled, completed)
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)

  const todaysAppointments = await prisma.appointment.findMany({
    where: {
      startTime: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
    include: {
      patient: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      startTime: 'asc',
    },
  })

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
      name: 'Outstanding Balances',
      value: `$${totalOutstanding.toFixed(2)}`,
      subtitle: `${patientsWithBalanceCount} patients`,
      icon: CurrencyDollarIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      href: '/dashboard/billing',
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
                <p className={`mt-2 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                {'subtitle' in stat && (
                  <p className="mt-1 text-xs text-gray-500">{stat.subtitle}</p>
                )}
              </div>
              <div className={`rounded-full p-3 ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Today's Schedule */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Today's Schedule
            <span className="ml-2 text-sm font-normal text-gray-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </h2>
          <Link
            href="/dashboard/calendar"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View Full Calendar →
          </Link>
        </div>

        {todaysAppointments.length > 0 ? (
          <div className="space-y-3">
            {todaysAppointments.map((apt) => {
              const appointmentTime = new Date(apt.startTime)
              const now = new Date()
              const isPast = appointmentTime < now
              const isCurrent = appointmentTime <= now && new Date(apt.endTime) >= now

              return (
                <div
                  key={apt.id}
                  className={`flex items-center justify-between rounded-lg p-4 border-l-4 ${
                    apt.status === 'CANCELLED'
                      ? 'border-gray-400 bg-gray-50'
                      : isCurrent
                      ? 'border-green-500 bg-green-50'
                      : isPast
                      ? 'border-blue-400 bg-blue-50 opacity-60'
                      : 'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {appointmentTime.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          timeZone: 'America/New_York',
                        })}
                      </p>
                      <span className="text-xs text-gray-500">•</span>
                      <p className="text-sm font-medium text-gray-900">
                        {apt.patient.firstName} {apt.patient.lastName}
                      </p>
                      {isCurrent && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          In Session
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {apt.appointmentType.replace(/_/g, ' ')} • {apt.duration} min
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {apt.status === 'CANCELLED' ? (
                      <span className="text-xs font-medium text-gray-500">Cancelled</span>
                    ) : apt.googleMeetLink && !isPast ? (
                      <a
                        href={apt.googleMeetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                      >
                        <VideoCameraIcon className="h-4 w-4" />
                        Join Session
                      </a>
                    ) : isPast && apt.status !== 'COMPLETED' ? (
                      <span className="text-xs font-medium text-gray-500">Past</span>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">No appointments scheduled for today</p>
            <Link
              href="/dashboard/calendar"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Schedule Appointment
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
