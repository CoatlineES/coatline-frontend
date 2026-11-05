import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, CheckCircle2, XCircle, FileText, CalendarOff, AlertTriangle, 
  Users, Search, Filter, Calendar as CalendarIcon, Check, X, ChevronLeft, 
  ChevronRight, ArrowRight, ShieldCheck, UserCheck, MessageSquare, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { absencesService, Absence, AbsenceStatus } from '../../services/absences.service';
import toast from 'react-hot-toast';

const ABSENCE_TYPES: Record<string, { label: string; color: string }> = {
  VACACIONES: { label: "Vacaciones Anuales", color: "blue" },
  ENFERMEDAD: { label: "Baja por Enfermedad (IT)", color: "emerald" },
  MATRIMONIO: { label: "Matrimonio", color: "purple" },
  MUDANZA: { label: "Mudanza", color: "amber" },
  HOSPITALIZACION: { label: "Fallecimiento / Hospitalización", color: "rose" },
  CITA_MEDICA: { label: "Cita Médica", color: "cyan" },
  ASUNTOS_PROPIOS: { label: "Asuntos Propios", color: "indigo" },
  OTROS: { label: "Otros", color: "slate" }
};

export default function GestionAusenciasView() {
  const { user } = useAuth();
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [supervisees, setSupervisees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters state
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [scope, setScope] = useState<'mine' | 'all'>('mine');
  
  // View mode
  const [viewMode, setViewMode] = useState<'lista' | 'calendario'>('lista');
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  // Modal resolution state
  const [resolutionModal, setResolutionModal] = useState<{
    isOpen: boolean;
    absence: Absence | null;
    action: 'APPROVED' | 'REJECTED';
    note: string;
    isSubmitting: boolean;
  }>({
    isOpen: false,
    absence: null,
    action: 'APPROVED',
    note: '',
    isSubmitting: false,
  });

  const isGlobalAdmin = useMemo(() => {
    const roleName = user?.role || '';
    const perms = (user as any)?.customPermissions || [];
    return ['SUPERADMIN', 'ADMINISTRACION', 'ADMIN', 'Director Global'].includes(roleName) || perms.includes('rrhh');
  }, [user]);

  const loadAbsences = async () => {
    try {
      setIsLoading(true);
      const [data, supData] = await Promise.all([
        absencesService.getAll({ scope: isGlobalAdmin ? scope : 'mine' }),
        absencesService.getMySupervisees().catch(() => [])
      ]);
      setAbsences(data);
      setSupervisees(supData);
    } catch (err) {
      console.error('Error loading absences', err);
      toast.error('Error al sincronizar las solicitudes de ausencias');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAbsences();
  }, [scope]);

  // Open modal for approval or rejection
  const handleOpenResolutionModal = (absence: Absence, action: 'APPROVED' | 'REJECTED') => {
    setResolutionModal({
      isOpen: true,
      absence,
      action,
      note: '',
      isSubmitting: false
    });
  };

  // Submit resolution
  const handleConfirmResolution = async () => {
    if (!resolutionModal.absence) return;
    const { absence, action, note } = resolutionModal;

    if (action === 'REJECTED' && !note.trim()) {
      toast.error('Por favor, indica un motivo para el rechazo de la solicitud.');
      return;
    }

    setResolutionModal(prev => ({ ...prev, isSubmitting: true }));
    try {
      const updated = await absencesService.updateStatus(absence.id, action, note.trim() || undefined);
      
      setAbsences(prev => prev.map(a => a.id === absence.id ? { 
        ...a, 
        status: action,
        approvedBy: { id: user?.id || '', name: user?.name || 'Tú' },
        approvedAt: new Date().toISOString(),
        resolutionNote: note.trim() || undefined
      } : a));

      toast.success(action === 'APPROVED' ? 'Solicitud aprobada con éxito' : 'Solicitud rechazada');
      setResolutionModal({ isOpen: false, absence: null, action: 'APPROVED', note: '', isSubmitting: false });
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Error al procesar la solicitud');
      setResolutionModal(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const today = new Date().setHours(0,0,0,0);
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    const pending = absences.filter(a => a.status === 'PENDING').length;
    
    const absentToday = absences.filter(a => {
      if (a.status !== 'APPROVED') return false;
      const s = new Date(a.startDate).setHours(0,0,0,0);
      const e = new Date(a.endDate).setHours(0,0,0,0);
      return today >= s && today <= e;
    }).length;

    const approvedThisMonth = absences.filter(a => {
      if (a.status !== 'APPROVED') return false;
      const s = new Date(a.startDate);
      return s.getMonth() === thisMonth && s.getFullYear() === thisYear;
    }).length;

    return { pending, absentToday, approvedThisMonth, total: absences.length };
  }, [absences]);

  // Filtering
  const filteredAbsences = useMemo(() => {
    return absences.filter(a => {
      const matchesFilter = filter === 'ALL' || a.status === filter;
      const matchesType = typeFilter === 'ALL' || a.type === typeFilter;
      const matchesSearch = !searchQuery.trim() || 
        (a.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.comments || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesFilter && matchesType && matchesSearch;
    });
  }, [absences, filter, typeFilter, searchQuery]);

  // Calendar helpers
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: { date: Date; isCurrentMonth: boolean; absences: Absence[] }[] = [];

    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, prevMonthDays - i), isCurrentMonth: false, absences: [] });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dTime = d.setHours(0,0,0,0);
      
      const dayAbsences = absences.filter(a => {
        // En calendario mostramos aprobadas y pendientes
        const s = new Date(a.startDate).setHours(0,0,0,0);
        const e = new Date(a.endDate).setHours(0,0,0,0);
        return dTime >= s && dTime <= e;
      });

      days.push({ date: new Date(year, month, i), isCurrentMonth: true, absences: dayAbsences });
    }

    const remaining = 35 - days.length > 0 ? 35 - days.length : (42 - days.length > 0 ? 42 - days.length : 0);
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false, absences: [] });
    }

    return days;
  }, [currentMonthDate, absences]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-3xl text-slate-900 tracking-tight">Gestión de Ausencias</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#001c3a] text-white">
              Supervisión
            </span>
          </div>
          <p className="font-sans text-slate-500 mt-1 text-sm">
            Panel de supervisión para revisar, aprobar o rechazar solicitudes de vacaciones y permisos de tus supervisados.
          </p>
        </div>

        {/* Vista Lista / Calendario Toggle */}
        <div className="flex items-center gap-3">
          {/* Scope switch if global admin */}
          {isGlobalAdmin && (
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setScope('mine')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  scope === 'mine' ? 'bg-white text-[#001c3a] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Mis Supervisados
              </button>
              <button
                onClick={() => setScope('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  scope === 'all' ? 'bg-white text-[#001c3a] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Toda la Empresa
              </button>
            </div>
          )}

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('lista')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'lista' ? 'bg-white text-[#001c3a] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock size={15} /> Lista
            </button>
            <button
              onClick={() => setViewMode('calendario')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'calendario' ? 'bg-white text-[#001c3a] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon size={15} /> Calendario de Equipo
            </button>
          </div>
        </div>
      </div>

      {/* BANNER DE TRABAJADORES SUPERVISADOS */}
      {!isGlobalAdmin && (
        <div className="bg-gradient-to-r from-slate-900 via-[#001c3a] to-blue-950 p-4 md:p-5 rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md border border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-blue-300 font-bold shrink-0 backdrop-blur-xs border border-white/10">
              <UserCheck size={22} />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wider text-blue-300 font-bold">Tus Trabajadores Asignados</h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {supervisees.length > 0 ? (
                  supervisees.map((sup: any) => (
                    <span key={sup.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/15 border border-white/20 rounded-lg text-xs font-semibold backdrop-blur-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      {sup.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-blue-200/80 italic">
                    Aún no tienes trabajadores asignados bajo tu supervisión.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-xs text-blue-200/80 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl self-start sm:self-auto flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-blue-300 shrink-0" />
            <span>{supervisees.length} {supervisees.length === 1 ? 'trabajador a tu cargo' : 'trabajadores a tu cargo'}</span>
          </div>
        </div>
      )}

      {/* METRICAS KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Pendientes */}
        <div 
          onClick={() => setFilter('PENDING')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            filter === 'PENDING' ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/40' : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Por Revisar</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-amber-600">{metrics.pending}</span>
            <p className="text-xs text-slate-500 mt-1">Solicitudes esperando tu aprobación</p>
          </div>
        </div>

        {/* Ausentes Hoy */}
        <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ausentes Hoy</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.absentToday}</span>
            <p className="text-xs text-slate-500 mt-1">Trabajadores en permiso en el día de hoy</p>
          </div>
        </div>

        {/* Aprobadas este mes */}
        <div 
          onClick={() => setFilter('APPROVED')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            filter === 'APPROVED' ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/40' : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Aprobadas (Mes)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-emerald-600">{metrics.approvedThisMonth}</span>
            <p className="text-xs text-slate-500 mt-1">Permisos confirmados este mes</p>
          </div>
        </div>

        {/* Total Solicitudes */}
        <div 
          onClick={() => setFilter('ALL')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            filter === 'ALL' ? 'bg-slate-100 border-slate-400' : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Histórico</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <CalendarIcon size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-800">{metrics.total}</span>
            <p className="text-xs text-slate-500 mt-1">Todas las solicitudes registradas</p>
          </div>
        </div>

      </div>

      {viewMode === 'lista' ? (
        /* VISTA LISTA / TABLA DE GESTIÓN */
        <div className="space-y-4">
          {/* BARRA DE FILTROS Y BÚSQUEDA */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Buscador de empleado */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por empleado o comentario..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:ring-2 focus:ring-[#001c3a]/30 focus:border-[#001c3a] transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              {/* Filtro por tipo */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Filter size={14} className="text-slate-400" />
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#001c3a]/30"
                >
                  <option value="ALL">Todos los motivos</option>
                  {Object.entries(ABSENCE_TYPES).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              {/* Filtro por estado */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filter === 'PENDING' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Pendientes {metrics.pending > 0 && `(${metrics.pending})`}
                </button>
                <button 
                  onClick={() => setFilter('APPROVED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filter === 'APPROVED' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Aprobadas
                </button>
                <button 
                  onClick={() => setFilter('REJECTED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filter === 'REJECTED' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Rechazadas
                </button>
                <button 
                  onClick={() => setFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Todas
                </button>
              </div>
            </div>

          </div>

          {/* TABLA PRINCIPAL */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-16 text-slate-400">
                  <span className="w-9 h-9 border-3 border-slate-200 border-t-[#001c3a] rounded-full animate-spin mb-3"></span>
                  <p className="text-sm font-medium">Sincronizando solicitudes del equipo...</p>
                </div>
              ) : filteredAbsences.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                  <CalendarOff size={48} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-base font-bold text-slate-800 mb-1">No hay solicitudes para mostrar</p>
                  <p className="text-xs text-slate-400">No se encontraron solicitudes con los filtros aplicados.</p>
                </div>
              ) : (
                <table className="w-full text-left font-sans text-sm min-w-[900px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 text-xs uppercase tracking-wider font-bold">
                      <th className="py-4 px-6">Empleado</th>
                      <th className="py-4 px-6">Motivo</th>
                      <th className="py-4 px-6">Período</th>
                      <th className="py-4 px-6">Observaciones</th>
                      <th className="py-4 px-6 text-center">Estado</th>
                      <th className="py-4 px-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAbsences.map(absence => {
                      const s = new Date(absence.startDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
                      const e = new Date(absence.endDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
                      
                      // Calculate days
                      const start = new Date(absence.startDate);
                      const end = new Date(absence.endDate);
                      let days = 0;
                      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end) {
                        if (absence.type === 'MATRIMONIO') {
                          days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                        } else {
                          let cur = new Date(start);
                          while (cur <= end) {
                            if (cur.getDay() !== 0 && cur.getDay() !== 6) days++;
                            cur.setDate(cur.getDate() + 1);
                          }
                        }
                      }

                      const typeMeta = ABSENCE_TYPES[absence.type] || { label: absence.type, color: 'slate' };
                      const employeeRole = (absence.user as any)?.role?.name || '';
                      const employeeDept = (absence.user as any)?.department?.name || '';

                      return (
                        <tr key={absence.id} className="hover:bg-slate-50/70 transition-colors group">
                          {/* Empleado */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#001c3a] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                {absence.user?.name ? absence.user.name.charAt(0) : 'U'}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-sm">{absence.user?.name || 'Empleado'}</div>
                                <div className="text-[11px] text-slate-500">
                                  {absence.user?.email || 'N/A'} {employeeDept ? `• ${employeeDept}` : ''}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Tipo y Justificante */}
                          <td className="py-4 px-6">
                            <span className="font-semibold text-slate-800 text-xs block">{typeMeta.label}</span>
                            {absence.attachmentUrl ? (
                              <a 
                                href={absence.attachmentUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1 mt-1 font-semibold"
                              >
                                <FileText size={12} /> Ver Justificante
                              </a>
                            ) : absence.type === 'ENFERMEDAD' ? (
                              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded font-medium">
                                <AlertTriangle size={11} /> Sin justificante médico
                              </span>
                            ) : null}
                          </td>

                          {/* Fechas */}
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="font-semibold text-slate-800 text-xs">{s} — {e}</div>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {days} {absence.type === 'MATRIMONIO' ? 'días naturales' : 'días laborables'}
                            </span>
                          </td>

                          {/* Comentarios & Auditoría */}
                          <td className="py-4 px-6 max-w-[260px]">
                            {absence.comments ? (
                              <p className="text-xs text-slate-600 line-clamp-2" title={absence.comments}>
                                "{absence.comments}"
                              </p>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Sin comentarios</span>
                            )}

                            {/* Mostrar quién resolvió si está resuelta */}
                            {(absence.status === 'APPROVED' || absence.status === 'REJECTED') && absence.approvedBy && (
                              <div className="mt-1 text-[11px] text-slate-500">
                                <span>{absence.status === 'APPROVED' ? 'Aprobada por: ' : 'Rechazada por: '}</span>
                                <strong className="text-slate-700">{absence.approvedBy.name}</strong>
                                {absence.resolutionNote && (
                                  <p className="text-[10px] text-slate-500 italic truncate" title={absence.resolutionNote}>
                                    Nota: "{absence.resolutionNote}"
                                  </p>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Estado */}
                          <td className="py-4 px-6 text-center whitespace-nowrap">
                            {absence.status === 'APPROVED' && (
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-200">
                                <CheckCircle2 size={13} /> Aprobado
                              </span>
                            )}
                            {absence.status === 'PENDING' && (
                              <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md text-xs font-bold border border-amber-200">
                                <Clock size={13} /> Pendiente
                              </span>
                            )}
                            {absence.status === 'REJECTED' && (
                              <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md text-xs font-bold border border-rose-200">
                                <XCircle size={13} /> Rechazado
                              </span>
                            )}
                          </td>

                          {/* Acciones */}
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            {absence.status === 'PENDING' ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenResolutionModal(absence, 'APPROVED')}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-colors shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                                >
                                  <Check size={14} /> Aprobar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenResolutionModal(absence, 'REJECTED')}
                                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
                                >
                                  <X size={14} /> Rechazar
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">
                                Procesado
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* VISTA CALENDARIO DE EQUIPO */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <CalendarIcon size={20} className="text-[#001c3a]" />
                Calendario de Cobertura del Equipo — {monthNames[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Verifica posibles solapamientos de vacaciones o bajas entre trabajadores para garantizar la operatividad de obra y oficina.
              </p>
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

          {/* Grid de días */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="grid grid-cols-7 bg-slate-50 text-center font-bold text-xs text-slate-500 py-2.5 border-b border-slate-200">
              {dayNames.map(d => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 text-sm">
              {calendarDays.map((cd, idx) => {
                const isToday = cd.date.toDateString() === new Date().toDateString();
                const isWeekend = cd.date.getDay() === 0 || cd.date.getDay() === 6;

                return (
                  <div 
                    key={idx}
                    className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                      !cd.isCurrentMonth ? 'bg-slate-50/50 text-slate-300' : isWeekend ? 'bg-slate-50/30' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday ? 'bg-[#001c3a] text-white' : cd.isCurrentMonth ? 'text-slate-700' : 'text-slate-300'
                      }`}>
                        {cd.date.getDate()}
                      </span>
                      {cd.absences.length > 0 && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {cd.absences.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 mt-1 max-h-20 overflow-y-auto custom-scrollbar">
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
                            title={`${a.user?.name || 'Empleado'}: ${(ABSENCE_TYPES as any)[a.type]?.label || a.type} (${a.status})`}
                          >
                            <strong>{a.user?.name?.split(' ')[0]}:</strong> {(ABSENCE_TYPES as any)[a.type]?.label || a.type}
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

      {/* MODAL DE RESOLUCIÓN (APROBACIÓN / RECHAZO) */}
      {resolutionModal.isOpen && resolutionModal.absence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 md:p-7 max-w-lg w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                resolutionModal.action === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {resolutionModal.action === 'APPROVED' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">
                  {resolutionModal.action === 'APPROVED' ? 'Aprobar Solicitud de Ausencia' : 'Rechazar Solicitud de Ausencia'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Esta acción quedará registrada con tu firma de supervisor y notificará al empleado.
                </p>
              </div>
            </div>

            {/* Resumen del empleado y solicitud */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Empleado:</span>
                <strong className="text-slate-800">{resolutionModal.absence.user?.name || 'Desconocido'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tipo de Ausencia:</span>
                <strong className="text-slate-800">{ABSENCE_TYPES[resolutionModal.absence.type]?.label || resolutionModal.absence.type}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Período:</span>
                <strong className="text-slate-800">
                  {new Date(resolutionModal.absence.startDate).toLocaleDateString('es-ES')} al {new Date(resolutionModal.absence.endDate).toLocaleDateString('es-ES')}
                </strong>
              </div>
              {resolutionModal.absence.comments && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-0.5">Comentarios del empleado:</span>
                  <p className="italic text-slate-700">"{resolutionModal.absence.comments}"</p>
                </div>
              )}
            </div>

            {/* Input de Nota / Motivo */}
            <div className="space-y-1.5 mb-6">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <MessageSquare size={14} className="text-slate-400" />
                {resolutionModal.action === 'APPROVED' 
                  ? 'Comentarios u Observaciones (Opcional)' 
                  : 'Motivo del Rechazo (Obligatorio)'}
              </label>
              <textarea
                rows={3}
                value={resolutionModal.note}
                onChange={e => setResolutionModal(prev => ({ ...prev, note: e.target.value }))}
                placeholder={resolutionModal.action === 'APPROVED' 
                  ? 'Ej. Aprobado. Asegurarse de dejar organizadas las tareas de obra con el equipo.' 
                  : 'Ej. Rechazado por coincidencia con entrega crítica de proyecto. Por favor reprogramar para la semana siguiente.'}
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#001c3a]/40 resize-none font-sans"
              />
              {resolutionModal.action === 'REJECTED' && !resolutionModal.note.trim() && (
                <p className="text-[11px] text-rose-600 font-medium">
                  Es indispensable indicar el motivo para que el trabajador pueda coordinar fechas alternativas.
                </p>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={resolutionModal.isSubmitting}
                onClick={() => setResolutionModal({ isOpen: false, absence: null, action: 'APPROVED', note: '', isSubmitting: false })}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={resolutionModal.isSubmitting || (resolutionModal.action === 'REJECTED' && !resolutionModal.note.trim())}
                onClick={handleConfirmResolution}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer ${
                  resolutionModal.action === 'APPROVED' 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {resolutionModal.isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {resolutionModal.action === 'APPROVED' ? <Check size={15} /> : <X size={15} />}
                    {resolutionModal.action === 'APPROVED' ? 'Confirmar Aprobación' : 'Confirmar Rechazo'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
