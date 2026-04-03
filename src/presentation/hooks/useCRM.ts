import { useQuery, useMutation } from '@tanstack/react-query';
import { axiosClient } from '@/infrastructure/api/axios-client';

// ==================== DTOs ====================

export interface HotLeadDTO {
  clientId: number;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  propertyId: number;
  propertyTitle: string;
  viewCount: number;
  lastViewAt: string;
  score: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  signals: string[];
}

export interface SupplyDemandHeatmapDTO {
  location: string;
  searchCount: number;
  propertyCount: number;
  uniqueUsers: number;
  avgMinPrice: number;
  avgMaxPrice: number;
  demandIntensity: number;
  heatLevel: 'VERY_HOT' | 'HOT' | 'WARM' | 'COOL' | 'COLD';
  opportunityScore: number;
}

export interface PipelineStageDTO {
  stage: string;
  stageLabel: string;
  count: number;
  avgDaysInStage: number;
  conversionRateToNext: number;
  dropOffRate: number;
}

export interface LostReasonDTO {
  reason: string;
  count: number;
  percentage: number;
}

export interface SalesForecastDTO {
  activeNegotiations: number;
  potentialValue: number;
}

export interface ConversionPipelineDTO {
  stages: PipelineStageDTO[];
  totalDeals: number;
  lostReasons: LostReasonDTO[];
  salesForecast: SalesForecastDTO;
}

export interface PropertyMatchDTO {
  clientId: number;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  propertyId: number;
  propertyTitle: string;
  propertyLocation: string;
  propertyPrice: number;
  totalScore: number;
  budgetScore: number;
  locationScore: number;
  typeScore: number;
  featuresScore: number;
  matchReasons: string;
  alreadyViewed: boolean;
}

// ==================== API Calls ====================

const CRM_ENDPOINTS = {
  HOT_LEADS: '/crm/hot-leads',
  HEATMAP: '/crm/heatmap',
  PIPELINE: '/crm/pipeline',
  MATCHES: '/crm/matches',
  TRACK_VIEW: '/crm/track-view',
  ADVANCE_PIPELINE: '/crm/pipeline/advance',
};

// ==================== Hooks ====================

/**
 * Hook para obtener oportunidades calientes (hot leads)
 * Clientes con alta intención de compra basada en comportamiento real
 */
export function useHotLeads(daysBack: number = 30, minViews: number = 3) {
  return useQuery({
    queryKey: ['crm', 'hot-leads', daysBack, minViews],
    queryFn: async () => {
      const { data } = await axiosClient.get<HotLeadDTO[]>(CRM_ENDPOINTS.HOT_LEADS, {
        params: { daysBack, minViews }
      });
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener el mapa de calor de demanda vs oferta
 * Muestra zonas con alta búsqueda y poca oferta (oportunidades)
 */
export function useSupplyDemandHeatmap(daysBack: number = 30) {
  return useQuery({
    queryKey: ['crm', 'heatmap', daysBack],
    queryFn: async () => {
      const { data } = await axiosClient.get<SupplyDemandHeatmapDTO[]>(CRM_ENDPOINTS.HEATMAP, {
        params: { daysBack }
      });
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para obtener el embudo de conversión real
 * Pipeline con estadísticas de conversión entre etapas
 */
export function useConversionPipeline(daysBack: number = 90) {
  return useQuery({
    queryKey: ['crm', 'pipeline', daysBack],
    queryFn: async () => {
      const { data } = await axiosClient.get<ConversionPipelineDTO>(CRM_ENDPOINTS.PIPELINE, {
        params: { daysBack }
      });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para obtener matches entre clientes y propiedades
 * Puntuación de compatibilidad presupuesto/ubicación/tipo
 */
export function usePropertyMatches(minScore: number = 50) {
  return useQuery({
    queryKey: ['crm', 'matches', minScore],
    queryFn: async () => {
      const { data } = await axiosClient.get<PropertyMatchDTO[]>(CRM_ENDPOINTS.MATCHES, {
        params: { minScore }
      });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Mutation para trackear vista de propiedad por cliente
 * Usado para alimentar el algoritmo de hot leads
 */
export function useTrackPropertyView() {
  return useMutation({
    mutationFn: async (payload: {
      clientId: number;
      propertyId: number;
      source: string;
      durationSeconds?: number;
    }) => {
      await axiosClient.post(CRM_ENDPOINTS.TRACK_VIEW, payload);
    },
  });
}

/**
 * Mutation para avanzar un cliente en el pipeline
 */
export function useAdvancePipeline() {
  return useMutation({
    mutationFn: async (payload: {
      clientId: number;
      newStage: string;
      notes?: string;
    }) => {
      await axiosClient.post(CRM_ENDPOINTS.ADVANCE_PIPELINE, payload);
    },
  });
}

/**
 * Hook completo que combina todas las métricas CRM
 * Para el dashboard principal
 */
export function useCRMDashboard() {
  const hotLeads = useHotLeads();
  const heatmap = useSupplyDemandHeatmap();
  const pipeline = useConversionPipeline();
  const matches = usePropertyMatches();

  const isLoading = hotLeads.isLoading || heatmap.isLoading || pipeline.isLoading || matches.isLoading;
  const isError = hotLeads.isError || heatmap.isError || pipeline.isError || matches.isError;

  return {
    hotLeads: hotLeads.data || [],
    heatmap: heatmap.data || [],
    pipeline: pipeline.data,
    matches: matches.data || [],
    isLoading,
    isError,
    refetch: () => {
      hotLeads.refetch();
      heatmap.refetch();
      pipeline.refetch();
      matches.refetch();
    }
  };
}
