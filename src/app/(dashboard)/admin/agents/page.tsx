'use client';

import { useState } from 'react';
import { AgentListItem } from '@/core/domain/entities/Admin';
import { useAgentList, useAgentDashboardStats } from '@/presentation/hooks/useAdmin';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { useToggleUserStatus } from '@/presentation/hooks/useAdmin';
import { Button } from '@/presentation/components/ui/Button';
import { Card } from '@/presentation/components/ui/Card';
import { AdminTable } from '@/presentation/components/admin/AdminTable/AdminTable';
import FilterDropdown from '@/presentation/components/ui/FilterDropdown';
import AgentDetailsModal from './components/AgentDetailsModal';
import AgentStatsModal from './components/AgentStatsModal';
import PlanDetailsModal from './components/PlanDetailsModal';
import FreeAgentsModal from './components/FreeAgentsModal';
import Link from 'next/link';
import { PaginationParams } from '@/core/domain/repositories/IAdminRepository';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const IconRevenue  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2M9 9h4.5a1.5 1.5 0 010 3H10a1.5 1.5 0 000 3H15"/></svg>;
const IconCalendar = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
const IconChart    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path d="M3 3v18h18M7 16l4-4 4 4 4-4"/></svg>;
const IconUser     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
const IconTrend    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path d="M22 7l-8.5 8.5-5-5L2 17M22 7h-6M22 7v6"/></svg>;
const IconUsers    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><circle cx="9" cy="7" r="4"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="7" r="3"/><path d="M21 20c0-2.7-1.8-5-4-5.5"/></svg>;

const STAT_META = [
  { Icon: IconRevenue,  bg: 'bg-teal-50',   color: 'text-teal-500'   },
  { Icon: IconCalendar, bg: 'bg-orange-50',  color: 'text-orange-500' },
  { Icon: IconChart,    bg: 'bg-purple-50',  color: 'text-purple-500' },
  { Icon: IconUser,     bg: 'bg-green-50',   color: 'text-green-500'  },
  { Icon: IconTrend,    bg: 'bg-blue-50',    color: 'text-blue-500'   },
  { Icon: IconUsers,    bg: 'bg-red-50',     color: 'text-red-500'    },
];

export default function AgentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [chartPeriod, setChartPeriod] = useState<string>('30D');
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedAgents, setSelectedAgents] = useState<AgentListItem[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isPlanDetailsModalOpen, setIsPlanDetailsModalOpen] = useState(false);
  const [isFreeAgentsModalOpen, setIsFreeAgentsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentListItem | null>(null);

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' }
  ];

  const verificationOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'verified', label: 'Verificado' },
    { value: 'unverified', label: 'Pendiente' }
  ];

  const planOptions = [
    { value: 'all', label: 'Todos los planes' },
    { value: 'ENTERPRISE', label: 'Plan Empresarial' },
    { value: 'ENTERPRISE_TRIAL', label: 'Prueba Empresarial' },
    { value: 'PRO', label: 'Plan Pro' },
    { value: 'BASIC', label: 'Plan Básico' },
    { value: 'FREE', label: 'Plan Gratis' }
  ];

  const { hasPermission } = usePermissions();
  const canManageAgents = hasPermission('USERS_UPDATE');

  const params: PaginationParams = { page: currentPage - 1, size: pageSize };

  // Fetch agent dashboard stats
  const { data: dashboardStats, isLoading: statsLoading } = useAgentDashboardStats();

  // Fetch agent list
  const { data: agentsData, isLoading, error, refetch } = useAgentList(params);

  const toggleStatusMutation = useToggleUserStatus();

  const handleViewAgent = (agent: AgentListItem) => {
    setSelectedAgent(agent);
    setIsViewModalOpen(true);
  };

  const handleViewAgentStats = (agent: AgentListItem) => {
    setSelectedAgent(agent);
    setIsStatsModalOpen(true);
  };

  const handleToggleStatus = async (agent: AgentListItem) => {
    await toggleStatusMutation.mutateAsync({
      userId: agent.id,
      enabled: !agent.enabled,
      reason: `Agent status changed by admin`
    });
    refetch();
  };

  // Use agents data directly from backend with pagination
  const agents = agentsData?.content || [];

  // Filter agents based on search and filters
  const filteredAgents = agents.filter((agent: AgentListItem) => {
    const matchesSearch = !searchQuery || 
      (agent.firstName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (agent.lastName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && agent.enabled) ||
      (statusFilter === 'inactive' && !agent.enabled);
    
    const matchesVerification = verificationFilter === 'all' || 
      (verificationFilter === 'verified' && agent.emailVerified) ||
      (verificationFilter === 'unverified' && !agent.emailVerified);
    
    const matchesPlan = planFilter === 'all' || agent.currentPlan === planFilter;
    
    return matchesSearch && matchesStatus && matchesVerification && matchesPlan;
  });

  // Paginate results
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAgents = filteredAgents.slice(startIndex, endIndex);

  // Calculate trends dynamically from real data
  const calculateTrend = (current: number, previous: number): { trend: string; trendUp: boolean } => {
    if (!previous) return { trend: '0%', trendUp: true };
    const change = ((current - previous) / previous) * 100;
    return {
      trend: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
      trendUp: change >= 0
    };
  };

  // Stats cards data - all dynamic from backend with real historical data
  const statsCards = [
    {
      title: 'Ingresos Totales (Plataforma)',
      value: dashboardStats?.totalRevenue || 0,
      prefix: '$',
      valueSuffix: '',
      subtitle: 'Ultimos 30 dias',
      Icon: IconRevenue,
      ...calculateTrend(dashboardStats?.totalRevenue || 0, dashboardStats?.totalRevenuePrevious || 0),
    },
    {
      title: 'Ingresos del Mes',
      value: dashboardStats?.monthlyRevenue || 0,
      prefix: '$',
      valueSuffix: '',
      subtitle: 'vs mes anterior',
      Icon: IconCalendar,
      ...calculateTrend(dashboardStats?.monthlyRevenue || 0, dashboardStats?.monthlyRevenuePrevious || 0),
    },
    {
      title: 'Ingresos de la Semana',
      value: dashboardStats?.weeklyRevenue || 0,
      prefix: '$',
      valueSuffix: '',
      subtitle: 'vs semana anterior',
      Icon: IconChart,
      ...calculateTrend(dashboardStats?.weeklyRevenue || 0, dashboardStats?.weeklyRevenuePrevious || 0),
    },
    {
      title: 'Agentes con Plan Activo',
      value: dashboardStats?.activeAgents || 0,
      prefix: '',
      valueSuffix: '',
      subtitle: `de ${dashboardStats?.totalAgents || 0} registrados`,
      Icon: IconUser,
      ...calculateTrend(dashboardStats?.activeAgents || 0, dashboardStats?.activeAgentsPrevious || 0),
    },
    {
      title: 'Tasa de Conversion',
      value: dashboardStats?.conversionRate || 0,
      prefix: '',
      valueSuffix: '%',
      subtitle: 'de registros a pagos',
      Icon: IconTrend,
      ...calculateTrend(dashboardStats?.conversionRate || 0, dashboardStats?.conversionRatePrevious || 0),
    },
    {
      title: 'Agentes Free',
      value: dashboardStats?.freeAgents || 0,
      prefix: '',
      valueSuffix: '',
      subtitle: 'sin plan activo',
      Icon: IconUsers,
      ...calculateTrend(dashboardStats?.freeAgents || 0, dashboardStats?.freeAgentsPrevious || 0),
    }
  ];

  // Dynamic revenue chart data based on selected period
  const getRevenueChartData = () => {
    const labels = dashboardStats?.revenueChart?.labels || [];
    const revenue = dashboardStats?.revenueChart?.revenue || [];
    
    let sliceCount = 6;
    if (chartPeriod === '7D') sliceCount = 7;
    else if (chartPeriod === '3M') sliceCount = 12;
    else if (chartPeriod === '6M') sliceCount = 24;
    else if (chartPeriod === '1A') sliceCount = labels.length;
    
    const slicedLabels = labels.slice(-sliceCount);
    const slicedRevenue = revenue.slice(-sliceCount);
    
    return {
      labels: slicedLabels,
      datasets: [
        {
          label: 'Ingresos (USD)',
          data: slicedRevenue,
          borderColor: '#0d9488',
          backgroundColor: 'rgba(13, 148, 136, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'Conversion (%)',
          data: dashboardStats?.revenueChart?.conversion?.slice(-sliceCount) || [],
          borderColor: '#8b5cf6',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };
  };

  const planDistributionData = {
    labels: dashboardStats?.planDistribution?.labels || [],
    datasets: [
      {
        data: dashboardStats?.planDistribution?.values || [],
        backgroundColor: dashboardStats?.planDistribution?.labels?.map((_, i) => ['#0d9488', '#f59e0b', '#9ca3af'][i]) || [],
        borderWidth: 0
      }
    ]
  };

  // Table columns
  const columns = [
    {
      key: 'firstName' as keyof AgentListItem,
      label: 'Inmobiliaria',
      sortable: true,
      render: (_value: string, agent: AgentListItem) => (
        <div className="flex items-center gap-3">
          <img 
            src={agent.profilePhotoUrl || `https://ui-avatars.com/api/?name=${agent.firstName}+${agent.lastName}&background=random`} 
            alt="" 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="font-medium text-gray-900">
              {agent.firstName} {agent.lastName}
            </div>
            <div className="text-sm text-gray-500">{agent.email}</div>
            <div className="text-xs text-gray-400">
              {agent.city ? `${agent.city}, ${agent.country || ''}` : 'Sin ubicacion'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'enabled' as keyof AgentListItem,
      label: 'Estado',
      sortable: true,
      render: (value: boolean) => (
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {value ? 'Activo' : 'Inactivo'}
          </span>
          <div className="w-10 h-5 bg-gray-200 rounded-full relative">
            <div className={`w-5 h-5 rounded-full absolute top-0 transition-all ${value ? 'right-0 bg-green-500' : 'left-0 bg-gray-400'}`} />
          </div>
        </div>
      )
    },
    {
      key: 'emailVerified' as keyof AgentListItem,
      label: 'Verificacion',
      sortable: true,
      render: (_value: boolean, agent: AgentListItem) => (
        <div className="space-y-1">
          <div className={`text-xs flex items-center gap-1 ${agent.emailVerified ? 'text-green-600' : 'text-orange-500'}`}>
            {agent.emailVerified ? (
              <><span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</span> Verificado</>
            ) : (
              <><span className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">!</span> Pendiente</>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'currentPlan' as keyof AgentListItem,
      label: 'Plan Actual',
      sortable: true,
      render: (value: string, agent: AgentListItem) => (
        <div className="text-sm">
          <div className="font-medium">{value || 'Free'}</div>
          <div className="text-gray-500 text-xs">
            {agent.planExpiresAt ? `Renueva: ${new Date(agent.planExpiresAt).toLocaleDateString()}` : 'Sin plan activo'}
          </div>
        </div>
      )
    },
    {
      key: 'weekRevenue' as keyof AgentListItem,
      label: 'Ingresos Semana',
      sortable: true,
      render: (value: number) => (
        <div className="text-sm font-medium">${(value || 0).toLocaleString()}</div>
      )
    },
    {
      key: 'monthRevenue' as keyof AgentListItem,
      label: 'Mes',
      sortable: true,
      render: (value: number) => (
        <div className="text-sm font-medium">${(value || 0).toLocaleString()}</div>
      )
    },
    {
      key: 'yearRevenue' as keyof AgentListItem,
      label: 'Ano',
      sortable: true,
      render: (value: number) => (
        <div className="text-sm font-medium">${(value || 0).toLocaleString()}</div>
      )
    },
    {
      key: 'conversionRate' as keyof AgentListItem,
      label: 'Conversion',
      sortable: true,
      render: (value: number) => (
        <div className="text-sm font-medium">{(value || 0).toFixed(1)}%</div>
      )
    },
    {
      key: 'createdAt' as keyof AgentListItem,
      label: 'Miembro Desde',
      sortable: true,
      render: (value: Date) => {
        const date = new Date(value);
        const months = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 30));
        return (
          <div className="text-sm">
            <div>{date.toLocaleDateString()}</div>
            <div className="text-gray-500 text-xs">{months} meses</div>
          </div>
        );
      }
    }
  ];

  // Table actions
  const actions = [
    {
      label: 'Ver',
      onClick: handleViewAgent,
      variant: 'primary' as const
    },
    {
      label: 'Estadisticas',
      onClick: handleViewAgentStats,
      variant: 'secondary' as const
    },
    ...(canManageAgents ? [{
      label: 'Mas',
      onClick: handleToggleStatus,
      variant: 'secondary' as const
    }] : [])
  ];

  const handleFilterChange = (filters: Record<string, any>) => {
    if (filters.verification !== undefined) {
      setVerificationFilter(filters.verification);
    }
    if (filters.status !== undefined) {
      setStatusFilter(filters.status);
    }
    if (filters.plan !== undefined) {
      setPlanFilter(filters.plan);
    }
    setCurrentPage(1);
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Nombre', 'Email', 'Estado', 'Plan', 'Ingresos Mes'].join(','),
      ...filteredAgents.map(a => [a.id, `${a.firstName} ${a.lastName}`, a.email, a.enabled ? 'Activo' : 'Inactivo', a.currentPlan, a.monthRevenue].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agentes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setVerificationFilter('all');
    setPlanFilter('all');
    setDateRange({});
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Title with Discount Button */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestionar Agentes Independientes</h1>
          <p className="text-gray-600">Gestiona y supervisa todos los agentes independientes de la plataforma.</p>
        </div>
        <Link href="/admin/agents/discounts">
          <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
            Crear Descuento
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-6 gap-4">
        {statsCards.map((stat, index) => {
          const meta = STAT_META[index];
          return (
            <Card key={index} className="bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-2 min-h-[100px]">
              <div className="flex h-full flex-col">
                <div className="flex items-start justify-between">
                  <div className={`w-9 h-9 rounded-lg ${meta.bg} flex items-center justify-center`}>
                    <span className={meta.color}><stat.Icon /></span>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 leading-none">⋮</button>
                </div>
                <div className="mt-1.5 flex-1 flex flex-col">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider leading-tight">{stat.title}</p>
                  <div className="mt-0.5 flex items-end gap-1 leading-none">
                    <span className="text-[18px] font-bold text-gray-900">{stat.prefix}{stat.value.toLocaleString()}</span>
                    {stat.valueSuffix && <span className="text-[18px] font-bold text-gray-700">{stat.valueSuffix}</span>}
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-gray-500 leading-none">{stat.subtitle}</span>
                    <span className={`text-[11px] font-semibold whitespace-nowrap ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trendUp ? '↑' : '↓'} {stat.trend.replace('+', '')}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-7 p-6 h-[380px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Ingresos generados por agentes (para la plataforma)</h3>
            <div className="flex gap-1">
              {['7D', '30D', '3M', '6M', '1A'].map((period) => (
                <button key={period} onClick={() => setChartPeriod(period)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${chartPeriod === period ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[260px]">
            <Line data={getRevenueChartData()} options={{ maintainAspectRatio: false }} />
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-teal-500 rounded-full"></span> Ingresos (USD)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-500 rounded-full"></span> Conversion (%)</span>
          </div>
        </Card>

        <div className="col-span-12 lg:col-span-5 grid grid-cols-2 gap-4">
          <Card className="p-4 h-[380px]">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Monetizacion por tipo de plan</h3>
            <div className="h-28 flex items-center justify-center relative">
              <Doughnut data={planDistributionData} options={{ maintainAspectRatio: false, cutout: '60%', plugins: { legend: { display: false } } }} />
              <div className="absolute text-center">
                <p className="text-xl font-bold">{dashboardStats?.planDistribution?.total || 0}</p>
                <p className="text-xs text-gray-500">Agentes</p>
              </div>
            </div>
            <div className="space-y-1 mt-2">
              {(dashboardStats?.planDistribution?.labels || []).map((label: string, index: number) => {
                const value = dashboardStats?.planDistribution?.values[index] || 0;
                const total = dashboardStats?.planDistribution?.total || 1;
                const percentage = Math.round((value / total) * 100);
                const planCodes = ['ENTERPRISE', 'PRO', 'BASIC', 'FREE'];
                const colors = ['#0d9488', '#f59e0b', '#9ca3af'];
                return (
                  <div key={label} className="flex items-center justify-between text-xs cursor-pointer hover:bg-gray-50 p-1 rounded"
                    onClick={() => { setPlanFilter(planCodes[index] || 'all'); setCurrentPage(1); }}>
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[index] || '#9ca3af' }}></span>
                      {label}
                    </span>
                    <span className="text-gray-500">{value} ({percentage}%)</span>
                  </div>
                );
              })}
            </div>
            <button className="w-full mt-2 px-3 py-1.5 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
              onClick={() => setIsPlanDetailsModalOpen(true)}>Ver detalles</button>
          </Card>

          <Card className="p-4 h-[380px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Potencial perdido</h3>
              <button className="text-gray-400 hover:text-gray-600">ⓘ</button>
            </div>
            <p className="text-2xl font-bold text-gray-900">${(dashboardStats?.lostPotentialRevenue || 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Ingresos potenciales de agentes free</p>
            <div className="space-y-2 mt-3 max-h-32 overflow-y-auto">
              {(dashboardStats?.freeAgentList || []).slice(0, 4).map((agent) => (
                <div key={agent.agentId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">{agent.initials}</div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">{agent.firstName} {agent.lastName}</p>
                      <p className="text-xs text-gray-500">Sin plan activo</p>
                    </div>
                  </div>
                  <p className="text-xs font-medium">${agent.potentialRevenue.toLocaleString()}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 px-3 py-1.5 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
              onClick={() => setIsFreeAgentsModalOpen(true)}>Ver todos ({dashboardStats?.freeAgents || 0})</button>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <input type="text" placeholder="Buscar inmobiliaria..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <FilterDropdown value={statusFilter} options={statusOptions} onChange={(value) => handleFilterChange({ status: value })} />
        <FilterDropdown value={verificationFilter} options={verificationOptions} onChange={(value) => handleFilterChange({ verification: value })} />
        <FilterDropdown value={planFilter} options={planOptions} onChange={(value) => handleFilterChange({ plan: value })} />
        <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50"
          onClick={() => setShowFilters(!showFilters)}><span>⚡</span> Filtros</button>
        <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50"
          onClick={handleExport}><span>⬇</span> Exportar</button>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Filtros Avanzados</h3>
            <button className="text-gray-400 hover:text-gray-600" onClick={() => setShowFilters(false)}>✕</button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fecha desde</label>
              <input type="date" className="w-full px-3 py-2 border rounded-lg text-sm"
                onChange={(e) => setDateRange({ ...dateRange, start: new Date(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha hasta</label>
              <input type="date" className="w-full px-3 py-2 border rounded-lg text-sm"
                onChange={(e) => setDateRange({ ...dateRange, end: new Date(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ingresos minimo</label>
              <input type="number" placeholder="0" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="flex items-end">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm" onClick={() => refetch()}>Aplicar filtros</button>
            </div>
          </div>
        </Card>
      )}

      {/* Agents Table */}
      <AdminTable
        data={paginatedAgents}
        columns={columns}
        loading={isLoading}
        error={error?.message}
        actions={actions}
        selection={{
          selectedItems: selectedAgents,
          onSelectionChange: setSelectedAgents,
          getRowId: (agent: AgentListItem) => agent.id
        }}
        pagination={{
          page: currentPage,
          size: pageSize,
          total: filteredAgents.length,
          onPageChange: setCurrentPage,
          onSizeChange: setPageSize
        }}
        emptyState={{
          title: 'No se encontraron agentes',
          description: 'Intenta ajustar tu busqueda o filtros.',
          action: {
            label: 'Limpiar filtros',
            onClick: handleClearFilters
          }
        }}
      />

      {/* Modals */}
      {selectedAgent && (
        <AgentStatsModal agent={selectedAgent} isOpen={isStatsModalOpen}
          onClose={() => setIsStatsModalOpen(false)}
          onViewDetails={() => { setIsStatsModalOpen(false); setIsViewModalOpen(true); }} />
      )}
      {selectedAgent && (
        <AgentDetailsModal agent={selectedAgent} isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)} />
      )}
      <PlanDetailsModal isOpen={isPlanDetailsModalOpen}
        onClose={() => setIsPlanDetailsModalOpen(false)}
        planDistribution={dashboardStats?.planDistribution} />
      <FreeAgentsModal isOpen={isFreeAgentsModalOpen}
        onClose={() => setIsFreeAgentsModalOpen(false)}
        freeAgentList={dashboardStats?.freeAgentList}
        lostPotentialRevenue={dashboardStats?.lostPotentialRevenue}
        freeAgentsCount={dashboardStats?.freeAgents} />
    </div>
  );
}
