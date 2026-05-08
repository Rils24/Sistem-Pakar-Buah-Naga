// ============================================================
// DATA GEJALA HAMA & PENYAKIT BUAH NAGA
// Kode: G00 - G76 (77 gejala)
// ============================================================

import type { Gejala } from '@/types';

export const gejalaBuahNaga: Gejala[] = [
  // ===== GEJALA PEMBEDA (ROOT) =====
  {
    id: 'g00',
    kode: 'G00',
    nama: 'Ditemukan serangga/hewan secara langsung, jejak lendir/jaring, cairan lengket, atau kerusakan fisik berupa gigitan/lubang pada tanaman',
    deskripsi: 'Gejala pembeda utama: apakah ada tanda-tanda serangan hama/penyakit secara fisik?',
    cf_pakar: 1.0
  },

  // ===== H01: KUTU PUTIH =====
  {
    id: 'g01',
    kode: 'G01',
    nama: 'Terdapat lapisan putih seperti kapas dan jejaring menempel pada batang dan buah',
    deskripsi: '',
    cf_pakar: 0.9
  },
  {
    id: 'g02',
    kode: 'G02',
    nama: 'Ditemukan individu atau kumpulan hama pada lapisan lilin atau di sekitarnya',
    deskripsi: '',
    cf_pakar: 0.9
  },
  {
    id: 'g03',
    kode: 'G03',
    nama: 'Lapisan putih berlilin dan lengket jika dipegang',
    deskripsi: '',
    cf_pakar: 0.85
  },
  {
    id: 'g04',
    kode: 'G04',
    nama: 'Batang atau buah tampak kusam dan kotor',
    deskripsi: '',
    cf_pakar: 0.7
  },
  {
    id: 'g05',
    kode: 'G05',
    nama: 'Muncul jamur jelaga berwarna hitam pada permukaan yang diserang',
    deskripsi: '',
    cf_pakar: 0.8
  },
  {
    id: 'g06',
    kode: 'G06',
    nama: 'Jika ada kutu putih sering ditemukan adanya semut',
    deskripsi: '',
    cf_pakar: 0.75
  },

  // ===== H02: APHIDS (KUTU DAUN) =====
  {
    id: 'g07',
    kode: 'G07',
    nama: 'Ditemukan kumpulan kutu kecil berwarna hijau atau hitam pada batang, kelopak bunga, atau sisik buah',
    deskripsi: '',
    cf_pakar: 0.9
  },
  {
    id: 'g08',
    kode: 'G08',
    nama: 'Permukaan batang, bunga, atau buah tampak lengket akibat cairan madu (honeydew)',
    deskripsi: '',
    cf_pakar: 0.85
  },
  {
    id: 'g09',
    kode: 'G09',
    nama: 'Muncul jamur jelaga hitam pada bagian yang lengket',
    deskripsi: '',
    cf_pakar: 0.8
  },
  {
    id: 'g10',
    kode: 'G10',
    nama: 'Bunga dan bakal buah layu dan gugur jika serangan parah',
    deskripsi: '',
    cf_pakar: 0.75
  },
  {
    id: 'g11',
    kode: 'G11',
    nama: 'Tunas muda dan bunga tampak berkerut dan tidak berkembang normal',
    deskripsi: '',
    cf_pakar: 0.8
  },

  // ===== H03: KUTU SISIK =====
  {
    id: 'g12',
    kode: 'G12',
    nama: 'Terlihat dompolan atau koloni hama pada sisi batang yang terlindung dari cahaya atau teduh',
    deskripsi: 'Jika sudah parah ditemukan di semua batang walaupun yang terkena cahaya',
    cf_pakar: 0.9
  },
  {
    id: 'g13',
    kode: 'G13',
    nama: 'Jika dompolan hama disingkirkan, terlihat bercak-bercak kecil dikelilingi warna kuning pada batang',
    deskripsi: '',
    cf_pakar: 0.85
  },
  {
    id: 'g14',
    kode: 'G14',
    nama: 'Warna hijau batang berubah menjadi kuning, semakin parah pada cabang yang terserang',
    deskripsi: '',
    cf_pakar: 0.8
  },
  {
    id: 'g15',
    kode: 'G15',
    nama: 'Pada kerusakan sangat parah, batang atau cabang menjadi busuk, lunak, dan berwarna kuning pekat hingga coklat',
    deskripsi: '',
    cf_pakar: 0.85
  },

  // ===== H04: LALAT BUAH =====
  {
    id: 'g16',
    kode: 'G16',
    nama: 'Terdapat lubang kecil bekas tusukan pada kulit buah',
    deskripsi: '',
    cf_pakar: 0.9
  },
  {
    id: 'g17',
    kode: 'G17',
    nama: 'Terdapat bercak basah yang melebar pada permukaan buah',
    deskripsi: '',
    cf_pakar: 0.85
  },
  {
    id: 'g18',
    kode: 'G18',
    nama: 'Ditemukan ulat atau belatung berwarna putih di dalam buah jika dibelah',
    deskripsi: '',
    cf_pakar: 0.95
  },
  {
    id: 'g19',
    kode: 'G19',
    nama: 'Buah busuk dan gugur (sering dijumpai pada buah matang)',
    deskripsi: '',
    cf_pakar: 0.8
  },
  {
    id: 'g20',
    kode: 'G20',
    nama: 'Daging buah tampak kosong dan berlubang-lubang',
    deskripsi: 'Tapi tidak selalu disebabkan oleh lalat buah',
    cf_pakar: 0.75
  },

  // ===== H05: BEKICOT =====
  {
    id: 'g21',
    kode: 'G21',
    nama: 'Terdapat bekas gigitan bergerigi di pinggir maupun tengah batang atau sulur',
    deskripsi: '',
    cf_pakar: 0.9
  },
  {
    id: 'g22',
    kode: 'G22',
    nama: 'Ditemukan bekicot masih menempel atau berada di dekat tanaman yang diserang',
    deskripsi: '',
    cf_pakar: 0.95
  },
  {
    id: 'g23',
    kode: 'G23',
    nama: 'Ditemukan kotoran bekicot berwarna hitam di sekitar tanaman',
    deskripsi: '',
    cf_pakar: 0.85
  },
  {
    id: 'g24',
    kode: 'G24',
    nama: 'Terlihat jejak lendir mengkilap keperakan di sekitar batang',
    deskripsi: '',
    cf_pakar: 0.8
  },
  {
    id: 'g25',
    kode: 'G25',
    nama: 'Batang berlubang besar atau habis dimakan pada serangan parah',
    deskripsi: '',
    cf_pakar: 0.85
  },
  {
    id: 'g26',
    kode: 'G26',
    nama: 'Tunas muda rusak atau cacat',
    deskripsi: '',
    cf_pakar: 0.75
  },

  // ===== H06: BELALANG =====
  {
    id: 'g27',
    kode: 'G27',
    nama: 'Batang muda atau tunas sobek dan berlubang akibat gigitan',
    deskripsi: '',
    cf_pakar: 0.85
  },
  {
    id: 'g28',
    kode: 'G28',
    nama: 'Terdapat luka berwarna coklat pada permukaan batang',
    deskripsi: '',
    cf_pakar: 0.8
  },
  {
    id: 'g29',
    kode: 'G29',
    nama: 'Bekas gigitan tampak mengering',
    deskripsi: '',
    cf_pakar: 0.75
  },
  {
    id: 'g30',
    kode: 'G30',
    nama: 'Kulit batang rusak dengan pola yang tidak beraturan',
    deskripsi: '',
    cf_pakar: 0.7
  },
  {
    id: 'g31',
    kode: 'G31',
    nama: 'Batang muda patah atau mati pada serangan yang parah',
    deskripsi: '',
    cf_pakar: 0.85
  },

  // ===== H07: TUNGAU =====
  {
    id: 'g32',
    kode: 'G32',
    nama: 'Muncul bintik-bintik kecil kuning atau putih pada permukaan batang',
    deskripsi: '',
    cf_pakar: 0.8
  },
  {
    id: 'g33',
    kode: 'G33',
    nama: 'Terdapat jaring-jaring halus seperti sarang laba-laba pada batang',
    deskripsi: '',
    cf_pakar: 0.85
  },
  {
    id: 'g34',
    kode: 'G34',
    nama: 'Jaringan batang mengering dan berwarna kecoklatan',
    deskripsi: '',
    cf_pakar: 0.8
  },
  {
    id: 'g35',
    kode: 'G35',
    nama: 'Batang terlihat kusam dan warna hijau memudar',
    deskripsi: '',
    cf_pakar: 0.75
  },
  {
    id: 'g36',
    kode: 'G36',
    nama: 'Tunas muda tumbuh tidak normal atau bentuknya cacat',
    deskripsi: '',
    cf_pakar: 0.8
  },
  {
    id: 'g37',
    kode: 'G37',
    nama: 'Batang mengering dan mati pada serangan yang parah',
    deskripsi: '',
    cf_pakar: 0.85
  },

  // ===== P01: KANKER BATANG DAN BUAH =====
  {
    id: 'g38',
    kode: 'G38',
    nama: 'Muncul bintik putih kecil cekung, di tengah bintik ada seperti bekas tusukan jarum pada tunas, cabang muda, atau buah',
    deskripsi: '',
    cf_pakar: 0.9
  },
  {
    id: 'g39',
    kode: 'G39',
    nama: 'Bintik berubah warna menjadi coklat kemerahan',
    deskripsi: '',
    cf_pakar: 0.85
  },
  {
    id: 'g40',
    kode: 'G40',
    nama: 'Bintik-bintik menyatu menjadi bercak kuning-coklat hingga hitam dengan permukaan kasar',
    deskripsi: '',
    cf_pakar: 0.85
  },
  {
    id: 'g41',
    kode: 'G41',
    nama: 'Tunas muda mengering dan mati (pada serangan sangat parah)',
    deskripsi: '',
    cf_pakar: 0.8
  },
  {
    id: 'g42',
    kode: 'G42',
    nama: 'Pada batang tua muncul bercak 1-2 cm dengan lubang hitam di tengahnya',
    deskripsi: '',
    cf_pakar: 0.85
  },
  {
    id: 'g43',
    kode: 'G43',
    nama: 'Buah terlihat kasar dengan bercak-bercak yang sudah menyatu di permukaannya',
    deskripsi: '',
    cf_pakar: 0.8
  },
  {
    id: 'g44',
    kode: 'G44',
    nama: 'Pada serangan lanjut, batang membusuk dan hancur menyisakan bagian berkayu dari batang',
    deskripsi: '',
    cf_pakar: 0.85
  },

  // ===== P02: ANTRAKNOSA =====
  {
    id: 'g45',
    kode: 'G45',
    nama: 'Muncul bercak coklat cekung basah pada tunas atau buah yang mulai masak',
    deskripsi: '',
    cf_pakar: 0.9
  },
  {
    id: 'g46',
    kode: 'G46',
    nama: 'Bercak busuk berwarna coklat melebar dengan cepat terutama saat cuaca lembab',
    deskripsi: '',
    cf_pakar: 0.85
  },
  {
    id: 'g47',
    kode: 'G47',
    nama: 'Permukaan bercak terasa basah dan lunak saat ditekan',
    deskripsi: '',
    cf_pakar: 0.8
  },
  {
    id: 'g48',
    kode: 'G48',
    nama: 'Pada bercak lanjut terlihat massa spora berwarna jingga atau merah muda',
    deskripsi: '',
    cf_pakar: 0.85
  },
  {
    id: 'g49',
    kode: 'G49',
    nama: 'Buah membusuk, menjadi tidak layak konsumsi dan gugur',
    deskripsi: '',
    cf_pakar: 0.8
  },

  // ===== P03: BUSUK BATANG =====
  {
    id: 'g50',
    kode: 'G50',
    nama: 'Batang berubah warna menjadi kuning pada bagian yang terinfeksi',
    deskripsi: '',
    cf_pakar: 0.8
  },
  {
    id: 'g51',
    kode: 'G51',
    nama: 'Bercak coklat kekuningan meluas ke atas mengikuti arah batang',
    deskripsi: '',
    cf_pakar: 0.85
  },
  {
    id: 'g52',
    kode: 'G52',
    nama: 'Jika batang dipotong melintang, bagian dalamnya berwarna coklat',
    deskripsi: '',
    cf_pakar: 0.9
  },
  {
    id: 'g53',
    kode: 'G53',
    nama: 'Batang teraba lunak dan berair jika ditekan',
    deskripsi: '',
    cf_pakar: 0.85
  },
  {
    id: 'g54',
    kode: 'G54',
    nama: 'Kadang-kadang muncul benang-benang jamur putih atau merah muda pada permukaan batang saat cuaca lembab',
    deskripsi: '',
    cf_pakar: 0.8
  },
  {
    id: 'g55',
    kode: 'G55',
    nama: 'Batang rapuh dan mudah patah atau ambruk',
    deskripsi: '',
    cf_pakar: 0.85
  },
  {
    id: 'g56',
    kode: 'G56',
    nama: 'Stadium lanjut batang mengering dan berwarna coklat kehitaman',
    deskripsi: '',
    cf_pakar: 0.8
  },
  {
    id: 'g57',
    kode: 'G57',
    nama: 'Kuning lunak hancur dan meninggalkan bagian berkayu yang keras',
    deskripsi: '',
    cf_pakar: 0.85
  },
  {
    id: 'g58',
    kode: 'G58',
    nama: 'Tercium bau busuk yang menyengat dari batang yang sakit',
    deskripsi: '',
    cf_pakar: 0.9
  },
  {
    id: 'g59',
    kode: 'G59',
    nama: 'Keluar cairan kental berwarna putih kecoklatan dari batang',
    deskripsi: '',
    cf_pakar: 0.85
  },
  {
    id: 'g60',
    kode: 'G60',
    nama: 'Kulit batang mudah terkelupas dan bagian dalamnya membusuk',
    deskripsi: '',
    cf_pakar: 0.85
  },
  {
    id: 'g61',
    kode: 'G61',
    nama: 'Batang berubah warna dari hijau menjadi kuning kecoklatan hingga hitam',
    deskripsi: '',
    cf_pakar: 0.8
  },

  // ===== P04: KUDIS / SCAB =====
  {
    id: 'g62',
    kode: 'G62',
    nama: 'Muncul bercak kecil coklat muda kasar seperti koreng pada batang atau buah',
    deskripsi: '',
    cf_pakar: 0.85
  },
  {
    id: 'g63',
    kode: 'G63',
    nama: 'Bercak membesar dengan permukaan yang kering dan keras',
    deskripsi: '',
    cf_pakar: 0.8
  },
  {
    id: 'g64',
    kode: 'G64',
    nama: 'Pinggiran bercak berwarna lebih gelap dibanding bagian tengahnya',
    deskripsi: '',
    cf_pakar: 0.75
  },
  {
    id: 'g65',
    kode: 'G65',
    nama: 'Pada serangan berat bercak menyatu dan menutupi area yang luas',
    deskripsi: '',
    cf_pakar: 0.8
  },
  {
    id: 'g66',
    kode: 'G66',
    nama: 'Saat cuaca lembab terlihat titik-titik hitam kecil pada permukaan bercak',
    deskripsi: '',
    cf_pakar: 0.85
  },

  // ===== P05: MOSAIK / BERCAK NEKROTIK =====
  {
    id: 'g67',
    kode: 'G67',
    nama: 'Muncul bercak kecil di tunas muda yang berubah warna menjadi jingga',
    deskripsi: '',
    cf_pakar: 0.8
  },
  {
    id: 'g68',
    kode: 'G68',
    nama: 'Batang tampak belang-belang kuning dan hijau tidak merata',
    deskripsi: '',
    cf_pakar: 0.85
  },
  {
    id: 'g69',
    kode: 'G69',
    nama: 'Ada bercak mati di batang dewasa dan permukaan buah',
    deskripsi: '',
    cf_pakar: 0.8
  },
  {
    id: 'g70',
    kode: 'G70',
    nama: 'Batang menunjukkan bintik-bintik pucat dan lingkaran mati',
    deskripsi: '',
    cf_pakar: 0.85
  },
  {
    id: 'g71',
    kode: 'G71',
    nama: 'Tunas baru tumbuh tidak normal dan bentuknya tidak beraturan',
    deskripsi: '',
    cf_pakar: 0.8
  },

  // ===== P06: PURU AKAR =====
  {
    id: 'g72',
    kode: 'G72',
    nama: 'Ada benjolan atau bisul pada akar saat tanaman dicabut',
    deskripsi: '',
    cf_pakar: 0.9
  },
  {
    id: 'g73',
    kode: 'G73',
    nama: 'Akar sedikit, pendek, dan tidak berkembang dengan baik',
    deskripsi: '',
    cf_pakar: 0.85
  },
  {
    id: 'g74',
    kode: 'G74',
    nama: 'Batang atau daun menguning walaupun pemeliharaannya sama dengan batang yang lain',
    deskripsi: '',
    cf_pakar: 0.8
  },
  {
    id: 'g75',
    kode: 'G75',
    nama: 'Tanaman tumbuh kerdil atau pertumbuhannya lambat',
    deskripsi: '',
    cf_pakar: 0.85
  },
  {
    id: 'g76',
    kode: 'G76',
    nama: 'Akar berwarna coklat kehitaman dan mudah busuk',
    deskripsi: '',
    cf_pakar: 0.85
  }
];

export const getGejalaById = (id: string): Gejala | undefined => {
  return gejalaBuahNaga.find(g => g.id === id);
};

export const getGejalaByKode = (kode: string): Gejala | undefined => {
  return gejalaBuahNaga.find(g => g.kode === kode);
};

export const getCfPakarGejala = (gejalaId: string): number => {
  const gejala = gejalaBuahNaga.find(g => g.id === gejalaId);
  return gejala?.cf_pakar || 0;
};
