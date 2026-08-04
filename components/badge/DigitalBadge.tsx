"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './DigitalBadge.module.css';

export interface DigitalBadgeProps {
  userName?: string;
  userEmail?: string;
  userRole?: string;
  userFaculty?: string;
}

const DigitalBadge: React.FC<DigitalBadgeProps> = ({ 
  userName = "José Antonio Limón Navarro", 
  userEmail = "j.limon@usb.edu.mx",
  userRole = "Asistente",
  userFaculty = "Universidad Simón Bolívar"
}) => {
  
  const materialEase = [0.2, 0, 0, 1] as const; 

  return (
    <motion.div 
      className={styles.walletCard || ''}
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: materialEase }}
    >
      <div className={styles.accentStrip || ''} />

      {/* Encabezado con Logos */}
      <div className={styles.cardHeader || ''}>
        <div className={styles.brandContainer || ''}>
          <div className={styles.logoWrapper || ''}>
            <Image 
              src="/images/logo-usb.webp" 
              alt="Universidad Simón Bolívar"
              width={110}
              height={32}
              style={{ width: 'auto', height: '1.8rem' }} 
              priority
            />
          </div>

          <div className={styles.logoWrapper || ''}>
            <Image 
              src="/images/5toCongresoMultidisciplinarioUSB2026 (2).webp" 
              alt="5to Congreso Multidisciplinario"
              width={110}
              height={32}
              style={{ width: 'auto', height: '1.8rem' }} 
              priority
            />
          </div>
        </div>
        <div className={styles.headerRight || ''}>
          <span className={styles.dateLabel || ''}>CDMX</span>
        </div>
      </div>

      {/* Cuerpo del Pase */}
      <div className={styles.cardBody || ''}>
        {/* Identificador del Congreso */}
        <div className={styles.fieldGroup || ''}>
          <div className={styles.eventContextRow}>
            <span className={styles.editionBadge || ''}>5TO CONGRESO MULTIDISCIPLINARIO</span>
          </div>
          <p className={styles.eventTitle || ''}>Innovar para Transformar</p>
        </div>

        {/* Titular del Pase */}
        <div className={`${styles.fieldGroup || ''} ${styles.heroField || ''}`}>
          <label className={styles.fieldLabel || ''}>ASISTENTE / ATTENDEE</label>
          <h2 className={styles.passengerName || ''}>{userName}</h2>
        </div>

{/* Información del Asistente (Homologada y fluida) */}
        <div className={styles.metaGrid || ''}>
          <div className={styles.fieldGroup || ''}>
            <label className={styles.fieldLabel || ''}>ROL / PERFIL</label>
            <p className={styles.metaValue || ''}>{userRole}</p>
          </div>

          <div className={styles.fieldGroup || ''}>
            <label className={styles.fieldLabel || ''}>FACULTAD / INSTITUCIÓN</label>
            <p className={styles.metaValue || ''}>{userFaculty}</p>
          </div>
        </div>
        
        {/* Correo y Horario */}
        <div className={styles.metaGrid || ''}>
          <div className={styles.fieldGroup || ''}>
            <label className={styles.fieldLabel || ''}>CORREO ELECTRÓNICO</label>
            <p className={styles.metaValue || ''}>{userEmail}</p>
          </div>
        </div>

        <div className={`${styles.fieldGroup || ''} ${styles.leftAlign || ''}`}>
          <label className={styles.fieldLabel || ''}>FECHA Y HORA / DATE & TIME</label>
          <p className={`${styles.metaValue || ''} ${styles.dateHighlight || ''}`}>
            20 y 21 OCT <span className={styles.timeLabel}>• 8:00 AM</span>
          </p>
        </div>
      </div>

      {/* Troquelado */}
      <div className={styles.ticketCutter || ''}>
        <div className={styles.leftNotch || ''} />
        <div className={styles.dashedLine || ''} />
        <div className={styles.rightNotch || ''} />
      </div>

      {/* Footer */}
      <div className={styles.cardFooter || ''}>
        <div className={styles.footerInfo || ''}>
          <span>Palacio Le Crillon</span>
        </div>
        <div className={styles.securityCode || ''}>
          PASS ID: USB-2026
        </div>
      </div>
    </motion.div>
  );
};

export default DigitalBadge;