import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, CheckCircle, PenTool, X, Download, ShieldCheck, FileSignature, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCurrency } from '../../hooks/useCurrency';

export default function PublicQuotationView() {
  const { formatCurrency, taxRate: defaultTaxRate } = useCurrency();
  const { token } = useParams();
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showSignModal, setShowSignModal] = useState(false);
  const [name, setName] = useState('');
  const [dni, setDni] = useState('');
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/quotations/public/${token}`);
        setQuotation(data);
        if (data.contact) {
          setName(data.contact.name || '');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar el documento.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuotation();
  }, [token]);

  const handleClear = () => {
    sigCanvas.current?.clear();
  };

  const handleSign = async () => {
    if (!name.trim() || !dni.trim()) {
      return toast.error('Por favor ingresa tu nombre y DNI');
    }
    if (sigCanvas.current?.isEmpty()) {
      return toast.error('Por favor dibuja tu firma');
    }

    const signatureBase64 = sigCanvas.current?.getCanvas().toDataURL('image/png');

    try {
      setIsSubmitting(true);
      
      // Intentar capturar la IP externa real
      let externalIp = '';
      try {
        const ipRes = await axios.get('https://api.ipify.org?format=json');
        externalIp = ipRes.data.ip;
      } catch (ipErr) {
        console.warn('No se pudo capturar la IP externa:', ipErr);
      }

      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/quotations/public/${token}/sign`, {
        name,
        dni,
        signature: signatureBase64,
        clientIp: externalIp,
        clientUserAgent: navigator.userAgent
      });
      setQuotation(data);
      setShowSignModal(false);
      toast.success('¡Documento firmado exitosamente!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al firmar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadPDF = async () => {
    try {
      // Usaremos la ruta original de generación de PDF que usa Puppeteer
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/quotations/${quotation.id}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Cotizacion_${quotation.number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Error al descargar el PDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Enlace Inválido</h2>
          <p className="text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  const getUnitPrice = (line: any, allLines: any[]) => {
    if (line.isGroup) {
      const children = allLines.filter((cl: any) => cl.parentId === line.id);
      return children.reduce((sum: number, cl: any) => sum + (cl.quantity * cl.unitPrice), 0);
    }
    return line.unitPrice;
  };

  const subtotal = quotation.chapters.reduce((acc: number, ch: any) => 
    acc + ch.lines.filter((l: any) => !l.parentId).reduce((a: number, l: any) => a + (l.quantity * getUnitPrice(l, ch.lines)), 0), 0
  );
  const discountAmount = quotation.discount ?? 0;
  const taxable = subtotal - discountAmount;
  const taxAmount = taxable * ((quotation.taxRate || defaultTaxRate) / 100);
  const total = taxable + taxAmount;

  const isSigned = quotation.status === 'SIGNED' || quotation.status === 'ACCEPTED';
  

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Fijo */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#001c3a] rounded-lg flex items-center justify-center text-white font-bold text-xl">
              C
            </div>
            <div>
              <h1 className="font-bold text-slate-800">Coastline</h1>
              <p className="text-xs text-slate-500">Propuesta Comercial {quotation.number}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={downloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-sm transition-colors"
            >
              <Download size={16} /> Descargar PDF
            </button>
            {isSigned ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg font-medium text-sm">
                <ShieldCheck size={16} /> Documento Firmado
              </div>
            ) : (
              <button 
                onClick={() => setShowSignModal(true)}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium text-sm transition-colors shadow-sm"
              >
                <PenTool size={16} /> Firmar Propuesta
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Document Container */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200 p-8 custom-scrollbar">
          
          <div className="bg-white text-[#002D5A] font-sans text-xs" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '15mm 15mm' }}>
            {/* Top Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 pr-4">
                <div className="text-[#e63257] font-bold tracking-[0.2em] text-xs mb-4 uppercase">Presupuesto</div>
                <h1 className="text-2xl font-bold text-[#002D5A] uppercase leading-tight mb-4">
                  {quotation.title || quotation.deal?.name || 'Propuesta Comercial'}
                </h1>
                <div className="text-xs text-[#002D5A]/70">
                  Nº {quotation.number} · v{quotation.version} · {quotation.issuedAt ? new Date(quotation.issuedAt).toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES')}
                </div>
              </div>
              <div className="text-right text-[10px] leading-relaxed text-[#002D5A]/80 flex-shrink-0">
                <img src={`${window.location.origin}/images/logo.png`} alt="Coatline Logo" className="h-8 object-contain mb-2 ml-auto" />
                <div>Calle Resina 35, Nave 7</div>
                <div>28001 Madrid</div>
                <div>CIF B56572936 · Tel. 689 680 350</div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-b border-slate-200 mb-4"></div>

            {/* Client Info */}
            <div className="flex justify-end mb-8">
              <div className="text-right text-[10px] leading-relaxed text-[#002D5A]/80">
                <div>
                  <span className="font-bold text-[#002D5A]">Cliente:</span> {quotation.account?.name}
                </div>
                {quotation.contact && <div>{quotation.contact.name}</div>}
                {quotation.user && <div><span className="font-bold text-[#002D5A] mt-1 inline-block">Responsable:</span> {quotation.user.name}</div>}
              </div>
            </div>

            {/* Capítulos */}
            <div className="mb-8">
              {quotation.chapters.map((chapter: any, i: number) => {
                const chapterTotal = chapter.lines.filter((l: any) => !l.parentId).reduce((a: number, l: any) => a + (l.quantity * getUnitPrice(l, chapter.lines)), 0);
                return (
                  <div key={chapter.id} className="mb-6 page-break-inside-avoid">
                    <div className="bg-[#002D5A] text-white px-4 py-2 font-bold text-xs uppercase mb-1 flex justify-between">
                      <span>{i + 1}. {chapter.title}</span>
                    </div>
                    {/* Columns */}
                    <div className="bg-[#f8fafc] flex px-4 py-2 text-[10px] font-bold border-b border-slate-100">
                      <div className="w-8">Nº</div>
                      <div className="flex-1">Concepto</div>
                      <div className="w-12 text-right">Cant.</div>
                      <div className="w-12 text-center">Ud.</div>
                      <div className="w-20 text-right">P. unit.</div>
                      <div className="w-24 text-right">Importe</div>
                    </div>
                    {/* Lines */}
                    {chapter.lines.filter((l: any) => !l.parentId).map((line: any, j: number) => (
                      <div key={line.id} className="flex px-4 py-3 text-[10px] border-b border-slate-100">
                        <div className="w-8 font-bold">{i + 1}.{j + 1}</div>
                        <div className="flex-1 pr-4 whitespace-pre-wrap leading-relaxed">{line.concept}</div>
                        <div className="w-12 text-right">{line.quantity}</div>
                        <div className="w-12 text-center">{line.unit || 'ud'}</div>
                        <div className="w-20 text-right">{formatCurrency(getUnitPrice(line, chapter.lines))}</div>
                        <div className="w-24 text-right font-bold">{formatCurrency(line.quantity * getUnitPrice(line, chapter.lines))}</div>
                      </div>
                    ))}
                    {/* Chapter Subtotal */}
                    <div className="bg-[#f8fafc] flex justify-between px-4 py-3 text-[10px] font-bold mt-1">
                      <div className="uppercase">SUBTOTAL {chapter.title} (SIN IVA)</div>
                      <div>{formatCurrency(chapterTotal)}</div>
                    </div>
                  </div>
                );
              })}

              {/* Resumen por Capítulos */}
              <div className="mb-12 page-break-inside-avoid">
                <div className="bg-[#002D5A] text-white px-4 py-2 font-bold text-xs uppercase mb-1">
                  RESUMEN POR CAPÍTULOS
                </div>
                <div className="bg-[#f8fafc] flex px-4 py-2 text-[10px] font-bold border-b border-slate-100">
                  <div className="w-8">Nº</div>
                  <div className="flex-1">Capítulo</div>
                  <div className="w-32 text-right">Importe (sin IVA)</div>
                </div>
                {quotation.chapters.map((chapter: any, i: number) => {
                  const chapterTotal = chapter.lines.filter((l: any) => !l.parentId).reduce((a: number, l: any) => a + (l.quantity * getUnitPrice(l, chapter.lines)), 0);
                  return (
                    <div key={chapter.id} className="flex px-4 py-3 text-[10px] font-bold border-b border-slate-100">
                      <div className="w-8">{i + 1}</div>
                      <div className="flex-1 uppercase">{chapter.title}</div>
                      <div className="w-32 text-right">{formatCurrency(chapterTotal)}</div>
                    </div>
                  );
                })}
                <div className="bg-[#f8fafc] flex justify-between px-4 py-3 text-[11px] font-bold mt-1 text-[#e63257]">
                  <div className="uppercase">TOTAL CAPÍTULOS (SIN IVA)</div>
                  <div>{formatCurrency(subtotal)}</div>
                </div>
              </div>

              {/* Final Totals */}
              <div className="flex justify-end page-break-inside-avoid">
                <div className="w-80">
                  <div className="flex justify-between text-[11px] mb-2 px-2">
                    <span className="text-[#002D5A]/70">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {quotation.discount && quotation.discount > 0 ? (
                    <div className="flex justify-between text-[11px] mb-2 px-2">
                      <span className="text-[#002D5A]/70">Descuento</span>
                      <span className="text-[#e63257]">-{formatCurrency(quotation.discount)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-[11px] mb-2 px-2">
                    <span className="text-[#002D5A]/70">Impuestos</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="border-t-[3px] border-[#e63257] mt-2 pt-2 flex justify-between items-center px-2">
                    <span className="text-[#e63257] font-bold text-sm tracking-wide">TOTAL</span>
                    <span className="text-[#e63257] font-bold text-lg">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Notes */}
            {quotation.notes && (
              <div className="mt-8 mb-8 page-break-inside-avoid text-[#002D5A]">
                {quotation.notesTitle && (
                  <h3 className="font-bold text-sm uppercase mb-2 border-b border-[#e2e8f0] pb-1">{quotation.notesTitle}</h3>
                )}
                <div className="text-[10px] whitespace-pre-wrap leading-relaxed text-[#64748b]">
                  {quotation.notes}
                </div>
              </div>
            )}

            {/* Clauses */}
            {quotation.clauses && quotation.clauses.length > 0 && (
              <div className="mt-12 mb-12 page-break-inside-auto">
                <div className="border-b border-[#e2e8f0] pb-2 mb-4">
                  <h2 className="text-[#002D5A] font-bold text-sm uppercase">Términos y Condiciones Generales</h2>
                </div>
                {quotation.clauses.map((clause: any, index: number) => (
                  <div key={clause.id || index} className="mb-4 page-break-inside-avoid">
                    <h3 className="text-[#002D5A] font-bold text-[11px] mb-1">{clause.title}</h3>
                    <div 
                      className="text-[#64748b] text-[10px] leading-relaxed html-content-preview"
                      dangerouslySetInnerHTML={{ __html: clause.content }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Signatures */}
            <div className="mt-16 page-break-inside-avoid flex justify-between items-start mb-12">
              {/* Client Signature */}
              <div className="text-[#002D5A] w-64">
                <div className="flex flex-col items-center text-center">
                  {(quotation.status === 'SIGNED' || quotation.status === 'ACCEPTED') && quotation.clientSignature ? (
                    <>
                      <img src={quotation.clientSignature} alt="Firma del cliente" className="h-16 object-contain mb-2" onError={(e) => { e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='50'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%2394a3b8' font-style='italic'>Firma archivada</text></svg>"; e.currentTarget.className = "h-16 object-contain mb-2 opacity-50"; }} />
                      <div className="w-full border-b border-dashed border-[#002D5A]/40 mb-2"></div>
                      <div className="text-[10px] font-bold">{quotation.clientSignatoryName}</div>
                      <div className="text-[9px] text-[#002D5A]/70">DNI/NIF: {quotation.clientSignatoryDni}</div>
                      <div className="text-[9px] text-[#002D5A]/70">Firmado el: {new Date(quotation.signedAt!).toLocaleDateString('es-ES')}</div>
                    </>
                  ) : (
                    <>
                      <div className="h-16 mb-2 flex items-center justify-center"></div>
                      <div className="w-full border-b border-dashed border-[#002D5A]/40 mb-2"></div>
                      <div className="text-[10px] uppercase font-bold tracking-wider mb-1">Aceptación del Cliente</div>
                      <div className="text-[10px]">Firma y Sello</div>
                    </>
                  )}
                </div>
              </div>

              {/* Coatline Signature */}
              <div className="text-[#002D5A] w-72 flex flex-col items-center">
                <div className="flex flex-col items-center text-center w-full">
                  <img src={`${window.location.origin}/images/firma-coatline.png`} alt="Firma Coatline" className="h-16 object-contain mb-2" />
                  <div className="w-full border-b border-dashed border-[#002D5A]/40 mb-2"></div>
                  <div className="text-[9px] font-bold mb-0.5">Coatline SL · CIF B56572936</div>
                  <div className="text-[8px] text-[#002D5A]/70">Calle Resina 35, Nave 7 · 28001 Madrid · Tel. 689 680 350</div>
                  <div className="text-[8px] text-[#002D5A]/70">Cotización {quotation.number} · {quotation.account?.name} · {quotation.issuedAt ? new Date(quotation.issuedAt).toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES')}</div>
                </div>
              </div>
            </div>

            {/* Audit Trail (if signed) */}
            {isSigned && quotation.signatureHash && (
              <div className="page-break-before-always mt-12 pt-8 border-t-[3px] border-[#e63257]">
                <div className="border border-slate-200 bg-slate-50 p-8 rounded-lg text-[10px]">
                  <h3 className="text-[#002D5A] font-bold uppercase tracking-wider text-xs mb-6 text-center border-b border-slate-200 pb-4">
                    Certificado de Auditoría de Firma Electrónica
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[#002D5A]/80 mb-8">
                    <div>
                      <div className="mb-2"><strong className="text-[#002D5A]">Firmante:</strong> {quotation.clientSignatoryName}</div>
                      <div className="mb-2"><strong className="text-[#002D5A]">DNI/NIF:</strong> {quotation.clientSignatoryDni}</div>
                      <div className="mb-2"><strong className="text-[#002D5A]">Fecha (UTC):</strong> {new Date(quotation.signedAt!).toUTCString()}</div>
                    </div>
                    <div>
                      <div className="mb-2"><strong className="text-[#002D5A]">Dirección IP:</strong> {quotation.clientIp || 'No registrada'}</div>
                      <div className="mb-2"><strong className="text-[#002D5A]">Dispositivo:</strong> {quotation.clientUserAgent || 'No registrado'}</div>
                    </div>
                    <div className="md:col-span-2 mt-2">
                      <strong className="text-[#002D5A]">Hash del Documento (SHA-256):</strong> 
                      <span className="block font-mono text-[10px] break-all bg-white p-2 border border-slate-200 rounded mt-2">{quotation.signatureHash}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center border-t border-dashed border-slate-300 pt-6">
                    <span className="text-[10px] font-bold text-[#002D5A] mb-3 uppercase tracking-wider">Trazo Biométrico</span>
                    <img src={quotation.clientSignature} alt="Firma del cliente" className="h-20 object-contain bg-white border border-slate-200 p-2 rounded" onError={(e) => { e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='50'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%2394a3b8' font-style='italic'>Firma archivada</text></svg>"; e.currentTarget.className = "h-20 object-contain bg-white border border-slate-200 p-2 rounded opacity-50"; }} />
                  </div>
                </div>
              </div>
            )}


          </div>
        </div>
      </div>

      {/* Signature Modal */}
      <AnimatePresence>
        {showSignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowSignModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
              
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <FileSignature className="text-primary" size={20} />
                  Firma Electrónica
                </h3>
                <button onClick={() => setShowSignModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <p className="text-sm text-slate-500 mb-6">
                  Al firmar este documento confirmas la aceptación de las condiciones y presupuesto de la propuesta {quotation.number}.
                </p>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Nombre Completo *</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="Juan Pérez" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">DNI / NIF *</label>
                    <input type="text" value={dni} onChange={e => setDni(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="12345678A" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between items-center">
                    <span>Dibuja tu firma *</span>
                    <button onClick={handleClear} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Borrar</button>
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
                    <SignatureCanvas 
                      ref={sigCanvas}
                      canvasProps={{ className: 'w-full h-48 cursor-crosshair' }}
                      penColor="#0f172a"
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button onClick={() => setShowSignModal(false)} className="px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold transition-colors">
                  Cancelar
                </button>
                <button onClick={handleSign} disabled={isSubmitting} className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark font-bold transition-colors flex items-center gap-2">
                  {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ShieldCheck size={18} /> Aceptar y Firmar</>}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
