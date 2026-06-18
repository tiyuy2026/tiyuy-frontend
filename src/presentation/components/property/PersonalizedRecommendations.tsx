'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PropertySummary } from '@/core/domain/entities/Property';
import { PropertyCard } from './PropertyCard/PropertyCard';
import { PropertyRepository } from '@/infrastructure/repositories/PropertyRepository';
import { mapSpanishPropertyType, mapTransactionType } from '@/core/application/mappers/PropertyTypeMapper';
import { Image } from 'lucide-react';

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
        let filters: any = { page: 0, size: 5, sort: 'createdAt,desc' };

        if (lastSearchRaw) {
          try {
            const lastSearch = JSON.parse(lastSearchRaw);
            if (lastSearch.transactionType) filters.transactionType = mapTransactionType(lastSearch.transactionType);
            if (lastSearch.type) filters.type = mapSpanishPropertyType(lastSearch.type);
            if (lastSearch.district) filters.district = lastSearch.district;
          } catch (e) {
            // ignore
          }
        }

        // Si no hay búsqueda previa, usar datos de la propiedad actual
        if (!filters.transactionType && currentTransactionType) {
          filters.transactionType = currentTransactionType;
        }
        if (!filters.type && currentType) {
          filters.type = mapSpanishPropertyType(currentType);
        }
        
        // Ubicación: usar SOLO un campo (district o province) para evitar
        // errores de JOIN duplicado en el backend (PropertySpecification)
        if (!filters.district && currentDistrict) {
          filters.district = currentDistrict;
        } else if (!filters.district && !filters.province && currentProvince) {
          filters.province = currentProvince;
        }
        // Si ya tenemos district del localStorage, NO agregar province

        const result = await propertyRepo.search(filters);
        
        // Filtrar la propiedad actual si está presente
        let filtered = result.properties || [];
        if (currentPropertyId) {
          filtered = filtered.filter(p => p.id !== currentPropertyId);
        }

        if (filtered.length > 0) {
          setRecommendations(filtered.slice(0, 5));
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((_, index) => (
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {recommendations.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
        
        {/* Tarjeta Ver todo */}
        <Link
          href="/properties"
          className="flex flex-col items-center justify-center min-h-[280px] w-full bg-white hover:bg-gray-50 rounded-2xl border border-gray-200 transition-all hover:shadow-md group"
        >
          <div className="relative w-28 h-20 mb-4 group-hover:scale-105 transition-transform duration-300">
            <div className="absolute top-0 left-0 w-16 h-16 bg-gray-200 rounded-xl border-2 border-white shadow-sm -rotate-6 transform origin-bottom-left z-10 overflow-hidden">
              <div className="w-full h-full bg-blue-100/50"></div>
            </div>
            <div className="absolute top-2 right-0 w-16 h-16 bg-gray-200 rounded-xl border-2 border-white shadow-sm rotate-6 transform origin-bottom-right z-20 overflow-hidden">
              <div className="w-full h-full bg-green-100/50"></div>
            </div>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-16 bg-gray-100 rounded-xl border-2 border-white shadow-md z-30 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <Image className="w-7 h-7 text-gray-400" />
              </div>
            </div>
          </div>
          <span className="text-[#003B95] font-semibold text-base group-hover:text-blue-800 transition-colors">Ver todo</span>
        </Link>
      </div>
    </div>
  );
}
