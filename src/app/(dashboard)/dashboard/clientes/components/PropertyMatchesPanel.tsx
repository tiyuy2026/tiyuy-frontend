'use client';

import { usePropertyMatches } from '@/presentation/hooks/useAgentCRM';
import { Handshake, MapPin, DollarSign, Home, Check } from 'lucide-react';
import Link from 'next/link';

export function PropertyMatchesPanel() {
  const { data: matches, isLoading } = usePropertyMatches(50);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-teal-100 rounded-lg">
            <Handshake className="w-5 h-5 text-teal-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Matches Inmobiliarios</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!matches?.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-teal-100 rounded-lg">
            <Handshake className="w-5 h-5 text-teal-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Matches Inmobiliarios</h3>
        </div>
        <p className="text-gray-500 text-center py-4">No hay matches encontrados</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-teal-500';
    if (score >= 50) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 rounded-lg">
            <Handshake className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Matches Inmobiliarios</h3>
            <p className="text-sm text-gray-500">{matches.length} coincidencias</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {matches.slice(0, 15).map((match) => (
          <div
            key={`${match.clientId}-${match.propertyId}`}
            className="p-4 border border-gray-100 rounded-lg hover:border-teal-200 hover:bg-teal-50/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{match.clientName}</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-medium text-gray-700 truncate">{match.propertyTitle}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {match.propertyLocation}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    S/ {match.propertyPrice.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${getScoreColor(match.totalScore)}`}>
                      {match.totalScore}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-gray-100 rounded" title="Presupuesto">
                      $: {match.budgetScore}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded" title="Ubicación">
                      📍: {match.locationScore}
                    </span>
                    <span className="px-2 py-1 bg-gray-gray-100 rounded" title="Tipo">
                      🏠: {match.typeScore}
                    </span>
                  </div>
                </div>

                {match.matchReasons && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-teal-600">
                    <Check className="w-3 h-3" />
                    {match.matchReasons}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 ml-2">
                <Link
                  href={`/dashboard/clientes/${match.clientId}`}
                  className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Cliente
                </Link>
                <Link
                  href={`/propiedades/${match.propertyId}`}
                  className="text-xs px-3 py-1 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors"
                >
                  Propiedad
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
