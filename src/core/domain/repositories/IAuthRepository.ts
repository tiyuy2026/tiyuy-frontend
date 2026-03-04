import { User, AuthResponse } from '../entities';

export interface IAuthRepository {
  login(email: string, password: string): Promise<AuthResponse>;
  register(registerData: any): Promise<AuthResponse>;
  getCurrentUser(token: string): Promise<User>;
}
