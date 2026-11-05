import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { ScreenId } from '../../types';

interface HomeCTAProps {
  onNavigate: (screen: ScreenId, transition: 'none' | 'push') => void;
}

export default function HomeCTA({ onNavigate }: HomeCTAProps) {
  return (
    <section className="py-20 px-6 md:px-16 bg-surface-container overflow-hidden">
      <div 
        className="max-w-4xl mx-auto text-center flex flex-col items-center justify-center space-y-6 bg-white p-8 md:p-12 rounded-3xl border border-slate-200/80 shadow-md"
      >
        <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
          <ShieldCheck size={24} />
        </div>
        <h3 className="font-display font-extrabold text-2xl md:text-3xl text-primary">
          ¿Necesita proteger su inversión arquitectónica?
        </h3>
        <p className="font-sans text-sm md:text-base text-slate-600 max-w-2xl leading-relaxed">
          Contacte con nuestro equipo de especialistas para una evaluación técnica de sus superficies y descubra cómo el programa Zero Filtraciones puede garantizar la integridad estructural de su proyecto a largo plazo.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('contact', 'push')}
          className="inline-flex items-center justify-center px-8 py-4 bg-secondary text-white font-sans font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-[#c92548] transition-all gap-2 shadow-lg shadow-secondary/25 hover:shadow-xl active:scale-[0.98] cursor-pointer"
        >
          Solicitar Información
          <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}
