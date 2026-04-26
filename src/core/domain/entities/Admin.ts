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

// Discount code status matching backend
export type DiscountCodeStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'EXHAUSTED' | 'USED';

// Discount applicability matching backend
export type DiscountApplicability = 'GLOBAL' | 'PLAN_SPECIFIC' | 'USER_SPECIFIC' | 'PROJECT_SPECIFIC' | 'AGENCY_SPECIFIC';

// Campaign status matching backend
export type CampaignStatus = 'SCHEDULED' | 'ACTIVE' | 'EXPIRED' | 'INACTIVE';

// Campaign alert type matching backend
export type CampaignAlertType = 'LAST_WEEK' | 'LAST_DAY' | 'STARTED' | 'ENDED' | 'USAGE_LIMIT_WARNING';

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
  // Porcentajes de crecimiento (vs período anterior)
  usersGrowthPercent: number;
  propertiesGrowthPercent: number;
  projectsGrowthPercent: number;
  revenueGrowthPercent: number;
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

// User registration history for chart data
export interface UserRegistrationHistory {
  period: string;
  startDate: string;
  endDate: string;
  totalRegistrations: number;
  dataPoints: RegistrationDataPoint[];
}

export interface RegistrationDataPoint {
  date: string;
  count: number;
  actualDate?: string;
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
  totalSubscriptions: number;
  activeSubscriptions: number;
  newSubscriptionsToday: number;
  totalTransactions: number;
  transactionsToday: number;
  totalWalletBalance: number;
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
  publishedProjectsCount: number;
  city?: string;
  country?: string;
  profilePhotoUrl?: string;
  lastLoginAt?: Date;
  createdAt: Date;
}

// Change user role request
export interface ChangeUserRoleRequest {
  newRole: 'USER' | 'AGENT' | 'DEVELOPER' | 'ADMIN';
  reason?: string;
}

// User properties response from admin endpoint
export interface UserPropertiesResponse {
  userId: number;
  userEmail: string;
  userName: string;
  totalProperties: number;
  properties: UserPropertySummary[];
}

export interface UserPropertySummary {
  id: number;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'SUSPENDED';
  price: number;
  district: string;
  city: string;
  thumbnailUrl?: string;
  isFeatured: boolean;
  viewsCount: number;
  createdAt: Date;
  publishedAt?: Date;
  bedrooms?: number;
  bathrooms?: number;
  totalArea?: number;
  description?: string;
}

// User projects response from admin endpoint
export interface UserProjectsResponse {
  userId: number;
  userEmail: string;
  userName: string;
  totalProjects: number;
  projects: UserProjectSummary[];
}

export interface UserProjectSummary {
  id: number;
  name: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'COMPLETED' | 'SUSPENDED' | 'CANCELLED';
  phase: 'PLANNING' | 'CONSTRUCTION' | 'PRE_SALE' | 'SALE' | 'COMPLETED';
  district: string;
  city: string;
  coverImageUrl?: string;
  totalUnits: number;
  availableUnits: number;
  soldUnits: number;
  constructionProgress: number;
  estimatedDeliveryDate?: Date;
  createdAt: Date;
  publishedAt?: Date;
}


// Property status type including admin disabled
export type PropertyStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'PUBLISHED'
  | 'PAUSED'
  | 'REJECTED'
  | 'RENTED'
  | 'SOLD'
  | 'EXPIRED'
  | 'SUSPENDED'
  | 'DISABLED_BY_ADMIN';

// Property moderation DTO
export interface PropertyModerationItem {
  id: number;
  title: string;
  slug: string;
  status: PropertyStatus;
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
  thumbnailUrl?: string;
}

// Property comment for admin review
export interface PropertyComment {
  id: number;
  propertyId: number;
  propertyTitle: string;
  userId: number;
  userName: string;
  userEmail: string;
  content: string;
  rating?: number;
  isFlagged: boolean;
  flagReason?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Request to notify property owner
export interface NotifyOwnerRequest {
  subject: string;
  message: string;
  includePropertyDetails?: boolean;
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

// Project lifecycle status
export type ProjectLifecycleStatus = 'ACTIVE' | 'PENDING' | 'PAST' | 'ENDING_SOON' | 'COMPLETED' | 'SUSPENDED';

// Project status
export type ProjectStatus = 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'SUSPENDED' | 'CANCELLED';

// Project type
export type ProjectType = 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED_USE' | 'INDUSTRIAL';

// Project phase
export type ProjectPhase = 'PLANNING' | 'CONSTRUCTION' | 'PRE_SALE' | 'SALE' | 'COMPLETED';

// Project entity for admin management
export interface ProjectAdminItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  lifecycleStatus: ProjectLifecycleStatus;
  phase: ProjectPhase;
  developerId: number;
  developerName: string;
  developerEmail: string;
  district: string;
  city: string;
  country: string;
  coverImageUrl?: string;
  totalUnits: number;
  availableUnits: number;
  soldUnits: number;
  priceRange: {
    min: number;
    max: number;
  };
  constructionProgress: number;
  startDate?: Date;
  estimatedDeliveryDate?: Date;
  launchDate?: Date;
  completionDate?: Date;
  viewsCount: number;
  favoritesCount: number;
  inquiriesCount: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isFeatured: boolean;
}

// Project statistics
export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  pendingProjects: number;
  projectsWithCover: number;
  projectsWithoutCover: number;
  coveragePercentage: number;
  totalUnits: number;
  soldUnits: number;
  availableUnits: number;
  averageConstructionProgress: number;
  // Extended stats for dashboard
  totalSalesValue: number;
  totalSoldUnits: number;
  conversionRate: number;
  totalAvailableUnits: number;
}

// Project moderation request
export interface ModerateProjectRequest {
  action: 'APPROVE' | 'REJECT' | 'SUSPEND' | 'ACTIVATE' | 'DEACTIVATE';
  reason?: string;
  notes?: string;
}

// Campaign entity matching backend
export interface Campaign {
  id: number;
  title: string;
  name?: string;
  description?: string;
  promotionalMessage?: string;
  imageUrl?: string;
  link?: string;
  status: 'SCHEDULED' | 'ACTIVE' | 'EXPIRED' | 'INACTIVE';
  startDate: Date;
  endDate: Date;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  styles?: Record<string, string>;
  lastAlertSent?: Date;
  // Additional properties for campaign management
  discountCodeCode?: string;
  discountCodeId?: number;
  targetAudience?: string;
  usageCount?: number;
  revenueGenerated?: number;
  autoApply?: boolean;
}

// Create campaign request matching backend
export interface CreateCampaignRequest {
  title: string;
  description?: string;
  promotionalMessage?: string;
  imageUrl?: string;
  link?: string;
  startDate: Date;
  endDate: Date;
  styles?: Record<string, string>;
}

// Update campaign request matching backend
export interface UpdateCampaignRequest {
  title?: string;
  description?: string;
  promotionalMessage?: string;
  imageUrl?: string;
  link?: string;
  status?: 'SCHEDULED' | 'ACTIVE' | 'EXPIRED' | 'INACTIVE';
  startDate?: Date;
  endDate?: Date;
  styles?: Record<string, string>;
}

// Campaign alert matching backend
export interface CampaignAlert {
  id: number;
  campaignId?: number;
  discountCodeId?: number;
  alertType: 'LAST_WEEK' | 'LAST_DAY' | 'STARTED' | 'ENDED' | 'USAGE_LIMIT_WARNING';
  message: string;
  sentAt: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
}

// Discount code entity matching backend
export interface DiscountCode {
  id: number;
  code: string;
  discountPercentage: number;
  applicability: 'GLOBAL' | 'PLAN_SPECIFIC' | 'USER_SPECIFIC' | 'PROJECT_SPECIFIC' | 'AGENCY_SPECIFIC';
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'EXHAUSTED' | 'USED';
  usageLimit?: number;
  currentUsage: number;
  singleUse: boolean;
  startDate: Date;
  endDate: Date;
  applicablePlan?: string;
  applicableUserId?: number;
  applicableAgencyId?: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  lastAlertSent?: Date;
}

// Create discount code request matching backend
export interface CreateDiscountCodeRequest {
  code: string;
  discountPercentage: number;
  applicability: 'GLOBAL' | 'PLAN_SPECIFIC' | 'USER_SPECIFIC' | 'PROJECT_SPECIFIC' | 'AGENCY_SPECIFIC';
  usageLimit?: number;
  singleUse: boolean;
  startDate: Date;
  endDate: Date;
  applicablePlan?: string;
  applicableUserId?: number;
  applicableAgencyId?: number;
  minimumAmount?: number;
  maximumDiscount?: number;
}

// Agent dashboard stats matching backend
export interface AgentDashboardStats {
  totalRevenue: number;
  totalRevenuePrevious: number;
  monthlyRevenue: number;
  monthlyRevenuePrevious: number;
  weeklyRevenue: number;
  weeklyRevenuePrevious: number;
  activeAgents: number;
  activeAgentsPrevious: number;
  totalAgents: number;
  conversionRate: number;
  conversionRatePrevious: number;
  freeAgents: number;
  freeAgentsPrevious: number;
  lostPotentialRevenue: number;
  topAgents: AgentRevenueItem[];
  revenueChart: {
    labels: string[];
    revenue: number[];
    conversion: number[];
  };
  planDistribution: {
    labels: string[];
    values: number[];
    total: number;
  };
  freeAgentList: AgentFreeItem[];
}

export interface AgentRevenueItem {
  agentId: number;
  firstName: string;
  lastName: string;
  email: string;
  profilePhotoUrl?: string;
  city?: string;
  country?: string;
  weeklyRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  conversionRate: number;
  currentPlan: string;
  isActive: boolean;
  memberSince: string;
}

export interface AgentFreeItem {
  agentId: number;
  firstName: string;
  lastName: string;
  initials: string;
  email: string;
  status: string;
  potentialRevenue: number;
  createdAt: string;
}

export interface AgentListItem {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  dni?: string;
  city?: string;
  country?: string;
  profilePhotoUrl?: string;
  enabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  currentPlan: string;
  planExpiresAt?: Date;
  weekRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
  conversionRate: number;
  propertiesCount: number;
  lastLoginAt?: Date;
  createdAt: Date;
}

// Update discount code request matching backend
export interface UpdateDiscountCodeRequest {
  code?: string;
  discountPercentage?: number;
  applicability?: 'GLOBAL' | 'PLAN_SPECIFIC' | 'USER_SPECIFIC' | 'PROJECT_SPECIFIC' | 'AGENCY_SPECIFIC';
  usageLimit?: number;
  singleUse?: boolean;
  startDate?: Date;
  endDate?: Date;
  applicablePlan?: string;
  applicableUserId?: number;
  applicableAgencyId?: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'EXHAUSTED' | 'USED';
}

// Discount calculation result matching backend
export interface DiscountCalculationResult {
  valid: boolean;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  discountPercentage: number;
  code: string;
  message?: string;
}

// Discount code usage response
export interface DiscountCodeUsageResponse {
  id: number;
  userId: number;
  userEmail: string;
  subscriptionTier: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentId?: number;
  usedAt: Date;
  ipAddress?: string;
}

// Subscription plan entity - matches backend SubscriptionPlanResponse
export interface SubscriptionPlan {
  id: number;
  code: string;
  displayName: string;
  description: string;
  priceInPen: number;
  priceInUsd: number;
  currency: string;
  durationDays: number;
  publicationsLimit: number;
  projectsLimit: number;
  photosLimit: number;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'LIFETIME';
  features: string[];
  createdAt: Date;
  updatedAt: Date;
  agencyDiscountCount?: number;
  // Legacy field mapping for backwards compatibility
  name?: string;
  limits?: {
    properties: number;
    projects: number;
    photos: number;
    featuredListings: number;
  };
}

// Agency-specific discount for a plan
export interface AgencyPlanDiscount {
  id: number;
  agencyId: number;
  agencyName?: string;
  planId: number;
  planName?: string;
  originalPricePen: number;
  originalPriceUsd: number;
  customPricePen?: number;
  customPriceUsd?: number;
  discountPercentage?: number;
  finalPrice: number;
  notes?: string;
  validFrom?: Date;
  validUntil?: Date;
  isActive: boolean;
  isValid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Subscription entity
export interface Subscription {
  id: number;
  userId: number;
  tier: string;
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED';
  startDate: Date;
  endDate?: Date;
  paymentMethod: string;
  price: number;
  currency: string;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Admin subscription entity with additional user information
export interface AdminSubscription extends Subscription {
  userEmail: string;
  amount: number;
}

// Payment transaction entity
export interface PaymentTransaction {
  id: number;
  userId: number;
  subscriptionId?: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentId?: string;
  referenceId?: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction entity for admin finance view (matches backend response)
export interface Transaction {
  id: number;
  userId: number;
  userEmail: string;
  type: 'PAYMENT' | 'REFUND' | 'CREDIT';
  amount: number;
  currency: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  description: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt?: string;
}

// Wallet entity
export interface Wallet {
  id: number;
  userId: number;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

// Finance stats for admin
export interface FinanceStatsDto {
  totalRevenue: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  newSubscriptionsToday: number;
  totalTransactions: number;
  transactionsToday: number;
  averageTransactionValue: number;
  refundsTotal: number;
  refundsCount: number;
  totalWalletBalance: number;
}

// Admin sidebar section
export interface AdminSidebarSection {
  title: string;
  department: DepartmentType;
  items: AdminNavItem[];
}
