'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Hero.module.css';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth'; // Enganchamos el estado global de auth
import RegistrationModal from '../modal/RegistrationModal';

const CountdownNoSSR = dynamic(() => import('../countdown/Countdown'), {
  ssr: false,
});

export default function Hero() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const { user, loading } = useAuth(); // Obtenemos el estado del usuario y la carga inicial

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

              {/*  CTA DINÁMICO SEGÚN EL ESTADO DE AUTH */}
              {user ? (
                /* Caso 1: Usuario Autenticado -> Acceso directo al Pase Digital */
                <Link 
                  href="/pase" 
                  className={styles.ctaButton}
                >
                  Ver mi Pase Digital
                </Link>
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