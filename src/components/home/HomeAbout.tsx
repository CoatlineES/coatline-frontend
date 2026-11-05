import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Award, Globe2, Target, CheckCircle2 } from 'lucide-react';

export default function HomeAbout() {
  const stats = [
    { value: '+19', label: 'Años de Experiencia', sub: 'Liderando el sector desde 2005' },
    { value: '+500k', label: 'Metros Cuadrados', sub: 'Superficie técnica protegida' },
    { value: '0%', label: 'Obras Invasivas', sub: 'Diagnóstico 100% no destructivo' },
    { value: '100%', label: 'Garantía Técnica', sub: 'Estanqueidad certificada UNE' },
  ];

  const pillars = [
    {
      icon: <Award className="w-5 h-5 text-secondary" />,
      title: 'Trayectoria Consolidada',
      desc: '19 años aportando rigor de ingeniería a grandes corporaciones, patrimonios históricos e instalaciones críticas.'
    },
    {
      icon: <Globe2 className="w-5 h-5 text-primary" />,
      title: 'Presencia Internacional',
      desc: 'Estrategia global con amplia trayectoria en el continente americano y plena consolidación en el mercado europeo.'
    },
    {
      icon: <Target className="w-5 h-5 text-sky-500" />,
      title: 'Detección de Precisión',
      desc: 'Equipamiento de vanguardia en termografía, drones y escáneres electroacústicos para localizar micro-fallos sin romper.'
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      title: 'Compromiso de Calidad',
      desc: 'Intervenciones respaldadas por ensayos de estanqueidad sin agua y emisión de informes periciales oficiales.'
    }
  ];

  return (
    <section id="nosotros" className="py-24 px-6 md:px-16 bg-surface-container relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 text-left">
        <div className="space-y-16">
          {/* Top Story Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center overflow-hidden">
            {/* Left Column: Story + Pillars */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20">
                <ShieldCheck size={14} className="text-secondary" />
                <span>Sobre Coatline</span>
              </div>

              <h2 className="font-display font-black text-3xl md:text-5xl text-primary tracking-tight leading-[1.15]">
                Compañía internacional de ingeniería en impermeabilización de cubiertas.
              </h2>

              <p className="font-sans text-base md:text-lg text-on-surface-variant leading-relaxed">
                Desde 2005 desarrollamos soluciones integrales para resolver filtraciones complejas. No aplicamos parches temporales: investigamos la patología desde su origen físico con tecnología no destructiva y aseguramos la estanqueidad permanente del inmueble.
              </p>

              {/* 4 Pillars Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
                {pillars.map((item, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                      {item.icon}
                    </div>
                    <h4 className="font-display font-bold text-sm text-primary mb-1">
                      {item.title}
                    </h4>
                    <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Visual Frame */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 group">
                <img
                  alt="Inspección de cubiertas con alta tecnología Coatline"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-all duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4qXKKubNKotT2NTzOU9xUeJvEKRBTDDCu9DvqO3jI7yMvTKn3mW65LA7LFjJydyyP5xEXp_j5Vq_TXCTPZVxLbQIzB5MZg_EXkgGD4-J4Uvbdc0Y-zDJnmd8jTJB9omND-1D_NwmUXnCKLOc8SY42Z0MvNN8yZM_CFMJFMAQPk3se2t7cOkr5kwYraXtAEu8n1ChPqph2u8K18GcPE7MnHe2zAnCrOGoOBoLFPi2rPlwfz9s2AFUK_i3cU2w76XWFP-m-zpTKDS0j"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001c3a] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 right-6 text-white text-xs font-semibold bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                  <span className="text-secondary font-bold uppercase tracking-wider block text-[10px] mb-1">
                    Equipamiento Especializado
                  </span>
                  Mapeo termográfico y trazabilidad electroacústica en tiempo real.
                </div>
              </div>
            </div>
          </div>

          {/* Metric KPI Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-hidden">
            {stats.map((stat, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm text-center space-y-1 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="font-display font-black text-3xl md:text-4xl text-primary">
                  {stat.value}
                </div>
                <div className="font-sans font-bold text-xs text-slate-800 uppercase tracking-wider pt-1">
                  {stat.label}
                </div>
                <div className="font-sans text-[11px] text-slate-500">
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
