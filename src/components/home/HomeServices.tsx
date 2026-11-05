import React from 'react';
import { motion } from 'motion/react';
import { Wrench, AlertTriangle, Droplet, Leaf, ArrowRight, ShieldCheck, Clock, CheckCircle2, Phone } from 'lucide-react';
import { ScreenId } from '../../types';
import energyRoofImg from '../../assets/energy_efficient_roof.png';

interface HomeServicesProps {
  onNavigate: (screen: ScreenId, transition: 'none' | 'push') => void;
}

export default function HomeServices({ onNavigate }: HomeServicesProps) {
  return (
    <section id="servicios" className="py-24 px-6 md:px-16 bg-surface relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20">
            <ShieldCheck size={14} className="text-secondary" />
            <span>Capacidad Técnica Multidisciplinar</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl md:text-5xl text-primary tracking-tight">
            Soluciones Técnicas de Vanguardia
          </h2>

          <p className="font-sans text-base md:text-lg text-on-surface-variant leading-relaxed">
            Actuaciones modulares de ingeniería desarrolladas para diagnosticar, resolver y proteger cualquier superficie frente a agentes climáticos extremos.
          </p>
        </div>

        {/* Bento Grid Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-stretch">
          
          {/* Card 1 (7 Cols): Mantenimiento Preventivo */}
          <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-8 md:p-10 hover:-translate-y-1.5 transition-all duration-300 hover:shadow-2xl hover:border-primary/30 group flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                  <Wrench className="w-7 h-7 transition-colors" />
                </div>
                <span className="text-[11px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-full border border-primary/15">
                  Plan Preventivo
                </span>
              </div>

              <h3 className="font-display font-extrabold text-xl md:text-2xl text-primary mb-3">
                Mantenimiento Preventivo Programado
              </h3>

              <p className="font-sans text-sm md:text-base text-on-surface-variant leading-relaxed mb-6">
                Un adecuado plan de mantenimiento periódico evita sobrecostes estructurales y previene filtraciones imprevistas mediante inspecciones técnicas regulares con escáner y termografía.
              </p>

              <ul className="space-y-2.5 mb-6">
                {[
                  'Limpieza y despeje de sumideros, bajantes y arquetas',
                  'Inspección termográfica de juntas de dilatación críticas',
                  'Sellado preventivo con elastómeros de alta resiliencia',
                  'Informe pericial con registro fotográfico y trazabilidad'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-700 font-medium">
                    <CheckCircle2 size={16} className="text-secondary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ahorro medio en ciclo de vida</span>
              <span className="text-sm font-extrabold text-primary">Hasta un 60%</span>
            </div>
          </div>

          {/* Card 2 (5 Cols): Respuesta ante Emergencias */}
          <div className="lg:col-span-5 bg-gradient-to-br from-white via-white to-secondary/5 border border-slate-200/80 rounded-3xl p-8 md:p-10 hover:-translate-y-1.5 transition-all duration-300 hover:shadow-2xl hover:border-secondary/40 group flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-bl-full -z-0 group-hover:scale-125 transition-transform duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-300 shadow-sm">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-secondary uppercase tracking-widest bg-secondary/10 px-3 py-1.5 rounded-full border border-secondary/20">
                  <Clock size={12} /> Respuesta &lt; 24h
                </span>
              </div>

              <h3 className="font-display font-extrabold text-xl md:text-2xl text-primary mb-3">
                Respuesta Inmediata ante Emergencias
              </h3>

              <p className="font-sans text-sm md:text-base text-on-surface-variant leading-relaxed mb-6">
                Equipo móvil de guardia técnica para contener filtraciones activas repentinas en oficinas, instalaciones industriales y centros de datos sin interrumpir su actividad.
              </p>

              <div className="space-y-2 mb-6">
                <div className="p-3 bg-white/80 border border-slate-200/80 rounded-2xl text-xs text-slate-700 font-medium">
                  ⚡ Protocolo de contención urgente sin obras invasivas
                </div>
                <div className="p-3 bg-white/80 border border-slate-200/80 rounded-2xl text-xs text-slate-700 font-medium">
                  🛡️ Protección preventiva de equipos e inventarios de alto valor
                </div>
              </div>
            </div>

            <a
              href="tel:+34914916197"
              className="relative z-10 w-full py-3.5 px-4 bg-secondary hover:bg-secondary-container text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md hover:shadow-secondary/30 flex items-center justify-center gap-2"
            >
              <Phone size={15} />
              <span>Llamar a Guardia Técnica</span>
            </a>
          </div>

          {/* Card 3 (6 Cols): Impermeabilización Certificada */}
          <div 
            className="lg:col-span-6 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-300 hover:shadow-2xl group border border-white/10"
            style={{ backgroundColor: '#001c3a' }}
          >
            <div
              className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay group-hover:scale-105 transition-transform duration-700"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD8JC_kiZH37kX5YNJ241KFj74FSuIh6SYjV9PPlGIWHjJngnZXgNo8dAQ1IP-4PrnBhO_W-wq225mRcCjIpuqKy9mdKxO3v5kB806xcirKFwDaJPRlzQK4Ac6JLaw0RgcnM733F9HCljMH7OlTynTKQRLNqKaz6CBaR0rEx5i0dSL7hVynrozSS98CLeyoZItnAlS1aEDKio0tzGofmBcSlBOgnJhL3NPg2xy0o_vbCqfaflSIAs1JSYGa1p2ggf73oPyC7RlMYJQf')" }}
            />

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white mb-6">
                <Droplet className="w-7 h-7 text-sky-400" />
              </div>

              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-300 mb-2">
                <span>Sistemas Homologados</span>
              </div>

              <h3 className="font-display font-extrabold text-xl md:text-2xl text-white mb-3">
                Impermeabilización Certificada
              </h3>

              <p className="font-sans text-sm text-slate-300 leading-relaxed mb-6">
                Aplicación certificada de membranas de alta durabilidad (poliurea pura, EPDM, PVC y membranas líquidas continuas) cumpliendo rigurosamente los estándares del fabricante y las normativas UNE.
              </p>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => onNavigate('detection', 'none')}
                className="inline-flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider hover:text-sky-400 transition-colors group/btn cursor-pointer"
              >
                <span>Conocer tecnología y ensayos</span>
                <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
              <span className="text-xs text-slate-400 font-bold">Garantía hasta 25 años</span>
            </div>
          </div>

          {/* Card 4 (6 Cols): Eficiencia Energética & Sostenibilidad */}
          <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-3xl p-8 md:p-10 hover:-translate-y-1.5 transition-all duration-300 hover:shadow-2xl hover:border-emerald-500/40 group flex flex-col justify-between">
            <div>
              <div className="w-full aspect-[21/9] bg-slate-100 rounded-2xl overflow-hidden mb-6 relative shadow-inner">
                <img
                  alt="Eficiencia Energética y Cubiertas Cool Roof"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src={energyRoofImg}
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-emerald-800 border border-emerald-200 shadow-xs">
                    <Leaf size={12} className="text-emerald-600" /> LEED &amp; BREEAM
                  </span>
                </div>
              </div>

              <h3 className="font-display font-extrabold text-xl md:text-2xl text-primary mb-3">
                Eficiencia Energética y Valorización
              </h3>

              <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                Soluciones de mejora bioclimática (cubiertas reflectantes Cool Roof, cubiertas ajardinadas y techos solares) que reducen hasta un 30% la temperatura superficial del edificio y disminuyen la factura de climatización.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-6">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Certificaciones sostenibles</span>
              <span className="text-sm font-extrabold text-emerald-600">Ahorro Térmico A+</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
