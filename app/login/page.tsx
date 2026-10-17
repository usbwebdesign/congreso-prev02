'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, User, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function HeaderNav() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndValidateSession = async () => {
      try {
        // 1. Validamos al usuario directamente con el servidor de Supabase
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          // Si el usuario fue borrado en la BD o la sesión es inválida,
          // limpiamos el estado local y forzamos el signOut de Supabase.
          setCurrentUser(null);
          setUserProfile(null);
          await supabase.auth.signOut();
        } else {
          setCurrentUser(user);

          // 2. Traemos la información actualizada del perfil precargado desde 'profiles'
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (profile) {
            setUserProfile(profile);
          } else {
            // Si el perfil ya no existe en la tabla profiles
            setUserProfile(null);
          }
        }
      } catch (err) {
        console.error('Error validando sesión:', err);
        setCurrentUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAndValidateSession();

    // 3. Suscripción en tiempo real a los cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setCurrentUser(null);
          setUserProfile(null);
          router.refresh();
        } else if (event === 'SIGNED_IN' && session) {
          fetchAndValidateSession();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUserProfile(null);
    router.push('/login');
    router.refresh();
  };

  // Extraemos el nombre para mostrar en la pastilla de bienvenida
  const displayName = 
    userProfile?.nombre_completo?.split(' ')[0] || 
    currentUser?.user_metadata?.full_name?.split(' ')[0] || 
    currentUser?.user_metadata?.nombre_completo?.split(' ')[0];

  return (
    <header style={{ width: '100%', position: 'relative', zIndex: 50 }}>
      {/* Tu barra de navegación / Navbar actual */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem' }}>
        
        {/* Enlaces de Navegación */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/">Inicio</Link>
          <Link href="#evento">Evento</Link>
          <Link href="#ponentes">Ponentes</Link>
          <Link href="#agenda">Agenda</Link>
          <Link href="#acceso">Acceso</Link>
        </div>

        {/* Acciones de Usuario (Iniciar Sesión / Cerrar Sesión) */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {!loading && (
            <>
              {currentUser && displayName ? (
                <button 
                  onClick={handleLogout}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    background: 'rgba(255,255,255,0.1)', 
                    color: '#fff', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </button>
              ) : (
                <Link 
                  href="/login"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    background: 'transparent', 
                    color: '#fff', 
                    border: '1px solid rgba(255,255,255,0.3)',
                    padding: '0.5rem 1.2rem',
                    borderRadius: '20px',
                    textDecoration: 'none'
                  }}
                >
                  <LogIn size={16} />
                  <span>Iniciar Sesión</span>
                </Link>
              )}
            </>
          )}
        </div>
      </nav>

      {/* Pastilla flotante de Bienvenida (Solo se muestra si hay una cuenta activa confirmada) */}
      {!loading && currentUser && displayName && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '0.4rem 1.2rem',
              borderRadius: '9999px',
              color: '#fff',
              fontSize: '0.9rem',
              backdropFilter: 'blur(8px)'
            }}
          >
            <User size={15} />
            <span>¡Bienvenido, {displayName}!</span>
          </div>
        </div>
      )}
    </header>
  );
}
