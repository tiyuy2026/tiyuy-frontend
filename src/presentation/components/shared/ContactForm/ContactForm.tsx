'use client';

import { useState } from 'react';
import { useSendContact } from '@/presentation/hooks/useContacts';
import { useAuthStore } from '@/presentation/store/authStore';
import { useRouter } from 'next/navigation';

interface ContactFormProps {
  propertyId: number;
  ownerId: number;
}

export function ContactForm({ propertyId, ownerId }: ContactFormProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const sendContactMutation = useSendContact();

  const [formData, setFormData] = useState({
    contactName: user?.firstName && user?.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : '',
    contactEmail: user?.email || '',
    contactPhone: '',
    message: '¡Hola! Me interesa esta propiedad. ¿Está disponible?',
    preferredContactMethod: 'EMAIL' as const,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    await sendContactMutation.mutateAsync({
      propertyId,
      ...formData,
    });

    // Reset form after success
    if (sendContactMutation.isSuccess) {
      setFormData({
        ...formData,
        message: '',
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Contactar al propietario
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre completo *
          </label>
          <input
            id="contactName"
            name="contactName"
            type="text"
            value={formData.contactName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Juan Pérez"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="juan@example.com"
          />
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono *
          </label>
          <input
            id="contactPhone"
            name="contactPhone"
            type="tel"
            value={formData.contactPhone}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+51 999 999 999"
          />
        </div>

        {/* Método preferido */}
        <div>
          <label htmlFor="preferredContactMethod" className="block text-sm font-medium text-gray-700 mb-1">
            Prefieres que te contacten por *
          </label>
          <select
            id="preferredContactMethod"
            name="preferredContactMethod"
            value={formData.preferredContactMethod}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="EMAIL">📧 Email</option>
            <option value="PHONE">📞 Teléfono</option>
            <option value="WHATSAPP">💬 WhatsApp</option>
          </select>
        </div>

        {/* Mensaje */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Mensaje *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Hola, me interesa esta propiedad..."
          />
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={sendContactMutation.isPending}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {sendContactMutation.isPending ? 'Enviando...' : 'Enviar mensaje'}
        </button>

        {!isAuthenticated && (
          <p className="text-xs text-gray-500 text-center">
            Necesitas iniciar sesión para contactar
          </p>
        )}
      </form>
    </div>
  );
}
