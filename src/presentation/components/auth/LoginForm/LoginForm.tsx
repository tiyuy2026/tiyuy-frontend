'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/presentation/hooks';
import { useGoogleAuth, GoogleUserData } from '@/presentation/hooks/useGoogleAuth';
import { Button, Input, InfoDialog } from '@/presentation/components/ui';
import { AuthErrorBanner } from '@/presentation/components/auth/shared';
import { User } from '@/core/domain/entities';
import { authStorage } from '@/infrastructure/storage';
import { useAuthStore } from '@/presentation/store/authStore';

/** Mínimo de caracteres para contraseñas en toda la aplicación */
const MIN_PASSWORD_LENGTH = 8;

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();
  const { signInWithGoogleComplete, loading: googleLoading, error: googleError } = useGoogleAuth();
  const { setAuth } = useAuthStore();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [infoDialog, setInfoDialog] = useState<{
    isOpen: boolean;
    message: string;
    showRegisterButton?: boolean;
    googleData?: GoogleUserData;
  }>({ isOpen: false, message: '' });

  // ─── Validación ────────────────────────────────────────────────────────────

  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El correo electrónico no es válido';
    }

    if (!formData.password) {
      errors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `La contraseña debe tener mínimo ${MIN_PASSWORD_LENGTH} caracteres`;
    }

    return errors;
  };

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const newErrors = validateForm();
    setValidationErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    await login(formData.email, formData.password);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpiar el error del campo al escribir
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogleComplete();

      if (result.verificationError) {
        // Si la verificación de email falló por un error técnico, no sugerimos registrarse.
        return;
      }

      if (result.exists && result.authResponse) {
        // Usuario existe → login exitoso
        const userData: User = {
          id: result.authResponse.userId,
          email: result.authResponse.email,
          phone: '',
          firstName: result.authResponse.firstName,
          lastName: result.authResponse.lastName,
          dni: '',
          role: result.authResponse.role,
          emailVerified: false,
          phoneVerified: false,
          publishedPropertiesCount: 0,
          createdAt: new Date(),
        };

        const adminData = result.authResponse.adminRoleType
          ? {
              adminRoleType: result.authResponse.adminRoleType,
              permissions: result.authResponse.permissions,
              departments: result.authResponse.departments,
              isActive: result.authResponse.isActive,
            }
          : undefined;

        authStorage.setToken(result.authResponse.token);
        authStorage.setUser(userData);
        setAuth(result.authResponse.token, userData, adminData);

        const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'SUPPORT'];
        const isAdminUser = result.authResponse.adminRoleType !== undefined || adminRoles.includes(result.authResponse.role);
        const targetRoute = isAdminUser ? '/admin' : '/';

        router.replace(targetRoute);
        setTimeout(() => window.location.assign(targetRoute), 100);
      } else if (result.loginError && result.userData) {
        // Hubo un error relacionado con el login de Google; mostrarlo sin forzar registro.
        setInfoDialog({
          isOpen: true,
          message: result.loginError,
          showRegisterButton: false,
          googleData: undefined,
        });
      } else if (!result.exists && result.userData) {
        // Usuario no existe → ofrecer registro con datos pre-cargados
        setInfoDialog({
          isOpen: true,
          message: `El correo ${result.userData.email} no está registrado. ¿Deseas registrarte ahora?`,
          showRegisterButton: true,
          googleData: result.userData,
        });
      }
    } catch {
      // El error se maneja en el hook useGoogleAuth y se expone en googleError
    }
  };

  const handleRegisterFromDialog = () => {
    if (infoDialog.googleData) {
      sessionStorage.setItem('googleRegistrationData', JSON.stringify(infoDialog.googleData));
    }
    setInfoDialog({ isOpen: false, message: '' });
    router.push('/profile-selector');
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <InfoDialog
        isOpen={infoDialog.isOpen}
        onClose={() => setInfoDialog({ isOpen: false, message: '' })}
        title="Registro Requerido"
        message={infoDialog.message}
        variant="info"
        showRegisterButton={infoDialog.showRegisterButton}
        onRegister={handleRegisterFromDialog}
      />

      <div className="w-full max-w-md">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Bienvenido
          </h1>
          <p className="text-gray-600">Inicia sesión en tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Error de API */}
          <AuthErrorBanner error={error} onClose={clearError} autoDismissSeconds={5} />

          {/* Error de Google */}
          <AuthErrorBanner error={googleError} />

          {/* Email */}
          <Input
            type="email"
            name="email"
            label="Correo electrónico"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={handleChange}
            error={validationErrors.email}
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
            }
          />

          {/* Contraseña con toggle show/hide */}
          <Input
            type={showPassword ? 'text' : 'password'}
            name="password"
            label="Contraseña"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={validationErrors.password}
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            }
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            }
          />

          {/* Recordarme + Link olvidé contraseña (solo una vez) */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-600">Recordarme</span>
            </label>
            <Link href="/recover-password" className="text-blue-600 hover:text-blue-700 font-medium">
              ¿Olvidé mi contraseña?
            </Link>
          </div>

          {/* Botón submit */}
          <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
            Iniciar Sesión
          </Button>

          {/* Divisor */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">O continúa con</span>
            </div>
          </div>

          {/* Botón Google */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            fullWidth
            onClick={handleGoogleSignIn}
            isLoading={googleLoading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {googleLoading ? 'Conectando...' : 'Google'}
          </Button>

          {/* Link a registro */}
          <p className="text-center text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link
              href="/profile-selector"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Regístrate aquí
            </Link>
          </p>
        </form>
      </div>
    </>
  );
};
