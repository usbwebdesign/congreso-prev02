'use client';

import React, { useState } from 'react';
import { X, UserPlus, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { crearUsuarioManualAction } from '../admin/importar/actions'; 
import s from './CreateUserModal.module.css';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Mapa de Salones según la Facultad seleccionada
const SALAS_MAP: Record<string, string> = {
  FCH: 'Concorde',
  FCEAN: 'Vendome',
  FCYT: 'Louvre',
  'Universidad Simón Bolívar': 'Lemont',
  Externo: 'Lemont',
};

const INITIAL_FORM = {
  email: '',
  nombre_completo: '',
  rol: 'alumno',
  institucion: 'Universidad Simón Bolívar',
  facultad: 'FCH',
};

export default function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState(INITIAL_FORM);

  if (!isOpen) return null;

  const esEstudiante = ['alumno', 'exalumno'].includes(formData.rol);

  // Opciones dinámicas de facultad según el rol
  const facultadesDisponibles = esEstudiante
    ? ['FCH', 'FCEAN', 'FCYT']
    : ['Universidad Simón Bolívar', 'Externo'];

  // Manejador centralizado de inputs con reajuste automático de facultad
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const nuevoState = { ...prev, [name]: value };

      if (name === 'rol') {
        const nuevoEsEstudiante = ['alumno', 'exalumno'].includes(value);
        if (nuevoEsEstudiante && !['FCH', 'FCEAN', 'FCYT'].includes(prev.facultad)) {
          nuevoState.facultad = 'FCH';
        } else if (!nuevoEsEstudiante && ['FCH', 'FCEAN', 'FCYT'].includes(prev.facultad)) {
          nuevoState.facultad = 'Universidad Simón Bolívar';
        }
      }

      return nuevoState;
    });
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    setFormData(INITIAL_FORM);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const salaCalculada = SALAS_MAP[formData.facultad] || 'Lemont';

    // Se envía el payload completo incluyendo la 'sala' calculada
    const res = await crearUsuarioManualAction({
      nombre_completo: formData.nombre_completo,
      email: formData.email,
      facultad: formData.facultad,
      sala: salaCalculada,
      rol: formData.rol,
    });

    setLoading(false);

    if (!res.success) {
      setError(res.message || 'Error al crear el perfil');
    } else {
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1200);
    }
  };

  const salaCalculada = SALAS_MAP[formData.facultad] || 'Lemont';

  return (
    <div className={s.overlay}>
      <div className={s.modal}>
        <div className={s.header}>
          <div className={s.titleGroup}>
            <UserPlus size={18} />
            <h2>Nuevo Registro Individual</h2>
          </div>
          <button onClick={handleClose} className={s.closeBtn}><X size={18} /></button>
        </div>

        {error && (
          <div className={s.errorAlert}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className={s.successAlert}>
            <CheckCircle size={20} />
            <span>¡Perfil registrado exitosamente!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={s.form}>
            {/* DATOS PERSONALES */}
            <div className={s.field}>
              <label>Correo Electrónico *</label>
              <input
                type="email"
                name="email"
                required
                placeholder="ejemplo@usb.ve"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className={s.field}>
              <label>Nombre Completo *</label>
              <input
                type="text"
                name="nombre_completo"
                required
                placeholder="Juan Pérez"
                value={formData.nombre_completo}
                onChange={handleChange}
              />
            </div>

            {/* ROL Y FACULTAD */}
            <div className={s.row}>
              <div className={s.field}>
                <label>Rol en el Evento</label>
                <select name="rol" value={formData.rol} onChange={handleChange}>
                  <option value="alumno">Alumno</option>
                  <option value="exalumno">Exalumno</option>
                  <option value="docente">Docente</option>
                  <option value="administrativo">Administrativo</option>
                  <option value="asistente">Asistente</option>
                  <option value="ponente">Ponente</option>
                  <option value="organizador">Organizador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className={s.field}>
                <label>Facultad / Afiliación *</label>
                <select name="facultad" value={formData.facultad} onChange={handleChange}>
                  {facultadesDisponibles.map((op) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* INSTITUCIÓN Y SALA CALCULADA */}
            <div className={s.row}>
              <div className={s.field}>
                <label>Institución</label>
                <input
                  type="text"
                  name="institucion"
                  value={formData.institucion}
                  onChange={handleChange}
                />
              </div>

              <div className={s.field}>
                <label>Sala Asignada (Auto)</label>
                <input
                  type="text"
                  value={salaCalculada}
                  readOnly
                  className={s.readOnlyInput}
                  title="El salón es asignado automáticamente según la facultad"
                />
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className={s.actions}>
              <button type="button" onClick={handleClose} className={s.cancelBtn}>Cancelar</button>
              <button type="submit" disabled={loading} className={s.saveBtn}>
                {loading ? <Loader2 size={16} className={s.spinner} /> : 'Guardar Registro'}
              </button>
            </div>
          </form>
        )}
      </div> 
    </div>
  );
}