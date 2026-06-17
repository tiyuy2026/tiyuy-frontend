'use client';

import { useState, useEffect } from 'react';
import { ProjectFull, ProjectUnit } from '@/core/domain/entities/Project';
import { StarRating } from '../../property/PropertyDetail/StarRating';
import { useCRMInteraction } from '@/presentation/hooks/useCRMInteraction';
import { useAuthStore } from '@/presentation/store/authStore';
import { Input } from '@/presentation/components/ui';
import { ShareButton } from '../../shared/ShareButton/ShareButton';
import { Star, AlertCircle, Calendar, MessageCircle } from 'lucide-react';
import { axiosClient } from '@/infrastructure/api/axios-client';
import { toast } from '@/presentation/store/toastStore';
import { useRouter } from 'next/navigation';

interface ProjectContactSidebarProps {
  project: ProjectFull;
  units: ProjectUnit[];
  currency: string;
}

export function ProjectContactSidebar({ project, units, currency }: ProjectContactSidebarProps) {
  const { isAuthenticated, user } = useAuthStore();
  const { trackContactForm, trackWhatsAppClick, isLoading } = useCRMInteraction();
  const router = useRouter();

  const [rating, setRating] = useState<{ averageRating: number; totalRatings: number } | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // Cargar rating
  useEffect(() => {
    const fetchRating = async () => {
      try {
        const res = await fetch(`/api/projects/${project.id}/rating`);
        if (res.ok) {
          const data = await res.json();
          setRating(data);
        }
      } catch {
        // Silently fail
      }
    };
    fetchRating();
  }, [project.id]);

  // Cargar estado de favorito
  useEffect(() => {
    if (!isAuthenticated) return;
    const checkFavorite = async () => {
      try {
        const res = await axiosClient.get(`/favorites/check/${project.id}`);
        setIsFavorite(res.data?.isFavorite ?? false);
      } catch {
        // Silently fail
      }
    };
    checkFavorite();
  }, [project.id, isAuthenticated]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setFavLoading(true);
    try {
      const res = await axiosClient.post(`/favorites/projects/${project.id}`);
      const newState = res.data?.isFavorite ?? !isFavorite;
      setIsFavorite(newState);
      toast.success(newState ? 'Agregado a favoritos' : 'Eliminado de favoritos');
    } catch {
      toast.error('No se pudo actualizar el favorito');
    } finally {
      setFavLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    contactName: user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : '',
    contactEmail: user?.email || '',
    contactPhone: '',
    message: '¡Hola! Me interesa este proyecto. ¿Está disponible?',
    preferredContactMethod: 'EMAIL' as const,
    selectedUnitId: '',
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
        propertyId: project.id,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        message: `${formData.message}${formData.selectedUnitId ? ` | Unidad de interés: ${formData.selectedUnitId}` : ''}`,
        preferredContactMethod: formData.preferredContactMethod,
      });

      setFormData({
        contactName: isAuthenticated && user?.firstName && user?.lastName
          ? `${user.firstName} ${user.lastName}`
          : '',
        contactEmail: isAuthenticated && user?.email ? user.email : '',
        contactPhone: '',
        message: '¡Hola! Me interesa este proyecto. ¿Está disponible?',
        preferredContactMethod: 'EMAIL' as const,
        selectedUnitId: '',
      });
      setErrors({});
    } catch (error) {
      console.error('Error enviando formulario:', error);
    }
  };

  const handleWhatsApp = () => {
    const phone = project.developer?.phone?.replace(/\D/g, '') || '';
    if (!phone) return;

    const msg = encodeURIComponent(
      `Hola, estoy interesado en el proyecto *${project.name}* en ${project.district}.\n` +
      `¿Podría darme más información?`
    );

    trackWhatsAppClick.mutate({
      propertyId: project.id,
      ownerId: project.developer?.id || 0,
      ownerPhone: phone,
      message: msg,
      source: 'whatsapp_button',
    });
  };

  const publishedDate = (project as any).createdAt
    ? new Date((project as any).createdAt).toLocaleDateString('es-PE', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;

  return (
    <div className="sticky top-4 space-y-4">
      {/* ── FORMULARIO DE CONTACTO ── */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="px-4 pt-4 pb-2 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">
            Contáctate con {project.developer?.companyName || 'el desarrollador'}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            por el proyecto en {project.district}, {project.province}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-3 space-y-2.5" noValidate>
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
            <label htmlFor="preferredContactMethod" className="block text-xs font-medium text-gray-700 mb-1">
              Prefieres que te contacten por
            </label>
            <select
              id="preferredContactMethod"
              name="preferredContactMethod"
              value={formData.preferredContactMethod}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm text-gray-700 bg-gray-50"
            >
              <option value="EMAIL">Email</option>
              <option value="PHONE">Teléfono</option>
              <option value="WHATSAPP">WhatsApp</option>
            </select>
          </div>

          {/* Unidad de interés */}
          {units.length > 0 && (
            <div>
              <label htmlFor="selectedUnitId" className="block text-xs font-medium text-gray-700 mb-1">
                Unidad de interés (opcional)
              </label>
              <select
                id="selectedUnitId"
                name="selectedUnitId"
                value={formData.selectedUnitId}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm text-gray-700 bg-gray-50"
              >
                <option value="">Selecciona una unidad</option>
                {units.filter(u => u.status === 'AVAILABLE').map((unit) => (
                  <option key={unit.id} value={unit.unitNumber}>
                    {unit.unitNumber} - {unit.bedrooms} dorm - {currency} {unit.price?.toLocaleString('en-US')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mensaje */}
          <div>
            <label htmlFor="message" className="block text-xs font-medium text-gray-700 mb-1">
              Mensaje
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              className={`w-full px-3 py-2 rounded-xl border transition-all duration-200 focus:outline-none text-sm text-gray-700 placeholder:text-gray-400 ${
                errors.message
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50'
              }`}
              placeholder="Hola, me interesa este proyecto..."
            />
            {errors.message && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
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

        {/* WhatsApp Button */}
        {project.developer?.phone && (
          <div className="px-4 pb-4">
            <button
              type="button"
              onClick={handleWhatsApp}
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Escribir por WhatsApp
            </button>
          </div>
        )}
      </div>

      {/* ── DESARROLLADOR ── */}
      {project.developer?.companyName && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {project.developer.companyName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate">{project.developer.companyName}</p>
              <p className="text-xs text-gray-500">Desarrollador</p>
            </div>
            {project.developer.phone && (
              <a
                href={`tel:${project.developer.phone}`}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold border border-blue-200 rounded-lg px-2.5 py-1.5 whitespace-nowrap transition-colors"
              >
                Ver teléfono
              </a>
            )}
          </div>
          {project.developer.ruc && (
            <p className="mt-2 text-xs text-gray-400">RUC: {project.developer.ruc}</p>
          )}
        </div>
      )}

      {/* ── ESTADÍSTICAS ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Estadísticas</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { v: project.viewsCount ?? 0, l: 'Visitas' },
            { v: (project as any).favoritesCount ?? 0, l: 'Favoritos' },
            { v: project.contactsCount ?? 0, l: 'Contactos' },
          ].map(({ v, l }) => (
            <div key={l} className="bg-gray-50 rounded-xl p-3">
              <div className="text-xl font-bold text-gray-900">{v}</div>
              <div className="text-xs text-gray-500 mt-0.5">{l}</div>
            </div>
          ))}
        </div>

        {/* Rating promedio */}
        {rating && rating.totalRatings > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.round(rating.averageRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-900">{rating.averageRating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({rating.totalRatings} {rating.totalRatings === 1 ? 'reseña' : 'reseñas'})</span>
            </div>
          </div>
        )}

        {publishedDate && (
          <p className="mt-3 text-xs text-gray-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            Publicado el {publishedDate}
          </p>
        )}
      </div>

      {/* ⭐ CALIFICAR PROYECTO */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Calificar proyecto</h3>
        <div className="flex flex-col items-center gap-2">
          <StarRating
            projectId={project.id}
            size="md"
            showValue
            onRatingSaved={() => {
              fetch(`/api/projects/${project.id}/rating`).then(res => {
                if (res.ok) res.json().then(data => setRating(data));
              }).catch(() => {});
            }}
          />
          {rating && rating.totalRatings > 0 && (
            <p className="text-xs text-gray-400">
              Promedio: {rating.averageRating.toFixed(1)} ({rating.totalRatings} {rating.totalRatings === 1 ? 'voto' : 'votos'})
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
