import { Wallet, WalletTransaction, SubscriptionPlan, ActiveSubscription } from '../entities/Wallet';

export interface IFinanceRepository {
  getWalletBalance(): Promise<Wallet>;
  getWalletTransactions(page?: number, size?: number): Promise<{
    content: WalletTransaction[];
    totalElements: number;
    totalPages: number;
  }>;
  getActiveSubscription(): Promise<ActiveSubscription | null>;
  getAvailablePlans(): Promise<SubscriptionPlan[]>;
  hasUserUsedFreePlan(userId: number): Promise<boolean>;
  createMercadoPagoPreference(subscriptionId: string): Promise<any>;
  subscribeToPlan(planId: string, paymentMethod: 'CARD' | 'MERCADOPAGO', discountCode?: string): Promise<ActiveSubscription>;
  getAvailableDeveloperDiscountCodes(): Promise<{
    id: number;
    code: string;
    discountPercentage: number;
    maxUses: number | null;
    usedCount: number;
    status: string;
    validFrom: string;
    validUntil: string | null;
  }[]>;
}
