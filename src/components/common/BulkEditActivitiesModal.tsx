import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Edit3, User, CheckCircle, FileText, ArrowRight, RefreshCw, Layers } from 'lucide-react';
import { ActivityType, ActivityStatus, ActivityResult, ACTIVITY_RESULT_OPTIONS } from '../../services/activities.service';
import { UserResponse } from '../../services/types';

interface BulkEditActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  users: UserResponse[];
  onSubmit: (updates: {
    activityType?: ActivityType;
    userId?: string;
    status?: ActivityStatus;
    result?: ActivityResult;
    subject?: string;
    notes?: string;
  }) => Promise<void>;
}

export function BulkEditActivitiesModal({
  isOpen,
  onClose,
  selectedCount,
  users,
  onSubmit,
}: BulkEditActivitiesModalProps) {
  // Enabled toggles for each field
  const [enableType, setEnableType] = useState(false);
  const [enableUser, setEnableUser] = useState(false);
  const [enableStatus, setEnableStatus] = useState(false);
  const [enableResult, setEnableResult] = useState(false);
  const [enableSubject, setEnableSubject] = useState(false);
  const [enableNotes, setEnableNotes] = useState(false);

  // Field values
  const [activityType, setActivityType] = useState<ActivityType>(ActivityType.CALL);
  const [userId, setUserId] = useState<string>(users[0]?.id || '');
  const [status, setStatus] = useState<ActivityStatus>(ActivityStatus.PLANNED);
  const [result, setResult] = useState<ActivityResult>(ActivityResult.CALL_BACK);
  const [subject, setSubject] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const anyFieldEnabled = enableType || enableUser || enableStatus || enableResult || enableSubject || enableNotes;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anyFieldEnabled) return;

    const updates: any = {};
    if (enableType) updates.activityType = activityType;
    if (enableUser) updates.userId = userId;
    if (enableStatus) updates.status = status;
    if (enableResult) updates.result = result;
    if (enableSubject) updates.subject = subject;
    if (enableNotes) updates.notes = notes;

    setIsSubmitting(true);
    try {
      await onSubmit(updates);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden relative z-10 border border-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs">
              <Edit3 size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Edición Masiva ({selectedCount} actividades)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Marca la casilla del campo que desees sobreescribir en todas las seleccionadas.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {/* Tipo de Actividad */}
          <div className={`p-3.5 rounded-xl border transition-all ${enableType ? 'bg-blue-50/40 border-blue-200' : 'bg-slate-50 border-slate-200/60'}`}>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={enableType}
                onChange={(e) => setEnableType(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Layers size={13} className="text-slate-500" /> Cambiar Tipo de Actividad
              </span>
            </label>
            {enableType && (
              <div className="mt-3 pl-6">
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value as ActivityType)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 cursor-pointer shadow-xs"
                >
                  <option value={ActivityType.CALL}>Llamada</option>
                  <option value={ActivityType.EMAIL}>Correo electrónico</option>
                  <option value={ActivityType.REUNION_COMERCIAL}>Reunión Comercial</option>
                  <option value={ActivityType.REUNION_SEGUIMIENTO}>Reunión Seguimiento</option>
                  <option value={ActivityType.TASK}>Tarea</option>
                  <option value={ActivityType.COTIZACION}>Cotización</option>
                  <option value={ActivityType.SEGUIMIENTO}>Seguimiento</option>
                </select>
              </div>
            )}
          </div>

          {/* Reasignar Responsable */}
          <div className={`p-3.5 rounded-xl border transition-all ${enableUser ? 'bg-blue-50/40 border-blue-200' : 'bg-slate-50 border-slate-200/60'}`}>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={enableUser}
                onChange={(e) => setEnableUser(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <User size={13} className="text-slate-500" /> Reasignar Responsable (Comercial)
              </span>
            </label>
            {enableUser && (
              <div className="mt-3 pl-6">
                <select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 cursor-pointer shadow-xs"
                >
                  {users.map((u, idx) => (
                    <option key={u.id || `u-${idx}`} value={u.id}>{(u as any).display_name || u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Estado de Actividad */}
          <div className={`p-3.5 rounded-xl border transition-all ${enableStatus ? 'bg-blue-50/40 border-blue-200' : 'bg-slate-50 border-slate-200/60'}`}>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={enableStatus}
                onChange={(e) => setEnableStatus(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle size={13} className="text-slate-500" /> Cambiar Estado
              </span>
            </label>
            {enableStatus && (
              <div className="mt-3 pl-6">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ActivityStatus)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 cursor-pointer shadow-xs"
                >
                  <option value={ActivityStatus.PLANNED}>Planeada (Pendiente)</option>
                  <option value={ActivityStatus.COMPLETED}>Completada</option>
                  <option value={ActivityStatus.CANCELLED}>Cancelada</option>
                </select>
              </div>
            )}
          </div>

          {/* Resultado de la Actividad */}
          <div className={`p-3.5 rounded-xl border transition-all ${enableResult ? 'bg-blue-50/40 border-blue-200' : 'bg-slate-50 border-slate-200/60'}`}>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={enableResult}
                onChange={(e) => setEnableResult(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle size={13} className="text-slate-500" /> Asignar Resultado Común
              </span>
            </label>
            {enableResult && (
              <div className="mt-3 pl-6">
                <select
                  value={result}
                  onChange={(e) => setResult(e.target.value as ActivityResult)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 cursor-pointer shadow-xs"
                >
                  {ACTIVITY_RESULT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Asunto Común */}
          <div className={`p-3.5 rounded-xl border transition-all ${enableSubject ? 'bg-blue-50/40 border-blue-200' : 'bg-slate-50 border-slate-200/60'}`}>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={enableSubject}
                onChange={(e) => setEnableSubject(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText size={13} className="text-slate-500" /> Sobrescribir Asunto
              </span>
            </label>
            {enableSubject && (
              <div className="mt-3 pl-6">
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Nuevo asunto para todas las actividades seleccionadas..."
                  required={enableSubject}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 shadow-xs"
                />
              </div>
            )}
          </div>

          {/* Notas */}
          <div className={`p-3.5 rounded-xl border transition-all ${enableNotes ? 'bg-blue-50/40 border-blue-200' : 'bg-slate-50 border-slate-200/60'}`}>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={enableNotes}
                onChange={(e) => setEnableNotes(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText size={13} className="text-slate-500" /> Sobrescribir Notas / Comentarios
              </span>
            </label>
            {enableNotes && (
              <div className="mt-3 pl-6">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas o instrucciones comunes..."
                  rows={3}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#001c3a]/20 shadow-xs resize-none"
                />
              </div>
            )}
          </div>

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
              disabled={isSubmitting || !anyFieldEnabled}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#001c3a] hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <span>Guardar cambios ({selectedCount})</span>
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
