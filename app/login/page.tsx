'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, LogIn, Check, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import LoginSkeleton from './Skeleton';
import s from './Login.module.css';

function LoginPage() {
  const router = useRouter();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Valida la sesión directamente con el servidor de Supabase
        const { data: { user }, error } = await supabase.auth.getUser();

        if (user && !error) {
          // Si la sesión es válida y el usuario existe en el servidor, redirige
          router.push('/');
        } else {
          // Si el usuario fue borrado en la BD o el token ya no es válido,
          // se limpia la sesión local para desbloquear la pantalla de login
          await supabase.auth.signOut();
        }
      } catch (err) {
        console.error('Error inicializando auth:', err);
        await supabase.auth.signOut();
      } finally {
        setPageLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      // 1. Buscamos el perfil precargado en la tabla 'profiles' por correo
      const { data: perfilExistente } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', cleanEmail)
        .maybeSingle();

      if (isRegisterMode) {
        // MODO ACTIVACIÓN DE CUENTA (CREAR CONTRASEÑA POR PRIMERA VEZ)
        const fullName = perfilExistente?.nombre_completo || cleanEmail.split('@')[0];
        const userRole = perfilExistente?.rol || 'Alumno';
        const userFaculty = perfilExistente?.facultad || perfilExistente?.institucion || 'FCH';
        const userInstitution = perfilExistente?.institucion || 'USB';
        const userSala = perfilExistente?.sala || '';

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              full_name: fullName,
              nombre_completo: fullName,
              rol: userRole,
              facultad: userFaculty,
              institucion: userInstitution,
              sala: userSala,
            }
          }
        });

        // Si la cuenta ya existía previamente en auth.users
        if (signUpError && signUpError.message.includes('User already registered')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPassword,
          });

          if (signInData?.user) {
            // Actualizamos metadatos
            await supabase.auth.updateUser({
              data: {
                full_name: fullName,
                nombre_completo: fullName,
                rol: userRole,
                facultad: userFaculty,
                institucion: userInstitution,
                sala: userSala,
              }
            });

            setIsSuccess(true);
            setTimeout(() => {
              router.push('/');
              router.refresh();
            }, 1200);
            return;
          }

          setErrorMsg('Tu correo ya ha sido activado previamente. Intenta iniciar sesión con tu contraseña.');
          setSubmitting(false);
          return;
        }

        if (signUpError) {
          throw new Error(signUpError.message);
        }

        if (signUpData?.user) {
          setIsSuccess(true);
          setTimeout(() => {
            router.push('/');
            router.refresh();
          }, 1200);
        }

      } else {
        // INICIO DE SESIÓN TRADICIONAL
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data?.user) {
          // Si existe perfil precargado, mantenemos sincronizados los metadatos en Auth
          if (perfilExistente) {
            await supabase.auth.updateUser({
              data: {
                full_name: perfilExistente.nombre_completo,
                nombre_completo: perfilExistente.nombre_completo,
                rol: perfilExistente.rol || 'Alumno',
                facultad: perfilExistente.facultad || perfilExistente.institucion || 'FCH',
                institucion: perfilExistente.institucion || 'USB',
                sala: perfilExistente.sala || '',
              }
            });
          }

          setIsSuccess(true);
          setTimeout(() => {
            router.push('/');
            router.refresh();
          }, 1200);
        }
      }
    } catch (err: any) {
      let cleanMessage = 'Ocurrió un error al procesar la solicitud.';

      if (typeof err === 'string') {
        cleanMessage = err;
      } else if (err && typeof err === 'object' && typeof err.message === 'string') {
        cleanMessage = err.message;
      }

      if (cleanMessage.includes('Invalid login credentials')) {
        setErrorMsg('Correo electrónico o contraseña incorrectos.');
      } else {
        setErrorMsg(cleanMessage);
      }

      setSubmitting(false);
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
        <div className={s.successWrapper}>
          <div className={s.successCircle}>
            <Check size={28} strokeWidth={3} className={s.checkIcon} />
          </div>
          <h3 className={s.successTitle}>
            {isRegisterMode ? '¡Cuenta Activada!' : '¡Acceso Concedido!'}
          </h3>
          <p className={s.successSubtitle}>Redireccionando al panel principal...</p>
        </div>
      ) : (
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
                {isRegisterMode ? (
                  <UserPlus size={22} strokeWidth={1.8} className={s.loginIcon} />
                ) : (
                  <LogIn size={22} strokeWidth={1.8} className={s.loginIcon} />
                )}
              </div>
            </div>
            <h2 className={s.title}>
              {isRegisterMode ? 'Activar Cuenta' : 'Inicia Sesión'}
            </h2>
            <p className={s.subtitle}>
              {isRegisterMode 
                ? 'Ingresa tu correo pre-registrado y define tu nueva contraseña.' 
                : 'Ingresa tus credenciales para acceder a la plataforma del V Congreso.'}
            </p>
          </div>

          {errorMsg && (
            <div className={s.errorAlert}>
              {String(errorMsg)}
            </div>
          )}

          <form onSubmit={handleSubmit} className={s.form}>
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
                placeholder={isRegisterMode ? "crea tu contraseña" : "contraseña"} 
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
              {submitting 
                ? 'Procesando...' 
                : isRegisterMode 
                  ? 'Activar Cuenta y Entrar' 
                  : 'Ingresar'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMsg(null);
              }}
              style={{
                background: '#E81352',
                border: 'none',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                borderRadius: '13px',
                padding: '10px',
                textDecoration: 'none'
              }}
            >
              {isRegisterMode 
                ? '¿Ya activaste tu contraseña? Inicia sesión aquí' 
                : '¿Es tu primera vez? Activa tu cuenta y crea tu contraseña'}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

export default LoginPage;
