import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, FileText, Download, Copy, Trash2, Edit2, Check, X, 
  Plus, Calendar, Box, CreditCard, Shield, MessageSquare, ExternalLink, CheckCircle, Clock, Search, GripVertical, Paperclip, UploadCloud, Eye, ChevronDown, ChevronUp, Save, FileSignature, Folder, Package
} from 'lucide-react';
import { uploadService } from '../../../services/upload.service';
import { Quotation, QuotationStatus, QuotationChapter, QuotationLine } from '../../../types/quotation';
import { quotationsService } from '../../../services/quotations.service';
import { BusinessLine } from '../../../services/business-lines.service';
import { UserResponse } from '../../../services/types';
import toast from 'react-hot-toast';
import { getStatusBadge } from './QuotationListView';

const STATUS_TRANSLATIONS: Record<string, string> = {
  DRAFT: 'Borrador',
  SENT: 'Enviada',
  PENDING_SIGNATURE: 'Pendiente Firma',
  SIGNED: 'Firmado',
  ACCEPTED: 'Aceptada',
  REJECTED: 'Rechazada',
  EXPIRED: 'Caducada',
};
import QuotationChapterEditor from './QuotationChapterEditor';
import ApuPickerModal from './ApuPickerModal';
import { Resource, ResourceType, resourcesService } from '../../../services/resources.service';
import QuotationGantt from './QuotationGantt';
import QuotationPreviewModal from './QuotationPreviewModal';
import EditQuotationModal from './EditQuotationModal';
import QuotationClauseEditor from './QuotationClauseEditor';
import { useCurrency } from '../../../hooks/useCurrency';

interface QuotationDetailViewProps {
  quotationId: string;
  onBack: () => void;
  onDeleted?: () => void;
  businessLines: BusinessLine[];
  users: UserResponse[];
  isBudget?: boolean;
  baseAmount?: number;
}

const Accordion = ({ id, title, icon, color, subtitle, children, isOpen, onToggle }: any) => {
  return (
    <div className={`mb-3 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-all ${isOpen ? 'ring-1 ring-primary/20' : 'hover:border-slate-300'}`}>
      <div 
        className="flex items-center justify-between p-4 cursor-pointer select-none"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${color}`}>
            {icon}
          </div>
          <div>
            <h3 className={`font-bold text-sm ${isOpen ? 'text-primary' : 'text-slate-800'}`}>{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <div className="text-slate-400">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 bg-slate-50/50"
          >
            <div className="p-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function QuotationDetailView({ quotationId, onBack, businessLines, users, isBudget, baseAmount }: QuotationDetailViewProps) {
  const { formatCurrency, taxRate: defaultTaxRate } = useCurrency();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeAccordion, setActiveAccordion] = useState<string>('partidas');
  const [showPreview, setShowPreview] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isImportCapituloModalOpen, setIsImportCapituloModalOpen] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureLink, setSignatureLink] = useState('');
  
  const [textFields, setTextFields] = useState({
    paymentTerms: '',
    paymentDeadline: '',
    notesTitle: '',
    notes: '',
    internalNotes: ''
  });

  const handleRequestSignature = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/quotations/${quotationId}/generate-signature-link`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Error al generar enlace');
      const data = await response.json();
      setSignatureLink(`http://localhost:3000/quote/${data.token}`);
      setShowSignatureModal(true);
      await loadData(); // Reload to update status
    } catch (err: any) {
      toast.error('Error al solicitar firma');
    }
  };

  const copySignatureLink = () => {
    navigator.clipboard.writeText(signatureLink);
    toast.success('Enlace copiado al portapapeles');
  };

  const [draggedChapterId, setDraggedChapterId] = useState<string | null>(null);
  const [dragOverChapterId, setDragOverChapterId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    try {
      setIsUploading(true);
      const url = await uploadService.uploadImage(file);
      await quotationsService.addAttachment(quotationId, {
        filename: file.name,
        url: url
      });
      toast.success('Archivo subido correctamente');
      loadData();
    } catch (error) {
      toast.error('Error al subir el archivo');
      console.error(error);
    } finally {
      setIsUploading(false);
      e.target.value = ''; // reset input
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm('¿Estás seguro de eliminar este archivo?')) return;
    try {
      await quotationsService.deleteAttachment(quotationId, attachmentId);
      toast.success('Archivo eliminado');
      loadData();
    } catch (error) {
      toast.error('Error al eliminar el archivo');
      console.error(error);
    }
  };

  const handleChapterDragStart = (e: React.DragEvent, chapterId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedChapterId(chapterId);
  };

  const handleChapterDragOver = (e: React.DragEvent, chapterId: string) => {
    e.preventDefault();
    if (draggedChapterId && draggedChapterId !== chapterId) {
      setDragOverChapterId(chapterId);
    }
  };

  const handleChapterDragEnd = async () => {
    if (draggedChapterId && dragOverChapterId && draggedChapterId !== dragOverChapterId && quotation) {
      const topLevelChapters = [...quotation.chapters].sort((a, b) => a.order - b.order);
      const draggedIdx = topLevelChapters.findIndex(c => c.id === draggedChapterId);
      const dropIdx = topLevelChapters.findIndex(c => c.id === dragOverChapterId);
      
      if (draggedIdx >= 0 && dropIdx >= 0) {
        const newChapters = [...topLevelChapters];
        const [removed] = newChapters.splice(draggedIdx, 1);
        newChapters.splice(dropIdx, 0, removed);
        
        const payload = newChapters.map((c, i) => ({ id: c.id, order: i + 1 }));
        
        // Optimistic update
        setQuotation(prev => prev ? { ...prev, chapters: newChapters.map((c, i) => ({ ...c, order: i + 1 })) } : prev);
        
        try {
          await quotationsService.reorderChapters(quotationId, payload);
          // no reload necessary unless we want to sync other things, but let's be safe
          // we can omit loadData() to avoid jitter, but we might want to do it in the background
          setTimeout(() => loadData(), 500);
        } catch (e) {
          toast.error('Error al reordenar capítulos');
          loadData();
        }
      }
    }
    setDraggedChapterId(null);
    setDragOverChapterId(null);
  };

  // Load data
  const loadData = async () => {
    try {
      const isFirstLoad = !quotation || quotation.id !== quotationId;
      if (isFirstLoad) {
        setLoading(true);
      }
      
      const data = await quotationsService.getById(quotationId);
      setQuotation(data);
      
      if (isFirstLoad) {
        setTextFields({
          paymentTerms: data.paymentTerms || '',
          paymentDeadline: data.paymentDeadline ? new Date(data.paymentDeadline).toISOString().split('T')[0] : '',
          notesTitle: data.notesTitle || '',
          notes: data.notes || '',
          internalNotes: data.internalNotes || ''
        });
      }
    } catch (err) {
      toast.error('Error al cargar la cotización');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [quotationId]);

  // Totals calculation
  const getLineTotal = (line: any, allLines: any[]) => {
    if (line.isApu || line.isGroup) {
      const children = allLines.filter(cl => cl.parentId === line.id);
      const baseCost = children.reduce((sum, cl) => sum + ((cl.quantity || 1) * (cl.unitPrice || 0)), 0);
      const computedUnitPrice = line.isApu ? baseCost * (1 + (line.margin || 0) / 100) : baseCost;
      return (line.quantity || 1) * computedUnitPrice;
    }
    return (line.quantity || 1) * (line.unitPrice || 0);
  };

  const totals = useMemo(() => {
    if (!quotation) return { subtotal: 0, tax: 0, total: 0 };
    const subtotal = quotation.chapters.reduce((acc, ch) => {
      return acc + ch.lines.filter(l => !l.parentId).reduce((a, l) => a + getLineTotal(l, ch.lines), 0);
    }, 0);
    const taxable = subtotal - (quotation.discount || 0);
    const tax = taxable * ((quotation.taxRate || defaultTaxRate) / 100);
    const total = taxable + tax;
    return { subtotal, tax, total };
  }, [quotation]);

  

  const handleStatusChange = async (newStatus: QuotationStatus) => {
    if (!quotation) return;
    try {
      const updated = await quotationsService.updateStatus(quotation.id, newStatus);
      setQuotation(updated);
      if (newStatus === QuotationStatus.SIGNED || newStatus === QuotationStatus.ACCEPTED) {
        toast.success(`Cotización marcada como ${newStatus} y Negocio actualizado.`);
      } else {
        toast.success('Estado actualizado');
      }
    } catch (err) {
      toast.error('Error al actualizar estado');
    }
  };

  const handleDelete = async () => {
    if (!quotation) return;
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta cotización? Esta acción eliminará también todos sus capítulos y partidas de forma permanente.")) {
      return;
    }
    
    try {
      setLoading(true);
      await quotationsService.delete(quotation.id);
      toast.success('Cotización eliminada exitosamente');
      if (onDeleted) {
        onDeleted();
      } else {
        onBack();
      }
    } catch (err) {
      console.error('Error al eliminar la cotización:', err);
      toast.error('Error al eliminar la cotización');
      setLoading(false);
    }
  };

  const handleImportCapitulo = async (capitulo: Resource) => {
    try {
      toast.loading('Importando capítulo...', { id: 'import-cap' });
      
      // Get the full chapter details including components
      const capResource = await resourcesService.getById(capitulo.id);
      
      // Create new chapter
      const newChapter = await quotationsService.addChapter(quotationId!, { 
        title: capitulo.name ? capitulo.name.split('\n')[0] : 'Capítulo Importado', 
        order: quotation?.chapters.length || 0 
      });
      
      // Add components as lines
      if (capResource.components && capResource.components.length > 0) {
        for (const [index, comp] of capResource.components.entries()) {
          // Si el comp.childResourceId no es nulo, significa que es una Partida de la base de datos
          // Extraer su precio de venta si está disponible
          let unitPrice = comp.unitCost;
          if (comp.childResource?.salesPrice) {
            unitPrice = comp.childResource.salesPrice;
          } else if (comp.childResource?.unitCost) {
            // Si la Partida tiene margen, calcúlalo o simplemente usa salesPrice si ya vino del backend
            unitPrice = comp.childResource.unitCost; 
          }
          
          await quotationsService.addLine(quotationId!, newChapter.id, {
            concept: comp.concept,
            unit: comp.unit || 'ud',
            quantity: comp.quantity,
            unitPrice: unitPrice,
            order: index,
            resourceId: comp.childResourceId
          });
        }
      }
      
      setIsImportCapituloModalOpen(false);
      loadData();
      toast.success('Capítulo importado con éxito', { id: 'import-cap' });
    } catch (error) {
      console.error(error);
      toast.error('Error al importar capítulo', { id: 'import-cap' });
    }
  };

  const handleDuplicate = async () => {
    if (!quotation) return;
    try {
      setLoading(true);
      await quotationsService.duplicate(quotation.id);
      toast.success('Cotización duplicada exitosamente');
      onBack(); // Return to list to see the new duplicate
    } catch (err) {
          toast.error('Error al duplicar la cotización');
      setLoading(false);
    }
  };

  const saveTextField = async (field: 'paymentTerms' | 'notes' | 'internalNotes' | 'notesTitle') => {
    try {
      let updateData: any = {};
      if (field === 'paymentTerms') {
        updateData.paymentTerms = textFields.paymentTerms;
        updateData.paymentDeadline = textFields.paymentDeadline ? new Date(textFields.paymentDeadline).toISOString() : null;
      } else if (field === 'notes') {
        updateData.notes = textFields.notes;
        updateData.notesTitle = textFields.notesTitle;
      } else {
        updateData[field] = textFields[field];
      }
      
      await quotationsService.update(quotationId, updateData);
      toast.success('Actualizado correctamente');
      loadData();
    } catch (err) {
      toast.error('Error al actualizar');
    }
  };


  if (loading || !quotation) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden rounded-2xl border border-slate-200">
      {/* Action Bar */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 flex justify-between items-center z-10 shrink-0">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-primary font-medium transition-colors">
          <ArrowLeft size={18} />
          Volver a la lista
        </button>
        <div className="flex gap-2">
          <button onClick={() => setShowEditModal(true)} className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 flex items-center gap-2">
            <Edit2 size={16} /> Editar
          </button>
          <button onClick={handleDuplicate} className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 flex items-center gap-2">
            <Copy size={16} /> Duplicar
          </button>
          <button onClick={() => setShowPreview(true)} className="px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 border border-primary/20 rounded hover:bg-primary/20 flex items-center gap-2">
            <Eye size={16} /> Vista Previa
          </button>
          {!isBudget && quotation.status !== 'SIGNED' && quotation.status !== 'ACCEPTED' && (
            <button onClick={handleRequestSignature} className="px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 flex items-center gap-2">
              <FileSignature size={16} /> Solicitar Firma
            </button>
          )}
          <button onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/quotations/${quotation.id}/pdf`, '_blank')} className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 flex items-center gap-2">
            <Download size={16} /> PDF
          </button>
          <button onClick={handleDelete} disabled={loading} className="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded hover:bg-red-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" title="Eliminar cotización">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Header Dark */}
      <div className="bg-[#001c3a] text-white p-6 shrink-0 shadow-inner">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">📋 {isBudget ? 'PRESUPUESTO DE EJECUCIÓN' : 'COTIZACIÓN - DOCUMENTO'}</h1>
            <div className="relative group">
              {isBudget ? (
                <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-1 rounded-full text-sm font-medium border border-emerald-500/30 text-emerald-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  PRESUPUESTO VIGENTE
                </div>
              ) : (
                <>
                  <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-sm font-medium transition-colors border border-white/20">
                    <span className={`w-2 h-2 rounded-full ${quotation.status === 'SIGNED' || quotation.status === 'ACCEPTED' ? 'bg-green-400' : quotation.status === 'REJECTED' ? 'bg-red-400' : 'bg-amber-400'}`}></span>
                    {STATUS_TRANSLATIONS[quotation.status] || quotation.status}
                    <ChevronDown size={14} />
                  </button>
                  {/* Dropdown status */}
                  <div className="absolute top-full mt-1 left-0 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 hidden group-hover:block z-50">
                    {Object.values(QuotationStatus).map(s => (
                      <button 
                        key={s} 
                        onClick={() => handleStatusChange(s)}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Marcar como {STATUS_TRANSLATIONS[s] || s}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <span className="text-slate-400 text-sm font-medium">VERSIÓN v{quotation.version}</span>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white mb-1">
              {formatCurrency(totals.total)}
            </div>
            <div className="text-sm text-slate-300">IVA incluido ({quotation.taxRate}%)</div>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <div className="text-lg font-mono font-bold text-blue-200 mb-1">{quotation.number}</div>
            <div className="text-lg font-medium">"{quotation.deal?.name}"</div>
          </div>
          <div className="text-sm text-slate-300 flex items-center gap-4 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
            <span>SUBTOTAL: <span className="text-white font-medium">{formatCurrency(totals.subtotal)}</span></span>
            <span className="text-white/20">|</span>
            <span>DESCUENTO: <span className="text-white font-medium">{formatCurrency(quotation.discount || 0)}</span></span>
            <span className="text-white/20">|</span>
            <span>IMPUESTOS: <span className="text-white font-medium">{formatCurrency(totals.tax)}</span></span>
          </div>
        </div>

        <div className="flex gap-4 mt-4 text-sm font-medium text-blue-200">
          <span className="flex items-center gap-1"><span className="text-white">🏢</span> {quotation.account?.name}</span>
          <span className="flex items-center gap-1"><span className="text-white">🎯</span> {quotation.deal?.probability || 0}%</span>
          <span className="flex items-center gap-1"><span className="text-white">🟣</span> {quotation.businessLine?.name || 'Sin línea'}</span>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="bg-white border-b border-slate-200 p-4 shrink-0 shadow-sm text-sm">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <span className="text-slate-500 block mb-1">Título:</span>
            <span className="font-medium text-slate-800">{quotation.title || '[Sin título]'}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">Responsable:</span>
            <span className="font-medium text-slate-800">{quotation.user?.name || 'Sin asignar'}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">Válida hasta:</span>
            <span className="font-medium text-slate-800">{quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : '—'}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">Emitida:</span>
            <span className="font-medium text-slate-800">{quotation.issuedAt ? new Date(quotation.issuedAt).toLocaleDateString() : '—'}</span>
          </div>
        </div>
      </div>

      {/* Accordions Area */}
      <div className="flex-1 overflow-auto p-4 lg:p-6 bg-slate-50">
        <div className={`mx-auto ${isBudget ? 'max-w-[95rem]' : 'max-w-5xl'}`}>
          {!isBudget && (
            <Accordion id="plan" title="Plan de obra (resumen para el cliente)" icon={<Calendar size={18} />} color="bg-pink-500" subtitle="Generado automáticamente desde las fechas de los capítulos" isOpen={activeAccordion === 'plan'} onToggle={() => setActiveAccordion(activeAccordion === 'plan' ? '' : 'plan')}>
              <QuotationGantt quotationId={quotation.id} chapters={quotation.chapters} onUpdate={loadData} />
            </Accordion>
          )}

          <Accordion id="partidas" title={`Partidas (${quotation.chapters.reduce((a, c) => a + c.lines.filter(l => !l.parentId).length, 0)})`} icon={<Box size={18} />} color="bg-blue-500" subtitle={`${quotation.chapters.length} capítulos`} isOpen={activeAccordion === 'partidas'} onToggle={() => setActiveAccordion(activeAccordion === 'partidas' ? '' : 'partidas')}>
            <div className="space-y-4">
              {quotation.chapters.map((ch, idx) => (
                <div 
                  key={ch.id}
                  draggable
                  onDragStart={(e) => handleChapterDragStart(e, ch.id)}
                  onDragOver={(e) => handleChapterDragOver(e, ch.id)}
                  onDragEnd={handleChapterDragEnd}
                  className={`transition-all ${dragOverChapterId === ch.id ? 'border-t-4 border-primary pt-1' : ''} ${draggedChapterId === ch.id ? 'opacity-50' : ''}`}
                >
                  <QuotationChapterEditor 
                    quotationId={quotation.id} 
                    chapter={ch} 
                    index={idx} 
                    onUpdate={loadData} 
                  />
                </div>
              ))}

              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setIsImportCapituloModalOpen(true)}
                  className="w-1/2 py-3 border-2 border-dashed border-amber-300 rounded-xl text-amber-600 font-medium hover:border-amber-500 hover:bg-amber-50 transition-all flex justify-center items-center gap-2"
                >
                  <Package size={18} /> Importar Capítulo de Biblioteca
                </button>
                <button 
                  onClick={async () => {
                    try {
                      await quotationsService.addChapter(quotation.id, { title: 'Nuevo Capítulo', order: quotation.chapters.length });
                      loadData();
                    } catch(e) {
                      toast.error('Error al añadir capítulo');
                    }
                  }}
                  className="w-1/2 py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium hover:border-primary hover:bg-primary/5 hover:text-primary transition-all flex justify-center items-center gap-2"
                >
                  <Plus size={18} /> Añadir Nuevo Capítulo
                </button>
              </div>
            </div>
          </Accordion>

          {!isBudget && (
            <>
              <Accordion id="condiciones" title="Condiciones de pago" icon={<CreditCard size={18} />} color="bg-indigo-500" isOpen={activeAccordion === 'condiciones'} onToggle={() => setActiveAccordion(activeAccordion === 'condiciones' ? '' : 'condiciones')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Formato de Pago</label>
                    <textarea 
                      className="w-full p-4 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm min-h-[100px]"
                      placeholder="Ej. Transferencia bancaria, Confirming, etc."
                      value={textFields.paymentTerms}
                      onChange={(e) => setTextFields(prev => ({ ...prev, paymentTerms: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Plazo Límite de Pago (Fecha)</label>
                    <input 
                      type="date"
                      className="w-full p-4 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm"
                      value={textFields.paymentDeadline}
                      onChange={(e) => setTextFields(prev => ({ ...prev, paymentDeadline: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <button onClick={() => saveTextField('paymentTerms')} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-all active:scale-95 shadow-sm">Guardar Condiciones</button>
                </div>
              </Accordion>

              <Accordion id="clausulas" title={`Cláusulas (${quotation.clauses.length})`} icon={<Shield size={18} />} color="bg-red-400" isOpen={activeAccordion === 'clausulas'} onToggle={() => setActiveAccordion(activeAccordion === 'clausulas' ? '' : 'clausulas')}>
                <QuotationClauseEditor quotation={quotation} onUpdate={loadData} />
              </Accordion>

              <Accordion id="notasCliente" title="Notas para el cliente" icon={<FileText size={18} />} color="bg-fuchsia-500" isOpen={activeAccordion === 'notasCliente'} onToggle={() => setActiveAccordion(activeAccordion === 'notasCliente' ? '' : 'notasCliente')}>
                <input
                  type="text"
                  className="w-full p-3 mb-3 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-bold text-primary placeholder-slate-400"
                  placeholder="Título o encabezado de la nota (ej. Nota Importante, Condiciones Comerciales...)"
                  value={textFields.notesTitle}
                  onChange={(e) => setTextFields(prev => ({ ...prev, notesTitle: e.target.value }))}
                />
                <textarea 
                  className="w-full p-4 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm min-h-[100px]"
                  placeholder="Notas visibles para el cliente..."
                  value={textFields.notes}
                  onChange={(e) => setTextFields(prev => ({ ...prev, notes: e.target.value }))}
                />
                <div className="flex justify-end mt-2">
                  <button onClick={() => saveTextField('notes')} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-all active:scale-95 shadow-sm">Guardar Notas</button>
                </div>
              </Accordion>

              <Accordion id="notasInternas" title="Notas internas" icon={<MessageSquare size={18} />} color="bg-slate-500" isOpen={activeAccordion === 'notasInternas'} onToggle={() => setActiveAccordion(activeAccordion === 'notasInternas' ? '' : 'notasInternas')}>
                <textarea 
                  className="w-full p-4 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm min-h-[100px] bg-yellow-50"
                  placeholder="Notas internas (no visibles en el PDF)..."
                  value={textFields.internalNotes}
                  onChange={(e) => setTextFields(prev => ({ ...prev, internalNotes: e.target.value }))}
                />
                <div className="flex justify-end mt-2">
                  <button onClick={() => saveTextField('internalNotes')} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-all active:scale-95 shadow-sm">Guardar Notas Internas</button>
                </div>
              </Accordion>

              <Accordion id="archivos" title={`Archivos adjuntos (${quotation.attachments.length})`} icon={<Paperclip size={18} />} color="bg-orange-500" isOpen={activeAccordion === 'archivos'} onToggle={() => setActiveAccordion(activeAccordion === 'archivos' ? '' : 'archivos')}>
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <label className={`flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      {isUploading ? <span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span> : <UploadCloud size={18} />}
                      <span>{isUploading ? 'Subiendo...' : 'Subir archivo'}</span>
                      <input type="file" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>

                  {quotation.attachments.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                      <Paperclip className="mx-auto text-slate-400 mb-2" size={24} />
                      <p>No hay archivos adjuntos</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {quotation.attachments.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:shadow-md transition-shadow bg-white">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center shrink-0">
                              <Paperclip size={20} />
                            </div>
                            <div className="truncate">
                              <p className="font-medium text-slate-800 truncate" title={file.filename}>{file.filename}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Eye size={18} />
                            </a>
                            <button onClick={() => handleDeleteAttachment(file.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Accordion>

              {/* Signature Data */}
              {(quotation.status === 'SIGNED' || quotation.status === 'ACCEPTED') && quotation.clientSignature && (
                <Accordion id="firma" title="Firma del Cliente" icon={<FileSignature size={18} />} color="bg-emerald-500" isOpen={activeAccordion === 'firma'} onToggle={() => setActiveAccordion(activeAccordion === 'firma' ? '' : 'firma')}>
                  <div className="flex gap-8 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="w-64 bg-white p-4 rounded-lg border border-slate-200">
                      <img src={quotation.clientSignature} alt="Firma" className="w-full h-auto" onError={(e) => { e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='50'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%2394a3b8' font-style='italic'>Firma archivada</text></svg>"; e.currentTarget.className = "w-full h-auto opacity-50"; }} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg mb-1">{quotation.clientSignatoryName}</h4>
                      <p className="text-sm text-slate-600 mb-1"><span className="font-medium text-slate-700">DNI/NIF:</span> {quotation.clientSignatoryDni}</p>
                      <p className="text-sm text-slate-600"><span className="font-medium text-slate-700">Fecha de firma:</span> {new Date(quotation.signedAt!).toLocaleString()}</p>
                    </div>
                  </div>
                </Accordion>
              )}
            </>
          )}
        </div>
        
        {/* Resumen de Presupuesto / Certificaciones */}
        {isBudget && (
          <div className="mt-8 mx-auto max-w-[95rem]">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Resumen por Capítulos</h3>
              <div className="space-y-3 mb-6">
                {quotation.chapters.map(ch => {
                  const chTotal = ch.lines.filter(l => !l.parentId).reduce((a, l) => a + getLineTotal(l, ch.lines), 0);
                  const isExtra = ch.title.toLowerCase().includes('extra') || ch.title.toLowerCase().includes('no contemplada');
                  return (
                    <div key={ch.id} className="flex justify-between items-center text-sm">
                      <div className={`font-medium flex items-center gap-2 ${isExtra ? 'text-[#002D5A]' : 'text-slate-700'}`}>
                        {isExtra && <span className="text-[#002D5A]">✨</span>}
                        {ch.title} {isExtra && <span className="text-xs text-slate-400 font-normal">(EXTRA)</span>}
                      </div>
                      <div className="text-slate-600">{formatCurrency(chTotal)}</div>
                    </div>
                  );
                })}
              </div>
              
              {(() => {
                const originalAmount = baseAmount || totals.subtotal;
                const subtotal = totals.subtotal;
                const extras = subtotal - originalAmount;
                const deviation = originalAmount > 0 ? (extras / originalAmount) * 100 : 0;
                
                return (
                  <div className="border-t border-slate-100 pt-6">
                    <div className="max-w-md ml-auto space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Presupuesto contratado original</span>
                        <span className="font-medium text-slate-800">{formatCurrency(originalAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                        <span className="text-slate-600 flex items-center gap-1">✨ Partidas extras</span>
                        <span className={`font-medium ${extras >= 0 ? 'text-blue-600' : 'text-emerald-600'}`}>
                          {extras > 0 ? '+' : ''}{formatCurrency(extras)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-base pt-1">
                        <span className="font-bold text-slate-800">Subtotal vigente (sin IVA)</span>
                        <span className="font-bold text-slate-800">{formatCurrency(totals.subtotal)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs pb-2">
                        <span className="text-slate-400">Desviación sobre presupuesto inicial</span>
                        <span className="text-slate-400">+{deviation.toFixed(1)}%</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
                        <span className="text-slate-500">Impuestos (IVA {quotation.taxRate}%)</span>
                        <span className="font-medium text-slate-700">{formatCurrency(totals.tax)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 mt-2 border-t border-slate-200">
                        <span className="font-bold text-slate-800 text-lg">Total presupuesto vigente (con IVA)</span>
                        <span className="font-black text-slate-900 text-xl">{formatCurrency(totals.total)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
        
        {/* Espacio para que no lo tape la barra flotante */}
        <div className="h-24"></div>
      </div>

      {/* Sticky Bottom Totals Bar */}
      <div className="bg-white border-t border-slate-200 p-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 sticky bottom-0">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex gap-6 text-sm font-medium text-slate-600">
            <span>Capítulos: <span className="text-slate-800">{quotation.chapters.length}</span></span>
            <span>APUs: <span className="text-slate-800">{quotation.chapters.reduce((a, c) => a + c.lines.length, 0)}</span></span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-slate-500">Subtotal</div>
              <div className="font-bold text-slate-700">{formatCurrency(totals.subtotal)}</div>
            </div>
            <div className="text-slate-300">+</div>
            <div className="text-right">
              <div className="text-xs text-slate-500">IVA ({quotation.taxRate}%)</div>
              <div className="font-bold text-slate-700">{formatCurrency(totals.tax)}</div>
            </div>
            <div className="text-slate-300">=</div>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-800 mb-0.5">TOTAL</div>
              <div className="text-xl font-black text-primary">{formatCurrency(totals.total)}</div>
            </div>
            <button className="ml-4 px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-all active:scale-95 shadow-md hover:shadow-lg flex items-center gap-2">
              <Save size={18} />
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {isImportCapituloModalOpen && (
          <ApuPickerModal
            isOpen={isImportCapituloModalOpen}
            onClose={() => setIsImportCapituloModalOpen(false)}
            onSelect={handleImportCapitulo}
            resourceType={ResourceType.CAPITULO}
            title="Importar Capítulo de Biblioteca"
          />
        )}
        {showPreview && (
          <QuotationPreviewModal quotation={quotation} onClose={() => setShowPreview(false)} />
        )}
        {showEditModal && (
          <EditQuotationModal 
            quotation={quotation} 
            users={users}
            businessLines={businessLines}
            onClose={() => setShowEditModal(false)} 
            onSuccess={() => {
              setShowEditModal(false);
              loadData();
            }} 
          />
        )}
        {showSignatureModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowSignatureModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-800">Enlace de Firma Generado</h3>
                <button onClick={() => setShowSignatureModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Comparte este enlace con el cliente para que pueda revisar y firmar la propuesta digitalmente.
              </p>
              <div className="flex items-center gap-2 mb-6">
                <input type="text" readOnly value={signatureLink} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none" />
                <button onClick={copySignatureLink} className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                  <Copy size={16} />
                </button>
              </div>
              <div className="flex justify-end">
                <button onClick={() => setShowSignatureModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors">
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
