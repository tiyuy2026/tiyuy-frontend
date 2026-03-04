'use client';
import { useEffect, useRef } from 'react';
import { useSearchTracking } from '@/presentation/hooks/useSearchTracking';

interface SearchTrackingProviderProps {
  children: React.ReactNode;
  searchData: {
    propertyType: string;
    transactionType: string;
    district: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    hasPrivateBathroom?: boolean;
  };
}

export function SearchTrackingProvider({ children, searchData }: SearchTrackingProviderProps) {
  const { trackSearch } = useSearchTracking();
  const previousSearchData = useRef(searchData);

  useEffect(() => {
    // Solo trackear si los datos de búsqueda realmente cambiaron
    const hasChanged = JSON.stringify(searchData) !== JSON.stringify(previousSearchData.current);
    
    if (hasChanged) {
      console.log('SearchTracking: Datos cambiaron, trackeando nueva búsqueda:', searchData);
      trackSearch(searchData);
      previousSearchData.current = searchData;
    }
  }, [searchData, trackSearch]);

  return <>{children}</>;
}
