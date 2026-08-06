"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Lock, Clock } from 'lucide-react';
import styles from './StreamingSection.module.css';

import { supabase } from '@/lib/supabase';

interface Conferencia {
  id: string; 
  titulo: string | null;   
  ponente: string | null;  
  video_url: string | null;
  disponible: boolean;
  horario?: string | null;  
}

const formatearVideoUrl = (url: string | null): string => {
  if (!url) return '';
  const limpiaUrl = url.trim();

  if (limpiaUrl.includes('youtube.com/watch?v=')) {
    const videoId = limpiaUrl.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  if (limpiaUrl.includes('youtu.be/')) {
    const videoId = limpiaUrl.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  if (limpiaUrl.includes('vimeo.com/') && !limpiaUrl.includes('player.vimeo.com')) {
    const videoId = limpiaUrl.split('vimeo.com/')[1]?.split('?')[0];
    return `https://player.vimeo.com/video/${videoId}`;
  }
  
  return limpiaUrl;
};

const StreamingSection: React.FC = () => {
  const { user, loading } = useAuth();
  const [conferencias, setConferencias] = useState<Conferencia[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [fetchingData, setFetchingData] = useState(true);

  // Consulta el nombre completo desde la tabla 'profiles'
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('nombre_completo')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        if (data?.nombre_completo) {
          // Muestra el nombre completo tal como viene en la tabla
          setUserName(data.nombre_completo);
          
          // Nota: Si en algún momento prefieres mostrar solo el primer nombre, usa:
          // setUserName(data.nombre_completo.trim().split(' ')[0]);
        }
      } catch (error) {
        console.error("Error al obtener el perfil de usuario:", error);
      }
    };

    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    const fetchConferencias = async () => {
      const startTime = Date.now();

      try {
        setFetchingData(true);
        
        const { data, error } = await supabase
          .from('conferencias')
          .select('id, titulo, ponente, video_url, disponible, horario')
          .order('horario', { ascending: true });
          
        if (error) throw error;
        
        if (data) {
          if (data.length === 1) {
            const placeholdersBloqueados: Conferencia[] = [
              {
                id: "placeholder-2",
                titulo: null, 
                ponente: null,
                video_url: null,
                disponible: false,
                horario: null 
              },
              {
                id: "placeholder-3",
                titulo: null,
                ponente: null,
                video_url: null,
                disponible: false,
                horario: null
              }
            ];
            
            const endTime = Date.now();
            const timeElapsed = endTime - startTime;
            const minDuration = 700;

            if (timeElapsed < minDuration) {
              setTimeout(() => {
                setConferencias([...data, ...placeholdersBloqueados]);
                setFetchingData(false);
              }, minDuration - timeElapsed);
            } else {
              setConferencias([...data, ...placeholdersBloqueados]);
              setFetchingData(false);
            }

          } else {
            const endTime = Date.now();
            const timeElapsed = endTime - startTime;
            const minDuration = 700;

            if (timeElapsed < minDuration) {
              setTimeout(() => {
                setConferencias(data);
                setFetchingData(false);
              }, minDuration - timeElapsed);
            } else {
              setConferencias(data);
              setFetchingData(false);
            }
          }
        }
        
      } catch (error) {
        console.error("Error en el Auditorio Virtual:", error);
        setFetchingData(false);
      }
    };

    if (user) {
      fetchConferencias();
    }
  }, [user]);

  if (loading || !user) return null;

  return (
    <section id="conferencias" className={styles.sectionWrapper}>
      
      {/* HEADER DE LA SECCION */}
      <div className={styles.sectionHeader}>
        <div className={styles.badgeLive}>
          <span className={styles.pulseDot}></span>
          EN VIVO Y GRABACIONES
        </div>
        <h2 className={styles.mainTitle}>Auditorio Virtual</h2>
        <div className={styles.accentLine} />
        <p className={styles.subtitle}>
          Bienvenido, <span className={styles.userHighlight}>{userName || user.email?.split('@')[0]}</span>. Como asistente registrado, tienes acceso exclusivo al catalogo multimedia del congreso.
        </p>
      </div>

      {/* RENDERIZADO PRINCIPAL CON SKELETON */}
      {fetchingData ? (
        <div className={styles.gridConferencias}>
          {[1, 2, 3].map((n) => (
            <div key={`skeleton-${n}`} className={styles.skeletonCard}>
              <div className={styles.skeletonMedia} />
              <div className={styles.skeletonInfo}>
                <div className={styles.skeletonMeta} />
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonSpeaker} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.gridConferencias}>
          {conferencias.map((conf) => (
            <article key={conf.id} className={styles.cardConferencia}>
              
              {/* CONTENEDOR MULTIMEDIA */}
              <div className={styles.mediaContainer}>
                {conf.disponible && conf.video_url ? (
                  <iframe
                    src={formatearVideoUrl(conf.video_url)}
                    title={conf.titulo || "Transmision del Congreso"}
                    className={styles.videoIframe}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className={styles.blurOverlay}>
                    <div className={styles.blurBackgroundIllustration} />
                    <div className={styles.blurContent}>
                      <div className={styles.lockIconCircle}>
                        <Lock size={18} />
                      </div>
                      <span className={styles.comingSoonTag}>Proximamente</span>
                      <p className={styles.blurText}>
                        La grabacion se habilitara al concluir la ponencia en el evento.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* METADATOS */}
              <div className={styles.cardInfo}>
                <div className={styles.metaTime}>
                  <Clock size={12} />
                  <span>{conf.horario || "Horario por confirmar"}</span>
                </div>
                
                <h3 className={styles.confTitle}>
                  {conf.titulo || "Ponencia Magistral del Congreso"}
                </h3>
                
                <p className={styles.confSpeaker}>
                  {conf.ponente ? (
                    <>Por: <strong>{conf.ponente}</strong></>
                  ) : (
                    <span className={styles.placeholderSutil}>Conferencista por asignar</span>
                  )}
                </p>
              </div>

            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default StreamingSection;