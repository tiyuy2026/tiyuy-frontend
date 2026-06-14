/**
 * Hook to check if the current user has admin restrictions on the platform.
 * ADMIN and SUPPORT users in "User Mode" cannot access Plans, Publish, or Chat.
 * SUPER_ADMIN has no restrictions.
 */
import { useAuthStore } from '@/presentation/store/authStore';
import { useAdminModeStore } from '@/presentation/store/adminModeStore';

export function useAdminRestrictions() {
  const { adminRoleType } = useAuthStore();
  const { isUserMode } = useAdminModeStore();

  // Only apply restrictions if:
  // 1. User has an admin role (ADMIN or SUPPORT)
  // 2. User is in "User Mode" (viewing platform, not admin panel)
  // 3. User is NOT SUPER_ADMIN (SuperAdmin has full access)
  const isRestricted = !!adminRoleType && isUserMode && adminRoleType !== 'SUPER_ADMIN';

  return {
    isRestricted,
    /** If true, user cannot access Plans page */
    isPlansRestricted: isRestricted,
    /** If true, user cannot publish properties/projects */
    isPublishRestricted: isRestricted,
    /** If true, user cannot access Chat */
    isChatRestricted: isRestricted,
    /** If true, user has full access (no restrictions) */
    hasFullAccess: !isRestricted,
  };
}