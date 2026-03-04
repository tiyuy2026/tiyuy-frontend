'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/presentation/hooks';
import { ProfileHeader } from '@/presentation/components/profile/ProfileHeader';
import { ProfileTabs } from '@/presentation/components/profile/ProfileTabs';
import { PersonalInfoTab } from '@/presentation/components/profile/PersonalInfoTab';
import { SecurityTab } from '@/presentation/components/profile/SecurityTab';
import { PlansTab } from '@/presentation/components/profile/PlansTab';
import { FavoritesTab } from '@/presentation/components/profile/FavoritesTab';
import { HistoryTab } from '@/presentation/components/profile/HistoryTab';

export const metadata = {
  title: 'Mi Perfil | TIYUY',
  description: 'Gestiona tu perfil, propiedades favoritas y configuración',
};

type TabType = 'personal' | 'security' | 'plans' | 'favorites' | 'history';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('personal');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No has iniciado sesión</h2>
          <p className="text-gray-600">Por favor inicia sesión para ver tu perfil</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'personal', label: 'Información Personal', icon: '👤' },
    { id: 'security', label: 'Seguridad', icon: '🔒' },
    { id: 'plans', label: 'Mi Plan', icon: '⭐' },
    { id: 'favorites', label: 'Favoritos', icon: '❤️' },
    { id: 'history', label: 'Historial', icon: '📊' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalInfoTab user={user} />;
      case 'security':
        return <SecurityTab user={user} />;
      case 'plans':
        return <PlansTab user={user} />;
      case 'favorites':
        return <FavoritesTab user={user} />;
      case 'history':
        return <HistoryTab user={user} />;
      default:
        return <PersonalInfoTab user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header del Perfil */}
        <ProfileHeader user={user} />

        {/* Tabs de Navegación */}
        <ProfileTabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        {/* Contenido del Tab Activo */}
        <div className="mt-8">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
