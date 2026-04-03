import { axiosClient } from '../api/axios-client';
import { 
  IAgentClientsRepository, 
  PaginatedResponse 
} from '@/core/domain/repositories/IAgentClientsRepository';
import { 
  Client, 
  ClientInteraction, 
  ClientStats,
  CreateClientData,
  UpdateClientData,
  CreateInteractionData,
  ClientFilter
} from '@/core/domain/entities/Client';

const BASE_URL = '/api/agent/clients';

export class AgentClientsRepository implements IAgentClientsRepository {
  
  // ================== QUERY METHODS ==================
  
  async getClients(filter?: ClientFilter): Promise<PaginatedResponse<Client>> {
    const params = new URLSearchParams();
    
    if (filter?.status) params.append('status', filter.status);
    if (filter?.archived !== undefined) params.append('archived', String(filter.archived));
    if (filter?.page !== undefined) params.append('page', String(filter.page));
    if (filter?.size !== undefined) params.append('size', String(filter.size));
    
    const response = await axiosClient.get(`${BASE_URL}?${params.toString()}`);
    return response.data;
  }

  async getClientDetail(clientId: number): Promise<Client> {
    const response = await axiosClient.get(`${BASE_URL}/${clientId}`);
    return response.data;
  }

  async getClientStats(): Promise<ClientStats> {
    const response = await axiosClient.get(`${BASE_URL}/stats`);
    return response.data;
  }

  // ================== COMMAND METHODS ==================

  async createClient(data: CreateClientData): Promise<Client> {
    const response = await axiosClient.post(BASE_URL, data);
    return response.data;
  }

  async updateClient(clientId: number, data: UpdateClientData): Promise<Client> {
    const response = await axiosClient.put(`${BASE_URL}/${clientId}`, data);
    return response.data;
  }

  async deleteClient(clientId: number): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/${clientId}`);
  }

  async createClientFromLead(leadId: number): Promise<Client> {
    const response = await axiosClient.post(`${BASE_URL}/from-lead/${leadId}`);
    return response.data;
  }

  // ================== INTERACTIONS ==================

  async getClientInteractions(clientId: number): Promise<ClientInteraction[]> {
    const response = await axiosClient.get(`${BASE_URL}/${clientId}/interactions`);
    return response.data;
  }

  async addInteraction(clientId: number, data: CreateInteractionData): Promise<ClientInteraction> {
    const response = await axiosClient.post(`${BASE_URL}/${clientId}/interactions`, data);
    return response.data;
  }
}
