import React from 'react';
import { motion } from 'motion/react';
import logoAlchimica from '../../assets/logo_crop_alchimica.png';
import logoSoprema from '../../assets/logo_crop_soprema.png';
import logoBmi from '../../assets/logo_crop_bmi.png';
import logoChova from '../../assets/logo_crop_chova.png';
import logoMapei from '../../assets/logo_crop_mapei.png';
import logoGrupoPuma from '../../assets/logo_crop_grupopuma.png';
import logoRollgum from '../../assets/logo_crop_rollgum.png';
import logoRevestech from '../../assets/logo_crop_revestech.png';

export default function HomeBrands() {
  const brands = [
    { name: 'Alchimica', url: logoAlchimica },
    { name: 'Soprema', url: logoSoprema },
    { name: 'BMI Group', url: logoBmi },
    { name: 'ChovA', url: logoChova },
    { name: 'MAPEI', url: logoMapei },
    { name: 'Grupo Puma', url: logoGrupoPuma },
    { name: 'Rollgum', url: logoRollgum },
    { name: 'Revestech', url: logoRevestech }
  ];

  return (
    <section id="marcas" className="py-20 px-6 md:px-16 bg-surface-container-low border-y border-surface-variant/30">
      <div className="max-w-7xl mx-auto">
        <div>
          <div className="text-center mb-16 max-w-4xl mx-auto space-y-4">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-primary tracking-tight">
            Marcas que confían en nosotros
          </h2>
          <p className="font-sans text-sm md:text-base text-on-surface-variant max-w-3xl mx-auto">
            En Coatline combinamos innovación y experiencia. Desarrollamos y fabricamos soluciones propias que complementamos, según los requisitos del proyecto, con materiales de los principales fabricantes del sector. Trabajamos con marcas como:
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 items-center justify-items-center mt-10">
          {brands.map((b, idx) => (
            <div
              key={idx}
              className="w-full flex items-center justify-center transition-all duration-300 hover:scale-[1.08] hover:shadow-md h-24 p-4 bg-white rounded-lg border border-surface-variant/30 group"
            >
              <img
                alt={b.name}
                className="max-h-full max-w-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
                src={b.url}
              />
            </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}

