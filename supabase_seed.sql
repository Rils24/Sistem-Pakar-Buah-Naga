-- ============================================================
-- SEED DATA - Sistem Pakar Buah Naga
-- Jalankan SETELAH supabase_schema.sql
-- ============================================================

-- ===== INSERT ADMIN USER =====
INSERT INTO users (id, nama, email, password, role, created_at) VALUES
('u1', 'Administrator', 'admin@sistempakar.com', 'admin123', 'admin', NOW())
ON CONFLICT (id) DO NOTHING;

-- ===== INSERT HAMA =====
INSERT INTO penyakit (id, kode, nama, deskripsi, solusi, tipe) VALUES
('h01', 'H01', 'Kutu Putih', 'Hama kutu putih (Planococcus citri) menyerang batang dan buah buah naga dengan membentuk lapisan putih seperti kapas. Hama ini menghisap cairan tanaman dan mengeluarkan honeydew yang menimbulkan jamur jelaga.', ARRAY['Gunakan sikat atau kain kasar untuk membersihkan lapisan putih dari batang','Semprot insektisida berbahan aktif imidacloprid atau acetamiprid','Gunakan predator alami seperti kutu ladybug (Cryptolaemus montrouzieri)','Pangkas bagian tanaman yang terserang berat dan musnahkan','Kontrol populasi semut yang menjadi penggembala kutu putih'], 'hama'),
('h02', 'H02', 'Aphids (Kutu Daun)', 'Kutu daun (Aphis gossypii) adalah hama kecil berwarna hijau atau hitam yang berkumpul pada batang, kelopak bunga, dan sisik buah. Mereka menghisap cairan tanaman dan mengeluarkan honeydew.', ARRAY['Semprot air bertekanan untuk membilas kutu daun dari tanaman','Aplikasikan insektisida nabati seperti ekstrak daun nimba','Gunakan insektisida berbahan aktif diazinon atau malathion jika serangan parah','Taruh perangkap kuning (yellow sticky trap) untuk menangkap kutu daun terbang','Pertahankan populasi predator alami seperti kepik dan lacewing'], 'hama'),
('h03', 'H03', 'Kutu Sisik', 'Kutu sisik (Coccus hesperidum) menempel pada sisi batang yang teduh membentuk dompolan atau koloni. Mereka menghisap cairan tanaman dan mengeluarkan honeydew yang menimbulkan jamur jelaga.', ARRAY['Bersihkan dompolan kutu sisik dengan sikat atau kain kasar yang direndam alkohol','Semprot minyak hortikultura (horticultural oil) untuk melembabkan dan membunuh kutu sisik','Aplikasikan insektisida sistemik berbahan aktif imidacloprid','Pangkas bagian batang yang terserang berat','Gunakan predator alami seperti parasitoid wasp (Metaphycus luteolus)'], 'hama'),
('h04', 'H04', 'Lalat Buah', 'Lalat buah (Bactrocera spp.) menyerang buah naga yang mulai masak dengan menusuk kulit buah untuk bertelur. Ulat yang menetas akan memakan daging buah menyebabkan buah busuk.', ARRAY['Gunakan perangkap feromon untuk menangkap lalat buah dewasa','Kumpulkan dan musnahkan buah yang jatuh atau busuk','Semprot insektisida berbahan aktif spinosad atau malathion pada buah','Gunakan kantong netting untuk melindungi buah dari serangan lalat','Panen buah sebelum terlalu matang untuk mengurangi serangan'], 'hama'),
('h05', 'H05', 'Bekicot', 'Bekicot adalah hama moluska yang memakan batang, tunas, dan daun buah naga terutama pada malam hari atau saat cuaca lembab. Mereka meninggalkan jejak lendir dan gigitan bergerigi.', ARRAY['Pungut dan musnahkan bekicot secara manual terutama di malam hari','Buat barier garam atau kapur di sekeliling tanaman','Gunakan umpan beracun berbahan aktif metaldehyde','Bersihkan gulma di sekitar tanaman untuk mengurangi tempat persembunyian','Gunakan perangkap bir biru (beer trap) untuk menarik dan menangkap bekicot'], 'hama'),
('h06', 'H06', 'Belalang', 'Belalang dapat merusak tunas muda dan batang buah naga dengan menggigit dan memakan jaringan tanaman. Kerusakan biasanya terlihat sebagai luka coklat atau batang yang patah.', ARRAY['Tangkap belalang secara manual jika jumlahnya sedikit','Gunakan insektisida berbahan aktif malathion atau diazinon','Semprot BT (Bacillus thuringiensis) untuk mengendalikan belalang muda','Buat perangkap cahaya untuk menarik dan menangkap belalang dewasa','Pertahankan habitat alami predator seperti burung dan kodok'], 'hama'),
('h07', 'H07', 'Tungau', 'Tungau laba-laba (Tetranychus urticae) adalah hama kecil yang menyebabkan bintik-bintik kuning atau putih pada batang. Mereka membentuk jaring halus dan dapat menyebabkan batang mengering.', ARRAY['Semprot air bertekanan tinggi untuk membilas tungau dari tanaman','Aplikasikan akarisida berbahan aktif abamectin atau dicofol','Gunakan minyak neem (neem oil) untuk mengendalikan populasi tungau','Jaga kelembaban tanaman karena tungau menyukai kondisi kering','Gunakan predator alami seperti kutu ladybug dan lacewing'], 'hama')
ON CONFLICT (id) DO NOTHING;

-- ===== INSERT PENYAKIT =====
INSERT INTO penyakit (id, kode, nama, deskripsi, solusi, tipe) VALUES
('p01', 'P01', 'Kanker Batang dan Buah', 'Penyakit kanker disebabkan oleh bakteri atau jamur yang menyebabkan munculnya bintik putih kecil cekung pada tunas, cabang, atau buah. Bintik berkembang menjadi bercak coklat kemerahan hingga hitam.', ARRAY['Pangkas bagian tanaman yang terserang dan bakar untuk mencegah penyebaran','Semprot fungisida berbahan aktif mankozeb atau kuprum oksiklorida','Aplikasikan bakterisida berbahan aktif streptomisin sulfat jika disebabkan bakteri','Hindari luka pada batang saat pemeliharaan','Jaga sirkulasi udara yang baik dan hindari kelembaban berlebih'], 'penyakit'),
('p02', 'P02', 'Antraknosa', 'Antraknosa disebabkan oleh jamur Colletotrichum spp. yang menyebabkan bercak coklat cekung basah pada tunas dan buah. Bercak melebar dengan cepat saat cuaca lembab dan menghasilkan massa spora berwarna jingga.', ARRAY['Pangkas dan musnahkan bagian tanaman yang terserang','Semprot fungisida berbahan aktif klorotalonil atau metil tiofanat','Hindari penyiraman dari atas yang dapat menyebarkan spora','Jarak tanam yang cukup untuk sirkulasi udara yang baik','Panen buah pada waktu yang tepat dan hindari luka saat panen'], 'penyakit'),
('p03', 'P03', 'Busuk Batang', 'Busuk batang disebabkan oleh jamur Fusarium dan bakteri yang menyebabkan batang berubah warna menjadi kuning, lunak, dan berair. Stadium lanjut batang mengering dan berwarna coklat kehitaman.', ARRAY['Cabut dan musnahkan tanaman yang terinfeksi berat','Pangkas bagian batang yang busuk hingga ke jaringan sehat','Oleskan fungisida pasta (pasta bordeaux) pada luka pangkasan','Perbaiki drainase tanah untuk mengurangi kelembaban','Rotasi tanaman dan sterilisasi media tanam'], 'penyakit'),
('p04', 'P04', 'Kudis / Scab', 'Kudis (scab) disebabkan oleh jamur Elsinoe spp. yang menyebabkan munculnya bercak kecil coklat muda kasar seperti koreng pada batang atau buah. Bercak membesar dengan permukaan kering dan keras.', ARRAY['Pangkas bagian yang terserang dan musnahkan','Semprot fungisida berbahan aktif mankozeb atau klorotalonil','Jaga kebersihan kebun dan buang gulma secara rutin','Hindari penyiraman yang membasahi batang dan buah','Aplikasikan fungisida preventif saat cuaca lembab'], 'penyakit'),
('p05', 'P05', 'Mosaik / Bercak Nekrotik', 'Mosaik atau bercak nekrotik disebabkan oleh virus yang menyebabkan batang tampak belang-belang kuning dan hijau tidak merata. Tunas baru tumbuh tidak normal dan bentuknya cacat.', ARRAY['Cabut dan musnahkan tanaman yang terinfeksi virus','Kontrol vektor serangga (kutu daun, thrips) dengan insektisida','Gunakan alat pertanian yang steril','Pilih bibit dari tanaman yang sehat dan bebas virus','Isolasi tanaman baru sebelum ditanam di kebun'], 'penyakit'),
('p06', 'P06', 'Puru Akar', 'Puru akar disebabkan oleh bakteri Agrobacterium tumefaciens yang menyebabkan benjolan atau bisul pada akar. Tanaman tumbuh kerdil, akar tidak berkembang, dan batang menguning.', ARRAY['Cabut dan musnahkan tanaman yang terinfeksi beserta akarnya','Sterilisasi tanah dengan solarisasi sebelum penanaman','Gunakan varietas yang tahan terhadap puru akar','Hindari luka pada akar saat penanaman','Perbaiki drainase tanah untuk mengurangi kelembaban'], 'penyakit')
ON CONFLICT (id) DO NOTHING;

-- ===== INSERT GEJALA =====
INSERT INTO gejala (id, kode, nama, deskripsi, cf_pakar) VALUES
('g00', 'G00', 'Ditemukan serangga/hewan secara langsung, jejak lendir/jaring, cairan lengket, atau kerusakan fisik berupa gigitan/lubang pada tanaman', 'Gejala pembeda utama: apakah ada tanda-tanda serangan hama/penyakit secara fisik?', 1.0),
('g01', 'G01', 'Ada lapisan putih seperti kapas atau sarang laba-laba pada batang dan buah', '', 1.0),
('g02', 'G02', 'Terlihat hama kecil berkumpul di sekitar lapisan putih atau di sekitarnya', '', 0.8),
('g03', 'G03', 'Lapisan putih terasa lengket saat disentuh', '', 0.8),
('g04', 'G04', 'Batang atau buah terlihat kusam dan kotor', '', 0.6),
('g05', 'G05', 'Muncul jamur hitam pada bagian yang terserang', '', 0.4),
('g06', 'G06', 'Biasanya banyak semut di sekitar tanaman yang terkena kutu putih', '', 0.4),
('g07', 'G07', 'Ditemukan kumpulan kutu kecil berwarna hijau atau hitam pada batang, kelopak bunga, atau sisik buah', '', 1.0),
('g08', 'G08', 'Permukaan batang, bunga, atau buah tampak lengket akibat cairan madu (honeydew)', '', 0.8),
('g09', 'G09', 'Muncul jamur jelaga hitam pada bagian yang lengket', '', 1.0),
('g10', 'G10', 'Bunga dan bakal buah layu dan gugur jika sudah parah', '', 0.6),
('g11', 'G11', 'Tunas muda dan bunga tampak berkerut dan tidak berkembang normal', '', 0.6),
('g12', 'G12', 'Terlihat dompolan atau koloni hama pada sisi batang yang terlindung dari cahaya atau teduh (jika sudah parah ditemukan di semua batang walaupaun yang terkena cahaya)', '', 1.0),
('g13', 'G13', 'Jika dompolan hama disingkirkan, terlihat bercak-bercak kecil dikelilingi warna kuning pada batang', '', 0.8),
('g14', 'G14', 'Warna hijau batang berubah menjadi kuning, semakin parah pada cabang yang terserang', '', 0.8),
('g15', 'G15', 'Pada kerusakan sangat parah, batang atau cabang menjadi busuk, lunak, dan berwarna kuning pekat hingga coklat', '', 0.6),
('g16', 'G16', 'Terdapat lubang kecil bekas tusukan pada kulit buah', '', 0.8),
('g17', 'G17', 'Terdapat bercak basah yang melebar pada permukaan buah', '', 0.6),
('g18', 'G18', 'Ditemukan ulat atau belatung berwarna putih di dalam buah jika dibelah', '', 1.0),
('g19', 'G19', 'Buah busuk dan gugur (sering dijumpai pada buah matang)', '', 0.4),
('g20', 'G20', 'Daging buah tampak kosong dan berlubang-lubang (tapi tidak selalu di sebabkan oleh lalat buah)', '', 0.6),
('g21', 'G21', 'Ditemukan bekicot masih menempel atau berada di dekat tanaman yang diserang', '', 0.8),
('g22', 'G22', 'Terdapat bekas gigitan bergerigi di pinggir maupun tengah batang atau sulur', '', 0.8),
('g23', 'G23', 'Ditemukan kotoran bekicot berwarna hitam di sekitar tanaman', '', 0.8),
('g24', 'G24', 'Terlihat jejak lendir mengkilap keperakan di sekitar batang', '', 0.2),
('g25', 'G25', 'Batang berlubang besar atau habis dimakan', '', 0.6),
('g26', 'G26', 'Tunas muda rusak atau cacat', '', 0.4),
('g27', 'G27', 'Batang muda atau tunas sobek dan berlubang akibat gigitan', '', 0.8),
('g28', 'G28', 'Terdapat luka berwarna coklat pada permukaan batang', '', 0.6),
('g29', 'G29', 'Bekas gigitan tampak mengering', '', 0.6),
('g30', 'G30', 'Kulit batang rusak dengan pola yang tidak beraturan', '', 0.4),
('g31', 'G31', 'Batang muda patah atau mati apabila sudah parah', '', 0.4),
('g32', 'G32', 'Batang terlihat kusam dan warna hijau memudar', '', 0.8),
('g33', 'G33', 'Muncul bintik-bintik kecil kuning atau putih pada permukaan batang', '', 1.0),
('g34', 'G34', 'Jaringan batang mengering dan berwarna kecoklatan', '', 0.4),
('g35', 'G35', 'Terdapat jaring-jaring halus seperti sarang laba-laba pada batang', '', 0.6),
('g36', 'G36', 'Tunas muda tumbuh tidak normal atau bentuknya cacat', '', 0.4),
('g37', 'G37', 'Batang mengering dan mati apabila sudah parah', '', 0.6),
('g38', 'G38', 'Muncul bintik putih kecil cekung, di tengah bintik ada seperti bekas tusukan jarum pada tunas, cabang muda, atau buah', '', 0.8),
('g39', 'G39', 'Bintik berubah warna menjadi coklat kemerahan', '', 0.8),
('g40', 'G40', 'Bintik-bintik menyatu menjadi bercak kuning-coklat hingga hitam dengan permukaan kasar', '', 0.8),
('g41', 'G41', 'Tunas muda mengering dan mati (apabila sudah parah)', '', 0.8),
('g42', 'G42', 'Pada batang tua muncul bercak 1-2 cm dengan lubang hitam di tengahnya', '', 0.8),
('g43', 'G43', 'Buah terlihat kasar dengan bercak-bercak yang sudah menyatu di permukaannya', '', 1.0),
('g44', 'G44', 'Apabila sudah parah, batang membusuk dan hancur menyisakan bagian berkayu dari batang', '', 0.8),
('g45', 'G45', 'Muncul bercak coklat cekung basah pada tunas atau buah yang mulai masak', '', 0.8),
('g46', 'G46', 'Bercak busuk berwarna coklat melebar dengan cepat terutama saat cuaca lembab', '', 0.8),
('g47', 'G47', 'Permukaan bercak terasa basah dan lunak saat ditekan', '', 0.6),
('g48', 'G48', 'Pada bercak lanjut terlihat massa spora berwarna jingga atau merah muda', '', 0.4),
('g49', 'G49', 'Buah membusuk, menjadi tidak layak konsumsi dan gugur', '', 0.6),
('g50', 'G50', 'Batang berubah warna menjadi kuning pada bagian yang terinfeksi', '', 0.8),
('g51', 'G51', 'Bercak coklat kekuningan meluas ke atas mengikuti arah batang', '', 0.8),
('g52', 'G52', 'Jika batang dipotong melintang, bagian dalamnya berwarna coklat', '', 0.8),
('g53', 'G53', 'Batang teraba lunak dan berair jika ditekan', '', 0.6),
('g54', 'G54', 'Kadang-kadang muncul benang-benang jamur putih atau merah muda pada permukaan batang saat cuaca lembab', '', 0.6),
('g55', 'G55', 'Batang rapuh dan mudah patah atau ambruk', '', 0.6),
('g56', 'G56', 'Stadium lanjut batang mengering dan berwarna coklat kehitaman', '', 0.6),
('g57', 'G57', 'Kuning lunak hancur dan meninggalkan bagian berkayu yang keras', '', 0.8),
('g58', 'G58', 'Tercium bau busuk yang menyengat dari batang yang sakit', '', 1.0),
('g59', 'G59', 'Keluar cairan kental berwarna putih kecoklatan dari batang', '', 0.8),
('g60', 'G60', 'Kulit batang mudah terkelupas dan bagian dalamnya membusuk', '', 0.6),
('g61', 'G61', 'Batang berubah warna dari hijau menjadi kuning kecoklatan hingga hitam', '', 0.6),
('g62', 'G62', 'Muncul bercak kecil coklat muda kasar seperti koreng pada batang atau buah', '', 0.8),
('g63', 'G63', 'Bercak membesar dengan permukaan yang kering dan keras', '', 0.8),
('g64', 'G64', 'Pinggiran bercak berwarna lebih gelap dibanding bagian tengahnya', '', 0.6),
('g65', 'G65', 'Apabila sudah parah bercak menyatu dan menutupi area yang luas', '', 0.6),
('g66', 'G66', 'Saat cuaca lembab terlihat titik-titik hitam kecil pada permukaan bercak', '', 0.6),
('g67', 'G67', 'Muncul bercak kecil di tunas muda yang berubah warna menjadi jingga', '', 0.8),
('g68', 'G68', 'Batang tampak belang-belang kuning dan hijau tidak merata', '', 0.8),
('g69', 'G69', 'Ada bercak mati di batang dewasa dan permukaan buah', '', 0.6),
('g70', 'G70', 'Batang menunjukkan bintik-bintik pucat dan lingkaran mati', '', 0.6),
('g71', 'G71', 'Tunas baru tumbuh tidak normal dan bentuknya tidak beraturan', '', 0.8),
('g72', 'G72', 'Ada benjolan atau bisul pada akar saat tanaman dicabut', '', 1.0),
('g73', 'G73', 'Akar sedikit, pendek, dan tidak berkembang dengan baik', '', 0.8),
('g74', 'G74', 'Batang atau daun menguning walaupun pemeliharaannya sama dengan batang yang lain', '', 0.4),
('g75', 'G75', 'Tanaman tumbuh kerdil atau pertumbuhannya lambat', '', 0.6),
('g76', 'G76', 'Akar berwarna coklat kehitaman dan mudah busuk', '', 0.6)
ON CONFLICT (id) DO NOTHING;

-- ===== INSERT RULES =====
INSERT INTO rules (id, penyakit_id, gejala_ids) VALUES
('r01', 'h01', ARRAY['g01','g02','g03','g04','g05','g06']),
('r02', 'h02', ARRAY['g07','g08','g09','g10','g11']),
('r03', 'h03', ARRAY['g12','g13','g14','g15']),
('r04', 'h04', ARRAY['g16','g17','g18','g19','g20']),
('r05', 'h05', ARRAY['g21','g22','g23','g24','g25','g26']),
('r06', 'h06', ARRAY['g27','g28','g29','g30','g31']),
('r07', 'h07', ARRAY['g32','g33','g34','g35','g36','g37']),
('r08', 'p01', ARRAY['g38','g39','g40','g41','g42','g43','g44']),
('r09', 'p02', ARRAY['g45','g46','g47','g48','g49']),
('r10', 'p03', ARRAY['g50','g51','g52','g53','g54','g55','g56','g57','g58','g59','g60','g61']),
('r11', 'p04', ARRAY['g62','g63','g64','g65','g66']),
('r12', 'p05', ARRAY['g67','g68','g69','g70','g71']),
('r13', 'p06', ARRAY['g72','g73','g74','g75','g76'])
ON CONFLICT (id) DO NOTHING;
