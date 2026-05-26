'use client';

import { useState, useEffect } from 'react';
import { PropertySummary } from '@/core/domain/entities/Property';
import { PropertyCard } from './PropertyCard/PropertyCard';
import { PropertyRepository } from '@/infrastructure/repositories/PropertyRepository';

interface RecommendationProps {
  title: string;
  properties: any[];
  currentPropertyId?: number;
  currentTransactionType?: string;
  currentDistrict?: string;
  currentProvince?: string;
  currentType?: string;
}

export function PersonalizedRecommendations({ 
  title, 
  properties: _externalProperties, 
  currentPropertyId,
  currentTransactionType,
  currentDistrict,
  currentProvince,
  currentType
}: RecommendationProps) {
  const [recommendations, setRecommendations] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [noResults, setNoResults] = useState(false);
  const propertyRepo = new PropertyRepository();

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        setNoResults(false);

        // Intentar cargar desde localStorage (última búsqueda del usuario)
        const lastSearchRaw = localStorage.getItem('lastSearch');
        let filters: any = { page: 0, size: 6, sort: 'createdAt,desc' };

        if (lastSearchRaw) {
          try {
            const lastSearch = JSON.parse(lastSearchRaw);
            if (lastSearch.transactionType) filters.transactionType = lastSearch.transactionType;
            if (lastSearch.type) filters.type = lastSearch.type;
            if (lastSearch.district) filters.district = lastSearch.district;
          } catch (e) {
            // ignore
          }
        }

        // Si no hay búsqueda previa, usar datos de la propiedad actual
        if (!filters.transactionType && currentTransactionType) {
          filters.transactionType = currentTransactionType;
        }
        if (!filters.district && currentDistrict) {
          filters.district = currentDistrict;
        }
        if (!filters.province && currentProvince) {
          filters.province = currentProvince;
        }
        if (!filters.type && currentType) {
          filters.type = currentType;
        }

        const result = await propertyRepo.search(filters);
        
        // Filtrar la propiedad actual si está presente
        let filtered = result.properties || [];
        if (currentPropertyId) {
          filtered = filtered.filter(p => p.id !== currentPropertyId);
        }

        if (filtered.length > 0) {
          setRecommendations(filtered.slice(0, 6));
        } else {
          setNoResults(true);
        }
      } catch (error) {
        console.error('Error loading recommendations:', error);
        setNoResults(true);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [currentPropertyId, currentTransactionType, currentDistrict, currentProvince, currentType]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="w-full aspect-square bg-gray-200 rounded-xl mb-3" />
              <div className="space-y-2 p-1">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (noResults || recommendations.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-500 text-sm text-center py-8">
          No tenemos recomendaciones disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-base font-bold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
