/**
 * Admin Shell Component
 * Main layout wrapper for admin module with profile loading and enhanced navigation
 */

'use client';

import { ReactNode, useEffect, useCallback } from 'react';
import { AdminSidebar } from '../AdminSidebar/AdminSidebar';
import { useAdminProfile } from '@/presentation/hooks/useAdminProfile';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { useAuthStore } from '@/presentation/store/authStore';
import { Spinner } from '@/presentation/components/ui/Spinner';
import { Card } from '@/presentation/components/ui/Card';

interface AdminShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function AdminShell({ children, title, subtitle }: AdminShellProps) {
  const { adminProfile, isLoading, error } = useAdminProfile();
  const { setAdminProfile } = useAuthStore();
  const { isSuperAdmin, isRegularAdmin, isSupport } = usePermissions();

  // Update auth store when admin profile loads - direct call to prevent infinite loop
  useEffect(() => {
    if (adminProfile) {
      setAdminProfile(
        adminProfile.role,
        adminProfile.departments,
        adminProfile.permissions,
        adminProfile.isActive
      );
    }
  }, [adminProfile, setAdminProfile]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading admin profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-auto p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Admin Profile Error</h2>
            <p className="text-gray-600 mb-4">
              Failed to load admin profile. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Refresh Page
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // No admin profile found
  if (!adminProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-auto p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-4">
              You don't have admin privileges or your admin account is not active.
            </p>
            <a
              href="/dashboard"
              className="inline-block px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Back to Dashboard
            </a>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 h-screen z-20">
        <AdminSidebar
          userPermissions={adminProfile.permissions || []}
          userDepartments={adminProfile.departments || []}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Header */}
        {(title || subtitle) && (
          <div className="bg-white border-b border-gray-200 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
                {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
              </div>
              
              {/* Admin Profile Badge */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {adminProfile.firstName} {adminProfile.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{adminProfile.email}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isSuperAdmin ? 'bg-purple-100 text-purple-800' :
                  isRegularAdmin ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {adminProfile.role.replace('_', ' ')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
