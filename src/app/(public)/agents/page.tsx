'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, ChevronLeft, ChevronRight, ArrowRight, Home, Users, User } from 'lucide-react';
import { publicApiClient } from '@/infrastructure/api/axios-client';

interface PublicAgent {
  id: number;
  slug: string;
  name: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  email: string;
  city: string;
  shortDescription: string;
  activePropertiesCount: number;
}

interface PageResponse {
  content: PublicAgent[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export default function AgentsPage() {
  const [data, setData] = useState<PageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [page, setPage] = useState(0);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, size: 10 };
      if (search) params.q = search;
      if (city) params.city = city;
      const res = await publicApiClient.get<PageResponse>('/public/agents', { params });
      setData(res.data);
    } catch { /* empty */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAgents(); }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchAgents();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero with SEO */}
      <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full tracking-wide uppercase mb-4">
              <Users className="w-3.5 h-3.5" /> Directorio
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">Agentes Inmobiliarios en Perú</h1>
            <p className="text-lg text-gray-300 mt-4 leading-relaxed">Directorio de agentes inmobiliarios registrados en Tiyuy. Conecta con profesionales del sector inmobiliario en todo el Perú.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar agente..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
            </div>
            <select value={city} onChange={e => { setCity(e.target.value); setPage(0); }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-[140px]">
              <option value="">Todas las ciudades</option>
              <option value="Lima">Lima</option>
              <option value="Arequipa">Arequipa</option>
              <option value="Cusco">Cusco</option>
              <option value="Trujillo">Trujillo</option>
              <option value="Piura">Piura</option>
            </select>
            <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all">
              Buscar
            </button>
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : !data || data.content.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-400">{search || city ? 'No se encontraron agentes' : 'No hay agentes registrados'}</p>
            <p className="text-xs text-gray-300 mt-1">{search || city ? 'Intenta con otros términos' : 'Aún no hay agentes disponibles'}</p>
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-500 mb-4">{data.totalElements} agentes encontrados</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.content.map((agent) => (
                <Link key={agent.id} href={`/agents/${agent.slug}`}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all group">
                  <div className="flex items-start gap-4 mb-3">
                    {agent.avatarUrl ? (
                      <img src={agent.avatarUrl} alt={agent.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-400 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {agent.firstName?.[0] || 'A'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{agent.name}</h3>
                      {agent.city && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{agent.city}</p>}
                    </div>
                  </div>
                  {agent.shortDescription && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{agent.shortDescription}</p>}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {agent.activePropertiesCount > 0 && <span className="flex items-center gap-1"><Home className="w-3 h-3" />{agent.activePropertiesCount} prop.</span>}
                    </div>
                    <span className="text-xs font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Ver perfil <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: data.totalPages }, (_, i) => i).slice(Math.max(0, page - 2), Math.min(data.totalPages, page + 3)).map(i => (
                  <button key={i} onClick={() => setPage(i)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === i ? 'bg-indigo-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{i + 1}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))} disabled={page >= data.totalPages - 1}
                  className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}