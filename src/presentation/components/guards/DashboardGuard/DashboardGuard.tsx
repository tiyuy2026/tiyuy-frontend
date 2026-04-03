'use client';

import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/presentation/store/authStore';
import { useActiveSubscription } from '@/presentation/hooks/useFinance';
import { useRouter } from 'next/navigation';

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { data: activeSubscription } = useActiveSubscription();
  const router = useRouter();

  // Si no es DEVELOPER, permitir acceso (el ProtectedRoute ya maneja esto)
  if (!user || user.role !== 'DEVELOPER') {
    return <>{children}</>;
  }

  // Si no hay suscripción, permitir acceso (el backend debe manejar el trial)
  if (!activeSubscription) {
    return <>{children}</>;
  }

  // Verificar si la suscripción está expirada
  const now = new Date();
  const expiresAt = new Date(activeSubscription.expiresAt);
  const isExpired = now > expiresAt;

  // Si está expirada y está en una ruta protegida, redirigir a página de bloqueo
  if (isExpired && pathname?.startsWith('/my-projects')) {
    router.push('/dashboard/trial-expired');
    return null;
  }

  // Si no está expirada, permitir acceso normal
  return <>{children}</>;
}
