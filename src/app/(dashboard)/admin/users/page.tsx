'use client';

import { useState } from 'react';
import { useUsers, useToggleUserStatus, useUserById, useChangeUserRole } from '@/presentation/hooks/useAdmin';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Modal } from '@/presentation/components/ui/Modal';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { AdminTable } from '@/presentation/components/admin/AdminTable/AdminTable';
import { AdminFilters } from '@/presentation/components/admin/AdminFilters/AdminFilters';
import { LoadingState, EmptyState, ErrorState } from '@/presentation/components/admin/AdminUIStates';
import { UserListItem, ChangeUserRoleRequest } from '@/core/domain/entities/Admin';

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<"ADMIN" | "USER" | "AGENT" | "DEVELOPER" | "">('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedUsers, setSelectedUsers] = useState<UserListItem[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [toggleReason, setToggleReason] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const { hasPermission } = usePermissions();
  const canManageUsers = hasPermission('USERS_UPDATE');
  const canDeleteUsers = hasPermission('USERS_DELETE');
  const canChangeRoles = hasPermission('USERS_CHANGE_ROLE');

  const enabledParam = statusFilter === 'enabled' ? true : statusFilter === 'disabled' ? false : undefined;

  const { data: usersData, isLoading, error, refetch } = useUsers(
    roleFilter || undefined,
    enabledParam,
    searchQuery || undefined,
    { page: currentPage - 1, size: pageSize }
  );

  const toggleStatusMutation = useToggleUserStatus();
  const changeRoleMutation = useChangeUserRole();

  const handleViewUser = (user: UserListItem) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleToggleStatus = async (user: UserListItem) => {
    setSelectedUser(user);
    setSelectedUserId(user.id);
    setIsToggleModalOpen(true);
  };

  const handleChangeRole = async (user: UserListItem) => {
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  };

  const confirmRoleChange = async (newRole: string, reason: string) => {
    if (!selectedUser) return;

    await changeRoleMutation.mutateAsync({
      userId: selectedUser.id,
      request: {
        newRole: newRole as any,
        reason
      }
    });
    setIsRoleModalOpen(false);
    setSelectedUser(null);
    refetch();
  };

  const confirmToggleStatus = async () => {
    if (!selectedUserId) return;

    await toggleStatusMutation.mutateAsync({
      userId: selectedUserId,
      enabled: !selectedUser?.enabled,
      reason: toggleReason || undefined,
    });

    setIsToggleModalOpen(false);
    setToggleReason('');
    setSelectedUserId(null);
    setSelectedUser(null);
    refetch();
  };

  // Table columns
  const columns = [
    {
      key: 'email' as keyof UserListItem,
      label: 'Email',
      sortable: true,
      render: (value: string, user: UserListItem) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{user.firstName} {user.lastName}</div>
        </div>
      )
    },
    {
      key: 'role' as keyof UserListItem,
      label: 'Role',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
          value === 'AGENT' ? 'bg-blue-100 text-blue-800' :
          value === 'DEVELOPER' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'enabled' as keyof UserListItem,
      label: 'Status',
      sortable: true,
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Active' : 'Disabled'}
        </span>
      )
    },
    {
      key: 'emailVerified' as keyof UserListItem,
      label: 'Verified',
      render: (value: boolean, user: UserListItem) => (
        <div className="space-y-1">
          <div className={`text-xs ${user.emailVerified ? 'text-green-600' : 'text-gray-400'}`}>
            {user.emailVerified ? '✓ Email' : '✗ Email'}
          </div>
          <div className={`text-xs ${user.phoneVerified ? 'text-green-600' : 'text-gray-400'}`}>
            {user.phoneVerified ? '✓ Phone' : '✗ Phone'}
          </div>
        </div>
      )
    },
    {
      key: 'publishedPropertiesCount' as keyof UserListItem,
      label: 'Properties',
      sortable: true,
      render: (value: number) => value || 0
    },
    {
      key: 'lastLoginAt' as keyof UserListItem,
      label: 'Last Login',
      sortable: true,
      render: (value: Date) => value ? new Date(value).toLocaleDateString() : 'Never'
    }
  ];

  // Table actions
  const actions = [
    {
      label: 'View',
      onClick: handleViewUser,
      variant: 'primary' as const
    },
    ...(canManageUsers ? [{
      label: 'Toggle Status',
      onClick: handleToggleStatus,
      variant: 'secondary' as const
    }] : []),
    ...(canChangeRoles ? [{
      label: 'Change Role',
      onClick: handleChangeRole,
      variant: 'secondary' as const
    }] : [])
  ];

  // Filter options
  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'enabled', label: 'Active' },
        { value: 'disabled', label: 'Disabled' }
      ]
    },
    {
      key: 'role',
      label: 'Role',
      type: 'select' as const,
      options: [
        { value: '', label: 'All Roles' },
        { value: 'USER', label: 'User' },
        { value: 'AGENT', label: 'Agent' },
        { value: 'DEVELOPER', label: 'Developer' },
        { value: 'ADMIN', label: 'Admin' }
      ]
    }
  ];

  const handleFilterChange = (filters: Record<string, any>) => {
    if (filters.status !== undefined) {
      setStatusFilter(filters.status);
    }
    if (filters.role !== undefined) {
      setRoleFilter(filters.role);
    }
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setRoleFilter('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
        </div>
      </div>

      {/* Filters */}
      <AdminFilters
        searchPlaceholder="Search by email, name, or DNI..."
        onSearchChange={setSearchQuery}
        onFilterChange={handleFilterChange}
        filters={filterOptions}
        onClear={handleClearFilters}
      />

      {/* Users Table */}
      <AdminTable
        data={usersData?.content || []}
        columns={columns}
        loading={isLoading}
        error={error?.message}
        actions={actions}
        selection={{
          selectedItems: selectedUsers,
          onSelectionChange: setSelectedUsers,
          getRowId: (user) => user.id
        }}
        pagination={
          usersData && {
            page: currentPage,
            size: pageSize,
            total: usersData.totalElements,
            onPageChange: setCurrentPage,
            onSizeChange: setPageSize
          }
        }
        emptyState={{
          title: 'No users found',
          description: 'Try adjusting your search or filter criteria.',
          action: {
            label: 'Clear Filters',
            onClick: handleClearFilters
          }
        }}
      />

      {/* User Details Modal */}
      {selectedUser && (
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">User Details</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                <div className="space-y-2">
                  <div><strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}</div>
                  <div><strong>Email:</strong> {selectedUser.email}</div>
                  <div><strong>Phone:</strong> {selectedUser.phone}</div>
                  <div><strong>DNI:</strong> {selectedUser.dni}</div>
                  <div><strong>Role:</strong> {selectedUser.role}</div>
                  <div><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      selectedUser.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedUser.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Activity</h4>
                <div className="space-y-2">
                  <div><strong>Properties:</strong> {selectedUser.publishedPropertiesCount}</div>
                  <div><strong>City:</strong> {selectedUser.city || 'Not specified'}</div>
                  <div><strong>Country:</strong> {selectedUser.country || 'Not specified'}</div>
                  <div><strong>Email Verified:</strong> 
                    <span className={`ml-2 ${selectedUser.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedUser.emailVerified ? '✓ Verified' : '✗ Not Verified'}
                    </span>
                  </div>
                  <div><strong>Phone Verified:</strong> 
                    <span className={`ml-2 ${selectedUser.phoneVerified ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedUser.phoneVerified ? '✓ Verified' : '✗ Not Verified'}
                    </span>
                  </div>
                  <div><strong>Last Login:</strong> 
                    {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : 'Never'}
                  </div>
                  <div><strong>Member Since:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Role Change Modal */}
      {selectedUser && (
        <Modal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)}>
          <RoleChangeModal
            user={selectedUser}
            onConfirm={confirmRoleChange}
            onCancel={() => setIsRoleModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}

// Role Change Modal Component
interface RoleChangeModalProps {
  user: UserListItem;
  onConfirm: (newRole: string, reason: string) => void;
  onCancel: () => void;
}

function RoleChangeModal({ user, onConfirm, onCancel }: RoleChangeModalProps) {
  const [newRole, setNewRole] = useState<"ADMIN" | "USER" | "AGENT" | "DEVELOPER">(user.role as "ADMIN" | "USER" | "AGENT" | "DEVELOPER");
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRole !== user.role && reason.trim()) {
      onConfirm(newRole, reason.trim());
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-md w-full">
      <h3 className="text-lg font-semibold mb-4">Change User Role</h3>
      
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">
          Changing role for: <strong>{user.firstName} {user.lastName}</strong> ({user.email})
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as "ADMIN" | "USER" | "AGENT" | "DEVELOPER")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="USER">User</option>
              <option value="AGENT">Agent</option>
              <option value="DEVELOPER">Developer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Reason for role change..."
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={newRole === user.role || !reason.trim()}>
              Change Role
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
