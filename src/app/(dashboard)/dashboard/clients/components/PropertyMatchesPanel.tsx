'use client';

import { useState } from 'react';
import { usePropertyMatches } from '@/presentation/hooks/useAgentCRM';
import { Home, MapPin, DollarSign, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const ITEMS_PER_PAGE = 5;

export function PropertyMatchesPanel() {
  const { data: matches, isLoading } = usePropertyMatches();
  const [page, setPage] = useState(0);

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
            className="p-3 border border-gray-100 rounded-lg hover:border-teal-200 hover:bg-teal-50/30 transition-colors"
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

              <Link
                href={`/properties/${match.propertyId}`}
                className="text-xs text-teal-600 hover:text-teal-800 font-medium shrink-0 ml-2"
              >
                Ver →
              </Link>
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
    </div>
  );
}