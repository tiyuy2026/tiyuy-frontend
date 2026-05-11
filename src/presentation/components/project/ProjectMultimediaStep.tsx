'use client';

import React, { useState, useRef } from 'react';
import { authStorage } from '@/infrastructure/storage/auth-storage';
import { toast } from '@/presentation/store/toastStore';

interface ProjectMultimediaStepProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  projectId?: number;
  unitBlueprintFiles?: {[key: number]: File};
  groupBlueprintFiles?: {[key: number]: File};
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
    images: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'], // Solo JPG, PNG, WebP
    blueprints: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'], // PDF + imágenes
    renders: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/avi'] // JPG, PNG, WebP, MP4, AVI
  };

  if (!allowedTypes[type].includes(file.type)) {
    return `El archivo "${file.name}" tiene un formato no permitido para ${type}`;
  }

  return null; // sin error
};

export function ProjectMultimediaStep({ formData, onChange, projectId, unitBlueprintFiles, groupBlueprintFiles }: ProjectMultimediaStepProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blueprintInputRef = useRef<HTMLInputElement>(null);
  const renderInputRef = useRef<HTMLInputElement>(null);

  // Función para subir planos de unidades (del paso 3)
  const uploadUnitBlueprints = async () => {
    if (!projectId) return;

    const token = authStorage.getToken() || localStorage.getItem('tiyuy-auth-token') || localStorage.getItem('token');
    if (!token) return;

    console.log('Subiendo planos de unidades desde paso 3...');
    
    // Guardar las URLs subidas para actualizar las unidades
    const uploadedBlueprints: {[key: number]: string} = {};
    
    // Subir planos de unidades individuales
    if (unitBlueprintFiles) {
      for (const [unitId, file] of Object.entries(unitBlueprintFiles)) {
        if (file) {
          const formDataUpload = new FormData();
          formDataUpload.append('files', file);
          formDataUpload.append('type', 'BLUEPRINT');

          try {
            const response = await fetch(`/projects/${projectId}/upload`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: formDataUpload,
            });

            if (response.ok) {
              const result = await response.json();
              const uploadedUrl = result[0]?.url || result[0];
              console.log(`Plano de unidad ${unitId} subido:`, uploadedUrl);
              
              // Guardar la URL para actualizar la unidad
              uploadedBlueprints[parseInt(unitId)] = uploadedUrl;
            }
          } catch (error) {
            console.error(`Error subiendo plano de unidad ${unitId}:`, error);
          }
        }
      }
    }

    // Subir planos de grupos
    if (groupBlueprintFiles) {
      for (const [groupId, file] of Object.entries(groupBlueprintFiles)) {
        if (file) {
          const formDataUpload = new FormData();
          formDataUpload.append('files', file);
          formDataUpload.append('type', 'BLUEPRINT');

          try {
            const response = await fetch(`/projects/${projectId}/upload`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: formDataUpload,
            });

            if (response.ok) {
              const result = await response.json();
              const uploadedUrl = result[0]?.url || result[0];
              console.log(`Plano de grupo ${groupId} subido:`, uploadedUrl);
              
              // Guardar la URL para actualizar el grupo
              uploadedBlueprints[parseInt(groupId)] = uploadedUrl;
            }
          } catch (error) {
            console.error(`Error subiendo plano de grupo ${groupId}:`, error);
          }
        }
      }
    }

    // Devolver las URLs subidas para que se usen en el guardado final
    return uploadedBlueprints;
  };

  const handleFileUpload = async (files: FileList, type: 'images' | 'blueprints' | 'renders') => {
    if (!projectId) {
      toast.error('Primero debes guardar el proyecto para subir archivos');
      return;
    }

    if (projectId <= 0) {
      toast.error('ID de proyecto inválido. Por favor, recarga la página e intenta nuevamente.');
      return;
    }

    for (const file of Array.from(files)) {
      const error = await validateFile(file, type);
      if (error) {
        toast.error(error);
        return;
      }
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const token = authStorage.getToken();
      if (!token) throw new Error('No se encontró el token de autenticación');

      // Crear FormData para la subida (formato específico para proyectos)
      const formDataUpload = new FormData();
      
      // Para proyectos, usar el formato que espera el backend (/upload endpoint)
      Array.from(files).forEach(file => {
        formDataUpload.append('files', file);
      });
      
      // El backend requiere el parámetro "type" para proyectos
      const backendType = type === 'images' ? 'PHOTO' : type === 'blueprints' ? 'BLUEPRINT' : 'RENDER';
      formDataUpload.append('type', backendType);

      console.log(`Subiendo ${files.length} archivos al proyecto ${projectId}`);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 5, 95));
      }, 500);

      // Usar ruta relativa - Vercel actúa como puente
      const uploadUrl = `/projects/${projectId}/upload`;

      console.log(`Enviando POST a: ${uploadUrl}`);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Error del servidor:', response.status, errorBody);

        if (errorBody.includes('Method \'POST\' is not supported')) {
          throw new Error('El servidor no reconoce esta ruta para subida.');
        }

        if (response.status === 500) {
          throw new Error('Error del servidor al procesar los archivos.');
        }

        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const newUrls = Array.isArray(result) ? result.map((m: any) => m.url || m) : [];
      
      const currentUrls = formData[type] || [];
      onChange(type, [...currentUrls, ...newUrls]);
      toast.success('Archivos subidos correctamente');

    } catch (error: any) {
      console.error(' Error en la subida:', error);
      toast.error(error.message || 'Error al subir los archivos');
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
    <div data-multimedia-step className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Multimedia del Proyecto</h3>
        <p className="text-sm text-gray-600 mb-6">
          Sube imágenes, planos y renders para mostrar tu proyecto
        </p>
      </div>

      {!projectId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="text-yellow-600"></div>
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
                    onLoad={() => console.log(`Imagen ${index + 1} cargada: ${image}`)}
                    onError={() => console.error(`Error cargando imagen ${index + 1}: ${image}`)}
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
          disabled={!projectId || uploading}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Subiendo...' : '+ Subir Imágenes'}
        </button>
      </div>

      {/* Planos */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Planos del Proyecto</h4>
        <p className="text-sm text-gray-600 mb-3">
          Planos arquitectónicos, plantas, distribuciones (PDF, JPG, PNG, WebP - máx 20MB)
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
          accept="application/pdf,image/jpeg,image/jpg,image/png,image/webp"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'blueprints')}
          className="hidden"
        />
        
        <button
          onClick={() => blueprintInputRef.current?.click()}
          disabled={!projectId || uploading}
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
                      />
                    ) : (
                      <img
                        src={render}
                        alt={`Render ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error(`Error cargando render ${index + 1}:`, render);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
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
          disabled={!projectId || uploading}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Subiendo...' : '+ Subir Renders'}
        </button>
      </div>

      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-blue-800 font-medium">Subiendo archivos...</p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
            <span className="text-blue-600 text-sm font-medium">{uploadProgress}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
