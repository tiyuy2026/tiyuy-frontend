import { 
  IAgentClientsRepository, 
  PaginatedResponse 
} from '../repositories/IAgentClientsRepository';
import { 
  Client, 
  ClientInteraction, 
  ClientStats,
  CreateClientData,
  UpdateClientData,
  CreateInteractionData,
  ClientFilter,
  ClientStatus,
  ClientInteractionType
} from '../entities/Client';

export class AgentClientsUseCases {
  constructor(private repository: IAgentClientsRepository) {}

  // ================== QUERY USE CASES ==================

  async getAgentClients(filter?: ClientFilter): Promise<PaginatedResponse<Client>> {
    return this.repository.getClients(filter);
  }

  async getAgentClientDetail(clientId: number): Promise<Client> {
    if (!clientId || clientId <= 0) {
      throw new Error('ID de cliente inválido');
    }
    return this.repository.getClientDetail(clientId);
  }

  async getAgentClientStats(): Promise<ClientStats> {
    return this.repository.getClientStats();
  }

  async getClientInteractions(clientId: number): Promise<ClientInteraction[]> {
    if (!clientId || clientId <= 0) {
      throw new Error('ID de cliente inválido');
    }
    return this.repository.getClientInteractions(clientId);
  }

  // ================== COMMAND USE CASES ==================

  async createAgentClient(data: CreateClientData): Promise<Client> {
    // Validaciones de negocio
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('El nombre del cliente es requerido');
    }

    if (data.name.length > 100) {
      throw new Error('El nombre no puede exceder 100 caracteres');
    }

    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error('Email inválido');
      }
    }

    if (data.dni && data.dni.length !== 8) {
      throw new Error('El DNI debe tener 8 dígitos');
    }

    if (data.budgetMin && data.budgetMax && data.budgetMin > data.budgetMax) {
      throw new Error('El presupuesto mínimo no puede ser mayor al máximo');
    }

    // Validar fecha de seguimiento si está activo
    if (data.status === 'ACTIVE' && data.nextFollowUp) {
      const followUpDate = new Date(data.nextFollowUp);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (followUpDate < today) {
        throw new Error('La fecha de seguimiento no puede ser menor a hoy para clientes activos');
      }
    }

    return this.repository.createClient({
      ...data,
      status: data.status || 'ACTIVE',
      currency: data.currency || 'PEN'
    });
  }

  async updateAgentClient(clientId: number, data: UpdateClientData): Promise<Client> {
    if (!clientId || clientId <= 0) {
      throw new Error('ID de cliente inválido');
    }

    // Validaciones
    if (data.name !== undefined) {
      if (data.name.trim().length === 0) {
        throw new Error('El nombre no puede estar vacío');
      }
      if (data.name.length > 100) {
        throw new Error('El nombre no puede exceder 100 caracteres');
      }
    }

    if (data.email !== undefined && data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error('Email inválido');
      }
    }

    if (data.budgetMin && data.budgetMax && data.budgetMin > data.budgetMax) {
      throw new Error('El presupuesto mínimo no puede ser mayor al máximo');
    }

    // Validar fecha de seguimiento
    if (data.nextFollowUp) {
      const followUpDate = new Date(data.nextFollowUp);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (followUpDate < today) {
        throw new Error('La fecha de seguimiento no puede ser menor a hoy');
      }
    }

    return this.repository.updateClient(clientId, data);
  }

  async deleteAgentClient(clientId: number): Promise<void> {
    if (!clientId || clientId <= 0) {
      throw new Error('ID de cliente inválido');
    }
    return this.repository.deleteClient(clientId);
  }

  async createClientFromLead(leadId: number): Promise<Client> {
    if (!leadId || leadId <= 0) {
      throw new Error('ID de lead inválido');
    }
    return this.repository.createClientFromLead(leadId);
  }

  async addClientInteraction(clientId: number, data: CreateInteractionData): Promise<ClientInteraction> {
    if (!clientId || clientId <= 0) {
      throw new Error('ID de cliente inválido');
    }

    // Validaciones
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('El título de la interacción es requerido');
    }

    if (data.title.length > 200) {
      throw new Error('El título no puede exceder 200 caracteres');
    }

    if (!data.type) {
      throw new Error('El tipo de interacción es requerido');
    }

    if (!data.interactionDate) {
      throw new Error('La fecha de interacción es requerida');
    }

    return this.repository.addInteraction(clientId, data);
  }

  // ================== UTILIDADES ==================

  getAvailableStatuses(): { value: ClientStatus; label: string }[] {
    return [
      { value: 'ACTIVE', label: 'Activo' },
      { value: 'INACTIVE', label: 'Inactivo' },
      { value: 'CLOSED_WON', label: 'Cerrado - Ganado' },
      { value: 'CLOSED_LOST', label: 'Cerrado - Perdido' },
    ];
  }

  getAvailableInteractionTypes(): { value: ClientInteractionType; label: string }[] {
    return [
      { value: 'CALL', label: 'Llamada' },
      { value: 'EMAIL', label: 'Email' },
      { value: 'MEETING', label: 'Reunión' },
      { value: 'WHATSAPP', label: 'WhatsApp' },
      { value: 'VISIT', label: 'Visita' },
      { value: 'NOTE', label: 'Nota' },
      { value: 'STATUS_CHANGE', label: 'Cambio de estado' },
      { value: 'FOLLOW_UP', label: 'Seguimiento' },
    ];
  }

  getAvailableTemperatures(): { value: string; label: string; color: string }[] {
    return [
      { value: 'HOT', label: 'Caliente', color: 'red' },
      { value: 'WARM', label: 'Templado', color: 'yellow' },
      { value: 'COLD', label: 'Frío', color: 'blue' },
    ];
  }
}
