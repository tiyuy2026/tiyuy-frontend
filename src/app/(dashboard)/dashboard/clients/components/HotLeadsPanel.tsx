'use client';

import { useHotLeads } from '@/presentation/hooks/useAgentCRM';
import { Flame, Phone, Mail, Eye, Download, Heart } from 'lucide-react';
import Link from 'next/link';

export function HotLeadsPanel() {
  const { data: hotLeads, isLoading } = useHotLeads(30, 3);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Flame className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Oportunidades Calientes</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!hotLeads?.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Flame className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Oportunidades Calientes</h3>
        </div>
        <p className="text-gray-500 text-center py-4">No hay leads calientes detectados</p>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-700 border-red-200';
      case 'MEDIUM': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Flame className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Oportunidades Calientes</h3>
            <p className="text-sm text-gray-500">{hotLeads.length} leads detectados</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {hotLeads.slice(0, 10).map((lead) => (
          <div
            key={`${lead.clientId}-${lead.propertyId}`}
            className="p-4 border border-gray-100 rounded-lg hover:border-orange-200 hover:bg-orange-50/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{lead.clientName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(lead.priority)}`}>
                    {lead.priority}
                  </span>
                  <span className="text-xs text-gray-500">Score: {lead.score}</span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{lead.propertyTitle}</p>
                
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {lead.clientPhone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {lead.clientPhone}
                    </span>
                  )}
                  {lead.clientEmail && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {lead.clientEmail}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {lead.viewCount > 0 && (
                    <span className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                      <Eye className="w-3 h-3" />
                      {lead.viewCount} vistas
                    </span>
                  )}
                  {lead.downloadedDocuments && (
                    <span className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 rounded-full text-blue-600">
                      <Download className="w-3 h-3" />
                      Descargó docs
                    </span>
                  )}
                  {lead.contactRequested && (
                    <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 rounded-full text-green-600">
                      <Phone className="w-3 h-3" />
                      Solicitó contacto
                    </span>
                  )}
                  {lead.savedToFavorites && (
                    <span className="flex items-center gap-1 text-xs px-2 py-1 bg-pink-100 rounded-full text-pink-600">
                      <Heart className="w-3 h-3" />
                      Guardó favorito
                    </span>
                  )}
                </div>
              </div>

              <Link
                href={`/dashboard/clients/${lead.clientId}`}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
