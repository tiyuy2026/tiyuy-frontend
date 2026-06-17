'use client';

import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

export default function CreateGroupView({ user, onBack }: { user: any; onBack: () => void }) {
  return (
    <div className="h-full bg-white p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Grupo</h2>
          <button 
            onClick={onBack}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="text-center py-8">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">Grupos</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Crear Nuevo Grupo</h3>
          <p className="text-gray-600 text-sm text-center max-w-md leading-relaxed mb-8">
            Crea tu propio grupo inmobiliario y conecta con otros profesionales
          </p>
          <button className="bg-brand text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Crear Grupo
          </button>
        </div>
      </div>
    </div>
  );
}
