'use client';

import { Clock, Tag, UserPlus, CreditCard, Edit, ChevronLeft, ChevronRight, CheckCircle, XCircle, Ban, Trash2 } from 'lucide-react';

interface AgencyHistoryListProps {
  history: any[];
  currentPage?: number;
  totalPages?: number;
  totalElements?: number;
  onPageChange?: (page: number) => void;
  onClearHistory?: () => void;
  onDeleteHistoryEntry?: (entryId: number) => void;
  isBackendPaginated?: boolean;
}

export function AgencyHistoryList({
  history,
  currentPage = 0,
  totalPages = 1,
  totalElements = 0,
  onPageChange,
  onClearHistory,
  onDeleteHistoryEntry,
  isBackendPaginated = false,
}: AgencyHistoryListProps) {
  const ITEMS_PER_PAGE = 5;

  
  const getIconForAction = (action: string, newStatus?: string, oldStatus?: string) => {
    // Para cambios de estado, mostrar icono específico según el nuevo estado
    if (action === 'STATUS_CHANGED' || action === 'status_changed') {
      if (newStatus === 'ACTIVE') return CheckCircle;
      if (newStatus === 'SUSPENDED') return XCircle;
      if (newStatus === 'BLOCKED') return Ban;
    }

    switch (action) {
      case 'DISCOUNT_APPLIED':
      case 'discount_applied':
        return Tag;
      case 'AGENT_ADDED':
      case 'agent_added':
        return UserPlus;
      case 'PLAN_CHANGED':
      case 'plan_changed':
        return CreditCard;
      case 'STATUS_CHANGED':
      case 'status_changed':
        return Edit;
      default:
        return Clock;
    }
  };

  const getIconColor = (action: string, newStatus?: string) => {
    if (action === 'STATUS_CHANGED' || action === 'status_changed') {
      if (newStatus === 'ACTIVE') return 'text-blue-600 bg-blue-50 border-blue-200';
      if (newStatus === 'SUSPENDED') return 'text-amber-600 bg-amber-50 border-amber-200';
      if (newStatus === 'BLOCKED') return 'text-red-600 bg-red-50 border-red-200';
    }
    if (action?.includes('DISCOUNT') || action?.includes('discount')) return 'text-teal-600 bg-teal-50 border-teal-200';
    if (action?.includes('AGENT') || action?.includes('agent')) return 'text-cyan-600 bg-cyan-50 border-cyan-200';
    if (action?.includes('PLAN') || action?.includes('plan')) return 'text-purple-600 bg-purple-50 border-purple-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const getActionLabel = (action: string) => {
    switch (action?.toUpperCase()) {
      case 'DISCOUNT_APPLIED':
        return 'Descuento aplicado';
      case 'AGENT_ADDED':
        return 'Nuevo agente registrado';
      case 'PLAN_CHANGED':
        return 'Cambio de plan';
      case 'STATUS_CHANGED':
        return 'Cambio de estado';
      default:
        return 'Actualización realizada';
    }
  };

  const getDescription = (item: any) => {
    // Si tiene descripción válida (no vacía ni genérica)
    if (item.description && item.description !== 'Sin descripción' && item.description.trim()) {
      return item.description;
    }
    if (item.reason && item.reason.trim()) {
      return item.reason;
    }

    // Generar descripción basada en el tipo de acción
    const action = item.action || item.type || '';
    const newStatus = item.newStatus || item.newStatus || item.status;
    const oldStatus = item.oldStatus || item.previousStatus;
    const performedBy = item.performedByName || item.adminName || 'Admin';

    if (action.toUpperCase().includes('STATUS')) {
      if (oldStatus && newStatus) {
        return `Estado cambiado de "${oldStatus}" a "${newStatus}" por ${performedBy}`;
      }
      if (newStatus) {
        return `Inmobiliaria ${newStatus === 'ACTIVE' ? 'activada' : newStatus === 'SUSPENDED' ? 'suspendida' : 'bloqueada'} por ${performedBy}`;
      }
    }

    if (action.toUpperCase().includes('DISCOUNT')) {
      const discountCode = item.discountCode || item.code || 'código';
      const percent = item.discountPercentage || item.percentage;
      return percent
        ? `Descuento ${discountCode} (${percent}%) aplicado por ${performedBy}`
        : `Código de descuento ${discountCode} creado por ${performedBy}`;
    }

    if (action.toUpperCase().includes('AGENT')) {
      const agentName = item.agentName || item.agentEmail || 'nuevo agente';
      return `Agente ${agentName} registrado por ${performedBy}`;
    }

    if (action.toUpperCase().includes('PLAN')) {
      const newPlan = item.newPlan || item.plan || 'nuevo plan';
      const oldPlan = item.oldPlan || item.previousPlan;
      return oldPlan
        ? `Plan cambiado de "${oldPlan}" a "${newPlan}" por ${performedBy}`
        : `Plan actualizado a "${newPlan}" por ${performedBy}`;
    }

    return `Acción realizada por ${performedBy}`;
  };

  // Paginación: usar datos del backend o cliente-side
  const displayPage = isBackendPaginated ? currentPage + 1 : currentPage;
  const displayTotalPages = totalPages;
  const displayTotalElements = totalElements || history.length;

  // Para paginación cliente-side (fallback)
  const sortedHistory = isBackendPaginated
    ? history // Ya viene ordenado del backend
    : [...history].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date || 0);
        const dateB = new Date(b.createdAt || b.date || 0);
        return dateB.getTime() - dateA.getTime();
      });

  const goToPage = (page: number) => {
    const zeroBasedPage = page - 1; // Convertir a 0-based para el backend
    if (onPageChange && zeroBasedPage >= 0 && zeroBasedPage < displayTotalPages) {
      onPageChange(zeroBasedPage);
    }
  };

  const goToPrevious = () => goToPage(displayPage - 1);
  const goToNext = () => goToPage(displayPage + 1);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + history.length;

  return (
    <div>

      <div className="space-y-3">
        {history.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Sin historial reciente</p>
            <p className="text-xs text-gray-400 mt-1">Las acciones aparecerán aquí</p>
          </div>
        ) : (
          <>
            {history.map((item, index) => {
              const Icon = getIconForAction(
                item.action || item.type,
                item.newStatus || item.status,
                item.oldStatus || item.previousStatus
              );
              const iconColorClass = getIconColor(
                item.action || item.type,
                item.newStatus || item.status
              );
              const description = getDescription(item);

              return (
                <div
                  key={item.id || index}
                  className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-shadow group"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${iconColorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {getActionLabel(item.action || item.type)}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1.5">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Fecha no disponible'}
                        </p>
                      </div>
                      {onDeleteHistoryEntry && (
                        <button
                          onClick={() => onDeleteHistoryEntry(item.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Eliminar este registro"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Paginación */}
            {displayTotalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={goToPrevious}
                  disabled={displayPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: displayTotalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                        displayPage === page
                          ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={goToNext}
                  disabled={displayPage === displayTotalPages}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-100"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="text-center">
              <span className="text-xs text-gray-400">
                Página {displayPage} de {displayTotalPages} • Mostrando {startIndex + 1}-{Math.min(endIndex, displayTotalElements)} de {displayTotalElements} registros
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
