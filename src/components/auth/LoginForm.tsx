'use client';

import { useState } from 'react';
import { User } from '@/types';
import { INTERVIEWS_API_BASE } from '@/config';
import { useAuth } from '@/context/AuthContext';

interface LoginFormProps {
  onError: (message: string) => void;
}

export const LoginForm = ({ onError }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: false, password: false });
  
  const AUTH_URL = `${INTERVIEWS_API_BASE}/auth/login`;
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({ email: false, password: false });
    
    // Validación: solo email (formato) y presencia de ambos campos
    const emailTrim = email.trim();
    const passwordTrim = password.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim);
    if (!emailTrim || !passwordTrim || !emailOk) {
      if (!emailTrim || !passwordTrim) {
        onError('Por favor, completa todos los campos');
      } else if (!emailOk) {
        onError('Correo electrónico inválido');
      }
      setErrors({
        email: !emailTrim || !emailOk,
        password: !passwordTrim
      });
      // Enfocar primer campo con error
      if (!emailTrim || !emailOk) {
        const el = document.querySelector<HTMLInputElement>('input[type="email"]');
        el?.focus();
      } else {
        const el = document.querySelector<HTMLInputElement>('input[type="password"]');
        el?.focus();
      }
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailTrim, password: passwordTrim })
      });

      const raw = await res.text();
      let data: any = null;
      try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }

      if (!res.ok) {
        let msg = 'Error desconocido';
        switch (res.status) {
          case 400:
          case 422:
            msg = typeof data === 'string' ? data : (data?.message || 'Datos inválidos. Revisa los campos.');
            break;
          case 401:
            msg = 'Correo o contraseña incorrectos.';
            break;
          case 403:
            msg = 'No tienes permisos para acceder.';
            break;
          case 404:
            msg = 'Servicio no disponible. Intenta más tarde.';
            break;
          case 429:
            msg = 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
            break;
          default:
            msg = typeof data === 'string' ? data : (data?.message || 'Problema del servidor. Intenta más tarde.');
        }
        onError(msg);
        setErrors({ email: true, password: true });
        return;
      }

      // Expected 200: { email, role }
      const respEmail: string | undefined = data?.email;
      const role: string | undefined = data?.role;
      if (!respEmail) {
        onError('Respuesta de login inválida');
        return;
      }
      // Persist via context (sin JWT)
      login({ email: respEmail, role });
    } catch (err) {
      console.error('Login error:', err);
      onError('Sin conexión o tiempo de espera agotado. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center text-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-600/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-600/20 blur-3xl rounded-full" />
      </div>
      <div className="bg-gradient-to-br from-slate-800/95 to-slate-700/90 backdrop-blur-xl border border-slate-400/20 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] p-8 md:p-12 rounded-2xl max-w-md w-full mx-4">
        <h1
          className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent mb-2"
          style={{
            backgroundImage: 'linear-gradient(to right, var(--heading-from), var(--heading-to))'
          }}
        >
          Bienvenido
        </h1>
        <p className="text-slate-300 mb-8">Accede a tu sistema de entrevistas</p>
        
        <form onSubmit={handleSubmit} className="w-full space-y-4" aria-busy={isLoading} aria-live="polite">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.email 
                ? 'border-red-500 bg-red-50/10' 
                : 'border-slate-500/60'
            } bg-slate-700/80 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-400/60 transition-colors`}
            placeholder="Correo electrónico"
            autoComplete="email"
            aria-invalid={errors.email}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-left text-red-400 text-sm mt-1">Ingresa un correo válido.</p>
          )}
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.password 
                ? 'border-red-500 bg-red-50/10' 
                : 'border-slate-500/60'
            } bg-slate-700/80 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-400/60 transition-colors`}
            placeholder="Contraseña"
            autoComplete="current-password"
            aria-invalid={errors.password}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-left text-red-400 text-sm mt-1">La contraseña es obligatoria.</p>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.99] flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
            style={{
              backgroundImage: 'linear-gradient(to right, var(--primary-from), var(--primary-to))'
            }}
          >
            {isLoading && (
              <span className="inline-block w-5 h-5 border-2 border-white/70 border-t-transparent rounded-full animate-spin" aria-hidden="true"></span>
            )}
            <span>{isLoading ? 'Iniciando...' : 'Iniciar Sesión'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
