'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import styles from './Features.module.css';

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  image: string;
  detailedContent: string;
}

const featuresData: FeatureItem[] = [
  {
    id: 'tendencias',
    title: 'Tendencias Aplicadas',
    description: 'Una experiencia integral que combina las últimas tendencias globales.',
    image: '/images/features-tendencias.webp',
    detailedContent: 'Explora a fondo tecnologías emergentes, inteligencia artificial aplicada al desarrollo de productos y metodologías ágiles que están transformando la industria tecnológica global este año.'
  },
  {
    id: 'expertos',
    title: 'Interacción con expertos',
    description: 'Aprendizaje práctico de la mano de expertos de la industria.',
    image: '/images/features-experto.webp',
    detailedContent: 'Mesas redondas exclusivas, sesiones de preguntas y respuestas en tiempo real, y espacios de mentoría uno a uno con líderes técnicos y diseñadores de producto de alto nivel.'
  },
  {
    id: 'conferencias',
    title: 'Conferencias en vivo',
    description: 'Transmisiones magistrales de alto impacto.',
    image: '/images/features-conferencias.webp',
    detailedContent: 'Acceso total a las ponencias principales transmitidas en alta definición. Incluye paneles de debate multidisciplinarios, análisis de casos reales de éxito y certificaciones curriculares digitales.'
  }
];

// Variantes de animación tipadas explícitamente para evitar errores en TypeScript
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: [0.16, 1, 0.3, 1] as const 
    } 
  }
};

export default function Features() {
  const [activeCard, setActiveCard] = useState<FeatureItem | null>(null);

  // Bloquear el scroll de la página de fondo cuando la modal esté abierta
  useEffect(() => {
    if (activeCard) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [activeCard]);

  return (
    <section id='evento' className={styles.sectionContainer}>
      {/* Encabezado animado al scroll */}
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
      >
        <h2 className={styles.title}>¿Qué encontrarás en este evento?</h2>
        <h3 className={styles.subtitle}>Una nueva forma de conectar</h3>
        <p className={styles.description}>
          Una experiencia integral que combina las últimas tendencias globales 
          con el aprendizaje práctico de la mano de expertos de la industria.
        </p>
      </motion.div>

      {/* Grid de Tarjetas Animadas */}
      <motion.div 
        className={styles.gridContainer}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {featuresData.map((item) => {
          const isFullWidth = item.id === 'conferencias';
          return (
            <motion.div 
              key={item.id}
              layoutId={`card-container-${item.id}`}
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`${styles.card} ${isFullWidth ? styles.cardFullWidth : ''}`}
              onClick={() => setActiveCard(item)}
            >
              <motion.div className={styles.imageWrapper}>
                <Image 
                  src={item.image} 
                  alt={item.title}
                  fill
                  sizes={isFullWidth ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
                  className={styles.cardImage}
                />
                <div className={styles.cardOverlay} />
              </motion.div>

              <div className={isFullWidth ? styles.cardContentCentric : styles.cardContent}>
                <motion.h4 
                  layoutId={`card-title-${item.id}`}
                  className={isFullWidth ? styles.cardTitleLarge : styles.cardTitle}
                >
                  {item.title}
                </motion.h4>
                <button className={styles.cardButton}>Más información</button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Modal con Shared Layout Transition (layoutId) */}
      <AnimatePresence>
        {activeCard && (
          <motion.div 
            className={styles.modalOverlay} 
            onClick={() => setActiveCard(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className={styles.modalContent} 
              layoutId={`card-container-${activeCard.id}`}
              onClick={(e) => e.stopPropagation()}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            >
              <button 
                className={styles.closeButton} 
                onClick={() => setActiveCard(null)} 
                aria-label="Cerrar"
              >
                ✕
              </button>

              <div className={styles.modalImageWrapper}>
                <Image 
                  src={activeCard.image} 
                  alt={activeCard.title}
                  fill
                  className={styles.modalImage}
                />
                <div className={styles.modalImageOverlay} />
                <motion.h3 
                  layoutId={`card-title-${activeCard.id}`}
                  className={styles.modalTitle}
                >
                  {activeCard.title}
                </motion.h3>
              </div>

              <motion.div 
                className={styles.modalBody}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.1, duration: 0.2 }}
              >
                <p className={styles.modalText}>{activeCard.detailedContent}</p>
                <motion.button 
                  className={styles.modalCta} 
                  onClick={() => setActiveCard(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Entendido
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}