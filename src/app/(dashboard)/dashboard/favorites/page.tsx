'use client';

import { useEffect, useState } from 'react';
import { PropertyCard } from '@/presentation/components/property/PropertyCard';
import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute';
import { axiosClient } from '@/infrastructure/api/axios-client';
import { ENDPOINTS } from '@/infrastructure/api/endpoints';
import type { Currency, PropertyType, TransactionType } from '@/core/domain/entities/Property';
import { Heart, Search, SlidersHorizontal } from 'lucide-react';
import { useDashboardSidebar } from '../layout';

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
  const [search, setSearch] = useState('');
  const { sidebarOpen, setSidebarOpen, isMobile } = useDashboardSidebar();

  useEffect(() => {
    axiosClient
      .get(ENDPOINTS.FAVORITES.BASE)
      .then((r) => setFavorites(r.data.content ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? favorites.filter((f) =>
        f.propertyTitle.toLowerCase().includes(search.toLowerCase()) ||
        f.district.toLowerCase().includes(search.toLowerCase()) ||
        f.province.toLowerCase().includes(search.toLowerCase())
      )
    : favorites;

  return (
    <ProtectedRoute>
      <div className="p-8 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              )}
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mis Favoritos</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {favorites.length === 0
                    ? 'Guardá las propiedades que más te interesen'
                    : `${favorites.length} ${favorites.length === 1 ? 'propiedad guardada' : 'propiedades guardadas'}`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          {favorites.length > 0 && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar en favoritos..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition-all"
              />
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-10 h-10 border-[3px] border-rose-200 border-t-rose-500 rounded-full animate-spin" />
            <p className="text-sm text-gray-400 font-medium">Cargando favoritos...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
              <Heart className="w-8 h-8 text-red-400" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Error al cargar</h3>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && favorites.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center">
              <Heart className="w-10 h-10 text-rose-300" />
            </div>
            <div className="text-center max-w-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-2">No tenés favoritos aún</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Explorá propiedades y guardá tus favoritas tocando el ícono <Heart className="w-3.5 h-3.5 inline text-rose-400" /> para verlas acá.
              </p>
            </div>
          </div>
        )}

        {/* No results */}
        {!loading && !error && search && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
              <Search className="w-7 h-7 text-gray-400" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Sin resultados</h3>
              <p className="text-sm text-gray-500">No se encontraron propiedades para &quot;{search}&quot;</p>
            </div>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((fav) => (
              <div key={fav.favoriteId} className="group transition-all duration-200 hover:-translate-y-0.5">
                <PropertyCard
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
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
