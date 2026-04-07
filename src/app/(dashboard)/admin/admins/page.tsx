/**
 * Admin Users Management Page
 * Only SUPER_ADMIN can create new admin users
 * Admin users can view the list if they have ADMINS_VIEW permission
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  useAdmins, 
  useCreateAdmin, 
  useDeleteAdmin,
} from '@/presentation/hooks/useAdmin';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Spinner } from '@/presentation/components/ui/Spinner';
import { Modal } from '@/presentation/components/ui/Modal';
import { useAuthStore } from '@/presentation/store/authStore';
import { AdminRoleType, Permission } from '@/core/domain/entities/Admin';

// Available permissions organized by department
const PERMISSIONS_BY_DEPT: Record<string, Permission[]> = {
  'User Management': [
    'USERS_VIEW', 'USERS_CREATE', 'USERS_UPDATE', 'USERS_DELETE', 
    'USERS_CHANGE_ROLE', 'USERS_VERIFY'
  ],
  'Property Management': [
    'PROPERTIES_VIEW', 'PROPERTIES_MODERATE', 'PROPERTIES_DELETE', 'PROPERTIES_FEATURE',
    'PROJECTS_VIEW', 'PROJECTS_MODERATE', 'PROJECTS_DELETE'
  ],
  'Finance': [
    'FINANCE_VIEW', 'FINANCE_MANAGE_SUBSCRIPTIONS', 'FINANCE_REFUNDS',
    'DISCOUNTS_CREATE', 'DISCOUNTS_MANAGE'
  ],
  'Analytics': [
    'ANALYTICS_VIEW', 'ANALYTICS_EXPORT', 'ANALYTICS_DASHBOARD',
    'AUDIT_LOGS_VIEW'
  ],
  'Communications': [
    'COMMUNICATIONS_VIEW', 'COMMUNICATIONS_MANAGE', 'EVENTS_VIEW', 'CHAT_MONITOR',
    'NOTIFICATIONS_SEND'
  ],
  'Admin Management': [
    'ADMINS_VIEW', 'ADMINS_CREATE', 'ADMINS_UPDATE', 'ADMINS_DELETE', 'DEPARTMENTS_MANAGE'
  ],
};

const DEPARTMENT_OPTIONS = [
  'USER_MANAGEMENT',
  'PROPERTY_MANAGEMENT', 
  'FINANCE',
  'ANALYTICS',
  'COMMUNICATIONS'
];

export default function AdminUsersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: adminsData, isLoading } = useAdmins({ page: 0, size: 50 });
  const createAdmin = useCreateAdmin();
  const deleteAdmin = useDeleteAdmin();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'ADMIN' as AdminRoleType,
    departments: [] as string[],
    permissions: [] as Permission[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if current user is SUPER_ADMIN
  // For now, we check if role is ADMIN and assume SUPER_ADMIN if they can see this page
  // In production, you'd load the admin profile to check the actual admin role
  const isSuperAdmin = user?.role === 'ADMIN'; // Simplified check

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.departments.length === 0) {
      newErrors.departments = 'At least one department is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      await createAdmin.mutateAsync({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        role: formData.role,
        departmentIds: formData.departments.map((_, i) => i + 1), // Map to IDs
        permissionIds: formData.permissions,
      });
      setIsCreateModalOpen(false);
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        role: 'ADMIN',
        departments: [],
        permissions: [],
      });
    } catch (error) {
      console.error('Error creating admin:', error);
    }
  };

  const handleDelete = async (adminId: number) => {
    if (!confirm('Are you sure you want to remove this admin?')) return;
    await deleteAdmin.mutateAsync(adminId);
  };

  const toggleDepartment = (dept: string) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.includes(dept)
        ? prev.departments.filter(d => d !== dept)
        : [...prev.departments, dept]
    }));
  };

  const togglePermission = (permission: Permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Users</h1>
          <p className="text-gray-600 mt-1">
            Manage administrators and their permissions
          </p>
        </div>
        {isSuperAdmin && (
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            + Create Admin
          </Button>
        )}
      </div>

      {/* Info Card */}
      {!isSuperAdmin && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Only SUPER_ADMIN can create new admin users. 
            Contact your system administrator to request new admin accounts.
          </p>
        </Card>
      )}

      {/* Admins Table */}
      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Departments</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {adminsData?.content.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">
                    {admin.firstName} {admin.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{admin.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    admin.role === 'SUPER_ADMIN' 
                      ? 'bg-purple-100 text-purple-800'
                      : admin.role === 'ADMIN'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {admin.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {admin.departments.map((dept) => (
                      <span 
                        key={dept}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {dept.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    admin.isActive 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {admin.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {admin.lastLoginAt 
                    ? new Date(admin.lastLoginAt).toLocaleDateString()
                    : 'Never'
                  }
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/admins/${admin.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </Link>
                    {isSuperAdmin && admin.role !== 'SUPER_ADMIN' && (
                      <button
                        onClick={() => handleDelete(admin.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {adminsData?.content.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No admin users found</p>
          </div>
        )}
      </Card>

      {/* Create Admin Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Admin User"
        size="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto p-2">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="admin@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="John"
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Doe"
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Minimum 8 characters"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminRoleType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ADMIN">Admin (Department Access)</option>
              <option value="SUPPORT">Support (Limited Access)</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Only SUPER_ADMIN can manage other admins
            </p>
          </div>

          {/* Departments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departments *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DEPARTMENT_OPTIONS.map((dept) => (
                <label key={dept} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.departments.includes(dept)}
                    onChange={() => toggleDepartment(dept)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm">{dept.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
            {errors.departments && <p className="text-red-500 text-sm mt-1">{errors.departments}</p>}
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissions
            </label>
            <div className="space-y-3 max-h-48 overflow-y-auto border rounded-lg p-3">
              {Object.entries(PERMISSIONS_BY_DEPT).map(([deptName, permissions]) => (
                <div key={deptName}>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">{deptName}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {permissions.map((perm) => (
                      <label key={perm} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(perm)}
                          onChange={() => togglePermission(perm)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-xs text-gray-600">{perm.replace(/_/g, ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button
            variant="secondary"
            onClick={() => setIsCreateModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            isLoading={createAdmin.isPending}
          >
            Create Admin
          </Button>
        </div>
      </Modal>
    </div>
  );
}
