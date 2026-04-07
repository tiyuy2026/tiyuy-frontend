/**
 * Admin Dashboard Page
 * Main entry point for admin module with overview stats
 * Features are conditionally shown based on admin role (SUPER_ADMIN, ADMIN, SUPPORT)
 */

'use client';

import { useDashboardStats, useUserStats, useFinanceStats } from '@/presentation/hooks/useAdmin';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { Card } from '@/presentation/components/ui/Card';
import { Spinner } from '@/presentation/components/ui/Spinner';

export default function AdminDashboardPage() {
  const { isSuperAdmin, isRegularAdmin, isSupport, adminRoleType } = usePermissions();
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();
  const { data: userStats, isLoading: userStatsLoading } = useUserStats();

  // Datos estáticos para mostrar siempre
  const stats = {
    totalUsers: 0,
    newUsersToday: 0,
    totalProperties: 0,
    publishedProperties: 0,
    totalProjects: 0,
    activeCampaigns: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! You are logged in as <span className="font-semibold">{adminRoleType}</span>
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalUsers.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
              ?
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            +{stats.newUsersToday} today
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Properties</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalProperties.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
              ?
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {stats.publishedProperties} published
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Projects</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalProjects.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
              🏗️
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {dashboardStats?.activeProjects || 0} active
          </p>
        </Card>

        {/* Only SUPER_ADMIN and ADMIN can see revenue, SUPPORT cannot */}
        {!isSupport && (
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Revenue (Month)</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${dashboardStats?.revenueThisMonth?.toLocaleString() || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-2xl">
                💰
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {dashboardStats?.paymentsToday || 0} payments today
            </p>
          </Card>
        )}
      </div>

      {/* SUPER_ADMIN specific: Manage Admins button */}
      {isSuperAdmin && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-purple-900">Super Admin Controls</h3>
              <p className="text-purple-700 text-sm">Manage other administrators and their permissions</p>
            </div>
            <a
              href="/admin/admins"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Manage Admins
            </a>
          </div>
        </div>
      )}

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution - visible to all admin roles */}
        {dashboardStats?.usersByRole && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Role</h3>
            <div className="space-y-3">
              {Object.entries(dashboardStats?.usersByRole || {}).map(([role, count]: [string, number]) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="text-gray-600 capitalize">{role.toLowerCase()}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${((count || 0) / (dashboardStats?.totalUsers || 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {count || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Property Status - visible to all admin roles */}
        {dashboardStats?.propertiesByStatus && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Properties by Status</h3>
            <div className="space-y-3">
              {Object.entries(dashboardStats?.propertiesByStatus || {}).map(([status, count]: [string, number]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-gray-600 capitalize">{status.toLowerCase()}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{
                          width: `${((count || 0) / (dashboardStats?.totalProperties || 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {count || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Pending Actions - only for SUPER_ADMIN and ADMIN */}
      {!isSupport && dashboardStats?.pendingReports && dashboardStats.pendingReports > 0 && (
        <Card className="p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-2xl">
                ⚠️
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Pending Reports</h3>
                <p className="text-gray-600">
                  {dashboardStats?.pendingReports || 0} reports require review
                </p>
              </div>
            </div>
            <a
              href="/admin/reports"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              View Reports
            </a>
          </div>
        </Card>
      )}

      {/* Footer timestamp */}
      {dashboardStats?.generatedAt && (
        <p className="text-sm text-gray-400 text-right">
          Last updated: {new Date(dashboardStats?.generatedAt || new Date()).toLocaleString()}
        </p>
      )}
    </div>
  );
}
