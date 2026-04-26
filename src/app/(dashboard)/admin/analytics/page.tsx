/**
 * Advanced Analytics Dashboard Page
 * Professional dashboard with real-time metrics, charts, and comprehensive analytics
 */

'use client';

import { useState, useEffect } from 'react';
import { useDashboardMetrics, useActivityStats, useCommunicationStats } from '@/presentation/hooks/useAnalytics';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { Card } from '@/presentation/components/ui/Card';
import { Spinner } from '@/presentation/components/ui/Spinner';

export default function AnalyticsDashboardPage() {
  const { data: metrics, isLoading: isLoadingMetrics } = useDashboardMetrics();
  const { data: activityStats, isLoading: isLoadingActivity } = useActivityStats();
  const { data: communicationStats, isLoading: isLoadingComm } = useCommunicationStats();
  const { isSuperAdmin, isRegularAdmin, isSupport } = usePermissions();

  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('week');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  const isLoading = isLoadingMetrics || isLoadingActivity || isLoadingComm;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando análiticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        {/* Header with Period Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Análiticas</h1>
            <p className="text-gray-600 mt-1">Métricas en tiempo real e insights de rendimiento</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Period Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['today', 'week', 'month', 'year'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    selectedPeriod === period
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>

            {/* Department Filter */}
            {(isSuperAdmin || isRegularAdmin) && (
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                <option value="USER_MANAGEMENT">User Management</option>
                <option value="PROPERTY_MANAGEMENT">Property Management</option>
                <option value="ANALYTICS">Analytics</option>
                <option value="COMMUNICATIONS">Communications</option>
                <option value="FINANCE">Finance</option>
              </select>
            )}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active vs Inactive Users */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.activeUsers || 0}
                </p>
                <div className="mt-2">
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500">Inactive:</span>
                    <span className="ml-1 font-medium text-gray-900">{metrics?.inactiveUsers || 0}</span>
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                ?
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${metrics?.activeUsers && metrics?.inactiveUsers 
                      ? (metrics.activeUsers / (metrics.activeUsers + metrics.inactiveUsers)) * 100 
                      : 0}%` 
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {metrics?.activeUsers && metrics?.inactiveUsers 
                  ? Math.round((metrics.activeUsers / (metrics.activeUsers + metrics.inactiveUsers)) * 100)
                  : 0}% active
              </p>
            </div>
          </Card>

          {/* Chat Usage */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Chat Usage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.chatUsage?.totalMessages || 0}
                </p>
                <div className="mt-2">
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500">Active chats:</span>
                    <span className="ml-1 font-medium text-gray-900">{metrics?.chatUsage?.activeChats || 0}</span>
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                ?
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Avg response: {metrics?.chatUsage?.averageResponseTime || 0}s
            </p>
          </Card>

          {/* Events Generated */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Events Generated</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.eventsGenerated || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                ?
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Total interactions</p>
          </Card>

          {/* Revenue */}
          {(isSuperAdmin || isRegularAdmin) && (
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${metrics?.revenue?.totalRevenue || 0}
                  </p>
                  <div className="mt-2">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500">Monthly:</span>
                      <span className="ml-1 font-medium text-gray-900">${metrics?.revenue?.monthlyRevenue || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-2xl">
                  ?
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Avg: ${metrics?.revenue?.averageOrderValue || 0}
              </p>
            </Card>
          )}
        </div>

        {/* Department Performance */}
        {(isSuperAdmin || isRegularAdmin) && metrics?.departmentPerformance && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Department Performance</h2>
            <div className="space-y-4">
              {Object.entries(metrics.departmentPerformance).map(([dept, perf]) => (
                <div key={dept} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {dept.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <span className="text-sm text-gray-500">{perf.efficiency}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${perf.efficiency}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm text-gray-500">{perf.tasksCompleted} tasks</p>
                    <p className="text-xs text-gray-400">{perf.averageResponseTime}s avg</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Activity Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Activity Overview</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Views</span>
                <span className="font-medium text-gray-900">{activityStats?.totalViews || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Contacts</span>
                <span className="font-medium text-gray-900">{activityStats?.totalContacts || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Messages</span>
                <span className="font-medium text-gray-900">{activityStats?.totalMessages || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Favorites</span>
                <span className="font-medium text-gray-900">{activityStats?.totalFavorites || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Actions</span>
                <span className="font-medium text-orange-600">{activityStats?.pendingActions || 0}</span>
              </div>
            </div>
          </Card>

          {/* Communication Stats */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Communication Metrics</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Sent</span>
                <span className="font-medium text-gray-900">{communicationStats?.totalSent || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Delivery Rate</span>
                <span className="font-medium text-green-600">{communicationStats?.deliveryRate || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Open Rate</span>
                <span className="font-medium text-blue-600">{communicationStats?.openRate || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Click Rate</span>
                <span className="font-medium text-purple-600">{communicationStats?.clickRate || 0}%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Most Viewed Properties */}
        {metrics?.propertyMetrics?.mostViewed && metrics.propertyMetrics.mostViewed.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Most Viewed Properties</h2>
            <div className="space-y-3">
              {metrics.propertyMetrics.mostViewed.map((property, index) => (
                <div key={property.propertyId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{property.title}</p>
                      <p className="text-sm text-gray-500">ID: {property.propertyId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{property.views}</p>
                    <p className="text-sm text-gray-500">views</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
  );
}
