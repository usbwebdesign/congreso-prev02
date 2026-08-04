'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, Check } from 'lucide-react';

// Si creaste un componente Skeleton separado puedes importarlo, 
// o bien renderizamos la estructura skeleton directa si pageLoading está activo.
import s from './Login.module.css';

export default function AdminLoginPage() {
  const router = useRouter();
  
  // Estados de datos
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados de interfaz y flujo
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  // Cliente Supabase Browser
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. Verificación inicial de sesión al montar
  useEffect(() => {
    let isMounted = true;

    const checkExistingSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Verificar si la sesión existente pertenece a un admin
          const { data: perfil } = await supabase
            .from('profiles')
            .select('rol')
            .eq('id', session.user.id)
            .single();

          if (isMounted && perfil?.rol?.toLowerCase() === 'admin') {
            router.push('/admin/importar');
            return;
          }
        }
      } catch (err) {
        console.error('Error al validar sesión inicial:', err);
      } finally {
        if (isMounted) {
          setPageLoading(false);
        }
      }
    };

    checkExistingSession();

    return () => {
      isMounted = false;
    };
  }, [router, supabase]);

  // 2. Proceso de Login con validación de Rol + Animación de Éxito
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      // Step A: Autenticar en Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !data.user) {
        throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.');
      }

      // Step B: Verificar Rol de Administrador en `profiles`
      const { data: perfil, error: perfilError } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', data.user.id)
        .single();

      if (perfilError || perfil?.rol?.toLowerCase() !== 'admin') {
        // Cerrar sesión no autorizada de inmediato
        await supabase.auth.signOut();
        throw new Error('Acceso restringido: Tu cuenta no posee permisos de administrador.');
      }

      // Step C: Éxito -> Disparar Recompensa Visual
      setIsSuccess(true);

      // Esperar la animación visual antes de redirigir
      setTimeout(() => {
        router.push('/admin/importar');
        router.refresh();
      }, 1200);

    } catch (err) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Ocurrió un error inesperado al iniciar sesión.');
      }
      setSubmitting(false); // Solo se restaura el botón si hubo un error
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className={s.loginOverlay}>
      {/* Iluminación y texturas de fondo */}
      <div className={s.grainTexture} aria-hidden="true" />
      <div className={s.ambientLightOne} aria-hidden="true" />
      <div className={s.ambientLightTwo} aria-hidden="true" />

      {/* ==================== ESTADO 1: SKELETON LOADER ==================== */}
      {pageLoading ? (
        <div className={s.loginContentWrapper}>
          <div className={`${s.skeletonBase} ${s.skeletonBackBtn}`} />
          <div className={s.brandHeader}>
            <div className={s.brandLogoWrapper}>
              <div className={`${s.skeletonBase} ${s.skeletonLogo}`} />
            </div>
            <div className={`${s.skeletonBase} ${s.skeletonTitle}`} />
            <div className={`${s.skeletonBase} ${s.skeletonSubtitleLine1}`} />
            <div className={`${s.skeletonBase} ${s.skeletonSubtitleLine2}`} />
          </div>
          <div className={s.form}>
            <div className={`${s.skeletonBase} ${s.skeletonInput}`} />
            <div className={`${s.skeletonBase} ${s.skeletonInput}`} />
            <div className={`${s.skeletonBase} ${s.skeletonButton}`} />
          </div>
        </div>
      ) : isSuccess ? (
        /* ==================== ESTADO 2: MICRO-INTERACCIÓN DE ÉXITO ==================== */
        <div className={s.successWrapper}>
          <div className={s.successCircle}>
            <Check size={28} strokeWidth={3} className={s.checkIcon} />
          </div>
          <h3 className={s.successTitle}>¡Acceso Concedido!</h3>
          <p className={s.successSubtitle}>Redireccionando al panel de administración...</p>
        </div>
      ) : (
        /* ==================== ESTADO 3: FORMULARIO PRINCIPAL ==================== */
        <div className={s.loginContentWrapper}>
          <button 
            type="button" 
            className={s.backButton} 
            onClick={handleBackToHome}
            aria-label="Volver al inicio"
          >
            <ArrowLeft size={16} />
            <span>Volver al inicio</span>
          </button>

          <div className={s.brandHeader}>
            <div className={s.brandLogoWrapper}>
              <div className={s.brandLogo}>
                <ShieldCheck size={22} strokeWidth={1.8} className={s.loginIcon} />
              </div>
            </div>
            <h2 className={s.title}>Panel de Control</h2>
            <p className={s.subtitle}>
              Ingresa tus credenciales administrativas del Congreso USB.
            </p>
          </div>

          {errorMsg && <div className={s.errorAlert}>{errorMsg}</div>}

          <form onSubmit={handleLogin} className={s.form}>
            {/* Campo Correo */}
            <div className={s.inputWrapper}>
              <Mail className={s.inputIcon} size={18} />
              <input 
                type="email" 
                placeholder="correo institucional (admin@usb.ve)" 
                className={s.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                disabled={submitting}
              />
            </div>

            {/* Campo Contraseña */}
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
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Botón de Envío */}
            <button type="submit" className={s.submitBtn} disabled={submitting}>
              {submitting ? 'Verificando permisos...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}