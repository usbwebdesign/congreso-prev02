'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, LogIn, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import LoginSkeleton from './Skeleton';
import s from './Login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  
  // Estado para la micro-interacción de éxito
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.push('/');
        }
      } catch (err) {
        console.error('Error inicializando auth:', err);
      } finally {
        setPageLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // En lugar de redireccionar inmediato, disparamos la recompensa visual
        setIsSuccess(true);
        
        // Esperamos a que termine la animación antes de cambiar de ruta
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1200); 
      }
    } catch (err) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Ocurrió un error inesperado al iniciar sesión');
      }
      setSubmitting(false); // Solo apagamos si hay error, si es exitoso se queda en loading/success
    }
  };

  const handleClose = () => {
    router.push('/');
  };

  return (
    <div className={s.loginOverlay}>
      <div className={s.grainTexture} aria-hidden="true" />
      <div className={s.ambientLightOne} aria-hidden="true" />
      <div className={s.ambientLightTwo} aria-hidden="true" />

      {pageLoading ? (
        <LoginSkeleton />
      ) : isSuccess ? (
        /* ==================== VISTA DE ÉXITO (UX REWARD) ==================== */
        <div className={s.successWrapper}>
          <div className={s.successCircle}>
            <Check size={28} strokeWidth={3} className={s.checkIcon} />
          </div>
          <h3 className={s.successTitle}>¡Acceso Concedido!</h3>
          <p className={s.successSubtitle}>Redireccionando al panel principal...</p>
        </div>
      ) : (
        /* ==================== FORMULARIO TRADICIONAL ==================== */
        <div className={s.loginContentWrapper}>
          <button 
            type="button" 
            className={s.backButton} 
            onClick={handleClose}
            aria-label="Volver al inicio"
          >
            <ArrowLeft size={16} />
            <span>Volver al inicio</span>
          </button>

          <div className={s.brandHeader}>
            <div className={s.brandLogoWrapper}>
              <div className={s.brandLogo}>
                <LogIn size={22} strokeWidth={1.8} className={s.loginIcon} />
              </div>
            </div>
            <h2 className={s.title}>Inicia Sesión</h2>
            <p className={s.subtitle}>
              Ingresa tus credenciales para acceder a la plataforma del V Congreso.
            </p>
          </div>

          {errorMsg && <div className={s.errorAlert}>{errorMsg}</div>}

          <form onSubmit={handleLogin} className={s.form}>
            <div className={s.inputWrapper}>
              <Mail className={s.inputIcon} size={18} />
              <input 
                type="email" 
                placeholder="correo electrónico" 
                className={s.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                disabled={submitting}
              />
            </div>

            <div className={s.inputWrapper}>
              <Lock className={s.inputIcon} size={18} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="contraseña" 
                className={s.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                disabled={submitting}
              />
              <button
                type="button"
                className={s.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                disabled={submitting}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button type="submit" className={s.submitBtn} disabled={submitting}>
              {submitting ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}