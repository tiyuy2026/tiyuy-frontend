'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Building2, MapPin, Home, ArrowLeft, ChevronRight, Mail, Phone, User } from 'lucide-react';
import { publicApiClient } from '@/infrastructure/api/axios-client';

interface AgentDetail {
  id: number;
  slug: string;
  name: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  email: string;
  phone: string;
  city: string;
  description: string;
  activePropertiesCount: number;
  propertiesUrl: string;
}

export default function AgentDetailPage() {
  const params = useParams();
  const [agent, setAgent] = useState<AgentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await publicApiClient.get<AgentDetail>(`/public/agents/${params.slug}`);
        setAgent(res.data);
      } catch { /* empty */ }
      finally { setLoading(false); }
    };
    fetchDetail();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-400">Agente no encontrado</p>
          <Link href="/agents" className="text-sm text-indigo-600 hover:underline mt-2 inline-block">Volver al directorio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/agents" className="inline-flex items-center gap-1 text-sm text-gray-300 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al directorio
          </Link>
          <div className="flex items-start gap-6">
            {agent.avatarUrl ? (
              <img src={agent.avatarUrl} alt={agent.name} className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-400 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                {agent.firstName?.[0] || 'A'}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold">{agent.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-300 text-sm">
                {agent.city && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{agent.city}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href={agent.propertiesUrl || '#'} className={`bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all ${agent.activePropertiesCount > 0 ? '' : 'pointer-events-none'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{agent.activePropertiesCount}</p>
                <p className="text-xs text-gray-500">Propiedades activas</p>
              </div>
            </div>
            {agent.activePropertiesCount > 0 && (
              <span className="text-xs text-indigo-600 flex items-center gap-1 mt-2">
                Ver propiedades <ChevronRight className="w-3 h-3" />
              </span>
            )}
          </Link>
        </div>

        {/* Description */}
        {agent.description && (
          <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-7">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Acerca de</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{agent.description}</p>
          </div>
        )}

        {/* Contact */}
        <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-7">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contacto</h2>
          <div className="space-y-3">
            {agent.email && (
              <a href={`mailto:${agent.email}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                <Mail className="w-4 h-4 text-gray-400" />
                {agent.email}
              </a>
            )}
            {agent.phone && (
              <a href={`tel:${agent.phone}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                <Phone className="w-4 h-4 text-gray-400" />
                {agent.phone}
              </a>
            )}
            {agent.city && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                {agent.city}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}