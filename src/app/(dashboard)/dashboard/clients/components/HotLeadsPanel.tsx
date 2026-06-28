'use client';

import { useState } from 'react';
import { useHotLeads } from '@/presentation/hooks/useAgentCRM';
import { Flame, Phone, Mail, Eye, Download, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { UserAvatar } from '@/presentation/components/shared/UserAvatar';

const ITEMS_PER_PAGE = 5;

export function HotLeadsPanel() {
  const { data: hotLeads, isLoading } = useHotLeads(30, 3);
  const [page, setPage] = useState(0);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-orange-50 rounded-lg">
            <Flame className="w-4 h-4 text-orange-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800">Oportunidades Calientes</h3>
        </div>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!hotLeads?.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-orange-50 rounded-lg">
            <Flame className="w-4 h-4 text-orange-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800">Oportunidades Calientes</h3>
        </div>
        <p className="text-gray-500 text-center py-3 text-sm">No hay leads calientes detectados</p>
      </div>
    );
  }

  const totalPages = Math.ceil(hotLeads.length / ITEMS_PER_PAGE);
  const paginatedLeads = hotLeads.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-700 border-red-200';
      case 'MEDIUM': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-50 rounded-lg">
            <Flame className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Oportunidades Calientes</h3>
            <p className="text-xs text-gray-400">{hotLeads.length} leads detectados</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 max-h-[350px] overflow-y-auto">
        {paginatedLeads.map((lead, index) => (
          <div
            key={`${lead.clientId}-${lead.propertyId}-${index}`}
            className="p-3 border border-gray-100 rounded-lg hover:border-orange-200 hover:bg-orange-50/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <UserAvatar 
                    user={{ firstName: lead.clientName, lastName: '' }} 
                    size="xs" 
                  />
                  <span className="text-sm font-medium text-gray-900">{lead.clientName}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${getPriorityColor(lead.priority)}`}>
                    {lead.priority}
                  </span>
                  <span className="text-[10px] text-gray-400">Score: {lead.score}</span>
                </div>
                
                <p className="text-xs text-gray-600 mb-1.5 truncate">{lead.propertyTitle}</p>
                
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                  {lead.clientPhone && (
                    <span className="flex items-center gap-0.5">
                      <Phone className="w-3 h-3" />
                      {lead.clientPhone}
                    </span>
                  )}
                  {lead.clientEmail && (
                    <span className="flex items-center gap-0.5">
                      <Mail className="w-3 h-3" />
                      {lead.clientEmail}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mt-1.5">
                  {lead.viewCount > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                      <Eye className="w-3 h-3" />
                      {lead.viewCount} vistas
                    </span>
                  )}
                  {lead.downloadedDocuments && (
                    <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-blue-100 rounded text-blue-600">
                      <Download className="w-3 h-3" />
                      Docs
                    </span>
                  )}
                  {lead.contactRequested && (
                    <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-green-100 rounded text-green-600">
                      <Phone className="w-3 h-3" />
                      Contacto
                    </span>
                  )}
                  {lead.savedToFavorites && (
                    <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-pink-100 rounded text-pink-600">
                      <Heart className="w-3 h-3" />
                      Favorito
                    </span>
                  )}
                </div>
              </div>

              <Link
                href={`/dashboard/clients/${lead.clientId}`}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0 ml-2"
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