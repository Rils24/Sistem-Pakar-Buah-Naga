-- ============================================================
-- SEED DATA UPDATE: POHON KEPUTUSAN HAMA (H01 - H07) LATTICE BINARY TREE
-- Struktur kisi simetris:
-- - 'YA'  : Panah lurus ke bawah (Vertikal)
-- - 'TIDAK': Panah diagonal ke kanan
-- Tanpa ada garis bersilangan atau label bertumpuk!
-- ============================================================

-- 1. Hapus node Hama lama agar data bersih dan rapi
DELETE FROM pohon_keputusan 
WHERE id LIKE 'h0%' OR id = 'hama_not_found';

-- 2. Pastikan node root dan hama_group terhubung dengan benar
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar)
VALUES 
('root',       'g00',  'G00',  'Ditemukan serangga/hewan secara langsung, jejak lendir/jaring, cairan lengket, atau kerusakan fisik berupa gigitan/lubang pada tanaman', 'Gejala pembeda utama hama vs penyakit', 'hama_group', 'penyakit_group', '', 1.0),
('hama_group', 'hama', 'HAMA', 'Terdeteksi adanya indikasi HAMA. Mari kita cari tahu jenis hama apa yang menyerang tanaman Anda.', '', 'h01_check', '', '', 1.0)
ON CONFLICT (id) DO UPDATE SET 
  ya = EXCLUDED.ya,
  tidak = EXCLUDED.tidak;

-- ============================================================
-- ALUR POHON KEPUTUSAN HAMA (KISI SIMETRIS TANPA OVERLAP)
-- ============================================================

-- ------------------------------------------------------------
-- H01: KUTU PUTIH (G01-G06)
-- ------------------------------------------------------------
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h01_check',    'g01', 'G01', 'Terdapat lapisan putih seperti kapas dan jejaring menempel pada batang dan buah', '', 'h01_g02',    'h02_check', '', 0.9),
('h01_g02',      'g02', 'G02', 'Ditemukan individu atau kumpulan hama pada lapisan lilin atau di sekitarnya',     '', 'h01_g03_y',  'h01_g03_t', '', 0.9),
('h01_g03_y',    'g03', 'G03', 'Lapisan putih berlilin dan lengket jika dipegang',                                '', 'h01_g04_y',  'h01_g04_t', '', 0.85),
('h01_g03_t',    'g03', 'G03', 'Lapisan putih berlilin dan lengket jika dipegang (Jalur alternatif)',             '', 'h01_g04_t',  'h01_g04_tr', '', 0.85),
('h01_g04_y',    'g04', 'G04', 'Batang atau buah tampak kusam dan kotor',                                         '', 'h01_g05_y',  'h01_g05_t', '', 0.7),
('h01_g04_t',    'g04', 'G04', 'Batang atau buah tampak kusam dan kotor (Jalur alternatif)',                      '', 'h01_g05_t',  'h01_g05_tr', '', 0.7),
('h01_g04_tr',   'g04', 'G04', 'Batang atau buah tampak kusam dan kotor (Jalur alternatif 2)',                    '', 'h01_g05_tr', 'h01_g05_tr', '', 0.7),
('h01_g05_y',    'g05', 'G05', 'Muncul jamur jelaga berwarna hitam pada permukaan yang diserang',                 '', 'h01_g06_y',  'h01_g06_t', '', 0.8),
('h01_g05_t',    'g05', 'G05', 'Muncul jamur jelaga berwarna hitam pada permukaan yang diserang (Jalur alt)',     '', 'h01_g06_t',  'h01_g06_tr', '', 0.8),
('h01_g05_tr',   'g05', 'G05', 'Muncul jamur jelaga berwarna hitam pada permukaan yang diserang (Jalur minim)',   '', 'h01_g06_tr', 'h01_g06_tr', '', 0.8),
('h01_g06_y',    'g06', 'G06', 'Jika ada kutu putih sering ditemukan adanya semut',                               '', 'h01_confirmed', 'h01_confirmed', '', 0.75),
('h01_g06_t',    'g06', 'G06', 'Jika ada kutu putih sering ditemukan adanya semut (Jalur alternatif)',            '', 'h01_confirmed', 'h01_confirmed', '', 0.75),
('h01_g06_tr',   'g06', 'G06', 'Jika ada kutu putih sering ditemukan adanya semut (Jalur minim)',                 '', 'h01_confirmed', 'h01_confirmed', '', 0.75),
('h01_confirmed','h01', 'H01', 'Hasil: Kutu Putih terdeteksi!',                                                   '', '', '', 'h01', 0.95);

-- ------------------------------------------------------------
-- H02: APHIDS / KUTU DAUN (G07-G11)
-- ------------------------------------------------------------
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h02_check',    'g07', 'G07', 'Ditemukan kumpulan kutu kecil berwarna hijau atau hitam pada batang, kelopak bunga, atau sisik buah', '', 'h02_g08',    'h03_check', '', 0.9),
('h02_g08',      'g08', 'G08', 'Permukaan batang, bunga, atau buah tampak lengket akibat cairan madu (honeydew)',                     '', 'h02_g09_y',  'h02_g09_t', '', 0.85),
('h02_g09_y',    'g09', 'G09', 'Muncul jamur jelaga hitam pada bagian yang lengket',                                                  '', 'h02_g10_y',  'h02_g10_t', '', 0.8),
('h02_g09_t',    'g09', 'G09', 'Muncul jamur jelaga hitam pada bagian yang lengket (Jalur alternatif)',                               '', 'h02_g10_t',  'h02_g10_tr', '', 0.8),
('h02_g10_y',    'g10', 'G10', 'Bunga dan bakal buah layu dan gugur jika serangan parah',                                             '', 'h02_g11_y',  'h02_g11_t', '', 0.75),
('h02_g10_t',    'g10', 'G10', 'Bunga dan bakal buah layu dan gugur jika serangan parah (Jalur alternatif)',                          '', 'h02_g11_t',  'h02_g11_tr', '', 0.75),
('h02_g10_tr',   'g10', 'G10', 'Bunga dan bakal buah layu dan gugur jika serangan parah (Jalur minim)',                               '', 'h02_g11_tr', 'h02_g11_tr', '', 0.75),
('h02_g11_y',    'g11', 'G11', 'Tunas muda dan bunga tampak berkerut dan tidak berkembang normal',                                    '', 'h02_confirmed', 'h02_confirmed', '', 0.8),
('h02_g11_t',    'g11', 'G11', 'Tunas muda dan bunga tampak berkerut dan tidak berkembang normal (Jalur alt)',                        '', 'h02_confirmed', 'h02_confirmed', '', 0.8),
('h02_g11_tr',   'g11', 'G11', 'Tunas muda dan bunga tampak berkerut dan tidak berkembang normal (Jalur minim)',                      '', 'h02_confirmed', 'h02_confirmed', '', 0.8),
('h02_confirmed','h02', 'H02', 'Hasil: Aphids (Kutu Daun) terdeteksi!',                                                               '', '', '', 'h02', 0.95);

-- ------------------------------------------------------------
-- H03: KUTU SISIK (G12-G15)
-- ------------------------------------------------------------
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h03_check',    'g12', 'G12', 'Terlihat dompolan atau koloni hama pada sisi batang yang terlindung dari cahaya atau teduh',                  '', 'h03_g13',    'h04_check', '', 0.9),
('h03_g13',      'g13', 'G13', 'Jika dompolan hama disingkirkan, terlihat bercak-bercak kecil dikelilingi warna kuning pada batang',         '', 'h03_g14_y',  'h03_g14_t', '', 0.85),
('h03_g14_y',    'g14', 'G14', 'Warna hijau batang berubah menjadi kuning, semakin parah pada cabang yang terserang',                        '', 'h03_g15_y',  'h03_g15_t', '', 0.8),
('h03_g14_t',    'g14', 'G14', 'Warna hijau batang berubah menjadi kuning (Jalur alternatif)',                                               '', 'h03_g15_t',  'h03_g15_tr', '', 0.8),
('h03_g15_y',    'g15', 'G15', 'Pada kerusakan sangat parah, batang atau cabang menjadi busuk, lunak, dan berwarna kuning pekat hingga coklat', '', 'h03_confirmed', 'h03_confirmed', '', 0.85),
('h03_g15_t',    'g15', 'G15', 'Pada kerusakan sangat parah, batang atau cabang menjadi busuk (Jalur alternatif)',                           '', 'h03_confirmed', 'h03_confirmed', '', 0.85),
('h03_g15_tr',   'g15', 'G15', 'Pada kerusakan sangat parah, batang atau cabang menjadi busuk (Jalur minim)',                                '', 'h03_confirmed', 'h03_confirmed', '', 0.85),
('h03_confirmed','h03', 'H03', 'Hasil: Kutu Sisik terdeteksi!',                                                                               '', '', '', 'h03', 0.95);

-- ------------------------------------------------------------
-- H04: LALAT BUAH (G16-G20)
-- ------------------------------------------------------------
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h04_check',    'g16', 'G16', 'Terdapat lubang kecil bekas tusukan pada kulit buah',                      '', 'h04_g17',    'h05_check', '', 0.9),
('h04_g17',      'g17', 'G17', 'Terdapat bercak basah yang melebar pada permukaan buah',                   '', 'h04_g18_y',  'h04_g18_t', '', 0.85),
('h04_g18_y',    'g18', 'G18', 'Ditemukan ulat atau belatung berwarna putih di dalam buah jika dibelah',   '', 'h04_g19_y',  'h04_g19_t', '', 0.95),
('h04_g18_t',    'g18', 'G18', 'Ditemukan ulat atau belatung berwarna putih di dalam buah (Jalur alt)',     '', 'h04_g19_t',  'h04_g19_tr', '', 0.95),
('h04_g19_y',    'g19', 'G19', 'Buah busuk dan gugur (sering dijumpai pada buah matang)',                  '', 'h04_g20_y',  'h04_g20_t', '', 0.8),
('h04_g19_t',    'g19', 'G19', 'Buah busuk dan gugur (Jalur alternatif)',                                  '', 'h04_g20_t',  'h04_g20_tr', '', 0.8),
('h04_g19_tr',   'g19', 'G19', 'Buah busuk dan gugur (Jalur minim)',                                       '', 'h04_g20_tr', 'h04_g20_tr', '', 0.8),
('h04_g20_y',    'g20', 'G20', 'Daging buah tampak kosong dan berlubang-lubang',                           '', 'h04_confirmed', 'h04_confirmed', '', 0.75),
('h04_g20_t',    'g20', 'G20', 'Daging buah tampak kosong dan berlubang-lubang (Jalur alternatif)',        '', 'h04_confirmed', 'h04_confirmed', '', 0.75),
('h04_g20_tr',   'g20', 'G20', 'Daging buah tampak kosong dan berlubang-lubang (Jalur minim)',             '', 'h04_confirmed', 'h04_confirmed', '', 0.75),
('h04_confirmed','h04', 'H04', 'Hasil: Lalat Buah terdeteksi!',                                            '', '', '', 'h04', 0.95);

-- ------------------------------------------------------------
-- H05: BEKICOT (G21-G26)
-- ------------------------------------------------------------
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h05_check',    'g21', 'G21', 'Terdapat bekas gigitan bergerigi di pinggir maupun tengah batang atau sulur', '', 'h05_g22',    'h06_check', '', 0.9),
('h05_g22',      'g22', 'G22', 'Ditemukan bekicot masih menempel atau berada di dekat tanaman yang diserang', '', 'h05_g23_y',  'h05_g23_t', '', 0.95),
('h05_g23_y',    'g23', 'G23', 'Ditemukan kotoran bekicot berwarna hitam di sekitar tanaman',                 '', 'h05_g24_y',  'h05_g24_t', '', 0.85),
('h05_g23_t',    'g23', 'G23', 'Ditemukan kotoran bekicot berwarna hitam (Jalur alternatif)',                 '', 'h05_g24_t',  'h05_g24_tr', '', 0.85),
('h05_g24_y',    'g24', 'G24', 'Terlihat jejak lendir mengkilap keperakan di sekitar batang',                 '', 'h05_g25_y',  'h05_g25_t', '', 0.8),
('h05_g24_t',    'g24', 'G24', 'Terlihat jejak lendir mengkilap keperakan (Jalur alternatif)',                '', 'h05_g25_t',  'h05_g25_tr', '', 0.8),
('h05_g24_tr',   'g24', 'G24', 'Terlihat jejak lendir mengkilap keperakan (Jalur minim)',                     '', 'h05_g25_tr', 'h05_g25_tr', '', 0.8),
('h05_g25_y',    'g25', 'G25', 'Batang berlubang besar atau habis dimakan pada serangan parah',               '', 'h05_g26_y',  'h05_g26_t', '', 0.85),
('h05_g25_t',    'g25', 'G25', 'Batang berlubang besar atau habis dimakan (Jalur alternatif)',                '', 'h05_g26_t',  'h05_g26_tr', '', 0.85),
('h05_g25_tr',   'g25', 'G25', 'Batang berlubang besar atau habis dimakan (Jalur minim)',                     '', 'h05_g26_tr', 'h05_g26_tr', '', 0.85),
('h05_g26_y',    'g26', 'G26', 'Tunas muda rusak atau cacat',                                                 '', 'h05_confirmed', 'h05_confirmed', '', 0.75),
('h05_g26_t',    'g26', 'G26', 'Tunas muda rusak atau cacat (Jalur alternatif)',                              '', 'h05_confirmed', 'h05_confirmed', '', 0.75),
('h05_g26_tr',   'g26', 'G26', 'Tunas muda rusak atau cacat (Jalur minim)',                                   '', 'h05_confirmed', 'h05_confirmed', '', 0.75),
('h05_confirmed','h05', 'H05', 'Hasil: Bekicot terdeteksi!',                                                  '', '', '', 'h05', 0.95);

-- ------------------------------------------------------------
-- H06: BELALANG (G27-G31)
-- ------------------------------------------------------------
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h06_check',    'g27', 'G27', 'Batang muda atau tunas sobek dan berlubang akibat gigitan',             '', 'h06_g28',    'h07_check', '', 0.85),
('h06_g28',      'g28', 'G28', 'Terdapat luka berwarna coklat pada permukaan batang',                   '', 'h06_g29_y',  'h06_g29_t', '', 0.8),
('h06_g29_y',    'g29', 'G29', 'Bekas gigitan tampak mengering',                                        '', 'h06_g30_y',  'h06_g30_t', '', 0.75),
('h06_g29_t',    'g29', 'G29', 'Bekas gigitan tampak mengering (Jalur alternatif)',                     '', 'h06_g30_t',  'h06_g30_tr', '', 0.75),
('h06_g30_y',    'g30', 'G30', 'Kulit batang rusak dengan pola yang tidak beraturan',                   '', 'h06_g31_y',  'h06_g31_t', '', 0.7),
('h06_g30_t',    'g30', 'G30', 'Kulit batang rusak dengan pola yang tidak beraturan (Jalur alt)',       '', 'h06_g31_t',  'h06_g31_tr', '', 0.7),
('h06_g30_tr',   'g30', 'G30', 'Kulit batang rusak dengan pola yang tidak beraturan (Jalur minim)',     '', 'h06_g31_tr', 'h06_g31_tr', '', 0.7),
('h06_g31_y',    'g31', 'G31', 'Batang muda patah atau mati pada serangan yang parah',                  '', 'h06_confirmed', 'h06_confirmed', '', 0.85),
('h06_g31_t',    'g31', 'G31', 'Batang muda patah atau mati pada serangan yang parah (Jalur alt)',      '', 'h06_confirmed', 'h06_confirmed', '', 0.85),
('h06_g31_tr',   'g31', 'G31', 'Batang muda patah atau mati pada serangan yang parah (Jalur minim)',    '', 'h06_confirmed', 'h06_confirmed', '', 0.85),
('h06_confirmed','h06', 'H06', 'Hasil: Belalang terdeteksi!',                                           '', '', '', 'h06', 0.95);

-- ------------------------------------------------------------
-- H07: TUNGAU (G32-G37)
-- ------------------------------------------------------------
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h07_check',    'g32', 'G32', 'Muncul bintik-bintik kecil kuning atau putih pada permukaan batang',    '', 'h07_g33',    'hama_not_found', '', 0.8),
('h07_g33',      'g33', 'G33', 'Terdapat jaring-jaring halus seperti sarang laba-laba pada batang',     '', 'h07_g34_y',  'h07_g34_t', '', 0.85),
('h07_g34_y',    'g34', 'G34', 'Jaringan batang mengering dan berwarna kecoklatan',                     '', 'h07_g35_y',  'h07_g35_t', '', 0.8),
('h07_g34_t',    'g34', 'G34', 'Jaringan batang mengering dan berwarna kecoklatan (Jalur alt)',         '', 'h07_g35_t',  'h07_g35_tr', '', 0.8),
('h07_g35_y',    'g35', 'G35', 'Batang terlihat kusam dan warna hijau memudar',                         '', 'h07_g36_y',  'h07_g36_t', '', 0.75),
('h07_g35_t',    'g35', 'G35', 'Batang terlihat kusam dan warna hijau memudar (Jalur alt)',             '', 'h07_g36_t',  'h07_g36_tr', '', 0.75),
('h07_g35_tr',   'g35', 'G35', 'Batang terlihat kusam dan warna hijau memudar (Jalur minim)',           '', 'h07_g36_tr', 'h07_g36_tr', '', 0.75),
('h07_g36_y',    'g36', 'G36', 'Tunas muda tumbuh tidak normal atau bentuknya cacat',                   '', 'h07_g37_y',  'h07_g37_t', '', 0.8),
('h07_g36_t',    'g36', 'G36', 'Tunas muda tumbuh tidak normal atau bentuknya cacat (Jalur alt)',       '', 'h07_g37_t',  'h07_g37_tr', '', 0.8),
('h07_g36_tr',   'g36', 'G36', 'Tunas muda tumbuh tidak normal atau bentuknya cacat (Jalur minim)',     '', 'h07_g37_tr', 'h07_g37_tr', '', 0.8),
('h07_g37_y',    'g37', 'G37', 'Batang mengering dan mati pada serangan yang parah',                    '', 'h07_confirmed', 'h07_confirmed', '', 0.85),
('h07_g37_t',    'g37', 'G37', 'Batang mengering dan mati pada serangan yang parah (Jalur alt)',        '', 'h07_confirmed', 'h07_confirmed', '', 0.85),
('h07_g37_tr',   'g37', 'G37', 'Batang mengering dan mati pada serangan yang parah (Jalur minim)',      '', 'h07_confirmed', 'h07_confirmed', '', 0.85),
('h07_confirmed','h07', 'H07', 'Hasil: Tungau terdeteksi!',                                             '', '', '', 'h07', 0.95),
('hama_not_found','hama_not_found', 'HAMA?', 'Hama tidak dapat diidentifikasi secara pasti dari alur pohon keputusan.', '', '', '', 'hama_not_found', 0);
