import React, { useState, useEffect } from 'react';
import { X, Search, Package, Check, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { resourcesService, Resource, ResourceType } from '../../../services/resources.service';
import { useCurrency } from '../../../hooks/useCurrency';

interface ApuPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (apu: Resource) => void;
  resourceType?: ResourceType;
  title?: string;
}

export default function ApuPickerModal({ isOpen, onClose, onSelect, resourceType, title = 'Seleccionar APU de la Biblioteca' }: ApuPickerModalProps) {
  const { formatCurrency } = useCurrency();
  const [apus, setApus] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      resourcesService.getAll({ resourceType })
        .then(data => setApus(data.filter(a => a.isActive)))
        .catch(err => console.error('Error fetching APUs', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, resourceType]);

  if (!isOpen) return null;

  const filteredApus = apus.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    (a.code && a.code.toLowerCase().includes(search.toLowerCase()))
  );

  

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
            <h3 className="text-lg font-bold text-[#001c3a] flex items-center gap-2">
              <Package size={20} className="text-amber-500" />
              {title}
            </h3>
            <button onClick={onClose} className="p-1 text-slate-400 hover:bg-slate-200 rounded-md transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por código o nombre..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 focus:border-[#001c3a] transition-all"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center items-center h-32 text-slate-400">
                <span className="animate-pulse">Cargando biblioteca...</span>
              </div>
            ) : filteredApus.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                No se encontraron APUs que coincidan con la búsqueda.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredApus.map(apu => (
                  <div 
                    key={apu.id}
                    className="group flex justify-between items-center p-4 bg-white border border-slate-200 rounded-xl hover:border-[#001c3a]/30 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => { onSelect(apu); onClose(); }}
                  >
                    <div className="flex flex-col flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        {apu.code && <span className="text-xs font-bold text-[#001c3a] bg-[#001c3a]/10 px-2 py-0.5 rounded uppercase tracking-wider">{apu.code}</span>}
                        {apu.isGroup && resourceType === ResourceType.PARTIDA && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider"><Layers size={10}/> Agrupada</span>}
                        <span className="font-bold text-slate-800">{apu.name}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{apu.notes || 'Sin descripción'}</p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm font-bold text-[#001c3a]">{formatCurrency(apu.salesPrice || apu.unitCost)}</div>
                        <div className="text-xs font-semibold text-slate-400">/{apu.unit}</div>
                      </div>
                      <button className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-400 group-hover:bg-[#001c3a] group-hover:text-white transition-colors">
                        <Check size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
