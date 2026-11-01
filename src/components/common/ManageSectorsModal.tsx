import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Trash2, Tag, RefreshCw, AlertCircle, 
  Sparkles, Building2, GitMerge, Edit2, Check, ArrowRight
} from 'lucide-react';
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
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [search, setSearch] = useState('');

  // Editing state for rename
  const [editingSector, setEditingSector] = useState<{ originalName: string; currentName: string } | null>(null);

  // Merging state
  const [mergingSector, setMergingSector] = useState<SectorItem | null>(null);
  const [targetSectorName, setTargetSectorName] = useState<string>('');

  // Detect potential duplicates (case/accent insensitive variations)
  const detectedDuplicates = useMemo(() => {
    const groups = new Map<string, SectorItem[]>();
    sectors.forEach(s => {
      const key = s.name.replace(/[\u00a0\s]+/g, ' ').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(s);
    });

    const duplicates: { key: string; items: SectorItem[] }[] = [];
    groups.forEach((items, key) => {
      if (items.length > 1) {
        duplicates.push({ key, items });
      }
    });
    return duplicates;
  }, [sectors]);

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
      toast.error(`No puedes borrar "${sector.name}" porque tiene ${sector.count} empresa(s). Puedes fusionarlo con otro sector primero.`);
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

  const handleNormalizeDuplicates = async () => {
    try {
      setIsNormalizing(true);
      const res = await sectorsService.normalize();
      onSectorsUpdated(res.data);
      toast.success(`¡Duplicados unificados! Se corrigieron ${res.fixedCount} empresas.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al unificar duplicados');
    } finally {
      setIsNormalizing(false);
    }
  };

  const handleRenameSector = async () => {
    if (!editingSector) return;
    const trimmed = editingSector.currentName.trim();
    if (!trimmed) {
      toast.error('El nombre del sector no puede estar vacío');
      return;
    }

    try {
      setIsLoading(true);
      const res = await sectorsService.rename(editingSector.originalName, trimmed);
      onSectorsUpdated(res.data);
      toast.success(`Sector renombrado a "${trimmed}"`);
      setEditingSector(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Error al renombrar sector');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmMerge = async () => {
    if (!mergingSector || !targetSectorName) {
      toast.error('Selecciona un sector destino');
      return;
    }
    if (mergingSector.name.toLowerCase() === targetSectorName.toLowerCase()) {
      toast.error('No puedes fusionar un sector consigo mismo');
      return;
    }

    try {
      setIsLoading(true);
      const res = await sectorsService.merge(mergingSector.name, targetSectorName);
      onSectorsUpdated(res.data);
      toast.success(res.message || `Sector fusionado en "${targetSectorName}"`);
      setMergingSector(null);
      setTargetSectorName('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Error al fusionar sectores');
    } finally {
      setIsLoading(false);
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
          className="bg-white rounded-2xl shadow-2xl p-6 md:p-7 w-full max-w-xl relative z-10 border border-slate-200 flex flex-col max-h-[92vh]"
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
                  Gestiona, unifica duplicados y renombra sectores para empresas ({sectors.length} en catálogo)
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

          {/* Smart Duplicate Detection Banner */}
          {detectedDuplicates.length > 0 && (
            <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-900">
                <AlertCircle size={16} className="text-amber-600 shrink-0" />
                <span>
                  <strong>{detectedDuplicates.length} duplicados detectados</strong> por mayúsculas/acentos
                  {detectedDuplicates[0] && (
                    <span className="text-amber-700 ml-1">
                      (ej: {detectedDuplicates[0].items.map(i => i.name).join(' / ')})
                    </span>
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={handleNormalizeDuplicates}
                disabled={isNormalizing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-sm transition-all active:scale-95 text-xs shrink-0"
              >
                {isNormalizing ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" /> Unificando...
                  </>
                ) : (
                  <>
                    <Sparkles size={13} /> Unificar Duplicados
                  </>
                )}
              </button>
            </div>
          )}

          {/* Form to add a new sector */}
          <form onSubmit={handleAddSector} className="pt-3 pb-2">
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

          {/* Clean empty sectors button bar & Search */}
          <div className="py-2 flex items-center justify-between border-b border-slate-100 gap-2">
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
                ✓ Sin sectores vacíos
              </span>
            )}
          </div>

          {/* List of sectors */}
          <div className="flex-1 overflow-y-auto custom-scrollbar my-3 pr-1 space-y-2 max-h-[45vh]">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No se encontraron sectores coincidentes.
              </div>
            ) : (
              filtered.map(sector => {
                const isEditingThis = editingSector?.originalName === sector.name;

                return (
                  <div
                    key={sector.name}
                    className="p-2.5 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 transition-all bg-white flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      {isEditingThis ? (
                        <div className="flex items-center gap-2 flex-1 mr-2">
                          <input
                            type="text"
                            value={editingSector.currentName}
                            onChange={(e) => setEditingSector({ ...editingSector, currentName: e.target.value })}
                            className="flex-1 px-2.5 py-1 text-sm bg-white border border-blue-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-800"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={handleRenameSector}
                            disabled={isLoading}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            title="Guardar nombre"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSector(null)}
                            className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"
                            title="Cancelar edición"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-semibold text-sm text-slate-800 truncate">
                            {sector.name}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 flex items-center gap-1 ${
                              sector.count > 0 
                                ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            <Building2 size={11} />
                            {sector.count} {sector.count === 1 ? 'empresa' : 'empresas'}
                          </span>
                        </div>
                      )}

                      {!isEditingThis && (
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {/* Rename button */}
                          <button
                            type="button"
                            onClick={() => setEditingSector({ originalName: sector.name, currentName: sector.name })}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Renombrar sector en todas las empresas"
                          >
                            <Edit2 size={14} />
                          </button>

                          {/* Merge button */}
                          <button
                            type="button"
                            onClick={() => {
                              setMergingSector(sector);
                              // Pick first sector that isn't this one as default target
                              const other = sectors.find(s => s.name.toLowerCase() !== sector.name.toLowerCase());
                              setTargetSectorName(other?.name || '');
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Fusionar empresas de este sector con otro..."
                          >
                            <GitMerge size={14} />
                          </button>

                          {/* Delete button (only if 0 count) */}
                          {sector.count === 0 ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteSector(sector)}
                              disabled={isLoading}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Borrar sector sin empresas"
                            >
                              <Trash2 size={14} />
                            </button>
                          ) : (
                            <span 
                              className="p-1.5 text-slate-200 cursor-not-allowed" 
                              title={`Para eliminar "${sector.name}", primero fusionalo con otro sector para mover sus ${sector.count} empresas.`}
                            >
                              <Trash2 size={14} />
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Merge Popover/Modal */}
          {mergingSector && (
            <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 w-full max-w-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                    <GitMerge size={18} />
                    <span>Fusionar Sector</span>
                  </div>
                  <button onClick={() => setMergingSector(null)} className="text-slate-400 hover:text-slate-600">
                    <X size={16} />
                  </button>
                </div>

                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Todas las <strong>{mergingSector.count} empresa(s)</strong> asociadas al sector{' '}
                  <span className="font-semibold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                    &quot;{mergingSector.name}&quot;
                  </span>{' '}
                  se reasignarán al sector destino seleccionado:
                </p>

                <div className="space-y-3 mb-5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                    Sector Destino
                  </label>
                  <select
                    value={targetSectorName}
                    onChange={(e) => setTargetSectorName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-800 font-medium"
                  >
                    {sectors
                      .filter(s => s.name.toLowerCase() !== mergingSector.name.toLowerCase())
                      .map(s => (
                        <option key={s.name} value={s.name}>
                          {s.name} ({s.count} empresas actuales)
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setMergingSector(null)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmMerge}
                    disabled={isLoading || !targetSectorName}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    <GitMerge size={14} />
                    Confirmar Fusión
                  </button>
                </div>
              </div>
            </div>
          )}

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
