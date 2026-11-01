import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Users, AlertCircle, CheckCircle2, 
  X, GitMerge, ShieldCheck, Search, Check, ChevronDown
} from 'lucide-react';
import { Account, Contact, accountsService, contactsService } from '../../services/crm.service';

export interface MergeEntitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'account' | 'contact';
  entityA: Account | Contact | null;
  entityB?: Account | Contact | null;
  allEntities?: (Account | Contact)[];
  onSuccess: (resultMessage: string) => void;
}

export function MergeEntitiesModal({
  isOpen,
  onClose,
  type,
  entityA,
  entityB: initialEntityB,
  allEntities = [],
  onSuccess
}: MergeEntitiesModalProps) {
  const [selectedEntityBId, setSelectedEntityBId] = useState<string>(initialEntityB?.id || '');
  const [primaryChoice, setPrimaryChoice] = useState<'A' | 'B'>('A');
  const [searchB, setSearchB] = useState('');
  const [isPickerBOpen, setIsPickerBOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Field overrides chosen by the user
  const [fieldSelections, setFieldSelections] = useState<Record<string, string>>({});

  // Reset or initialize when modal opens or inputs change
  React.useEffect(() => {
    if (isOpen) {
      setSelectedEntityBId(initialEntityB?.id || '');
      setPrimaryChoice('A');
      setFieldSelections({});
      setErrorMsg(null);
      setSearchB('');
    }
  }, [isOpen, initialEntityB]);

  const targetEntityB = useMemo(() => {
    if (!selectedEntityBId) return null;
    return allEntities.find(e => e.id === selectedEntityBId) || initialEntityB || null;
  }, [selectedEntityBId, allEntities, initialEntityB]);

  const availableOptionsForB = useMemo(() => {
    if (!entityA) return [];
    return allEntities.filter(e => {
      if (e.id === entityA.id) return false;
      if (!searchB) return true;
      const term = searchB.toLowerCase();
      const name = (e.name || '').toLowerCase();
      const email = (e.email || '').toLowerCase();
      const cif = ('cif' in e ? e.cif || '' : '').toLowerCase();
      return name.includes(term) || email.includes(term) || cif.includes(term);
    });
  }, [allEntities, entityA, searchB]);

  // Determine fields based on entity type
  const fieldDefinitions = useMemo(() => {
    if (type === 'account') {
      return [
        { key: 'name', label: 'Nombre Comercial / Razón Social', required: true },
        { key: 'cif', label: 'CIF / NIF' },
        { key: 'email', label: 'Correo Electrónico' },
        { key: 'phone', label: 'Teléfono' },
        { key: 'city', label: 'Ciudad / Ubicación' },
        { key: 'sector', label: 'Sector' },
      ];
    } else {
      return [
        { key: 'name', label: 'Nombre Completo', required: true },
        { key: 'email', label: 'Correo Electrónico' },
        { key: 'phone', label: 'Teléfono' },
        { key: 'position', label: 'Cargo / Puesto' },
      ];
    }
  }, [type]);

  if (!isOpen || !entityA) return null;

  const currentPrimary = primaryChoice === 'A' ? entityA : targetEntityB;
  const currentSecondary = primaryChoice === 'A' ? targetEntityB : entityA;

  // Compute resolved value for a field:
  // 1. Explicit choice from fieldSelections[key]
  // 2. Primary value (if not empty)
  // 3. Secondary value (fallback if primary is empty)
  const getFieldValue = (key: string): string => {
    if (fieldSelections[key] !== undefined) {
      return fieldSelections[key];
    }
    const valPrimary = (currentPrimary as any)?.[key] || '';
    const valSecondary = (currentSecondary as any)?.[key] || '';
    return valPrimary || valSecondary || '';
  };

  const handleSelectFieldValue = (key: string, value: string) => {
    setFieldSelections(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async () => {
    if (!currentPrimary || !currentSecondary) {
      setErrorMsg('Debes seleccionar dos registros para realizar la fusión');
      return;
    }
    if (currentPrimary.id === currentSecondary.id) {
      setErrorMsg('No puedes fusionar un registro consigo mismo');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const resolvedFields: Record<string, any> = {};
      fieldDefinitions.forEach(f => {
        const val = getFieldValue(f.key);
        if (val !== undefined && val !== '') {
          resolvedFields[f.key] = val;
        }
      });

      if (type === 'account') {
        const res = await accountsService.merge(currentPrimary.id, currentSecondary.id, resolvedFields);
        const statsStr = res.stats 
          ? ` (${res.stats.contactsMoved || 0} contactos, ${res.stats.activitiesMoved || 0} actividades, ${res.stats.dealsMoved || 0} negocios)`
          : '';
        onSuccess(`Fusión completada con éxito${statsStr}`);
      } else {
        const res = await contactsService.merge(currentPrimary.id, currentSecondary.id, resolvedFields);
        const statsStr = res.stats 
          ? ` (${res.stats.activitiesMoved || 0} actividades, ${res.stats.dealsMoved || 0} negocios)`
          : '';
        onSuccess(`Contacto fusionado con éxito${statsStr}`);
      }
      onClose();
    } catch (err: any) {
      console.error('Error during merge:', err);
      setErrorMsg(err?.response?.data?.message || err?.message || 'Error al procesar la fusión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-[#001c3a] to-[#003366] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
                <GitMerge size={22} className="text-blue-300" />
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  {type === 'account' ? 'Fusionar Empresas Duplicadas' : 'Fusionar Contactos Duplicados'}
                </h2>
                <p className="text-xs text-blue-200">
                  Unifica registros duplicados preservando todo el historial de actividades, negocios y proyectos sin pérdida de datos.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar space-y-6">
            {/* Zero Data Loss Guarantee Banner */}
            <div className="flex items-start gap-3 p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl">
              <ShieldCheck size={22} className="text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 leading-relaxed">
                <span className="font-bold">Garantía de conservación de historial:</span> Las actividades pasadas y futuras, negocios en curso, cotizaciones, proyectos asociados y notas de ambos registros se transferirán intactos al registro unificado. Se generará una anotación de auditoría automática con fecha y usuario.
              </div>
            </div>

            {/* Error banner if any */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Selector or Display of Entity B if not preselected */}
            {!targetEntityB && (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-5 text-center">
                <h3 className="text-sm font-bold text-slate-700 mb-2">
                  Selecciona el segundo registro para fusionar con &quot;{entityA.name || 'Registro A'}&quot;
                </h3>
                <div className="relative max-w-md mx-auto">
                  <div
                    onClick={() => setIsPickerBOpen(!isPickerBOpen)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm flex items-center justify-between cursor-pointer shadow-sm hover:border-slate-400"
                  >
                    <span className="text-slate-500">
                      Buscar y seleccionar {type === 'account' ? 'empresa' : 'contacto'} duplicado...
                    </span>
                    <ChevronDown size={16} className="text-slate-400" />
                  </div>

                  {isPickerBOpen && (
                    <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden text-left">
                      <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                        <Search size={14} className="text-slate-400" />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Escribe nombre, CIF o email..."
                          value={searchB}
                          onChange={(e) => setSearchB(e.target.value)}
                          className="w-full text-xs bg-transparent outline-none text-slate-700"
                        />
                      </div>
                      <div className="max-h-52 overflow-y-auto custom-scrollbar">
                        {availableOptionsForB.length === 0 ? (
                          <div className="p-3 text-xs text-slate-400 text-center">No se encontraron registros</div>
                        ) : (
                          availableOptionsForB.slice(0, 30).map(opt => (
                            <div
                              key={opt.id}
                              onClick={() => {
                                setSelectedEntityBId(opt.id);
                                setIsPickerBOpen(false);
                                setSearchB('');
                              }}
                              className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-none flex flex-col"
                            >
                              <span className="font-semibold text-slate-800">{opt.name || 'Sin nombre'}</span>
                              <span className="text-[10px] text-slate-400">
                                {'cif' in opt && opt.cif ? `CIF: ${opt.cif} • ` : ''}
                                {opt.email ? `${opt.email}` : ''}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Side-by-side Entities Comparison Cards */}
            {targetEntityB && (
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  1. Selecciona cuál será el Registro Principal (Master)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Entity A Card */}
                  <div 
                    onClick={() => setPrimaryChoice('A')}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      primaryChoice === 'A' 
                        ? 'border-blue-600 bg-blue-50/40 shadow-md ring-2 ring-blue-500/20' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {type === 'account' ? <Building2 size={18} className="text-blue-600" /> : <Users size={18} className="text-blue-600" />}
                        <span className="text-xs font-bold text-slate-500 uppercase">Registro A</span>
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                        primaryChoice === 'A' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {primaryChoice === 'A' ? <><Check size={12} /> Principal (Se conserva)</> : 'Secundario (Se fusionará)'}
                      </span>
                    </div>
                    <div className="font-bold text-slate-800 text-base mb-1">{entityA.name || 'Sin nombre'}</div>
                    <div className="text-xs text-slate-500 space-y-0.5">
                      {'cif' in entityA && entityA.cif && <div><span className="font-medium">CIF:</span> {entityA.cif}</div>}
                      {entityA.email && <div><span className="font-medium">Email:</span> {entityA.email}</div>}
                      {entityA.phone && <div><span className="font-medium">Tel:</span> {entityA.phone}</div>}
                      {'city' in entityA && entityA.city && <div><span className="font-medium">Ciudad:</span> {entityA.city}</div>}
                      {'sector' in entityA && entityA.sector && <div><span className="font-medium">Sector:</span> {entityA.sector}</div>}
                      {'position' in entityA && entityA.position && <div><span className="font-medium">Cargo:</span> {entityA.position}</div>}
                    </div>
                  </div>

                  {/* Entity B Card */}
                  <div 
                    onClick={() => setPrimaryChoice('B')}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      primaryChoice === 'B' 
                        ? 'border-blue-600 bg-blue-50/40 shadow-md ring-2 ring-blue-500/20' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {type === 'account' ? <Building2 size={18} className="text-indigo-600" /> : <Users size={18} className="text-indigo-600" />}
                        <span className="text-xs font-bold text-slate-500 uppercase">Registro B</span>
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                        primaryChoice === 'B' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {primaryChoice === 'B' ? <><Check size={12} /> Principal (Se conserva)</> : 'Secundario (Se fusionará)'}
                      </span>
                    </div>
                    <div className="font-bold text-slate-800 text-base mb-1">{targetEntityB.name || 'Sin nombre'}</div>
                    <div className="text-xs text-slate-500 space-y-0.5">
                      {'cif' in targetEntityB && targetEntityB.cif && <div><span className="font-medium">CIF:</span> {targetEntityB.cif}</div>}
                      {targetEntityB.email && <div><span className="font-medium">Email:</span> {targetEntityB.email}</div>}
                      {targetEntityB.phone && <div><span className="font-medium">Tel:</span> {targetEntityB.phone}</div>}
                      {'city' in targetEntityB && targetEntityB.city && <div><span className="font-medium">Ciudad:</span> {targetEntityB.city}</div>}
                      {'sector' in targetEntityB && targetEntityB.sector && <div><span className="font-medium">Sector:</span> {targetEntityB.sector}</div>}
                      {'position' in targetEntityB && targetEntityB.position && <div><span className="font-medium">Cargo:</span> {targetEntityB.position}</div>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Field Resolution Matrix */}
            {targetEntityB && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    2. Resolución de Datos Finales
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Haz clic en el valor que deseas conservar para cada campo
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
                  {fieldDefinitions.map((f) => {
                    const valA = (entityA as any)?.[f.key] || '';
                    const valB = (targetEntityB as any)?.[f.key] || '';
                    const isDifferent = valA && valB && valA.trim().toLowerCase() !== valB.trim().toLowerCase();
                    const chosenVal = getFieldValue(f.key);

                    return (
                      <div key={f.key} className="p-3.5 hover:bg-slate-50/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            {f.label}
                            {isDifferent && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-semibold">
                                Diferentes
                              </span>
                            )}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            Valor resultante: <span className="text-blue-700 font-bold">{chosenVal || <span className="italic text-slate-300">Vacío</span>}</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                          {/* Option from Entity A */}
                          <button
                            type="button"
                            onClick={() => valA && handleSelectFieldValue(f.key, valA)}
                            disabled={!valA}
                            className={`px-3 py-2 rounded-lg text-left text-xs transition-all border flex items-center justify-between ${
                              !valA 
                                ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                                : chosenVal === valA
                                ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold ring-1 ring-blue-300'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <span className="truncate">
                              <span className="text-[10px] text-slate-400 mr-1.5">A:</span>
                              {valA || <span className="italic text-slate-300">Sin dato</span>}
                            </span>
                            {chosenVal === valA && valA && (
                              <CheckCircle2 size={14} className="text-blue-600 shrink-0 ml-2" />
                            )}
                          </button>

                          {/* Option from Entity B */}
                          <button
                            type="button"
                            onClick={() => valB && handleSelectFieldValue(f.key, valB)}
                            disabled={!valB}
                            className={`px-3 py-2 rounded-lg text-left text-xs transition-all border flex items-center justify-between ${
                              !valB 
                                ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                                : chosenVal === valB
                                ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold ring-1 ring-blue-300'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <span className="truncate">
                              <span className="text-[10px] text-slate-400 mr-1.5">B:</span>
                              {valB || <span className="italic text-slate-300">Sin dato</span>}
                            </span>
                            {chosenVal === valB && valB && (
                              <CheckCircle2 size={14} className="text-blue-600 shrink-0 ml-2" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !targetEntityB}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all ${
                isSubmitting || !targetEntityB
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-[#001c3a] text-white hover:bg-slate-800 active:scale-95'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Fusionando registros...</span>
                </>
              ) : (
                <>
                  <GitMerge size={16} />
                  <span>Confirmar y Fusionar</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
