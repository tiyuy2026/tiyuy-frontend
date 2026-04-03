'use client';

import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CRMClient, CRMMetrics, ClientHeatmapData, ClientFilter, SortBy } from '@/core/domain/entities/CRM';
import { useAgentClients } from './useAgentClients';
import { useGetChats } from './useContacts';
import { useGetGroups } from './useContacts';
import { useGetChannels } from './useContacts';
import { useUserEvents } from './useContacts';
import { differenceInDays, parseISO, format, getHours, getDay } from 'date-fns';
import { es } from 'date-fns/locale';

// Función para calcular nivel de interés basado en mensajes
function calculateInterestLevel(sent: number, received: number): 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' {
  const total = sent + received;
  if (total === 0) return 'NONE';
  if (total >= 20 || (received > 0 && sent > 0 && total >= 10)) return 'HIGH';
  if (total >= 5) return 'MEDIUM';
  return 'LOW';
}

// Función para calcular score de interacción (0-100)
function calculateInteractionScore(
  messages: number,
  groups: number,
  channels: number,
  events: number,
  properties: number,
  daysSinceLastActivity: number
): number {
  let score = 0;
  
  // Peso por tipo de actividad
  score += Math.min(messages * 2, 30); // Máx 30 puntos por mensajes
  score += Math.min(groups * 5, 20);   // Máx 20 puntos por grupos
  score += Math.min(channels * 3, 15); // Máx 15 puntos por canales
  score += Math.min(events * 4, 15);   // Máx 15 puntos por eventos
  score += Math.min(properties * 2, 10); // Máx 10 puntos por propiedades
  
  // Penalización por inactividad
  if (daysSinceLastActivity <= 1) score += 10;
  else if (daysSinceLastActivity <= 7) score += 5;
  else if (daysSinceLastActivity > 30) score -= 20;
  else if (daysSinceLastActivity > 14) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}

// Función para determinar si un cliente está activo
function isClientActive(client: Partial<CRMClient>): boolean {
  const hasRecentActivity = client.daysSinceLastActivity !== undefined && client.daysSinceLastActivity <= 30;
  const hasInteractions = 
    (client.messageActivity?.totalMessages || 0) > 0 ||
    (client.groupActivity?.postsCreated || 0) > 0 ||
    (client.channelActivity?.eventsAttended || 0) > 0 ||
    (client.propertyActivity?.inquiriesMade || 0) > 0;
  
  return hasRecentActivity && hasInteractions;
}

export function useClientCRM(userId?: number) {
  const queryClient = useQueryClient();
  
  // Obtener datos de todos los módulos
  const { clients, isLoading: clientsLoading } = useAgentClients();
  const { data: chats = [], isLoading: chatsLoading } = useGetChats('all');
  const { data: groups = [], isLoading: groupsLoading } = useGetGroups(0, 100);
  const { data: channels = [], isLoading: channelsLoading } = useGetChannels(userId, 0, 100);
  const { data: eventsData, isLoading: eventsLoading } = useUserEvents(userId, 0, 100);
  
  const isLoading = clientsLoading || chatsLoading || groupsLoading || channelsLoading || eventsLoading;
  
  // Procesar y enriquecer datos de clientes
  const crmClients: CRMClient[] = useMemo(() => {
    if (!clients || clients.length === 0) return [];
    
    return clients.map((client: any) => {
      // Buscar chats relacionados con este cliente
      const clientChats = chats.filter((chat: any) => 
        chat.contactName?.toLowerCase().includes(client.name.toLowerCase()) ||
        chat.contactEmail === client.email
      );
      
      const totalMessages = clientChats.reduce((sum: number, chat: any) => 
        sum + (chat.unreadCount || 0) + (chat.lastMessage ? 1 : 0), 0
      );
      
      const sentMessages = clientChats.filter((c: any) => c.lastMessage?.isFromUser).length;
      const receivedMessages = totalMessages - sentMessages;
      
      const lastMessageAt = clientChats.length > 0 
        ? clientChats.sort((a: any, b: any) => 
            new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
          )[0]?.lastMessageAt
        : null;
      
      // Actividad en grupos - usar datos reales
      const clientGroups = groups.filter((g: any) => 
        g.members?.some((m: any) => m.name?.toLowerCase().includes(client.name.toLowerCase()))
      );
      
      // Calcular posts totales en grupos del cliente (usando postCount real del backend)
      const totalGroupPosts = clientGroups.reduce((sum: number, g: any) => sum + (g.postCount || 0), 0);
      
      // Encontrar última actividad en grupos
      const lastGroupActivity = clientGroups.length > 0
        ? clientGroups.sort((a: any, b: any) => 
            new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
          )[0]?.updatedAt
        : null;
      
      const groupActivity = {
        groupsJoined: clientGroups.length,
        postsCreated: totalGroupPosts, // Datos reales del backend
        commentsMade: 0, // Requeriría endpoint específico por usuario
        likesGiven: 0,   // Requeriría endpoint específico por usuario
        lastActivityAt: lastGroupActivity
      };
      
      // Actividad en canales
      const clientChannels = channels.filter((c: any) =>
        c.isSubscribed && c.subscribers?.some((s: any) => s.name?.toLowerCase().includes(client.name.toLowerCase()))
      );
      
      // Eventos del usuario
      const userEvents = eventsData?.content || [];
      const clientEvents = userEvents.filter((e: any) => 
        e.attendees?.some((a: any) => a.name?.toLowerCase().includes(client.name.toLowerCase()))
      );
      
      // Calcular última actividad global
      const lastActivityDates = [
        lastMessageAt,
        client.lastContactAt,
        client.updatedAt
      ].filter(Boolean);
      
      const lastInteractionAt = lastActivityDates.length > 0
        ? lastActivityDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
        : null;
      
      const daysSinceLastActivity = lastInteractionAt 
        ? differenceInDays(new Date(), parseISO(lastInteractionAt))
        : 999;
      
      // Calcular métricas
      const messageActivity = {
        totalMessages,
        sentMessages,
        receivedMessages,
        lastMessageAt,
        interestLevel: calculateInterestLevel(sentMessages, receivedMessages)
      };
      
      const channelActivity = {
        channelsSubscribed: clientChannels.length,
        eventsAttended: clientEvents.length,
        eventResponses: clientEvents.filter((e: any) => e.userResponse).length,
        lastActivityAt: clientEvents.length > 0 
          ? clientEvents.sort((a: any, b: any) => 
              new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
            )[0]?.startDate
          : null
      };
      
      const propertyActivity = {
        propertiesViewed: client.totalInteractions || 0,
        inquiriesMade: client.totalInteractions || 0,
        favoritesAdded: 0,
        lastActivityAt: client.lastContactAt
      };
      
      const totalInteractions = 
        totalMessages + 
        groupActivity.groupsJoined + 
        channelActivity.channelsSubscribed + 
        channelActivity.eventsAttended +
        propertyActivity.inquiriesMade;
      
      const interactionScore = calculateInteractionScore(
        totalMessages,
        groupActivity.groupsJoined,
        channelActivity.channelsSubscribed,
        channelActivity.eventsAttended,
        propertyActivity.inquiriesMade,
        daysSinceLastActivity
      );
      
      const crmClient: CRMClient = {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        status: client.status,
        interactionScore,
        lastInteractionAt,
        totalInteractions,
        messageActivity,
        groupActivity,
        channelActivity,
        propertyActivity,
        engagementRate: Math.round((totalInteractions / Math.max(daysSinceLastActivity, 1)) * 10),
        daysSinceLastActivity,
        isActive: false // Se calcula después
      };
      
      crmClient.isActive = isClientActive(crmClient);
      
      return crmClient;
    });
  }, [clients, chats, groups, channels, eventsData]);
  
  // Calcular métricas generales
  const metrics: CRMMetrics = useMemo(() => {
    if (crmClients.length === 0) {
      return {
        totalClients: 0,
        activeClients: 0,
        inactiveClients: 0,
        averageInteractionScore: 0,
        highInterestClients: 0,
        mediumInterestClients: 0,
        lowInterestClients: 0,
        messagesExchanged: 0,
        groupParticipations: 0,
        channelSubscriptions: 0,
        eventParticipations: 0,
        newClientsThisWeek: 0,
        interactionsThisWeek: 0,
        topEngagedClients: [],
        clientsAtRisk: []
      };
    }
    
    const activeClients = crmClients.filter(c => c.isActive);
    const inactiveClients = crmClients.filter(c => !c.isActive);
    
    const highInterest = crmClients.filter(c => c.messageActivity.interestLevel === 'HIGH');
    const mediumInterest = crmClients.filter(c => c.messageActivity.interestLevel === 'MEDIUM');
    const lowInterest = crmClients.filter(c => c.messageActivity.interestLevel === 'LOW');
    
    const messagesCount = crmClients.reduce((sum, c) => sum + c.messageActivity.totalMessages, 0);
    const groupsCount = crmClients.reduce((sum, c) => sum + c.groupActivity.groupsJoined, 0);
    const channelsCount = crmClients.reduce((sum, c) => sum + c.channelActivity.channelsSubscribed, 0);
    const eventsCount = crmClients.reduce((sum, c) => sum + c.channelActivity.eventsAttended, 0);
    
    const avgScore = crmClients.reduce((sum, c) => sum + c.interactionScore, 0) / crmClients.length;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const newThisWeek = crmClients.filter(c => {
      const created = c.lastInteractionAt ? parseISO(c.lastInteractionAt) : null;
      return created && created >= oneWeekAgo;
    });
    
    const interactionsThisWeek = crmClients.filter(c => 
      c.daysSinceLastActivity <= 7
    ).length;
    
    const topEngaged = [...crmClients]
      .sort((a, b) => b.interactionScore - a.interactionScore)
      .slice(0, 5);
    
    const atRisk = crmClients.filter(c => 
      c.daysSinceLastActivity > 14 && c.interactionScore > 30
    ).sort((a, b) => b.interactionScore - a.interactionScore);
    
    return {
      totalClients: crmClients.length,
      activeClients: activeClients.length,
      inactiveClients: inactiveClients.length,
      averageInteractionScore: Math.round(avgScore),
      highInterestClients: highInterest.length,
      mediumInterestClients: mediumInterest.length,
      lowInterestClients: lowInterest.length,
      messagesExchanged: messagesCount,
      groupParticipations: groupsCount,
      channelSubscriptions: channelsCount,
      eventParticipations: eventsCount,
      newClientsThisWeek: newThisWeek.length,
      interactionsThisWeek,
      topEngagedClients: topEngaged,
      clientsAtRisk: atRisk
    };
  }, [crmClients]);
  
  // Generar datos de heatmap basados en ACTIVIDAD REAL
  const heatmapData: ClientHeatmapData[] = useMemo(() => {
    return crmClients.map(client => {
      // Buscar chats reales del cliente para calcular actividad por hora
      const clientChats = chats.filter((chat: any) => 
        chat.contactName?.toLowerCase().includes(client.name.toLowerCase()) ||
        chat.contactEmail === client.email
      );
      
      // Calcular actividad por hora basada en mensajes reales
      const hourlyCounts: number[] = Array.from({ length: 24 }, () => 0);
      clientChats.forEach((chat: any) => {
        if (chat.lastMessageAt) {
          const hour = getHours(parseISO(chat.lastMessageAt));
          hourlyCounts[hour] += (chat.unreadCount || 0) + (chat.lastMessage ? 1 : 0);
        }
      });
      
      // Si no hay mensajes, distribuir según última actividad conocida
      if (hourlyCounts.every(c => c === 0) && client.lastInteractionAt) {
        const hour = getHours(parseISO(client.lastInteractionAt));
        (hourlyCounts as number[])[hour] = 1;
      }
      
      const hourlyActivity = hourlyCounts.map((count, hour) => ({ hour, count }));
      
      // Calcular actividad por día basada en mensajes reales
      const dailyCounts = [0, 0, 0, 0, 0, 0, 0]; // Dom-Sáb
      clientChats.forEach((chat: any) => {
        if (chat.lastMessageAt) {
          const day = getDay(parseISO(chat.lastMessageAt));
          dailyCounts[day] += (chat.unreadCount || 0) + (chat.lastMessage ? 1 : 0);
        }
      });
      
      // Agregar actividad de eventos por día
      const userEvents = eventsData?.content || [];
      const clientEvents = userEvents.filter((e: any) => 
        e.attendees?.some((a: any) => a.name?.toLowerCase().includes(client.name.toLowerCase()))
      );
      clientEvents.forEach((event: any) => {
        if (event.startDate) {
          const day = getDay(parseISO(event.startDate));
          dailyCounts[day] += 1;
        }
      });
      
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const dailyActivity = days.map((day, index) => ({
        day,
        count: dailyCounts[index]
      }));
      
      // Calcular picos de actividad reales
      const peakHour = hourlyActivity.reduce((max, curr) => 
        curr.count > max.count ? curr : max, hourlyActivity[0] || { hour: 0, count: 0 }
      );
      
      const peakDay = dailyActivity.reduce((max, curr) => 
        curr.count > max.count ? curr : max, dailyActivity[0] || { day: 'Lun', count: 0 }
      );
      
      return {
        clientId: client.id,
        clientName: client.name,
        hourlyActivity,
        dailyActivity,
        peakActivityHour: peakHour.hour,
        peakActivityDay: peakDay.day
      };
    });
  }, [crmClients, chats, eventsData]);
  
  // Función para filtrar clientes
  const filterClients = (filter: ClientFilter, sortBy: SortBy = 'INTERACTION_SCORE', searchTerm: string = ''): CRMClient[] => {
    let filtered = [...crmClients];
    
    // Aplicar filtro
    switch (filter) {
      case 'ACTIVE':
        filtered = filtered.filter(c => c.isActive);
        break;
      case 'INACTIVE':
        filtered = filtered.filter(c => !c.isActive);
        break;
      case 'HIGH_INTEREST':
        filtered = filtered.filter(c => c.messageActivity.interestLevel === 'HIGH');
        break;
      case 'MEDIUM_INTEREST':
        filtered = filtered.filter(c => c.messageActivity.interestLevel === 'MEDIUM');
        break;
      case 'LOW_INTEREST':
        filtered = filtered.filter(c => c.messageActivity.interestLevel === 'LOW');
        break;
      case 'AT_RISK':
        filtered = filtered.filter(c => c.daysSinceLastActivity > 14 && c.interactionScore > 30);
        break;
    }
    
    // Aplicar búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.phone?.includes(term)
      );
    }
    
    // Aplicar ordenamiento
    switch (sortBy) {
      case 'INTERACTION_SCORE':
        filtered.sort((a, b) => b.interactionScore - a.interactionScore);
        break;
      case 'LAST_ACTIVITY':
        filtered.sort((a, b) => 
          (b.lastInteractionAt ? new Date(b.lastInteractionAt).getTime() : 0) - 
          (a.lastInteractionAt ? new Date(a.lastInteractionAt).getTime() : 0)
        );
        break;
      case 'MESSAGES':
        filtered.sort((a, b) => b.messageActivity.totalMessages - a.messageActivity.totalMessages);
        break;
      case 'ENGAGEMENT':
        filtered.sort((a, b) => b.engagementRate - a.engagementRate);
        break;
      case 'NAME':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    
    return filtered;
  };
  
  return {
    clients: crmClients,
    metrics,
    heatmapData,
    isLoading,
    filterClients,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', 'clients'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['userEvents'] });
    }
  };
}
