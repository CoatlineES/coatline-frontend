/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Share2,
  Plus,
  Minus,
  Send,
  CheckCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { FAQS } from '../data';
import { ScreenId } from '../types';

interface ContactViewProps {
  onNavigate: (screen: ScreenId, transition: 'none' | 'push') => void;
}

export default function ContactView({ onNavigate }: ContactViewProps) {
  const [searchParams] = useSearchParams();
  const initialService = searchParams.get('service');

  // Form State
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [typology, setTypology] = useState('');
  const [sector, setSector] = useState('');
  const [services, setServices] = useState({
    waterproofing: initialService === 'waterproofing',
    detection: initialService === 'detection',
    repairs: initialService === 'repairs',
    zeroLeaks: initialService === 'zeroLeaks',
  });
  const [area, setArea] = useState('');
  const [budget, setBudget] = useState('');
  const [message, setMessage] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = 'El nombre es requerido.';
    if (!email.trim()) {
      newErrors.email = 'El correo electrónico es requerido.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El formato de correo no es válido.';
    }
    if (!phone.trim()) {
      newErrors.phone = 'El teléfono es requerido.';
    }
    if (!message.trim()) {
      newErrors.message = 'Describa su proyecto o necesidad.';
    }
    if (!acceptTerms) {
      newErrors.acceptTerms = 'Debe aceptar los términos legales para continuar.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitted(true); // Using this as loading state for the button animation

    try {
      const res = await fetch('http://localhost:4000/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, company, email, phone, typology, sector, services, area, budget, message
        })
      });

      const data = await res.json();
      if (!data.success) {
        setErrors({ submit: data.message || 'Error al enviar el mensaje' });
        setIsSubmitted(false);
      }
    } catch (error) {
      console.error(error);
      setErrors({ submit: 'Error de red al conectar con el servidor.' });
      setIsSubmitted(false);
    }
  };

  const handleReset = () => {
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setTypology('');
    setSector('');
    setServices({
      waterproofing: false,
      detection: false,
      repairs: false,
      zeroLeaks: false,
    });
    setArea('');
    setBudget('');
    setMessage('');
    setAcceptTerms(false);
    setIsSubmitted(false);
  };

  return (
    <div className="w-full text-on-surface">
      {/* Hero Section */}
      <section className="bg-primary relative overflow-hidden text-white py-24 px-6 md:px-16 text-center md:text-left" style={{ backgroundColor: '#003b70' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0 mix-blend-overlay"
        >
          <motion.img
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            alt="Architecture background"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9BEvloOfydznnESnzbMl3-9JLawRIRwlrwiflL35JkAOrWMuAZrXN0RB-plm-zUgI3xVbNluEq52QJcMGIxg22R4EFji_Wej0RRQrqPlAFHixr-LqgCAf47tMUMSTjNh45z-UUSOyTz-W6h0Qo8wfA_S7aDS_05myGlhtzCZRNAdLosKQW_61-m_6JLBBykZCDL0TeoHD59e2mXr-9PkaaPhqZupFb8wphi5W-cMyRpKG1VIKbV267VOdSVnB1kYQThC0ZWlPlfn6"
          />
        </motion.div>

        {/* Subtle animated blueprint grid overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"
        ></motion.div>
        
        {/* Floating animated elements for a 'living' feel */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="absolute top-[20%] left-[10%] w-32 h-32 border border-white/20 rounded-full pointer-events-none backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.05)]"
        />
        <motion.div
          animate={{ y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute bottom-[20%] right-[12%] w-64 h-64 border border-white/10 rounded-full pointer-events-none backdrop-blur-sm"
        />
        <motion.div
          animate={{ x: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
          className="absolute top-[40%] right-[30%] w-16 h-16 bg-white/5 border border-white/20 rounded-lg backdrop-blur-md pointer-events-none shadow-lg"
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display font-bold text-4xl md:text-6xl mb-6 text-white drop-shadow-lg"
          >
            Contáctenos
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-sans text-lg text-white/90 max-w-2xl drop-shadow"
          >
            Estamos aquí para ayudarle a proteger su inversión arquitectónica.
          </motion.p>
        </div>
      </section>

      {/* Main Content Info + Form */}
      <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">

          {/* Left Column: Contact Details */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
            className="col-span-1 lg:col-span-4 space-y-12"
          >
            <div>
              <h2 className="font-display font-bold text-3xl text-primary mb-8 relative inline-block">
                Nuestra Presencia
                <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-secondary rounded-full"></span>
              </h2>

              <div className="space-y-6">
                {/* Sede Central Card */}
                <motion.div
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 59, 112, 0.1), 0 8px 10px -6px rgba(0, 59, 112, 0.1)" }}
                  className="bg-white p-6 rounded-xl border border-surface-variant shadow-sm text-left transition-all duration-300 hover:border-primary/30 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>
                  <h3 className="font-sans font-bold text-lg text-primary mb-4 flex items-center gap-2 relative z-10">
                    <motion.span whileHover={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.5 }} className="inline-block"><MapPin size={20} className="text-secondary" /></motion.span> Sede Central
                  </h3>
                  <p className="text-slate-600 font-sans text-sm leading-relaxed">
                    Calle de la Resina, 35.<br />
                    Nave 7, 28021 Madrid.
                  </p>
                </motion.div>

                {/* Grid for Phone and Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 59, 112, 0.1), 0 8px 10px -6px rgba(0, 59, 112, 0.1)" }}
                    className="bg-white p-6 rounded-xl border border-surface-variant shadow-sm hover:border-primary/30 transition-all duration-300 text-left group"
                  >
                    <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                      <motion.span whileHover={{ rotate: [0, -15, 15, -15, 0] }} transition={{ duration: 0.5 }} className="inline-block"><Phone size={18} className="text-secondary" /></motion.span>
                    </div>
                    <h3 className="font-sans font-bold text-slate-800 mb-1 text-sm">Teléfono</h3>
                    <p className="text-slate-600 font-sans text-sm">+34 91 491 61 97</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 59, 112, 0.1), 0 8px 10px -6px rgba(0, 59, 112, 0.1)" }}
                    className="bg-white p-6 rounded-xl border border-surface-variant shadow-sm hover:border-primary/30 transition-all duration-300 text-left group"
                  >
                    <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                      <motion.span whileHover={{ y: [0, -5, 0] }} transition={{ duration: 0.5 }} className="inline-block"><Mail size={18} className="text-secondary" /></motion.span>
                    </div>
                    <h3 className="font-sans font-bold text-slate-800 mb-1 text-sm">Email</h3>
                    <p className="text-slate-600 font-sans text-sm break-all">comercial@coatline.es</p>
                  </motion.div>
                </div>

                {/* Stylized Map Placeholder */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="w-full h-64 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative group transition-all duration-300 shadow-sm hover:shadow-lg hover:border-primary/30"
                >
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"></div>
                  <div className="absolute inset-0 bg-primary/10 mix-blend-multiply group-hover:bg-transparent transition-colors duration-700"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    {/* Radar Pulse Effect */}
                    <div className="absolute w-12 h-12 bg-secondary/30 rounded-full animate-ping opacity-75"></div>
                    <div className="absolute w-8 h-8 bg-secondary/50 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.2s' }}></div>
                    <MapPin size={36} className="text-secondary drop-shadow-md fill-secondary relative z-10 group-hover:scale-110 transition-transform duration-300" />
                    <div className="w-8 h-2 bg-black/30 blur-[2px] rounded-[100%] mt-1 group-hover:scale-90 transition-transform"></div>
                  </div>
                </motion.div>

              </div>
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="col-span-1 lg:col-span-8"
          >
            <div className="bg-white p-8 md:p-12 rounded-2xl border border-surface-variant shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-left relative overflow-visible">

              {!isSubmitted ? (
                <>
                  <div className="mb-10">
                    <h2 className="font-display font-bold text-3xl text-primary mb-3">Envíenos un Mensaje</h2>
                    <p className="text-slate-600 font-sans text-sm md:text-base">
                      Complete el formulario y nuestro equipo de ingeniería se pondrá en contacto con usted a la brevedad.
                    </p>
                  </div>

                  <motion.form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                    }}
                  >
                    {errors.submit && (
                      <div className="bg-red-50 text-red-600 font-sans text-sm p-3 rounded border border-red-100 mb-4 text-center">
                        {errors.submit}
                      </div>
                    )}

                    {/* Row 1: Nombre & Empresa */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative group">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Nombre"
                          className={`w-full bg-[#f8fafc] border ${errors.name ? 'border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(248,113,113,0.2)]' : 'border-slate-200 focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(0,59,112,0.1)]'} rounded-lg px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all duration-300 font-sans text-sm group-hover:border-slate-300`}
                        />
                        {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{errors.name}</p>}
                      </div>

                      <div className="relative group">
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Empresa"
                          className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(0,59,112,0.1)] focus:bg-white transition-all duration-300 font-sans text-sm group-hover:border-slate-300"
                        />
                      </div>
                    </motion.div>

                    {/* Row 2: Email */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="relative group">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className={`w-full bg-[#f8fafc] border ${errors.email ? 'border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(248,113,113,0.2)]' : 'border-slate-200 focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(0,59,112,0.1)]'} rounded-lg px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all duration-300 font-sans text-sm group-hover:border-slate-300`}
                      />
                      {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{errors.email}</p>}
                    </motion.div>

                    {/* Row 3: Teléfono */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="relative group">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Teléfono"
                        className={`w-full bg-[#f8fafc] border ${errors.phone ? 'border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(248,113,113,0.2)]' : 'border-slate-200 focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(0,59,112,0.1)]'} rounded-lg px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all duration-300 font-sans text-sm group-hover:border-slate-300`}
                      />
                      {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{errors.phone}</p>}
                    </motion.div>

                    {/* Row 4: Tipología & Sector */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative group">
                        <select
                          value={typology}
                          onChange={(e) => setTypology(e.target.value)}
                          className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg px-4 py-3.5 text-slate-800 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(0,59,112,0.1)] focus:bg-white transition-all duration-300 font-sans text-sm appearance-none cursor-pointer group-hover:border-slate-300"
                        >
                          <option value="">Tipología</option>
                          <option value="Cubierta Plana">Cubierta Plana</option>
                          <option value="Cubierta Inclinada">Cubierta Inclinada</option>
                          <option value="Terraza / Balcón">Terraza / Balcón</option>
                          <option value="Piscina / Aljibe">Piscina / Aljibe</option>
                          <option value="Sótano / Cimentación">Sótano / Cimentación</option>
                          <option value="Otros">Otros</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-500 group-hover:text-primary transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>

                      <div className="relative group">
                        <select
                          value={sector}
                          onChange={(e) => setSector(e.target.value)}
                          className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg px-4 py-3.5 text-slate-800 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(0,59,112,0.1)] focus:bg-white transition-all duration-300 font-sans text-sm appearance-none cursor-pointer group-hover:border-slate-300"
                        >
                          <option value="">Sector</option>
                          <option value="Residencial">Residencial</option>
                          <option value="Comercial / Retail">Comercial / Retail</option>
                          <option value="Industrial">Industrial</option>
                          <option value="Hostelería / Ocio">Hostelería / Ocio</option>
                          <option value="Otros">Otros</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-500 group-hover:text-primary transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </motion.div>

                    {/* Section: Servicio de interés */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-3 pt-2">
                      <label className="block font-sans font-bold text-sm text-slate-800">
                        Servicio de interés
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 font-sans text-sm text-slate-600 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={services.waterproofing}
                              onChange={(e) => setServices({ ...services, waterproofing: e.target.checked })}
                              className="w-5 h-5 rounded border-slate-300 text-secondary focus:ring-secondary/50 focus:ring-2 cursor-pointer transition-all"
                            />
                            <span>Impermeabilización</span>
                          </label>
                          <label className="flex items-center gap-3 font-sans text-sm text-slate-600 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={services.repairs}
                              onChange={(e) => setServices({ ...services, repairs: e.target.checked })}
                              className="w-5 h-5 rounded border-slate-300 text-secondary focus:ring-secondary/50 focus:ring-2 cursor-pointer transition-all"
                            />
                            <span>Reparaciones</span>
                          </label>
                        </div>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 font-sans text-sm text-slate-600 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={services.detection}
                              onChange={(e) => setServices({ ...services, detection: e.target.checked })}
                              className="w-5 h-5 rounded border-slate-300 text-secondary focus:ring-secondary/50 focus:ring-2 cursor-pointer transition-all"
                            />
                            <span>Detección electrónica</span>
                          </label>
                          <label className="flex items-center gap-3 font-sans text-sm text-slate-600 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={services.zeroLeaks}
                              onChange={(e) => setServices({ ...services, zeroLeaks: e.target.checked })}
                              className="w-5 h-5 rounded border-slate-300 text-secondary focus:ring-secondary/50 focus:ring-2 cursor-pointer transition-all"
                            />
                            <span>Programa Zero Filtraciones</span>
                          </label>
                        </div>
                      </div>
                    </motion.div>

                    {/* Row 6: m² aproximados & ¿Presupuesto asignado? */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="relative group">
                        <input
                          type="text"
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          placeholder="m² aproximados"
                          className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(0,59,112,0.1)] focus:bg-white transition-all duration-300 font-sans text-sm group-hover:border-slate-300"
                        />
                      </div>

                      <div className="relative group">
                        <select
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg px-4 py-3.5 text-slate-800 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(0,59,112,0.1)] focus:bg-white transition-all duration-300 font-sans text-sm appearance-none cursor-pointer group-hover:border-slate-300"
                        >
                          <option value="">¿Presupuesto asignado?</option>
                          <option value="Sí">Sí</option>
                          <option value="No">No</option>
                          <option value="En fase de estudio">En fase de estudio</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-500 group-hover:text-primary transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </motion.div>

                    {/* Row 7: Describa su proyecto o necesidad... */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="relative group">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describa su proyecto o necesidad..."
                        rows={5}
                        className={`w-full bg-[#f8fafc] border ${errors.message ? 'border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(248,113,113,0.2)]' : 'border-slate-200 focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(0,59,112,0.1)]'} rounded-lg px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none resize-none focus:bg-white transition-all duration-300 font-sans text-sm group-hover:border-slate-300`}
                      ></textarea>
                      {errors.message && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{errors.message}</p>}
                    </motion.div>

                    {/* Row 8: Checkbox for Privacy Policy and Aviso Legal */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="relative pt-2">
                      <label className="flex items-start gap-3 font-sans text-sm text-slate-600 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          className="w-5 h-5 rounded border-slate-300 text-secondary focus:ring-secondary/50 focus:ring-2 cursor-pointer transition-all mt-0.5"
                        />
                        <span className="leading-snug">
                          He leído y acepto la{' '}
                          <a href="#" className="text-primary hover:underline font-semibold" onClick={(e) => e.preventDefault()}>
                            Política de Privacidad
                          </a>{' '}
                          y el{' '}
                          <a href="#" className="text-primary hover:underline font-semibold" onClick={(e) => e.preventDefault()}>
                            Aviso Legal
                          </a>. <span className="text-red-500">*</span>
                        </span>
                      </label>
                      {errors.acceptTerms && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{errors.acceptTerms}</p>}
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="relative overflow-hidden w-full md:w-auto bg-secondary text-white font-sans font-bold text-xs uppercase tracking-widest py-4 px-12 rounded hover:bg-secondary-container transition-all shadow-md hover:shadow-[0_10px_20px_rgba(183,15,54,0.3)] duration-300 flex items-center justify-center gap-2 group cursor-pointer"
                      >
                        {/* Shimmer effect */}
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                          animate={{ x: ['-200%', '200%'] }}
                          transition={{ repeat: Infinity, duration: 2.5, ease: 'linear', repeatDelay: 1 }}
                        />
                        <span className="relative z-10 flex items-center gap-2">
                          ENVIAR MENSAJE
                          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      </motion.button>
                    </motion.div>
                  </motion.form>
                </>
              ) : (
                <div className="py-12 text-center space-y-6">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-200">
                    <CheckCircle size={36} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-2xl text-primary">Mensaje Enviado</h3>
                    <p className="text-slate-600 font-sans max-w-sm mx-auto text-sm">
                      Gracias, <strong className="text-secondary">{name}</strong>. Hemos recibido la información técnica de su propuesta. Un ingeniero especializado le contactará en un plazo máximo de 2 horas laborables.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
                    <p className="font-bold text-primary uppercase tracking-widest">Resumen de Radicación:</p>
                    <p><strong className="text-slate-400">Canal:</strong> Formulario Técnico Web de Entrada</p>
                    <p><strong className="text-slate-400">Empresa:</strong> {company || 'Particular'}</p>
                    <p><strong className="text-slate-400">Email:</strong> {email}</p>
                    <p><strong className="text-slate-400">Teléfono:</strong> {phone}</p>
                    <p><strong className="text-slate-400">Tipología:</strong> {typology || 'No especificada'}</p>
                    <p><strong className="text-slate-400">Sector:</strong> {sector || 'No especificado'}</p>
                    <p><strong className="text-slate-400">Servicios:</strong> {Object.entries(services)
                      .filter(([_, checked]) => checked)
                      .map(([key]) => {
                        if (key === 'waterproofing') return 'Impermeabilización';
                        if (key === 'detection') return 'Detección electrónica';
                        if (key === 'repairs') return 'Reparaciones';
                        if (key === 'zeroLeaks') return 'Programa Zero Filtraciones';
                        return key;
                      })
                      .join(', ') || 'Ninguno seleccionado'}</p>
                    <p><strong className="text-slate-400">m² aproximados:</strong> {area || 'No especificado'}</p>
                    <p><strong className="text-slate-400">Presupuesto asignado:</strong> {budget || 'No especificado'}</p>
                    <p><strong className="text-slate-400">Mensaje:</strong> <span className="italic text-slate-500">{message}</span></p>
                  </div>

                  <button
                    onClick={handleReset}
                    className="px-6 py-3 border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-sans font-bold text-xs rounded transition-colors uppercase tracking-widest cursor-pointer mt-4"
                  >
                    Enviar Otro Mensaje
                  </button>
                </div>
              )}

            </div>
          </motion.div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-surface-container py-24 px-6 md:px-16 border-t border-surface-variant overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="max-w-[800px] mx-auto"
        >

          <div className="text-center mb-16 space-y-2">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-primary">Consultas Frecuentes</h2>
            <p className="font-sans text-base text-slate-600">
              Respuestas rápidas a las preguntas más comunes de nuestros clientes.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => {
              const isExpanded = expandedFaq === index;
              return (
                <div
                  key={index}
                  className={`bg-white border ${isExpanded ? 'border-primary shadow-md' : 'border-surface-variant'} rounded-xl overflow-hidden transition-all duration-300`}
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className={`font-sans font-bold text-base transition-colors duration-300 ${isExpanded ? 'text-primary drop-shadow-sm' : 'text-slate-700'}`}>
                      {faq.question}
                    </span>
                    {isExpanded ? (
                      <Minus size={20} className="text-secondary shrink-0" />
                    ) : (
                      <Plus size={20} className="text-slate-400 shrink-0" />
                    )}
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 font-sans text-sm text-slate-600 leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </motion.div>
      </section>

    </div>
  );
}
