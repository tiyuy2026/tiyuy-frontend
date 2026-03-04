// src/presentation/components/property/TrackPropertyView.tsx
'use client';

import { useEffect } from 'react';
import { AnalyticsRepository } from '@/infrastructure/repositories/AnalyticsRepository';

interface TrackPropertyViewProps {
  propertyId: number;
}

export function TrackPropertyView({ propertyId }: TrackPropertyViewProps) {
  useEffect(() => {
    const analyticsRepo = new AnalyticsRepository();
    
    // Obtener/crear sessionId única
    let sessionId = sessionStorage.getItem('tiyuy_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      sessionStorage.setItem('tiyuy_session_id', sessionId);
    }

    // Detectar dispositivo
    const getDeviceType = (): 'DESKTOP' | 'MOBILE' | 'TABLET' => {
      const width = window.innerWidth;
      if (width < 768) return 'MOBILE';
      if (width < 1024) return 'TABLET';
      return 'DESKTOP';
    };

    // Registrar vista ANONIMA (no necesita auth)
    analyticsRepo.trackView(propertyId, {
      sessionId,
      referrer: document.referrer || 'direct',
      userAgent: navigator.userAgent.slice(0, 200), // limitar tamaño
      deviceType: getDeviceType(),
    }).catch((err) => {
      console.error('Error tracking view:', err);
    });
  }, [propertyId]);

  return null; // Componente invisible
}
