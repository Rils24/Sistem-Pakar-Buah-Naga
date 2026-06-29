-- ============================================================
-- SEED DATA: POHON KEPUTUSAN (LENGKAP G00 - G76)
-- JALUR PERTANYAAN BAHASA YANG MUDAH DIPAHAMI PETANI/PENGGUNA
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- Hapus data lama jika ada
DELETE FROM pohon_keputusan;

-- ROOT NODE
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('root', 'g00', 'G00', 'Apakah Anda melihat langsung adanya serangga/hewan, cairan lengket, lendir/jaring, atau bekas gigitan dan lubang pada tanaman?', 'Gejala pembeda utama antara hama dan penyakit', 'hama_group', 'penyakit_group', '', 1.0);

-- HAMA GROUP
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('hama_group', 'hama', 'HAMA', 'Terdeteksi adanya indikasi HAMA. Mari kita cari tahu jenis hama apa yang menyerang tanaman Anda.', '', 'h01_check', '', '', 1.0);

-- H01: KUTU PUTIH (G01 - G06)
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h01_check', 'g01', 'G01', 'Apakah terlihat lapisan putih seperti kapas atau sarang laba-laba pada batang dan buah?', '', 'h01_g02', 'h02_check', '', 0.9),
('h01_g02', 'g02', 'G02', 'Apakah Anda melihat kumpulan kutu atau serangga kecil di sekitar lapisan putih tersebut?', '', 'h01_g03', 'h01_g05', '', 0.9),
('h01_g03', 'g03', 'G03', 'Apakah lapisan putih tersebut terasa lengket ketika disentuh?', '', 'h01_confirmed', 'h01_g04', '', 0.85),
('h01_g04', 'g04', 'G04', 'Apakah bagian batang atau buah terlihat kusam dan kotor?', '', 'h01_confirmed', 'h02_check', '', 0.7),
('h01_g05', 'g05', 'G05', 'Apakah ada jamur berwarna hitam (seperti jelaga) di bagian yang terserang?', '', 'h01_confirmed', 'h01_g06', '', 0.8),
('h01_g06', 'g06', 'G06', 'Apakah banyak semut berkeliaran di sekitar lapisan putih tersebut?', '', 'h01_confirmed', 'h02_check', '', 0.75),
('h01_confirmed', 'h01', 'H01', 'Hasil: Kutu Putih terdeteksi!', '', '', '', 'h01', 0.95);

-- H02: APHIDS (G07 - G11)
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h02_check', 'g07', 'G07', 'Apakah ada gerombolan kutu kecil berwarna hijau atau hitam di batang, kelopak bunga, atau sisik buah?', '', 'h02_g08', 'h03_check', '', 0.9),
('h02_g08', 'g08', 'G08', 'Apakah permukaan batang, bunga, atau buah terasa lengket seperti terkena madu?', '', 'h02_confirmed', 'h02_g09', '', 0.85),
('h02_g09', 'g09', 'G09', 'Apakah jamur hitam tumbuh pada permukaan yang lengket tersebut?', '', 'h02_confirmed', 'h02_g10', '', 0.8),
('h02_g10', 'g10', 'G10', 'Apakah bunga dan bakal buah menjadi layu lalu berguguran?', '', 'h02_confirmed', 'h02_g11', '', 0.75),
('h02_g11', 'g11', 'G11', 'Apakah tunas muda dan bunga terlihat berkerut serta kerdil?', '', 'h02_confirmed', 'h03_check', '', 0.8),
('h02_confirmed', 'h02', 'H02', 'Hasil: Aphids (Kutu Daun) terdeteksi!', '', '', '', 'h02', 0.95);

-- H03: KUTU SISIK (G12 - G15)
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h03_check', 'g12', 'G12', 'Apakah terlihat kumpulan hama menempel rapat di bagian batang yang teduh (terlindung dari matahari)?', '', 'h03_g13', 'h04_check', '', 0.9),
('h03_g13', 'g13', 'G13', 'Jika kumpulan hama itu disingkirkan, apakah ada bercak kecil berwarna kuning di kulit batang?', '', 'h03_confirmed', 'h03_g14', '', 0.85),
('h03_g14', 'g14', 'G14', 'Apakah warna batang yang semula hijau berubah menjadi kuning pucat?', '', 'h03_confirmed', 'h03_g15', '', 0.8),
('h03_g15', 'g15', 'G15', 'Apakah batang atau cabang menjadi sangat lunak, membusuk, dan berwarna coklat?', '', 'h03_confirmed', 'h04_check', '', 0.85),
('h03_confirmed', 'h03', 'H03', 'Hasil: Kutu Sisik terdeteksi!', '', '', '', 'h03', 0.95);

-- H04: LALAT BUAH (G16 - G20)
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h04_check', 'g16', 'G16', 'Apakah ada titik/lubang kecil bekas tusukan di kulit buah?', '', 'h04_g17', 'h05_check', '', 0.9),
('h04_g17', 'g17', 'G17', 'Apakah ada bercak basah yang semakin hari semakin melebar di kulit buah?', '', 'h04_confirmed', 'h04_g18', '', 0.85),
('h04_g18', 'g18', 'G18', 'Ketika buah dibelah, apakah ada ulat atau belatung putih di dalamnya?', '', 'h04_confirmed', 'h04_g19', '', 0.95),
('h04_g19', 'g19', 'G19', 'Apakah buah menjadi busuk kemudian jatuh/gugur dari pohon?', '', 'h04_confirmed', 'h04_g20', '', 0.8),
('h04_g20', 'g20', 'G20', 'Apakah bagian dalam/daging buah terlihat keropos dan berlubang?', '', 'h04_confirmed', 'h05_check', '', 0.75),
('h04_confirmed', 'h04', 'H04', 'Hasil: Lalat Buah terdeteksi!', '', '', '', 'h04', 0.95);

-- H05: BEKICOT (G21 - G26)
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h05_check', 'g21', 'G21', 'Apakah ada bekas gigitan bergerigi di bagian pinggir atau tengah batang tanaman?', '', 'h05_g22', 'h06_check', '', 0.9),
('h05_g22', 'g22', 'G22', 'Apakah Anda menemukan bekicot menempel atau berada di sekitar tanaman?', '', 'h05_confirmed', 'h05_g23', '', 0.95),
('h05_g23', 'g23', 'G23', 'Apakah terlihat kotoran bekicot berwarna hitam di dekat pohon?', '', 'h05_confirmed', 'h05_g24', '', 0.85),
('h05_g24', 'g24', 'G24', 'Apakah ada bekas/jejak lendir yang mengkilap keperakan di sekitar batang?', '', 'h05_confirmed', 'h05_g25', '', 0.8),
('h05_g25', 'g25', 'G25', 'Apakah batang sampai berlubang besar atau rombeng karena habis dimakan?', '', 'h05_confirmed', 'h05_g26', '', 0.85),
('h05_g26', 'g26', 'G26', 'Apakah tunas baru yang tumbuh menjadi rusak atau bentuknya cacat?', '', 'h05_confirmed', 'h06_check', '', 0.75),
('h05_confirmed', 'h05', 'H05', 'Hasil: Bekicot terdeteksi!', '', '', '', 'h05', 0.95);

-- H06: BELALANG (G27 - G31)
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h06_check', 'g27', 'G27', 'Apakah batang muda atau tunas terlihat sobek dan berlubang?', '', 'h06_g28', 'h07_check', '', 0.85),
('h06_g28', 'g28', 'G28', 'Apakah ada bekas luka berwarna coklat di permukaan batang?', '', 'h06_confirmed', 'h06_g29', '', 0.8),
('h06_g29', 'g29', 'G29', 'Apakah bekas gigitan/luka tersebut terlihat mengering?', '', 'h06_confirmed', 'h06_g30', '', 0.75),
('h06_g30', 'g30', 'G30', 'Apakah kulit luar batang terkelupas atau rusak dengan pola tidak teratur?', '', 'h06_confirmed', 'h06_g31', '', 0.7),
('h06_g31', 'g31', 'G31', 'Apakah batang muda sampai patah atau layu dan mati?', '', 'h06_confirmed', 'h07_check', '', 0.85),
('h06_confirmed', 'h06', 'H06', 'Hasil: Belalang terdeteksi!', '', '', '', 'h06', 0.95);

-- H07: TUNGAU (G32 - G37)
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('h07_check', 'g32', 'G32', 'Apakah warna hijau batang tampak memudar dan kusam?', '', 'h07_g33', 'hama_not_found', '', 0.75),
('h07_g33', 'g33', 'G33', 'Apakah muncul bintik-bintik kecil berwarna kuning atau putih di permukaan batang?', '', 'h07_confirmed', 'h07_g34', '', 0.8),
('h07_g34', 'g34', 'G34', 'Apakah bagian batang mengering dan berubah warna menjadi kecoklatan?', '', 'h07_confirmed', 'h07_g35', '', 0.8),
('h07_g35', 'g35', 'G35', 'Apakah ada jaring-jaring halus seperti sarang laba-laba di sela-sela batang?', '', 'h07_confirmed', 'h07_g36', '', 0.85),
('h07_g36', 'g36', 'G36', 'Apakah pertumbuhan tunas muda terganggu atau bentuknya tidak normal?', '', 'h07_confirmed', 'h07_g37', '', 0.8),
('h07_g37', 'g37', 'G37', 'Apakah batang akhirnya mengering total lalu mati?', '', 'h07_confirmed', 'hama_not_found', '', 0.85),
('h07_confirmed', 'h07', 'H07', 'Hasil: Tungau terdeteksi!', '', '', '', 'h07', 0.95);

-- HAMA NOT FOUND
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('hama_not_found', 'hama_not_found', 'HAMA?', 'Hama tidak dapat diidentifikasi dari gejala yang diberikan. Coba konsultasikan dengan ahli.', '', '', '', 'hama_not_found', 0);

-- PENYAKIT GROUP
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('penyakit_group', 'penyakit', 'PENYAKIT', 'Terdeteksi adanya indikasi PENYAKIT (Jamur/Bakteri/Virus). Mari kita cari tahu penyakit apa yang menyerang.', '', 'p01_check', '', '', 1.0);

-- P01: KANKER BATANG DAN BUAH (G38 - G44)
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('p01_check', 'g38', 'G38', 'Apakah muncul bintik putih kecil yang agak cekung (seperti bekas tusukan jarum) pada tunas, cabang muda, atau buah?', '', 'p01_g39', 'p02_check', '', 0.9),
('p01_g39', 'g39', 'G39', 'Apakah bintik putih tersebut berubah warna menjadi coklat kemerahan?', '', 'p01_g40', 'p01_g42', '', 0.85),
('p01_g40', 'g40', 'G40', 'Apakah bintik-bintik itu melebar dan menyatu menjadi bercak besar berwarna coklat kehitaman dengan tekstur kasar?', '', 'p01_confirmed', 'p01_g41', '', 0.85),
('p01_g41', 'g41', 'G41', 'Apakah tunas muda menjadi layu, mengering, lalu mati?', '', 'p01_confirmed', 'p02_check', '', 0.8),
('p01_g42', 'g42', 'G42', 'Apakah muncul bercak sekitar 1-2 cm yang berlubang hitam di tengahnya pada batang yang tua?', '', 'p01_confirmed', 'p01_g43', '', 0.85),
('p01_g43', 'g43', 'G43', 'Apakah kulit buah menjadi kasar akibat bercak-bercak yang menyatu?', '', 'p01_confirmed', 'p01_g44', '', 0.8),
('p01_g44', 'g44', 'G44', 'Apakah batang membusuk dan hancur sampai hanya tersisa serat kayu bagian dalamnya saja?', '', 'p01_confirmed', 'p02_check', '', 0.85),
('p01_confirmed', 'p01', 'P01', 'Hasil: Kanker Batang dan Buah terdeteksi!', '', '', '', 'p01', 0.95);

-- P02: ANTRAKNOSA (G45 - G49)
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('p02_check', 'g45', 'G45', 'Apakah ada bercak coklat basah yang agak cekung pada tunas atau buah yang mulai matang?', '', 'p02_g46', 'p03_check', '', 0.9),
('p02_g46', 'g46', 'G46', 'Apakah bercak busuk berwarna coklat itu melebar sangat cepat (terutama saat cuaca basah/lembab)?', '', 'p02_confirmed', 'p02_g47', '', 0.85),
('p02_g47', 'g47', 'G47', 'Apakah bagian bercak terasa basah dan lembek ketika ditekan?', '', 'p02_confirmed', 'p02_g48', '', 0.8),
('p02_g48', 'g48', 'G48', 'Apakah muncul lapisan berwarna oranye atau merah muda di atas bercak tersebut?', '', 'p02_confirmed', 'p02_g49', '', 0.85),
('p02_g49', 'g49', 'G49', 'Apakah buah membusuk seluruhnya lalu jatuh?', '', 'p02_confirmed', 'p03_check', '', 0.8),
('p02_confirmed', 'p02', 'P02', 'Hasil: Antraknosa terdeteksi!', '', '', '', 'p02', 0.95);

-- P03: BUSUK BATANG (G50 - G61)
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('p03_check', 'g50', 'G50', 'Apakah sebagian batang berubah warna menjadi kuning?', '', 'p03_g51', 'p04_check', '', 0.8),
('p03_g51', 'g51', 'G51', 'Apakah warna kuning kecoklatan merambat naik mengikuti arah batang?', '', 'p03_g52', 'p03_g58', '', 0.85),
('p03_g52', 'g52', 'G52', 'Jika batang dipotong secara melintang, apakah bagian dalamnya berwarna coklat?', '', 'p03_confirmed', 'p03_g53', '', 0.9),
('p03_g53', 'g53', 'G53', 'Apakah batang terasa lembek dan berair saat ditekan?', '', 'p03_confirmed', 'p03_g54', '', 0.85),
('p03_g54', 'g54', 'G54', 'Apakah terlihat serabut jamur halus berwarna putih atau merah muda di permukaan batang?', '', 'p03_confirmed', 'p03_g55', '', 0.8),
('p03_g55', 'g55', 'G55', 'Apakah batang menjadi sangat rapuh hingga mudah patah atau roboh?', '', 'p03_confirmed', 'p03_g56', '', 0.85),
('p03_g56', 'g56', 'G56', 'Apakah akhirnya batang mengering keriput dan berwarna coklat gelap?', '', 'p03_confirmed', 'p03_g57', '', 0.8),
('p03_g57', 'g57', 'G57', 'Apakah bagian batang yang membusuk hancur berjatuhan dan menyisakan duri/kayu tengah saja?', '', 'p03_confirmed', 'p03_g58', '', 0.85),
('p03_g58', 'g58', 'G58', 'Apakah tercium bau busuk yang sangat tajam/menyengat dari batang yang sakit?', '', 'p03_confirmed', 'p03_g59', '', 0.9),
('p03_g59', 'g59', 'G59', 'Apakah keluar cairan kental berwarna keruh (putih kecoklatan) dari batang?', '', 'p03_confirmed', 'p03_g60', '', 0.85),
('p03_g60', 'g60', 'G60', 'Apakah kulit luar batang sangat mudah dikelupas dan bagian dalamnya sudah busuk?', '', 'p03_confirmed', 'p03_g61', '', 0.85),
('p03_g61', 'g61', 'G61', 'Apakah warna batang berubah total dari hijau menjadi kuning kecoklatan hingga hitam?', '', 'p03_confirmed', 'p04_check', '', 0.8),
('p03_confirmed', 'p03', 'P03', 'Hasil: Busuk Batang terdeteksi!', '', '', '', 'p03', 0.95);

-- P04: KUDIS / SCAB (G62 - G66)
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('p04_check', 'g62', 'G62', 'Apakah ada bercak kecil coklat muda yang kasar seperti koreng/kudis pada batang atau buah?', '', 'p04_g63', 'p05_check', '', 0.85),
('p04_g63', 'g63', 'G63', 'Apakah bercak koreng tersebut membesar serta mengeras?', '', 'p04_confirmed', 'p04_g64', '', 0.8),
('p04_g64', 'g64', 'G64', 'Apakah bagian pinggir bercak warnanya lebih tua dibandingkan bagian tengahnya?', '', 'p04_confirmed', 'p04_g65', '', 0.75),
('p04_g65', 'g65', 'G65', 'Apakah bercak-bercak tersebut menyatu sehingga menutupi sebagian besar batang/buah?', '', 'p04_confirmed', 'p04_g66', '', 0.8),
('p04_g66', 'g66', 'G66', 'Saat cuaca basah, apakah terlihat bintik-bintik hitam kecil di permukaan bercak?', '', 'p04_confirmed', 'p05_check', '', 0.85),
('p04_confirmed', 'p04', 'P04', 'Hasil: Kudis / Scab terdeteksi!', '', '', '', 'p04', 0.95);

-- P05: MOSAIK / BERCAK NEKROTIK (G67 - G71)
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('p05_check', 'g67', 'G67', 'Apakah muncul bercak kecil berwarna oranye/jingga pada tunas muda?', '', 'p05_g68', 'p06_check', '', 0.8),
('p05_g68', 'g68', 'G68', 'Apakah warna batang tampak belang-belang (kombinasi hijau dan kuning)?', '', 'p05_confirmed', 'p05_g69', '', 0.85),
('p05_g69', 'g69', 'G69', 'Apakah terdapat bagian kulit batang tua atau kulit buah yang mati/mengering?', '', 'p05_confirmed', 'p05_g70', '', 0.8),
('p05_g70', 'g70', 'G70', 'Apakah terlihat bintik-bintik pucat melingkar di batang?', '', 'p05_confirmed', 'p05_g71', '', 0.85),
('p05_g71', 'g71', 'G71', 'Apakah tunas baru tumbuh melintir/tidak lurus atau bentuknya aneh?', '', 'p05_confirmed', 'p06_check', '', 0.8),
('p05_confirmed', 'p05', 'P05', 'Hasil: Mosaik / Bercak Nekrotik terdeteksi!', '', '', '', 'p05', 0.95);

-- P06: PURU AKAR (G72 - G76)
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('p06_check', 'g72', 'G72', 'Jika dicabut, apakah terlihat ada benjolan/bisul (seperti kutil) pada akar?', '', 'p06_confirmed', 'p06_g73', '', 0.9),
('p06_g73', 'g73', 'G73', 'Apakah jumlah akar sangat sedikit, pendek-pendek, dan tidak tumbuh subur?', '', 'p06_confirmed', 'p06_g74', '', 0.85),
('p06_g74', 'g74', 'G74', 'Apakah tanaman tetap berwarna kuning pucat meskipun pemupukan/penyiraman sudah cukup?', '', 'p06_confirmed', 'p06_g75', '', 0.8),
('p06_g75', 'g75', 'G75', 'Apakah tanaman tampak kerdil dan pertumbuhannya sangat lambat?', '', 'p06_confirmed', 'p06_g76', '', 0.85),
('p06_g76', 'g76', 'G76', 'Apakah akar berwarna coklat tua/hitam serta mudah membusuk?', '', 'p06_confirmed', 'penyakit_not_found', '', 0.85),
('p06_confirmed', 'p06', 'P06', 'Hasil: Puru Akar terdeteksi!', '', '', '', 'p06', 0.95);

-- PENYAKIT NOT FOUND
INSERT INTO pohon_keputusan (id, gejala_id, kode_gejala, nama_gejala, deskripsi, ya, tidak, hasil, cf_pakar) VALUES
('penyakit_not_found', 'penyakit_not_found', 'PENYAKIT?', 'Penyakit tidak dapat diidentifikasi dari gejala yang diberikan. Coba konsultasikan dengan ahli.', '', '', '', 'penyakit_not_found', 0);
