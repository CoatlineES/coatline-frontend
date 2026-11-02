import React from 'react';

export const ActivityKpiPdfReport = React.forwardRef<HTMLDivElement, { data: any, filtersInfo: string }>(({ data, filtersInfo }, ref) => {
  if (!data || !data.metrics) return null;
  const { metrics } = data;

  return (
    <div ref={ref} className="p-8 w-[210mm] min-h-[297mm] font-sans" style={{ position: 'absolute', top: '-9999px', left: '-9999px', backgroundColor: '#ffffff', color: '#1e293b' }}>
      
      {/* HEADER */}
      <div className="border-b-2 pb-4 mb-6 flex justify-between items-end" style={{ borderColor: '#002D5A' }}>
        <div>
          <h1 className="text-3xl font-black" style={{ color: '#002D5A' }}>INFORME DE ACTIVIDADES</h1>
          <p className="text-sm font-semibold mt-1" style={{ color: '#64748b' }}>Coastline CRM</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Filtros Aplicados</p>
          <p className="text-sm font-semibold" style={{ color: '#334155' }}>{filtersInfo || 'Todos los registros'}</p>
          <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Generado: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* SECCIÓN 1: KPIs GLOBALES */}
      <div className="mb-8">
        <h2 className="text-lg font-bold border-b pb-2 mb-4 uppercase tracking-wider text-sm" style={{ color: '#1e293b', borderColor: '#e2e8f0' }}>Métricas Generales</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
            <p className="text-xs font-bold uppercase mb-1" style={{ color: '#64748b' }}>Total Actividades</p>
            <p className="text-2xl font-black" style={{ color: '#002D5A' }}>{metrics.totalActivities}</p>
          </div>
          <div className="p-4 rounded-xl border" style={{ backgroundColor: '#ecfdf5', borderColor: '#d1fae5' }}>
            <p className="text-xs font-bold uppercase mb-1" style={{ color: '#059669' }}>Tasa de Finalización</p>
            <p className="text-2xl font-black" style={{ color: '#047857' }}>{metrics.completionRate.toFixed(1)}%</p>
            <p className="text-xs" style={{ color: '#059669' }}>{metrics.completedActivities} completadas</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN 1.5: DISTRIBUCIÓN POR ESTADO Y RESULTADO */}
      <div className="mb-8 flex gap-6">
        <div className="flex-1">
          <h2 className="text-lg font-bold border-b pb-2 mb-4 uppercase tracking-wider text-sm" style={{ color: '#1e293b', borderColor: '#e2e8f0' }}>Por Estado (Panel)</h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'planned', label: 'Planificadas' },
              { key: 'noDate', label: 'Sin fecha' },
              { key: 'overdue', label: 'Vencidas' },
              { key: 'inProgress', label: 'En curso' },
              { key: 'completed', label: 'Completadas' }
            ].map(status => (
              <div key={status.key} className="p-2 rounded-lg border text-center" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                <p className="text-[10px] font-bold uppercase mb-0.5 truncate" style={{ color: '#64748b' }}>{status.label}</p>
                <p className="text-lg font-black" style={{ color: '#002D5A' }}>{metrics.dashboardDistribution?.[status.key] || 0}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex-1">
          <h2 className="text-lg font-bold border-b pb-2 mb-4 uppercase tracking-wider text-sm" style={{ color: '#1e293b', borderColor: '#e2e8f0' }}>Por Resultado</h2>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(metrics.resultDistribution || {}).map(([result, count]: any) => {
              const labels: any = { 
                NO_ANSWER: 'No contesta', 
                CALL_BACK: 'Llamar otro día', 
                INTERESTED: 'Interesado', 
                SUCCESSFUL: 'Reunión agendada', 
                UNSUCCESSFUL: 'No interesado', 
                NO_TARGET: 'No target',
                NO_RESULT: 'Sin resultado' 
              };
              const label = labels[result] || result;
              return (
                <div key={result} className="p-2 rounded-lg border text-center" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                  <p className="text-[10px] font-bold uppercase mb-0.5 truncate" style={{ color: '#64748b' }}>{label}</p>
                  <p className="text-lg font-black" style={{ color: '#002D5A' }}>{count}</p>
                </div>
              );
            })}
            {(!metrics.resultDistribution || Object.keys(metrics.resultDistribution).length === 0) && (
              <p className="text-sm" style={{ color: '#64748b' }}>No hay datos.</p>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: RENDIMIENTO POR USUARIO */}
      <div>
        <h2 className="text-lg font-bold border-b pb-2 mb-4 uppercase tracking-wider text-sm" style={{ color: '#1e293b', borderColor: '#e2e8f0' }}>Rendimiento por Empleado</h2>
        
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr style={{ backgroundColor: '#002D5A', color: '#ffffff' }}>
              <th className="p-2 rounded-tl-lg font-bold w-[100px]">Empleado</th>
              <th className="p-2 font-bold text-center text-[11px]">Plan.</th>
              <th className="p-2 font-bold text-center text-[11px]">Venc.</th>
              <th className="p-2 font-bold text-center text-[11px]">En curso</th>
              <th className="p-2 font-bold text-center text-[11px]">Compl.</th>
              <th className="p-2 font-bold text-center text-[11px]">Total</th>
              <th className="p-2 font-bold text-center text-[11px]">Negocios</th>
              <th className="p-2 rounded-tr-lg font-bold text-center text-[11px]">Proyectos</th>
            </tr>
          </thead>
          <tbody>
            {metrics.userPerformance.map((user: any, idx: number) => {
              return (
                <tr key={idx} className="border-b last:border-none" style={{ borderColor: '#f1f5f9' }}>
                  <td className="p-2 font-semibold truncate max-w-[100px] text-[11px]" style={{ color: '#334155' }}>{user.name}</td>
                  <td className="p-2 text-center text-[11px]" style={{ color: '#475569' }}>{(user.filters?.planned || 0) + (user.filters?.noDate || 0)}</td>
                  <td className="p-2 text-center font-bold text-[11px]" style={{ color: '#dc2626' }}>{user.filters?.overdue || 0}</td>
                  <td className="p-2 text-center font-bold text-[11px]" style={{ color: '#d97706' }}>{user.filters?.inProgress || 0}</td>
                  <td className="p-2 text-center font-bold text-[11px]" style={{ color: '#059669' }}>{user.filters?.completed || 0}</td>
                  <td className="p-2 text-center font-black text-[11px]" style={{ color: '#002D5A' }}>{user.assigned || 0}</td>
                  <td className="p-2 text-center font-bold text-[11px]" style={{ color: '#334155' }}>{user.dealsGenerated || 0}</td>
                  <td className="p-2 text-center font-bold text-[11px]" style={{ color: '#334155' }}>{user.projectsGenerated || 0}</td>
                </tr>
              );
            })}
          </tbody>
          {metrics.userPerformance.length === 0 && (
            <tbody>
              <tr>
                <td colSpan={8} className="p-6 text-center font-medium" style={{ color: '#94a3b8' }}>No hay datos de usuarios en este periodo</td>
              </tr>
            </tbody>
          )}
        </table>
      </div>

    </div>
  );
});
