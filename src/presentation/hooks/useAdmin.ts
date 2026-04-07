/**
 * Admin hooks for React Query integration
 * Follows hexagonal architecture - hooks orchestrate use cases
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminRepository } from '@/infrastructure/repositories/AdminRepository';
import {
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
  ChangeUserRoleRequest,
  CreateDiscountCodeRequest,
  UpdateDiscountCodeRequest,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  ModeratePropertyRequest,
} from '@/core/domain/entities/Admin';
import { PaginationParams } from '@/core/domain/repositories/IAdminRepository';

const adminRepository = new AdminRepository();
const ADMIN_QUERY_KEY = 'admin';

// Dashboard hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: [ADMIN_QUERY_KEY, 'dashboard', 'stats'],
    queryFn: async () => {
      console.log(' Calling getDashboardStats...');
      try {
        const result = await adminRepository.getDashboardStats();
        console.log(' Dashboard stats received:', result);
        return result;
      } catch (error) {
        console.error(' Error fetching dashboard stats:', error);
        // Retornar datos por defecto en caso de error 500
        return {
          totalUsers: 0,
          activeUsers: 0,
          newUsersToday: 0,
          newUsersThisWeek: 0,
          newUsersThisMonth: 0,
          totalProperties: 0,
          publishedProperties: 0,
          pendingProperties: 0,
          rejectedProperties: 0,
          totalProjects: 0,
          activeProjects: 0,
          totalPayments: 0,
          paymentsToday: 0,
          totalRevenue: 0,
          revenueToday: 0,
          revenueThisWeek: 0,
          revenueThisMonth: 0,
          totalChatMessages: 0,
          totalEvents: 0,
          pendingReports: 0,
          usersByRole: {},
          propertiesByType: {},
          propertiesByStatus: {},
          generatedAt: new Date().toISOString()
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: [ADMIN_QUERY_KEY, 'dashboard', 'userStats'],
    queryFn: async () => {
      try {
        return await adminRepository.getUserStats();
      } catch (error) {
        console.error(' Error fetching user stats:', error);
        return {
          totalUsers: 0,
          activeUsers: 0,
          newUsersToday: 0,
          newUsersThisWeek: 0,
          newUsersThisMonth: 0,
          usersByRole: {},
          usersByStatus: {}
        };
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useFinanceStats = () => {
  return useQuery({
    queryKey: [ADMIN_QUERY_KEY, 'dashboard', 'financeStats'],
    queryFn: async () => {
      try {
        return await adminRepository.getFinanceStats();
      } catch (error) {
        console.error(' Error fetching finance stats:', error);
        return {
          totalRevenue: 0,
          monthlyRevenue: 0,
          pendingPayments: 0,
          completedTransactions: 0
        };
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Admin user management hooks
export const useAdmins = (params: PaginationParams = { page: 0, size: 20 }) => {
  return useQuery({
    queryKey: [ADMIN_QUERY_KEY, 'admins', params],
    queryFn: () => adminRepository.getAllAdmins(params),
    staleTime: 60 * 1000,
  });
};

export const useAdminById = (adminId: number) => {
  return useQuery({
    queryKey: [ADMIN_QUERY_KEY, 'admins', adminId],
    queryFn: () => adminRepository.getAdminById(adminId),
    enabled: !!adminId,
  });
};

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateAdminUserRequest) => adminRepository.createAdminUser(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY, 'admins'] });
    },
  });
};

export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ adminId, request }: { adminId: number; request: UpdateAdminUserRequest }) =>
      adminRepository.updateAdminUser(adminId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY, 'admins'] });
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY, 'admins', variables.adminId] });
    },
  });
};

export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (adminId: number) => adminRepository.deleteAdminUser(adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY, 'admins'] });
    },
  });
};

// User management hooks
export const useUsers = (
  role?: string,
  enabled?: boolean,
  keyword?: string,
  params: PaginationParams = { page: 0, size: 20 }
) => {
  return useQuery({
    queryKey: [ADMIN_QUERY_KEY, 'users', { role, enabled, keyword, params }],
    queryFn: () => adminRepository.getAllUsers(role, enabled, keyword, params),
    staleTime: 60 * 1000,
  });
};

export const useUserById = (userId: number) => {
  return useQuery({
    queryKey: [ADMIN_QUERY_KEY, 'users', userId],
    queryFn: () => adminRepository.getUserById(userId),
    enabled: !!userId,
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, enabled, reason }: { userId: number; enabled: boolean; reason?: string }) =>
      adminRepository.toggleUserStatus(userId, enabled, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY, 'users'] });
    },
  });
};

export const useChangeUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, request }: { userId: number; request: ChangeUserRoleRequest }) =>
      adminRepository.changeUserRole(userId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY, 'users'] });
    },
  });
};

// Discount code hooks
export const useDiscountCodes = (params: PaginationParams = { page: 0, size: 20 }) => {
  return useQuery({
    queryKey: [ADMIN_QUERY_KEY, 'discounts', params],
    queryFn: () => adminRepository.getAllDiscountCodes(params),
    staleTime: 60 * 1000,
  });
};

export const useDiscountCodeById = (codeId: number) => {
  return useQuery({
    queryKey: [ADMIN_QUERY_KEY, 'discounts', codeId],
    queryFn: () => adminRepository.getDiscountCodeById(codeId),
    enabled: !!codeId,
  });
};

export const useCreateDiscountCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateDiscountCodeRequest) => adminRepository.createDiscountCode(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY, 'discounts'] });
    },
  });
};

export const useUpdateDiscountCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ codeId, request }: { codeId: number; request: UpdateDiscountCodeRequest }) =>
      adminRepository.updateDiscountCode(codeId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY, 'discounts'] });
    },
  });
};

export const useDeleteDiscountCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (codeId: number) => adminRepository.deleteDiscountCode(codeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY, 'discounts'] });
    },
  });
};

// Campaign hooks
export const useCampaigns = (params: PaginationParams = { page: 0, size: 20 }) => {
  return useQuery({
    queryKey: [ADMIN_QUERY_KEY, 'campaigns', params],
    queryFn: () => adminRepository.getAllCampaigns(params),
    staleTime: 60 * 1000,
  });
};

export const useCampaignById = (campaignId: number) => {
  return useQuery({
    queryKey: [ADMIN_QUERY_KEY, 'campaigns', campaignId],
    queryFn: () => adminRepository.getCampaignById(campaignId),
    enabled: !!campaignId,
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateCampaignRequest) => adminRepository.createCampaign(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY, 'campaigns'] });
    },
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ campaignId, request }: { campaignId: number; request: UpdateCampaignRequest }) =>
      adminRepository.updateCampaign(campaignId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY, 'campaigns'] });
    },
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: number) => adminRepository.deleteCampaign(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY, 'campaigns'] });
    },
  });
};

// Property moderation hooks
export const usePropertiesForModeration = (
  status?: string,
  keyword?: string,
  params: PaginationParams = { page: 0, size: 20 }
) => {
  return useQuery({
    queryKey: [ADMIN_QUERY_KEY, 'properties', { status, keyword, params }],
    queryFn: () => adminRepository.getPropertiesForModeration(status, keyword, params),
    staleTime: 30 * 1000,
  });
};

export const useModerateProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, request }: { propertyId: number; request: ModeratePropertyRequest }) =>
      adminRepository.moderateProperty(propertyId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY, 'properties'] });
    },
  });
};

export const useToggleFeaturedProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, featured }: { propertyId: number; featured: boolean }) =>
      adminRepository.toggleFeaturedProperty(propertyId, featured),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY, 'properties'] });
    },
  });
};
