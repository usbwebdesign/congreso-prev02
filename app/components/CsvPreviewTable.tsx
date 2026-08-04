'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import s from './CsvPreviewTable.module.css';

export interface CsvRowData {
  id: string;
  nombre_completo: string;
  email: string;
  rol: string;
  facultad?: string;
  institucion?: string;
  sala?: string;
}

interface CsvPreviewTableProps {
  data: CsvRowData[];
  onUpdateRow: (id: string, updatedRow: CsvRowData) => void;
  onDeleteRow: (id: string) => void;
}

export default function CsvPreviewTable({ data, onUpdateRow, onDeleteRow }: CsvPreviewTableProps) {
  return (
    <div className={s.tableContainer}>
      <table className={s.table}>
        <thead>
          <tr>
            <th>Nombre Completo</th>
            <th>Correo Electrónico</th>
            <th>Rol</th>
            <th>Facultad</th>
            <th>Sala</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td>
                <input
                  type="text"
                  value={row.nombre_completo}
                  onChange={(e) =>
                    onUpdateRow(row.id, { ...row, nombre_completo: e.target.value })
                  }
                  className={s.inlineInput}
                />
              </td>
              <td>
                <input
                  type="email"
                  value={row.email}
                  onChange={(e) =>
                    onUpdateRow(row.id, { ...row, email: e.target.value })
                  }
                  className={s.inlineInput}
                />
              </td>
              <td>
                <select
                  value={row.rol.toLowerCase()}
                  onChange={(e) =>
                    onUpdateRow(row.id, { ...row, rol: e.target.value })
                  }
                  className={s.inlineSelect}
                >
                  <option value="alumno">Alumno</option>
                  <option value="docente">Docente</option>
                  <option value="administrativo">Administrativo</option>
                  <option value="exalumno">Exalumno</option>
                  <option value="asistente">Asistente</option>
                  <option value="ponente">Ponente</option>
                  <option value="organizador">Organizador</option>
                  <option value="admin">Administrador</option>
                </select>
              </td>
              <td>
                <input
                  type="text"
                  value={row.facultad || ''}
                  placeholder="Facultad..."
                  onChange={(e) =>
                    onUpdateRow(row.id, { ...row, facultad: e.target.value })
                  }
                  className={s.inlineInput}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={row.sala || ''}
                  placeholder="Sala..."
                  onChange={(e) =>
                    onUpdateRow(row.id, { ...row, sala: e.target.value })
                  }
                  className={s.inlineInput}
                />
              </td>
              <td className={s.actionsCol}>
                <button
                  onClick={() => onDeleteRow(row.id)}
                  className={s.deleteBtn}
                  title="Eliminar fila"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}