import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  // 1. Instanciación inicial de la respuesta
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Cliente SSR de Supabase con gestión de cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          
          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3. Refresco del token de autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // ==================== REGLAS DE PROTECCIÓN DE RUTAS ====================

  // Regla A: Protección del Panel de Administración
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!user) {
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  // Regla B: Redirección si ya hay sesión activa e intenta ir a /admin/login
  if (pathname === '/admin/login' && user) {
    url.pathname = '/admin/importar';
    return NextResponse.redirect(url);
  }

  // Regla C: Dejar pasar a /pase para que la vista del cliente resuelva la sesión sin rebotes.
  // Si no hay usuario, la página /pase se encargará de mostrar el Skeleton o redirigir limpiamente.

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};