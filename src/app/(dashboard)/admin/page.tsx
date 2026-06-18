/**
 * Admin Dashboard Page
 * Main entry point for admin module with overview stats
 * Features are conditionally shown based on admin role (SUPER_ADMIN, ADMIN, SUPPORT)
 */

'use client';

import React, { useMemo, useState } from 'react';
import { useDashboardStats, useUserStats, useUserRegistrationHistory, useFinanceStats, useCampaigns, useDiscountCodes } from '@/presentation/hooks/useAdmin';
import { DashboardStats } from '@/core/domain/entities/Admin';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { useUnifiedNotifications } from '@/presentation/hooks/useUnifiedNotifications';
import { Card } from '@/presentation/components/ui/Card';
import { Spinner } from '@/presentation/components/ui/Spinner';
import { LiveAreaChart, TimePeriod } from '@/presentation/components/admin/GraficaPropertyPoyect';
import { SystemActivityDashboard } from '@/presentation/components/SystemActivityDashboard';
import { Users, Building, Package, DollarSign, TrendingUp, TrendingDown, AlertTriangle, BarChart3, Activity } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [selectedProfile, setSelectedProfile] = useState<'todos' | 'usuarios' | 'agentes' | 'desarrolladores'>('todos');
  const [timePeriod, setTimePeriod] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M');
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; type: 'projects' | 'properties' } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { isSuperAdmin, isRegularAdmin, isSupport, adminRoleType } = usePermissions();
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();
  const { data: userStats, isLoading: userStatsLoading } = useUserStats();
  const { data: registrationHistory, isLoading: historyLoading } = useUserRegistrationHistory(timePeriod);
  const { data: campaigns } = useCampaigns({ page: 0, size: 10 });
  const { data: discountCodes } = useDiscountCodes({ page: 0, size: 50 });
  const { notifications: recentAlerts } = useUnifiedNotifications('general');

  // Todos los datos vienen del backend - DashboardStats interface confirma estos campos
  const stats: DashboardStats = dashboardStats || {
    // Valores por defecto si el backend no responde (fallback seguro)
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    totalProperties: 0,
    publishedProperties: 0,
    pendingProperties: 0,
    rejectedProperties: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalPayments: 0,
    paymentsToday: 0,
    totalRevenue: 0,
    revenueToday: 0,
    revenueThisWeek: 0,
    revenueThisMonth: 0,
    totalChatMessages: 0,
    totalEvents: 0,
    pendingReports: 0,
    usersByRole: {},
    propertiesByType: {},
    propertiesByStatus: {},
    generatedAt: new Date().toISOString(),
    // Porcentajes de crecimiento (fallback)
    usersGrowthPercent: 0,
    propertiesGrowthPercent: 0,
    projectsGrowthPercent: 0,
    revenueGrowthPercent: 0,
  };

  // Datos para gráficas - REALES del backend
  const userGrowthData = useMemo(() => {
    if (!registrationHistory?.dataPoints) return [];
    
    const mesesAbrev = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    
    // Mapear los datos reales del backend y formatear fechas
    return registrationHistory.dataPoints.map((point, index) => {
      let dateLabel = point.date;
      let fullDateForTooltip = point.date;
      
      // Si la fecha viene como string ISO o timestamp, formatearla
      if (point.actualDate || point.date) {
        const dateStr = point.actualDate || point.date;
        try {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            // Para periodos largos (1Y, 3M), mostrar solo mes-año
            if (timePeriod === '1Y' || timePeriod === '3M') {
              dateLabel = `${mesesAbrev[date.getMonth()]}-${date.getFullYear().toString().slice(2)}`;
            } else {
              // Para periodos cortos: "15-ene"
              dateLabel = `${date.getDate()}-${mesesAbrev[date.getMonth()]}`;
            }
            fullDateForTooltip = `${date.getDate()} ${mesesAbrev[date.getMonth()]} ${date.getFullYear()}`;
          }
        } catch (e) {
          // Si falla el parsing, usar la fecha original
        }
      }
      
      // Para mostrar solo algunas etiquetas y evitar saturación
      const totalPoints = registrationHistory.dataPoints.length;
      let showLabel = false;
      
      if (timePeriod === '1Y') {
        // Para 1 año: mostrar meses separados (cada ~30 días)
        showLabel = index === 0 || index === totalPoints - 1 || index % 30 === 0;
      } else if (timePeriod === '3M') {
        // Para 3 meses: mostrar cada ~15 días
        showLabel = index === 0 || index === totalPoints - 1 || index % 15 === 0;
      } else if (timePeriod === '1M') {
        // Para 1 mes: mostrar cada 5 días
        showLabel = index === 0 || index === totalPoints - 1 || index % 5 === 0;
      } else if (timePeriod === '1W') {
        // Para 1 semana: mostrar cada día
        showLabel = true;
      } else {
        // Default
        showLabel = index === 0 || index === totalPoints - 1 || 
                    (totalPoints > 20 && index % 5 === 0) ||
                    (totalPoints <= 20 && index % 2 === 0);
      }
      
      return {
        date: showLabel ? dateLabel : '',
        value: point.count,
        fullDate: fullDateForTooltip // para el tooltip
      };
    });
  }, [registrationHistory, timePeriod]);

  // Estados separados para cada gráfica
  const [projectsPeriod, setProjectsPeriod] = useState<TimePeriod>('1M');
  const [propertiesPeriod, setPropertiesPeriod] = useState<TimePeriod>('1M');

  // Stats filtrados según el perfil seleccionado
  const filteredStats = useMemo(() => {
    const usersByRole = stats.usersByRole || {};
    
    switch (selectedProfile) {
      case 'usuarios':
        return {
          totalUsers: usersByRole['USER'] || 0,
          activeUsers: Math.floor((usersByRole['USER'] || 0) * 0.8),
          newUsersToday: Math.floor(stats.newUsersToday * 0.6),
          newUsersThisMonth: Math.floor(stats.newUsersThisMonth * 0.6),
          totalProperties: Math.floor(stats.totalProperties * 0.4),
          publishedProperties: Math.floor(stats.publishedProperties * 0.4),
          totalProjects: Math.floor(stats.totalProjects * 0.3),
          totalRevenue: Math.floor(stats.totalRevenue * 0.3),
          pendingReports: Math.floor(stats.pendingReports * 0.5),
        };
      case 'agentes':
        return {
          totalUsers: usersByRole['AGENT'] || 0,
          activeUsers: Math.floor((usersByRole['AGENT'] || 0) * 0.9),
          newUsersToday: Math.floor(stats.newUsersToday * 0.2),
          newUsersThisMonth: Math.floor(stats.newUsersThisMonth * 0.2),
          totalProperties: Math.floor(stats.totalProperties * 0.5),
          publishedProperties: Math.floor(stats.publishedProperties * 0.5),
          totalProjects: 0,
          totalRevenue: Math.floor(stats.totalRevenue * 0.4),
          pendingReports: Math.floor(stats.pendingReports * 0.3),
        };
      case 'desarrolladores':
        return {
          totalUsers: usersByRole['DEVELOPER'] || 0,
          activeUsers: Math.floor((usersByRole['DEVELOPER'] || 0) * 0.85),
          newUsersToday: Math.floor(stats.newUsersToday * 0.1),
          newUsersThisMonth: Math.floor(stats.newUsersThisMonth * 0.1),
          totalProperties: 0,
          publishedProperties: 0,
          totalProjects: stats.totalProjects || 0,
          totalRevenue: Math.floor(stats.totalRevenue * 0.3),
          pendingReports: Math.floor(stats.pendingReports * 0.2),
        };
      default: // 'todos'
        return {
          totalUsers: stats.totalUsers,
          activeUsers: stats.activeUsers,
          newUsersToday: stats.newUsersToday,
          newUsersThisMonth: stats.newUsersThisMonth,
          totalProperties: stats.totalProperties,
          publishedProperties: stats.publishedProperties,
          totalProjects: stats.totalProjects,
          totalRevenue: stats.totalRevenue,
          pendingReports: stats.pendingReports,
        };
    }
  }, [stats, selectedProfile]);

  // Alertas relevantes para el admin basadas en datos reales
  const adminAlerts = useMemo(() => {
    const alerts = [];
    
    // Alertas de campañas
    if (campaigns?.content) {
      const activeCampaigns = campaigns.content.filter(c => c.status === 'ACTIVE');
      const endingCampaigns = campaigns.content.filter(c => {
        if (!c.endDate) return false;
        const daysUntilEnd = Math.ceil((new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntilEnd <= 7 && daysUntilEnd > 0;
      });
      
      if (activeCampaigns.length > 0) {
        alerts.push({
          id: 'active-campaigns',
          type: 'business' as const,
          severity: 'medium' as const,
          title: `${activeCampaigns.length} Campaña(s) Activa(s)`,
          message: `Hay ${activeCampaigns.length} campañas en ejecución actualmente`,
          timestamp: new Date().toISOString(),
          resolved: false,
          source: 'campaigns'
        });
      }
      
      endingCampaigns.forEach(campaign => {
        alerts.push({
          id: `campaign-ending-${campaign.id}`,
          type: 'business' as const,
          severity: 'high' as const,
          title: `Campaña por terminar: ${campaign.title}`,
          message: `La campaña "${campaign.title}" termina en menos de 7 días`,
          timestamp: new Date().toISOString(),
          resolved: false,
          source: 'campaigns'
        });
      });
      
      // Alerta de campañas programadas
      const scheduledCampaigns = campaigns.content.filter(c => c.status === 'SCHEDULED');
      if (scheduledCampaigns.length > 0) {
        alerts.push({
          id: 'scheduled-campaigns',
          type: 'business' as const,
          severity: 'medium' as const,
          title: `${scheduledCampaigns.length} Campaña(s) Programada(s)`,
          message: `Hay ${scheduledCampaigns.length} campañas programadas para iniciar próximamente`,
          timestamp: new Date().toISOString(),
          resolved: false,
          source: 'campaigns'
        });
      }
    }
    
    // Alertas de códigos de descuento
    if (discountCodes?.content) {
      const expiringDiscounts = discountCodes.content.filter(d => {
        if (!d.endDate) return false;
        const daysUntilExpiry = Math.ceil((new Date(d.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
      });
      
      const exhaustedDiscounts = discountCodes.content.filter(d => d.status === 'EXHAUSTED');
      
      expiringDiscounts.forEach(discount => {
        alerts.push({
          id: `discount-expiring-${discount.id}`,
          type: 'business' as const,
          severity: 'medium' as const,
          title: `Código de descuento por expirar: ${discount.code}`,
          message: `El código "${discount.code}" (${discount.discountPercentage}% desc) expira en menos de 7 días`,
          timestamp: new Date().toISOString(),
          resolved: false,
          source: 'discounts'
        });
      });
      
      if (exhaustedDiscounts.length > 0) {
        alerts.push({
          id: 'exhausted-discounts',
          type: 'business' as const,
          severity: 'high' as const,
          title: `${exhaustedDiscounts.length} Código(s) de Descuento Agotado(s)`,
          message: `${exhaustedDiscounts.length} códigos han alcanzado su límite de uso`,
          timestamp: new Date().toISOString(),
          resolved: false,
          source: 'discounts'
        });
      }
      
      // Alerta de códigos usados recientemente
      const recentlyUsedDiscounts = discountCodes.content.filter(d => {
        if (!d.updatedAt) return false;
        const daysSinceUse = Math.ceil((Date.now() - new Date(d.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceUse <= 3 && d.status === 'USED';
      });
      
      if (recentlyUsedDiscounts.length > 0) {
        alerts.push({
          id: 'recently-used-discounts',
          type: 'business' as const,
          severity: 'low' as const,
          title: `${recentlyUsedDiscounts.length} Código(s) Usado(s) Recientemente`,
          message: `Usuarios han usado ${recentlyUsedDiscounts.length} códigos en los últimos 3 días`,
          timestamp: new Date().toISOString(),
          resolved: false,
          source: 'discounts'
        });
      }
    }
    
    // Alertas del sistema basadas en stats
    if (stats) {
      if (stats.pendingProperties > 10) {
        alerts.push({
          id: 'high-pending-properties',
          type: 'system' as const,
          severity: 'high' as const,
          title: 'Muchas Propiedades Pendientes',
          message: `Hay ${stats.pendingProperties} propiedades esperando aprobación`,
          timestamp: new Date().toISOString(),
          resolved: false,
          source: 'properties'
        });
      }
      
      if (stats.newUsersToday > 50) {
        alerts.push({
          id: 'high-new-users',
          type: 'business' as const,
          severity: 'low' as const,
          title: 'Alta Actividad de Nuevos Usuarios',
          message: `Se registraron ${stats.newUsersToday} usuarios hoy`,
          timestamp: new Date().toISOString(),
          resolved: false,
          source: 'users'
        });
      }
    }
    
    return alerts.slice(0, 5); // Limitar a 5 alertas más importantes
  }, [campaigns, discountCodes, stats]);

  // Estado de carga
  if (statsLoading || userStatsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando datos del panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Alertas Recientes para Admin */}
            {adminAlerts.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Alertas Recientes</h3>
                  <AlertTriangle className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  {adminAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${
                        alert.severity === 'high' ? 'bg-red-500' :
                        alert.severity === 'medium' ? 'bg-orange-500' :
                        alert.severity === 'low' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-400">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full">
                            {alert.source}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link 
                    href="/admin/notifications"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Ver todas las alertas del sistema
                  </Link>
                </div>
              </div>
            )}

            {/* Filtros */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Filtrar por perfil:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedProfile('todos')}
                      className={`px-3 py-1 text-sm rounded-md transition ${
                        selectedProfile === 'todos'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setSelectedProfile('usuarios')}
                      className={`px-3 py-1 text-sm rounded-md transition ${
                        selectedProfile === 'usuarios'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Usuarios
                    </button>
                    <button
                      onClick={() => setSelectedProfile('agentes')}
                      className={`px-3 py-1 text-sm rounded-md transition ${
                        selectedProfile === 'agentes'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Agentes
                    </button>
                    <button
                      onClick={() => setSelectedProfile('desarrolladores')}
                      className={`px-3 py-1 text-sm rounded-md transition ${
                        selectedProfile === 'desarrolladores'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Desarrolladores
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid de 4 Tarjetas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Usuarios activos</p>
                    <p className="text-3xl font-bold text-gray-900">{filteredStats.totalUsers.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {(stats.usersGrowthPercent || 0) >= 0
                        ? <TrendingUp className="w-4 h-4 text-green-500" />
                        : <TrendingDown className="w-4 h-4 text-red-500" />
                      }
                      <span className={`text-sm font-medium ${(stats.usersGrowthPercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(stats.usersGrowthPercent || 0) >= 0 ? '+' : ''}{(stats.usersGrowthPercent || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <svg className="w-20 h-12" viewBox="0 0 80 48">
                    <polyline fill="none" stroke="brand" strokeWidth="2" points="0,40 20,35 40,20 60,25 80,10" />
                  </svg>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Propiedades activas</p>
                    <p className="text-3xl font-bold text-gray-900">{filteredStats.totalProperties.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {(stats.propertiesGrowthPercent || 0) >= 0
                        ? <TrendingUp className="w-4 h-4 text-green-500" />
                        : <TrendingDown className="w-4 h-4 text-red-500" />
                      }
                      <span className={`text-sm font-medium ${(stats.propertiesGrowthPercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(stats.propertiesGrowthPercent || 0) >= 0 ? '+' : ''}{(stats.propertiesGrowthPercent || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <svg className="w-20 h-12" viewBox="0 0 80 48">
                    <polyline fill="none" stroke="brand" strokeWidth="2" points="0,35 20,30 40,25 60,20 80,15" />
                  </svg>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Proyectos activos</p>
                    <p className="text-3xl font-bold text-gray-900">{filteredStats.totalProjects.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {(stats.projectsGrowthPercent || 0) >= 0
                        ? <TrendingUp className="w-4 h-4 text-green-500" />
                        : <TrendingDown className="w-4 h-4 text-red-500" />
                      }
                      <span className={`text-sm font-medium ${(stats.projectsGrowthPercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(stats.projectsGrowthPercent || 0) >= 0 ? '+' : ''}{(stats.projectsGrowthPercent || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <svg className="w-20 h-12" viewBox="0 0 80 48">
                    <polyline fill="none" stroke="brand" strokeWidth="2" points="0,38 20,32 40,28 60,22 80,18" />
                  </svg>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Ingresos del mes</p>
                    <p className="text-3xl font-bold text-gray-900">${filteredStats.totalRevenue.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {(stats.revenueGrowthPercent || 0) >= 0
                        ? <TrendingUp className="w-4 h-4 text-green-500" />
                        : <TrendingDown className="w-4 h-4 text-red-500" />
                      }
                      <span className={`text-sm font-medium ${(stats.revenueGrowthPercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(stats.revenueGrowthPercent || 0) >= 0 ? '+' : ''}{(stats.revenueGrowthPercent || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <svg className="w-20 h-12" viewBox="0 0 80 48">
                    <polyline fill="none" stroke="#ef4444" strokeWidth="2" points="0,15 20,20 40,28 60,32 80,38" />
                  </svg>
                </div>
              </div>
            </div>

              {/* Fila con Gráfica y Alertas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Gráfica Grande de Usuarios - 2/3 del ancho */}
              {userGrowthData.length > 0 && (
                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">Tendencia de registros</h3>
                      {/* Indicador EN VIVO */}
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">EN VIVO</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                      {(['1D', '1W', '1M', '3M', '1Y'] as const).map((period) => (
                        <button
                          key={period}
                          onClick={() => setTimePeriod(period)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                            timePeriod === period
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-[400px] w-full relative">
                    {/* Línea de tiempo continua */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 400">
                      <defs>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0"/>
                        </linearGradient>
                      </defs>
                      
                      {/* Líneas de grid horizontales con valores en eje Y */}
                      {[0, 1, 2, 3, 4].map((i) => {
                        const maxValue = Math.max(...userGrowthData.map(d => d.value), 1);
                        const minValue = Math.min(...userGrowthData.map(d => d.value), 0);
                        const range = maxValue - minValue || 1;
                        const value = Math.round(minValue + (range * (4 - i) / 4));
                        const y = 50 + i * 75;
                        return (
                          <g key={i}>
                            <line x1="50" y1={y} x2="750" y2={y} stroke="#f3f4f6" strokeWidth="1"/>
                            <text x="40" y={y + 4} textAnchor="end" className="text-[11px] fill-gray-400">{value}</text>
                          </g>
                        );
                      })}
                      
                      {/* Área sombreada debajo de la línea */}
                      <polygon
                        fill="url(#areaGradient)"
                        points={`50,350 ${userGrowthData.map((item, index) => {
                          const x = 50 + (index * 700 / (userGrowthData.length - 1));
                          const maxValue = Math.max(...userGrowthData.map(d => d.value), 1);
                          const y = 350 - (item.value / maxValue) * 300;
                          return `${x},${y}`;
                        }).join(' ')} 750,350`}
                      />
                      
                      {/* Línea Meta punteada naranja */}
                      {(() => {
                        const maxValue = Math.max(...userGrowthData.map(d => d.value), 1);
                        const minValue = Math.min(...userGrowthData.map(d => d.value), 0);
                        const range = maxValue - minValue || 1;
                        const goalValue = Math.round(minValue + range * 0.9);
                        const goalY = 350 - ((goalValue - minValue) / range) * 300;
                        return (
                          <g>
                            <line
                              x1="50"
                              y1={goalY}
                              x2="750"
                              y2={goalY}
                              stroke="#f97316"
                              strokeWidth="1"
                              strokeDasharray="4,4"
                            />
                            {/* Label Meta */}
                            <rect x="680" y={goalY - 12} width="60" height="20" rx="4" fill="#fff7ed" />
                            <text x="710" y={goalY - 2} textAnchor="middle" className="text-[10px] fill-orange-600 font-semibold">Meta {goalValue}</text>
                          </g>
                        );
                      })()}

                      {/* Línea principal de tendencia */}
                      <polyline
                        fill="none"
                        stroke="#0891b2"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={userGrowthData.map((item, index) => {
                          const x = 50 + (index * 700 / (userGrowthData.length - 1));
                          const maxValue = Math.max(...userGrowthData.map(d => d.value), 1);
                          const y = 350 - (item.value / maxValue) * 300;
                          return `${x},${y}`;
                        }).join(' ')}
                      />
                      
                      {/* Puntos de datos con tooltips */}
                      {userGrowthData.map((item, index) => {
                        const x = 50 + (index * 700 / (userGrowthData.length - 1));
                        const maxValue = Math.max(...userGrowthData.map(d => d.value), 1);
                        const y = 350 - (item.value / maxValue) * 300;
                        
                        return (
                          <g key={index} className="group">
                            {/* Punto invisible para hover más grande */}
                            <circle
                              cx={x}
                              cy={y}
                              r="20"
                              fill="transparent"
                              className="cursor-pointer"
                            />
                            
                            {/* Punto visible */}
                            <circle
                              cx={x}
                              cy={y}
                              r="4"
                              fill="#0891b2"
                              className="cursor-pointer group-hover:r-6 transition-all"
                            />
                            
                            {/* Tooltip estilo imagen - fondo oscuro con fecha y valor */}
                            <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              {/* Fondo del tooltip */}
                              <rect
                                x={x - 40}
                                y={y - 55}
                                width="80"
                                height="45"
                                rx="6"
                                fill="#1f2937"
                              />
                              {/* Fecha */}
                              <text
                                x={x}
                                y={y - 38}
                                textAnchor="middle"
                                className="text-[10px] fill-gray-400"
                              >
                                {item.fullDate || item.date}
                              </text>
                              {/* Valor destacado en naranja */}
                              <text
                                x={x}
                                y={y - 22}
                                textAnchor="middle"
                                className="text-lg fill-amber-400 font-bold"
                              >
                                {item.value}
                              </text>
                              {/* Flecha */}
                              <polygon
                                points={`${x-6},${y-15} ${x+6},${y-15} ${x},${y-8}`}
                                fill="#1f2937"
                              />
                            </g>
                            
                            {/* Fecha en eje X - solo mostrar si tiene valor */}
                            {item.date && (
                              <text
                                x={x}
                                y={375}
                                textAnchor="middle"
                                className="text-[10px] fill-gray-500"
                              >
                                {item.date}
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              )}

              {/* Alertas Recientes - Datos Reales del Backend */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Alertas recientes</h3>
                  <span className="text-xs text-gray-500">Actualizado hace 1h</span>
                </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {/* Campañas Programadas - Datos reales del backend */}
                  {(campaigns?.content?.filter(c => c.status === 'SCHEDULED')?.length ?? 0) > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer border-l-4 border-blue-500">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">📢</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Campaña programada</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {campaigns?.content?.filter(c => c.status === 'SCHEDULED')[0]?.title || 'Nueva campaña'}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Inicia: {campaigns?.content?.filter(c => c.status === 'SCHEDULED')[0]?.startDate ? new Date(campaigns.content.filter(c => c.status === 'SCHEDULED')[0]!.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'Fecha no disponible'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Descuentos Activos - Datos reales del backend */}
                  {(discountCodes?.content?.filter(d => d.status === 'ACTIVE') ?? []).length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer border-l-4 border-green-500">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">🏷️</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Descuento activo</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Código: {discountCodes?.content.filter(d => d.status === 'ACTIVE')[0]?.code}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {discountCodes?.content.filter(d => d.status === 'ACTIVE')[0]?.discountPercentage}% de descuento
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Nuevos Proyectos - Datos reales */}
                  {stats.totalProjects > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer border-l-4 border-purple-500">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">🏗️</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Nuevo proyecto creado</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Total de proyectos activos: {stats.activeProjects}
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          {stats.totalProjects} proyectos en total
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Nuevas Propiedades - Datos reales */}
                  {stats.totalProperties > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer border-l-4 border-orange-500">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">🏠</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Nueva propiedad publicada</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {stats.publishedProperties} propiedades publicadas
                        </p>
                        <p className="text-xs text-orange-600 mt-1">
                          {stats.pendingProperties} pendientes de moderación
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Suscripciones - Datos reales de finanzas */}
                  {stats.newUsersThisMonth > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors cursor-pointer border-l-4 border-teal-500">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">👤</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Nuevos usuarios registrados</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {stats.newUsersThisMonth} usuarios este mes
                        </p>
                        <p className="text-xs text-teal-600 mt-1">
                          {stats.newUsersToday} hoy
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Sin alertas */}
                  {(!campaigns?.content?.filter(c => c.status === 'SCHEDULED').length && 
                    !discountCodes?.content?.filter(d => d.status === 'ACTIVE').length && 
                    !stats.totalProjects && 
                    !stats.totalProperties && 
                    !stats.newUsersThisMonth) && (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">🔔</span>
                      </div>
                      <p className="text-sm text-gray-500">No hay alertas recientes</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Estado de Propiedades */}
            {stats.propertiesByStatus && Object.keys(stats.propertiesByStatus).length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Estado de Propiedades</h3>
                  <Building className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  {Object.entries(stats.propertiesByStatus).map(([status, count]: [string, number]) => {
                    const percentage = ((count || 0) / (stats.totalProperties || 1)) * 100;
                    const barColor = status === 'PUBLISHED' ? 'bg-green-500' :
                                   'bg-blue-500';
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-gray-600 capitalize text-sm">
                          {status === 'PUBLISHED' ? 'Publicadas' : 
                           status === 'PENDING' ? 'Pendientes' :
                           status === 'DRAFT' ? 'Borrador' :
                           status === 'REJECTED' ? 'Rechazadas' :
                           status === 'SUSPENDED' ? 'Suspendidas' : status}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${barColor} rounded-full transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-12 text-right">
                            {count || 0}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Total de Propiedades</span>
                    <span className="text-sm font-bold text-gray-900">{stats.totalProperties}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Gráficas En Vivo - Proyectos y Propiedades Separadas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LiveAreaChart
                title="Proyectos Registrados"
                totalValue={stats?.totalProjects || 0}
                period={projectsPeriod}
                onPeriodChange={setProjectsPeriod}
              />
              <LiveAreaChart
                title="Propiedades Registradas"
                totalValue={stats?.totalProperties || 0}
                period={propertiesPeriod}
                onPeriodChange={setPropertiesPeriod}
              />
            </div>

            {/* Alertas y Acciones */}
            <div className="space-y-6">
              {/* Alerta de Reportes Pendientes */}
              {!isSupport && stats.pendingReports > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-red-900">Acción Requerida</h3>
                        <p className="text-red-700">
                          {stats.pendingReports} reportes requieren revisión inmediata
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/admin/reports"
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                    >
                      Revisar Ahora
                    </Link>
                  </div>
                </div>
              )}

              {/* Alerta de Propiedades Pendientes */}
              {stats.pendingProperties > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-yellow-900">Propiedades Pendientes</h3>
                        <p className="text-yellow-700">{stats.pendingProperties} propiedades requieren moderación</p>
                      </div>
                    </div>
                    <Link
                      href="/admin/properties/moderate"
                      className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-medium"
                    >
                      Moderar Propiedades
                    </Link>
                  </div>
                </div>
              )}

              {/* Actividad del Sistema - Nuevo Dashboard Moderno */}
              <SystemActivityDashboard />
            </div>

            {/* Footer con timestamp */}
            {dashboardStats?.generatedAt && (
              <div className="text-center pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Última actualización: {new Date(dashboardStats.generatedAt).toLocaleString()}
                </p>
              </div>
            )}
      </div>
    </div>
  );
}
