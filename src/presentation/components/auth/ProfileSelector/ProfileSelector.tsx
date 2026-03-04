'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useProfile } from '@/presentation/hooks';
import { Button } from '@/presentation/components/ui';
import { ProfileCard } from '@/presentation/components/auth/ProfileSelector/ProfileCard';
import { UserRole } from '@/core/domain/entities';

const profiles: UserRole[] = ['USER', 'AGENT', 'DEVELOPER', 'ADMIN'];

export default function ProfileSelector() {
  const { selectProfile } = useProfile();
  const [selectedProfile, setSelectedProfile] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = (profile: UserRole) => {
    setSelectedProfile(profile);
  };

  const handleContinue = async () => {
    if (!selectedProfile) return;
    try {
      setIsLoading(true);
      await selectProfile(selectedProfile);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Elige tu perfil</h1>
        <p className="text-xl text-gray-600">Selecciona cómo quieres usar TIYUY</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile}
            profile={profile}
            isSelected={selectedProfile === profile}
            onClick={handleSelect}
          />
        ))}
      </div>

      {selectedProfile && (
        <div className="flex justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={handleContinue}
            isLoading={isLoading}
            className="min-w-[300px]"
          >
            Continuar con {getProfileTitle(selectedProfile)}
          </Button>
        </div>
      )}

      <div className="text-center mt-8">
        <p className="text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

function getProfileTitle(role: UserRole): string {
  const titles: Record<UserRole, string> = {
    USER: 'Usuario',
    AGENT: 'Agente', 
    DEVELOPER: 'Desarrollador',
    ADMIN: 'Administrador'
  };
  return titles[role];
}
