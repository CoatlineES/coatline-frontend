import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { Search, ShieldCheck, ArrowRight, ChevronRight, CheckCircle2, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import imgDeteccion from '../../assets/packages/deteccion_termografica_1789058782940.jpg';
import imgZero from '../../assets/packages/zero_filtraciones_1789058803326.jpg';

export default function HomePackages() {
  const navigate = useNavigate();
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const packages = [
    {
      id: 'deteccion',
      serviceKey: 'detection',
      badge: 'DIAGNÓSTICO NO INVASIVO',
      subtitle: 'Localización milimétrica sin obras',
      title: 'Detección electrónica',
      description: 'Localización exacta de filtraciones e incidencias sin necesidad de realizar obras destructivas, empleando escáneres avanzados, termografía infrarroja y trazabilidad electroacústica.',
      tags: ['Sin roturas ni obras', 'Termografía infrarroja', 'Mapeo pericial exacto', 'Ahorro de hasta un 70%'],
      features: [
        'Localización milimétrica sin picar ni demoler cubiertas o pavimentos',
        'Termografía infrarroja de alta resolución y trazabilidad electroacústica',
        'Informe técnico pericial detallado con evidencia fotográfica y térmica',
        'Ahorro radical en costes y tiempos frente a sustituciones a ciegas'
      ],
      image: imgDeteccion,
      icon: <Search className="w-6 h-6 text-sky-400" />,
      accentBadge: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
      topGradient: 'from-sky-400 via-blue-500 to-indigo-600',
      accentGlow: 'hover:border-sky-500/40 hover:shadow-[0_25px_60px_-15px_rgba(14,165,233,0.25)]',
      checkColor: 'text-sky-400',
      actionText: 'Solicitar diagnóstico',
      primaryBtnClass: 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-900/40'
    },
    {
      id: 'zero',
      serviceKey: 'zeroLeaks',
      badge: 'PLAN DE PROTECCIÓN CONTINUA',
      subtitle: 'Mantenimiento preventivo inteligente',
      title: 'Programa Zero filtraciones',
      description: 'Mantenimiento preventivo inteligente que garantiza la integridad, estanqueidad y eficiencia de su cubierta a largo plazo, anticipando problemas antes de que causen daños costosos.',
      tags: ['Inspecciones periódicas', 'Cuota mensual predecible', 'Atención urgente 24/7', 'Garantía extendida'],
      features: [
        'Plan de inspecciones preventivas periódicas y limpieza técnica especializada',
        'Cuota mensual fija predecible sin sorpresas ni sobrecostes imprevistos',
        'Canal prioritario con respuesta urgente ante cualquier contingencia climática',
        'Extensión certificada de la vida útil de su cubierta con tranquilidad 365 días'
      ],
      image: imgZero,
      icon: <ShieldCheck className="w-6 h-6 text-amber-400" />,
      accentBadge: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
      topGradient: 'from-amber-400 via-orange-500 to-rose-600',
      accentGlow: 'hover:border-amber-500/40 hover:shadow-[0_25px_60px_-15px_rgba(245,158,11,0.25)]',
      checkColor: 'text-amber-400',
      actionText: 'Contratar programa',
      primaryBtnClass: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-amber-900/40'
    }
  ];

  const selectedPackage = packages.find(p => p.id === selectedPackageId);

  return (
    <section id="paquetes" className="py-24 px-6 md:px-16 text-white relative overflow-hidden" style={{ backgroundColor: '#001c3a' }}>
      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-sky-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/15 backdrop-blur-sm">
            <Sparkles size={14} className="text-secondary" />
            <span className="font-sans font-bold text-xs text-white uppercase tracking-widest">Nuestras Soluciones Clave</span>
          </div>
          
          <h2 className="font-display font-black text-3xl md:text-5xl text-white tracking-tight">
            Especialistas en la integridad de su edificio
          </h2>
          
          <p className="font-sans text-base md:text-lg text-slate-300 leading-relaxed">
            Dos soluciones técnicas de vanguardia diseñadas para resolver y prevenir cualquier patología en su cubierta: diagnóstico tecnológico sin obras y protección integral continua.
          </p>
        </div>

        {/* 2-Column Flagship Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch max-w-6xl mx-auto">
          {packages.map((pkg) => (
            <div 
              key={pkg.id}
              className={`group relative bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 rounded-3xl overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-2 hover:border-white/25 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] ${pkg.accentGlow}`}
            >
              {/* Top Gradient Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${pkg.topGradient}`} />
              
              {/* Hero Image Section */}
              <div 
                className="relative h-60 md:h-68 w-full overflow-hidden cursor-pointer"
                onClick={() => setSelectedPackageId(pkg.id)}
              >
                <img 
                  src={pkg.image} 
                  alt={pkg.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001c3a] via-[#001c3a]/65 to-black/30" />
                
                {/* Floating Category Badge */}
                <div className="absolute top-5 left-5 z-10">
                  <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border ${pkg.accentBadge}`}>
                    {pkg.badge}
                  </span>
                </div>

                {/* Floating Icon Box */}
                <div className="absolute top-5 right-5 z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300">
                    {pkg.icon}
                  </div>
                </div>

                {/* Title & Subtitle overlaid on Image */}
                <div className="absolute bottom-4 left-6 right-6 z-10">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-1">
                    {pkg.subtitle}
                  </p>
                  <h3 className="font-display font-extrabold text-2xl md:text-3xl text-white tracking-tight">
                    {pkg.title}
                  </h3>
                </div>
              </div>
              
              {/* Card Body */}
              <div className="p-6 md:p-8 flex flex-col flex-grow justify-between space-y-6">
                <p className="font-sans text-sm md:text-base text-slate-300 leading-relaxed">
                  {pkg.description}
                </p>

                {/* Highlight Tags */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {pkg.tags.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="text-xs font-medium px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Features Checklist */}
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Ventajas y Alcance
                  </h4>
                  <ul className="space-y-2.5">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-slate-200">
                        <CheckCircle2 size={18} className={`shrink-0 mt-0.5 ${pkg.checkColor}`} />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className="w-full sm:w-1/2 py-3 px-4 rounded-xl border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 group/btn"
                  >
                    <span>Ver especificaciones</span>
                    <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => navigate(`/contacto?service=${pkg.serviceKey}`)}
                    className={`w-full sm:w-1/2 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 ${pkg.primaryBtnClass}`}
                  >
                    <span>{pkg.actionText}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Package Details Modal */}
      <AnimatePresence>
        {selectedPackage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-[#001c3a]/80 backdrop-blur-md"
            onClick={() => setSelectedPackageId(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row relative max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedPackageId(null)}
                className="absolute top-4 right-4 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors backdrop-blur-sm"
              >
                <X size={22} />
              </button>
              
              {/* Image Section */}
              <div className="w-full md:w-5/12 h-64 md:h-auto relative shrink-0">
                <img 
                  src={selectedPackage.image} 
                  alt={selectedPackage.title} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001c3a] via-[#001c3a]/50 to-transparent flex flex-col justify-end p-8">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white mb-4">
                    {selectedPackage.icon}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-1">
                    {selectedPackage.badge}
                  </span>
                  <h2 className="font-display font-black text-2xl md:text-3xl text-white leading-tight">
                    {selectedPackage.title}
                  </h2>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center overflow-y-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded-full text-primary font-sans font-bold text-xs mb-4 w-fit">
                  <span>{selectedPackage.subtitle}</span>
                </div>
                
                <p className="font-sans text-on-surface-variant mb-6 leading-relaxed text-base md:text-lg">
                  {selectedPackage.description}
                </p>
                
                <div className="mb-8 space-y-4">
                  <h4 className="font-display font-bold text-base text-primary border-b border-surface-container pb-2">
                    Beneficios y Coberturas Incluidas
                  </h4>
                  <ul className="space-y-3">
                    {selectedPackage.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-on-surface">
                        <div className="mt-1">
                          <CheckCircle2 size={18} className="text-secondary shrink-0" />
                        </div>
                        <span className="font-medium text-sm md:text-base leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-auto pt-4 border-t border-surface-container">
                  <button
                    onClick={() => {
                      navigate(`/contacto?service=${selectedPackage.serviceKey}`);
                      setSelectedPackageId(null);
                    }}
                    className="w-full py-4 bg-secondary hover:bg-secondary-container text-white font-bold rounded-xl text-base md:text-lg transition-all shadow-lg hover:shadow-secondary/30 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                  >
                    {selectedPackage.actionText} <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
