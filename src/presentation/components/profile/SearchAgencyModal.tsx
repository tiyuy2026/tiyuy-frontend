'use client';

import { useState } from 'react';
import { Search, MapPin, Building2, Users, CreditCard, X, AlertCircle } from 'lucide-react';
import { useSearchDevelopers } from '@/presentation/hooks/admin/useDeveloperAssociations';
import { DeveloperResponse } from '@/core/domain/entities/Admin';
import { Modal } from '@/presentation/components/ui/Modal';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { Spinner } from '@/presentation/components/ui/Spinner';

interface SearchAgencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestAssociation: (developerId: number, notes?: string) => void;
  isPending: boolean;
}

export default function SearchAgencyModal({
  isOpen,
  onClose,
  onRequestAssociation,
  isPending
}: SearchAgencyModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [selectedAgency, setSelectedAgency] = useState<DeveloperResponse | null>(null);
  const [notes, setNotes] = useState('');

  const { data: searchResults, isLoading: isSearching, error: searchError } = useSearchDevelopers({
    query: searchQuery,
    city: cityFilter,
    page: 0,
    size: 20,
  });

  // Debug logging
  console.log('SearchAgencyModal - searchResults:', searchResults);
  console.log('SearchAgencyModal - isSearching:', isSearching);
  console.log('SearchAgencyModal - searchError:', searchError);
  console.log('SearchAgencyModal - searchQuery:', searchQuery, 'cityFilter:', cityFilter);

  const agencies = searchResults?.content || [];

  const handleSelectAgency = (agency: DeveloperResponse) => {
    setSelectedAgency(agency);
  };

  const handleSubmitRequest = () => {
    if (selectedAgency) {
      onRequestAssociation(selectedAgency.id, notes);
      setSelectedAgency(null);
      setNotes('');
      setSearchQuery('');
      setCityFilter('');
    }
  };

  const handleClose = () => {
    setSelectedAgency(null);
    setNotes('');
    setSearchQuery('');
    setCityFilter('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Buscar Inmobiliaria</h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {!selectedAgency ? (
          // Vista de búsqueda
          <div className="space-y-4">
            {/* Filtros de búsqueda */}
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por nombre o RUC..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Todas las ciudades</option>
                <option value="Lima">Lima</option>
                <option value="Arequipa">Arequipa</option>
                <option value="Cusco">Cusco</option>
                <option value="Trujillo">Trujillo</option>
              </select>
            </div>

            {/* Resultados */}
            {isSearching ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : searchError ? (
              <div className="text-center py-12 text-red-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-300" />
                <p className="font-medium mb-2">Error al buscar inmobiliarias</p>
                <p className="text-sm">{searchError instanceof Error ? searchError.message : 'Error desconocido'}</p>
                <p className="text-xs text-gray-400 mt-2">Revisa la consola para más detalles</p>
              </div>
            ) : agencies.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                {searchQuery || cityFilter ? (
                  <>
                    <p className="font-medium mb-2">No se encontraron inmobiliarias</p>
                    <p className="text-sm">Intenta con otros términos de búsqueda</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium mb-2">No hay inmobiliarias registradas</p>
                    <p className="text-sm">Aún no hay inmobiliarias disponibles para asociarse</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {agencies.map((agency) => (
                  <div
                    key={agency.id}
                    onClick={() => handleSelectAgency(agency)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 cursor-pointer transition"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {agency.companyName?.[0] || 'I'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 truncate">{agency.companyName}</p>
                          {agency.enabled && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs rounded-full">
                              Activo
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">RUC: {agency.ruc || '-'}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {agency.totalAgents || 0} agentes
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Vista de confirmación
          <div className="space-y-6">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {selectedAgency.companyName?.[0] || 'I'}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-900">{selectedAgency.companyName}</p>
                  <p className="text-sm text-gray-600">RUC: {selectedAgency.ruc || '-'}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {selectedAgency.totalAgents || 0} agentes
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAgency(null)}
                  className="p-1 hover:bg-gray-200 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Añade alguna nota sobre por qué quieres asociarte a esta inmobiliaria..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Esta nota será visible para la inmobiliaria al revisar tu solicitud
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedAgency(null)}
                className="flex-1"
              >
                Volver
              </Button>
              <Button
                onClick={handleSubmitRequest}
                disabled={isPending}
                className="flex-1 bg-teal-600 hover:bg-teal-700"
              >
                {isPending ? 'Enviando...' : 'Enviar solicitud'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
