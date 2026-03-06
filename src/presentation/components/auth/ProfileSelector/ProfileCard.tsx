'use client';
import React from 'react';
import { UserRole } from '@/core/domain/entities';
import { Card, Badge } from '@/presentation/components/ui';


// Iconos SVG para cada perfil
const ICONS: Record<string, React.ReactElement> = {
  USER: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  AGENT: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  DEVELOPER: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  ADMIN: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
};


// Config local (no PROFILES_CONFIG)
const ROLES_CONFIG: Record<UserRole, any> = {
  USER: {
    title: 'Usuario',
    description: 'Busca tu hogar ideal',
    icon: 'home',
    color: 'bg-blue-500',
    features: ['Guardar favoritos', 'Contactar agentes', 'Alertas']
  },
  AGENT: {
    title: 'Agente Inmobiliario',
    description: 'Publica propiedades y gestiona clientes',
    icon: 'user-group',
    color: 'bg-green-500',
    features: ['Publicar propiedades', 'Gestionar leads', 'Dashboard ventas']
  },
  DEVELOPER: {
    title: 'Desarrollador',
    description: 'Proyectos ilimitados - Trial 30 días',
    icon: 'building-office',
    color: 'bg-purple-500',
    features: ['999 publicaciones', 'Proyectos ilimitados', 'Trial gratis']
  },
  ADMIN: {
    title: 'Administrador',
    description: 'Gestión completa de la plataforma',
    icon: 'shield-check',
    color: 'bg-red-500',
    features: ['Gestión usuarios', 'Aprobaciones', 'Analíticas']
  }
};


interface ProfileCardProps {
  profile: UserRole;  // ← UserRole
  isSelected?: boolean;
  onClick: (profile: UserRole) => void;
}


export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, isSelected, onClick }) => {
  const config = ROLES_CONFIG[profile];


  return (
    <Card hover onClick={() => onClick(profile)} className={`${isSelected ? 'ring-4 ring-blue-500 ring-offset-2' : ''} p-4 sm:p-6 lg:p-8 h-full transition-all duration-300 hover:scale-105 hover:shadow-2xl`}>
      {profile === 'DEVELOPER' && (
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
          <Badge variant="warning" size="sm">30 días gratis</Badge>
        </div>
      )}

      <div className="flex items-center justify-center mb-4 sm:mb-6">
        {profile === 'USER' && (
          <svg className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        )}
        {profile === 'AGENT' && (
          <svg className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )}
        {profile === 'DEVELOPER' && (
          <svg className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        )}
        {profile === 'ADMIN' && (
          <svg className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        )}
      </div>

      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">{config.title}</h3>
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">{config.description}</p>
      
      <ul className="space-y-2 sm:space-y-3">
        {config.features.map((feature: string, index: number) => (
          <li key={index} className="flex items-center gap-2 sm:gap-3 text-gray-700">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs sm:text-sm font-medium">{feature}</span>
          </li>
        ))}
      </ul>

      {isSelected && (
        <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
    </Card>
  );
};