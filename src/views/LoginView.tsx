import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { ScreenId } from '../types';
import logoUrl from '../assets/logo.png';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../config/msalConfig';

interface LoginViewProps {
  onNavigate: (screen: ScreenId, transition: 'none' | 'push') => void;
}

export default function LoginView({ onNavigate }: LoginViewProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

    const { instance, accounts } = useMsal();
  
  const handleMicrosoftLogin = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      const loginResponse = await instance.loginPopup(loginRequest);
      
      if (loginResponse && loginResponse.accessToken) {
        // Enviar el token al backend
        const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:4000/api') + '/auth/microsoft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: loginResponse.accessToken })
        });
        
        const data = await res.json();
        
        if (!data.success || !data.data) {
          setErrorMsg(data.message || 'Error al iniciar sesión con Microsoft');
          setIsSubmitting(false);
          return;
        }
        
        login(data.data.user, data.data.token);
        
        if (data.data.user.role === 'CLIENT') {
          navigate('/app/cliente');
        } else {
          navigate('/app/empleado');
        }
      } else {
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || 'Error de autenticación con Microsoft');
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Por favor, rellena todos los campos.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const data = await authService.login(email, password);

      if (!data.success || !data.data) {
        setErrorMsg(data.message || 'Error al iniciar sesión');
        setIsSubmitting(false);
        return;
      }

      // Login exitoso
      login(data.data.user, data.data.token);
      
      // Dependiendo del rol del usuario navegamos a un portal u otro
      if (data.data.user.role === 'CLIENT') {
        navigate('/app/cliente');
      } else {
        navigate('/app/empleado');
      }
      
    } catch (error: any) {
      console.error("Error connecting to backend:", error);
      setErrorMsg(error.response?.data?.message || 'Error de conexión con el servidor.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-grow w-full bg-[#001c3a] text-white flex flex-col justify-center items-center relative p-6 py-20">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 md:p-10 relative z-10 text-slate-800"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logoUrl} alt="Coatline Logo" className="h-10 w-auto filter invert brightness-0" />
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display font-black text-4xl text-primary uppercase tracking-widest mb-6">
            Acceso
          </h1>
          <p className="font-sans text-sm text-slate-500">
            Ingresa tus credenciales corporativas para continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 font-sans text-sm p-3 rounded border border-red-100 text-center">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="font-sans font-semibold text-xs text-slate-600 uppercase tracking-wide">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@empresa.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-sans font-semibold text-xs text-slate-600 uppercase tracking-wide">
                Contraseña
              </label>
              <a href="#" className="font-sans text-xs text-secondary font-semibold hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-secondary transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-secondary text-white font-sans font-bold text-sm rounded-lg hover:bg-secondary-container transition-all flex justify-center items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>Acceder <ArrowRight size={16} /></>
            )}
          </button>
        </form>

          <div className="relative flex items-center justify-center mt-6 mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative px-4 bg-white text-xs text-slate-400 font-sans uppercase tracking-wider">
              O iniciar sesión con
            </div>
          </div>

          <button
            type="button"
            onClick={handleMicrosoftLogin}
            disabled={isSubmitting}
            className="w-full py-3.5 bg-white border border-slate-300 text-slate-700 font-sans font-bold text-sm rounded-lg hover:bg-slate-50 transition-all flex justify-center items-center gap-3 shadow-sm hover:shadow disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 21 21">
              <title>MS-SymbolLockup</title>
              <rect x="1" y="1" width="9" height="9" fill="#f25022" />
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
              <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
              <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
            </svg>
            Microsoft Outlook
          </button>
        
        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="font-sans text-xs text-slate-500">
            ¿No tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('contact', 'push'); }} className="text-[#001c3a] font-bold hover:text-secondary transition-colors">Solicita información</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
