// ============================================================
// SUPABASE SERVICE LAYER
// Semua operasi CRUD ke database Supabase
//
// READ  = langsung query tabel (SELECT terbuka)
// WRITE = admin tables lewat RPC function (verifikasi role di server)
//         user/hasil_diagnosa tetap langsung (policy terbuka)
// ============================================================

import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import type { Penyakit, Gejala, Rule, User } from '@/types';

// Helper: ambil current user ID dari session (untuk RPC admin)
const getCurrentUserId = (): string => {
  const session = getSession();
  return session?.userId || '';
};

// Helper: coba RPC dulu (aman), kalau belum di-migrate fallback ke direct access
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adminWrite = async <T = any>(
  rpcName: string,
  rpcParams: Record<string, unknown>,
  fallback: () => Promise<T>
): Promise<T> => {
  try {
    const { data, error } = await supabase.rpc(rpcName, rpcParams);
    if (error) throw error;
    return data as T;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // Code 42883 = function not found (migration belum dijalankan)
    if (msg.includes('does not exist') || msg.includes('42883')) {
      return fallback();
    }
    throw err;
  }
};

// ============================================================
// PENYAKIT
// ============================================================

export const fetchPenyakit = async (): Promise<Penyakit[]> => {
  const { data, error } = await supabase
    .from('penyakit')
    .select('*')
    .order('kode');
  if (error) throw error;
  return data || [];
};

export const fetchPenyakitById = async (id: string): Promise<Penyakit | null> => {
  const { data, error } = await supabase
    .from('penyakit')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
};

export const insertPenyakit = async (penyakit: Penyakit): Promise<Penyakit> => {
  return adminWrite(
    'admin_insert_penyakit',
    { p_admin_id: getCurrentUserId(), p_data: penyakit },
    async () => {
      const { data, error } = await supabase.from('penyakit').insert(penyakit).select().single();
      if (error) throw error;
      return data;
    }
  );
};

export const updatePenyakit = async (id: string, updates: Partial<Penyakit>): Promise<Penyakit> => {
  return adminWrite(
    'admin_update_penyakit',
    { p_admin_id: getCurrentUserId(), p_id: id, p_data: updates },
    async () => {
      const { data, error } = await supabase.from('penyakit').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }
  );
};

export const deletePenyakit = async (id: string): Promise<void> => {
  return adminWrite(
    'admin_delete_penyakit',
    { p_admin_id: getCurrentUserId(), p_id: id },
    async () => {
      const { error } = await supabase.from('penyakit').delete().eq('id', id);
      if (error) throw error;
    }
  );
};

// Upload gambar penyakit ke Supabase Storage (single file)
export const uploadPenyakitImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `penyakit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('penyakit-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Gagal upload gambar:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('penyakit-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// Upload multiple gambar penyakit ke Supabase Storage
export const uploadMultiplePenyakitImages = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map((file) => uploadPenyakitImage(file));
  return Promise.all(uploadPromises);
};

// Hapus gambar penyakit dari Supabase Storage
export const deletePenyakitImage = async (imageUrl: string): Promise<void> => {
  const urlParts = imageUrl.split('/penyakit-images/');
  if (urlParts.length < 2) return;
  
  const filePath = urlParts[1];
  const { error } = await supabase.storage
    .from('penyakit-images')
    .remove([filePath]);

  if (error) {
    console.error('Gagal menghapus gambar:', error);
  }
};

// Hapus multiple gambar penyakit dari Supabase Storage
export const deleteMultiplePenyakitImages = async (imageUrls: string[]): Promise<void> => {
  for (const url of imageUrls) {
    await deletePenyakitImage(url);
  }
};

// ============================================================
// GEJALA
// ============================================================

export const fetchGejala = async (): Promise<Gejala[]> => {
  const { data, error } = await supabase
    .from('gejala')
    .select('*')
    .order('kode');
  if (error) throw error;
  return data || [];
};

export const fetchGejalaById = async (id: string): Promise<Gejala | null> => {
  const { data, error } = await supabase
    .from('gejala')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
};

export const insertGejala = async (gejala: Gejala): Promise<Gejala> => {
  return adminWrite(
    'admin_insert_gejala',
    { p_admin_id: getCurrentUserId(), p_data: gejala },
    async () => {
      const { data, error } = await supabase.from('gejala').insert(gejala).select().single();
      if (error) throw error;
      return data;
    }
  );
};

export const updateGejala = async (id: string, updates: Partial<Gejala>): Promise<Gejala> => {
  return adminWrite(
    'admin_update_gejala',
    { p_admin_id: getCurrentUserId(), p_id: id, p_data: updates },
    async () => {
      const { data, error } = await supabase.from('gejala').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }
  );
};

export const deleteGejala = async (id: string): Promise<void> => {
  return adminWrite(
    'admin_delete_gejala',
    { p_admin_id: getCurrentUserId(), p_id: id },
    async () => {
      const { error } = await supabase.from('gejala').delete().eq('id', id);
      if (error) throw error;
    }
  );
};

// ============================================================
// RULES
// ============================================================

export const fetchRules = async (): Promise<Rule[]> => {
  const { data, error } = await supabase
    .from('rules')
    .select('*')
    .order('id');
  if (error) throw error;
  return data || [];
};

export const insertRule = async (rule: Rule): Promise<Rule> => {
  return adminWrite(
    'admin_insert_rule',
    { p_admin_id: getCurrentUserId(), p_data: rule },
    async () => {
      const { data, error } = await supabase.from('rules').insert(rule).select().single();
      if (error) throw error;
      return data;
    }
  );
};

export const updateRule = async (id: string, updates: Partial<Rule>): Promise<Rule> => {
  return adminWrite(
    'admin_update_rule',
    { p_admin_id: getCurrentUserId(), p_id: id, p_data: updates },
    async () => {
      const { data, error } = await supabase.from('rules').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }
  );
};

export const deleteRule = async (id: string): Promise<void> => {
  return adminWrite(
    'admin_delete_rule',
    { p_admin_id: getCurrentUserId(), p_id: id },
    async () => {
      const { error } = await supabase.from('rules').delete().eq('id', id);
      if (error) throw error;
    }
  );
};

// ============================================================
// USERS
// ============================================================

export const fetchUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at');
  if (error) throw error;
  return data || [];
};

export const fetchUserByEmail = async (email: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  if (error) return null;
  return data;
};

export const fetchUserById = async (id: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
};

export const insertUser = async (user: User): Promise<User> => {
  const { data, error } = await supabase
    .from('users')
    .insert(user)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateUser = async (id: string, updates: Partial<User>): Promise<User> => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteUserById = async (id: string): Promise<void> => {
  return adminWrite(
    'admin_delete_user',
    { p_admin_id: getCurrentUserId(), p_user_id: id },
    async () => {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
    }
  );
};

// ============================================================
// HASIL DIAGNOSA
// ============================================================

export const fetchHasilDiagnosa = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('hasil_diagnosa')
    .select('*')
    .order('tanggal', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const fetchHasilDiagnosaByUserId = async (userId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('hasil_diagnosa')
    .select('*')
    .eq('user_id', userId)
    .order('tanggal', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const insertHasilDiagnosa = async (hasil: any): Promise<any> => {
  const { data, error } = await supabase
    .from('hasil_diagnosa')
    .insert(hasil)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteHasilDiagnosa = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('hasil_diagnosa')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

// ============================================================
// POHON KEPUTUSAN
// ============================================================

export const fetchPohonKeputusan = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('pohon_keputusan')
    .select('*')
    .order('id');
  if (error) throw error;
  return data || [];
};

export const fetchPohonNodeById = async (id: string): Promise<any | null> => {
  const { data, error } = await supabase
    .from('pohon_keputusan')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
};

export const insertPohonNode = async (node: any): Promise<any> => {
  return adminWrite(
    'admin_insert_pohon',
    { p_admin_id: getCurrentUserId(), p_data: node },
    async () => {
      const { data, error } = await supabase.from('pohon_keputusan').insert(node).select().single();
      if (error) throw error;
      return data;
    }
  );
};

export const updatePohonNode = async (id: string, updates: Partial<any>): Promise<any> => {
  const result = await adminWrite(
    'admin_update_pohon',
    { p_admin_id: getCurrentUserId(), p_id: id, p_data: updates },
    async () => {
      const { data, error } = await supabase.from('pohon_keputusan').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }
  );

  // Jika update mencoba mengosongkan 'ya' atau 'tidak' ke null/empty,
  // namun RPC lama di Supabase masih menyimpan nilai lama (akibat bug COALESCE SQL),
  // lakukan fallback direct update:
  if (
    ((updates.ya === null || updates.ya === "") && result?.ya) ||
    ((updates.tidak === null || updates.tidak === "") && result?.tidak)
  ) {
    try {
      const { data } = await supabase
        .from('pohon_keputusan')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (data) return data;
    } catch (e) {
      console.warn("Fallback direct update failed:", e);
    }
  }

  return result;
};

export const deletePohonNode = async (id: string): Promise<void> => {
  return adminWrite(
    'admin_delete_pohon',
    { p_admin_id: getCurrentUserId(), p_id: id },
    async () => {
      const { error } = await supabase.from('pohon_keputusan').delete().eq('id', id);
      if (error) throw error;
    }
  );
};
