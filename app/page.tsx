'use client'; //  Necesario para escuchar el estado de la sesión en tiempo real

import { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth'; // 👈 Asegúrate de apuntar a tu hook de sesión

import Navbar from '@/components/navbar/Navbar';
import Hero from '@/components/hero/Hero';
import Features from '@/components/features/Features'; 
import Speakers from '@/components/speakers/Speakers'; 
import Agenda from '@/components/agenda/Agenda';
import Streaming from '@/components/streaming/StreamingSection';
import HistoryTimeline from '@/components/timeline/HistoryTimeline';
import Access from '@/components/access/Access';
import Location from '@/components/location/Location';
import Footer from '@/components/footer/Footer';
import s from './HomePage.module.css'; 

// Skeleton optimizado solo para las zonas que realmente esperan datos asíncronos
function SectionSkeleton() {
  return (
    <div className={s.skeletonSectionWrapper} aria-hidden="true">
      <div className={s.skeletonLineLong} />
      <div className={s.skeletonLineShort} />
    </div>
  );
}

export default function Home() {
  const { user, loading } = useAuth(); //  Obtenemos el usuario de Supabase

  return (
    <>
      <Navbar />
      <main className={s.homeWrapper}>
        <div className={s.contentContainer}>
          {/* Componentes estáticos estructurales: Renderizan de inmediato sin bloquear la página */}
          <Hero />
          <Features /> 
          <HistoryTimeline /> 

          {/* Componentes asíncronos dinámicos: Cada uno maneja su propia carga de manera independiente */}
          <Suspense fallback={<SectionSkeleton />}>
            <Speakers />
          </Suspense>

          <Suspense fallback={<SectionSkeleton />}>
            <Agenda />
          </Suspense>

          <Streaming />

          {/* 🔀 Desvanecimiento y remoción inteligente de la sección Access */}
          <AnimatePresence mode="wait">
            {!loading && !user && (
              <motion.div
                key="access-section"
                initial={{ opacity: 1, height: 'auto' }}
                exit={{ 
                  opacity: 0, 
                  height: 0,
                  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } 
                }}
                style={{ originY: 0 }}
              >
                <Access />
              </motion.div>
            )}
          </AnimatePresence>

          <Location />
        </div>
      </main>
      <Footer />
    </>
  );
}