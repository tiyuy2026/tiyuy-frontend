export interface CRMClient {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'CLOSED_WON' | 'CLOSED_LOST' | 'ARCHIVED';
  
  // Métricas de interacción
  interactionScore: number;
  lastInteractionAt: string | null;
  totalInteractions: number;
  
  // Actividad por módulo
  messageActivity: {
    totalMessages: number;
    sentMessages: number;
    receivedMessages: number;
    lastMessageAt: string | null;
    interestLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  };
  
  groupActivity: {
    groupsJoined: number;
    postsCreated: number;
    commentsMade: number;
    likesGiven: number;
    lastActivityAt: string | null;
  };
  
  channelActivity: {
    channelsSubscribed: number;
    eventsAttended: number;
    eventResponses: number;
    lastActivityAt: string | null;
  };
  
  propertyActivity: {
    propertiesViewed: number;
    inquiriesMade: number;
    favoritesAdded: number;
    lastActivityAt: string | null;
  };
  
  // Datos calculados
  engagementRate: number;
  daysSinceLastActivity: number;
  isActive: boolean;
}

export interface ClientHeatmapData {
  clientId: number;
  clientName: string;
  hourlyActivity: { hour: number; count: number }[];
  dailyActivity: { day: string; count: number }[];
  peakActivityHour: number;
  peakActivityDay: string;
}

export interface CRMMetrics {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  averageInteractionScore: number;
  
  // Distribución por nivel de interés
  highInterestClients: number;
  mediumInterestClients: number;
  lowInterestClients: number;
  
  // Actividad por módulo
  messagesExchanged: number;
  groupParticipations: number;
  channelSubscriptions: number;
  eventParticipations: number;
  
  // Tendencias
  newClientsThisWeek: number;
  interactionsThisWeek: number;
  topEngagedClients: CRMClient[];
  clientsAtRisk: CRMClient[];
}

export type ClientFilter = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'HIGH_INTEREST' | 'MEDIUM_INTEREST' | 'LOW_INTEREST' | 'AT_RISK';
export type SortBy = 'INTERACTION_SCORE' | 'LAST_ACTIVITY' | 'MESSAGES' | 'ENGAGEMENT' | 'NAME';
