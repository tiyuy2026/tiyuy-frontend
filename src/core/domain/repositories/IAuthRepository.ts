import { User, AuthResponse } from '../entities';

export interface IAuthRepository {
  login(email: string, password: string): Promise<AuthResponse>;
  register(registerData: any): Promise<AuthResponse>;
  getCurrentUser(token: string): Promise<User>;
  checkGoogleEmailExists(email: string): Promise<{ exists: boolean }>;
  loginWithGoogle(email: string, firstName: string, lastName: string, uid: string): Promise<AuthResponse>;
}
