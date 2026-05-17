/**
 * Admin repository interface (port)
 * Defines contracts for admin module operations
 */

import {
  AdminUser,
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
  DashboardStats,
  UserStats,
  FinanceStats,
  FinanceHistoryDto,
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

// Pagination types (aligned with backend Page response)
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface IAdminRepository {
  // Dashboard & Analytics
  getDashboardStats(): Promise<DashboardStats>;
  getUserStats(): Promise<UserStats>;
  getFinanceStats(): Promise<FinanceStats>;
  getFinanceHistory(period?: string): Promise<FinanceHistoryDto>;

  // Admin User Management (requires SUPER_ADMIN)
  getAllAdmins(params: PaginationParams): Promise<PaginatedResponse<AdminUser>>;
  getAdminById(adminId: number): Promise<AdminUser>;
  getAdminByUserId(userId: number): Promise<AdminUser>;
  createAdminUser(request: CreateAdminUserRequest): Promise<AdminUser>;
  updateAdminUser(adminId: number, request: UpdateAdminUserRequest): Promise<AdminUser>;
  deleteAdminUser(adminId: number): Promise<void>;

  // User Management
  getAllUsers(
    role?: string,
    enabled?: boolean,
    keyword?: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<UserListItem>>;
  getUserById(userId: number): Promise<UserListItem>;
  toggleUserStatus(userId: number, enabled: boolean, reason?: string): Promise<void>;
  changeUserRole(userId: number, request: ChangeUserRoleRequest): Promise<void>;
  verifyUserEmail(userId: number): Promise<void>;

  // Discount Codes
  getAllDiscountCodes(params: PaginationParams): Promise<PaginatedResponse<DiscountCode>>;
  getDiscountCodeById(codeId: number): Promise<DiscountCode>;
  getDiscountCodeByCode(code: string): Promise<DiscountCode>;
  createDiscountCode(request: CreateDiscountCodeRequest): Promise<DiscountCode>;
  updateDiscountCode(codeId: number, request: UpdateDiscountCodeRequest): Promise<DiscountCode>;
  deleteDiscountCode(codeId: number): Promise<void>;
  validateDiscountCode(code: string, amount: number): Promise<{ valid: boolean; discount?: number }>;

  // Campaigns
  getAllCampaigns(params: PaginationParams): Promise<PaginatedResponse<Campaign>>;
  getCampaignById(campaignId: number): Promise<Campaign>;
  createCampaign(request: CreateCampaignRequest): Promise<Campaign>;
  updateCampaign(campaignId: number, request: UpdateCampaignRequest): Promise<Campaign>;
  deleteCampaign(campaignId: number): Promise<void>;
  getCampaignAlerts(): Promise<CampaignAlert[]>;

  // Property Moderation
  getPropertiesForModeration(
    status?: string,
    keyword?: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<PropertyModerationItem>>;
  getPropertyForModeration(propertyId: number): Promise<PropertyModerationItem>;
  moderateProperty(propertyId: number, request: ModeratePropertyRequest): Promise<void>;
  toggleFeaturedProperty(propertyId: number, featured: boolean): Promise<void>;
  deletePropertyAsAdmin(propertyId: number, reason?: string): Promise<void>;

  // Audit Logs
  getAuditLogs(
    entityType?: string,
    adminUserId?: number,
    params?: PaginationParams
  ): Promise<PaginatedResponse<AuditLogEntry>>;
  getAuditLogById(logId: number): Promise<AuditLogEntry>;
  getAuditLogsByUser(userId: number, params: PaginationParams): Promise<PaginatedResponse<AuditLogEntry>>;
  getAuditLogsByEntity(entityType: string, entityId: number): Promise<AuditLogEntry[]>;

  // Departments & Permissions
  getAllDepartments(): Promise<Department[]>;
  getAllPermissions(): Promise<Permission[]>;

  // Automation
  triggerManualAutomation(): Promise<string>;
}
