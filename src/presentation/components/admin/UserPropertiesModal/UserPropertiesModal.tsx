/**
 * User Properties Modal Component
 * Modal para ver las propiedades de un usuario
 */

'use client';

import { UserPropertiesResponse } from '@/core/domain/entities/Admin';
import { Modal } from '@/presentation/components/ui/Modal';
import { Building, Home, MapPin, X } from 'lucide-react';

interface UserPropertiesModalProps {
  data: UserPropertiesResponse | null;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function UserPropertiesModal({ data, isLoading, isOpen, onClose }: UserPropertiesModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl p-0 max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-[#0EDC33] px-4 py-3 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-green-900">
                Propiedades de {data?.userName || 'Usuario'}
              </h3>
              <p className="text-green-700 text-xs mt-0.5">
                {data?.totalProperties || 0} {data?.totalProperties === 1 ? 'propiedad' : 'propiedades'} registradas
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-green-600 hover:text-green-800 transition-colors p-1 hover:bg-green-200 rounded-lg flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-sm text-gray-600">Cargando propiedades...</span>
            </div>
          ) : data?.properties && data.properties.length > 0 ? (
            <div className="space-y-2">
              {data.properties.map((property) => (
                <div 
                  key={property.id} 
                  className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-300"
                >
                  <div className="flex gap-3">
                    {/* Imagen */}
                    <div className="flex-shrink-0">
                      {property.thumbnailUrl ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                          <img 
                            src={property.thumbnailUrl} 
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-200">
                          <Home className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Info principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm leading-tight truncate">
                            {property.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            {property.district}, {property.city}
                          </p>
                        </div>
                        {/* Precio compacto */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-bold text-blue-600">
                            ${property.price ? property.price.toLocaleString('es-PE') : '0'}
                          </p>
                          <p className="text-[10px] text-gray-500">{property.totalArea || '-'} m²</p>
                        </div>
                      </div>
                      
                      {/* Badge de estado */}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                          property.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' :
                          property.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          property.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {property.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building className="w-7 h-7 text-gray-400" />
              </div>
              <h4 className="text-base font-medium text-gray-900">Sin propiedades</h4>
              <p className="text-sm text-gray-500 mt-1">Este usuario no tiene propiedades registradas</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
