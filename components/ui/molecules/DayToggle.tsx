'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import s from './DayToggle.module.css';

interface DayToggleProps {
  diaActivo: 1 | 2;
  onChangeDay: (dia: 1 | 2) => void;
}

export const DayToggle = ({ diaActivo, onChangeDay }: DayToggleProps) => {
  return (
    <div className={s.container}>
      <button
        type="button"
        className={`${s.btn} ${diaActivo === 1 ? s.active : ''}`}
        onClick={() => onChangeDay(1)}
      >
        {diaActivo === 1 && <CheckCircle2 size={14} />} Día 1
      </button>
      <button
        type="button"
        className={`${s.btn} ${diaActivo === 2 ? s.active : ''}`}
        onClick={() => onChangeDay(2)}
      >
        {diaActivo === 2 && <CheckCircle2 size={14} />} Día 2
      </button>
    </div>
  );
};