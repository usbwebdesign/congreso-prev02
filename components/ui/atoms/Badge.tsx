import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import s from './Badge.module.css';

interface BadgeProps {
  status: 'presente' | 'pendiente' | 'salida';
  horaSalida?: string | null;
}

export const Badge = ({ status, horaSalida }: BadgeProps) => {
  if (status === 'presente') {
    return (
      <span className={`${s.badge} ${s.presente}`}>
        <CheckCircle2 size={12} /> Presente
      </span>
    );
  }

  if (status === 'salida') {
    return (
      <span className={`${s.badge} ${s.salida}`}>
        <Clock size={12} /> Salió ({horaSalida})
      </span>
    );
  }

  return (
    <span className={`${s.badge} ${s.pendiente}`}>
      <Clock size={12} /> Pendiente
    </span>
  );
};