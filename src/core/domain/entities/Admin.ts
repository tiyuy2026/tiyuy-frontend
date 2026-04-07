/**
 * Admin domain entities
 * Aligned with backend Admin module structure
 */

// Admin role types matching backend AdminRoleType
export type AdminRoleType = 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT';

// Department types matching backend DepartmentType
export type DepartmentType = 
  | 'USER_MANAGEMENT' 
  | 'PROPERTY_MANAGEMENT' 
  | 'COMMUNICATIONS' 
  | 'FINANCE' 
  | 'ANALYTICS';

// Permission enum matching backend Permission.java
export type Permission =
  // User Management
  | 'USERS_VIEW' | 'USERS_CREATE' | 'USERS_UPDATE' | 'USERS_DELETE' 
  | 'USERS_CHANGE_ROLE' | 'USERS_VERIFY'
  // Property Management
  | 'PROPERTIES_VIEW' | 'PROPERTIES_MODERATE' | 'PROPERTIES_DELETE' | 'PROPERTIES_FEATURE'
  | 'PROJECTS_VIEW' | 'PROJECTS_MODERATE' | 'PROJECTS_DELETE'
  | 'AGENCIES_VIEW' | 'AGENCIES_MANAGE'
  // Communications
  | 'COMMUNICATIONS_VIEW' | 'COMMUNICATIONS_MANAGE' | 'EVENTS_VIEW' | 'CHAT_MONITOR'
  | 'GROUPS_VIEW' | 'GROUPS_MANAGE'
  // Finance
  | 'FINANCE_VIEW' | 'FINANCE_MANAGE_SUBSCRIPTIONS' | 'FINANCE_REFUNDS'
  | 'DISCOUNTS_CREATE' | 'DISCOUNTS_MANAGE'
  // Analytics
  | 'ANALYTICS_VIEW' | 'ANALYTICS_EXPORT' | 'ANALYTICS_DASHBOARD'
  // Admin Management
  | 'ADMINS_VIEW' | 'ADMINS_CREATE' | 'ADMINS_UPDATE' | 'ADMINS_DELETE' | 'DEPARTMENTS_MANAGE'
  // Global
  | 'NOTIFICATIONS_SEND' | 'AUDIT_LOGS_VIEW' | 'SYSTEM_CONFIG';

// Discount code status
export type DiscountCodeStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'DEPLETED';

// Discount applicability
export type DiscountApplicability = 'GLOBAL' | 'USER_SPECIFIC' | 'AGENCY_SPECIFIC' | 'PLAN_SPECIFIC';

// Campaign status
export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

// Campaign alert type
export type CampaignAlertType = 'USAGE_LIMIT' | 'EXPIRY_WARNING' | 'LOW_PERFORMANCE';

// Department entity
export interface Department {
  id: number;
  type: DepartmentType;
  displayName: string;
  description: string;
}

// Admin user entity matching AdminUserResponse
export interface AdminUser {
  id: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRoleType;
  departments: DepartmentType[];
  permissions: Permission[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Admin user creation request
export interface CreateAdminUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: AdminRoleType;
  departmentIds: number[];
  permissionIds: Permission[];
}

// Admin user update request
export interface UpdateAdminUserRequest {
  firstName?: string;
  lastName?: string;
  role?: AdminRoleType;
  departmentIds?: number[];
  permissionIds?: Permission[];
  isActive?: boolean;
}

// Dashboard stats
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  totalProperties: number;
  publishedProperties: number;
  pendingProperties: number;
  rejectedProperties: number;
  totalProjects: number;
  activeProjects: number;
  totalPayments: number;
  paymentsToday: number;
  totalRevenue: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  totalChatMessages: number;
  totalEvents: number;
  pendingReports: number;
  usersByRole: Record<string, number>;
  propertiesByType: Record<string, number>;
  propertiesByStatus: Record<string, number>;
  generatedAt: string;
}

// User stats
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersByRole: Record<string, number>;
  usersByStatus: Record<string, number>;
}

// Finance stats
export interface FinanceStats {
  totalRevenue: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  totalPayments: number;
  paymentsToday: number;
  averageTransactionValue: number;
  refundsTotal: number;
  refundsCount: number;
}

// User list item for admin management
export interface UserListItem {
  id: number;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  dni: string;
  role: 'USER' | 'AGENT' | 'DEVELOPER' | 'ADMIN';
  enabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  publishedPropertiesCount: number;
  city?: string;
  country?: string;
  lastLoginAt?: Date;
  createdAt: Date;
}

// Change user role request
export interface ChangeUserRoleRequest {
  newRole: 'USER' | 'AGENT' | 'DEVELOPER' | 'ADMIN';
  reason?: string;
}

// Discount code entity
export interface DiscountCode {
  id: number;
  code: string;
  discountPercentage: number;
  applicability: DiscountApplicability;
  status: DiscountCodeStatus;
  usageLimit: number;
  currentUsage: number;
  remainingUses: number;
  singleUse: boolean;
  startDate: Date;
  endDate?: Date;
  applicablePlan?: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
  applicableUserId?: number;
  applicableAgencyId?: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  isValid: boolean;
  shouldShowUsageLimitAlert: boolean;
}

// Create discount code request
export interface CreateDiscountCodeRequest {
  code: string;
  discountPercentage: number;
  applicability: DiscountApplicability;
  usageLimit: number;
  singleUse: boolean;
  startDate: Date;
  endDate?: Date;
  applicablePlan?: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
  applicableUserId?: number;
  applicableAgencyId?: number;
  minimumAmount?: number;
  maximumDiscount?: number;
}

// Update discount code request
export interface UpdateDiscountCodeRequest {
  discountPercentage?: number;
  applicability?: DiscountApplicability;
  usageLimit?: number;
  singleUse?: boolean;
  startDate?: Date;
  endDate?: Date;
  applicablePlan?: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
  applicableUserId?: number;
  applicableAgencyId?: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  status?: DiscountCodeStatus;
}

// Campaign entity
export interface Campaign {
  id: number;
  name: string;
  description?: string;
  status: CampaignStatus;
  discountCodeId: number;
  discountCodeCode: string;
  startDate: Date;
  endDate?: Date;
  targetAudience: 'ALL' | 'NEW_USERS' | 'EXISTING_USERS' | 'SUBSCRIBERS';
  autoApply: boolean;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  revenueGenerated: number;
}

// Create campaign request
export interface CreateCampaignRequest {
  name: string;
  description?: string;
  discountCodeId: number;
  startDate: Date;
  endDate?: Date;
  targetAudience: 'ALL' | 'NEW_USERS' | 'EXISTING_USERS' | 'SUBSCRIBERS';
  autoApply: boolean;
}

// Update campaign request
export interface UpdateCampaignRequest {
  name?: string;
  description?: string;
  status?: CampaignStatus;
  endDate?: Date;
  targetAudience?: 'ALL' | 'NEW_USERS' | 'EXISTING_USERS' | 'SUBSCRIBERS';
  autoApply?: boolean;
}

// Campaign alert
export interface CampaignAlert {
  id: number;
  campaignId: number;
  campaignName: string;
  alertType: CampaignAlertType;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: Date;
  resolvedAt?: Date;
  resolved: boolean;
}

// Property moderation DTO
export interface PropertyModerationItem {
  id: number;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'SUSPENDED';
  ownerId: number;
  ownerName: string;
  ownerEmail: string;
  price: number;
  district: string;
  createdAt: Date;
  publishedAt?: Date;
  isFeatured: boolean;
  viewsCount: number;
  reportCount: number;
}

// Moderate property request
export interface ModeratePropertyRequest {
  action: 'APPROVE' | 'REJECT' | 'SUSPEND';
  reason?: string;
  notes?: string;
}

// Audit log entry
export interface AuditLogEntry {
  id: number;
  adminUserId: number;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: number;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Admin navigation item
export interface AdminNavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  requiredPermissions: Permission[];
  department: DepartmentType;
  badge?: number;
}

// Admin sidebar section
export interface AdminSidebarSection {
  title: string;
  department: DepartmentType;
  items: AdminNavItem[];
}
