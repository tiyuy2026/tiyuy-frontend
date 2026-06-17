'use client';

import { useState, useMemo } from 'react';
import {
  useAgentDiscounts,
  useAvailableDiscountsForAgent,
  useAssignDiscountToAgent,
  useRemoveDiscountFromAgent,
  useToggleAgentDiscountStatus,
  useCreateDiscountCode,
  useAgentList,
  useCreateAgentPlanDiscount
} from '@/presentation/hooks/useAdmin';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { Card } from '@/presentation/components/ui/Card';
import { Modal } from '@/presentation/components/ui/Modal';
import { Button } from '@/presentation/components/ui/Button';
import { AdminTable } from '@/presentation/components/admin/AdminTable/AdminTable';
import { LoadingState, EmptyState } from '@/presentation/components/admin/AdminUIStates';
import { AgentDiscount } from '@/core/domain/entities/AgentDiscount';
import { AgentListItem } from '@/core/domain/entities/Admin';
import { format } from 'date-fns';
import Link from 'next/link';
import AssignDiscountModal from './components/AssignDiscountModal';
import CreateDiscountModal from './components/CreateDiscountModal';
import PlanDiscountModal from './components/PlanDiscountModal';
import { Inbox, RefreshCw, Search, Trash2, Users } from 'lucide-react';;

export default function AgentDiscountsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [agentSearchQuery, setAgentSearchQuery] = useState('');
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedAgent, setSelectedAgent] = useState<AgentListItem | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<{ code: string; name: string; price: string; color: string } | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCreateDiscountModalOpen, setIsCreateDiscountModalOpen] = useState(false);
  const [isPlanDiscountModalOpen, setIsPlanDiscountModalOpen] = useState(false);
  const [planDiscount, setPlanDiscount] = useState({
    discountPercentage: '',
    customPrice: '',
    startDate: '',
    endDate: ''
  });
  const [newDiscount, setNewDiscount] = useState({
    code: '',
    discountPercentage: '',
    startDate: '',
    endDate: '',
    usageLimit: ''
  });
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { hasPermission } = usePermissions();
  const canManageDiscounts = hasPermission('DISCOUNTS_MANAGE');

  const params = { page: 0, size: 100 };

  // Fetch all agents for search
  const { data: agentsData } = useAgentList(params);
  const allAgents = agentsData?.content || [];

  // Filter agents by search query (name, email, DNI)
  const filteredAgents = useMemo(() => {
    if (!agentSearchQuery.trim()) return [];
    const query = agentSearchQuery.toLowerCase();
    return allAgents.filter((agent: AgentListItem) => 
      (agent.firstName?.toLowerCase() || '').includes(query) ||
      (agent.lastName?.toLowerCase() || '').includes(query) ||
      agent.email.toLowerCase().includes(query) ||
      (agent.dni || '').toLowerCase().includes(query)
    ).slice(0, 5);
  }, [allAgents, agentSearchQuery]);

  const { data: discountsData, isLoading, refetch } = useAgentDiscounts(
    selectedAgent ? { agentId: selectedAgent.id } : {},
    { page: currentPage - 1, size: pageSize }
  );

  const { data: availableDiscounts } = useAvailableDiscountsForAgent(selectedAgent?.id || 0);
  const assignDiscountMutation = useAssignDiscountToAgent();
  const removeDiscountMutation = useRemoveDiscountFromAgent();
  const toggleStatusMutation = useToggleAgentDiscountStatus();
  const createDiscountMutation = useCreateDiscountCode();
  const createPlanDiscountMutation = useCreateAgentPlanDiscount();

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSelectAgent = (agent: AgentListItem) => {
    setSelectedAgent(agent);
    setAgentSearchQuery(`${agent.firstName} ${agent.lastName} (${agent.email})`);
    setShowAgentDropdown(false);
    // Auto-fetch discounts when agent is selected
    refetch();
  };

  const handleAssignDiscount = async (discountId: number) => {
    if (!selectedAgent) return;

    try {
      await assignDiscountMutation.mutateAsync({
        userId: selectedAgent.id,
        discountCodeId: discountId,
        notes: `Asignado por admin el ${new Date().toLocaleDateString()}`
      });
      showNotification('Descuento asignado correctamente', 'success');
      refetch();
    } catch (error) {
      showNotification('Error al asignar descuento', 'error');
    }
  };

  const handleRemoveDiscount = async (assignmentId: number) => {
    try {
      await removeDiscountMutation.mutateAsync(assignmentId);
      showNotification('Descuento eliminado correctamente', 'success');
      refetch();
    } catch (error) {
      showNotification('Error al eliminar descuento', 'error');
    }
  };

  const handleToggleStatus = async (discountId: number) => {
    try {
      await toggleStatusMutation.mutateAsync(discountId);
      showNotification('Estado actualizado', 'success');
      refetch();
    } catch (error) {
      showNotification('Error al actualizar estado', 'error');
    }
  };

  const handleCreateCustomDiscount = async () => {
    if (!selectedAgent) return;

    try {
      await createDiscountMutation.mutateAsync({
        code: newDiscount.code,
        discountPercentage: parseFloat(newDiscount.discountPercentage),
        applicability: 'USER_SPECIFIC',
        startDate: new Date(newDiscount.startDate),
        endDate: new Date(newDiscount.endDate),
        usageLimit: newDiscount.usageLimit ? parseInt(newDiscount.usageLimit) : undefined,
        applicableUserId: selectedAgent.id,
        singleUse: false
      });
      showNotification('Descuento creado correctamente', 'success');
      setIsCreateDiscountModalOpen(false);
      setNewDiscount({
        code: '',
        discountPercentage: '',
        startDate: '',
        endDate: '',
        usageLimit: ''
      });
      refetch();
    } catch (error) {
      showNotification('Error al crear descuento', 'error');
    }
  };

  const discounts = discountsData?.content || [];

  // Filter discounts based on search and filters
  const filteredDiscounts = discounts.filter((discount: AgentDiscount) => {
    const matchesSearch = !searchQuery ||
      discount.discountCode.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discount.discountCode.discountPercentage.toString().includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || discount.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Paginate results
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedDiscounts = filteredDiscounts.slice(startIndex, endIndex);

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion de Descuentos</h1>
          <p className="text-gray-600">Administra codigos de descuento asignados a agentes individuales</p>
        </div>
        <Link href="/admin/agents">
          <Button variant="outline" className="flex items-center gap-2">
            <span>←</span> Volver a Agentes
          </Button>
        </Link>
      </div>

      {/* Agent Selection Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Seleccionar Agente</h3>
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar por nombre, email o DNI:
          </label>
          <div className="relative">
            <input
              type="text"
              value={agentSearchQuery}
              onChange={(e) => {
                setAgentSearchQuery(e.target.value);
                setShowAgentDropdown(true);
                if (!e.target.value) setSelectedAgent(null);
              }}
              onFocus={() => setShowAgentDropdown(true)}
              placeholder="Ej: Juan Perez, juan@email.com, 12345678..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-base"
            />
            {/* Dropdown with filtered agents */}
            {showAgentDropdown && filteredAgents.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                {filteredAgents.map((agent: AgentListItem) => (
                  <button
                    key={agent.id}
                    onClick={() => handleSelectAgent(agent)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-semibold">
                      {agent.firstName?.[0]}{agent.lastName?.[0]}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {agent.firstName} {agent.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {agent.email} {agent.dni && `• DNI: ${agent.dni}`}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      agent.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {agent.enabled ? 'Activo' : 'Inactivo'}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {showAgentDropdown && agentSearchQuery && filteredAgents.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 text-center text-gray-500">
                No se encontraron agentes
              </div>
            )}
          </div>
        </div>

        {/* Selected Agent Info */}
        {selectedAgent && (
          <div className="mt-4 p-4 bg-teal-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-white text-lg font-bold">
                {selectedAgent.firstName?.[0]}{selectedAgent.lastName?.[0]}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{selectedAgent.firstName} {selectedAgent.lastName}</div>
                <div className="text-sm text-gray-600">{selectedAgent.email} • DNI: {selectedAgent.dni || 'N/A'}</div>
              </div>
            </div>
            <div className="flex gap-2">
              {canManageDiscounts && (
                <>
                  <Button
                    onClick={() => setIsAssignModalOpen(true)}
                    variant="outline"
                    className="border-teal-600 text-teal-600 hover:bg-teal-50"
                  >
                    Asignar Existente
                  </Button>
                  <Button
                    onClick={() => setIsCreateDiscountModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    + Crear Nuevo
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Available Plans with Discounts */}
      {selectedAgent && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">2. Planes Disponibles - Aplicar Descuento</h3>
          <p className="text-sm text-gray-600 mb-4">Selecciona un plan para crear un descuento personalizado para este agente:</p>
          
          <div className="grid grid-cols-5 gap-4">
            {[
              { code: 'ENTERPRISE', name: 'Plan Empresarial', price: 'S/399', color: 'bg-teal-600' },
              { code: 'ENTERPRISE_TRIAL', name: 'Prueba Empresarial', price: 'S/299', color: 'bg-teal-500' },
              { code: 'PREMIUM', name: 'Plan Pro', price: 'S/99', color: 'bg-blue-600' },
              { code: 'BASIC', name: 'Plan Basico', price: 'S/29', color: 'bg-orange-500' },
              { code: 'FREE', name: 'Plan Gratis', price: 'S/0', color: 'bg-gray-500' }
            ].map((plan) => (
              <div key={plan.code} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${plan.color} rounded-lg flex items-center justify-center text-white font-bold mb-3`}>
                  {plan.code[0]}
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">{plan.name}</h4>
                <p className="text-lg font-bold text-gray-900">{plan.price}</p>
                <Button
                  onClick={() => {
                    setSelectedPlan(plan);
                    setIsPlanDiscountModalOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 border-teal-600 text-teal-600 hover:bg-teal-50"
                >
                  Aplicar Descuento
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Discounts History - Premium Table Design */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Historial de Descuentos</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {selectedAgent
                  ? `Descuentos asignados a ${selectedAgent.firstName} ${selectedAgent.lastName}`
                  : 'Selecciona un agente para ver su historial'
                }
              </p>
            </div>
            {selectedAgent && canManageDiscounts && (
              <Button
                onClick={() => setIsCreateDiscountModalOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                + Crear Descuento
              </Button>
            )}
          </div>
        </div>

        {/* Toolbar */}
        {selectedAgent && (
          <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <input
                  type="text"
                  placeholder="Buscar por codigo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
              <div className="relative">
                <button
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  {statusFilter === 'all' ? 'Todos' :
                   statusFilter === 'ACTIVE' ? 'Activo' :
                   statusFilter === 'EXPIRED' ? 'Expirado' :
                   statusFilter === 'USED' ? 'Usado' : 'Cancelado'}
                </button>
                {statusDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-[150px]">
                    <div
                      onClick={() => { setStatusFilter('all'); setStatusDropdownOpen(false); }}
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                    >
                      Todos
                    </div>
                    <div
                      onClick={() => { setStatusFilter('ACTIVE'); setStatusDropdownOpen(false); }}
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                    >
                      Activo
                    </div>
                    <div
                      onClick={() => { setStatusFilter('EXPIRED'); setStatusDropdownOpen(false); }}
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                    >
                      Expirado
                    </div>
                    <div
                      onClick={() => { setStatusFilter('USED'); setStatusDropdownOpen(false); }}
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                    >
                      Usado
                    </div>
                    <div
                      onClick={() => { setStatusFilter('CANCELLED'); setStatusDropdownOpen(false); }}
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                    >
                      Cancelado
                    </div>
                  </div>
                )}
              </div>
              <button
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                onClick={handleClearFilters}
              >
                Limpiar
              </button>
            </div>
          </div>
        )}

        {/* Table Header - Always Visible */}
        <div className="grid grid-cols-7 gap-4 px-6 py-3 bg-gray-100 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
          <div className="col-span-2">Codigo</div>
          <div>Tipo</div>
          <div>Valor</div>
          <div>Uso</div>
          <div>Expira</div>
          <div>Estado</div>
        </div>

        {/* Table Body */}
        <div className="min-h-[200px]">
          {!selectedAgent && (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Users className="w-12 h-12 mb-3" />
              <p className="text-sm">Selecciona un agente para ver su historial</p>
            </div>
          )}

          {selectedAgent && (
            <>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  <p className="text-sm text-gray-500 mt-3">Cargando...</p>
                </div>
              ) : paginatedDiscounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                  <Inbox className="w-12 h-12 mb-3" />
                  <p className="text-sm">Sin descuentos asignados</p>
                  {canManageDiscounts && (
                    <button
                      onClick={() => setIsCreateDiscountModalOpen(true)}
                      className="mt-3 text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      Crear primer descuento
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {paginatedDiscounts.map((discount: AgentDiscount) => {
                    const statusConfig: Record<string, { bg: string; text: string; label: string; dot: string }> = {
                      ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', label: 'Activo', dot: 'bg-green-500' },
                      EXPIRED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Expirado', dot: 'bg-red-500' },
                      USED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Usado', dot: 'bg-gray-500' },
                      CANCELLED: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Cancelado', dot: 'bg-yellow-500' }
                    };
                    const config = statusConfig[discount.status] || statusConfig.CANCELLED;
                    const isExpired = discount.expiresAt && new Date(discount.expiresAt) < new Date();
                    const usagePercentage = discount.maxUsage ? Math.round((discount.usageCount / discount.maxUsage) * 100) : 0;

                    return (
                      <div key={discount.id} className="grid grid-cols-7 gap-4 px-6 py-4 hover:bg-gray-50 items-center transition-colors">
                        {/* Code */}
                        <div className="col-span-2">
                          <div className="font-mono text-sm bg-teal-50 text-teal-700 px-2.5 py-1 rounded font-semibold inline-block">
                            {discount.discountCode.code}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {format(new Date(discount.assignedAt), 'dd/MM/yyyy')}
                          </div>
                        </div>

                        {/* Type */}
                        <div>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            {discount.discountCode.applicability === 'USER_SPECIFIC' ? 'Personalizado' : 'General'}
                          </span>
                        </div>

                        {/* Value */}
                        <div>
                          <span className="text-green-600 font-bold">
                            -{discount.discountCode.discountPercentage}%
                          </span>
                        </div>

                        {/* Usage */}
                        <div>
                          <div className="text-sm font-medium text-gray-700">{discount.usageCount} / {discount.maxUsage || '∞'}</div>
                          {discount.maxUsage && (
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1">
                              <div
                                className={`h-1.5 rounded-full ${usagePercentage >= 80 ? 'bg-red-500' : usagePercentage >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                style={{ width: `${usagePercentage}%` }}
                              ></div>
                            </div>
                          )}
                        </div>

                        {/* Expires */}
                        <div>
                          {discount.expiresAt ? (
                            <>
                              <div className={`text-sm font-medium ${isExpired ? 'text-red-600' : 'text-gray-700'}`}>
                                {format(new Date(discount.expiresAt), 'dd/MM/yyyy')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {isExpired ? 'Expirado' : 'Vigente'}
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                              {config.label}
                            </span>
                          </div>
                          {canManageDiscounts && (
                            <div className="flex gap-0.5 ml-2">
                              <button
                                onClick={() => handleToggleStatus(discount.id)}
                                className="p-1.5 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600 transition-colors"
                                title="Cambiar estado"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRemoveDiscount(discount.id)}
                                className="p-1.5 hover:bg-red-100 rounded text-gray-400 hover:text-red-600 transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination Footer */}
        {selectedAgent && filteredDiscounts.length > pageSize && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {startIndex + 1}-{Math.min(endIndex, filteredDiscounts.length)} de {filteredDiscounts.length}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={endIndex >= filteredDiscounts.length}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Assign Discount Modal */}
      <AssignDiscountModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        selectedAgent={selectedAgent}
        availableDiscounts={availableDiscounts}
        onAssign={handleAssignDiscount}
        isPending={assignDiscountMutation.isPending}
      />

      {/* Create Custom Discount Modal */}
      <CreateDiscountModal
        isOpen={isCreateDiscountModalOpen}
        onClose={() => setIsCreateDiscountModalOpen(false)}
        selectedAgent={selectedAgent}
        newDiscount={newDiscount}
        setNewDiscount={setNewDiscount}
        onCreate={handleCreateCustomDiscount}
        isPending={createDiscountMutation.isPending}
      />

      {/* Plan Discount Modal */}
      <PlanDiscountModal
        isOpen={isPlanDiscountModalOpen}
        onClose={() => setIsPlanDiscountModalOpen(false)}
        selectedAgent={selectedAgent}
        selectedPlan={selectedPlan}
        planDiscount={planDiscount}
        setPlanDiscount={setPlanDiscount}
        onCreate={async () => {
          if (!selectedAgent || !selectedPlan) return;
          try {
            await createPlanDiscountMutation.mutateAsync({
              agentId: selectedAgent.id,
              data: {
                planCode: selectedPlan.code,
                discountPercentage: parseFloat(planDiscount.discountPercentage),
                customPricePen: parseFloat(planDiscount.customPrice),
                validFrom: planDiscount.startDate ? new Date(planDiscount.startDate).toISOString() : undefined,
                validUntil: planDiscount.endDate ? new Date(planDiscount.endDate).toISOString() : undefined,
                notes: `Descuento creado desde panel admin`
              }
            });
            showNotification(`Descuento del ${planDiscount.discountPercentage}% aplicado a ${selectedPlan.name}`, 'success');
            setIsPlanDiscountModalOpen(false);
            setPlanDiscount({ discountPercentage: '', customPrice: '', startDate: '', endDate: '' });
          } catch (error) {
            showNotification('Error al aplicar descuento', 'error');
          }
        }}
        isPending={createPlanDiscountMutation.isPending}
      />
    </div>
  );
}
