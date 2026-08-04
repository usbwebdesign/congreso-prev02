'use client';

import React, { useState, useMemo } from 'react';
import { Search, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  UsuarioPerfil,
  toggleCheckInAction,
  registrarSalidaAnticipadaAction,
} from '@/app/admin/importar/actions';
import { Badge } from '@/components/ui/atoms/Badge';
import { DayToggle } from '@/components/ui/molecules/DayToggle';
import s from './AsistenciaTable.module.css';

interface Props {
  usuariosIniciales: UsuarioPerfil[];
}

const ITEMS_PER_PAGE = 10;

export const AsistenciaTable = ({ usuariosIniciales }: Props) => {
  // Estado local
  const [usuarios, setUsuarios] = useState<UsuarioPerfil[]>(usuariosIniciales);
  const [prevUsuariosIniciales, setPrevUsuariosIniciales] = useState<UsuarioPerfil[]>(usuariosIniciales);

  const [diaActivo, setDiaActivo] = useState<1 | 2>(1);
  const [busqueda, setBusqueda] = useState('');
  const [filtroSala, setFiltroSala] = useState('TODAS');
  const [paginaActual, setPaginaActual] = useState(1);

  // Sincronización limpia cuando cambian los props (Carga masiva)
  if (usuariosIniciales !== prevUsuariosIniciales) {
    setPrevUsuariosIniciales(usuariosIniciales);
    setUsuarios(usuariosIniciales);
  }

  // Modal Salida
  const [modalSalida, setModalSalida] = useState<{ open: boolean; userId: string; hora: string }>({
    open: false,
    userId: '',
    hora: '',
  });

  const handleBusquedaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
    setPaginaActual(1);
  };

  const handleFiltroSalaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFiltroSala(e.target.value);
    setPaginaActual(1);
  };

  // Filtrado
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const coincideBusqueda =
        u.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(busqueda.toLowerCase()));

      const coincideSala = filtroSala === 'TODAS' || u.sala === filtroSala;

      return coincideBusqueda && coincideSala;
    });
  }, [usuarios, busqueda, filtroSala]);

  // Paginación
  const totalPaginas = Math.ceil(usuariosFiltrados.length / ITEMS_PER_PAGE) || 1;

  const usuariosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * ITEMS_PER_PAGE;
    return usuariosFiltrados.slice(inicio, inicio + ITEMS_PER_PAGE);
  }, [usuariosFiltrados, paginaActual]);

  // Actions
  const handleCheckIn = async (userId: string, nuevoEstado: boolean) => {
    setUsuarios((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return diaActivo === 1
            ? { ...u, asistencia_dia_1: nuevoEstado, hora_salida_dia_1: nuevoEstado ? u.hora_salida_dia_1 : null }
            : { ...u, asistencia_dia_2: nuevoEstado, hora_salida_dia_2: nuevoEstado ? u.hora_salida_dia_2 : null };
        }
        return u;
      })
    );

    await toggleCheckInAction(userId, diaActivo, nuevoEstado);
  };

  const handleConfirmarSalida = async () => {
    if (!modalSalida.hora || !modalSalida.userId) return;

    const { userId, hora } = modalSalida;

    setUsuarios((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return diaActivo === 1
            ? { ...u, hora_salida_dia_1: hora }
            : { ...u, hora_salida_dia_2: hora };
        }
        return u;
      })
    );

    setModalSalida({ open: false, userId: '', hora: '' });
    await registrarSalidaAnticipadaAction(userId, diaActivo, hora);
  };

  return (
    <div className={s.wrapper}>
      <div className={s.header}>
        <h2>Control de Asistencia</h2>
        <DayToggle diaActivo={diaActivo} onChangeDay={setDiaActivo} />
      </div>

      <div className={s.filterBar}>
        <div className={s.searchBox}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={handleBusquedaChange}
          />
        </div>

        <select value={filtroSala} onChange={handleFiltroSalaChange}>
          <option value="TODAS">Todas las Salas</option>
          <option value="Concorde">Concorde (FCH)</option>
          <option value="Vendome">Vendome (FCEAN)</option>
          <option value="Louvre">Louvre (FCYT)</option>
          <option value="Lemont">Lemont (General/USB)</option>
        </select>
      </div>

      <table className={s.table}>
        <thead>
          <tr>
            <th>USUARIO</th>
            <th>SALA</th>
            <th>ESTADO</th>
            <th style={{ textAlign: 'right' }}>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {usuariosPaginados.length > 0 ? (
            usuariosPaginados.map((u) => {
              const asistio = diaActivo === 1 ? u.asistencia_dia_1 : u.asistencia_dia_2;
              const horaSalida = diaActivo === 1 ? u.hora_salida_dia_1 : u.hora_salida_dia_2;
              const status = asistio ? (horaSalida ? 'salida' : 'presente') : 'pendiente';

              return (
                <tr key={u.id}>
                  <td>
                    <strong style={{ color: '#fff' }}>{u.nombre_completo}</strong>
                    <br />
                    <small style={{ color: '#71717a' }}>{u.email}</small>
                  </td>
                  <td>{u.sala || 'Sin Asignar'}</td>
                  <td><Badge status={status} horaSalida={horaSalida} /></td>
                  <td style={{ textAlign: 'right' }}>
                    {asistio ? (
                      <div className={s.actionGroup}>
                        {!horaSalida && (
                          <button
                            onClick={() =>
                              setModalSalida({
                                open: true,
                                userId: u.id,
                                hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                              })
                            }
                            className={s.salidaBtn}
                          >
                            <LogOut size={13} /> Salió Antes
                          </button>
                        )}
                        <button onClick={() => handleCheckIn(u.id, false)} className={s.undoBtn}>
                          Deshacer
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleCheckIn(u.id, true)} className={s.checkInBtn}>
                        Check-In
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#71717a' }}>
                No se encontraron usuarios coincidentes.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className={s.paginationWrapper}>
        <span className={s.pageInfo}>
          Mostrando {usuariosPaginados.length} de {usuariosFiltrados.length} registros — Página {paginaActual} de {totalPaginas}
        </span>
        <div className={s.paginationBtns}>
          <button
            onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
            disabled={paginaActual === 1}
            className={s.pageBtn}
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          <button
            onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
            disabled={paginaActual >= totalPaginas}
            className={s.pageBtn}
          >
            Siguiente <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {modalSalida.open && (
        <div className={s.modalOverlay}>
          <div className={s.modalBox}>
            <h3>Registrar Salida Anticipada</h3>
            <p>Hora de retiro (Día {diaActivo}):</p>
            <input
              type="time"
              value={modalSalida.hora}
              onChange={(e) => setModalSalida({ ...modalSalida, hora: e.target.value })}
            />
            <div className={s.modalActions}>
              <button onClick={() => setModalSalida({ open: false, userId: '', hora: '' })}>
                Cancelar
              </button>
              <button className={s.confirmBtn} onClick={handleConfirmarSalida}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};