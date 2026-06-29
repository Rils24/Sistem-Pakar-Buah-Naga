-- ============================================================
-- SEED DATA: POHON KEPUTUSAN (LENGKAP HAMA & PENYAKIT)
-- DENGAN STRUKTUR POHON BINER DAN ISOLASI CABANG (OPSI C)
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- Hapus data lama jika ada
DELETE FROM pohon_keputusan;

-- ============================================================
-- 1. ROOT & GROUP NODES (GERBANG UTAMA)
-- ============================================================
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('root', 'g00', 'G00', 'Ditemukan serangga/hewan secara langsung, jejak lendir/jaring, cairan lengket, atau kerusakan fisik berupa gigitan/lubang pada tanaman', 'Gejala pembeda utama hama vs penyakit', 'hama_group', 'penyakit_group', '', 1.0),
('hama_group', 'hama', 'HAMA', 'Terdeteksi adanya indikasi HAMA. Mari kita cari tahu jenis hama apa yang menyerang tanaman Anda.', '', 'h01_check', '', '', 1.0),
('penyakit_group', 'penyakit', 'PENYAKIT', 'Terdeteksi adanya indikasi PENYAKIT (Jamur/Bakteri/Virus). Mari kita cari tahu penyakit apa yang menyerang.', '', 'p01_check', '', '', 1.0);

-- ============================================================
-- 2. CABANG HAMA (H01 - H07) SESUAI DIAGRAM
-- ============================================================

-- H01: KUTU PUTIH
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h01_check', 'g01', 'G01', 'Terdapat lapisan putih seperti kapas dan jejaring menempel pada batang dan buah', '', 'h01_g02', 'h02_check', '', 0.9),
('h01_g02', 'g02', 'G02', 'Ditemukan individu atau kumpulan hama pada lapisan lilin atau di sekitarnya', '', 'h01_g03_y', 'h01_g03_t', '', 0.9),
('h01_g03_y', 'g03', 'G03', 'Lapisan putih berlilin dan lengket jika dipegang', '', 'h01_g04_y', 'h01_g04_t', '', 0.85),
('h01_g04_y', 'g04', 'G04', 'Batang atau buah tampak kusam dan kotor', '', 'h01_g05', 'h01_confirmed', '', 0.7),
('h01_g05', 'g05', 'G05', 'Muncul jamur jelaga berwarna hitam pada permukaan yang diserang', '', 'h01_g06', 'h01_confirmed', '', 0.8),
('h01_g06', 'g06', 'G06', 'Jika ada kutu putih sering ditemukan adanya semut', '', 'h01_confirmed', 'h01_confirmed', '', 0.75),
('h01_g04_t', 'g04', 'G04', 'Batang atau buah tampak kusam dan kotor (Jalur alternatif)', '', 'h01_g05', 'h01_confirmed', '', 0.7),
('h01_g03_t', 'g03', 'G03', 'Lapisan putih berlilin dan lengket jika dipegang (Jalur alternatif)', '', 'h01_g04_t', 'h01_g04_tr', '', 0.85),
('h01_g04_tr', 'g04', 'G04', 'Batang atau buah tampak kusam dan kotor (Jalur alternatif 2)', '', 'h01_g05', 'h01_confirmed', '', 0.7),
('h01_confirmed', 'h01', 'H01', 'Hasil: Kutu Putih terdeteksi!', '', '', '', 'h01', 0.95);

-- H02: APHIDS
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h02_check', 'g07', 'G07', 'Ditemukan kumpulan kutu kecil berwarna hijau atau hitam pada batang, kelopak bunga, atau sisik buah', '', 'h02_g08', 'h03_check', '', 0.9),
('h02_g08', 'g08', 'G08', 'Permukaan batang, bunga, atau buah tampak lengket akibat cairan madu (honeydew)', '', 'h02_g09_y', 'h02_g09_t', '', 0.85),
('h02_g09_y', 'g09', 'G09', 'Muncul jamur jelaga hitam pada bagian yang lengket', '', 'h02_g10', 'h02_g10_t', '', 0.8),
('h02_g10', 'g10', 'G10', 'Bunga dan bakal buah layu dan gugur jika serangan parah', '', 'h02_g11', 'h02_confirmed', '', 0.75),
('h02_g11', 'g11', 'G11', 'Tunas muda dan bunga tampak berkerut dan tidak berkembang normal', '', 'h02_confirmed', 'h02_confirmed', '', 0.8),
('h02_g10_t', 'g10', 'G10', 'Bunga dan bakal buah layu dan gugur jika serangan parah (Jalur alternatif)', '', 'h02_g11', 'h02_confirmed', '', 0.75),
('h02_g09_t', 'g09', 'G09', 'Muncul jamur jelaga hitam pada bagian yang lengket (Jalur alternatif)', '', 'h02_g10_t', 'h02_confirmed', '', 0.8),
('h02_confirmed', 'h02', 'H02', 'Hasil: Aphids (Kutu Daun) terdeteksi!', '', '', '', 'h02', 0.95);

-- H03: KUTU SISIK
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h03_check', 'g12', 'G12', 'Terlihat dompolan atau koloni hama pada sisi batang yang terlindung dari cahaya atau teduh', '', 'h03_g13', 'h04_check', '', 0.9),
('h03_g13', 'g13', 'G13', 'Jika dompolan hama disingkirkan, terlihat bercak-bercak kecil dikelilingi warna kuning pada batang', '', 'h03_g14_y', 'h03_g14_t', '', 0.85),
('h03_g14_y', 'g14', 'G14', 'Warna hijau batang berubah menjadi kuning, semakin parah pada cabang yang terserang', '', 'h03_g15', 'h03_g15_t', '', 0.8),
('h03_g15', 'g15', 'G15', 'Pada kerusakan sangat parah, batang atau cabang menjadi busuk, lunak, dan berwarna kuning pekat hingga coklat', '', 'h03_confirmed', 'h03_confirmed', '', 0.85),
('h03_g15_t', 'g15', 'G15', 'Pada kerusakan sangat parah, batang atau cabang menjadi busuk, lunak, dan berwarna kuning pekat hingga coklat (Jalur alternatif)', '', 'h03_confirmed', 'h03_confirmed', '', 0.85),
('h03_g14_t', 'g14', 'G14', 'Warna hijau batang berubah menjadi kuning (Jalur alternatif)', '', 'h03_g15_t', 'h03_confirmed', '', 0.8),
('h03_confirmed', 'h03', 'H03', 'Hasil: Kutu Sisik terdeteksi!', '', '', '', 'h03', 0.95);

-- H04: LALAT BUAH
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h04_check', 'g16', 'G16', 'Terdapat lubang kecil bekas tusukan pada kulit buah', '', 'h04_g17', 'h05_check', '', 0.9),
('h04_g17', 'g17', 'G17', 'Terdapat bercak basah yang melebar pada permukaan buah', '', 'h04_g18_y', 'h04_g18_t', '', 0.85),
('h04_g18_y', 'g18', 'G18', 'Ditemukan ulat atau belatung berwarna putih di dalam buah jika dibelah', '', 'h04_g19_y', 'h04_g19_t', '', 0.95),
('h04_g18_t', 'g18', 'G18', 'Ditemukan ulat atau belatung berwarna putih di dalam buah (Jalur alternatif)', '', 'h04_g19_t', 'h04_g19_tr', '', 0.95),
('h04_g19_y', 'g19', 'G19', 'Buah busuk dan gugur (sering dijumpai pada buah matang)', '', 'h04_g20', 'h04_confirmed', '', 0.8),
('h04_g19_t', 'g19', 'G19', 'Buah busuk dan gugur (Jalur alternatif 1)', '', 'h04_g20', 'h04_confirmed', '', 0.8),
('h04_g19_tr', 'g19', 'G19', 'Buah busuk dan gugur (Jalur alternatif 2)', '', 'h04_confirmed', 'h04_confirmed', '', 0.8),
('h04_g20', 'g20', 'G20', 'Daging buah tampak kosong dan berlubang-lubang', '', 'h04_confirmed', 'h04_confirmed', '', 0.75),
('h04_confirmed', 'h04', 'H04', 'Hasil: Lalat Buah terdeteksi!', '', '', '', 'h04', 0.95);

-- H05: BEKICOT
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h05_check', 'g21', 'G21', 'Terdapat bekas gigitan bergerigi di pinggir maupun tengah batang atau sulur', '', 'h05_g22', 'h06_check', '', 0.9),
('h05_g22', 'g22', 'G22', 'Ditemukan bekicot masih menempel atau berada di dekat tanaman yang diserang', '', 'h05_g23_y', 'h05_g23_t', '', 0.95),
('h05_g23_y', 'g23', 'G23', 'Ditemukan kotoran bekicot berwarna hitam di sekitar tanaman', '', 'h05_g24', 'h05_confirmed', '', 0.85),
('h05_g24', 'g24', 'G24', 'Terlihat jejak lendir mengkilap keperakan di sekitar batang', '', 'h05_g25', 'h05_confirmed', '', 0.8),
('h05_g25', 'g25', 'G25', 'Batang berlubang besar atau habis dimakan pada serangan parah', '', 'h05_g26', 'h05_confirmed', '', 0.85),
('h05_g26', 'g26', 'G26', 'Tunas muda rusak atau cacat', '', 'h05_confirmed', 'h05_confirmed', '', 0.75),
('h05_g23_t', 'g23', 'G23', 'Ditemukan kotoran bekicot berwarna hitam (Jalur alternatif)', '', 'h05_confirmed', 'h05_confirmed', '', 0.85),
('h05_confirmed', 'h05', 'H05', 'Hasil: Bekicot terdeteksi!', '', '', '', 'h05', 0.95);

-- H06: BELALANG
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h06_check', 'g27', 'G27', 'Batang muda atau tunas sobek dan berlubang akibat gigitan', '', 'h06_g28', 'h07_check', '', 0.85),
('h06_g28', 'g28', 'G28', 'Terdapat luka berwarna coklat pada permukaan batang', '', 'h06_g29_y', 'h06_g29_t', '', 0.8),
('h06_g29_y', 'g29', 'G29', 'Bekas gigitan tampak mengering', '', 'h06_g30', 'h06_confirmed', '', 0.75),
('h06_g29_t', 'g29', 'G29', 'Bekas gigitan tampak mengering (Jalur alternatif)', '', 'h06_g30_t', 'h06_confirmed', '', 0.75),
('h06_g30', 'g30', 'G30', 'Kulit batang rusak dengan pola yang tidak beraturan', '', 'h06_g31', 'h06_confirmed', '', 0.7),
('h06_g30_t', 'g30', 'G30', 'Kulit batang rusak dengan pola yang tidak beraturan (Jalur alternatif)', '', 'h06_confirmed', 'h06_confirmed', '', 0.7),
('h06_g31', 'g31', 'G31', 'Batang muda patah atau mati pada serangan yang parah', '', 'h06_confirmed', 'h06_confirmed', '', 0.85),
('h06_confirmed', 'h06', 'H06', 'Hasil: Belalang terdeteksi!', '', '', '', 'h06', 0.95);

-- H07: TUNGAU
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h07_check', 'g32', 'G32', 'Muncul bintik-bintik kecil kuning atau putih pada permukaan batang', '', 'h07_g33', 'hama_not_found', '', 0.8),
('h07_g33', 'g33', 'G33', 'Terdapat jaring-jaring halus seperti sarang laba-laba pada batang', '', 'h07_g34_y', 'h07_g34_t', '', 0.85),
('h07_g34_y', 'g34', 'G34', 'Jaringan batang mengering and berwarna kecoklatan', '', 'h07_g35_y', 'h07_g35_t', '', 0.8),
('h07_g34_t', 'g34', 'G34', 'Jaringan batang mengering (Jalur alternatif)', '', 'h07_g35_t', 'h07_g35_tr', '', 0.8),
('h07_g35_y', 'g35', 'G35', 'Batang terlihat kusam and warna hijau memudar', '', 'h07_g36', 'h07_confirmed', '', 0.75),
('h07_g35_t', 'g35', 'G35', 'Batang terlihat kusam (Jalur alternatif 1)', '', 'h07_g36', 'h07_confirmed', '', 0.75),
('h07_g35_tr', 'g35', 'G35', 'Batang terlihat kusam (Jalur alternatif 2)', '', 'h07_g36', 'h07_confirmed', '', 0.75),
('h07_g36', 'g36', 'G36', 'Tunas muda tumbuh tidak normal atau bentuknya cacat', '', 'h07_g37', 'h07_confirmed', '', 0.8),
('h07_g37', 'g37', 'G37', 'Batang mengering and mati pada serangan yang parah', '', 'h07_confirmed', 'h07_confirmed', '', 0.85),
('h07_confirmed', 'h07', 'H07', 'Hasil: Tungau terdeteksi!', '', '', '', 'h07', 0.95),
('hama_not_found', 'hama_not_found', 'HAMA?', 'Hama tidak dapat diidentifikasi secara pasti dari alur pohon keputusan.', '', '', '', 'hama_not_found', 0);

-- ============================================================
-- 3. CABANG PENYAKIT (P01 - P06) DENGAN STRUKTUR SERUPA
-- ============================================================

-- P01: KANKER BATANG DAN BUAH
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('p01_check', 'g38', 'G38', 'Muncul bintik putih kecil cekung, di tengah bintik ada seperti bekas tusukan jarum pada tunas, cabang muda, atau buah', '', 'p01_g39', 'p02_check', '', 0.9),
('p01_g39', 'g39', 'G39', 'Bintik berubah warna menjadi coklat kemerahan', '', 'p01_g40_y', 'p01_g40_t', '', 0.85),
('p01_g40_y', 'g40', 'G40', 'Bintik-bintik menyatu menjadi bercak kuning-coklat hingga hitam dengan permukaan kasar', '', 'p01_g41', 'p01_confirmed', '', 0.85),
('p01_g41', 'g41', 'G41', 'Tunas muda mengering and mati (pada serangan sangat parah)', '', 'p01_g42', 'p01_confirmed', '', 0.8),
('p01_g42', 'g42', 'G42', 'Pada batang tua muncul bercak 1-2 cm dengan lubang hitam di tengahnya', '', 'p01_g43', 'p01_confirmed', '', 0.85),
('p01_g43', 'g43', 'G43', 'Buah terlihat kasar dengan bercak-bercak yang sudah menyatu di permukaannya', '', 'p01_g44', 'p01_confirmed', '', 0.8),
('p01_g44', 'g44', 'G44', 'Pada serangan lanjut, batang membusuk and hancur menyisakan bagian berkayu dari batang', '', 'p01_confirmed', 'p01_confirmed', '', 0.85),
('p01_g40_t', 'g40', 'G40', 'Bintik-bintik menyatu (Jalur alternatif)', '', 'p01_confirmed', 'p01_confirmed', '', 0.85),
('p01_confirmed', 'p01', 'P01', 'Hasil: Kanker Batang dan Buah terdeteksi!', '', '', '', 'p01', 0.95);

-- P02: ANTRAKNOSA
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('p02_check', 'g45', 'G45', 'Muncul bercak coklat cekung basah pada tunas atau buah yang mulai masak', '', 'p02_g46', 'p03_check', '', 0.9),
('p02_g46', 'g46', 'G46', 'Bercak busuk berwarna coklat melebar dengan cepat terutama saat cuaca lembab', '', 'p02_g47_y', 'p02_g47_t', '', 0.85),
('p02_g47_y', 'g47', 'G47', 'Permukaan bercak terasa basah and lunak saat ditekan', '', 'p02_g48', 'p02_confirmed', '', 0.8),
('p02_g48', 'g48', 'G48', 'Pada bercak lanjut terlihat massa spora berwarna jingga atau merah muda', '', 'p02_g49', 'p02_confirmed', '', 0.85),
('p02_g49', 'g49', 'G49', 'Buah membusuk, menjadi tidak layak konsumsi and gugur', '', 'p02_confirmed', 'p02_confirmed', '', 0.8),
('p02_g47_t', 'g47', 'G47', 'Permukaan bercak terasa basah (Jalur alternatif)', '', 'p02_confirmed', 'p02_confirmed', '', 0.8),
('p02_confirmed', 'p02', 'P02', 'Hasil: Antraknosa terdeteksi!', '', '', '', 'p02', 0.95);

-- P03: BUSUK BATANG
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('p03_check', 'g50', 'G50', 'Batang berubah warna menjadi kuning pada bagian yang terinfeksi', '', 'p03_g51', 'p04_check', '', 0.8),
('p03_g51', 'g51', 'G51', 'Bercak coklat kekuningan meluas ke atas mengikuti arah batang', '', 'p03_g52_y', 'p03_g52_t', '', 0.85),
('p03_g52_y', 'g52', 'G52', 'Jika batang dipotong melintang, bagian dalamnya berwarna coklat', '', 'p03_g53', 'p03_confirmed', '', 0.9),
('p03_g53', 'g53', 'G53', 'Batang teraba lunak and berair jika ditekan', '', 'p03_g54', 'p03_confirmed', '', 0.85),
('p03_g54', 'g54', 'G54', 'Kadang-kadang muncul benang-benang jamur putih atau merah muda pada permukaan batang saat cuaca lembab', '', 'p03_g55', 'p03_confirmed', '', 0.8),
('p03_g55', 'g55', 'G55', 'Batang rapuh and mudah patah atau ambruk', '', 'p03_g56', 'p03_confirmed', '', 0.85),
('p03_g56', 'g56', 'G56', 'Stadium lanjut batang mengering and berwarna coklat kehitaman', '', 'p03_g57', 'p03_confirmed', '', 0.8),
('p03_g57', 'g57', 'G57', 'Kuning lunak hancur and meninggalkan bagian berkayu yang keras', '', 'p03_g58', 'p03_confirmed', '', 0.85),
('p03_g58', 'g58', 'G58', 'Tercium bau busuk yang menyengat dari batang yang sakit', '', 'p03_g59', 'p03_confirmed', '', 0.9),
('p03_g59', 'g59', 'G59', 'Keluar cairan kental berwarna putih kecoklatan dari batang', '', 'p03_g60', 'p03_confirmed', '', 0.85),
('p03_g60', 'g60', 'G60', 'Kulit batang mudah terkelupas and bagian dalamnya membusuk', '', 'p03_g61', 'p03_confirmed', '', 0.85),
('p03_g61', 'g61', 'G61', 'Batang berubah warna dari hijau menjadi kuning kecoklatan hingga hitam', '', 'p03_confirmed', 'p03_confirmed', '', 0.8),
('p03_g52_t', 'g52', 'G52', 'Bagian dalam berwarna coklat (Jalur alternatif)', '', 'p03_confirmed', 'p03_confirmed', '', 0.9),
('p03_confirmed', 'p03', 'P03', 'Hasil: Busuk Batang terdeteksi!', '', '', '', 'p03', 0.95);

-- P04: KUDIS / SCAB
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('p04_check', 'g62', 'G62', 'Muncul bercak kecil coklat muda kasar seperti koreng pada batang atau buah', '', 'p04_g63', 'p05_check', '', 0.85),
('p04_g63', 'g63', 'G63', 'Bercak membesar dengan permukaan yang kering and keras', '', 'p04_g64_y', 'p04_g64_t', '', 0.8),
('p04_g64_y', 'g64', 'G64', 'Pinggiran bercak berwarna lebih gelap dibanding bagian tengahnya', '', 'p04_g65', 'p04_confirmed', '', 0.75),
('p04_g65', 'g65', 'G65', 'Pada serangan berat bercak menyatu and menutupi area yang luas', '', 'p04_g66', 'p04_confirmed', '', 0.8),
('p04_g66', 'g66', 'G66', 'Saat cuaca lembab terlihat titik-titik hitam kecil pada permukaan bercak', '', 'p04_confirmed', 'p04_confirmed', '', 0.85),
('p04_g64_t', 'g64', 'G64', 'Pinggiran bercak berwarna lebih gelap (Jalur alternatif)', '', 'p04_confirmed', 'p04_confirmed', '', 0.75),
('p04_confirmed', 'p04', 'P04', 'Hasil: Kudis / Scab terdeteksi!', '', '', '', 'p04', 0.95);

-- P05: MOSAIK / BERCAK NEKROTIK
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('p05_check', 'g67', 'G67', 'Muncul bercak kecil di tunas muda yang berubah warna menjadi jingga', '', 'p05_g68', 'p06_check', '', 0.8),
('p05_g68', 'g68', 'G68', 'Batang tampak belang-belang kuning and hijau tidak merata', '', 'p05_g69_y', 'p05_g69_t', '', 0.85),
('p05_g69_y', 'g69', 'G69', 'Ada bercak mati di batang dewasa and permukaan buah', '', 'p05_g70', 'p05_confirmed', '', 0.8),
('p05_g70', 'g70', 'G70', 'Batang menunjukkan bintik-bintik pucat and lingkaran mati', '', 'p05_g71', 'p05_confirmed', '', 0.85),
('p05_g71', 'g71', 'G71', 'Tunas baru tumbuh tidak normal and bentuknya tidak beraturan', '', 'p05_confirmed', 'p05_confirmed', '', 0.8),
('p05_g69_t', 'g69', 'G69', 'Ada bercak mati (Jalur alternatif)', '', 'p05_confirmed', 'p05_confirmed', '', 0.8),
('p05_confirmed', 'p05', 'P05', 'Hasil: Mosaik / Bercak Nekrotik terdeteksi!', '', '', '', 'p05', 0.95);

-- P06: PURU AKAR
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('p06_check', 'g72', 'G72', 'Ada benjolan atau bisul pada akar saat tanaman dicabut', '', 'p06_g73', 'penyakit_not_found', '', 0.9),
('p06_g73', 'g73', 'G73', 'Akar sedikit, pendek, and tidak berkembang dengan baik', '', 'p06_g74_y', 'p06_g74_t', '', 0.85),
('p06_g74_y', 'g74', 'G74', 'Batang atau daun menguning walaupun pemeliharaannya sama dengan batang yang lain', '', 'p06_g75', 'p06_confirmed', '', 0.8),
('p06_g75', 'g75', 'G75', 'Tanaman tumbuh kerdil atau pertumbuhannya lambat', '', 'p06_g76', 'p06_confirmed', '', 0.85),
('p06_g76', 'g76', 'G76', 'Akar berwarna coklat kehitaman and mudah busuk', '', 'p06_confirmed', 'p06_confirmed', '', 0.85),
('p06_g74_t', 'g74', 'G74', 'Batang atau daun menguning (Jalur alternatif)', '', 'p06_confirmed', 'p06_confirmed', '', 0.8),
('p06_confirmed', 'p06', 'P06', 'Hasil: Puru Akar terdeteksi!', '', '', '', 'p06', 0.95),
('penyakit_not_found', 'penyakit_not_found', 'PENYAKIT?', 'Penyakit tidak dapat diidentifikasi secara pasti dari alur pohon keputusan.', '', '', '', 'penyakit_not_found', 0);
