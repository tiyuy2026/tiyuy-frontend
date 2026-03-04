// src/core/application/dtos/IdentityDTO.ts

export interface IdentityValidationResponse {
  success: boolean;
  dni?: string;
  ruc?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  message: string;
  alreadyRegistered: boolean;
}
