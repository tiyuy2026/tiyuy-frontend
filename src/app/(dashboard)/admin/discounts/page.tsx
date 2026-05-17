/**
 * Admin Discount Codes Page
 * Complete discount code management with RBAC
 * Includes centralized view of all discounts from all sources
 * Premium SaaS dashboard design
 */

'use client';

import { useState, useCallback } from 'react';
import { useDiscountCodes, useCreateDiscountCode, useUpdateDiscountCode, useDeleteDiscountCode, useCentralDiscounts, useCentralDiscountSummary } from '@/presentation/hooks/useAdmin';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Modal } from '@/presentation/components/ui/Modal';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { LoadingState, EmptyState, ErrorState } from '@/presentation/components/admin/AdminUIStates';
import { DiscountCode, CreateDiscountCodeRequest, UpdateDiscountCodeRequest, DiscountApplicability, DiscountCodeStatus, CentralDiscountDto } from '@/core/domain/entities/Admin';
import UniversalDiscountApplier from './components/UniversalDiscountApplier';
import DiscountKPIs from './components/DiscountKPIs';
import DiscountStatusSection from './components/DiscountStatusSection';
import RecentActivitySection from './components/RecentActivitySection';

type TabView = 'codes' | 'central';

// ==================== Helper Components ====================

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    INACTIVE: 'bg-gray-100 text-gray-600 border-gray-200',
    EXPIRED: 'bg-amber-100 text-amber-800 border-amber-200',
    EXHAUSTED: 'bg-red-100 text-red-800 border-red-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    USED: 'bg-blue-100 text-blue-800 border-blue-200',
    DEPLETED: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {status}
    </span>
  );
};

const SourceBadge = ({ source, sourceLabel }: { source: string; sourceLabel: string }) => {
  const colors: Record<string, string> = {
    DISCOUNT_CODE: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    AGENT: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    DEVELOPER: 'bg-violet-100 text-violet-800 border-violet-200',
    AGENCY_PLAN: 'bg-orange-100 text-orange-800 border-orange-200',
    USER: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[source] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {sourceLabel}
    </span>
  );
};

// ==================== Central Discounts View ====================

function CentralDiscountsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data: discountsData, isLoading, error, refetch } = useCentralDiscounts({
    source: sourceFilter === 'ALL' ? undefined : sourceFilter,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    search: searchQuery || undefined,
    page,
    size: pageSize,
  });

  const { data: summary } = useCentralDiscountSummary();

  const discounts = discountsData?.content || [];
  const totalElements = discountsData?.totalElements || 0;
  const totalPages = discountsData?.totalPages || 0;

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(0);
  }, []);

  const sourceOptions = [
    { value: 'ALL', label: 'Todos' },
    { value: 'DISCOUNT_CODE', label: 'Codigos' },
    { value: 'AGENT', label: 'Agentes' },
    { value: 'DEVELOPER', label: 'Inmobiliarias' },
    { value: 'AGENCY_PLAN', label: 'Planes' },
    { value: 'USER', label: 'Usuarios' },
  ];

  const statusOptions = [
    { value: 'ALL', label: 'Todos' },
    { value: 'ACTIVE', label: 'Activos' },
    { value: 'INACTIVE', label: 'Inactivos' },
    { value: 'EXPIRED', label: 'Vencidos' },
    { value: 'EXHAUSTED', label: 'Agotados' },
    { value: 'USED', label: 'Usados' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{summary.total}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Activos</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">{summary.active}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Inactivos</p>
            <p className="text-xl font-bold text-gray-500 mt-1">{summary.inactive}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Vencidos</p>
            <p className="text-xl font-bold text-amber-600 mt-1">{summary.expired}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Usuarios</p>
            <p className="text-xl font-bold text-blue-600 mt-1">{summary.users}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Agentes</p>
            <p className="text-xl font-bold text-cyan-600 mt-1">{summary.agents}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por codigo, asignado..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <select
          value={sourceFilter}
          onChange={(e) => { setSourceFilter(e.target.value); setPage(0); }}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        >
          {sourceOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Codigo</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Origen</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Descuento</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Asignado a</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Usos</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Creado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12">
                    <LoadingState message="Cargando descuentos..." />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12">
                    <ErrorState message="Error al cargar descuentos" retry={refetch} />
                  </td>
                </tr>
              ) : discounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12">
                    <EmptyState title="No se encontraron descuentos" />
                  </td>
                </tr>
              ) : (
                discounts.map((discount: CentralDiscountDto, index: number) => (
                  <tr key={discount.id ?? index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{discount.code || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <SourceBadge source={discount.source} sourceLabel={discount.sourceLabel || discount.source} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">{discount.discountPercentage}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{discount.assignedByName || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={discount.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {discount.usageCount ?? 0}/{discount.maxUsage ?? '∞'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-400">
                        {discount.createdAt ? new Date(discount.createdAt).toLocaleDateString('es-PE') : '-'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <span className="text-sm text-gray-400">
              Pagina {page + 1} de {totalPages} ({totalElements} resultados)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== Main Page ====================

export default function DiscountsPage() {
  const [activeTab, setActiveTab] = useState<TabView>('codes');
  const { hasPermission } = usePermissions();

  const canManageDiscounts = hasPermission('DISCOUNTS_MANAGE');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ==================== HEADER ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Descuentos</h1>
          <p className="text-sm text-gray-400 mt-1">Gestion de codigos de descuento y promociones</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={activeTab === 'codes' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('codes')}
            className="rounded-xl"
          >
            Aplicador
          </Button>
          <Button
            variant={activeTab === 'central' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('central')}
            className="rounded-xl"
          >
            Gestion Centralizada
          </Button>
        </div>
      </div>

      {/* ==================== KPIs SUPERIORES ==================== */}
      <div className="mb-12">
        <DiscountKPIs />
      </div>

      {/* ==================== CONTENIDO PRINCIPAL ==================== */}
      {activeTab === 'codes' ? (
        <div className="space-y-12">
          {/* Aplicador Universal */}
          <section>
            <UniversalDiscountApplier />
          </section>

          {/* Estados de Descuentos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DiscountStatusSection />
            <div />
          </div>

          {/* Actividad Reciente - full width con paginacion */}
          <section>
            <RecentActivitySection />
          </section>
        </div>
      ) : (
        <CentralDiscountsView />
      )}
    </div>
  );
}
