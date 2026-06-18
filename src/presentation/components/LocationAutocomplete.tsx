'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface LocationAutocompleteProps {
  value?: string;
  onChange: (value: string) => void;
  onPlaceSelected?: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
}

export default function LocationAutocomplete({ 
  value, 
  onChange, 
  onPlaceSelected, 
  placeholder = "Buscar distrito o ciudad...",
  className = "" 
}: LocationAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value || '');
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    if (!window.google || !autocompleteRef.current) return;

    const autocomplete = new window.google.maps.places.AutocompleteService();
    autocompleteServiceRef.current = autocomplete;

    const input = autocompleteRef.current;
    
    const listener = window.google.maps.event.addListener(
      autocomplete,
      'place_changed',
      () => {
        const place = autocomplete.getPlace();
        if (place) {
          const address = place.formatted_address || '';
          const district = place.address_components?.find((comp: any) => 
            comp.types.includes('sublocality') || comp.types.includes('administrative_area_level_3')
          )?.long_name || '';
          
          setInputValue(district || address);
          onChange(district || address);
          
          if (onPlaceSelected) {
            onPlaceSelected(place);
          }
        }
      }
    );

    autocomplete.setFields(['place_id', 'formatted_address', 'address_components']);
    autocomplete.bindTo('input', input);

    return () => {
      window.google.maps.event.removeListener(listener);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onChange(value);
  };

  return (
    <div className="relative">
      <input
        ref={autocompleteRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${className}`}
      />
      <div className="absolute right-3 top-2.5 text-gray-400">
        <MapPin className="w-4 h-4" />
      </div>
    </div>
  );
}
