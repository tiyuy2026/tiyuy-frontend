'use client';

import { Download } from 'lucide-react';

interface AgenciesHeaderProps {
  onExport?: () => void;
}

export default function AgenciesHeader({ onExport }: AgenciesHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Inmobiliarias</h1>
        <p className="text-gray-600 mt-1">Administra, supervisa y controla todas las inmobiliarias de la plataforma</p>
      </div>
      <button
        onClick={onExport}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
      >
        <Download className="w-4 h-4" />
        <span className="text-sm font-medium text-gray-700">Exportar</span>
      </button>
    </div>
  );
}
