'use client';

import { useState } from 'react';
import { Group, Channel, ViewType } from '../types';

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
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
      {/* Header with avatar and count */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white text-xl font-bold">
          {item.name[0]}
        </div>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          {memberCount} {memberLabel}
        </span>
      </div>

      {/* Item information */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
      
      {/* Additional info for channels */}
      {city && (
        <p className="text-sm text-gray-500 mb-4">
          {city}
        </p>
      )}
      
      {/* Status indicator */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {item.isActive ? 'Activo' : 'Inactivo'}
        </span>
        {/* Type indicator for suspended view */}
        {viewType === 'suspended' && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isChannel
              ? 'bg-purple-100 text-purple-800'
              : 'bg-orange-100 text-orange-800'
          }`}>
            {isChannel ? 'Canal' : 'Grupo'}
          </span>
        )}
      </div>

      {/* Action buttons with dropdown */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {/* Status indicator with elegant design */}
          <div className={`w-2 h-2 rounded-full ${
            item.isActive ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-xs text-gray-500">
            {item.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        
        {/* Three dots dropdown menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
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
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reactivar
                  </button>
                  <button
                    onClick={() => {
                      onViewDetails(item);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
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
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver Detalles
                  </button>
                  <button
                    onClick={() => {
                      onToggleStatus(item);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-50 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    {item.isActive ? 'Deshabilitar' : 'Habilitar'}
                  </button>
                  <button
                    onClick={() => {
                      onSuspend(item);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-orange-700 hover:bg-orange-50 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Suspender
                  </button>
                  <button
                    onClick={() => {
                      onViolation(item);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
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
