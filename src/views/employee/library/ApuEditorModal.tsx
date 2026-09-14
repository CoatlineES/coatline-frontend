import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Package } from 'lucide-react';
import { Resource, ResourceComponent, resourcesService, ResourceType } from '../../../services/resources.service';
import ApuPickerModal from '../quotations/ApuPickerModal';
import toast from 'react-hot-toast';
import { useCurrency } from '../../../hooks/useCurrency';

interface ApuEditorModalProps {
  apu: Resource;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ApuEditorModal({ apu, onClose, onUpdate }: ApuEditorModalProps) {
  const { formatCurrency } = useCurrency();
  const [components, setComponents] = useState<ResourceComponent[]>(apu.components || []);
  const [margin, setMargin] = useState<number>(apu.margin || 0);
  const [isSavingMargin, setIsSavingMargin] = useState(false);
  
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerFilter, setPickerFilter] = useState<ResourceType | null>(null);

  const [isAddingManual, setIsAddingManual] = useState(false);
  const [manualForm, setManualForm] = useState({
    concept: '',
    unit: 'ud',
    quantity: 1,
    unitCost: 0
  });

  const baseCost = components.reduce((sum, c) => sum + (c.quantity * c.unitCost), 0);
  const salesPrice = baseCost * (1 + margin / 100);

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
    const type = c.childResource?.resourceType || 'MANUAL';
    if (!acc[type]) acc[type] = 0;
    acc[type] += c.quantity * c.unitCost;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    // Sync if prop changes
    setComponents(apu.components || []);
    setMargin(apu.margin || 0);
  }, [apu]);

  const handleSaveMargin = async (newMargin: number) => {
    try {
      setIsSavingMargin(true);
      await resourcesService.update(apu.id, { margin: newMargin });
      setMargin(newMargin);
      onUpdate();
    } catch (e) {
      toast.error('Error al guardar el margen');
    } finally {
      setIsSavingMargin(false);
    }
  };

  const handleAddComponentFromLibrary = async (resource: Resource) => {
    try {
      const data: Partial<ResourceComponent> = {
        childResourceId: resource.id,
        concept: resource.name,
        unit: resource.unit,
        quantity: 1, // Default yield
        unitCost: resource.salesPrice || resource.unitCost || 0
      };
      const added = await resourcesService.addComponent(apu.id, data);
      setComponents(prev => [...prev, added]);
      onUpdate();
      setIsPickerOpen(false);
    } catch (e) {
      toast.error('Error al añadir el componente');
    }
  };

  const handleAddManualComponent = async () => {
    if (!manualForm.concept) {
      toast.error('El concepto es obligatorio');
      return;
    }
    try {
      const data: Partial<ResourceComponent> = {
        concept: manualForm.concept,
        unit: manualForm.unit,
        quantity: manualForm.quantity,
        unitCost: manualForm.unitCost
      };
      const added = await resourcesService.addComponent(apu.id, data);
      setComponents(prev => [...prev, added]);
      setIsAddingManual(false);
      setManualForm({ concept: '', unit: 'ud', quantity: 1, unitCost: 0 });
      onUpdate();
    } catch (e) {
      toast.error('Error al añadir el componente');
    }
  };

  const handleUpdateComponent = async (id: string, field: keyof ResourceComponent, value: any) => {
    // Optimistic update
    setComponents(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    try {
      await resourcesService.updateComponent(apu.id, id, { [field]: value });
      onUpdate();
    } catch (e) {
      toast.error('Error al actualizar el componente');
      // Revert in case of failure? Ideally yes, but keeping it simple.
    }
  };

  const handleDeleteComponent = async (id: string) => {
    if (!window.confirm('¿Eliminar componente?')) return;
    try {
      await resourcesService.removeComponent(apu.id, id);
      setComponents(prev => prev.filter(c => c.id !== id));
      onUpdate();
    } catch (e) {
      toast.error('Error al eliminar el componente');
    }
  };

  const getResourceTypeBadge = (type?: string) => {
    if (!type) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">Man</span>;
    switch (type) {
      case ResourceType.MANO_OBRA: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-600">Man</span>;
      case ResourceType.MATERIAL: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-600">Mat</span>;
      case ResourceType.CDC: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">CDC</span>;
      case ResourceType.APU: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-600">APU</span>;
      case ResourceType.MAQUINARIA: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-600">Maq</span>;
      default: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">{type.substring(0, 3)}</span>;
    }
  };

  

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
              <Package size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                APU — {apu.name}
              </h2>
              {apu.code && <div className="text-xs text-slate-500 font-mono">{apu.code}</div>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-white">
          
          <div className="flex items-center gap-3 mb-6">
            <label className="text-sm font-semibold text-slate-700">Margen (%)</label>
            <input 
              type="number" 
              className="w-24 text-center text-sm p-1.5 border border-slate-300 rounded outline-none focus:ring-2 focus:ring-primary/20"
              value={margin}
              onChange={e => handleSaveMargin(parseFloat(e.target.value) || 0)}
              disabled={isSavingMargin}
            />
            {isSavingMargin && <span className="text-xs text-slate-400">Guardando...</span>}
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs">
                <th className="py-3 px-2 text-left font-semibold w-16">Tipo</th>
                <th className="py-3 px-2 text-left font-semibold">Componente</th>
                <th className="py-3 px-2 text-center font-semibold w-20">Ud.</th>
                <th className="py-3 px-2 text-right font-semibold w-24">Rend.</th>
                <th className="py-3 px-2 text-right font-semibold w-28">Coste ud.</th>
                <th className="py-3 px-2 text-right font-semibold w-28">Importe</th>
                <th className="py-3 px-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {components.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="py-2 px-2">
                    {getResourceTypeBadge(c.childResource?.resourceType)}
                  </td>
                  <td className="py-2 px-2">
                    <div className="font-medium text-slate-700">{c.concept}</div>
                  </td>
                  <td className="py-2 px-2">
                    <input 
                      type="text" 
                      className="w-full text-center text-xs p-1 border border-transparent hover:border-slate-300 focus:border-primary rounded bg-transparent focus:bg-white" 
                      value={c.unit || ''} 
                      onChange={e => handleUpdateComponent(c.id, 'unit', e.target.value)}
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input 
                      type="number" 
                      className="w-full text-right text-xs p-1 border border-transparent hover:border-slate-300 focus:border-primary rounded bg-transparent focus:bg-white" 
                      value={c.quantity} 
                      onChange={e => handleUpdateComponent(c.id, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input 
                      type="number" 
                      className="w-full text-right text-xs p-1 border border-transparent hover:border-slate-300 focus:border-primary rounded bg-transparent focus:bg-white" 
                      value={c.unitCost} 
                      onChange={e => handleUpdateComponent(c.id, 'unitCost', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td className="py-2 px-2 text-right font-bold text-slate-700">
                    {formatCurrency(c.quantity * c.unitCost)}
                  </td>
                  <td className="py-2 px-2 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDeleteComponent(c.id)} className="p-1 text-slate-400 hover:text-red-500 rounded">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}

              {isAddingManual && (
                <tr className="bg-primary/5">
                  <td className="py-2 px-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-600">Man</span>
                  </td>
                  <td className="py-2 px-2">
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Concepto..."
                      className="w-full text-xs p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                      value={manualForm.concept} 
                      onChange={e => setManualForm({...manualForm, concept: e.target.value})}
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input 
                      type="text" 
                      className="w-full text-center text-xs p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                      value={manualForm.unit} 
                      onChange={e => setManualForm({...manualForm, unit: e.target.value})}
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input 
                      type="number" 
                      className="w-full text-right text-xs p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                      value={manualForm.quantity} 
                      onChange={e => setManualForm({...manualForm, quantity: parseFloat(e.target.value) || 0})}
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input 
                      type="number" 
                      className="w-full text-right text-xs p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                      value={manualForm.unitCost} 
                      onChange={e => setManualForm({...manualForm, unitCost: parseFloat(e.target.value) || 0})}
                    />
                  </td>
                  <td className="py-2 px-2 text-right font-bold text-slate-700 bg-white/50">
                    {formatCurrency(manualForm.quantity * manualForm.unitCost)}
                  </td>
                  <td className="py-2 px-2 text-right">
                    <button onClick={handleAddManualComponent} className="p-1 text-primary hover:bg-primary/10 rounded">Guardar</button>
                    <button onClick={() => setIsAddingManual(false)} className="p-1 text-slate-400 hover:bg-slate-200 rounded ml-1"><X size={14} /></button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {components.length === 0 && !isAddingManual && (
            <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-lg">
              Este APU no tiene componentes todavía.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
            <button 
              onClick={() => { setPickerFilter(null); setIsPickerOpen(true); }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 flex items-center gap-1"
            >
              <Plus size={14} /> Desde biblioteca
            </button>
            <button 
              onClick={() => { setPickerFilter(ResourceType.APU); setIsPickerOpen(true); }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 flex items-center gap-1"
            >
              <Plus size={14} /> Añadir APU hijo
            </button>
            <button 
              onClick={() => setIsAddingManual(true)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 flex items-center gap-1"
            >
              <Plus size={14} /> Manual
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-6 py-6 border-t border-slate-200">
          <div className="flex flex-col gap-2 mb-4 w-full max-w-sm ml-auto">
            {Object.entries(costsByType).filter(([_, cost]) => cost > 0).map(([type, cost]) => (
              <div key={type} className="flex justify-between items-center text-sm text-slate-500">
                <span>{resourceTypeLabels[type] || type}</span>
                <span className="font-semibold text-slate-700">{formatCurrency(cost)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 my-4 w-full max-w-sm ml-auto"></div>

          <div className="flex flex-col gap-2 w-full max-w-sm ml-auto">
            <div className="flex justify-between items-center text-sm font-bold text-slate-800">
              <span>Coste total</span>
              <span>{formatCurrency(baseCost)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-slate-500 mb-2">
              <span>Margen ({margin}%)</span>
              <span className="font-semibold text-slate-700">{formatCurrency(salesPrice - baseCost)}</span>
            </div>
          </div>

          <div className="border-t border-slate-100 my-4 w-full max-w-sm ml-auto"></div>

          <div className="flex justify-between items-center w-full max-w-sm ml-auto mb-8">
            <span className="text-sm font-bold text-[#001c3a]">Precio unitario</span>
            <span className="text-lg font-bold text-[#001c3a]">{formatCurrency(salesPrice)}</span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={() => {
                toast.success('APU guardado correctamente');
                onClose();
              }}
              className="px-5 py-2.5 text-sm font-bold text-white bg-[#001c3a] hover:bg-[#001c3a]/90 rounded-lg shadow-md transition-all active:scale-95 hover:shadow-lg"
            >
              Guardar APU
            </button>
          </div>
        </div>

      </div>

      {isPickerOpen && (
        <ApuPickerModal 
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          onSelect={handleAddComponentFromLibrary}
          resourceType={pickerFilter || undefined}
        />
      )}
    </div>
  );
}
