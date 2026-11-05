import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Search, FileText, Droplet, Leaf, CheckCircle2, ArrowRight } from 'lucide-react';

export default function HomeMethodology() {
  const [activeStep, setActiveStep] = useState<number>(2);

  const steps = [
    {
      num: 1,
      tag: 'FASE PREVIA',
      title: 'Limpieza profesional',
      desc: 'Retirada de sedimentos, vegetación y grava suelta para exponer y acondicionar la membrana original sin dañarla.',
      icon: <Sparkles className="w-5 h-5" />,
      img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop'
    },
    {
      num: 2,
      tag: 'DIAGNÓSTICO',
      title: 'Detección inteligente',
      desc: 'Identificación milimétrica de micro-fisuras y fallos ocultos mediante escaneo electroacústico y termografía infrarroja.',
      icon: <Search className="w-5 h-5" />,
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnBMc9Y50l5eENtm62hqtyCoehLMnjluUpUlou4vzGiDqKdZCfdN1p_JtWozsCbWV-BhnlRYlHdqRf94CmFS9zfGJsJBpiya4XyH13tblVU6H_ok7qAuB4e3012r6PKpLxxbhw5Cp0OWIO95Jg3IsmrEb8ci_ZUSn_2yhTZaQllit79K_OT3n9aeWhpm8RqBmAdMMXXip_MAJkvd2ILDF7xJyag2quROP8rxybtqWwW71QgTn8X3p4MqaB9DAM11q4YHX9yA5RquWi'
    },
    {
      num: 3,
      tag: 'INTERVENCIÓN',
      title: 'Plan de actuación quirúrgica',
      desc: 'Actuación de sellado de alta resistencia concentrada exclusivamente en los puntos dañados, sin demoler áreas sanas.',
      icon: <FileText className="w-5 h-5" />,
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSs4yJI-tD2QIHJdKR469AovAB7_0XcHzyjiEysQydaww48drJybwFlnXW837J7Q0DFgyQwGtADjkRMn7lpsW3z6zoTd6rWXe2JPSXRNdXie_Hv2hhYGjcXmZ8Kdvit62pxFa33i8KHTdmcZGLX9tRxb766ybqZCqkyiqwfcinm-_xUJzhHWEL4uUDsJ4mAeoku43lrqMpWRs5z3Auplg5bk5J7UyzuZRby3YwRpLoTfTxjzPY2Ko1x2QjFgSJw1AEmE2vrSdVWoiW'
    },
    {
      num: 4,
      tag: 'CERTIFICACIÓN',
      title: 'Prueba de estanqueidad',
      desc: 'Verificación rigurosa sin inundación destructiva bajo estricto cumplimiento del marco normativo UNE vigente.',
      icon: <Droplet className="w-5 h-5" />,
      img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800&auto=format&fit=crop'
    },
    {
      num: 5,
      tag: 'SOSTENIBILIDAD',
      title: 'Opciones de mejora energética',
      desc: 'Modernización con cubiertas reflectantes (Cool Roof), sistemas fotovoltaicos integrados o cubiertas verdes sostenibles.',
      icon: <Leaf className="w-5 h-5" />,
      img: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop'
    }
  ];

  return (
    <section id="metodologia" className="py-24 px-6 md:px-16 bg-surface-container relative overflow-hidden">
      {/* Background ambient pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />

      <div className="max-w-7xl mx-auto relative z-10">
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
            Un protocolo técnico de 5 fases estructurado para resolver patologías complejas y garantizar la estanqueidad permanente de la edificación.
          </p>
        </div>

        {/* Step Numbers Navigation Bar */}
        <div className="hidden lg:grid grid-cols-5 gap-3 mb-6 max-w-5xl mx-auto">
          {steps.map((s) => {
            const isActive = activeStep === s.num;
            return (
              <button
                key={s.num}
                onClick={() => setActiveStep(s.num)}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all duration-300 ${
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
        <div className="flex flex-col lg:flex-row items-stretch justify-center gap-4 w-full min-h-[460px] overflow-hidden">
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
