"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import styles from './HistoryTimeline.module.css';

interface Milestone {
  year: string;
  title: string;
  description: string;
  cardImage: string;
  bgImage: string;
}

const MILESTONES: Milestone[] = [
  {
    year: "2006",
    title: "1ER CONGRESO MULTIDISCIPLINARIO",
    description: "Un espacio para compartir conocimiento y celebrar 25 años de formación académica a nivel institucional.",
    cardImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80",
    bgImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80"
  },
  {
    year: "2011",
    title: "2DO CONGRESO MULTIDISCIPLINARIO",
    description: "Un encuentro para reflexionar sobre los desafíos que enfrentan los universitarios en México y su papel en la sociedad.",
    cardImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80",
    bgImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80"
  },
  {
    year: "2016",
    title: "3ER CONGRESO MULTIDISCIPLINARIO",
    description: "Un llamado a la responsibility social, analizando retos actuales y las perspectivas para un futuro más consciente.",
    cardImage: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80",
    bgImage: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80"
  },
  {
    year: "2021",
    title: "4TO CONGRESO MULTIDISCIPLINARIO",
    description: "Una reflexión sobre el impacto del COVID-19 y cómo la transformación e innovación social redefinieron nuestra realidad. (Primera edición en línea)",
    cardImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80",
    bgImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80"
  }
];

// Curva de aceleración ultra suave de nivel premium (Apple-style)
const fletcherEase = [0.16, 1, 0.3, 1] as const;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: fletcherEase }
  }
};

const HistoryTimeline: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const currentMilestone = MILESTONES[activeIndex];

  return (
    <section id="historia" className={styles.timelineSection}>
      
      {/* Capa de imágenes de fondo cruzadas */}
      <div className={styles.bgLayersContainer}>
        {MILESTONES.map((item, index) => (
          <div
            key={`bg-${item.year}`}
            className={`${styles.bgLayer} ${index === activeIndex ? styles.bgActive : ''}`.trim()}
            style={{ backgroundImage: `url(${item.bgImage})` }}
          />
        ))}
      </div>
      
      <div className={styles.overlayDim} />

      {/* Contenedor principal controlado por Framer Motion */}
      <motion.div 
        className={styles.container}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        
        {/* Encabezado Institucional */}
        <motion.div className={styles.header} variants={itemVariants}>
          <h2 className={styles.title}>Nuestra Trayectoria Académica</h2>
          <p className={styles.subtitle}>
            Dos décadas impulsando el conocimiento multidisciplinario y la evolución de nuestra comunidad universitaria.
          </p>
        </motion.div>

        {/* Bloque Central del Cuadro de Diálogo */}
        <motion.div className={styles.contentWorkspace} variants={itemVariants}>
          <div className={styles.dialogCard}>
            
            {/* Contenedor de Imagen Interna con Animación de Transición (Crossfade) */}
            <div className={styles.cardImageContainer}>
              <div className={styles.cardImageWrapper}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentMilestone.year}
                    initial={{ opacity: 0, filter: "blur(4px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    style={{ width: '100%', height: '100%', position: 'relative' }}
                  >
                    <Image
                      src={currentMilestone.cardImage}
                      alt={currentMilestone.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 420px"
                      priority
                      style={{ objectFit: 'cover' }}
                      className={styles.animatedImage}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Bloque de Información de la Tarjeta */}
            <div className={styles.cardInfo}>
              <h3 className={styles.cardTitle}>
                <span className={styles.highlightYear}>{currentMilestone.year}</span>
                <span className={styles.divider}>|</span>
                {currentMilestone.title}
              </h3>
              <p className={styles.cardDescription}>
                {currentMilestone.description}
              </p>
              <div className={styles.dialogArrow} />
            </div>

          </div>
        </motion.div>

        {/* Eje de la Línea de Tiempo Inferior */}
        <motion.div className={styles.axisContainer} variants={itemVariants}>
          <div className={styles.lineTrack}>
            <div 
              className={styles.lineProgress} 
              style={{ width: `${(activeIndex / (MILESTONES.length - 1)) * 100}%` }}
            />
          </div>
          
          <div className={styles.yearsGrid}>
            {MILESTONES.map((item, index) => (
              <button
                key={item.year}
                className={`${styles.yearNode} ${index === activeIndex ? styles.nodeActive : ''}`.trim()}
                onClick={() => setActiveIndex(index)}
                type="button"
              >
                <span className={styles.nodeDot} />
                <span className={styles.nodeLabel}>{item.year}</span>
              </button>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
};

export default HistoryTimeline;