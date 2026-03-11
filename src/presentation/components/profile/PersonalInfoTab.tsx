'use client';

import { useState } from 'react';
import { User } from '@/core/domain/entities/User';
import { Button, Input } from '@/presentation/components/ui';
import { Save, MapPin, Phone, Hash, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/presentation/hooks/useAuth';

interface PersonalInfoTabProps {
  user: User;
}

export const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({ user }) => {
  const { updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    phone: user.phone,
    address: user.address || '',
    city: user.city || 'Lima',
    country: user.country || 'Perú',
    bio: user.bio || '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');

    try {
      console.log('Actualizando perfil:', formData);
      
      // Conectar con backend para actualizar perfil
      await updateProfile(formData);
      
      setSuccessMessage('Información actualizada correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error actualizando perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Información Personal</h2>
        <p className="text-gray-600">
          Actualiza tu información personal. Los campos de DNI, email y nombre no se pueden modificar por seguridad.
        </p>
      </div>

      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campos no editables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="DNI"
              value={user.dni}
              disabled
              leftIcon={<Hash className="w-5 h-5 text-gray-400" />}
              helperText="El DNI no se puede modificar por seguridad"
            />
          </div>
          
          <div>
            <Input
              label="Email"
              value={user.email}
              disabled
              leftIcon={<UserIcon className="w-5 h-5 text-gray-400" />}
              helperText="El email no se puede modificar por seguridad"
            />
          </div>
        </div>

        {/* Campos no editables pero visibles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Nombres"
            value={user.firstName}
            disabled
            leftIcon={<UserIcon className="w-5 h-5 text-gray-400" />}
            helperText="Los nombres no se pueden modificar por seguridad"
          />
          
          <Input
            label="Apellidos"
            value={user.lastName}
            disabled
            leftIcon={<UserIcon className="w-5 h-5 text-gray-400" />}
            helperText="Los apellidos no se pueden modificar por seguridad"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            name="phone"
            label="Teléfono"
            value={formData.phone}
            onChange={handleChange}
            leftIcon={<Phone className="w-5 h-5 text-gray-400" />}
            placeholder="987654321"
            helperText="Puedes actualizar tu número de teléfono"
          />
          
          <Input
            name="country"
            label="País"
            value={formData.country}
            onChange={handleChange}
            leftIcon={<MapPin className="w-5 h-5 text-gray-400" />}
            placeholder="Perú"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            name="city"
            label="Ciudad"
            value={formData.city}
            onChange={handleChange}
            leftIcon={<MapPin className="w-5 h-5 text-gray-400" />}
            placeholder="Lima"
          />
          
          <div></div> {/* Espacio vacío para balancear el grid */}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dirección
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Ingresa tu dirección completa"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Biografía
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            maxLength={500}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Cuéntanos sobre ti..."
          />
          <p className="text-sm text-gray-500 mt-1">
            {formData.bio.length}/500 caracteres
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="min-w-[150px]"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
};
