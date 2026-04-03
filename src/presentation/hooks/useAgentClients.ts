import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AgentClientsUseCases } from '../../core/domain/use-cases/AgentClientsUseCases';
import { AgentClientsRepository } from '../../infrastructure/repositories/AgentClientsRepository';
import { 
  CreateClientData, 
  UpdateClientData,
  CreateInteractionData,
  ClientFilter,
  ClientStatus,
  ClientInteractionType
} from '../../core/domain/entities/Client';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

// Repository instance (singleton)
const agentClientsRepo = new AgentClientsRepository();
const agentClientsUseCases = new AgentClientsUseCases(agentClientsRepo);

export function useAgentClients() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const enabled = user?.role === 'AGENT';

  // ================== QUERIES ==================

  const {
    data: clientsData,
    isLoading: clientsLoading,
    error: clientsError,
    refetch: refetchClients
  } = useQuery({
    queryKey: ['agent', 'clients'],
    queryFn: () => agentClientsUseCases.getAgentClients(),
    enabled
  });

  const {
    data: stats,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['agent', 'clients', 'stats'],
    queryFn: () => agentClientsUseCases.getAgentClientStats(),
    enabled
  });

  // ================== MUTATIONS ==================

  const createClientMutation = useMutation({
    mutationFn: (data: CreateClientData) => agentClientsUseCases.createAgentClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', 'clients'] });
      queryClient.invalidateQueries({ queryKey: ['agent', 'clients', 'stats'] });
      toast.success('Cliente creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear cliente');
    }
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ clientId, data }: { clientId: number; data: UpdateClientData }) => 
      agentClientsUseCases.updateAgentClient(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', 'clients'] });
      queryClient.invalidateQueries({ queryKey: ['agent', 'clients', 'stats'] });
      toast.success('Cliente actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar cliente');
    }
  });

  const deleteClientMutation = useMutation({
    mutationFn: (clientId: number) => agentClientsUseCases.deleteAgentClient(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', 'clients'] });
      queryClient.invalidateQueries({ queryKey: ['agent', 'clients', 'stats'] });
      toast.success('Cliente archivado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al archivar cliente');
    }
  });

  const createFromLeadMutation = useMutation({
    mutationFn: (leadId: number) => agentClientsUseCases.createClientFromLead(leadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', 'clients'] });
      queryClient.invalidateQueries({ queryKey: ['agent', 'clients', 'stats'] });
      toast.success('Lead convertido a cliente exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al convertir lead');
    }
  });

  const addInteractionMutation = useMutation({
    mutationFn: ({ clientId, data }: { clientId: number; data: CreateInteractionData }) => 
      agentClientsUseCases.addClientInteraction(clientId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agent', 'clients', variables.clientId, 'interactions'] });
      queryClient.invalidateQueries({ queryKey: ['agent', 'clients'] });
      toast.success('Interacción agregada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al agregar interacción');
    }
  });

  // ================== HELPERS ==================

  const getClientDetail = (clientId: number) => {
    return useQuery({
      queryKey: ['agent', 'clients', clientId],
      queryFn: () => agentClientsUseCases.getAgentClientDetail(clientId),
      enabled: enabled && !!clientId
    });
  };

  const getClientInteractions = (clientId: number) => {
    return useQuery({
      queryKey: ['agent', 'clients', clientId, 'interactions'],
      queryFn: () => agentClientsUseCases.getClientInteractions(clientId),
      enabled: enabled && !!clientId
    });
  };

  return {
    // Data
    clients: clientsData?.content || [],
    totalClients: clientsData?.totalElements || 0,
    totalPages: clientsData?.totalPages || 0,
    stats,
    
    // Loading states
    isLoading: clientsLoading || statsLoading,
    isCreating: createClientMutation.isPending,
    isUpdating: updateClientMutation.isPending,
    isDeleting: deleteClientMutation.isPending,
    isConverting: createFromLeadMutation.isPending,
    isAddingInteraction: addInteractionMutation.isPending,
    
    // Actions
    createClient: createClientMutation.mutate,
    updateClient: updateClientMutation.mutate,
    deleteClient: deleteClientMutation.mutate,
    createClientFromLead: createFromLeadMutation.mutate,
    addInteraction: addInteractionMutation.mutate,
    getClientDetail,
    getClientInteractions,
    refetchClients,
    
    // Error
    error: clientsError,
    
    // Utilities
    getAvailableStatuses: () => agentClientsUseCases.getAvailableStatuses(),
    getAvailableInteractionTypes: () => agentClientsUseCases.getAvailableInteractionTypes(),
    getAvailableTemperatures: () => agentClientsUseCases.getAvailableTemperatures()
  };
}
