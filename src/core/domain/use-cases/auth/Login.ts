import { IAuthRepository } from '../../repositories';
import { AuthResponse } from '../../entities';

export class LoginUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(email: string, password: string): Promise<AuthResponse> {
    if (!email || !password) {
      throw new Error('Email y contraseña requeridos');
    }
    return this.authRepository.login(email, password);
  }
}
