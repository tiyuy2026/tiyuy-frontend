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
  subscribeToPlan(planId: string, paymentMethod: 'CARD' | 'MERCADOPAGO'): Promise<ActiveSubscription>;
}
