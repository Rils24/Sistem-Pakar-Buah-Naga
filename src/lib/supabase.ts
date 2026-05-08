import { createClient } from '@supabase/supabase-js';

// Ganti dengan URL dan Anon Key dari project Supabase Anda
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
