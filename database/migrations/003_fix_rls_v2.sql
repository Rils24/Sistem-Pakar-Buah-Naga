-- ============================================================
-- PERBAIKAN RLS v2 — PENDEKATAN HYBRID
-- 
-- Masalah v1: Header x-user-id tidak selalu diteruskan oleh
--             PostgREST/Kong di semua setup Supabase.
--
-- Solusi  : Gunakan RPC function (SECURITY DEFINER) untuk
--           operasi yang butuh verifikasi role.
--           SELECT tetap terbuka (app-level sudah handle).
--           Write operation admin → lewat RPC function.
--
-- Jalankan SQL ini di Supabase SQL Editor
-- ============================================================


-- ============================================================
-- 1. HAPUS SEMUA POLICY LAMA (termasuk dari v1)
-- ============================================================

-- penyakit
DROP POLICY IF EXISTS "Public read penyakit" ON penyakit;
DROP POLICY IF EXISTS "Public insert penyakit" ON penyakit;
DROP POLICY IF EXISTS "Public update penyakit" ON penyakit;
DROP POLICY IF EXISTS "Public delete penyakit" ON penyakit;
DROP POLICY IF EXISTS "Semua bisa baca penyakit" ON penyakit;
DROP POLICY IF EXISTS "Admin bisa tambah penyakit" ON penyakit;
DROP POLICY IF EXISTS "Admin bisa edit penyakit" ON penyakit;
DROP POLICY IF EXISTS "Admin bisa hapus penyakit" ON penyakit;
DROP POLICY IF EXISTS "select_penyakit" ON penyakit;

-- gejala
DROP POLICY IF EXISTS "Public read gejala" ON gejala;
DROP POLICY IF EXISTS "Public insert gejala" ON gejala;
DROP POLICY IF EXISTS "Public update gejala" ON gejala;
DROP POLICY IF EXISTS "Public delete gejala" ON gejala;
DROP POLICY IF EXISTS "Semua bisa baca gejala" ON gejala;
DROP POLICY IF EXISTS "Admin bisa tambah gejala" ON gejala;
DROP POLICY IF EXISTS "Admin bisa edit gejala" ON gejala;
DROP POLICY IF EXISTS "Admin bisa hapus gejala" ON gejala;
DROP POLICY IF EXISTS "select_gejala" ON gejala;

-- rules
DROP POLICY IF EXISTS "Public read rules" ON rules;
DROP POLICY IF EXISTS "Public insert rules" ON rules;
DROP POLICY IF EXISTS "Public update rules" ON rules;
DROP POLICY IF EXISTS "Public delete rules" ON rules;
DROP POLICY IF EXISTS "Semua bisa baca rules" ON rules;
DROP POLICY IF EXISTS "Admin bisa tambah rules" ON rules;
DROP POLICY IF EXISTS "Admin bisa edit rules" ON rules;
DROP POLICY IF EXISTS "Admin bisa hapus rules" ON rules;
DROP POLICY IF EXISTS "select_rules" ON rules;

-- pohon_keputusan
DROP POLICY IF EXISTS "Public read pohon_keputusan" ON pohon_keputusan;
DROP POLICY IF EXISTS "Public insert pohon_keputusan" ON pohon_keputusan;
DROP POLICY IF EXISTS "Public update pohon_keputusan" ON pohon_keputusan;
DROP POLICY IF EXISTS "Public delete pohon_keputusan" ON pohon_keputusan;
DROP POLICY IF EXISTS "Semua bisa baca pohon_keputusan" ON pohon_keputusan;
DROP POLICY IF EXISTS "Admin bisa tambah pohon_keputusan" ON pohon_keputusan;
DROP POLICY IF EXISTS "Admin bisa edit pohon_keputusan" ON pohon_keputusan;
DROP POLICY IF EXISTS "Admin bisa hapus pohon_keputusan" ON pohon_keputusan;
DROP POLICY IF EXISTS "select_pohon" ON pohon_keputusan;

-- users
DROP POLICY IF EXISTS "Public read users" ON users;
DROP POLICY IF EXISTS "Public insert users" ON users;
DROP POLICY IF EXISTS "Public update users" ON users;
DROP POLICY IF EXISTS "Public delete users" ON users;
DROP POLICY IF EXISTS "Semua bisa baca users" ON users;
DROP POLICY IF EXISTS "Semua bisa register" ON users;
DROP POLICY IF EXISTS "Admin atau diri sendiri bisa edit" ON users;
DROP POLICY IF EXISTS "Admin bisa hapus users" ON users;
DROP POLICY IF EXISTS "select_users" ON users;
DROP POLICY IF EXISTS "insert_users" ON users;
DROP POLICY IF EXISTS "update_users" ON users;

-- hasil_diagnosa
DROP POLICY IF EXISTS "Public read hasil_diagnosa" ON hasil_diagnosa;
DROP POLICY IF EXISTS "Public insert hasil_diagnosa" ON hasil_diagnosa;
DROP POLICY IF EXISTS "Public update hasil_diagnosa" ON hasil_diagnosa;
DROP POLICY IF EXISTS "Public delete hasil_diagnosa" ON hasil_diagnosa;
DROP POLICY IF EXISTS "Admin atau pemilik bisa baca hasil_diagnosa" ON hasil_diagnosa;
DROP POLICY IF EXISTS "User bisa buat diagnosa sendiri" ON hasil_diagnosa;
DROP POLICY IF EXISTS "Admin atau pemilik bisa hapus hasil_diagnosa" ON hasil_diagnosa;
DROP POLICY IF EXISTS "select_hasil" ON hasil_diagnosa;
DROP POLICY IF EXISTS "insert_hasil" ON hasil_diagnosa;
DROP POLICY IF EXISTS "delete_hasil" ON hasil_diagnosa;


-- ============================================================
-- 2. BUAT POLICY BARU (HYBRID: SELECT terbuka, write via RPC)
-- ============================================================

-- Semua tabel: SELECT terbuka (app-level sudah handle akses)
CREATE POLICY "select_penyakit" ON penyakit FOR SELECT USING (true);
CREATE POLICY "select_gejala" ON gejala FOR SELECT USING (true);
CREATE POLICY "select_rules" ON rules FOR SELECT USING (true);
CREATE POLICY "select_pohon" ON pohon_keputusan FOR SELECT USING (true);
CREATE POLICY "select_users" ON users FOR SELECT USING (true);
CREATE POLICY "select_hasil" ON hasil_diagnosa FOR SELECT USING (true);

-- Users: INSERT terbuka (untuk registrasi)
CREATE POLICY "insert_users" ON users FOR INSERT WITH CHECK (true);
-- Users: UPDATE terbuka (app sudah cek auth)
CREATE POLICY "update_users" ON users FOR UPDATE USING (true);

-- Hasil diagnosa: INSERT & DELETE terbuka (app sudah cek auth)
CREATE POLICY "insert_hasil" ON hasil_diagnosa FOR INSERT WITH CHECK (true);
CREATE POLICY "delete_hasil" ON hasil_diagnosa FOR DELETE USING (true);

-- Tabel admin (penyakit, gejala, rules, pohon): BLOCK direct write
-- Write hanya lewat RPC function (lihat di bawah)
-- Tidak ada INSERT/UPDATE/DELETE policy = otomatis BLOCKED oleh RLS


-- ============================================================
-- 3. RPC FUNCTIONS UNTUK ADMIN WRITE OPERATIONS
-- SECURITY DEFINER = bypass RLS, tapi cek role di dalam function
-- ============================================================

-- Helper: cek apakah user_id punya role admin
CREATE OR REPLACE FUNCTION check_admin(p_user_id TEXT) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;


-- ===================== PENYAKIT =====================

CREATE OR REPLACE FUNCTION admin_insert_penyakit(
  p_admin_id TEXT,
  p_data JSONB
) RETURNS JSONB AS $$
DECLARE
  result RECORD;
BEGIN
  IF NOT check_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Akses ditolak: bukan admin';
  END IF;
  
  INSERT INTO penyakit (id, kode, nama, deskripsi, solusi, tipe, image_urls)
  VALUES (
    p_data->>'id',
    p_data->>'kode',
    p_data->>'nama',
    COALESCE(p_data->>'deskripsi', ''),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_data->'solusi')), '{}'),
    p_data->>'tipe',
    CASE WHEN p_data ? 'image_urls' THEN ARRAY(SELECT jsonb_array_elements_text(p_data->'image_urls')) ELSE '{}' END
  )
  RETURNING * INTO result;
  
  RETURN row_to_json(result)::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION admin_update_penyakit(
  p_admin_id TEXT,
  p_id TEXT,
  p_data JSONB
) RETURNS JSONB AS $$
DECLARE
  result RECORD;
BEGIN
  IF NOT check_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Akses ditolak: bukan admin';
  END IF;
  
  UPDATE penyakit SET
    kode = COALESCE(p_data->>'kode', kode),
    nama = COALESCE(p_data->>'nama', nama),
    deskripsi = COALESCE(p_data->>'deskripsi', deskripsi),
    solusi = CASE WHEN p_data ? 'solusi' THEN ARRAY(SELECT jsonb_array_elements_text(p_data->'solusi')) ELSE solusi END,
    tipe = COALESCE(p_data->>'tipe', tipe),
    image_urls = CASE WHEN p_data ? 'image_urls' THEN ARRAY(SELECT jsonb_array_elements_text(p_data->'image_urls')) ELSE image_urls END
  WHERE id = p_id
  RETURNING * INTO result;
  
  RETURN row_to_json(result)::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION admin_delete_penyakit(
  p_admin_id TEXT,
  p_id TEXT
) RETURNS VOID AS $$
BEGIN
  IF NOT check_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Akses ditolak: bukan admin';
  END IF;
  DELETE FROM penyakit WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ===================== GEJALA =====================

CREATE OR REPLACE FUNCTION admin_insert_gejala(
  p_admin_id TEXT,
  p_data JSONB
) RETURNS JSONB AS $$
DECLARE
  result RECORD;
BEGIN
  IF NOT check_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Akses ditolak: bukan admin';
  END IF;
  
  INSERT INTO gejala (id, kode, nama, deskripsi, cf_pakar)
  VALUES (
    p_data->>'id',
    p_data->>'kode',
    p_data->>'nama',
    COALESCE(p_data->>'deskripsi', ''),
    COALESCE((p_data->>'cf_pakar')::DECIMAL, 0.8)
  )
  RETURNING * INTO result;
  
  RETURN row_to_json(result)::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION admin_update_gejala(
  p_admin_id TEXT,
  p_id TEXT,
  p_data JSONB
) RETURNS JSONB AS $$
DECLARE
  result RECORD;
BEGIN
  IF NOT check_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Akses ditolak: bukan admin';
  END IF;
  
  UPDATE gejala SET
    kode = COALESCE(p_data->>'kode', kode),
    nama = COALESCE(p_data->>'nama', nama),
    deskripsi = COALESCE(p_data->>'deskripsi', deskripsi),
    cf_pakar = COALESCE((p_data->>'cf_pakar')::DECIMAL, cf_pakar)
  WHERE id = p_id
  RETURNING * INTO result;
  
  RETURN row_to_json(result)::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION admin_delete_gejala(
  p_admin_id TEXT,
  p_id TEXT
) RETURNS VOID AS $$
BEGIN
  IF NOT check_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Akses ditolak: bukan admin';
  END IF;
  DELETE FROM gejala WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ===================== RULES =====================

CREATE OR REPLACE FUNCTION admin_insert_rule(
  p_admin_id TEXT,
  p_data JSONB
) RETURNS JSONB AS $$
DECLARE
  result RECORD;
BEGIN
  IF NOT check_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Akses ditolak: bukan admin';
  END IF;
  
  INSERT INTO rules (id, penyakit_id, gejala_ids)
  VALUES (
    p_data->>'id',
    p_data->>'penyakit_id',
    ARRAY(SELECT jsonb_array_elements_text(p_data->'gejala_ids'))
  )
  RETURNING * INTO result;
  
  RETURN row_to_json(result)::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION admin_update_rule(
  p_admin_id TEXT,
  p_id TEXT,
  p_data JSONB
) RETURNS JSONB AS $$
DECLARE
  result RECORD;
BEGIN
  IF NOT check_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Akses ditolak: bukan admin';
  END IF;
  
  UPDATE rules SET
    penyakit_id = COALESCE(p_data->>'penyakit_id', penyakit_id),
    gejala_ids = CASE WHEN p_data ? 'gejala_ids' THEN ARRAY(SELECT jsonb_array_elements_text(p_data->'gejala_ids')) ELSE gejala_ids END
  WHERE id = p_id
  RETURNING * INTO result;
  
  RETURN row_to_json(result)::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION admin_delete_rule(
  p_admin_id TEXT,
  p_id TEXT
) RETURNS VOID AS $$
BEGIN
  IF NOT check_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Akses ditolak: bukan admin';
  END IF;
  DELETE FROM rules WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ===================== POHON KEPUTUSAN =====================

CREATE OR REPLACE FUNCTION admin_insert_pohon(
  p_admin_id TEXT,
  p_data JSONB
) RETURNS JSONB AS $$
DECLARE
  result RECORD;
BEGIN
  IF NOT check_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Akses ditolak: bukan admin';
  END IF;
  
  INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar)
  VALUES (
    p_data->>'id',
    p_data->>'gejala_id',
    p_data->>'kode_gejala',
    p_data->>'nama_gejala',
    COALESCE(p_data->>'deskripsi', ''),
    COALESCE(p_data->>'ya', ''),
    COALESCE(p_data->>'tidak', ''),
    COALESCE(p_data->>'hasil', ''),
    COALESCE((p_data->>'cf_pakar')::DECIMAL, 0)
  )
  RETURNING * INTO result;
  
  RETURN row_to_json(result)::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION admin_update_pohon(
  p_admin_id TEXT,
  p_id TEXT,
  p_data JSONB
) RETURNS JSONB AS $$
DECLARE
  result RECORD;
BEGIN
  IF NOT check_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Akses ditolak: bukan admin';
  END IF;
  
  UPDATE pohon_keputusan SET
    gejala_id = CASE WHEN p_data ? 'gejala_id' THEN NULLIF(p_data->>'gejala_id', '') ELSE gejala_id END,
    kode_gejala = CASE WHEN p_data ? 'kode_gejala' THEN NULLIF(p_data->>'kode_gejala', '') ELSE kode_gejala END,
    nama_gejala = CASE WHEN p_data ? 'nama_gejala' THEN NULLIF(p_data->>'nama_gejala', '') ELSE nama_gejala END,
    deskripsi = CASE WHEN p_data ? 'deskripsi' THEN NULLIF(p_data->>'deskripsi', '') ELSE deskripsi END,
    ya = CASE WHEN p_data ? 'ya' THEN NULLIF(p_data->>'ya', '') ELSE ya END,
    tidak = CASE WHEN p_data ? 'tidak' THEN NULLIF(p_data->>'tidak', '') ELSE tidak END,
    hasil = CASE WHEN p_data ? 'hasil' THEN NULLIF(p_data->>'hasil', '') ELSE hasil END,
    cf_pakar = CASE WHEN p_data ? 'cf_pakar' THEN COALESCE((p_data->>'cf_pakar')::DECIMAL, cf_pakar) ELSE cf_pakar END
  WHERE id = p_id
  RETURNING * INTO result;
  
  RETURN row_to_json(result)::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION admin_delete_pohon(
  p_admin_id TEXT,
  p_id TEXT
) RETURNS VOID AS $$
BEGIN
  IF NOT check_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Akses ditolak: bukan admin';
  END IF;
  DELETE FROM pohon_keputusan WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ===================== USERS (admin only) =====================

CREATE OR REPLACE FUNCTION admin_delete_user(
  p_admin_id TEXT,
  p_user_id TEXT
) RETURNS VOID AS $$
BEGIN
  IF NOT check_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Akses ditolak: bukan admin';
  END IF;
  DELETE FROM users WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
