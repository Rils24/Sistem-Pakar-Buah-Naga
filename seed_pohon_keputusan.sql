-- ============================================================
-- SEED DATA: POHON KEPUTUSAN LENGKAP (HAMA & PENYAKIT)
-- Hama   : H01-H07 (struktur biner, isolasi cabang)
-- Penyakit: P01-P06 (revisi v2 - lebih kompleks, min 3-4 gejala)
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- Hapus data lama jika ada
DELETE FROM pohon_keputusan;

-- ============================================================
-- 1. ROOT & GROUP NODES (GERBANG UTAMA)
-- ============================================================
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('root',           'g00',      'G00',      'Ditemukan serangga/hewan secara langsung, jejak lendir/jaring, cairan lengket, atau kerusakan fisik berupa gigitan/lubang pada tanaman', 'Gejala pembeda utama hama vs penyakit', 'hama_group',  'penyakit_group', '', 1.0),
('hama_group',     'hama',     'HAMA',     'Terdeteksi adanya indikasi HAMA. Mari kita cari tahu jenis hama apa yang menyerang tanaman Anda.',                                      '', 'h01_check',   '',               '', 1.0),
('penyakit_group', 'penyakit', 'PENYAKIT', 'Terdeteksi adanya indikasi PENYAKIT (Jamur/Bakteri/Virus). Mari kita cari tahu penyakit apa yang menyerang.',                         '', 'p01_check',   '',               '', 1.0);


-- ============================================================
-- 2. CABANG HAMA
-- ============================================================

-- ------------------------------------------------------------
-- H01: KUTU PUTIH (G01-G06)
-- ------------------------------------------------------------
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h01_check',    'g01', 'G01', 'Terdapat lapisan putih seperti kapas dan jejaring menempel pada batang dan buah',         '', 'h01_g02',        'h02_check',     '', 0.9),
('h01_g02',      'g02', 'G02', 'Ditemukan individu atau kumpulan hama pada lapisan lilin atau di sekitarnya',             '', 'h01_g03_y',      'h01_g03_t',     '', 0.9),
('h01_g03_y',    'g03', 'G03', 'Lapisan putih berlilin dan lengket jika dipegang',                                        '', 'h01_g04_y',      'h01_g04_t',     '', 0.85),
('h01_g04_y',    'g04', 'G04', 'Batang atau buah tampak kusam dan kotor',                                                 '', 'h01_g05',        'h01_confirmed', '', 0.7),
('h01_g05',      'g05', 'G05', 'Muncul jamur jelaga berwarna hitam pada permukaan yang diserang',                         '', 'h01_g06',        'h01_confirmed', '', 0.8),
('h01_g06',      'g06', 'G06', 'Jika ada kutu putih sering ditemukan adanya semut',                                       '', 'h01_confirmed',  'h01_confirmed', '', 0.75),
('h01_g04_t',    'g04', 'G04', 'Batang atau buah tampak kusam dan kotor (Jalur alternatif)',                              '', 'h01_g05',        'h01_confirmed', '', 0.7),
('h01_g03_t',    'g03', 'G03', 'Lapisan putih berlilin dan lengket jika dipegang (Jalur alternatif)',                     '', 'h01_g04_t',      'h01_g04_tr',    '', 0.85),
('h01_g04_tr',   'g04', 'G04', 'Batang atau buah tampak kusam dan kotor (Jalur alternatif 2)',                            '', 'h01_g05',        'h01_confirmed', '', 0.7),
('h01_confirmed','h01', 'H01', 'Hasil: Kutu Putih terdeteksi!',                                                           '', '',               '',              'h01', 0.95);

-- ------------------------------------------------------------
-- H02: APHIDS / KUTU DAUN (G07-G11)
-- ------------------------------------------------------------
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h02_check',    'g07', 'G07', 'Ditemukan kumpulan kutu kecil berwarna hijau atau hitam pada batang, kelopak bunga, atau sisik buah', '', 'h02_g08',        'h03_check',     '', 0.9),
('h02_g08',      'g08', 'G08', 'Permukaan batang, bunga, atau buah tampak lengket akibat cairan madu (honeydew)',                     '', 'h02_g09_y',      'h02_g09_t',     '', 0.85),
('h02_g09_y',    'g09', 'G09', 'Muncul jamur jelaga hitam pada bagian yang lengket',                                                  '', 'h02_g10',        'h02_g10_t',     '', 0.8),
('h02_g10',      'g10', 'G10', 'Bunga dan bakal buah layu dan gugur jika serangan parah',                                             '', 'h02_g11',        'h02_confirmed', '', 0.75),
('h02_g11',      'g11', 'G11', 'Tunas muda dan bunga tampak berkerut dan tidak berkembang normal',                                    '', 'h02_confirmed',  'h02_confirmed', '', 0.8),
('h02_g10_t',    'g10', 'G10', 'Bunga dan bakal buah layu dan gugur jika serangan parah (Jalur alternatif)',                          '', 'h02_g11',        'h02_confirmed', '', 0.75),
('h02_g09_t',    'g09', 'G09', 'Muncul jamur jelaga hitam pada bagian yang lengket (Jalur alternatif)',                               '', 'h02_g10_t',      'h02_confirmed', '', 0.8),
('h02_confirmed','h02', 'H02', 'Hasil: Aphids (Kutu Daun) terdeteksi!',                                                               '', '',               '',              'h02', 0.95);

-- ------------------------------------------------------------
-- H03: KUTU SISIK (G12-G15)
-- ------------------------------------------------------------
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h03_check',    'g12', 'G12', 'Terlihat dompolan atau koloni hama pada sisi batang yang terlindung dari cahaya atau teduh',                          '', 'h03_g13',        'h04_check',     '', 0.9),
('h03_g13',      'g13', 'G13', 'Jika dompolan hama disingkirkan, terlihat bercak-bercak kecil dikelilingi warna kuning pada batang',                 '', 'h03_g14_y',      'h03_g14_t',     '', 0.85),
('h03_g14_y',    'g14', 'G14', 'Warna hijau batang berubah menjadi kuning, semakin parah pada cabang yang terserang',                                '', 'h03_g15',        'h03_g15_t',     '', 0.8),
('h03_g15',      'g15', 'G15', 'Pada kerusakan sangat parah, batang atau cabang menjadi busuk, lunak, dan berwarna kuning pekat hingga coklat',      '', 'h03_confirmed',  'h03_confirmed', '', 0.85),
('h03_g15_t',    'g15', 'G15', 'Pada kerusakan sangat parah, batang atau cabang menjadi busuk, lunak, dan berwarna kuning pekat hingga coklat (Jalur alternatif)', '', 'h03_confirmed', 'h03_confirmed', '', 0.85),
('h03_g14_t',    'g14', 'G14', 'Warna hijau batang berubah menjadi kuning (Jalur alternatif)',                                                       '', 'h03_g15_t',      'h03_confirmed', '', 0.8),
('h03_confirmed','h03', 'H03', 'Hasil: Kutu Sisik terdeteksi!',                                                                                       '', '',               '',              'h03', 0.95);

-- ------------------------------------------------------------
-- H04: LALAT BUAH (G16-G20)
-- ------------------------------------------------------------
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h04_check',    'g16', 'G16', 'Terdapat lubang kecil bekas tusukan pada kulit buah',                                              '', 'h04_g17',        'h05_check',     '', 0.9),
('h04_g17',      'g17', 'G17', 'Terdapat bercak basah yang melebar pada permukaan buah',                                           '', 'h04_g18_y',      'h04_g18_t',     '', 0.85),
('h04_g18_y',    'g18', 'G18', 'Ditemukan ulat atau belatung berwarna putih di dalam buah jika dibelah',                           '', 'h04_g19_y',      'h04_g19_t',     '', 0.95),
('h04_g18_t',    'g18', 'G18', 'Ditemukan ulat atau belatung berwarna putih di dalam buah (Jalur alternatif)',                     '', 'h04_g19_t',      'h04_g19_tr',    '', 0.95),
('h04_g19_y',    'g19', 'G19', 'Buah busuk dan gugur (sering dijumpai pada buah matang)',                                          '', 'h04_g20',        'h04_confirmed', '', 0.8),
('h04_g19_t',    'g19', 'G19', 'Buah busuk dan gugur (Jalur alternatif 1)',                                                        '', 'h04_g20',        'h04_confirmed', '', 0.8),
('h04_g19_tr',   'g19', 'G19', 'Buah busuk dan gugur (Jalur alternatif 2)',                                                        '', 'h04_confirmed',  'h04_confirmed', '', 0.8),
('h04_g20',      'g20', 'G20', 'Daging buah tampak kosong dan berlubang-lubang',                                                   '', 'h04_confirmed',  'h04_confirmed', '', 0.75),
('h04_confirmed','h04', 'H04', 'Hasil: Lalat Buah terdeteksi!',                                                                    '', '',               '',              'h04', 0.95);

-- ------------------------------------------------------------
-- H05: BEKICOT (G21-G26)
-- ------------------------------------------------------------
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h05_check',    'g21', 'G21', 'Terdapat bekas gigitan bergerigi di pinggir maupun tengah batang atau sulur',       '', 'h05_g22',        'h06_check',     '', 0.9),
('h05_g22',      'g22', 'G22', 'Ditemukan bekicot masih menempel atau berada di dekat tanaman yang diserang',       '', 'h05_g23_y',      'h05_g23_t',     '', 0.95),
('h05_g23_y',    'g23', 'G23', 'Ditemukan kotoran bekicot berwarna hitam di sekitar tanaman',                       '', 'h05_g24',        'h05_confirmed', '', 0.85),
('h05_g24',      'g24', 'G24', 'Terlihat jejak lendir mengkilap keperakan di sekitar batang',                       '', 'h05_g25',        'h05_confirmed', '', 0.8),
('h05_g25',      'g25', 'G25', 'Batang berlubang besar atau habis dimakan pada serangan parah',                     '', 'h05_g26',        'h05_confirmed', '', 0.85),
('h05_g26',      'g26', 'G26', 'Tunas muda rusak atau cacat',                                                       '', 'h05_confirmed',  'h05_confirmed', '', 0.75),
('h05_g23_t',    'g23', 'G23', 'Ditemukan kotoran bekicot berwarna hitam (Jalur alternatif)',                       '', 'h05_confirmed',  'h05_confirmed', '', 0.85),
('h05_confirmed','h05', 'H05', 'Hasil: Bekicot terdeteksi!',                                                        '', '',               '',              'h05', 0.95);

-- ------------------------------------------------------------
-- H06: BELALANG (G27-G31)
-- ------------------------------------------------------------
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h06_check',    'g27', 'G27', 'Batang muda atau tunas sobek dan berlubang akibat gigitan',             '', 'h06_g28',        'h07_check',     '', 0.85),
('h06_g28',      'g28', 'G28', 'Terdapat luka berwarna coklat pada permukaan batang',                   '', 'h06_g29_y',      'h06_g29_t',     '', 0.8),
('h06_g29_y',    'g29', 'G29', 'Bekas gigitan tampak mengering',                                        '', 'h06_g30',        'h06_confirmed', '', 0.75),
('h06_g29_t',    'g29', 'G29', 'Bekas gigitan tampak mengering (Jalur alternatif)',                     '', 'h06_g30_t',      'h06_confirmed', '', 0.75),
('h06_g30',      'g30', 'G30', 'Kulit batang rusak dengan pola yang tidak beraturan',                   '', 'h06_g31',        'h06_confirmed', '', 0.7),
('h06_g30_t',    'g30', 'G30', 'Kulit batang rusak dengan pola yang tidak beraturan (Jalur alternatif)','', 'h06_confirmed',  'h06_confirmed', '', 0.7),
('h06_g31',      'g31', 'G31', 'Batang muda patah atau mati pada serangan yang parah',                  '', 'h06_confirmed',  'h06_confirmed', '', 0.85),
('h06_confirmed','h06', 'H06', 'Hasil: Belalang terdeteksi!',                                           '', '',               '',              'h06', 0.95);

-- ------------------------------------------------------------
-- H07: TUNGAU (G32-G37)
-- ------------------------------------------------------------
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h07_check',      'g32',           'G32',   'Muncul bintik-bintik kecil kuning atau putih pada permukaan batang',               '', 'h07_g33',        'hama_not_found', '', 0.8),
('h07_g33',        'g33',           'G33',   'Terdapat jaring-jaring halus seperti sarang laba-laba pada batang',                '', 'h07_g34_y',      'h07_g34_t',      '', 0.85),
('h07_g34_y',      'g34',           'G34',   'Jaringan batang mengering dan berwarna kecoklatan',                                '', 'h07_g35_y',      'h07_g35_t',      '', 0.8),
('h07_g34_t',      'g34',           'G34',   'Jaringan batang mengering (Jalur alternatif)',                                     '', 'h07_g35_t',      'h07_g35_tr',     '', 0.8),
('h07_g35_y',      'g35',           'G35',   'Batang terlihat kusam dan warna hijau memudar',                                    '', 'h07_g36',        'h07_confirmed',  '', 0.75),
('h07_g35_t',      'g35',           'G35',   'Batang terlihat kusam (Jalur alternatif 1)',                                       '', 'h07_g36',        'h07_confirmed',  '', 0.75),
('h07_g35_tr',     'g35',           'G35',   'Batang terlihat kusam (Jalur alternatif 2)',                                       '', 'h07_g36',        'h07_confirmed',  '', 0.75),
('h07_g36',        'g36',           'G36',   'Tunas muda tumbuh tidak normal atau bentuknya cacat',                              '', 'h07_g37',        'h07_confirmed',  '', 0.8),
('h07_g37',        'g37',           'G37',   'Batang mengering dan mati pada serangan yang parah',                               '', 'h07_confirmed',  'h07_confirmed',  '', 0.85),
('h07_confirmed',  'h07',           'H07',   'Hasil: Tungau terdeteksi!',                                                        '', '',               '',               'h07', 0.95),
('hama_not_found', 'hama_not_found','HAMA?', 'Hama tidak dapat diidentifikasi secara pasti dari alur pohon keputusan.',          '', '',               '',               'hama_not_found', 0);


-- ============================================================
-- 3. CABANG PENYAKIT (REVISI V2 - MIN 3-4 GEJALA TERKONFIRMASI)
-- ============================================================

-- ------------------------------------------------------------
-- P01: KANKER BATANG DAN BUAH (G38-G44)
-- Penyebab: jamur Neoscytalidium dimidiatum
-- Aturan  : minimal 3 dari G38-G44 terkonfirmasi sebelum CONFIRMED
-- ------------------------------------------------------------
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES

-- Entry point P01
('p01_check',         'g38', 'G38', 'Muncul bintik putih kecil cekung, di tengah bintik ada seperti bekas tusukan jarum pada tunas, cabang muda, atau buah', '', 'p01_g39',            'p02_check',       '', 0.9),

-- G38=Ya → G39
('p01_g39',           'g39', 'G39', 'Bintik berubah warna menjadi coklat kemerahan',                                                                          '', 'p01_g40a',           'p01_g39t_g40',    '', 0.85),

-- ===== JALUR A: G38=Ya, G39=Ya =====
('p01_g40a',          'g40', 'G40', 'Bintik-bintik menyatu menjadi bercak kuning-coklat hingga hitam dengan permukaan kasar',                                 '', 'p01_a_g41',          'p01_a_g40t',      '', 0.85),
-- G40=Ya → G41
('p01_a_g41',         'g41', 'G41', 'Tunas muda mengering dan mati akibat serangan sangat parah',                                                              '', 'p01_a_g42',          'p01_a_g41t',      '', 0.80),
  -- G41=Ya → G42
  ('p01_a_g42',       'g42', 'G42', 'Pada batang tua muncul bercak 1-2 cm dengan lubang hitam di tengahnya',                                                  '', 'p01_a_g43',          'p01_a_g42t',      '', 0.85),
  ('p01_a_g43',       'g43', 'G43', 'Buah terlihat kasar dengan bercak-bercak yang sudah menyatu di permukaannya',                                             '', 'p01_confirmed',      'p01_confirmed',   '', 0.80),
  ('p01_a_g42t',      'g44', 'G44', 'Pada serangan lanjut, batang membusuk dan hancur menyisakan bagian berkayu',                                              '', 'p01_a_g43_via44',    'p01_not_found',   '', 0.85),
  ('p01_a_g43_via44', 'g43', 'G43', 'Buah terlihat kasar dengan bercak-bercak yang sudah menyatu di permukaannya (via G44)',                                   '', 'p01_confirmed',      'p01_not_found',   '', 0.80),
  -- G41=Tidak → G43 lanjut
  ('p01_a_g41t',      'g43', 'G43', 'Buah terlihat kasar dengan bercak-bercak yang sudah menyatu di permukaannya',                                             '', 'p01_a_g44_via43',    'p01_a_g42_alt',   '', 0.80),
  ('p01_a_g44_via43', 'g44', 'G44', 'Pada serangan lanjut, batang membusuk dan hancur menyisakan bagian berkayu',                                              '', 'p01_confirmed',      'p01_not_found',   '', 0.85),
  ('p01_a_g42_alt',   'g42', 'G42', 'Pada batang tua muncul bercak 1-2 cm dengan lubang hitam di tengahnya (konfirmasi)',                                      '', 'p01_a_g44_alt',      'p01_not_found',   '', 0.85),
  ('p01_a_g44_alt',   'g44', 'G44', 'Pada serangan lanjut, batang membusuk dan hancur menyisakan bagian berkayu (alt)',                                         '', 'p01_confirmed',      'p01_not_found',   '', 0.85),
-- G40=Tidak → wajib G42+G43+G44
('p01_a_g40t',        'g42', 'G42', 'Pada batang tua muncul bercak 1-2 cm dengan lubang hitam di tengahnya',                                                  '', 'p01_a_g40t_g43',     'p01_a_g40t_g44',  '', 0.85),
  ('p01_a_g40t_g43',  'g43', 'G43', 'Buah terlihat kasar dengan bercak-bercak yang sudah menyatu di permukaannya',                                             '', 'p01_confirmed',      'p01_a_g40t_g44b', '', 0.80),
  ('p01_a_g40t_g44b', 'g44', 'G44', 'Pada serangan lanjut, batang membusuk dan hancur menyisakan bagian berkayu',                                              '', 'p01_confirmed',      'p01_not_found',   '', 0.85),
  ('p01_a_g40t_g44',  'g44', 'G44', 'Pada serangan lanjut, batang membusuk dan hancur menyisakan bagian berkayu',                                              '', 'p01_a_g40t_g43b',    'p01_not_found',   '', 0.85),
  ('p01_a_g40t_g43b', 'g43', 'G43', 'Buah terlihat kasar dengan bercak-bercak yang sudah menyatu di permukaannya (konfirmasi akhir)',                           '', 'p01_confirmed',      'p01_not_found',   '', 0.80),

-- ===== JALUR B: G38=Ya, G39=Tidak =====
('p01_g39t_g40',      'g40', 'G40', 'Bintik-bintik menyatu menjadi bercak kuning-coklat hingga hitam dengan permukaan kasar',                                 '', 'p01_b_g41',          'p01_b_g40t',      '', 0.85),
-- G40=Ya → G41
('p01_b_g41',         'g41', 'G41', 'Tunas muda mengering dan mati akibat serangan sangat parah',                                                              '', 'p01_b_g43',          'p01_b_g42',       '', 0.80),
  ('p01_b_g43',       'g43', 'G43', 'Buah terlihat kasar dengan bercak-bercak yang sudah menyatu di permukaannya',                                             '', 'p01_b_g44_f',        'p01_b_g42_f',     '', 0.80),
  ('p01_b_g44_f',     'g44', 'G44', 'Pada serangan lanjut, batang membusuk dan hancur menyisakan bagian berkayu',                                              '', 'p01_confirmed',      'p01_confirmed',   '', 0.85),
  ('p01_b_g42_f',     'g42', 'G42', 'Pada batang tua muncul bercak 1-2 cm dengan lubang hitam di tengahnya',                                                  '', 'p01_confirmed',      'p01_not_found',   '', 0.85),
  ('p01_b_g42',       'g42', 'G42', 'Pada batang tua muncul bercak 1-2 cm dengan lubang hitam di tengahnya',                                                  '', 'p01_b_g44_g',        'p01_not_found',   '', 0.85),
  ('p01_b_g44_g',     'g44', 'G44', 'Pada serangan lanjut, batang membusuk dan hancur menyisakan bagian berkayu',                                              '', 'p01_confirmed',      'p01_not_found',   '', 0.85),
-- G40=Tidak → wajib G41+G42+G43+G44
('p01_b_g40t',        'g41', 'G41', 'Tunas muda mengering dan mati akibat serangan sangat parah',                                                              '', 'p01_b_g42_g43',      'p01_b_g43_last',  '', 0.80),
  ('p01_b_g42_g43',   'g42', 'G42', 'Pada batang tua muncul bercak 1-2 cm dengan lubang hitam di tengahnya',                                                  '', 'p01_b_g43_via42',    'p01_b_g43_only',  '', 0.85),
  ('p01_b_g43_via42', 'g43', 'G43', 'Buah terlihat kasar dengan bercak-bercak yang sudah menyatu di permukaannya',                                             '', 'p01_confirmed',      'p01_not_found',   '', 0.80),
  ('p01_b_g43_only',  'g43', 'G43', 'Buah terlihat kasar dengan bercak-bercak yang sudah menyatu di permukaannya',                                             '', 'p01_b_g44_only',     'p01_not_found',   '', 0.80),
  ('p01_b_g44_only',  'g44', 'G44', 'Pada serangan lanjut, batang membusuk dan hancur menyisakan bagian berkayu',                                              '', 'p01_confirmed',      'p01_not_found',   '', 0.85),
  ('p01_b_g43_last',  'g43', 'G43', 'Buah terlihat kasar dengan bercak-bercak yang sudah menyatu di permukaannya',                                             '', 'p01_b_g44_last',     'p01_not_found',   '', 0.80),
  ('p01_b_g44_last',  'g44', 'G44', 'Pada serangan lanjut, batang membusuk dan hancur menyisakan bagian berkayu',                                              '', 'p01_confirmed',      'p01_not_found',   '', 0.85),

('p01_confirmed',     'p01',           'P01',   'Hasil: Kanker Batang dan Buah terdeteksi!',                                                                   '', '',                   '',                'p01',           0.95),
('p01_not_found',     'p01_not_found', 'P01?',  'Gejala tidak cukup untuk memastikan Kanker Batang dan Buah. Lanjut ke pemeriksaan penyakit lain.',            '', 'p02_check',          '',                '',              0);


-- ------------------------------------------------------------
-- P02: ANTRAKNOSA (G45-G49)
-- Penyebab: jamur Colletotrichum gloeosporioides
-- Aturan  : minimal 3 gejala dari G45-G49 terkonfirmasi
-- ------------------------------------------------------------
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES

('p02_check',           'g45', 'G45', 'Muncul bercak coklat cekung basah pada tunas atau buah yang mulai masak',                                              '', 'p02_g46',             'p03_check',        '', 0.9),

-- G45=Ya → G46
('p02_g46',             'g46', 'G46', 'Bercak busuk berwarna coklat melebar dengan cepat terutama saat cuaca lembab',                                         '', 'p02_a_g47',           'p02_b_g47',        '', 0.85),

-- ===== JALUR A: G45=Ya, G46=Ya =====
('p02_a_g47',           'g47', 'G47', 'Permukaan bercak terasa basah dan lunak saat ditekan',                                                                 '', 'p02_a_g48',           'p02_a_g47t',       '', 0.80),
  -- G47=Ya → G48
  ('p02_a_g48',         'g48', 'G48', 'Pada bercak lanjut terlihat massa spora berwarna jingga atau merah muda',                                               '', 'p02_a_g49',           'p02_a_g48t',       '', 0.85),
  ('p02_a_g49',         'g49', 'G49', 'Buah membusuk, menjadi tidak layak konsumsi dan gugur',                                                                 '', 'p02_confirmed',       'p02_confirmed',    '', 0.80),
  ('p02_a_g48t',        'g49', 'G49', 'Buah membusuk, menjadi tidak layak konsumsi dan gugur (tanpa spora)',                                                   '', 'p02_confirmed',       'p02_not_found',    '', 0.80),
  -- G47=Tidak → G48 → G49
  ('p02_a_g47t',        'g48', 'G48', 'Pada bercak lanjut terlihat massa spora berwarna jingga atau merah muda (bercak tidak basah/lunak)',                    '', 'p02_a_g47t_g49',      'p02_a_g47t_g49b',  '', 0.85),
  ('p02_a_g47t_g49',    'g49', 'G49', 'Buah membusuk, menjadi tidak layak konsumsi dan gugur',                                                                 '', 'p02_confirmed',       'p02_not_found',    '', 0.80),
  ('p02_a_g47t_g49b',   'g49', 'G49', 'Buah membusuk, menjadi tidak layak konsumsi dan gugur (jalur minim)',                                                   '', 'p02_not_found',       'p02_not_found',    '', 0.80),

-- ===== JALUR B: G45=Ya, G46=Tidak =====
('p02_b_g47',           'g47', 'G47', 'Permukaan bercak terasa basah dan lunak saat ditekan',                                                                 '', 'p02_b_g48',           'p02_b_g47t',       '', 0.80),
  -- G47=Ya → G48 → G49
  ('p02_b_g48',         'g48', 'G48', 'Pada bercak lanjut terlihat massa spora berwarna jingga atau merah muda',                                               '', 'p02_b_g49',           'p02_b_g48t',       '', 0.85),
  ('p02_b_g49',         'g49', 'G49', 'Buah membusuk, menjadi tidak layak konsumsi dan gugur',                                                                 '', 'p02_confirmed',       'p02_not_found',    '', 0.80),
  ('p02_b_g48t',        'g49', 'G49', 'Buah membusuk, menjadi tidak layak konsumsi dan gugur (tanpa spora, jalur B)',                                          '', 'p02_not_found',       'p02_not_found',    '', 0.80),
  -- G47=Tidak → G48 → G49 wajib keduanya
  ('p02_b_g47t',        'g48', 'G48', 'Pada bercak lanjut terlihat massa spora berwarna jingga atau merah muda (bercak tidak basah)',                          '', 'p02_b_g47t_g49',      'p02_not_found',    '', 0.85),
  ('p02_b_g47t_g49',    'g49', 'G49', 'Buah membusuk, menjadi tidak layak konsumsi dan gugur',                                                                 '', 'p02_confirmed',       'p02_not_found',    '', 0.80),

('p02_confirmed',       'p02',           'P02',  'Hasil: Antraknosa terdeteksi!',                                                                              '', '',                    '',                 'p02',           0.95),
('p02_not_found',       'p02_not_found', 'P02?', 'Gejala tidak cukup untuk memastikan Antraknosa. Lanjut ke pemeriksaan penyakit lain.',                      '', 'p03_check',           '',                 '',              0);


-- ------------------------------------------------------------
-- P03: BUSUK BATANG (G50-G61)
-- Penyebab: jamur/bakteri (Erwinia, Fusarium, dsb)
-- Aturan  : minimal 3-4 gejala terkonfirmasi sebelum CONFIRMED
-- ------------------------------------------------------------
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES

('p03_check',              'g50', 'G50', 'Batang berubah warna menjadi kuning pada bagian yang terinfeksi',                                                    '', 'p03_g51',             'p04_check',        '', 0.80),
('p03_g51',                'g51', 'G51', 'Bercak coklat kekuningan meluas ke atas mengikuti arah batang',                                                      '', 'p03_a_g52',           'p03_b_g53',        '', 0.85),

-- ===== JALUR A: G51=Ya =====
('p03_a_g52',              'g52', 'G52', 'Jika batang dipotong melintang, bagian dalamnya berwarna coklat',                                                    '', 'p03_a_g53',           'p03_a_g52t',       '', 0.90),

  -- G52=Ya → G53
  ('p03_a_g53',            'g53', 'G53', 'Batang teraba lunak dan berair jika ditekan',                                                                        '', 'p03_a_g54',           'p03_a_g53t',       '', 0.85),

    -- G53=Ya → G54
    ('p03_a_g54',          'g54', 'G54', 'Muncul benang-benang jamur putih atau merah muda pada permukaan batang saat cuaca lembab',                           '', 'p03_a_g55',           'p03_a_g54t',       '', 0.80),
    -- G54=Ya → G55
    ('p03_a_g55',          'g55', 'G55', 'Batang rapuh dan mudah patah atau ambruk',                                                                           '', 'p03_confirmed',       'p03_a_g55t_a',     '', 0.85),
      ('p03_a_g55t_a',     'g56', 'G56', 'Stadium lanjut batang mengering dan berwarna coklat kehitaman',                                                      '', 'p03_a_g57',           'p03_a_g58_a',      '', 0.80),
      ('p03_a_g57',        'g57', 'G57', 'Kulit lunak hancur dan meninggalkan bagian berkayu yang keras',                                                      '', 'p03_confirmed',       'p03_not_found',    '', 0.85),
      ('p03_a_g58_a',      'g58', 'G58', 'Tercium bau busuk yang menyengat dari batang yang sakit',                                                            '', 'p03_a_g59_a',         'p03_not_found',    '', 0.90),
      ('p03_a_g59_a',      'g59', 'G59', 'Keluar cairan kental berwarna putih kecoklatan dari batang',                                                         '', 'p03_confirmed',       'p03_not_found',    '', 0.85),
    -- G54=Tidak → G58 → G59
    ('p03_a_g54t',         'g58', 'G58', 'Tercium bau busuk yang menyengat dari batang yang sakit (tanpa benang jamur)',                                       '', 'p03_a_g59_b',         'p03_a_g54t_g55',   '', 0.90),
      ('p03_a_g59_b',      'g59', 'G59', 'Keluar cairan kental berwarna putih kecoklatan dari batang',                                                         '', 'p03_confirmed',       'p03_a_g60_b',      '', 0.85),
      ('p03_a_g60_b',      'g60', 'G60', 'Kulit batang mudah terkelupas dan bagian dalamnya membusuk',                                                         '', 'p03_confirmed',       'p03_not_found',    '', 0.85),
      ('p03_a_g54t_g55',   'g55', 'G55', 'Batang rapuh dan mudah patah atau ambruk',                                                                           '', 'p03_a_g56_c',         'p03_not_found',    '', 0.85),
      ('p03_a_g56_c',      'g56', 'G56', 'Stadium lanjut batang mengering dan berwarna coklat kehitaman',                                                      '', 'p03_confirmed',       'p03_not_found',    '', 0.80),

    -- G53=Tidak → G58 → G59 → G60
    ('p03_a_g53t',         'g58', 'G58', 'Tercium bau busuk yang menyengat dari batang yang sakit (batang belum lunak)',                                       '', 'p03_a_g53t_g59',      'p03_a_g53t_g55',   '', 0.90),
      ('p03_a_g53t_g59',   'g59', 'G59', 'Keluar cairan kental berwarna putih kecoklatan dari batang',                                                         '', 'p03_a_g53t_g60',      'p03_a_g53t_g55b',  '', 0.85),
      ('p03_a_g53t_g60',   'g60', 'G60', 'Kulit batang mudah terkelupas dan bagian dalamnya membusuk',                                                         '', 'p03_confirmed',       'p03_not_found',    '', 0.85),
      ('p03_a_g53t_g55b',  'g55', 'G55', 'Batang rapuh dan mudah patah atau ambruk',                                                                           '', 'p03_a_g56_d',         'p03_not_found',    '', 0.85),
      ('p03_a_g56_d',      'g56', 'G56', 'Stadium lanjut batang mengering dan berwarna coklat kehitaman',                                                      '', 'p03_confirmed',       'p03_not_found',    '', 0.80),
      ('p03_a_g53t_g55',   'g55', 'G55', 'Batang rapuh dan mudah patah atau ambruk (jalur tanpa bau)',                                                         '', 'p03_a_g56_e',         'p03_not_found',    '', 0.85),
      ('p03_a_g56_e',      'g56', 'G56', 'Stadium lanjut batang mengering dan berwarna coklat kehitaman',                                                      '', 'p03_a_g57_e',         'p03_not_found',    '', 0.80),
      ('p03_a_g57_e',      'g57', 'G57', 'Kulit lunak hancur dan meninggalkan bagian berkayu yang keras',                                                      '', 'p03_confirmed',       'p03_not_found',    '', 0.85),

  -- G52=Tidak → G53 → G58 → G59
  ('p03_a_g52t',           'g53', 'G53', 'Batang teraba lunak dan berair jika ditekan (tanpa irisan coklat)',                                                  '', 'p03_a_g52t_g58',      'p03_a_g52t_g55b',  '', 0.85),
    ('p03_a_g52t_g58',     'g58', 'G58', 'Tercium bau busuk yang menyengat dari batang yang sakit',                                                            '', 'p03_a_g52t_g59',      'p03_a_g52t_g54',   '', 0.90),
      ('p03_a_g52t_g59',   'g59', 'G59', 'Keluar cairan kental berwarna putih kecoklatan dari batang',                                                         '', 'p03_confirmed',       'p03_a_g52t_g60',   '', 0.85),
      ('p03_a_g52t_g60',   'g60', 'G60', 'Kulit batang mudah terkelupas dan bagian dalamnya membusuk',                                                         '', 'p03_confirmed',       'p03_not_found',    '', 0.85),
      ('p03_a_g52t_g54',   'g54', 'G54', 'Muncul benang-benang jamur putih atau merah muda pada permukaan batang',                                             '', 'p03_a_g52t_g55',      'p03_not_found',    '', 0.80),
      ('p03_a_g52t_g55',   'g55', 'G55', 'Batang rapuh dan mudah patah atau ambruk',                                                                           '', 'p03_confirmed',       'p03_not_found',    '', 0.85),
    ('p03_a_g52t_g55b',    'g55', 'G55', 'Batang rapuh dan mudah patah atau ambruk (tidak berair)',                                                            '', 'p03_a_g52t_g56',      'p03_not_found',    '', 0.85),
      ('p03_a_g52t_g56',   'g56', 'G56', 'Stadium lanjut batang mengering dan berwarna coklat kehitaman',                                                      '', 'p03_a_g52t_g57',      'p03_not_found',    '', 0.80),
      ('p03_a_g52t_g57',   'g57', 'G57', 'Kulit lunak hancur dan meninggalkan bagian berkayu yang keras',                                                      '', 'p03_confirmed',       'p03_not_found',    '', 0.85),

-- ===== JALUR B: G51=Tidak =====
-- Wajib minimal 4 gejala sebelum CONFIRMED
('p03_b_g53',             'g53', 'G53', 'Batang teraba lunak dan berair jika ditekan',                                                                         '', 'p03_b_g55',           'p03_b_g53t',       '', 0.85),

  -- G53=Ya → G55
  ('p03_b_g55',            'g55', 'G55', 'Batang rapuh dan mudah patah atau ambruk',                                                                           '', 'p03_b_g58',           'p03_b_g55t',       '', 0.85),
    -- G55=Ya → G58 → G59 → G61
    ('p03_b_g58',          'g58', 'G58', 'Tercium bau busuk yang menyengat dari batang yang sakit',                                                            '', 'p03_b_g59',           'p03_b_g58t',       '', 0.90),
      ('p03_b_g59',        'g59', 'G59', 'Keluar cairan kental berwarna putih kecoklatan dari batang',                                                         '', 'p03_b_g61',           'p03_b_g59t',       '', 0.85),
      ('p03_b_g61',        'g61', 'G61', 'Batang berubah warna dari hijau menjadi kuning kecoklatan hingga hitam',                                             '', 'p03_confirmed',       'p03_b_g60',        '', 0.80),
      ('p03_b_g60',        'g60', 'G60', 'Kulit batang mudah terkelupas dan bagian dalamnya membusuk',                                                         '', 'p03_confirmed',       'p03_not_found',    '', 0.85),
      ('p03_b_g59t',       'g60', 'G60', 'Kulit batang mudah terkelupas dan bagian dalamnya membusuk',                                                         '', 'p03_b_g61_b',         'p03_b_g56',        '', 0.85),
      ('p03_b_g61_b',      'g61', 'G61', 'Batang berubah warna dari hijau menjadi kuning kecoklatan hingga hitam',                                             '', 'p03_confirmed',       'p03_not_found',    '', 0.80),
      ('p03_b_g56',        'g56', 'G56', 'Stadium lanjut batang mengering dan berwarna coklat kehitaman',                                                      '', 'p03_b_g57',           'p03_not_found',    '', 0.80),
      ('p03_b_g57',        'g57', 'G57', 'Kulit lunak hancur dan meninggalkan bagian berkayu yang keras',                                                      '', 'p03_confirmed',       'p03_not_found',    '', 0.85),
      ('p03_b_g58t',       'g56', 'G56', 'Stadium lanjut batang mengering dan berwarna coklat kehitaman (tanpa bau busuk)',                                    '', 'p03_b_g57_c',         'p03_not_found',    '', 0.80),
      ('p03_b_g57_c',      'g57', 'G57', 'Kulit lunak hancur dan meninggalkan bagian berkayu yang keras',                                                      '', 'p03_b_g61_c',         'p03_not_found',    '', 0.85),
      ('p03_b_g61_c',      'g61', 'G61', 'Batang berubah warna dari hijau menjadi kuning kecoklatan hingga hitam',                                             '', 'p03_confirmed',       'p03_not_found',    '', 0.80),
    -- G55=Tidak → G58 → G59 → G60 → G61
    ('p03_b_g55t',         'g58', 'G58', 'Tercium bau busuk yang menyengat dari batang yang sakit (belum rapuh)',                                              '', 'p03_b_g59_d',         'p03_b_g55t_g56',   '', 0.90),
      ('p03_b_g59_d',      'g59', 'G59', 'Keluar cairan kental berwarna putih kecoklatan dari batang',                                                         '', 'p03_b_g60_d',         'p03_b_g59t_d',     '', 0.85),
      ('p03_b_g60_d',      'g60', 'G60', 'Kulit batang mudah terkelupas dan bagian dalamnya membusuk',                                                         '', 'p03_b_g61_d',         'p03_not_found',    '', 0.85),
      ('p03_b_g61_d',      'g61', 'G61', 'Batang berubah warna dari hijau menjadi kuning kecoklatan hingga hitam',                                             '', 'p03_confirmed',       'p03_not_found',    '', 0.80),
      ('p03_b_g59t_d',     'g61', 'G61', 'Batang berubah warna dari hijau menjadi kuning kecoklatan hingga hitam',                                             '', 'p03_b_g56_d',         'p03_not_found',    '', 0.80),
      ('p03_b_g56_d',      'g56', 'G56', 'Stadium lanjut batang mengering dan berwarna coklat kehitaman',                                                      '', 'p03_confirmed',       'p03_not_found',    '', 0.80),
      ('p03_b_g55t_g56',   'g56', 'G56', 'Stadium lanjut batang mengering dan berwarna coklat kehitaman (belum rapuh, tidak berbau)',                          '', 'p03_b_g57_e',         'p03_not_found',    '', 0.80),
      ('p03_b_g57_e',      'g57', 'G57', 'Kulit lunak hancur dan meninggalkan bagian berkayu yang keras',                                                      '', 'p03_b_g61_e',         'p03_not_found',    '', 0.85),
      ('p03_b_g61_e',      'g61', 'G61', 'Batang berubah warna dari hijau menjadi kuning kecoklatan hingga hitam',                                             '', 'p03_confirmed',       'p03_not_found',    '', 0.80),

  -- G53=Tidak → G60 → G61 → G58 → G59
  ('p03_b_g53t',           'g60', 'G60', 'Kulit batang mudah terkelupas dan bagian dalamnya membusuk',                                                        '', 'p03_b_g53t_g61',      'p03_b_g53t_g55',   '', 0.85),
    -- G60=Ya → G61 → G58 → G59
    ('p03_b_g53t_g61',     'g61', 'G61', 'Batang berubah warna dari hijau menjadi kuning kecoklatan hingga hitam',                                            '', 'p03_b_g53t_g58',      'p03_b_g53t_g61t',  '', 0.80),
      ('p03_b_g53t_g58',   'g58', 'G58', 'Tercium bau busuk yang menyengat dari batang yang sakit',                                                           '', 'p03_b_g53t_g59',      'p03_b_g53t_g56',   '', 0.90),
      ('p03_b_g53t_g59',   'g59', 'G59', 'Keluar cairan kental berwarna putih kecoklatan dari batang',                                                        '', 'p03_confirmed',       'p03_confirmed',    '', 0.85),
      ('p03_b_g53t_g56',   'g56', 'G56', 'Stadium lanjut batang mengering dan berwarna coklat kehitaman',                                                     '', 'p03_b_g53t_g57',      'p03_not_found',    '', 0.80),
      ('p03_b_g53t_g57',   'g57', 'G57', 'Kulit lunak hancur dan meninggalkan bagian berkayu yang keras',                                                     '', 'p03_confirmed',       'p03_not_found',    '', 0.85),
      ('p03_b_g53t_g61t',  'g58', 'G58', 'Tercium bau busuk yang menyengat dari batang yang sakit (warna belum berubah)',                                     '', 'p03_b_g53t_g59b',     'p03_not_found',    '', 0.90),
      ('p03_b_g53t_g59b',  'g59', 'G59', 'Keluar cairan kental berwarna putih kecoklatan dari batang',                                                        '', 'p03_b_g53t_g55b',     'p03_not_found',    '', 0.85),
      ('p03_b_g53t_g55b',  'g55', 'G55', 'Batang rapuh dan mudah patah atau ambruk (konfirmasi akhir)',                                                        '', 'p03_confirmed',       'p03_not_found',    '', 0.85),
    -- G60=Tidak → G55 → G56 → G57 → G61
    ('p03_b_g53t_g55',     'g55', 'G55', 'Batang rapuh dan mudah patah atau ambruk (kulit tidak terkelupas)',                                                  '', 'p03_b_g53t_g56b',     'p03_not_found',    '', 0.85),
      ('p03_b_g53t_g56b',  'g56', 'G56', 'Stadium lanjut batang mengering dan berwarna coklat kehitaman',                                                     '', 'p03_b_g53t_g57b',     'p03_not_found',    '', 0.80),
      ('p03_b_g53t_g57b',  'g57', 'G57', 'Kulit lunak hancur dan meninggalkan bagian berkayu yang keras',                                                     '', 'p03_b_g53t_g61b',     'p03_not_found',    '', 0.85),
      ('p03_b_g53t_g61b',  'g61', 'G61', 'Batang berubah warna dari hijau menjadi kuning kecoklatan hingga hitam',                                            '', 'p03_confirmed',       'p03_not_found',    '', 0.80),

('p03_confirmed',          'p03',           'P03',  'Hasil: Busuk Batang terdeteksi!',                                                                         '', '',                    '',                 'p03',           0.95),
('p03_not_found',          'p03_not_found', 'P03?', 'Gejala tidak cukup untuk memastikan Busuk Batang. Lanjut ke pemeriksaan penyakit lain.',                 '', 'p04_check',           '',                 '',              0);


-- ------------------------------------------------------------
-- P04: KUDIS / SCAB (G62-G66)
-- Penyebab: jamur Sphaceloma sp.
-- Aturan  : minimal 3 gejala dari G62-G66 terkonfirmasi
-- ------------------------------------------------------------
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES

('p04_check',           'g62', 'G62', 'Muncul bercak kecil coklat muda kasar seperti koreng pada batang atau buah',                                           '', 'p04_g63',            'p05_check',        '', 0.85),

-- G62=Ya → G63
('p04_g63',             'g63', 'G63', 'Bercak membesar dengan permukaan yang kering dan keras',                                                                '', 'p04_a_g64',          'p04_b_g64',        '', 0.80),

-- ===== JALUR A: G62=Ya, G63=Ya =====
('p04_a_g64',           'g64', 'G64', 'Pinggiran bercak berwarna lebih gelap dibanding bagian tengahnya',                                                      '', 'p04_a_g65',          'p04_a_g64t',       '', 0.75),
  -- G64=Ya → G65 → G66
  ('p04_a_g65',         'g65', 'G65', 'Pada serangan berat bercak menyatu dan menutupi area yang luas',                                                        '', 'p04_a_g66',          'p04_a_g65t',       '', 0.80),
  ('p04_a_g66',         'g66', 'G66', 'Saat cuaca lembab terlihat titik-titik hitam kecil pada permukaan bercak',                                              '', 'p04_confirmed',      'p04_confirmed',    '', 0.85),
  ('p04_a_g65t',        'g66', 'G66', 'Saat cuaca lembab terlihat titik-titik hitam kecil pada permukaan bercak (bercak belum menyatu)',                       '', 'p04_confirmed',      'p04_not_found',    '', 0.85),
  -- G64=Tidak → G65 → G66
  ('p04_a_g64t',        'g65', 'G65', 'Pada serangan berat bercak menyatu dan menutupi area yang luas (pinggiran tidak lebih gelap)',                          '', 'p04_a_g64t_g66',     'p04_a_g64t_g66b',  '', 0.80),
  ('p04_a_g64t_g66',    'g66', 'G66', 'Saat cuaca lembab terlihat titik-titik hitam kecil pada permukaan bercak',                                              '', 'p04_confirmed',      'p04_not_found',    '', 0.85),
  ('p04_a_g64t_g66b',   'g66', 'G66', 'Saat cuaca lembab terlihat titik-titik hitam kecil pada permukaan bercak (hanya 3 gejala)',                             '', 'p04_not_found',      'p04_not_found',    '', 0.85),

-- ===== JALUR B: G62=Ya, G63=Tidak =====
('p04_b_g64',           'g64', 'G64', 'Pinggiran bercak berwarna lebih gelap dibanding bagian tengahnya',                                                      '', 'p04_b_g65',          'p04_b_g64t',       '', 0.75),
  -- G64=Ya → G65 → G66
  ('p04_b_g65',         'g65', 'G65', 'Pada serangan berat bercak menyatu dan menutupi area yang luas',                                                        '', 'p04_b_g66',          'p04_b_g65t',       '', 0.80),
  ('p04_b_g66',         'g66', 'G66', 'Saat cuaca lembab terlihat titik-titik hitam kecil pada permukaan bercak',                                              '', 'p04_confirmed',      'p04_not_found',    '', 0.85),
  ('p04_b_g65t',        'g66', 'G66', 'Saat cuaca lembab terlihat titik-titik hitam kecil pada permukaan bercak (bercak belum menyatu jalur B)',               '', 'p04_not_found',      'p04_not_found',    '', 0.85),
  -- G64=Tidak → G65 → G66 wajib keduanya
  ('p04_b_g64t',        'g65', 'G65', 'Pada serangan berat bercak menyatu dan menutupi area yang luas (jalur minim)',                                          '', 'p04_b_g64t_g66',     'p04_not_found',    '', 0.80),
  ('p04_b_g64t_g66',    'g66', 'G66', 'Saat cuaca lembab terlihat titik-titik hitam kecil pada permukaan bercak',                                              '', 'p04_confirmed',      'p04_not_found',    '', 0.85),

('p04_confirmed',        'p04',           'P04',  'Hasil: Kudis / Scab terdeteksi!',                                                                           '', '',                   '',                 'p04',           0.95),
('p04_not_found',        'p04_not_found', 'P04?', 'Gejala tidak cukup untuk memastikan Kudis / Scab. Lanjut ke pemeriksaan penyakit lain.',                   '', 'p05_check',          '',                 '',              0);


-- ------------------------------------------------------------
-- P05: MOSAIK / BERCAK NEKROTIK (G67-G71)
-- Penyebab: virus (Cactus Virus X / Dragon Fruit Virus)
-- Aturan  : minimal 3 gejala terkonfirmasi (threshold ketat)
-- ------------------------------------------------------------
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES

('p05_check',          'g67', 'G67', 'Muncul bercak kecil di tunas muda yang berubah warna menjadi jingga',                                                   '', 'p05_g68',            'p06_check',        '', 0.80),

-- G67=Ya → G68
('p05_g68',            'g68', 'G68', 'Batang tampak belang-belang kuning dan hijau tidak merata',                                                              '', 'p05_a_g69',          'p05_b_g69',        '', 0.85),

-- ===== JALUR A: G67=Ya, G68=Ya =====
('p05_a_g69',          'g69', 'G69', 'Ada bercak mati (nekrotik) di batang dewasa dan permukaan buah',                                                        '', 'p05_a_g70',          'p05_a_g69t',       '', 0.80),
  -- G69=Ya → G70 → G71
  ('p05_a_g70',        'g70', 'G70', 'Batang menunjukkan bintik-bintik pucat dan lingkaran mati (ring spot)',                                                  '', 'p05_a_g71',          'p05_a_g70t',       '', 0.85),
  ('p05_a_g71',        'g71', 'G71', 'Tunas baru tumbuh tidak normal dan bentuknya tidak beraturan',                                                           '', 'p05_confirmed',      'p05_confirmed',    '', 0.80),
  ('p05_a_g70t',       'g71', 'G71', 'Tunas baru tumbuh tidak normal dan bentuknya tidak beraturan (tanpa ring spot)',                                         '', 'p05_confirmed',      'p05_not_found',    '', 0.80),
  -- G69=Tidak → G70 → G71
  ('p05_a_g69t',       'g70', 'G70', 'Batang menunjukkan bintik-bintik pucat dan lingkaran mati (ring spot)',                                                  '', 'p05_a_g69t_g71',     'p05_a_g69t_g71b',  '', 0.85),
  ('p05_a_g69t_g71',   'g71', 'G71', 'Tunas baru tumbuh tidak normal dan bentuknya tidak beraturan',                                                           '', 'p05_confirmed',      'p05_not_found',    '', 0.80),
  ('p05_a_g69t_g71b',  'g71', 'G71', 'Tunas baru tumbuh tidak normal dan bentuknya tidak beraturan (hanya 3 gejala)',                                          '', 'p05_not_found',      'p05_not_found',    '', 0.80),

-- ===== JALUR B: G67=Ya, G68=Tidak =====
('p05_b_g69',          'g69', 'G69', 'Ada bercak mati (nekrotik) di batang dewasa dan permukaan buah',                                                        '', 'p05_b_g70',          'p05_b_g69t',       '', 0.80),
  -- G69=Ya → G70 → G71
  ('p05_b_g70',        'g70', 'G70', 'Batang menunjukkan bintik-bintik pucat dan lingkaran mati (ring spot)',                                                  '', 'p05_b_g71',          'p05_b_g70t',       '', 0.85),
  ('p05_b_g71',        'g71', 'G71', 'Tunas baru tumbuh tidak normal dan bentuknya tidak beraturan',                                                           '', 'p05_confirmed',      'p05_not_found',    '', 0.80),
  ('p05_b_g70t',       'g71', 'G71', 'Tunas baru tumbuh tidak normal dan bentuknya tidak beraturan (tanpa ring spot jalur B)',                                 '', 'p05_not_found',      'p05_not_found',    '', 0.80),
  -- G69=Tidak → G70 → G71 wajib keduanya
  ('p05_b_g69t',       'g70', 'G70', 'Batang menunjukkan bintik-bintik pucat dan lingkaran mati (ring spot)',                                                  '', 'p05_b_g69t_g71',     'p05_not_found',    '', 0.85),
  ('p05_b_g69t_g71',   'g71', 'G71', 'Tunas baru tumbuh tidak normal dan bentuknya tidak beraturan',                                                           '', 'p05_not_found',      'p05_not_found',    '', 0.80),

('p05_confirmed',       'p05',           'P05',  'Hasil: Mosaik / Bercak Nekrotik terdeteksi!',                                                               '', '',                   '',                 'p05',           0.95),
('p05_not_found',       'p05_not_found', 'P05?', 'Gejala tidak cukup untuk memastikan Mosaik / Bercak Nekrotik. Lanjut ke pemeriksaan penyakit lain.',        '', 'p06_check',          '',                 '',              0);


-- ------------------------------------------------------------
-- P06: PURU AKAR (G72-G76)
-- Penyebab: nematoda Meloidogyne sp.
-- Aturan  : minimal 3 gejala + G72 (gejala unik/khas) wajib ada
-- ------------------------------------------------------------
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES

('p06_check',          'g72', 'G72', 'Ada benjolan atau bisul pada akar saat tanaman dicabut',                                                                 '', 'p06_g73',            'penyakit_not_found', '', 0.90),

-- G72=Ya → G73
('p06_g73',            'g73', 'G73', 'Akar sedikit, pendek, dan tidak berkembang dengan baik',                                                                 '', 'p06_a_g74',          'p06_b_g74',          '', 0.85),

-- ===== JALUR A: G72=Ya, G73=Ya =====
('p06_a_g74',          'g74', 'G74', 'Batang atau daun menguning walaupun pemeliharaannya sama dengan batang yang lain',                                       '', 'p06_a_g75',          'p06_a_g74t',         '', 0.80),
  -- G74=Ya → G75 → G76
  ('p06_a_g75',        'g75', 'G75', 'Tanaman tumbuh kerdil atau pertumbuhannya lambat',                                                                       '', 'p06_a_g76',          'p06_a_g75t',         '', 0.85),
  ('p06_a_g76',        'g76', 'G76', 'Akar berwarna coklat kehitaman dan mudah busuk',                                                                         '', 'p06_confirmed',      'p06_confirmed',      '', 0.85),
  ('p06_a_g75t',       'g76', 'G76', 'Akar berwarna coklat kehitaman dan mudah busuk (pertumbuhan tidak kerdil)',                                               '', 'p06_confirmed',      'p06_not_found',      '', 0.85),
  -- G74=Tidak → G75 → G76
  ('p06_a_g74t',       'g75', 'G75', 'Tanaman tumbuh kerdil atau pertumbuhannya lambat (tidak menguning)',                                                     '', 'p06_a_g74t_g76',     'p06_a_g74t_g76b',    '', 0.85),
  ('p06_a_g74t_g76',   'g76', 'G76', 'Akar berwarna coklat kehitaman dan mudah busuk',                                                                         '', 'p06_confirmed',      'p06_not_found',      '', 0.85),
  ('p06_a_g74t_g76b',  'g76', 'G76', 'Akar berwarna coklat kehitaman dan mudah busuk (G72+G73+G76)',                                                           '', 'p06_not_found',      'p06_not_found',      '', 0.85),

-- ===== JALUR B: G72=Ya, G73=Tidak =====
('p06_b_g74',          'g74', 'G74', 'Batang atau daun menguning walaupun pemeliharaannya sama dengan batang yang lain',                                       '', 'p06_b_g75',          'p06_b_g74t',         '', 0.80),
  -- G74=Ya → G75 → G76
  ('p06_b_g75',        'g75', 'G75', 'Tanaman tumbuh kerdil atau pertumbuhannya lambat',                                                                       '', 'p06_b_g76',          'p06_b_g75t',         '', 0.85),
  ('p06_b_g76',        'g76', 'G76', 'Akar berwarna coklat kehitaman dan mudah busuk',                                                                         '', 'p06_confirmed',      'p06_not_found',      '', 0.85),
  ('p06_b_g75t',       'g76', 'G76', 'Akar berwarna coklat kehitaman dan mudah busuk (G72+G74+G76)',                                                           '', 'p06_not_found',      'p06_not_found',      '', 0.85),
  -- G74=Tidak → G75 → G76 wajib keduanya
  ('p06_b_g74t',       'g75', 'G75', 'Tanaman tumbuh kerdil atau pertumbuhannya lambat (akar normal, tidak menguning)',                                        '', 'p06_b_g74t_g76',     'p06_not_found',      '', 0.85),
  ('p06_b_g74t_g76',   'g76', 'G76', 'Akar berwarna coklat kehitaman dan mudah busuk',                                                                         '', 'p06_confirmed',      'p06_not_found',      '', 0.85),

('p06_confirmed',      'p06',              'P06',       'Hasil: Puru Akar terdeteksi!',                                                                        '', '',                   '',                   'p06',              0.95),
('p06_not_found',      'p06_not_found',    'P06?',      'Gejala tidak cukup untuk memastikan Puru Akar. Diagnosa penyakit tidak dapat ditentukan.',            '', 'penyakit_not_found', '',                   '',                 0),
('penyakit_not_found', 'penyakit_not_found','PENYAKIT?', 'Penyakit tidak dapat diidentifikasi dari gejala yang diinputkan. Disarankan konsultasi langsung dengan ahli pertanian atau Dinas Pertanian setempat.', '', '', '', 'penyakit_not_found', 0);