/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScreenId } from '../types';
import CssCasesBackground from '../components/animations/CssCasesBackground';
import CssAnimatedReport from '../components/animations/CssAnimatedReport';
import image2 from '../assets/image.png';
import davidLoadImg from '../assets/davidLoad.png';
import holidayImg from '../assets/holiday.png';
import upmImg from '../assets/upm.png';
import valdebebasImg from '../assets/valdebebas.png';
import malplazaImg from '../assets/malplaza.png';
import jardinPlazaImg from '../assets/jardinPlaza.png';
import ciudadLImg from '../assets/ciudadL.png';
import haspenImg from '../assets/haspen.png';
import cantinaImg from '../assets/cantina.png';
import clinicaImg from '../assets/clinica.png';

interface CasesViewProps {
  onNavigate: (screen: ScreenId, transition: 'none' | 'push') => void;
}

export default function CasesView({ onNavigate }: CasesViewProps) {
  const [activeCaseIndex, setActiveCaseIndex] = useState<number | null>(null);

  const cases = [
    {
      title: 'David Lloyd',
      category: 'Deportes & Ocio',
      description: 'Protección integral de superficies y mantenimiento estructural para instalaciones de alto tráfico con estándares de precisión olímpica.',
      longDescription: 'Nuestra intervención en David Lloyd representó un desafío técnico de alto nivel. Implementamos un sistema de protección integral en pavimentos deportivos y zonas de aguas, aplicando revestimientos de curado rápido para minimizar el impacto operativo. Se realizó un tratamiento preventivo en la estructura primaria, asegurando la impermeabilidad y la resistencia química requeridas en instalaciones de este calibre.',
      challenges: ['Altos requerimientos antideslizantes', 'Zonas con constante humedad (piscinas y spas)', 'Necesidad de ejecución sin frenar la actividad del club'],
      results: 'Instalaciones 100% protegidas contra filtraciones, mejora visual estética y cumplimiento de las normativas de seguridad deportiva.',
      image: davidLoadImg,
      colSpan: 'md:col-span-8',
      imageHeight: 'h-[500px]'
    },
    {
      title: 'Netflix',
      category: 'Corporativo',
      description: 'Sellado de precisión en naves de producción y estudios de grabación.',
      longDescription: 'Coatline lideró el proyecto de aislamiento e impermeabilización en los modernos estudios de Netflix. El enfoque principal fue el sellado de precisión en juntas de dilatación y la impermeabilización de cubiertas planas para garantizar una insonorización impecable y la protección del costoso equipo técnico de grabación.',
      challenges: ['Requisitos extremos de insonorización', 'Instalación de membranas sin interferencia magnética', 'Plazos de entrega muy ajustados para el inicio de rodajes'],
      results: 'Sellado técnico de clase A en todos los platós, cero filtraciones térmicas o acústicas registradas durante el primer año de operaciones.',
      image: image2,
      colSpan: 'md:col-span-4',
      imageHeight: 'h-[300px] md:h-[calc(100%-140px)]'
    },
    {
      title: 'Holiday Inn',
      category: 'Hostelería',
      description: 'Impermeabilización avanzada de cubiertas y protección de fachadas.',
      longDescription: 'Para la cadena Holiday Inn, realizamos una modernización completa de sus sistemas de aislamiento exterior. Se implementaron membranas líquidas de poliuretano en las cubiertas y un tratamiento hidrófugo en la fachada principal, mejorando radicalmente la eficiencia energética del edificio y protegiendo el confort de los huéspedes.',
      challenges: ['Intervención en un edificio operativo al 100%', 'Gestión de olores y ruidos para no afectar a los huéspedes', 'Condiciones climáticas adversas durante la aplicación'],
      results: 'Reducción del 20% en consumo energético de climatización y extensión de la vida útil de la fachada en más de 15 años.',
      image: holidayImg,
      colSpan: 'md:col-span-5',
      imageHeight: 'h-[300px]'
    },
    {
      title: 'UPM',
      category: 'Educación',
      description: 'Mantenimiento preventivo integral en campus universitario de alto valor histórico.',
      longDescription: 'La Universidad Politécnica de Madrid confió en Coatline para el diagnóstico y saneamiento de filtraciones en uno de sus edificios históricos. Utilizamos tecnología DDP (Detección de Defectos de Porosidad) para mapear micro-fisuras sin afectar la integridad arquitectónica, seguido de una inyección de resinas especializadas.',
      challenges: ['Protección de patrimonio arquitectónico', 'Detección no invasiva en estructuras centenarias', 'Zonas de muy difícil acceso técnico'],
      results: 'Restauración estructural completa, eliminando el riesgo de deterioro interno y preservando la fachada histórica intacta.',
      image: upmImg,
      colSpan: 'md:col-span-7',
      imageHeight: 'h-[300px]'
    },
    {
      title: 'Valdebebas',
      category: 'Desarrollo Urbano',
      description: 'Intervención a gran escala en infraestructura urbana residencial, garantizando durabilidad y estética arquitectónica.',
      longDescription: 'Este megaproyecto de desarrollo urbano residencial en Valdebebas requirió de nuestra división de intervenciones a gran escala. Tratamos miles de metros cuadrados de cubiertas ajardinadas (roof gardens), terrazas comunitarias y zonas de garajes, implementando barreras anti-raíces y recubrimientos epóxicos de alta resistencia.',
      challenges: ['Coordinación logística masiva', 'Integración con paisajismo en cubiertas vegetales', 'Alta presión freática en niveles inferiores de garajes'],
      results: 'Garantía certificada de estanqueidad en todas las plataformas comunitarias, entregado 2 semanas antes de lo programado.',
      image: valdebebasImg,
      colSpan: 'md:col-span-12',
      imageHeight: 'h-[450px]'
    },
    {
      title: 'Mallplaza',
      category: 'Retail',
      description: 'Soluciones de recubrimiento técnico para zonas de alto tránsito peatonal.',
      longDescription: 'En Mallplaza, la prioridad fue renovar las zonas de alto tráfico comercial sin cerrar el complejo. Aplicamos sistemas de pavimentos continuos MMA (Metil Metacrilato) de curado ultra-rápido, capaces de soportar el paso constante de peatones y maquinaria de limpieza horas después de su aplicación.',
      challenges: ['Ventanas de trabajo nocturnas de tan solo 6 horas', 'Acabados estéticos de alto brillo', 'Resistencia extrema a la abrasión'],
      results: 'Renovación integral del pavimento con un acabado premium, sin reportar ni un solo día de cierre comercial.',
      image: malplazaImg,
      colSpan: 'md:col-span-6',
      imageHeight: 'h-[300px]'
    },
    {
      title: 'Jardín Plaza',
      category: 'Comercial',
      description: 'Restauración estética y protección climática en complejos comerciales abiertos.',
      longDescription: 'Un centro comercial al aire libre requiere protección constante contra los elementos. En Jardín Plaza, ejecutamos un plan de mantenimiento arquitectónico que incluyó el sellado de pasillos expuestos, limpieza y protección de domos translúcidos, y la impermeabilización de todas las jardineras suspendidas.',
      challenges: ['Exposición directa a rayos UV y lluvias torrenciales', 'Complejidad geométrica de las cubiertas textiles y domos', 'Tratamiento de múltiples sustratos diferentes'],
      results: 'Una barrera climática invisible que redujo las incidencias por filtraciones a cero, mejorando drásticamente la estética del recinto.',
      image: jardinPlazaImg,
      colSpan: 'md:col-span-6',
      imageHeight: 'h-[300px]'
    },
    {
      title: 'Ciudad La Salle',
      category: 'Residencial',
      description: 'Mantenimiento de fachadas y sistemas de impermeabilización en gran conjunto residencial.',
      longDescription: 'Nuestros equipos verticales intervinieron los múltiples bloques del complejo residencial Ciudad La Salle. El proyecto abordó la rehabilitación de fachadas mediante hidrofugantes nanotecnológicos y la reparación profunda de juntas de dilatación para solucionar problemas crónicos de humedad por capilaridad en plantas bajas.',
      challenges: ['Trabajo vertical en altura extrema', 'Intervención simultánea en 12 edificios', 'Molestias mínimas para los miles de residentes'],
      results: 'Eliminación definitiva de humedades interiores, revalorizando los inmuebles y asegurando el confort habitacional.',
      image: ciudadLImg,
      colSpan: 'md:col-span-7',
      imageHeight: 'h-[300px]'
    },
    {
      title: 'Colegio Aspaen',
      category: 'Educación',
      description: 'Protección estructural y renovación de cubiertas en instalaciones educativas campestres.',
      longDescription: 'En el Colegio Aspaen, realizamos la sustitución y el sellado de las cubiertas modulares de los pabellones. Utilizamos membranas termoplásticas TPO blancas que, además de impermeabilizar, actúan como reflectantes solares (Cool Roofs), reduciendo la temperatura interior de las aulas de forma pasiva.',
      challenges: ['Ejecución estricta durante las vacaciones escolares', 'Aislamiento térmico como objetivo secundario', 'Trabajo en zonas rodeadas de naturaleza protegida'],
      results: 'Aulas hasta 4°C más frescas en verano, proporcionando un ambiente óptimo para los estudiantes.',
      image: haspenImg,
      colSpan: 'md:col-span-5',
      imageHeight: 'h-[300px]'
    },
    {
      title: 'Cantina La 15',
      category: 'Restauración',
      description: 'Tratamientos especializados para superficies en ambientes gastronómicos de alta gama.',
      longDescription: 'Para el exclusivo restaurante Cantina La 15, instalamos un suelo higiénico de poliuretano-cemento en la cocina central, diseñado para soportar choques térmicos extremos, derrames de aceites hirviendo y limpieza con químicos agresivos, cumpliendo con las más altas normativas sanitarias.',
      challenges: ['Necesidad de acabados antibacterianos certificados', 'Resistencia a choques térmicos diarios', 'Drenajes industriales integrados sin juntas'],
      results: 'Una cocina de grado industrial, 100% aséptica, segura y de fácil limpieza que supera las normativas sanitarias internacionales.',
      image: cantinaImg,
      colSpan: 'md:col-span-6',
      imageHeight: 'h-[300px]'
    },
    {
      title: 'Clínicas Avidanti',
      category: 'Salud',
      description: 'Mantenimiento técnico y sellado aséptico en infraestructuras hospitalarias de alta complejidad.',
      longDescription: 'Coatline fue seleccionada para el sellado de quirófanos y salas blancas en las Clínicas Avidanti. Utilizamos masillas selladoras de grado médico con tecnología de iones de plata (efecto bactericida continuo) en todas las uniones de panel sándwich y pavimentos conductivos para evitar descargas estáticas.',
      challenges: ['Entorno crítico con protocolo de polvo cero', 'Certificación de salas limpias ISO', 'Aplicación de pavimentos ESD (antiestáticos)'],
      results: 'Acreditación inmediata de los quirófanos bajo las normativas más estrictas de bioseguridad.',
      image: clinicaImg,
      colSpan: 'md:col-span-6',
      imageHeight: 'h-[300px]'
    }
  ];

  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = ['Todos', 'Corporativo', 'Deportes', 'Hostelería', 'Educación', 'Desarrollo Urbano', 'Retail', 'Salud'];

  const filteredCases = selectedCategory === 'Todos' 
    ? cases 
    : cases.filter(c => c.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeCaseIndex !== null) {
      setActiveCaseIndex((activeCaseIndex + 1) % filteredCases.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeCaseIndex !== null) {
      setActiveCaseIndex((activeCaseIndex - 1 + filteredCases.length) % filteredCases.length);
    }
  };

  return (
    <div className="w-full text-on-surface relative">
      {/* Hero Section */}
      <header className="relative py-24 px-6 md:px-16 overflow-hidden min-h-[480px] flex items-center">
        <CssCasesBackground />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10 pt-8">
          <div className="md:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest">
              <span>Proyectos de Alta Complejidad</span>
            </div>

            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-white leading-tight drop-shadow-[0_0_20px_rgba(56,189,248,0.4)]">
              Casos Reales y Proyectos
            </h1>

            <p className="font-sans text-lg md:text-xl font-medium text-slate-200 tracking-tight leading-relaxed max-w-2xl">
              Garantía técnica probada en instalaciones emblemáticas: grandes estudios, estadios deportivos, hospitales y complejos residenciales.
            </p>
          </div>
          
          <div className="md:col-span-5 mt-8 md:mt-0">
            <CssAnimatedReport />
          </div>
        </div>
      </header>

      {/* Filter Tabs Bar */}
      <section className="max-w-7xl mx-auto px-6 md:px-16 pt-16">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 border-b border-slate-200/80 pb-6">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  isSelected
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Projects Grid (Bento/Masonry Inspired) */}
      <section className="max-w-7xl mx-auto px-6 md:px-16 py-12 mb-16 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {filteredCases.map((project, idx) => (
            <article 
              key={project.title} 
              onClick={() => setActiveCaseIndex(idx)}
              className={`${project.colSpan} group cursor-pointer bg-white border border-slate-200/80 overflow-hidden rounded-3xl hover:-translate-y-1.5 hover:shadow-2xl hover:border-primary/40 transition-all duration-300 flex flex-col relative`}
            >
              <div className={`relative w-full overflow-hidden ${project.imageHeight}`}>
                <img 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                  src={project.image} 
                />
                
                {/* Floating category badge */}
                <div className="absolute top-5 left-5 z-10">
                  <span className="inline-block bg-primary/90 backdrop-blur-md text-white px-3.5 py-1.5 font-sans font-bold text-[11px] uppercase tracking-widest rounded-full shadow-md border border-white/20">
                    {project.category}
                  </span>
                </div>

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* Hover Reveal Action Pill */}
                <div className="absolute bottom-5 right-5 z-10 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <span className="bg-white text-primary font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5">
                    Ver Estudio Completo
                  </span>
                </div>
              </div>

              <div className="p-6 md:p-8 flex-grow flex flex-col text-left bg-white relative z-10 justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-2xl text-primary mb-2.5 group-hover:text-secondary transition-colors">
                    {project.title}
                  </h3>
                  <p className="font-sans text-sm text-slate-600 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span className="truncate max-w-[220px]">{project.results}</span>
                  <span className="text-secondary font-bold shrink-0">Ficha Técnica →</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Modal / Detailed Case Drawer */}
      <AnimatePresence>
        {activeCaseIndex !== null && filteredCases[activeCaseIndex] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveCaseIndex(null)}
              className="absolute inset-0 bg-[#001c3a]/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] z-10"
            >
              <button 
                onClick={() => setActiveCaseIndex(null)}
                className="absolute top-4 right-4 z-50 p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-full shadow-md backdrop-blur-sm transition-colors"
              >
                <X size={20} />
              </button>

              <div className="w-full md:w-5/12 relative h-64 md:h-auto shrink-0 bg-slate-900">
                <img 
                  src={filteredCases[activeCaseIndex].image} 
                  alt={filteredCases[activeCaseIndex].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 md:p-8">
                  <span className="inline-block bg-primary text-white px-3 py-1 font-sans font-bold text-[10px] uppercase tracking-widest rounded-full shadow-sm w-fit mb-2">
                    {filteredCases[activeCaseIndex].category}
                  </span>
                  <h2 className="font-display font-black text-2xl md:text-4xl text-white">
                    {filteredCases[activeCaseIndex].title}
                  </h2>
                </div>
              </div>

              <div className="w-full md:w-7/12 p-6 md:p-10 overflow-y-auto bg-white flex flex-col justify-between text-left">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-sans font-bold text-xs text-secondary uppercase tracking-widest mb-2">
                      Memoria de Intervención
                    </h4>
                    <p className="font-sans text-sm md:text-base text-slate-700 leading-relaxed">
                      {filteredCases[activeCaseIndex].longDescription}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-sans font-bold text-xs text-primary uppercase tracking-widest mb-3">
                      Retos Técnicos Superados
                    </h4>
                    <ul className="space-y-2">
                      {filteredCases[activeCaseIndex].challenges.map((challenge, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-2" />
                          <span>{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
                    <h4 className="font-sans font-bold text-xs text-primary uppercase tracking-widest mb-1.5">
                      Resultado Certificado
                    </h4>
                    <p className="font-sans text-xs md:text-sm font-semibold text-slate-800">
                      {filteredCases[activeCaseIndex].results}
                    </p>
                  </div>
                </div>

                {/* Navigation Controls inside Modal */}
                <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
                  <button 
                    onClick={handlePrev}
                    className="flex items-center gap-2 text-xs font-bold text-primary hover:text-secondary transition-colors"
                  >
                    <ChevronLeft size={16} />
                    <span>Anterior</span>
                  </button>
                  <span className="text-xs font-mono text-slate-400">
                    {activeCaseIndex + 1} / {filteredCases.length}
                  </span>
                  <button 
                    onClick={handleNext}
                    className="flex items-center gap-2 text-xs font-bold text-primary hover:text-secondary transition-colors"
                  >
                    <span>Siguiente</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Metrics/Impact Section */}
      <section className="bg-primary text-white py-20 mb-20 relative overflow-hidden" style={{ backgroundColor: '#001c3a' }}>
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="md:pr-10 pt-6 md:pt-0">
              <h4 className="font-display font-black text-4xl md:text-6xl mb-2 text-white">+300</h4>
              <p className="font-sans font-bold text-xs text-sky-300 uppercase tracking-widest">Grandes Clientes Corporativos</p>
            </div>
            <div className="md:px-10 pt-6 md:pt-0">
              <h4 className="font-display font-black text-4xl md:text-6xl mb-2 text-white">+1,000</h4>
              <p className="font-sans font-bold text-xs text-sky-300 uppercase tracking-widest">Intervenciones Exitosas</p>
            </div>
            <div className="md:pl-10 pt-6 md:pt-0">
              <h4 className="font-display font-black text-4xl md:text-6xl mb-2 text-white">+6M</h4>
              <p className="font-sans font-bold text-xs text-sky-300 uppercase tracking-widest">Metros Cuadrados Protegidos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-5xl mx-auto px-6 md:px-16 text-center mb-24">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-10 md:p-14 shadow-lg space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center font-bold">
            0%
          </div>
          <h2 className="font-display font-black text-3xl md:text-4xl text-primary">
            ¿Su edificio presenta patologías similares?
          </h2>
          <p className="font-sans text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Consulte con nuestros ingenieros especializados para un informe diagnóstico pericial sin coste ni obras invasivas.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
            <button 
              type="button"
              onClick={() => onNavigate('contact', 'push')}
              className="px-8 py-4 bg-secondary hover:bg-secondary-container text-white font-sans font-bold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg hover:shadow-secondary/30 hover:scale-105 active:scale-95"
            >
              Solicitar Evaluación Técnica
            </button>
            <button 
              type="button"
              onClick={() => onNavigate('detection', 'none')}
              className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-primary font-sans font-bold text-xs uppercase tracking-widest rounded-2xl transition-all"
            >
              Ver Tecnología de Detección
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
