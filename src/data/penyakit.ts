// ============================================================
// DATA HAMA & PENYAKIT BUAH NAGA
// Hama: H01 - H07 (7 hama)
// Penyakit: P01 - P06 (6 penyakit)
// ============================================================

import type { Penyakit } from '@/types';

export const penyakitBuahNaga: Penyakit[] = [
  // ===== HAMA =====
  {
    id: 'h01',
    kode: 'H01',
    nama: 'Kutu Putih',
    deskripsi: 'Hama kutu putih (Planococcus citri) menyerang batang dan buah buah naga dengan membentuk lapisan putih seperti kapas. Hama ini menghisap cairan tanaman dan mengeluarkan honeydew yang menimbulkan jamur jelaga.',
    solusi: [
      'Gunakan sikat atau kain kasar untuk membersihkan lapisan putih dari batang',
      'Semprot insektisida berbahan aktif imidacloprid atau acetamiprid',
      'Gunakan predator alami seperti kutu ladybug (Cryptolaemus montrouzieri)',
      'Pangkas bagian tanaman yang terserang berat dan musnahkan',
      'Kontrol populasi semut yang menjadi "penggembala" kutu putih'
    ],
    tipe: 'hama'
  },
  {
    id: 'h02',
    kode: 'H02',
    nama: 'Aphids (Kutu Daun)',
    deskripsi: 'Kutu daun (Aphis gossypii) adalah hama kecil berwarna hijau atau hitam yang berkumpul pada batang, kelopak bunga, dan sisik buah. Mereka menghisap cairan tanaman dan mengeluarkan honeydew.',
    solusi: [
      'Semprot air bertekanan untuk membilas kutu daun dari tanaman',
      'Aplikasikan insektisida nabati seperti ekstrak daun nimba',
      'Gunakan insektisida berbahan aktif diazinon atau malathion jika serangan parah',
      'Taruh perangkap kuning (yellow sticky trap) untuk menangkap kutu daun terbang',
      'Pertahankan populasi predator alami seperti kepik dan lacewing'
    ],
    tipe: 'hama'
  },
  {
    id: 'h03',
    kode: 'H03',
    nama: 'Kutu Sisik',
    deskripsi: 'Kutu sisik (Coccus hesperidum) menempel pada sisi batang yang teduh membentuk dompolan atau koloni. Mereka menghisap cairan tanaman dan mengeluarkan honeydew yang menimbulkan jamur jelaga.',
    solusi: [
      'Bersihkan dompolan kutu sisik dengan sikat atau kain kasar yang direndam alkohol',
      'Semprot minyak hortikultura (horticultural oil) untuk melembabkan dan membunuh kutu sisik',
      'Aplikasikan insektisida sistemik berbahan aktif imidacloprid',
      'Pangkas bagian batang yang terserang berat',
      'Gunakan predator alami seperti parasitoid wasp (Metaphycus luteolus)'
    ],
    tipe: 'hama'
  },
  {
    id: 'h04',
    kode: 'H04',
    nama: 'Lalat Buah',
    deskripsi: 'Lalat buah (Bactrocera spp.) menyerang buah naga yang mulai masak dengan menusuk kulit buah untuk bertelur. Ulat yang menetas akan memakan daging buah menyebabkan buah busuk.',
    solusi: [
      'Gunakan perangkap feromon untuk menangkap lalat buah dewasa',
      'Kumpulkan dan musnahkan buah yang jatuh atau busuk',
      'Semprot insektisida berbahan aktif spinosad atau malathion pada buah',
      'Gunakan kantong netting untuk melindungi buah dari serangan lalat',
      'Panen buah sebelum terlalu matang untuk mengurangi serangan'
    ],
    tipe: 'hama'
  },
  {
    id: 'h05',
    kode: 'H05',
    nama: 'Bekicot',
    deskripsi: 'Bekicot adalah hama moluska yang memakan batang, tunas, dan daun buah naga terutama pada malam hari atau saat cuaca lembab. Mereka meninggalkan jejak lendir dan gigitan bergerigi.',
    solusi: [
      'Pungut dan musnahkan bekicot secara manual terutama di malam hari',
      'Buat barier garam atau kapur di sekeliling tanaman',
      'Gunakan umpan beracun berbahan aktif metaldehyde',
      'Bersihkan gulma di sekitar tanaman untuk mengurangi tempat persembunyian',
      'Gunakan perangkap bir biru (beer trap) untuk menarik dan menangkap bekicot'
    ],
    tipe: 'hama'
  },
  {
    id: 'h06',
    kode: 'H06',
    nama: 'Belalang',
    deskripsi: 'Belalang dapat merusak tunas muda dan batang buah naga dengan menggigit dan memakan jaringan tanaman. Kerusakan biasanya terlihat sebagai luka coklat atau batang yang patah.',
    solusi: [
      'Tangkap belalang secara manual jika jumlahnya sedikit',
      'Gunakan insektisida berbahan aktif malathion atau diazinon',
      'Semprot BT (Bacillus thuringiensis) untuk mengendalikan belalang muda',
      'Buat perangkap cahaya untuk menarik dan menangkap belalang dewasa',
      'Pertahankan habitat alami predator seperti burung dan kodok'
    ],
    tipe: 'hama'
  },
  {
    id: 'h07',
    kode: 'H07',
    nama: 'Tungau',
    deskripsi: 'Tungau laba-laba (Tetranychus urticae) adalah hama kecil yang menyebabkan bintik-bintik kuning atau putih pada batang. Mereka membentuk jaring halus dan dapat menyebabkan batang mengering.',
    solusi: [
      'Semprot air bertekanan tinggi untuk membilas tungau dari tanaman',
      'Aplikasikan akarisida berbahan aktif abamectin atau dicofol',
      'Gunakan minyak neem (neem oil) untuk mengendalikan populasi tungau',
      'Jaga kelembaban tanaman karena tungau menyukai kondisi kering',
      'Gunakan predator alami seperti kutu ladybug dan lacewing'
    ],
    tipe: 'hama'
  },

  // ===== PENYAKIT =====
  {
    id: 'p01',
    kode: 'P01',
    nama: 'Kanker Batang dan Buah',
    deskripsi: 'Penyakit kanker disebabkan oleh bakteri atau jamur yang menyebabkan munculnya bintik putih kecil cekung pada tunas, cabang, atau buah. Bintik berkembang menjadi bercak coklat kemerahan hingga hitam.',
    solusi: [
      'Pangkas bagian tanaman yang terserang dan bakar untuk mencegah penyebaran',
      'Semprot fungisida berbahan aktif mankozeb atau kuprum oksiklorida',
      'Aplikasikan bakterisida berbahan aktif streptomisin sulfat jika disebabkan bakteri',
      'Hindari luka pada batang saat pemeliharaan',
      'Jaga sirkulasi udara yang baik dan hindari kelembaban berlebih'
    ],
    tipe: 'penyakit'
  },
  {
    id: 'p02',
    kode: 'P02',
    nama: 'Antraknosa',
    deskripsi: 'Antraknosa disebabkan oleh jamur Colletotrichum spp. yang menyebabkan bercak coklat cekung basah pada tunas dan buah. Bercak melebar dengan cepat saat cuaca lembab dan menghasilkan massa spora berwarna jingga.',
    solusi: [
      'Pangkas dan musnahkan bagian tanaman yang terserang',
      'Semprot fungisida berbahan aktif klorotalonil atau metil tiofanat',
      'Hindari penyiraman dari atas yang dapat menyebarkan spora',
      'Jarak tanam yang cukup untuk sirkulasi udara yang baik',
      'Panen buah pada waktu yang tepat dan hindari luka saat panen'
    ],
    tipe: 'penyakit'
  },
  {
    id: 'p03',
    kode: 'P03',
    nama: 'Busuk Batang',
    deskripsi: 'Busuk batang disebabkan oleh jamur Fusarium dan bakteri yang menyebabkan batang berubah warna menjadi kuning, lunak, dan berair. Stadium lanjut batang mengering dan berwarna coklat kehitaman.',
    solusi: [
      'Cabut dan musnahkan tanaman yang terinfeksi berat',
      'Pangkas bagian batang yang busuk hingga ke jaringan sehat',
      'Oleskan fungisida pasta (pasta bordeaux) pada luka pangkasan',
      'Perbaiki drainase tanah untuk mengurangi kelembaban',
      'Rotasi tanaman dan sterilisasi media tanam'
    ],
    tipe: 'penyakit'
  },
  {
    id: 'p04',
    kode: 'P04',
    nama: 'Kudis / Scab',
    deskripsi: 'Kudis (scab) disebabkan oleh jamur Elsinoe spp. yang menyebabkan munculnya bercak kecil coklat muda kasar seperti koreng pada batang atau buah. Bercak membesar dengan permukaan kering dan keras.',
    solusi: [
      'Pangkas bagian yang terserang dan musnahkan',
      'Semprot fungisida berbahan aktif mankozeb atau klorotalonil',
      'Jaga kebersihan kebun dan buang gulma secara rutin',
      'Hindari penyiraman yang membasahi batang dan buah',
      'Aplikasikan fungisida preventif saat cuaca lembab'
    ],
    tipe: 'penyakit'
  },
  {
    id: 'p05',
    kode: 'P05',
    nama: 'Mosaik / Bercak Nekrotik',
    deskripsi: 'Mosaik atau bercak nekrotik disebabkan oleh virus yang menyebabkan batang tampak belang-belang kuning dan hijau tidak merata. Tunas baru tumbuh tidak normal dan bentuknya cacat.',
    solusi: [
      'Cabut dan musnahkan tanaman yang terinfeksi virus',
      'Kontrol vektor serangga (kutu daun, thrips) dengan insektisida',
      'Gunakan alat pertanian yang steril',
      'Pilih bibit dari tanaman yang sehat dan bebas virus',
      'Isolasi tanaman baru sebelum ditanam di kebun'
    ],
    tipe: 'penyakit'
  },
  {
    id: 'p06',
    kode: 'P06',
    nama: 'Puru Akar',
    deskripsi: 'Puru akar disebabkan oleh bakteri Agrobacterium tumefaciens yang menyebabkan benjolan atau bisul pada akar. Tanaman tumbuh kerdil, akar tidak berkembang, dan batang menguning.',
    solusi: [
      'Cabut dan musnahkan tanaman yang terinfeksi beserta akarnya',
      'Sterilisasi tanah dengan solarisasi sebelum penanaman',
      'Gunakan varietas yang tahan terhadap puru akar',
      'Hindari luka pada akar saat penanaman',
      'Perbaiki drainase tanah untuk mengurangi kelembaban'
    ],
    tipe: 'penyakit'
  }
];

export const getPenyakitById = (id: string): Penyakit | undefined => {
  return penyakitBuahNaga.find(p => p.id === id);
};

export const getPenyakitByKode = (kode: string): Penyakit | undefined => {
  return penyakitBuahNaga.find(p => p.kode === kode);
};

export const getAllHama = (): Penyakit[] => {
  return penyakitBuahNaga.filter(p => p.tipe === 'hama');
};

export const getAllPenyakit = (): Penyakit[] => {
  return penyakitBuahNaga.filter(p => p.tipe === 'penyakit');
};
