'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Building2, MapPin, Users, Home, FolderGit, ArrowLeft, ChevronRight, Mail, Phone } from 'lucide-react';
import { publicApiClient } from '@/infrastructure/api/axios-client';

interface AgencyDetail {
  id: number;
  slug: string;
  name: string;
  logoUrl: string | null;
  email: string;
  phone: string;
  city: string;
  description: string;
  agentsCount: number;
  activeProjectsCount: number;
  activePropertiesCount: number;
  projectsUrl: string;
  propertiesUrl: string;
}

export default function AgencyDetailPage() {
  const params = useParams();
  const [agency, setAgency] = useState<AgencyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await publicApiClient.get<AgencyDetail>(`/public/agencies/${params.slug}`);
        setAgency(res.data);
      } catch { /* empty */ }
      finally { setLoading(false); }
    };
    fetchDetail();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-400">Inmobiliaria no encontrada</p>
          <Link href="/agencies" className="text-sm text-teal-600 hover:underline mt-2 inline-block">Volver al directorio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-teal-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/agencies" className="inline-flex items-center gap-1 text-sm text-gray-300 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al directorio
          </Link>
          <div className="flex items-start gap-6">
            {agency.logoUrl ? (
              <img src={agency.logoUrl} alt={agency.name} className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-400 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                {agency.name?.[0] || 'I'}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold">{agency.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-300 text-sm">
                {agency.city && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{agency.city}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href={agency.projectsUrl || '#'} className={`bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all ${agency.activeProjectsCount > 0 ? '' : 'pointer-events-none'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <FolderGit className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{agency.activeProjectsCount}</p>
                <p className="text-xs text-gray-500">Proyectos activos</p>
              </div>
            </div>
            {agency.activeProjectsCount > 0 && (
              <span className="text-xs text-teal-600 flex items-center gap-1 mt-2">
                Ver proyectos <ChevronRight className="w-3 h-3" />
              </span>
            )}
          </Link>
          <Link href={agency.propertiesUrl || '#'} className={`bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all ${agency.activePropertiesCount > 0 ? '' : 'pointer-events-none'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{agency.activePropertiesCount}</p>
                <p className="text-xs text-gray-500">Propiedades activas</p>
              </div>
            </div>
            {agency.activePropertiesCount > 0 && (
              <span className="text-xs text-teal-600 flex items-center gap-1 mt-2">
                Ver propiedades <ChevronRight className="w-3 h-3" />
              </span>
            )}
          </Link>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{agency.agentsCount}</p>
                <p className="text-xs text-gray-500">Agentes asociados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {agency.description && (
          <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-7">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Acerca de</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{agency.description}</p>
          </div>
        )}

        {/* Contact */}
        <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-7">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contacto</h2>
          <div className="space-y-3">
            {agency.email && (
              <a href={`mailto:${agency.email}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-teal-600 transition-colors">
                <Mail className="w-4 h-4 text-gray-400" />
                {agency.email}
              </a>
            )}
            {agency.phone && (
              <a href={`tel:${agency.phone}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-teal-600 transition-colors">
                <Phone className="w-4 h-4 text-gray-400" />
                {agency.phone}
              </a>
            )}
            {agency.city && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                {agency.city}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}