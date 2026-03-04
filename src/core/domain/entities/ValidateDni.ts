export enum ProfileType {
  USUARIO = 'USUARIO',
  AGENTE = 'AGENTE', 
  DESARROLLADOR = 'DESARROLLADOR',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  profile?: ProfileType;
  isKycVerified?: boolean;
  isRucVerified?: boolean;
  createdAt: Date;
  fullName?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
