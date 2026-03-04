import { apiClient } from '../api/axios-client';
import { IFinanceRepository } from '@/core/domain/repositories/IFinanceRepository';
import { Wallet, WalletTransaction, SubscriptionPlan, ActiveSubscription } from '@/core/domain/entities/Wallet';
import { ENDPOINTS } from '../api/endpoints';
import {
  WalletResponseDTO,
  WalletTransactionsPageDTO,
  SubscriptionPlanDTO,
  ActiveSubscriptionDTO,
} from '@/core/application/dtos/FinanceDTO';

export class FinanceRepository implements IFinanceRepository {
  async getWalletBalance(): Promise<Wallet> {
    const response = await apiClient.get<WalletResponseDTO>('/finance/wallet');
    
    return {
      balance: response.data.balance,
      currency: response.data.currency,
      availableCredits: response.data.availableCredits || 0,
      totalCreditsPurchased: response.data.totalCreditsPurchased || 0,
      totalSpent: response.data.totalSpent || 0,
    };
  }

  async getWalletTransactions(page = 0, size = 20): Promise<{
    content: WalletTransaction[];
    totalElements: number;
    totalPages: number;
  }> {
    const response = await apiClient.get<WalletTransactionsPageDTO>(
      '/finance/wallet/transactions',
      { params: { page, size, sort: 'createdAt,desc' } }
    );

    return {
      content: response.data.content.map((item) => ({
        id: item.id,
        type: item.type as any,
        amount: item.amount,
        currency: item.currency,
        status: item.status as any,
        description: item.description,
        createdAt: new Date(item.createdAt),
      })),
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
    };
  }

  async getActiveSubscription(): Promise<ActiveSubscription | null> {
    try {
      const response = await apiClient.get<any>(ENDPOINTS.FINANCE.SUBSCRIPTIONS.ACTIVE);
      const data = response.data;

      if (!data || !data.isActive) return null;

      return {
        id: data.id,
        plan: {
          id: data.tier,
          name: data.tier,
          description: data.tier,
          price: 0,
          currency: 'PEN',
          durationDays: 30,
          features: [],
          maxPublications: data.publicationsLimit,
          isFeatured: false,
        },
        status: data.isActive ? 'ACTIVE' : 'EXPIRED',
        startsAt: new Date(data.startDate),
        expiresAt: new Date(data.endDate),
        remainingPublications: data.publicationsLimit - data.publicationsUsed,
      };
    } catch (error: any) {
      if (error?.response?.status === 204 || error?.response?.status === 404) {
        return null;
      }
      return null;
    }
  }

  async hasUserUsedFreePlan(userId: number): Promise<boolean> {
    const response = await apiClient.get(
      `${ENDPOINTS.FINANCE.SUBSCRIPTIONS.FREE_PLAN_USED}?userId=${userId}`
    );
    return response.data;
  }

  async getAvailablePlans(): Promise<SubscriptionPlan[]> {
    const response = await apiClient.get<SubscriptionPlanDTO[]>(ENDPOINTS.FINANCE.SUBSCRIPTIONS.PLANS);
    return response.data;
  }

  async createMercadoPagoPreference(subscriptionId: string): Promise<any> {
    const response = await apiClient.post('/finance/mercadopago/create-preference', {
      subscriptionId,
    });
    return response.data;
  }

  async subscribeToPlan(planId: string, paymentMethod: 'CARD' | 'MERCADOPAGO'): Promise<ActiveSubscription> {
    const response = await apiClient.post<ActiveSubscriptionDTO>(ENDPOINTS.FINANCE.SUBSCRIPTIONS.SUBSCRIBE, {
      tier: planId, // Cambiado de planId a tier para coincidir con backend
      paymentMethod,
    });

    const data = response.data;
    return {
      id: data.id,
      plan: data.plan,
      status: data.status as any,
      startsAt: new Date(data.startsAt),
      expiresAt: new Date(data.expiresAt),
      remainingPublications: data.remainingPublications,
    };
  }
}
