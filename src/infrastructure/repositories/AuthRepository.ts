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
      console.log('Enviando datos al backend:', registerData);
      
      const response = await axiosClient.post<AuthResponse>(
        AUTH_ENDPOINTS.REGISTER,
        registerData
      );
      
      console.log('Respuesta del backend:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error completo en register:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Response headers:', error.response?.headers);
      
      // Manejar diferentes tipos de error
      if (error.response?.data) {
        const errorData = error.response.data;
        
        console.log('Tipo de errorData:', typeof errorData, errorData);
        
        // Si el error es un string simple
        if (typeof errorData === 'string') {
          throw new Error(errorData);
        }
        
        // Si el error tiene un campo message
        if (errorData.message) {
          throw new Error(errorData.message);
        }
        
        // Si el error tiene otros campos
        if (errorData.error) {
          throw new Error(errorData.error);
        }
        
        // Si es un array de errores (validación)
        if (Array.isArray(errorData)) {
          throw new Error(errorData.join(', '));
        }
        
        // Si es un objeto con múltiples errores
        if (typeof errorData === 'object' && errorData !== null) {
          const errors = Object.values(errorData).join(', ');
          throw new Error(errors);
        }
      }
      
      // Error de red o sin respuesta
      if (error.code === 'ECONNABORTED') {
        throw new Error('Tiempo de espera agotado. Inténtalo nuevamente');
      }
      
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Error de conexión. Verifica tu internet');
      }
      
      // Error 400 genérico
      if (error.response?.status === 400) {
        throw new Error('Datos inválidos. Revisa todos los campos');
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
