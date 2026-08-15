-- ============================================================
-- MIGRATION: Ubah kolom image_url (TEXT) → image_urls (TEXT[])
-- Jalankan SQL ini di Supabase SQL Editor
-- Policy & Bucket sudah dibuat sebelumnya, SKIP.
-- ============================================================

-- Hapus kolom lama (single image) jika ada
ALTER TABLE penyakit DROP COLUMN IF EXISTS image_url;

-- Tambah kolom baru (multi image array)
ALTER TABLE penyakit ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';
