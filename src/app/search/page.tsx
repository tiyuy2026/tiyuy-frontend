'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, User, Building, ArrowLeft, Loader2 } from 'lucide-react';

// Tipos de resultados de búsqueda
type SearchResult = {
  id: string;
  type: 'property' | 'user' | 'agent';
  title: string;
  subtitle: string;
  image?: string;
  url: string;
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';

  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'properties' | 'users' | 'agents'>(
    type as any || 'all'
  );

  // Simular búsqueda (aquí se conectaría con la API real)
  useEffect(() => {
    if (!query) return;

    setIsLoading(true);

    // Simulación de resultados de búsqueda
    // En producción, esto sería una llamada a la API
    const mockResults: SearchResult[] = [
      {
        id: '1',
        type: 'property',
        title: 'Departamento en Miraflores',
        subtitle: '3 dormitorios · 120m² · S/ 450,000',
        url: '/property/1',
      },
      {
        id: '2',
        type: 'agent',
        title: 'Carlos Mendoza',
        subtitle: 'Agente inmobiliario · 15 propiedades',
        url: '/agent/1',
      },
      {
        id: '3',
        type: 'property',
        title: 'Casa en San Isidro',
        subtitle: '4 dormitorios · 200m² · S/ 850,000',
        url: '/property/2',
      },
    ];

    // Filtrar resultados según el tipo
    const filteredResults = mockResults.filter((result) => {
      if (activeTab === 'all') return true;
      if (activeTab === 'properties') return result.type === 'property';
      if (activeTab === 'users' || activeTab === 'agents') {
        return result.type === 'user' || result.type === 'agent';
      }
      return true;
    });

    // Simular delay de red
    setTimeout(() => {
      setResults(filteredResults);
      setIsLoading(false);
    }, 500);
  }, [query, activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const params = new URLSearchParams();
    params.set('q', searchQuery);
    if (activeTab !== 'all') {
      params.set('type', activeTab);
    }
    router.push(`/search?${params.toString()}`);
  };

  const getTabCount = (tab: 'all' | 'properties' | 'users' | 'agents') => {
    if (tab === 'all') return results.length;
    if (tab === 'properties') return results.filter((r) => r.type === 'property').length;
    if (tab === 'users' || tab === 'agents') {
      return results.filter((r) => r.type === 'user' || r.type === 'agent').length;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuarios, propiedades, agentes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-transparent rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-teal-500 transition-all"
                autoFocus
              />
            </form>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-6">
            {(['all', 'properties', 'agents'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  const params = new URLSearchParams();
                  if (query) params.set('q', query);
                  if (tab !== 'all') params.set('type', tab);
                  router.push(`/search?${params.toString()}`);
                }}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'all' && 'Todo'}
                {tab === 'properties' && 'Propiedades'}
                {tab === 'agents' && 'Agentes'}
                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {getTabCount(tab)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {query ? `No se encontraron resultados para "${query}"` : 'Inicia una búsqueda'}
            </h3>
            <p className="text-gray-500">
              {query
                ? 'Intenta con otros términos de búsqueda'
                : 'Escribe en el buscador para encontrar usuarios, propiedades o agentes'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <Link
                key={result.id}
                href={result.url}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-sm transition-all"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {result.type === 'property' ? (
                    <Building className="w-6 h-6 text-gray-400" />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{result.title}</h4>
                  <p className="text-sm text-gray-500">{result.subtitle}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                  {result.type === 'property' ? 'Propiedad' : result.type === 'agent' ? 'Agente' : 'Usuario'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
