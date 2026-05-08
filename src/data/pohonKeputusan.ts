// ============================================================
// POHON KEPUTUSAN - FORWARD CHAINING
// Berdasarkan gambar pohon keputusan dari user
// ============================================================

export interface PohonNode {
  id: string;
  gejalaId: string;
  kodeGejala: string;
  namaGejala: string;
  deskripsi?: string;
  ya?: string;      // ID node jika jawaban YA
  tidak?: string;   // ID node jika jawaban TIDAK
  hasil?: string;   // ID penyakit jika ini leaf node
  cfPakar: number;  // CF dari pakar untuk gejala ini
}

// Pohon Keputusan - Struktur tree
export const pohonKeputusan: PohonNode[] = [
  // ===== ROOT NODE =====
  {
    id: 'root',
    gejalaId: 'g00',
    kodeGejala: 'G00',
    namaGejala: 'Apakah ditemukan serangga/hewan secara langsung, jejak lendir/jaring, cairan lengket, atau kerusakan fisik berupa gigitan/lubang pada tanaman?',
    deskripsi: 'Gejala pembeda utama antara hama dan penyakit',
    ya: 'hama_group',
    tidak: 'penyakit_group',
    cfPakar: 1.0
  },

  // ===== HAMA GROUP =====
  {
    id: 'hama_group',
    gejalaId: 'hama',
    kodeGejala: 'HAMA',
    namaGejala: 'Tanda-tanda menunjukkan adanya HAMA. Mari kita identifikasi jenis hama yang menyerang.',
    ya: 'h01_check',
    tidak: '',
    cfPakar: 1.0
  },

  // ===== H01: KUTU PUTIH =====
  {
    id: 'h01_check',
    gejalaId: 'g01',
    kodeGejala: 'G01',
    namaGejala: 'Apakah terdapat lapisan putih seperti kapas dan jejaring menempel pada batang dan buah?',
    ya: 'h01_g02',
    tidak: 'h02_check',
    cfPakar: 0.9
  },
  {
    id: 'h01_g02',
    gejalaId: 'g02',
    kodeGejala: 'G02',
    namaGejala: 'Apakah ditemukan individu atau kumpulan hama pada lapisan lilin atau di sekitarnya?',
    ya: 'h01_g03',
    tidak: 'h01_g05',
    cfPakar: 0.9
  },
  {
    id: 'h01_g03',
    gejalaId: 'g03',
    kodeGejala: 'G03',
    namaGejala: 'Apakah lapisan putih tersebut berlilin dan lengket jika dipegang?',
    ya: 'h01_confirmed',
    tidak: 'h01_g04',
    cfPakar: 0.85
  },
  {
    id: 'h01_g04',
    gejalaId: 'g04',
    kodeGejala: 'G04',
    namaGejala: 'Apakah batang atau buah tampak kusam dan kotor?',
    ya: 'h01_confirmed',
    tidak: 'h02_check',
    cfPakar: 0.7
  },
  {
    id: 'h01_g05',
    gejalaId: 'g05',
    kodeGejala: 'G05',
    namaGejala: 'Apakah muncul jamur jelaga berwarna hitam pada permukaan yang diserang?',
    ya: 'h01_confirmed',
    tidak: 'h01_g06',
    cfPakar: 0.8
  },
  {
    id: 'h01_g06',
    gejalaId: 'g06',
    kodeGejala: 'G06',
    namaGejala: 'Apakah sering ditemukan adanya semut di sekitar lapisan putih?',
    ya: 'h01_confirmed',
    tidak: 'h02_check',
    cfPakar: 0.75
  },
  {
    id: 'h01_confirmed',
    gejalaId: 'h01',
    kodeGejala: 'H01',
    namaGejala: 'Hasil: Kutu Putih terdeteksi!',
    hasil: 'h01',
    cfPakar: 0.95
  },

  // ===== H02: APHIDS =====
  {
    id: 'h02_check',
    gejalaId: 'g07',
    kodeGejala: 'G07',
    namaGejala: 'Apakah ditemukan kumpulan kutu kecil berwarna hijau atau hitam pada batang, kelopak bunga, atau sisik buah?',
    ya: 'h02_g08',
    tidak: 'h03_check',
    cfPakar: 0.9
  },
  {
    id: 'h02_g08',
    gejalaId: 'g08',
    kodeGejala: 'G08',
    namaGejala: 'Apakah permukaan batang, bunga, atau buah tampak lengket akibat cairan madu (honeydew)?',
    ya: 'h02_confirmed',
    tidak: 'h02_g10',
    cfPakar: 0.85
  },
  {
    id: 'h02_g10',
    gejalaId: 'g10',
    kodeGejala: 'G10',
    namaGejala: 'Apakah bunga dan bakal buah layu dan gugur?',
    ya: 'h02_confirmed',
    tidak: 'h02_g11',
    cfPakar: 0.75
  },
  {
    id: 'h02_g11',
    gejalaId: 'g11',
    kodeGejala: 'G11',
    namaGejala: 'Apakah tunas muda dan bunga tampak berkerut dan tidak berkembang normal?',
    ya: 'h02_confirmed',
    tidak: 'h03_check',
    cfPakar: 0.8
  },
  {
    id: 'h02_confirmed',
    gejalaId: 'h02',
    kodeGejala: 'H02',
    namaGejala: 'Hasil: Aphids (Kutu Daun) terdeteksi!',
    hasil: 'h02',
    cfPakar: 0.95
  },

  // ===== H03: KUTU SISIK =====
  {
    id: 'h03_check',
    gejalaId: 'g12',
    kodeGejala: 'G12',
    namaGejala: 'Apakah terlihat dompolan atau koloni hama pada sisi batang yang terlindung dari cahaya atau teduh?',
    ya: 'h03_g13',
    tidak: 'h04_check',
    cfPakar: 0.9
  },
  {
    id: 'h03_g13',
    gejalaId: 'g13',
    kodeGejala: 'G13',
    namaGejala: 'Jika dompolan hama disingkirkan, apakah terlihat bercak-bercak kecil dikelilingi warna kuning pada batang?',
    ya: 'h03_confirmed',
    tidak: 'h03_g14',
    cfPakar: 0.85
  },
  {
    id: 'h03_g14',
    gejalaId: 'g14',
    kodeGejala: 'G14',
    namaGejala: 'Apakah warna hijau batang berubah menjadi kuning, semakin parah pada cabang yang terserang?',
    ya: 'h03_confirmed',
    tidak: 'h03_g15',
    cfPakar: 0.8
  },
  {
    id: 'h03_g15',
    gejalaId: 'g15',
    kodeGejala: 'G15',
    namaGejala: 'Apakah batang atau cabang menjadi busuk, lunak, dan berwarna kuning pekat hingga coklat pada kerusakan parah?',
    ya: 'h03_confirmed',
    tidak: 'h04_check',
    cfPakar: 0.85
  },
  {
    id: 'h03_confirmed',
    gejalaId: 'h03',
    kodeGejala: 'H03',
    namaGejala: 'Hasil: Kutu Sisik terdeteksi!',
    hasil: 'h03',
    cfPakar: 0.95
  },

  // ===== H04: LALAT BUAH =====
  {
    id: 'h04_check',
    gejalaId: 'g16',
    kodeGejala: 'G16',
    namaGejala: 'Apakah terdapat lubang kecil bekas tusukan pada kulit buah?',
    ya: 'h04_g18',
    tidak: 'h05_check',
    cfPakar: 0.9
  },
  {
    id: 'h04_g18',
    gejalaId: 'g18',
    kodeGejala: 'G18',
    namaGejala: 'Apakah ditemukan ulat atau belatung berwarna putih di dalam buah jika dibelah?',
    ya: 'h04_confirmed',
    tidak: 'h04_g19',
    cfPakar: 0.95
  },
  {
    id: 'h04_g19',
    gejalaId: 'g19',
    kodeGejala: 'G19',
    namaGejala: 'Apakah buah busuk dan gugur?',
    ya: 'h04_confirmed',
    tidak: 'h04_g20',
    cfPakar: 0.8
  },
  {
    id: 'h04_g20',
    gejalaId: 'g20',
    kodeGejala: 'G20',
    namaGejala: 'Apakah daging buah tampak kosong dan berlubang-lubang?',
    ya: 'h04_confirmed',
    tidak: 'h05_check',
    cfPakar: 0.75
  },
  {
    id: 'h04_confirmed',
    gejalaId: 'h04',
    kodeGejala: 'H04',
    namaGejala: 'Hasil: Lalat Buah terdeteksi!',
    hasil: 'h04',
    cfPakar: 0.95
  },

  // ===== H05: BEKICOT =====
  {
    id: 'h05_check',
    gejalaId: 'g21',
    kodeGejala: 'G21',
    namaGejala: 'Apakah terdapat bekas gigitan bergerigi di pinggir maupun tengah batang atau sulur?',
    ya: 'h05_g22',
    tidak: 'h06_check',
    cfPakar: 0.9
  },
  {
    id: 'h05_g22',
    gejalaId: 'g22',
    kodeGejala: 'G22',
    namaGejala: 'Apakah ditemukan bekicot masih menempel atau berada di dekat tanaman yang diserang?',
    ya: 'h05_confirmed',
    tidak: 'h05_g23',
    cfPakar: 0.95
  },
  {
    id: 'h05_g23',
    gejalaId: 'g23',
    kodeGejala: 'G23',
    namaGejala: 'Apakah ditemukan kotoran bekicot berwarna hitam di sekitar tanaman?',
    ya: 'h05_confirmed',
    tidak: 'h05_g24',
    cfPakar: 0.85
  },
  {
    id: 'h05_g24',
    gejalaId: 'g24',
    kodeGejala: 'G24',
    namaGejala: 'Apakah terlihat jejak lendir mengkilap keperakan di sekitar batang?',
    ya: 'h05_confirmed',
    tidak: 'h05_g25',
    cfPakar: 0.8
  },
  {
    id: 'h05_g25',
    gejalaId: 'g25',
    kodeGejala: 'G25',
    namaGejala: 'Apakah batang berlubang besar atau habis dimakan pada serangan parah?',
    ya: 'h05_confirmed',
    tidak: 'h06_check',
    cfPakar: 0.85
  },
  {
    id: 'h05_confirmed',
    gejalaId: 'h05',
    kodeGejala: 'H05',
    namaGejala: 'Hasil: Bekicot terdeteksi!',
    hasil: 'h05',
    cfPakar: 0.95
  },

  // ===== H06: BELALANG =====
  {
    id: 'h06_check',
    gejalaId: 'g27',
    kodeGejala: 'G27',
    namaGejala: 'Apakah batang muda atau tunas sobek dan berlubang akibat gigitan?',
    ya: 'h06_g28',
    tidak: 'h07_check',
    cfPakar: 0.85
  },
  {
    id: 'h06_g28',
    gejalaId: 'g28',
    kodeGejala: 'G28',
    namaGejala: 'Apakah terdapat luka berwarna coklat pada permukaan batang?',
    ya: 'h06_confirmed',
    tidak: 'h06_g31',
    cfPakar: 0.8
  },
  {
    id: 'h06_g31',
    gejalaId: 'g31',
    kodeGejala: 'G31',
    namaGejala: 'Apakah batang muda patah atau mati pada serangan yang parah?',
    ya: 'h06_confirmed',
    tidak: 'h07_check',
    cfPakar: 0.85
  },
  {
    id: 'h06_confirmed',
    gejalaId: 'h06',
    kodeGejala: 'H06',
    namaGejala: 'Hasil: Belalang terdeteksi!',
    hasil: 'h06',
    cfPakar: 0.95
  },

  // ===== H07: TUNGAU =====
  {
    id: 'h07_check',
    gejalaId: 'g32',
    kodeGejala: 'G32',
    namaGejala: 'Apakah muncul bintik-bintik kecil kuning atau putih pada permukaan batang?',
    ya: 'h07_g33',
    tidak: 'hama_not_found',
    cfPakar: 0.8
  },
  {
    id: 'h07_g33',
    gejalaId: 'g33',
    kodeGejala: 'G33',
    namaGejala: 'Apakah terdapat jaring-jaring halus seperti sarang laba-laba pada batang?',
    ya: 'h07_confirmed',
    tidak: 'h07_g34',
    cfPakar: 0.85
  },
  {
    id: 'h07_g34',
    gejalaId: 'g34',
    kodeGejala: 'G34',
    namaGejala: 'Apakah jaringan batang mengering dan berwarna kecoklatan?',
    ya: 'h07_confirmed',
    tidak: 'h07_g35',
    cfPakar: 0.8
  },
  {
    id: 'h07_g35',
    gejalaId: 'g35',
    kodeGejala: 'G35',
    namaGejala: 'Apakah batang terlihat kusam dan warna hijau memudar?',
    ya: 'h07_confirmed',
    tidak: 'h07_g36',
    cfPakar: 0.75
  },
  {
    id: 'h07_g36',
    gejalaId: 'g36',
    kodeGejala: 'G36',
    namaGejala: 'Apakah tunas muda tumbuh tidak normal atau bentuknya cacat?',
    ya: 'h07_confirmed',
    tidak: 'h07_g37',
    cfPakar: 0.8
  },
  {
    id: 'h07_g37',
    gejalaId: 'g37',
    kodeGejala: 'G37',
    namaGejala: 'Apakah batang mengering dan mati pada serangan yang parah?',
    ya: 'h07_confirmed',
    tidak: 'hama_not_found',
    cfPakar: 0.85
  },
  {
    id: 'h07_confirmed',
    gejalaId: 'h07',
    kodeGejala: 'H07',
    namaGejala: 'Hasil: Tungau terdeteksi!',
    hasil: 'h07',
    cfPakar: 0.95
  },
  {
    id: 'hama_not_found',
    gejalaId: 'hama_not_found',
    kodeGejala: 'HAMA?',
    namaGejala: 'Hama tidak dapat diidentifikasi dari gejala yang diberikan. Mungkin ada faktor lain yang menyebabkan masalah pada tanaman.',
    hasil: 'hama_not_found',
    cfPakar: 0
  },

  // ===== PENYAKIT GROUP =====
  {
    id: 'penyakit_group',
    gejalaId: 'penyakit',
    kodeGejala: 'PENYAKIT',
    namaGejala: 'Tanda-tanda menunjukkan adanya PENYAKIT. Mari kita identifikasi jenis penyakit yang menyerang.',
    ya: 'p01_check',
    tidak: '',
    cfPakar: 1.0
  },

  // ===== P01: KANKER BATANG DAN BUAH =====
  {
    id: 'p01_check',
    gejalaId: 'g38',
    kodeGejala: 'G38',
    namaGejala: 'Apakah muncul bintik putih kecil cekung, di tengah bintik ada seperti bekas tusukan jarum pada tunas, cabang muda, atau buah?',
    ya: 'p01_g39',
    tidak: 'p02_check',
    cfPakar: 0.9
  },
  {
    id: 'p01_g39',
    gejalaId: 'g39',
    kodeGejala: 'G39',
    namaGejala: 'Apakah bintik berubah warna menjadi coklat kemerahan?',
    ya: 'p01_g40',
    tidak: 'p01_g42',
    cfPakar: 0.85
  },
  {
    id: 'p01_g40',
    gejalaId: 'g40',
    kodeGejala: 'G40',
    namaGejala: 'Apakah bintik-bintik menyatu menjadi bercak kuning-coklat hingga hitam dengan permukaan kasar?',
    ya: 'p01_confirmed',
    tidak: 'p01_g41',
    cfPakar: 0.85
  },
  {
    id: 'p01_g41',
    gejalaId: 'g41',
    kodeGejala: 'G41',
    namaGejala: 'Apakah tunas muda mengering dan mati?',
    ya: 'p01_confirmed',
    tidak: 'p02_check',
    cfPakar: 0.8
  },
  {
    id: 'p01_g42',
    gejalaId: 'g42',
    kodeGejala: 'G42',
    namaGejala: 'Apakah pada batang tua muncul bercak 1-2 cm dengan lubang hitam di tengahnya?',
    ya: 'p01_confirmed',
    tidak: 'p01_g43',
    cfPakar: 0.85
  },
  {
    id: 'p01_g43',
    gejalaId: 'g43',
    kodeGejala: 'G43',
    namaGejala: 'Apakah buah terlihat kasar dengan bercak-bercak yang sudah menyatu di permukaannya?',
    ya: 'p01_confirmed',
    tidak: 'p01_g44',
    cfPakar: 0.8
  },
  {
    id: 'p01_g44',
    gejalaId: 'g44',
    kodeGejala: 'G44',
    namaGejala: 'Apakah pada serangan lanjut, batang membusuk dan hancur menyisakan bagian berkayu?',
    ya: 'p01_confirmed',
    tidak: 'p02_check',
    cfPakar: 0.85
  },
  {
    id: 'p01_confirmed',
    gejalaId: 'p01',
    kodeGejala: 'P01',
    namaGejala: 'Hasil: Kanker Batang dan Buah terdeteksi!',
    hasil: 'p01',
    cfPakar: 0.95
  },

  // ===== P02: ANTRAKNOSA =====
  {
    id: 'p02_check',
    gejalaId: 'g45',
    kodeGejala: 'G45',
    namaGejala: 'Apakah muncul bercak coklat cekung basah pada tunas atau buah yang mulai masak?',
    ya: 'p02_g46',
    tidak: 'p03_check',
    cfPakar: 0.9
  },
  {
    id: 'p02_g46',
    gejalaId: 'g46',
    kodeGejala: 'G46',
    namaGejala: 'Apakah bercak busuk berwarna coklat melebar dengan cepat terutama saat cuaca lembab?',
    ya: 'p02_confirmed',
    tidak: 'p02_g47',
    cfPakar: 0.85
  },
  {
    id: 'p02_g47',
    gejalaId: 'g47',
    kodeGejala: 'G47',
    namaGejala: 'Apakah permukaan bercak terasa basah dan lunak saat ditekan?',
    ya: 'p02_confirmed',
    tidak: 'p02_g48',
    cfPakar: 0.8
  },
  {
    id: 'p02_g48',
    gejalaId: 'g48',
    kodeGejala: 'G48',
    namaGejala: 'Apakah pada bercak lanjut terlihat massa spora berwarna jingga atau merah muda?',
    ya: 'p02_confirmed',
    tidak: 'p02_g49',
    cfPakar: 0.85
  },
  {
    id: 'p02_g49',
    gejalaId: 'g49',
    kodeGejala: 'G49',
    namaGejala: 'Apakah buah membusuk, menjadi tidak layak konsumsi dan gugur?',
    ya: 'p02_confirmed',
    tidak: 'p03_check',
    cfPakar: 0.8
  },
  {
    id: 'p02_confirmed',
    gejalaId: 'p02',
    kodeGejala: 'P02',
    namaGejala: 'Hasil: Antraknosa terdeteksi!',
    hasil: 'p02',
    cfPakar: 0.95
  },

  // ===== P03: BUSUK BATANG =====
  {
    id: 'p03_check',
    gejalaId: 'g50',
    kodeGejala: 'G50',
    namaGejala: 'Apakah batang berubah warna menjadi kuning pada bagian yang terinfeksi?',
    ya: 'p03_g51',
    tidak: 'p04_check',
    cfPakar: 0.8
  },
  {
    id: 'p03_g51',
    gejalaId: 'g51',
    kodeGejala: 'G51',
    namaGejala: 'Apakah bercak coklat kekuningan meluas ke atas mengikuti arah batang?',
    ya: 'p03_g52',
    tidak: 'p03_g58',
    cfPakar: 0.85
  },
  {
    id: 'p03_g52',
    gejalaId: 'g52',
    kodeGejala: 'G52',
    namaGejala: 'Jika batang dipotong melintang, apakah bagian dalamnya berwarna coklat?',
    ya: 'p03_confirmed',
    tidak: 'p03_g53',
    cfPakar: 0.9
  },
  {
    id: 'p03_g53',
    gejalaId: 'g53',
    kodeGejala: 'G53',
    namaGejala: 'Apakah batang teraba lunak dan berair jika ditekan?',
    ya: 'p03_confirmed',
    tidak: 'p03_g55',
    cfPakar: 0.85
  },
  {
    id: 'p03_g55',
    gejalaId: 'g55',
    kodeGejala: 'G55',
    namaGejala: 'Apakah batang rapuh dan mudah patah atau ambruk?',
    ya: 'p03_confirmed',
    tidak: 'p03_g58',
    cfPakar: 0.85
  },
  {
    id: 'p03_g58',
    gejalaId: 'g58',
    kodeGejala: 'G58',
    namaGejala: 'Apakah tercium bau busuk yang menyengat dari batang yang sakit?',
    ya: 'p03_confirmed',
    tidak: 'p03_g59',
    cfPakar: 0.9
  },
  {
    id: 'p03_g59',
    gejalaId: 'g59',
    kodeGejala: 'G59',
    namaGejala: 'Apakah keluar cairan kental berwarna putih kecoklatan dari batang?',
    ya: 'p03_confirmed',
    tidak: 'p03_g60',
    cfPakar: 0.85
  },
  {
    id: 'p03_g60',
    gejalaId: 'g60',
    kodeGejala: 'G60',
    namaGejala: 'Apakah kulit batang mudah terkelupas dan bagian dalamnya membusuk?',
    ya: 'p03_confirmed',
    tidak: 'p04_check',
    cfPakar: 0.85
  },
  {
    id: 'p03_confirmed',
    gejalaId: 'p03',
    kodeGejala: 'P03',
    namaGejala: 'Hasil: Busuk Batang terdeteksi!',
    hasil: 'p03',
    cfPakar: 0.95
  },

  // ===== P04: KUDIS / SCAB =====
  {
    id: 'p04_check',
    gejalaId: 'g62',
    kodeGejala: 'G62',
    namaGejala: 'Apakah muncul bercak kecil coklat muda kasar seperti koreng pada batang atau buah?',
    ya: 'p04_g63',
    tidak: 'p05_check',
    cfPakar: 0.85
  },
  {
    id: 'p04_g63',
    gejalaId: 'g63',
    kodeGejala: 'G63',
    namaGejala: 'Apakah bercak membesar dengan permukaan yang kering dan keras?',
    ya: 'p04_confirmed',
    tidak: 'p04_g64',
    cfPakar: 0.8
  },
  {
    id: 'p04_g64',
    gejalaId: 'g64',
    kodeGejala: 'G64',
    namaGejala: 'Apakah pinggiran bercak berwarna lebih gelap dibanding bagian tengahnya?',
    ya: 'p04_confirmed',
    tidak: 'p04_g65',
    cfPakar: 0.75
  },
  {
    id: 'p04_g65',
    gejalaId: 'g65',
    kodeGejala: 'G65',
    namaGejala: 'Apakah pada serangan berat bercak menyatu dan menutupi area yang luas?',
    ya: 'p04_confirmed',
    tidak: 'p04_g66',
    cfPakar: 0.8
  },
  {
    id: 'p04_g66',
    gejalaId: 'g66',
    kodeGejala: 'G66',
    namaGejala: 'Saat cuaca lembab, apakah terlihat titik-titik hitam kecil pada permukaan bercak?',
    ya: 'p04_confirmed',
    tidak: 'p05_check',
    cfPakar: 0.85
  },
  {
    id: 'p04_confirmed',
    gejalaId: 'p04',
    kodeGejala: 'P04',
    namaGejala: 'Hasil: Kudis / Scab terdeteksi!',
    hasil: 'p04',
    cfPakar: 0.95
  },

  // ===== P05: MOSAIK / BERCAK NEKROTIK =====
  {
    id: 'p05_check',
    gejalaId: 'g67',
    kodeGejala: 'G67',
    namaGejala: 'Apakah muncul bercak kecil di tunas muda yang berubah warna menjadi jingga?',
    ya: 'p05_g68',
    tidak: 'p06_check',
    cfPakar: 0.8
  },
  {
    id: 'p05_g68',
    gejalaId: 'g68',
    kodeGejala: 'G68',
    namaGejala: 'Apakah batang tampak belang-belang kuning dan hijau tidak merata?',
    ya: 'p05_confirmed',
    tidak: 'p05_g69',
    cfPakar: 0.85
  },
  {
    id: 'p05_g69',
    gejalaId: 'g69',
    kodeGejala: 'G69',
    namaGejala: 'Apakah ada bercak mati di batang dewasa dan permukaan buah?',
    ya: 'p05_confirmed',
    tidak: 'p05_g70',
    cfPakar: 0.8
  },
  {
    id: 'p05_g70',
    gejalaId: 'g70',
    kodeGejala: 'G70',
    namaGejala: 'Apakah batang menunjukkan bintik-bintik pucat dan lingkaran mati?',
    ya: 'p05_confirmed',
    tidak: 'p05_g71',
    cfPakar: 0.85
  },
  {
    id: 'p05_g71',
    gejalaId: 'g71',
    kodeGejala: 'G71',
    namaGejala: 'Apakah tunas baru tumbuh tidak normal dan bentuknya tidak beraturan?',
    ya: 'p05_confirmed',
    tidak: 'p06_check',
    cfPakar: 0.8
  },
  {
    id: 'p05_confirmed',
    gejalaId: 'p05',
    kodeGejala: 'P05',
    namaGejala: 'Hasil: Mosaik / Bercak Nekrotik terdeteksi!',
    hasil: 'p05',
    cfPakar: 0.95
  },

  // ===== P06: PURU AKAR =====
  {
    id: 'p06_check',
    gejalaId: 'g72',
    kodeGejala: 'G72',
    namaGejala: 'Apakah ada benjolan atau bisul pada akar saat tanaman dicabut?',
    ya: 'p06_confirmed',
    tidak: 'p06_g73',
    cfPakar: 0.9
  },
  {
    id: 'p06_g73',
    gejalaId: 'g73',
    kodeGejala: 'G73',
    namaGejala: 'Apakah akar sedikit, pendek, dan tidak berkembang dengan baik?',
    ya: 'p06_confirmed',
    tidak: 'p06_g74',
    cfPakar: 0.85
  },
  {
    id: 'p06_g74',
    gejalaId: 'g74',
    kodeGejala: 'G74',
    namaGejala: 'Apakah batang atau daun menguning walaupun pemeliharaannya sama dengan batang yang lain?',
    ya: 'p06_confirmed',
    tidak: 'p06_g75',
    cfPakar: 0.8
  },
  {
    id: 'p06_g75',
    gejalaId: 'g75',
    kodeGejala: 'G75',
    namaGejala: 'Apakah tanaman tumbuh kerdil atau pertumbuhannya lambat?',
    ya: 'p06_confirmed',
    tidak: 'p06_g76',
    cfPakar: 0.85
  },
  {
    id: 'p06_g76',
    gejalaId: 'g76',
    kodeGejala: 'G76',
    namaGejala: 'Apakah akar berwarna coklat kehitaman dan mudah busuk?',
    ya: 'p06_confirmed',
    tidak: 'penyakit_not_found',
    cfPakar: 0.85
  },
  {
    id: 'p06_confirmed',
    gejalaId: 'p06',
    kodeGejala: 'P06',
    namaGejala: 'Hasil: Puru Akar terdeteksi!',
    hasil: 'p06',
    cfPakar: 0.95
  },
  {
    id: 'penyakit_not_found',
    gejalaId: 'penyakit_not_found',
    kodeGejala: 'PENYAKIT?',
    namaGejala: 'Penyakit tidak dapat diidentifikasi dari gejala yang diberikan. Mungkin ada faktor lain yang menyebabkan masalah pada tanaman.',
    hasil: 'penyakit_not_found',
    cfPakar: 0
  }
];

// Fungsi untuk mendapatkan node berdasarkan ID
export const getNodeById = (id: string): PohonNode | undefined => {
  return pohonKeputusan.find(n => n.id === id);
};

// Fungsi untuk mendapatkan node root
export const getRootNode = (): PohonNode => {
  return pohonKeputusan.find(n => n.id === 'root')!;
};
