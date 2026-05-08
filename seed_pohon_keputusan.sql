-- ============================================================
-- SEED DATA: POHON KEPUTUSAN
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- Hapus data lama jika ada
DELETE FROM pohon_keputusan;

-- ROOT NODE
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('root', 'g00', 'G00', 'Apakah ditemukan serangga/hewan secara langsung, jejak lendir/jaring, cairan lengket, atau kerusakan fisik berupa gigitan/lubang pada tanaman?', 'Gejala pembeda utama antara hama dan penyakit', 'hama_group', 'penyakit_group', '', 1.0);

-- HAMA GROUP
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('hama_group', 'hama', 'HAMA', 'Tanda-tanda menunjukkan adanya HAMA. Mari kita identifikasi jenis hama yang menyerang.', '', 'h01_check', '', '', 1.0);

-- H01: KUTU PUTIH
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h01_check', 'g01', 'G01', 'Apakah terdapat lapisan putih seperti kapas dan jejaring menempel pada batang dan buah?', '', 'h01_g02', 'h02_check', '', 0.9),
('h01_g02', 'g02', 'G02', 'Apakah ditemukan individu atau kumpulan hama pada lapisan lilin atau di sekitarnya?', '', 'h01_g03', 'h01_g05', '', 0.9),
('h01_g03', 'g03', 'G03', 'Apakah lapisan putih tersebut berlilin dan lengket jika dipegang?', '', 'h01_confirmed', 'h01_g04', '', 0.85),
('h01_g04', 'g04', 'G04', 'Apakah batang atau buah tampak kusam dan kotor?', '', 'h01_confirmed', 'h02_check', '', 0.7),
('h01_g05', 'g05', 'G05', 'Apakah muncul jamur jelaga berwarna hitam pada permukaan yang diserang?', '', 'h01_confirmed', 'h01_g06', '', 0.8),
('h01_g06', 'g06', 'G06', 'Apakah sering ditemukan adanya semut di sekitar lapisan putih?', '', 'h01_confirmed', 'h02_check', '', 0.75),
('h01_confirmed', 'h01', 'H01', 'Hasil: Kutu Putih terdeteksi!', '', '', '', 'h01', 0.95);

-- H02: APHIDS
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h02_check', 'g07', 'G07', 'Apakah ditemukan kumpulan kutu kecil berwarna hijau atau hitam pada batang, kelopak bunga, atau sisik buah?', '', 'h02_g08', 'h03_check', '', 0.9),
('h02_g08', 'g08', 'G08', 'Apakah permukaan batang, bunga, atau buah tampak lengket akibat cairan madu (honeydew)?', '', 'h02_confirmed', 'h02_g10', '', 0.85),
('h02_g10', 'g10', 'G10', 'Apakah bunga dan bakal buah layu dan gugur?', '', 'h02_confirmed', 'h02_g11', '', 0.75),
('h02_g11', 'g11', 'G11', 'Apakah tunas muda dan bunga tampak berkerut dan tidak berkembang normal?', '', 'h02_confirmed', 'h03_check', '', 0.8),
('h02_confirmed', 'h02', 'H02', 'Hasil: Aphids (Kutu Daun) terdeteksi!', '', '', '', 'h02', 0.95);

-- H03: KUTU SISIK
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h03_check', 'g12', 'G12', 'Apakah terlihat dompolan atau koloni hama pada sisi batang yang terlindung dari cahaya atau teduh?', '', 'h03_g13', 'h04_check', '', 0.9),
('h03_g13', 'g13', 'G13', 'Jika dompolan hama disingkirkan, apakah terlihat bercak-bercak kecil dikelilingi warna kuning pada batang?', '', 'h03_confirmed', 'h03_g14', '', 0.85),
('h03_g14', 'g14', 'G14', 'Apakah warna hijau batang berubah menjadi kuning, semakin parah pada cabang yang terserang?', '', 'h03_confirmed', 'h03_g15', '', 0.8),
('h03_g15', 'g15', 'G15', 'Apakah batang atau cabang menjadi busuk, lunak, dan berwarna kuning pekat hingga coklat pada kerusakan parah?', '', 'h03_confirmed', 'h04_check', '', 0.85),
('h03_confirmed', 'h03', 'H03', 'Hasil: Kutu Sisik terdeteksi!', '', '', '', 'h03', 0.95);

-- H04: LALAT BUAH
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h04_check', 'g16', 'G16', 'Apakah terdapat lubang kecil bekas tusukan pada kulit buah?', '', 'h04_g18', 'h05_check', '', 0.9),
('h04_g18', 'g18', 'G18', 'Apakah ditemukan ulat atau belatung berwarna putih di dalam buah jika dibelah?', '', 'h04_confirmed', 'h04_g19', '', 0.95),
('h04_g19', 'g19', 'G19', 'Apakah buah busuk dan gugur?', '', 'h04_confirmed', 'h04_g20', '', 0.8),
('h04_g20', 'g20', 'G20', 'Apakah daging buah tampak kosong dan berlubang-lubang?', '', 'h04_confirmed', 'h05_check', '', 0.75),
('h04_confirmed', 'h04', 'H04', 'Hasil: Lalat Buah terdeteksi!', '', '', '', 'h04', 0.95);

-- H05: BEKICOT
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h05_check', 'g21', 'G21', 'Apakah terdapat bekas gigitan bergerigi di pinggir maupun tengah batang atau sulur?', '', 'h05_g22', 'h06_check', '', 0.9),
('h05_g22', 'g22', 'G22', 'Apakah ditemukan bekicot masih menempel atau berada di dekat tanaman yang diserang?', '', 'h05_confirmed', 'h05_g23', '', 0.95),
('h05_g23', 'g23', 'G23', 'Apakah ditemukan kotoran bekicot berwarna hitam di sekitar tanaman?', '', 'h05_confirmed', 'h05_g24', '', 0.85),
('h05_g24', 'g24', 'G24', 'Apakah terlihat jejak lendir mengkilap keperakan di sekitar batang?', '', 'h05_confirmed', 'h05_g25', '', 0.8),
('h05_g25', 'g25', 'G25', 'Apakah batang berlubang besar atau habis dimakan pada serangan parah?', '', 'h05_confirmed', 'h06_check', '', 0.85),
('h05_confirmed', 'h05', 'H05', 'Hasil: Bekicot terdeteksi!', '', '', '', 'h05', 0.95);

-- H06: BELALANG
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h06_check', 'g27', 'G27', 'Apakah batang muda atau tunas sobek dan berlubang akibat gigitan?', '', 'h06_g28', 'h07_check', '', 0.85),
('h06_g28', 'g28', 'G28', 'Apakah terdapat luka berwarna coklat pada permukaan batang?', '', 'h06_confirmed', 'h06_g31', '', 0.8),
('h06_g31', 'g31', 'G31', 'Apakah batang muda patah atau mati pada serangan yang parah?', '', 'h06_confirmed', 'h07_check', '', 0.85),
('h06_confirmed', 'h06', 'H06', 'Hasil: Belalang terdeteksi!', '', '', '', 'h06', 0.95);

-- H07: TUNGAU
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h07_check', 'g32', 'G32', 'Apakah muncul bintik-bintik kecil kuning atau putih pada permukaan batang?', '', 'h07_g33', 'hama_not_found', '', 0.8),
('h07_g33', 'g33', 'G33', 'Apakah terdapat jaring-jaring halus seperti sarang laba-laba pada batang?', '', 'h07_confirmed', 'h07_g34', '', 0.85),
('h07_g34', 'g34', 'G34', 'Apakah jaringan batang mengering dan berwarna kecoklatan?', '', 'h07_confirmed', 'h07_g35', '', 0.8),
('h07_g35', 'g35', 'G35', 'Apakah batang terlihat kusam dan warna hijau memudar?', '', 'h07_confirmed', 'h07_g36', '', 0.75),
('h07_g36', 'g36', 'G36', 'Apakah tunas muda tumbuh tidak normal atau bentuknya cacat?', '', 'h07_confirmed', 'h07_g37', '', 0.8),
('h07_g37', 'g37', 'G37', 'Apakah batang mengering dan mati pada serangan yang parah?', '', 'h07_confirmed', 'hama_not_found', '', 0.85),
('h07_confirmed', 'h07', 'H07', 'Hasil: Tungau terdeteksi!', '', '', '', 'h07', 0.95);

-- HAMA NOT FOUND
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('hama_not_found', 'hama_not_found', 'HAMA?', 'Hama tidak dapat diidentifikasi dari gejala yang diberikan. Mungkin ada faktor lain yang menyebabkan masalah pada tanaman.', '', '', '', 'hama_not_found', 0);

-- PENYAKIT GROUP
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('penyakit_group', 'penyakit', 'PENYAKIT', 'Tanda-tanda menunjukkan adanya PENYAKIT. Mari kita identifikasi jenis penyakit yang menyerang.', '', 'p01_check', '', '', 1.0);

-- P01: KANKER BATANG DAN BUAH
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('p01_check', 'g38', 'G38', 'Apakah muncul bintik putih kecil cekung, di tengah bintik ada seperti bekas tusukan jarum pada tunas, cabang muda, atau buah?', '', 'p01_g39', 'p02_check', '', 0.9),
('p01_g39', 'g39', 'G39', 'Apakah bintik berubah warna menjadi coklat kemerahan?', '', 'p01_g40', 'p01_g42', '', 0.85),
('p01_g40', 'g40', 'G40', 'Apakah bintik-bintik menyatu menjadi bercak kuning-coklat hingga hitam dengan permukaan kasar?', '', 'p01_confirmed', 'p01_g41', '', 0.85),
('p01_g41', 'g41', 'G41', 'Apakah tunas muda mengering dan mati?', '', 'p01_confirmed', 'p02_check', '', 0.8),
('p01_g42', 'g42', 'G42', 'Apakah pada batang tua muncul bercak 1-2 cm dengan lubang hitam di tengahnya?', '', 'p01_confirmed', 'p01_g43', '', 0.85),
('p01_g43', 'g43', 'G43', 'Apakah buah terlihat kasar dengan bercak-bercak yang sudah menyatu di permukaannya?', '', 'p01_confirmed', 'p01_g44', '', 0.8),
('p01_g44', 'g44', 'G44', 'Apakah pada serangan lanjut, batang membusuk dan hancur menyisakan bagian berkayu?', '', 'p01_confirmed', 'p02_check', '', 0.85),
('p01_confirmed', 'p01', 'P01', 'Hasil: Kanker Batang dan Buah terdeteksi!', '', '', '', 'p01', 0.95);

-- P02: ANTRAKNOSA
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('p02_check', 'g45', 'G45', 'Apakah muncul bercak coklat cekung basah pada tunas atau buah yang mulai masak?', '', 'p02_g46', 'p03_check', '', 0.9),
('p02_g46', 'g46', 'G46', 'Apakah bercak busuk berwarna coklat melebar dengan cepat terutama saat cuaca lembab?', '', 'p02_confirmed', 'p02_g47', '', 0.85),
('p02_g47', 'g47', 'G47', 'Apakah permukaan bercak terasa basah dan lunak saat ditekan?', '', 'p02_confirmed', 'p02_g48', '', 0.8),
('p02_g48', 'g48', 'G48', 'Apakah pada bercak lanjut terlihat massa spora berwarna jingga atau merah muda?', '', 'p02_confirmed', 'p02_g49', '', 0.85),
('p02_g49', 'g49', 'G49', 'Apakah buah membusuk, menjadi tidak layak konsumsi dan gugur?', '', 'p02_confirmed', 'p03_check', '', 0.8),
('p02_confirmed', 'p02', 'P02', 'Hasil: Antraknosa terdeteksi!', '', '', '', 'p02', 0.95);

-- P03: BUSUK BATANG
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('p03_check', 'g50', 'G50', 'Apakah batang berubah warna menjadi kuning pada bagian yang terinfeksi?', '', 'p03_g51', 'p04_check', '', 0.8),
('p03_g51', 'g51', 'G51', 'Apakah bercak coklat kekuningan meluas ke atas mengikuti arah batang?', '', 'p03_g52', 'p03_g58', '', 0.85),
('p03_g52', 'g52', 'G52', 'Jika batang dipotong melintang, apakah bagian dalamnya berwarna coklat?', '', 'p03_confirmed', 'p03_g53', '', 0.9),
('p03_g53', 'g53', 'G53', 'Apakah batang teraba lunak dan berair jika ditekan?', '', 'p03_confirmed', 'p03_g55', '', 0.85),
('p03_g55', 'g55', 'G55', 'Apakah batang rapuh dan mudah patah atau ambruk?', '', 'p03_confirmed', 'p03_g58', '', 0.85),
('p03_g58', 'g58', 'G58', 'Apakah tercium bau busuk yang menyengat dari batang yang sakit?', '', 'p03_confirmed', 'p03_g59', '', 0.9),
('p03_g59', 'g59', 'G59', 'Apakah keluar cairan kental berwarna putih kecoklatan dari batang?', '', 'p03_confirmed', 'p03_g60', '', 0.85),
('p03_g60', 'g60', 'G60', 'Apakah kulit batang mudah terkelupas dan bagian dalamnya membusuk?', '', 'p03_confirmed', 'p04_check', '', 0.85),
('p03_confirmed', 'p03', 'P03', 'Hasil: Busuk Batang terdeteksi!', '', '', '', 'p03', 0.95);

-- P04: KUDIS / SCAB
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('p04_check', 'g62', 'G62', 'Apakah muncul bercak kecil coklat muda kasar seperti koreng pada batang atau buah?', '', 'p04_g63', 'p05_check', '', 0.85),
('p04_g63', 'g63', 'G63', 'Apakah bercak membesar dengan permukaan yang kering dan keras?', '', 'p04_confirmed', 'p04_g64', '', 0.8),
('p04_g64', 'g64', 'G64', 'Apakah pinggiran bercak berwarna lebih gelap dibanding bagian tengahnya?', '', 'p04_confirmed', 'p04_g65', '', 0.75),
('p04_g65', 'g65', 'G65', 'Apakah pada serangan berat bercak menyatu dan menutupi area yang luas?', '', 'p04_confirmed', 'p04_g66', '', 0.8),
('p04_g66', 'g66', 'G66', 'Saat cuaca lembab, apakah terlihat titik-titik hitam kecil pada permukaan bercak?', '', 'p04_confirmed', 'p05_check', '', 0.85),
('p04_confirmed', 'p04', 'P04', 'Hasil: Kudis / Scab terdeteksi!', '', '', '', 'p04', 0.95);

-- P05: MOSAIK / BERCAK NEKROTIK
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('p05_check', 'g67', 'G67', 'Apakah muncul bercak kecil di tunas muda yang berubah warna menjadi jingga?', '', 'p05_g68', 'p06_check', '', 0.8),
('p05_g68', 'g68', 'G68', 'Apakah batang tampak belang-belang kuning dan hijau tidak merata?', '', 'p05_confirmed', 'p05_g69', '', 0.85),
('p05_g69', 'g69', 'G69', 'Apakah ada bercak mati di batang dewasa dan permukaan buah?', '', 'p05_confirmed', 'p05_g70', '', 0.8),
('p05_g70', 'g70', 'G70', 'Apakah batang menunjukkan bintik-bintik pucat dan lingkaran mati?', '', 'p05_confirmed', 'p05_g71', '', 0.85),
('p05_g71', 'g71', 'G71', 'Apakah tunas baru tumbuh tidak normal dan bentuknya tidak beraturan?', '', 'p05_confirmed', 'p06_check', '', 0.8),
('p05_confirmed', 'p05', 'P05', 'Hasil: Mosaik / Bercak Nekrotik terdeteksi!', '', '', '', 'p05', 0.95);

-- P06: PURU AKAR
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('p06_check', 'g72', 'G72', 'Apakah ada benjolan atau bisul pada akar saat tanaman dicabut?', '', 'p06_confirmed', 'p06_g73', '', 0.9),
('p06_g73', 'g73', 'G73', 'Apakah akar sedikit, pendek, dan tidak berkembang dengan baik?', '', 'p06_confirmed', 'p06_g74', '', 0.85),
('p06_g74', 'g74', 'G74', 'Apakah batang atau daun menguning walaupun pemeliharaannya sama dengan batang yang lain?', '', 'p06_confirmed', 'p06_g75', '', 0.8),
('p06_g75', 'g75', 'G75', 'Apakah tanaman tumbuh kerdil atau pertumbuhannya lambat?', '', 'p06_confirmed', 'p06_g76', '', 0.85),
('p06_g76', 'g76', 'G76', 'Apakah akar berwarna coklat kehitaman dan mudah busuk?', '', 'p06_confirmed', 'penyakit_not_found', '', 0.85),
('p06_confirmed', 'p06', 'P06', 'Hasil: Puru Akar terdeteksi!', '', '', '', 'p06', 0.95);

-- PENYAKIT NOT FOUND
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('penyakit_not_found', 'penyakit_not_found', 'PENYAKIT?', 'Penyakit tidak dapat diidentifikasi dari gejala yang diberikan. Mungkin ada faktor lain yang menyebabkan masalah pada tanaman.', '', '', '', 'penyakit_not_found', 0);
