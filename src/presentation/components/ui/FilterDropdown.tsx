import { useState } from 'react';

interface FilterDropdownProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
}

export default function FilterDropdown({ value, options, onChange, className = '' }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-white border border-gray-200 rounded-lg text-sm px-4 py-2 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer shadow-sm ${className}`}
      >
        {selectedOption.label}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => { onChange(option.value); setIsOpen(false); }}
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm"
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
