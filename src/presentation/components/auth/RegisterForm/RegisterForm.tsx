'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileStore } from '@/presentation/store/profileStore';
import { RegisterUsuarioForm } from './RegisterUsuarioForm';
import { RegisterAgenteForm } from './RegisterAgenteForm';
import { RegisterDeveloperForm } from './RegisterDeveloperForm';
import { RegisterAdminForm } from './RegisterAdminForm';

export const RegisterForm: React.FC = () => {
  const { selectedProfile } = useProfileStore();
  const router = useRouter();

  useEffect(() => {
    if (!selectedProfile) {
      router.replace('/profile-selector');
    }
  }, [selectedProfile, router]);

  if (!selectedProfile) {
    return null;
  }

  const renderForm = () => {
    switch (selectedProfile) {
      case 'USER':
        return <RegisterUsuarioForm />;
      case 'AGENT':
        return <RegisterAgenteForm />;
      case 'DEVELOPER':
        return <RegisterDeveloperForm />;
      case 'ADMIN':
        return <RegisterAdminForm />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {renderForm()}
    </div>
  );
};
