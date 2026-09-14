import React from 'react';
import { motion } from 'framer-motion';
import { X, Download, Printer } from 'lucide-react';
import { Quotation } from '../../../types/quotation';

interface QuotationPreviewModalProps {
  quotation: Quotation;
  onClose: () => void;
}

export default function QuotationPreviewModal({ quotation, onClose }: QuotationPreviewModalProps) {
  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

  const getUnitPrice = (line: any, allLines: any[]) => {
    if (line.isGroup) {
      const children = allLines.filter((cl: any) => cl.parentId === line.id);
      return children.reduce((sum: number, cl: any) => sum + (cl.quantity * cl.unitPrice), 0);
    }
    return line.unitPrice;
  };

  const subtotal = quotation.chapters.reduce((acc, chapter) => acc + chapter.lines.filter(l => !l.parentId).reduce((a, l) => a + (l.quantity * getUnitPrice(l, chapter.lines)), 0), 0);
  const tax = subtotal * ((quotation.taxRate || 21) / 100);
  const total = subtotal - (quotation.discount || 0) + tax;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/quotations/${quotation.id}/pdf`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 sm:p-8">
      {/* Container */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="bg-slate-100 rounded-2xl shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Top bar */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Vista Previa del Documento</h2>
            <p className="text-sm text-slate-500">{quotation.number} - {quotation.account?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handlePrint} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Imprimir">
              <Printer size={20} />
            </button>
            <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium">
              <Download size={16} /> Descargar PDF
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable A4 Preview Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-200/50 flex justify-center items-start custom-scrollbar">
          
          {/* A4 Paper */}
          <div 
            className="bg-white shadow-lg w-full max-w-[21cm] min-h-[29.7cm] h-fit shrink-0 flex flex-col relative px-12 py-14"
            style={{ 
              fontFamily: '"Montserrat", "Inter", sans-serif',
              color: '#002D5A'
            }}
          >
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

            {/* Content / Chapters */}
            <div className="flex-1 text-[#002D5A]">
              {quotation.chapters.map((chapter, i) => {
                const chapterTotal = chapter.lines.filter(l => !l.parentId).reduce((a, l) => a + (l.quantity * getUnitPrice(l, chapter.lines)), 0);
                return (
                  <div key={chapter.id} className="mb-8 page-break-inside-avoid">
                    {/* Chapter Header */}
                    <div className="bg-[#002D5A] text-white px-4 py-2 font-bold text-xs uppercase mb-1">
                      {chapter.title}
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
                    {chapter.lines.filter(l => !l.parentId).map((line, j) => (
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
                {quotation.chapters.map((chapter, i) => {
                  const chapterTotal = chapter.lines.filter(l => !l.parentId).reduce((a, l) => a + (l.quantity * getUnitPrice(l, chapter.lines)), 0);
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
                    <span>{formatCurrency(tax)}</span>
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
                {quotation.clauses.map((clause, index) => (
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
            <div className="mt-16 page-break-inside-avoid flex justify-around items-start mb-12">
              {/* Client Signature */}
              <div className="text-[#002D5A] w-72 flex flex-col items-center text-center">
                {(quotation.status === 'SIGNED' || quotation.status === 'ACCEPTED') && quotation.clientSignature ? (
                  <>
                    <img src={quotation.clientSignature} alt="Firma del cliente" className="h-24 object-contain mb-2" onError={(e) => { e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='50'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%2394a3b8' font-style='italic'>Firma archivada</text></svg>"; e.currentTarget.className = "h-24 object-contain mb-2 opacity-50"; }} />
                    <div className="w-full border-b border-dashed border-[#002D5A]/40 mb-3"></div>
                    <div className="text-[11px] font-bold">{quotation.clientSignatoryName}</div>
                    <div className="text-[10px] text-[#002D5A]/70">DNI/NIF: {quotation.clientSignatoryDni}</div>
                    <div className="text-[10px] text-[#002D5A]/70">Firmado el: {new Date(quotation.signedAt!).toLocaleDateString('es-ES')}</div>
                  </>
                ) : (
                  <>
                    <div className="h-24 mb-2 flex items-center justify-center"></div>
                    <div className="w-full border-b border-dashed border-[#002D5A]/40 mb-3"></div>
                    <div className="text-[11px] uppercase font-bold tracking-wider mb-1">Aceptación del Cliente</div>
                    <div className="text-[10px]">Firma y Sello</div>
                  </>
                )}
              </div>

              {/* Coatline Signature */}
              <div className="flex flex-col items-center text-center w-full">
                <img src={`${window.location.origin}/images/firma-coatline.png`} alt="Firma Coatline" className="h-24 object-contain mb-2" />
                <div className="w-full border-b border-dashed border-[#002D5A]/40 mb-3"></div>
                <div className="text-[11px] font-bold mb-0.5">Coatline SL · CIF B56572936</div>
                <div className="text-[10px] text-[#002D5A]/70">Calle Resina 35, Nave 7 · 28001 Madrid · Tel. 689 680 350</div>
                <div className="text-[10px] text-[#002D5A]/70">Cotización {quotation.number} · {quotation.account?.name} · {quotation.issuedAt ? new Date(quotation.issuedAt).toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES')}</div>
              </div>
            </div>

            {/* Audit Trail (if signed) */}
            {(quotation.status === 'SIGNED' || quotation.status === 'ACCEPTED') && quotation.signatureHash && (
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
                    <img src={quotation.clientSignature || ''} alt="Firma del cliente" className="h-20 object-contain bg-white border border-slate-200 p-2 rounded" onError={(e) => { e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='50'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%2394a3b8' font-style='italic'>Firma archivada</text></svg>"; e.currentTarget.className = "h-20 object-contain bg-white border border-slate-200 p-2 rounded opacity-50"; }} />
                  </div>
                </div>
              </div>
            )}


          </div>
        </div>
      </motion.div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .custom-scrollbar > div {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            max-width: none;
            box-shadow: none;
          }
          .custom-scrollbar > div * {
            visibility: visible;
          }
        }
      `}} />
    </div>
  );
}
