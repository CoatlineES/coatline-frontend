import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShieldCheck, AlertTriangle, Hammer, ArrowRight, ChevronRight, CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import imgDeteccion from '../../assets/packages/deteccion_termografica_1789058782940.jpg';
import imgImpermeabilizacion from '../../assets/packages/impermeabilizacion_obra_1789058794545.jpg';
import imgZero from '../../assets/packages/zero_filtraciones_1789058803326.jpg';
import imgReparaciones from '../../assets/packages/reparaciones_cubierta_1789058813612.jpg';

export default function HomePackages() {
  const navigate = useNavigate();
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const packages = [
    {
      id: 'deteccion',
      serviceKey: 'detection',
      title: 'Detección electrónica',
      description: 'Localización precisa de filtraciones e incidencias sin necesidad de realizar obras, empleando escáneres avanzados y termografía.',
      features: [
        'Localización sin obras ni destrozos',
        'Termografía infrarroja de alta precisión',
        'Resultados inmediatos y exactos',
        'Ahorro en costes de reparación'
      ],
      image: imgDeteccion,
      icon: <Search className="w-8 h-8" />,
      color: 'from-blue-600/20 to-transparent'
    },
    {
      id: 'impermeabilizacion',
      serviceKey: 'waterproofing',
      title: 'Impermeabilización obra nueva',
      description: 'Aplicación de sistemas certificados de alta durabilidad para proyectos desde cero, cumpliendo las más altas normativas.',
      features: [
        'Materiales de alta durabilidad',
        'Certificación técnica oficial',
        'Cumplimiento normativo vigente',
        'Garantía extendida de materiales'
      ],
      image: imgImpermeabilizacion,
      icon: <ShieldCheck className="w-8 h-8" />,
      color: 'from-emerald-600/20 to-transparent'
    },
    {
      id: 'zero',
      serviceKey: 'zeroLeaks',
      title: 'Programa Zero filtraciones',
      description: 'Mantenimiento preventivo inteligente que garantiza la integridad y eficiencia de su cubierta a largo plazo.',
      features: [
        'Mantenimiento preventivo cíclico',
        'Cuota mensual fija predecible',
        'Inspecciones técnicas regulares',
        'Prioridad en emergencias'
      ],
      image: imgZero,
      icon: <AlertTriangle className="w-8 h-8" />,
      color: 'from-amber-600/20 to-transparent'
    },
    {
      id: 'reparaciones',
      serviceKey: 'repairs',
      title: 'Reparaciones y rehabilitaciones',
      description: 'Actuaciones correctivas de emergencia y mejora estructural profunda de superficies y cubiertas deterioradas.',
      features: [
        'Respuesta técnica rápida',
        'Reparación de daños estructurales',
        'Mejora de la eficiencia térmica',
        'Soluciones a largo plazo'
      ],
      image: imgReparaciones,
      icon: <Hammer className="w-8 h-8" />,
      color: 'from-rose-600/20 to-transparent'
    }
  ];

  const selectedPackage = packages.find(p => p.id === selectedPackageId);

  return (
    <section id="paquetes" className="py-24 px-6 md:px-16 text-white relative overflow-hidden" style={{ backgroundColor: '#001c3a' }}>
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16 max-w-3xl mx-auto space-y-6"
        >
          <motion.div variants={itemVariants} className="inline-block px-4 py-1.5 bg-secondary rounded-full border border-secondary">
            <span className="font-sans font-bold text-xs text-white uppercase tracking-widest">Nuestros Servicios</span>
          </motion.div>
          
          <motion.h2 variants={itemVariants} className="font-display font-black text-3xl md:text-5xl text-white tracking-tight">
            Especialistas en la integridad de su edificio
          </motion.h2>
          
          <motion.p variants={itemVariants} className="font-sans text-base md:text-lg text-slate-300 leading-relaxed">
            Ofrecemos soluciones integrales adaptadas a las necesidades específicas de su cubierta. Elija el paquete de actuación que mejor se ajuste a su proyecto.
          </motion.p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch"
        >
          {packages.map((pkg) => (
            <motion.div 
              key={pkg.id}
              variants={itemVariants} 
              className="group relative bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-2 cursor-pointer shadow-lg hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
              onClick={() => setSelectedPackageId(pkg.id)}
            >
              <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-b ${pkg.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300 shadow-sm">
                  {pkg.icon}
                </div>
                
                <h3 className="font-display font-bold text-xl text-white mb-4">
                  {pkg.title}
                </h3>
                
                <p className="font-sans text-sm text-slate-300 leading-relaxed flex-grow">
                  {pkg.description}
                </p>
                
                <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-sm font-bold text-[#f59e0b] group-hover:text-[#fbbf24] transition-colors">
                  <span>Descubrir más</span>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 group-hover:translate-x-1 transition-all">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
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
              className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row relative max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedPackageId(null)}
                className="absolute top-4 right-4 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors backdrop-blur-sm"
              >
                <X size={24} />
              </button>
              
              {/* Image Section */}
              <div className="w-full md:w-5/12 h-64 md:h-auto relative shrink-0">
                <img 
                  src={selectedPackage.image} 
                  alt={selectedPackage.title} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001c3a] via-[#001c3a]/40 to-transparent flex flex-col justify-end p-8">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white mb-4">
                    {selectedPackage.icon}
                  </div>
                  <h2 className="font-display font-bold text-2xl md:text-3xl text-white leading-tight">
                    {selectedPackage.title}
                  </h2>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center overflow-y-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded-full text-primary font-sans font-bold text-xs mb-6 w-fit">
                  <span>Detalles del Paquete</span>
                </div>
                
                <p className="font-sans text-on-surface-variant mb-8 leading-relaxed text-lg">
                  {selectedPackage.description}
                </p>
                
                <div className="mb-10 space-y-6">
                  <h4 className="font-display font-bold text-lg text-primary border-b border-surface-container pb-2">Beneficios Incluidos</h4>
                  <ul className="space-y-4">
                    {selectedPackage.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-on-surface">
                        <div className="mt-1">
                          <CheckCircle2 size={20} className="text-secondary shrink-0" />
                        </div>
                        <span className="font-medium text-[15px]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-auto">
                  <button
                    onClick={() => {
                      navigate(`/contacto?service=${selectedPackage.serviceKey}`);
                      setSelectedPackageId(null);
                    }}
                    className="w-full py-4 bg-secondary hover:bg-secondary-container text-white font-bold rounded-xl text-lg transition-all shadow-lg hover:shadow-secondary/30 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                  >
                    Solicitar este servicio <ArrowRight size={20} />
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
