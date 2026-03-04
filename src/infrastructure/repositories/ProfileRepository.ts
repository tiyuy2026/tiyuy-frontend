import { IProfileRepository } from '@/core/domain/repositories';
import { ProfileType } from '@/core/domain/entities';

export class ProfileRepository implements IProfileRepository {
  async selectProfile(userId: string, profileType: ProfileType): Promise<void> {
    // Guardar en localStorage temporalmente
    // El perfil real se guarda al completar registro
    if (typeof window !== 'undefined') {
      localStorage.setItem('tiyuy-selected-profile', profileType);
    }
  }

  async getUserProfile(userId: string): Promise<ProfileType | null> {
    if (typeof window !== 'undefined') {
      const profile = localStorage.getItem('tiyuy-selected-profile');
      return profile as ProfileType | null;
    }
    return null;
  }
}
