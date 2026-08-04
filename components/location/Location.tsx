'use client';

import React from 'react';
import Image from 'next/image';
import { Calendar } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import styles from './Location.module.css';

export default function Location() {
  const googleMapsUrl = 'https://maps.google.com/?q=Le+Crillon+Av.+Cuauhtémoc+1438+CDMX';
  const googleMapsEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3764.0694579207075!2d-99.16453652389166!3d19.36614494279821!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1ffb94c477ff9%3A0x9dec9a1ec05ad4ee!2sLe%20Crillon!5e0!3m2!1ses-419!2smx!4v1781135444121!5m2!1ses-419!2smx';
  const googleCalendarUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=V+Congreso+Multidisciplinario+USBOnline&dates=20261106T150000Z/20261108T000000Z&details=Aprende+de+los+l%C3%ADderes+de+la+industria.&location=Le+Crillon,+Av.+Cuauht%C3%A9moc+1438,+Sta+Cruz+Atoyac,+CDMX';

  // ✨ SOLUCIÓN: Tipamos explícitamente como 'Variants' para que reconozca la tupla de la curva bezier
  const fadeInVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.7, 
        ease: [0.16, 1, 0.3, 1] // Ahora TypeScript sabe con certeza que es una tupla válida
      }
    }
  };

  return (
    <section className={styles.sectionContainer}>
      <motion.h2 
        className={styles.sectionTitle}
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        ¿Dónde se llevará a cabo?
      </motion.h2>

      {/* Grid Principal Bento */}
      <motion.div 
        className={styles.bentoGrid}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        transition={{ staggerChildren: 0.12 }}
      >
        
        {/* Tarjeta 1: Dirección y Mapa */}
        <motion.div variants={fadeInVariants} className={styles.cardVenue}>
          <div className={styles.venueInfo}>
            <h3 className={styles.venueName}>Le Crillon</h3>
            <p className={styles.venueAddress}>
              Av. Cuauhtémoc 1438, Sta Cruz Atoyac, Benito Juárez, 03310 Ciudad de México, CDMX
            </p>
          </div>
          
          <div className={styles.mapContainer} style={{ position: 'relative', overflow: 'hidden' }}>
            <iframe
              src={googleMapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, position: 'absolute', top: 0, left: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de Le Crillon en Google Maps"
            ></iframe>
            
            <div className={styles.mapOverlay} style={{ pointerEvents: 'none' }}>
              <motion.a 
                href={googleMapsUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.mapButton}
                style={{ pointerEvents: 'auto' }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                Abrir en Google Maps
              </motion.a>
            </div>
          </div>
        </motion.div>

        {/* Tarjeta 2: Fachada / Fotografía del Recinto */}
        <motion.div variants={fadeInVariants} className={styles.cardImage}>
          <Image 
            src="/images/venue-facade.webp"
            alt="Instalaciones del evento"
            fill
            sizes="(max-width: 1024px) 100vw, 600px"
            priority
            className={styles.facadeImage}
          />
        </motion.div>

        {/* Tarjeta 3: Bloque de Fechas Horizontal Completo */}
        <motion.div variants={fadeInVariants} className={styles.cardDates}>
          <div className={styles.dateMeta}>
            <h4 className={styles.dateLabel}>Días</h4>
            <p className={styles.dateDays}>6 y 7 de Noviembre</p>
            
            <div className={styles.timeRow}>
              <div className={styles.calendarIconWrapper}>
                <Calendar size={20} />
              </div>
              <div>
                <p className={styles.timeRange}>9:00 am - 6:00 pm</p>
                <p className={styles.timeZone}>(Hora CDMX)</p>
              </div>
            </div>
          </div>

          <motion.a 
            href={googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.calendarCta}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
          >
            Agendar en Calendar
          </motion.a>
        </motion.div>

      </motion.div>
    </section>
  );
}