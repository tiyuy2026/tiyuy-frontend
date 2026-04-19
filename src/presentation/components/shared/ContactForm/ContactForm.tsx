'use client';

import { useState } from 'react';
import { useCRMInteraction } from '@/presentation/hooks/useCRMInteraction';
import { useAuthStore } from '@/presentation/store/authStore';
import { Input } from '@/presentation/components/ui';

interface ContactFormProps {
  propertyId: number;
  ownerId: number;
}

export function ContactForm({ propertyId, ownerId }: ContactFormProps) {
  const { isAuthenticated, user } = useAuthStore();
  const { trackContactForm, isLoading } = useCRMInteraction();

  const [formData, setFormData] = useState({
    contactName: user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : '',
    contactEmail: user?.email || '',
    contactPhone: '',
    message: '¡Hola! Me interesa esta propiedad. ¿Está disponible?',
    preferredContactMethod: 'EMAIL' as const,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.contactName.trim()) newErrors.contactName = 'El nombre es obligatorio';
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Email inválido';
    }
    if (!formData.contactPhone.trim()) newErrors.contactPhone = 'El teléfono es obligatorio';
    if (!formData.message.trim()) newErrors.message = 'El mensaje es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors(prev => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await trackContactForm.mutateAsync({
        propertyId,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        message: formData.message,
        preferredContactMethod: formData.preferredContactMethod,
      });

      setFormData({
        contactName: isAuthenticated && user?.firstName && user?.lastName
          ? `${user.firstName} ${user.lastName}`
          : '',
        contactEmail: isAuthenticated && user?.email ? user.email : '',
        contactPhone: '',
        message: '¡Hola! Me interesa esta propiedad. ¿Está disponible?',
        preferredContactMethod: 'EMAIL' as const,
      });
      setErrors({});
    } catch (error) {
      console.error('Error enviando formulario:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Contactar al propietario
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          id="contactName"
          name="contactName"
          type="text"
          label="Nombre completo"
          value={formData.contactName}
          onChange={handleChange}
          error={errors.contactName}
          placeholder="Juan Pérez"
        />

        <Input
          id="contactEmail"
          name="contactEmail"
          type="email"
          label="Email"
          value={formData.contactEmail}
          onChange={handleChange}
          error={errors.contactEmail}
          placeholder="juan@example.com"
        />

        <Input
          id="contactPhone"
          name="contactPhone"
          type="tel"
          label="Teléfono"
          value={formData.contactPhone}
          onChange={handleChange}
          error={errors.contactPhone}
          placeholder="+51 999 999 999"
        />

        {/* Método preferido */}
        <div>
          <label htmlFor="preferredContactMethod" className="block text-sm font-medium text-gray-700 mb-2">
            Prefieres que te contacten por
          </label>
          <select
            id="preferredContactMethod"
            name="preferredContactMethod"
            value={formData.preferredContactMethod}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 bg-gray-50"
          >
            <option value="EMAIL">Email</option>
            <option value="PHONE">Teléfono</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>
        </div>

        {/* Mensaje */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Mensaje
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none text-gray-700 placeholder:text-gray-400 ${
              errors.message
                ? 'border-red-500 focus:ring-2 focus:ring-red-500 bg-red-50'
                : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50'
            }`}
            placeholder="Hola, me interesa esta propiedad..."
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Enviando...' : 'Enviar mensaje'}
        </button>
      </form>
    </div>
  );
}
