/**
 * Agent Discount domain entities
 * Manages discount assignments to specific agents
 */

export interface AgentDiscount {
  id: number;
  agentId: number;
  discountCodeId: number;
  discountCode: DiscountCode;
  status: AgentDiscountStatus;
  assignedAt: string;
  assignedBy: number;
  expiresAt?: string;
  usedAt?: string;
  usageCount: number;
  maxUsage?: number;
}

export type AgentDiscountStatus = 'ACTIVE' | 'EXPIRED' | 'USED' | 'CANCELLED';

export interface DiscountCode {
  id: number;
  code: string;
  discountPercentage: number;
  applicability: 'GLOBAL' | 'PLAN_SPECIFIC' | 'USER_SPECIFIC' | 'PROJECT_SPECIFIC' | 'AGENCY_SPECIFIC';
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'EXHAUSTED' | 'USED';
  usageLimit?: number;
  currentUsage: number;
  singleUse: boolean;
  startDate: string;
  endDate: string;
  applicablePlan?: string;
  applicableUserId?: number;
  applicableAgencyId?: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  createdBy: number;
}

export interface AssignDiscountToAgentRequest {
  agentId: number;
  discountCodeId: number;
  maxUsage?: number;
  expiresAt?: string;
  notes?: string;
}

export interface AgentDiscountFilters {
  agentId?: number;
  discountCodeId?: number;
  status?: AgentDiscountStatus;
  assignedBy?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface AgentDiscountSummary {
  totalDiscounts: number;
  activeDiscounts: number;
  expiredDiscounts: number;
  usedDiscounts: number;
  totalSavings: number;
  averageDiscount: number;
  mostUsedDiscount?: {
    code: string;
    usageCount: number;
    totalSavings: number;
  };
}

export interface CreateAgentDiscountRequest {
  agentId: number;
  discountCode: {
    code: string;
    discountPercentage: number;
    applicability: 'USER_SPECIFIC';
    status: 'ACTIVE';
    usageLimit?: number;
    singleUse: boolean;
    startDate: string;
    endDate: string;
    applicableUserId: number;
    minimumAmount?: number;
    maximumDiscount?: number;
  };
}
