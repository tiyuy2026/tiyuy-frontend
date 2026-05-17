import { IFinanceRepository } from '../../repositories/IFinanceRepository';
import { ActiveSubscription } from '../../entities/Wallet';

export class SubscribeToPlan {
  constructor(private financeRepository: IFinanceRepository) {}

  async execute(planId: string | number, paymentMethod: 'CARD' | 'MERCADOPAGO', discountCode?: string): Promise<ActiveSubscription> {
    return await this.financeRepository.subscribeToPlan(planId, paymentMethod, discountCode);
  }
}
