'use client';
import React from 'react';
import { useAuthStore } from '@/presentation/store/authStore';
import { UserRole } from '@/core/domain/entities';
import Link from 'next/link';
import { ProfileMenu } from '@/presentation/components/dashboard/ProfileMenu';
import { useActiveSubscription } from '@/presentation/hooks/useFinance';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { data: activeSubscription, isLoading, error } = useActiveSubscription();
  
  console.log('DashboardPage: Estado completo:', {
    isAuthenticated,
    user: user ? {
      id: user.id,
      email: user.email,
      role: user.role
    } : null
  });
  
  console.log('DashboardPage: Verificando si el usuario está autenticado:', isAuthenticated);
  
  // Forzar actualización del estado
  const { user: storeUser } = useAuthStore();
  console.log('DashboardPage: Usuario desde store:', storeUser);
  console.log('DashboardPage: activeSubscription:', activeSubscription);
  console.log('DashboardPage: isLoading:', isLoading);
  console.log('DashboardPage: error:', error);
  console.log('DashboardPage: activeSubscription.plan?.name:', activeSubscription?.plan?.name);

  // ✅ Lógica inteligente para el botón de planes
  const getPlanButtonText = () => {
    console.log('getPlanButtonText - activeSubscription:', activeSubscription);
    console.log('getPlanButtonText - plan name:', activeSubscription?.plan?.name);
    
    if (isLoading) {
      return 'Cargando...';
    }
    
    if (error) {
      console.log('Error en subscription - Actualizar plan');
      return 'Actualizar plan';
    }
    
    if (!activeSubscription) {
      console.log('No hay activeSubscription - Actualizar plan');
      return 'Actualizar plan';
    }
    
    if (activeSubscription.plan.name === 'FREE') {
      console.log('Plan FREE detectado - Actualizar plan');
      return 'Actualizar plan';
    }
    
    console.log('Plan pagado detectado - Ver planes');
    return 'Ver planes';
  };

  const getPlanBadge = () => {
    console.log('getPlanBadge - activeSubscription:', activeSubscription);
    
    if (isLoading) {
      return '...';
    }
    
    if (error || !activeSubscription) {
      console.log('Error o no hay activeSubscription - Badge FREE');
      return 'FREE';
    }
    
    console.log('Badge con plan:', activeSubscription.plan.name);
    return activeSubscription.plan.name;
  };

  const renderDashboardContent = () => {
    switch (user?.role) {
      case 'USER':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Bienvenido a tu Dashboard</h2>
              <p className="text-gray-600 mb-6">Busca tu hogar ideal y gestiona tus propiedades favoritas</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Link href="/dashboard/crm-leads" className="bg-red-50 p-4 rounded-lg hover:bg-red-100 transition-colors relative">
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="text-red-600 text-2xl mb-2">🔥</div>
                  <h3 className="font-semibold">CRM Leads</h3>
                  <p className="text-sm text-gray-600">Interesados en tiempo real</p>
                </Link>
                
                <Link href="/dashboard/mis-propiedades" className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="text-blue-600 text-2xl mb-2">🏠</div>
                  <h3 className="font-semibold">Mis Propiedades</h3>
                  <p className="text-sm text-gray-600">Publica y gestiona</p>
                </Link>
                
                <Link href="/dashboard/favoritos" className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition-colors">
                  <div className="text-green-600 text-2xl mb-2">Favoritos</div>
                  <h3 className="font-semibold">Favoritos</h3>
                  <p className="text-sm text-gray-600">Propiedades guardadas</p>
                </Link>
                
                <Link href="/dashboard/perfil" className="bg-orange-50 p-4 rounded-lg hover:bg-orange-100 transition-colors">
                  <div className="text-orange-600 text-2xl mb-2">👤</div>
                  <h3 className="font-semibold">Mi Perfil</h3>
                  <p className="text-sm text-gray-600">Datos personales</p>
                </Link>
                
                <Link href="/planes" className="bg-red-50 p-4 rounded-lg hover:bg-red-100 transition-colors relative">
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {getPlanBadge()}
                  </div>
                  <div className="text-red-600 text-2xl mb-2">Planes</div>
                  <h3 className="font-semibold">{getPlanButtonText()}</h3>
                  <p className="text-sm text-gray-600">Gestiona tu plan</p>
                </Link>
              </div>
            </div>
          </div>
        );

      case 'AGENT':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Dashboard de Agente Inmobiliario</h2>
              <p className="text-gray-600 mb-6">Gestiona tus propiedades y cartera de clientes</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Link href="/dashboard/crm-leads" className="bg-red-50 p-4 rounded-lg hover:bg-red-100 transition-colors relative">
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="text-red-600 text-2xl mb-2">🔥</div>
                  <h3 className="font-semibold">CRM Leads</h3>
                  <p className="text-sm text-gray-600">Interesados en tiempo real</p>
                </Link>
                
                <Link href="/dashboard/mis-propiedades" className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="text-blue-600 text-2xl mb-2">🏠</div>
                  <h3 className="font-semibold">Mis Propiedades</h3>
                  <p className="text-sm text-gray-600">Gestiona publicaciones</p>
                </Link>
                
                <Link href="/dashboard/mensajes" className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition-colors">
                  <div className="text-green-600 text-2xl mb-2">Mensajes</div>
                  <h3 className="font-semibold">Mensajes</h3>
                  <p className="text-sm text-gray-600">Leads de clientes</p>
                </Link>
                
                <Link href="/planes" className="bg-red-50 p-4 rounded-lg hover:bg-red-100 transition-colors relative">
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {getPlanBadge()}
                  </div>
                  <div className="text-red-600 text-2xl mb-2">Planes</div>
                  <h3 className="font-semibold">{getPlanButtonText()}</h3>
                  <p className="text-sm text-gray-600">Gestiona tu plan</p>
                </Link>
              </div>
            </div>
          </div>
        );

      case 'DEVELOPER':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Dashboard de Desarrollador Inmobiliario</h2>
              <p className="text-gray-600 mb-6">Gestiona tus proyectos y desarrollos inmobiliarios</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <Link href="/dashboard/crm-leads" className="bg-red-50 p-4 rounded-lg hover:bg-red-100 transition-colors relative">
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="text-red-600 text-2xl mb-2">🔥</div>
                  <h3 className="font-semibold">CRM Leads</h3>
                  <p className="text-sm text-gray-600">Interesados en tiempo real</p>
                </Link>
                
                <Link href="/dashboard/mis-propiedades" className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="text-blue-600 text-2xl mb-2">🏠</div>
                  <h3 className="font-semibold">Mis Propiedades</h3>
                  <p className="text-sm text-gray-600">Gestiona publicaciones</p>
                </Link>
                
                <Link href="/dashboard/proyectos" className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition-colors">
                  <div className="text-green-600 text-2xl mb-2">🏗️</div>
                  <h3 className="font-semibold">Mis Proyectos</h3>
                  <p className="text-sm text-gray-600">Desarrollos activos</p>
                </Link>
                
                <Link href="/dashboard/proyectos/nuevo" className="bg-purple-50 p-4 rounded-lg hover:bg-purple-100 transition-colors">
                  <div className="text-purple-600 text-2xl mb-2">🏢</div>
                  <h3 className="font-semibold">Nuevo Proyecto</h3>
                  <p className="text-sm text-gray-600">Crear desarrollo</p>
                </Link>
                
                <Link href="/dashboard/billetera" className="bg-orange-50 p-4 rounded-lg hover:bg-orange-100 transition-colors">
                  <div className="text-orange-600 text-2xl mb-2">Billetera</div>
                  <h3 className="font-semibold">Billetera</h3>
                  <p className="text-sm text-gray-600">Créditos y pagos</p>
                </Link>
                
                <Link href="/planes" className="bg-red-50 p-4 rounded-lg hover:bg-red-100 transition-colors">
                  <div className="text-red-600 text-2xl mb-2">Planes</div>
                  <h3 className="font-semibold">Planes</h3>
                  <p className="text-sm text-gray-600">999 publicaciones</p>
                </Link>
              </div>
              
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-yellow-600 text-xl">Planes</div>
                  <h3 className="font-semibold text-yellow-800">Plan Desarrollador</h3>
                </div>
                <p className="text-yellow-700 text-sm">
                  <strong>999 publicaciones</strong> disponibles • <strong>Proyectos ilimitados</strong> • <strong>30 días gratis</strong>
                </p>
              </div>
            </div>
          </div>
        );

      case 'ADMIN':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Dashboard de Administrador</h2>
              <p className="text-gray-600 mb-6">Gestión completa de la plataforma TIYUY</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <Link href="/dashboard/crm-leads" className="bg-red-50 p-4 rounded-lg hover:bg-red-100 transition-colors relative">
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="text-red-600 text-2xl mb-2">🔥</div>
                  <h3 className="font-semibold">CRM Leads</h3>
                  <p className="text-sm text-gray-600">Interesados en tiempo real</p>
                </Link>
                
                <Link href="/dashboard/mis-propiedades" className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="text-blue-600 text-2xl mb-2">🏠</div>
                  <h3 className="font-semibold">Mis Propiedades</h3>
                  <p className="text-sm text-gray-600">Gestiona publicaciones</p>
                </Link>
                
                <Link href="/dashboard/mensajes" className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition-colors">
                  <div className="text-green-600 text-2xl mb-2">Mensajes</div>
                  <h3 className="font-semibold">Mensajes</h3>
                  <p className="text-sm text-gray-600">Leads de clientes</p>
                </Link>
                
                <Link href="/dashboard/billetera" className="bg-orange-50 p-4 rounded-lg hover:bg-orange-100 transition-colors">
                  <div className="text-orange-600 text-2xl mb-2">�</div>
                  <h3 className="font-semibold">Billetera</h3>
                  <p className="text-sm text-gray-600">Pagos y métodos</p>
                </Link>
                
                <Link href="/planes" className="bg-red-50 p-4 rounded-lg hover:bg-red-100 transition-colors relative">
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {getPlanBadge()}
                  </div>
                  <div className="text-red-600 text-2xl mb-2">Planes</div>
                  <h3 className="font-semibold">{getPlanButtonText()}</h3>
                  <p className="text-sm text-gray-600">Gestiona tu plan</p>
                </Link>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Bienvenido, {user?.firstName || 'Usuario'}!</h2>
            <p className="text-gray-600">
              {user?.role === 'USER' && 'Tu dashboard personal está listo'}
              {user?.role === 'AGENT' && 'Tu dashboard de agente está listo'}
              {user?.role === 'DEVELOPER' && 'Tu dashboard de desarrollador está listo'}
              {user?.role === 'ADMIN' && 'Tu dashboard de administrador está listo'}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.role === 'USER' && 'Dashboard Personal'}
              {user?.role === 'AGENT' && 'Dashboard de Agente'}
              {user?.role === 'DEVELOPER' && 'Dashboard de Desarrollador'}
              {user?.role === 'ADMIN' && 'Dashboard de Administrador'}
            </h1>
            <p className="text-gray-600 mt-1">
              Bienvenido de vuelta, {user?.firstName || 'Usuario'}
            </p>
          </div>
          <ProfileMenu />
        </div>
      </div>

      {/* Contenido del Dashboard */}
      {renderDashboardContent()}
    </div>
  );
}
