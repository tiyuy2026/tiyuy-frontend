'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';;
import { Button } from '@/presentation/components/ui/Button';
import { ProjectAdminItem } from '@/core/domain/entities/Admin';

// Custom Dropdown Component con diseño corporativo
interface DropdownOption {
  value: string;
  label: string;
}

function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar',
}: {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <span>{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="py-1 max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-sm text-left transition-all hover:bg-gradient-to-r hover:from-blue-500 hover:to-teal-500 hover:text-white ${
                  value === option.value
                    ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white font-medium'
                    : 'text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ModerationModalProps {
  project: ProjectAdminItem;
  onConfirm: (action: 'APPROVE' | 'REJECT' | 'SUSPEND' | 'ACTIVATE' | 'DEACTIVATE', reason?: string) => void;
  onCancel: () => void;
}

const actionOptions: DropdownOption[] = [
  { value: 'APPROVE', label: 'Aprobar' },
  { value: 'REJECT', label: 'Rechazar' },
  { value: 'SUSPEND', label: 'Suspender' },
  { value: 'ACTIVATE', label: 'Activar' },
  { value: 'DEACTIVATE', label: 'Desactivar' },
];

export function ModerationModal({ project, onConfirm, onCancel }: ModerationModalProps) {
  const [action, setAction] = useState<'APPROVE' | 'REJECT' | 'SUSPEND' | 'ACTIVATE' | 'DEACTIVATE'>('APPROVE');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(action, reason);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden mx-2 sm:mx-0">
      {/* Header con verde encendido */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-green-300 bg-[#00E676] rounded-t-2xl">
        <h3 className="text-base sm:text-lg font-bold text-gray-800">Moderar Proyecto</h3>
        <button
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-900 transition-colors p-1 hover:bg-green-300 rounded-lg"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      <div className="p-4 sm:p-6">
        <div className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
          Moderando: <strong className="text-gray-800 break-words">{project.name}</strong>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Acción</label>
            <CustomDropdown
              options={actionOptions}
              value={action}
              onChange={(value) => setAction(value as any)}
            />
          </div>
          
          {(action === 'REJECT' || action === 'SUSPEND') && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Motivo</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder={`Motivo para ${action.toLowerCase()}...`}
                required
              />
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
            <Button type="submit" variant={action === 'APPROVE' || action === 'ACTIVATE' ? 'primary' : 'danger'} className="text-xs sm:text-sm w-full sm:w-auto">
              {action === 'APPROVE' ? 'Aprobar' : action === 'REJECT' ? 'Rechazar' : action === 'SUSPEND' ? 'Suspender' : action === 'ACTIVATE' ? 'Activar' : 'Desactivar'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="text-xs sm:text-sm w-full sm:w-auto">
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
