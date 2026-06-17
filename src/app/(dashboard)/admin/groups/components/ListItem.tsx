'use client';

import { useState } from 'react';
import { Group, Channel, ViewType } from '../types';
import { Ban, Clock, Eye, MoreVertical, RefreshCw, TriangleAlert } from 'lucide-react';;

interface ListItemProps {
  item: Group | Channel;
  viewType: ViewType;
  onReactivate: (item: Group | Channel) => void;
  onViewDetails: (item: Group | Channel) => void;
  onToggleStatus: (item: Group | Channel) => void;
  onSuspend: (item: Group | Channel) => void;
  onViolation: (item: Group | Channel) => void;
}

export function ListItem({
  item,
  viewType,
  onReactivate,
  onViewDetails,
  onToggleStatus,
  onSuspend,
  onViolation,
}: ListItemProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const isChannel = 'city' in item;
  const isGroup = !isChannel;
  const memberCount = isChannel ? (item as Channel).subscriberCount : (item as Group).memberCount;
  const memberLabel = isChannel ? 'suscriptores' : 'miembros';
  const city = isChannel ? (item as Channel).city : null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold flex-shrink-0">
            {item.name[0]}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
              {/* Status badge */}
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                item.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {item.isActive ? 'Activo' : 'Inactivo'}
              </span>
              {/* Type badge for suspended view */}
              {viewType === 'suspended' && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  isChannel
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {isChannel ? 'Canal' : 'Grupo'}
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm truncate">{item.description}</p>
            {city && (
              <p className="text-sm text-gray-500">
                {city}
              </p>
            )}
          </div>
          
          {/* Members count */}
          <div className="text-right flex-shrink-0">
            <span className="text-sm font-medium text-gray-900">
              {memberCount}
            </span>
            <p className="text-xs text-gray-500">
              {memberLabel}
            </p>
          </div>
          
          {/* Three dots dropdown menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-10 overflow-hidden">
                {viewType === 'suspended' ? (
                  <>
                    <button
                      onClick={() => {
                        onReactivate(item);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50 transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4 text-green-600" />
                      Reactivar
                    </button>
                    <button
                      onClick={() => {
                        onViewDetails(item);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
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
                      className="w-full text-left px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                      Ver Detalles
                    </button>
                    <button
                      onClick={() => {
                        onToggleStatus(item);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-50 transition-colors flex items-center gap-2"
                    >
                      <Ban className="w-4 h-4 text-yellow-600" />
                      {item.isActive ? 'Deshabilitar' : 'Habilitar'}
                    </button>
                    <button
                      onClick={() => {
                        onSuspend(item);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm font-medium text-orange-700 hover:bg-orange-50 transition-colors flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4 text-orange-600" />
                      Suspender
                    </button>
                    <button
                      onClick={() => {
                        onViolation(item);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <TriangleAlert className="w-4 h-4 text-red-600" />
                      Violación
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
