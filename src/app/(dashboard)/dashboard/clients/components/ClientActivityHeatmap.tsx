'use client';

import { useState, useMemo } from 'react';
import { ClientHeatmapData, CRMClient } from '@/core/domain/entities/CRM';
import { Clock, Calendar, TrendingUp, MessageCircle } from 'lucide-react';
import { UserAvatar } from '@/presentation/components/shared/UserAvatar';

interface ClientActivityHeatmapProps {
  heatmapData: ClientHeatmapData[];
  clients: CRMClient[];
  selectedClientId?: number;
  onClientSelect?: (clientId: number) => void;
}

export function ClientActivityHeatmap({ 
  heatmapData, 
  clients,
  selectedClientId,
  onClientSelect 
}: ClientActivityHeatmapProps) {
  const [viewMode, setViewMode] = useState<'hourly' | 'daily'>('hourly');
  
  const maxCount = useMemo(() => {
    let max = 0;
    heatmapData.forEach(client => {
      const data = viewMode === 'hourly' ? client.hourlyActivity : client.dailyActivity;
      data.forEach(item => {
        if (item.count > max) max = item.count;
      });
    });
    return max || 1;
  }, [heatmapData, viewMode]);

  const aggregatedData = useMemo(() => {
    const result = viewMode === 'hourly' 
      ? Array.from({ length: 24 }, (_, i) => ({ label: `${i}:00`, count: 0, hour: i }))
      : ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day, i) => ({ label: day, count: 0, dayIndex: i }));
    
    heatmapData.forEach(client => {
      const data = viewMode === 'hourly' ? client.hourlyActivity : client.dailyActivity;
      data.forEach((item, index) => {
        result[index].count += item.count;
      });
    });
    
    return result;
  }, [heatmapData, viewMode]);

  const topClients = useMemo(() => {
    return clients
      .sort((a, b) => b.interactionScore - a.interactionScore)
      .slice(0, 5);
  }, [clients]);

  const getHeatColor = (count: number, max: number) => {
    const intensity = count / max;
    if (intensity === 0) return 'bg-gray-100';
    if (intensity < 0.2) return 'bg-blue-100';
    if (intensity < 0.4) return 'bg-blue-200';
    if (intensity < 0.6) return 'bg-blue-300';
    if (intensity < 0.8) return 'bg-blue-400';
    return 'bg-blue-500';
  };

  const getTextColor = (count: number, max: number) => {
    const intensity = count / max;
    return intensity > 0.5 ? 'text-white' : 'text-gray-700';
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Mapa de Calor</h3>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('hourly')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'hourly' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock className="w-3 h-3 inline mr-1" />
            Hora
          </button>
          <button
            onClick={() => setViewMode('daily')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'daily' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar className="w-3 h-3 inline mr-1" />
            Día
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-xs font-medium text-gray-500 mb-2">Actividad General</h4>
        <div className={`grid gap-1 ${viewMode === 'hourly' ? 'grid-cols-8 md:grid-cols-12' : 'grid-cols-7'}`}>
          {aggregatedData.map((item, index) => (
            <div
              key={index}
              className={`${getHeatColor(item.count, maxCount)} ${getTextColor(item.count, maxCount)} 
                rounded p-1.5 text-center transition-all`}
              title={`${item.label}: ${item.count} interacciones`}
            >
              <div className="text-[10px] font-medium leading-tight">{item.label}</div>
              <div className="text-xs font-bold">{item.count}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-blue-500" />
          Clientes Más Activos
        </h4>
        <div className="space-y-2 max-h-56 overflow-y-auto">
          {topClients.map(client => {
            const clientHeatmap = heatmapData.find(h => h.clientId === client.id);
            if (!clientHeatmap) return null;
            
            const isSelected = selectedClientId === client.id;
            
            return (
              <div
                key={client.id}
                onClick={() => onClientSelect?.(client.id)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <UserAvatar 
                      user={{ firstName: client.name, lastName: '' }} 
                      size="xs" 
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">{client.name}</span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MessageCircle className="w-3 h-3" />
                        {client.messageActivity.totalMessages} mensajes
                        <span className="mx-0.5">·</span>
                        Score: {client.interactionScore}
                      </div>
                    </div>
                  </div>
                  <div className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    client.messageActivity.interestLevel === 'HIGH' ? 'bg-green-100 text-green-700' :
                    client.messageActivity.interestLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {client.messageActivity.interestLevel === 'HIGH' ? 'Alto' :
                     client.messageActivity.interestLevel === 'MEDIUM' ? 'Medio' : 'Bajo'}
                  </div>
                </div>
                
                <div className={`grid gap-0.5 ${viewMode === 'hourly' ? 'grid-cols-12' : 'grid-cols-7'}`}>
                  {(viewMode === 'hourly' ? clientHeatmap.hourlyActivity : clientHeatmap.dailyActivity)
                    .slice(0, viewMode === 'hourly' ? 12 : 7)
                    .map((item, idx) => (
                    <div
                      key={idx}
                      className={`${getHeatColor(item.count, maxCount)} rounded h-3`}
                      title={`${item.count} interacciones`}
                    />
                  ))}
                </div>
                
                <div className="mt-1 text-[10px] text-gray-400 flex gap-3">
                  <span>🔥 {formatHour(clientHeatmap.peakActivityHour)}</span>
                  {viewMode === 'daily' && (
                    <span>📅 {clientHeatmap.peakActivityDay}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-400">
        <span>Baja</span>
        <div className="flex gap-0.5">
          <div className="w-3 h-3 bg-gray-100 rounded" />
          <div className="w-3 h-3 bg-blue-100 rounded" />
          <div className="w-3 h-3 bg-blue-200 rounded" />
          <div className="w-3 h-3 bg-blue-300 rounded" />
          <div className="w-3 h-3 bg-blue-400 rounded" />
          <div className="w-3 h-3 bg-blue-500 rounded" />
        </div>
        <span>Alta</span>
      </div>
    </div>
  );
}
