/**
 * Audit and Traceability Page
 * Comprehensive audit log viewer for tracking admin actions, discount usage, and campaign changes
 */

'use client';

import { useState } from 'react';
import { useAuditLogs, useAuditLogsByAction, useAuditLogsByDepartment, useAuditLogsByDateRange } from '@/presentation/hooks/useAnalytics';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { Card } from '@/presentation/components/ui/Card';
import { Spinner } from '@/presentation/components/ui/Spinner';
import { GitHubShell } from '@/presentation/components/admin/AdminShell/AdminShell';
import { format } from 'date-fns';
import { AuditLogEntry, AuditLogFilters } from '@/core/domain/entities/Analytics';

export default function AuditPage() {
  const { data: auditLogs, isLoading, error } = useAuditLogs();
  const { isSuperAdmin, isRegularAdmin, isSupport } = usePermissions();

  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 0,
    size: 20,
  });

  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  // Get filtered logs based on selected filters
  const { data: filteredLogs } = useAuditLogs(filters);

  const handleFilterChange = (newFilters: Partial<AuditLogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 0 }));
  };

  const handleActionFilter = (action: string) => {
    if (action === selectedAction) {
      setSelectedAction('');
      handleFilterChange({ action: undefined });
    } else {
      setSelectedAction(action);
      handleFilterChange({ action });
    }
  };

  const handleDepartmentFilter = (department: string) => {
    if (department === selectedDepartment) {
      setSelectedDepartment('');
      handleFilterChange({ department: undefined });
    } else {
      setSelectedDepartment(department);
      handleFilterChange({ department });
    }
  };

  const handleDateRangeFilter = () => {
    if (dateRange.start && dateRange.end) {
      handleFilterChange({ startDate: dateRange.start, endDate: dateRange.end });
    }
  };

  const clearFilters = () => {
    setFilters({ page: 0, size: 20 });
    setSelectedAction('');
    setSelectedDepartment('');
    setDateRange({ start: '', end: '' });
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return '??';
      case 'update': return '??';
      case 'delete': return '??';
      case 'login': return '??';
      case 'logout': return '??';
      default: return '??';
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return 'text-green-600 bg-green-100';
      case 'update': return 'text-blue-600 bg-blue-100';
      case 'delete': return 'text-red-600 bg-red-100';
      case 'login': return 'text-purple-600 bg-purple-100';
      case 'logout': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case 'USER_MANAGEMENT': return 'text-blue-600 bg-blue-100';
      case 'PROPERTY_MANAGEMENT': return 'text-green-600 bg-green-100';
      case 'ANALYTICS': return 'text-purple-600 bg-purple-100';
      case 'COMMUNICATIONS': return 'text-orange-600 bg-orange-100';
      case 'FINANCE': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <GitHubShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading audit logs...</p>
          </div>
        </div>
      </GitHubShell>
    );
  }

  if (error) {
    return (
      <GitHubShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">?</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Audit Logs</h2>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        </div>
      </GitHubShell>
    );
  }

  return (
    <GitHubShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit & Traceability</h1>
          <p className="text-gray-600 mt-1">Track admin actions, discount usage, and system changes</p>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Action Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
              <div className="flex flex-wrap gap-2">
                {['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'].map((action) => (
                  <button
                    key={action}
                    onClick={() => handleActionFilter(action)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedAction === action
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {/* Department Filter */}
            {(isSuperAdmin || isRegularAdmin) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <div className="flex flex-wrap gap-2">
                  {['USER_MANAGEMENT', 'PROPERTY_MANAGEMENT', 'ANALYTICS', 'COMMUNICATIONS', 'FINANCE'].map((dept) => (
                    <button
                      key={dept}
                      onClick={() => handleDepartmentFilter(dept)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedDepartment === dept
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {dept.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="datetime-local"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleDateRangeFilter}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </Card>

        {/* Active Filters Display */}
        {(selectedAction || selectedDepartment || dateRange.start) && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Active filters:</span>
            {selectedAction && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                Action: {selectedAction}
              </span>
            )}
            {selectedDepartment && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                Department: {selectedDepartment.replace('_', ' ')}
              </span>
            )}
            {dateRange.start && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                Date Range
              </span>
            )}
          </div>
        )}

        {/* Audit Logs Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Audit Logs</h2>
            <div className="text-sm text-gray-500">
              {filteredLogs?.totalElements || 0} total entries
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs?.content?.map((log: AuditLogEntry) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                          {log.adminName.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{log.adminName}</div>
                          <div className="text-xs text-gray-500">ID: {log.adminId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        <span className="mr-1">{getActionIcon(log.action)}</span>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{log.entityName}</div>
                        <div className="text-xs text-gray-500">{log.entityType} (ID: {log.entityId})</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDepartmentColor(log.department)}`}>
                        {log.department.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs">
                        {(log.oldValue || log.newValue) && (
                          <div className="space-y-1">
                            {log.oldValue && (
                              <div>
                                <span className="text-xs text-gray-500">Before:</span>
                                <div className="text-xs bg-red-50 text-red-700 p-1 rounded">{log.oldValue}</div>
                              </div>
                            )}
                            {log.newValue && (
                              <div>
                                <span className="text-xs text-gray-500">After:</span>
                                <div className="text-xs bg-green-50 text-green-700 p-1 rounded">{log.newValue}</div>
                              </div>
                            )}
                          </div>
                        )}
                        {!log.oldValue && !log.newValue && (
                          <span className="text-gray-400">No changes</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredLogs && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {filteredLogs.content.length} of {filteredLogs.totalElements} results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFilterChange({ page: Math.max(0, filters.page! - 1) })}
                  disabled={filters.page === 0}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {filters.page! + 1}
                </span>
                <button
                  onClick={() => handleFilterChange({ page: (filters.page! + 1) })}
                  disabled={!filteredLogs.content.length || filteredLogs.content.length < filters.size!}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </GitHubShell>
  );
}
