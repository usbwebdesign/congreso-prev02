'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, KeyRound, Check, AlertCircle } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import LoginSkeleton from '../login/Skeleton';
import s from '../login/Login.module.css';

function ActualizarPasswordContent() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [sessionValida, setSessionValida] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Micro-interacción de éxito visual
  const [isSuccess, setIsSuccess] = useState(false);

  // Instancia memoizada para evitar crear nuevos clientes de Supabase en cada render
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  useEffect(() => {
    let isMounted = true;

    // Escuchar eventos de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (
        session ||
        event === 'PASSWORD_RECOVERY' ||
        event === 'SIGNED_IN' ||
        event === 'USER_UPDATED'
      ) {
        setSessionValida(true);
        setCargandoSesion(false);
      }
    });

    async function inicializarSesionCompleta() {
      if (typeof window === 'undefined') return;

      // 1. Verificar si hay un código PKCE en los SearchParams (?code=...)
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && isMounted) {
          setSessionValida(true);
          setCargandoSesion(false);
          return;
        }
      }

      // 2. Extraer parámetros del hash (#access_token=...&refresh_token=...)
      if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (!error && isMounted) {
            setSessionValida(true);
            setCargandoSesion(false);
            return;
          }
        }
      }

      // 3. Comprobar si ya existe una sesión activa persistida
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session && isMounted) {
        setSessionValida(true);
        setCargandoSesion(false);
        return;
      }

      // Fallback de seguridad si no hay token ni código válido
      setTimeout(() => {
        if (isMounted) setCargandoSesion(false);
      }, 800);
    }

    inicializarSesionCompleta();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      // 1. Actualizar la contraseña en Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: password.trim(),
      });

      if (updateError) throw updateError;

      // 2. Refrescar la sesión para consolidar las cookies del usuario
      await supabase.auth.getSession();

      setIsSuccess(true);

      // 3. Redirigir al panel o inicio
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 1500);
    } catch (err) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Ocurrió un error inesperado al actualizar la contraseña');
      }
      setSubmitting(false);
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className={s.loginOverlay}>
      <div className={s.grainTexture} aria-hidden="true" />
      <div className={s.ambientLightOne} aria-hidden="true" />
      <div className={s.ambientLightTwo} aria-hidden="true" />

      {cargandoSesion ? (
        <LoginSkeleton />
      ) : isSuccess ? (
        /* ==================== VISTA DE ÉXITO ==================== */
        <div className={s.successWrapper}>
          <div className={s.successCircle}>
            <Check size={28} strokeWidth={3} className={s.checkIcon} />
          </div>
          <h3 className={s.successTitle}>¡Contraseña Establecida!</h3>
          <p className={s.successSubtitle}>Acceso concedido. Redireccionando al inicio...</p>
        </div>
      ) : !sessionValida ? (
        /* ==================== ENLACE NO VÁLIDO / EXPIRADO ==================== */
        <div className={s.loginContentWrapper} style={{ textAlign: 'center' }}>
          <div className={s.brandHeader} style={{ alignItems: 'center' }}>
            <div className={s.brandLogoWrapper}>
              <div className={s.brandLogo} style={{ borderColor: 'rgba(255, 69, 58, 0.3)' }}>
                <AlertCircle size={22} strokeWidth={1.8} style={{ color: '#ff453a' }} />
              </div>
            </div>
            <h2 className={s.title}>Enlace no válido</h2>
            <p className={s.subtitle}>
              El token de verificación ya fue utilizado o ha caducado. Solicita un nuevo correo de acceso.
            </p>
          </div>

          <button type="button" className={s.submitBtn} onClick={handleGoHome}>
            Ir a la página principal
          </button>
        </div>
      ) : (
        /* ==================== FORMULARIO DIRECTO ==================== */
        <div className={s.loginContentWrapper}>
          <div className={s.brandHeader}>
            <div className={s.brandLogoWrapper}>
              <div className={s.brandLogo}>
                <KeyRound size={22} strokeWidth={1.8} className={s.loginIcon} />
              </div>
            </div>
            <h2 className={s.title}>Crear Contraseña</h2>
            <p className={s.subtitle}>
              Establece una contraseña segura para tu cuenta del V Congreso USB.
            </p>
          </div>

          {errorMsg && <div className={s.errorAlert}>{errorMsg}</div>}

          <form onSubmit={handleSubmit} className={s.form}>
            <div className={s.inputWrapper}>
              <Lock className={s.inputIcon} size={18} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="nueva contraseña (mín. 6 caracteres)" 
                className={s.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                minLength={6}
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
              {submitting ? 'Guardando...' : 'Establecer Contraseña'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// Exportación con la frontera de Suspense para SSR en Next.js App Router
export default function ActualizarPasswordPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <ActualizarPasswordContent />
    </Suspense>
  );
}