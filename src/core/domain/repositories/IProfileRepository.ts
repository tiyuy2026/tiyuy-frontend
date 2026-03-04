import { ProfileType } from '../entities';

export interface IProfileRepository {
  selectProfile(userId: string, profileType: ProfileType): Promise<void>;
  getUserProfile(userId: string): Promise<ProfileType | null>;
}
