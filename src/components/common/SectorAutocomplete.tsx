import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const PREDEFINED_SECTORS = [
  'Constructoras',
  'Comunidades de Propietarios',
  'Instituciones Públicas',
  'Naves Industriales',
  'Hoteles / Centros Comerciales',
  'Particulares'
];

interface SectorAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  existingSectors?: string[];
}

export function SectorAutocomplete({ value, onChange, placeholder = 'Ej. Constructoras', className = '', existingSectors = [] }: SectorAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Combine sectors: if existingSectors is passed with items, use those; otherwise fallback to default
  const sourceSectors = (existingSectors && existingSectors.length > 0) ? existingSectors : PREDEFINED_SECTORS;
  const allSectorsMap = new Map<string, string>();
  sourceSectors.forEach(sector => {
    if (sector) {
      const normalized = sector.trim().toLowerCase();
      if (!allSectorsMap.has(normalized)) {
        allSectorsMap.set(normalized, sector.trim());
      }
    }
  });
  const allSectors = Array.from(allSectorsMap.values());

  // Filter options based on current value, but show all if value is empty or exact match
  const isExactMatch = allSectors.some(s => s.toLowerCase() === value.toLowerCase());
  const filteredOptions = (!value || isExactMatch) 
    ? allSectors 
    : allSectors.filter(sector => sector.toLowerCase().includes(value.toLowerCase()));

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative flex items-center w-full">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full pr-14 ${className}`}
        />
        <div className="absolute right-2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                setIsOpen(true);
              }}
              className="text-slate-400 hover:text-red-500 focus:outline-none transition-colors p-1"
              title="Borrar sector"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-400 hover:text-slate-600 focus:outline-none p-1"
          >
            <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
          >
            <ul className="max-h-60 overflow-y-auto py-1 hide-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((sector) => (
                  <li
                    key={sector}
                    onClick={() => {
                      onChange(sector);
                      setIsOpen(false);
                    }}
                    className="px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                  >
                    {sector}
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 text-sm text-slate-400 italic text-center">
                  Presiona Enter para usar "{value}"
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
