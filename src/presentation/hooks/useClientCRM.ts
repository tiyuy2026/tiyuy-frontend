'use client';

import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CRMClient, CRMMetrics, ClientHeatmapData, ClientFilter, SortBy } from '@/core/domain/entities/CRM';
import { axiosClient } from '@/infrastructure/api/axios-client';
import { differenceInDays, parseISO, getHours, getDay } from 'date-fns';

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

  // ========== QUERIES REALES AL BACKEND ==========
  
  // 1. Obtener contactos recibidos (personas que han contactado al usuario)
  const { 
    data: contactsData, 
    isLoading: contactsLoading,
    error: contactsError 
  } = useQuery({
    queryKey: ['contacts', 'received', 0, 100],
    queryFn: async () => {
      const response = await axiosClient.get('/contacts/received?page=0&size=100');
      return response.data?.content || response.data || [];
    },
    enabled: !!userId,
    retry: 2,
    staleTime: 30000,
  });

  // 2. Obtener contactos enviados (personas a las que el usuario ha contactado)
  const { 
    data: sentContactsData, 
    isLoading: sentContactsLoading,
    error: sentContactsError 
  } = useQuery({
    queryKey: ['contacts', 'sent', 0, 100],
    queryFn: async () => {
      const response = await axiosClient.get('/contacts/sent?page=0&size=100');
      return response.data?.content || response.data || [];
    },
    enabled: !!userId,
    retry: 2,
    staleTime: 30000,
  });

  // 3. Obtener leads recibidos (personas interesadas en mis propiedades)
  const { 
    data: leadsData, 
    isLoading: leadsLoading,
    error: leadsError 
  } = useQuery({
    queryKey: ['leads', 'received', 0, 100],
    queryFn: async () => {
      const response = await axiosClient.get('/interactions/leads/received?page=0&size=100');
      return response.data?.content || response.data || [];
    },
    enabled: !!userId,
    retry: 2,
    staleTime: 30000,
  });

  // 4. Obtener leads enviados (propiedades en las que el usuario mostró interés)
  const { 
    data: sentLeadsData, 
    isLoading: sentLeadsLoading,
    error: sentLeadsError 
  } = useQuery({
    queryKey: ['leads', 'sent', 0, 100],
    queryFn: async () => {
      const response = await axiosClient.get('/interactions/leads/sent?page=0&size=100');
      return response.data?.content || response.data || [];
    },
    enabled: !!userId,
    retry: 2,
    staleTime: 30000,
  });

  // 5. Obtener propiedades del usuario
  const { 
    data: propertiesData, 
    isLoading: propertiesLoading,
    error: propertiesError 
  } = useQuery({
    queryKey: ['my-properties', 0, 100],
    queryFn: async () => {
      const response = await axiosClient.get('/properties/my-properties?page=0&size=100');
      return response.data?.content || response.data || [];
    },
    enabled: !!userId,
    retry: 2,
    staleTime: 30000,
  });

  // 6. Obtener grupos del usuario (datos reales del backend)
  const { 
    data: groupsData, 
    isLoading: groupsLoading,
    error: groupsError 
  } = useQuery({
    queryKey: ['contacts', 'extended', 'groups'],
    queryFn: async () => {
      try {
        const response = await axiosClient.get('/contacts/extended/groups?page=0&size=50');
        return response.data?.content || response.data || [];
      } catch {
        return [];
      }
    },
    enabled: !!userId,
    retry: 1,
    staleTime: 60000,
  });

  // 7. Obtener chats del usuario (datos reales del backend)
  const { 
    data: chatsData, 
    isLoading: chatsLoading,
    error: chatsError 
  } = useQuery({
    queryKey: ['contacts', 'extended', 'chats'],
    queryFn: async () => {
      try {
        const response = await axiosClient.get('/contacts/extended/chats');
        return response.data || [];
      } catch {
        return [];
      }
    },
    enabled: !!userId,
    retry: 1,
    staleTime: 60000,
  });

  const isLoading = contactsLoading || sentContactsLoading || leadsLoading || sentLeadsLoading || propertiesLoading || groupsLoading || chatsLoading;

  // Log de errores para depuración
  if (contactsError) console.warn('[useClientCRM] Error en contacts:', contactsError);
  if (sentContactsError) console.warn('[useClientCRM] Error en sentContacts:', sentContactsError);
  if (leadsError) console.warn('[useClientCRM] Error en leads:', leadsError);
  if (sentLeadsError) console.warn('[useClientCRM] Error en sentLeads:', sentLeadsError);
  if (propertiesError) console.warn('[useClientCRM] Error en properties:', propertiesError);

  // Unificar todos los contactos recibidos como "clientes"
  const contacts = Array.isArray(contactsData) ? contactsData : [];
  const sentContacts = Array.isArray(sentContactsData) ? sentContactsData : [];
  const leads = Array.isArray(leadsData) ? leadsData : [];
  const sentLeads = Array.isArray(sentLeadsData) ? sentLeadsData : [];
  const properties = Array.isArray(propertiesData) ? propertiesData : [];

  // Procesar y enriquecer datos de clientes
  const crmClients: CRMClient[] = useMemo(() => {
    // Usar contactos recibidos como fuente principal de "clientes"
    // Si no hay contactos, usar leads
    const sourceClients = contacts.length > 0 ? contacts : leads;
    
    if (!sourceClients || sourceClients.length === 0) return [];
    
    return sourceClients.map((client: any) => {
      // Normalizar campos según el tipo de DTO (ContactResponse vs ReceivedLeadDto)
      const clientName = client.contactName || client.interestedUserName || client.name || 'Sin nombre';
      const clientEmail = client.contactEmail || client.interestedUserEmail || client.email || '';
      const clientPhone = client.contactPhone || client.phone || '';
      const clientId = client.id || Math.random();
      const clientCreatedAt = client.createdAt || null;
      
      // Buscar propiedades relacionadas con este cliente
      const clientProperties = properties.filter((p: any) => 
        p.contactEmail?.toLowerCase() === clientEmail.toLowerCase() ||
        p.contactPhone === clientPhone
      );
      
      // Buscar leads enviados por este cliente (interés en propiedades)
      const clientSentLeads = sentLeads.filter((l: any) => 
        l.contactEmail?.toLowerCase() === clientEmail.toLowerCase() ||
        l.contactPhone === clientPhone
      );
      
      // Buscar mensajes enviados a este cliente (desde sentContacts)
      const clientSentMessages = sentContacts.filter((s: any) => 
        s.contactEmail?.toLowerCase() === clientEmail.toLowerCase() ||
        s.contactPhone === clientPhone
      );
      
      const totalMessages = clientSentMessages.length;
      const sentMessages = clientSentMessages.length;
      const receivedMessages = 0; // Los contactos recibidos son los que otros enviaron al usuario
      
      const lastMessageAt = client.createdAt || null;
      
      // Calcular última actividad global
      const lastActivityDates = [
        lastMessageAt,
        client.updatedAt,
        clientCreatedAt
      ].filter(Boolean);
      
      const lastInteractionAt = lastActivityDates.length > 0
        ? lastActivityDates.sort((a: any, b: any) => new Date(b).getTime() - new Date(a).getTime())[0]
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
      
      const groupActivity = {
        groupsJoined: 0,
        postsCreated: 0,
        commentsMade: 0,
        likesGiven: 0,
        lastActivityAt: null
      };
      
      const channelActivity = {
        channelsSubscribed: 0,
        eventsAttended: 0,
        eventResponses: 0,
        lastActivityAt: null
      };
      
      const propertyActivity = {
        propertiesViewed: clientProperties.length + clientSentLeads.length,
        inquiriesMade: clientProperties.length,
        favoritesAdded: clientSentLeads.length,
        lastActivityAt: clientCreatedAt
      };
      
      const totalInteractions = 
        totalMessages + 
        propertyActivity.inquiriesMade +
        propertyActivity.favoritesAdded;
      
      const interactionScore = calculateInteractionScore(
        totalMessages,
        0, // groups
        0, // channels
        0, // events
        propertyActivity.inquiriesMade,
        daysSinceLastActivity
      );
      
      const crmClient: CRMClient = {
        id: clientId,
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        status: client.status || 'ACTIVE',
        interactionScore,
        lastInteractionAt,
        totalInteractions,
        messageActivity,
        groupActivity,
        channelActivity,
        propertyActivity,
        engagementRate: Math.round((totalInteractions / Math.max(daysSinceLastActivity, 1)) * 10),
        daysSinceLastActivity,
        isActive: false
      };
      
      crmClient.isActive = isClientActive(crmClient);
      
      return crmClient;
    });
  }, [contacts, leads, properties, sentLeads, sentContacts]);
  
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
  
  // Generar datos de heatmap basados en actividad real
  const heatmapData: ClientHeatmapData[] = useMemo(() => {
    return crmClients.map(client => {
      const hourlyCounts: number[] = Array.from({ length: 24 }, () => 0);
      
      // Si hay última actividad, distribuir en esa hora
      if (client.lastInteractionAt) {
        const hour = getHours(parseISO(client.lastInteractionAt));
        hourlyCounts[hour] = client.messageActivity.totalMessages || 1;
      }
      
      const hourlyActivity = hourlyCounts.map((count, hour) => ({ hour, count }));
      
      const dailyCounts = [0, 0, 0, 0, 0, 0, 0];
      if (client.lastInteractionAt) {
        const day = getDay(parseISO(client.lastInteractionAt));
        dailyCounts[day] = client.totalInteractions || 1;
      }
      
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const dailyActivity = days.map((day, index) => ({
        day,
        count: dailyCounts[index]
      }));
      
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
  }, [crmClients]);
  
  // Función para filtrar clientes
  const filterClients = (filter: ClientFilter, sortBy: SortBy = 'INTERACTION_SCORE', searchTerm: string = ''): CRMClient[] => {
    let filtered = [...crmClients];
    
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
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.phone?.includes(term)
      );
    }
    
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
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['my-properties'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  };
}