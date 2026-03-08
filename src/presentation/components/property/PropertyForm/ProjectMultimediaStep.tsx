'use client';

import React, { useState, useRef } from 'react';
import { authStorage } from '@/infrastructure/storage/auth-storage';

interface ProjectMultimediaStepProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  propertyId?: number;
}

const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => reject(new Error('No se pudo leer el video'));
    video.src = URL.createObjectURL(file);
  });
};

const validateFile = async (file: File, type: 'images' | 'blueprints' | 'renders'): Promise<string | null> => {
  const isVideo = file.type.startsWith('video/');
  const isImage = file.type.startsWith('image/');

  // Límites de tamaño
  const maxSize = isVideo ? 100 * 1024 * 1024   // 100MB para video
                : isImage ? 10 * 1024 * 1024    // 10MB para imágenes
                :           20 * 1024 * 1024;   // 20MB para PDFs/planos

  if (file.size > maxSize) {
    const maxMB = maxSize / (1024 * 1024);
    const fileMB = (file.size / (1024 * 1024)).toFixed(1);
    return `"${file.name}" pesa ${fileMB}MB. Máximo permitido: ${maxMB}MB`;
  }

  // Validar duración de video (máx 60 segundos)
  if (isVideo) {
    try {
      const duration = await getVideoDuration(file);
      if (duration > 60) {
        return `El video "${file.name}" dura ${Math.round(duration)}s. Máximo: 60 segundos`;
      }
    } catch (error) {
      return `El video "${file.name}" no es válido o está corrupto`;
    }
  }

  // Validar formatos permitidos
  const allowedTypes = {
    images: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    blueprints: ['application/pdf', 'image/vnd.dwg', 'application/dxf'],
    renders: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/avi']
  };

  if (!allowedTypes[type].includes(file.type)) {
    return `El archivo "${file.name}" tiene un formato no permitido para ${type}`;
  }

  return null; // sin error
};

export function ProjectMultimediaStep({ formData, onChange, propertyId }: ProjectMultimediaStepProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blueprintInputRef = useRef<HTMLInputElement>(null);
  const renderInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList, type: 'images' | 'blueprints' | 'renders') => {
    if (!propertyId) {
      alert('Primero debes guardar el proyecto para subir archivos');
      return;
    }

    // ✅ Validar todos los archivos antes de subir
    for (const file of Array.from(files)) {
      const error = await validateFile(file, type);
      if (error) {
        alert(`⚠️ ${error}`);
        return; // Detener todo si hay un archivo inválido
      }
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // ✅ Mapeo del tipo al valor que espera el backend
      const mediaTypeMap = {
        images: 'PHOTO',
        blueprints: 'BLUEPRINT',
        renders: 'RENDER',
      };

      // ✅ Obtener el token JWT
      const token = authStorage.getToken();
      
      // 🔍 Logs para diagnosticar el token
      console.log('🔑 Token existe:', !!token);
      console.log('🔑 Token value:', token?.substring(0, 50) + '...'); // primeros 50 chars
      console.log('🔑 PropertyId:', propertyId);
      console.log('🔑 Keys en localStorage:', Object.keys(localStorage));
      Object.keys(localStorage).forEach(k => console.log(k, '→', localStorage.getItem(k)?.substring(0, 30)));

      const uploadPromises = Array.from(files).map(async (file, index) => {
        const formDataUpload = new FormData();
        formDataUpload.append('files', file);
        formDataUpload.append('type', mediaTypeMap[type]);

        // Simulación de progreso
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + (100 / files.length), 90));
        }, 200);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/projects/${propertyId}/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataUpload,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!response.ok) {
          const errorBody = await response.text();
          console.error('Backend error:', response.status, errorBody);
          throw new Error(`Error al subir archivo: ${response.status}`);
        }

        const result: Array<{ id: number; url: string; mediaType: string }> = await response.json();
        console.log('📸 Backend response:', JSON.stringify(result, null, 2));
        
        // ✅ El backend devuelve un array, extraer las URLs
        return result.map(m => m.url);
      });

      const results = await Promise.all(uploadPromises);
      
      // results es array de arrays de URLs, hay que aplanarlo
      const allUrls = results.flat();
      
      // Actualizar formData con las URLs de los archivos subidos
      const currentFiles = formData[type] || [];
      onChange(type, [...currentFiles, ...allUrls]);

    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error al subir los archivos');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (type: 'images' | 'blueprints' | 'renders', index: number) => {
    const currentFiles = formData[type] || [];
    onChange(type, currentFiles.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Multimedia del Proyecto</h3>
        <p className="text-sm text-gray-600 mb-6">
          Sube imágenes, planos y renders para mostrar tu proyecto
        </p>
      </div>

      {!propertyId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="text-yellow-600">⚠️</div>
            <div>
              <p className="text-yellow-800 font-medium">Importante</p>
              <p className="text-yellow-700 text-sm">
                Debes completar los pasos anteriores para poder subir archivos multimedia
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Imágenes del Proyecto */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Imágenes del Proyecto</h4>
        <p className="text-sm text-gray-600 mb-3">
          Fotos del edificio, amenities, vistas, etc. (Máximo 10 imágenes)
        </p>
        
        {/* Grid de imágenes existentes */}
        {formData.images && formData.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {formData.images.map((image: any, index: number) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeFile('images', index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'images')}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={!propertyId || uploading}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Subiendo...' : '+ Subir Imágenes'}
        </button>
      </div>

      {/* Planos */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Planos del Proyecto</h4>
        <p className="text-sm text-gray-600 mb-3">
          Planos arquitectónicos, plantas, distribuciones (PDF, DWG)
        </p>
        
        {/* Lista de planos existentes */}
        {formData.blueprints && formData.blueprints.length > 0 && (
          <div className="space-y-2 mb-4">
            {formData.blueprints.map((blueprint: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{blueprint.name}</p>
                    <p className="text-sm text-gray-500">{blueprint.size}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile('blueprints', index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={blueprintInputRef}
          type="file"
          multiple
          accept="application/pdf,image/vnd.dwg,application/dxf"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'blueprints')}
          className="hidden"
        />
        
        <button
          onClick={() => blueprintInputRef.current?.click()}
          disabled={!propertyId || uploading}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Subiendo...' : '+ Subir Planos'}
        </button>
      </div>

      {/* Renders 3D */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Renders 3D</h4>
        <p className="text-sm text-gray-600 mb-3">
          Imágenes 3D, tours virtuales, visualizaciones
        </p>
        
        {/* Grid de renders existentes */}
        {formData.renders && formData.renders.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {formData.renders.map((render: any, index: number) => {
              const isVideo = render.includes('.mp4') || render.includes('.avi') || render.includes('.mov');
              
              return (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {isVideo ? (
                      <video
                        src={render}
                        className="w-full h-full object-cover"
                        controls
                        muted
                        playsInline
                      >
                        Tu navegador no soporta el tag de video.
                      </video>
                    ) : (
                      <img
                        src={render}
                        alt={`Render ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                      {isVideo ? '▶️ VIDEO' : '3D'}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile('renders', index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <input
          ref={renderInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/avi"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'renders')}
          className="hidden"
        />
        
        <button
          onClick={() => renderInputRef.current?.click()}
          disabled={!propertyId || uploading}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Subiendo...' : '+ Subir Renders 3D'}
        </button>
      </div>

      {/* Progreso de subida */}
      {uploading && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Subiendo archivos...</span>
            <span className="text-sm text-gray-500">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Resumen multimedia */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-medium text-purple-900 mb-3">Resumen Multimedia</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <span className="text-purple-700 block text-sm">Imágenes</span>
            <p className="font-semibold text-purple-900 text-lg">{formData.images?.length || 0}</p>
          </div>
          <div>
            <span className="text-purple-700 block text-sm">Planos</span>
            <p className="font-semibold text-purple-900 text-lg">{formData.blueprints?.length || 0}</p>
          </div>
          <div>
            <span className="text-purple-700 block text-sm">Renders</span>
            <p className="font-semibold text-purple-900 text-lg">{formData.renders?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <div className="text-blue-600 mt-0.5">💡</div>
          <div>
            <p className="text-blue-800 font-medium mb-1">Recomendaciones</p>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Usa imágenes de alta resolución (mínimo 1200x800px)</li>
              <li>• Incluye fotos del edificio, amenities y vistas</li>
              <li>• Los planos deben estar en PDF y ser legibles</li>
              <li>• Los renders 3D ayudan a visualizar el proyecto final</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
