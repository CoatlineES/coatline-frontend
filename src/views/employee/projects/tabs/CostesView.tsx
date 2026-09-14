import React, { useState } from 'react';
import { ProjectPlan, ProjectTask } from '../../../../services/project-planning.service';
import { ChevronRight, ChevronDown, DollarSign, Folder, FileText, AlertCircle } from 'lucide-react';
import { useCurrency } from '../../../../hooks/useCurrency';

interface CostesViewProps {
  plan: ProjectPlan | null;
}

export function CostesView({ plan }: CostesViewProps) {
  const { formatCurrency } = useCurrency();
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  if (!plan || !plan.tasks || plan.tasks.length === 0) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center max-w-md shadow-sm">
          <AlertCircle className="mx-auto text-slate-400 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-800 mb-2">No hay datos de costes</h3>
          <p className="text-slate-500 text-sm">
            El plan actual no tiene tareas con costes asignados. Importa una cotización o agrega recursos a las tareas del Gantt.
          </p>
        </div>
      </div>
    );
  }

  // Helper to calculate total cost of a task recursively
  const calculateTaskCost = (task: ProjectTask): number => {
    let cost = 0;
    
    // Costo directo de sus componentes
    if (task.components && task.components.length > 0) {
      const unitBaseCost = task.components.reduce((sum, c) => sum + (c.quantity * c.unitCost), 0);
      cost += unitBaseCost * (task.quantity || 1);
    }
    
    // Suma de los hijos
    if (task.children && task.children.length > 0) {
      cost += task.children.reduce((sum, child) => sum + calculateTaskCost(child), 0);
    }
    
    return cost;
  };

  const totalProjectCost = plan.tasks.reduce((sum, task) => sum + calculateTaskCost(task), 0);

  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  ;

  const renderTaskRow = (task: ProjectTask, level: number = 0) => {
    const hasChildren = task.children && task.children.length > 0;
    const isExpanded = expandedTasks.has(task.id);
    const cost = calculateTaskCost(task);
    
    return (
      <React.Fragment key={task.id}>
        <tr className={`border-b border-slate-100 hover:bg-slate-50 ${level === 0 ? 'bg-slate-50/50' : ''}`}>
          <td className="py-3 px-4 flex items-center gap-2">
            <div style={{ marginLeft: `${level * 1.5}rem` }} className="flex items-center gap-2">
              {hasChildren ? (
                <button onClick={() => toggleExpand(task.id)} className="text-slate-400 hover:text-slate-700">
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              ) : (
                <div className="w-4" /> // placeholder for alignment
              )}
              {hasChildren ? <Folder size={16} className="text-[#002D5A]" /> : <FileText size={16} className="text-slate-400" />}
              <span className={`text-sm ${level === 0 ? 'font-bold text-slate-800' : 'text-slate-700'}`}>
                {task.name}
              </span>
            </div>
          </td>
          <td className="py-3 px-4 text-sm text-slate-600 text-center">
            {task.quantity || 1} {task.unit || 'ud'}
          </td>
          <td className="py-3 px-4 text-sm font-medium text-right text-slate-800">
            {formatCurrency(cost)}
          </td>
        </tr>
        {isExpanded && hasChildren && (
          <>
            {task.children!.map(child => renderTaskRow(child, level + 1))}
          </>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER SECTION */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-[#002D5A]">Resumen de Costes</h2>
            <p className="text-slate-500 mt-1">Estructura de costos basada en la planificación del proyecto.</p>
          </div>
          <div className="bg-white rounded-lg border border-emerald-200 px-6 py-3 flex items-center gap-4 shadow-sm">
            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg">
              <DollarSign size={24} />
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Costo Total del Proyecto</div>
              <div className="text-2xl font-bold text-slate-800">{formatCurrency(totalProjectCost)}</div>
            </div>
          </div>
        </div>

        {/* COST TREE TABLE */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-medium w-3/5">Concepto / Tarea</th>
                  <th className="py-3 px-4 font-medium text-center w-1/5">Cantidad</th>
                  <th className="py-3 px-4 font-medium text-right w-1/5">Costo Total</th>
                </tr>
              </thead>
              <tbody>
                {plan.tasks.map(task => renderTaskRow(task, 0))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
