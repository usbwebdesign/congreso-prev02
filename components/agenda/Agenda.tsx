"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { LogIn, Utensils, Radio, Coffee, LogOut, ChevronRight, X, Filter, Award, Calendar, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './Agenda.module.css';

export interface AgendaEvent {
  id: string;
  day: number;
  sort_order: number;
  time_start: string;
  time_end: string;
  title: string;
  type: 'welcome' | 'break' | 'conference' | 'catering' | 'closing' | 'activity';
  faculty: 'general' | 'FCH' | 'FCEAN' | 'FCYT';
  speaker_name?: string | null;
  speaker_role?: string | null;
  description?: string | null;
  bio?: string | null;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function Agenda() {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [activeFaculty, setActiveFaculty] = useState<string>('general');
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [dbLoading, setDbLoading] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const INITIAL_VISIBLE_COUNT = 4;

  useEffect(() => {
    const fetchAgenda = async () => {
      try {
        setDbLoading(true);
        const { data, error } = await supabase
          .from('agenda_events')
          .select('*')
          .order('day', { ascending: true })
          .order('sort_order', { ascending: true });

        if (error) throw error;
        setEvents((data as AgendaEvent[]) || []);
      } catch (err) {
        console.error('Error cargando la agenda:', err);
      } finally {
        setDbLoading(false);
      }
    };
    fetchAgenda();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedEvent]);

  const filteredEvents = events.filter((event) => {
    const matchDay = event.day === activeDay;
    const matchFaculty = activeFaculty === 'general'
      ? true
      : (event.faculty === 'general' || event.faculty === activeFaculty);
    return matchDay && matchFaculty;
  });

  const hiddenEventsCount = filteredEvents.length - INITIAL_VISIBLE_COUNT;

  const generateGoogleCalendarUrl = (event: AgendaEvent) => {
    const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    const dateStr = event.day === 1 ? '20261020' : '20261021';
    
    const startHour = event.time_start.replace(':', '') + '00';
    const endHour = event.time_end.replace(':', '') + '00';
    const dates = `${dateStr}T${startHour}/${dateStr}T${endHour}`;
    
    const text = encodeURIComponent(
      event.faculty !== 'general' ? `[${event.faculty}] ${event.title}` : event.title
    );
    const speakerInfo = event.speaker_name ? `Expositor: ${event.speaker_name}\n` : '';
    const descText = event.description ? `Descripción: ${event.description}\n\n` : '';
    const details = encodeURIComponent(`${speakerInfo}${descText}Evento del V Congreso Multidisciplinario 2026.`);
    const location = encodeURIComponent('Campus Universitario - Salones de Sesiones');
    
    return `${baseUrl}&text=${text}&dates=${dates}&details=${details}&location=${location}`;
  };

  const renderLeftBlock = (type: AgendaEvent['type']) => {
    switch (type) {
      case 'welcome': return <div className={`${styles.iconBlock} ${styles.bgWelcome}`}><LogIn size={22} /></div>;
      case 'break': return <div className={`${styles.iconBlock} ${styles.bgBreak}`}><Utensils size={22} /></div>;
      case 'conference': return <div className={`${styles.iconBlock} ${styles.bgConference}`}><Radio size={22} /></div>;
      case 'activity': return <div className={`${styles.iconBlock} ${styles.bgActivity}`}><Award size={22} /></div>;
      case 'catering': return <div className={`${styles.iconBlock} ${styles.bgCatering}`}><Coffee size={22} /></div>;
      case 'closing': return <div className={`${styles.iconBlock} ${styles.bgClosing}`}><LogOut size={22} /></div>;
    }
  };

  const renderEventRow = (event: AgendaEvent) => {
    const isInteractive = !!event.description || event.type === 'conference' || event.type === 'activity';
    const rowClass = `${styles.row} ${isInteractive ? styles.rowInteractive : ''}`;

    return (
      <motion.div 
        key={event.id} 
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        layout
        className={rowClass}
        onClick={() => isInteractive && setSelectedEvent(event)}
      >
        {renderLeftBlock(event.type)}

        <div className={`${styles.infoCard} ${isInteractive ? styles.infoCardConference : ''}`}>
          <div className={styles.cardHeader}>
            <div>
              {event.faculty !== 'general' && (
                <span className={styles.facultyTag}>{event.faculty}</span>
              )}
              <h4 className={styles.eventTitle}>{event.title}</h4>
              <p className={styles.eventTime}>{event.time_start} - {event.time_end}</p>
            </div>
            {isInteractive && (
              <button className={styles.detailsBtn}>
                Ver detalles <ChevronRight size={14} />
              </button>
            )}
          </div>
          
          {event.speaker_name && (
            <p className={styles.speakerTag}>
              {event.speaker_name} {event.speaker_role && <>— <span className={styles.roleSub}>{event.speaker_role}</span></>}
            </p>
          )}
        </div>
      </motion.div>
    );
  };

  const renderSkeletonLoader = () => {
    return (
      <div className={styles.skeletonTimeline}>
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className={styles.row} style={{ pointerEvents: 'none' }}>
            <div className={`${styles.skeletonPulse} ${styles.skeletonIcon}`} />
            <div className={styles.skeletonCard}>
              <div className={`${styles.skeletonPulse} ${styles.skeletonTitle}`} />
              <div className={`${styles.skeletonPulse} ${styles.skeletonTime}`} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section id='agenda' className={styles.sectionContainer}>
      <h2 className={styles.sectionTitle}>Agenda del Congreso</h2>

      {/* Selector de Días */}
      <div className={styles.tabContainer}>
        <button className={`${styles.tabButton} ${activeDay === 1 ? styles.tabActive : ''}`} onClick={() => { setActiveDay(1); setIsExpanded(false); }}>Día 1</button>
        <button className={`${styles.tabButton} ${activeDay === 2 ? styles.tabActive : ''}`} onClick={() => { setActiveDay(2); setIsExpanded(false); }}>Día 2</button>
      </div>

      {/* Selector de Facultades */}
      <div className={styles.facultyFilterContainer}>
        <span className={styles.filterLabel}><Filter size={14} /> Filtrar por área:</span>
        <div className={styles.facultyChips}>
          {[
            { id: 'general', label: 'Todo el Congreso' },
            { id: 'FCH', label: 'FCH' },
            { id: 'FCEAN', label: 'FCEAN' },
            { id: 'FCYT', label: 'FCYT' }
          ].map((fac) => (
            <button
              key={fac.id}
              className={`${styles.chipButton} ${activeFaculty === fac.id ? styles.chipActive : ''}`}
              onClick={() => {
                setActiveFaculty(fac.id);
                setIsExpanded(false);
              }}
            >
              {fac.label}
            </button>
          ))}
        </div>
      </div>

      {/* Control de Flujo Centralizado */}
      <AnimatePresence mode="wait">
        {dbLoading ? (
          <motion.div 
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderSkeletonLoader()}
          </motion.div>
        ) : filteredEvents.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={styles.emptyState}
          >
            No hay actividades programadas para este segmento.
          </motion.div>
        ) : (
          <motion.div
            key={`${activeDay}-${activeFaculty}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={styles.timeline}
          >
            {filteredEvents.map((event, index) => {
              if (!isExpanded && index >= INITIAL_VISIBLE_COUNT) return null;
              return renderEventRow(event);
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botoneras de Expansión */}
      {!dbLoading && filteredEvents.length > 0 && (
        <div className={styles.expandButtonContainer}>
          {!isExpanded && hiddenEventsCount > 0 ? (
            <button onClick={() => setIsExpanded(true)} className={styles.expandButton}>
              <span>Mostrar cronograma completo</span>
              <span className={styles.expandBadge}>+{hiddenEventsCount} actividades</span>
              <ChevronDown size={15} className={styles.expandIcon} />
            </button>
          ) : isExpanded && filteredEvents.length > INITIAL_VISIBLE_COUNT ? (
            <button onClick={() => setIsExpanded(false)} className={styles.collapseButton}>
              Colapsar cronograma
            </button>
          ) : null}
        </div>
      )}

      {/* Ventana Emergente (Modal) */}
      {selectedEvent && (
        <div className={styles.modalOverlay} onClick={() => setSelectedEvent(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setSelectedEvent(null)}>
              <X size={18} />
            </button>
            
            <div className={styles.modalHeader}>
              <span className={styles.modalLabel}>
                {selectedEvent.type === 'activity' ? 'Actividad Práctica' : 'Información del Bloque'}
              </span>
              <h3 className={styles.modalTitle}>{selectedEvent.title}</h3>
              <p className={styles.modalTimeSlot}>
                Horario: {selectedEvent.time_start} a {selectedEvent.time_end} hrs
              </p>
            </div>

            <div className={styles.modalBody}>
              {selectedEvent.speaker_name && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 className={styles.modalSpeakerTitle}>
                    {selectedEvent.type === 'activity' ? 'Facilitador / Coordinador' : 'Expositor / Panelistas'}
                  </h4>
                  <p className={styles.modalSpeakerName}>
                    {selectedEvent.speaker_name}{' '}
                    {selectedEvent.speaker_role && (
                      <span className={styles.modalSpeakerRole}>({selectedEvent.speaker_role})</span>
                    )}
                  </p>
                </div>
              )}
              {selectedEvent.description && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 className={styles.modalSpeakerTitle}>Acerca de este espacio</h4>
                  <p className={styles.modalBioText}>{selectedEvent.description}</p>
                </div>
              )}
              {selectedEvent.bio && (
                <div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <h4 className={styles.modalSpeakerTitle}>Perfil del Ponente</h4>
                  <p 
                    className={styles.modalBioText} 
                    style={{ 
                      fontStyle: 'italic', 
                      backgroundColor: 'rgba(255,255,255,0.02)', 
                      padding: '10px', 
                      borderRadius: '8px' 
                    }}
                  >
                    {selectedEvent.bio}
                  </p>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <a 
                href={generateGoogleCalendarUrl(selectedEvent)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.calendarBtn}
              >
                <Calendar size={16} /> Agendar en Google Calendar
              </a>
              <button className={styles.modalCloseCta} onClick={() => setSelectedEvent(null)}>
                Volver al cronograma
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}