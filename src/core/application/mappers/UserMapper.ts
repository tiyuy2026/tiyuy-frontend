import { User, AuthResponse, UserRole } from '@/core/domain/entities/User';
import { AuthResponseDTO, UserResponseDTO } from '../dtos/AuthDTO';

export class UserMapper {
  static authResponseToDomain(dto: AuthResponseDTO): AuthResponse {
    return {
      token: dto.token,
      type: dto.type,
      userId: dto.userId,
      email: dto.email,
      role: dto.role as UserRole,
      firstName: dto.firstName,
      lastName: dto.lastName,
    };
  }

  static userResponseToDomain(dto: UserResponseDTO): User {
    return {
      id: dto.id,
      email: dto.email,
      phone: dto.phone,
      firstName: dto.firstName,
      lastName: dto.lastName,
      dni: dto.dni,
      role: dto.role as UserRole,
      emailVerified: dto.emailVerified,
      phoneVerified: dto.phoneVerified,
      publishedPropertiesCount: dto.publishedPropertiesCount,
      createdAt: new Date(dto.createdAt),
    };
  }
}
