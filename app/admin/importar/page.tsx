'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  ArrowRight, 
  ShieldCheck,
  RefreshCw,
  Users,
  Clock,
  Database,
  UserPlus
} from 'lucide-react';
import { 
  importarUsuariosAction, 
  obtenerStatsAdminAction, 
  UsuarioCSV, 
  ResultadoImportacion,
  StatsDashboard 
} from './actions';

// Componentes modulares administrativos
import LogoutButton from '@/app/components/LogoutButton';
import CreateUserModal from '@/app/components/CreateUserModal';
import CsvPreviewTable, { CsvRowData } from '@/app/components/CsvPreviewTable';

import s from './Importar.module.css';

export default function ImportarUsuariosPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<CsvRowData[]>([]);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null);
  
  // Estado para controlar la carga inicial de la página (Skeleton)
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Estado para controlar el modal de nuevo usuario manual
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado para las métricas del Bento Grid
  const [stats, setStats] = useState<StatsDashboard>({
    totalUsuarios: 0,
    ultimaCargaFecha: null,
    ultimaCargaTotal: 0,
  });

  // Función reutilizable para refrescar métricas
  const cargarStats = useCallback(async () => {
    try {
      const data = await obtenerStatsAdminAction();
      setStats(data);
    } catch {
      // Manejo silencioso
    }
  }, []);

  // Carga inicial de métricas al montar el componente
  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const data = await obtenerStatsAdminAction();
        if (isMounted) {
          setStats(data);
        }
      } catch {
        // Manejo silencioso
      } finally {
        if (isMounted) {
          setIsPageLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  // Procesamiento y parseo del archivo CSV
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setParsingError('Selecciona un archivo en formato .csv');
      return;
    }

    setFile(selectedFile);
    setParsingError(null);
    setResultado(null);

    Papa.parse<Record<string, string>>(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const mappedData: CsvRowData[] = results.data.map((row, index) => {
          const keys = Object.keys(row);
          const getVal = (name: string) => {
            const key = keys.find((k) => k.toLowerCase().trim() === name);
            return key ? row[key] : '';
          };

          return {
            id: `csv-row-${index}-${Date.now()}`,
            nombre_completo: getVal('nombre') || getVal('nombre_completo') || getVal('full_name') || '',
            email: getVal('correo') || getVal('email') || getVal('correo_electronico') || '',
            institucion: getVal('universidad') || getVal('institucion') || 'Universidad Simón Bolívar',
            facultad: getVal('facultad') || '',
            sala: getVal('sala') || '',
            rol: getVal('rol') || getVal('role') || 'alumno',
          };
        });

        if (mappedData.length === 0) {
          setParsingError('El archivo CSV está vacío.');
        } else {
          setParsedData(mappedData);
        }
      },
      error: (err) => {
        setParsingError(`Error al leer archivo: ${err.message}`);
      },
    });
  };

  // Handlers para la edición interactiva del CSV previsualizado
  const handleUpdateRow = (id: string, updatedRow: CsvRowData) => {
    setParsedData((prev) => prev.map((row) => (row.id === id ? updatedRow : row)));
  };

  const handleDeleteRow = (id: string) => {
    setParsedData((prev) => prev.filter((row) => row.id !== id));
  };

  const handleRemoveFile = () => {
    setFile(null);
    setParsedData([]);
    setParsingError(null);
    setResultado(null);
  };

  // Envío masivo de usuarios a la Server Action
  const handleSubmit = async () => {
    if (parsedData.length === 0 || !file) return;

    setIsSubmitting(true);
    setParsingError(null);

    // Mapeo completo de CsvRowData[] al tipo UsuarioCSV[] esperado por la Server Action
    const payload: UsuarioCSV[] = parsedData.map((item) => ({
      nombre: item.nombre_completo.trim(),
      correo: item.email.trim(),
      universidad: item.institucion?.trim() || 'Universidad Simón Bolívar',
      facultad: item.facultad?.trim(),
      sala: item.sala?.trim(),
      rol: item.rol.trim(),
    }));

    try {
      const res = await importarUsuariosAction(payload, file.name);
      setResultado(res);
      await cargarStats();
    } catch (err) {
      setParsingError(err instanceof Error ? err.message : 'Error en la importación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formateador de fecha para las tarjetas
  const formatearFecha = (fechaISO: string | null) => {
    if (!fechaISO) return 'Sin cargas previas';
    const d = new Date(fechaISO);
    return new Intl.DateTimeFormat('es-VE', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  return (
    <div className={s.container}>
      {/* Luces de fondo y textura */}
      <div className={s.grainTexture} aria-hidden="true" />
      <div className={s.ambientLightOne} aria-hidden="true" />
      <div className={s.ambientLightTwo} aria-hidden="true" />

      {/* ==================== ESTADO 1: SKELETON LOADER ==================== */}
      {isPageLoading ? (
        <div className={s.contentWrapper}>
          {/* Skeleton Navbar */}
          <div className={s.skeletonNavbar}>
            <div className={s.skeletonNavLeft}>
              <div className={`${s.skeletonBase} ${s.skBadge}`} />
              <div className={`${s.skeletonBase} ${s.skWelcome}`} />
            </div>
            <div className={s.skeletonNavRight}>
              <div className={`${s.skeletonBase} ${s.skButton}`} />
              <div className={`${s.skeletonBase} ${s.skLogout}`} />
            </div>
          </div>

          {/* Skeleton Bento Grid */}
          <div className={s.bentoGrid}>
            <div className={s.skeletonCard}>
              <div className={`${s.skeletonBase} ${s.skCardHeader}`} />
              <div className={`${s.skeletonBase} ${s.skCardValue}`} />
              <div className={`${s.skeletonBase} ${s.skCardSubtext}`} />
            </div>
            <div className={s.skeletonCard}>
              <div className={`${s.skeletonBase} ${s.skCardHeader}`} />
              <div className={`${s.skeletonBase} ${s.skCardValue}`} />
              <div className={`${s.skeletonBase} ${s.skCardSubtext}`} />
            </div>
            <div className={s.skeletonCard}>
              <div className={`${s.skeletonBase} ${s.skCardHeader}`} />
              <div className={`${s.skeletonBase} ${s.skCardValue}`} />
              <div className={`${s.skeletonBase} ${s.skCardSubtext}`} />
            </div>
          </div>

          {/* Skeleton Dropzone */}
          <div className={s.skeletonDropzone}>
            <div className={`${s.skeletonBase} ${s.skIconCircle}`} />
            <div className={`${s.skeletonBase} ${s.skDropTitle}`} />
            <div className={`${s.skeletonBase} ${s.skDropSub}`} />
          </div>
        </div>
      ) : (
        /* ==================== ESTADO 2: CONTENIDO PRINCIPAL ==================== */
        <div className={s.contentWrapper}>
          
          {/* Mini Navbar Superior */}
          <header className={s.navbar}>
            <div className={s.navLeft}>
              <div className={s.badge}>
                <ShieldCheck size={14} /> Panel USB
              </div>
              <div className={s.navDivider} aria-hidden="true" />
              <span className={s.welcomeText}>
                Bienvenido, <strong className={s.adminName}>Admin</strong>
              </span>
            </div>

            <div className={s.navRight}>
              <button 
                onClick={() => setIsModalOpen(true)} 
                className={s.createUserBtn}
                title="Crear un usuario manualmente"
              >
                <UserPlus size={15} />
                <span>Nuevo Registro</span>
              </button>
              <div className={s.navDivider} aria-hidden="true" />
              <LogoutButton />
            </div>
          </header>

          {/* Bento Grid de Indicadores */}
          <section className={s.bentoGrid}>
            <div className={s.bentoCard}>
              <div className={s.bentoHeader}>
                <span className={s.bentoLabel}>Usuarios Registrados</span>
                <Users size={16} className={s.bentoIcon} />
              </div>
              <div className={s.bentoValue}>{stats.totalUsuarios}</div>
              <span className={s.bentoSubtext}>Perfiles activos en la BD</span>
            </div>

            <div className={s.bentoCard}>
              <div className={s.bentoHeader}>
                <span className={s.bentoLabel}>Última Importación</span>
                <Clock size={16} className={s.bentoIcon} />
              </div>
              <div className={s.bentoValueDate}>
                {formatearFecha(stats.ultimaCargaFecha)}
              </div>
              <span className={s.bentoSubtext}>
                {stats.ultimaCargaTotal > 0 
                  ? `+${stats.ultimaCargaTotal} invitaciones enviadas` 
                  : 'Sin actividad reciente'}
              </span>
            </div>

            <div className={s.bentoCard}>
              <div className={s.bentoHeader}>
                <span className={s.bentoLabel}>Estado de Base de Datos</span>
                <Database size={16} className={s.bentoIcon} />
              </div>
              <div className={s.bentoStatus}>
                <span className={s.statusDot} />
                Sincronizado
              </div>
              <span className={s.bentoSubtext}>Supabase Auth / RLS Activo</span>
            </div>
          </section>

          {/* Zona 1: Dropzone para Subir Archivos CSV */}
          {!file && (
            <div className={s.dropzone}>
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange} 
                className={s.fileInput} 
                id="csvInput"
              />
              <label htmlFor="csvInput" className={s.dropzoneLabel}>
                <div className={s.uploadIconWrapper}>
                  <UploadCloud size={28} />
                </div>
                <span className={s.dropzoneTitle}>Subir archivo .CSV</span>
                <span className={s.dropzoneHint}>
                  Columnas sugeridas: <code>nombre</code>, <code>correo</code>, <code>facultad</code>, <code>rol</code>, <code>sala</code>
                </span>
              </label>
            </div>
          )}

          {/* Alertas de Error */}
          {parsingError && (
            <div className={s.errorAlert}>
              <AlertCircle size={18} />
              <span>{parsingError}</span>
            </div>
          )}

          {/* Zona 2: Tabla Editable de Previsualización */}
          {file && parsedData.length > 0 && !resultado && (
            <div className={s.previewCard}>
              <div className={s.fileBar}>
                <div className={s.fileInfo}>
                  <FileSpreadsheet size={20} className={s.csvIcon} />
                  <div>
                    <p className={s.fileName}>{file.name}</p>
                    <p className={s.fileDetails}>{parsedData.length} registros cargados (Editables en la tabla)</p>
                  </div>
                </div>
                <button 
                  onClick={handleRemoveFile} 
                  className={s.removeBtn} 
                  disabled={isSubmitting}
                  title="Descartar archivo"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Componente Tabla Editable */}
              <CsvPreviewTable 
                data={parsedData} 
                onUpdateRow={handleUpdateRow} 
                onDeleteRow={handleDeleteRow} 
              />

              <div className={s.actionFooter}>
                <button 
                  onClick={handleSubmit} 
                  className={s.submitBtn} 
                  disabled={isSubmitting || parsedData.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={18} className={s.spinner} />
                      Importando...
                    </>
                  ) : (
                    <>
                      Confirmar e Importar {parsedData.length} Usuarios
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Zona 3: Reporte de Resultados */}
          {resultado && (
            <div className={s.resultCard}>
              <div className={s.resultHeader}>
                <CheckCircle2 size={28} className={s.successIcon} />
                <h2>Carga Completada</h2>
              </div>

              <div className={s.statsGrid}>
                <div className={s.statBox}>
                  <span className={s.statNumber}>{resultado.exitosos}</span>
                  <span className={s.statLabel}>Invitados</span>
                </div>
                <div className={s.statBox}>
                  <span className={`${s.statNumber} ${resultado.fallidos > 0 ? s.hasErrors : ''}`}>
                    {resultado.fallidos}
                  </span>
                  <span className={s.statLabel}>Omitidos</span>
                </div>
              </div>

              {resultado.errores.length > 0 && (
                <div className={s.errorLogs}>
                  <ul>
                    {resultado.errores.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button onClick={handleRemoveFile} className={s.resetBtn}>
                Importar otro archivo
              </button>
            </div>
          )}

        </div>
      )}

      {/* Modal para Registro Manual Individual */}
      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          cargarStats();
        }}
      />
    </div>
  );
}