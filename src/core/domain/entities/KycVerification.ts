export interface DniValidationResponse {
  success: boolean;
  dni: string;
  firstName: string;
  lastName: string;
  fullName: string;
  birthDate?: string;
  message: string;
  alreadyRegistered?: boolean;
}

export interface RucValidationResponse {
  success: boolean;
  ruc: string;
  companyName: string;
  fullName: string;
  message: string;
  alreadyRegistered?: boolean;
}

export interface KycVerification {
  id: string;
  userId: string;
  dni?: string;
  ruc?: string;
  verifiedFullName: string;
  documentType: 'DNI' | 'RUC';
  isDniVerified: boolean;
  isRucVerified: boolean;
  verificationProvider: 'APIPERU';
  createdAt: Date;
}
