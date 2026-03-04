import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { AuthRepository } from '@/infrastructure/repositories';
import { LoginUseCase } from '@/core/domain/use-cases/auth/Login';
import { RegisterUseCase } from '@/core/domain/use-cases/auth/Register';
import { authStorage } from '@/infrastructure/storage';
import { User, AuthResponse, RegisterData } from '@/core/domain/entities';
import { emailService } from '@/services/emailService';

const authRepository = new AuthRepository();
const loginUseCase = new LoginUseCase(authRepository);
const registerUseCase = new RegisterUseCase(authRepository);

export const useAuth = () => {
  const router = useRouter();
  const { setAuth, logout: logoutStore, setLoading, setError, clearError } = useAuthStore();
  const { user, token, isAuthenticated, isLoading: storeLoading, error: storeError } = useAuthStore();

  const login = async (email: string, password: string) => {
    try {
      console.log('useAuth: Iniciando login con:', email);
      setLoading(true);
      clearError();

      const response: AuthResponse = await loginUseCase.execute(email, password);
      console.log('useAuth: Respuesta del backend:', response);

      // Crear User desde AuthResponse del backend
      const userData: User = {
        id: response.userId,
        email: response.email,
        phone: '',
        firstName: response.firstName,
        lastName: response.lastName,
        dni: '',
        role: response.role,
        emailVerified: false,
        phoneVerified: false,
        publishedPropertiesCount: 0,
        createdAt: new Date(),
      };

      console.log('useAuth: Guardando token y usuario, redirigiendo al home');
      authStorage.setToken(response.token);
      authStorage.setUser(userData);
      setAuth(response.token, userData);
      console.log('useAuth: Token guardado en authStorage:', response.token);
      console.log('useAuth: Usuario guardado en authStorage:', userData);
      console.log('useAuth: Ejecutando router.replace("/")');
      router.replace('/');
      console.log('useAuth: Router.replace ejecutado, intentando redirección forzada...');
      setTimeout(() => {
        window.location.assign('/');
      }, 100);
    } catch (err: any) {
      console.log('useAuth: Error en login:', err);
      setError(err.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (registerData: RegisterData) => {
    try {
      setLoading(true);
      clearError();

      const response: AuthResponse = await authRepository.register(registerData);

      // Crear User desde AuthResponse
      const userData: User = {
        id: response.userId,
        email: response.email,
        phone: registerData.phone || '',
        firstName: response.firstName,
        lastName: response.lastName,
        dni: registerData.dni,
        role: response.role,
        emailVerified: false,
        phoneVerified: false,
        publishedPropertiesCount: 0,
        createdAt: new Date(),
      };

      authStorage.setToken(response.token);
      authStorage.setUser(userData);
      setAuth(response.token, userData);

      // Enviar email de bienvenida
      try {
        await emailService.sendWelcomeEmail({
          firstName: response.firstName,
          lastName: response.lastName,
          email: response.email,
          role: response.role
        });
        console.log('Email de bienvenida enviado exitosamente');
      } catch (emailError) {
        console.error('Error al enviar email de bienvenida:', emailError);
        // No fallamos el registro si el email no se envía
      }

      router.push('/dashboard'); // Ir directamente al dashboard
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authStorage.clear();
    logoutStore();
    router.push('/login');
  };

  const checkAuth = async () => {
    const savedToken = authStorage.getToken();
    const savedUser = authStorage.getUser();

    if (savedToken && savedUser) {
      setAuth(savedToken, savedUser as User);
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading: storeLoading,
    error: storeError,
    login,
    register,
    logout,
    checkAuth,
    clearError,
  };
};
