import React from 'react';
import s from './Login.module.css';

export default function LoginSkeleton() {
  return (
    <div className={s.loginContentWrapper} aria-hidden="true">
      {/* Esqueleto del botón volver */}
      <div className={`${s.skeletonBase} ${s.skeletonBackBtn}`} />

      <div className={s.brandHeader}>
        {/* Esqueleto del contenedor del Logo */}
        <div className={s.brandLogoWrapper}>
          <div className={`${s.skeletonBase} ${s.skeletonLogo}`} />
        </div>
        {/* Esqueleto del Título */}
        <div className={`${s.skeletonBase} ${s.skeletonTitle}`} />
        {/* Esqueleto del Subtítulo */}
        <div className={`${s.skeletonBase} ${s.skeletonSubtitleLine1}`} />
        <div className={`${s.skeletonBase} ${s.skeletonSubtitleLine2}`} />
      </div>

      {/* Esqueleto de la estructura del Formulario */}
      <div className={s.form}>
        <div className={`${s.skeletonBase} ${s.skeletonInput}`} />
        <div className={`${s.skeletonBase} ${s.skeletonInput}`} />
        <div className={`${s.skeletonBase} ${s.skeletonButton}`} />
      </div>
    </div>
  );
}