import { IFinanceRepository } from '../../repositories/IFinanceRepository';
import { Wallet } from '../../entities/Wallet';

export class GetWalletBalance {
  constructor(private financeRepository: IFinanceRepository) {}

  async execute(): Promise<Wallet> {
    return await this.financeRepository.getWalletBalance();
  }
}
