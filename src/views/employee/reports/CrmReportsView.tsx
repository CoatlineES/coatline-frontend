import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { TrendingUp, RefreshCw, AlertCircle, BarChart2, DollarSign, Target, Briefcase, Filter, Calendar as CalendarIcon, User, Layers, FileText, Users, Clock, Star, Trophy, ArrowRight, LineChart, Building2, CheckCircle, Activity, Flame, PieChart as PieChartIcon } from 'lucide-react';
import api from '../../../services/api';
import { UserResponse } from '../../../services/types';
import { exportActivitiesToExcel } from '../../../utils/exportActivityReport';
import { ActivityKpiPdfReport } from '../../../components/ActivityKpiPdfReport';
import { AccountsReportTab } from './AccountsReportTab';
import { ProjectsKpiReportTab } from './ProjectsKpiReportTab';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { useCurrency } from '../../../hooks/useCurrency';

const COLORS = ['#002D5A', '#0f766e', '#0369a1', '#b45309', '#be123c', '#4338ca', '#047857', '#a21caf'];

const QUOTATION_STATUS_LABELS: Record<string, string> = {
  'DRAFT': 'Borrador',
  'SENT': 'Enviada',
  'PENDING_SIGNATURE': 'Pend. Firma',
  'SIGNED': 'Firmada',
  'ACCEPTED': 'Aceptada',
  'REJECTED': 'Rechazada',
  'EXPIRED': 'Caducada'
};

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  'TASK': 'Tarea',
  'CALL': 'Llamada (Sist.)',
  'EMAIL': 'Email',
  'LLAMADA': 'Llamada',
  'REUNION_COMERCIAL': 'Reunión Comercial',
  'REUNION_SEGUIMIENTO': 'Reunión Seguim.',
  'COTIZACION': 'Envío Cotización',
  'SEGUIMIENTO': 'Seguimiento'
};

interface Props {
  users: UserResponse[];
}

type ReportTab = 'general' | 'deals' | 'quotations' | 'team' | 'accounts' | 'projects';

export default function CrmReportsView({ users }: Props) {
  const { formatCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState<ReportTab>('general');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtros
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userId, setUserId] = useState('');

  // Filtros adicionales de Negocios
  const [businessLineId, setBusinessLineId] = useState('');
  const [stage, setStage] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [quotationStatus, setQuotationStatus] = useState('');
  const [activityType, setActivityType] = useState('');
  const [businessLines, setBusinessLines] = useState<any[]>([]);

  useEffect(() => {
    api.get('/business-lines').then(res => {
      const data = res.data?.data || res.data;
      setBusinessLines(Array.isArray(data) ? data : []);
    }).catch(console.error);
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (userId) params.append('userId', userId);
      if (businessLineId) params.append('businessLineId', businessLineId);
      if (stage) params.append('stage', stage);
      if (minAmount) params.append('minAmount', minAmount);
      if (quotationStatus) params.append('quotationStatus', quotationStatus);
      if (activityType) params.append('activityType', activityType);

      const res = await api.get(`/crm-reports?${params.toString()}`);
      setData(res.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al obtener informes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, userId, businessLineId, stage, minAmount, quotationStatus, activityType]);

  

  const formatMonth = (monthStr: string) => {
    if (!monthStr || monthStr.length < 7) return monthStr;
    const [y, m] = monthStr.split('-');
    const d = new Date(parseInt(y), parseInt(m) - 1, 1);
    const formatted = new Intl.DateTimeFormat('es-ES', { month: 'short', year: '2-digit' }).format(d);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const CustomTooltip = ({ active, payload, label, formatter, labelFormatter }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-lg">
          <p className="font-bold text-slate-700 mb-2">{labelFormatter ? labelFormatter(label) : label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-500">{entry.name}:</span>
              <span className="font-semibold text-slate-800">
                {formatter ? formatter(entry.value, entry.name, entry, index) : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const [exportingTarget, setExportingTarget] = useState<'excel' | 'pdf' | null>(null);
  const pdfRef = React.useRef<HTMLDivElement>(null);
  const [pdfData, setPdfData] = useState<any>(null);

  const handleExportActivityReport = async (format: 'excel' | 'pdf') => {
    setExportingTarget(format);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (userId) params.append('userId', userId);
      if (activityType) params.append('activityType', activityType);
      
      const filtersInfo = [
        startDate ? `Desde: ${startDate}` : '',
        endDate ? `Hasta: ${endDate}` : '',
        userId ? `Usuario Filtrado` : '', 
        activityType ? `Tipo: ${ACTIVITY_TYPE_LABELS[activityType]}` : ''
      ].filter(Boolean).join(' | ') || 'Todos los registros';

      const res = await api.get(`/activities/export-report?${params.toString()}`);
      
      if (format === 'excel') {
        await exportActivitiesToExcel(res.data, filtersInfo);
      } else if (format === 'pdf') {
        setPdfData({ data: res.data, filtersInfo });
        setTimeout(() => {
          if (pdfRef.current) {
            html2pdf().from(pdfRef.current).set({
              margin: 10,
              filename: `Informe_Actividades_${new Date().getTime()}.pdf`,
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2 },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            }).save().then(() => setPdfData(null));
          }
        }, 500);
      }
    } catch (err) {
      console.error(err);
      alert('Error al exportar el reporte');
    } finally {
      if (format === 'excel') setExportingTarget(null);
      if (format === 'pdf') {
        setTimeout(() => setExportingTarget(null), 1500);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 p-2 min-h-[600px] font-sans relative">
      <ActivityKpiPdfReport ref={pdfRef} data={pdfData?.data} filtersInfo={pdfData?.filtersInfo || ''} />
      
      {/* Navegación Interna */}
      <div className="flex border-b border-slate-200 gap-6 px-2">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 font-semibold flex items-center gap-2 transition-colors relative ${activeTab === 'general' ? 'text-[#002D5A]' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <BarChart2 size={18} /> Visión General
          {activeTab === 'general' && <motion.div layoutId="reports-tab" className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-[#002D5A] rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('deals')}
          className={`pb-3 font-semibold flex items-center gap-2 transition-colors relative ${activeTab === 'deals' ? 'text-[#002D5A]' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Briefcase size={18} /> Negocios
          {activeTab === 'deals' && <motion.div layoutId="reports-tab" className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-[#002D5A] rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('quotations')}
          className={`pb-3 font-semibold flex items-center gap-2 transition-colors relative ${activeTab === 'quotations' ? 'text-[#002D5A]' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <FileText size={18} /> Cotizaciones
          {activeTab === 'quotations' && <motion.div layoutId="reports-tab" className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-[#002D5A] rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`pb-3 font-semibold flex items-center gap-2 transition-colors relative ${activeTab === 'team' ? 'text-[#002D5A]' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Users size={18} /> Equipo & Actividad
          {activeTab === 'team' && <motion.div layoutId="reports-tab" className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-[#002D5A] rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('accounts')}
          className={`pb-3 font-semibold flex items-center gap-2 transition-colors relative ${activeTab === 'accounts' ? 'text-[#002D5A]' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Building2 size={18} /> Empresas y Sectores
          {activeTab === 'accounts' && <motion.div layoutId="reports-tab" className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-[#002D5A] rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3 font-semibold flex items-center gap-2 transition-colors relative ${activeTab === 'projects' ? 'text-[#002D5A]' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Activity size={18} /> KPIs Proyectos
          {activeTab === 'projects' && <motion.div layoutId="reports-tab" className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-[#002D5A] rounded-t-full" />}
        </button>
      </div>

      {/* Barra de Filtros Elegante (Oculta en pestaña Empresas/Proyectos porque tiene los suyos propios) */}
      {activeTab !== 'accounts' && activeTab !== 'projects' && (
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="flex items-center gap-2 text-slate-700 font-bold">
          <Filter size={18} className="text-[#002D5A]" />
          <span>Filtros Globales</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#002D5A] transition-all">
            <User size={16} className="text-slate-400 mr-2" />
            <select 
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="bg-transparent text-sm text-slate-700 outline-none w-full md:w-40 cursor-pointer"
            >
              <option value="">Todos los empleados</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{(u as any).display_name || u.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#002D5A] transition-all">
            <CalendarIcon size={16} className="text-slate-400 mr-2" />
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-sm text-slate-700 outline-none cursor-pointer"
                title="Fecha Inicio"
              />
              <span className="text-slate-400 text-xs font-medium">al</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-sm text-slate-700 outline-none cursor-pointer"
                title="Fecha Fin"
              />
            </div>
          </div>

          {(startDate || endDate || userId) && (
            <button 
              onClick={() => { setStartDate(''); setEndDate(''); setUserId(''); }}
              className="text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>
      )}

      {activeTab === 'accounts' && <AccountsReportTab />}
      {activeTab === 'projects' && <ProjectsKpiReportTab />}

      {loading && !data && activeTab !== 'accounts' && activeTab !== 'projects' && (
        <div className="flex flex-col items-center justify-center p-16 h-full flex-1">
          <RefreshCw size={32} className="animate-spin text-[#001c3a] mb-4" />
          <p className="text-slate-500 font-medium">Cargando métricas...</p>
        </div>
      )}

      {error && !data && activeTab !== 'accounts' && activeTab !== 'projects' && (
        <div className="flex flex-col items-center justify-center p-16 h-full flex-1 text-red-500 bg-red-50 rounded-2xl border border-red-200">
          <AlertCircle size={32} className="mb-4" />
          <p className="font-semibold text-center">{error}</p>
          <button onClick={fetchReports} className="mt-4 px-5 py-2 bg-white border border-red-200 text-red-700 rounded-lg font-bold shadow-sm hover:bg-red-100 transition-colors">Reintentar</button>
        </div>
      )}

      {data && activeTab !== 'accounts' && activeTab !== 'projects' && (
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl min-h-[300px]">
              <div className="bg-white p-3 rounded-full shadow-lg border border-slate-200">
                <RefreshCw size={24} className="animate-spin text-[#001c3a]" />
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ===================== TAB 1: GENERAL ===================== */}
            {activeTab === 'general' && (
              <motion.div key="general" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <span className="font-bold text-sm text-slate-500 uppercase tracking-wider">Pipeline Activo</span>
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Briefcase size={20} /></div>
                    </div>
                    <span className="text-3xl font-black text-slate-800 tracking-tight relative z-10">{formatCurrency(data.kpis.pipelineAmount)}</span>
                    <span className="text-xs font-semibold text-slate-400 mt-2 relative z-10">{data.kpis.pipelineCount} negocios en curso</span>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <span className="font-bold text-sm text-slate-500 uppercase tracking-wider">Prev. Ingresos</span>
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign size={20} /></div>
                    </div>
                    <span className="text-3xl font-black text-slate-800 tracking-tight relative z-10">{formatCurrency(data.kpis.expectedRevenue)}</span>
                    <span className="text-xs font-semibold text-slate-400 mt-2 relative z-10">Ponderado por probabilidad</span>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <span className="font-bold text-sm text-slate-500 uppercase tracking-wider">Total Ganados</span>
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Target size={20} /></div>
                    </div>
                    <span className="text-3xl font-black text-slate-800 tracking-tight relative z-10">{formatCurrency(data.kpis.wonAmount)}</span>
                    <span className="text-xs font-semibold text-slate-400 mt-2 relative z-10">{data.kpis.wonCount} negocios cerrados</span>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <span className="font-bold text-sm text-slate-500 uppercase tracking-wider">Win Rate</span>
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><TrendingUp size={20} /></div>
                    </div>
                    <span className="text-3xl font-black text-slate-800 tracking-tight relative z-10">{data.kpis.winRate.toFixed(1)}%</span>
                    <span className="text-xs font-semibold text-slate-400 mt-2 relative z-10">De negocios terminados</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex flex-col mb-6">
                      <h3 className="text-lg font-bold text-[#002D5A] flex items-center gap-2"><BarChart2 size={20} /> Embudo de Ventas</h3>
                      <p className="text-xs text-slate-500 font-medium">Volumen económico atascado por etapa</p>
                    </div>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.funnel} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                          <XAxis type="number" tickFormatter={(val) => `€${val/1000}k`} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis dataKey="stage" type="category" width={100} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                          <RechartsTooltip content={<CustomTooltip formatter={(val: number) => formatCurrency(val)} />} cursor={{ fill: '#f8fafc' }} />
                          <Bar dataKey="amount" fill="#002D5A" radius={[0, 6, 6, 0]} barSize={32} name="Monto" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex flex-col mb-6">
                      <h3 className="text-lg font-bold text-[#002D5A] flex items-center gap-2"><TrendingUp size={20} /> Previsión de Cierres (Forecast)</h3>
                      <p className="text-xs text-slate-500 font-medium">Ingresos proyectados por mes de cierre</p>
                    </div>
                    <div className="h-72 w-full">
                      {data.forecast.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 font-medium">No hay previsión en este periodo</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={data.forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0369a1" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#0369a1" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="month" tickFormatter={formatMonth} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis tickFormatter={(val) => `€${val/1000}k`} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <RechartsTooltip content={<CustomTooltip formatter={(val: number) => formatCurrency(val)} labelFormatter={formatMonth} />} />
                            <Area type="monotone" dataKey="amount" stroke="#0369a1" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" name="Previsión" />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Deals & Recent Won */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Star size={20} className="text-amber-500" />
                        <h3 className="text-lg font-bold text-[#002D5A]">Top Oportunidades</h3>
                      </div>
                      <span className="text-xs font-semibold bg-amber-50 text-amber-600 px-2 py-1 rounded-md">Por Valor</span>
                    </div>
                    {data.topDeals?.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-slate-400 font-medium py-8">No hay oportunidades abiertas</div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {data.topDeals?.map((deal: any) => (
                          <div key={deal.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-blue-200 transition-colors group cursor-default">
                            <div className="flex flex-col truncate pr-4">
                              <span className="font-bold text-slate-700 truncate">{deal.name}</span>
                              <span className="text-xs text-slate-500 truncate">{deal.account?.name || 'Sin Cliente'}</span>
                            </div>
                            <div className="flex flex-col items-end min-w-[100px]">
                              <span className="font-bold text-[#002D5A]">{formatCurrency(deal.amount || 0)}</span>
                              <span className="text-xs text-emerald-600 font-semibold">{deal.probability || 0}% prob.</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Trophy size={20} className="text-indigo-500" />
                        <h3 className="text-lg font-bold text-[#002D5A]">Últimos Cierres</h3>
                      </div>
                      <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">Ganados</span>
                    </div>
                    {data.recentWonDeals?.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-slate-400 font-medium py-8">No hay negocios ganados recientemente</div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {data.recentWonDeals?.map((deal: any) => (
                          <div key={deal.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-indigo-200 transition-colors group cursor-default">
                            <div className="flex flex-col truncate pr-4">
                              <span className="font-bold text-slate-700 truncate">{deal.name}</span>
                              <span className="text-xs text-slate-500 truncate">{deal.account?.name || 'Sin Cliente'}</span>
                            </div>
                            <div className="flex flex-col items-end min-w-[100px]">
                              <span className="font-bold text-[#002D5A]">{formatCurrency(deal.amount || 0)}</span>
                              <span className="text-xs text-slate-400 font-medium">{new Date(deal.closeDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ===================== TAB 2: DEALS ===================== */}
            {activeTab === 'deals' && (
              <motion.div key="deals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6">
                
                {/* Secondary Filters for Deals */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center gap-4">
                  <span className="text-xs font-bold text-slate-500 uppercase">Filtros de Negocio:</span>
                  
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1">
                    <Building2 size={14} className="text-slate-400 mr-2" />
                    <select value={businessLineId} onChange={(e) => setBusinessLineId(e.target.value)} className="bg-transparent text-sm text-slate-700 outline-none w-32 cursor-pointer">
                      <option value="">Línea de Negocio</option>
                      {(businessLines || []).map(bl => <option key={bl.id} value={bl.id}>{bl.name}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1">
                    <Layers size={14} className="text-slate-400 mr-2" />
                    <select value={stage} onChange={(e) => setStage(e.target.value)} className="bg-transparent text-sm text-slate-700 outline-none w-32 cursor-pointer">
                      <option value="">Cualquier Etapa</option>
                      <option value="LEAD">Lead</option>
                      <option value="QUALIFIED">Cualificado</option>
                      <option value="PROPOSAL">Propuesta</option>
                      <option value="NEGOTIATION">Negociación</option>
                    </select>
                  </div>

                  <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1">
                    <DollarSign size={14} className="text-slate-400 mr-2" />
                    <input type="number" placeholder="Importe min." value={minAmount} onChange={(e) => setMinAmount(e.target.value)} className="bg-transparent text-sm text-slate-700 outline-none w-28" />
                  </div>

                  {(businessLineId || stage || minAmount) && (
                    <button onClick={() => { setBusinessLineId(''); setStage(''); setMinAmount(''); }} className="text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors">Limpiar</button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <DollarSign size={32} className="text-emerald-500 mb-2 relative z-10" />
                    <span className="text-3xl font-black text-slate-800 relative z-10">{formatCurrency(data.kpis.avgTicket)}</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1 relative z-10">Ticket Medio (Ganados)</span>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <Clock size={32} className="text-indigo-500 mb-2 relative z-10" />
                    <span className="text-3xl font-black text-slate-800 relative z-10">{data.kpis.avgCloseDays.toFixed(1)} días</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1 relative z-10">Tiempo Medio de Cierre</span>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                    <Target size={32} className="text-blue-500 mb-2 relative z-10" />
                    <span className="text-2xl font-black text-slate-800 truncate max-w-full relative z-10 px-2" title={data.topAccounts?.length > 0 ? data.topAccounts[0].name : '-'}>
                      {data.topAccounts?.length > 0 ? data.topAccounts[0].name : '-'}
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1 relative z-10">Cliente Estrella</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex flex-col mb-6">
                      <h3 className="text-lg font-bold text-[#002D5A] flex items-center gap-2"><BarChart2 size={20} /> Ganados vs Perdidos</h3>
                      <p className="text-xs text-slate-500 font-medium">Evolución del volumen cerrado por mes</p>
                    </div>
                    <div className="h-72 w-full">
                      {data.wonVsLostMonthly?.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 font-medium">Sin datos de cierre en este periodo</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data.wonVsLostMonthly} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="month" tickFormatter={formatMonth} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis tickFormatter={(val) => `€${val/1000}k`} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <RechartsTooltip content={<CustomTooltip formatter={(val: number) => formatCurrency(val)} labelFormatter={formatMonth} />} cursor={{ fill: '#f8fafc' }} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                            <Bar dataKey="won" stackId="a" fill="#10b981" name="Ganado" barSize={32} />
                            <Bar dataKey="lost" stackId="a" fill="#f43f5e" name="Perdido" barSize={32} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex flex-col mb-6">
                      <h3 className="text-lg font-bold text-[#002D5A] flex items-center gap-2"><LineChart size={20} /> Evolución del Ticket Medio</h3>
                      <p className="text-xs text-slate-500 font-medium">Tamaño promedio de negocios ganados (Mensual)</p>
                    </div>
                    <div className="h-72 w-full">
                      {data.avgTicketEvolution?.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 font-medium">Sin datos para calcular el ticket</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={data.avgTicketEvolution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorAvgTicket" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="month" tickFormatter={formatMonth} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis tickFormatter={(val) => `€${val/1000}k`} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <RechartsTooltip content={<CustomTooltip formatter={(val: number) => formatCurrency(val)} labelFormatter={formatMonth} />} />
                            <Area type="monotone" dataKey="avgTicket" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorAvgTicket)" name="Ticket Medio" connectNulls={true} />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex flex-col mb-6">
                      <h3 className="text-lg font-bold text-[#002D5A] flex items-center gap-2"><Trophy size={20} /> Top 5 Clientes (Facturación)</h3>
                      <p className="text-xs text-slate-500 font-medium">Las cuentas que más volumen cerrado aportan</p>
                    </div>
                    <div className="h-72 w-full">
                      {data.topAccounts?.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 font-medium">Sin negocios cerrados</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data.topAccounts} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                            <XAxis type="number" tickFormatter={(val) => `€${val/1000}k`} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis dataKey="name" type="category" width={100} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                            <RechartsTooltip content={<CustomTooltip formatter={(val: number) => formatCurrency(val)} />} cursor={{ fill: '#f8fafc' }} />
                            <Bar dataKey="amount" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={24} name="Total Ganado" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex flex-col mb-6">
                      <h3 className="text-lg font-bold text-[#002D5A] flex items-center gap-2"><Layers size={20} /> Pipeline por Línea de Negocio</h3>
                      <p className="text-xs text-slate-500 font-medium">Distribución económica en los diferentes sectores</p>
                    </div>
                    <div className="h-72 w-full flex items-center justify-center">
                      {data.dealsByBusinessLine?.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 font-medium">Sin datos de líneas de negocio</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data.dealsByBusinessLine}
                              cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4}
                              dataKey="amount" nameKey="name"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={false} stroke="none"
                            >
                              {data.dealsByBusinessLine?.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip content={<CustomTooltip formatter={(val: number) => formatCurrency(val)} />} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ===================== TAB 3: QUOTATIONS ===================== */}
            {activeTab === 'quotations' && (
              <motion.div key="quotations" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6">
                
                {/* Cotizaciones Filters */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center gap-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">Filtros Locales</span>
                  
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1">
                    <Layers size={14} className="text-slate-400 mr-2" />
                    <select value={businessLineId} onChange={(e) => setBusinessLineId(e.target.value)} className="bg-transparent text-sm text-slate-700 outline-none w-32 cursor-pointer">
                      <option value="">Línea de Negocio</option>
                      {(businessLines || []).map(bl => <option key={bl.id} value={bl.id}>{bl.name}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1">
                    <Filter size={14} className="text-slate-400 mr-2" />
                    <select value={quotationStatus} onChange={(e) => setQuotationStatus(e.target.value)} className="bg-transparent text-sm text-slate-700 outline-none w-32 cursor-pointer">
                      <option value="">Cualquier Estado</option>
                      {Object.entries(QUOTATION_STATUS_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {(businessLineId || quotationStatus) && (
                    <button onClick={() => { setBusinessLineId(''); setQuotationStatus(''); }} className="text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors">Limpiar</button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                    <FileText size={32} className="text-blue-500 mb-2" />
                    <span className="text-3xl font-black text-slate-800">{data.kpis.totalQuotationsCount}</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Emitidas</span>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                    <TrendingUp size={32} className="text-rose-500 mb-2" />
                    <span className="text-3xl font-black text-slate-800">{data.kpis.avgDiscount.toFixed(2)}%</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Dto. Medio</span>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-50 rounded-full opacity-50"></div>
                    <Target size={32} className="text-emerald-500 mb-2 relative z-10" />
                    <span className="text-3xl font-black text-slate-800 relative z-10">{(data.kpis.quotationAcceptanceRate || 0).toFixed(1)}%</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1 relative z-10">Tasa de Aceptación</span>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-50 rounded-full opacity-50"></div>
                    <Clock size={32} className="text-amber-500 mb-2 relative z-10" />
                    <span className="text-3xl font-black text-slate-800 relative z-10">{(data.kpis.quotationAvgSignDays || 0).toFixed(1)} d</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1 relative z-10">Tiempo de Firma</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex flex-col mb-6">
                      <h3 className="text-lg font-bold text-[#002D5A] flex items-center gap-2"><BarChart2 size={20} /> Evolución de Emisión</h3>
                      <p className="text-xs text-slate-500 font-medium">Volumen de cotizaciones por mes</p>
                    </div>
                    <div className="h-72 w-full">
                      {data.quotationsMonthly?.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 font-medium">Sin emisiones en este periodo</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data.quotationsMonthly} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="month" tickFormatter={formatMonth} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                            <RechartsTooltip content={<CustomTooltip labelFormatter={formatMonth} />} cursor={{ fill: '#f8fafc' }} />
                            <Bar dataKey="count" fill="#3b82f6" name="Emitidas" radius={[4, 4, 0, 0]} barSize={40} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex flex-col mb-6">
                      <h3 className="text-lg font-bold text-[#002D5A] flex items-center gap-2"><Layers size={20} /> Líneas de Negocio</h3>
                      <p className="text-xs text-slate-500 font-medium">Concentración de propuestas emitidas</p>
                    </div>
                    <div className="h-72 w-full flex items-center justify-center">
                      {data.quotationsByBusinessLine?.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 font-medium">Sin datos de líneas de negocio</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data.quotationsByBusinessLine}
                              cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4}
                              dataKey="count" nameKey="name"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={false} stroke="none"
                            >
                              {data.quotationsByBusinessLine?.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex flex-col mb-6">
                      <h3 className="text-lg font-bold text-[#002D5A] flex items-center gap-2"><PieChartIcon size={20} /> Estado de Cotizaciones</h3>
                      <p className="text-xs text-slate-500 font-medium">Distribución de propuestas generadas</p>
                    </div>
                    <div className="h-80 w-full flex items-center justify-center">
                      {data.quotationsDistribution?.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 font-medium">Sin cotizaciones en este periodo</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data.quotationsDistribution}
                              cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={4}
                              dataKey="count" nameKey="status"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={false} stroke="none"
                            >
                              {data.quotationsDistribution.map((entry: any, index: number) => {
                                const translatedName = QUOTATION_STATUS_LABELS[entry.status] || entry.status;
                                return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} name={translatedName} />;
                              })}
                            </Pie>
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }} formatter={(value, entry: any) => entry.payload?.name || value} />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ===================== TAB 4: TEAM ===================== */}
            {activeTab === 'team' && (
              <motion.div key="team" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6">
                
                {/* Team Filters */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center gap-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">Filtros Locales</span>
                  
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1">
                    <CheckCircle size={14} className="text-slate-400 mr-2" />
                    <select value={activityType} onChange={(e) => setActivityType(e.target.value)} className="bg-transparent text-sm text-slate-700 outline-none w-32 cursor-pointer">
                      <option value="">Tipo de Actividad</option>
                      {Object.entries(ACTIVITY_TYPE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {activityType && (
                    <button onClick={() => setActivityType('')} className="text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors">Limpiar</button>
                  )}

                  <div className="flex-1" />
                  
                  <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                    <button 
                      onClick={() => handleExportActivityReport('excel')}
                      disabled={exportingTarget !== null}
                      className="flex items-center gap-2 bg-[#001c3a] hover:bg-[#002855] text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                    >
                      {exportingTarget === 'excel' ? <RefreshCw size={14} className="animate-spin" /> : <FileText size={14} />}
                      Exportar Excel
                    </button>
                    <button 
                      onClick={() => handleExportActivityReport('pdf')}
                      disabled={exportingTarget !== null}
                      className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                    >
                      {exportingTarget === 'pdf' ? <RefreshCw size={14} className="animate-spin" /> : <FileText size={14} />}
                      Exportar PDF
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                    <Activity size={32} className="text-slate-500 mb-2" />
                    <span className="text-3xl font-black text-slate-800">{data.kpis.totalActivitiesCount}</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Actividades</span>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-50 rounded-full opacity-50"></div>
                    <Briefcase size={32} className="text-emerald-500 mb-2 relative z-10" />
                    <span className="text-3xl font-black text-slate-800 relative z-10">{data.kpis.totalTeamDealsWon}</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1 relative z-10">Negocios Ganados</span>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full opacity-50"></div>
                    <Target size={32} className="text-blue-500 mb-2 relative z-10" />
                    <span className="text-3xl font-black text-slate-800 relative z-10">{(data.kpis.globalTeamWinRate || 0).toFixed(1)}%</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1 relative z-10">Eficiencia (Win Rate)</span>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-50 rounded-full opacity-50"></div>
                    <Flame size={32} className="text-amber-500 mb-2 relative z-10" />
                    <span className="text-3xl font-black text-slate-800 relative z-10">{(data.kpis.avgEffortPerDeal || 0).toFixed(1)}</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1 relative z-10">Actividades / Cierre</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex flex-col mb-6">
                      <h3 className="text-lg font-bold text-[#002D5A] flex items-center gap-2"><User size={20} /> Rendimiento Comercial</h3>
                      <p className="text-xs text-slate-500 font-medium">Actividades completadas vs Negocios Ganados</p>
                    </div>
                    <div className="h-72 w-full">
                      {data.userPerformance?.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 font-medium">Sin actividad en este periodo</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data.userPerformance} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="userName" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis yAxisId="left" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                            <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                            <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                            <Bar yAxisId="left" dataKey="activitiesCompleted" fill="#94a3b8" name="Actividades" radius={[4, 4, 0, 0]} barSize={24} />
                            <Bar yAxisId="right" dataKey="dealsWon" fill="#10b981" name="Negocios Ganados" radius={[4, 4, 0, 0]} barSize={24} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex flex-col mb-6">
                      <h3 className="text-lg font-bold text-[#002D5A] flex items-center gap-2"><PieChartIcon size={20} /> Distribución de Actividad</h3>
                      <p className="text-xs text-slate-500 font-medium">Esfuerzo invertido por tipo de tarea</p>
                    </div>
                    <div className="h-72 w-full flex items-center justify-center">
                      {data.activitiesDistribution?.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 font-medium">Sin datos de actividad</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data.activitiesDistribution}
                              cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={4}
                              dataKey="count" nameKey="type"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={false} stroke="none"
                            >
                              {data.activitiesDistribution.map((entry: any, index: number) => {
                                const translatedName = ACTIVITY_TYPE_LABELS[entry.type] || entry.type;
                                return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} name={translatedName} />;
                              })}
                            </Pie>
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} formatter={(value, entry: any) => entry.payload?.name || value} />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex flex-col mb-6">
                      <h3 className="text-lg font-bold text-[#002D5A] flex items-center gap-2"><BarChart2 size={20} /> Evolución del Esfuerzo</h3>
                      <p className="text-xs text-slate-500 font-medium">Volumen de actividades completadas por mes</p>
                    </div>
                    <div className="h-72 w-full">
                      {data.activitiesMonthly?.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 font-medium">Sin actividades en este periodo</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data.activitiesMonthly} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="month" tickFormatter={formatMonth} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                            <RechartsTooltip content={<CustomTooltip labelFormatter={formatMonth} />} cursor={{ fill: '#f8fafc' }} />
                            <Bar dataKey="count" fill="#8b5cf6" name="Actividades" radius={[4, 4, 0, 0]} barSize={40} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex flex-col mb-6">
                      <h3 className="text-lg font-bold text-[#002D5A] flex items-center gap-2"><Target size={20} /> Eficacia de Actividades</h3>
                      <p className="text-xs text-slate-500 font-medium">Resultados obtenidos en las interacciones</p>
                    </div>
                    <div className="h-72 w-full flex items-center justify-center">
                      {data.activityResultsDistribution?.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 font-medium">Sin resultados registrados</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data.activityResultsDistribution}
                              cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={4}
                              dataKey="count" nameKey="result"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={false} stroke="none"
                            >
                              {data.activityResultsDistribution?.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
