'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Search, User, Bell, Plus, MapPin, Calendar, Users, Star, Share2, ChevronDown, Pin, MoreHorizontal, Filter, Edit, Trash2 } from 'lucide-react';
import { useChannelEvents, useChannelUpcomingEvents, useCreateChannelEvent, useChannelSubscribers, useChannelEventsWithFilters, useUserEvents, useDeleteChannelEvent, useUpdateChannelEvent } from '@/presentation/hooks/useContacts';
import ChannelEventCard from './ChannelEventCard';
import EventDetailView from './EventDetailView';

interface ChannelEventsPanelProps {
  channelId: number;
  channelName: string;
  currentUserId: number;
  currentUser: any;
  onCreateEvent?: () => void;
  isOwner?: boolean;
}

export default function ChannelEventsPanel({ 
  channelId, 
  channelName, 
  currentUserId, 
  currentUser,
  onCreateEvent,
  isOwner = false
}: ChannelEventsPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'featured' | 'date' | 'location'>('all');
  // Estado para controlar si se están mostrando eventos del usuario
  const [showUserEvents, setShowUserEvents] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [userLocation, setUserLocation] = useState<string>('');

  // Get user's location dynamically
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // Reverse geocoding to get city name
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&accept-language=es`);
            const data = await response.json();
            const city = data.address?.city || data.address?.town || data.address?.municipality || 'Ubicación actual';
            setUserLocation(city);
          } catch (error) {
            console.error('Error getting location name:', error);
            setUserLocation('Ubicación actual');
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setUserLocation('Ubicación actual');
        }
      );
    } else {
      setUserLocation('Ubicación actual');
    }
  };

  // Dynamic filters state - INICIA VACÍO PARA MOSTRAR TODOS
  const [dynamicFilters, setDynamicFilters] = useState({
    eventType: '',
    city: '',
    featured: undefined as boolean | undefined,
    dateFilter: '',
    location: ''
  });

  // Queries with dynamic filters
  const { data: events, isLoading: eventsLoading, error: eventsError } = useChannelEventsWithFilters(channelId, dynamicFilters);
  const { data: upcomingEvents, isLoading: upcomingLoading } = useChannelUpcomingEvents(channelId);
  const { data: recommendedEvents } = useChannelUpcomingEvents(channelId);
  const { data: subscribers } = useChannelSubscribers(channelId);
  const createEventMutation = useCreateChannelEvent();

  // Query para obtener todos los eventos creados por el usuario (para Agentes/Developers/Admins)
  const { data: userCreatedEvents, isLoading: userCreatedLoading } = useUserEvents(currentUserId, 0, 50);
  
  // Hook para eliminar eventos
  const deleteEventMutation = useDeleteChannelEvent();
  
  // Hook para actualizar eventos
  const updateEventMutation = useUpdateChannelEvent();

  const canCreateEvent = currentUser?.role === 'AGENT' || currentUser?.role === 'DEVELOPER' || currentUser?.role === 'ADMIN';
  
  // QueryClient para limpiar caché
  const queryClient = useQueryClient();
  
  // Función para cerrar "Mis eventos" y limpiar caché
  const handleCloseUserEvents = () => {
    setShowUserEvents(false);
    // Limpiar caché de user events para evitar duplicados
    queryClient.removeQueries({ queryKey: ['userEvents', currentUserId] });
  };
  
  // DEBUG: Log para depurar eventos del usuario
  React.useEffect(() => {
    console.log('=== USER CREATED EVENTS DEBUG ===');
    console.log('Current User ID:', currentUserId);
    console.log('Current User:', currentUser);
    console.log('Current User Role:', currentUser?.role);
    console.log('Can Create Event:', canCreateEvent);
    console.log('User Created Events Data:', userCreatedEvents);
    console.log('User Created Events Loading:', userCreatedLoading);
    
    if (userCreatedEvents) {
      console.log('Total elements:', userCreatedEvents.totalElements);
      console.log('Content length:', userCreatedEvents.content?.length);
      
      if (userCreatedEvents.content && userCreatedEvents.content.length > 0) {
        console.log('Eventos del usuario:');
        userCreatedEvents.content.forEach((event: any, index: number) => {
          console.log(`  ${index + 1}. ID: ${event.id}, Title: ${event.title}, Channel: ${event.channelId || event.channel?.id}`);
          console.log(`      - Creator ID: ${event.creatorId || event.creator?.id}`);
          console.log(`      - Start Date: ${event.startDateTime}`);
          console.log(`      - Is Active: ${event.isActive}`);
        });
        
        // Verificar si los datos parecen reales
        const hasValidIds = userCreatedEvents.content.every((e: any) => e.id && e.id > 0);
        const hasValidTitles = userCreatedEvents.content.every((e: any) => e.title && e.title.trim() !== '');
        const hasValidDates = userCreatedEvents.content.every((e: any) => e.startDateTime);
        
        console.log('=== VERIFICACIÓN DE DATOS ===');
        console.log('Todos tienen IDs válidos:', hasValidIds);
        console.log('Todos tienen títulos válidos:', hasValidTitles);
        console.log('Todos tienen fechas válidas:', hasValidDates);
        console.log('¿Los datos parecen reales?', hasValidIds && hasValidTitles && hasValidDates);
      } else {
        console.log('NO HAY CONTENIDO EN userCreatedEvents.content');
      }
    } else {
      console.log('userCreatedEvents es null o undefined');
    }
    console.log('=== END USER CREATED EVENTS DEBUG ===');
  }, [currentUserId, currentUser, userCreatedEvents, userCreatedLoading, canCreateEvent]);
  
  // Handle filter changes - makes API calls with dynamic filters
  const handleFilterChange = (filterType: string, value: any) => {
    let newFilters = { ...dynamicFilters };
    
    switch (filterType) {
      case 'all':
        newFilters = {
          eventType: '',
          city: '',
          featured: undefined,
          dateFilter: '',
          location: ''
        };
        setActiveFilter('all');
        break;
      case 'upcoming':
        newFilters = {
          eventType: '',
          city: '',
          featured: undefined,
          dateFilter: 'upcoming',
          location: ''
        };
        setActiveFilter('upcoming');
        break;
      case 'featured':
        newFilters = {
          eventType: '',
          city: '',
          featured: true,
          dateFilter: '',
          location: ''
        };
        setActiveFilter('featured');
        break;
      case 'location':
        newFilters = {
          eventType: '',
          city: '',
          featured: undefined,
          dateFilter: '',
          location: value === 'mi-ubicacion' ? userLocation : value
        };
        setActiveFilter('location');
        break;
      case 'date':
        newFilters = {
          eventType: '',
          city: '',
          featured: undefined,
          dateFilter: selectedDate || '',
          location: ''
        };
        setActiveFilter('date');
        break;
      case 'category':
        newFilters = {
          eventType: value,
          city: '',
          featured: undefined,
          dateFilter: '',
          location: ''
        };
        setSelectedCategory(value);
        break;
      default:
        newFilters = {
          eventType: '',
          city: '',
          featured: undefined,
          dateFilter: '',
          location: ''
        };
        setActiveFilter('all');
    }
    
    setDynamicFilters(newFilters);
    
    // Al aplicar filtros, salir de "Mis eventos creados" y volver a eventos del canal
    if (showUserEvents) {
      setShowUserEvents(false);
    }
  };

  // Legacy filter function for compatibility (now just returns events from API)
  const getFilteredEvents = () => {
    // Spring Data Page: los datos están en .content
    let eventsData = events;
    if (events && typeof events === 'object' && 'content' in events) {
      eventsData = events.content;
    }
    
    if (!eventsData || !Array.isArray(eventsData)) {
      return [];
    }
    
    let filtered = eventsData;
    
    // Apply client-side search if needed
    if (searchTerm) {
      filtered = filtered.filter((event: any) => 
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const categories = [
    { id: 'FERIA_INMOBILIARIA', name: 'Ferias inmobiliarias', icon: '🏢' },
    { id: 'OPEN_HOUSE', name: 'Open House', icon: '🏠' },
    { id: 'WEBINAR', name: 'Webinars', icon: '💻' },
    { id: 'REMATE', name: 'Remates', icon: '🔨' },
    { id: 'OTRO', name: 'Otros', icon: '📋' },
  ];

  const filteredEvents = getFilteredEvents();

  return (
    <div className="flex h-full bg-gray-50">
      {/* SIDEBAR IZQUIERDO */}
      <div className="w-[280px] bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Eventos</h1>
          
          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              placeholder="Buscar eventos"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 flex-1 focus:outline-none"
            />
          </div>
        </div>

        {/* Menu */}
        <div className="p-3 space-y-1">
          {/* Tus eventos - solo para Agentes, Developers, Admins */}
          {canCreateEvent && (
            <button
              onClick={() => setShowUserEvents(!showUserEvents)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showUserEvents
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <User className="w-4 h-4" />
              Tus eventos
              <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${showUserEvents ? 'rotate-180' : ''}`} />
            </button>
          )}

          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
            <Bell className="w-4 h-4" />
            Notificaciones
          </button>
        </div>

        {/* Crear evento button */}
        {canCreateEvent && (
          <div className="p-3">
            <button
              onClick={onCreateEvent}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear nuevo evento
            </button>
          </div>
        )}

        {/* Eventos recomendados */}
        {recommendedEvents && recommendedEvents.length > 0 && (
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Eventos recomendados</h3>
              <button className="text-xs text-blue-600 hover:text-blue-700">Ver todos</button>
            </div>
            <div className="space-y-2">
              {recommendedEvents.slice(0, 3).map((event: any) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="w-full flex items-start gap-2 p-2 hover:bg-gray-50 rounded-lg text-left"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-blue-600 mb-1">
                      {new Date(event.startDateTime).toLocaleDateString('es-ES', { 
                        day: 'numeric', 
                        month: 'short' 
                      }).toUpperCase()}
                    </p>
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{event.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Categorías */}
        <div className="p-3 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Categorías</h3>
          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleFilterChange('category', category.id === selectedCategory ? null : category.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 overflow-hidden">
        {selectedEvent ? (
          <EventDetailView
            event={selectedEvent}
            channelId={channelId}
            currentUserId={currentUserId}
            isOwner={isOwner}
            onBack={() => setSelectedEvent(null)}
            isEditMode={selectedEvent.isEditMode || false}
          />
        ) : showUserEvents ? (
          <div className="h-full overflow-y-auto">
            {/* Header para eventos del usuario */}
            <div className="bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCloseUserEvents}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Volver a eventos del canal"
                  >
                    <ChevronDown className="w-5 h-5 text-gray-600 rotate-90" />
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900">Mis eventos creados</h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {userCreatedEvents?.content?.length || 0} eventos creados
                </div>
              </div>
            </div>

            {/* Events Grid para eventos del usuario */}
            <div className="p-6">
              {userCreatedLoading ? (
                // Loading skeleton
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                      <div className="h-32 bg-gray-200"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="flex gap-2">
                          <div className="h-8 bg-gray-200 rounded flex-1"></div>
                          <div className="h-8 bg-gray-200 rounded flex-1"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !userCreatedEvents || !userCreatedEvents.content || userCreatedEvents.content.length === 0 ? (
                // Empty state
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No has creado eventos</h3>
                  <p className="text-gray-600 text-sm">
                    Crea tu primer evento para empezar
                  </p>
                </div>
              ) : (
                // Events grid con botones de acción - CON VALIDACIÓN DE IDs ÚNICOS
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(() => {
                    // Validar IDs únicos para evitar duplicados
                    const seenIds = new Set();
                    const uniqueEvents = userCreatedEvents.content.filter((event: any) => {
                      if (!event.id || seenIds.has(event.id)) {
                        console.warn('Evento duplicado o sin ID:', event);
                        return false;
                      }
                      seenIds.add(event.id);
                      return true;
                    });
                    console.log('Eventos únicos a mostrar:', uniqueEvents.length);
                    return uniqueEvents;
                  })().map((event: any) => (
                    <div key={event.id} className="group relative">
                      <ChannelEventCard
                        event={event}
                        currentUserId={currentUserId}
                        isOwner={true}
                        onView={() => setSelectedEvent(event)}
                      />
                      
                      {/* Botones de acción - solo visibles en hover */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setSelectedEvent({
                              ...event,
                              isEditMode: true
                            });
                          }}
                          className="p-2 bg-white rounded-lg shadow-md text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                          title="Editar evento"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
                              deleteEventMutation.mutate(
                                { channelId, eventId: event.id },
                                {
                                  onSuccess: () => {
                                    console.log('Evento eliminado exitosamente');
                                  },
                                  onError: (error) => {
                                    console.error('Error al eliminar evento:', error);
                                    alert('Error al eliminar el evento');
                                  }
                                }
                              );
                            }
                          }}
                          className="p-2 bg-white rounded-lg shadow-md text-gray-400 hover:text-red-600 hover:bg-red-50"
                          title="Eliminar evento"
                          disabled={deleteEventMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            {/* Header con filtros mejorados */}
            <div className="bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Eventos del canal</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {filteredEvents?.length || 0} eventos encontrados
                </div>
              </div>
              
              {/* Filtros mejorados con mejor visibilidad */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Filtros:</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
              <button 
                onClick={() => handleFilterChange('all', null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              
              <button 
                onClick={() => handleFilterChange('featured', null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === 'featured'
                    ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Destacados
              </button>
              
              <button 
                onClick={() => handleFilterChange('upcoming', null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === 'upcoming'
                    ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Próximos
              </button>
              
              {/* Filtro de fecha con calendario */}
              <button 
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === 'date'
                    ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Fecha
              </button>
              
              {/* Filtro de ubicación */}
              <button 
                onClick={() => {
                  getUserLocation();
                  handleFilterChange('location', 'mi-ubicacion');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === 'location'
                    ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <MapPin className="w-4 h-4" />
                Mi ubicación
              </button>
              
              {/* Calendario emergente */}
              {showDatePicker && (
                <div className="absolute top-20 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seleccionar fecha
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (selectedDate) {
                          handleFilterChange('date', selectedDate);
                          setShowDatePicker(false);
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Filtrar
                    </button>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
                </div>
              </div>
            </div>

          {/* Events Grid */}
          <div className="p-6">
            {(eventsLoading || upcomingLoading) ? (
              // Loading skeleton
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                    <div className="h-32 bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 rounded flex-1"></div>
                        <div className="h-8 bg-gray-200 rounded flex-1"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !filteredEvents || filteredEvents.length === 0 ? (
              // Empty state
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay eventos próximos</h3>
                <p className="text-gray-600 text-sm">
                  {canCreateEvent ? 'Crea tu primer evento para empezar' : 'Este canal aún no tiene eventos programados'}
                </p>
              </div>
            ) : (
              // Events grid - 3 cards per row filling entire width
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event: any) => (
                  <ChannelEventCard
                    key={event.id}
                    event={event}
                    currentUserId={currentUserId}
                    isOwner={isOwner}
                    onView={() => setSelectedEvent(event)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}