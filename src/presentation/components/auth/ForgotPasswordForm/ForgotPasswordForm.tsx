'use client';
import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button, Input } from '@/presentation/components/ui';
import Link from 'next/link';

export const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('El email es requerido');
      return;
    }

    if (!validateEmail(email)) {
      setError('Email inválido');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Aquí llamaremos al backend para enviar el email de recuperación
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
    } catch (error) {
      console.error('Error en recuperación de contraseña:', error);
      setError('Error de conexión. Inténtalo nuevamente');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Email Enviado!
        </h2>
        
        <p className="text-gray-600 mb-8">
          Hemos enviado un email a <strong>{email}</strong> con las instrucciones 
          para recuperar tu contraseña.
        </p>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>Importante:</strong> Revisa tu carpeta de spam si no encuentras el email.
            </p>
          </div>

          <Link href="/login">
            <Button variant="outline" size="lg" fullWidth>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver al Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
          <Mail className="w-8 h-8 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          ¿Olvidaste tu contraseña?
        </h2>
        
        <p className="text-gray-600">
          No te preocupes. Ingresa tu email y te enviaremos las instrucciones 
          para recuperar tu cuenta.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <Input
          type="email"
          name="email"
          label="Correo electrónico"
          leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ejemplo@correo.com"
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl py-3 font-semibold"
        >
          {isLoading ? 'Enviando...' : 'Enviar Instrucciones'}
        </Button>
      </form>

      {/* Back to Login */}
      <div className="mt-6 text-center">
        <Link 
          href="/login"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Login
        </Link>
      </div>
    </div>
  );
};
