'use client';

import { useState } from 'react';
import { PropertyRepository } from '@/infrastructure/repositories/PropertyRepository';
import { useAuthStore } from '@/presentation/store/authStore';

interface PropertyImagesProps {
  propertyId: number;
  onImagesUploaded?: () => void;
}

export function PropertyImages({ propertyId, onImagesUploaded }: PropertyImagesProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const propertyRepository = new PropertyRepository();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
    setError(null);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Por favor selecciona al menos una imagen');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Subir todas las imágenes de una vez usando el endpoint batch
      await propertyRepository.uploadPhotos(propertyId, files);

      // Actualizar el contador de propiedades del usuario
      if (user) {
        // Esto debería actualizar el publishedPropertiesCount en el backend
        console.log('Imágenes subidas exitosamente');
      }

      setFiles([]);
      onImagesUploaded?.();
      
    } catch (err: any) {
      setError(err.message || 'Error al subir las imágenes');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Subir imágenes de la propiedad
      </h3>
      
      <div className="space-y-4">
        {/* Selector de archivos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecciona imágenes (máximo 10)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={uploading}
          />
        </div>

        {/* Vista previa de archivos */}
        {files.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Vista previa ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={uploading}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Botón de subida */}
        <button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
              Subiendo...
            </div>
          ) : (
            'Subir imágenes'
          )}
        </button>
      </div>
    </div>
  );
}
