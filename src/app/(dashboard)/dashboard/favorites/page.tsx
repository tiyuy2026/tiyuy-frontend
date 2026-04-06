'use client';

import { useEffect, useState } from 'react';
import { PropertyCard } from '@/presentation/components/property/PropertyCard';
import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute';
import { axiosClient } from '@/infrastructure/api/axios-client';
import { ENDPOINTS } from '@/infrastructure/api/endpoints';
import type { Currency, PropertyType, TransactionType } from '@/core/domain/entities/Property';

interface FavoriteItem {
  favoriteId: number;
  propertyId: number;
  propertySlug: string;
  propertyTitle: string;
  propertyType: string;
  transactionType: string;
  price: number;
  currency: string;
  bedrooms?: number;
  bathrooms?: number;
  totalArea?: number;
  district: string;
  province: string;
  coverPhotoUrl?: string;
  isAvailable: boolean;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axiosClient
      .get(ENDPOINTS.FAVORITES.BASE)
      .then((r) => setFavorites(r.data.content ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    // <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mis Favoritos</h1>
          <p className="text-gray-600 mt-1">
            Guarda las propiedades que mas te interesan
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        )}

        {error && (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-red-500 font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && favorites.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No tienes favoritos aun
            </h3>
            <p className="text-gray-500">
              Explora propiedades y guarda tus favoritos para verlos aqui
            </p>
          </div>
        )}

        {!loading && !error && favorites.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((fav) => (
              <PropertyCard
                key={fav.favoriteId}
                property={{
                  id: fav.propertyId,
                  seo: { 
                    slug: fav.propertySlug,
                    seoTitle: fav.propertyTitle,
                    seoDescription: '',
                    seoKeywords: [],
                    canonicalUrl: '',
                  },
                  title: fav.propertyTitle,
                  type: fav.propertyType as PropertyType,
                  transactionType: fav.transactionType as TransactionType,
                  status: fav.isAvailable ? 'PUBLISHED' : 'INACTIVE',
                  price: fav.price,
                  currency: fav.currency as Currency,
                  bedrooms: fav.bedrooms,
                  bathrooms: fav.bathrooms,
                  totalArea: fav.totalArea,
                  location: {
                    district: fav.district,
                    province: fav.province,
                    fullAddress: `${fav.district}, ${fav.province}`,
                    region: '',
                    showExactAddress: false,
                  },
                  media: [],
                  owner: { id: 0, name: '', email: '', phone: '', role: '' },
                  coverPhotoUrl: fav.coverPhotoUrl,
                  isFeatured: false,
                  isVerified: false,
                  viewsCount: 0,
                  favoritesCount: 0,
                  contactsCount: 0,
                  isNegotiable: false,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                }}
              />
            ))}
          </div>
        )}
      </div>
    // </ProtectedRoute>
  );
}
