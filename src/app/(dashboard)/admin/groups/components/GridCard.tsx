'use client';

import { useState } from 'react';
import { Group, Channel, ViewType } from '../types';
import { MoreVertical, RefreshCw, Eye, Ban, PauseCircle, AlertTriangle } from 'lucide-react';

interface GridCardProps {
  item: Group | Channel;
  viewType: ViewType;
  onReactivate: (item: Group | Channel) => void;
  onViewDetails: (item: Group | Channel) => void;
  onToggleStatus: (item: Group | Channel) => void;
  onSuspend: (item: Group | Channel) => void;
  onViolation: (item: Group | Channel) => void;
}

export function GridCard({
  item,
  viewType,
  onReactivate,
  onViewDetails,
  onToggleStatus,
  onSuspend,
  onViolation,
}: GridCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const isChannel = 'city' in item;
  const isGroup = !isChannel;
  const memberCount = isChannel ? (item as Channel).subscriberCount : (item as Group).memberCount;
  const memberLabel = isChannel ? 'suscriptores' : 'miembros';
  const city = isChannel ? (item as Channel).city : null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-6 hover:shadow-lg transition-shadow">
      {/* Header with avatar and count */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white text-sm sm:text-xl font-bold flex-shrink-0">
          {item.name[0]}
        </div>
        <span className="px-1.5 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-800 rounded-full text-[9px] sm:text-xs font-medium flex-shrink-0">
          {memberCount} {memberLabel}
        </span>
      </div>

      {/* Item information */}
      <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2 truncate">{item.name}</h3>
      <p className="text-gray-600 text-[10px] sm:text-sm mb-2 sm:mb-4 line-clamp-2">{item.description}</p>
      
      {/* Additional info for channels */}
      {city && (
        <p className="text-[10px] sm:text-sm text-gray-500 mb-2 sm:mb-4">
          {city}
        </p>
      )}
      
      {/* Status indicator */}
      <div className="mb-3 sm:mb-4 flex gap-1 sm:gap-2 flex-wrap">
        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-medium ${
          item.isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {item.isActive ? 'Activo' : 'Inactivo'}
        </span>
        {/* Type indicator for suspended view */}
        {viewType === 'suspended' && (
          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-medium ${
            isChannel
              ? 'bg-purple-100 text-purple-800'
              : 'bg-orange-100 text-orange-800'
          }`}>
            {isChannel ? 'Canal' : 'Grupo'}
          </span>
        )}
      </div>

      {/* Action buttons with dropdown */}
      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Status indicator with elegant design */}
          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
            item.isActive ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-[9px] sm:text-xs text-gray-500">
            {item.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        
        {/* Three dots dropdown menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-gray-600" />
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 bottom-full mb-2 w-40 sm:w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-10 overflow-hidden">
              {viewType === 'suspended' ? (
                <>
                  <button
                    onClick={() => {
                      onReactivate(item);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-sm font-medium text-green-700 hover:bg-green-50 transition-colors flex items-center gap-1 sm:gap-2"
                  >
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    Reactivar
                  </button>
                  <button
                    onClick={() => {
                      onViewDetails(item);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-1 sm:gap-2"
                  >
<Eye className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                    Ver Detalles
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onViewDetails(item);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-1 sm:gap-2"
                  >
<Eye className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                    Ver Detalles
                  </button>
                  <button
                    onClick={() => {
                      onToggleStatus(item);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-sm font-medium text-yellow-700 hover:bg-yellow-50 transition-colors flex items-center gap-1 sm:gap-2"
                  >
                    <Ban className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                    {item.isActive ? 'Deshabilitar' : 'Habilitar'}
                  </button>
                  <button
                    onClick={() => {
                      onSuspend(item);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-sm font-medium text-orange-700 hover:bg-orange-50 transition-colors flex items-center gap-1 sm:gap-2"
                  >
                    <PauseCircle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                    Suspender
                  </button>
                  <button
                    onClick={() => {
                      onViolation(item);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-sm font-medium text-red-700 hover:bg-red-50 transition-colors flex items-center gap-1 sm:gap-2"
                  >
                    <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                    Violación
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Close dropdown when clicking outside */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
