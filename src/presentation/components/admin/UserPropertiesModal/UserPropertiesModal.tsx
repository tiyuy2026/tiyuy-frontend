/**
 * User Properties Modal Component
 * Modal para ver las propiedades de un usuario
 */

'use client';

import { UserPropertiesResponse } from '@/core/domain/entities/Admin';
import { Modal } from '@/presentation/components/ui/Modal';

interface UserPropertiesModalProps {
  data: UserPropertiesResponse | null;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function UserPropertiesModal({ data, isLoading, isOpen, onClose }: UserPropertiesModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-0 max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header Profesional */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white">
                Propiedades de {data?.userName || 'Usuario'}
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                {data?.totalProperties || 0} {data?.totalProperties === 1 ? 'propiedad' : 'propiedades'} registradas
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Cargando propiedades...</span>
            </div>
          ) : data?.properties && data.properties.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {data.properties.map((property) => (
                <div key={property.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-300">
                  <div className="flex gap-3">
                    {/* Imagen con info debajo */}
                    <div className="flex flex-col gap-2">
                      {property.thumbnailUrl ? (
                        <img 
                          src={property.thumbnailUrl} 
                          alt={property.title}
                          className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-200">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                      )}
                      {/* Info adicional bajo imagen */}
                      <div className="text-center">
                        <p className="text-xs font-bold text-blue-600">
                          ${property.price ? property.price.toLocaleString('es-PE') : '0'}
                        </p>
                        <p className="text-xs text-gray-500">{property.totalArea || '-'} m²</p>
                      </div>
                    </div>
                    
                    {/* Info principal */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm leading-tight truncate">
                        {property.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 truncate">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {property.district}, {property.city}
                      </p>
                      
                      {/* Badges Compactos */}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
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
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900">Sin propiedades</h4>
              <p className="text-gray-500 mt-1">Este usuario no tiene propiedades registradas</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
