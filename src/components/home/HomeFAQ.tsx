import React, { useState } from 'react';
import { ChevronDown, ShieldCheck, Phone, Mail, ArrowRight, FileCheck2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HomeFAQ() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: '¿Qué incluye el programa ZERO FILTRACIONES?',
      answer: (
        <div>
          <p>Es un servicio de mantenimiento preventivo y predictivo con:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-sm md:text-base 2xl:text-lg">
            <li>Inspecciones periódicas con tecnología avanzada.</li>
            <li>Diagnóstico preciso sin desmontaje de instalaciones existentes.</li>
            <li>Limpieza de superficies, sellado de fisuras y reaplicación de impermeabilización.</li>
            <li>Cobertura integral de la mayoría de actuaciones mediante tarifa mensual.</li>
          </ul>
        </div>
      )
    },
    {
      question: '¿Qué garantía tienen los trabajos realizados por Coatline?',
      answer: 'Ofrecemos una garantía completa sobre la impermeabilización de superficies y cubiertas existentes, siempre que el cliente esté adherido al programa ZERO FILTRACIONES. La garantía permanece activa mientras se mantenga la suscripción al programa, que incluye inspecciones y mantenimientos preventivos.'
    },
    {
      question: '¿Cuál es el coste del programa ZERO FILTRACIONES?',
      answer: 'El programa funciona mediante una cuota mensual fija, calculada según el tamaño y la complejidad de la superficie, los materiales necesarios y el nivel de mantenimiento requerido. Ofrecemos planes de suscripción flexibles con financiación de 36 a 60 meses.'
    },
    {
      question: '¿Puede Coatline emitir certificados de estanqueidad?',
      answer: 'Sí. Emitimos certificados de estanqueidad conforme a normativa UNE, sin necesidad de pruebas de llenado. Esto permite validar técnicamente la estanqueidad sin consumir agua ni añadir peso, ideal para promotores, constructoras y direcciones facultativas.'
    }
  ];

  return (
    <section id="faqs" className="py-24 3xl:py-28 px-6 md:px-16 3xl:px-0 bg-white bg-tech-grid text-left">
      {/* Normal Screens (< 3xl): Original Centered Single-Column Layout */}
      <div className="3xl:hidden max-w-3xl mx-auto space-y-12">
        <div className="text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-primary tracking-tight">
            Preguntas Frecuentes
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((f, index) => {
            const isFaqOpen = openFaq === index;
            return (
              <div 
                key={index} 
                className="border-b border-surface-variant/40 pb-4 transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center text-left font-display font-bold text-base md:text-lg text-primary hover:text-secondary transition-colors focus:outline-none py-2 cursor-pointer"
                >
                  <span>{f.question}</span>
                  <ChevronDown
                    size={20}
                    className={`text-slate-400 transition-transform duration-300 ${isFaqOpen ? 'rotate-180 text-secondary' : 'rotate-0'}`}
                  />
                </button>

                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    isFaqOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="text-on-surface-variant font-sans text-sm md:text-base leading-relaxed">
                    {f.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Extra-Large Screens (3xl+ >= 2160px): 12-Column Split Layout */}
      <div className="hidden 3xl:block layout-container">
        <div className="grid grid-cols-12 gap-16 items-start">
          
          {/* Left Column (5 Cols): Header + Engineering Support Card */}
          <div className="col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20">
              <ShieldCheck size={14} className="text-secondary" />
              <span>Resolución de Consultas Técnicas</span>
            </div>

            <h2 className="font-display font-extrabold text-4xl text-primary tracking-tight leading-tight">
              Preguntas Frecuentes
            </h2>

            <p className="font-sans text-base text-on-surface-variant leading-relaxed">
              Resolvemos las dudas habituales de directores de mantenimiento, arquitectos, promotores y administradores de patrimonios sobre nuestros protocolos no destructivos y garantías.
            </p>

            {/* Engineering Support Card */}
            <div className="rounded-3xl p-8 text-white space-y-5 shadow-xl border border-white/10 relative overflow-hidden" style={{ backgroundColor: '#001c3a' }}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-secondary/20 border border-secondary/40 flex items-center justify-center text-secondary shrink-0">
                  <FileCheck2 size={22} />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-sky-300 block">
                    Oficina Técnica Pericial
                  </span>
                  <h4 className="font-display font-bold text-lg text-white">
                    ¿Tiene un proyecto o patología específica?
                  </h4>
                </div>
              </div>

              <p className="font-sans text-sm text-slate-300 leading-relaxed">
                Nuestros ingenieros evalúan planos, memorias de calidades y patologías activas para diseñar una propuesta técnica a medida conforme a normativa UNE.
              </p>

              <div className="pt-2 space-y-2.5 border-t border-white/10 text-sm text-slate-200">
                <a href="tel:+34914916197" className="flex items-center gap-2.5 hover:text-sky-400 transition-colors">
                  <Phone size={15} className="text-secondary shrink-0" />
                  <span className="font-semibold">+34 91 491 61 97 · Atención Técnica Directa</span>
                </a>
                <a href="mailto:info@coatline.es" className="flex items-center gap-2.5 hover:text-sky-400 transition-colors">
                  <Mail size={15} className="text-sky-400 shrink-0" />
                  <span className="font-semibold">info@coatline.es</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => navigate('/contacto')}
                className="w-full py-3.5 px-5 bg-secondary hover:bg-[#c92548] text-white font-sans font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-secondary/25 cursor-pointer"
              >
                <span>Consultar con Ingeniería</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Right Column (7 Cols): Accordion Cards */}
          <div className="col-span-7 space-y-4">
            {faqs.map((f, index) => {
              const isFaqOpen = openFaq === index;
              return (
                <div 
                  key={index} 
                  className={`rounded-2xl border transition-all duration-300 p-6 ${
                    isFaqOpen
                      ? 'bg-surface-container/60 border-primary/25 shadow-md'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex justify-between items-center gap-4 text-left font-display font-bold text-lg text-primary hover:text-secondary transition-colors focus:outline-none cursor-pointer"
                  >
                    <span>{f.question}</span>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isFaqOpen ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-300 ${isFaqOpen ? 'rotate-180' : 'rotate-0'}`}
                      />
                    </div>
                  </button>

                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      isFaqOpen ? 'max-h-[500px] opacity-100 mt-4 pt-4 border-t border-slate-200/70' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="text-on-surface-variant font-sans text-base leading-relaxed">
                      {f.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
