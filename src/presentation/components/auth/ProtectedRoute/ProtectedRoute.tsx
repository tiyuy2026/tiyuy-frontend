'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/presentation/store/authStore';
import { authStorage } from '@/infrastructure/storage';
import { AuthRepository } from '@/infrastructure/repositories';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'USER' | 'AGENT' | 'DEVELOPER' | 'ADMIN' | 'SUPER_ADMIN' | 'SUPPORT';
  requiredRoles?: ('USER' | 'AGENT' | 'DEVELOPER' | 'ADMIN' | 'SUPER_ADMIN' | 'SUPPORT')[];
}

export function ProtectedRoute({ children, requiredRole, requiredRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, setAuth, setAdminProfile } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  const allowedRoles = requiredRoles || (requiredRole ? [requiredRole] : []);

  useEffect(() => {
    const token = authStorage.getToken();
    const savedUser = authStorage.getUser();

    if (token && savedUser) {
      setAuth(token, savedUser);

      const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'SUPPORT'];
      if (savedUser && adminRoles.includes(savedUser.role)) {
        const authRepo = new AuthRepository();
        authRepo.getAdminProfile()
          .then((profile: any) => {
            if (profile) {
              setAdminProfile(
                profile.adminRoleType,
                profile.departments || [],
                profile.permissions || [],
                profile.isActive
              );
            }
          })
          .catch((err: any) => {
            console.error('Error refreshing admin profile:', err);
          });
      }
    }

    setIsInitializing(false);
  }, []);

  useEffect(() => {
    if (isInitializing) return;

    if (!isAuthenticated) {
      console.log('ProtectedRoute: No autenticado, redirigiendo a login');
      router.push('/login');
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role as any)) {
      console.log('ProtectedRoute: Rol no coincide, redirigiendo a acceso denegado');
      // En lugar de redirigir a dashboard, mostrar mensaje de acceso denegado
      return;
    }
  }, [isAuthenticated, user, allowedRoles, router, isInitializing]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Acceso Restringido</h2>
            <p className="text-teal-100 text-sm">Debes iniciar sesión para continuar</p>
          </div>

          {/* Body */}
          <div className="px-6 py-6 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-800">Esta sección es privada</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Para acceder a esta página necesitas una cuenta con los permisos adecuados.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-200"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => router.push('/register')}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
              >
                Crear una Cuenta
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center">
              ¿No tienes cuenta? Regístrate para acceder a todas las funcionalidades.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role as any)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
            <p className="text-gray-600">
              No tienes permisos para acceder a esta sección.
            </p>
            <button
              onClick={() => router.back()}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
