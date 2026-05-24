'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authStorage } from '@/infrastructure/storage';
import { useAuthStore } from '@/presentation/store/authStore';

interface Props {
  paymentId: string;
}

export function PaymentConfirmationClient({ paymentId }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();
  
  const status = searchParams.get('status');
  const subscriptionId = searchParams.get('subscription_id');
  const isSuccess = status === 'approved';

  useEffect(() => {
    // 1. Restaurar sesión desde localStorage
    const token = authStorage.getToken();
    const savedUser = authStorage.getUser();
    if (token && savedUser) {
      setAuth(token, savedUser);
    }

    if (isSuccess) {
      // 2. Limpiar TODO el cache para forzar refetch fresco
      queryClient.invalidateQueries({ queryKey: ['subscription', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.removeQueries({ queryKey: ['subscription', 'active'] });

      // 3. Redirigir a plans después de 3 segundos para ver el plan activado
      const timer = setTimeout(() => {
        router.push('/plans');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, queryClient, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md bg-white rounded-2xl shadow-lg">
        {isSuccess ? (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">
              ¡Pago exitoso!
            </h1>
            <p className="text-gray-600 mb-2">
              Tu plan ha sido activado correctamente.
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Redirigiendo en 3 segundos...
            </p>
            <button
              onClick={() => router.push('/plans')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Ver mi plan ahora
            </button>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Pago fallido
            </h1>
            <p className="text-gray-600 mb-6">
              Hubo un problema. Intenta de nuevo.
            </p>
            <button
              onClick={() => router.push('/plans')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Volver a planes
            </button>
          </>
        )}
      </div>
    </div>
  );
}
