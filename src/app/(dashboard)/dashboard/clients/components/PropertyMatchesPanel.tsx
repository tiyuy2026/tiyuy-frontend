'use client';

import { useState } from 'react';
import { PropertyMatchDTO, usePropertyMatches } from '@/presentation/hooks/useAgentCRM';
import { Home, MapPin, DollarSign, Heart, ChevronLeft, ChevronRight, X, Building2, Tag, Percent, Target } from 'lucide-react';

const ITEMS_PER_PAGE = 5;

export function PropertyMatchesPanel() {
  const { data: matches, isLoading } = usePropertyMatches();
  const [page, setPage] = useState(0);
  const [selectedMatch, setSelectedMatch] = useState<PropertyMatchDTO | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-teal-50 rounded-lg">
            <Home className="w-4 h-4 text-teal-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800">Coincidencias de Propiedades</h3>
        </div>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!matches?.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-teal-50 rounded-lg">
            <Home className="w-4 h-4 text-teal-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800">Coincidencias de Propiedades</h3>
        </div>
        <p className="text-gray-500 text-center py-3 text-sm">No hay coincidencias disponibles</p>
      </div>
    );
  }

  const totalPages = Math.ceil(matches.length / ITEMS_PER_PAGE);
  const paginatedMatches = matches.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-teal-50 rounded-lg">
            <Home className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Coincidencias</h3>
            <p className="text-xs text-gray-400">{matches.length} propiedades recomendadas</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 max-h-[350px] overflow-y-auto">
        {paginatedMatches.map((match, index) => (
          <div
            key={`${match.clientId}-${match.propertyId}-${index}`}
            onClick={() => setSelectedMatch(match)}
            className="block p-3 border border-gray-100 rounded-lg hover:border-teal-200 hover:bg-teal-50/30 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm font-medium text-gray-900 truncate">{match.propertyTitle}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded-full font-medium shrink-0">
                    {match.totalScore}%
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-1">
                  {match.propertyLocation && (
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" />
                      {match.propertyLocation}
                    </span>
                  )}
                  {match.propertyPrice > 0 && (
                    <span className="flex items-center gap-0.5">
                      <DollarSign className="w-3 h-3" />
                      S/ {match.propertyPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">
                    Presupuesto: {match.budgetScore}%
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded">
                    Ubicación: {match.locationScore}%
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-600 rounded">
                    Tipo: {match.typeScore}%
                  </span>
                </div>

                {match.matchReasons && (
                  <p className="text-[10px] text-gray-500 mt-1.5 truncate">
                    {match.matchReasons}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500">
                  <span className="flex items-center gap-0.5">
                    <Heart className="w-3 h-3" />
                    {match.clientName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3 h-3" />
            Anterior
          </button>
          <span className="text-xs text-gray-400">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Siguiente
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Modal de detalle de la coincidencia */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedMatch(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-auto overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-teal-50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Detalle de Coincidencia</h3>
                  <p className="text-xs text-gray-400">Información completa del match</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMatch(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-5">
              {/* Título y score */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900">{selectedMatch.propertyTitle}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedMatch.propertyLocation && (
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {selectedMatch.propertyLocation}
                      </span>
                    )}
                    {selectedMatch.propertyPrice > 0 && (
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        S/ {selectedMatch.propertyPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-teal-600">{selectedMatch.totalScore}%</div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Score</p>
                </div>
              </div>

              {/* Scores detallados */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 block">Niveles de coincidencia</span>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Presupuesto</span>
                      <span className="font-semibold text-blue-600">{selectedMatch.budgetScore}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${selectedMatch.budgetScore}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Ubicación</span>
                      <span className="font-semibold text-purple-600">{selectedMatch.locationScore}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${selectedMatch.locationScore}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Tipo</span>
                      <span className="font-semibold text-green-600">{selectedMatch.typeScore}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${selectedMatch.typeScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Cliente interesado */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Cliente interesado</span>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span className="font-medium text-gray-900">{selectedMatch.clientName}</span>
                  </div>
                  {selectedMatch.clientEmail && (
                    <p className="text-xs text-gray-500 mt-1 ml-6">{selectedMatch.clientEmail}</p>
                  )}
                  {selectedMatch.clientPhone && (
                    <p className="text-xs text-gray-500 mt-0.5 ml-6">{selectedMatch.clientPhone}</p>
                  )}
                </div>
              </div>

              {/* Razón del match */}
              {selectedMatch.matchReasons && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Razón del match</span>
                  <div className="p-3 bg-teal-50 rounded-xl border border-teal-100">
                    <p className="text-sm text-gray-700">{selectedMatch.matchReasons}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedMatch(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}