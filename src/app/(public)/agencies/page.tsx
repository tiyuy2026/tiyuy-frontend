'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Search, MapPin, Users, ChevronLeft, ChevronRight, ArrowRight, Home, FolderGit } from 'lucide-react';
import { publicApiClient } from '@/infrastructure/api/axios-client';

interface PublicAgency {
  id: number;
  slug: string;
  name: string;
  logoUrl: string | null;
  city: string;
  shortDescription: string;
  agentsCount: number;
  activePropertiesCount: number;
  activeProjectsCount: number;
}

interface PageResponse {
  content: PublicAgency[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export default function AgenciesPage() {
  const [data, setData] = useState<PageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [page, setPage] = useState(0);

  const fetchAgencies = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, size: 10 };
      if (search) params.q = search;
      if (city) params.city = city;
      const res = await publicApiClient.get<PageResponse>('/public/agencies', { params });
      setData(res.data);
    } catch { /* empty */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAgencies(); }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchAgencies();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero with SEO */}
      <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-teal-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full tracking-wide uppercase mb-4">
              <Building2 className="w-3.5 h-3.5" /> Directorio
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">Inmobiliarias en Perú</h1>
            <p className="text-lg text-gray-300 mt-4 leading-relaxed">Directorio de empresas inmobiliarias, constructoras y desarrolladores registrados en Tiyuy. Explora sus proyectos, propiedades y descubre quiénes operan en tu ciudad.</p>
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
                placeholder="Buscar por nombre..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" />
            </div>
            <select value={city} onChange={e => { setCity(e.target.value); setPage(0); }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white min-w-[140px]">
              <option value="">Todas las ciudades</option>
              <option value="Lima">Lima</option>
              <option value="Arequipa">Arequipa</option>
              <option value="Cusco">Cusco</option>
              <option value="Trujillo">Trujillo</option>
              <option value="Piura">Piura</option>
              <option value="Ica">Ica</option>
              <option value="Lambayeque">Lambayeque</option>
              <option value="La Libertad">La Libertad</option>
            </select>
            <button type="submit" className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-all">
              Buscar
            </button>
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12"><div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : !data || data.content.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-400">{search || city ? 'No se encontraron inmobiliarias' : 'No hay inmobiliarias registradas'}</p>
            <p className="text-xs text-gray-300 mt-1">{search || city ? 'Intenta con otros términos' : 'Aún no hay inmobiliarias disponibles'}</p>
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-500 mb-4">{data.totalElements} inmobiliarias encontradas</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.content.map((agency) => (
                <Link key={agency.id} href={`/agencies/${agency.slug}`}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all group">
                  <div className="flex items-start gap-4 mb-3">
                    {agency.logoUrl ? (
                      <img src={agency.logoUrl} alt={agency.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-400 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {agency.name?.[0] || 'I'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate group-hover:text-teal-600 transition-colors">{agency.name}</h3>
                      {agency.city && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{agency.city}</p>}
                    </div>
                  </div>
                  {agency.shortDescription && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{agency.shortDescription}</p>}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {agency.activeProjectsCount > 0 && <span className="flex items-center gap-1"><FolderGit className="w-3 h-3" />{agency.activeProjectsCount} proy.</span>}
                      {agency.activePropertiesCount > 0 && <span className="flex items-center gap-1"><Home className="w-3 h-3" />{agency.activePropertiesCount} prop.</span>}
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{agency.agentsCount} agentes</span>
                    </div>
                    <span className="text-xs font-semibold text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Ver perfil <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: data.totalPages }, (_, i) => i).slice(Math.max(0, page - 2), Math.min(data.totalPages, page + 3)).map(i => (
                  <button key={i} onClick={() => setPage(i)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === i ? 'bg-teal-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{i + 1}</button>
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