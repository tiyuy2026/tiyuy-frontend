import axiosClient from '../api/axios-client';
import { AUTH_ENDPOINTS } from '../api/endpoints';
import { IAuthRepository } from '@/core/domain/repositories';
import { User, AuthResponse, RegisterData } from '@/core/domain/entities';

export class AuthRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axiosClient.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, {
        email,
        password,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  }

  async register(registerData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axiosClient.post<AuthResponse>(
        AUTH_ENDPOINTS.REGISTER,
        registerData
      );
      return response.data;
    } catch (error: any) {
      // Manejar error 409 - Email ya registrado
      if (error.response?.status === 409) {
        throw new Error('Este email ya esta registrado. Intenta iniciar sesion.');
      }
      
      // Manejar diferentes tipos de error del backend
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (typeof errorData === 'string') {
          throw new Error(errorData);
        }
        
        if (errorData.message) {
          throw new Error(errorData.message);
        }
        
        if (errorData.error) {
          throw new Error(errorData.error);
        }
        
        if (Array.isArray(errorData)) {
          throw new Error(errorData.join(', '));
        }
        
        if (typeof errorData === 'object' && errorData !== null) {
          const errors = Object.values(errorData).join(', ');
          throw new Error(errors);
        }
      }
      
      // Error de red o sin respuesta
      if (error.code === 'ECONNABORTED') {
        throw new Error('Tiempo de espera agotado. Intentalo nuevamente');
      }
      
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Error de conexion. Verifica tu internet');
      }
      
      // Error 400 generico
      if (error.response?.status === 400) {
        throw new Error('Datos invalidos. Revisa todos los campos');
      }
      
      throw new Error('Error al registrar usuario');
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await axiosClient.put<User>(AUTH_ENDPOINTS.UPDATE_PROFILE, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar perfil');
    }
  }

  async getCurrentUser(token: string): Promise<User> {
    try {
      const response = await axiosClient.get<User>(AUTH_ENDPOINTS.ME, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener usuario');
    }
  }
}
