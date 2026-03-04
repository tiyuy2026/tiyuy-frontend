'use client';

import { useState, useRef, useCallback } from 'react';
import { useUploadPhotos } from '@/presentation/hooks/useProperties';
import Image from 'next/image';

interface PhotosStepProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  propertyId?: number;
}

export function PhotosStep({ propertyId }: PhotosStepProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadPhotos();

  // Validar archivo
  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      alert('Solo se permiten archivos JPG y PNG');
      return false;
    }
    
    if (file.size > maxSize) {
      alert('El archivo no debe superar los 5MB');
      return false;
    }
    
    return true;
  };

  // Manejar selección de archivos
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(validateFile);
    
    if (selectedFiles.length + validFiles.length > 10) {
      alert('Máximo 10 fotos por propiedad');
      return;
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    
    // Crear previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, []);

  // Funcionalidad de cámara
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setShowCamera(true);
    } catch (error) {
      alert('No se pudo acceder a la cámara. Asegúrate de dar permisos.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `camera-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            handleFileSelect([file] as unknown as FileList);
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const handleRemove = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!propertyId) {
      alert('Primero debes crear la propiedad');
      return;
    }

    if (selectedFiles.length === 0) {
      alert('Selecciona al menos una foto');
      return;
    }

    await uploadMutation.mutateAsync({
      propertyId,
      files: selectedFiles,
    });

    setSelectedFiles([]);
    setPreviewUrls([]);
  };

  return (
    <div className="space-y-8">
      {/* ── ÁREA DE SUBIDA ── */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Fotos de tu propiedad
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          Las propiedades con fotos reciben hasta 5x más visitas
        </p>

        {/* Área de drag & drop */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
            isDragging 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Icono de cámara */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Subir fotos de tu propiedad
          </h3>
          <p className="text-gray-600 mb-8">
            Arrastra y suelta imágenes aquí, o haz clic para seleccionar
          </p>

          {/* Input oculto */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg transition-all"
              style={{ backgroundColor: '#00a63e' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#009135')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#00a63e')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Seleccionar archivos
            </button>

            <button
              type="button"
              onClick={startCamera}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Tomar foto
            </button>
          </div>

          <p className="text-sm text-gray-400 mt-6">
            Máximo 10 fotos • JPG, PNG • Máx 5MB cada una
          </p>
        </div>
      </section>

      {/* ── PREVIEWS ── */}
      {previewUrls.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Fotos seleccionadas ({previewUrls.length}/10)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-200">
                <Image
                  src={url}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 text-white text-xs px-2 py-1 rounded" style={{ backgroundColor: '#00a63e' }}>
                    Portada
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleUpload}
            disabled={uploadMutation.isPending || !propertyId}
            className="w-full mt-6 py-3 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#00a63e' }}
            onMouseEnter={e => !uploadMutation.isPending && propertyId && (e.currentTarget.style.backgroundColor = '#009135')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#00a63e')}
          >
            {uploadMutation.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Subiendo fotos...
              </div>
            ) : (
              'Subir fotos'
            )}
          </button>
        </section>
      )}

      {/* ── CONSEJOS ── */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Consejos para mejores fotos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: '☀️', title: 'Buena iluminación', desc: 'Toma fotos con luz natural' },
            { icon: '🧹', title: 'Espacios ordenados', desc: 'Limpia y organiza antes' },
            { icon: '📐', title: 'Ángulos amplios', desc: 'Muestra los espacios completos' },
            { icon: '🏠', title: 'Todas las áreas', desc: 'Incluye todas las habitaciones' }
          ].map((tip, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">{tip.icon}</span>
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">{tip.title}</h4>
              <p className="text-xs text-gray-600 mt-1">{tip.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MODAL DE CÁMARA ── */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tomar foto</h3>
              <button
                onClick={stopCamera}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="relative bg-black rounded-lg overflow-hidden mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-96 object-cover"
              />
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="flex justify-center gap-4">
              <button
                onClick={stopCamera}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={capturePhoto}
                className="px-6 py-2 text-white rounded-lg"
                style={{ backgroundColor: '#00a63e' }}
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Capturar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ALERTA SI NO HAY PROPERTY ID ── */}
      {!propertyId && (
        <div className="rounded-lg p-4 flex items-start gap-3" style={{ backgroundColor: '#fef3c7', border: '1px solid #fbbf24' }}>
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#d97706' }}>
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm" style={{ color: '#92400e' }}>
            <p className="font-semibold">Primero completa los pasos anteriores</p>
            <p className="opacity-80">Para poder subir fotos, primero debes guardar la información básica, ubicación y características de la propiedad.</p>
          </div>
        </div>
      )}
    </div>
  );
}
