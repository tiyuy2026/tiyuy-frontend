'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PropertyRepository } from '@/infrastructure/repositories/PropertyRepository';
import { useAuthStore } from '@/presentation/store/authStore';
import { toast } from 'sonner';
import { PropertyDetail } from '@/presentation/components/property/PropertyDetail';
import { PropertyForm } from '@/presentation/components/property/PropertyForm';
import { Property } from '@/core/domain/entities/Property';

const repo = new PropertyRepository();

export default function EditPropertyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (params.id) fetchProperty();
  }, [params.id]);

  const fetchProperty = async () => {
    try {
      console.log('🔥 EditPropertyPage - Fetching property ID:', params.id);
      const prop = await repo.getById(Number(params.id));
      console.log('🔥 EditPropertyPage - Property loaded:', prop);
      
      setProperty(prop);
      setFormData({
        title: prop.title,
        description: prop.description,
        price: prop.price,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        parkingSpots: prop.parkingSpots,
        totalArea: prop.totalArea,
        builtArea: prop.builtArea,
        // Agrega más campos según tu entity
      });
    } catch (error) {
      console.error('🔥 EditPropertyPage - Error fetching property:', error);
      toast.error('Propiedad no encontrada');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      console.log('🔥 EditPropertyPage - Form data before save:', formData);
      console.log('🔥 EditPropertyPage - Property ID to update:', params.id);
      
      // Validar que tenemos el userId
      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }
      
      // Agregar userId al formData
      const dataWithUserId = {
        ...formData,
        userId: user.id
      };
      
      console.log('🔥 EditPropertyPage - Data with userId:', dataWithUserId);
      
      // Actualizar propiedad con los datos del formulario
      await repo.update(Number(params.id), dataWithUserId);
      
      console.log('🔥 EditPropertyPage - Update completed successfully');
      toast.success('¡Propiedad actualizada!');
      
      // Opcional: Recargar datos actualizados
      const updatedProp = await repo.getById(Number(params.id));
      console.log('🔥 EditPropertyPage - Reloaded property:', updatedProp);
      setProperty(updatedProp);
      
      // Volver a modo vista
      setEditMode(false);
      
    } catch (error: any) {
      console.error('🔥 EditPropertyPage - Error saving property:', error);
      console.error('🔥 EditPropertyPage - Error details:', error.response?.data);
      toast.error('Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!property) return <div>Propiedad no encontrada</div>;

  return (
    <div className="w-full p-6">
      {/* Header con botones */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Editar Propiedad</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-2 rounded ${
              editMode 
                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {editMode ? 'Ver Modo' : 'Editar Modo'}
          </button>
          <button
            onClick={() => router.push('/mis-propiedades')}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Vista completa como "Ver" */}
      {!editMode ? (
        <PropertyDetail property={property} />
      ) : (
        <div className="space-y-6">
          {/* Formulario de edición */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Información Básica</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  placeholder="Título de la propiedad"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  rows={4}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  placeholder="Describe tu propiedad"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio</label>
                <input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dormitorios</label>
                  <input
                    type="number"
                    value={formData.bedrooms || ''}
                    onChange={(e) => setFormData({...formData, bedrooms: Number(e.target.value)})}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Baños</label>
                  <input
                    type="number"
                    value={formData.bathrooms || ''}
                    onChange={(e) => setFormData({...formData, bathrooms: Number(e.target.value)})}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estacionamientos</label>
                  <input
                    type="number"
                    value={formData.parkingSpots || ''}
                    onChange={(e) => setFormData({...formData, parkingSpots: Number(e.target.value)})}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button
                  type="button"
                  onClick={() => window.open(`/propiedad/${property.id}`, '_blank')}
                  className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700"
                >
                  Ver Propiedad Publicada
                </button>
              </div>
            </form>
          </div>

          {/* Nota sobre fotos */}
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">📸 Gestión de Fotos</h3>
            <p className="text-gray-700">
              Las fotos se gestionan por separado para mejor rendimiento. 
              Usa la sección <strong>"Nueva Propiedad"</strong> o contacta a un agente para subir/modificar imágenes.
            </p>
            <button
              onClick={() => window.open(`/propiedad/${property.id}`, '_blank')}
              className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Ver Fotos Actuales
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
