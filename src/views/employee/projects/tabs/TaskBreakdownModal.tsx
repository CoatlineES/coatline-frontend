import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Package, Check } from 'lucide-react';
import { projectPlanningService, ProjectTask, ProjectTaskComponent } from '../../../../services/project-planning.service';
import ApuPickerModal from '../../quotations/ApuPickerModal';
import { ResourceType } from '../../../../services/resources.service';
import { useCurrency } from '../../../../hooks/useCurrency';

interface TaskBreakdownModalProps {
  task: ProjectTask;
  onClose: () => void;
  onUpdate: () => void;
}

export function TaskBreakdownModal({ task, onClose, onUpdate }: TaskBreakdownModalProps) {
  const { formatCurrency } = useCurrency();
  const [components, setComponents] = useState<ProjectTaskComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [localMargin, setLocalMargin] = useState(task.margin || 0);
  const [localQuantity, setLocalQuantity] = useState(task.quantity || 1);
  const [localUnit, setLocalUnit] = useState(task.unit || 'ud');
  
  const [localName, setLocalName] = useState(task.name || '');
  const [localAlias, setLocalAlias] = useState(task.alias || '');
  const [localStartDate, setLocalStartDate] = useState(task.startDate ? task.startDate.split('T')[0] : '');
  const [localEndDate, setLocalEndDate] = useState(task.endDate ? task.endDate.split('T')[0] : '');
  const [localProgress, setLocalProgress] = useState(task.progress || 0);
  const [localDescription, setLocalDescription] = useState(task.description || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveTaskDetails = async () => {
    try {
      setIsSaving(true);
      await projectPlanningService.updateTask(task.id, {
        name: localName,
        alias: localAlias || null,
        quantity: localQuantity,
        unit: localUnit,
        margin: localMargin,
        startDate: localStartDate ? new Date(localStartDate).toISOString() : undefined,
        endDate: localEndDate ? new Date(localEndDate).toISOString() : undefined,
        progress: localProgress,
        description: localDescription
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error saving task details:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerFilter, setPickerFilter] = useState<ResourceType | null>(null);

  const [isAddingManual, setIsAddingManual] = useState(false);
  const [manualForm, setManualForm] = useState({
    concept: '',
    unit: 'ud',
    quantity: 1,
    unitCost: 0
  });

  useEffect(() => {
    loadComponents();
  }, [task.id]);

  const loadComponents = async () => {
    try {
      setLoading(true);
      const data = await projectPlanningService.getTaskComponents(task.id);
      setComponents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const unitBaseCost = components.reduce((sum, c) => sum + (c.quantity * c.unitCost), 0);
  const totalBaseCost = unitBaseCost * localQuantity;

  const resourceTypeLabels: Record<string, string> = {
    [ResourceType.MATERIAL]: 'Material',
    [ResourceType.MANO_OBRA]: 'Mano de obra',
    [ResourceType.MAQUINARIA]: 'Maquinaria',
    [ResourceType.CDC]: 'CDC',
    [ResourceType.SUBCONTRATA]: 'Subcontrata',
    [ResourceType.APU]: 'APU',
    [ResourceType.SUMINISTRO]: 'Suministro',
    'MANUAL': 'Otros'
  };

  const costsByType = components.reduce((acc, c) => {
    const type = c.resourceType || 'MANUAL';
    if (!acc[type]) acc[type] = 0;
    acc[type] += c.quantity * c.unitCost;
    return acc;
  }, {} as Record<string, number>);

  const handleRemoveComponent = async (id: string) => {
    if (!confirm('¿Quitar este componente?')) return;
    try {
      await projectPlanningService.deleteTaskComponent(id);
      await loadComponents();
      onUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateComponent = async (id: string, field: keyof ProjectTaskComponent, value: any) => {
    try {
      setComponents(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
      await projectPlanningService.updateTaskComponent(id, { [field]: value });
      onUpdate();
    } catch (error) {
      console.error(error);
      loadComponents(); // revert on error
    }
  };

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await projectPlanningService.addTaskComponent(task.id, {
        concept: manualForm.concept,
        unit: manualForm.unit,
        quantity: Number(manualForm.quantity),
        unitCost: Number(manualForm.unitCost),
        // No enviamos resourceType para que quede como undefined y Prisma no falle
      });
      setIsAddingManual(false);
      setManualForm({ concept: '', unit: 'ud', quantity: 1, unitCost: 0 });
      await loadComponents();
      onUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddFromLibrary = async (resource: any) => {
    try {
      await projectPlanningService.addTaskComponent(task.id, {
        concept: resource.name,
        unit: resource.unit,
        quantity: resource.defaultQuantity || 1,
        unitCost: resource.unitCost,
        resourceId: resource.id,
        resourceType: resource.resourceType
      });
      setIsPickerOpen(false);
      await loadComponents();
      onUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  

  return createPortal(
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* HEADER */}
        <div className="flex justify-between items-start p-5 border-b border-slate-100 bg-slate-50 relative">
          <div className="flex-1 pr-10 w-full">
            <div className="flex items-center gap-2 mb-4">
              <Package size={20} className="text-amber-500 flex-shrink-0" />
              <div className="w-full max-w-xl flex flex-col gap-1">
                  <input
                    type="text"
                    value={localName}
                    onChange={e => setLocalName(e.target.value)}
                    className="text-lg font-bold text-[#001c3a] bg-white border border-slate-200 rounded px-2 py-1 focus:border-primary outline-none w-full"
                    placeholder="Nombre de la Tarea"
                  />
                  <input
                    type="text"
                    value={localAlias}
                    onChange={e => setLocalAlias(e.target.value)}
                    className="text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:border-primary outline-none w-full placeholder-slate-400 italic"
                    placeholder="Alias de la tarea (opcional)"
                  />
                </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-slate-200">
                <span className="text-xs text-slate-500 font-semibold uppercase">Cantidad</span>
                <input
                  type="number"
                  value={localQuantity}
                  onChange={(e) => setLocalQuantity(parseFloat(e.target.value) || 1)}
                  className="w-16 text-sm font-semibold border-none outline-none bg-transparent"
                />
              </div>
              <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-slate-200">
                <span className="text-xs text-slate-500 font-semibold uppercase">Unidad</span>
                <input
                  type="text"
                  value={localUnit}
                  onChange={(e) => setLocalUnit(e.target.value)}
                  className="w-16 text-sm font-semibold border-none outline-none bg-transparent"
                />
              </div>
              <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-slate-200">
                <span className="text-xs text-slate-500 font-semibold uppercase">Inicio</span>
                <input
                  type="date"
                  value={localStartDate}
                  onChange={(e) => setLocalStartDate(e.target.value)}
                  className="text-sm font-semibold border-none outline-none bg-transparent"
                />
              </div>
              <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-slate-200">
                <span className="text-xs text-slate-500 font-semibold uppercase">Fin</span>
                <input
                  type="date"
                  value={localEndDate}
                  onChange={(e) => setLocalEndDate(e.target.value)}
                  className="text-sm font-semibold border-none outline-none bg-transparent"
                />
              </div>
              <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-slate-200">
                <span className="text-xs text-slate-500 font-semibold uppercase">Progreso</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={localProgress}
                  onChange={(e) => setLocalProgress(parseInt(e.target.value) || 0)}
                  className="w-16 text-sm font-semibold border-none outline-none bg-transparent"
                />
                <span className="text-xs text-slate-500">%</span>
              </div>
              
              <div className="h-6 w-px bg-slate-200 mx-1"></div>
              <div className="text-sm">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider mr-2">Costo Base Total</span>
                <span className="font-bold text-slate-700">{formatCurrency(totalBaseCost)}</span>
              </div>
            </div>
            
            <div className="mt-3">
              <input
                type="text"
                value={localDescription}
                onChange={e => setLocalDescription(e.target.value)}
                placeholder="Descripción adicional (opcional)"
                className="w-full text-sm bg-white border border-slate-200 rounded px-2 py-1.5 focus:border-primary outline-none"
              />
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSaveTaskDetails}
                disabled={isSaving}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {isSaving ? 'Guardando...' : 'Guardar Tarea'}
              </button>
            </div>
          </div>
          <button onClick={onClose} className="absolute top-5 right-5 p-1 text-slate-400 hover:bg-slate-200 rounded-md transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 flex flex-col gap-6">
          {/* Resumen por tipo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(costsByType).map(([type, total]) => (
              <div key={type} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  {resourceTypeLabels[type] || type}
                </div>
                <div className="text-lg font-bold text-[#001c3a]">{formatCurrency(total)}</div>
              </div>
            ))}
          </div>

          {/* Lista de Componentes */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h4 className="font-bold text-slate-800">Componentes de la Tarea</h4>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setPickerFilter(null); setIsPickerOpen(true); }}
                  className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Importar de Biblioteca
                </button>
                <button 
                  onClick={() => setIsAddingManual(true)}
                  className="px-3 py-1.5 text-sm border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Añadir Manual
                </button>
              </div>
            </div>

            {isAddingManual && (
              <form onSubmit={handleAddManual} className="p-4 bg-amber-50 border-b border-amber-100 flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-amber-800 mb-1">Concepto</label>
                  <input required autoFocus type="text" value={manualForm.concept} onChange={e => setManualForm({...manualForm, concept: e.target.value})} className="w-full text-sm rounded border-amber-200 bg-white p-2" />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-semibold text-amber-800 mb-1">Unidad</label>
                  <input required type="text" value={manualForm.unit} onChange={e => setManualForm({...manualForm, unit: e.target.value})} className="w-full text-sm rounded border-amber-200 bg-white p-2" />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-semibold text-amber-800 mb-1">Cantidad</label>
                  <input required type="number" step="any" value={manualForm.quantity} onChange={e => setManualForm({...manualForm, quantity: Number(e.target.value)})} className="w-full text-sm rounded border-amber-200 bg-white p-2" />
                </div>
                <div className="w-32">
                  <label className="block text-xs font-semibold text-amber-800 mb-1">Costo Unit.</label>
                  <input required type="number" step="any" value={manualForm.unitCost} onChange={e => setManualForm({...manualForm, unitCost: Number(e.target.value)})} className="w-full text-sm rounded border-amber-200 bg-white p-2" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="p-2 bg-amber-600 text-white rounded hover:bg-amber-700"><Check size={18} /></button>
                  <button type="button" onClick={() => setIsAddingManual(false)} className="p-2 bg-white text-slate-500 rounded border border-slate-200 hover:bg-slate-50"><X size={18} /></button>
                </div>
              </form>
            )}

            <div className="overflow-auto flex-1">
              {loading ? (
                <div className="p-8 text-center text-slate-400">Cargando desglose...</div>
              ) : components.length === 0 ? (
                <div className="p-8 text-center text-slate-400">Esta tarea no tiene desglose. Añade componentes para calcular su costo.</div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200 uppercase">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Tipo</th>
                      <th className="px-4 py-3 font-semibold">Concepto</th>
                      <th className="px-4 py-3 font-semibold">U.</th>
                      <th className="px-4 py-3 font-semibold text-right w-24">Cant.</th>
                      <th className="px-4 py-3 font-semibold text-right w-32">Costo U.</th>
                      <th className="px-4 py-3 font-semibold text-right w-32">Parcial</th>
                      <th className="px-4 py-3 font-semibold text-center w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {components.map(comp => (
                      <tr key={comp.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                            {resourceTypeLabels[comp.resourceType || 'MANUAL']}
                          </span>
                        </td>
                        <td className="px-4 py-2 font-medium text-slate-800">
                          <input 
                            type="text" 
                            value={comp.concept} 
                            onChange={(e) => handleUpdateComponent(comp.id, 'concept', e.target.value)}
                            className="w-full bg-transparent border-none p-0 focus:ring-0 text-slate-800 font-medium"
                          />
                        </td>
                        <td className="px-4 py-2 text-slate-500">{comp.unit || '-'}</td>
                        <td className="px-4 py-2 text-right">
                          <input 
                            type="number" 
                            step="any"
                            value={comp.quantity} 
                            onChange={(e) => handleUpdateComponent(comp.id, 'quantity', Number(e.target.value) || 0)}
                            className="w-full text-right bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 rounded p-1"
                          />
                        </td>
                        <td className="px-4 py-2 text-right">
                          <input 
                            type="number" 
                            step="any"
                            value={comp.unitCost} 
                            onChange={(e) => handleUpdateComponent(comp.id, 'unitCost', Number(e.target.value) || 0)}
                            className="w-full text-right bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 rounded p-1"
                          />
                        </td>
                        <td className="px-4 py-2 text-right font-bold text-slate-700">
                          {formatCurrency(comp.quantity * comp.unitCost)}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button 
                            onClick={() => handleRemoveComponent(comp.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Summary Footer Breakdown */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 mt-auto shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold mb-1">Costo Unitario (Base)</div>
              <div className="text-xl font-bold text-slate-800">{formatCurrency(unitBaseCost)}</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold mb-1">Costo Total (Base)</div>
              <div className="text-xl font-bold text-slate-800">{formatCurrency(totalBaseCost)}</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1">
                Margen (%)
              </div>
              <input 
                type="number" 
                className="w-24 text-xl font-bold text-slate-800 bg-transparent outline-none border-b border-dashed border-slate-300 focus:border-primary"
                value={localMargin}
                onChange={async e => {
                  const m = parseFloat(e.target.value) || 0;
                  setLocalMargin(m);
                  await projectPlanningService.updateTask(task.id, { margin: m });
                  onUpdate();
                }}
              />
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold mb-1">Importe Margen Total</div>
              <div className="text-xl font-bold text-emerald-600">
                {formatCurrency(totalBaseCost * (localMargin / 100))}
              </div>
            </div>
            <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
              <div className="text-xs text-primary-dark font-semibold mb-1">Precio Venta (Total)</div>
              <div className="text-xl font-bold text-primary">
                {formatCurrency(totalBaseCost * (1 + localMargin / 100))}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      <ApuPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleAddFromLibrary}
        resourceType={pickerFilter || undefined}
        title="Importar Componente a la Tarea"
      />
    </>,
    document.body
  );
}
