// ============================================================
// SUPABASE SERVICE LAYER
// Semua operasi CRUD ke database Supabase
// ============================================================

import { supabase } from '@/lib/supabase';
import type { Penyakit, Gejala, Rule, User } from '@/types';

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
  const { data, error } = await supabase
    .from('penyakit')
    .insert(penyakit)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updatePenyakit = async (id: string, updates: Partial<Penyakit>): Promise<Penyakit> => {
  const { data, error } = await supabase
    .from('penyakit')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deletePenyakit = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('penyakit')
    .delete()
    .eq('id', id);
  if (error) throw error;
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
  const { data, error } = await supabase
    .from('gejala')
    .insert(gejala)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateGejala = async (id: string, updates: Partial<Gejala>): Promise<Gejala> => {
  const { data, error } = await supabase
    .from('gejala')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteGejala = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('gejala')
    .delete()
    .eq('id', id);
  if (error) throw error;
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
  const { data, error } = await supabase
    .from('rules')
    .insert(rule)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateRule = async (id: string, updates: Partial<Rule>): Promise<Rule> => {
  const { data, error } = await supabase
    .from('rules')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteRule = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('rules')
    .delete()
    .eq('id', id);
  if (error) throw error;
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
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);
  if (error) throw error;
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
