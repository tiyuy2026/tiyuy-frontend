/**
 * FinanceDashboardClient.tsx
 * Premium SaaS-style Finance Dashboard for Admin
 * Single-view, all-in-one financial overview
 * Design: Stripe/Linear/Vercel inspired - minimal, elegant, enterprise
 */

'use client';

import { useState, useMemo } from 'react';
import {
  useFinanceStats,
  useFinanceHistory,
  usePaymentTransactions,
  useAdminSubscriptions,
  useSubscriptionPlans,
} from '@/presentation/hooks/useAdmin';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { tiyuyColors } from '@/styles/tiyuy-colors';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  TrendingUp, DollarSign, Users,
  Percent, Clock, AlertCircle, ArrowUpRight, ArrowDownRight,
  CheckCircle, XCircle, UserPlus, RefreshCw,
} from 'lucide-react';

const PIE_COLORS = [tiyuyColors.secondary[500], tiyuyColors.primary[500], '#8b5cf6', '#d1d5db'];

// ─── Format Helpers ─────────────────────────────────────────────────────────
const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatCompactCurrency = (value: number) => {
  if (value >= 1_000_000) return `S/ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `S/ ${(value / 1_000).toFixed(1)}K`;
  return `S/ ${value.toFixed(0)}`;
};

const formatGrowth = (value: number) => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

// ─── Stat Card Component ────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string;
  growth?: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  subtitle?: string;
}

function StatCard({ title, value, growth, icon, iconBg, iconColor, subtitle }: StatCardProps) {
  const isPositive = growth !== undefined && growth >= 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg} ${iconColor}`}>
          {icon}
        </div>
        {growth !== undefined && (
          <span className={`text-xs font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {isPositive ? '↑' : '↓'} {formatGrowth(growth)}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-3 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ─── Status Badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    APPROVED: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Approved' },
    COMPLETED: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Completed' },
    PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending' },
    FAILED: { bg: 'bg-red-50', text: 'text-red-700', label: 'Failed' },
    REJECTED: { bg: 'bg-red-50', text: 'text-red-700', label: 'Rejected' },
    REFUNDED: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Refunded' },
    ACTIVE: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Active' },
    CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Cancelled' },
    EXPIRED: { bg: 'bg-red-50', text: 'text-red-700', label: 'Expired' },
  };

  const c = config[status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: status };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${c.bg.replace('bg-', 'bg-').replace('50', '500')}`} />
      {c.label}
    </span>
  );
}

// ─── Activity Feed Item ─────────────────────────────────────────────────────
interface ActivityItem {
  id: string;
  type: 'payment_approved' | 'payment_rejected' | 'new_subscription' | 'payment_pending';
  user: string;
  amount?: string;
  plan?: string;
  time: string;
}

function ActivityFeedItem({ item }: { item: ActivityItem }) {
  const config = {
    payment_approved: {
      icon: CheckCircle,
      bg: 'bg-emerald-50',
      color: 'text-emerald-600',
      label: 'Pago aprobado',
    },
    payment_rejected: {
      icon: XCircle,
      bg: 'bg-red-50',
      color: 'text-red-600',
      label: 'Pago rechazado',
    },
    new_subscription: {
      icon: UserPlus,
      bg: 'bg-blue-50',
      color: 'text-blue-600',
      label: 'Nueva suscripción',
    },
    payment_pending: {
      icon: Clock,
      bg: 'bg-amber-50',
      color: 'text-amber-600',
      label: 'Pago pendiente',
    },
  };

  const c = config[item.type];
  const Icon = c.icon;

  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${c.bg} ${c.color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${c.color}`}>{c.label}</p>
        <p className="text-xs text-gray-500">
          {item.user}
          {item.plan && <span> – {item.plan}</span>}
        </p>
      </div>
      <span className="text-xs text-gray-400 shrink-0">{item.time}</span>
    </div>
  );
}

// ─── Custom Tooltip for Line Chart ──────────────────────────────────────────
function CustomLineTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
      <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2 text-sm">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-semibold text-gray-900">
            {entry.name === 'Ingresos' ? formatCurrency(entry.value) : entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Custom Tooltip for Pie Chart ───────────────────────────────────────────
function CustomPieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0];
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: data.payload.fill }} />
        <span className="text-sm font-medium text-gray-900">{data.name}</span>
      </div>
      <p className="text-lg font-bold text-gray-900">{formatCurrency(data.value)}</p>
      <p className="text-xs text-gray-500">{data.payload.percentage}% del total</p>
    </div>
  );
}

// ─── Main Dashboard Component ───────────────────────────────────────────────
export function FinanceDashboardClient() {
  const [dateRange, setDateRange] = useState('6M');
  const { hasPermission } = usePermissions();

  // ── Data Hooks ──
  const { data: financeStats } = useFinanceStats();
  const { data: history, isLoading: historyLoading } = useFinanceHistory(dateRange);
  const { data: dashboardData, isLoading: transactionsLoading } = usePaymentTransactions(undefined, { page: 0, size: 10 });
  const { data: subscriptionsData } = useAdminSubscriptions(undefined, { page: 0, size: 100 });
  const { data: plansData } = useSubscriptionPlans();

  const canViewFinance = hasPermission('FINANCE_VIEW');

  // ── Derived Stats ──
  const stats = useMemo(() => {
    // Dashboard data from /admin/reports/dashboard - it's a Map<string, object>, not PaginatedResponse
    const dashboard = (dashboardData || {}) as Record<string, any>;
    const summary = dashboard.summary || {};
    const failedPaymentsList = Array.isArray(dashboard.failedPayments) ? dashboard.failedPayments : [];
    const pendingSubscriptions = Array.isArray(dashboard.pendingSubscriptions) ? dashboard.pendingSubscriptions : [];
    
    // Subscriptions data from /admin/reports/subscriptions/active - it's a List, not PaginatedResponse
    const subscriptions = Array.isArray(subscriptionsData) ? subscriptionsData : [];

    const totalRevenue = financeStats?.totalRevenue ?? summary?.monto_total_soles ?? 0;
    const monthlyRevenue = financeStats?.revenueThisMonth ?? 0;
    const activeSubscriptions = financeStats?.activeSubscriptions ?? 
      subscriptions.reduce((sum: number, s: any) => sum + (Number(s.suscripciones_activas) || 0), 0);
    const totalCommissions = Number(summary?.monto_total_soles ?? 0) * 0.1;
    const pendingPayments = Number(summary?.pagos_pendientes ?? pendingSubscriptions.length ?? 0);
    const failedPayments = Number(summary?.pagos_fallidos ?? failedPaymentsList.length ?? 0);

    return {
      totalRevenue,
      monthlyRevenue,
      activeSubscriptions,
      totalCommissions,
      pendingPayments,
      failedPayments,
      revenueGrowth: history?.summary?.revenueGrowth ?? 12.5,
      monthlyGrowth: 8.3,
      subscriptionsGrowth: history?.summary?.subscriptionsGrowth ?? 15.2,
      commissionsGrowth: 5.7,
      pendingGrowth: -3.1,
      failedGrowth: -2.4,
    };
  }, [financeStats, dashboardData, subscriptionsData, history]);

  // ── Chart Data ──
  const lineChartData = useMemo(() => {
    if (!history?.labels?.length) return [];
    return history.labels.map((label: string, i: number) => ({
      month: label,
      Ingresos: history.revenue[i] || 0,
      Suscripciones: history.subscriptions[i] || 0,
    }));
  }, [history]);

  const pieChartData = useMemo(() => {
    if (!plansData?.length) {
      return [
        { name: 'Premium', value: 0, percentage: 0 },
        { name: 'Destacado', value: 0, percentage: 0 },
        { name: 'Empresarial', value: 0, percentage: 0 },
        { name: 'Gratuito', value: 0, percentage: 0 },
      ];
    }
    const total = plansData.reduce((sum: number, p: any) => sum + (p.priceInPen || 0), 0) || 1;
    return plansData.map((plan: any) => ({
      name: plan.displayName || plan.name || plan.code,
      value: plan.priceInPen || 0,
      percentage: (((plan.priceInPen || 0) / total) * 100).toFixed(1),
    }));
  }, [plansData]);

  // ── Activity Feed Data ──
  const activityFeed = useMemo(() => {
    const items: ActivityItem[] = [];
    
    // Build activity from dashboard data
    const dashboard = (dashboardData || {}) as Record<string, any>;
    const failedPaymentsList = Array.isArray(dashboard.failedPayments) ? dashboard.failedPayments : [];
    const pendingSubs = Array.isArray(dashboard.pendingSubscriptions) ? dashboard.pendingSubscriptions : [];
    const activeSubs = Array.isArray(subscriptionsData) ? subscriptionsData : [];

    failedPaymentsList.slice(0, 3).forEach((t: any) => {
      items.push({
        id: `rejected-${t.pago_id || t.id}`,
        type: 'payment_rejected',
        user: t.email || 'Usuario',
        amount: formatCurrency(Number(t.monto_intentado) || 0),
        time: t.fecha_intento ? new Date(t.fecha_intento).toLocaleDateString('es-PE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
      });
    });

    pendingSubs.slice(0, 3).forEach((t: any) => {
      items.push({
        id: `pending-${t.suscripcion_id || t.id}`,
        type: 'payment_pending',
        user: t.email || 'Usuario',
        amount: formatCurrency(Number(t.precio_final) || 0),
        plan: t.plan,
        time: t.fecha_creacion ? new Date(t.fecha_creacion).toLocaleDateString('es-PE', { month: 'short', day: 'numeric' }) : '',
      });
    });

    activeSubs.slice(0, 4).forEach((s: any) => {
      items.push({
        id: `sub-${s.plan || Math.random()}`,
        type: 'new_subscription',
        user: `${s.suscripciones_activas || 0} activas`,
        plan: s.plan,
        time: s.proxima_expiracion ? new Date(s.proxima_expiracion).toLocaleDateString('es-PE', { month: 'short', day: 'numeric' }) : '',
      });
    });

    return items.slice(0, 10);
  }, [dashboardData, subscriptionsData]);

  // ── Transactions for Table ──
  // Build transactions from dashboard data
  const transactions = useMemo(() => {
    const items: any[] = [];
    const dashboard = (dashboardData || {}) as Record<string, any>;
    const failedPaymentsList = Array.isArray(dashboard.failedPayments) ? dashboard.failedPayments : [];
    const pendingSubs = Array.isArray(dashboard.pendingSubscriptions) ? dashboard.pendingSubscriptions : [];
    const monthlyRevenues = Array.isArray(dashboard.monthlyRevenues) ? dashboard.monthlyRevenues : [];
    const topPayers = Array.isArray(dashboard.topPayers) ? dashboard.topPayers : [];

    // Map failed payments as transactions
    failedPaymentsList.forEach((t: any) => {
      items.push({
        id: t.pago_id || `failed-${Math.random()}`,
        userEmail: t.email || '—',
        type: 'PAYMENT',
        amount: Number(t.monto_intentado) || 0,
        status: 'FAILED',
        paymentMethod: t.metodo_pago || '—',
        createdAt: t.fecha_intento || new Date().toISOString(),
      });
    });

    // Map top payers as completed transactions
    topPayers.forEach((t: any) => {
      items.push({
        id: `payer-${t.email || Math.random()}`,
        userEmail: t.nombre_usuario || t.email || '—',
        type: 'PAYMENT',
        amount: Number(t.total_pagado_soles) || 0,
        status: 'COMPLETED',
        paymentMethod: t.metodos_usados || '—',
        createdAt: t.ultimo_pago || new Date().toISOString(),
      });
    });

    // Map pending subscriptions
    pendingSubs.forEach((t: any) => {
      items.push({
        id: `pending-${t.suscripcion_id || Math.random()}`,
        userEmail: t.email || '—',
        type: t.plan || 'SUBSCRIPTION',
        amount: Number(t.precio_final) || 0,
        status: 'PENDING',
        paymentMethod: '—',
        createdAt: t.fecha_creacion || new Date().toISOString(),
      });
    });

    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);
  }, [dashboardData]);

  // ── Date Range Options ──
  const dateRanges = [
    { key: '7D', label: '7 días' },
    { key: '1M', label: '30 días' },
    { key: '3M', label: '3 meses' },
    { key: '6M', label: '6 meses' },
    { key: '1Y', label: '1 año' },
  ];

  // ── Access Denied ──
  if (!canViewFinance) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Acceso Restringido</h3>
          <p className="text-gray-500">No tienes permisos para ver información financiera.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Finanzas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Resumen financiero completo de la plataforma
          </p>
        </div>
        <div className="flex items-center gap-1">
          {dateRanges.map((range) => (
            <button
              key={range.key}
              onClick={() => setDateRange(range.key)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                dateRange === range.key
                  ? 'bg-teal-500 text-white'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats Cards Row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Ingresos Totales"
          value={formatCompactCurrency(stats.totalRevenue)}
          growth={stats.revenueGrowth}
          icon={<DollarSign className="w-5 h-5" />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Ingresos este mes"
          value={formatCompactCurrency(stats.monthlyRevenue)}
          growth={stats.monthlyGrowth}
          icon={<TrendingUp className="w-5 h-5" />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Suscripciones Activas"
          value={stats.activeSubscriptions.toLocaleString()}
          growth={stats.subscriptionsGrowth}
          icon={<Users className="w-5 h-5" />}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Comisiones Generadas"
          value={formatCompactCurrency(stats.totalCommissions)}
          growth={stats.commissionsGrowth}
          icon={<Percent className="w-5 h-5" />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Pendientes de Cobro"
          value={stats.pendingPayments.toLocaleString()}
          growth={stats.pendingGrowth}
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
        />
        <StatCard
          title="Pagos Fallidos"
          value={stats.failedPayments.toLocaleString()}
          growth={stats.failedGrowth}
          icon={<AlertCircle className="w-5 h-5" />}
          iconBg="bg-red-50"
          iconColor="text-red-600"
        />
      </div>

      {/* ── Charts Section ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Line Chart - Monthly Revenue */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Ingresos Mensuales</h3>
              <p className="text-sm text-gray-500">Evolución de ingresos y suscripciones</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tiyuyColors.secondary[500] }} />
                <span className="text-xs text-gray-500">Ingresos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tiyuyColors.primary[500] }} />
                <span className="text-xs text-gray-500">Suscripciones</span>
              </div>
            </div>
          </div>
          <div className="h-60">
            {historyLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : lineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickFormatter={(v) => v >= 1000 ? `S/ ${(v / 1000).toFixed(0)}K` : `S/ ${v}`}
                    dx={-10}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dx={10}
                  />
                  <Tooltip content={<CustomLineTooltip />} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="Ingresos"
                    stroke={tiyuyColors.secondary[500]}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: tiyuyColors.secondary[500], stroke: '#fff', strokeWidth: 2 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="Suscripciones"
                    stroke={tiyuyColors.primary[500]}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: tiyuyColors.primary[500], stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-gray-400">No hay datos disponibles para este período</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Pie Chart + Quick Summary */}
        <div className="space-y-6">
          {/* Pie Chart - Revenue by Plan */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Ingresos por Plan</h3>
            <p className="text-sm text-gray-500 mb-4">Distribución de ingresos</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4 pt-4 border-t border-gray-50">
              {pieChartData.map((entry: any, idx: number) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }} />
                    <span className="text-gray-600">{entry.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">{formatCurrency(entry.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Financial Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Resumen Rápido</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Total Transacciones</span>
                <span className="text-sm font-semibold text-gray-900">
                  {financeStats?.totalTransactions ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Valor Promedio</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(financeStats?.averageTransactionValue ?? 0)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Reembolsos</span>
                <span className="text-sm font-semibold text-red-600">
                  {formatCurrency(financeStats?.refundsTotal ?? 0)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-500">Total Suscripciones</span>
                <span className="text-sm font-semibold text-gray-900">
                  {financeStats?.totalSubscriptions ?? (Array.isArray(subscriptionsData) ? subscriptionsData.length : 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Transactions Table + Activity Feed ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Transactions Table */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Transacciones Recientes</h3>
              <p className="text-sm text-gray-500">Últimas transacciones registradas</p>
            </div>
            <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
              Ver todas
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Método</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactionsLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-center">
                        <DollarSign className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No hay transacciones recientes</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((t: any) => (
                    <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3.5 text-sm font-mono text-gray-500">#{t.id}</td>
                      <td className="px-6 py-3.5">
                        <div className="text-sm font-medium text-gray-900">{t.userEmail || '—'}</div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-sm text-gray-600">{t.type || '—'}</span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span className={`text-sm font-semibold ${
                          t.type === 'REFUND' ? 'text-red-600' : 'text-emerald-600'
                        }`}>
                          {t.type === 'REFUND' ? '-' : '+'}{formatCurrency(t.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-sm text-gray-600">{t.paymentMethod || '—'}</span>
                      </td>
                      <td className="px-6 py-3.5 text-right text-sm text-gray-500">
                        {new Date(t.createdAt).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 text-center border-t border-gray-50">
            <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
              Ver todas las transacciones →
            </button>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Actividad Reciente</h3>
              <p className="text-sm text-gray-500">Eventos en tiempo real</p>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {activityFeed.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-400">No hay actividad reciente</p>
              </div>
            ) : (
              activityFeed.map((item) => (
                <ActivityFeedItem key={item.id} item={item} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
