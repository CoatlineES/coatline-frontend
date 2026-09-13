import React from 'react';
import { motion } from 'motion/react';
import { Wrench, AlertTriangle, Droplet, Leaf, ArrowRight } from 'lucide-react';
import { ScreenId } from '../../types';
import energyRoofImg from '../../assets/energy_efficient_roof.png';

interface HomeServicesProps {
  onNavigate: (screen: ScreenId, transition: 'none' | 'push') => void;
}

export default function HomeServices({ onNavigate }: HomeServicesProps) {
  return (
    <main id="servicios" className="py-24 px-6 md:px-16 bg-surface">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16 max-w-3xl mx-auto space-y-6">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-primary tracking-tight">
            SOLUCIONES TÉCNICAS
          </h2>
          <div className="w-16 h-1 bg-secondary mx-auto"></div>
          <p className="font-sans text-base md:text-lg text-on-surface-variant">
            Coatline pone a su disposición servicios que le permitirán solucionar cualquier incidencia que surja en sus superficies. En el programa <span className="font-bold text-primary">ZERO FILTRACIONES</span> están incluidos todos estos servicios.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          <div className="lg:col-span-7 bg-white border border-surface-variant rounded-xl p-8 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl group">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                <Wrench className="text-primary w-8 h-8 group-hover:text-white transition-colors" />
              </div>
              <div className="space-y-3">
                <h3 className="font-display font-bold text-lg md:text-xl text-primary uppercase">
                  MANTENIMIENTO PREVENTIVO
                </h3>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  Un adecuado mantenimiento de su cubierta le permitirá un importante ahorro al prevenir posibles problemas causados por elementos externos. Nuestro equipo de inspección identifica incidencias con la última tecnología.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-surface-variant rounded-xl p-8 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500" />
            <div className="flex flex-col h-full justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded bg-secondary/10 flex items-center justify-center group-hover:bg-secondary text-secondary group-hover:text-white transition-colors">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg md:text-xl text-primary uppercase">
                  RESPUESTA ANTE EMERGENCIAS
                </h3>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  Respuesta rápida ante filtraciones repentinas o cualquier incidencia para contener el problema lo más pronto posible y dar la mejor solución en el menor tiempo.
                </p>
              </div>
            </div>
          </div>

          <div
            className="lg:col-span-12 bg-primary text-white rounded-xl p-8 md:p-12 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl group relative overflow-hidden text-left"
            style={{ backgroundColor: '#001c3a' }}
          >
            <div
              className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay group-hover:scale-105 transition-transform duration-700"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD8JC_kiZH37kX5YNJ241KFj74FSuIh6SYjV9PPlGIWHjJngnZXgNo8dAQ1IP-4PrnBhO_W-wq225mRcCjIpuqKy9mdKxO3v5kB806xcirKFwDaJPRlzQK4Ac6JLaw0RgcnM733F9HCljMH7OlTynTKQRLNqKaz6CBaR0rEx5i0dSL7hVynrozSS98CLeyoZItnAlS1aEDKio0tzGofmBcSlBOgnJhL3NPg2xy0o_vbCqfaflSIAs1JSYGa1p2ggf73oPyC7RlMYJQf')" }}
            />
            <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start lg:items-center h-full justify-between">
              <div className="space-y-4 max-w-4xl">
                <div className="w-12 h-12 rounded bg-white/20 flex items-center justify-center mb-6 backdrop-blur-sm">
                  <Droplet className="text-white w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl md:text-2xl tracking-tight uppercase">
                  IMPERMEABILIZACIÓN CERTIFICADA
                </h3>
                <p className="font-sans text-sm md:text-base text-slate-100 leading-relaxed">
                  Certificados para aplicar diferentes sistemas de impermeabilización y techado en proyectos de nueva construcción, reinstalación o reparación, respetando estándares del fabricante.
                </p>
              </div>
              <div className="shrink-0">
                <button
                  onClick={() => onNavigate('detection', 'none')}
                  className="inline-flex items-center gap-2 bg-secondary text-white font-sans font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded hover:bg-secondary-container transition-all"
                >
                  Ver Especialidades <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-12 bg-white border border-surface-variant rounded-xl p-8 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl group">
            <div className="flex flex-col md:flex-row gap-8 items-center h-full">
              <div className="w-full md:w-1/2 aspect-video bg-surface-container rounded-lg overflow-hidden relative shadow-md">
                <img
                  alt="Eficiencia Energética"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src={energyRoofImg}
                />
              </div>
              <div className="w-full md:w-1/2 space-y-4 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded text-primary font-sans font-bold text-xs">
                  <Leaf size={14} className="text-secondary" />
                  LEED / BREEAM
                </div>
                <h3 className="font-display font-bold text-xl md:text-2xl text-primary">
                  EFICIENCIA ENERGÉTICA Y VALORIZACIÓN
                </h3>
                <p className="font-sans text-sm md:text-base text-on-surface-variant leading-relaxed">
                  Soluciones de mejora energética (cubiertas verdes, blancas reflectantes, solares y azules) que aumentan la valoración en certificaciones LEED y BREEAM.
                </p>
              </div>
            </div>
          </div>
        </div>
        </motion.div>
      </div>
    </main>
  );
}
