import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Tag, RefreshCw, AlertCircle, Sparkles, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { sectorsService, SectorItem } from '../../services/sectors.service';

interface ManageSectorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectors: SectorItem[];
  onSectorsUpdated: (newSectors: SectorItem[]) => void;
}

export function ManageSectorsModal({ isOpen, onClose, sectors, onSectorsUpdated }: ManageSectorsModalProps) {
  const [newSectorName, setNewSectorName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const handleAddSector = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSectorName.trim();
    if (!trimmed) {
      toast.error('Escribe el nombre del sector');
      return;
    }
    if (sectors.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Este sector ya existe en el listado');
      return;
    }

    try {
      setIsLoading(true);
      const updated = await sectorsService.add(trimmed);
      onSectorsUpdated(updated);
      setNewSectorName('');
      toast.success(`Sector "${trimmed}" añadido correctamente`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Error al añadir el sector');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSector = async (sector: SectorItem) => {
    if (sector.count > 0) {
      toast.error(`No puedes borrar "${sector.name}" porque tiene ${sector.count} empresa(s) asignada(s)`);
      return;
    }

    try {
      setIsLoading(true);
      const updated = await sectorsService.delete(sector.name);
      onSectorsUpdated(updated);
      toast.success(`Sector "${sector.name}" eliminado`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Error al eliminar el sector');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanEmpty = async () => {
    const emptyCount = sectors.filter(s => s.count === 0).length;
    if (emptyCount === 0) {
      toast('No hay sectores vacíos para eliminar', { icon: 'ℹ️' });
      return;
    }

    if (!window.confirm(`¿Seguro que deseas eliminar los ${emptyCount} sectores que no tienen ninguna empresa asociada?`)) {
      return;
    }

    try {
      setIsCleaning(true);
      const res = await sectorsService.cleanEmpty();
      onSectorsUpdated(res.data);
      toast.success(`Se han eliminado ${emptyCount} sectores sin empresas`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al limpiar sectores vacíos');
    } finally {
      setIsCleaning(false);
    }
  };

  const filtered = sectors.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const emptySectorsCount = sectors.filter(s => s.count === 0).length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl shadow-2xl p-6 md:p-7 w-full max-w-lg relative z-10 border border-slate-200 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                <Tag size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 leading-snug">
                  Catálogo de Sectores
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Gestiona los sectores disponibles para empresas y contactos ({sectors.length} en total)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form to add a new sector */}
          <form onSubmit={handleAddSector} className="pt-4 pb-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
              Añadir nuevo sector manualmente
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej. Energías Renovables, Telecomunicaciones..."
                value={newSectorName}
                onChange={(e) => setNewSectorName(e.target.value)}
                className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#001c3a]/30 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoading || !newSectorName.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#001c3a] text-white text-sm font-semibold rounded-xl hover:bg-blue-900 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-sm shrink-0"
              >
                <Plus size={16} /> Añadir
              </button>
            </div>
          </form>

          {/* Clean empty sectors button bar */}
          <div className="py-2 flex items-center justify-between border-b border-slate-100">
            <input
              type="text"
              placeholder="Buscar sector..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none w-48 text-slate-700"
            />
            {emptySectorsCount > 0 ? (
              <button
                type="button"
                onClick={handleCleanEmpty}
                disabled={isCleaning}
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                title="Elimina todos los sectores que tienen 0 empresas"
              >
                <Trash2 size={13} />
                Limpiar vacíos ({emptySectorsCount})
              </button>
            ) : (
              <span className="text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                ✓ Todos los sectores tienen empresas
              </span>
            )}
          </div>

          {/* List of sectors */}
          <div className="flex-1 overflow-y-auto custom-scrollbar my-3 pr-1 space-y-1.5 max-h-[45vh]">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No se encontraron sectores coincidentes.
              </div>
            ) : (
              filtered.map(sector => (
                <div
                  key={sector.name}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 transition-all bg-white"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-semibold text-sm text-slate-800 truncate">
                      {sector.name}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 flex items-center gap-1 ${
                        sector.count > 0 
                          ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      <Building2 size={11} />
                      {sector.count} {sector.count === 1 ? 'empresa' : 'empresas'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {sector.count === 0 ? (
                      <button
                        type="button"
                        onClick={() => handleDeleteSector(sector)}
                        disabled={isLoading}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Borrar sector sin empresas"
                      >
                        <Trash2 size={15} />
                      </button>
                    ) : (
                      <span 
                        className="p-1.5 text-slate-300 cursor-not-allowed" 
                        title={`No se puede borrar porque está en uso por ${sector.count} empresa(s)`}
                      >
                        <Trash2 size={15} />
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {sectors.length} sectores en el catálogo
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#001c3a] hover:bg-blue-900 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
