import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, ArrowRight, CalendarDays, RefreshCw } from 'lucide-react';

interface BulkRescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onSubmit: (options: { mode: 'fixed' | 'shift'; plannedDate?: string; shiftDays?: number }) => Promise<void>;
}

export function BulkRescheduleModal({ isOpen, onClose, selectedCount, onSubmit }: BulkRescheduleModalProps) {
  const [mode, setMode] = useState<'shift' | 'fixed'>('shift');
  const [shiftDays, setShiftDays] = useState<number>(1);
  const [targetDate, setTargetDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [targetTime, setTargetTime] = useState<string>('10:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === 'shift') {
        await onSubmit({ mode: 'shift', shiftDays: Number(shiftDays) });
      } else {
        const fullDateTime = `${targetDate}T${targetTime || '10:00'}:00.000Z`;
        await onSubmit({ mode: 'fixed', plannedDate: fullDateTime });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const shiftPresets = [
    { label: '+1 día', value: 1 },
    { label: '+2 días', value: 2 },
    { label: '+3 días', value: 3 },
    { label: '+7 días (1 semana)', value: 7 },
    { label: '+14 días (2 semanas)', value: 14 },
    { label: '-1 día', value: -1 },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => !isSubmitting && onClose()}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 border border-slate-100 flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs">
              <CalendarDays size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Reagendar {selectedCount} {selectedCount === 1 ? 'actividad' : 'actividades'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ajusta la fecha de vencimiento de las actividades seleccionadas.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="p-6 pb-2">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('shift')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'shift'
                  ? 'bg-white text-[#001c3a] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <RefreshCw size={14} className={mode === 'shift' ? 'text-amber-500' : ''} />
              <span>Desplazar días (+/-)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('fixed')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'fixed'
                  ? 'bg-white text-[#001c3a] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar size={14} className={mode === 'fixed' ? 'text-blue-500' : ''} />
              <span>Fecha exacta fija</span>
            </button>
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
          {mode === 'shift' ? (
            <div className="space-y-4">
              <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 text-xs text-amber-900 leading-relaxed">
                💡 <strong>Ideal para cadencias:</strong> Desplaza las actividades hacia adelante o atrás manteniendo exactamente el intervalo original entre cada paso.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Atajos rápidos:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {shiftPresets.map(preset => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setShiftDays(preset.value)}
                      className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        shiftDays === preset.value
                          ? 'bg-[#001c3a] text-white border-[#001c3a]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  O introduce los días manualmente:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={shiftDays}
                    onChange={(e) => setShiftDays(Number(e.target.value))}
                    className="w-28 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20"
                    placeholder="Ej: 3"
                    required
                  />
                  <span className="text-xs text-slate-500 font-medium">
                    {shiftDays > 0 ? `Se sumarán ${shiftDays} días a la fecha de cada actividad` : shiftDays < 0 ? `Se restarán ${Math.abs(shiftDays)} días a la fecha de cada actividad` : 'Sin cambio de días'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50/70 border border-blue-200/70 rounded-xl p-3 text-xs text-blue-900 leading-relaxed">
                ℹ️ <strong>Fecha fija:</strong> Todas las {selectedCount} actividades seleccionadas se programarán para el mismo día y hora exactos.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                    <Calendar size={13} className="text-slate-400" /> Nueva fecha:
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                    <Clock size={13} className="text-slate-400" /> Hora:
                  </label>
                  <input
                    type="time"
                    value={targetTime}
                    onChange={(e) => setTargetTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-100 flex justify-end items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (mode === 'shift' && shiftDays === 0)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#001c3a] hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Reagendando...</span>
                </>
              ) : (
                <>
                  <span>Aplicar a {selectedCount} actividades</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
