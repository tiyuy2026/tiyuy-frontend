import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminRepository } from '@/infrastructure/repositories/AdminRepository';
import {
  DeveloperAgentAssociation,
  CreateAssociationRequest,
  ReviewAssociationRequest,
  DeveloperSearchFilter,
  DeveloperResponse,
} from '@/core/domain/entities/Admin';

const ASSOCIATIONS_QUERY_KEY = 'developer-associations';

// Hook para obtener la asociación del agente actual con un developer
export function useMyDeveloperAssociation() {
  return useQuery({
    queryKey: [ASSOCIATIONS_QUERY_KEY, 'my-association'],
    queryFn: () => adminRepository.getMyDeveloperAssociation(),
  });
}

// Hook para solicitar asociación a un developer
export function useRequestDeveloperAssociation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAssociationRequest) =>
      adminRepository.requestDeveloperAssociation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ASSOCIATIONS_QUERY_KEY, 'my-association'] });
    },
  });
}

// Hook para cancelar solicitud de asociación
export function useCancelDeveloperAssociationRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: number) =>
      adminRepository.cancelDeveloperAssociationRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ASSOCIATIONS_QUERY_KEY, 'my-association'] });
    },
  });
}

// Hook para buscar developers disponibles
export function useSearchDevelopers(filter?: DeveloperSearchFilter) {
  return useQuery({
    queryKey: [ASSOCIATIONS_QUERY_KEY, 'search', filter],
    queryFn: () => adminRepository.searchDevelopers(filter || {}),
    enabled: true, // Siempre habilitado para listar todas las inmobiliarias
  });
}

// Hook para obtener solicitudes pendientes de un developer
export function useDeveloperAssociationRequests(developerId: number) {
  return useQuery({
    queryKey: [ASSOCIATIONS_QUERY_KEY, 'requests', developerId],
    queryFn: () => adminRepository.getDeveloperAssociationRequests(developerId),
    enabled: !!developerId,
  });
}

// Hook para obtener TODAS las solicitudes pendientes (vista admin)
export function useAllPendingAssociationRequests() {
  return useQuery({
    queryKey: [ASSOCIATIONS_QUERY_KEY, 'admin', 'all-pending'],
    queryFn: () => adminRepository.getAllPendingAssociationRequests(),
  });
}

// Hook para obtener TODAS las solicitudes con paginación y filtro (vista admin)
export function useAllAssociationRequests(status: string | null = null, page: number = 0, size: number = 10) {
  return useQuery({
    queryKey: [ASSOCIATIONS_QUERY_KEY, 'admin', 'all', status, page, size],
    queryFn: () => adminRepository.getAllAssociationRequests(status, page, size),
  });
}

// Hook para aprobar solicitud de asociación
export function useApproveDeveloperAssociation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ associationId, data }: { associationId: number; data: ReviewAssociationRequest }) =>
      adminRepository.approveDeveloperAssociation(associationId, data),
    onSuccess: () => {
      // Invalidate all association-related queries to refresh lists
      queryClient.invalidateQueries({ queryKey: [ASSOCIATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['developers'] });
    },
  });
}

// Hook para rechazar solicitud de asociación
export function useRejectDeveloperAssociation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ associationId, data }: { associationId: number; data: ReviewAssociationRequest }) =>
      adminRepository.rejectDeveloperAssociation(associationId, data),
    onSuccess: () => {
      // Invalidate all association-related queries to refresh lists
      queryClient.invalidateQueries({ queryKey: [ASSOCIATIONS_QUERY_KEY] });
    },
  });
}

// Hook para obtener agentes asociados a un developer
export function useDeveloperAgentAssociations(developerId: number) {
  return useQuery({
    queryKey: [ASSOCIATIONS_QUERY_KEY, 'agents', developerId],
    queryFn: () => adminRepository.getDeveloperAgentAssociations(developerId),
    enabled: !!developerId,
  });
}

// Hook paginado para obtener solicitudes de asociación de un developer
export function useDeveloperAssociationRequestsPaginated(developerId: number, status: string | null = null, page: number = 0, size: number = 6) {
  return useQuery({
    queryKey: [ASSOCIATIONS_QUERY_KEY, 'requests-paginated', developerId, status, page, size],
    queryFn: () => adminRepository.getDeveloperAssociationRequestsPaginated(developerId, status, page, size),
    enabled: !!developerId,
  });
}

// Hook paginado para obtener asociaciones de un developer
export function useDeveloperAgentAssociationsPaginated(developerId: number, status: string | null = null, page: number = 0, size: number = 6) {
  return useQuery({
    queryKey: [ASSOCIATIONS_QUERY_KEY, 'agents-paginated', developerId, status, page, size],
    queryFn: () => adminRepository.getDeveloperAgentAssociationsPaginated(developerId, status, page, size),
    enabled: !!developerId,
  });
}

// Hook para remover agente de un developer
export function useRemoveDeveloperAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ developerId, agentId }: { developerId: number; agentId: number }) =>
      adminRepository.removeDeveloperAgent(developerId, agentId),
    onSuccess: () => {
      // Invalidate all association-related queries to refresh lists
      queryClient.invalidateQueries({ queryKey: [ASSOCIATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['developers'] });
    },
  });
}

// Hook para obtener agentes de un developer (vista admin)
export function useAdminDeveloperAgents(developerId: number) {
  return useQuery({
    queryKey: [ASSOCIATIONS_QUERY_KEY, 'admin-agents', developerId],
    queryFn: () => adminRepository.getAdminDeveloperAgents(developerId),
    enabled: !!developerId,
  });
}

// Hook para agregar agente a un developer (vista admin)
export function useAddAdminDeveloperAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ developerId, agentId }: { developerId: number; agentId: number }) =>
      adminRepository.addAdminDeveloperAgent(developerId, agentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ASSOCIATIONS_QUERY_KEY, 'admin-agents', variables.developerId] });
      queryClient.invalidateQueries({ queryKey: ['developers'] });
    },
  });
}
