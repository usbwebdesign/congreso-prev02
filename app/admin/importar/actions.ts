'use server';

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// ==================== TIPOS DE DATOS ====================

export interface UsuarioCSV {
  nombre?: string;
  correo: string;
  universidad?: string;
  facultad?: string;
  sala?: string;
  rol?: string;
}

export interface ResultadoImportacion {
  exitosos: number;
  fallidos: number;
  errores: string[];
}

export interface StatsDashboard {
  totalUsuarios: number;
  ultimaCargaFecha: string | null;
  ultimaCargaTotal: number;
}

// ==================== CLIENTES DE SUPABASE ====================

/**
 * Cliente de Supabase para operaciones del usuario autenticado (Respeta RLS)
 */
async function getSupabaseUserClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Se ignora si se llama desde un Server Component puro
          }
        },
      },
    }
  );
}

/**
 * Cliente de Supabase con Service Role (Bypasses RLS)
 */
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!serviceRoleKey) {
    throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY en las variables de entorno.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

// ==================== HELPER DE NORMALIZACIÓN ====================

/**
 * Normaliza la facultad para cumplir con las restricciones de la base de datos
 */
function normalizarFacultad(rol: string, facultadOriginal?: string): string {
  const rolLimpio = rol.trim().toLowerCase();
  const facLimpia = facultadOriginal?.trim().toUpperCase() || '';

  if (['alumno', 'exalumno'].includes(rolLimpio)) {
    if (['FCH', 'FCEAN', 'FCYT'].includes(facLimpia)) {
      return facLimpia;
    }
    return 'FCH'; // Valor por defecto válido
  }

  return facultadOriginal?.trim() || 'Universidad Simón Bolívar';
}

// ==================== ACCIONES DE SERVIDOR ====================

/**
 * 1. Obtener métricas para el Dashboard
 */
export async function obtenerStatsAdminAction(): Promise<StatsDashboard> {
  const supabaseUserClient = await getSupabaseUserClient();

  const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();
  if (authError || !user) throw new Error('No autorizado');

  const { count: totalUsuarios } = await supabaseUserClient
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { data: ultimaCarga } = await supabaseUserClient
    .from('import_logs')
    .select('created_at, total_records')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    totalUsuarios: totalUsuarios || 0,
    ultimaCargaFecha: ultimaCarga?.created_at || null,
    ultimaCargaTotal: ultimaCarga?.total_records || 0,
  };
}

/**
 * 2. Crear un usuario manualmente desde el Modal Admin
 */
export async function crearUsuarioManualAction(payload: {
  nombre_completo: string;
  email: string;
  facultad: string;
  sala: string;
  rol: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const supabaseUserClient = await getSupabaseUserClient();

    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();
    if (authError || !user) throw new Error('No autorizado');

    const { data: perfil } = await supabaseUserClient
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single();

    if (perfil?.rol?.toLowerCase() !== 'admin') {
      return { success: false, message: 'Acceso denegado: Permisos de Administrador requeridos.' };
    }

    const supabaseAdmin = getSupabaseAdmin();
    const emailLimpio = payload.email.trim().toLowerCase();
    const redirectUrl = `${getBaseUrl()}/actualizar-password`;
    const facultadValida = normalizarFacultad(payload.rol, payload.facultad);

    const { data: usuarioExistente } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', emailLimpio)
      .maybeSingle();

    if (usuarioExistente) {
      return { success: false, message: `El correo [${emailLimpio}] ya se encuentra registrado.` };
    }

    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      emailLimpio,
      {
        redirectTo: redirectUrl,
        data: {
          nombre_completo: payload.nombre_completo,
          institucion: 'Universidad Simón Bolívar',
          facultad: facultadValida,
          rol: payload.rol,
        },
      }
    );

    if (inviteError) {
      return { success: false, message: inviteError.message };
    }

    if (inviteData.user) {
      const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
        id: inviteData.user.id,
        nombre_completo: payload.nombre_completo,
        email: emailLimpio,
        institucion: 'Universidad Simón Bolívar',
        facultad: facultadValida,
        sala: payload.sala,
        rol: payload.rol.toLowerCase(),
        asistencia_dia_1: false,
        asistencia_dia_2: false,
      });

      if (profileError) {
        return { success: false, message: profileError.message };
      }
    }

    revalidatePath('/admin/importar');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Error inesperado al crear usuario',
    };
  }
}

/**
 * 3. Acción de Importación Masiva desde CSV
 */
export async function importarUsuariosAction(
  usuarios: UsuarioCSV[],
  fileName: string
): Promise<ResultadoImportacion> {
  const supabaseUserClient = await getSupabaseUserClient();

  const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();
  if (authError || !user) throw new Error('No autorizado');

  const { data: perfil } = await supabaseUserClient
    .from('profiles')
    .select('rol')
    .eq('id', user.id)
    .single();

  if (perfil?.rol?.toLowerCase() !== 'admin') {
    throw new Error('Acceso denegado: Permisos de Administrador requeridos.');
  }

  const supabaseAdmin = getSupabaseAdmin();
  const redirectUrl = `${getBaseUrl()}/actualizar-password`;
  const resultado: ResultadoImportacion = { exitosos: 0, fallidos: 0, errores: [] };

  for (const usuario of usuarios) {
    const correoLimpio = usuario.correo?.trim().toLowerCase();
    const nombreLimpio = usuario.nombre?.trim() || '';
    const universidadLimpia = usuario.universidad?.trim() || 'Universidad Simón Bolívar';
    const rolLimpio = usuario.rol?.trim().toLowerCase() || 'alumno';
    
    const facultadValida = normalizarFacultad(rolLimpio, usuario.facultad);
    const salaLimpia = usuario.sala?.trim() || null;

    if (!correoLimpio) {
      resultado.fallidos++;
      resultado.errores.push(`Fila omitida: Correo electrónico vacío.`);
      continue;
    }

    try {
      const { data: usuarioExistente } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', correoLimpio)
        .maybeSingle();

      if (usuarioExistente) {
        resultado.fallidos++;
        resultado.errores.push(`El correo [${correoLimpio}] ya está registrado.`);
        continue;
      }

      const { data: nuevoUsuario, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        correoLimpio,
        {
          redirectTo: redirectUrl,
          data: {
            nombre_completo: nombreLimpio,
            institucion: universidadLimpia,
            facultad: facultadValida,
            rol: rolLimpio,
          },
        }
      );

      if (inviteError) {
        resultado.fallidos++;
        resultado.errores.push(`Error con [${correoLimpio}]: ${inviteError.message}`);
        continue;
      }

      if (nuevoUsuario.user) {
        const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
          id: nuevoUsuario.user.id,
          email: correoLimpio,
          nombre_completo: nombreLimpio,
          institucion: universidadLimpia,
          facultad: facultadValida,
          sala: salaLimpia,
          rol: rolLimpio,
          asistencia_dia_1: false,
          asistencia_dia_2: false,
        });

        if (profileError) {
          resultado.fallidos++;
          resultado.errores.push(`Error guardando perfil [${correoLimpio}]: ${profileError.message}`);
        } else {
          resultado.exitosos++;
        }
      }
    } catch (err) {
      resultado.fallidos++;
      resultado.errores.push(`Error en [${correoLimpio}]: ${err instanceof Error ? err.message : 'Error'}`);
    }
  }

  await supabaseAdmin.from('import_logs').insert({
    created_by: user.id,
    total_records: usuarios.length,
    successful_records: resultado.exitosos,
    failed_records: resultado.fallidos,
    file_name: fileName,
  });

  revalidatePath('/admin/importar');
  return resultado;
}