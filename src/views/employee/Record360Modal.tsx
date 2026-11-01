import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Building2,
  Users,
  Briefcase,
  FileText,
  Calendar,
  ChevronDown,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { accountsService, contactsService } from '../../services/crm.service';

export interface Record360Focus {
  type: 'account' | 'contact' | 'deal' | 'activity' | 'quotation';
  id: string;
  accountId?: string;
}

interface Record360ModalProps {
  focus: Record360Focus | null;
  onClose: () => void;
  onNavigate: (type: 'account' | 'contact' | 'deal' | 'quotation' | 'activity', id: string) => void;
}

const parseDateSafe = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null;
  if (dateStr.includes('T')) return new Date(dateStr);
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }
  return new Date(dateStr);
};

export default function Record360Modal({ focus, onClose, onNavigate }: Record360ModalProps) {
  const [data, setData] = useState<any>(null);
  const [contactDetails, setContactDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    if (focus) {
      loadData(focus.accountId, focus.type === 'contact' ? focus.id : undefined);
      
      // Auto-open the relevant section based on focus type
      switch (focus.type) {
        case 'account': setOpenSection('account'); break;
        case 'contact': setOpenSection('contact'); break;
        case 'deal': setOpenSection('deals'); break;
        case 'quotation': setOpenSection('quotations'); break;
        case 'activity': setOpenSection('activities'); break;
      }
    } else {
      setData(null);
      setContactDetails(null);
    }
  }, [focus]);

  const loadData = async (accountId?: string, contactId?: string) => {
    try {
      setIsLoading(true);
      let accData = null;
      if (accountId) {
        accData = await accountsService.get360(accountId);
        setData(accData);
      }
      if (contactId) {
        try {
          const cResult = await contactsService.getById(contactId);
          setContactDetails(cResult);
          // Si no teníamos accountId o no se cargó la cuenta, cargamos la 360 con el accountId del contacto
          if (!accData && cResult?.accountId) {
            const fallbackAccData = await accountsService.get360(cResult.accountId);
            setData(fallbackAccData);
          }
        } catch (e) {
          console.warn('Could not fetch extra contact details:', e);
        }
      }
    } catch (error) {
      console.error('Error loading 360 data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!focus) return null;

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  // Helper to extract all quotations across the account and deals (evitando duplicados)
  const allQuotations = Array.from(
    new Map(
      [...(data?.quotations || []), ...(data?.deals?.flatMap((d: any) => d.quotations) || [])]
        .filter(Boolean)
        .map(q => [q.id, q])
    ).values()
  ) as any[];

  // Helper to extract all activities
  const allActivities = [
    ...(data?.activities || []),
    ...(data?.deals?.flatMap((d: any) => d.activities) || [])
  ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Contacto en foco (si aplica)
  const targetContact = contactDetails || data?.contacts?.find((c: any) => c.id === focus.id);

  // Lógica de Filtrado Inteligente
  let filteredContacts = data?.contacts || [];
  let filteredDeals = data?.deals || [];
  let filteredQuotations = allQuotations;
  let filteredActivities = allActivities;

  if (focus?.type === 'contact') {
    // 1. Mostrar ÚNICAMENTE el contacto en específico
    filteredContacts = (data?.contacts || []).filter((c: any) => c.id === focus.id);
    if (filteredContacts.length === 0 && targetContact) {
      filteredContacts = [targetContact];
    }

    // 2. Mostrar ÚNICAMENTE los negocios de este contacto
    filteredDeals = (data?.deals || []).filter((d: any) => d.contactId === focus.id);

    // 3. Mostrar ÚNICAMENTE cotizaciones de este contacto o de sus negocios
    const contactDealIds = new Set(filteredDeals.map((d: any) => d.id));
    filteredQuotations = allQuotations.filter((q: any) => 
      q.contactId === focus.id || 
      q.contact?.id === focus.id || 
      (q.dealId && contactDealIds.has(q.dealId))
    );

    // 4. Mostrar ÚNICAMENTE actividades de este contacto
    filteredActivities = allActivities.filter((a: any) => a.contactId === focus.id);

  } else if (focus?.type === 'deal') {
    filteredQuotations = allQuotations.filter((q: any) => q.dealId === focus.id);
    filteredActivities = allActivities.filter((a: any) => a.dealId === focus.id);
  } else if (focus?.type === 'quotation') {
    const targetQuotation = allQuotations.find((q: any) => q.id === focus.id);
    if (targetQuotation?.dealId) {
      filteredDeals = data?.deals?.filter((d: any) => d.id === targetQuotation.dealId) || [];
      filteredActivities = allActivities.filter((a: any) => a.dealId === targetQuotation.dealId);
    }
  } else if (focus?.type === 'activity') {
    const targetActivity = allActivities.find((a: any) => a.id === focus.id);
    if (targetActivity) {
      // Si la actividad tiene un padre, el ID raíz de la familia es el de su padre. Si no, es ella misma.
      const familyParentId = targetActivity.parentActivityId || targetActivity.id;
      
      // Mostramos el padre y todos los hijos que compartan ese parentActivityId
      filteredActivities = allActivities.filter((a: any) => 
        a.id === familyParentId || a.parentActivityId === familyParentId
      );

      // Filtramos los contactos asociados a esta familia de actividades (padre, objetivo y hermanos)
      const activityContactIds = new Set(filteredActivities.map((a: any) => a.contactId).filter(Boolean));
      filteredContacts = (data?.contacts || []).filter((c: any) => activityContactIds.has(c.id));

      // Si la actividad está ligada a un negocio, filtramos ese negocio y sus cotizaciones
      if (targetActivity.dealId) {
        filteredDeals = data?.deals?.filter((d: any) => d.id === targetActivity.dealId) || [];
        filteredQuotations = allQuotations.filter((q: any) => q.dealId === targetActivity.dealId);
      } else {
        // Si no está ligada a un negocio, no mostramos negocios ni cotizaciones para esta vista específica
        filteredDeals = [];
        filteredQuotations = [];
      }
    } else {
      filteredActivities = allActivities.filter((a: any) => a.id === focus.id);
      const activityContactIds = new Set(filteredActivities.map((a: any) => a.contactId).filter(Boolean));
      filteredContacts = (data?.contacts || []).filter((c: any) => activityContactIds.has(c.id));
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200/50 bg-gradient-to-r from-[#001c3a] to-[#002e5c] text-white">
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                {focus.type === 'contact' ? (
                  <Users size={28} className="text-blue-400" />
                ) : (
                  <Building2 size={28} className="text-emerald-400" />
                )}
                {focus.type === 'contact' ? 'Visión 360º del Contacto' : 'Visión 360º'}
              </h2>
              <p className="text-white/70 text-sm mt-1">
                {focus.type === 'contact'
                  ? `Trazabilidad individual de ${targetContact?.name || 'Contacto'}${data?.name ? ` • Empresa: ${data.name}` : ''}`
                  : `Trazabilidad completa ${data?.name ? `de ${data.name}` : ''}`
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors backdrop-blur-sm"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-[#001c3a] rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">Analizando ecosistema...</p>
              </div>
            ) : !data && !targetContact ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Building2 size={48} className="mb-4 opacity-20" />
                <p>No se encontró información</p>
              </div>
            ) : (
              <>
                {/* 1. FICHA ESPECÍFICA DEL CONTACTO (Solo si el foco es un contacto) */}
                {focus.type === 'contact' && targetContact && (
                  <SectionStatic
                    title="Ficha del Contacto"
                    icon={<Users size={20} />}
                  >
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-[#001c3a] text-white flex items-center justify-center font-bold text-lg shadow">
                            {(targetContact.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-bold text-slate-900">{targetContact.name}</h3>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                Contacto Específico
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 font-medium mt-0.5">
                              {targetContact.position || 'Sin cargo'} 
                              {data?.name && (
                                <span className="text-slate-400"> • Empresa: <strong className="text-slate-700">{data.name}</strong></span>
                              )}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onNavigate('contact', targetContact.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#001c3a]/5 hover:bg-[#001c3a] text-[#001c3a] hover:text-white font-semibold rounded-xl transition-all shadow-sm"
                        >
                          Ver Contacto en CRM <ArrowRight size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                        {targetContact.email && (
                          <a
                            href={`mailto:${targetContact.email}`}
                            className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl hover:bg-blue-50/70 hover:text-blue-700 transition-colors"
                          >
                            <Mail size={18} className="text-slate-400 shrink-0" />
                            <span className="text-sm font-medium truncate">{targetContact.email}</span>
                          </a>
                        )}
                        {targetContact.phone && (
                          <a
                            href={`tel:${targetContact.phone}`}
                            className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl hover:bg-blue-50/70 hover:text-blue-700 transition-colors"
                          >
                            <Phone size={18} className="text-slate-400 shrink-0" />
                            <span className="text-sm font-medium">{targetContact.phone}</span>
                          </a>
                        )}
                        {data?.name && (
                          <div
                            onClick={() => onNavigate('account', data.id)}
                            className="flex items-center justify-between text-slate-600 bg-slate-50 p-3 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
                            title="Ir a la ficha de la empresa"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Building2 size={18} className="text-slate-400 shrink-0" />
                              <span className="text-sm font-medium truncate">{data.name}</span>
                            </div>
                            <ArrowRight size={14} className="text-slate-400 shrink-0" />
                          </div>
                        )}
                      </div>

                      {targetContact.notes && (
                        <div className="mt-4 p-3.5 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                          <span className="font-bold text-slate-700 block mb-1">Notas del contacto:</span>
                          {targetContact.notes}
                        </div>
                      )}
                    </div>
                  </SectionStatic>
                )}

                {/* 1. DATOS DE LA EMPRESA (Solo si el foco es una empresa) */}
                {focus.type !== 'contact' && data && (
                  <>
                    <SectionStatic
                      title="Datos de la Empresa"
                      icon={<Building2 size={20} />}
                    >
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-slate-800">{data.name}</h3>
                            {data.sector && <span className="inline-block mt-1 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">{data.sector}</span>}
                          </div>
                          <button
                            onClick={() => onNavigate('account', data.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#001c3a]/5 text-[#001c3a] font-semibold rounded-xl hover:bg-[#001c3a]/10 transition-colors"
                          >
                            Ver Empresa <ArrowRight size={16} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                          {data.cif && (
                            <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                              <FileText size={18} className="text-slate-400" />
                              <span className="text-sm font-medium">{data.cif}</span>
                            </div>
                          )}
                          {data.email && (
                            <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                              <Mail size={18} className="text-slate-400" />
                              <span className="text-sm font-medium truncate">{data.email}</span>
                            </div>
                          )}
                          {data.phone && (
                            <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                              <Phone size={18} className="text-slate-400" />
                              <span className="text-sm font-medium">{data.phone}</span>
                            </div>
                          )}
                          {data.city && (
                            <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                              <MapPin size={18} className="text-slate-400" />
                              <span className="text-sm font-medium">{data.city}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </SectionStatic>

                    {/* 2. Contactos Asociados a la Empresa */}
                    <SectionStatic
                      title="Contactos Asociados"
                      icon={<Users size={20} />}
                      count={filteredContacts.length}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredContacts.map((contact: any) => (
                          <div 
                            key={contact.id} 
                            onClick={() => onNavigate('contact', contact.id)}
                            className="p-4 rounded-2xl border transition-all cursor-pointer group bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-blue-300 hover:bg-slate-50/60"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{contact.name}</h4>
                                <p className="text-xs text-slate-500 font-medium">{contact.position || 'Sin cargo'}</p>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigate('contact', contact.id);
                                }}
                                title="Ir a este contacto en CRM"
                                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-500 bg-slate-50 group-hover:text-blue-700 group-hover:bg-blue-50 rounded-xl border border-slate-200/60 group-hover:border-blue-200 transition-all"
                              >
                                <span>Ver contacto</span>
                                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                              </button>
                            </div>
                            <div className="space-y-1.5 mt-3">
                              {contact.email && (
                                <a
                                  href={`mailto:${contact.email}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-2 text-xs text-slate-600 hover:text-blue-600 hover:underline transition-colors w-fit"
                                  title={contact.email}
                                >
                                  <Mail size={14} className="text-slate-400 shrink-0" /> <span className="truncate">{contact.email}</span>
                                </a>
                              )}
                              {contact.phone && (
                                <a
                                  href={`tel:${contact.phone}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-2 text-xs text-slate-600 hover:text-blue-600 hover:underline transition-colors w-fit"
                                  title={contact.phone}
                                >
                                  <Phone size={14} className="text-slate-400 shrink-0" /> {contact.phone}
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                        {filteredContacts.length === 0 && (
                          <div className="col-span-full p-6 text-center text-slate-400 bg-white rounded-2xl border border-slate-100 border-dashed">
                            No hay contactos asociados
                          </div>
                        )}
                      </div>
                    </SectionStatic>
                  </>
                )}

                {/* Negocios */}
                <SectionStatic
                  title={focus.type === 'contact' ? "Negocios de este Contacto" : "Negocios"}
                  icon={<Briefcase size={20} />}
                  count={filteredDeals.length}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredDeals.map((deal: any) => (
                      <div 
                        key={deal.id} 
                        onClick={() => onNavigate('deal', deal.id)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer group ${
                          focus.id === deal.id 
                            ? 'bg-emerald-50/50 border-emerald-200 shadow-md ring-2 ring-emerald-500/20' 
                            : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-slate-800 text-lg group-hover:text-emerald-700 transition-colors">{deal.name}</h4>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigate('deal', deal.id);
                            }}
                            title="Ir a este negocio en CRM"
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-500 bg-slate-50 group-hover:text-emerald-700 group-hover:bg-emerald-50 rounded-xl border border-slate-200/60 group-hover:border-emerald-200 transition-all"
                          >
                            <span>Ver negocio</span>
                            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg uppercase tracking-wide">
                            {deal.stage}
                          </span>
                          <span className="font-bold text-[#001c3a]">
                            {deal.amount ? `${deal.amount.toLocaleString('es-ES')} €` : 'Sin importe'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {filteredDeals.length === 0 && (
                      <div className="col-span-full p-6 text-center text-slate-400 bg-white rounded-2xl border border-slate-100 border-dashed">
                        {focus.type === 'contact' ? 'No hay negocios registrados para este contacto' : 'No hay negocios registrados'}
                      </div>
                    )}
                  </div>
                </SectionStatic>

                {/* Cotizaciones */}
                <SectionAccordion
                  title={focus.type === 'contact' ? "Cotizaciones de este Contacto" : "Cotizaciones"}
                  icon={<FileText size={20} />}
                  isOpen={openSection === 'quotations' || focus.type === 'quotation' || focus.type === 'contact'}
                  onToggle={() => toggleSection('quotations')}
                  count={filteredQuotations.length}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredQuotations.map((quotation: any) => (
                      <div 
                        key={quotation.id} 
                        onClick={() => onNavigate('quotation', quotation.id)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer group ${
                          focus.id === quotation.id 
                            ? 'bg-amber-50/50 border-amber-200 shadow-md ring-2 ring-amber-500/20' 
                            : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-amber-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-slate-800 text-lg group-hover:text-amber-700 transition-colors">{quotation.number}</h4>
                            {quotation.title && <p className="text-xs text-slate-500 font-medium mt-0.5">{quotation.title}</p>}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigate('quotation', quotation.id);
                            }}
                            title="Ir a esta cotización en CRM"
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-500 bg-slate-50 group-hover:text-amber-700 group-hover:bg-amber-50 rounded-xl border border-slate-200/60 group-hover:border-amber-200 transition-all"
                          >
                            <span>Ver cotización</span>
                            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wide ${getStatusColor(quotation.status)}`}>
                            {quotation.status}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {new Date(quotation.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    {filteredQuotations.length === 0 && (
                      <div className="col-span-full p-6 text-center text-slate-400 bg-white rounded-2xl border border-slate-100 border-dashed">
                        {focus.type === 'contact' ? 'No hay cotizaciones emitidas para este contacto' : 'No hay cotizaciones emitidas'}
                      </div>
                    )}
                  </div>
                </SectionAccordion>

                {/* Historial de Actividades */}
                <SectionAccordion
                  title={focus.type === 'contact' ? "Historial de Actividades de este Contacto" : "Historial de Actividades"}
                  icon={<Calendar size={20} />}
                  isOpen={openSection === 'activities' || focus.type === 'activity' || focus.type === 'contact' || focus.type === 'deal' || focus.type === 'quotation'}
                  onToggle={() => toggleSection('activities')}
                  count={filteredActivities.length}
                >
                  <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {filteredActivities.map((activity: any, idx: number) => {
                      const isCompleted = !!(activity.completedAt || activity.status === 'COMPLETED');
                      
                      // Determinar estado de la fecha planificada
                      let timeStatus: 'overdue' | 'today' | 'future' | 'none' = 'none';
                      let plannedDateObj: Date | null = null;
                      if (activity.plannedDate) {
                        plannedDateObj = parseDateSafe(activity.plannedDate);
                        if (plannedDateObj && !isNaN(plannedDateObj.getTime())) {
                          const now = new Date();
                          const today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                          const today1 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();
                          const t = plannedDateObj.getTime();
                          if (t < today0) timeStatus = 'overdue';
                          else if (t <= today1) timeStatus = 'today';
                          else timeStatus = 'future';
                        }
                      }

                      // Dot color
                      const dotBg = focus.id === activity.id
                        ? 'bg-[#001c3a] border-white text-white'
                        : isCompleted
                        ? 'bg-emerald-500 border-white text-white'
                        : timeStatus === 'overdue'
                        ? 'bg-red-500 border-white text-white'
                        : timeStatus === 'today'
                        ? 'bg-blue-500 border-white text-white'
                        : 'bg-slate-100 border-white text-slate-500';

                      return (
                        <div key={activity.id} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active ${focus.id === activity.id ? 'z-10' : ''}`}>
                          {/* Timeline dot */}
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${dotBg}`}>
                            {isCompleted ? <CheckCircle size={16} /> : timeStatus === 'overdue' ? <AlertCircle size={16} /> : <Calendar size={16} />}
                          </div>
                          
                          {/* Card */}
                          <div 
                            onClick={() => onNavigate('activity', activity.id)}
                            className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border transition-all cursor-pointer group/act ${
                              focus.id === activity.id 
                                ? 'bg-blue-50/80 border-blue-200 shadow-md ring-2 ring-blue-500/20' 
                                : isCompleted
                                ? 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-300'
                                : timeStatus === 'overdue'
                                ? 'bg-red-50/20 border-red-100 shadow-sm hover:shadow-md hover:border-red-300'
                                : timeStatus === 'today'
                                ? 'bg-blue-50/20 border-blue-100 shadow-sm hover:shadow-md hover:border-blue-300'
                                : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-blue-300'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`font-bold text-sm ${focus.id === activity.id ? 'text-[#001c3a]' : 'text-slate-800 group-hover/act:text-blue-700'}`}>{activity.subject}</h4>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigate('activity', activity.id);
                                }}
                                className="p-1 text-slate-400 group-hover/act:text-[#001c3a] group-hover/act:bg-slate-100 rounded-lg transition-colors ml-2"
                              >
                                <ArrowRight size={14} />
                              </button>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mb-2 mt-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                                {activity.activityType}
                              </span>
                              {activity.result && (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                                  {activity.result}
                                </span>
                              )}
                              {!isCompleted && timeStatus === 'overdue' && (
                                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-red-100 text-red-700 rounded-md border border-red-200">
                                  Vencida
                                </span>
                              )}
                              {!isCompleted && timeStatus === 'today' && (
                                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md border border-blue-200">
                                  Para Hoy
                                </span>
                              )}
                              {isCompleted && (
                                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md border border-emerald-300">
                                  Completada
                                </span>
                              )}
                            </div>
                            {activity.notes && (
                              <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-lg mt-2 border border-slate-100 leading-relaxed">{activity.notes}</p>
                            )}

                            {/* Fechas de Creación, Planificación y Completada */}
                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                              {/* Fecha de Creación */}
                              <div className="inline-flex items-center gap-1.5 text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/70" title="Fecha de Creación">
                                <Clock size={12} className="text-slate-400 shrink-0" />
                                <span>Creada: <strong className="text-slate-700 font-semibold">{new Date(activity.createdAt).toLocaleDateString()}</strong></span>
                              </div>

                              {/* Fecha de Planificación (si existe) */}
                              {plannedDateObj && (
                                isCompleted ? (
                                  <div className="inline-flex items-center gap-1.5 text-slate-600 font-medium bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/70" title="Fecha Planificada original">
                                    <Calendar size={12} className="text-slate-400 shrink-0" />
                                    <span>Planeada: <strong className="text-slate-700 font-semibold">{plannedDateObj.toLocaleDateString()}</strong></span>
                                  </div>
                                ) : timeStatus === 'overdue' ? (
                                  <div className="inline-flex items-center gap-1.5 text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded-md border border-red-200" title="Actividad Vencida">
                                    <Calendar size={12} className="text-red-500 shrink-0" />
                                    <span>Vencida: <strong className="font-bold">{plannedDateObj.toLocaleDateString()}</strong></span>
                                  </div>
                                ) : timeStatus === 'today' ? (
                                  <div className="inline-flex items-center gap-1.5 text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200" title="Actividad para Hoy">
                                    <Calendar size={12} className="text-blue-500 shrink-0" />
                                    <span>Para Hoy: <strong className="font-bold">{plannedDateObj.toLocaleDateString()}</strong></span>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1.5 text-slate-600 font-medium bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/70" title="Fecha Planificada">
                                    <Calendar size={12} className="text-slate-400 shrink-0" />
                                    <span>Planeada: <strong className="text-slate-700 font-semibold">{plannedDateObj.toLocaleDateString()}</strong></span>
                                  </div>
                                )
                              )}

                              {/* Fecha de Completada (en caso de que fue completada) */}
                              {isCompleted && (
                                <div className="inline-flex items-center gap-1.5 text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-300" title="Fecha en que fue completada">
                                  <CheckCircle size={12} className="text-emerald-600 shrink-0" />
                                  <span>Completada: <strong className="font-bold">{(activity.completedAt && parseDateSafe(activity.completedAt)?.toLocaleDateString()) || new Date(activity.updatedAt || activity.createdAt).toLocaleDateString()}</strong></span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {filteredActivities.length === 0 && (
                      <div className="p-6 text-center text-slate-400 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-100 border-dashed relative z-10">
                        {focus.type === 'contact' ? 'No hay actividades registradas para este contacto' : 'No hay actividades registradas'}
                      </div>
                    )}
                  </div>
                </SectionAccordion>

                {/* Empresa Asociada (si estamos en foco contacto) */}
                {focus.type === 'contact' && data && (
                  <SectionAccordion
                    title={`Empresa Asociada: ${data.name}`}
                    icon={<Building2 size={20} />}
                    isOpen={openSection === 'account'}
                    onToggle={() => toggleSection('account')}
                  >
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <div className="flex flex-wrap justify-between items-center gap-3">
                        <div>
                          <h4 className="text-lg font-bold text-slate-800">{data.name}</h4>
                          {data.sector && <span className="text-xs text-slate-500 font-medium">Sector: {data.sector}</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => onNavigate('account', data.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#001c3a]/5 hover:bg-[#001c3a] text-[#001c3a] hover:text-white rounded-xl text-xs font-semibold transition-all"
                        >
                          Ver Empresa en CRM <ArrowRight size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-600 pt-2 border-t border-slate-100">
                        {data.cif && <div><span className="text-slate-400 text-xs block">CIF:</span> {data.cif}</div>}
                        {data.email && <div><span className="text-slate-400 text-xs block">Email:</span> {data.email}</div>}
                        {data.phone && <div><span className="text-slate-400 text-xs block">Teléfono:</span> {data.phone}</div>}
                        {data.city && <div><span className="text-slate-400 text-xs block">Ciudad:</span> {data.city}</div>}
                      </div>
                    </div>
                  </SectionAccordion>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── COMPONENTE SECCIÓN ESTÁTICA ──────────────────────────────────
function SectionStatic({ title, icon, count, children }: any) {
  return (
    <div className="border bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden">
      <div className="w-full flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
            {icon}
          </div>
          <h3 className="font-bold text-lg text-slate-800">
            {title}
          </h3>
          {count !== undefined && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
              {count}
            </span>
          )}
        </div>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

// ─── COMPONENTE ACORDEÓN ─────────────────────────────────────────
function SectionAccordion({ title, icon, isOpen, onToggle, count, children }: any) {
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'bg-slate-50/50 border-[#001c3a]/20 shadow-md' : 'bg-white border-slate-200 hover:border-[#001c3a]/30 shadow-sm'}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl transition-colors ${isOpen ? 'bg-[#001c3a] text-white' : 'bg-slate-100 text-slate-600'}`}>
            {icon}
          </div>
          <h3 className={`font-bold text-lg ${isOpen ? 'text-[#001c3a]' : 'text-slate-800'}`}>
            {title}
          </h3>
          {count !== undefined && (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${isOpen ? 'bg-[#001c3a]/10 text-[#001c3a]' : 'bg-slate-100 text-slate-500'}`}>
              {count}
            </span>
          )}
        </div>
        <ChevronDown 
          className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          size={20} 
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────
function getStatusColor(status: string) {
  switch (status) {
    case 'DRAFT': return 'bg-slate-100 text-slate-600';
    case 'SENT': return 'bg-blue-100 text-blue-700';
    case 'ACCEPTED': return 'bg-emerald-100 text-emerald-700';
    case 'REJECTED': return 'bg-red-100 text-red-700';
    case 'SIGNED': return 'bg-purple-100 text-purple-700';
    case 'PENDING_SIGNATURE': return 'bg-amber-100 text-amber-700';
    default: return 'bg-slate-100 text-slate-600';
  }
}
