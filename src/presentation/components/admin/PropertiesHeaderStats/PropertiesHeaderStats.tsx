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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 px-0 sm:px-4">
      {/* Card 1: Título - full width on mobile */}
      <div className="col-span-2 sm:col-span-3 lg:col-span-1 bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
        <h1 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 leading-tight">Gestión de Propiedades</h1>
        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Modera y administra las propiedades</p>
      </div>

      {/* Card 2: Total Propiedades */}
      <div className="bg-white rounded-xl p-2 sm:p-3 border border-gray-200 shadow-sm flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
          <Home className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] sm:text-xs text-gray-500 uppercase font-medium tracking-wide truncate">Total</p>
          <p className="text-base sm:text-xl font-bold text-gray-900">{totalProperties}</p>
        </div>
      </div>

      {/* Card 3: Publicadas */}
      <div className="bg-white rounded-xl p-2 sm:p-3 border border-gray-200 shadow-sm flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] sm:text-xs text-gray-500 uppercase font-medium tracking-wide truncate">Publicadas</p>
          <p className="text-base sm:text-xl font-bold text-gray-900">{publishedProperties}</p>
        </div>
      </div>

      {/* Card 4: Borradores */}
      <div className="bg-white rounded-xl p-2 sm:p-3 border border-gray-200 shadow-sm flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
          <SquarePen className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] sm:text-xs text-gray-500 uppercase font-medium tracking-wide truncate">Borradores</p>
          <p className="text-base sm:text-xl font-bold text-gray-900">{draftProperties}</p>
        </div>
      </div>

      {/* Card 5: Vistas Totales */}
      <div className="bg-white rounded-xl p-2 sm:p-3 border border-gray-200 shadow-sm flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
          <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] sm:text-xs text-gray-500 uppercase font-medium tracking-wide truncate">Vistas</p>
          <p className="text-base sm:text-xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
        </div>
      </div>

      {/* Card 6: Reportes */}
      <div className="bg-white rounded-xl p-2 sm:p-3 border border-gray-200 shadow-sm flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
          <TriangleAlert className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] sm:text-xs text-gray-500 uppercase font-medium tracking-wide truncate">Reportes</p>
          <p className="text-base sm:text-xl font-bold text-gray-900">{totalReports}</p>
        </div>
      </div>
    </div>
  );
}
