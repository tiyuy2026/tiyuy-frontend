import { useState } from 'react';

export const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const sendForgotPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        const data = await response.json();
        setError(data.message || 'Error al enviar el email de recuperación');
      }
    } catch (err) {
      console.error('Error en recuperación de contraseña:', err);
      setError('Error de conexión. Inténtalo nuevamente');
    } finally {
      setIsLoading(false);
    }
  };

  return { sendForgotPassword, isLoading, error, isSuccess };
};
