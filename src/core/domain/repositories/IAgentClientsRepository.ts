import { 
  Client, 
  ClientInteraction, 
  ClientStats, 
  CreateClientData, 
  UpdateClientData,
  CreateInteractionData,
  ClientFilter,
  ClientStatus
} from '../entities/Client';

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface IAgentClientsRepository {
  // Query methods
  getClients(filter?: ClientFilter): Promise<PaginatedResponse<Client>>;
  getClientDetail(clientId: number): Promise<Client>;
  getClientStats(): Promise<ClientStats>;
  
  // Command methods
  createClient(data: CreateClientData): Promise<Client>;
  updateClient(clientId: number, data: UpdateClientData): Promise<Client>;
  deleteClient(clientId: number): Promise<void>;
  createClientFromLead(leadId: number): Promise<Client>;
  
  // Interactions
  getClientInteractions(clientId: number): Promise<ClientInteraction[]>;
  addInteraction(clientId: number, data: CreateInteractionData): Promise<ClientInteraction>;
}
