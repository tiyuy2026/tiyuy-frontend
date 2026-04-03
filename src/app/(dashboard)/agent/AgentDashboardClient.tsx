'use client';

import React from 'react';
import Link from 'next/link';
import { useAgentDashboard, useAgentProfile } from '@/presentation/hooks/useAgent';
import { useMyProperties } from '@/presentation/hooks/useProperties';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui';
import { 
  Building2, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  DollarSign,
  ArrowRight,
  Briefcase,
  Star,
  Clock
} from 'lucide-react';

export const AgentDashboardClient: React.FC = () => {
  const { profile, isLoading: isLoadingProfile } = useAgentProfile();
  const { data: dashboard, isLoading: isLoadingDashboard } = useAgentDashboard();
  const { data: propertiesData, isLoading: isLoadingProperties } = useMyProperties(0, 5);

  const isLoading = isLoadingProfile || isLoadingDashboard || isLoadingProperties;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Propiedades',
      value: dashboard?.summary.totalProperties || 0,
      subtitle: `${dashboard?.summary.activeProperties || 0} activas`,
      icon: Building2,
      color: 'blue',
      href: '/my-properties',
    },
    {
      title: 'Leads',
      value: dashboard?.summary.totalLeads || 0,
      subtitle: `${dashboard?.summary.unreadLeads || 0} nuevos`,
      icon: Users,
      color: 'green',
      href: '/messages',
    },
    {
      title: 'Mensajes',
      value: 0,
      subtitle: 'Sin leer',
      icon: MessageSquare,
      color: 'purple',
      href: '/messages',
    },
    {
      title: 'Clientes',
      value: dashboard?.summary.totalClients || 0,
      subtitle: 'En cartera',
      icon: Briefcase,
      color: 'orange',
      href: '/dashboard/my-contacts',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Professional Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Perfil Profesional
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile?.professionalInfo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Licencia</p>
                  <p className="font-medium">{profile.professionalInfo.licenseNumber}</p>
                </div>
                {profile.professionalInfo.agency && (
                  <div>
                    <p className="text-sm text-gray-600">Inmobiliaria</p>
                    <p className="font-medium">{profile.professionalInfo.agency}</p>
                  </div>
                )}
                {profile.professionalInfo.yearsOfExperience !== undefined && (
                  <div>
                    <p className="text-sm text-gray-600">Experiencia</p>
                    <p className="font-medium">{profile.professionalInfo.yearsOfExperience} años</p>
                  </div>
                )}
                {profile.professionalInfo.specialty && (
                  <div>
                    <p className="text-sm text-gray-600">Especialidad</p>
                    <p className="font-medium">{profile.professionalInfo.specialty}</p>
                  </div>
                )}
              </div>
              {profile.verification && (
                <div className="flex items-center gap-2 mt-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profile.verification.isVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {profile.verification.isVerified ? 'Verificado' : 'Pendiente de verificación'}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-600 mb-4">Completa tu perfil profesional para destacar</p>
              <Link 
                href="/dashboard/profile" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Completar perfil
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Properties */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Mis Propiedades
            </CardTitle>
            <Link 
              href="/my-properties" 
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Ver todas
              <ArrowRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {propertiesData?.properties && propertiesData.properties.length > 0 ? (
              <div className="space-y-3">
                {propertiesData.properties.slice(0, 3).map((property) => (
                  <div 
                    key={property.id} 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{property.title}</p>
                      <p className="text-sm text-gray-600">S/ {property.price?.toLocaleString()}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No tienes propiedades publicadas</p>
                <Link 
                  href="/my-properties/new" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Publicar propiedad
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Vistas este mes</p>
                    <p className="text-2xl font-bold">{dashboard?.performance.viewsThisMonth || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Leads este mes</p>
                    <p className="text-2xl font-bold">{dashboard?.performance.leadsThisMonth || 0}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Star className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Calificación</p>
                    <p className="text-2xl font-bold">
                      {profile?.metrics?.averageRating || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/my-properties/new"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Publicar propiedad</p>
                <p className="text-sm text-gray-600">Añade una nueva propiedad</p>
              </div>
            </Link>

            <Link 
              href="/messages"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Ver mensajes</p>
                <p className="text-sm text-gray-600">Revisa tus leads</p>
              </div>
            </Link>

            <Link 
              href="/plans"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Mi plan</p>
                <p className="text-sm text-gray-600">Gestiona tu suscripción</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentDashboardClient;
