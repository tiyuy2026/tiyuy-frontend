import { IFinanceRepository } from '../../repositories/IFinanceRepository';
import { WalletTransaction } from '../../entities/Wallet';

export class GetWalletTransactions {
  constructor(private financeRepository: IFinanceRepository) {}

  async execute(page: number = 0, size: number = 20): Promise<{
    content: WalletTransaction[];
    totalElements: number;
    totalPages: number;
  }> {
    return await this.financeRepository.getWalletTransactions(page, size);
  }
}
