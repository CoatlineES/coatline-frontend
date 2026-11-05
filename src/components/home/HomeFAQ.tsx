import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';

export default function HomeFAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: '¿Qué incluye el programa ZERO FILTRACIONES?',
      answer: (
        <div>
          <p>Es un servicio de mantenimiento preventivo y predictivo con:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-sm md:text-base">
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
    <section id="faqs" className="py-24 px-6 md:px-16 bg-white text-left">
      <div className="max-w-3xl mx-auto space-y-12">
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
                  className={`transition-all duration-300 overflow-hidden ${isFaqOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'
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
    </section>
  );
}
