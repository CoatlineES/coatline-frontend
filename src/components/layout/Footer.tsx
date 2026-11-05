import React from 'react';
import { Globe, Share2, Phone, Mail, MapPin, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { ScreenId } from '../../types';

interface FooterProps {
  onNavigate: (screen: ScreenId, mode?: 'none' | 'push') => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const handleAnchorClick = (e: React.MouseEvent, anchorId: string) => {
    e.preventDefault();
    const element = document.getElementById(anchorId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.hash = anchorId;
      onNavigate('home', 'none');
    }
  };

  return (
    <footer className="bg-[#001c3a] text-white w-full relative border-t border-white/10 overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

      <div className="max-w-7xl mx-auto px-6 md:px-16 pt-16 pb-12 relative z-10">
        {/* Pre-footer Callout Banner */}
        <div className="mb-16 bg-white/[0.04] border border-white/10 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md hover:border-white/20 transition-all duration-300">
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-400">
              <ShieldCheck size={16} />
              <span>Diagnóstico Pericial Inmediato</span>
            </div>
            <h3 className="font-display font-black text-2xl md:text-3xl text-white">
              ¿Filtraciones activas en su edificio?
            </h3>
            <p className="font-sans text-sm text-slate-300 max-w-xl">
              Localizamos el punto exacto de entrada sin picar ni realizar obras destructivas, entregando informe pericial con validez técnica.
            </p>
          </div>
          <button
            onClick={() => onNavigate('contact', 'none')}
            className="shrink-0 px-8 py-4 bg-secondary hover:bg-secondary-container text-white font-bold rounded-2xl text-sm transition-all duration-300 shadow-lg hover:shadow-secondary/30 hover:scale-105 active:scale-95 flex items-center gap-2 group"
          >
            <span>Solicitar Diagnóstico</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 4-Column Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-left pb-12">
          
          {/* Column 1: Branding & Philosophy */}
          <div className="space-y-5">
            <div className="flex items-center">
              <span className="font-sans text-3xl font-extrabold tracking-tight text-white border-b-2 border-secondary pb-1">
                coatline
              </span>
            </div>
            <p className="font-sans text-sm text-slate-300 leading-relaxed">
              Ingeniería especializada en impermeabilización, diagnóstico electroacústico y mantenimiento preventivo inteligente de cubiertas y superficies.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-slate-300">
                <Sparkles size={12} className="text-secondary" /> Precisión Técnica
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-slate-300">
                <ShieldCheck size={12} className="text-amber-400" /> Garantía Total
              </span>
            </div>
          </div>

          {/* Column 2: Soluciones Técnicas */}
          <div>
            <h4 className="font-sans font-bold text-xs text-white mb-5 uppercase tracking-widest border-b border-white/10 pb-2 flex items-center justify-between">
              <span>SOLUCIONES TÉCNICAS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            </h4>
            <ul className="space-y-2.5 text-xs md:text-sm text-slate-300 font-medium">
              <li>
                <a className="hover:text-white transition-colors flex items-center gap-1.5 py-1" href="#" onClick={(e) => { e.preventDefault(); onNavigate('detection', 'none'); }}>
                  <span>Detección Electrónica</span>
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors flex items-center gap-1.5 py-1" href="#" onClick={(e) => handleAnchorClick(e, 'paquetes')}>
                  <span>Programa Zero Filtraciones</span>
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors flex items-center gap-1.5 py-1" href="#" onClick={(e) => handleAnchorClick(e, 'servicios')}>
                  <span>Mantenimiento Preventivo</span>
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors flex items-center gap-1.5 py-1" href="#" onClick={(e) => handleAnchorClick(e, 'servicios')}>
                  <span>Respuesta ante Emergencias</span>
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors flex items-center gap-1.5 py-1" href="#" onClick={(e) => handleAnchorClick(e, 'servicios')}>
                  <span>Eficiencia Energética en Cubiertas</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Empresa y Casos */}
          <div>
            <h4 className="font-sans font-bold text-xs text-white mb-5 uppercase tracking-widest border-b border-white/10 pb-2 flex items-center justify-between">
              <span>EMPRESA Y CASOS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            </h4>
            <ul className="space-y-2.5 text-xs md:text-sm text-slate-300 font-medium">
              <li>
                <a className="hover:text-white transition-colors py-1 block" href="#" onClick={(e) => handleAnchorClick(e, 'nosotros')}>
                  Sobre Coatline
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors py-1 block" href="#" onClick={(e) => handleAnchorClick(e, 'metodologia')}>
                  Metodología de Intervención
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors py-1 block" href="#" onClick={(e) => { e.preventDefault(); onNavigate('cases', 'none'); }}>
                  Casos Reales y Proyectos
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors py-1 block" href="#" onClick={(e) => { e.preventDefault(); onNavigate('contact', 'none'); }}>
                  Contacto y Presupuestos
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors py-1 block" href="#" onClick={(e) => { e.preventDefault(); onNavigate('login', 'push'); }}>
                  Acceso Empleados / Clientes
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contacto Central */}
          <div>
            <h4 className="font-sans font-bold text-xs text-white mb-5 uppercase tracking-widest border-b border-white/10 pb-2 flex items-center justify-between">
              <span>SEDE Y ATENCIÓN</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </h4>
            <ul className="space-y-3.5 text-xs text-slate-300 font-medium">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-secondary shrink-0 mt-0.5" />
                <span>Calle de la Resina, 35. Nave 7<br />28021 Madrid, España</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-secondary shrink-0" />
                <a href="tel:+34914916197" className="hover:text-white transition-colors font-bold text-white">
                  +34 91 491 61 97
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-secondary shrink-0" />
                <a href="mailto:comercial@coatline.es" className="hover:text-white transition-colors break-all">
                  comercial@coatline.es
                </a>
              </li>
              <li className="pt-1 text-[11px] text-slate-400">
                Horario de oficina: L-V 08:00 - 18:30<br />
                Guardia técnica para emergencias 24/7
              </li>
            </ul>
          </div>

        </div>

        {/* Subfooter */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigate('legal', 'none'); }}>
              Aviso Legal
            </a>
            <span>•</span>
            <a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigate('privacy', 'none'); }}>
              Política de Privacidad
            </a>
            <span>•</span>
            <a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigate('cookies', 'none'); }}>
              Política de Cookies
            </a>
          </div>

          <p className="font-sans text-xs">
            © {new Date().getFullYear()} Coatline Architectural Maintenance. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
