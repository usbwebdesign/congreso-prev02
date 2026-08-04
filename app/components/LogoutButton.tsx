'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { LogOut, Loader2 } from 'lucide-react';
import s from './LogoutButton.module.css';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleLogout} 
      disabled={loading} 
      className={s.logoutBtn}
      title="Cerrar sesión"
    >
      {loading ? <Loader2 size={16} className={s.spinner} /> : <LogOut size={16} />}
      <span>Cerrar Sesión</span>
    </button>
  );
}