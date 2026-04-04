'use client';

import { useState, useMemo } from 'react';
import { ClientHeatmapData, CRMClient } from '@/core/domain/entities/CRM';
import { Clock, Calendar, TrendingUp, MessageCircle } from 'lucide-react';

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
  
  // Encontrar el máximo para normalizar colores
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

  // Agrupar por hora/día para el resumen general
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

  // Top clientes por actividad
  const topClients = useMemo(() => {
    return clients
      .sort((a, b) => b.interactionScore - a.interactionScore)
      .slice(0, 5);
  }, [clients]);

  // Obtener color basado en intensidad
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

  // Formatear hora
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Mapa de Calor de Actividad</h3>
          <p className="text-sm text-gray-500">Análisis de mensajes e interacciones por cliente</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('hourly')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'hourly' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-1" />
            Por Hora
          </button>
          <button
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'daily' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-1" />
            Por Día
          </button>
        </div>
      </div>

      {/* Resumen General */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Actividad General</h4>
        <div className={`grid gap-1 ${viewMode === 'hourly' ? 'grid-cols-6 md:grid-cols-12' : 'grid-cols-7'}`}>
          {aggregatedData.map((item, index) => (
            <div
              key={index}
              className={`${getHeatColor(item.count, maxCount)} ${getTextColor(item.count, maxCount)} 
                rounded-lg p-2 text-center transition-all hover:scale-105`}
              title={`${item.label}: ${item.count} interacciones`}
            >
              <div className="text-xs font-medium">{item.label}</div>
              <div className="text-lg font-bold">{item.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Clientes con Actividad */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          Clientes Más Activos
        </h4>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {topClients.map(client => {
            const clientHeatmap = heatmapData.find(h => h.clientId === client.id);
            if (!clientHeatmap) return null;
            
            const isSelected = selectedClientId === client.id;
            
            return (
              <div
                key={client.id}
                onClick={() => onClientSelect?.(client.id)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 
                      flex items-center justify-center text-white font-semibold text-sm">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{client.name}</span>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MessageCircle className="w-3 h-3" />
                        {client.messageActivity.totalMessages} mensajes
                        <span className="mx-1">•</span>
                        Score: {client.interactionScore}
                      </div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    client.messageActivity.interestLevel === 'HIGH' ? 'bg-green-100 text-green-700' :
                    client.messageActivity.interestLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {client.messageActivity.interestLevel === 'HIGH' ? 'Alto Interés' :
                     client.messageActivity.interestLevel === 'MEDIUM' ? 'Interés Medio' : 'Bajo Interés'}
                  </div>
                </div>
                
                {/* Mini heatmap del cliente */}
                <div className={`grid gap-1 ${viewMode === 'hourly' ? 'grid-cols-12' : 'grid-cols-7'}`}>
                  {(viewMode === 'hourly' ? clientHeatmap.hourlyActivity : clientHeatmap.dailyActivity)
                    .slice(0, viewMode === 'hourly' ? 12 : 7)
                    .map((item, idx) => (
                    <div
                      key={idx}
                      className={`${getHeatColor(item.count, maxCount)} rounded h-4`}
                      title={`${item.count} interacciones`}
                    />
                  ))}
                </div>
                
                {/* Peak activity info */}
                <div className="mt-2 text-xs text-gray-500 flex gap-4">
                  <span>
                    🔥 Horario pico: {formatHour(clientHeatmap.peakActivityHour)}
                  </span>
                  {viewMode === 'daily' && (
                    <span>
                      📅 Día más activo: {clientHeatmap.peakActivityDay}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <span>Baja actividad</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 bg-gray-100 rounded" />
          <div className="w-4 h-4 bg-blue-100 rounded" />
          <div className="w-4 h-4 bg-blue-200 rounded" />
          <div className="w-4 h-4 bg-blue-300 rounded" />
          <div className="w-4 h-4 bg-blue-400 rounded" />
          <div className="w-4 h-4 bg-blue-500 rounded" />
        </div>
        <span>Alta actividad</span>
      </div>
    </div>
  );
}
