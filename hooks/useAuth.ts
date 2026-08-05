'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Suscribirse a los eventos de autenticación en tiempo real
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Inicialización completa de la sesión procesando tokens/códigos
    async function initAuth() {
      if (typeof window === 'undefined') return;

      try {
        // A) Intercepta tokens de acceso en el Hash (#access_token=...)
        if (window.location.hash && window.location.hash.includes('access_token')) {
          const rawHash = window.location.hash.startsWith('#')
            ? window.location.hash.substring(1)
            : window.location.hash;

          // Limpiar si el hash viene duplicado en la URL
          const cleanHash = rawHash.split('#')[0];
          const hashParams = new URLSearchParams(cleanHash);
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            const { data: sessionData, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (!error && sessionData.user && isMounted) {
              setUser(sessionData.user);
              setLoading(false);
              return;
            }
          }
        }

        // B) Intercepta códigos PKCE en query params (?code=...)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
          const { data: exchangeData, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error && exchangeData.user && isMounted) {
            setUser(exchangeData.user);
            setLoading(false);
            return;
          }
        }

        // C) Recuperar usuario actual desde cookies/sesión almacenada
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (isMounted) {
          setUser(currentUser);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error inicializando autenticación en useAuth:', error);
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}