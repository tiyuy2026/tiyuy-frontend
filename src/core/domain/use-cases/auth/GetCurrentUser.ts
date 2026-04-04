import { IAuthRepository } from '../../repositories/IAuthRepository';
import { User } from '../../entities/User';

export class GetCurrentUserUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(token: string): Promise<User> {
    return await this.authRepository.getCurrentUser(token);
  }
}
