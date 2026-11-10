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
    <header className="relative bg-slate-50 overflow-hidden min-h-[calc(100vh-80px)] flex flex-col justify-center 3xl:justify-between">
      {/* Background gradient & subtle engineering grid */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-white via-slate-50 to-slate-100 bg-tech-grid"></div>
      
      {/* Decorative corporate blur circles */}
      <div className="absolute top-0 right-0 w-[800px] 3xl:w-[1100px] h-[800px] 3xl:h-[1100px] bg-[#285a8a]/6 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[600px] 3xl:w-[900px] h-[600px] 3xl:h-[900px] bg-[#df3d52]/6 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

      <div className="w-full max-w-[1420px] 3xl:max-w-[1760px] 4xl:max-w-[2040px] mx-auto px-6 md:px-12 lg:px-14 3xl:px-20 3xl:flex-grow grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 3xl:gap-16 items-center relative z-10 text-left py-6 md:py-8 3xl:py-14">

        {/* Left Column: Typography (5 cols so the video gets 7 cols of protagonism) */}
        <div className="md:col-span-5 lg:col-span-5 flex flex-col justify-center space-y-4 lg:space-y-5 3xl:space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20 w-max">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span>Ingeniería en Impermeabilización</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl md:text-4xl lg:text-[40px] xl:text-[44px] 3xl:text-6xl text-slate-900 leading-[1.12] tracking-tight">
            Acabamos con las <br />
            <span className="text-[#df3d52]">Filtraciones</span> que otros <br />
            no pueden resolver.
          </h1>

          <p className="text-sm md:text-base 3xl:text-lg text-slate-600 font-sans max-w-xl 3xl:max-w-2xl leading-relaxed font-medium">
            No vendemos parches, aplicamos ingeniería. Soluciones definitivas con tecnología de impermeabilización de última generación y diagnóstico no destructivo.
          </p>

          {/* Badges/Features */}
          <div className="flex flex-wrap items-center gap-2 lg:gap-2.5 py-0.5">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-xs">
              <ShieldCheck size={14} className="text-[#285a8a]" />
              <span className="text-xs text-slate-700 font-bold">Mapeo de patologías</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-xs">
              <TrendingUp size={14} className="text-[#285a8a]" />
              <span className="text-xs text-slate-700 font-bold">Intervención quirúrgica</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-xs">
              <ShieldCheck size={14} className="text-[#285a8a]" />
              <span className="text-xs text-slate-700 font-bold">Respaldo documentado</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
            <a href="#servicios" className="px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 font-sans font-bold text-xs uppercase tracking-wider rounded-xl hover:border-[#285a8a] hover:text-[#285a8a] transition-all active:scale-95 flex items-center gap-2 w-full sm:w-auto justify-center shadow-xs">
              Ver Servicios
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onNavigate('contact', 'push'); }} 
              className="px-6 py-3 bg-[#df3d52] text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#c03546] transition-all shadow-md shadow-[#df3d52]/25 active:scale-95 flex items-center gap-2 group w-full sm:w-auto justify-center"
            >
              Agendar Inspección <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Right Column: Hero Video Player (Expanded to 7 cols for maximum visual protagonism) */}
        <div className="md:col-span-7 lg:col-span-7 relative w-full flex justify-center items-center">
          {/* Ambient lighting glow */}
          <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-2xl transform scale-95 pointer-events-none" />

          {/* Video Container Frame */}
          <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 group aspect-video flex items-center justify-center">
            <video
              ref={videoRef}
              src="/hero_video.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
            />

            {/* Top Badge Overlay */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-white text-[11px] font-bold border border-white/20 tracking-wider uppercase">
                <Sparkles size={13} className="text-secondary" />
                <span>Coatline en Acción</span>
              </div>
            </div>

            {/* Bottom Controls Overlay */}
            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
              <div className="px-3.5 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-white/90 text-[10px] font-bold border border-white/20 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>HD · Bucle continuo</span>
              </div>

              <button
                type="button"
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                title={isPlaying ? "Pausar" : "Reproducir"}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Engineering Telemetry Bar (Shown only on extra-large 3xl+ monitors >= 2160px) */}
      <div className="hidden 3xl:block relative z-10 border-t border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="layout-container py-5 grid grid-cols-4 gap-8 text-left divide-x divide-slate-200/80">
          {[
            { value: '+19 Años', label: 'Trayectoria en Ingeniería', sub: 'Especialistas desde 2005' },
            { value: '+6M m²', label: 'Superficie Protegida', sub: 'Europa y Latinoamérica' },
            { value: '99.9%', label: 'Precisión Dieléctrica', sub: 'Detección sin obras destructivas' },
            { value: 'UNE Oficial', label: 'Ensayos Certificados', sub: 'Validez pericial y aseguradoras' },
          ].map((item, idx) => (
            <div key={idx} className={`flex items-center gap-4 ${idx > 0 ? 'pl-8' : ''}`}>
              <div className="font-display font-black text-2xl text-primary shrink-0">
                {item.value}
              </div>
              <div className="min-w-0">
                <div className="font-sans font-bold text-xs text-slate-800 truncate">
                  {item.label}
                </div>
                <div className="font-sans text-[11px] text-slate-500 truncate">
                  {item.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
