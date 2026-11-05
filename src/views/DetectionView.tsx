import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  Droplet, 
  Scale, 
  Target, 
  CheckCircle, 
  Zap,
  Eye,
  SlidersHorizontal,
  Radar,
  FileText,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  X,
  ChevronsLeftRight,
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';
import { ScreenId } from '../types';
import CssDetectionFloor from '../components/animations/CssDetectionFloor';
import imgHeroDeteccion from '../assets/packages/deteccion_termografica_1789058782940.jpg';

interface DetectionViewProps {
  onNavigate: (screen: ScreenId, transition: 'none' | 'push') => void;
}

export default function DetectionView({ onNavigate }: DetectionViewProps) {
  const [selectedCard, setSelectedCard] = useState<any>(null);

  const CaseViewer = ({ c, onClose, onNext, onPrev }: { c: any, onClose: () => void, onNext: () => void, onPrev: () => void }) => {
    const [sliderPos, setSliderPos] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    
    const handleMove = (clientX: number, rect: DOMRect) => {
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
      setSliderPos(percent);
    };

    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      handleMove(e.clientX, e.currentTarget.getBoundingClientRect());
    };

    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      setIsDragging(true);
      handleMove(e.clientX, e.currentTarget.getBoundingClientRect());
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
      setIsDragging(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    };

    return (
      <div className="w-full flex flex-col">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-sky-300 hover:text-white transition-colors font-sans text-xs uppercase tracking-widest font-bold px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
          >
            <ArrowRight className="rotate-180" size={16} /> Volver a Casos
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onPrev}
              className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-all border border-white/10 hover:border-white/20 active:scale-95"
              title="Caso Anterior"
            >
              <ArrowRight className="rotate-180" size={16} />
            </button>
            <button 
              onClick={onNext}
              className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-all border border-white/10 hover:border-white/20 active:scale-95"
              title="Caso Siguiente"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={c.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row h-auto lg:h-[75vh] lg:max-h-[800px] lg:min-h-[500px] border border-slate-200/50"
          >
            {/* Slider Section */}
            <div className="w-full lg:w-3/5 h-[42vh] lg:h-full relative bg-slate-900 select-none touch-none">
              <div 
                className="relative w-full h-full cursor-ew-resize overflow-hidden flex items-center justify-center"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                {/* Image 2 (After / Fugas) - Background */}
                <img 
                  src={c.after.img} 
                  alt="Fugas detectadas" 
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />
                
                {/* Image 1 (Before / Área) - Clipped */}
                <img 
                  src={c.before.img} 
                  alt="Área inspeccionada" 
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                />

                {/* Slider Handle */}
                <div 
                  className="absolute inset-y-0 flex items-center justify-center pointer-events-none"
                  style={{ left: `${sliderPos}%`, marginLeft: '-1px' }}
                >
                  <div className="w-[3px] h-full bg-white shadow-[0_0_15px_rgba(0,0,0,0.6)]" />
                  <div className="absolute w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center border-2 border-primary/20 text-primary pointer-events-none transform -translate-x-1/2">
                    <ChevronsLeftRight size={22} />
                  </div>
                </div>
                
                {/* Badges overlay */}
                <div className="absolute top-4 left-4 lg:top-6 lg:left-6 pointer-events-none">
                  <div className="px-3.5 py-1.5 lg:px-4 lg:py-2 bg-slate-900/80 backdrop-blur-md text-white text-[11px] lg:text-xs font-bold rounded-xl shadow-lg uppercase tracking-wider border border-white/10">
                    Área a Supervisar
                  </div>
                </div>
                <div className="absolute top-4 right-4 lg:top-6 lg:right-6 pointer-events-none">
                  <div className="px-3.5 py-1.5 lg:px-4 lg:py-2 bg-secondary/95 backdrop-blur-md text-white text-[11px] lg:text-xs font-bold rounded-xl shadow-lg uppercase tracking-wider flex items-center gap-2 border border-white/15">
                    <Zap size={13} className="fill-white" />
                    Filtraciones COAT-DDP
                  </div>
                </div>

                {/* Hint indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none bg-black/60 backdrop-blur-md text-white/80 text-[10px] font-sans px-3 py-1 rounded-full border border-white/10 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                  <ChevronsLeftRight size={12} /> Arrastre para comparar
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="w-full lg:w-2/5 p-6 lg:p-10 flex flex-col bg-slate-50 text-slate-900 overflow-y-auto">
              <div className="mb-6 flex flex-col">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 border border-sky-200/60 rounded-full text-sky-800 mb-4 w-max shadow-2xs">
                  <Radar size={12} className="text-secondary" />
                  <span className="font-sans font-bold text-[10px] uppercase tracking-wider">Caso de Estudio Dieléctrico</span>
                </div>
                <h3 className="font-display font-extrabold text-2xl lg:text-3xl text-slate-900 leading-tight">
                  {c.system}
                </h3>
                <p className="font-sans text-xs md:text-sm font-medium text-slate-600 border-l-3 border-secondary/70 pl-3 mt-3 leading-relaxed">
                  {c.systemDesc}
                </p>
              </div>
              
              <div className="space-y-4 flex-grow">
                {/* Before Details */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs transition-all hover:shadow-xs">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <h4 className="font-display font-bold text-base text-primary">{c.before.title}</h4>
                  </div>
                  <p className="font-sans text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                    {c.before.subtitle}
                  </p>
                  <p className="font-sans text-xs md:text-sm text-slate-600 leading-relaxed">
                    {c.before.desc}
                  </p>
                </div>

                {/* After Details */}
                <div className="bg-white p-5 rounded-2xl border border-secondary/20 shadow-xs relative overflow-hidden transition-all hover:shadow-md">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary" />
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={18} className="text-secondary fill-secondary/20" />
                    <h4 className="font-display font-bold text-base text-secondary">{c.after.title}</h4>
                  </div>
                  <p className="font-sans text-[11px] uppercase tracking-wider font-bold text-secondary mb-2">
                    {c.after.subtitle}
                  </p>
                  <p className="font-sans text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
                    {c.after.desc}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  const cases = [
    {
      id: 'case-1',
      system: 'Cubierta con grava',
      systemDesc: 'Sistema: cubierta protegida con grava, doble capa de XPS y membrana de PVC.',
      before: {
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpJ4wDqvwX3eBAtMFUAc-5c6rIfSTPLHA5N_0PIKC1JwtF-Y_Uwiv_kw2bpKwcNO3lPSq5A2otIX9yi2PQCBgSU7o8Q9_rGYAon10HMRphVa4tdLpXDuNJal92BWP-znyeE7dQ97Nw2Ng-4XYPJs3gM_0zPM8NONMWREgryZOOXVrXYIZ2H_T_nujsge52ijOMlBjvEq0m61Vq5A2kBl0reXc9cFeCS44uG-8zWYmPgT6BjyNfmfGTLyFRNdIEkvCICm3c0bmA_Z2a',
        title: 'Espacio a Supervisar',
        subtitle: 'Delimitación en verde',
        desc: 'Inspección certificada con delimitación en verde. El escáner dieléctrico mapeó el 100% de la superficie sin detectar anomalías preliminares. La membrana de PVC subyacente requiere análisis bajo la doble capa de XPS y la protección de grava pesada.'
      },
      after: {
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAg98vAOTFz0TBPaa945PYFp-2YEr7SYgypJz_aznLKyfRi5B0Ra5Ee00O4zz9b1XsmjEZMzACSUrYvzNNMetkwSb7j3J3nqFdZ_rUWdBpxpku5V1m8I004Tx7cdppgb_uAlGPvsRetPrY03sS6l8mCd3n7lV4PAc5kOsodRZ8pmDE13VjD4Lfb_j5e67jtQ580z9BEGzkOpq4mjs_UDyr88KFmbEWJngqT8K-9GRcKFR13Zv_jcyRYA6-ayBa6Zz7Ik8GSno3si5vO',
        title: 'Filtraciones Encontradas',
        subtitle: 'Clasificación COAT-DDP. Discontinuidades en membrana.',
        desc: 'Se localizaron discontinuidades milimétricas bajo Clasificación COAT-DDP. El rastreo de inducción permitió marcar exactamente el punto de falla en la membrana de PVC, evitando la retirada masiva de la cubierta de grava para su reparación y garantizando un ahorro masivo en costes estructurales.'
      }
    },
    {
      id: 'case-2',
      system: 'Baldosa sobre mortero',
      systemDesc: 'Sistema: protección de pavimento de baldosa sobre recrecido de mortero, geotextil y membrana de tela asfáltica.',
      before: {
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuRumt8LX_MmOPq9XESv8VyTWuGQUjYt5bMPT3gng98CzrScvmqOU0AD92_HE3GdeSalBtb5RWLzRcuxg1fPwcPyrCn9PFMMY2jOItJUFa92Lczlmu8lj_kap3KY7-LuSqnGgFpaKo3jywrDxm6nuuMAz6n6KROd0jmQDnTYWpMpckS4k0A_Oqv9T4ZdNDKc6x4csdqVhFZTxSmEFmcThzmnb5fTfz1l_P0XLsZDzdf_7j--9Zni7_9vAt79WQrdWSLTm9CUwI2B7-',
        title: 'Espacio a Supervisar',
        subtitle: 'Delimitación en verde',
        desc: 'La delimitación en verde establece el perímetro de la superficie analizada. La membrana de tela asfáltica se evalúa por debajo de las capas de geotextil, el mortero de agarre y el pavimento de baldosa exterior.'
      },
      after: {
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzRdlf6f-RaYu5cPJlj9fleKVCmIjL--UF13Jk4G-aRixadhw4Hh1JTUWqMY4iDgaoVWNYzjHO9qki5qiLpSzM_-CqMYUuGJPAHlM_Fh9Yzr25BuY794q-Pv0qS7TooOAUC4wJjXPtWrRe4Nn0aBzHoDcEzeWvKbgnrRJFmrL_SL9HuLHNTM9383XftQqzcFGM6BlrLo9A_JF1IhbGaj4LTfuYuI3AEk2WJVRMBUS0wbb6DB0QAn660k-MN1r57SmWUOjy0s-pa3Jk',
        title: 'Filtraciones Encontradas',
        subtitle: 'Clasificación COAT-DDP. Discontinuidades en membrana.',
        desc: 'Bajo clasificación COAT-DDP, se detectaron discontinuidades y pérdida de estanqueidad en la tela asfáltica oculta bajo el recrecido de mortero. El diagnóstico preciso permitió una intervención quirúrgica directa sobre la baldosa afectada, ahorrando grandes y costosas demoliciones.'
      }
    },
    {
      id: 'case-3',
      system: 'Baldosa sobre geotextil',
      systemDesc: 'Sistema: protección de pavimento de baldosa sobre geotextil y membrana de tela asfáltica.',
      before: {
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoRTjZfxsy9MADBtVn0tfLMTmsZt6NQKwIsQt7qSIlB4DyDZe2g1h4ya5IHxM9paCNMJ0sHTaIe-Sblzr8xA5t93K_dRQ75VJ8GjpJnga44mAvQBWoc4QD7_QLh6lCYhamovQEoIpGxDSZ9AMyoCsejnWlR6dCsmGV04mT4oJVCqbEQ6Fj36Gpm1UdZenTq-vJ-jZHLa8oj3MJpv9sRRsI7sL0hDjZnkaNIAivXaSdyrfUndr5rw9eJ7i60Z-IQ44RSkqCsPDBj-yB',
        title: 'Espacio a Supervisar',
        subtitle: 'Delimitación en verde',
        desc: 'Barrido electrónico completado con delimitación en verde de la zona de estudio. Se procede a evaluar el sistema de impermeabilización asfáltico situado inmediatamente debajo del geotextil y el pavimento.'
      },
      after: {
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6gsPaTM3XJBKauIBgTGAhW93OxtkWnHZ0eNlAIHgErL5LCmblIcxenxTT5eahr_OTGYRTIqpPZ1EEYVPKjhm1MVVHVqW5E0dumdb01SMMLWGykaP9QFYIzeS2skr6597HKvYfWubG4AKGsRtJxxlRNJWdEXMlxFErB-yk6zq0DHQgvtzrlrAFZu66p2nyqLzjGMti3v4gqcR2PxVaV0mlQm0I5LUdx8ZFoWFTF2RLjPo-6HJoXoPJ89arnbXYGVXg4cP1jS7DapoI',
        title: 'Filtraciones Encontradas',
        subtitle: 'Clasificación COAT-DDP. Discontinuidades en membrana.',
        desc: 'El informe COAT-DDP reveló discontinuidades críticas en los solapes de la tela asfáltica oculta bajo el geotextil. Gracias a la detección dieléctrica, la fuga fue mapeada en la superficie de la baldosa, posibilitando reparaciones ultra localizadas y de bajísimo coste comparado a una sustitución total.'
      }
    },
    {
      id: 'case-4',
      system: 'Capa vegetal',
      systemDesc: 'Sistema: protección de pavimento de capa vegetal en ajardinamiento, geotextil y membrana de PVC.',
      before: {
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFj649NQ6BiOF_qAeUp3lvmwYR5QLkfk4nfunFI2DVLsLnFPVehgBdCOoRVdojizQtggDtfvLHCziMgPN72iVC0GH7qfpOmxHV9Sjb7x7uAWDhARPT7RYceiZU8qBUvSSMfz3mnh8D5z12P4lJB6T1mJLOVqheOyLOWsYgELhjWaRyycyep4Yq0J_gVtcrpL_b_tBy-2mL5OeQoxYR6jlCpac-3yzVe7JNCeAOxjYTIkvoWwKcMN8Fl20JrFIg9ZjskztPSBERIkPQ',
        title: 'Espacio a Supervisar',
        subtitle: 'Delimitación en verde',
        desc: 'Preparación de área verde. El flujo electromagnético penetrará el espesor de la capa vegetal del ajardinamiento para evaluar capilaridades, perforaciones por raíces o rupturas invisibles desde la superficie en la membrana de PVC.'
      },
      after: {
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMCZxZNgJDfBCEO9lqsiwwiFQb9Ntzd0taJfnXxZZ1nfos-bIM5fMhZrhrfNb_HflvGsl0n-i3OqKU1FIeCnQrDCR5NUZKTpOFU1gQytRswbO1G-hlrEDhwGnGXESwxOVc7MFRyEQ8LHr9CuJS1RPWm6rsSpXn_hU-t3Htb05C45aqYkGrFF6uPQMql41cvDGhwc3zLPrpYLs5TOT50PdpHXWuHp5Arq5dzcqNDlnwoHEp8t8fA3AadQCFcTVLfMIm_QwoSef2-QeJ',
        title: 'Filtraciones Encontradas',
        subtitle: 'Clasificación COAT-DDP. Discontinuidades en membrana.',
        desc: 'Identificación positiva (COAT-DDP) de discontinuidades en la membrana de PVC, ocasionadas por estrés radicular. La filtración fue triangulada con éxito milimétrico sin necesidad de levantar o destruir la totalidad del costoso paisajismo ajardinado.'
      }
    }
  ];

  return (
    <div className="w-full text-on-surface">
      {/* Hero Section */}
      <header className="relative w-full min-h-[calc(100vh-80px)] md:h-[calc(100vh-80px)] flex flex-col justify-center pt-8 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100">
        <div className="absolute inset-0 w-full h-full z-0">
          <CssDetectionFloor />
          <div className="absolute inset-0 bg-white/70 md:bg-white/50 z-10 pointer-events-none backdrop-blur-[2px]" />
        </div>

        {/* Ambient radial lighting */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-30 max-w-7xl mx-auto px-6 md:px-16 w-full grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Typography */}
          <div className="md:col-span-6 lg:col-span-5 flex flex-col justify-center text-left">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full bg-white/90 border border-slate-200/80 backdrop-blur-md shadow-xs w-max"
            >
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="font-sans font-bold text-slate-800 uppercase tracking-widest text-[10px]">
                Tecnología Dieléctrica · Normativa UNE
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, x: -30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl text-slate-900 leading-[1.08] tracking-tight mb-6"
            >
              Detección Electrónica de Filtraciones
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, x: -20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="text-base md:text-lg text-slate-600 font-sans max-w-xl leading-relaxed font-normal mb-8"
            >
              Diagnóstico de alta precisión sin demoliciones ni pruebas de inundación. Tecnología dieléctrica avanzada que localiza microfisuras con <strong className="text-slate-900 font-bold">exactitud sub-milimétrica</strong>.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <button 
                onClick={() => onNavigate('contact', 'push')}
                className="px-8 py-4 bg-secondary text-white font-sans font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-[#c92548] transition-all shadow-xl shadow-secondary/25 hover:shadow-2xl hover:shadow-secondary/35 active:scale-95 flex items-center justify-center gap-3 w-full sm:w-auto group cursor-pointer"
              >
                Solicitar Diagnóstico <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <a 
                href="#tecnologia" 
                onClick={(e) => { e.preventDefault(); document.getElementById('tecnologia')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="px-8 py-4 bg-white/80 border border-slate-200/90 text-primary font-sans font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-white hover:border-primary/40 shadow-xs hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-3 w-full sm:w-auto"
              >
                Conocer la Tecnología
              </a>
            </motion.div>
          </div>

          {/* Right Column: Premium Image with Floating Cards */}
          <div className="md:col-span-6 lg:col-span-7 relative h-full flex items-center justify-center pt-8 md:pt-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-xl mx-auto aspect-[4/3]"
            >
              <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl border border-white/40 ring-1 ring-slate-900/5">
                <img 
                  src={imgHeroDeteccion} 
                  alt="Técnico realizando detección dieléctrica de filtraciones" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#001c3a]/40 via-transparent to-transparent pointer-events-none" />
              </div>
              
              {/* Floating Metric 1 */}
              <motion.div 
                animate={{ y: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="absolute top-6 md:top-10 -left-4 md:-left-8 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-slate-200/80 flex items-center gap-3.5 z-10"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Target className="text-emerald-600 w-5 h-5" />
                </div>
                <div className="pr-2">
                  <p className="font-display font-extrabold text-slate-900 text-lg md:text-xl leading-tight">99.9%</p>
                  <p className="font-sans text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-0.5">Precisión Sub-Milimétrica</p>
                </div>
              </motion.div>

              {/* Floating Metric 2 */}
              <motion.div 
                animate={{ y: [5, -5, 5] }}
                transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-8 md:bottom-10 -right-4 md:-right-8 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-slate-200/80 flex items-center gap-3.5 z-10"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="text-primary w-5 h-5" />
                </div>
                <div className="pr-2">
                  <p className="font-display font-extrabold text-slate-900 text-base md:text-lg leading-tight">Normativa UNE</p>
                  <p className="font-sans text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-0.5">Ensayos Certificados</p>
                </div>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </header>

      <main>
        {/* The Core Concept: Bento Grid */}
        <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center lg:items-start">
            
            {/* Intro Text */}
            <div className="md:col-span-5 flex flex-col justify-center pr-0 md:pr-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 border border-sky-200/60 rounded-full text-sky-800 text-[10px] font-bold uppercase tracking-wider mb-4 w-max">
                <Activity size={12} className="text-sky-600" />
                Revolución en Ensayos No Destructivos
              </div>
              <h2 className="font-display font-extrabold text-3xl md:text-4xl text-slate-900 mb-6 tight-tracking leading-tight">
                Prueba de Estanqueidad Sin Inundación
              </h2>
              <p className="font-sans text-base text-slate-600 mb-6 leading-relaxed">
                La inspección dieléctrica representa el estándar más avanzado en patología constructiva. Sustituye los métodos tradicionales de inundación por un mapeo de flujo eléctrico que detecta cualquier fisura de forma <strong className="text-slate-800">instantánea y sin sobrecargar la estructura</strong>.
              </p>
              <div className="w-16 h-1 bg-secondary rounded-full mb-6" />
              <p className="font-sans text-xs md:text-sm text-slate-500 leading-relaxed">
                Metodología avalada por normativas UNE y ASTM para ensayos no destructivos en cubiertas planas e inclinadas.
              </p>
            </div>
            
            {/* Benefits Bento */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5 mt-10 md:mt-0">
              
              <div className="bg-white border border-slate-200/80 p-8 rounded-3xl flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="text-sky-600 w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-slate-900 mb-2.5 text-lg">Resultados Instantáneos</h3>
                <p className="font-sans text-xs md:text-sm text-slate-600 leading-relaxed">
                  Evita esperas de 48 a 72 horas propias de inundaciones. El escaneo electrónico proporciona lecturas y coordenadas exactas en tiempo real.
                </p>
              </div>
              
              <div className="bg-white border border-slate-200/80 p-8 rounded-3xl flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Scale className="text-amber-600 w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-slate-900 mb-2.5 text-lg">0% Sobrecarga Estructural</h3>
                <p className="font-sans text-xs md:text-sm text-slate-600 leading-relaxed">
                  Elimina el riesgo de colapso o fisuración por peso masivo de agua. El edificio conserva su estado estructural intacto.
                </p>
              </div>
              
              <div className="bg-white border border-slate-200/80 p-8 rounded-3xl flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Target className="text-secondary w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-slate-900 mb-2.5 text-lg">Precisión Sub-Milimétrica</h3>
                <p className="font-sans text-xs md:text-sm text-slate-600 leading-relaxed">
                  Localiza porosidades, soldaduras defectuosas y fisuras microscópicas invisibles a inspecciones visuales o térmicas estándar.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-[#001c3a] to-[#003b70] border border-primary/20 p-8 rounded-3xl flex flex-col hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-white group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <CheckCircle className="text-white w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-white mb-2.5 text-lg">Normativa UNE Oficial</h3>
                <p className="font-sans text-xs md:text-sm text-blue-100/90 leading-relaxed">
                  Procedimientos estandarizados y certificados con validez legal y técnica ante compañías de seguros y dirección facultativa.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Breakdown */}
        <section className="py-24 bg-slate-50/80 border-y border-slate-200/60 overflow-hidden" id="tecnologia">
          <div className="max-w-7xl mx-auto px-6 md:px-16">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100 text-sky-800 font-sans font-bold text-[10px] rounded-full uppercase tracking-widest mb-4">
                <Sparkles size={12} className="text-sky-600" /> Metodologías Especializadas
              </span>
              <h2 className="font-display font-extrabold text-3xl md:text-4xl text-slate-900 mb-4">
                Dualidad Tecnológica para Cobertura Total
              </h2>
              <p className="font-sans text-slate-600 text-sm md:text-base leading-relaxed">
                Adaptamos el método de barrido eléctrico a la tipología exacta de membrana, nivel de humedad y aislamiento del inmueble.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Low Voltage */}
              <div className="bg-white border border-slate-200/80 p-8 lg:p-10 rounded-3xl flex flex-col relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Zap strokeWidth={1} className="w-48 h-48 text-primary" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-sky-50 text-sky-700 border border-sky-200/60 font-sans font-bold text-[10px] rounded-full uppercase tracking-wider">
                      Método Húmedo (EFVM)
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">01 / 02</span>
                  </div>
                  <h3 className="font-display font-extrabold text-2xl text-slate-900 mb-4">
                    Baja Tensión Vectorial
                  </h3>
                  <p className="font-sans text-sm text-slate-600 mb-8 leading-relaxed">
                    Ideal para cubiertas protegidas con grava, cubiertas ajardinadas o superficies bajo cargas pesadas. Utiliza un circuito de baja tensión y mapeo de vectores de flujo sobre una superficie pre-humedecida para orientar al operador directamente al punto de falla.
                  </p>
                  <ul className="space-y-3.5 font-sans text-xs md:text-sm text-slate-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-secondary w-5 h-5 shrink-0 mt-0.5" />
                      <span>Eficaz en cubiertas ajardinadas y techos verdes extensivos.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-secondary w-5 h-5 shrink-0 mt-0.5" />
                      <span>Mapeo perimetral y lectura vectorial de campos amplios.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-secondary w-5 h-5 shrink-0 mt-0.5" />
                      <span>Detección precisa bajo grava sin retirada masiva de material.</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* High Voltage */}
              <div className="bg-white border border-slate-200/80 p-8 lg:p-10 rounded-3xl flex flex-col relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Zap strokeWidth={1.5} className="w-48 h-48 text-primary" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 font-sans font-bold text-[10px] rounded-full uppercase tracking-wider">
                      Método Seco (Spark Testing)
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">02 / 02</span>
                  </div>
                  <h3 className="font-display font-extrabold text-2xl text-slate-900 mb-4">
                    Alta Tensión por Arco Eléctrico
                  </h3>
                  <p className="font-sans text-sm text-slate-600 mb-8 leading-relaxed">
                    Diseñado para membranas secas expuestas. Un electrodo de barrido con carga de alta tensión se desplaza por la superficie. Cualquier poro permite el paso de un arco eléctrico hacia el sustrato conductor, activando una señal visual y auditiva inmediata.
                  </p>
                  <ul className="space-y-3.5 font-sans text-xs md:text-sm text-slate-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-secondary w-5 h-5 shrink-0 mt-0.5" />
                      <span>Apto para membranas de PVC, TPO, EPDM y asfálticas secas.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-secondary w-5 h-5 shrink-0 mt-0.5" />
                      <span>Inspección de alta velocidad: hasta 2.000 m²/día por cuadrilla.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-secondary w-5 h-5 shrink-0 mt-0.5" />
                      <span>Detección de defectos microscópicos en juntas y solapes.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto overflow-hidden">
          <div>
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 font-sans font-bold text-[10px] rounded-full uppercase tracking-widest mb-4">
                Protocolo Sistemático
              </span>
              <h2 className="font-display font-extrabold text-3xl md:text-4xl text-slate-900 mb-4">
                Metodología de Inspección en 4 Fases
              </h2>
              <p className="font-sans text-slate-600 text-sm md:text-base leading-relaxed">
                Garantizamos máxima rigurosidad desde la auditoría inicial hasta la entrega del informe técnico pericial.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
              
              {/* Step 1 */}
              <div className="bg-white border border-slate-200/80 p-8 rounded-3xl flex flex-col text-center items-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Eye size={26} />
                </div>
                <span className="font-mono text-xs font-extrabold text-slate-400 mb-1">FASE 01</span>
                <h4 className="font-display font-bold text-slate-900 text-lg mb-2">Auditoría Visual</h4>
                <p className="font-sans text-xs md:text-sm text-slate-600 leading-relaxed">
                  Inspección preliminar del sustrato, perímetros y elementos pasantes para determinar la viabilidad del ensayo.
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="bg-white border border-slate-200/80 p-8 rounded-3xl flex flex-col text-center items-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <SlidersHorizontal size={26} />
                </div>
                <span className="font-mono text-xs font-extrabold text-slate-400 mb-1">FASE 02</span>
                <h4 className="font-display font-bold text-slate-900 text-lg mb-2">Calibración</h4>
                <p className="font-sans text-xs md:text-sm text-slate-600 leading-relaxed">
                  Ajuste de sensibilidad según grosor del material aislante, conductividad del sustrato y humedad ambiente.
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="bg-gradient-to-br from-[#001c3a] to-[#003b70] text-white p-8 rounded-3xl flex flex-col text-center items-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Radar size={26} />
                </div>
                <span className="font-mono text-xs font-extrabold text-blue-200 mb-1">FASE 03</span>
                <h4 className="font-display font-bold text-white text-lg mb-2">Barrido Dieléctrico</h4>
                <p className="font-sans text-xs md:text-sm text-blue-100/90 leading-relaxed">
                  Mapeo exhaustivo marcando con precisión milimétrica cada fisura detectada sobre la propia cubierta.
                </p>
              </div>
              
              {/* Step 4 */}
              <div className="bg-white border border-slate-200/80 p-8 rounded-3xl flex flex-col text-center items-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <FileText size={26} />
                </div>
                <span className="font-mono text-xs font-extrabold text-slate-400 mb-1">FASE 04</span>
                <h4 className="font-display font-bold text-slate-900 text-lg mb-2">Informe Técnico</h4>
                <p className="font-sans text-xs md:text-sm text-slate-600 leading-relaxed">
                  Entrega de planimetría digital con coordenadas de patologías y protocolo recomendado de reparación quirúrgica.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Asymmetric Detail Section */}
        <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto border-t border-slate-200/60 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            {/* Image from Left */}
            <div className="md:col-span-6 relative h-[450px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl group border border-slate-200/80">
              <img 
                alt="Instrumental de detección dieléctrica de Coatline" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBO9lRgqsXOHLFU5onbx5GvMUiDlOH-lG7BIG3Ou1BTws-0kdxrp97RmqJE84igddm-LyxRCIzvBj22aiaV5gPA-69ENsYUdOvKvkCJ6Vcis2vz-137oWFnTzzjk-5z-pvE46_LGZmqQoRF1x9QSapbY1rvlPi7oeiq8iHd0mzpxr816jxoUxrsANqiuBuVdPIDDPiE104MbtGIc_xKLnAtLfmfwn5IUldNtetvnG_lhQmdt-6hSD0kNbEzbHlCieAf46HbU-LqRihJ" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/40 shadow-lg">
                <p className="font-display font-bold text-slate-900 text-sm">Calibración Certificada</p>
                <p className="font-sans text-xs text-slate-600 mt-0.5">Equipos sometidos a trazabilidad metrológica periódica.</p>
              </div>
            </div>
            
            {/* Text Specs from Right */}
            <div className="md:col-span-6 flex flex-col pt-4 md:pt-0">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full text-secondary text-[10px] font-bold uppercase tracking-wider mb-4 w-max">
                <Target size={12} /> Alta Fidelidad Instrumental
              </span>
              <h2 className="font-display font-extrabold text-3xl md:text-4xl text-slate-900 mb-6 leading-tight">
                Equipamiento de Grado Instrumental
              </h2>
              <p className="font-sans text-base text-slate-600 mb-8 leading-relaxed">
                Coatline no compromete la precisión del diagnóstico. Empleamos instrumental electroquímico de última generación capaz de discriminar interferencias electromagnéticas y adaptarse a sustratos complejos.
              </p>
              
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-display font-bold text-slate-900 text-base">Calibración Dinámica Adaptativa</span>
                  </div>
                  <p className="font-sans text-xs md:text-sm text-slate-600 pl-5 leading-relaxed">
                    Ajuste automático a variaciones resistivas provocadas por el gradiente térmico del sol y la humedad del ambiente.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="w-2 h-2 rounded-full bg-secondary" />
                    <span className="font-display font-bold text-slate-900 text-base">Ingenieros de Ensayo Certificados</span>
                  </div>
                  <p className="font-sans text-xs md:text-sm text-slate-600 pl-5 leading-relaxed">
                    Operadores técnicos con titulación y formación continua en termodinámica y comportamiento dieléctrico de polímeros.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Intervenciones Reales en Obra */}
        <section id="casos-reales" className="py-24 px-6 md:px-16 bg-[#001c3a] text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none">
            <img 
              alt="Drone inspection" 
              className="w-full h-full object-cover grayscale" 
              src="https://lh3.googleusercontent.com/aida/AP1WRLtEDcDFvNu8D5U3A-uzTqD63IRxtZ6TufJbN9phijt3N5tYaremtj1MTpci_K76Il3T4DTRdF04Wp2lcipvRwrMJNkFLEC3WjoMAYtHhW1E1VrkvV1esrbKXe91f8MViBAwfuhlWSY5zxY0Rfzzjy1JuOmu1GhHFhdpdFQv3_p1Jz9JAHWTbbnE8FPW3PjJ1eiBRsxrf1azJjq65F58MyprJJ4GvCfsuHA6bSuVk-YKer_stj0LI8SR-JVS" 
            />
          </div>
          
          {/* Ambient lighting */}
          <div className="absolute top-10 left-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <span className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 bg-secondary/20 border border-secondary/30 rounded-full font-sans font-bold text-[10px] text-pink-200 uppercase tracking-widest mb-6">
                <Target size={12} className="text-secondary" /> Demostración Interactiva
              </span>
              <h2 className="font-display font-extrabold text-3xl md:text-5xl text-white mb-6 tracking-tight">
                Intervenciones Reales en Obra
              </h2>
              <p className="font-sans text-base md:text-lg text-blue-100/90 leading-relaxed max-w-2xl mx-auto font-light">
                Descubra cómo nuestra tecnología de <strong className="text-white font-bold">precisión quirúrgica</strong> evita demoliciones masivas, permitiendo inspeccionar hasta 2.000 m²/día sin recurrir a pruebas de inundación.
              </p>
            </div>
            
            <AnimatePresence mode="wait">
              {!selectedCard ? (
                <motion.div 
                  key="grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 overflow-hidden"
                >
                  {cases.map((c) => (
                    <div 
                      key={c.id} 
                      onClick={() => setSelectedCard(c)}
                      className="bg-white rounded-3xl overflow-hidden flex flex-col transition-all duration-300 cursor-pointer group border border-white/10 hover:border-secondary shadow-lg hover:shadow-2xl hover:-translate-y-1.5"
                    >
                      <div className="aspect-video overflow-hidden relative">
                        <img 
                          alt={c.system} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          src={c.before.img} 
                        />
                        <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/0 transition-colors" />
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-white/20">
                          <Eye size={12} /> Comparar
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-grow text-left bg-white">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 rounded-full text-sky-800 mb-3 w-max">
                           <Radar size={11} className="text-secondary" />
                           <span className="font-sans font-bold text-[9px] uppercase tracking-wider">Caso Dieléctrico</span>
                        </div>
                        <h3 className="font-display font-bold text-lg mb-2 text-slate-900 leading-tight group-hover:text-primary transition-colors">
                          {c.system}
                        </h3>
                        <p className="font-sans text-xs text-slate-500 flex-grow leading-relaxed line-clamp-3">
                          {c.systemDesc}
                        </p>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-secondary font-sans font-bold text-xs">
                          <span>Ver diagnóstico</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="viewer"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <CaseViewer 
                    c={selectedCard} 
                    onClose={() => setSelectedCard(null)} 
                    onNext={() => {
                      const currentIndex = cases.findIndex(c => c.id === selectedCard.id);
                      setSelectedCard(cases[(currentIndex + 1) % cases.length]);
                    }}
                    onPrev={() => {
                      const currentIndex = cases.findIndex(c => c.id === selectedCard.id);
                      setSelectedCard(cases[(currentIndex - 1 + cases.length) % cases.length]);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 px-6 md:px-16 relative overflow-hidden bg-gradient-to-b from-slate-900 to-[#001c3a] text-white" id="contacto">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="w-16 h-16 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-6 shadow-xl">
              <ShieldCheck size={32} className="text-secondary" />
            </div>
            
            <h2 className="font-display font-extrabold text-3xl md:text-5xl text-white mb-6 tracking-tight">
              Proteja su activo con precisión milimétrica
            </h2>
            <p className="font-sans text-base md:text-lg text-blue-100/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Evite demoliciones innecesarias y filtraciones ocultas. Programe un ensayo dieléctrico certificado y reciba certeza absoluta sobre el estado de su cubierta.
            </p>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 text-center shadow-2xl max-w-2xl mx-auto flex flex-col items-center">
              <h3 className="font-display font-bold text-2xl text-white mb-3">¿Listo para auditar su impermeabilización?</h3>
              <p className="font-sans text-xs md:text-sm text-blue-100/80 mb-8 max-w-md mx-auto leading-relaxed">
                Nuestros ingenieros evaluarán las especificaciones de su inmueble y emitirán una propuesta técnica sin compromiso en 24 horas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
                <button 
                  onClick={() => onNavigate('contact', 'push')}
                  className="px-8 py-4 bg-secondary text-white font-sans font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-[#c92548] transition-all shadow-xl shadow-secondary/30 hover:shadow-2xl hover:shadow-secondary/40 active:scale-95 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  Solicitar Diagnóstico <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => onNavigate('cases', 'push')}
                  className="px-8 py-4 bg-white/5 border border-white/20 text-white font-sans font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-colors active:scale-95 flex items-center justify-center cursor-pointer"
                >
                  Ver Casos Reales
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
