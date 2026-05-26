'use client';

import { useState, useEffect } from 'react';
import { Property } from '@/core/domain/entities/Property';
import { PropertyGallery } from '../PropertyGallery/PropertyGallery';
import { PropertyQuickInfo } from './PropertyQuickInfo';
import { PropertyLocation } from './PropertyLocation';
import { ContactForm } from '../../shared/ContactForm/ContactForm';
import { WhatsAppButton } from './WhatsAppButton';
import { FavoriteButton } from '../../shared/FavoriteButton/FavoriteButton';
import { ShareButton } from '../../shared/ShareButton/ShareButton';
import { SimilarProperties } from '../SimilarProperties';
import { PersonalizedRecommendations } from '../PersonalizedRecommendations';
import { FeaturePropertyButton } from './FeaturePropertyButton';
import { Star } from 'lucide-react';
import { StarRating } from './StarRating';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { authStorage } from '@/infrastructure/storage/auth-storage';

interface PropertyDetailProps {
  property: Property;
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'Departamento',
  HOUSE: 'Casa',
  LAND: 'Terreno',
  OFFICE: 'Oficina',
  COMMERCIAL: 'Local Comercial',
  ROOM: 'Habitación',
};

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  SALE: 'Venta',
  RENT: 'Alquiler',
};

export function PropertyDetail({ property }: PropertyDetailProps) {
  // Trackear vista en CRM automáticamente
  useEffect(() => {
    if (!property.id) return;
    const trackView = async () => {
      try {
        const token = authStorage.getToken();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        await fetch(`/api/properties/${property.id}/view`, { method: 'POST', headers });
      } catch { /* silently fail */ }
    };
    trackView();
  }, [property.id]);

  const [rating, setRating] = useState<{ averageRating: number; totalRatings: number } | null>(null);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const res = await fetch(`/api/properties/${property.id}/rating`);
        if (res.ok) {
          const data = await res.json();
          setRating(data);
        }
      } catch {
        // Silently fail
      }
    };
    fetchRating();
  }, [property.id]);

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'USD' ? 'US$' : 'S/';
    return `${symbol} ${price.toLocaleString('es-PE')}`;
  };

  const propertyTypeLabel = PROPERTY_TYPE_LABELS[property.type] || property.type;
  const transactionLabel  = TRANSACTION_TYPE_LABELS[property.transactionType] || property.transactionType;

  const locationLine = [
    property.location?.fullAddress,
    property.location?.district,
    property.location?.province,
  ].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="w-full px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ════════════════════════════════════════
              COLUMNA PRINCIPAL  (2 / 3)
          ════════════════════════════════════════ */}
          <div className="lg:col-span-8 space-y-4">

            {/* ── Botones encima de galería ── */}
            <div className="flex items-center justify-end gap-1">
              <FavoriteButton propertyId={property.id} variant="topbar" />
              <ShareButton variant="topbar" />
            </div>

            {/* 1. GALERÍA */}
            <div className="rounded-2xl overflow-hidden bg-white shadow-sm -mt-2">
              <PropertyGallery media={property.media} coverPhotoUrl={property.coverPhotoUrl} />
            </div>

            {/* 2. TIPO · PRECIO · TÍTULO · DIRECCIÓN · STATS */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm text-gray-400">
                {propertyTypeLabel}
                {property.totalArea ? ` · ${property.totalArea} m²` : ''}
                {property.bedrooms  ? ` · ${property.bedrooms} dormitorio${property.bedrooms > 1 ? 's' : ''}` : ''}
              </p>

              <div className="mt-2 flex items-baseline gap-3 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {transactionLabel}&nbsp;{formatPrice(property.price, property.currency)}
                  {property.transactionType === 'RENT' && (
                    <span className="text-base font-normal text-gray-400 ml-1">/ mes</span>
                  )}
                </h2>
                {property.pricePerSqm && (
                  <span className="text-sm text-gray-400">
                    · {formatPrice(property.pricePerSqm, property.currency)} / m²
                  </span>
                )}
                {property.isNegotiable && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
                     Negociable
                  </span>
                )}
              </div>

              <h1 className="mt-3 text-lg font-semibold text-gray-800 leading-snug">
                {property.title}
              </h1>

              {locationLine && (
                <p className="mt-2 text-sm text-gray-500 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-teal-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {locationLine}
                </p>
              )}

              {/* Stats — UNA SOLA VEZ aquí */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <PropertyQuickInfo property={property} />
              </div>
            </div>

            {/* 3. DESCRIPCIÓN — ANTES del mapa, siempre visible */}
            {property.description && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Descripción de la propiedad
                </h2>
                <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                  {property.description}
                </p>
              </div>
            )}
            
            {/* Debug: mostrar si hay descripción */}
            {!property.description && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-yellow-800">
                 No hay descripción disponible para esta propiedad
              </div>
            )}

            {/* 4. MAPA — después de la descripción */}
            <PropertyLocation location={property.location} propertyId={property.id} />

            {/* 5. SIMILARES */}
            <SimilarProperties currentProperty={property} />

            {/* 6. RECOMENDACIONES */}
            <PersonalizedRecommendations 
              title="Más recomendaciones para ti" 
              properties={[]}
              currentPropertyId={property.id}
              currentTransactionType={property.transactionType}
              currentDistrict={property.location?.district}
              currentProvince={property.location?.province}
              currentType={property.type}
            />
          </div>

          {/* ════════════════════════════════════════
              SIDEBAR  (1 / 3)  — sticky
          ════════════════════════════════════════ */}
          <div className="lg:col-span-4">
            <div className="sticky top-4 space-y-4">

              {/* Contactar */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                <div className="px-5 pt-5 pb-3 border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-900">Contacta al anunciante</h3>
                </div>
                <div className="px-5 py-4">
                  <ContactForm propertyId={property.id} ownerId={property.owner.id} />
                </div>
                <div className="px-5 pb-5">
                  <WhatsAppButton property={property} className="w-full" />
                </div>
              </div>

              {/* Agente */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {property.owner.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{property.owner.name}</p>
                    <p className="text-xs text-gray-500">{property.owner.role}</p>
                  </div>
                  {(property.owner as any).phone && (
                    <a
                      href={`tel:${(property.owner as any).phone}`}
                      className="text-xs text-teal-600 hover:text-teal-700 font-semibold border border-teal-200 rounded-lg px-2.5 py-1.5 whitespace-nowrap transition-colors"
                    >
                      Ver teléfono
                    </a>
                  )}
                </div>
              </div>

              {/* Estadísticas */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Estadísticas</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { v: property.viewsCount    ?? 0, l: 'Visitas'   },
                    { v: property.favoritesCount ?? 0, l: 'Favoritos' },
                    { v: property.contactsCount  ?? 0, l: 'Contactos' },
                  ].map(({ v, l }) => (
                    <div key={l} className="bg-gray-50 rounded-xl p-3">
                      <div className="text-xl font-bold text-gray-900">{v}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{l}</div>
                    </div>
                  ))}
                </div>

                {/* Rating promedio */}
                {rating && rating.totalRatings > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.round(rating.averageRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{rating.averageRating.toFixed(1)}</span>
                      <span className="text-xs text-gray-400">({rating.totalRatings} {rating.totalRatings === 1 ? 'reseña' : 'reseñas'})</span>
                    </div>
                  </div>
                )}

                <p className="mt-3 text-xs text-gray-400 flex items-center gap-1">
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Publicado el {new Date(property.createdAt).toLocaleDateString('es-PE', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              </div>

              {/* ⭐ CALIFICAR PROPIEDAD */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Calificar propiedad</h3>
                <div className="flex flex-col items-center gap-2">
                  <StarRating
                    propertyId={property.id}
                    size="md"
                    showValue
                    onRatingSaved={() => {
                      // Recargar rating después de calificar
                      fetch(`/api/properties/${property.id}/rating`).then(res => {
                        if (res.ok) res.json().then(data => setRating(data));
                      }).catch(() => {});
                    }}
                  />
                  {rating && rating.totalRatings > 0 && (
                    <p className="text-xs text-gray-400">
                      Promedio: {rating.averageRating.toFixed(1)} ({rating.totalRatings} {rating.totalRatings === 1 ? 'voto' : 'votos'})
                    </p>
                  )}
                </div>
              </div>

              {/* ✅ BOTÓN DESTACAR PROPIEDAD */}
              <FeaturePropertyButton 
                propertyId={property.id}
                ownerId={property.owner.id}
                isFeatured={property.isFeatured}
                status={property.status}
              />

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}