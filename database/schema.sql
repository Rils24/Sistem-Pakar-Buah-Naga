-- ============================================================
-- SUPABASE SQL SCHEMA - Sistem Pakar Buah Naga
-- Jalankan SQL ini di Supabase SQL Editor
-- ============================================================

-- 1. Tabel Penyakit (Hama & Penyakit)
CREATE TABLE IF NOT EXISTS penyakit (
  id TEXT PRIMARY KEY,
  kode TEXT NOT NULL UNIQUE,
  nama TEXT NOT NULL,
  deskripsi TEXT DEFAULT '',
  solusi TEXT[] DEFAULT '{}',
  tipe TEXT NOT NULL CHECK (tipe IN ('hama', 'penyakit')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Gejala
CREATE TABLE IF NOT EXISTS gejala (
  id TEXT PRIMARY KEY,
  kode TEXT NOT NULL UNIQUE,
  nama TEXT NOT NULL,
  deskripsi TEXT DEFAULT '',
  cf_pakar DECIMAL(4,2) NOT NULL DEFAULT 0.8,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Rules (Forward Chaining)
CREATE TABLE IF NOT EXISTS rules (
  id TEXT PRIMARY KEY,
  penyakit_id TEXT NOT NULL REFERENCES penyakit(id) ON DELETE CASCADE,
  gejala_ids TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Hasil Diagnosa
CREATE TABLE IF NOT EXISTS hasil_diagnosa (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tanggal TIMESTAMPTZ DEFAULT NOW(),
  gejala_dipilih JSONB DEFAULT '[]',
  rules_cocok JSONB DEFAULT '[]',
  hasil_cf JSONB DEFAULT '[]',
  penyakit_terpilih TEXT,
  nama_penyakit_terpilih TEXT,
  cf_tertinggi DECIMAL(5,3) DEFAULT 0,
  solusi TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Pohon Keputusan
CREATE TABLE IF NOT EXISTS pohon_keputusan (
  id TEXT PRIMARY KEY,
  gejala_id TEXT NOT NULL,
  kode_gejala TEXT NOT NULL,
  nama_gejala TEXT NOT NULL,
  deskripsi TEXT DEFAULT '',
  ya TEXT DEFAULT '',
  tidak TEXT DEFAULT '',
  hasil TEXT DEFAULT '',
  cf_pakar DECIMAL(4,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS (Row Level Security) - Opsional tapi direkomendasikan
-- ============================================================

ALTER TABLE penyakit ENABLE ROW LEVEL SECURITY;
ALTER TABLE gejala ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hasil_diagnosa ENABLE ROW LEVEL SECURITY;
ALTER TABLE pohon_keputusan ENABLE ROW LEVEL SECURITY;

-- Policy: Semua bisa baca semua data publik
CREATE POLICY "Public read penyakit" ON penyakit FOR SELECT USING (true);
CREATE POLICY "Public read gejala" ON gejala FOR SELECT USING (true);
CREATE POLICY "Public read rules" ON rules FOR SELECT USING (true);
CREATE POLICY "Public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Public read hasil_diagnosa" ON hasil_diagnosa FOR SELECT USING (true);
CREATE POLICY "Public read pohon_keputusan" ON pohon_keputusan FOR SELECT USING (true);

-- Policy: Semua bisa insert/update/delete (untuk admin, nanti bisa diperketat)
CREATE POLICY "Public insert penyakit" ON penyakit FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update penyakit" ON penyakit FOR UPDATE USING (true);
CREATE POLICY "Public delete penyakit" ON penyakit FOR DELETE USING (true);

CREATE POLICY "Public insert gejala" ON gejala FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update gejala" ON gejala FOR UPDATE USING (true);
CREATE POLICY "Public delete gejala" ON gejala FOR DELETE USING (true);

CREATE POLICY "Public insert rules" ON rules FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update rules" ON rules FOR UPDATE USING (true);
CREATE POLICY "Public delete rules" ON rules FOR DELETE USING (true);

CREATE POLICY "Public insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update users" ON users FOR UPDATE USING (true);
CREATE POLICY "Public delete users" ON users FOR DELETE USING (true);

CREATE POLICY "Public insert hasil_diagnosa" ON hasil_diagnosa FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update hasil_diagnosa" ON hasil_diagnosa FOR UPDATE USING (true);
CREATE POLICY "Public delete hasil_diagnosa" ON hasil_diagnosa FOR DELETE USING (true);

CREATE POLICY "Public insert pohon_keputusan" ON pohon_keputusan FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update pohon_keputusan" ON pohon_keputusan FOR UPDATE USING (true);
CREATE POLICY "Public delete pohon_keputusan" ON pohon_keputusan FOR DELETE USING (true);
