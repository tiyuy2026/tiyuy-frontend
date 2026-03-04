'use client';
import React from 'react';
import { useProfileStore } from '@/presentation/store/profileStore';
import { RegisterUsuarioForm } from './RegisterUsuarioForm';
import { RegisterAgenteForm } from './RegisterAgenteForm';
import { RegisterDeveloperForm } from './RegisterDeveloperForm';
import { RegisterAdminForm } from './RegisterAdminForm';

export const RegisterForm: React.FC = () => {
  const { selectedProfile } = useProfileStore();

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
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Selecciona un perfil para continuar
            </h2>
            <p className="text-gray-600 mb-6">
              Primero elige cómo quieres usar TIYUY
            </p>
            <a
              href="/perfil-selector"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Elegir Perfil
            </a>
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {renderForm()}
    </div>
  );
};
