'use client';

import { useState } from 'react';
import { User } from '@/core/domain/entities';
import { Button } from '@/presentation/components/ui';
import { Heart, MapPin, Bed, Bath, Square, Eye, Trash2, Search } from 'lucide-react';
import { useFavoritesList, useToggleFavorite } from '@/presentation/hooks/useFavorites';

interface FavoritesTabProps {
  user: User;
}

export const FavoritesTab: React.FC<FavoritesTabProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'views'>('date');
  
  // Usar datos reales del backend
  const { data: favoritesData, isLoading, error, refetch } = useFavoritesList();
  const favorites = favoritesData?.content || [];

  const filteredFavorites = favorites
    .filter(property =>
      property.propertyTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.district?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'views':
          return (a.viewsCount || 0) - (b.viewsCount || 0);
        case 'date':
        default:
          return 0; // Los datos ya vienen ordenados por fecha del backend
      }
    });

  const handleRemoveFavorite = async (propertyId: number) => {
    try {
      // Crear el hook dinámicamente para el propertyId específico
      const { mutate: removeFavorite } = useToggleFavorite(propertyId);
      
      removeFavorite(undefined, {
        onSuccess: () => {
          refetch(); // Refrescar la lista después de eliminar
        }
      });
    } catch (error) {
      console.error('Error eliminando favorito:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Mis Favoritos</h2>
        <div className="text-sm text-gray-600">
          {favoritesData?.totalElements || 0} propiedades guardadas
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por título o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'price' | 'views')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="date">Más Recientes</option>
          <option value="price">Menor Precio</option>
          <option value="views">Más Vistos</option>
        </select>
      </div>

      {/* Estado de carga */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando favoritos...</p>
        </div>
      )}

      {/* Estado de error */}
      {error && (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <Heart className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error al cargar favoritos
          </h3>
          <p className="text-gray-600 mb-4">
            No pudimos cargar tus favoritos. Inténtalo nuevamente.
          </p>
          <Button onClick={() => refetch()}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Grid de Propiedades */}
      {!isLoading && !error && (
        <>
          {filteredFavorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron propiedades' : 'No tienes favoritos aún'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Guarda propiedades que te interesen para verlas aquí'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFavorites.map((property) => (
                <div key={property.favoriteId} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  {/* Imagen */}
                  <div className="relative h-48 bg-gray-200">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    
                    {/* Botón de eliminar favorito */}
                    <button
                      onClick={() => handleRemoveFavorite(property.propertyId)}
                      disabled={isLoading}
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white text-red-500 p-2 rounded-full shadow-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Badge de vistas */}
                    <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {property.viewsCount || 0}
                    </div>

                    {/* Imagen placeholder */}
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <MapPin className="w-8 h-8 mx-auto mb-2" />
                        <span className="text-sm">Imagen no disponible</span>
                      </div>
                    </div>
                  </div>

                  {/* Información */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                      {property.propertyTitle}
                    </h3>
                    
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      {property.district || 'Ubicación no especificada'}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Bed className="w-4 h-4 mr-1" />
                        {property.bedrooms || 0}
                      </div>
                      <div className="flex items-center">
                        <Bath className="w-4 h-4 mr-1" />
                        {property.bathrooms || 0}
                      </div>
                      <div className="flex items-center">
                        <Square className="w-4 h-4 mr-1" />
                        {property.totalArea || 0}m²
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold text-blue-600">
                          {formatPrice(property.price)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {property.propertyType} • {property.transactionType}
                        </p>
                      </div>
                      
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
