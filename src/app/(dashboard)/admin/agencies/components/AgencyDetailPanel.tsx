'use client';

import { ArrowLeft, Ban, CheckCircle, ChevronRight, Lock, Mail, MapPin, Megaphone, PauseCircle, Phone, Tag, UserCheck, Users, X } from 'lucide-react';
import { InmobiliariaWithStats, InmobiliariaAgent, InmobiliariaDiscount } from '@/core/domain/entities/Admin';
import { AgencyHistoryList } from './AgencyHistoryList';

interface AgencyDetailPanelProps {
  agency: InmobiliariaWithStats | null;
  agents: InmobiliariaAgent[];
  discounts: InmobiliariaDiscount[];
  stats?: any;
  statusHistory?: any[];
  historyPage?: number;
  totalHistoryPages?: number;
  totalHistoryElements?: number;
  onHistoryPageChange?: (page: number) => void;
  onClearHistory?: () => void;
  onDeleteHistoryEntry?: (entryId: number) => void;
  onClose: () => void;
  onActivate: () => void;
  onSuspend: () => void;
  onBlock: () => void;
  onCreateDiscount: () => void;
  onApplyDirectDiscount: () => void;
  onNotify: () => void;
  isChangingStatus?: boolean;
  isFullscreen?: boolean;
}

export default function AgencyDetailPanel({
  agency,
  agents,
  discounts,
  stats,
  statusHistory,
  historyPage = 0,
  totalHistoryPages = 1,
  totalHistoryElements = 0,
  onHistoryPageChange,
  onClearHistory,
  onDeleteHistoryEntry,
  onClose,
  onActivate,
  onSuspend,
  onBlock,
  onCreateDiscount,
  onApplyDirectDiscount,
  onNotify,
  isChangingStatus = false,
  isFullscreen = false,
}: AgencyDetailPanelProps) {
  if (!agency) {
    return (
      <div className={`${isFullscreen ? 'w-full' : 'w-full max-w-4xl'} bg-white min-h-screen flex items-center justify-center`}>
        <p className="text-gray-500">Selecciona una inmobiliaria para ver el detalle</p>
      </div>
    );
  }

  const isActive = agency.status === 'ACTIVE' && agency.enabled !== false;

  return (
    <div className={`${isFullscreen ? 'w-full' : 'w-full max-w-5xl'} bg-white min-h-screen`}>

      <div className="px-8 py-6 space-y-6 max-w-[1400px] mx-auto">
        {/* Logo y RUC - más presencia */}
        <div className="flex items-center gap-5 pb-2 border-b border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-cyan-100">
            {agency.name?.[0] || 'I'}
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">RUC</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{agency.ruc || '-'}</p>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-400">{agency.city || '-'}</span>
            </div>
          </div>
        </div>

        {/* Tarjetas elegantes: Información de contacto y Estado */}
        <div className="grid grid-cols-2 gap-6">
          {/* Tarjeta de Información de Contacto */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-900 mb-4">Información de contacto</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-1">Gerente</p>
                  <p className="text-sm font-medium text-slate-900">{agency.managerName || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-1">Email</p>
                  <p className="text-sm font-medium text-blue-600">{agency.email || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-1">Teléfono</p>
                  <p className="text-sm font-medium text-slate-900">{agency.phone || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-1">Dirección</p>
                  <p className="text-sm font-medium text-slate-900">{agency.address || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Estado */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-slate-900">Estado de la inmobiliaria</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                agency.status === 'ACTIVE' 
                  ? 'bg-emerald-100 text-emerald-700'
                  : agency.status === 'SUSPENDED'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {agency.status === 'ACTIVE' ? 'ACTIVO' : agency.status === 'SUSPENDED' ? 'SUSPENDIDO' : agency.status || 'INACTIVO'}
              </span>
            </div>
            <div className="space-y-3">
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                agency.status === 'ACTIVE'
                  ? 'bg-emerald-50 border-emerald-100'
                  : agency.status === 'SUSPENDED'
                  ? 'bg-orange-50 border-orange-100'
                  : 'bg-red-50 border-red-100'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  agency.status === 'ACTIVE'
                    ? 'bg-emerald-100'
                    : agency.status === 'SUSPENDED'
                    ? 'bg-orange-100'
                    : 'bg-red-100'
                }`}>
                  {agency.status === 'ACTIVE' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                  {agency.status === 'SUSPENDED' && <PauseCircle className="w-4 h-4 text-orange-600" />}
                  {!['ACTIVE', 'SUSPENDED'].includes(agency.status) && <Ban className="w-4 h-4 text-red-600" />}
                </div>
                <span className={`text-sm font-medium flex-1 ${
                  agency.status === 'ACTIVE'
                    ? 'text-emerald-700'
                    : agency.status === 'SUSPENDED'
                    ? 'text-orange-700'
                    : 'text-red-700'
                }`}>
                  {agency.status === 'ACTIVE' ? 'Inmobiliaria activa' : agency.status === 'SUSPENDED' ? 'Inmobiliaria suspendida' : 'Inmobiliaria bloqueada'}
                </span>
              </div>
              {agency.status === 'ACTIVE' && (
                <button
                  onClick={onSuspend}
                  disabled={isChangingStatus}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <PauseCircle className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-orange-600">Suspender inmobiliaria</span>
                </button>
              )}
              {(agency.status === 'SUSPENDED' || !['ACTIVE', 'SUSPENDED'].includes(agency.status)) && (
                <button
                  onClick={onActivate}
                  disabled={isChangingStatus}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium text-emerald-600">Activar inmobiliaria</span>
                </button>
              )}
              {(agency.status === 'ACTIVE' || agency.status === 'SUSPENDED') && (
                <button
                  onClick={onBlock}
                  disabled={isChangingStatus}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <Ban className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-sm font-medium text-red-600">Bloquear inmobiliaria</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tarjeta de Acciones Rápidas */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-900 mb-4">Acciones rápidas</h4>
          <div className="space-y-2">
            <button
              onClick={onCreateDiscount}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-100 hover:border-teal-200 hover:bg-teal-50 rounded-xl transition"
            >
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-teal-500" />
                <span className="text-sm font-medium text-slate-700">Crear código de descuento</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={onApplyDirectDiscount}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-100 hover:border-teal-200 hover:bg-teal-50 rounded-xl transition"
            >
              <div className="flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-teal-500" />
                <span className="text-sm font-medium text-slate-700">Aplicar descuento directo</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={onNotify}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-100 hover:border-teal-200 hover:bg-teal-50 rounded-xl transition"
            >
              <div className="flex items-center gap-3">
                <Megaphone className="w-5 h-5 text-teal-500" />
                <span className="text-sm font-medium text-slate-700">Notificar inmobiliaria</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Tarjeta de Historial de Actividad */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-900">Historial de actividad</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{totalHistoryElements} registros</span>
              <button
                onClick={onClearHistory}
                className="text-xs text-rose-500 hover:text-rose-600 font-medium"
              >
                Vaciar
              </button>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl overflow-hidden">
            <AgencyHistoryList
              history={statusHistory || []}
              currentPage={historyPage}
              totalPages={totalHistoryPages}
              totalElements={totalHistoryElements}
              onPageChange={onHistoryPageChange}
              onClearHistory={onClearHistory}
              onDeleteHistoryEntry={onDeleteHistoryEntry}
              isBackendPaginated={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
