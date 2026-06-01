'use client';

import { useState, useEffect } from 'react';
import { publicApiClient } from '@/infrastructure/api/axios-client';

export interface PublicBanner {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  description?: string;
  placement: string;
  displayMode?: 'SOLO_BANNER' | 'INTEGRATED';
  displayOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

/**
 * Hook para obtener banners públicos activos por ubicación.
 * Se usa en el carrusel del Hero y otras secciones públicas.
 * Los banners se gestionan desde admin/campaigns/banners.
 */
export function usePublicBanners(placement: string = 'SLIDER') {
  const [banners, setBanners] = useState<PublicBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchBanners = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await publicApiClient.get(
          `/v1/public/marketing/banners/placement/${placement}`
        );
        if (mounted) {
          // Ordenar por displayOrder
          const sorted = (response.data || []).sort(
            (a: PublicBanner, b: PublicBanner) => a.displayOrder - b.displayOrder
          );
          console.log(`[usePublicBanners] Placement "${placement}": ${sorted.length} banners encontrados`, sorted);
          setBanners(sorted);
        }
      } catch (err) {
        console.error(`Error fetching public banners for placement ${placement}:`, err);
        if (mounted) {
          setError('Error al cargar banners');
          setBanners([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchBanners();

    return () => {
      mounted = false;
    };
  }, [placement]);

  return { banners, loading, error };
}
