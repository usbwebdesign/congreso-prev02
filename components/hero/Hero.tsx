'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Hero.module.css';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth'; // Enganchamos el estado global de auth
import { createBrowserClient } from '@supabase/ssr';
import RegistrationModal from '../modal/RegistrationModal';

const CountdownNoSSR = dynamic(() => import('../countdown/Countdown'), {
  ssr: false,
});

// Función auxiliar para normalizar nombres (quita acentos, mayúsculas y reemplaza espacios por guiones)
const limpiarTexto = (texto: string): string => {
  if (!texto) return '';
  return texto
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos/tildes
    .replace(/[^a-z0-9\s-]/g, '') // Elimina caracteres especiales
    .replace(/\s+/g, '-'); // Reemplaza espacios por guiones
};

export default function Hero() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const { user, loading } = useAuth(); // Obtenemos el estado del usuario y la carga inicial

  // Inicializar cliente de Supabase para el navegador
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Función para manejar la descarga de la constancia desde Supabase Storage
  const handleDescargarConstancia = async () => {
    if (!user) return;

    try {
      setDescargando(true);

      // 1. Intentar consultar la tabla 'profiles' probando primero 'id' y luego 'user_id'
      let { data: perfil, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!perfil) {
        // Segundo intento: por si la columna de relación se llama user_id
        const resSecundarios = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        perfil = resSecundarios.data;
        error = resSecundarios.error;
      }

      if (error || !perfil) {
        console.error('Error al consultar profiles en Supabase:', error);
        alert('No se encontraron tus datos de perfil registrados.');
        return;
      }

      // 2. Extraer el nombre completo independientemente de la estructura de las columnas
      let cadenaNombre = '';

      if (perfil.nombre && perfil.apellido) {
        cadenaNombre = `${perfil.nombre} ${perfil.apellido}`;
      } else if (perfil.nombre) {
        cadenaNombre = perfil.nombre;
      } else if (perfil.full_name) {
        cadenaNombre = perfil.full_name;
      } else if (perfil.nombre_completo) {
        cadenaNombre = perfil.nombre_completo;
      }

      if (!cadenaNombre) {
        alert('No se encontró una columna de nombre válida en tu perfil.');
        return;
      }

      // 3. Normalizar el nombre completo (Ej: "cesar-ariel-hernandez-guerrero.pdf")
      const nombreArchivo = `${limpiarTexto(cadenaNombre)}.pdf`;

      // 4. Obtener la URL pública desde el bucket 'constancias' en Supabase Storage
      const { data } = supabase.storage
        .from('constancias')
        .getPublicUrl(nombreArchivo);

      if (!data?.publicUrl) {
        alert('No se pudo obtener la URL de la constancia.');
        return;
      }

      // 5. Abrir el archivo PDF en una nueva pestaña
      window.open(data.publicUrl, '_blank');

    } catch (err) {
      console.error('Error al descargar la constancia:', err);
      alert('Ocurrió un error inesperado al buscar tu constancia.');
    } finally {
      setDescargando(false);
    }
  };

  return (
    <>
      <section id='inicio' className={styles.heroContainer}>
        
        {/* 1. IMAGEN DE FONDO Y OVERLAYS OPTIMIZADOS */}
        <div className={styles.backgroundImageWrapper}>
          <Image 
            src="/images/hero-bg.webp" 
            alt="V Congreso Multidisciplinario Background"
            fill
            priority
            sizes="100vw"
            className={styles.bgImage}
          />
          <div className={styles.overlayGradient} />
        </div>

        {/* 2. CONTENIDO CENTRAL (LOGO, CONTADOR, CTA DINÁMICO) */}
        <div className={styles.content}>
          <div className={styles.logoWrapper}>
            <Image 
              src="/images/logo-congreso.svg" 
              alt="5to Congreso Multidisciplinario" 
              width={500}
              height={220}
              priority
              className={styles.logo} 
            />
          </div>

          {/* SKELETON INTEGRADO: Mapea la carga tanto del contador como de la validación de Auth */}
          {loading ? (
            <div className={styles.skeletonContainer} aria-hidden="true">
              <div className={styles.skeletonCountdown} />
              <div className={styles.skeletonButton} />
            </div>
          ) : (
            <div className={styles.animatedContentBlock}>
              <CountdownNoSSR />

              {/* CTA DINÁMICO SEGÚN EL ESTADO DE AUTH */}
              {user ? (
                /* Caso 1: Usuario Autenticado -> Acceso directo al Pase Digital + Descarga de Constancia */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                  <Link 
                    href="/pase" 
                    className={styles.ctaButton}
                  >
                    Ver mi Pase Digital
                  </Link>

                  <button
                    type="button"
                    onClick={handleDescargarConstancia}
                    disabled={descargando}
                    className={styles.ctaButtonPDF}
                    style={{ opacity: descargando ? 0.7 : 1, cursor: descargando ? 'not-allowed' : 'pointer' }}
                  >
                    {descargando ? 'Buscando constancia...' : 'Descargar constancia en PDF'}
                  </button>
                </div>
              ) : (
                /* Caso 2: Usuario Invitado -> Abre Modal de Inscripción/Informes */
                <button 
                  type="button"
                  onClick={() => setIsRegisterOpen(true)} 
                  className={styles.ctaButton}
                >
                  Asegura tu lugar
                </button>
              )}
            </div>
          )}
        </div>

        {/* 3. SCROLL DOWN ARROW */}
        <a href="#oferta" className={styles.scrollArrow} aria-label="Ir a la siguiente sección">
          <svg 
            width="34" 
            height="34" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5"
          >
            <path 
              d="M7 13l5 5 5-5M7 6l5 5 5-5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </section>

      {/* MODAL INFORMATIVO DE REGISTRO */}
      <RegistrationModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)} 
      />
    </>
  );
}
