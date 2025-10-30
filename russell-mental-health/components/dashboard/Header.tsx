'use client'

// Dashboard Header Component
// Top header with user info and logout

import { signOut } from 'next-auth/react'
import { ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline'

interface HeaderProps {
  user: {
    name: string
    email: string
    role: string
  }
}

export default function DashboardHeader({ user }: HeaderProps) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Page Title / Breadcrumb (can be dynamic later) */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Welcome back, {user.name?.split(' ')[0] || 'Doctor'}!</h2>
      </div>

      {/* User Menu */}
      <div className="flex items-center gap-4">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.role}</p>
          </div>
          <UserCircleIcon className="h-10 w-10 text-gray-400" />
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </header>
  )
}
