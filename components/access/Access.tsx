'use client';

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import styles from './Access.module.css';
import RegistrationModal from '../modal/RegistrationModal';

interface Benefit {
  label: string;
  description: string;
}

const licenciaturaBenefits: Benefit[] = [
  { label: 'Acceso Total:', description: 'Eentrada a las conferencias magistrales, paneles y actividades del evento.' },
  { label: 'Kit del Congreso:', description: 'material pop premium, bolso oficial de la edición 2026 y artículos promocionales.' },
  { label: 'Coffee Break & Networking:', description: 'espacios dedicados para conectar directamente con ponentes y empresas líderes.' },
  { label: 'Banquete:', description: 'comida de gala para celebrar el 45 Aniversario de la Universidad. ' },
  { label: 'Certificación Oficial:', description: 'documento digital con valor curricular avalado por la Universidad Simón Bolívar.' },
  { label: 'Plataforma Post-Evento:', description: 'acceso exclusivo a las grabaciones de las actividades grabadas durante el Congreso.' }
];

// VARIANTES DE ANIMACIÓN TIPADAS CORRECTAMENTE PARA EVITAR ERRORES DE COMPILACIÓN
const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: [0.16, 1, 0.3, 1] as const // "as const" asegura el tipo exacto de tuple exigido por Framer Motion
    } 
  }
};

const containerStaggerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2
    }
  }
};

const itemScaleVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5, 
      ease: [0.16, 1, 0.3, 1] as const 
    }
  }
};

export default function Access() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const handlePurchase = () => {
    setIsRegisterOpen(true);
  };

  return (
    <>
      <section id='acceso' className={styles.sectionContainer}>
        
        {/* Cabecera de la Sección */}
        <motion.div 
          className={styles.accessHeader}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUpVariants}
        >
          <h2 className={styles.accessTitle}>Acceso</h2>
          {/* <div className={styles.accentLine} /> */}
        </motion.div>

        {/* Bloque de Contexto */}
        <motion.div 
          className={styles.growthHeader}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUpVariants}
        >
          <h3 className={styles.growthTitle}>Diseñado para tu crecimiento profesional</h3>
          <p className={styles.growthSubtitle}>
            Consulta las actividades, materiales y dinámicas preparadas de acuerdo a tu plan de estudios institucional.
          </p>
        </motion.div>

        {/* CONTENEDOR MONOLÍTICO RECTANGULAR ÚNICO CON ANIMACIÓN */}
        <div className={styles.singleCardContainer}>
          <motion.div 
            className={styles.ticketCardRectangular}
            initial={{ opacity: 0, y: 40, scale: 0.99 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} // Corregido de cubicBezier a ease
          >
            
            {/* Lado Izquierdo: Identificador de Nivel */}
            <div className={styles.cardLeftBlock}>
              <span className={styles.badgeLabel}>CONGRESO 2026</span>
              <h4 className={styles.planTitle}>
                Entrada
              </h4>
              <p className={styles.planDescription}>
                Pase de acceso completo para la comunidad USBMéxico.
              </p>
              
              <button 
                type="button"
                className={styles.cardCtaButton}
                onClick={handlePurchase}
              >
                Adquirir Entradas
              </button>
            </div>

            {/* Lado Derecho: Listado de Beneficios Estructurado con Stagger */}
            <div className={styles.cardRightBlock}>
              <motion.ul 
                className={styles.benefitsList}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={containerStaggerVariants}
              >
                {licenciaturaBenefits.map((benefit, index) => (
                  <motion.li 
                    key={index} 
                    className={styles.benefitItem}
                    variants={itemScaleVariants}
                  >
                    <p className={styles.benefitText}>
                      <strong className={styles.benefitLabel}>{benefit.label}</strong>{' '}
                      {benefit.description}
                    </p>
                  </motion.li>
                ))}
              </motion.ul>
            </div>

          </motion.div>
        </div>

      </section>

      {/* MODAL INFORMATIVO DE REGISTRO */}
      <RegistrationModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)} 
      />
    </>
  );
}