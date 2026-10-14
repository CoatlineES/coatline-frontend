import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check, Search, Settings } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { SectorItem } from '../../services/sectors.service';

interface SectorMultiSelectProps {
  selectedSectors: string[];
  onChange: (sectors: string[]) => void;
  sectors: SectorItem[];
  onOpenManageModal?: () => void;
  placeholder?: string;
  className?: string;
}

export function SectorMultiSelect({
  selectedSectors = [],
  onChange,
  sectors = [],
  onOpenManageModal,
  placeholder = 'Todos',
  className = ''
}: SectorMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSector = (sectorName: string) => {
    const isSelected = selectedSectors.includes(sectorName);
    if (isSelected) {
      onChange(selectedSectors.filter(s => s !== sectorName));
    } else {
      onChange([...selectedSectors, sectorName]);
    }
  };

  const selectAll = () => {
    onChange(sectors.map(s => s.name));
  };

  const clearAll = () => {
    onChange([]);
  };

  const filteredSectors = sectors.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm flex items-center gap-2 cursor-pointer hover:border-slate-300 transition-colors select-none"
      >
        <span className="text-xs font-semibold text-slate-500 uppercase shrink-0">
          Sector:
        </span>

        <div className="flex items-center gap-1.5 min-w-[110px] max-w-[200px] overflow-hidden">
          {selectedSectors.length === 0 ? (
            <span className="text-sm font-medium text-slate-400">
              {placeholder}
            </span>
          ) : selectedSectors.length === 1 ? (
            <span className="text-sm font-semibold text-slate-800 truncate" title={selectedSectors[0]}>
              {selectedSectors[0]}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold shrink-0">
              {selectedSectors.length} seleccionados
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-auto">
          {selectedSectors.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              className="p-0.5 text-slate-400 hover:text-red-500 rounded transition-colors"
              title="Borrar filtro de sectores"
            >
              <X size={13} />
            </button>
          )}
          <ChevronDown
            size={14}
            className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-1.5 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-[110] overflow-hidden flex flex-col max-h-[380px]"
          >
            {/* Search Input */}
            <div className="p-2.5 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-xs">
                <Search size={14} className="text-slate-400 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar sectores..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-xs bg-transparent outline-none text-slate-700 placeholder-slate-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between mt-2 pt-1 text-[11px] font-semibold text-slate-500">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                >
                  Seleccionar todos
                </button>
                {selectedSectors.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Limpiar ({selectedSectors.length})
                  </button>
                )}
              </div>
            </div>

            {/* Sectors Checkbox List */}
            <div className="overflow-y-auto custom-scrollbar flex-1 py-1 max-h-[220px]">
              {filteredSectors.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No se encontraron sectores
                </div>
              ) : (
                filteredSectors.map((sector) => {
                  const isChecked = selectedSectors.includes(sector.name);
                  return (
                    <div
                      key={sector.name}
                      onClick={() => toggleSector(sector.name)}
                      className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        isChecked ? 'bg-blue-50/70 font-semibold text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                            isChecked
                              ? 'bg-[#001c3a] border-[#001c3a] text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check size={11} strokeWidth={3} />}
                        </div>
                        <span className="truncate">{sector.name}</span>
                      </div>

                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-medium ${
                          sector.count > 0
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}
                      >
                        {sector.count}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Dropdown Footer: Manage Sectors Button */}
            {onOpenManageModal && (
              <div className="p-2 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenManageModal();
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-slate-700 hover:text-[#001c3a] hover:bg-white bg-slate-100 border border-slate-200 rounded-lg transition-all shadow-xs cursor-pointer"
                >
                  <Settings size={13} className="text-slate-500" />
                  Gestionar catálogo de sectores
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
