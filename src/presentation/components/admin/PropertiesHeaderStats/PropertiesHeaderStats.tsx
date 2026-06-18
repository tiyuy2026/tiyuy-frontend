import { Check, Eye, Home, SquarePen, TriangleAlert } from 'lucide-react';
/**
 * Properties Header Stats Component
 * Muestra las tarjetas de estadísticas de propiedades en el header
 */

interface PropertiesHeaderStatsProps {
  totalProperties: number;
  publishedProperties: number;
  draftProperties: number;
  totalViews: number;
  totalReports: number;
}

export function PropertiesHeaderStats({
  totalProperties,
  publishedProperties,
  draftProperties,
  totalViews,
  totalReports
}: PropertiesHeaderStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 px-4">
      {/* Card 1: Título */}
      <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
        <h1 className="text-lg font-bold text-gray-900">Gestión de Propiedades</h1>
        <p className="text-xs text-gray-500 mt-0.5">Modera y administra las propiedades</p>
      </div>

      {/* Card 2: Total Propiedades */}
      <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
          <Home className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-medium tracking-wide">Total Propiedades</p>
          <p className="text-xl font-bold text-gray-900">{totalProperties}</p>
        </div>
      </div>

      {/* Card 3: Publicadas */}
      <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <Check className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-medium tracking-wide">Publicadas</p>
          <p className="text-xl font-bold text-gray-900">{publishedProperties}</p>
        </div>
      </div>

      {/* Card 4: Borradores */}
      <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
          <SquarePen className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-medium tracking-wide">Borradores</p>
          <p className="text-xl font-bold text-gray-900">{draftProperties}</p>
        </div>
      </div>

      {/* Card 5: Vistas Totales */}
      <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
          <Eye className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-medium tracking-wide">Vistas Totales</p>
          <p className="text-xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
        </div>
      </div>

      {/* Card 6: Reportes */}
      <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
          <TriangleAlert className="w-5 h-5 text-rose-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-medium tracking-wide">Reportes</p>
          <p className="text-xl font-bold text-gray-900">{totalReports}</p>
        </div>
      </div>
    </div>
  );
}
