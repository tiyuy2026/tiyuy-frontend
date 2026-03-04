'use client';

import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute';
import { useFavoritesList } from '@/presentation/hooks/useFavorites';
import Link from 'next/link';
import Image from 'next/image';

export default function FavoritesPage() {
  const { data, isLoading } = useFavoritesList();

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis favoritos</h1>
            <p className="text-gray-600 mt-1">
              Propiedades que guardaste para revisar más tarde
            </p>
          </div>
        </div>

        {isLoading && <p>Cargando...</p>}

        {!isLoading && data && data.content.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Aún no tienes favoritos
            </h3>
            <p className="text-gray-500 mb-4">
              Guarda las propiedades que te interesen para verlas aquí.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Buscar propiedades
            </Link>
          </div>
        )}

        {!isLoading && data && data.content.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.content.map((fav) => (
              <Link
                key={fav.favoriteId}
                href={`/propiedad/${fav.propertySlug}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
              >
                <div className="relative h-48 bg-gray-200">
                  {fav.coverPhotoUrl ? (
                    <Image
                      src={fav.coverPhotoUrl}
                      alt={fav.propertyTitle}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl">🏠</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                    {fav.propertyTitle}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    📍 {fav.district}, {fav.province}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Guardado el{' '}
                    {new Date(fav.savedAt).toLocaleDateString('es-PE')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
