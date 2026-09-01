-- ============================================================
-- MIGRASI: PERBAIKAN RLS (Row Level Security)
-- 
-- Masalah: Semua policy sebelumnya USING (true) → siapa saja
--          bisa INSERT/UPDATE/DELETE semua data via API langsung.
-- 
-- Solusi : Buat function is_admin() dan get_user_id() yang membaca
--          header x-user-id dari setiap request. Policy baru:
--          - Data publik (penyakit, gejala, dll): semua bisa baca,
--            hanya admin bisa tulis
--          - Users: semua bisa baca & register, update hanya self/admin,
--            delete hanya admin
--          - Hasil diagnosa: user hanya bisa akses miliknya sendiri,
--            admin bisa akses semua
--
-- Jalankan SQL ini di Supabase SQL Editor
-- ============================================================


-- ============================================================
-- 1. HELPER FUNCTIONS
-- ============================================================

-- Ambil user ID dari request header (dikirim oleh frontend)
CREATE OR REPLACE FUNCTION get_user_id() RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('request.header.x-user-id', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Cek apakah user yang sedang request adalah admin
-- SECURITY DEFINER agar function ini bypass RLS saat query tabel users
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = current_setting('request.header.x-user-id', true)
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;


-- ============================================================
-- 2. HAPUS SEMUA POLICY LAMA
-- ============================================================

-- penyakit
DROP POLICY IF EXISTS "Public read penyakit" ON penyakit;
DROP POLICY IF EXISTS "Public insert penyakit" ON penyakit;
DROP POLICY IF EXISTS "Public update penyakit" ON penyakit;
DROP POLICY IF EXISTS "Public delete penyakit" ON penyakit;

-- gejala
DROP POLICY IF EXISTS "Public read gejala" ON gejala;
DROP POLICY IF EXISTS "Public insert gejala" ON gejala;
DROP POLICY IF EXISTS "Public update gejala" ON gejala;
DROP POLICY IF EXISTS "Public delete gejala" ON gejala;

-- rules
DROP POLICY IF EXISTS "Public read rules" ON rules;
DROP POLICY IF EXISTS "Public insert rules" ON rules;
DROP POLICY IF EXISTS "Public update rules" ON rules;
DROP POLICY IF EXISTS "Public delete rules" ON rules;

-- users
DROP POLICY IF EXISTS "Public read users" ON users;
DROP POLICY IF EXISTS "Public insert users" ON users;
DROP POLICY IF EXISTS "Public update users" ON users;
DROP POLICY IF EXISTS "Public delete users" ON users;

-- hasil_diagnosa
DROP POLICY IF EXISTS "Public read hasil_diagnosa" ON hasil_diagnosa;
DROP POLICY IF EXISTS "Public insert hasil_diagnosa" ON hasil_diagnosa;
DROP POLICY IF EXISTS "Public update hasil_diagnosa" ON hasil_diagnosa;
DROP POLICY IF EXISTS "Public delete hasil_diagnosa" ON hasil_diagnosa;

-- pohon_keputusan
DROP POLICY IF EXISTS "Public read pohon_keputusan" ON pohon_keputusan;
DROP POLICY IF EXISTS "Public insert pohon_keputusan" ON pohon_keputusan;
DROP POLICY IF EXISTS "Public update pohon_keputusan" ON pohon_keputusan;
DROP POLICY IF EXISTS "Public delete pohon_keputusan" ON pohon_keputusan;


-- ============================================================
-- 3. POLICY BARU: PENYAKIT
-- Semua bisa baca (untuk diagnosa), hanya admin bisa tulis
-- ============================================================
CREATE POLICY "Semua bisa baca penyakit"
  ON penyakit FOR SELECT
  USING (true);

CREATE POLICY "Admin bisa tambah penyakit"
  ON penyakit FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admin bisa edit penyakit"
  ON penyakit FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admin bisa hapus penyakit"
  ON penyakit FOR DELETE
  USING (is_admin());


-- ============================================================
-- 4. POLICY BARU: GEJALA
-- Semua bisa baca, hanya admin bisa tulis
-- ============================================================
CREATE POLICY "Semua bisa baca gejala"
  ON gejala FOR SELECT
  USING (true);

CREATE POLICY "Admin bisa tambah gejala"
  ON gejala FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admin bisa edit gejala"
  ON gejala FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admin bisa hapus gejala"
  ON gejala FOR DELETE
  USING (is_admin());


-- ============================================================
-- 5. POLICY BARU: RULES
-- Semua bisa baca, hanya admin bisa tulis
-- ============================================================
CREATE POLICY "Semua bisa baca rules"
  ON rules FOR SELECT
  USING (true);

CREATE POLICY "Admin bisa tambah rules"
  ON rules FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admin bisa edit rules"
  ON rules FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admin bisa hapus rules"
  ON rules FOR DELETE
  USING (is_admin());


-- ============================================================
-- 6. POLICY BARU: POHON KEPUTUSAN
-- Semua bisa baca (untuk diagnosa), hanya admin bisa tulis
-- ============================================================
CREATE POLICY "Semua bisa baca pohon_keputusan"
  ON pohon_keputusan FOR SELECT
  USING (true);

CREATE POLICY "Admin bisa tambah pohon_keputusan"
  ON pohon_keputusan FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admin bisa edit pohon_keputusan"
  ON pohon_keputusan FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admin bisa hapus pohon_keputusan"
  ON pohon_keputusan FOR DELETE
  USING (is_admin());


-- ============================================================
-- 7. POLICY BARU: USERS
-- Semua bisa baca (diperlukan untuk login/validasi)
-- Semua bisa register (insert)
-- Update: admin bisa semua, user hanya diri sendiri
-- Delete: hanya admin
-- ============================================================
CREATE POLICY "Semua bisa baca users"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Semua bisa register"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin atau diri sendiri bisa edit"
  ON users FOR UPDATE
  USING (
    is_admin() OR id = get_user_id()
  );

CREATE POLICY "Admin bisa hapus users"
  ON users FOR DELETE
  USING (is_admin());


-- ============================================================
-- 8. POLICY BARU: HASIL DIAGNOSA
-- Select: admin semua, user hanya miliknya
-- Insert: user hanya bisa buat milik sendiri
-- Delete: admin semua, user hanya miliknya
-- Update: tidak diperbolehkan (data diagnosa immutable)
-- ============================================================
CREATE POLICY "Admin atau pemilik bisa baca hasil_diagnosa"
  ON hasil_diagnosa FOR SELECT
  USING (
    is_admin() OR user_id = get_user_id()
  );

CREATE POLICY "User bisa buat diagnosa sendiri"
  ON hasil_diagnosa FOR INSERT
  WITH CHECK (
    user_id = get_user_id()
  );

CREATE POLICY "Admin atau pemilik bisa hapus hasil_diagnosa"
  ON hasil_diagnosa FOR DELETE
  USING (
    is_admin() OR user_id = get_user_id()
  );

-- Tidak ada policy UPDATE untuk hasil_diagnosa
-- (Data diagnosa bersifat immutable / tidak boleh diubah)
