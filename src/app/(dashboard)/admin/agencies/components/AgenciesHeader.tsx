'use client';

import { Download } from 'lucide-react';

interface AgenciesHeaderProps {
  onExport?: () => void;
}

export default function AgenciesHeader({ onExport }: AgenciesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
      <div>
        <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Gestión de Inmobiliarias</h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Administra, supervisa y controla todas las inmobiliarias de la plataforma</p>
      </div>
      <button
        onClick={onExport}
        className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition text-xs sm:text-sm w-full sm:w-auto justify-center"
      >
        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="font-medium text-gray-700">Exportar</span>
      </button>
    </div>
  );
}
