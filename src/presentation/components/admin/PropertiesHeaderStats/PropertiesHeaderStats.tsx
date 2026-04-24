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
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-medium tracking-wide">Total Propiedades</p>
          <p className="text-xl font-bold text-gray-900">{totalProperties}</p>
        </div>
      </div>

      {/* Card 3: Publicadas */}
      <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-medium tracking-wide">Publicadas</p>
          <p className="text-xl font-bold text-gray-900">{publishedProperties}</p>
        </div>
      </div>

      {/* Card 4: Borradores */}
      <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-medium tracking-wide">Borradores</p>
          <p className="text-xl font-bold text-gray-900">{draftProperties}</p>
        </div>
      </div>

      {/* Card 5: Vistas Totales */}
      <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-medium tracking-wide">Vistas Totales</p>
          <p className="text-xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
        </div>
      </div>

      {/* Card 6: Reportes */}
      <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-medium tracking-wide">Reportes</p>
          <p className="text-xl font-bold text-gray-900">{totalReports}</p>
        </div>
      </div>
    </div>
  );
}
