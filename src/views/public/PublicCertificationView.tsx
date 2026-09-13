import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, ShieldCheck, AlertCircle, PenTool, X, CheckCircle2, Download, FileSignature } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { CertificationDocument } from '../../components/documents/CertificationDocument';

export default function PublicCertificationView() {
  const { token } = useParams();
  const [fullData, setFullData] = useState<any>(null);
  const [certification, setCertification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showSignModal, setShowSignModal] = useState(false);
  const [name, setName] = useState('');
  const [dni, setDni] = useState('');
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentCertLines = React.useMemo(() => {
    if (!certification) return new Map<string, number>();
    const map = new Map<string, number>();
    certification.lines?.forEach((line: any) => {
      map.set(line.quotationLineId || line.originalLineId, line.quantity);
    });
    return map;
  }, [certification]);
  useEffect(() => {
    const fetchCertification = async () => {
      try {
        const { data } = await api.get(`/certifications/public/${token}`);
        // Handle new backend response format
        if (data.certification) {
          setFullData(data);
          setCertification(data.certification);
        } else {
          setFullData({ certification: data, baseQuotation: null, budgetQuotation: null, certifications: [] });
          setCertification(data);
          if (data.project?.account?.name) {
            setName(data.project.account.name);
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.error || err.response?.data?.message || 'Error al cargar el documento.');
      } finally {
        setLoading(false);
      }
    };
    fetchCertification();
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
      
      const { data } = await api.post(`/certifications/public/${token}/sign`, {
        signatoryName: name,
        signatoryDni: dni,
        signature: signatureBase64
      });
      // Recargar datos completos para evitar inconsistencias
        const { data: newData } = await api.get(`/certifications/public/${token}`);
        if (newData.certification) {
          setFullData(newData);
          setCertification(newData.certification);
        } else {
          setFullData({ certification: newData, baseQuotation: null, budgetQuotation: null, certifications: [] });
          setCertification(newData);
        }
      setShowSignModal(false);
      toast.success('¡Certificación firmada exitosamente!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Error al firmar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const element = document.getElementById('pdf-preview-content');
      if (!element) return;

      toast.info('Generando PDF, por favor espera...');
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; background-color: white; margin: 0; padding: 0; }
            .break-before-page { break-before: page; }
            .break-inside-avoid { break-inside: avoid; }
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          </style>
        </head>
        <body class="bg-white">
          <div style="width: 794px; margin: 0 auto; position: relative; padding: 20px;">
            ${element.outerHTML}
          </div>
        </body>
        </html>
      `;

      const response = await api.post('/certifications/public/generate-pdf', {
        html: htmlContent,
        filename: `Certificacion_${certification.project?.name || 'Proyecto'}_${certification.name}`,
        landscape: false
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificacion_${certification.project?.name || 'Proyecto'}_${certification.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Error al descargar el PDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002D5A] mb-4"></div>
        <p className="text-slate-500 font-medium">Cargando documento seguro...</p>
      </div>
    );
  }

  if (error || !certification) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-red-500">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Enlace no válido</h2>
          <p className="text-slate-600 mb-8">{error || 'El documento no existe o el enlace ha expirado.'}</p>
          <p className="text-sm text-slate-400">Por favor, contacta con Coatline si crees que es un error.</p>
        </div>
      </div>
    );
  }

  const isSigned = certification.status === 'SIGNED';

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#002D5A] selection:text-white">
      {/* HEADER FLOTANTE */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#002D5A] text-white p-2 rounded-lg">
              <FileText size={20} />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 leading-tight hidden sm:block">Certificación: {certification.name}</h1>
              <p className="text-xs text-slate-500 font-medium">Coatline SL</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={downloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-sm transition-colors"
            >
              <Download size={16} /> <span className="hidden sm:inline">Descargar PDF</span>
            </button>
            {isSigned ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full font-medium text-sm border border-emerald-200">
                <ShieldCheck size={16} />
                <span className="hidden sm:inline">Documento Firmado</span>
                <span className="sm:hidden">Firmado</span>
              </div>
            ) : (
              <button
                onClick={() => setShowSignModal(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#002D5A] text-white rounded-full font-medium text-sm hover:bg-[#002D5A]/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <PenTool size={16} />
                Firmar Ahora
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          
          <div className="p-8 md:p-12 text-center bg-slate-50 border-b border-slate-200">
            <h2 className="text-3xl font-black text-slate-800 mb-4">{certification.name}</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Por favor revisa el documento. Si estás conforme con el reporte de avance y los montos a certificar, puedes firmarlo digitalmente haciendo clic en el botón superior.
            </p>
          </div>

          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between mb-12 gap-8">
              <div>
                <h3 className="text-sm font-bold text-slate-400 tracking-wider uppercase mb-2">Cliente</h3>
                <p className="font-semibold text-slate-800">{certification.project?.account?.name}</p>
              </div>
              
              <div className="md:text-right">
                <h3 className="text-sm font-bold text-slate-400 tracking-wider uppercase mb-2">Detalles</h3>
                <p className="text-slate-800"><span className="text-slate-500">Fecha:</span> {new Date(certification.date).toLocaleDateString('es-ES')}</p>
                <p className="text-slate-800"><span className="text-slate-500">Estado:</span> {isSigned ? 'Firmado' : 'Pendiente'}</p>
              </div>
            </div>

            {/* TABLA DE LÍNEAS / DOCUMENTO PDF */}
            <div className="mb-12 overflow-x-auto">
              <div id="pdf-preview-content" className="min-w-[800px] border border-slate-200 shadow-sm rounded-lg overflow-hidden scale-[0.8] sm:scale-100 origin-top-left sm:origin-top-center">
                <CertificationDocument
                  project={fullData?.project || certification.project}
                  baseQuotation={fullData?.baseQuotation}
                  budgetQuotation={fullData?.budgetQuotation}
                  activeCertification={certification}
                  previousCertifications={fullData?.certifications || []}
                  currentCertLines={currentCertLines}
                />
              </div>
            </div>

            {isSigned && (
              <div className="mt-12 bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold mb-4">
                    <ShieldCheck size={24} />
                    Firmado Digitalmente
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                    <div>
                      <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Firmante</span>
                      <span className="font-medium text-slate-800">{certification.clientSignatoryName}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">DNI/NIF</span>
                      <span className="font-medium text-slate-800">{certification.clientSignatoryDni}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Fecha y Hora</span>
                      <span className="font-medium text-slate-800">{new Date(certification.signedAt).toLocaleString('es-ES')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="w-full md:w-64 bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2">Firma del Cliente</p>
                  <img 
                    src={certification.clientSignature} 
                    alt="Firma" 
                    className="w-full h-auto mix-blend-multiply" 
                  />
                </div>
              </div>
            )}

            {!isSigned && (
              <div className="mt-12 bg-blue-50/50 rounded-2xl p-8 border border-blue-100 text-center">
                <FileSignature size={48} className="mx-auto text-blue-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">Pendiente de firma</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">Esta certificación requiere tu firma para proceder con la facturación y el registro del avance.</p>
                <button
                  onClick={() => setShowSignModal(true)}
                  className="px-8 py-3 bg-[#002D5A] text-white rounded-full font-semibold hover:bg-[#002D5A]/90 transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2"
                >
                  <PenTool size={18} />
                  Firmar Documento
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* FOOTER */}
        <div className="mt-12 text-center text-slate-400 text-sm">
          <p>Coatline SL · Calle Resina 35, Nave 7 · 28021 Madrid</p>
          <p className="mt-1">Documento generado por la plataforma segura de Coatline</p>
        </div>
      </main>

      {/* MODAL DE FIRMA */}
      <AnimatePresence>
        {showSignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">Firma Digital</h2>
                <button 
                  onClick={() => setShowSignModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <p className="text-sm text-slate-500 mb-6">
                  Al firmar, confirmas que aceptas la certificación <strong className="text-slate-700">{certification.name}</strong> por el avance reportado.
                </p>

                <div className="space-y-4 mb-6">
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-4">
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Representando a (Empresa Cliente)</p>
                    <p className="text-sm font-medium text-slate-800">{certification.project?.account?.name || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre de quien firma <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="Ej. Juan Pérez"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">DNI / NIF <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={dni}
                      onChange={e => setDni(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="Ej. 12345678A"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-sm font-semibold text-slate-700">Dibuja tu firma <span className="text-red-500">*</span></label>
                    <button 
                      onClick={handleClear}
                      className="text-xs text-blue-600 font-medium hover:text-blue-800"
                    >
                      Limpiar
                    </button>
                  </div>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
                    <SignatureCanvas 
                      ref={sigCanvas}
                      canvasProps={{
                        className: 'w-full h-48 cursor-crosshair'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  onClick={() => setShowSignModal(false)}
                  className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSign}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#002D5A] text-white font-medium rounded-xl hover:bg-[#002D5A]/90 transition-all shadow-md disabled:opacity-70 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Procesando...
                    </>
                  ) : 'Aceptar y Firmar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
