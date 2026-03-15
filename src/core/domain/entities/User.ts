export type UserRole = 'USER' | 'AGENT' | 'DEVELOPER' | 'ADMIN';
export type ProfileType = UserRole;

export interface User {
  id: number;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  dni: string;
  role: UserRole;
  emailVerified: boolean;
  phoneVerified: boolean;
  publishedPropertiesCount: number;
  createdAt: Date;
  // Campos del perfil extendido
  address?: string;
  city?: string;
  country?: string;
  bio?: string;
  avatar?: string;
}

// No necesitamos UserProfile separado, ya está incluido en User

export interface UserCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  dni: string;
  role?: UserRole;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

