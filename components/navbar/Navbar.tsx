"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserCircle, Key, UserPlus, CheckCircle2, Ticket, LogOut, ChevronDown, Sparkles } from 'lucide-react'; 
import { useAuth } from '@/hooks/useAuth'; 
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import RegistrationModal from '../modal/RegistrationModal'; 
import styles from './Navbar.module.css';

interface ToastState {
  show: boolean;
  message: string;
  type: 'logout' | 'welcome';
}

// Componente interno con la lógica que utiliza useSearchParams
const NavbarContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false); 
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'logout' });
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);
  const { user, loading } = useAuth(); 
  const prevUserRef = useRef<typeof user>(null);

  // Consulta el primer nombre del usuario desde la tabla 'profiles'
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setFirstName(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('nombre_completo')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data?.nombre_completo) {
          const primerNombre = data.nombre_completo.trim().split(' ')[0];
          setFirstName(primerNombre);
        } else if (user.user_metadata?.full_name) {
          const primerNombre = user.user_metadata.full_name.trim().split(' ')[0];
          setFirstName(primerNombre);
        } else {
          setFirstName(user.email?.split('@')[0] || 'Usuario');
        }
      } catch (error) {
        console.error("Error obteniendo nombre en el Navbar:", error);
        setFirstName(user.email?.split('@')[0] || 'Usuario');
      }
    };

    fetchUserProfile();
  }, [user]);

  // Manejo de Toast para Cierre de Sesión y Bienvenida
  useEffect(() => {
    const logoutParam = searchParams.get('logout');
    const loginParam = searchParams.get('login');

    if (logoutParam === 'true') {
      const openTimer = setTimeout(() => {
        setToast({ show: true, message: 'Sesión cerrada correctamente', type: 'logout' });
        window.history.replaceState({}, '', '/');
      }, 50);

      const closeTimer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 3400);

      return () => {
        clearTimeout(openTimer);
        clearTimeout(closeTimer);
      };
    }

    if (loginParam === 'true' && user) {
      const nombreMostrar = firstName || user.email?.split('@')[0] || '';
      const openTimer = setTimeout(() => {
        setToast({ 
          show: true, 
          message: `¡Bienvenido${nombreMostrar ? `, ${nombreMostrar}` : ''}!`, 
          type: 'welcome' 
        });
        window.history.replaceState({}, '', window.location.pathname);
      }, 100);

      const closeTimer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 3800);

      return () => {
        clearTimeout(openTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [searchParams, user, firstName]);

  // Detecta cuando el usuario acaba de iniciar sesión directamente en la aplicación
  useEffect(() => {
    if (!prevUserRef.current && user && !loading && !searchParams.get('login')) {
      const nombreMostrar = firstName || user.email?.split('@')[0] || '';
      setToast({
        show: true,
        message: `¡Bienvenido${nombreMostrar ? `, ${nombreMostrar}` : ''}!`,
        type: 'welcome'
      });

      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 3800);

      return () => clearTimeout(timer);
    }
    prevUserRef.current = user;
  }, [user, loading, firstName, searchParams]);

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
              height={36} 
              width={144}
              priority 
              src="/images/universidadsimonbolivarlogo.webp" 
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
            
            <li>
              <Link className={styles.link} href="/#agenda" onClick={() => setIsMenuOpen(false)}>
                Agenda
              </Link>
            </li>

            {!loading && user && (
              <li>
                <Link className={styles.link} href="/#conferencias" onClick={() => setIsMenuOpen(false)}>
                  Conferencias
                </Link>
              </li>
            )}

            {!loading && !user && (
              <li>
                <Link className={styles.link} href="/#acceso" onClick={() => setIsMenuOpen(false)}>
                  Acceso
                </Link>
              </li>
            )}
            
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

          {/* LADO DERECHO: Acciones */}
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
                      <span className={styles.userEmailText}>{firstName || user.email?.split('@')[0]}</span>
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
                  <Link className={styles.btnLoginPill} href="/login" aria-label="Iniciar Sesión">
                    <Key size={19} strokeWidth={2} />
                    <span className={styles.btnText}>Iniciar Sesión</span>
                  </Link>

                  <button onClick={handleOpenRegisterModal} className={styles.btnAdmisiones} aria-label="Inscripción">
                    <UserPlus className={styles.btnInscripcionIconMobile} size={19} strokeWidth={2} />
                    <span className={styles.btnText}>Inscripción</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <button className={styles.hamburger} onClick={toggleMenu} aria-label="Menú principal">
              <div className={`${styles.bar} ${isMenuOpen ? styles.bar1 : ''}`}></div>
              <div className={`${styles.bar} ${isMenuOpen ? styles.bar2 : ''}`}></div>
              <div className={`${styles.bar} ${isMenuOpen ? styles.bar3 : ''}`}></div>
            </button>
          </div>
        </nav>
      </header>

      {/* Notificación Toast Animada (Bienvenida / Cierre de Sesión) */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            className={`${styles.toastNotification} ${toast.type === 'welcome' ? styles.toastWelcome : ''}`}
            initial={{ opacity: 0, y: 30, x: '-50%', scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
            exit={{ opacity: 0, y: 20, x: '-50%', scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
          >
            {toast.type === 'welcome' ? (
              <Sparkles className={styles.toastIconWelcome} size={18} />
            ) : (
              <CheckCircle2 className={styles.toastIcon} size={18} />
            )}
            <span>{toast.message}</span>
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

export default function Navbar() {
  return (
    <Suspense fallback={null}>
      <NavbarContent />
    </Suspense>
  );
}