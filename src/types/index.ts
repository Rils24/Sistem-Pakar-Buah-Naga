// Types for Sistem Pakar Buah Naga dengan Forward Chaining + Certainty Factor

// ============ DATA MASTER ============

export interface Penyakit {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string;
  solusi: string[];
  tipe: 'hama' | 'penyakit';
  created_at?: string;
}

export interface Gejala {
  id: string;
  kode: string;
  nama: string;
  deskripsi?: string;
  cf_pakar: number; // CF dari pakar untuk gejala ini (0-1)
  created_at?: string;
}

// Rule: Jika gejala X maka penyakit Y
// Forward Chaining: Dari gejala → Penyakit
export interface Rule {
  id: string;
  penyakit_id: string;
  penyakit_kode?: string;
  penyakit_nama?: string;
  gejala_ids: string[]; // List gejala yang harus ada
  gejala_list?: Gejala[]; // Detail gejala (untuk tampilan)
  // Tidak ada cf_pakar di rule lagi - CF hanya di gejala
  created_at?: string;
}

// ============ USER & AUTH ============

export interface User {
  id: string;
  nama: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  created_at?: string;
}

// ============ DIAGNOSA ============

// Forward Chaining: Mulai dari gejala yang dipilih user
// Lalu cocokkan dengan rules untuk dapatkan penyakit
// Baru hitung CF untuk tingkat kepastian

export interface DiagnosaForm {
  gejalaId: string;
  cfUser: number; // Keyakinan user: 0, 0.2, 0.4, 0.6, 0.8, 1.0
}

// Hasil Forward Chaining + CF
export interface HasilDiagnosa {
  id: string;
  user_id: string;
  tanggal: string;
  
  // Forward Chaining: Gejala yang dipilih
  gejala_dipilih: {
    gejala_id: string;
    nama_gejala: string;
    cf_user: number;
    cf_pakar: number; // CF gejala dari pakar
  }[];
  
  // Forward Chaining: Rules yang cocok
  rules_cocok: {
    rule_id: string;
    penyakit_id: string;
    nama_penyakit: string;
    gejala_cocok: string[];
  }[];
  
  // Hasil CF per penyakit
  hasil_cf: {
    penyakit_id: string;
    nama_penyakit: string;
    cf_value: number;
    persentase: number;
    detail_perhitungan: {
      gejala_id: string;
      nama_gejala: string;
      cf_user: number;
      cf_pakar: number;
      cf_hasil: number; // cf_user × cf_pakar
    }[];
  }[];
  
  // Kesimpulan
  penyakit_terpilih: string;
  nama_penyakit_terpilih: string;
  cf_tertinggi: number;
  solusi: string[];
}

// ============ FORWARD CHAINING ============

// Interface untuk hasil Forward Chaining
export interface ForwardChainingResult {
  penyakitId: string;
  namaPenyakit: string;
  gejalaCocok: string[]; // Gejala yang cocok dengan rule
  semuaGejalaTerpenuhi: boolean; // Apakah semua gejala dalam rule terpenuhi
}

// Interface untuk hasil CF setelah Forward Chaining
export interface CFResult {
  penyakitId: string;
  namaPenyakit: string;
  cfValue: number;
  persentase: number;
  matchedGejala: {
    gejalaId: string;
    namaGejala: string;
    cfUser: number;
    cfPakar: number; // CF dari pakar untuk gejala ini
    cfHasil: number; // cf_user × cf_pakar
  }[];
  detailPerhitungan: {
    step: number;
    gejalaNama: string;
    cfUser: number;
    cfPakar: number;
    cfHasil: number;
    cfKombinasi: number;
    rumus: string;
  }[];
}
