import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 1. Cargar variables de entorno (.env.local)
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// 2. Inicializar cliente con la clave de administración
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

interface UsuarioExcel {
  nombre: string;
  correo: string;
  universidad: string;
  rol: string;
}

async function procesarEInyectar() {
  const rutaArchivo = path.join(process.cwd(), 'usuarios_congreso.csv');
  const usuarios: UsuarioExcel[] = [];

  if (!fs.existsSync(rutaArchivo)) {
    console.error(`❌ Error crítico: No se encontró el archivo CSV en: ${rutaArchivo}`);
    console.error("Asegúrate de que 'usuarios_congreso.csv' esté en la raíz del proyecto.");
    return;
  }

  // 3. Leer y parsear el archivo CSV
  fs.createReadStream(rutaArchivo)
    .pipe(csv())
    .on('data', (data) => {
      usuarios.push({
        nombre: data.nombre?.trim(),
        correo: data.correo?.trim().toLowerCase(),
        universidad: data.universidad?.trim(),
        rol: data.rol?.trim().toLowerCase(),
      });
    })
    .on('end', async () => {
      console.log(`🚀 Archivo CSV leído con éxito. Preparando invitaciones para ${usuarios.length} usuarios...`);
      
      for (const usuario of usuarios) {
        if (!usuario.correo) continue;

        // 4. Escudo protector de duplicados en la tabla 'profiles'
        const { data: usuarioExistente } = await supabaseAdmin
          .from('profiles')
          .select('email')
          .eq('email', usuario.correo)
          .maybeSingle();

        if (usuarioExistente) {
          console.log(`⚠️ El correo [${usuario.correo}] ya está registrado en perfiles. Saltando.`);
          continue; 
        }

        // 5. Invitar usuario forzando la redirección hacia /actualizar-password
        const { data: nuevoUsuario, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
          usuario.correo,
          {
            redirectTo: 'http://localhost:3000/actualizar-password',
            data: {
              nombre_completo: usuario.nombre,
              institucion: usuario.universidad,
              rol: usuario.rol
            }
          }
        );

        if (authError) {
          console.error(`❌ Error al invitar a [${usuario.correo}]:`, authError.message);
          continue;
        }

        if (nuevoUsuario.user) {
          const userId = nuevoUsuario.user.id;

          // 6. Sincronizar en la tabla 'profiles'
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
              id: userId,
              email: usuario.correo,
              nombre_completo: usuario.nombre,
              facultad: usuario.universidad,
              rol: usuario.rol,
              asistencia_dia_1: false,
              asistencia_dia_2: false,
              hora_salida: null,
              sala: null
            });

          if (profileError) {
            console.error(`⚠️ Invitación enviada pero falló al guardar en 'profiles' [${usuario.correo}]:`, profileError.message);
          } else {
            console.log(`=== ✅ INVITACIÓN ENVIADA Y REGISTRADO EN BD ===`);
            console.log(`Usuario: ${usuario.nombre} (${usuario.correo})`);
          }
        }
      }
      
      console.log('\n🏁 Carga masiva e invitaciones finalizadas con éxito.');
    });
}

procesarEInyectar();