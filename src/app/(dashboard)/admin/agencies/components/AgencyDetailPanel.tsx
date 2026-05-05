'use client';

import { ArrowLeft, MapPin, Users, CheckCircle, PauseCircle, Lock, X, Ban } from 'lucide-react';
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
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-1">Email</p>
                  <p className="text-sm font-medium text-blue-600">{agency.email || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
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
                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="text-sm font-medium text-slate-700">Crear código de descuento</span>
              </div>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={onApplyDirectDiscount}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-100 hover:border-teal-200 hover:bg-teal-50 rounded-xl transition"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-slate-700">Aplicar descuento directo</span>
              </div>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={onNotify}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-100 hover:border-teal-200 hover:bg-teal-50 rounded-xl transition"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                <span className="text-sm font-medium text-slate-700">Notificar inmobiliaria</span>
              </div>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
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
