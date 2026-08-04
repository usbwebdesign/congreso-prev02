'use client';
import { useState, useEffect } from 'react';
import styles from './Countdown.module.css';

// Estructura estricta para el estado
interface TimeLeft {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
}

export default function Countdown() {
  // Fecha objetivo: 20 de Octubre de 2026
  const TARGET_DATE = '2026-10-20T00:00:00';

  const calculateTimeLeft = (): TimeLeft => {
    const difference = +new Date(TARGET_DATE) - +new Date();
    // Corregido "minutes" por "minutos" para cumplir con la interfaz
    let timeLeft: TimeLeft = { dias: 0, horas: 0, minutos: 0, segundos: 0 };

    if (difference > 0) {
      timeLeft = {
        dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
        horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutos: Math.floor((difference / 1000 / 60) % 60),
        segundos: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.countdownContainer}>
      <div className={styles.unitBox}>
        <span className={styles.number}>{timeLeft.dias.toString().padStart(2, '0')}</span>
        <span className={styles.label}>Días</span>
      </div>
      
      <div className={styles.unitBox}>
        <span className={styles.number}>{timeLeft.horas.toString().padStart(2, '0')}</span>
        <span className={styles.label}>Horas</span>
      </div>

      <div className={styles.unitBox}>
        <span className={styles.number}>{timeLeft.minutos.toString().padStart(2, '0')}</span>
        <span className={styles.label}>Minutos</span>
      </div>

      <div className={styles.unitBox}>
        <span className={styles.number}>{timeLeft.segundos.toString().padStart(2, '0')}</span>
        <span className={styles.label}>Segundos</span>
      </div>
    </div>
  );
}