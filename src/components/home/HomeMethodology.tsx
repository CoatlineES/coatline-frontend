import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Zap, FileText, Leaf } from 'lucide-react';
import imgLimpieza from '../../assets/metodo_01_limpieza.jpg';
import imgDeteccionElectrica from '../../assets/metodo_02_deteccion_electrica.jpg';
import imgActuacion from '../../assets/metodo_03_actuacion.jpg';
import imgSostenibilidad from '../../assets/metodo_05_sostenibilidad.jpg';

export default function HomeMethodology() {
  const [activeStep, setActiveStep] = useState<number>(2);

  const steps = [
    {
      num: 1,
      tag: 'FASE PREVIA',
      title: 'Limpieza profesional',
      desc: 'Retirada de sedimentos, vegetación y grava suelta para exponer y acondicionar la membrana original sin dañarla.',
      icon: <Sparkles className="w-5 h-5" />,
      img: imgLimpieza
    },
    {
      num: 2,
      tag: 'DIAGNÓSTICO Y CERTIFICACIÓN',
      title: 'Detección eléctrica',
      desc: 'Localización milimétrica de poros y fisuras mediante barrido dieléctrico no destructivo y verificación de estanqueidad sin inundación bajo normativa UNE.',
      icon: <Zap className="w-5 h-5" />,
      img: imgDeteccionElectrica
    },
    {
      num: 3,
      tag: 'INTERVENCIÓN',
      title: 'Plan de actuación quirúrgica',
      desc: 'Actuación de sellado de alta resistencia concentrada exclusivamente en los puntos dañados, sin demoler áreas sanas.',
      icon: <FileText className="w-5 h-5" />,
      img: imgActuacion
    },
    {
      num: 4,
      tag: 'SOSTENIBILIDAD',
      title: 'Opciones de mejora energética',
      desc: 'Modernización con cubiertas reflectantes (Cool Roof), sistemas fotovoltaicos integrados o cubiertas verdes sostenibles.',
      icon: <Leaf className="w-5 h-5" />,
      img: imgSostenibilidad
    }
  ];

  return (
    <section id="metodologia" className="py-24 3xl:py-28 bg-surface-container relative overflow-hidden">
      {/* Background ambient pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />

      <div className="layout-container relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
            <span>Ingeniería Preventiva Cíclica</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl md:text-5xl text-primary tracking-tight">
            Metodología Proceso ZERO
          </h2>

          <p className="font-sans text-base md:text-lg text-on-surface-variant leading-relaxed">
            Un protocolo técnico de 4 fases estructurado para resolver patologías complejas y garantizar la estanqueidad permanente de la edificación.
          </p>
        </div>

        {/* Step Numbers Navigation Bar */}
        <div className="hidden lg:grid grid-cols-4 gap-3 3xl:gap-5 mb-6 max-w-4xl 3xl:max-w-none mx-auto w-full">
          {steps.map((s) => {
            const isActive = activeStep === s.num;
            return (
              <button
                key={s.num}
                onClick={() => setActiveStep(s.num)}
                className={`flex items-center gap-2.5 p-3 3xl:p-4 rounded-2xl border text-left transition-all duration-300 ${
                  isActive
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-102'
                    : 'bg-white/80 hover:bg-white text-slate-700 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  isActive ? 'bg-secondary text-white' : 'bg-slate-100 text-primary'
                }`}>
                  0{s.num}
                </div>
                <div className="truncate text-xs font-bold font-sans">
                  {s.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Expandable Cards Deck */}
        <div className="flex flex-col lg:flex-row items-stretch justify-center gap-4 3xl:gap-6 w-full min-h-[460px] 3xl:min-h-[540px] overflow-hidden">
          {steps.map((step) => {
            const isCurrentlyActive = activeStep === step.num;
            return (
              <div
                key={step.num}
                onClick={() => setActiveStep(step.num)}
                onMouseEnter={() => setActiveStep(step.num)}
                className={`group relative overflow-hidden rounded-3xl shadow-md transition-all duration-500 ease-out cursor-pointer min-h-[280px] lg:min-h-0 flex flex-col justify-end ${
                  isCurrentlyActive
                    ? 'lg:flex-[2.4] shadow-2xl shadow-primary/25 ring-2 ring-secondary'
                    : 'lg:flex-1 hover:lg:flex-[1.2] hover:shadow-xl'
                }`}
              >
                {/* Background Image with Dark Vignette */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${step.img})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001c3a] via-[#001c3a]/75 to-black/30 opacity-95 transition-opacity duration-500" />

                {/* Top Badge */}
                <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center backdrop-blur-md border ${
                    isCurrentlyActive 
                      ? 'bg-secondary text-white border-secondary/50 shadow-md' 
                      : 'bg-white/10 text-white border-white/20'
                  }`}>
                    {step.icon}
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                    Fase 0{step.num}
                  </span>
                </div>

                {/* Bottom Content Area */}
                <div className="p-6 md:p-8 text-left z-10 relative space-y-2">
                  <span className="text-[11px] font-sans font-extrabold text-secondary uppercase tracking-widest block">
                    {step.tag}
                  </span>
                  
                  <h3 className="font-display font-extrabold text-xl md:text-2xl text-white tracking-tight">
                    {step.title}
                  </h3>

                  <p className={`font-sans text-xs md:text-sm text-slate-200 leading-relaxed transition-all duration-300 overflow-hidden ${
                    isCurrentlyActive ? 'max-h-36 opacity-100 pt-1' : 'max-h-0 opacity-0 lg:max-h-0'
                  }`}>
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
