'use client';

import { useState, useEffect } from 'react';
import { useMessageLifetimes, MessageLifetime } from '@/presentation/hooks/useMessageLifetimes';

interface MessageLifetimeOption {
  name: string;
  hours: number;
  description: string;
  isTemporary: boolean;
  isDefault: boolean;
}

interface MessageLifetimeSelectorProps {
  selectedLifetime?: string;
  onLifetimeChange?: (lifetime: MessageLifetime | MessageLifetimeOption) => void;
  customHours?: number;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageLifetimeSelector({ 
  selectedLifetime, 
  onLifetimeChange, 
  customHours, 
  disabled = false,
  placeholder = "Selecciona duración" 
}: MessageLifetimeSelectorProps) {
  const { lifetimes, isLoading } = useMessageLifetimes();
  const [customHoursInput, setCustomHoursInput] = useState<number | ''>(customHours || '');

  const selectedLifetimeObj = lifetimes.find(l => l.name === selectedLifetime);

  useEffect(() => {
    if (selectedLifetime && selectedLifetimeObj) {
      onLifetimeChange?.(selectedLifetimeObj);
    }
  }, [selectedLifetime, lifetimes.length]);

  const handleLifetimeChange = (lifetime: MessageLifetime | MessageLifetimeOption) => {
    onLifetimeChange?.(lifetime);
  };

  const handleCustomHoursChange = (hours: string) => {
    const hoursNum = parseInt(hours) || 0;
    if (hoursNum > 0 && hoursNum <= 168) {
      setCustomHoursInput(hoursNum);
      const customLifetime: MessageLifetimeOption = {
        name: 'custom',
        hours: hoursNum,
        description: `${hoursNum} horas`,
        isTemporary: true,
        isDefault: false,
      };
      onLifetimeChange?.(customLifetime);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Selector de duraciones predefinidas */}
      <select
        value={selectedLifetime || ''}
        onChange={(e) => {
          const selected = lifetimes.find(l => l.name === e.target.value);
          if (selected) handleLifetimeChange(selected);
        }}
        disabled={disabled || isLoading}
        className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isLoading ? 'Cargando...' : (
          <>
            <option value="">{placeholder}</option>
            {lifetimes.map((lifetime, index) => (
              <option key={index} value={lifetime.name}>
                {lifetime.description}
              </option>
            ))}
          </>
        )}
      </select>

      {/* Input para horas personalizadas */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="1"
          max="168" // Máximo 7 días
          placeholder="Horas personalizadas"
          value={customHoursInput}
          onChange={(e) => handleCustomHoursChange(e.target.value)}
          disabled={disabled || !selectedLifetimeObj?.isTemporary}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <span className="text-xs text-gray-500">horas</span>
      </div>

      {/* Vista previa del tiempo restante */}
      {selectedLifetime && (
        <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-600">
            Tiempo restante: {selectedLifetimeObj?.hours ?? 0}h
          </div>
        </div>
      )}
    </div>
  );
}
