// src/core/domain/repositories/IIdentityRepository.ts
import { User } from '../entities/User';
import { IdentityValidationResponse } from '../../application/dtos/IdentityDTO';

export interface IIdentityRepository {
  // Validación KYC (RENIEC/SUNAT)
  validateDni(dni: string): Promise<IdentityValidationResponse>;
  validateRuc(ruc: string): Promise<IdentityValidationResponse>;
  
  // Completar verificación KYC
  completeKyc(userId: number, documents: FormData): Promise<User>;
  
  // Upgrade de rol (USER → DEVELOPER/AGENT)
  upgradeToDeveloper(userId: number, ruc: string): Promise<User>;
  upgradeToAgent(userId: number, documents: FormData): Promise<User>;
  
  // Verificar estado KYC del usuario
  getKycStatus(userId: number): Promise<{ isVerified: boolean; level: 'BASIC' | 'FULL' }>;
}
