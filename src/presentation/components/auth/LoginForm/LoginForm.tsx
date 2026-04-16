'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/presentation/hooks';
import { useGoogleAuth } from '@/presentation/hooks/useGoogleAuth';
import { Button, Input, InfoDialog } from '@/presentation/components/ui';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();
  const { signInWithGoogle, loading: googleLoading, error: googleError } = useGoogleAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);
  const [infoDialog, setInfoDialog] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  const validateForm = () => {
    console.log('LoginForm: validateForm llamado');
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email invalido';
    }

    if (!formData.password) {
      errors.password = 'La contrasena es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'Minimo 6 caracteres';
    }

    console.log('LoginForm: errores de validacion:', errors);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('LoginForm: Intentando iniciar sesión con:', formData.email);
    clearError();

    if (!validateForm()) return;

    try {
      await login(formData.email, formData.password);
      console.log('LoginForm: Login exitoso, redirigiendo al dashboard');
    } catch (err) {
      console.log('LoginForm: Error en login:', err);
      // Error manejado por el hook
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo al escribir
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/profile-selector');
  };

  const handleGoogleSignIn = async () => {
    try {
      const googleUserData = await signInWithGoogle();
      
      if (googleUserData) {
        setInfoDialog({ isOpen: true, message: 'Registrate primero con Google para continuar' });
        console.log('LoginForm: Datos de Google obtenidos:', googleUserData);
      }
    } catch (error) {
      console.error('LoginForm: Error en login con Google:', error);
    }
  };

  return (
    <>
    <InfoDialog
      isOpen={infoDialog.isOpen}
      onClose={() => setInfoDialog({ isOpen: false, message: '' })}
      title="Registro Requerido"
      message={infoDialog.message}
      variant="info"
    />
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          Bienvenido
        </h1>
        <p className="text-gray-600">Inicia sesion en tu cuenta</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="relative animate-in slide-in-from-top-2 fade-in-0 duration-300">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3 shadow-sm">
              <div className="flex-shrink-0 w-5 h-5 mt-0.5 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{error}</p>
                <p className="text-xs text-red-600 mt-1 opacity-75">Este mensaje desaparecerá en 5 segundos</p>
              </div>
              <button
                onClick={clearError}
                className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-100"
                title="Cerrar mensaje"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <Input
          type="email"
          name="email"
          label="Email"
          placeholder="tu@email.com"
          value={formData.email}
          onChange={handleChange}
          error={validationErrors.email}
          required
          leftIcon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          }
        />

        <Input
          type="password"
          name="password"
          label="Contrasena"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={validationErrors.password}
          required
          leftIcon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-gray-600">Recordarme</span>
          </label>
          <Link href="/recover-password" className="text-blue-600 hover:text-blue-700 font-medium">
            Olvide mi contrasena
          </Link>
        </div>

        <Button 
  type="submit" 
  variant="primary" 
  size="lg" 
  fullWidth 
  isLoading={isLoading}
  onClick={(e) => {
    console.log('LoginForm: Boton Iniciar Sesion clickeado');
  }}
>
  Iniciar Sesion
</Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">O continua con</span>
          </div>
        </div>

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

        {/* Mostrar error de Google si existe */}
        {googleError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mt-4">
            {googleError}
          </div>
        )}

        <div className="text-center space-y-4">
          <a 
            href="/recover-password"
            className="block text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Olvide mi contrasena
          </a>
          
          <p className="text-sm text-gray-600">
            No tienes cuenta?{' '}
            <button 
              onClick={handleRegisterClick}
              className="text-blue-600 hover:text-blue-700 font-semibold underline bg-transparent border-none cursor-pointer"
            >
              Registrate aqui
            </button>
          </p>
        </div>
      </form>
    </div>
    </>
  );
};
