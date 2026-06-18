export type UserRole = 'USER' | 'AGENT' | 'DEVELOPER' | 'ADMIN' | 'SUPER_ADMIN' | 'SUPPORT';
export type ProfileType = UserRole;

export type AdminRoleType = 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT';

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
  photoUrl?: string;  // Foto de perfil desde el backend
  avatar?: string;  // Avatar URL (opcional)
  // Verificación de identidad
  isVerified?: boolean;
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
  ruc?: string;
  fullName?: string;
  city?: string;
  address?: string;
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
  // Admin specific fields (only present when role is ADMIN)
  adminRoleType?: AdminRoleType;
  permissions?: string[];
  departments?: string[];
  isActive?: boolean;
}

