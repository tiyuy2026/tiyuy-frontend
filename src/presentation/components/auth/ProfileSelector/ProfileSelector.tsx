'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useProfile } from '@/presentation/hooks';
import { Button } from '@/presentation/components/ui';
import { ProfileCard } from '@/presentation/components/auth/ProfileSelector/ProfileCard';
import { AuthErrorBanner } from '@/presentation/components/auth/shared';
import { UserRole } from '@/core/domain/entities';

const profiles: UserRole[] = ['USER', 'AGENT', 'DEVELOPER'];

const PROFILE_TITLES: Record<UserRole, string> = {
  USER: 'Usuario',
  AGENT: 'Agente',
  DEVELOPER: 'Desarrollador',
  ADMIN: 'Administrador',
  SUPER_ADMIN: 'Super Administrador',
  SUPPORT: 'Soporte',
};

export default function ProfileSelector() {
  const { selectProfile } = useProfile();
  const [selectedProfile, setSelectedProfile] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noSelectionError, setNoSelectionError] = useState(false);

  const handleSelect = (profile: UserRole) => {
    setSelectedProfile(profile);
    setNoSelectionError(false);
    setError(null);
  };

  const handleContinue = async () => {
    if (!selectedProfile) {
      setNoSelectionError(true);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await selectProfile(selectedProfile);
    } catch {
      setError('No pudimos procesar tu selección. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-4 sm:py-8 lg:py-12">
      <div className="text-center mb-8 sm:mb-12 lg:mb-16 px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
          Elige tu perfil
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600">
          Selecciona cómo quieres usar TIYUY
        </p>
      </div>

      {/* Mensaje de error si no selecciona perfil */}
      {noSelectionError && (
        <div className="max-w-md mx-auto mb-6 px-4">
          <AuthErrorBanner
            error="Por favor selecciona un tipo de perfil para continuar"
            onClose={() => setNoSelectionError(false)}
          />
        </div>
      )}

      {/* Error al llamar a selectProfile */}
      {error && (
        <div className="max-w-md mx-auto mb-6 px-4">
          <AuthErrorBanner
            error={error}
            onClose={() => setError(null)}
            autoDismissSeconds={8}
          />
        </div>
      )}

      {/* Cards de perfil */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-8 sm:mb-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 items-stretch">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile}
            profile={profile}
            isSelected={selectedProfile === profile}
            onClick={handleSelect}
          />
        ))}
      </div>

      {/* Botón continuar */}
      <div className="flex justify-center px-4 sm:px-6 lg:px-8">
        <Button
          variant="primary"
          size="lg"
          onClick={handleContinue}
          isLoading={isLoading}
          className="w-full sm:w-auto min-w-[250px] sm:min-w-[300px] text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
        >
          {selectedProfile
            ? `Continuar con ${PROFILE_TITLES[selectedProfile]}`
            : 'Selecciona un perfil'}
        </Button>
      </div>

      <div className="text-center mt-6 sm:mt-8 lg:mt-12 px-4 sm:px-6 lg:px-8">
        <p className="text-sm sm:text-base text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm sm:text-base"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
