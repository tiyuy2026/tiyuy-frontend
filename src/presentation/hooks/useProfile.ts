import { useRouter } from 'next/navigation';
import { useProfileStore } from '../store/profileStore';
import { ProfileRepository } from '@/infrastructure/repositories';
import { UserRole } from '@/core/domain/entities';  // ← UserRole (no ProfileType)
import { useAuthStore } from '../store/authStore';

const profileRepository = new ProfileRepository();

export const useProfile = () => {
  const router = useRouter();
  const { selectedProfile, isProfileSelected, selectProfile: selectProfileStore } = useProfileStore();
  const { user } = useAuthStore();

  const selectProfile = async (profile: UserRole) => {
    // Para nuevos usuarios, solo guardamos el perfil seleccionado en el store
    // La llamada al backend se hará después del registro
    selectProfileStore(profile);

    // Record con UserRole exactos
    const profileRoutes: Record<UserRole, string> = {
      USER: '/register/user',
      AGENT: '/register/agent',
      DEVELOPER: '/register/developer',
      ADMIN: '/register/admin',
      SUPER_ADMIN: '/register/admin',
      SUPPORT: '/register/admin',
    };

    router.push(profileRoutes[profile]);
  };

  return {
    selectedProfile,
    isProfileSelected,
    selectProfile,
  };
};
