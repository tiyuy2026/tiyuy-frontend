import { Agent, AgentDashboard, PublicAgentProfile, UpdateAgentProfileRequest } from '../entities/Agent';

export interface IAgentRepository {
  getProfile(): Promise<Agent>;
  updateProfile(data: UpdateAgentProfileRequest): Promise<Agent>;
  getPublicProfile(slug: string): Promise<PublicAgentProfile>;
  getDashboard(): Promise<AgentDashboard>;
}
