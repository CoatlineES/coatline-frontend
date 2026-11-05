import React, { useState, useEffect, useMemo } from 'react';
import { 
  CalendarOff, Send, Clock, CheckCircle2, XCircle, FileText, Upload, 
  Calendar as CalendarIcon, Trash2, Users, AlertCircle, ChevronLeft, 
  ChevronRight, Sparkles, Filter, Info, ShieldCheck, Check, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { absencesService, Absence, AbsenceSupervisor } from '../../services/absences.service';
import { uploadService } from '../../services/upload.service';
import toast from 'react-hot-toast';

const ABSENCE_TYPES = {
  VACACIONES: { label: "Vacaciones Anuales", info: "22 días laborables al año.", maxDays: 22, color: "blue" },
  ENFERMEDAD: { label: "Baja por Enfermedad (IT)", info: "Requiere justificante médico oficial.", maxDays: null, color: "emerald" },
  MATRIMONIO: { label: "Matrimonio", info: "15 días naturales.", maxDays: 15, color: "purple" },
  MUDANZA: { label: "Mudanza", info: "1 día laborable.", maxDays: 1, color: "amber" },
  HOSPITALIZACION: { label: "Fallecimiento / Hospitalización", info: "Hasta 5 días laborables (hasta 2º grado).", maxDays: 5, color: "rose" },
  CITA_MEDICA: { label: "Cita Médica", info: "El tiempo indispensable debidamente justificado.", maxDays: 1, color: "cyan" },
  ASUNTOS_PROPIOS: { label: "Asuntos Propios", info: "Según convenio aplicable.", maxDays: null, color: "indigo" },
  OTROS: { label: "Otros", info: "Especificar motivo detallado en comentarios.", maxDays: null, color: "slate" }
};

export default function AusenciasView() {
  const { user } = useAuth();
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [supervisors, setSupervisors] = useState<AbsenceSupervisor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [activeTab, setActiveTab] = useState<'solicitudes' | 'calendario'>('solicitudes');
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<string>('VACACIONES');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [comments, setComments] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Calendar state
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  const loadData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const [absData, supData] = await Promise.all([
        absencesService.getUserAbsences(user.id),
        absencesService.getMySupervisors().catch(() => [])
      ]);
      setAbsences(absData);
      setSupervisors(supData);
    } catch (err) {
      console.error('Error loading absences data', err);
      toast.error('Error al sincronizar tus ausencias');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Calculate business days between two dates (excluding weekends)
  const calculateBusinessDays = (start: Date, end: Date) => {
    let count = 0;
    const curDate = new Date(start.getTime());
    while (curDate <= end) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
      curDate.setDate(curDate.getDate() + 1);
    }
    return count;
  };

  const getAbsenceDays = (absence: { type: string; startDate: string; endDate: string }) => {
    if (!absence.startDate || !absence.endDate) return 0;
    const start = new Date(absence.startDate);
    const end = new Date(absence.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;
    
    if (absence.type === 'MATRIMONIO') {
      return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
    return calculateBusinessDays(start, end);
  };

  // Live calculation of currently requested days
  const currentlyRequestedDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return getAbsenceDays({ type, startDate, endDate });
  }, [type, startDate, endDate]);

  const vacationStats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const approvedVacations = absences.filter(
      a => a.type === 'VACACIONES' && 
           a.status === 'APPROVED' && 
           new Date(a.startDate).getFullYear() === currentYear
    );
    const pendingVacations = absences.filter(
      a => a.type === 'VACACIONES' && 
           a.status === 'PENDING' && 
           new Date(a.startDate).getFullYear() === currentYear
    );
    
    const consumedDays = approvedVacations.reduce((acc, curr) => acc + getAbsenceDays(curr), 0);
    const pendingDays = pendingVacations.reduce((acc, curr) => acc + getAbsenceDays(curr), 0);
    const totalAllowed = ABSENCE_TYPES.VACACIONES.maxDays || 22;
    
    return {
      consumed: consumedDays,
      pending: pendingDays,
      remaining: Math.max(0, totalAllowed - consumedDays),
      total: totalAllowed,
      percent: Math.min(100, Math.round((consumedDays / totalAllowed) * 100))
    };
  }, [absences]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error('Por favor, selecciona las fechas de inicio y fin.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('La fecha de fin no puede ser anterior a la de inicio.');
      return;
    }

    if (type === 'VACACIONES' && currentlyRequestedDays > vacationStats.remaining) {
      if (!window.confirm(`Esta solicitud es de ${currentlyRequestedDays} días y solo dispones de ${vacationStats.remaining} días de vacaciones restantes. ¿Deseas enviarla de todas formas?`)) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      let attachmentUrl = undefined;
      
      if (file) {
        setUploadingFile(true);
        attachmentUrl = await uploadService.uploadFile(file);
        setUploadingFile(false);
      }

      await absencesService.create({
        type,
        startDate,
        endDate,
        comments,
        attachmentUrl
      });
      
      toast.success('¡Solicitud enviada a tus supervisores con éxito!');
      setType('VACACIONES');
      setStartDate('');
      setEndDate('');
      setComments('');
      setFile(null);
      
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error al enviar la solicitud');
    } finally {
      setIsSubmitting(false);
      setUploadingFile(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await absencesService.delete(deletingId);
      setAbsences(prev => prev.filter(a => a.id !== deletingId));
      toast.success('Solicitud cancelada correctamente');
      setDeletingId(null);
    } catch (err) {
      toast.error('No se pudo cancelar la solicitud.');
    }
  };

  const filteredAbsences = absences.filter(a => filterStatus === 'ALL' || a.status === filterStatus);

  // Calendar helpers
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    
    // First day of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
    const firstDay = new Date(year, month, 1);
    let startDayOfWeek = firstDay.getDay() - 1; // 0 for Monday
    if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday becomes 6

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: { date: Date; isCurrentMonth: boolean; absences: Absence[] }[] = [];

    // Previous month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i);
      days.push({ date: d, isCurrentMonth: false, absences: [] });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dTime = d.setHours(0,0,0,0);
      
      const dayAbsences = absences.filter(a => {
        const s = new Date(a.startDate).setHours(0,0,0,0);
        const e = new Date(a.endDate).setHours(0,0,0,0);
        return dTime >= s && dTime <= e;
      });

      days.push({ date: new Date(year, month, i), isCurrentMonth: true, absences: dayAbsences });
    }

    // Next month padding to reach 35 or 42 cells
    const remaining = 35 - days.length > 0 ? 35 - days.length : (42 - days.length > 0 ? 42 - days.length : 0);
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false, absences: [] });
    }

    return days;
  }, [currentMonthDate, absences]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-3xl text-slate-900 tracking-tight">Ausencias y Vacaciones</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              RRHH
            </span>
          </div>
          <p className="font-sans text-slate-500 mt-1 text-sm">
            Consulta tu saldo de vacaciones, solicita permisos laborales y haz seguimiento del estado de aprobación en tiempo real.
          </p>
        </div>

        {/* TABS */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start md:self-auto border border-slate-200">
          <button
            onClick={() => setActiveTab('solicitudes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'solicitudes'
                ? 'bg-white text-[#001c3a] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock size={15} /> Mis Solicitudes
          </button>
          <button
            onClick={() => setActiveTab('calendario')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'calendario'
                ? 'bg-white text-[#001c3a] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon size={15} /> Calendario Anual
          </button>
        </div>
      </div>

      {/* SUPERVISORES ASIGNADOS BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-[#001c3a] to-blue-950 rounded-2xl p-5 md:p-6 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start md:items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
            <ShieldCheck size={26} className="text-blue-300" />
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-wider text-blue-200 font-bold">Flujo de Aprobación</h2>
            <div className="text-base font-semibold text-white flex flex-wrap items-center gap-2 mt-0.5">
              <span>Tus solicitudes son revisadas por:</span>
              {supervisors.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  {supervisors.map(sup => (
                    <span 
                      key={sup.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/15 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-medium backdrop-blur-sm transition-colors"
                      title={sup.email}
                    >
                      <span className="w-4 h-4 rounded-full bg-blue-400 text-slate-900 flex items-center justify-center text-[9px] font-bold">
                        {sup.name.charAt(0)}
                      </span>
                      {sup.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="italic text-blue-200 font-normal">
                  Dirección General / Recursos Humanos
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="relative z-10 self-start md:self-auto text-xs text-blue-200/80 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
          <Info size={14} className="text-blue-300 shrink-0" />
          <span>Solo tus supervisores asignados reciben y aprueban tus ausencias.</span>
        </div>
      </div>

      {/* TARJETAS DE SALDO DE VACACIONES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        
        {/* Total Anual */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Convenio Anual</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarIcon size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900">{vacationStats.total}</span>
              <span className="text-xs text-slate-500 font-medium">días laborables</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Año {new Date().getFullYear()} según convenio</p>
          </div>
        </div>

        {/* Consumidos */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Disfrutados</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-emerald-600">{vacationStats.consumed}</span>
              <span className="text-xs text-slate-500 font-medium">días</span>
            </div>
            {/* Barra de progreso */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${vacationStats.percent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{vacationStats.percent}% consumido del año</p>
          </div>
        </div>

        {/* En Trámite */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">En Revisión</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-amber-600">{vacationStats.pending}</span>
              <span className="text-xs text-slate-500 font-medium">días solicitados</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Pendientes de resolución por supervisor</p>
          </div>
        </div>

        {/* Restantes */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl p-5 border border-blue-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">Disponibles</span>
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-blue-900">{vacationStats.remaining}</span>
              <span className="text-xs text-blue-700 font-medium">días libres</span>
            </div>
            <p className="text-[11px] text-blue-600/80 mt-1">Saldo libre para solicitar este año</p>
          </div>
        </div>

      </div>

      {activeTab === 'solicitudes' ? (
        /* VISTA PRINCIPAL: FORMULARIO + LISTA */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* FORMULARIO DE SOLICITUD */}
          <section className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 md:p-7 relative overflow-hidden">
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <CalendarOff size={19} className="text-secondary" />
                  Nueva Solicitud
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Completa las fechas y motivo para enviar a aprobación.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Tipo de Ausencia */}
              <div className="space-y-1.5">
                <label className="font-sans font-bold text-xs uppercase tracking-wide text-slate-600">
                  Motivo de la Ausencia
                </label>
                <select 
                  required 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#001c3a]/40 focus:border-[#001c3a] transition-all"
                >
                  {Object.entries(ABSENCE_TYPES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
                {type && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
                    <Info size={15} className="shrink-0 text-blue-600 mt-0.5" />
                    <span>{(ABSENCE_TYPES as any)[type]?.info}</span>
                  </div>
                )}
              </div>

              {/* Rango de Fechas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-sans font-bold text-xs uppercase tracking-wide text-slate-600">
                    Fecha Inicio
                  </label>
                  <input 
                    type="date" 
                    required 
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#001c3a]/40 focus:border-[#001c3a] transition-all" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-sans font-bold text-xs uppercase tracking-wide text-slate-600">
                    Fecha Fin
                  </label>
                  <input 
                    type="date" 
                    required 
                    value={endDate}
                    min={startDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#001c3a]/40 focus:border-[#001c3a] transition-all" 
                  />
                </div>
              </div>

              {/* Indicador en vivo de días calculados */}
              {startDate && endDate && (
                <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/70 text-blue-900 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-600">Días a solicitar: </span>
                    <strong className="text-sm font-bold text-blue-900">{currentlyRequestedDays} {type === 'MATRIMONIO' ? 'días naturales' : 'días laborables'}</strong>
                  </div>
                  {type === 'VACACIONES' && (
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500">Saldo tras solicitud: </span>
                      <strong className={`font-bold ${vacationStats.remaining - currentlyRequestedDays < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                        {vacationStats.remaining - currentlyRequestedDays} días
                      </strong>
                    </div>
                  )}
                </div>
              )}

              {/* Justificante opcional */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-sans font-bold text-xs uppercase tracking-wide text-slate-600">
                    Justificante / Documento
                  </label>
                  <span className="text-[11px] text-slate-400">PDF, JPG, PNG</span>
                </div>
                
                <div className="relative">
                  <input 
                    type="file" 
                    id="file-upload"
                    className="hidden"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    accept=".pdf,image/*"
                  />
                  <label 
                    htmlFor="file-upload" 
                    className="w-full flex items-center justify-between bg-slate-50 border border-dashed border-slate-300 rounded-xl px-4 py-2.5 text-slate-600 text-sm cursor-pointer hover:bg-slate-100 hover:border-slate-400 transition-all"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Upload size={16} className="text-slate-400 shrink-0" />
                      <span className="truncate max-w-[200px]">
                        {file ? file.name : 'Subir archivo justificante'}
                      </span>
                    </div>
                    {file && (
                      <button 
                        type="button" 
                        onClick={(e) => { e.preventDefault(); setFile(null); }}
                        className="p-1 hover:text-red-600 text-slate-400"
                        title="Quitar archivo"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </label>
                </div>
                {type === 'ENFERMEDAD' && !file && (
                  <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle size={13} /> Recomendable adjuntar parte médico para agilizar la tramitación.
                  </p>
                )}
              </div>

              {/* Comentarios */}
              <div className="space-y-1.5">
                <label className="font-sans font-bold text-xs uppercase tracking-wide text-slate-600">
                  Comentarios u Observaciones
                </label>
                <textarea 
                  rows={2} 
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  placeholder="Detalles adicionales para tu supervisor..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-800 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#001c3a]/40 focus:border-[#001c3a] resize-none transition-all" 
                />
              </div>

              {/* Botón de Enviar */}
              <button
                type="submit"
                disabled={isSubmitting || uploadingFile}
                className="w-full py-3 rounded-xl font-bold font-sans text-sm text-white flex items-center justify-center gap-2 bg-[#001c3a] hover:bg-[#002a50] transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer active:scale-[0.99] mt-2"
              >
                {isSubmitting || uploadingFile ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{uploadingFile ? 'Subiendo justificante...' : 'Enviando solicitud...'}</span>
                  </>
                ) : (
                  <>
                    <Send size={16} /> Enviar a mis Supervisores
                  </>
                )}
              </button>
            </form>
          </section>

          {/* HISTORIAL DE SOLICITUDES */}
          <section className="lg:col-span-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-secondary" />
                <h3 className="font-bold text-slate-800 text-sm">Historial de Solicitudes</h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                  {absences.length}
                </span>
              </div>

              {/* Filtro por estado */}
              <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => {
                  const labels = { ALL: 'Todas', PENDING: 'Pendientes', APPROVED: 'Aprobadas', REJECTED: 'Rechazadas' };
                  const active = filterStatus === st;
                  return (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                        active
                          ? 'bg-[#001c3a] text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {labels[st]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Listado */}
            {isLoading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center text-slate-400">
                <span className="w-8 h-8 border-3 border-slate-200 border-t-[#001c3a] rounded-full animate-spin mb-3"></span>
                <p className="text-sm">Cargando solicitudes...</p>
              </div>
            ) : filteredAbsences.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                <CalendarOff size={42} className="mx-auto mb-3 text-slate-300" />
                <h4 className="font-bold text-slate-700 text-sm">No se encontraron solicitudes</h4>
                <p className="text-xs text-slate-400 mt-1">No hay registros con el filtro seleccionado.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAbsences.map(absence => {
                  const days = getAbsenceDays(absence);
                  const s = new Date(absence.startDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
                  const e = new Date(absence.endDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
                  const typeMeta = (ABSENCE_TYPES as any)[absence.type] || { label: absence.type, color: 'slate' };
                  
                  return (
                    <div 
                      key={absence.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col gap-3 group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                          <span className="font-bold text-sm text-slate-800">{typeMeta.label}</span>
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                            {days} {absence.type === 'MATRIMONIO' ? 'días naturales' : 'días laborables'}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          {absence.status === 'APPROVED' && (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-200">
                              <CheckCircle2 size={14} /> Aprobado
                            </span>
                          )}
                          {absence.status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-200">
                              <Clock size={14} /> Pendiente de Aprobación
                            </span>
                          )}
                          {absence.status === 'REJECTED' && (
                            <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg text-xs font-bold border border-rose-200">
                              <XCircle size={14} /> Rechazado
                            </span>
                          )}

                          {absence.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => setDeletingId(absence.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Cancelar solicitud"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Fechas y detalles */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                        <div>
                          <span className="text-slate-400 font-medium">Período: </span>
                          <span className="font-semibold text-slate-800">{s} — {e}</span>
                        </div>
                        {absence.attachmentUrl && (
                          <div className="sm:text-right">
                            <a 
                              href={absence.attachmentUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold"
                            >
                              <FileText size={13} /> Ver justificante adjunto
                            </a>
                          </div>
                        )}
                      </div>

                      {absence.comments && (
                        <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                          "{absence.comments}"
                        </p>
                      )}

                      {/* Sello de Auditoría (Aprobado o Rechazado por supervisor) */}
                      {(absence.status === 'APPROVED' || absence.status === 'REJECTED') && (
                        <div className={`mt-1 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                          absence.status === 'APPROVED' 
                            ? 'bg-emerald-50/60 border-emerald-100 text-emerald-900' 
                            : 'bg-rose-50/60 border-rose-100 text-rose-900'
                        }`}>
                          <div className="shrink-0 mt-0.5">
                            {absence.status === 'APPROVED' ? <Check size={15} className="text-emerald-600" /> : <X size={15} className="text-rose-600" />}
                          </div>
                          <div className="space-y-0.5">
                            <div className="font-bold">
                              {absence.status === 'APPROVED' ? 'Aprobado por: ' : 'Rechazado por: '}
                              <span>{absence.approvedBy?.name || 'Supervisor / Dirección'}</span>
                              {absence.approvedAt && (
                                <span className="text-[11px] font-normal text-slate-500 ml-1.5">
                                  el {new Date(absence.approvedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                              )}
                            </div>
                            {absence.resolutionNote && (
                              <p className="text-xs text-slate-700 italic">
                                Nota del supervisor: "{absence.resolutionNote}"
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </section>

        </div>
      ) : (
        /* VISTA CALENDARIO PERSONAL */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <CalendarIcon size={20} className="text-[#001c3a]" />
                {monthNames[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Visualiza tus períodos de descanso y ausencias programadas.</p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1))}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
                title="Mes anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentMonthDate(new Date())}
                className="px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
              >
                Hoy
              </button>
              <button
                onClick={() => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1))}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
                title="Mes siguiente"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Leyenda */}
          <div className="flex flex-wrap items-center gap-4 text-xs pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-500"></span>
              <span className="text-slate-600">Vacaciones Aprobadas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-400"></span>
              <span className="text-slate-600">Pendiente de Aprobación</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-400"></span>
              <span className="text-slate-600">Baja / Otros Permisos</span>
            </div>
          </div>

          {/* Grid de días */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            {/* Cabecera días semana */}
            <div className="grid grid-cols-7 bg-slate-50 text-center font-bold text-xs text-slate-500 py-2.5 border-b border-slate-200">
              {dayNames.map(d => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Días */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 text-sm">
              {calendarDays.map((cd, idx) => {
                const isToday = cd.date.toDateString() === new Date().toDateString();
                const isWeekend = cd.date.getDay() === 0 || cd.date.getDay() === 6;

                return (
                  <div 
                    key={idx}
                    className={`min-h-[90px] p-2 flex flex-col justify-between transition-colors ${
                      !cd.isCurrentMonth ? 'bg-slate-50/50 text-slate-300' : isWeekend ? 'bg-slate-50/30' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday ? 'bg-[#001c3a] text-white' : cd.isCurrentMonth ? 'text-slate-700' : 'text-slate-300'
                      }`}>
                        {cd.date.getDate()}
                      </span>
                    </div>

                    <div className="space-y-1 mt-1">
                      {cd.absences.map(a => {
                        const isVac = a.type === 'VACACIONES';
                        const isApproved = a.status === 'APPROVED';
                        const bgClass = isApproved 
                          ? (isVac ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white')
                          : 'bg-amber-400 text-amber-950 font-bold';

                        return (
                          <div 
                            key={a.id} 
                            className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium shadow-xs ${bgClass}`}
                            title={`${(ABSENCE_TYPES as any)[a.type]?.label || a.type} (${a.status})`}
                          >
                            {(ABSENCE_TYPES as any)[a.type]?.label || a.type}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA CANCELAR SOLICITUD */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900">¿Cancelar esta solicitud?</h3>
            <p className="text-sm text-slate-500 mt-1">
              Esta solicitud pendiente será eliminada y tus supervisores ya no la verán en su lista de tareas.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                No, mantener
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm"
              >
                Sí, cancelar solicitud
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
