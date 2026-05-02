'use client';

import { useState } from 'react';
import {
  useDevelopers,
  useDeveloperAgents,
  useDeveloperDiscountCodes,
  useDeveloperStats,
  useChangeDeveloperStatus,
  useCreateDeveloperDiscountCode,
  useApplyDirectDiscount,
  useRemoveAgentFromDeveloper,
  useToggleDeveloperDiscountCodeStatus,
  useDeleteDeveloperDiscountCode,
  useDeveloperStatusHistory,
  useNotifyDeveloper,
  useClearDeveloperStatusHistory,
  useDeleteStatusHistoryEntry,
} from '@/presentation/hooks/admin/useDevelopers';
import { useAssignDiscountToAgent } from '@/presentation/hooks/useAdmin';
import { Spinner } from '@/presentation/components/ui/Spinner';
import { InmobiliariaWithStats, InmobiliariaAgent, InmobiliariaDiscount } from '@/core/domain/entities/Admin';
import AgenciesHeader from './components/AgenciesHeader';
import AgenciesKpiRow from './components/AgenciesKpiRow';
import AgenciesFilters from './components/AgenciesFilters';
import AgenciesTable from './components/AgenciesTable';
import AgencyDetailPanel from './components/AgencyDetailPanel';
import CreateAgencyDiscountModal from './components/CreateAgencyDiscountModal';
import ApplyDirectDiscountModal from './components/ApplyDirectDiscountModal';
import NotifyAgencyModal from './components/NotifyAgencyModal';

export default function AgenciesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | undefined>(undefined);
  const [planFilter, setPlanFilter] = useState('');
  const [discountFilter, setDiscountFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [selectedDeveloper, setSelectedDeveloper] = useState<InmobiliariaWithStats | null>(null);
  const [historyPage, setHistoryPage] = useState(0);
  const HISTORY_PAGE_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDiscountModalOpen, setIsCreateDiscountModalOpen] = useState(false);
  const [isApplyDirectDiscountModalOpen, setIsApplyDirectDiscountModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [recentlyUpdatedAgencyId, setRecentlyUpdatedAgencyId] = useState<number | null>(null);
  const [newDiscount, setNewDiscount] = useState({
    code: '',
    discountPercentage: '',
    startDate: '',
    endDate: '',
    usageLimit: ''
  });
  const [directDiscount, setDirectDiscount] = useState({
    discountPercentage: '',
    reason: '',
    notifyAgency: true,
    applyToAllAgents: false,
    maxAgents: '',
    expiresAt: ''
  });
  const [notificationData, setNotificationData] = useState({
    subject: '',
    message: '',
    sendEmail: true,
    sendInApp: true
  });


  const { data: developersData, isLoading } = useDevelopers({
    search: searchQuery,
    status: statusFilter,
    page: currentPage - 1,
    size: 20,
  });

  const { data: developerAgents } = useDeveloperAgents(selectedDeveloper?.id || 0);
  const { data: developerDiscounts } = useDeveloperDiscountCodes(selectedDeveloper?.id || 0);
  const { data: developerStats } = useDeveloperStats(selectedDeveloper?.id || 0);
  const { data: statusHistoryData } = useDeveloperStatusHistory(
    selectedDeveloper?.id || 0,
    historyPage,
    HISTORY_PAGE_SIZE
  );
  const statusHistory = statusHistoryData?.content || [];
  const totalHistoryPages = statusHistoryData?.totalPages || 1;
  const totalHistoryElements = statusHistoryData?.totalElements || 0;

  
  
  const changeStatusMutation = useChangeDeveloperStatus();
  const createDiscountMutation = useCreateDeveloperDiscountCode();
  const applyDirectDiscountMutation = useApplyDirectDiscount();
  const removeAgentMutation = useRemoveAgentFromDeveloper();
  const toggleDiscountMutation = useToggleDeveloperDiscountCodeStatus();
  const deleteDiscountMutation = useDeleteDeveloperDiscountCode();
  const notifyDeveloperMutation = useNotifyDeveloper();
  const clearHistoryMutation = useClearDeveloperStatusHistory();
  const deleteHistoryEntryMutation = useDeleteStatusHistoryEntry();
  const assignDiscountToAgentMutation = useAssignDiscountToAgent();

  const developers = developersData?.content || [];

  
  // Debug: Ver qué campos vienen del API
  console.log('[DEBUG] Developers data:', developers.map(d => ({ id: d.id, name: d.name, lastActivity: d.lastActivity, lastLoginAt: (d as any).lastLoginAt, updatedAt: (d as any).updatedAt })));

  // Calculate KPIs
  const totalAgencies = developersData?.totalElements || 0;
  const totalAgents = developers.reduce((sum, dev) => sum + (dev.totalAgents || 0), 0);
  const activePlans = developers.filter((dev) => dev.subscriptionStatus === 'ACTIVE').length;
  const activeDiscounts = developers.reduce((sum, dev) => sum + (dev.activeDiscounts || 0), 0);
  const revenue30Days = developers.reduce((sum, dev) => sum + (dev.revenue30Days || 0), 0);

  const handleSelectAgency = (agency: InmobiliariaWithStats) => {
    setSelectedDeveloper(agency);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedDeveloper(null);
  };

  const highlightAgency = (agencyId: number) => {
    setRecentlyUpdatedAgencyId(agencyId);
    setTimeout(() => setRecentlyUpdatedAgencyId(null), 3000);
  };

  const handleChangeStatus = async (status: string, reason?: string) => {
    console.log(`[DEBUG] handleChangeStatus llamado:`, { status, selectedDeveloper });
    if (!selectedDeveloper) {
      alert('Por favor selecciona una inmobiliaria primero');
      return;
    }
    try {
      console.log(`[DEBUG] Enviando petición al backend:`, {
        id: selectedDeveloper.id,
        data: { status, reason, notifyDeveloper: true }
      });
      await changeStatusMutation.mutateAsync({
        id: selectedDeveloper.id,
        data: { status, reason, notifyDeveloper: true },
      });
      console.log(`[DEBUG] Petición exitosa, aplicando highlight`);

      // Actualizar el estado local para reflejar el cambio inmediatamente
      setSelectedDeveloper(prev => prev ? {
        ...prev,
        status: status as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
        enabled: status === 'ACTIVE'
      } : null);

      // Resetear página del historial a la primera página
      setHistoryPage(0);

      highlightAgency(selectedDeveloper.id);
      alert(`Inmobiliaria ${status === 'ACTIVE' ? 'activada' : status === 'SUSPENDED' ? 'suspendida' : 'bloqueada'} exitosamente`);
    } catch (error: any) {
      console.error('[DEBUG] Error al cambiar estado:', error);
      const errorMessage = error?.response?.data?.message || 'Error al cambiar el estado de la inmobiliaria. Por favor intenta nuevamente.';
      alert(errorMessage);
    }
  };

  const handleActivate = () => handleChangeStatus('ACTIVE');
  const handleSuspend = () => handleChangeStatus('SUSPENDED');
  const handleBlock = () => handleChangeStatus('BLOCKED');
  const handleCreateDiscount = () => {
    setIsCreateDiscountModalOpen(true);
  };
  const handleApplyDirectDiscount = () => {
    setIsApplyDirectDiscountModalOpen(true);
  };

  const handleClearHistory = async () => {
    if (!selectedDeveloper) return;
    
    if (!confirm(`¿Estás seguro de que quieres eliminar TODO el historial de "${selectedDeveloper.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await clearHistoryMutation.mutateAsync(selectedDeveloper.id);
      setHistoryPage(0); // Volver a la primera página
      alert(`Historial de "${selectedDeveloper.name}" eliminado exitosamente`);
    } catch (error: any) {
      console.error('Error al eliminar historial:', error);
      const errorMessage = error?.response?.data?.message || 'Error al eliminar el historial. Por favor intenta nuevamente.';
      alert(errorMessage);
    }
  };

  const handleDeleteHistoryEntry = async (entryId: number) => {
    if (!selectedDeveloper) return;
    
    if (!confirm(`¿Estás seguro de que quieres eliminar este registro del historial? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await deleteHistoryEntryMutation.mutateAsync({
        developerId: selectedDeveloper.id,
        entryId
      });
      alert('Registro eliminado exitosamente');
    } catch (error: any) {
      console.error('Error al eliminar registro:', error);
      const errorMessage = error?.response?.data?.message || 'Error al eliminar el registro. Por favor intenta nuevamente.';
      alert(errorMessage);
    }
  };

  const handleCreateDiscountSubmit = async () => {
    if (!selectedDeveloper) return;
    try {
      await createDiscountMutation.mutateAsync({
        developerId: selectedDeveloper.id,
        data: {
          inmobiliariaId: selectedDeveloper.id,
          code: newDiscount.code,
          discountPercentage: parseInt(newDiscount.discountPercentage),
          validFrom: newDiscount.startDate ? new Date(newDiscount.startDate) : new Date(),
          validUntil: newDiscount.endDate ? new Date(newDiscount.endDate) : undefined,
          maxUses: newDiscount.usageLimit ? parseInt(newDiscount.usageLimit) : undefined,
          applicableToAgents: false, // Descuento solo para la inmobiliaria, no para sus agentes
        },
      });

      highlightAgency(selectedDeveloper.id);
      setIsCreateDiscountModalOpen(false);
      setNewDiscount({
        code: '',
        discountPercentage: '',
        startDate: '',
        endDate: '',
        usageLimit: ''
      });
      alert('¡Descuento creado exitosamente! La inmobiliaria podrá usar este código en sus planes empresariales.');
    } catch (error: any) {
      console.error('Failed to create discount:', error);
      const errorMessage = error?.response?.data?.message || 'Error al crear el descuento. Por favor intenta nuevamente.';
      alert(errorMessage);
    }
  };

  const handleApplyDirectDiscountSubmit = async () => {
    if (!selectedDeveloper) return;

    try {
      // Validar que el porcentaje no esté vacío
      const discountPercent = parseInt(directDiscount.discountPercentage);
      if (!directDiscount.discountPercentage || isNaN(discountPercent) || discountPercent <= 0) {
        alert('Por favor ingrese un porcentaje de descuento válido');
        return;
      }

      // Validar que haya un motivo
      if (!directDiscount.reason || directDiscount.reason.trim() === '') {
        alert('Por favor ingrese un motivo para el descuento');
        return;
      }

      // El backend maneja todo: crea el código de descuento y lo asigna a los agentes
      const requestData = {
        discountPercentage: discountPercent,
        reason: directDiscount.reason.trim(),
        applyToAllAgents: directDiscount.applyToAllAgents,
        maxAgents: directDiscount.maxAgents && directDiscount.maxAgents.trim() ? parseInt(directDiscount.maxAgents) : undefined,
        expiresAt: directDiscount.expiresAt && directDiscount.expiresAt.trim() ? new Date(directDiscount.expiresAt) : undefined,
      };
      
      console.log('Enviando datos al backend:', JSON.stringify(requestData, null, 2));
      
      const result = await applyDirectDiscountMutation.mutateAsync({
        developerId: selectedDeveloper.id,
        data: requestData,
      });

      console.log('Respuesta del backend:', JSON.stringify(result, null, 2));

      // NOTA: El historial se registra automáticamente solo cuando se cambia el estado de la inmobiliaria
      // Las acciones como crear descuentos o aplicar descuentos directos no registran historial automáticamente

      // Mostrar resultado
      if (result.appliedCount > 0) {
        alert(`Descuento del ${directDiscount.discountPercentage}% aplicado exitosamente a ${result.appliedCount} agente(s).`);
      } else {
        console.warn(`No se aplicó descuento a agentes. Resultado:`, result);
        alert(`Descuento del ${directDiscount.discountPercentage}% aplicado exitosamente. No se aplicó código de descuento a agentes (posiblemente no hay agentes activos).`);
      }

      // Refresh data - los hooks de react query se actualizan automáticamente
      
      highlightAgency(selectedDeveloper.id);
      setIsApplyDirectDiscountModalOpen(false);
      setDirectDiscount({
        discountPercentage: '',
        reason: '',
        notifyAgency: true,
        applyToAllAgents: false,
        maxAgents: '',
        expiresAt: ''
      });
    } catch (error: any) {
      console.error('Failed to apply direct discount:', error);
      
      // Mostrar detalles del error para depuración
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        
        // Si es un error de validación del backend, mostrar el mensaje específico
        if (error.response.data && error.response.data.message) {
          alert(`Error del backend: ${error.response.data.message}`);
          if (error.response.data.details) {
            console.error('Validation details:', error.response.data.details);
          }
        } else {
          alert('Error al aplicar el descuento. Por favor intenta nuevamente.');
        }
      } else if (error.request) {
        console.error('Request error:', error.request);
        alert('Error de conexión. Por favor verifica tu conexión a internet.');
      } else {
        console.error('Error setting up request:', error.message);
        alert('Error inesperado. Por favor intenta nuevamente.');
      }
    }
  };
  const handleNotify = () => {
    setIsNotifyModalOpen(true);
  };

  const handleNotifyAgency = (agency: InmobiliariaWithStats) => {
    setSelectedDeveloper(agency);
    setIsNotifyModalOpen(true);
  };

  const handleNotifySubmit = async () => {
    if (!selectedDeveloper) return;
    try {
      await notifyDeveloperMutation.mutateAsync({
        developerId: selectedDeveloper.id,
        data: {
          subject: notificationData.subject,
          message: notificationData.message,
          sendEmail: notificationData.sendEmail,
          sendInApp: notificationData.sendInApp,
        },
      });
      highlightAgency(selectedDeveloper.id);
      setIsNotifyModalOpen(false);
      setNotificationData({
        subject: '',
        message: '',
        sendEmail: true,
        sendInApp: true
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export agencies data');
  };

  return (
    <div className="space-y-6 relative min-h-[calc(100vh-140px)]">
      {/* Header - Always visible */}
      <AgenciesHeader onExport={handleExport} />

      {/* Fullscreen Detail View when agency is selected */}
      {selectedDeveloper ? (
        <div className="absolute inset-0 z-40 bg-gray-50 overflow-auto">
          {/* Detail Header with Back Button */}
          <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToList}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Volver a la lista
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedDeveloper.name}
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedDeveloper.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                selectedDeveloper.status === 'SUSPENDED' ? 'bg-yellow-100 text-yellow-800' :
                selectedDeveloper.status === 'INACTIVE' ? 'bg-rose-100 text-rose-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {selectedDeveloper.status === 'ACTIVE' ? 'Activa' :
                 selectedDeveloper.status === 'SUSPENDED' ? 'Suspendida' :
                 selectedDeveloper.status === 'INACTIVE' ? 'Inactiva' :
                 selectedDeveloper.status}
              </span>
            </div>
          </div>

          {/* Fullscreen Detail Content */}
          <div className="p-6 max-w-7xl mx-auto">
            <AgencyDetailPanel
              agency={selectedDeveloper}
              agents={developerAgents || []}
              discounts={developerDiscounts || []}
              stats={developerStats}
              statusHistory={statusHistory || []}
              historyPage={historyPage}
              totalHistoryPages={totalHistoryPages}
              totalHistoryElements={totalHistoryElements}
              onHistoryPageChange={setHistoryPage}
              onClearHistory={handleClearHistory}
              onDeleteHistoryEntry={handleDeleteHistoryEntry}
              onClose={handleBackToList}
              onActivate={handleActivate}
              onSuspend={handleSuspend}
              onBlock={handleBlock}
              onCreateDiscount={handleCreateDiscount}
              onApplyDirectDiscount={handleApplyDirectDiscount}
              onNotify={handleNotify}
              isChangingStatus={changeStatusMutation.isPending}
              isFullscreen={true}
            />
          </div>
        </div>
      ) : (
        <>
          {/* List View */}
          <AgenciesKpiRow
            totalAgencies={totalAgencies}
            totalAgents={totalAgents}
            activePlans={activePlans}
            activeDiscounts={activeDiscounts}
            revenue30Days={revenue30Days}
          />

          <AgenciesFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            planFilter={planFilter}
            onPlanChange={setPlanFilter}
            discountFilter={discountFilter}
            onDiscountChange={setDiscountFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : (
              <AgenciesTable
                agencies={developers}
                onSelectAgency={handleSelectAgency}
                onNotifyAgency={handleNotifyAgency}
                selectedAgencyId={undefined}
                recentlyUpdatedAgencyId={recentlyUpdatedAgencyId}
              />
            )}
          </div>
        </>
      )}

      {/* Modals */}
      <CreateAgencyDiscountModal
        isOpen={isCreateDiscountModalOpen}
        onClose={() => setIsCreateDiscountModalOpen(false)}
        selectedAgency={selectedDeveloper}
        newDiscount={newDiscount}
        setNewDiscount={setNewDiscount}
        onCreate={handleCreateDiscountSubmit}
        isPending={createDiscountMutation.isPending}
      />

      <ApplyDirectDiscountModal
        isOpen={isApplyDirectDiscountModalOpen}
        onClose={() => setIsApplyDirectDiscountModalOpen(false)}
        selectedAgency={selectedDeveloper}
        directDiscount={directDiscount}
        setDirectDiscount={setDirectDiscount}
        onApply={handleApplyDirectDiscountSubmit}
        isPending={applyDirectDiscountMutation.isPending}
      />

      <NotifyAgencyModal
        isOpen={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
        selectedAgency={selectedDeveloper}
        notificationData={notificationData}
        setNotificationData={setNotificationData}
        onSend={handleNotifySubmit}
        isPending={notifyDeveloperMutation.isPending}
      />
    </div>
  );
}
