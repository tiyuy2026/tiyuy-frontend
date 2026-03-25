'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, Users, Clock, Search, Filter, ChevronDown, X, Heart, MessageCircle, Share2 } from 'lucide-react';
import { useGetChannels, useChannelEvents } from '@/presentation/hooks/useContacts';

interface MisEventosViewProps {
  user: any;
  onEventSelect?: (event: any, channel: any) => void;
  onCreateEvent?: () => void; // For Agents and Inmobiliarias
}

export default function MisEventosView({ user, onEventSelect, onCreateEvent }: MisEventosViewProps) {
  const { data: channels, isLoading: channelsLoading } = useGetChannels(user?.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'todos' | 'proximos' | 'pasados' | 'mis_respuestas'>('proximos');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Check if user can create events (Agents and Inmobiliarias)
  const canCreateEvent = user?.role === 'AGENT' || user?.role === 'INMOBILIARIA';

  // Get events from subscribed channels using real backend data
  const getAllEvents = () => {
    if (!channels) return [];
    
    const allEvents: any[] = [];
    
    // Only process channels where user is subscribed
    const subscribedChannels = channels.filter((channel: any) => channel.isSubscribed);
    
    subscribedChannels.forEach((channel: any) => {
      // Check if channel has events (when backend integrates them)
      if (channel.events && Array.isArray(channel.events)) {
        channel.events.forEach((event: any) => {
          allEvents.push({
            ...event,
            channelName: channel.name,
            channelCity: channel.city,
            channelId: channel.id,
            channelAvatar: channel.avatar,
            userResponseStatus: event.userResponseStatus || null,
          });
        });
      }
    });
    
    return allEvents;
  };

  const allEvents = getAllEvents();
  
  // Filter events
  const getFilteredEvents = () => {
    let filtered = allEvents;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((event: any) => 
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.channelName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    const now = new Date();
    switch (activeFilter) {
      case 'proximos':
        filtered = filtered.filter((event: any) => new Date(event.startDateTime) > now);
        break;
      case 'pasados':
        filtered = filtered.filter((event: any) => new Date(event.startDateTime) <= now);
        break;
      case 'mis_respuestas':
        filtered = filtered.filter((event: any) => event.userResponseStatus);
        break;
      // 'todos' no filter
    }
    
    // Sort by date (upcoming first)
    return filtered.sort((a: any, b: any) => 
      new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
    );
  };

  const filteredEvents = getFilteredEvents();
  
  const getEventStatusColor = (event: any) => {
    const now = new Date();
    const eventDate = new Date(event.startDateTime);
    
    if (eventDate > now) {
      return 'bg-blue-100 text-blue-700';
    } else {
      return 'bg-gray-100 text-gray-700';
    }
  };

  const getEventStatusText = (event: any) => {
    const now = new Date();
    const eventDate = new Date(event.startDateTime);
    
    if (eventDate > now) {
      return 'Próximo';
    } else {
      return 'Finalizado';
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    });
  };

  const getEventEmoji = (eventType: string) => {
    const emojis: Record<string, string> = {
      'MEETING': '🤝',
      'CONFERENCE': '🎤',
      'WORKSHOP': '🛠️',
      'SOCIAL': '🎉',
      'WEBINAR': '💻',
    };
    return emojis[eventType] || '📅';
  };

  if (channelsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Loading your events...</p>
        </div>
      </div>
    );
  }

  if (filteredEvents.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No events available</h3>
          <p className="text-gray-500 text-sm mb-4">
            {activeFilter === 'mis_respuestas' 
              ? "You haven't responded to any events yet. Explore channels and participate in events that interest you."
              : "No events available in your subscribed channels. Subscribe to more channels to see their events."
            }
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-700 text-sm font-medium mb-1">💡 Tip:</p>
            <p className="text-blue-600 text-xs">
              Explore the "Discover channels" section to find channels with interesting events and subscribe to them.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900">My Events</h2>
          {canCreateEvent && onCreateEvent && (
            <button
              onClick={onCreateEvent}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-teal-700 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Create Event
            </button>
          )}
        </div>
        <p className="text-gray-600 text-sm">
          Events from channels you're subscribed to. Participate, comment and connect with other professionals.
          {canCreateEvent && " As a professional, you can also create your own events."}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-sm text-gray-700 placeholder-gray-400 flex-1 focus:outline-none"
          />
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">
              {activeFilter === 'todos' && 'All'}
              {activeFilter === 'proximos' && 'Upcoming'}
              {activeFilter === 'pasados' && 'Past'}
              {activeFilter === 'mis_respuestas' && 'My responses'}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showFilterDropdown && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => { setActiveFilter('todos'); setShowFilterDropdown(false); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  activeFilter === 'todos' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                All events
              </button>
              <button
                onClick={() => { setActiveFilter('proximos'); setShowFilterDropdown(false); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  activeFilter === 'proximos' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                Upcoming events
              </button>
              <button
                onClick={() => { setActiveFilter('pasados'); setShowFilterDropdown(false); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  activeFilter === 'pasados' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                Past events
              </button>
              <button
                onClick={() => { setActiveFilter('mis_respuestas'); setShowFilterDropdown(false); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  activeFilter === 'mis_respuestas' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                My responses
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.map((event: any) => (
          <div
            key={`${event.channelId}-${event.id}`}
            onClick={() => onEventSelect?.(event, { id: event.channelId, name: event.channelName })}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            {/* Event Header */}
            <div className="flex items-start gap-4">
              {/* Event Type Icon */}
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">{getEventEmoji(event.eventType)}</span>
              </div>

              {/* Event Content */}
              <div className="flex-1 min-w-0">
                {/* Event Title and Status */}
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventStatusColor(event)}`}>
                    {getEventStatusText(event)}
                  </span>
                  {event.userResponseStatus && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {event.userResponseStatus === 'ATTENDING' ? 'Asistiré' : 'Interesado'}
                    </span>
                  )}
                </div>

                {/* Channel Name */}
                <p className="text-sm text-gray-600 mb-2">
                  📢 {event.channelName} {event.channelCity && `• ${event.channelCity}`}
                </p>

                {/* Description */}
                {event.description && (
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">{event.description}</p>
                )}

                {/* Event Details */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatEventDate(event.startDateTime)}
                  </div>
                  {event.location?.address && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.location.address.length > 30 
                        ? `${event.location.address.substring(0, 30)}...`
                        : event.location.address
                      }
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {event.attendeeCount || 0} asistentes
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Aquí iría la lógica para dar like al evento
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Heart className="w-3 h-3" />
                    {event.likeCount || 0}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Aquí iría la lógica para comentar
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <MessageCircle className="w-3 h-3" />
                    {event.commentCount || 0}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Aquí iría la lógica para compartir
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Share2 className="w-3 h-3" />
                    Compartir
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
