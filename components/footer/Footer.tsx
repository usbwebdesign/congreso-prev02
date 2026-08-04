'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth'; // Hook de sesión global
import s from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { user, loading } = useAuth(); // Consumimos el estado de sesión

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    
    // UX Defensiva: Solo hace scroll si el elemento realmente existe en el DOM
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className={s.footer}>
      <div className={s.container}>
        <div className={s.topSection}>
          
          <div className={s.brandSection}>
            <div className={s.logos}>
              {/* Enlace para el logo de la Universidad */}
              <a href="https://www.usb.edu.mx/" target="_blank" rel="noopener noreferrer">
                  <Image 
                    src="/images/universidadsimonbolivarlogo.webp"
                    alt="Logo Universidad Simón Bolívar"
                    width={150}
                    height={50}
                    style={{ width: 'auto', height: 'auto' }} 
                  />
              </a>

              {/* Enlace para el logo de USBOnline */}
              <Link href="/">
                <Image 
                  src="/images/usbonlinelogo.svg" 
                  alt="USBOnline" 
                  className={s.logoOnline} 
                  width={150} 
                  height={45}  
                />
              </Link>
            </div>

            <div className={s.mottoContainer}>
              <h2 className={s.motto}>Per Scientiam<br />ad Veritatem</h2>
              <div className={s.underline}></div>
              
              {/* BLOQUE DE REDES: FB, IG, TIKTOK, LINKEDIN */}
              <div className={s.socials}>
                {/* Facebook */}
                <a href="https://www.facebook.com/USBMexico/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978 1.602 0 2.703.095 2.703.095v3.386s-1.142-.01-2.341-.01c-1.613 0-2.273.713-2.273 2.186v1.892h3.734l-.571 3.667h-3.163v7.987L9.101 23.69z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a href="https://www.instagram.com/usbmexico/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>

                {/* TikTok */}
                <a href="https://www.tiktok.com/@usbmexico" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.54-4.06-1.44-.22-.17-.43-.35-.63-.54V14.3c.03 2.22-.65 4.54-2.26 6.13-1.81 1.87-4.66 2.51-7.1 1.79-2.36-.66-4.32-2.67-4.88-5.06-.61-2.47-.13-5.32 1.63-7.18 1.5-1.66 3.75-2.52 5.95-2.27.01 1.39-.01 2.77-.01 4.15-1.29-.15-2.66.19-3.56 1.16-.92 1.05-1.02 2.66-.23 3.84.8 1.25 2.41 1.86 3.8 1.48 1.29-.31 2.26-1.52 2.39-2.84.05-3.04.02-6.08.02-9.12z"/>
                  </svg>
                </a>

                {/* LinkedIn */}
                <a href="https://mx.linkedin.com/school/universidad-sim%C3%B3n-bol%C3%ADvar-oficial/?trk=nav_type_overview" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Navegación del Congreso */}
          <nav className={s.nav}>
            <ul className={s.navList}>
              <li><a href="#inicio" onClick={(e) => scrollToSection(e, 'inicio')}>Inicio</a></li>
              <li><a href="#evento" onClick={(e) => scrollToSection(e, 'evento')}>Evento</a></li>
              <li><a href="#ponentes" onClick={(e) => scrollToSection(e, 'ponentes')}>Ponentes</a></li>
              
              {/* Agenda pública visible para todos */}
              <li>
                <a href="#agenda" onClick={(e) => scrollToSection(e, 'agenda')}>Agenda</a>
              </li>

              {/* Streaming exclusivo para usuarios registrados */}
              {!loading && user && (
                <li>
                  <a href="#conferencias" onClick={(e) => scrollToSection(e, 'conferencias')}>Conferencias</a>
                </li>
              )}
              
              {/* Acceso exclusivo para usuarios invitados */}
              {!loading && !user && (
                <li>
                  <a href="#acceso" onClick={(e) => scrollToSection(e, 'acceso')}>Acceso</a>
                </li>
              )}
            </ul>
          </nav>

        </div>

        <div className={s.bottomSection}>
          {/* Fila superior: Dirección y Teléfono */}
          <div className={s.locationRow}>
              <a 
                href="https://maps.app.goo.gl/9PNddR7C6CGeGZWp6" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={s.location}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="18" height="18" viewBox="0 0 24 24" fill="none" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                  className={s.icon}
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>Av. Río Mixcoac 48, Insurgentes Mixcoac, CDMX.</span>
              </a>

              <a href="tel:+525556299750" className={s.location}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="18" height="18" viewBox="0 0 24 24" fill="none" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                  className={s.icon}
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>+52 (55) 5629 9700</span>
              </a>
          </div>

          {/* Fila inferior: Información Legal */}
          <div className={s.legalRow}>
            <a 
              href="/docs/Aviso_de_Privacidad.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className={s.privacy}
            >
              Aviso de privacidad
            </a>
            <span className={s.separator}>|</span>
            <p className={s.copyright}>
              Universidad Simón Bolívar México ® 
            </p>
            <span className={s.separator}>|</span>
            <p className={s.copyright}>
              Todos los derechos reservados {currentYear}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}