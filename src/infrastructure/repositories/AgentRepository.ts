import { axiosClient } from '../api/axios-client';
import { IAgentRepository } from '@/core/domain/repositories/IAgentRepository';
import { Agent, AgentDashboard, PublicAgentProfile, UpdateAgentProfileRequest } from '@/core/domain/entities/Agent';

const BASE_URL = '/api/agent';

export class AgentRepository implements IAgentRepository {
  async getProfile(): Promise<Agent> {
    const response = await axiosClient.get(`${BASE_URL}/profile`);
    return this.mapToAgent(response.data);
  }

  async updateProfile(data: UpdateAgentProfileRequest): Promise<Agent> {
    const response = await axiosClient.put(`${BASE_URL}/profile`, data);
    return this.mapToAgent(response.data);
  }

  async getPublicProfile(slug: string): Promise<PublicAgentProfile> {
    const response = await axiosClient.get(`${BASE_URL}/${slug}`);
    return response.data;
  }

  async getDashboard(): Promise<AgentDashboard> {
    const response = await axiosClient.get(`${BASE_URL}/dashboard`);
    return response.data;
  }

  private mapToAgent(data: any): Agent {
    return {
      userId: data.userId,
      basicInfo: data.basicInfo || {
        email: '',
        phone: '',
      },
      professionalInfo: data.professionalInfo,
      verification: data.verification,
      metrics: data.metrics,
      publicProfile: data.publicProfile || {
        languages: [],
        serviceAreas: [],
      },
    };
  }
}
