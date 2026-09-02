-- ============================================================
-- SEED DATA UPDATE: POHON KEPUTUSAN PENYAKIT (P01 - P06) SEQUENTIAL LATTICE
-- Pilihan 2: Node p0X_not_found (P01?, P02?, dll) diletakkan di sudut kanan bawah kisi
-- - Lengkap 100% Gejala (P01: G38-G44, P02: G45-G49, P03: G50-G61, P04: G62-G66, P05: G67-G71, P06: G72-G76)
-- - Menghilangkan garis menanjak ke atas
-- - 'YA'   : Panah lurus ke bawah (Vertikal)
-- - 'TIDAK': Panah diagonal ke kanan
-- - 'p0X_not_found' menerima aliran dari dasar kisi dan mengalir ke p0(X+1)_check
-- ============================================================

-- 1. Hapus data Penyakit lama agar data bersih dan terstruktur
DELETE FROM pohon_keputusan 
WHERE id LIKE 'p0%' OR id = 'penyakit_not_found';

-- 2. Hubungkan node penyakit_group ke entry point P01
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar)
VALUES 
('penyakit_group', 'penyakit', 'PENYAKIT', 'Terdeteksi adanya indikasi PENYAKIT (Jamur/Bakteri/Virus). Mari kita cari tahu penyakit apa yang menyerang.', '', 'p01_check', '', '', 1.0)
ON CONFLICT (id) DO UPDATE SET 
  ya = EXCLUDED.ya,
  tidak = EXCLUDED.tidak;

-- ============================================================
-- ALUR POHON KEPUTUSAN PENYAKIT (KISI SIMETRIS SEKUENSIONAL)
-- ============================================================

-- ------------------------------------------------------------
-- P01: KANKER BATANG DAN BUAH (G38 - G44)
-- ------------------------------------------------------------
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('p01_check',         'g38', 'G38', 'Muncul bintik putih kecil cekung, di tengah bintik ada seperti bekas tusukan jarum pada tunas, cabang muda, atau buah', '', 'p01_g39',    'p02_check', '', 0.9),
('p01_g39',           'g39', 'G39', 'Bintik berubah warna menjadi coklat kemerahan',                                                                          '', 'p01_g40_y',  'p01_g40_t',  '', 0.85),
('p01_g40_y',         'g40', 'G40', 'Bintik-bintik menyatu menjadi bercak kuning-coklat hingga hitam dengan permukaan kasar',                                 '', 'p01_g41_y',  'p01_g41_t',  '', 0.85),
('p01_g40_t',         'g40', 'G40', 'Bintik-bintik menyatu menjadi bercak kuning-coklat hingga hitam (Jalur alternatif)',                                     '', 'p01_g41_t',  'p01_g41_tr', '', 0.85),
('p01_g41_y',         'g41', 'G41', 'Tunas muda mengering dan mati akibat serangan sangat parah',                                                             '', 'p01_g42_y',  'p01_g42_t',  '', 0.80),
('p01_g41_t',         'g41', 'G41', 'Tunas muda mengering dan mati akibat serangan sangat parah (Jalur alternatif)',                                          '', 'p01_g42_t',  'p01_g42_tr', '', 0.80),
('p01_g41_tr',        'g41', 'G41', 'Tunas muda mengering dan mati akibat serangan sangat parah (Jalur alternatif 2)',                                '', 'p01_g42_tr', 'p01_g42_tr', '', 0.80),
('p01_g42_y',         'g42', 'G42', 'Pada batang tua muncul bercak 1-2 cm dengan lubang hitam di tengahnya',                                                  '', 'p01_g43_y',  'p01_g43_t',  '', 0.85),
('p01_g42_t',         'g42', 'G42', 'Pada batang tua muncul bercak 1-2 cm dengan lubang hitam di tengahnya (Jalur alternatif)',                               '', 'p01_g43_t',  'p01_g43_tr', '', 0.85),
('p01_g42_tr',        'g42', 'G42', 'Pada batang tua muncul bercak 1-2 cm dengan lubang hitam di tengahnya (Jalur alternatif 2)',                             '', 'p01_g43_tr', 'p01_g43_tr', '', 0.85),
('p01_g43_y',         'g43', 'G43', 'Buah terlihat kasar dengan bercak-bercak yang sudah menyatu di permukaannya',                                            '', 'p01_g44_y',  'p01_g44_t',  '', 0.80),
('p01_g43_t',         'g43', 'G43', 'Buah terlihat kasar dengan bercak-bercak yang sudah menyatu di permukaannya (Jalur alternatif)',                         '', 'p01_g44_t',  'p01_g44_tr', '', 0.80),
('p01_g43_tr',        'g43', 'G43', 'Buah terlihat kasar dengan bercak-bercak yang sudah menyatu di permukaannya (Jalur alternatif 2)',                        '', 'p01_g44_tr', 'p01_g44_tr', '', 0.80),
('p01_g44_y',         'g44', 'G44', 'Pada serangan lanjut, batang membusuk dan hancur menyisakan bagian berkayu',                                             '', 'p01_confirmed', 'p01_confirmed', '', 0.85),
('p01_g44_t',         'g44', 'G44', 'Pada serangan lanjut, batang membusuk dan hancur menyisakan bagian berkayu (Jalur alternatif)',                          '', 'p01_confirmed', 'p01_confirmed', '', 0.85),
('p01_g44_tr',        'g44', 'G44', 'Pada serangan lanjut, batang membusuk dan hancur menyisakan bagian berkayu (Jalur alternatif 2)', '', 'p01_confirmed', 'p01_not_found', '', 0.85),
('p01_confirmed',     'p01', 'P01', 'Hasil: Kanker Batang dan Buah terdeteksi!', '', '', '', 'p01', 0.95),
('p01_not_found',     'p01_not_found', 'P01?', 'Kanker Batang tidak memenuhi syarat.', '', 'p02_check', '', '', 0);

-- ------------------------------------------------------------
-- P02: ANTRAKNOSA (G45 - G49)
-- ------------------------------------------------------------
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('p02_check',           'g45', 'G45', 'Muncul bercak coklat cekung basah pada tunas atau buah yang mulai masak', '', 'p02_g46',    'p03_check', '', 0.9),
('p02_g46',             'g46', 'G46', 'Bercak busuk berwarna coklat melebar dengan cepat terutama saat cuaca lembab', '', 'p02_g47_y',  'p02_g47_t',  '', 0.85),
('p02_g47_y',           'g47', 'G47', 'Permukaan bercak terasa basah dan lunak saat ditekan',                         '', 'p02_g48_y',  'p02_g48_t',  '', 0.80),
('p02_g47_t',           'g47', 'G47', 'Permukaan bercak terasa basah dan lunak saat ditekan (Jalur alternatif)',      '', 'p02_g48_t',  'p02_g48_tr', '', 0.80),
('p02_g48_y',           'g48', 'G48', 'Pada bercak lanjut terlihat massa spora berwarna jingga atau merah muda',      '', 'p02_g49_y',  'p02_g49_t',  '', 0.85),
('p02_g48_t',           'g48', 'G48', 'Pada bercak lanjut terlihat massa spora berwarna jingga (Jalur alternatif)',   '', 'p02_g49_t',  'p02_g49_tr', '', 0.85),
('p02_g48_tr',          'g48', 'G48', 'Pada bercak lanjut terlihat massa spora berwarna jingga (Jalur alternatif 2)', '', 'p02_g49_tr', 'p02_g49_tr', '', 0.85),
('p02_g49_y',           'g49', 'G49', 'Buah membusuk, menjadi tidak layak konsumsi dan gugur',                         '', 'p02_confirmed', 'p02_confirmed', '', 0.80),
('p02_g49_t',           'g49', 'G49', 'Buah membusuk, menjadi tidak layak konsumsi dan gugur (Jalur alternatif)',      '', 'p02_confirmed', 'p02_confirmed', '', 0.80),
('p02_g49_tr',          'g49', 'G49', 'Buah membusuk, menjadi tidak layak konsumsi dan gugur (Jalur alternatif 2)',   '', 'p02_confirmed', 'p02_not_found', '', 0.80),
('p02_confirmed',       'p02', 'P02', 'Hasil: Antraknosa terdeteksi!', '', '', '', 'p02', 0.95),
('p02_not_found',       'p02_not_found', 'P02?', 'Antraknosa tidak memenuhi syarat.', '', 'p03_check', '', '', 0);

-- ------------------------------------------------------------
-- P03: BUSUK BATANG (G50 - G61 LENGKAP)
-- ------------------------------------------------------------
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('p03_check',              'g50', 'G50', 'Batang berubah warna menjadi kuning pada bagian yang terinfeksi', '', 'p03_g51',    'p04_check', '', 0.80),
('p03_g51',                'g51', 'G51', 'Bercak coklat kekuningan meluas ke atas mengikuti arah batang', '', 'p03_g52_y',  'p03_g52_t',  '', 0.85),
('p03_g52_y',              'g52', 'G52', 'Jika batang dipotong melintang, bagian dalamnya berwarna coklat', '', 'p03_g53_y',  'p03_g53_t',  '', 0.90),
('p03_g52_t',              'g52', 'G52', 'Jika batang dipotong melintang, bagian dalamnya berwarna coklat (Jalur alt)', '', 'p03_g53_t', 'p03_g53_tr', '', 0.90),
('p03_g53_y',              'g53', 'G53', 'Batang teraba lunak dan berair jika ditekan',                         '', 'p03_g54_y',  'p03_g54_t',  '', 0.85),
('p03_g53_t',              'g53', 'G53', 'Batang teraba lunak dan berair jika ditekan (Jalur alternatif)',      '', 'p03_g54_t',  'p03_g54_tr', '', 0.85),
('p03_g53_tr',             'g53', 'G53', 'Batang teraba lunak dan berair jika ditekan (Jalur alternatif 2)',   '', 'p03_g54_tr', 'p03_g54_tr', '', 0.85),
('p03_g54_y',              'g54', 'G54', 'Muncul benang-benang jamur putih atau merah muda pada permukaan batang', '', 'p03_g55_y', 'p03_g55_t',  '', 0.80),
('p03_g54_t',              'g54', 'G54', 'Muncul benang-benang jamur putih atau merah muda (Jalur alternatif)',  '', 'p03_g55_t',  'p03_g55_tr', '', 0.80),
('p03_g54_tr',             'g54', 'G54', 'Muncul benang-benang jamur putih atau merah muda (Jalur alternatif 2)', '', 'p03_g55_tr', 'p03_g55_tr', '', 0.80),
('p03_g55_y',              'g55', 'G55', 'Batang rapuh dan mudah patah atau ambruk',                            '', 'p03_g56_y',  'p03_g56_t',  '', 0.85),
('p03_g55_t',              'g55', 'G55', 'Batang rapuh dan mudah patah atau ambruk (Jalur alternatif)',         '', 'p03_g56_t',  'p03_g56_tr', '', 0.85),
('p03_g55_tr',             'g55', 'G55', 'Batang rapuh dan mudah patah atau ambruk (Jalur alternatif 2)',        '', 'p03_g56_tr', 'p03_g56_tr', '', 0.85),
('p03_g56_y',              'g56', 'G56', 'Stadium lanjut batang mengering dan berwarna coklat kehitaman',       '', 'p03_g57_y',  'p03_g57_t',  '', 0.80),
('p03_g56_t',              'g56', 'G56', 'Stadium lanjut batang mengering (Jalur alternatif)',                  '', 'p03_g57_t',  'p03_g57_tr', '', 0.80),
('p03_g56_tr',             'g56', 'G56', 'Stadium lanjut batang mengering (Jalur alternatif 2)',                '', 'p03_g57_tr', 'p03_g57_tr', '', 0.80),
('p03_g57_y',              'g57', 'G57', 'Kuning lunak hancur dan meninggalkan bagian berkayu yang keras',      '', 'p03_g58_y',  'p03_g58_t',  '', 0.80),
('p03_g57_t',              'g57', 'G57', 'Kuning lunak hancur dan meninggalkan bagian berkayu (Jalur alt)',    '', 'p03_g58_t',  'p03_g58_tr', '', 0.80),
('p03_g57_tr',             'g57', 'G57', 'Kuning lunak hancur dan meninggalkan bagian berkayu (Jalur alt 2)',  '', 'p03_g58_tr', 'p03_g58_tr', '', 0.80),
('p03_g58_y',              'g58', 'G58', 'Tercium bau busuk yang menyengat dari batang yang sakit',             '', 'p03_g59_y',  'p03_g59_t',  '', 0.90),
('p03_g58_t',              'g58', 'G58', 'Tercium bau busuk yang menyengat (Jalur alternatif)',                 '', 'p03_g59_t',  'p03_g59_tr', '', 0.90),
('p03_g58_tr',             'g58', 'G58', 'Tercium bau busuk yang menyengat (Jalur alternatif 2)',               '', 'p03_g59_tr', 'p03_g59_tr', '', 0.90),
('p03_g59_y',              'g59', 'G59', 'Keluar cairan kental berwarna putih kecoklatan dari batang',          '', 'p03_g60_y',  'p03_g60_t',  '', 0.85),
('p03_g59_t',              'g59', 'G59', 'Keluar cairan kental berwarna putih kecoklatan (Jalur alternatif)',   '', 'p03_g60_t',  'p03_g60_tr', '', 0.85),
('p03_g59_tr',             'g59', 'G59', 'Keluar cairan kental berwarna putih kecoklatan (Jalur alt 2)',        '', 'p03_g60_tr', 'p03_g60_tr', '', 0.85),
('p03_g60_y',              'g60', 'G60', 'Kulit batang mudah terkelupas dan bagian dalamnya membusuk',          '', 'p03_g61_y',  'p03_g61_t',  '', 0.80),
('p03_g60_t',              'g60', 'G60', 'Kulit batang mudah terkelupas (Jalur alternatif)',                    '', 'p03_g61_t',  'p03_g61_tr', '', 0.80),
('p03_g60_tr',             'g60', 'G60', 'Kulit batang mudah terkelupas (Jalur alternatif 2)',                  '', 'p03_g61_tr', 'p03_g61_tr', '', 0.80),
('p03_g61_y',              'g61', 'G61', 'Batang berubah warna dari hijau menjadi kuning kecoklatan hingga hitam', '', 'p03_confirmed', 'p03_confirmed', '', 0.80),
('p03_g61_t',              'g61', 'G61', 'Batang berubah warna dari hijau menjadi kuning kecoklatan (Alt 1)',     '', 'p03_confirmed', 'p03_confirmed', '', 0.80),
('p03_g61_tr',             'g61', 'G61', 'Batang berubah warna dari hijau menjadi kuning kecoklatan (Alt 2)',     '', 'p03_confirmed', 'p03_not_found', '', 0.80),
('p03_confirmed',          'p03', 'P03', 'Hasil: Busuk Batang terdeteksi!', '', '', '', 'p03', 0.95),
('p03_not_found',          'p03_not_found', 'P03?', 'Busuk Batang tidak memenuhi syarat.', '', 'p04_check', '', '', 0);

-- ------------------------------------------------------------
-- P04: KUDIS / SCAB (G62 - G66)
-- ------------------------------------------------------------
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('p04_check',           'g62', 'G62', 'Muncul bercak kecil coklat muda kasar seperti koreng pada batang atau buah', '', 'p04_g63',    'p05_check', '', 0.85),
('p04_g63',             'g63', 'G63', 'Bercak membesar dengan permukaan yang kering dan keras',                      '', 'p04_g64_y',  'p04_g64_t',  '', 0.80),
('p04_g64_y',           'g64', 'G64', 'Pinggiran bercak berwarna lebih gelap dibanding bagian tengahnya',            '', 'p04_g65_y',  'p04_g65_t',  '', 0.75),
('p04_g64_t',           'g64', 'G64', 'Pinggiran bercak berwarna lebih gelap dibanding bagian tengahnya (Jalur alt)', '', 'p04_g65_t',  'p04_g65_tr', '', 0.75),
('p04_g65_y',           'g65', 'G65', 'Pada serangan berat bercak menyatu dan menutupi area yang luas',             '', 'p04_g66_y',  'p04_g66_t',  '', 0.80),
('p04_g65_t',           'g65', 'G65', 'Pada serangan berat bercak menyatu (Jalur alternatif)',                       '', 'p04_g66_t',  'p04_g66_tr', '', 0.80),
('p04_g65_tr',          'g65', 'G65', 'Pada serangan berat bercak menyatu (Jalur alternatif 2)',                     '', 'p04_g66_tr', 'p04_g66_tr', '', 0.80),
('p04_g66_y',           'g66', 'G66', 'Saat cuaca lembab terlihat titik-titik hitam kecil pada permukaan bercak',    '', 'p04_confirmed', 'p04_confirmed', '', 0.85),
('p04_g66_t',           'g66', 'G66', 'Saat cuaca lembab terlihat titik-titik hitam kecil (Jalur alternatif)',       '', 'p04_confirmed', 'p04_confirmed', '', 0.85),
('p04_g66_tr',          'g66', 'G66', 'Saat cuaca lembab terlihat titik-titik hitam kecil (Jalur alternatif 2)',     '', 'p04_confirmed', 'p04_not_found', '', 0.85),
('p04_confirmed',        'p04', 'P04', 'Hasil: Kudis / Scab terdeteksi!', '', '', '', 'p04', 0.95),
('p04_not_found',        'p04_not_found', 'P04?', 'Kudis / Scab tidak memenuhi syarat.', '', 'p05_check', '', '', 0);

-- ------------------------------------------------------------
-- P05: MOSAIK / BERCAK NEKROTIK (G67 - G71)
-- ------------------------------------------------------------
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('p05_check',          'g67', 'G67', 'Muncul bercak kecil di tunas muda yang berubah warna menjadi jingga', '', 'p05_g68',    'p06_check', '', 0.80),
('p05_g68',            'g68', 'G68', 'Batang tampak belang-belang kuning dan hijau tidak merata',            '', 'p05_g69_y',  'p05_g69_t',  '', 0.85),
('p05_g69_y',          'g69', 'G69', 'Ada bercak mati (nekrotik) di batang dewasa dan permukaan buah',       '', 'p05_g70_y',  'p05_g70_t',  '', 0.80),
('p05_g69_t',          'g69', 'G69', 'Ada bercak mati (nekrotik) di batang dewasa (Jalur alternatif)',       '', 'p05_g70_t',  'p05_g70_tr', '', 0.80),
('p05_g70_y',          'g70', 'G70', 'Batang menunjukkan bintik-bintik pucat dan lingkaran mati (ring spot)',  '', 'p05_g71_y',  'p05_g71_t',  '', 0.85),
('p05_g70_t',          'g70', 'G70', 'Batang menunjukkan bintik-bintik pucat (Jalur alternatif)',             '', 'p05_g71_t',  'p05_g71_tr', '', 0.85),
('p05_g70_tr',         'g70', 'G70', 'Batang menunjukkan bintik-bintik pucat (Jalur alternatif 2)',           '', 'p05_g71_tr', 'p05_g71_tr', '', 0.85),
('p05_g71_y',          'g71', 'G71', 'Tunas baru tumbuh tidak normal dan bentuknya tidak beraturan',         '', 'p05_confirmed', 'p05_confirmed', '', 0.80),
('p05_g71_t',          'g71', 'G71', 'Tunas baru tumbuh tidak normal (Jalur alternatif)',                    '', 'p05_confirmed', 'p05_confirmed', '', 0.80),
('p05_g71_tr',         'g71', 'G71', 'Tunas baru tumbuh tidak normal (Jalur alternatif 2)',                  '', 'p05_confirmed', 'p05_not_found', '', 0.80),
('p05_confirmed',       'p05', 'P05', 'Hasil: Mosaik / Bercak Nekrotik terdeteksi!', '', '', '', 'p05', 0.95),
('p05_not_found',       'p05_not_found', 'P05?', 'Mosaik tidak memenuhi syarat.', '', 'p06_check', '', '', 0);

-- ------------------------------------------------------------
-- P06: PURU AKAR (G72 - G76)
-- ------------------------------------------------------------
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('p06_check',          'g72', 'G72', 'Ada benjolan atau bisul pada akar saat tanaman dicabut', '', 'p06_g73',    'penyakit_not_found', '', 0.90),
('p06_g73',            'g73', 'G73', 'Akar sedikit, pendek, dan tidak berkembang dengan baik',  '', 'p06_g74_y',  'p06_g74_t',  '', 0.85),
('p06_g74_y',          'g74', 'G74', 'Batang atau daun menguning walaupun pemeliharaannya sama', '', 'p06_g75_y',  'p06_g75_t',  '', 0.80),
('p06_g74_t',          'g74', 'G74', 'Batang atau daun menguning (Jalur alternatif)',           '', 'p06_g75_t',  'p06_g75_tr', '', 0.80),
('p06_g75_y',          'g75', 'G75', 'Tanaman tumbuh kerdil atau pertumbuhannya lambat',        '', 'p06_g76_y',  'p06_g76_t',  '', 0.85),
('p06_g75_t',          'g75', 'G75', 'Tanaman tumbuh kerdil (Jalur alternatif)',                '', 'p06_g76_t',  'p06_g76_tr', '', 0.85),
('p06_g75_tr',         'g75', 'G75', 'Tanaman tumbuh kerdil (Jalur alternatif 2)',              '', 'p06_g76_tr', 'p06_g76_tr', '', 0.85),
('p06_g76_y',          'g76', 'G76', 'Akar berwarna coklat kehitaman dan mudah busuk',          '', 'p06_confirmed', 'p06_confirmed', '', 0.85),
('p06_g76_t',          'g76', 'G76', 'Akar berwarna coklat kehitaman dan mudah busuk (Alt 1)',   '', 'p06_confirmed', 'p06_confirmed', '', 0.85),
('p06_g76_tr',         'g76', 'G76', 'Akar berwarna coklat kehitaman dan mudah busuk (Alt 2)',   '', 'p06_confirmed', 'p06_not_found', '', 0.85),
('p06_confirmed',      'p06', 'P06', 'Hasil: Puru Akar terdeteksi!', '', '', '', 'p06', 0.95),
('p06_not_found',      'p06_not_found', 'P06?', 'Puru Akar tidak memenuhi syarat.', '', 'penyakit_not_found', '', '', 0),
('penyakit_not_found', 'penyakit_not_found','PENYAKIT?', 'Penyakit tidak dapat diidentifikasi dari gejala yang diinputkan. Disarankan konsultasi langsung dengan ahli pertanian atau Dinas Pertanian setempat.', '', '', '', 'penyakit_not_found', 0);
