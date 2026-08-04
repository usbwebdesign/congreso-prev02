import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function probarEnvio() {
  console.log('📧 Intentando enviar correo de prueba vía Supabase Auth...');
  
  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    'disenoweb@usb.edu.mx'
  );

  if (error) {
    console.error('❌ Falló el envío:', error);
  } else {
    console.log('✅ Supabase procesó la invitación con éxito:', data);
  }
}

probarEnvio();