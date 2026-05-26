'use client';

import { useState, useEffect } from 'react';
import { ProjectFull, ProjectUnit } from '@/core/domain/entities/Project';
import { StarRating } from '../../property/PropertyDetail/StarRating';
import { useCRMInteraction } from '@/presentation/hooks/useCRMInteraction';
import { useAuthStore } from '@/presentation/store/authStore';
import { Input } from '@/presentation/components/ui';
import { ShareButton } from '../../shared/ShareButton/ShareButton';
import { Star } from 'lucide-react';
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
      {/* ── FAVORITO / COMPARTIR ── */}
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={handleToggleFavorite}
          disabled={favLoading}
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 hover:text-rose-500 hover:bg-rose-50"
        >
          <svg
            className={`w-4 h-4 transition-all duration-200 ${
              isFavorite ? 'fill-rose-500 stroke-rose-500 scale-110' : 'fill-none stroke-current'
            }`}
            viewBox="0 0 24 24"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          {favLoading ? '...' : isFavorite ? 'Guardado' : 'Favorito'}
        </button>
        <ShareButton variant="topbar" />
      </div>

      {/* ── FORMULARIO DE CONTACTO ── */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">
            Contáctate con {project.developer?.companyName || 'el desarrollador'}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            por el proyecto en {project.district}, {project.province}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4" noValidate>
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

          {/* Unidad de interés */}
          {units.length > 0 && (
            <div>
              <label htmlFor="selectedUnitId" className="block text-sm font-medium text-gray-700 mb-2">
                Unidad de interés (opcional)
              </label>
              <select
                id="selectedUnitId"
                name="selectedUnitId"
                value={formData.selectedUnitId}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 bg-gray-50"
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
              placeholder="Hola, me interesa este proyecto..."
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

        {/* WhatsApp Button */}
        {project.developer?.phone && (
          <div className="px-5 pb-5">
            <button
              type="button"
              onClick={handleWhatsApp}
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.882l6.162-1.616A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.878 9.878 0 01-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374A9.859 9.859 0 012.106 12C2.106 6.579 6.579 2.106 12 2.106S21.894 6.579 21.894 12 17.421 21.894 12 21.894z"/>
              </svg>
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
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
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
