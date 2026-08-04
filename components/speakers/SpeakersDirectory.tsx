'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import s from './SpeakersDirectory.module.css';

type FacultyType = 
  | 'Ciencias Humanas' 
  | 'Ciencia y Tecnología' 
  | 'Ciencias Económico Administrativas y Negocios';

interface Speaker {
  id: string;
  name: string;
  role: string;
  company: string;
  image_url: string;
  bio: string;
  faculty: FacultyType;
  linkedin_url?: string;
  x_url?: string;
  facebook_url?: string;
}

type FacultyFilter = 'Todos' | FacultyType;

const FACULTY_LABELS: Record<FacultyFilter, string> = {
  'Todos': 'Todos',
  'Ciencias Humanas': 'Ciencias Humanas (FCH)',
  'Ciencia y Tecnología': 'Ciencia y Tecnología (FCYT)',
  'Ciencias Económico Administrativas y Negocios': 'Económico Administrativas y Negocios (FCEAN)'
};

export default function SpeakersDirectory() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [activeFilter, setActiveFilter] = useState<FacultyFilter>('Todos');
  const [expandedSpeakerId, setExpandedSpeakerId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSpeakers() {
      setLoading(true);
      const { data, error } = await supabase
        .from('speakers_directory')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error cargando ponentes:', error.message);
      } else {
        setSpeakers(data as Speaker[]);
      }
      setLoading(false);
    }
    fetchSpeakers();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedSpeakerId(expandedSpeakerId === id ? null : id);
  };

  const filteredSpeakers = speakers.filter(speaker => 
    activeFilter === 'Todos' ? true : speaker.faculty === activeFilter
  );

  const filterOptions: FacultyFilter[] = [
    'Todos', 
    'Ciencias Humanas', 
    'Ciencia y Tecnología', 
    'Ciencias Económico Administrativas y Negocios'
  ];

  return (
    <div className={s.directoryContainer}>
      {/* Encabezado Principal */}
      <div className={s.header}>
        <div className={s.titleRow}>
          <div className={s.iconWrapper}>
            <User size={24} style={{ marginRight: '8px' }} />
          </div>
          <h1 className={s.title}>Todos los Ponentes</h1>
        </div>
      </div>

      {/* Segmented Control */}
      <div className={s.filterWrapper}>
        <div className={s.segmentedControl}>
          {filterOptions.map((option) => (
            <button
              key={option}
              className={`${s.filterButton} ${activeFilter === option ? s.filterActive : ''}`}
              onClick={() => {
                setActiveFilter(option);
                setExpandedSpeakerId(null);
                setCurrentPage(1);
              }}
            >
              {FACULTY_LABELS[option]}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className={s.listContainer}>
        {loading ? (
          <div style={{ color: '#71717a', padding: '40px 8px', fontSize: '0.95rem' }}>
            Cargando directorio de ponentes...
          </div>
        ) : filteredSpeakers.length > 0 ? (
          filteredSpeakers.map((speaker) => {
            const isExpanded = expandedSpeakerId === speaker.id;
            return (
              <div 
                key={speaker.id} 
                className={`${s.rowWrapper} ${isExpanded ? s.rowExpanded : ''}`}
              >
                <div 
                  className={s.mainRow} 
                  onClick={() => toggleExpand(speaker.id)}
                  aria-expanded={isExpanded}
                >
                  <div className={s.profileMeta}>
                    <div className={s.avatarWrapper}>
                      <Image 
                        src={speaker.image_url} 
                        alt={speaker.name}
                        fill
                        className={s.avatarImage}
                        priority
                      />
                    </div>
                    <div className={s.info}>
                      <h3 className={s.speakerName}>{speaker.name}</h3>
                    </div>
                  </div>

                  <div className={s.roleAndControl}>
                    <p className={s.speakerRole}>{speaker.role}, {speaker.company}</p>
                    <div className={`${s.chevronWrapper} ${isExpanded ? s.chevronActive : ''}`}>
                      <ChevronDown size={28} strokeWidth={1.5} />
                    </div>
                  </div>
                </div>

                {/* Acordeón */}
                <div className={`${s.dropdownContent} ${isExpanded ? s.show : ''}`}>
                  <div className={s.dropdownInner}>
                    <p className={s.bioText}>{speaker.bio}</p>
                    
                    {/* Nueva sección de redes sociales alineada */}
                    <div className={s.actionsCol}>
                      {speaker.linkedin_url && (
                        <div className={s.actionItem}>
                          <span className={s.actionLabel}>LinkedIn</span>
                          <a href={speaker.linkedin_url} className={s.iconBox} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                              <rect x="2" y="9" width="4" height="12"></rect>
                              <circle cx="4" cy="4" r="2"></circle>
                            </svg>
                          </a>
                        </div>
                      )}
                      
                      {speaker.x_url && (
                        <div className={s.actionItem}>
                          <span className={s.actionLabel}>X</span>
                          <a href={speaker.x_url} className={s.iconBox} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                            </svg>
                          </a>
                        </div>
                      )}

                      {speaker.facebook_url && (
                        <div className={s.actionItem}>
                          <span className={s.actionLabel}>Facebook</span>
                          <a href={speaker.facebook_url} className={s.iconBox} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ color: '#71717a', padding: '40px 8px', fontSize: '0.95rem' }}>
            No se encontraron ponentes registrados bajo esta facultad.
          </div>
        )}
      </div>

      {/* Paginación */}
      <div className={s.paginationWrapper}>
        <nav className={s.paginationCapsule}>
          <button className={s.pageArrow} disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
            <ChevronLeft size={20} />
          </button>
          {[1].map((page) => (
            <button key={page} className={`${s.pageNumber} ${currentPage === page ? s.activePage : ''}`} onClick={() => setCurrentPage(page)}>
              {page}
            </button>
          ))}
          <button className={s.pageArrow} disabled={true}>
            <ChevronRight size={20} />
          </button>
        </nav>
      </div>
    </div>
  );
}