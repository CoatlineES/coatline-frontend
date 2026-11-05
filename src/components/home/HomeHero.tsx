import React, { useRef, useState } from 'react';
import { ShieldCheck, TrendingUp, ArrowRight, Play, Pause, Sparkles } from 'lucide-react';
import { ScreenId } from '../../types';

interface HomeHeroProps {
  onNavigate: (screen: ScreenId, transition: 'none' | 'push') => void;
}

export default function HomeHero({ onNavigate }: HomeHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <header className="relative pt-8 px-6 md:px-16 bg-slate-50 overflow-hidden min-h-[calc(100vh-80px)] md:h-[calc(100vh-80px)] flex flex-col justify-center">
      {/* Background gradient */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-white via-slate-50 to-slate-100"></div>
      
      {/* Decorative corporate blur circles */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#285a8a]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#df3d52]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10 text-left min-h-full md:h-full md:max-h-[calc(100vh-80px)] py-8 md:py-4">

        {/* Left Column: Typography */}
        <div className="md:col-span-7 flex flex-col justify-center space-y-5 pt-4 md:pt-0">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20 w-max">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span>Ingeniería en Impermeabilización</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-slate-900 leading-[1.15] tracking-tight">
            Acabamos con las <br />
            <span className="text-[#df3d52]">Filtraciones</span> que otros <br />
            no pueden resolver.
          </h1>

          <p className="text-sm md:text-base lg:text-lg text-slate-600 font-sans max-w-xl leading-relaxed font-medium">
            No vendemos parches, aplicamos ingeniería. Soluciones definitivas con tecnología de impermeabilización de última generación y diagnóstico no destructivo.
          </p>

          {/* Badges/Features */}
          <div className="flex flex-wrap items-center gap-3 py-1">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3.5 py-1.5 shadow-xs">
              <ShieldCheck size={14} className="text-[#285a8a]" />
              <span className="text-xs text-slate-700 font-bold">Mapeo de patologías</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3.5 py-1.5 shadow-xs">
              <TrendingUp size={14} className="text-[#285a8a]" />
              <span className="text-xs text-slate-700 font-bold">Intervención quirúrgica</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3.5 py-1.5 shadow-xs">
              <ShieldCheck size={14} className="text-[#285a8a]" />
              <span className="text-xs text-slate-700 font-bold">Respaldo documentado</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2 pb-6 md:pb-0">
            <a href="#servicios" className="px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 font-sans font-bold text-xs uppercase tracking-wider rounded-xl hover:border-[#285a8a] hover:text-[#285a8a] transition-all active:scale-95 flex items-center gap-2 w-full sm:w-auto justify-center shadow-xs">
              Ver Servicios
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onNavigate('contact', 'push'); }} 
              className="px-6 py-3 bg-[#df3d52] text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#c03546] transition-all shadow-md shadow-[#df3d52]/25 active:scale-95 flex items-center gap-2 group w-full sm:w-auto justify-center"
            >
              Agendar Inspección <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Right Column: Hero Video Player */}
        <div className="md:col-span-5 relative w-full flex justify-center items-center">
          {/* Ambient lighting glow */}
          <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-2xl transform scale-95 pointer-events-none" />

          {/* Video Container Frame */}
          <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 group aspect-[4/3] md:aspect-[4/3] lg:aspect-[4/3] flex items-center justify-center">
            <video
              ref={videoRef}
              src="/hero_video.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Top Badge Overlay */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-[11px] font-bold border border-white/20 tracking-wider uppercase">
                <Sparkles size={12} className="text-secondary" />
                <span>Coatline en Acción</span>
              </div>
            </div>

            {/* Bottom Controls Overlay */}
            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                  title={isPlaying ? "Pausar" : "Reproducir"}
                >
                  {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
                </button>
              </div>

              <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white/90 text-[10px] font-bold border border-white/20 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Bucle continuo</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
