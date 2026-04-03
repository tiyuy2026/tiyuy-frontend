'use client';

import React, { useState } from 'react';
import { Plus, Calendar, MapPin, Users, X } from 'lucide-react';
import { 
  useGetChannelEvents, 
  useCreateChannelEvent, 
  useDeleteChannelEvent, 
  useRsvpChannelEvent, 
  useCancelRsvpChannelEvent 
} from '@/presentation/hooks/useContacts';
import ChannelEventCard from './ChannelEventCard';
import EventDetailView from './EventDetailView';

interface ChannelEventsPanelProps {
  channelId: number;
  channelName: string;
  currentUserId: number;
  currentUser: any;
  isOwner: boolean;
}

export default function ChannelEventsPanel({ 
  channelId, 
  channelName, 
  currentUserId, 
  currentUser,
  isOwner
}: ChannelEventsPanelProps) {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    location: '',
    maxAttendees: ''
  });

  // Queries
  const { data: events, isLoading, error } = useGetChannelEvents(channelId);
  const createEventMutation = useCreateChannelEvent();
  const deleteEventMutation = useDeleteChannelEvent(channelId);
  const rsvpMutation = useRsvpChannelEvent(channelId);
  const cancelRsvpMutation = useCancelRsvpChannelEvent(channelId);

  const handleCreateEvent = async () => {
    if (!formData.title.trim() || !formData.eventDate) return;

    const eventData = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      eventDate: formData.eventDate,
      location: formData.location.trim() || undefined,
      maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined
    };

    try {
      await createEventMutation.mutateAsync(eventData);
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        eventDate: '',
        location: '',
        maxAttendees: ''
      });
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      await deleteEventMutation.mutateAsync(eventId);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleRsvp = async (eventId: number) => {
    try {
      await rsvpMutation.mutateAsync(eventId);
    } catch (error) {
      console.error('Error RSVPing to event:', error);
    }
  };

  const handleCancelRsvp = async (eventId: number) => {
    try {
      await cancelRsvpMutation.mutateAsync(eventId);
    } catch (error) {
      console.error('Error canceling RSVP:', error);
    }
  };

  if (selectedEvent) {
    return (
      <EventDetailView
        event={selectedEvent}
        channelId={channelId}
        currentUserId={currentUserId}
        isOwner={isOwner}
        onBack={() => setSelectedEvent(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error al cargar los eventos</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{channelName}</h2>
            <p className="text-sm text-gray-500">Eventos del canal</p>
          </div>
          {isOwner && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear evento
            </button>
          )}
        </div>
      </div>

      {/* Create Event Form */}
      {showCreateForm && isOwner && (
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Crear nuevo evento</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título del evento *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Open House en Miraflores"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe tu evento..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha y hora *
                </label>
                <input
                  type="datetime-local"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ej: Av. Larco 123, Miraflores"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacidad máxima (opcional)
                </label>
                <input
                  type="number"
                  value={formData.maxAttendees}
                  onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                  placeholder="Ej: 50"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateEvent}
                  disabled={!formData.title.trim() || !formData.eventDate || createEventMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {createEventMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    'Crear evento'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="p-4">
        {!events || events.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay eventos aun</h3>
            <p className="text-gray-600 text-sm">
              {isOwner ? 'Crea tu primer evento para empezar' : 'Este canal aún no tiene eventos programados'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event: any) => (
              <ChannelEventCard
                key={event.id}
                event={event}
                currentUserId={currentUserId}
                isOwner={isOwner}
                onDelete={() => handleDeleteEvent(event.id)}
                onRsvp={() => handleRsvp(event.id)}
                onCancelRsvp={() => handleCancelRsvp(event.id)}
                onView={() => setSelectedEvent(event)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
