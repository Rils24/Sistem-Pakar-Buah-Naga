import { createClient } from '@supabase/supabase-js';

// Ganti dengan URL dan Anon Key dari project Supabase Anda
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// ============================================================
// DYNAMIC USER HEADER UNTUK RLS
// Supabase membaca header ini di PostgreSQL via:
//   current_setting('request.header.x-user-id', true)
// Digunakan oleh RLS policy untuk menentukan hak akses
// ============================================================
let _currentUserId = '';

/**
 * Set user ID yang dikirim ke Supabase di setiap request.
 * Dipanggil saat login/logout oleh useAuth.
 */
export const setSupabaseUserId = (userId: string) => {
  _currentUserId = userId;
};

/**
 * Hapus user ID (saat logout)
 */
export const clearSupabaseUserId = () => {
  _currentUserId = '';
};

// Buat Supabase client dengan custom fetch yang inject x-user-id header
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (url: RequestInfo | URL, options: RequestInit = {}) => {
      const headers = new Headers(options.headers);
      // Selalu kirim x-user-id jika ada user yang login
      if (_currentUserId) {
        headers.set('x-user-id', _currentUserId);
      }
      return fetch(url, { ...options, headers });
    },
  },
});

// Helper function untuk check koneksi
export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('penyakit').select('count', { count: 'exact' });
    if (error) throw error;
    return { success: true, message: 'Terhubung ke Supabase' };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
};
