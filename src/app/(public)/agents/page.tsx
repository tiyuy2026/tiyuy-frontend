'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, ChevronDown, ChevronLeft, ChevronRight, ArrowRight, Home, Users, User, Sparkles } from 'lucide-react';
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
  const [cityOpen, setCityOpen] = useState(false);

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
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      {/* Hero editorial */}
      <div className="relative bg-gradient-to-br from-[#0aa647] via-[#0aa647] to-[#088535] text-white overflow-hidden">
        <div className="absolute inset-0 z-0" style={{
          backgroundImage: `url('https://soho.pe/wp-content/uploads/2023/07/destacado-ultimas-tendencias-de-decoracion.jpg')`,
          backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.12,
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full tracking-wide uppercase mb-4">
              <Users className="w-3.5 h-3.5" /> Directorio
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">Agentes Inmobiliarios en Perú</h1>
            <p className="text-base sm:text-lg text-[#cbd5c6] mt-3 leading-relaxed max-w-2xl">
              Profesionales del sector inmobiliario registrados en Tiyuy. Conecta con agentes en todo el Perú.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <form onSubmit={handleSearch} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar agente..." className="w-full pl-10 pr-4 py-2.5 border border-[var(--border-color)] rounded-xl text-sm focus:ring-2 focus:ring-[#2d5a3d] focus:border-transparent outline-none bg-[var(--bg-secondary)] text-[var(--text-primary)]" />
            </div>
            <div className="relative min-w-[180px]">
              <button type="button" onClick={() => setCityOpen(!cityOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 border border-[var(--border-color)] rounded-xl text-sm bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-gray-300 transition-colors">
                <span className={city ? '' : 'text-[var(--text-tertiary)]'}>{city || 'Todas las ciudades'}</span>
                <ChevronDown className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform ${cityOpen ? 'rotate-180' : ''}`} />
              </button>
              {cityOpen && (
                <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-lg overflow-hidden">
                  <button type="button" onClick={() => { setCity(''); setPage(0); setCityOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bg-secondary)] ${!city ? 'text-[#2d5a3d] font-semibold bg-[var(--bg-secondary)]' : 'text-[var(--text-primary)]'}`}>
                    Todas las ciudades
                  </button>
                  {['Lima','Arequipa','Cusco','Trujillo','Piura','Chiclayo','Huancayo','Iquitos','Pucallpa','Tacna','Ica','Cajamarca','Puno','Ayacucho','Moquegua'].map(c => (
                    <button key={c} type="button" onClick={() => { setCity(c); setPage(0); setCityOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bg-secondary)] ${city === c ? 'text-[#2d5a3d] font-semibold bg-[var(--bg-secondary)]' : 'text-[var(--text-primary)]'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" className="px-6 py-2.5 bg-[#2d5a3d] hover:bg-[#1a3a2a] text-white text-sm font-semibold rounded-xl transition-all shadow-sm">
              Buscar
            </button>
          </div>
        </form>

        {loading ? (
          <div className="text-center py-12"><div className="w-8 h-8 border-4 border-[#2d5a3d] border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : !data || data.content.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-3" />
            <p className="text-sm font-medium text-[var(--text-secondary)]">{search || city ? 'No se encontraron agentes' : 'No hay agentes registrados'}</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">{search || city ? 'Intenta con otros términos' : 'Aún no hay agentes disponibles'}</p>
          </div>
        ) : (
          <>
            <div className="text-sm text-[var(--text-secondary)] mb-5">{data.totalElements} agentes encontrados</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.content.map((agent) => (
                <Link key={agent.id} href={`/agents/${agent.slug}`}
                  className="group bg-[var(--bg-card)] rounded-2xl border-2 border-[var(--border-color)] p-5 hover:shadow-[0_12px_40px_rgba(10,166,71,0.08)] hover:border-[#0aa647] transition-all duration-300">
                  
                  <div className="flex items-center gap-4 mb-4">
                    {agent.avatarUrl ? (
                      <img src={agent.avatarUrl} alt={agent.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0 border border-[var(--border-color)]" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-primary)] font-bold text-lg flex-shrink-0 border border-[var(--border-color)]">
                        {agent.firstName?.[0] || 'A'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[var(--text-primary)] text-[15px] leading-tight group-hover:text-[#2d5a3d] transition-colors truncate">
                        {agent.name}
                      </h3>
                      {agent.city && (
                        <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />{agent.city}
                        </p>
                      )}
                    </div>
                  </div>

                  {agent.shortDescription && (
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2 mb-4">
                      {agent.shortDescription}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)] border-t border-[var(--border-color)] pt-3">
                    {agent.activePropertiesCount > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-[#2d5a3d]/60" />
                        {agent.activePropertiesCount} prop.
                      </span>
                    )}
                    <span className="ml-auto text-xs font-medium text-[#2d5a3d] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Ver perfil <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="p-2 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-card)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft className="w-4 h-4 text-[var(--text-secondary)]" />
                </button>
                {Array.from({ length: data.totalPages }, (_, i) => i).slice(Math.max(0, page - 2), Math.min(data.totalPages, page + 3)).map(i => (
                  <button key={i} onClick={() => setPage(i)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === i ? 'bg-[#2d5a3d] text-white shadow-sm' : 'border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'}`}>{i + 1}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))} disabled={page >= data.totalPages - 1}
                  className="p-2 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-card)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}