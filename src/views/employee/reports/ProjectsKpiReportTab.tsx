import React, { useState, useEffect } from 'react';
import { RefreshCw, Filter, AlertCircle, Calendar as CalendarIcon, Download, CheckCircle, Clock, Building2, Briefcase, Activity } from 'lucide-react';
import api from '../../../services/api';
import { exportProjectsKpiToExcel } from '../../../utils/exportProjectsKpiReport';
import { useCurrency } from '../../../hooks/useCurrency';

interface ProjectsKpiData {
  globalKpis: {
    totalProjects: number;
    globalTotalActivities: number;
    averageActivitiesPerProject: number;
    globalCompletionRate: number;
    globalQuotedAmount: number;
    globalCertifiedAmount: number;
    globalFinancialProgress: number;
  };
  projectsData: Array<{
    id: string;
    name: string;
    accountName: string;
    sector: string;
    status: string;
    quotedAmount: number;
    certifiedAmount: number;
    invoicedAmount: number;
    financialProgress: number;
    totalActivities: number;
    completedActivities: number;
    pendingActivities: number;
    completionRate: number;
    breakdown: {
      calls: number;
      emails: number;
      meetings: number;
      others: number;
    };
    daysSinceLastActivity: number | null;
    lastActivityDate: string | null;
    nextActivityDate: string | null;
  }>;
}

;

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const ProjectsKpiReportTab = () => {
  const { formatCurrency } = useCurrency();
  const [data, setData] = useState<ProjectsKpiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [sector, setSector] = useState('');
  const [activityType, setActivityType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchProjectsReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (sector) params.append('sector', sector);
      if (activityType) params.append('activityType', activityType);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await api.get(`/crm-reports/projects?${params.toString()}`);
      setData(res.data.data);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar el informe de proyectos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsReport();
  }, [sector, activityType, startDate, endDate]);

  const handleExportCSV = async () => {
    if (!data) return;
    const filtersInfo = [
      sector ? `Sector: ${sector}` : '',
      activityType ? `Tipo: ${activityType}` : '',
      startDate ? `Desde: ${startDate}` : '',
      endDate ? `Hasta: ${endDate}` : ''
    ].filter(Boolean).join(' | ') || 'Todos los registros';

    await exportProjectsKpiToExcel(data, filtersInfo);
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Barra de Filtros Específica para Proyectos */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between relative z-20">
        <div className="flex items-center gap-2 text-slate-700 font-bold">
          <Filter size={18} className="text-[#002D5A]" />
          <span>Filtros de Proyectos</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#002D5A]">
            <Building2 size={16} className="text-slate-400 mr-2" />
            <select value={sector} onChange={(e) => setSector(e.target.value)} className="bg-transparent text-sm text-slate-700 outline-none w-32 cursor-pointer">
              <option value="">Todos los sectores</option>
              <option value="Administración Pública">Administración Pública</option>
              <option value="Arquitectura">Arquitectura</option>
              <option value="Construcción">Construcción</option>
              <option value="Industria">Industria</option>
              <option value="Promotor">Promotor</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#002D5A]">
            <Activity size={16} className="text-slate-400 mr-2" />
            <select value={activityType} onChange={(e) => setActivityType(e.target.value)} className="bg-transparent text-sm text-slate-700 outline-none w-32 cursor-pointer">
              <option value="">Todas las Actividades</option>
              <option value="CALL">Llamadas</option>
              <option value="EMAIL">Correos</option>
              <option value="MEETING">Reuniones</option>
              <option value="TASK">Tareas</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#002D5A]">
            <CalendarIcon size={16} className="text-slate-400 mr-2" />
            <div className="flex items-center gap-2">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-sm text-slate-700 outline-none cursor-pointer" />
              <span className="text-slate-400 text-xs font-medium">al</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-sm text-slate-700 outline-none cursor-pointer" />
            </div>
          </div>

          <button onClick={handleExportCSV} className="flex items-center gap-2 px-3 py-1.5 bg-[#107c41] text-white text-sm font-semibold rounded-lg hover:bg-[#0c5e31] transition-colors shadow-sm">
            <Download size={16} /> Excel
          </button>
        </div>
      </div>

      {loading && !data && (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
          <RefreshCw size={32} className="animate-spin text-[#001c3a] mb-4" />
          <p className="text-slate-500 font-medium">Cargando reporte de proyectos...</p>
        </div>
      )}

      {error && !data && (
        <div className="p-6 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center border border-red-100 gap-2 font-bold">
          <AlertCircle /> {error}
        </div>
      )}

      {data && (
        <>
          {/* Tarjetas Globales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full opacity-50"></div>
              <p className="text-xs font-bold text-slate-500 uppercase">Total Proyectos</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{data.globalKpis.totalProjects}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-50 rounded-full opacity-50"></div>
              <p className="text-xs font-bold text-slate-500 uppercase">Presupuesto Global</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{formatCurrency(data.globalKpis.globalQuotedAmount)}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-purple-50 rounded-full opacity-50"></div>
              <p className="text-xs font-bold text-slate-500 uppercase">Total Actividades</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{data.globalKpis.globalTotalActivities}</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">{data.globalKpis.averageActivitiesPerProject.toFixed(1)} de media por proyecto</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-orange-50 rounded-full opacity-50"></div>
              <p className="text-xs font-bold text-slate-500 uppercase">Completitud Actividades</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{data.globalKpis.globalCompletionRate.toFixed(1)}%</p>
            </div>
          </div>

          {/* Tabla Densa (DataGrid) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Briefcase size={18} className="text-[#002D5A]" />
                Detalle Analítico por Proyecto
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                    <th className="p-3">Proyecto / Empresa</th>
                    <th className="p-3">Sector</th>
                    <th className="p-3">Avance Financiero</th>
                    <th className="p-3">Monto Cotizado</th>
                    <th className="p-3 text-center border-l border-slate-200">Total Act.</th>
                    <th className="p-3 text-center">Tasa Comp.</th>
                    <th className="p-3 text-center bg-slate-100" title="Actividades Completadas">✅ Comp.</th>
                    <th className="p-3 text-center bg-slate-100" title="Actividades Planeadas con fecha">📅 Plan. (F)</th>
                    <th className="p-3 text-center bg-slate-100" title="Actividades Planeadas sin fecha">⏳ Plan. (SF)</th>
                    <th className="p-3 text-center bg-slate-100" title="Llamadas">📞</th>
                    <th className="p-3 text-center bg-slate-100" title="Correos">✉️</th>
                    <th className="p-3 text-center bg-slate-100" title="Reuniones">🤝</th>
                    <th className="p-3 border-l border-slate-200">Días Inactivo</th>
                    <th className="p-3">Última Act.</th>
                    <th className="p-3">Próxima Act.</th>
                  </tr>
                </thead>
                <tbody>
                  {data.projectsData.length === 0 ? (
                    <tr>
                      <td colSpan={15} className="p-8 text-center text-slate-500 font-medium">
                        No hay proyectos que coincidan con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    data.projectsData.map((project) => (
                      <tr key={project.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="p-3">
                          <p className="font-bold text-slate-800 text-sm">{project.name}</p>
                          <p className="text-xs text-slate-500">{project.accountName}</p>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md">
                            {project.sector}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-slate-200 rounded-full h-2 min-w-[60px]">
                              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min(project.financialProgress, 100)}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-slate-600">{project.financialProgress.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-sm text-slate-700">
                          {formatCurrency(project.quotedAmount)}
                        </td>
                        <td className="p-3 text-center border-l border-slate-200 font-bold text-[#002D5A]">
                          {project.totalActivities}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-xs font-bold px-2 py-1 rounded-md ${project.completionRate > 80 ? 'bg-emerald-100 text-emerald-700' : project.completionRate > 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            {project.completionRate.toFixed(0)}%
                          </span>
                        </td>
                        <td className="p-3 text-center bg-slate-50/50 text-sm font-semibold text-emerald-600">{project.completedActivities || 0}</td>
                        <td className="p-3 text-center bg-slate-50/50 text-sm font-semibold text-blue-600">{project.plannedWithDate || 0}</td>
                        <td className="p-3 text-center bg-slate-50/50 text-sm font-semibold text-slate-600">{project.plannedWithoutDate || 0}</td>
                        <td className="p-3 text-center bg-slate-50/50 text-sm font-semibold text-slate-600">{project.breakdown.calls}</td>
                        <td className="p-3 text-center bg-slate-50/50 text-sm font-semibold text-slate-600">{project.breakdown.emails}</td>
                        <td className="p-3 text-center bg-slate-50/50 text-sm font-semibold text-slate-600">{project.breakdown.meetings}</td>
                        
                        <td className="p-3 border-l border-slate-200">
                          {project.daysSinceLastActivity !== null ? (
                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${project.daysSinceLastActivity > 30 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              Hace {project.daysSinceLastActivity} días
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">Sin act.</span>
                          )}
                        </td>
                        <td className="p-3 text-sm text-slate-600">
                          {formatDate(project.lastActivityDate)}
                        </td>
                        <td className="p-3 text-sm text-slate-600 font-medium">
                          {formatDate(project.nextActivityDate)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
