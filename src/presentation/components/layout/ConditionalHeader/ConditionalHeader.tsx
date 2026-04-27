/**
 * Conditional Header Component
 * Muestra el header principal solo si no estamos en el perfil de administrador
 * Sigue principios de arquitectura limpia y responsabilidad unica
 */

'use client';

import { usePathname } from 'next/navigation';
import { Header } from '../Header/Header';

export function ConditionalHeader() {
  const pathname = usePathname();
  
  // No mostrar header en rutas de administrador
  const isAdminRoute = pathname?.startsWith('/admin');
  
  if (isAdminRoute) {
    return null;
  }
  
  return <Header />;
}
