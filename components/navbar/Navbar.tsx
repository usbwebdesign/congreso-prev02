"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserCircle, Key, UserPlus, CheckCircle2, Ticket, LogOut, ChevronDown } from 'lucide-react'; 
import { useAuth } from '@/hooks/useAuth'; 
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import RegistrationModal from '../modal/RegistrationModal'; 
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false); 
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { user, loading } = useAuth(); 

  useEffect(() => {
    const logoutParam = searchParams.get('logout');
    if (logoutParam === 'true') {
      const openTimer = setTimeout(() => {
        setShowLogoutToast(true);
        window.history.replaceState({}, '', '/');
      }, 50);

      const closeTimer = setTimeout(() => {
        setShowLogoutToast(false);
      }, 3400);

      return () => {
        clearTimeout(openTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen);

  const handleOpenRegisterModal = () => {
    setIsRegisterOpen(true);
    setIsMenuOpen(false); 
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    setIsUserDropdownOpen(false);
    router.push('/?logout=true');
    setTimeout(() => {
      router.refresh();
    }, 100);
  };

  return (
    <>
      <header className={styles.header}>
        <nav className={styles.navContainer}>
          {/* LADO IZQUIERDO: Logo */}
          <Link className={styles.logoSection} href="/">
            <Image 
              alt="USB Online Logo" 
              className={styles.logoImage} 
              height={40} 
              priority 
              src="/images/universidadsimonbolivarlogo.webp" 
              width={160}
            />
          </Link>

          {/* CENTRO: Menú de navegación principal */}
          <ul className={`${styles.menuLinks} ${isMenuOpen ? styles.menuOpen : ''}`}>
            <li>
              <Link className={styles.link} href="/#inicio" onClick={() => setIsMenuOpen(false)}>
                Inicio
              </Link>
            </li>
            <li>
              <Link className={styles.link} href="/#evento" onClick={() => setIsMenuOpen(false)}>
                Evento
              </Link>
            </li>
            <li>
              <Link className={styles.link} href="/#ponentes" onClick={() => setIsMenuOpen(false)}>
                Ponentes
              </Link>
            </li>
            
            {/* Agenda pública visible para todos */}
            <li>
              <Link className={styles.link} href="/#agenda" onClick={() => setIsMenuOpen(false)}>
                Agenda
              </Link>
            </li>

            {/* Streaming exclusivo para usuarios registrados */}
            {!loading && user && (
              <li>
                <Link className={styles.link} href="/#conferencias" onClick={() => setIsMenuOpen(false)}>
                  Conferencias
                </Link>
              </li>
            )}

            {/* Acceso exclusivo para usuarios invitados */}
            {!loading && !user && (
              <li>
                <Link className={styles.link} href="/#acceso" onClick={() => setIsMenuOpen(false)}>
                  Acceso
                </Link>
              </li>
            )}
            
            {/* Links exclusivos dentro de la hamburguesa móvil */}
            {!loading && (
              user ? (
                <>
                  <li className={styles.mobileOnly}>
                    <Link className={`${styles.link} ${styles.mobileMenuLinkWithIcon}`} href="/pase" onClick={() => setIsMenuOpen(false)}>
                      <Ticket size={18} />
                      Mi Pase Digital
                    </Link>
                  </li>
                  <li className={styles.mobileOnly}>
                    <button onClick={handleLogout} className={`${styles.link} ${styles.mobileMenuLinkWithIcon} ${styles.mobileLogoutBtn}`}>
                      <LogOut size={18} />
                      Cerrar Sesión
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className={styles.mobileOnly}>
                    <button onClick={handleOpenRegisterModal} className={styles.link} style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}>
                      Inscripciones
                    </button>
                  </li>
                  <li className={styles.mobileOnly}>
                    <Link className={styles.link} href="/login" onClick={() => setIsMenuOpen(false)}>
                      Iniciar Sesión
                    </Link>
                  </li>
                </>
              )
            )}
          </ul>

          {/* LADO DERECHO: Acciones estructuradas */}
          <div className={styles.actions}>
            <AnimatePresence mode="wait">
              {loading ? (
                <div className={styles.actionsSkeleton} aria-hidden="true" key="skeleton">
                  <div className={styles.skeletonCircle} />
                  <div className={styles.skeletonCircle} />
                </div>
              ) : user ? (
                <motion.div 
                  className={styles.userActionsGroup}
                  key="logged-in-actions"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link aria-label="Acceso rápido a mi pase" className={styles.btnPaseDirectoMobile} href="/pase">
                    <Ticket size={18} strokeWidth={2.2} />
                    <span className={styles.pulseDotMobile} />
                  </Link>

                  <div className={styles.userDropdownContainer} ref={dropdownRef}>
                    <button 
                      onClick={toggleUserDropdown} 
                      className={`${styles.userProfileTrigger} ${isUserDropdownOpen ? styles.triggerActive : ''}`}
                      aria-expanded={isUserDropdownOpen}
                      aria-label="Menú de usuario"
                    >
                      <UserCircle className={styles.avatarIcon} size={18} />
                      <span className={styles.userEmailText}>{user.email?.split('@')[0]}</span>
                      <ChevronDown size={14} className={`${styles.chevronIcon} ${isUserDropdownOpen ? styles.chevronRotate : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isUserDropdownOpen && (
                        <motion.div 
                          className={styles.dropdownMenu}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div className={styles.dropdownHeader}>
                            <p className={styles.dropdownLabel}>CUENTA</p>
                            <p className={styles.dropdownUserEmail}>{user.email}</p>
                          </div>
                          
                          <div className={styles.dropdownDivider} />
                          
                          <Link className={styles.dropdownItem} href="/pase" onClick={() => setIsUserDropdownOpen(false)}>
                            <div className={styles.dropdownItemLeft}>
                              <Ticket className={styles.itemIcon} size={16} />
                              <span>Mi Pase Digital</span>
                            </div>
                            <span className={styles.pulseDot} />
                          </Link>

                          <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logoutItem}`}>
                            <div className={styles.dropdownItemLeft}>
                              <LogOut className={styles.itemIcon} size={16} />
                              <span>Cerrar Sesión</span>
                            </div>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  className={styles.guestActionsGroup}
                  key="guest-actions"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link className={styles.btnLoginPill} href="/login">
                    <Key size={16} strokeWidth={2.2} />
                    <span className={styles.btnText}>Iniciar Sesión</span>
                  </Link>

                  <button onClick={handleOpenRegisterModal} className={styles.btnAdmisiones}>
                    <UserPlus className={styles.btnInscripcionIconMobile} size={16} strokeWidth={2.2} />
                    <span className={styles.btnText}>Inscripción</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hamburguesa independiente */}
            <button className={styles.hamburger} onClick={toggleMenu} aria-label="Menú principal">
              <div className={`${styles.bar} ${isMenuOpen ? styles.bar1 : ''}`}></div>
              <div className={`${styles.bar} ${isMenuOpen ? styles.bar2 : ''}`}></div>
              <div className={`${styles.bar} ${isMenuOpen ? styles.bar3 : ''}`}></div>
            </button>
          </div>
        </nav>
      </header>

      {/* Notificación Toast Animada */}
      <AnimatePresence>
        {showLogoutToast && (
          <motion.div 
            className={styles.toastNotification}
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 15, x: '-50%' }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <CheckCircle2 className={styles.toastIcon} size={16} />
            <span>Sesión cerrada correctamente</span>
          </motion.div>
        )}
      </AnimatePresence>

      <RegistrationModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)} 
      />
    </>
  );
};

export default Navbar;