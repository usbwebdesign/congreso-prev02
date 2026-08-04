'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import s from './Speakers.module.css';

interface Speaker {
  id: string;
  name: string;
  role: string;
  company: string; 
  image_url: string;
  bio: string;
  linkedin_url?: string;
  x_url?: string;
  facebook_url?: string;
}

const SOCIAL_ICONS = {
  linkedin: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect x="2" y="9" width="4" height="12"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </svg>
  ),
  x: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
    </svg>
  ),
  facebook: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
  )
};

export default function Speakers() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);

  const SPEAKERS_PER_PAGE = 4;

  useEffect(() => {
    async function fetchSpeakers() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('speakers')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;
        if (data) setSpeakers(data);
      } catch (err) {
        console.error('Error cargando ponentes en el Home:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSpeakers();
  }, []);

  useEffect(() => {
    if (selectedSpeaker) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedSpeaker]);

  const totalPages = Math.ceil(speakers.length / SPEAKERS_PER_PAGE);
  const indexOfLastSpeaker = currentPage * SPEAKERS_PER_PAGE;
  const indexOfFirstSpeaker = indexOfLastSpeaker - SPEAKERS_PER_PAGE;
  const currentSpeakers = speakers.slice(indexOfFirstSpeaker, indexOfLastSpeaker);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // Variantes para la revelación sutil de los elementos por scroll
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className={s.sectionContainer} id="ponentes">
      
      {/* BARRA DE CONTROL SUPERIOR */}
      <div className={s.topControlBar}>
        <div className={s.paginationIndicator}>
          <span className={s.pageNumbers}>
            {loading ? '...' : `${currentPage} de ${totalPages || 1}`}
          </span>
          <Link href="/ponentes" className={s.viewAllLink}>
            Ver todos los ponentes
            <ArrowUpRight size={16} className={s.arrowIcon} />
          </Link>
        </div>

        <div className={s.arrowControls}>
          <button 
            className={s.arrowButton} 
            onClick={prevPage} 
            disabled={loading || currentPage === 1 || totalPages === 0}
            aria-label="Página anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            className={s.arrowButton} 
            onClick={nextPage} 
            disabled={loading || currentPage === totalPages || totalPages === 0}
            aria-label="Página siguiente"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* ENCABEZADO */}
      <div className={s.header}>
        <h2 className={s.title}>Ponentes</h2>
        <h3 className={s.subtitle}>Aprende de los líderes de la industria</h3>
        <p className={s.description}>
          Escucha a expertos multidisciplinarios que están transformando 
          el entorno profesional con ideas disruptivas e innovación.
        </p>
      </div>

      {/* REVELADO FLUIDO ENTRE SKELETON Y CONTENIDO REAL */}
      <div className={s.gridWrapper}>
        <AnimatePresence mode="wait">
          {loading ? (
            /* ⏳ CASO A: RENDERIZADO DEL SKELETON CON GRID IDÉNTICO */
            <motion.div 
              key="skeleton-grid"
              className={s.speakersGrid}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {Array.from({ length: SPEAKERS_PER_PAGE }).map((_, idx) => (
                <div key={`skeleton-card-${idx}`} className={s.skeletonCard} aria-hidden="true">
                  <div className={s.skeletonContent}>
                    <div className={s.skeletonName} />
                    <div className={s.skeletonRole} />
                    <div className={s.skeletonSocials}>
                      <div className={s.skeletonCircle} />
                      <div className={s.skeletonCircle} />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            /*  CASO B: CONTENIDO REAL MAPEADO Y ANIMADO CON SCROLL-MOTION */
            <motion.div 
              key={`real-grid-page-${currentPage}`} 
              className={s.speakersGrid}
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              {currentSpeakers.map((speaker) => (
                <motion.div 
                  key={speaker.id} 
                  className={s.card}
                  variants={cardVariants}
                  onClick={() => setSelectedSpeaker(speaker)}
                  whileHover={{ y: -4, borderColor: "rgba(255, 255, 255, 0.12)" }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className={s.imageWrapper}>
                    <Image 
                      src={speaker.image_url || '/images/speaker-placeholder.jpg'} 
                      alt={speaker.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 280px"
                      className={s.speakerImage}
                      priority
                    />
                    <div className={s.cardOverlay} />
                  </div>

                  <div className={s.cardContent}>
                    <h4 className={s.speakerName}>{speaker.name}</h4>
                    <p className={s.speakerRole}>
                      {speaker.role}{speaker.company ? `, ${speaker.company}` : ''}
                    </p>
                    
                    <div className={s.socials} onClick={(e) => e.stopPropagation()}>
                      {speaker.x_url && speaker.x_url.trim() !== '' && (
                        <motion.a whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} href={speaker.x_url} target="_blank" rel="noreferrer" className={s.iconCircle} aria-label="X">
                          {SOCIAL_ICONS.x}
                        </motion.a>
                      )}
                      {speaker.linkedin_url && speaker.linkedin_url.trim() !== '' && (
                        <motion.a whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} href={speaker.linkedin_url} target="_blank" rel="noreferrer" className={s.iconCircle} aria-label="LinkedIn">
                          {SOCIAL_ICONS.linkedin}
                        </motion.a>
                      )}
                      {speaker.facebook_url && speaker.facebook_url.trim() !== '' && (
                        <motion.a whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} href={speaker.facebook_url} target="_blank" rel="noreferrer" className={s.iconCircle} aria-label="Facebook">
                          {SOCIAL_ICONS.facebook}
                        </motion.a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DETALLE MODAL PERMANECE IGUAL CON SU SOPORTE ANIMATEPRESENCE PROPORCIONADO */}
      <AnimatePresence>
        {selectedSpeaker && (
          <motion.div 
            className={s.modalOverlay} 
            onClick={() => setSelectedSpeaker(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className={s.modalContent} 
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
            >
              <button className={s.closeButton} onClick={() => setSelectedSpeaker(null)}>
                ✕
              </button>
              <div className={s.modalBody}>
                <div className={s.modalAvatarWrapper}>
                  <Image 
                    src={selectedSpeaker.image_url || '/images/speaker-placeholder.jpg'} 
                    alt={selectedSpeaker.name}
                    width={100}
                    height={100}
                    className={s.modalAvatar}
                  />
                </div>
                <h3 className={s.modalName}>{selectedSpeaker.name}</h3>
                <p className={s.modalRole}>
                  {selectedSpeaker.role}{selectedSpeaker.company ? `, ${selectedSpeaker.company}` : ''}
                </p>
                
                <div className={s.socials} style={{ justifyContent: 'center', marginTop: '12px', marginBottom: '4px', gap: '8px' }}>
                  {selectedSpeaker.x_url && selectedSpeaker.x_url.trim() !== '' && (
                    <a href={selectedSpeaker.x_url} target="_blank" rel="noreferrer" className={s.iconCircle} aria-label="X">
                      {SOCIAL_ICONS.x}
                    </a>
                  )}
                  {selectedSpeaker.linkedin_url && selectedSpeaker.linkedin_url.trim() !== '' && (
                    <a href={selectedSpeaker.linkedin_url} target="_blank" rel="noreferrer" className={s.iconCircle} aria-label="LinkedIn">
                      {SOCIAL_ICONS.linkedin}
                    </a>
                  )}
                  {selectedSpeaker.facebook_url && selectedSpeaker.facebook_url.trim() !== '' && (
                    <a href={selectedSpeaker.facebook_url} target="_blank" rel="noreferrer" className={s.iconCircle} aria-label="Facebook">
                      {SOCIAL_ICONS.facebook}
                    </a>
                  )}
                </div>

                <div className={s.divider} />
                <p className={s.modalBio}>{selectedSpeaker.bio}</p>
                <motion.button 
                  className={s.modalCta} 
                  onClick={() => setSelectedSpeaker(null)}
                  whileHover={{ backgroundColor: "#e5e5e5" }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cerrar Perfil
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}