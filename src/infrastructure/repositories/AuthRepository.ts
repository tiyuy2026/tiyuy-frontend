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
      // Manejar errores específicos de login
      const status = error.response?.status;
      const data = error.response?.data;
      
      if (status === 401) {
        if (data?.message?.toLowerCase().includes('contraseña') || data?.message?.toLowerCase().includes('password')) {
          throw new Error('La contraseña es incorrecta. Por favor, inténtalo de nuevo.');
        } else if (data?.message?.toLowerCase().includes('correo') || data?.message?.toLowerCase().includes('email')) {
          throw new Error('El correo electrónico no está registrado.');
        } else {
          throw new Error('Credenciales incorrectas. Verifica tu correo y contraseña.');
        }
      }
      
      if (status === 403) {
        throw new Error('Tu cuenta está suspendida. Contacta con soporte.');
      }
      
      if (status === 429) {
        throw new Error('Demasiados intentos. Espera un momento y vuelve a intentar.');
      }
      
      throw new Error(data?.message || 'Error al iniciar sesión. Inténtalo nuevamente.');
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

  async checkGoogleEmailExists(email: string): Promise<{ exists: boolean }> {
    try {
      const response = await axiosClient.post<{ exists: boolean }>(AUTH_ENDPOINTS.GOOGLE_CHECK_EMAIL, { email });
      return response.data;
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 404) {
        return { exists: false };
      }
      throw new Error('Error al verificar email con Google');
    }
  }

  async loginWithGoogle(email: string, firstName: string, lastName: string, uid: string): Promise<AuthResponse> {
    try {
      const response = await axiosClient.post<AuthResponse>(AUTH_ENDPOINTS.GOOGLE_LOGIN, {
        email,
        firstName,
        lastName,
        uid,
      });
      return response.data;
    } catch (error: any) {
      const status = error.response?.status;
      const data = error.response?.data;
      
      if (status === 401) {
        throw new Error('No se pudo autenticar con Google. Por favor, regístrate primero.');
      }
      
      if (status === 404) {
        throw new Error('Usuario no encontrado. Por favor, regístrate primero.');
      }
      
      throw new Error(data?.message || 'Error al iniciar sesión con Google');
    }
  }
}
