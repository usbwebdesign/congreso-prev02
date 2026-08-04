"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth'; 
import { createBrowserClient } from '@supabase/ssr';
import DigitalBadge from '@/components/badge/DigitalBadge';
import s from './pase.module.css';

interface UserProfile {
  nombre_completo?: string;
  facultad?: string;
  rol?: string;
}

// Cliente Supabase fuera del render
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PasePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fetchingProfile, setFetchingProfile] = useState(false);

  useEffect(() => {
    // 1. Si la autenticación ya terminó y NO hay usuario, salir al inicio
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    let isMounted = true;

    async function getProfileData() {
      if (!user) {
        if (isMounted) setFetchingProfile(false);
        return;
      }
      
      setFetchingProfile(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('nombre_completo, facultad, rol')
          .eq('id', user.id)
          .maybeSingle(); // Cambiado de .single() a .maybeSingle() para evitar crash si no existe fila

        if (error) {
          console.warn('Advertencia al consultar perfil:', error.message);
        }

        if (data && isMounted) {
          setProfile(data);
        }
      } catch (e) {
        console.error('Error imprevisto al consultar perfil:', e);
      } finally {
        if (isMounted) {
          setFetchingProfile(false);
        }
      }
    }

    if (user && !authLoading) {
      getProfileData();
    }
    
    return () => {
      isMounted = false;
    };
  }, [user, authLoading, router]);

  // Si la autenticación aún está resolviendo o estamos trayendo el perfil
  const isLoading = authLoading || (fetchingProfile && !profile);

  if (isLoading) {
    return (
      <div className={s.pageWrapper}>
        <div className={s.skeletonCard}>
          <div className={s.skeletonHeader}>
            <div className={s.skeletonLogo} />
            <div className={s.skeletonBadge} />
          </div>
          <div className={s.skeletonBody}>
            <div className={s.skeletonLineShort} />
            <div className={s.skeletonTitle} />
            <div className={s.skeletonLineMedium} />
            <div className={s.skeletonName} />
            <div className={s.skeletonGrid}>
              <div className={s.skeletonLineShort} />
              <div className={s.skeletonLineShort} />
            </div>
          </div>
          <div className={s.skeletonFooter}>
            <div className={s.skeletonLineShort} />
            <div className={s.skeletonBadgeSmall} />
          </div>
        </div>
      </div>
    );
  }

  // Si después de cargar no hay usuario autenticado
  if (!user) return null;

  // Resolución de variables con fallbacks impecables
  const nombre = profile?.nombre_completo || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Asistente';
  const rol = profile?.rol || user.user_metadata?.rol || 'Asistente';
  const facultad = profile?.facultad || user.user_metadata?.facultad || 'Universidad Simón Bolívar';

  return (
    <div className={s.pageWrapper}>
      <motion.button 
        className={s.backButton}
        onClick={() => router.push('/')}
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.97 }}
        type="button"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={s.backIcon}
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Regresar al inicio
      </motion.button>

      <main className={s.mainContent}>
        <motion.div 
          className={s.metaHeader}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.2, 0, 0, 1], duration: 0.4, delay: 0.1 }}
        >
          <span className={s.badgeTag}>ACCESO CONFIRMADO</span>
          <h1 className={s.pageTitle}>Tu Credencial Digital</h1>
          <p className={s.pageSubtitle}>
            Presenta esta credencial desde tu dispositivo móvil al ingresar a los espacios del evento.
          </p>
        </motion.div>

        <div className={s.badgeZone}>
          <DigitalBadge 
            key={user.id}
            userName={nombre} 
            userEmail={user.email || ''} 
            userRole={rol}
            userFaculty={facultad}
          />
        </div>
      </main>
    </div>
  );
}