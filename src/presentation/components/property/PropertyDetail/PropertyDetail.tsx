'use client';

import { useState, useEffect } from 'react';
import { Property } from '@/core/domain/entities/Property';
import { PropertyGallery } from '../PropertyGallery/PropertyGallery';
import { PropertyQuickInfo } from './PropertyQuickInfo';
import { PropertyLocation } from './PropertyLocation';
import { PropertyComments } from './PropertyComments';
import { ContactForm } from '../../shared/ContactForm/ContactForm';
import { WhatsAppButton } from './WhatsAppButton';
import { FavoriteButton } from '../../shared/FavoriteButton/FavoriteButton';
import { ShareButton } from '../../shared/ShareButton/ShareButton';
import { SimilarProperties } from '../SimilarProperties';
import { PersonalizedRecommendations } from '../PersonalizedRecommendations';
import { FeaturePropertyButton } from './FeaturePropertyButton';
import { Star, MapPin, FileText, Calendar, Check } from 'lucide-react';
import { toast } from 'sonner';
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

function DescriptionSection({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  const words = description.split(/\s+/);
  const isLong = words.length > 50;
  const truncated = isLong ? words.slice(0, 50).join(' ') + '...' : description;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
        <FileText className="w-4 h-4 text-teal-600 flex-shrink-0" />
        Descripción de la propiedad
      </h2>
      <div className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
        {expanded ? description : truncated}
      </div>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-teal-600 hover:text-teal-700 font-semibold text-sm transition-colors"
        >
          {expanded ? 'Ver menos' : 'Ver más'}
        </button>
      )}
    </div>
  );
}

export function PropertyDetail({ property }: PropertyDetailProps) {
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

  const [selectedStars, setSelectedStars] = useState<number>(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const res = await fetch(`/api/properties/${property.id}/rating`);
        if (res.ok) {
          const data = await res.json();
          setRating(data);
        }
      } catch {
      }
    };
    fetchRating();
  }, [property.id]);

  const handleConfirmRating = async () => {
    if (selectedStars === 0) return;
    setIsSubmittingRating(true);

    try {
      const token = authStorage.getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/properties/${property.id}/rating`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ rating: selectedStars })
      });

      if (res.ok) {
        toast.success('¡Calificación guardada con éxito!');
        // Recargar el objeto de promedios
        const updatedRes = await fetch(`/api/properties/${property.id}/rating`);
        if (updatedRes.ok) {
          const updatedData = await updatedRes.json();
          setRating(updatedData);
        }
        setSelectedStars(0); 
      } else {
        toast.error('Hubo un problema al guardar tu calificación.');
      }
    } catch {
      toast.error('Error de conexión al calificar.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'USD' ? 'US$' : 'S/';
    return `${symbol} ${price.toLocaleString('es-PE')}`;
  };

  const propertyTypeLabel = PROPERTY_TYPE_LABELS[property.type] || property.type;
  const transactionLabel = TRANSACTION_TYPE_LABELS[property.transactionType] || property.transactionType;

  const locationLine = [
    property.location?.fullAddress,
    property.location?.district,
    property.location?.province,
  ].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="w-full px-8 xl:px-16 py-6">
        <div className="max-w-[1920px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

            <div className="lg:col-span-9 space-y-4">

              <div className="flex items-center justify-end gap-1">
                <FavoriteButton propertyId={property.id} variant="topbar" />
                <ShareButton variant="topbar" />
              </div>

              <div className="rounded-2xl overflow-hidden bg-white shadow-sm -mt-2">
                <PropertyGallery media={property.media} coverPhotoUrl={property.coverPhotoUrl} />
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="bg-blue-50 text-blue-700 border border-blue-100 text-xs font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-wide">
                        {propertyTypeLabel}
                      </span>
                      <span className="bg-gray-100 text-gray-600 border border-gray-200 text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide">
                        {transactionLabel}
                      </span>
                      {property.isNegotiable && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg uppercase tracking-wide">
                          Negociable
                        </span>
                      )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-4">
                      {property.title}
                    </h1>

                    <div className="flex items-baseline gap-3 flex-wrap mb-4">
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                        {formatPrice(property.price, property.currency)}
                        {property.transactionType === 'RENT' && (
                          <span className="text-lg font-medium text-gray-500 ml-1">/ mes</span>
                        )}
                      </h2>
                      {property.pricePerSqm && (
                        <span className="text-sm text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                          {formatPrice(property.pricePerSqm, property.currency)} / m²
                        </span>
                      )}
                    </div>

                    {locationLine && (
                      <p className="text-base text-gray-500 flex items-center gap-2 font-medium">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        {locationLine}
                      </p>
                    )}
                  </div>

                  {/* Rating superior */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-1">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${rating && i < Math.round(rating.averageRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    {rating && rating.totalRatings > 0 && (
                      <span className="text-xs text-gray-500">
                        {rating.averageRating.toFixed(1)} ({rating.totalRatings} {rating.totalRatings === 1 ? 'reseña' : 'reseñas'})
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <PropertyQuickInfo property={property} />
                </div>
              </div>

              {/* 3. DESCRIPCIÓN */}
              {property.description && (
                <DescriptionSection description={property.description} />
              )}

              {!property.description && (
                <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
                  <p className="text-gray-400 font-medium">El anunciante no ha proporcionado una descripción detallada.</p>
                </div>
              )}

              {/* 4. MAPA */}
              <PropertyLocation location={property.location} propertyId={property.id} />

              {/* 5. CONTACTO EN MÓVIL */}
              <div className="lg:hidden space-y-4">
                <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
                  <div className="px-6 pt-6 pb-4 border-b border-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">Contacta al anunciante</h3>
                  </div>
                  <div className="px-6 py-4">
                    <ContactForm propertyId={property.id} ownerId={property.owner.id} />
                  </div>
                  <div className="px-6 pb-6 pt-2">
                    <WhatsAppButton property={property} className="w-full" />
                  </div>
                </div>
              </div>

              {/* 6. COMENTARIOS DE LA ZONA */}
              <PropertyComments propertyId={property.id} location={property.location} />

              {/* 7. SIMILARES */}
              <SimilarProperties currentProperty={property} />

              {/* 8. RECOMENDACIONES */}
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
                SIDEBAR (1 / 3) — sticky
            ════════════════════════════════════════ */}
            <div className="lg:col-span-3">
              <div className="sticky top-4 space-y-4">

                {/* Contactar Escritorio */}
                <div className="hidden lg:block bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
                  <div className="px-6 pt-6 pb-4 border-b border-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">Contacta al anunciante</h3>
                  </div>
                  <div className="px-6 py-4">
                    <ContactForm propertyId={property.id} ownerId={property.owner.id} />
                  </div>
                  <div className="px-6 pb-6 pt-2">
                    <WhatsAppButton property={property} className="w-full" />
                  </div>
                </div>

                {/* Anunciante */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Anunciante</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-inner">
                      {property.owner.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-base truncate">{property.owner.name}</p>
                      <p className="text-sm text-gray-500">{property.owner.role}</p>
                    </div>
                    {(property.owner as any).phone && (
                      <a
                        href={`tel:${(property.owner as any).phone}`}
                        className="text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 font-bold rounded-lg px-3 py-2 whitespace-nowrap transition-colors"
                      >
                        Llamar
                      </a>
                    )}
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Estadísticas</h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { v: property.viewsCount ?? 0, l: 'Visitas' },
                      { v: property.favoritesCount ?? 0, l: 'Favoritos' },
                      { v: property.contactsCount ?? 0, l: 'Contactos' },
                    ].map(({ v, l }) => (
                      <div key={l} className="bg-gray-50 rounded-xl p-3">
                        <div className="text-xl font-bold text-gray-900">{v}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{l}</div>
                      </div>
                    ))}
                  </div>

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
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    Publicado el {new Date(property.createdAt).toLocaleDateString('es-PE', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Calificar propiedad</h3>
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const starValue = i + 1;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSelectedStars(starValue)}
                            className="transition-transform active:scale-95 p-0.5 hover:scale-110"
                          >
                            <Star
                              className={`w-7 h-7 transition-colors ${starValue <= selectedStars
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-200 hover:text-yellow-400'
                                }`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    {/* Si seleccionó estrellas, aparece el botón explícito de confirmación */}
                    {selectedStars > 0 && (
                      <div className="w-full animate-in fade-in-50 slide-in-from-top-2 duration-200">
                        <button
                          type="button"
                          onClick={handleConfirmRating}
                          disabled={isSubmittingRating}
                          className="w-full py-2 px-4 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                        >
                          {isSubmittingRating ? (
                            'Guardando...'
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Calificar con {selectedStars} {selectedStars === 1 ? 'estrella' : 'estrellas'}
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedStars(0)}
                          disabled={isSubmittingRating}
                          className="w-full mt-1.5 text-center text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}

                    {rating && rating.totalRatings > 0 && (
                      <p className="text-xs text-gray-400 border-t border-gray-50 pt-2 w-full text-center">
                        Promedio actual: {rating.averageRating.toFixed(1)} ({rating.totalRatings} votos)
                      </p>
                    )}
                  </div>
                </div>

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
    </div>
  );
}