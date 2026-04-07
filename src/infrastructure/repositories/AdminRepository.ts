/**
 * Admin Repository Implementation
 * HTTP adapter for admin module backend endpoints
 */

import { axiosClient } from '@/infrastructure/api/axios-client';
import {
  IAdminRepository,
  PaginationParams,
  PaginatedResponse,
} from '@/core/domain/repositories/IAdminRepository';
import {
  AdminUser,
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
  DashboardStats,
  UserStats,
  FinanceStats,
  UserListItem,
  ChangeUserRoleRequest,
  DiscountCode,
  CreateDiscountCodeRequest,
  UpdateDiscountCodeRequest,
  Campaign,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  CampaignAlert,
  PropertyModerationItem,
  ModeratePropertyRequest,
  AuditLogEntry,
  Department,
  Permission,
} from '@/core/domain/entities/Admin';

export class AdminRepository implements IAdminRepository {
  private readonly basePath = '/admin';

  // Dashboard & Analytics
  async getDashboardStats(): Promise<DashboardStats> {
    const url = `${this.basePath}/dashboard/stats`;
    console.log('🌐 Making GET request to:', url);
    const response = await axiosClient.get(url);
    console.log('📊 Response status:', response.status);
    console.log('📊 Response data:', response.data);
    return response.data;
  }

  async getUserStats(): Promise<UserStats> {
    const response = await axiosClient.get(`${this.basePath}/dashboard/stats/users`);
    return response.data;
  }

  async getFinanceStats(): Promise<FinanceStats> {
    const response = await axiosClient.get(`${this.basePath}/dashboard/stats/finance`);
    return response.data;
  }

  // Admin User Management
  async getAllAdmins(params: PaginationParams): Promise<PaginatedResponse<AdminUser>> {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined) searchParams.append('page', params.page.toString());
    if (params.size !== undefined) searchParams.append('size', params.size.toString());
    if (params.sort) searchParams.append('sort', params.sort);

    const response = await axiosClient.get(`${this.basePath}/admins?${searchParams.toString()}`);
    return response.data;
  }

  async getAdminById(adminId: number): Promise<AdminUser> {
    const response = await axiosClient.get(`${this.basePath}/admins/${adminId}`);
    return response.data;
  }

  async getAdminByUserId(userId: number): Promise<AdminUser> {
    const response = await axiosClient.get(`${this.basePath}/admins/by-user/${userId}`);
    return response.data;
  }

  async createAdminUser(request: CreateAdminUserRequest): Promise<AdminUser> {
    const response = await axiosClient.post(`${this.basePath}/admins`, request);
    return response.data;
  }

  async updateAdminUser(adminId: number, request: UpdateAdminUserRequest): Promise<AdminUser> {
    const response = await axiosClient.put(`${this.basePath}/admins/${adminId}`, request);
    return response.data;
  }

  async deleteAdminUser(adminId: number): Promise<void> {
    await axiosClient.delete(`${this.basePath}/admins/${adminId}`);
  }

  // User Management
  async getAllUsers(
    role?: string,
    enabled?: boolean,
    keyword?: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<UserListItem>> {
    const searchParams = new URLSearchParams();
    if (role) searchParams.append('role', role);
    if (enabled !== undefined) searchParams.append('enabled', enabled.toString());
    if (keyword) searchParams.append('keyword', keyword);
    if (params?.page !== undefined) searchParams.append('page', params.page.toString());
    if (params?.size !== undefined) searchParams.append('size', params.size.toString());
    if (params?.sort) searchParams.append('sort', params.sort);

    const response = await axiosClient.get(`${this.basePath}/users?${searchParams.toString()}`);
    return response.data;
  }

  async getUserById(userId: number): Promise<UserListItem> {
    const response = await axiosClient.get(`${this.basePath}/users/${userId}`);
    return response.data;
  }

  async toggleUserStatus(userId: number, enabled: boolean, reason?: string): Promise<void> {
    const params = new URLSearchParams();
    params.append('enabled', enabled.toString());
    if (reason) params.append('reason', reason);
    await axiosClient.put(`${this.basePath}/users/${userId}/status?${params.toString()}`);
  }

  async changeUserRole(userId: number, request: ChangeUserRoleRequest): Promise<void> {
    await axiosClient.put(`${this.basePath}/users/${userId}/role`, request);
  }

  async verifyUserEmail(userId: number): Promise<void> {
    await axiosClient.put(`${this.basePath}/users/${userId}/verify-email`);
  }

  // Discount Codes
  async getAllDiscountCodes(params: PaginationParams): Promise<PaginatedResponse<DiscountCode>> {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined) searchParams.append('page', params.page.toString());
    if (params.size !== undefined) searchParams.append('size', params.size.toString());
    if (params.sort) searchParams.append('sort', params.sort);

    const response = await axiosClient.get(`${this.basePath}/discounts?${searchParams.toString()}`);
    return response.data;
  }

  async getDiscountCodeById(codeId: number): Promise<DiscountCode> {
    const response = await axiosClient.get(`${this.basePath}/discounts/${codeId}`);
    return response.data;
  }

  async getDiscountCodeByCode(code: string): Promise<DiscountCode> {
    const response = await axiosClient.get(`${this.basePath}/discounts/by-code/${code}`);
    return response.data;
  }

  async createDiscountCode(request: CreateDiscountCodeRequest): Promise<DiscountCode> {
    const response = await axiosClient.post(`${this.basePath}/discounts`, request);
    return response.data;
  }

  async updateDiscountCode(codeId: number, request: UpdateDiscountCodeRequest): Promise<DiscountCode> {
    const response = await axiosClient.put(`${this.basePath}/discounts/${codeId}`, request);
    return response.data;
  }

  async deleteDiscountCode(codeId: number): Promise<void> {
    await axiosClient.delete(`${this.basePath}/discounts/${codeId}`);
  }

  async validateDiscountCode(code: string, amount: number): Promise<{ valid: boolean; discount?: number }> {
    const response = await axiosClient.get(`${this.basePath}/discounts/validate`, {
      params: { code, amount },
    });
    return response.data;
  }

  // Campaigns
  async getAllCampaigns(params: PaginationParams): Promise<PaginatedResponse<Campaign>> {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined) searchParams.append('page', params.page.toString());
    if (params.size !== undefined) searchParams.append('size', params.size.toString());
    if (params.sort) searchParams.append('sort', params.sort);

    const response = await axiosClient.get(`${this.basePath}/campaigns?${searchParams.toString()}`);
    return response.data;
  }

  async getCampaignById(campaignId: number): Promise<Campaign> {
    const response = await axiosClient.get(`${this.basePath}/campaigns/${campaignId}`);
    return response.data;
  }

  async createCampaign(request: CreateCampaignRequest): Promise<Campaign> {
    const response = await axiosClient.post(`${this.basePath}/campaigns`, request);
    return response.data;
  }

  async updateCampaign(campaignId: number, request: UpdateCampaignRequest): Promise<Campaign> {
    const response = await axiosClient.put(`${this.basePath}/campaigns/${campaignId}`, request);
    return response.data;
  }

  async deleteCampaign(campaignId: number): Promise<void> {
    await axiosClient.delete(`${this.basePath}/campaigns/${campaignId}`);
  }

  async getCampaignAlerts(): Promise<CampaignAlert[]> {
    const response = await axiosClient.get(`${this.basePath}/campaigns/alerts`);
    return response.data;
  }

  // Property Moderation
  async getPropertiesForModeration(
    status?: string,
    keyword?: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<PropertyModerationItem>> {
    const searchParams = new URLSearchParams();
    if (status) searchParams.append('status', status);
    if (keyword) searchParams.append('keyword', keyword);
    if (params?.page !== undefined) searchParams.append('page', params.page.toString());
    if (params?.size !== undefined) searchParams.append('size', params.size.toString());

    const response = await axiosClient.get(`${this.basePath}/properties?${searchParams.toString()}`);
    return response.data;
  }

  async getPropertyForModeration(propertyId: number): Promise<PropertyModerationItem> {
    const response = await axiosClient.get(`${this.basePath}/properties/${propertyId}`);
    return response.data;
  }

  async moderateProperty(propertyId: number, request: ModeratePropertyRequest): Promise<void> {
    await axiosClient.put(`${this.basePath}/properties/${propertyId}/moderate`, request);
  }

  async toggleFeaturedProperty(propertyId: number, featured: boolean): Promise<void> {
    const params = new URLSearchParams();
    params.append('featured', featured.toString());
    await axiosClient.put(`${this.basePath}/properties/${propertyId}/featured?${params.toString()}`);
  }

  async deletePropertyAsAdmin(propertyId: number, reason?: string): Promise<void> {
    const params = new URLSearchParams();
    if (reason) params.append('reason', reason);
    await axiosClient.delete(`${this.basePath}/properties/${propertyId}?${params.toString()}`);
  }

  // Audit Logs
  async getAuditLogs(
    entityType?: string,
    adminUserId?: number,
    params?: PaginationParams
  ): Promise<PaginatedResponse<AuditLogEntry>> {
    const searchParams = new URLSearchParams();
    if (entityType) searchParams.append('entityType', entityType);
    if (adminUserId !== undefined) searchParams.append('adminUserId', adminUserId.toString());
    if (params?.page !== undefined) searchParams.append('page', params.page.toString());
    if (params?.size !== undefined) searchParams.append('size', params.size.toString());
    if (params?.sort) searchParams.append('sort', params.sort);

    const response = await axiosClient.get(`${this.basePath}/audit-logs?${searchParams.toString()}`);
    return response.data;
  }

  async getAuditLogById(logId: number): Promise<AuditLogEntry> {
    const response = await axiosClient.get(`${this.basePath}/audit-logs/${logId}`);
    return response.data;
  }

  async getAuditLogsByUser(userId: number, params: PaginationParams): Promise<PaginatedResponse<AuditLogEntry>> {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined) searchParams.append('page', params.page.toString());
    if (params.size !== undefined) searchParams.append('size', params.size.toString());
    if (params.sort) searchParams.append('sort', params.sort);

    const response = await axiosClient.get(`${this.basePath}/audit-logs/user/${userId}?${searchParams.toString()}`);
    return response.data;
  }

  async getAuditLogsByEntity(entityType: string, entityId: number): Promise<AuditLogEntry[]> {
    const response = await axiosClient.get(`${this.basePath}/audit-logs/entity/${entityType}/${entityId}`);
    return response.data;
  }

  // Departments & Permissions
  async getAllDepartments(): Promise<Department[]> {
    const response = await axiosClient.get(`${this.basePath}/departments`);
    return response.data;
  }

  async getAllPermissions(): Promise<Permission[]> {
    const response = await axiosClient.get(`${this.basePath}/permissions`);
    return response.data;
  }

  // Automation
  async triggerManualAutomation(): Promise<string> {
    const response = await axiosClient.post('/subscriptions/purchase/admin/trigger-automation');
    return response.data;
  }
}
