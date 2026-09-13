import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
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
  ChevronsLeftRight
} from 'lucide-react';
import { ScreenId } from '../types';
import CssDetectorCart from '../components/animations/CssDetectorCart';
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
            className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors font-sans text-sm uppercase tracking-widest font-bold"
          >
            <ArrowRight className="rotate-180" size={16} /> Volver a Casos
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onPrev}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors border border-white/10"
              title="Caso Anterior"
            >
              <ArrowRight className="rotate-180" size={16} />
            </button>
            <button 
              onClick={onNext}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors border border-white/10"
              title="Caso Siguiente"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={c.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row h-auto lg:h-[75vh] lg:max-h-[800px] lg:min-h-[500px]"
          >
            {/* Slider Section */}
            <div className="w-full lg:w-3/5 h-[40vh] lg:h-full relative bg-slate-900 select-none touch-none">
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
                  className="absolute inset-y-0 flex items-center justify-center"
                  style={{ left: `${sliderPos}%`, marginLeft: '-1px' }}
                >
                  <div className="w-[3px] h-full bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
                  <div className="absolute w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center border-2 border-primary/20 text-primary pointer-events-none group-hover:scale-110 transition-transform">
                    <ChevronsLeftRight size={24} />
                  </div>
                </div>
                
                {/* Labels overlay */}
                <div className="absolute top-4 left-4 lg:top-6 lg:left-6 pointer-events-none">
                  <div className="px-3 py-1.5 lg:px-4 lg:py-2 bg-black/60 backdrop-blur text-white text-xs lg:text-sm font-bold rounded shadow-lg uppercase tracking-widest">
                    Espacio a Supervisar
                  </div>
                </div>
                <div className="absolute top-4 right-4 lg:top-6 lg:right-6 pointer-events-none">
                  <div className="px-3 py-1.5 lg:px-4 lg:py-2 bg-secondary/90 backdrop-blur text-white text-xs lg:text-sm font-bold rounded shadow-lg uppercase tracking-widest flex items-center gap-2">
                    <Zap size={12} className="fill-white lg:w-[14px] lg:h-[14px]" />
                    Filtraciones
                  </div>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="w-full lg:w-2/5 p-6 lg:p-10 flex flex-col bg-slate-50 text-slate-900 overflow-y-auto">
              <div className="mb-8 flex flex-col">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded text-primary mb-4 w-max shadow-sm">
                  <Radar size={12} className="text-secondary" />
                  <span className="font-sans font-bold text-[9px] uppercase tracking-wider">Caso de Estudio</span>
                </div>
                <h3 className="font-display font-bold text-3xl lg:text-4xl mb-3 text-slate-800 leading-tight">
                  {c.system}
                </h3>
                <p className="font-sans text-sm md:text-base font-medium text-slate-600 border-l-4 border-slate-300 pl-4 mt-2 leading-relaxed">
                  {c.systemDesc}
                </p>
              </div>
              
              <div className="space-y-6 flex-grow">
                {/* Before Details */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <h4 className="font-display font-bold text-xl text-primary">{c.before.title}</h4>
                  </div>
                  <p className="font-sans text-xs uppercase tracking-wider font-bold text-slate-500 mb-3">
                    {c.before.subtitle}
                  </p>
                  <p className="font-sans text-sm md:text-base text-slate-600 leading-relaxed">
                    {c.before.desc}
                  </p>
                </div>

                {/* After Details */}
                <div className="bg-white p-6 rounded-xl border border-secondary/20 shadow-md relative overflow-hidden transition-all hover:shadow-lg">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary" />
                  <div className="flex items-center gap-2 mb-3">
                    <Zap size={20} className="text-secondary fill-secondary/20" />
                    <h4 className="font-display font-bold text-xl text-secondary">{c.after.title}</h4>
                  </div>
                  <p className="font-sans text-xs uppercase tracking-wider font-bold text-red-600 mb-3">
                    {c.after.subtitle}
                  </p>
                  <p className="font-sans text-sm md:text-base text-slate-700 leading-relaxed font-medium">
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
      <header className="relative w-full min-h-[calc(100vh-80px)] md:h-[calc(100vh-80px)] flex flex-col justify-center pt-8 overflow-hidden">
        <div className="absolute inset-0 w-full h-full z-0">
          <CssDetectionFloor />
          {/* Subtle vignette and blur to ensure text readability and create a premium feel */}
          <div className="absolute inset-0 bg-background/70 md:bg-background/50 z-10 pointer-events-none backdrop-blur-[2px]" />
        </div>
        
        <div className="relative z-30 max-w-7xl mx-auto px-6 md:px-16 w-full grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Typography */}
          <div className="md:col-span-6 lg:col-span-5 flex flex-col justify-center text-left">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-white/80 border border-slate-300 backdrop-blur-md shadow-sm w-max"
            >
              <Settings size={14} className="text-secondary" />
              <span className="font-sans font-bold text-slate-800 uppercase tracking-widest text-[10px]">
                Tecnología de Vanguardia
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, x: -30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl text-slate-900 leading-[1.1] tracking-tight mb-6"
            >
              Detección Electrónica de Filtraciones
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, x: -20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="text-base md:text-lg lg:text-xl text-slate-700 font-sans max-w-xl leading-relaxed font-medium mb-10"
            >
              Diagnóstico de alta precisión sin alteraciones estructurales. Tecnología no invasiva que identifica microfisuras con exactitud milimétrica.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <a 
                href="#contacto" 
                onClick={(e) => { e.preventDefault(); document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="px-8 py-4 bg-secondary text-white font-sans font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-[#9a0c2d] transition-all shadow-xl shadow-secondary/30 active:scale-95 flex items-center justify-center gap-3 w-full sm:w-auto"
              >
                Solicitar Diagnóstico <ArrowRight size={16} />
              </a>
              <a 
                href="#tecnologia" 
                onClick={(e) => { e.preventDefault(); document.getElementById('tecnologia')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="px-8 py-4 bg-white/50 border-2 border-[#001c3a]/20 text-[#001c3a] font-sans font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-white hover:border-[#001c3a] transition-all active:scale-95 flex items-center justify-center gap-3 w-full sm:w-auto"
              >
                Conocer la Tecnología
              </a>
            </motion.div>
          </div>

          {/* Right Column: Premium Image with Floating Cards */}
          <div className="md:col-span-6 lg:col-span-7 relative h-full flex items-center justify-center pt-16 md:pt-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-xl mx-auto aspect-[4/3]"
            >
              <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                <img 
                  src={imgHeroDeteccion} 
                  alt="Técnico realizando detección termográfica" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#001c3a]/30 to-transparent pointer-events-none" />
              </div>
              
              {/* Floating Metric 1 */}
              <motion.div 
                animate={{ y: [-6, 6, -6] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="absolute top-6 md:top-10 -left-6 md:-left-12 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-xl border border-white/50 flex items-center gap-4 z-10"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Target className="text-emerald-600 w-5 h-5" />
                </div>
                <div className="pr-2">
                  <p className="font-display font-bold text-slate-900 text-lg md:text-xl leading-tight">99.9%</p>
                  <p className="font-sans text-[10px] md:text-xs uppercase tracking-widest text-slate-500 font-bold mt-0.5">Precisión Exacta</p>
                </div>
              </motion.div>

              {/* Floating Metric 2 */}
              <motion.div 
                animate={{ y: [6, -6, 6] }}
                transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-8 md:bottom-12 -right-6 md:-right-12 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-xl border border-white/50 flex items-center gap-4 z-10"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="text-primary w-5 h-5" />
                </div>
                <div className="pr-2">
                  <p className="font-display font-bold text-slate-900 text-base md:text-lg leading-tight">Normativa UNE</p>
                  <p className="font-sans text-[10px] md:text-xs uppercase tracking-widest text-slate-500 font-bold mt-0.5">Certificado Oficial</p>
                </div>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </header>

      <main>
        {/* The Core Concept: Bento Grid */}
        <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center lg:items-start"
          >
            
            {/* Intro Text */}
            <div className="md:col-span-5 flex flex-col justify-center pr-0 md:pr-12">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-primary mb-6 tight-tracking">
                Prueba de Estanqueidad Sin Llenado
              </h2>
              <p className="font-sans text-base text-on-surface-variant mb-6 leading-relaxed">
                La estanqueidad electrónica representa el estándar más avanzado en inspección arquitectónica. Sustituye los métodos tradicionales de inundación por un mapeo de conductividad eléctrica que garantiza resultados inmediatos y precisos.
              </p>
              <div className="w-16 h-px bg-outline-variant mb-6" />
              <p className="font-sans text-sm text-outline leading-relaxed">
                Metodología avalada y conforme a las normativas UNE vigentes para ensayos no destructivos en edificación.
              </p>
            </div>
            
            {/* Benefits Bento */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 md:mt-0">
              
              <div className="bg-white border border-surface-variant p-8 rounded-xl flex flex-col hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                  <Zap className="text-primary w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-primary mb-3 text-lg">Resultados Instantáneos</h3>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  Evita las esperas de 48 horas de las pruebas de inundación tradicionales. El escaneo electrónico proporciona lecturas precisas en tiempo real.
                </p>
              </div>
              
              <div className="bg-white border border-surface-variant p-8 rounded-xl flex flex-col hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                  <Scale className="text-primary w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-primary mb-3 text-lg">Sin Sobrecarga Estructural</h3>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  Protege la integridad del edificio al evitar el peso masivo asociado a las pruebas de estanqueidad tradicionales.
                </p>
              </div>
              
              <div className="bg-white border border-surface-variant p-8 rounded-xl flex flex-col hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                  <Target className="text-primary w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-primary mb-3 text-lg">Alta Precisión</h3>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  Localiza porosidades y fisuras microscópicas invisibles al ojo humano con exactitud sub-milimétrica.
                </p>
              </div>
              
              <div className="bg-primary border border-primary p-8 rounded-xl flex flex-col hover:shadow-2xl transition-all duration-300 group" style={{ backgroundColor: '#003b70' }}>
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                  <CheckCircle className="text-white w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-white mb-3 text-lg">Normativa UNE</h3>
                <p className="font-sans text-sm text-blue-100 leading-relaxed">
                  Procedimientos estandarizados y certificados que cumplen con los más altos requisitos técnicos europeos.
                </p>
              </div>

            </div>
          </motion.div>
        </section>

        {/* Technology Breakdown */}
        <section className="py-24 bg-surface-container-low border-y border-surface-variant/40" id="tecnologia">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto px-6 md:px-16"
          >
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <span className="font-sans font-bold text-xs text-primary uppercase tracking-widest mb-4 block">
                Sistemas de Diagnóstico
              </span>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-primary">
                Dualidad Tecnológica para Cobertura Total
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Low Voltage */}
              <div className="bg-white border border-surface-variant p-10 lg:p-12 rounded-xl flex flex-col relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Zap strokeWidth={1} className="w-48 h-48 text-primary" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-display font-bold text-2xl text-primary mb-4 flex items-center gap-3">
                    Baja Tensión 
                    <span className="px-2 py-1 bg-surface-container-high text-on-surface-variant font-sans font-bold text-[10px] rounded uppercase">Húmedo</span>
                  </h3>
                  <p className="font-sans text-sm text-on-surface-variant mb-8 leading-relaxed">
                    Ideal para superficies de impermeabilización expuestas o bajo cargas ligeras. Utiliza un circuito de baja tensión y un mapeo de vectores de flujo sobre una superficie pre-humedecida. La corriente fluye hacia las penetraciones conectadas a tierra, dirigiendo al técnico exactamente al punto de fallo.
                  </p>
                  <ul className="space-y-4 font-sans text-sm text-on-surface-variant">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-secondary w-5 h-5 shrink-0 mt-0.5" />
                      Superficies expuestas y techos verdes extensivos.
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-secondary w-5 h-5 shrink-0 mt-0.5" />
                      Mapeo perimetral y de campos amplios.
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-secondary w-5 h-5 shrink-0 mt-0.5" />
                      Resolución de lectura direccional.
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* High Voltage */}
              <div className="bg-white border border-surface-variant p-10 lg:p-12 rounded-xl flex flex-col relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Zap strokeWidth={1.5} className="w-48 h-48 text-primary" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-display font-bold text-2xl text-primary mb-4 flex items-center gap-3">
                    Alta Tensión
                    <span className="px-2 py-1 bg-surface-container-high text-on-surface-variant font-sans font-bold text-[10px] rounded uppercase">Seco</span>
                  </h3>
                  <p className="font-sans text-sm text-on-surface-variant mb-8 leading-relaxed">
                    Diseñado para membranas secas expuestas. Un electrodo en forma de escoba o rodillo con carga de alta tensión se pasa sobre la superficie. Cualquier discontinuidad permite que la corriente forme un arco eléctrico hacia el sustrato conductor, activando una señal visual y auditiva inmediata.
                  </p>
                  <ul className="space-y-4 font-sans text-sm text-on-surface-variant">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-secondary w-5 h-5 shrink-0 mt-0.5" />
                      Membranas bituminosas, PVC, TPO y recubrimientos líquidos.
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-secondary w-5 h-5 shrink-0 mt-0.5" />
                      Inspección extremadamente rápida (hasta 2000 m²/día).
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-secondary w-5 h-5 shrink-0 mt-0.5" />
                      Detección de defectos capilares microscópicos.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Process Section */}
        <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
          <h2 className="font-display font-bold text-3xl md:text-4xl text-primary mb-16 text-center">
            Metodología de Inspección
          </h2>
          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-px bg-surface-variant border-t border-dashed border-slate-300" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 relative z-10">
              
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center group cursor-default">
                <div className="w-24 h-24 rounded-full bg-white border border-surface-variant flex items-center justify-center mb-6 shadow-sm relative group-hover:shadow-md transition-shadow">
                  <span className="font-display font-extrabold text-2xl text-primary">01</span>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                    <Eye size={16} />
                  </div>
                </div>
                <h4 className="font-sans font-bold text-primary mb-3">Auditoría Visual</h4>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  Inspección preliminar del sustrato y condiciones de la membrana para determinar la viabilidad técnica.
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col items-center text-center group cursor-default">
                <div className="w-24 h-24 rounded-full bg-white border border-surface-variant flex items-center justify-center mb-6 shadow-sm relative group-hover:shadow-md transition-shadow">
                  <span className="font-display font-extrabold text-2xl text-primary">02</span>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                    <SlidersHorizontal size={16} />
                  </div>
                </div>
                <h4 className="font-sans font-bold text-primary mb-3">Calibración</h4>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  Ajuste de sensibilidad del equipo según el grosor del material aislante y conductividad del sustrato.
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="flex flex-col items-center text-center group cursor-default">
                <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center mb-6 shadow-md relative ring-4 ring-primary/10 group-hover:shadow-xl transition-shadow">
                  <span className="font-display font-extrabold text-2xl">03</span>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center shadow-md">
                    <Radar size={16} />
                  </div>
                </div>
                <h4 className="font-sans font-bold text-primary mb-3">Barrido Electrónico</h4>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  Ejecución sistemática del escaneo, marcando físicamente cada anomalía detectada en tiempo real.
                </p>
              </div>
              
              {/* Step 4 */}
              <div className="flex flex-col items-center text-center group cursor-default">
                <div className="w-24 h-24 rounded-full bg-white border border-surface-variant flex items-center justify-center mb-6 shadow-sm relative group-hover:shadow-md transition-shadow">
                  <span className="font-display font-extrabold text-2xl text-primary">04</span>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                    <FileText size={16} />
                  </div>
                </div>
                <h4 className="font-sans font-bold text-primary mb-3">Informe Técnico</h4>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  Entrega de documentación planimétrica detallando patologías, coordenadas y recomendaciones de reparación.
                </p>
              </div>

            </div>
          </div>
          </motion.div>
        </section>

        {/* Asymmetric Detail Section */}
        <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto border-t border-surface-variant/40">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center"
          >
            <div className="md:col-span-6 relative h-[500px] rounded-2xl overflow-hidden shadow-xl group cursor-pointer">
              <img 
                alt="Instrumental" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBO9lRgqsXOHLFU5onbx5GvMUiDlOH-lG7BIG3Ou1BTws-0kdxrp97RmqJE84igddm-LyxRCIzvBj22aiaV5gPA-69ENsYUdOvKvkCJ6Vcis2vz-137oWFnTzzjk-5z-pvE46_LGZmqQoRF1x9QSapbY1rvlPi7oeiq8iHd0mzpxr816jxoUxrsANqiuBuVdPIDDPiE104MbtGIc_xKLnAtLfmfwn5IUldNtetvnG_lhQmdt-6hSD0kNbEzbHlCieAf46HbU-LqRihJ" 
              />
            </div>
            <div className="md:col-span-5 md:col-start-8 flex flex-col pt-8 md:pt-0">
              <h2 className="font-display font-bold text-3xl md:text-3xl text-primary mb-6">
                Equipamiento de Grado Instrumental
              </h2>
              <p className="font-sans text-base text-on-surface-variant mb-8 leading-relaxed">
                No comprometemos la precisión. Coatline emplea exclusivamente equipos de calibración instrumental de última generación, capaces de adaptarse a variaciones resistivas ambientales y materiales complejos.
              </p>
              <ul className="space-y-6">
                <li className="flex flex-col">
                  <span className="font-sans font-bold text-primary mb-1">Calibración Dinámica</span>
                  <span className="font-sans text-sm text-on-surface-variant leading-relaxed">Ajuste continuo a las condiciones de humedad y temperatura del entorno.</span>
                </li>
                <li className="w-full h-px bg-surface-variant" />
                <li className="flex flex-col">
                  <span className="font-sans font-bold text-primary mb-1">Técnicos Certificados</span>
                  <span className="font-sans text-sm text-on-surface-variant leading-relaxed">Operadores formados específicamente en termodinámica y comportamiento eléctrico de polímeros.</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </section>

        {/* Intervenciones Reales en Obra */}
        <section id="casos-reales" className="py-24 px-6 md:px-16 bg-primary text-white relative overflow-hidden" style={{ backgroundColor: '#002B54' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
          <div className="absolute inset-0 opacity-10 mix-blend-overlay">
            <img 
              alt="Drone inspection" 
              className="w-full h-full object-cover grayscale" 
              src="https://lh3.googleusercontent.com/aida/AP1WRLtEDcDFvNu8D5U3A-uzTqD63IRxtZ6TufJbN9phijt3N5tYaremtj1MTpci_K76Il3T4DTRdF04Wp2lcipvRwrMJNkFLEC3WjoMAYtHhW1E1VrkvV1esrbKXe91f8MViBAwfuhlWSY5zxY0Rfzzjy1JuOmu1GhHFhdpdFQv3_p1Jz9JAHWTbbnE8FPW3PjJ1eiBRsxrf1azJjq65F58MyprJJ4GvCfsuHA6bSuVk-YKer_stj0LI8SR-JVS" 
            />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <span className="inline-flex items-center justify-center gap-2 px-3 py-1 bg-secondary/20 border border-secondary/30 rounded-full font-sans font-bold text-[10px] text-blue-100 uppercase tracking-widest mb-6">
                <Target size={12} className="text-secondary" /> Demostración de Detección
              </span>
              <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-6 tracking-tight">
                Intervenciones Reales en Obra
              </h2>
              <p className="font-sans text-lg md:text-xl text-blue-100/90 leading-relaxed max-w-2xl mx-auto font-light">
                Resultados tangibles en el terreno. Descubra cómo nuestra tecnología de <strong className="text-white font-bold">precisión quirúrgica</strong> evita demoliciones masivas, permitiendo inspeccionar hasta 2000 m²/día sin recurrir a costosas pruebas de inundación.
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
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  {cases.map((c) => (
                    <div 
                      key={c.id} 
                      onClick={() => setSelectedCard(c)}
                      className="bg-white rounded-xl overflow-hidden flex flex-col transition-all duration-300 cursor-pointer group border border-slate-100 hover:border-secondary shadow-sm hover:shadow-md"
                    >
                      <div className="aspect-video overflow-hidden relative">
                        <img 
                          alt={c.system} 
                          className="w-full h-full object-cover" 
                          src={c.before.img} 
                        />
                        <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/10 transition-colors duration-300" />
                      </div>
                      <div className="p-6 flex flex-col flex-grow text-left relative">
                        <div className="absolute -top-4 right-6 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center border border-slate-100 text-slate-300 group-hover:text-secondary transition-colors">
                          <Eye size={14} />
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded text-primary mb-3 w-max">
                           <Radar size={10} className="text-secondary" />
                           <span className="font-sans font-bold text-[8px] uppercase tracking-wider">Caso de Estudio</span>
                        </div>
                        <h3 className="font-display font-bold text-lg mb-2 text-slate-800 leading-tight group-hover:text-primary transition-colors">
                          {c.system}
                        </h3>
                        <p className="font-sans text-xs md:text-sm text-slate-500 flex-grow leading-relaxed line-clamp-3">
                          {c.systemDesc}
                        </p>
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
          </motion.div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 px-6 md:px-16" id="contacto" style={{ backgroundColor: '#13487e' }}>
          <div className="max-w-4xl mx-auto text-center">
            <ShieldCheck size={48} className="mx-auto text-blue-300 mb-6" strokeWidth={1} />
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-6">
              Proteja su activo con precisión milimétrica
            </h2>
            <p className="font-sans text-base text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
              Evite reparaciones costosas y daños estructurales a largo plazo. Programe una inspección electrónica y obtenga certeza absoluta sobre el estado de su impermeabilización.
            </p>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 md:p-12 text-center shadow-2xl max-w-2xl mx-auto flex flex-col items-center">
              <h3 className="font-display font-bold text-2xl text-white mb-4">¿Listo para certificar su cubierta?</h3>
              <p className="font-sans text-blue-100 mb-8 max-w-md mx-auto leading-relaxed">
                Nuestros ingenieros evaluarán la viabilidad técnica de su proyecto y diseñarán el protocolo de rastreo dieléctrico adecuado para su instalación.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
                <button 
                  onClick={() => onNavigate('contact', 'push')}
                  className="px-8 py-4 bg-secondary text-white font-sans font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-[#9a0c2d] transition-all shadow-lg shadow-secondary/30 active:scale-95 flex items-center justify-center gap-2 group"
                >
                  Ir al formulario de contacto <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => onNavigate('cases', 'push')}
                  className="px-8 py-4 bg-transparent border border-blue-300/50 text-blue-100 font-sans font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-white/5 transition-colors active:scale-95 flex items-center justify-center"
                >
                  Ir a casos reales
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
