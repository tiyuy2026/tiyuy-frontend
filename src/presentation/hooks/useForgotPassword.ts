import { useState } from 'react';
import { publicApiClient } from '@/infrastructure/api/axios-client';

export const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const sendForgotPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Usar axiosClient directamente para evitar el route handler de Next.js
      // y conectar directo al backend (ya incluye /api en baseURL)
      await publicApiClient.post('/auth/forgot-password', { email });
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Error en recuperación de contraseña:', err);
      const message = err.response?.data?.message 
        || err.response?.data 
        || 'Error de conexión. Inténtalo nuevamente';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return { sendForgotPassword, isLoading, error, isSuccess };
};
