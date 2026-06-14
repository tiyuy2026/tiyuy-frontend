/**
 * AdminRestrictionGuard
 * Blocks ADMIN and SUPPORT users in "User Mode" from accessing certain pages.
 * Shows a friendly message explaining why access is denied.
 * SUPER_ADMIN is never blocked.
 */
'use client';

import { useAdminRestrictions } from '@/presentation/hooks/useAdminRestrictions';
import { Shield, ShieldOff } from 'lucide-react';
import Link from 'next/link';

interface AdminRestrictionGuardProps {
  /** What feature is being blocked */
  feature: 'plans' | 'publish' | 'chat';
  children: React.ReactNode;
}

const featureMessages: Record<string, { title: string; description: string }> = {
  plans: {
    title: 'Planes no disponibles',
    description: 'Los administradores y soporte no pueden acceder a la sección de planes mientras están en modo usuario. Cambia a modo administrador para gestionar la plataforma.',
  },
  publish: {
    title: 'Publicación no disponible',
    description: 'Los administradores y soporte no pueden publicar propiedades o proyectos mientras están en modo usuario. Cambia a modo administrador para gestionar la plataforma.',
  },
  chat: {
    title: 'Chat no disponible',
    description: 'Los administradores y soporte no pueden acceder al chat mientras están en modo usuario. Cambia a modo administrador para gestionar la plataforma.',
  },
};

export function AdminRestrictionGuard({ feature, children }: AdminRestrictionGuardProps) {
  const { isRestricted } = useAdminRestrictions();

  // If not restricted, render children normally
  if (!isRestricted) {
    return <>{children}</>;
  }

  const message = featureMessages[feature];

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center">
          <ShieldOff className="w-10 h-10 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{message.title}</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">{message.description}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Ir al inicio
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
          >
            <Shield className="w-4 h-4" />
            Ir al panel de administración
          </Link>
        </div>
      </div>
    </div>
  );
}