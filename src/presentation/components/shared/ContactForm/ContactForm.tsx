'use client';

import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    contactName: user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : '',
    contactEmail: user?.email || '',
    contactPhone: '',
    message: '¡Hola! Me interesa esta propiedad. ¿Está disponible?',
    preferredContactMethod: 'EMAIL',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  type ContactMethod = 'EMAIL' | 'PHONE' | 'WHATSAPP';

  const contactMethods: { value: ContactMethod; label: string; icon: string }[] = [
    { value: 'EMAIL', label: 'Email', icon: 'material-symbols:mail-outline' },
    { value: 'PHONE', label: 'Teléfono', icon: 'material-symbols:phone-in-talk-outline' },
    { value: 'WHATSAPP', label: 'WhatsApp', icon: 'ic:baseline-whatsapp' },
  ];

  const selectedMethod = contactMethods.find(m => m.value === formData.preferredContactMethod);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        preferredContactMethod: 'EMAIL' as ContactMethod,
      });
      setErrors({});
    } catch (error) {
      console.error('Error enviando formulario:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <h3 className="text-sm font-bold text-gray-900 mb-2">
        Contactar al propietario
      </h3>

      <form onSubmit={handleSubmit} className="space-y-2.5" noValidate>
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

        {/* Método preferido - Dropdown personalizado */}
        <div ref={dropdownRef}>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Prefieres que te contacten por
          </label>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 transition-all duration-200 text-gray-700 text-sm"
          >
            <span className="flex items-center gap-2">
              {selectedMethod && (
                <Icon icon={selectedMethod.icon} className="w-4 h-4 text-brand" />
              )}
              <span>{selectedMethod?.label}</span>
            </span>
            <Icon
              icon="material-symbols:keyboard-arrow-down"
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <div className="relative z-50">
              <div
                className="absolute top-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
                style={{ animation: 'fadeIn 0.15s ease-out' }}
              >
                {contactMethods.map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, preferredContactMethod: method.value });
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors duration-150 ${
                      formData.preferredContactMethod === method.value
                        ? 'bg-brand/5 text-brand font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon
                      icon={method.icon}
                      className={`w-4 h-4 ${formData.preferredContactMethod === method.value ? 'text-brand' : 'text-gray-400'}`}
                    />
                    <span>{method.label}</span>
                    {formData.preferredContactMethod === method.value && (
                      <Icon icon="material-symbols:check" className="w-4 h-4 text-brand ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mensaje */}
        <div>
          <label htmlFor="message" className="block text-xs font-medium text-gray-700 mb-1.5">
            Mensaje
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={3}
            className={`w-full px-3 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none text-sm text-gray-700 placeholder:text-gray-400 ${
              errors.message
                ? 'border-red-500 focus:ring-2 focus:ring-red-500 bg-red-50'
                : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50'
            }`}
            placeholder="Hola, me interesa esta propiedad..."
          />
          {errors.message && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Enviando...' : 'Enviar mensaje'}
        </button>
      </form>
    </div>
  );
}
