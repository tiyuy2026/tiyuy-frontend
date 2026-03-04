export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface RegisterRequestDTO {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  dni: string;
  role: string;
}

export interface AuthResponseDTO {
  token: string;
  type: string;
  userId: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export interface UserResponseDTO {
  id: number;
  email: string;
  phone: string;
  role: string;
  firstName: string;
  lastName: string;
  dni: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  publishedPropertiesCount: number;
  createdAt: string;
}
