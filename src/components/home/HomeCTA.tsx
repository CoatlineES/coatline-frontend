import React from 'react';
import { ArrowRight, ShieldCheck, Phone, CheckCircle2 } from 'lucide-react';
import { ScreenId } from '../../types';

interface HomeCTAProps {
  onNavigate: (screen: ScreenId, transition: 'none' | 'push') => void;
}

export default function HomeCTA({ onNavigate }: HomeCTAProps) {
  return (
    <section className="py-20 3xl:py-24 px-6 md:px-16 3xl:px-0 bg-surface-container overflow-hidden">
      {/* Normal Screens (< 3xl): Original Centered Card */}
      <div className="3xl:hidden max-w-4xl mx-auto text-center flex flex-col items-center justify-center space-y-6 bg-white p-8 md:p-12 rounded-3xl border border-slate-200/80 shadow-md">
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

      {/* Extra-Large Screens (3xl+ >= 2160px): Panoramic Full-Width Banner */}
      <div className="hidden 3xl:block layout-container">
        <div className="w-full bg-white p-14 rounded-3xl border border-slate-200/80 shadow-lg flex flex-row items-center justify-between gap-12 text-left relative overflow-hidden">
          
          {/* Left Content */}
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-secondary/10 text-secondary font-sans font-bold text-xs uppercase tracking-widest">
              <ShieldCheck size={16} />
              <span>Diagnóstico y Protección Estructural</span>
            </div>

            <h3 className="font-display font-extrabold text-4xl text-primary tracking-tight">
              ¿Necesita proteger su inversión arquitectónica?
            </h3>

            <p className="font-sans text-base text-slate-600 leading-relaxed">
              Contacte con nuestro equipo de especialistas para una evaluación técnica de sus superficies y descubra cómo el programa Zero Filtraciones puede garantizar la integridad estructural de su proyecto a largo plazo.
            </p>

            <div className="flex flex-wrap items-center justify-start gap-4 pt-1 text-xs font-semibold text-slate-700">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-secondary" /> Sin obras destructivas
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-secondary" /> Certificación oficial UNE
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-secondary" /> Cobertura nacional e internacional
              </span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-row items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('contact', 'push')}
              className="inline-flex items-center justify-center px-8 py-4 bg-secondary text-white font-sans font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-[#c92548] transition-all gap-2.5 shadow-lg shadow-secondary/25 hover:shadow-xl active:scale-[0.98] cursor-pointer"
            >
              <span>Solicitar Información</span>
              <ArrowRight size={16} />
            </button>

            <a
              href="tel:+34914916197"
              className="inline-flex items-center justify-center px-7 py-4 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/15 font-sans font-bold text-xs uppercase tracking-widest rounded-2xl transition-all gap-2.5"
            >
              <Phone size={15} className="text-secondary" />
              <span>+34 91 491 61 97</span>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
