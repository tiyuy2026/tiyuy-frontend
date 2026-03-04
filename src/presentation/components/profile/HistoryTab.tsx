'use client';

import { useState } from 'react';
import { User } from '@/core/domain/entities';
import { Button } from '@/presentation/components/ui';
import { Eye, MessageCircle, Calendar, Filter, Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface HistoryItem {
  id: string;
  type: 'view' | 'contact' | 'message' | 'search';
  title: string;
  propertyTitle?: string;
  date: string;
  details: string;
  status: 'active' | 'completed' | 'pending';
}

interface HistoryTabProps {
  user: User;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ user }) => {
  const [filterType, setFilterType] = useState<'all' | 'views' | 'contacts' | 'messages' | 'searches'>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(false);

  // Datos de ejemplo - TODO: Conectar con backend real
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: '1',
      type: 'view',
      title: 'Visita a propiedad',
      propertyTitle: 'Departamento en Miraflores',
      date: '2024-01-20T14:30:00Z',
      details: 'Usuario vio tu propiedad por 5 minutos',
      status: 'active'
    },
    {
      id: '2',
      type: 'contact',
      title: 'Solicitud de contacto',
      propertyTitle: 'Casa en San Borja',
      date: '2024-01-19T10:15:00Z',
      details: 'Juan Pérez solicitó información sobre esta propiedad',
      status: 'pending'
    },
    {
      id: '3',
      type: 'message',
      title: 'Mensaje recibido',
      propertyTitle: 'Studio en San Isidro',
      date: '2024-01-18T16:45:00Z',
      details: 'María García envió un mensaje sobre disponibilidad',
      status: 'completed'
    },
    {
      id: '4',
      type: 'view',
      title: 'Visita a propiedad',
      propertyTitle: 'Departamento en Surco',
      date: '2024-01-17T09:20:00Z',
      details: 'Usuario vio tu propiedad por 3 minutos',
      status: 'active'
    },
    {
      id: '5',
      type: 'search',
      title: 'Búsqueda guardada',
      date: '2024-01-16T13:00:00Z',
      details: 'Búsqueda: "Departamentos 3 dormitorios en Miraflores"',
      status: 'completed'
    }
  ]);

  const filteredHistory = history.filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType.slice(0, -1); // Remove 's' from plural
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'view':
        return <Eye className="w-5 h-5" />;
      case 'contact':
        return <MessageCircle className="w-5 h-5" />;
      case 'message':
        return <MessageCircle className="w-5 h-5" />;
      case 'search':
        return <Filter className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'view':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'contact':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'message':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'search':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'completed':
        return <TrendingDown className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <Minus className="w-4 h-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'view':
        return 'Visita';
      case 'contact':
        return 'Contacto';
      case 'message':
        return 'Mensaje';
      case 'search':
        return 'Búsqueda';
      default:
        return type;
    }
  };

  const handleExportHistory = async () => {
    setIsLoading(true);
    
    try {
      // TODO: Implementar exportación a CSV/PDF
      console.log('Exportando historial...');
      
      // Simulación
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert('Historial exportado correctamente');
    } catch (error) {
      console.error('Error exportando historial:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Estadísticas
  const stats = {
    totalViews: history.filter(item => item.type === 'view').length,
    totalContacts: history.filter(item => item.type === 'contact').length,
    totalMessages: history.filter(item => item.type === 'message').length,
    pendingActions: history.filter(item => item.status === 'pending').length
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Historial de Actividad</h2>
        <p className="text-gray-600">
          Revisa todas tus interacciones y actividades en la plataforma.
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Visitas</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalViews}</p>
            </div>
            <Eye className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-900">Contactos</p>
              <p className="text-2xl font-bold text-green-900">{stats.totalContacts}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-900">Mensajes</p>
              <p className="text-2xl font-bold text-purple-900">{stats.totalMessages}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-900">Pendientes</p>
              <p className="text-2xl font-bold text-orange-900">{stats.pendingActions}</p>
            </div>
            <Calendar className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los tipos</option>
            <option value="views">Visitas</option>
            <option value="contacts">Contactos</option>
            <option value="messages">Mensajes</option>
            <option value="searches">Búsquedas</option>
          </select>
        </div>
        
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="week">Última semana</option>
          <option value="month">Último mes</option>
          <option value="quarter">Último trimestre</option>
          <option value="year">Último año</option>
        </select>

        <Button
          variant="outline"
          onClick={handleExportHistory}
          isLoading={isLoading}
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Lista de Historial */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay actividad en este período
            </h3>
            <p className="text-gray-600">
              No se encontraron actividades para los filtros seleccionados
            </p>
          </div>
        ) : (
          filteredHistory.map((item) => {
            const { date, time } = formatDate(item.date);
            
            return (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {/* Icono del tipo */}
                    <div className={`p-2 rounded-lg border ${getTypeColor(item.type)}`}>
                      {getTypeIcon(item.type)}
                    </div>
                    
                    {/* Contenido */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                          {getTypeLabel(item.type)}
                        </span>
                      </div>
                      
                      {item.propertyTitle && (
                        <p className="text-sm text-gray-600 mb-1">
                          Propiedad: {item.propertyTitle}
                        </p>
                      )}
                      
                      <p className="text-sm text-gray-700">{item.details}</p>
                      
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-gray-500">
                          {date} a las {time}
                        </span>
                        <div className="flex items-center">
                          {getStatusIcon(item.status)}
                          <span className="text-xs text-gray-500 ml-1">
                            {item.status === 'active' ? 'Activo' : 
                             item.status === 'completed' ? 'Completado' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
