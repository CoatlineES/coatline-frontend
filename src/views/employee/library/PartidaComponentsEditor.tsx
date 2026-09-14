import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Package, Check, X, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResourceComponent, Resource, resourcesService, ResourceType } from '../../../services/resources.service';
import ApuPickerModal from '../quotations/ApuPickerModal';
import toast from 'react-hot-toast';
import { useCurrency } from '../../../hooks/useCurrency';

interface PartidaComponentsEditorProps {
  partidaId: string;
}

export default function PartidaComponentsEditor({ partidaId }: PartidaComponentsEditorProps) {
  const { formatCurrency } = useCurrency();
  const [components, setComponents] = useState<ResourceComponent[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddingComponent, setIsAddingComponent] = useState(false);
  const [pickerType, setPickerType] = useState<ResourceType | null>(null);
  
  const [editingComponentId, setEditingComponentId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ResourceComponent>>({});

  const [viewingApuId, setViewingApuId] = useState<string | null>(null);
  const [viewingApuName, setViewingApuName] = useState<string>('');

  const hasApuComponent = components.some(c => c.childResourceId !== null);

  

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const resource = await resourcesService.getById(partidaId);
      setComponents(resource.components || []);
    } catch (error) {
      console.error('Error fetching components', error);
      toast.error('Error al cargar componentes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (partidaId) {
      fetchComponents();
    }
  }, [partidaId]);

  const handleSelectApu = async (apu: Resource) => {
    try {
      const [title, ...descParts] = (apu.name || '').split('\n');
      const concept = `${title}${descParts.length > 0 ? '\n' + descParts.join('\n') : ''}`;
      
      await resourcesService.addComponent(partidaId, {
        childResourceId: apu.id,
        concept,
        unit: apu.unit,
        quantity: 1,
        unitCost: apu.salesPrice || apu.unitCost,
      });
      toast.success('APU agregado a la partida');
      setPickerType(null);
      fetchComponents();
    } catch (error) {
      toast.error('Error al agregar APU');
    }
  };

  const startEdit = (comp: ResourceComponent) => {
    setEditingComponentId(comp.id);
    setForm({ ...comp });
    setIsAddingComponent(false);
  };

  const cancelEdit = () => {
    setEditingComponentId(null);
    setForm({});
    setIsAddingComponent(false);
  };

  const saveComponent = async () => {
    try {
      if (isAddingComponent) {
        await resourcesService.addComponent(partidaId, {
          concept: form.concept || 'Nuevo componente',
          unit: form.unit || 'ud',
          quantity: Number(form.quantity || 1),
          unitCost: Number(form.unitCost || 0),
          childResourceId: null
        });
        toast.success('Componente agregado');
      } else if (editingComponentId) {
        await resourcesService.updateComponent(partidaId, editingComponentId, {
          concept: form.concept,
          unit: form.unit,
          quantity: Number(form.quantity),
          unitCost: Number(form.unitCost)
        });
        toast.success('Componente actualizado');
      }
      cancelEdit();
      fetchComponents();
    } catch (error) {
      toast.error('Error al guardar componente');
    }
  };

  const deleteComponent = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este componente?')) return;
    try {
      await resourcesService.removeComponent(partidaId, id);
      toast.success('Componente eliminado');
      fetchComponents();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  if (loading) return <div className="p-4 text-center text-slate-500 text-sm">Cargando componentes...</div>;

  return (
    <div className="mt-8 border-t border-slate-100 pt-6">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Composición (Líneas de Partida)</h4>
      
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
            <tr>
              <th className="px-4 py-2 font-semibold">Concepto</th>
              <th className="px-3 py-2 font-semibold text-right w-20">Cant</th>
              <th className="px-3 py-2 font-semibold text-center w-16">Ud</th>
              <th className="px-3 py-2 font-semibold text-right w-28">P.Unit</th>
              <th className="px-4 py-2 font-semibold text-right w-28">Total</th>
              <th className="px-2 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {components.map(comp => {
              const isEditing = editingComponentId === comp.id;
              return (
                <tr key={comp.id} className={isEditing ? 'bg-primary/5' : 'hover:bg-slate-50'}>
                  {isEditing ? (
                    <>
                      <td className="p-2">
                        <textarea 
                          autoFocus
                          className="w-full text-sm p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white resize-none" 
                          rows={2}
                          value={form.concept || ''} 
                          onChange={e => setForm({...form, concept: e.target.value})}
                          placeholder="Concepto..."
                        />
                      </td>
                      <td className="p-2">
                        <input type="number" className="w-full text-right text-sm p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                          value={form.quantity || ''} onChange={e => setForm({...form, quantity: parseFloat(e.target.value)})} />
                      </td>
                      <td className="p-2">
                        <input type="text" className="w-full text-center text-sm p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                          value={form.unit || ''} onChange={e => setForm({...form, unit: e.target.value})} />
                      </td>
                      <td className="p-2">
                        <input type="number" className="w-full text-right text-sm p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                          value={form.unitCost || ''} onChange={e => setForm({...form, unitCost: parseFloat(e.target.value)})} />
                      </td>
                      <td className="px-4 py-2 text-right font-bold text-slate-800 bg-white/50">
                        {formatCurrency((Number(form.quantity) || 0) * (Number(form.unitCost) || 0))}
                      </td>
                      <td className="p-2 flex gap-1 justify-end h-full items-center pt-3">
                        <button onClick={saveComponent} className="p-1 text-green-600 hover:bg-green-100 rounded"><Check size={14} /></button>
                        <button onClick={cancelEdit} className="p-1 text-slate-400 hover:bg-slate-200 rounded"><X size={14} /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 cursor-text" onClick={() => startEdit(comp)}>
                        <div className="flex items-start gap-2">
                          {(comp.childResource?.resourceType === 'APU' || comp.childResource?.isGroup) && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setViewingApuId(comp.childResourceId!); setViewingApuName(comp.concept); }}
                              className="mt-0.5 p-1 rounded transition-colors bg-amber-100/50 text-amber-600 hover:bg-amber-200"
                              title="Ver detalle del sub-APU"
                            >
                              <Calculator size={14} />
                            </button>
                          )}
                          <div>
                            <div className="font-semibold text-slate-800 whitespace-pre-wrap">{comp.concept}</div>
                            {comp.childResourceId && <div className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide flex items-center gap-1"><Package size={10} /> Vinculado a Biblioteca</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right font-medium cursor-text" onClick={() => startEdit(comp)}>{comp.quantity}</td>
                      <td className="px-3 py-3 text-center text-slate-500 cursor-text" onClick={() => startEdit(comp)}>{comp.unit}</td>
                      <td className="px-3 py-3 text-right cursor-text" onClick={() => startEdit(comp)}>{formatCurrency(comp.unitCost)}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">{formatCurrency(comp.quantity * comp.unitCost)}</td>
                      <td className="px-2 py-3 text-right">
                        <button onClick={() => deleteComponent(comp.id)} className="p-1.5 text-slate-300 hover:text-red-500 rounded" title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
            
            {isAddingComponent && (
              <tr className="bg-primary/5">
                <td className="p-2">
                  <textarea 
                    autoFocus
                    className="w-full text-sm p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white resize-none" 
                    rows={2}
                    value={form.concept || ''} 
                    onChange={e => setForm({...form, concept: e.target.value})}
                    placeholder="Concepto..."
                  />
                </td>
                <td className="p-2">
                  <input type="number" className="w-full text-right text-sm p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                    value={form.quantity || ''} onChange={e => setForm({...form, quantity: parseFloat(e.target.value)})} />
                </td>
                <td className="p-2">
                  <input type="text" className="w-full text-center text-sm p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                    value={form.unit || ''} onChange={e => setForm({...form, unit: e.target.value})} />
                </td>
                <td className="p-2">
                  <input type="number" className="w-full text-right text-sm p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                    value={form.unitCost || ''} onChange={e => setForm({...form, unitCost: parseFloat(e.target.value)})} />
                </td>
                <td className="px-4 py-2 text-right font-bold text-slate-800 bg-white/50">
                  {formatCurrency((Number(form.quantity) || 0) * (Number(form.unitCost) || 0))}
                </td>
                <td className="p-2 flex gap-1 justify-end h-full items-center pt-3">
                  <button onClick={saveComponent} className="p-1 text-green-600 hover:bg-green-100 rounded"><Check size={14} /></button>
                  <button onClick={cancelEdit} className="p-1 text-slate-400 hover:bg-slate-200 rounded"><X size={14} /></button>
                </td>
              </tr>
            )}
            
            {components.length === 0 && !isAddingComponent && (
              <tr><td colSpan={6} className="py-6 text-center text-slate-400">Esta partida no tiene componentes aún.</td></tr>
            )}
          </tbody>
        </table>
        <div className="bg-slate-50 p-3 border-t border-slate-200 flex justify-between items-center">
          <div className="flex gap-2">
            {!isAddingComponent && !components.length && (
              <>
                <button 
                  type="button"
                  onClick={() => { setForm({ quantity: 1, unit: 'ud', unitCost: 0 }); setIsAddingComponent(true); setEditingComponentId(null); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded transition-colors"
                >
                  <Plus size={14} /> Añadir Manual
                </button>
                <button 
                  type="button"
                  onClick={() => setPickerType(ResourceType.APU)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded transition-colors"
                >
                  <Package size={14} /> Importar APU
                </button>
              </>
            )}
          </div>
          <div className="text-sm">
            <span className="text-slate-500 font-medium mr-2">SUMA COMPONENTES:</span>
            <span className="font-bold text-slate-800">
              {formatCurrency(components.reduce((a, c) => a + (c.quantity * c.unitCost), 0))}
            </span>
          </div>
        </div>
      </div>

      <ApuPickerModal 
        isOpen={pickerType !== null}
        onClose={() => setPickerType(null)}
        onSelect={handleSelectApu}
        resourceType={pickerType || undefined}
      />

      <AnimatePresence>
        {viewingApuId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[85vh] overflow-hidden"
            >
              <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
                <h3 className="text-lg font-bold text-[#001c3a] flex items-center gap-2">
                  <Calculator size={20} className="text-amber-500" />
                  Detalle de APU: {viewingApuName}
                </h3>
                <button onClick={() => { setViewingApuId(null); fetchComponents(); }} className="p-1 text-slate-400 hover:bg-slate-200 rounded-md transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <PartidaComponentsEditor partidaId={viewingApuId} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
