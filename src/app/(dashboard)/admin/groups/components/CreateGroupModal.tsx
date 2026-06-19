'use client';

import { useState } from 'react';
import { X, Users, Building, Mail, MapPin, ToggleLeft, ToggleRight } from 'lucide-react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (groupData: any) => Promise<void>;
}

export default function CreateGroupModal({ isOpen, onClose, onCreateGroup }: CreateGroupModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    adminName: '',
    adminEmail: '',
    city: '',
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onCreateGroup(formData);
      onClose();
      // Reset form
      setFormData({
        name: '',
        description: '',
        adminName: '',
        adminEmail: '',
        city: '',
        isActive: true
      });
    } catch (error) {
      console.error('Error al crear grupo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header con verde encendido */}
        <div className="bg-[#00E658] px-5 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-green-800" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Crear Nuevo Grupo</h2>
                <p className="text-xs text-green-700">Configura tu grupo inmobiliario</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-green-300 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form scrolleable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Nombre del Grupo */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              Nombre del Grupo *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Ej: Inmobiliaria Piura Central"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <Building className="w-3.5 h-3.5 text-blue-500" />
              Descripción *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={2}
              placeholder="Describe el propósito y características de tu grupo..."
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Información del Administrador */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-3">
            <h3 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-teal-500" />
              Información del Administrador
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">Nombre *</label>
                <input
                  type="text"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  required
                  placeholder="Nombre completo"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">Email *</label>
                <input
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  required
                  placeholder="admin@ejemplo.com"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                <MapPin className="w-3.5 h-3.5 text-teal-500" />
                Ciudad *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="Ej: Piura, Lima, Arequipa..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Estado Activo */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                {formData.isActive ? (
                  <ToggleRight className="w-5 h-5 text-blue-600" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Grupo Activo</p>
                <p className="text-xs text-gray-500">
                  {formData.isActive ? 'Disponible para unirse' : 'El grupo estará oculto'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors flex-shrink-0 ${
                formData.isActive ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  formData.isActive ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </form>

        {/* Footer con botones */}
        <div className="flex gap-3 p-4 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-lg transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Users className="w-4 h-4" />
                Crear Grupo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
