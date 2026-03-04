'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LocationSearch } from '@/presentation/components/forms/LocationSearch/LocationSearch';

export function SearchBar({ propertyType, district }: { propertyType: string; district: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [transactionType, setTransactionType] = useState<'venta' | 'alquiler'>('alquiler');
  const [selectedType, setSelectedType] = useState(propertyType); // Usar el propertyType directamente
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  console.log('propertyType recibido:', propertyType);
  console.log('selectedType inicial:', selectedType);

  const tipos = [
    { value: 'departamentos', label: 'Departamento' },
    { value: 'casas', label: 'Casa' },
    { value: 'terrenos', label: 'Terreno / Lote' },
    { value: 'locales', label: 'Local comercial' },
    { value: 'oficinas', label: 'Oficina comercial' },
    { value: 'habitaciones', label: 'Habitación' },
  ];

  // Cierra dropdown al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSelect = (location: any) => {
    setSelectedLocation(location);
  };

  const handleSearch = () => {
    console.log('handleSearch - selectedType antes de navegar:', selectedType);
    console.log('handleSearch - transactionType:', transactionType);
    console.log('handleSearch - district:', district);
    
    const params = new URLSearchParams();
    const currentFilters = ['minPrice', 'maxPrice', 'bedrooms', 'bathrooms', 'minArea', 'maxArea', 'parking'];
    currentFilters.forEach(filter => {
      if (searchParams.get(filter)) params.set(filter, searchParams.get(filter)!);
    });
    const slug = selectedLocation
      ? selectedLocation.mainText.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      : district;
    if (selectedLocation) params.set('filtered', '1');
    
    const finalUrl = `/${transactionType}/${selectedType}/${slug}?${params.toString()}`;
    console.log('URL final:', finalUrl);
    
    window.location.href = finalUrl;
  };

  const selectedLabel = tipos.find(t => t.value === selectedType)?.label || 'Tipo';
  console.log('selectedType:', selectedType);
  console.log('selectedLabel:', selectedLabel);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center gap-3 w-full">

        {/* Venta/Alquiler — igual que antes */}
        <div className="flex shrink-0 border border-gray-300 rounded-lg overflow-hidden text-sm font-medium">
          <button
            onClick={() => setTransactionType('venta')}
            className={`px-4 py-3 flex items-center gap-1.5 transition-colors ${
              transactionType === 'venta' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {transactionType === 'venta' && <span>✓</span>}
            Venta
          </button>
          <button
            onClick={() => setTransactionType('alquiler')}
            className={`px-4 py-3 flex items-center gap-1.5 border-l border-gray-300 transition-colors ${
              transactionType === 'alquiler' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {transactionType === 'alquiler' && <span>✓</span>}
            Alquiler
          </button>
        </div>

        {/* Tipo de propiedad — dropdown custom con checkboxes */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center gap-2 cursor-pointer"
          >
            {selectedLabel}
            <svg className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px] py-2">
              <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo de inmueble</p>
              {tipos.map((t) => (
                <button
                  key={t.value}
                  onClick={() => { 
                    console.log('Clic en dropdown - seleccionando:', t.value);
                    setSelectedType(t.value); 
                    // Guardar en localStorage para que los filtros lo sepan
                    localStorage.setItem('selectedPropertyType', t.value);
                    setDropdownOpen(false); 
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                >
                  {/* Checkbox cuadrado */}
                  <span className={`w-4 h-4 border-2 rounded flex items-center justify-center shrink-0 ${
                    selectedType === t.value ? 'bg-green-600 border-green-600' : 'border-gray-400 bg-white'
                  }`}>
                    {selectedType === t.value && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className="text-sm text-gray-700">{t.label}</span>
                </button>
              ))}
              <div className="border-t border-gray-100 mt-2 pt-2 px-4 pb-1 flex gap-2">
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="flex-1 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Limpiar
                </button>
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="flex-1 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Ver resultados
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input ubicación */}
        <div className="flex-1 min-w-0">
          <LocationSearch
            onLocationSelect={handleLocationSelect}
            placeholder="Distrito o zona..."
            defaultValue={district}
            className="w-full"
          />
        </div>

        {/* Botón BUSCAR */}
        <button
          onClick={handleSearch}
          className="px-10 py-3 bg-green-600 text-white rounded-lg text-base font-bold hover:bg-green-700 transition-colors whitespace-nowrap shadow-md shrink-0"
        >
          BUSCAR
        </button>

      </div>
    </div>
  );
}