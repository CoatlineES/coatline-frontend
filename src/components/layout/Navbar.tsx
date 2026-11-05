import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowUpRight, ChevronDown, User, Phone, Sparkles } from 'lucide-react';
import logoUrl from '../../assets/logo.png';
import { ScreenId } from '../../types';

interface NavbarProps {
  currentScreen: ScreenId;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  onNavigate: (screen: ScreenId, mode?: 'none' | 'push') => void;
}

export default function Navbar({ currentScreen, isMobileMenuOpen, setIsMobileMenuOpen, onNavigate }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (currentScrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Top 2.5px Gradient Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-[2.5px] bg-gradient-to-r from-primary via-secondary to-amber-400 z-[70] transition-all duration-75 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />

      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(0,28,58,0.08)] border-b border-slate-200/70 h-16' 
            : 'bg-white/85 backdrop-blur-md border-b border-slate-200/40 h-20'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-16 h-full flex items-center justify-between">
          {/* Logo with subtle hover micro-interaction */}
          <a
            className="flex items-center shrink-0 group py-1"
            href="#"
            onClick={(e) => { 
              e.preventDefault(); 
              if (currentScreen === 'home') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                onNavigate('home', 'none'); 
              }
            }}
          >
            <img 
              src={logoUrl} 
              alt="Coatline" 
              className={`w-auto transition-all duration-300 group-hover:scale-105 ${
                isScrolled ? 'h-7 md:h-8' : 'h-8 md:h-10'
              }`} 
            />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 justify-end">
            {/* Inicio with dropdown */}
            <div className="relative group flex items-center h-full py-4">
              <a
                href="#"
                onClick={(e) => { 
                  e.preventDefault(); 
                  if (currentScreen === 'home') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    onNavigate('home', 'none'); 
                  }
                }}
                className={`font-sans font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 py-2 px-3.5 rounded-full ${
                  currentScreen === 'home' 
                    ? 'text-primary bg-primary/10 shadow-xs' 
                    : 'text-slate-700 hover:text-primary hover:bg-slate-100/80'
                }`}
              >
                <span>Inicio</span>
                <ChevronDown size={14} className="opacity-60 group-hover:rotate-180 transition-transform duration-300" />
              </a>

              {/* Submenu Dropdown */}
              <div className="absolute top-full left-0 pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/80 p-2 flex flex-col gap-0.5">
                  {[
                    { id: 'paquetes', label: 'Soluciones Clave' },
                    { id: 'metodologia', label: 'Metodología Técnica' },
                    { id: 'servicios', label: 'Soluciones Técnicas' },
                    { id: 'marcas', label: 'Empresas y Clientes' },
                    { id: 'nosotros', label: 'Sobre Nosotros' },
                    { id: 'faqs', label: 'Preguntas Frecuentes' },
                  ].map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const element = document.getElementById(item.id);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          window.location.hash = item.id;
                          onNavigate('home', 'none');
                        }
                      }}
                      className="px-3.5 py-2 text-xs font-sans font-semibold text-slate-700 hover:text-primary hover:bg-slate-100/80 rounded-xl transition-all duration-150 flex items-center justify-between group/sub"
                    >
                      <span>{item.label}</span>
                      <ArrowUpRight size={12} className="opacity-0 group-hover/sub:opacity-60 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Detección Electrónica */}
            <a
              className={`font-sans font-bold text-xs uppercase tracking-wider transition-all duration-200 py-2 px-3.5 rounded-full flex items-center gap-1.5 ${
                currentScreen === 'detection' 
                  ? 'text-primary bg-primary/10 shadow-xs' 
                  : 'text-slate-700 hover:text-primary hover:bg-slate-100/80'
              }`}
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate('detection', 'none'); }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              <span>Detección Eléctrica</span>
            </a>

            {/* Casos Reales */}
            <a
              className={`font-sans font-bold text-xs uppercase tracking-wider transition-all duration-200 py-2 px-3.5 rounded-full ${
                currentScreen === 'cases' 
                  ? 'text-primary bg-primary/10 shadow-xs' 
                  : 'text-slate-700 hover:text-primary hover:bg-slate-100/80'
              }`}
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate('cases', 'none'); }}
            >
              Casos Reales
            </a>

            {/* Contacto */}
            <a
              className={`font-sans font-bold text-xs uppercase tracking-wider transition-all duration-200 py-2 px-3.5 rounded-full ${
                currentScreen === 'contact' 
                  ? 'text-primary bg-primary/10 shadow-xs' 
                  : 'text-slate-700 hover:text-primary hover:bg-slate-100/80'
              }`}
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate('contact', 'none'); }}
            >
              Contacto
            </a>

            {/* Acceso Button */}
            <a
              className="ml-3 px-5 py-2.5 bg-gradient-to-r from-secondary to-secondary-container hover:from-secondary-container hover:to-secondary text-white font-sans font-bold text-xs rounded-full uppercase tracking-wider shadow-md hover:shadow-secondary/30 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate('login', 'push'); }}
            >
              <User size={15} />
              <span>Acceso</span>
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-primary p-2 focus:outline-none rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed top-20 left-4 right-4 bg-white/95 backdrop-blur-xl z-50 rounded-3xl border border-slate-200/80 shadow-2xl md:hidden p-6 text-left space-y-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex flex-col gap-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center justify-between">
                  <span>Navegación</span>
                  <Sparkles size={12} className="text-secondary" />
                </div>

                <a
                  href="#"
                  onClick={(e) => { 
                    e.preventDefault(); 
                    if (currentScreen === 'home') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      onNavigate('home', 'none'); 
                    }
                    setIsMobileMenuOpen(false); 
                  }}
                  className={`font-sans font-bold text-base py-2 flex items-center justify-between transition-colors ${
                    currentScreen === 'home' ? 'text-primary' : 'text-slate-800'
                  }`}
                >
                  <span>Inicio</span>
                  <ChevronDown size={16} className="text-slate-400" />
                </a>

                {/* Subsections if on home */}
                <div className="pl-3 py-1 flex flex-col gap-1 border-l-2 border-slate-200/80 ml-2">
                  {[
                    { id: 'paquetes', label: 'Soluciones Clave' },
                    { id: 'metodologia', label: 'Metodología Técnica' },
                    { id: 'servicios', label: 'Soluciones Técnicas' },
                    { id: 'marcas', label: 'Empresas' },
                    { id: 'nosotros', label: 'Nosotros' },
                    { id: 'faqs', label: 'FAQs' },
                  ].map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMobileMenuOpen(false);
                        const element = document.getElementById(item.id);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          window.location.hash = item.id;
                          onNavigate('home', 'none');
                        }
                      }}
                      className="text-xs font-sans font-medium text-slate-600 hover:text-primary py-1.5"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>

                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); onNavigate('detection', 'none'); }}
                  className={`py-2.5 font-sans font-bold text-base flex items-center justify-between border-t border-slate-100 ${
                    currentScreen === 'detection' ? 'text-primary' : 'text-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    Detección Eléctrica
                  </span>
                  <ArrowUpRight size={16} />
                </a>

                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); onNavigate('cases', 'none'); }}
                  className={`py-2.5 font-sans font-bold text-base flex items-center justify-between border-t border-slate-100 ${
                    currentScreen === 'cases' ? 'text-primary' : 'text-slate-800'
                  }`}
                >
                  <span>Casos Reales</span>
                  <ArrowUpRight size={16} />
                </a>

                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); onNavigate('contact', 'none'); }}
                  className={`py-2.5 font-sans font-bold text-base flex items-center justify-between border-t border-slate-100 ${
                    currentScreen === 'contact' ? 'text-primary' : 'text-slate-800'
                  }`}
                >
                  <span>Contacto</span>
                  <ArrowUpRight size={16} />
                </a>
              </div>

              {/* Bottom Mobile Action & Emergency Contact */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <a
                  href="tel:+34914916197"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 text-slate-800 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
                >
                  <Phone size={14} className="text-secondary" />
                  <span>Urgencias: +34 91 491 61 97</span>
                </a>

                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); onNavigate('login', 'push'); }}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-secondary hover:bg-secondary-container text-white font-sans font-bold text-xs rounded-xl uppercase tracking-widest shadow-md transition-colors"
                >
                  <User size={16} />
                  <span>Acceso Técnico</span>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
