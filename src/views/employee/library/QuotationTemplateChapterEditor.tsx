import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Calendar, Package, Save, Layers, ChevronDown, ChevronRight, Calculator } from 'lucide-react';
import { QuotationChapter, QuotationLine } from '../../../types/quotation';
import { quotationsService } from '../../../services/quotations.service';
import { resourcesService, Resource, ResourceType } from '../../../services/resources.service';
import toast from 'react-hot-toast';
import ApuPickerModal from './ApuPickerModal';
import QuotationApuEditorModal from './QuotationApuEditorModal';
import { useCurrency } from '../../../hooks/useCurrency';

interface QuotationChapterEditorProps {
  quotationId: string;
  chapter: QuotationChapter;
  index: number;
  onUpdate: () => void; // Trigger reload
}

export default function QuotationChapterEditor({ quotationId, chapter, index, onUpdate }: QuotationChapterEditorProps) {
  const { formatCurrency } = useCurrency();
  const [editingChapter, setEditingChapter] = useState(false);
  const [chapterTitle, setChapterTitle] = useState(chapter.title);
  const [startDate, setStartDate] = useState(chapter.startDate ? new Date(chapter.startDate).toISOString().split('T')[0] : '');
  const [endDate, setEndDate] = useState(chapter.endDate ? new Date(chapter.endDate).toISOString().split('T')[0] : '');

  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [lineForm, setLineForm] = useState<Partial<QuotationLine> & { title?: string, description?: string }>({});
  const [editingApuLine, setEditingApuLine] = useState<QuotationLine | null>(null);
  
  const [isAddingLine, setIsAddingLine] = useState(false);
  const [pickerType, setPickerType] = useState<ResourceType | null>(null);

  

  // --- Chapter Actions ---
  const saveChapterTitle = async () => {
    try {
      await quotationsService.updateChapter(quotationId, chapter.id, { 
        title: chapterTitle,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined
      } as any);
      setEditingChapter(false);
      onUpdate();
    } catch (e) {
      toast.error('Error al actualizar capítulo');
    }
  };

  const deleteChapter = async () => {
    if (!confirm('¿Seguro que deseas eliminar este capítulo completo?')) return;
    try {
      await quotationsService.deleteChapter(quotationId, chapter.id);
      onUpdate();
      toast.success('Capítulo eliminado');
    } catch (e) {
      toast.error('Error al eliminar');
    }
  };

  // --- Line Actions ---
  const startEditLine = (line: QuotationLine, autoCode?: string) => {
    setEditingLineId(line.id);
    const [title, ...descParts] = (line.concept || '').split('\n');
    setLineForm({ 
      ...line, 
      title, 
      description: descParts.join('\n'),
      code: line.code || autoCode || '' 
    });
    setIsAddingLine(false);
  };

  const cancelEditLine = () => {
    setEditingLineId(null);
    setLineForm({});
    setIsAddingLine(false);
  };

  const saveLine = async () => {
    try {
      const fullConcept = `${lineForm.title || 'Nueva partida'}${lineForm.description ? '\n' + lineForm.description : ''}`;
      if (isAddingLine) {
        await quotationsService.addLine(quotationId, chapter.id, {
          concept: fullConcept,
          unit: lineForm.unit || 'ud',
          quantity: Number(lineForm.quantity || 1),
          unitPrice: Number(lineForm.unitPrice || 0),
          resourceId: lineForm.resourceId || null,
          parentId: lineForm.parentId || null,
          isGroup: lineForm.isGroup || false,
          code: lineForm.code || null
        });
      } else if (editingLineId) {
        await quotationsService.updateLine(quotationId, chapter.id, editingLineId, {
          concept: fullConcept,
          unit: lineForm.unit,
          quantity: Number(lineForm.quantity),
          unitPrice: Number(lineForm.unitPrice),
          resourceId: lineForm.resourceId || null,
          isGroup: lineForm.isGroup || false,
          code: lineForm.code || null
        });
      }
      toast.success('Partida guardada');
      cancelEditLine();
      onUpdate();
    } catch (e) {
      toast.error('Error al guardar partida');
    }
  };

  const deleteLine = async (lineId: string) => {
    if (!confirm('¿Eliminar partida?')) return;
    try {
      await quotationsService.deleteLine(quotationId, chapter.id, lineId);
      onUpdate();
    } catch (e) {
      toast.error('Error al eliminar');
    }
  };

  const exportToLibrary = async (line: QuotationLine) => {
    try {
      const children = quotation.chapters.flatMap(c => c.lines).filter(l => l.parentId === line.id);
      
      const componentsData = children.map(child => ({
        concept: child.concept,
        unit: child.unit || 'ud',
        quantity: child.quantity,
        unitCost: child.unitCost || child.unitPrice,
        childResourceId: child.resourceId || undefined
      }));

      await resourcesService.create({
        name: line.concept,
        resourceType: ResourceType.PARTIDA,
        unit: line.unit || 'ud',
        unitCost: line.unitPrice,
        salesPrice: line.unitPrice,
        defaultQuantity: line.quantity,
        isActive: true,
        notes: 'Guardado desde cotización',
        components: componentsData.length > 0 ? { create: componentsData } : undefined
      } as any);
      toast.success('Partida guardada en la biblioteca');
    } catch (e) {
      toast.error('Error al guardar en la biblioteca');
    }
  };

  const handleSelectApu = (apu: Resource) => {
    const [title, ...descParts] = (apu.name || '').split('\n');
    setLineForm(prev => ({
      ...prev,
      title,
      description: descParts.join('\n'),
      unit: apu.unit,
      unitPrice: apu.salesPrice || apu.unitCost,
      quantity: (apu as any).defaultQuantity ?? 1,
      resourceId: apu.id,
    }));
    setIsAddingLine(true);
    setEditingLineId(null);
  };

  return (
    <div className="border border-slate-200 bg-white rounded-xl overflow-hidden shadow-sm mb-4 transition-all hover:border-slate-300">
      {/* Chapter Header */}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center group">
        {editingChapter ? (
          <div className="flex-1 flex gap-2 items-center mr-4">
            <span className="font-bold text-slate-800 text-sm whitespace-nowrap">Capítulo {index + 1}:</span>
            <input 
              autoFocus
              className="flex-1 px-3 py-1 text-sm border border-primary rounded outline-none focus:ring-2 focus:ring-primary/20 font-bold"
              value={chapterTitle}
              onChange={e => setChapterTitle(e.target.value)}
              placeholder="Nombre del capítulo..."
            />
            <div className="flex items-center gap-1 text-slate-500">
              <Calendar size={14} />
              <input type="date" className="text-xs px-2 py-1 border rounded" value={startDate} onChange={e => setStartDate(e.target.value)} title="Fecha inicio" />
              <span>-</span>
              <input type="date" className="text-xs px-2 py-1 border rounded" value={endDate} onChange={e => setEndDate(e.target.value)} title="Fecha fin" />
            </div>
            <button onClick={saveChapterTitle} className="p-1.5 text-green-600 hover:bg-green-50 rounded"><Check size={16} /></button>
            <button onClick={() => { setEditingChapter(false); setChapterTitle(chapter.title); }} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded"><X size={16} /></button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <h4 className="font-bold text-slate-800 text-sm">Capítulo {index + 1}: {chapter.title}</h4>
              {(chapter.startDate || chapter.endDate) && (
                <div className="text-xs font-medium text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded flex items-center gap-1">
                  <Calendar size={12} />
                  {chapter.startDate ? new Date(chapter.startDate).toLocaleDateString() : '?'} - {chapter.endDate ? new Date(chapter.endDate).toLocaleDateString() : '?'}
                </div>
              )}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditingChapter(true)} className="p-1.5 text-slate-400 hover:text-primary rounded hover:bg-white"><Edit2 size={14} /></button>
              <button onClick={deleteChapter} className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-white"><Trash2 size={14} /></button>
            </div>
          </>
        )}
      </div>

      {/* Lines Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-white text-slate-500 text-xs uppercase border-b border-slate-100">
            <th className="py-2 px-4 text-left font-semibold w-16">N°</th>
            <th className="py-2 px-4 text-left font-semibold">Concepto</th>
            <th className="py-2 px-4 text-right font-semibold w-24">Cant</th>
            <th className="py-2 px-4 text-center font-semibold w-20">Ud</th>
            <th className="py-2 px-4 text-right font-semibold w-32">P.Unit</th>
            <th className="py-2 px-4 text-right font-semibold w-32">Total</th>
            <th className="py-2 px-2 w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {chapter.lines.filter(l => !l.parentId).map((l, lIdx) => {
            const isEditing = editingLineId === l.id;
            const children = chapter.lines.filter(cl => cl.parentId === l.id);
            const isGroup = l.isGroup;
            const isApu = l.isApu;
            const baseCost = (isGroup || isApu) ? children.reduce((sum, cl) => sum + (cl.quantity * cl.unitPrice), 0) : l.unitPrice;
            const computedUnitPrice = isApu ? baseCost * (1 + (l.margin || 0) / 100) : baseCost;
            const totalCost = (l.quantity || 1) * computedUnitPrice;

            return (
              <React.Fragment key={l.id}>
                <tr className={`transition-colors group ${isEditing ? 'bg-primary/5' : 'hover:bg-slate-50'}`}>
                  {isEditing ? (
                    <>
                      <td className="py-2 px-2 align-top">
                        <input
                          type="text"
                          placeholder={`${index + 1}.${lIdx + 1}`}
                          className="w-full text-xs font-mono text-slate-500 p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white text-center"
                          value={lineForm.code || ''}
                          onChange={e => setLineForm({...lineForm, code: e.target.value})}
                        />
                      </td>
                      <td className="py-2 px-2 align-top">
                        <div className="flex flex-col gap-1">
                          <input
                            autoFocus
                            type="text"
                            placeholder="Título de la partida..."
                            className="w-full text-sm font-bold p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                            value={lineForm.title || ''} onChange={e => setLineForm({...lineForm, title: e.target.value})}
                          />
                          <textarea 
                            placeholder="Descripción (opcional)..."
                            className="w-full text-xs p-1.5 border border-slate-300 rounded resize-none outline-none focus:ring-1 focus:ring-primary bg-white" 
                            rows={3}
                            value={lineForm.description || ''} onChange={e => setLineForm({...lineForm, description: e.target.value})}
                          />
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        <input type="number" className="w-full text-right text-sm p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                          value={lineForm.quantity || ''} onChange={e => setLineForm({...lineForm, quantity: parseFloat(e.target.value)})} />
                      </td>
                      <td className="py-2 px-2">
                        <input type="text" className="w-full text-center text-sm p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                          value={lineForm.unit || ''} onChange={e => setLineForm({...lineForm, unit: e.target.value})} />
                      </td>
                      <td className="py-2 px-2">
                        <input type="number" disabled={isGroup} className={`w-full text-right text-sm p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary ${isGroup ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
                          value={isGroup ? computedUnitPrice : (lineForm.unitPrice || '')} onChange={e => setLineForm({...lineForm, unitPrice: parseFloat(e.target.value)})} />
                      </td>
                      <td className="py-2 px-4 text-right font-bold text-slate-800 bg-white/50">
                        {formatCurrency((Number(lineForm.quantity) || 0) * (isGroup ? computedUnitPrice : (Number(lineForm.unitPrice) || 0)))}
                      </td>
                      <td className="py-2 px-2 flex gap-1 justify-end">
                        <button onClick={saveLine} className="p-1 text-green-600 hover:bg-green-100 rounded"><Check size={14} /></button>
                        <button onClick={cancelEditLine} className="p-1 text-slate-400 hover:bg-slate-200 rounded"><X size={14} /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4 text-slate-400 font-mono text-xs cursor-text" onClick={() => startEditLine(l, `${index + 1}.${lIdx + 1}`)}>{l.code || `${index + 1}.${lIdx + 1}`}</td>
                      <td className="py-3 px-4 cursor-text" onClick={() => startEditLine(l, `${index + 1}.${lIdx + 1}`)}>
                        <div className="flex items-start gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); quotationsService.updateLine(quotationId, chapter.id, l.id, { isGroup: !isGroup }).then(onUpdate); }}
                            className={`mt-0.5 p-1 rounded transition-colors ${isGroup ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}
                            title={isGroup ? "Desagrupar partida" : "Convertir en partida agrupada"}
                          >
                            <Layers size={14} />
                          </button>
                          {!isGroup && (
                            isApu ? (
                              <div className="flex items-center gap-0.5">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setEditingApuLine(l); }}
                                  className="mt-0.5 p-1 rounded transition-colors bg-amber-100 text-amber-600 hover:bg-amber-200"
                                  title="Desglose del APU (Editar componentes)"
                                >
                                  <Calculator size={14} />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); quotationsService.updateLine(quotationId, chapter.id, l.id, { isApu: false }).then(onUpdate); }}
                                  className="mt-0.5 p-1 rounded transition-colors text-slate-300 hover:text-red-500 hover:bg-slate-100"
                                  title="Convertir en partida manual (desvincular APU)"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={(e) => { e.stopPropagation(); quotationsService.updateLine(quotationId, chapter.id, l.id, { isApu: true, isGroup: false }).then(onUpdate); }}
                                className="mt-0.5 p-1 rounded transition-colors bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-amber-600"
                                title="Convertir en APU"
                              >
                                <Calculator size={14} />
                              </button>
                            )
                          )}
                          <div>
                            <div className="font-bold text-slate-800">{l.concept?.split('\n')[0]}</div>
                            {l.concept?.includes('\n') && <div className="text-xs text-slate-500 mt-1 whitespace-pre-wrap">{l.concept.substring(l.concept.indexOf('\n') + 1)}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700 cursor-text" onClick={() => startEditLine(l)}>{l.quantity}</td>
                      <td className="py-3 px-4 text-center text-slate-500 cursor-text" onClick={() => startEditLine(l)}>{l.unit || 'ud'}</td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700 cursor-text" onClick={() => startEditLine(l)}>
                        <span className={isGroup ? 'text-indigo-600 font-bold' : ''}>{formatCurrency(computedUnitPrice)}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">{formatCurrency(totalCost)}</td>
                      <td className="py-3 px-2 text-right opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        <button onClick={() => exportToLibrary(l)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded" title="Guardar en Biblioteca">
                          <Save size={14} />
                        </button>
                        <button onClick={() => deleteLine(l.id)} className="p-1.5 text-slate-300 hover:text-red-500 rounded ml-1" title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>

                {/* CHILD LINES RENDER */}
                {isGroup && children.map((cl, clIdx) => {
                  const isChildEditing = editingLineId === cl.id;
                  const isChildGroup = cl.isGroup;
                  const isChildApu = cl.isApu;
                  
                  // Si el hijo es un APU anidado (nivel 3), su precio también debe calcularse recursivamente
                  // Para simplificar aquí, asumimos que si esApu, ya trae el unitPrice actualizado, 
                  // o podemos sumarle sus hijos si los trajimos del backend. 
                  // El backend incluye children.
                  const subChildren = cl.children || [];
                  const childBaseCost = (isChildGroup || isChildApu) && subChildren.length > 0 
                    ? subChildren.reduce((sum: any, scl: any) => sum + (scl.quantity * scl.unitPrice), 0) 
                    : cl.unitPrice;
                  const computedChildUnitPrice = isChildApu ? childBaseCost * (1 + (cl.margin || 0) / 100) : childBaseCost;

                  return (
                    <tr key={cl.id} className={`transition-colors group bg-slate-50/80 ${isChildEditing ? 'bg-primary/5' : 'hover:bg-slate-100'}`}>
                      {isChildEditing ? (
                        <>
                          <td className="py-1 px-4 text-slate-300 font-mono text-xs text-right pr-6 align-top">
                            <div className="flex items-center gap-1 justify-end">
                              <span className="text-[10px]">↳</span>
                              <input
                                type="text"
                                placeholder={`${index + 1}.${lIdx + 1}.${clIdx + 1}`}
                                className="w-16 text-[10px] font-mono text-slate-500 p-1 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white text-right"
                                value={lineForm.code || ''}
                                onChange={e => setLineForm({...lineForm, code: e.target.value})}
                              />
                            </div>
                          </td>
                          <td className="py-1 px-2 align-top pl-8">
                            <div className="flex flex-col gap-1">
                              <input
                                autoFocus
                                type="text"
                                placeholder="Título de la sub-partida..."
                                className="w-full text-xs font-bold p-1 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                                value={lineForm.title || ''} onChange={e => setLineForm({...lineForm, title: e.target.value})}
                              />
                            </div>
                          </td>
                          <td className="py-1 px-2">
                            <input type="number" className="w-full text-right text-xs p-1 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                              value={lineForm.quantity || ''} onChange={e => setLineForm({...lineForm, quantity: parseFloat(e.target.value)})} />
                          </td>
                          <td className="py-1 px-2">
                            <input type="text" className="w-full text-center text-xs p-1 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                              value={lineForm.unit || ''} onChange={e => setLineForm({...lineForm, unit: e.target.value})} />
                          </td>
                          <td className="py-1 px-2">
                            <input type="number" disabled={isChildGroup || isChildApu} className={`w-full text-right text-xs p-1 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary ${isChildGroup || isChildApu ? 'bg-slate-100 text-slate-500' : 'bg-white'}`} 
                              value={isChildGroup || isChildApu ? computedChildUnitPrice : (lineForm.unitPrice || '')} onChange={e => setLineForm({...lineForm, unitPrice: parseFloat(e.target.value)})} />
                          </td>
                          <td className="py-1 px-4 text-right font-bold text-slate-600 text-xs bg-white/50">
                            {formatCurrency((Number(lineForm.quantity) || 0) * (isChildGroup || isChildApu ? computedChildUnitPrice : (Number(lineForm.unitPrice) || 0)))}
                          </td>
                          <td className="py-1 px-2 flex gap-1 justify-end">
                            <button onClick={saveLine} className="p-1 text-green-600 hover:bg-green-100 rounded"><Check size={12} /></button>
                            <button onClick={cancelEditLine} className="p-1 text-slate-400 hover:bg-slate-200 rounded"><X size={12} /></button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-1.5 px-4 text-slate-300 font-mono text-xs text-right pr-6 cursor-text" onClick={() => startEditLine(cl, `${index + 1}.${lIdx + 1}.${clIdx + 1}`)}>↳ {cl.code || `${index + 1}.${lIdx + 1}.${clIdx + 1}`}</td>
                          <td className="py-1.5 px-4 cursor-text pl-8" onClick={() => startEditLine(cl, `${index + 1}.${lIdx + 1}.${clIdx + 1}`)}>
                            <div className="flex items-start gap-2">
                              {cl.isApu ? (
                                <div className="flex items-center gap-0.5">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setEditingApuLine(cl); }}
                                    className="mt-0.5 p-1 rounded transition-colors bg-amber-100/50 text-amber-600 hover:bg-amber-200"
                                    title="Desglose del sub-APU"
                                  >
                                    <Calculator size={12} />
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); quotationsService.updateLine(quotationId, chapter.id, cl.id, { isApu: false }).then(onUpdate); }}
                                    className="mt-0.5 p-1 rounded transition-colors text-slate-300 hover:text-red-500 hover:bg-slate-100"
                                    title="Convertir en partida manual (desvincular APU)"
                                  >
                                    <X size={10} />
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); quotationsService.updateLine(quotationId, chapter.id, cl.id, { isApu: true, isGroup: false }).then(onUpdate); }}
                                  className="mt-0.5 p-1 rounded transition-colors bg-slate-100/50 text-slate-400 hover:bg-slate-200 hover:text-amber-600"
                                  title="Convertir en APU"
                                >
                                  <Calculator size={12} />
                                </button>
                              )}
                              <div className="font-medium text-slate-600 text-xs">{cl.concept?.split('\n')[0]}</div>
                            </div>
                          </td>
                          <td className="py-1.5 px-4 text-right font-medium text-slate-600 text-xs cursor-text" onClick={() => startEditLine(cl)}>{cl.quantity}</td>
                          <td className="py-1.5 px-4 text-center text-slate-400 text-xs cursor-text" onClick={() => startEditLine(cl)}>{cl.unit || 'ud'}</td>
                          <td className="py-1.5 px-4 text-right font-medium text-slate-600 text-xs cursor-text" onClick={() => startEditLine(cl)}>{formatCurrency(computedChildUnitPrice)}</td>
                          <td className="py-1.5 px-4 text-right font-bold text-slate-600 text-xs">{formatCurrency(cl.quantity * computedChildUnitPrice)}</td>
                          <td className="py-1.5 px-2 text-right opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            <button onClick={() => deleteLine(cl.id)} className="p-1 text-slate-300 hover:text-red-500 rounded ml-1" title="Eliminar sub-partida">
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}

                {/* ADD SUB-LINE FORM / BUTTON */}
                {isGroup && !isEditing && (
                  <tr className="bg-slate-50/50">
                    <td colSpan={2} className="py-2 px-4 pl-14">
                      {(isAddingLine && lineForm.parentId === l.id) ? (
                        <div className="flex flex-col gap-1 w-full">
                          <input
                            autoFocus
                            type="text"
                            placeholder="Nueva sub-partida..."
                            className="w-full text-xs p-1 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                            value={lineForm.title || ''} onChange={e => setLineForm({...lineForm, title: e.target.value})}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => { setIsAddingLine(true); setEditingLineId(null); setLineForm({ title: '', quantity: 1, unit: 'ud', unitPrice: 0, parentId: l.id }); }}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                          >
                            <Plus size={12} /> Añadir sub-partida
                          </button>
                          <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                            <button 
                              onClick={() => { setLineForm({ parentId: l.id }); setPickerType(ResourceType.APU); }}
                              className="p-1 rounded bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                              title="Importar APU"
                            >
                              <Package size={12} />
                            </button>
                            <button 
                              onClick={() => { setLineForm({ parentId: l.id }); setPickerType(ResourceType.PARTIDA); }}
                              className="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                              title="Importar Partida"
                            >
                              <Package size={12} />
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                    {(isAddingLine && lineForm.parentId === l.id) ? (
                      <>
                        <td className="py-1 px-2">
                          <input type="number" placeholder="Cant" className="w-full text-right text-xs p-1 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                            value={lineForm.quantity || ''} onChange={e => setLineForm({...lineForm, quantity: parseFloat(e.target.value)})} />
                        </td>
                        <td className="py-1 px-2">
                          <input type="text" placeholder="Ud" className="w-full text-center text-xs p-1 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                            value={lineForm.unit || ''} onChange={e => setLineForm({...lineForm, unit: e.target.value})} />
                        </td>
                        <td className="py-1 px-2">
                          <input type="number" placeholder="Precio" className="w-full text-right text-xs p-1 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                            value={lineForm.unitPrice || ''} onChange={e => setLineForm({...lineForm, unitPrice: parseFloat(e.target.value)})} />
                        </td>
                        <td className="py-1 px-4 text-right font-bold text-slate-600 text-xs bg-white/50">
                          {formatCurrency((Number(lineForm.quantity) || 0) * (Number(lineForm.unitPrice) || 0))}
                        </td>
                        <td className="py-1 px-2 flex gap-1 justify-end">
                          <button onClick={saveLine} className="p-1 text-green-600 hover:bg-green-100 rounded"><Check size={12} /></button>
                          <button onClick={cancelEditLine} className="p-1 text-slate-400 hover:bg-slate-200 rounded"><X size={12} /></button>
                        </td>
                      </>
                    ) : (
                      <td colSpan={5}></td>
                    )}
                  </tr>
                )}
              </React.Fragment>
            );
          })}
          
          {/* Add Line Form inline (ROOT LINES) */}
          {(isAddingLine && !lineForm.parentId) && (
            <tr className="bg-primary/5">
               <td className="py-2 px-4 text-slate-400 font-mono text-xs">+</td>
               <td className="py-2 px-2 align-top">
                 <div className="flex flex-col gap-1">
                   <input
                     autoFocus
                     type="text"
                     placeholder="Título de la partida..."
                     className="w-full text-sm font-bold p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                     value={lineForm.title || ''} onChange={e => setLineForm({...lineForm, title: e.target.value})}
                   />
                   <textarea 
                     placeholder="Descripción (opcional)..."
                     className="w-full text-xs p-1.5 border border-slate-300 rounded resize-none outline-none focus:ring-1 focus:ring-primary bg-white" 
                     rows={3}
                     value={lineForm.description || ''} onChange={e => setLineForm({...lineForm, description: e.target.value})}
                   />
                 </div>
               </td>
               <td className="py-2 px-2">
                 <input type="number" placeholder="0" className="w-full text-right text-sm p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                   value={lineForm.quantity || ''} onChange={e => setLineForm({...lineForm, quantity: parseFloat(e.target.value)})} />
               </td>
               <td className="py-2 px-2">
                 <input type="text" placeholder="ud" className="w-full text-center text-sm p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                   value={lineForm.unit || ''} onChange={e => setLineForm({...lineForm, unit: e.target.value})} />
               </td>
               <td className="py-2 px-2">
                 <input type="number" placeholder="0.00" className="w-full text-right text-sm p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                   value={lineForm.unitPrice || ''} onChange={e => setLineForm({...lineForm, unitPrice: parseFloat(e.target.value)})} />
               </td>
               <td className="py-2 px-4 text-right font-bold text-slate-800 bg-white/50">
                 {formatCurrency((Number(lineForm.quantity) || 0) * (Number(lineForm.unitPrice) || 0))}
               </td>
               <td className="py-2 px-2 flex gap-1 justify-end">
                 <button onClick={saveLine} className="p-1 text-primary hover:bg-primary/10 rounded"><Check size={14} /></button>
                 <button onClick={cancelEditLine} className="p-1 text-slate-400 hover:bg-slate-200 rounded"><X size={14} /></button>
               </td>
            </tr>
          )}

          {!isAddingLine && chapter.lines.filter(l => !l.parentId).length === 0 && (
            <tr><td colSpan={7} className="py-6 text-center text-slate-400">No hay partidas en este capítulo</td></tr>
          )}
        </tbody>
      </table>

      {/* Chapter Footer */}
      <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setIsAddingLine(true); setEditingLineId(null); setLineForm({ title: '', description: '', quantity: 1, unit: 'ud', unitPrice: 0 }); }}
            className="text-sm font-bold text-primary hover:text-primary-dark flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all"
          >
            <Plus size={16} /> Añadir Partida Manual
          </button>
          <button 
            onClick={() => setPickerType(ResourceType.APU)}
            className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all"
          >
            <Package size={16} /> Importar APU
          </button>
          <button 
            onClick={() => setPickerType(ResourceType.PARTIDA)}
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all"
          >
            <Package size={16} /> Importar Partida
          </button>
        </div>
        <div className="text-sm font-medium text-slate-500 flex items-center gap-3">
          <span>{chapter.lines.filter(l => !l.parentId).length} Partidas</span>
          <span className="w-px h-4 bg-slate-300 block"></span>
          <span>SUBTOTAL CAPÍTULO: <span className="font-bold text-slate-800 ml-1 text-base">
            {formatCurrency(chapter.lines.filter(l => !l.parentId).reduce((a, l) => { const children = chapter.lines.filter(cl => cl.parentId === l.id); const up = l.isGroup ? children.reduce((sum, cl) => sum + (cl.quantity * cl.unitPrice), 0) : l.unitPrice; return a + (l.quantity * up); }, 0))}
          </span></span>
        </div>
      </div>

      {pickerType && (
        <ApuPickerModal 
          isOpen={true}
          onClose={() => setPickerType(null)}
          onSelect={handleSelectApu}
          resourceType={pickerType}
        />
      )}

      {editingApuLine && (
        <QuotationApuEditorModal
          quotationId={quotationId}
          chapterId={chapter.id}
          line={editingApuLine}
          childrenLines={chapter.lines.filter(cl => cl.parentId === editingApuLine.id)}
          onClose={() => setEditingApuLine(null)}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}
