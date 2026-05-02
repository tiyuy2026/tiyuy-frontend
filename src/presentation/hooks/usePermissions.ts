import { useAuthStore } from '../store/authStore';
import { AdminRoleType } from '@/core/domain/entities';

/**
 * Hook for checking admin permissions and roles
 * Provides utilities for SUPER_ADMIN and ADMIN access control
 */
export const usePermissions = () => {
  const { 
    user, 
    adminRoleType, 
    permissions, 
    isAdminActive 
  } = useAuthStore();

  // Check if user is an admin (any type)
  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'].includes(adminRoleType || '');

  // Check if user is SUPER_ADMIN (full control)
  const isSuperAdmin = adminRoleType === 'SUPER_ADMIN';

  // Check if user is regular ADMIN (limited by permissions)
  const isRegularAdmin = adminRoleType === 'ADMIN';

  // Check if user is SUPPORT (view-only or limited access)
  const isSupport = adminRoleType === 'SUPPORT';

  // Check if admin account is active
  // SUPER_ADMIN bypass: always considered active
  const hasActiveAdminAccount = isSuperAdmin || (isAdmin && isAdminActive === true);

  /**
   * Check if user has a specific permission
   * SUPER_ADMIN always has all permissions (bypass before checking isAdminActive)
   */
  const hasPermission = (permission: string): boolean => {
    if (!isAdmin) return false;
    if (isSuperAdmin) return true; // SUPER_ADMIN bypass - always has all permissions
    if (!isAdminActive) return false; // Only check active status for non-super admins
    return permissions?.includes(permission) ?? false;
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    if (!isAdmin) return false;
    if (isSuperAdmin) return true;
    if (!isAdminActive) return false;
    return requiredPermissions.some(p => permissions?.includes(p));
  };

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    if (!isAdmin) return false;
    if (isSuperAdmin) return true;
    if (!isAdminActive) return false;
    return requiredPermissions.every(p => permissions?.includes(p));
  };

  /**
   * Check if user belongs to a specific department
   */
  const belongsToDepartment = (departmentCode: string): boolean => {
    if (!isAdmin) return false;
    if (isSuperAdmin) return true;
    const { departments } = useAuthStore.getState();
    return departments?.includes(departmentCode) ?? false;
  };

  return {
    // Role checks
    isAdmin,
    isSuperAdmin,
    isRegularAdmin,
    isSupport,
    adminRoleType,
    
    // Status checks
    hasActiveAdminAccount,
    permissions,
    
    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    belongsToDepartment,
  };
};
