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
  UserRegistrationHistory,
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
  SubscriptionPlan,
  AgencyPlanDiscount,
  UserPropertiesResponse,
  UserProjectsResponse,
} from '@/core/domain/entities/Admin';
import {
  AgentDiscount,
  AgentDiscountFilters,
  AgentDiscountSummary,
  AssignDiscountToAgentRequest,
  CreateAgentDiscountRequest,
} from '@/core/domain/entities/AgentDiscount';

export class AdminRepository implements IAdminRepository {
  private readonly basePath = '/admin';

  // Dashboard & Analytics
  async getDashboardStats(): Promise<DashboardStats> {
    const url = `${this.basePath}/dashboard/stats`;
    console.log(' Making GET request to:', url);
    const response = await axiosClient.get(url);
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
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

  async getUserRegistrationHistory(period: string = '1M'): Promise<UserRegistrationHistory> {
    const response = await axiosClient.get(`${this.basePath}/dashboard/stats/registration-history`, {
      params: { period }
    });
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
    const queryParams = new URLSearchParams();
    if (role) queryParams.set('role', role);
    if (enabled !== undefined) queryParams.set('enabled', enabled.toString());
    if (keyword) queryParams.set('keyword', keyword);
    if (params?.page !== undefined) queryParams.set('page', params.page.toString());
    if (params?.size !== undefined) queryParams.set('size', params.size.toString());
    if (params?.sort) queryParams.set('sort', params.sort);

    const response = await axiosClient.get(`${this.basePath}/users?${queryParams.toString()}`);
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

  async verifyUserPhone(userId: number): Promise<void> {
    await axiosClient.put(`${this.basePath}/users/${userId}/verify-phone`);
  }

  async getUserProperties(userId: number): Promise<UserPropertiesResponse> {
    const response = await axiosClient.get(`${this.basePath}/users/${userId}/properties`);
    return response.data;
  }

  async getUserProjects(userId: number): Promise<UserProjectsResponse> {
    const response = await axiosClient.get(`${this.basePath}/users/${userId}/projects`);
    return response.data;
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

  // Agent Management
  async getAgents(
    role?: string,
    enabled?: boolean,
    keyword?: string,
    params: PaginationParams = { page: 0, size: 20 }
  ): Promise<PaginatedResponse<any>> {
    const searchParams = new URLSearchParams();
    if (role) searchParams.append('role', role);
    if (enabled !== undefined) searchParams.append('enabled', enabled.toString());
    if (keyword) searchParams.append('keyword', keyword);
    if (params?.page !== undefined) searchParams.append('page', params.page.toString());
    if (params?.size !== undefined) searchParams.append('size', params.size.toString());
    if (params?.sort) searchParams.append('sort', params.sort);

    // Use the same endpoint as agencies page but filter by AGENT role
    const response = await axiosClient.get(`${this.basePath}/users?${searchParams.toString()}`);
    return response.data;
  }

  async getAgentById(agentId: number): Promise<any> {
    const response = await axiosClient.get(`${this.basePath}/users/${agentId}`);
    return response.data;
  }

  async toggleAgentVerification(agentId: number, verified: boolean, reason?: string): Promise<void> {
    // This would need to be implemented in backend - for now use user status toggle
    const params = new URLSearchParams();
    params.append('enabled', verified.toString());
    if (reason) params.append('reason', reason);
    await axiosClient.put(`${this.basePath}/users/${agentId}/status?${params.toString()}`);
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

  // Project Management
  async getProjectsForAdmin(
    status?: string,
    keyword?: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<any>> {
    const searchParams = new URLSearchParams();
    if (status) searchParams.append('status', status);
    if (keyword) searchParams.append('keyword', keyword);
    if (pagination?.page !== undefined) searchParams.append('page', pagination.page.toString());
    if (pagination?.size !== undefined) searchParams.append('size', pagination.size.toString());
    if (pagination?.sort) searchParams.append('sort', pagination.sort);

    const response = await axiosClient.get(`/api/admin/projects?${searchParams.toString()}`);
    
    // Transform backend format (priceFrom/priceTo) to frontend format (priceRange.min/max)
    const data = response.data;
    if (data.content && Array.isArray(data.content)) {
      data.content = data.content.map((project: any) => ({
        ...project,
        priceRange: {
          min: project.priceFrom || 0,
          max: project.priceTo || 0
        },
        // Add default values for fields that may be missing from backend
        soldUnits: project.soldUnits || 0,
        constructionProgress: project.constructionProgress || 0,
        lifecycleStatus: project.lifecycleStatus || project.status || 'DRAFT',
        city: project.city || project.province || '',
        country: project.country || 'Peru',
        viewsCount: project.viewsCount || 0,
        favoritesCount: project.favoritesCount || 0,
        inquiriesCount: project.inquiriesCount || 0,
        isActive: project.isActive ?? true,
      }));
    }
    
    return data;
  }

  async getProjectStats(): Promise<any> {
    const response = await axiosClient.get('/api/admin/project-stats');
    return response.data;
  }

  async moderateProject(projectId: number, request: any): Promise<void> {
    await axiosClient.put(`/api/admin/projects/${projectId}/moderate`, request);
  }

  async toggleFeaturedProject(projectId: number, featured: boolean): Promise<void> {
    await axiosClient.put(`/api/admin/projects/${projectId}/featured`, { featured });
  }

  async deleteProject(projectId: number, reason?: string): Promise<void> {
    const searchParams = reason ? new URLSearchParams({ reason }) : '';
    await axiosClient.delete(`/api/admin/projects/${projectId}${searchParams ? `?${searchParams.toString()}` : ''}`);
  }

  // Finance and Monetization
  async getSubscriptionPlans(): Promise<any[]> {
    const response = await axiosClient.get(`${this.basePath}/subscription-plans`);
    return response.data;
  }

  async getAdminSubscriptions(
    status?: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<any>> {
    const searchParams = new URLSearchParams();
    if (status) searchParams.append('status', status);
    if (pagination?.page !== undefined) searchParams.append('page', pagination.page.toString());
    if (pagination?.size !== undefined) searchParams.append('size', pagination.size.toString());
    if (pagination?.sort) searchParams.append('sort', pagination.sort);

    const response = await axiosClient.get(`/finance/subscriptions/admin?${searchParams.toString()}`);
    return response.data;
  }

  async getPaymentTransactions(
    status?: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<any>> {
    const searchParams = new URLSearchParams();
    if (status) searchParams.append('status', status);
    if (pagination?.page !== undefined) searchParams.append('page', pagination.page.toString());
    if (pagination?.size !== undefined) searchParams.append('size', pagination.size.toString());
    if (pagination?.sort) searchParams.append('sort', pagination.sort);

    const response = await axiosClient.get(`/finance/transactions/admin?${searchParams.toString()}`);
    return response.data;
  }

  async refundTransaction(transactionId: number, reason: string): Promise<void> {
    await axiosClient.post(`/finance/transactions/${transactionId}/refund`, { reason });
  }

  // Automation
  async triggerManualAutomation(): Promise<string> {
    const response = await axiosClient.post('/subscriptions/purchase/admin/trigger-automation');
    return response.data;
  }

  // Agent Discount Management
  async getAgentDiscounts(
    filters: AgentDiscountFilters = {},
    params: PaginationParams = { page: 0, size: 20 }
  ): Promise<PaginatedResponse<AgentDiscount>> {
    const searchParams = new URLSearchParams();
    if (filters.agentId) searchParams.append('agentId', filters.agentId.toString());
    if (filters.discountCodeId) searchParams.append('discountCodeId', filters.discountCodeId.toString());
    if (filters.status) searchParams.append('status', filters.status);
    if (filters.assignedBy) searchParams.append('assignedBy', filters.assignedBy.toString());
    if (filters.dateFrom) searchParams.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) searchParams.append('dateTo', filters.dateTo);
    if (params?.page !== undefined) searchParams.append('page', params.page.toString());
    if (params?.size !== undefined) searchParams.append('size', params.size.toString());
    if (params?.sort) searchParams.append('sort', params.sort);

    const response = await axiosClient.get(`${this.basePath}/discounts?${searchParams.toString()}`);
    return response.data;
  }

  async getAgentDiscountSummary(agentId: number): Promise<AgentDiscountSummary> {
    const response = await axiosClient.get(`${this.basePath}/discounts/agent/${agentId}/summary`);
    return response.data;
  }

  async assignDiscountToAgent(request: AssignDiscountToAgentRequest): Promise<AgentDiscount> {
    const response = await axiosClient.post(`${this.basePath}/discounts/assign`, request);
    return response.data;
  }

  async createAgentDiscount(request: CreateAgentDiscountRequest): Promise<AgentDiscount> {
    const response = await axiosClient.post(`${this.basePath}/discounts`, request);
    return response.data;
  }

  async removeDiscountFromAgent(agentId: number, discountCodeId: number): Promise<void> {
    await axiosClient.delete(`${this.basePath}/discounts/agent/${agentId}/${discountCodeId}`);
  }

  async toggleAgentDiscountStatus(discountId: number): Promise<AgentDiscount> {
    const response = await axiosClient.patch(`${this.basePath}/discounts/${discountId}/toggle`);
    return response.data;
  }

  async getAvailableDiscountsForAgent(agentId: number): Promise<DiscountCode[]> {
    const response = await axiosClient.get(`${this.basePath}/discounts/available?agentId=${agentId}`);
    return response.data;
  }

  // Subscription Plan Management
  async createSubscriptionPlan(plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const response = await axiosClient.post(`${this.basePath}/subscription-plans`, plan);
    return response.data;
  }

  async updateSubscriptionPlan(planId: number, plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const response = await axiosClient.put(`${this.basePath}/subscription-plans/${planId}`, plan);
    return response.data;
  }

  async deleteSubscriptionPlan(planId: number): Promise<void> {
    await axiosClient.delete(`${this.basePath}/subscription-plans/${planId}`);
  }

  async togglePlanStatus(planId: number): Promise<SubscriptionPlan> {
    const response = await axiosClient.patch(`${this.basePath}/subscription-plans/${planId}/toggle-status`);
    return response.data;
  }

  // Agency Plan Discounts
  async getAgencyPlanDiscounts(planId: number): Promise<AgencyPlanDiscount[]> {
    const response = await axiosClient.get(`${this.basePath}/subscription-plans/${planId}/agency-discounts`);
    return response.data;
  }

  async createAgencyDiscount(planId: number, discount: Partial<AgencyPlanDiscount>): Promise<AgencyPlanDiscount> {
    const response = await axiosClient.post(`${this.basePath}/subscription-plans/${planId}/agency-discounts`, discount);
    return response.data;
  }

  async removeAgencyDiscount(discountId: number): Promise<void> {
    await axiosClient.delete(`${this.basePath}/subscription-plans/agency-discounts/${discountId}`);
  }

  // Search by RUC/DNI
  async searchAgencyByRuc(ruc: string): Promise<{id: number, name: string, ruc: string, type: string, found: boolean}> {
    const response = await axiosClient.get(`${this.basePath}/subscription-plans/search/agency?ruc=${ruc}`);
    return response.data;
  }

  async searchAgentByDni(dni: string): Promise<{id: number, name: string, dni: string, type: string, found: boolean}> {
    const response = await axiosClient.get(`${this.basePath}/subscription-plans/search/agent?dni=${dni}`);
    return response.data;
  }
}

// Export singleton instance
export const adminRepository = new AdminRepository();
