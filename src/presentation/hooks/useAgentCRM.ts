import { useQuery, useMutation } from '@tanstack/react-query';
import { axiosClient } from '@/infrastructure/api/axios-client';

// DTOs
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
  downloadedDocuments: boolean;
  contactRequested: boolean;
  savedToFavorites: boolean;
}

export interface PipelineStageDTO {
  stage: string;
  stageLabel: string;
  count: number;
  conversionRateToNext: number;
  dropOffRate: number;
}

export interface PipelineDTO {
  stages: PipelineStageDTO[];
  totalDeals: number;
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
  matchReasons: string;
}

// Endpoints del módulo agent
const AGENT_ENDPOINTS = {
  HOT_LEADS: '/agent/clients/hot-leads',
  PIPELINE: '/agent/clients/pipeline',
  MATCHES: '/agent/clients/matches',
  PIPELINE_ADVANCE: (clientId: number) => `/agent/clients/${clientId}/pipeline`,
};

// Hooks
export function useHotLeads(daysBack: number = 30, minViews: number = 3) {
  return useQuery({
    queryKey: ['agent', 'hot-leads', daysBack, minViews],
    queryFn: async () => {
      const { data } = await axiosClient.get<HotLeadDTO[]>(AGENT_ENDPOINTS.HOT_LEADS, {
        params: { daysBack, minViews }
      });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useConversionPipeline() {
  return useQuery({
    queryKey: ['agent', 'pipeline'],
    queryFn: async () => {
      const { data } = await axiosClient.get<PipelineDTO>(AGENT_ENDPOINTS.PIPELINE);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePropertyMatches(minScore: number = 50) {
  return useQuery({
    queryKey: ['agent', 'matches', minScore],
    queryFn: async () => {
      const { data } = await axiosClient.get<PropertyMatchDTO[]>(AGENT_ENDPOINTS.MATCHES, {
        params: { minScore }
      });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdvancePipeline() {
  return useMutation({
    mutationFn: async ({ clientId, stage, notes }: { clientId: number; stage: string; notes?: string }) => {
      await axiosClient.post(AGENT_ENDPOINTS.PIPELINE_ADVANCE(clientId), null, {
        params: { stage, notes }
      });
    },
  });
}

export function useCRMAdvanced() {
  const hotLeads = useHotLeads();
  const pipeline = useConversionPipeline();
  const matches = usePropertyMatches();

  return {
    hotLeads: hotLeads.data || [],
    pipeline: pipeline.data,
    matches: matches.data || [],
    isLoading: hotLeads.isLoading || pipeline.isLoading || matches.isLoading,
    isError: hotLeads.isError || pipeline.isError || matches.isError,
    refetch: () => {
      hotLeads.refetch();
      pipeline.refetch();
      matches.refetch();
    }
  };
}
