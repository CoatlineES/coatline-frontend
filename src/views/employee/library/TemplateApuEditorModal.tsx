import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Package } from 'lucide-react';
import { QuotationTemplateLine, quotationTemplatesService } from '../../../services/quotation-templates.service';
import ApuPickerModal from '../quotations/ApuPickerModal';
import { ResourceType, Resource } from '../../../services/resources.service';
import toast from 'react-hot-toast';
import { useCurrency } from '../../../hooks/useCurrency';

interface TemplateApuEditorModalProps {
  templateId: string;
  chapterId: string;
  line: QuotationTemplateLine;
  childrenLines: QuotationTemplateLine[];
  onClose: () => void;
  onUpdate: () => void;
}

export default function TemplateApuEditorModal({ 
  templateId, 
  chapterId, 
  line, 
  childrenLines, 
  onClose,
  onUpdate
}: TemplateApuEditorModalProps) {
  const { formatCurrency } = useCurrency();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerFilter, setPickerFilter] = useState<ResourceType | null>(null);

  const [isAddingManual, setIsAddingManual] = useState(false);
  const [manualForm, setManualForm] = useState({ concept: '', quantity: 1, unit: 'ud', unitPrice: 0 });
  const [localMargin, setLocalMargin] = useState(line.margin || 0);

  useEffect(() => {
    setLocalMargin(line.margin || 0);
  }, [line.margin]);

  

  const updateParentCost = async () => {
    onUpdate();
  };

  const handleSaveAllAndClose = async () => {
    try {
      if (localMargin !== (line.margin || 0)) {
        await quotationTemplatesService.updateLine(line.id, { margin: localMargin });
        onUpdate();
      }
      onClose();
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  const handleUpdateChild = async (childId: string, field: string, value: any) => {
    try {
      await quotationTemplatesService.updateLine(childId, { [field]: value });
      updateParentCost();
    } catch (error) {
      toast.error('Error al actualizar componente');
    }
  };

  const handleDeleteChild = async (childId: string) => {
    if (!confirm('¿Eliminar componente del APU?')) return;
    try {
      await quotationTemplatesService.deleteLine(childId);
      updateParentCost();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const handleAddComponentFromLibrary = async (resource: Resource) => {
    setIsPickerOpen(false);
    try {
      await quotationTemplatesService.addLine(chapterId, {
        parentId: line.id,
        concept: resource.name,
        quantity: 1,
        unit: resource.unit,
        unitPrice: resource.unitCost || 0,
        resourceId: resource.id,
      });
      toast.success('Componente añadido');
      updateParentCost();
    } catch (error) {
      toast.error('Error al añadir componente');
    }
  };

  const handleAddManualComponent = async () => {
    if (!manualForm.concept) {
      toast.error('Indica un concepto');
      return;
    }
    try {
      await quotationTemplatesService.addLine(chapterId, {
        parentId: line.id,
        concept: manualForm.concept,
        quantity: manualForm.quantity,
        unit: manualForm.unit,
        unitPrice: manualForm.unitPrice,
      });
      setIsAddingManual(false);
      setManualForm({ concept: '', quantity: 1, unit: 'ud', unitPrice: 0 });
      updateParentCost();
    } catch (error) {
      toast.error('Error al añadir manual');
    }
  };

  const baseCost = childrenLines.reduce((sum, c) => sum + (c.quantity * c.unitPrice), 0);
  const titleStr = line.concept?.split('\n')[0] || 'APU';

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Package size={20} />
              <h3 className="font-bold text-lg leading-none">Desglose de APU (Plantilla)</h3>
            </div>
            <p className="text-sm font-semibold text-slate-700">{titleStr}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shadow-sm border border-slate-100">
            <X size={20} />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-500 text-xs uppercase">
                <th className="py-3 px-2 text-left font-semibold w-8">Tipo</th>
                <th className="py-3 px-2 text-left font-semibold">Concepto</th>
                <th className="py-3 px-2 text-center font-semibold w-20">Ud.</th>
                <th className="py-3 px-2 text-right font-semibold w-24">Rend.</th>
                <th className="py-3 px-2 text-right font-semibold w-28">P.Unit.</th>
                <th className="py-3 px-2 text-right font-semibold w-28">Importe</th>
                <th className="py-3 px-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {childrenLines.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="py-2 px-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-600">
                      {c.resourceId ? 'Bibl' : 'Man'}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    <div className="font-medium text-slate-700">{c.concept?.split('\n')[0]}</div>
                  </td>
                  <td className="py-2 px-2">
                    <input 
                      type="text" 
                      className="w-full text-center text-xs p-1 border border-transparent hover:border-slate-300 focus:border-primary rounded bg-transparent focus:bg-white" 
                      value={c.unit || ''} 
                      onChange={e => handleUpdateChild(c.id, 'unit', e.target.value)}
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input 
                      type="number" 
                      className="w-full text-right text-xs p-1 border border-transparent hover:border-slate-300 focus:border-primary rounded bg-transparent focus:bg-white" 
                      value={c.quantity} 
                      onChange={e => handleUpdateChild(c.id, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input 
                      type="number" 
                      className="w-full text-right text-xs p-1 border border-transparent hover:border-slate-300 focus:border-primary rounded bg-transparent focus:bg-white" 
                      value={c.unitPrice} 
                      onChange={e => handleUpdateChild(c.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td className="py-2 px-2 text-right font-bold text-slate-700">
                    {formatCurrency(c.quantity * c.unitPrice)}
                  </td>
                  <td className="py-2 px-2 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDeleteChild(c.id)} className="p-1 text-slate-400 hover:text-red-500 rounded">
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
                      value={manualForm.unitPrice} 
                      onChange={e => setManualForm({...manualForm, unitPrice: parseFloat(e.target.value) || 0})}
                    />
                  </td>
                  <td className="py-2 px-2 text-right font-bold text-slate-700 bg-white/50">
                    {formatCurrency(manualForm.quantity * manualForm.unitPrice)}
                  </td>
                  <td className="py-2 px-2 text-right flex">
                    <button onClick={handleAddManualComponent} className="p-1 text-primary hover:bg-primary/10 rounded font-semibold text-xs px-2">Guardar</button>
                    <button onClick={() => setIsAddingManual(false)} className="p-1 text-slate-400 hover:bg-slate-200 rounded ml-1"><X size={14} /></button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {childrenLines.length === 0 && !isAddingManual && (
            <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-lg">
              Este APU en la plantilla no tiene desglose. Añade componentes para calcular su coste.
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
              onClick={() => setIsAddingManual(true)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 flex items-center gap-1"
            >
              <Plus size={14} /> Manual
            </button>
          </div>
        </div>

        {/* Summary Footer Breakdown */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold mb-1">Coste Total (Base)</div>
              <div className="text-xl font-bold text-slate-800">{formatCurrency(baseCost)}</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1">
                Margen (%)
              </div>
              <input 
                type="number" 
                className="w-24 text-xl font-bold text-slate-800 bg-transparent outline-none border-b border-dashed border-slate-300 focus:border-primary"
                value={localMargin}
                onChange={e => setLocalMargin(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold mb-1">Importe Margen</div>
              <div className="text-xl font-bold text-emerald-600">
                {formatCurrency(baseCost * (localMargin / 100))}
              </div>
            </div>
            <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
              <div className="text-xs text-primary-dark font-semibold mb-1">Precio Venta (Unitario)</div>
              <div className="text-xl font-bold text-primary">
                {formatCurrency(baseCost * (1 + localMargin / 100))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 mt-2">
            <button 
              onClick={onClose}
              className="px-5 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSaveAllAndClose}
              className="px-5 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 transition-all active:scale-95 shadow-md hover:shadow-lg"
            >
              Guardar y Cerrar
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
