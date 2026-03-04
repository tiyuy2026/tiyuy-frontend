import { IAuthRepository } from '../../repositories/IAuthRepository';
import { RegisterData, AuthResponse } from '../../entities/User';

export class RegisterUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(data: RegisterData): Promise<AuthResponse> {
    // Validaciones
    if (!data.email || !data.password || !data.firstName || !data.lastName || !data.dni) {
      throw new Error('Todos los campos son obligatorios');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Email inválido');
    }

    if (data.password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    if (data.dni.length !== 8) {
      throw new Error('DNI debe tener 8 dígitos');
    }

    if (data.phone.length !== 9) {
      throw new Error('Teléfono debe tener 9 dígitos');
    }

    return await this.authRepository.register(data);
  }
}
