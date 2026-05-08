// ============================================================
// ALGORITMA: FORWARD CHAINING + CERTAINTY FACTOR
// ============================================================
// 
// LANGKAH 1 - FORWARD CHAINING:
//   Dari gejala yang dipilih user → Cari rules yang cocok → Dapatkan penyakit
//
// LANGKAH 2 - CERTAINTY FACTOR:
//   Untuk setiap penyakit hasil Forward Chaining:
//   CF(User) × CF(Pakar/Gejala) untuk setiap gejala
//   Kombinasikan: CF₁ + CF₂ × (1 - CF₁)
//
// RUMUS:
//   CF(H,E) = CF(User) × CF(Pakar)
//   CF(Kombinasi) = CF₁ + CF₂ × (1 - CF₁)
//
// ============================================================

import type { DiagnosaForm } from '@/types';
import { getGejalaById } from '@/data/gejala';
import { penyakitBuahNaga } from '@/data/penyakit';
import { rulesBuahNaga } from '@/data/rules';

// Interface untuk hasil Forward Chaining
export interface ForwardChainingResult {
  penyakitId: string;
  namaPenyakit: string;
  kodePenyakit: string;
  gejalaCocok: {
    gejalaId: string;
    namaGejala: string;
  }[];
  jumlahGejalaCocok: number;
  semuaGejalaTerpenuhi: boolean;
}

// Interface untuk hasil CF setelah Forward Chaining
export interface CFResult {
  penyakitId: string;
  namaPenyakit: string;
  kodePenyakit: string;
  cfValue: number;
  persentase: number;
  interpretasi: string;
  matchedGejala: {
    gejalaId: string;
    namaGejala: string;
    cfUser: number;
    cfPakar: number;
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

// Fungsi untuk menggabungkan CF
// Rumus: CF₁ + CF₂ × (1 - CF₁)
export const combineCF = (cf1: number, cf2: number): number => {
  return cf1 + cf2 * (1 - cf1);
};

// ============================================================
// LANGKAH 1: FORWARD CHAINING
// ============================================================
// Input: Gejala yang dipilih user (dengan CF User)
// Output: Daftar penyakit yang terdeteksi dari rules yang cocok
// ============================================================
export const forwardChaining = (
  selectedGejala: DiagnosaForm[]
): ForwardChainingResult[] => {
  const results: ForwardChainingResult[] = [];
  const selectedGejalaIds = selectedGejala.map(g => g.gejalaId);

  // Iterasi semua rules
  rulesBuahNaga.forEach(rule => {
    // Cek gejala mana yang cocok antara rule dan gejala yang dipilih
    const gejalaCocok = rule.gejala_ids.filter(gId => 
      selectedGejalaIds.includes(gId)
    );

    // Jika ada gejala yang cocok, maka rule ini aktif
    if (gejalaCocok.length > 0) {
      const penyakit = penyakitBuahNaga.find(p => p.id === rule.penyakit_id);
      
      if (penyakit) {
        // Cek apakah penyakit sudah ada di results
        const existing = results.find(r => r.penyakitId === penyakit.id);
        
        if (!existing) {
          results.push({
            penyakitId: penyakit.id,
            namaPenyakit: penyakit.nama,
            kodePenyakit: penyakit.kode,
            gejalaCocok: gejalaCocok.map(id => ({
              gejalaId: id,
              namaGejala: getGejalaById(id)?.nama || 'Unknown'
            })),
            jumlahGejalaCocok: gejalaCocok.length,
            semuaGejalaTerpenuhi: gejalaCocok.length === rule.gejala_ids.length
          });
        } else {
          // Tambahkan gejala yang belum ada
          gejalaCocok.forEach(id => {
            if (!existing.gejalaCocok.find(g => g.gejalaId === id)) {
              existing.gejalaCocok.push({
                gejalaId: id,
                namaGejala: getGejalaById(id)?.nama || 'Unknown'
              });
            }
          });
          existing.jumlahGejalaCocok = existing.gejalaCocok.length;
        }
      }
    }
  });

  // Urutkan berdasarkan jumlah gejala cocok (terbanyak dulu)
  return results.sort((a, b) => b.jumlahGejalaCocok - a.jumlahGejalaCocok);
};

// ============================================================
// LANGKAH 2: CERTAINTY FACTOR
// ============================================================
// Input: Hasil Forward Chaining + Gejala yang dipilih user
// Output: CF untuk setiap penyakit yang terdeteksi
// ============================================================
export const calculateCF = (
  fcResults: ForwardChainingResult[],
  selectedGejala: DiagnosaForm[]
): CFResult[] => {
  const results: CFResult[] = [];

  fcResults.forEach(fcResult => {
    const penyakit = penyakitBuahNaga.find(p => p.id === fcResult.penyakitId);
    if (!penyakit) return;

    const matchedGejala: CFResult['matchedGejala'] = [];
    const detailPerhitungan: CFResult['detailPerhitungan'] = [];
    
    let cfKombinasi = 0;
    let step = 1;

    // Iterasi setiap gejala yang cocok
    fcResult.gejalaCocok.forEach(gc => {
      const userSelection = selectedGejala.find(g => g.gejalaId === gc.gejalaId);
      const gejalaData = getGejalaById(gc.gejalaId);
      
      if (userSelection && gejalaData) {
        // CF(User) × CF(Pakar/Gejala)
        const cfHasil = userSelection.cfUser * gejalaData.cf_pakar;
        
        matchedGejala.push({
          gejalaId: gc.gejalaId,
          namaGejala: gejalaData.nama,
          cfUser: userSelection.cfUser,
          cfPakar: gejalaData.cf_pakar,
          cfHasil
        });

        // Kombinasikan CF
        const cfSebelumnya = cfKombinasi;
        cfKombinasi = combineCF(cfKombinasi, cfHasil);

        detailPerhitungan.push({
          step,
          gejalaNama: gejalaData.nama,
          cfUser: userSelection.cfUser,
          cfPakar: gejalaData.cf_pakar,
          cfHasil,
          cfKombinasi,
          rumus: step === 1 
            ? `CF = ${userSelection.cfUser} × ${gejalaData.cf_pakar} = ${cfHasil.toFixed(3)}`
            : `CF = ${cfSebelumnya.toFixed(3)} + ${cfHasil.toFixed(3)} × (1 - ${cfSebelumnya.toFixed(3)}) = ${cfKombinasi.toFixed(3)}`
        });

        step++;
      }
    });

    if (cfKombinasi > 0) {
      results.push({
        penyakitId: fcResult.penyakitId,
        namaPenyakit: penyakit.nama,
        kodePenyakit: penyakit.kode,
        cfValue: cfKombinasi,
        persentase: Math.round(cfKombinasi * 100),
        interpretasi: getCFInterpretation(cfKombinasi),
        matchedGejala,
        detailPerhitungan
      });
    }
  });

  // Urutkan berdasarkan CF tertinggi
  return results.sort((a, b) => b.cfValue - a.cfValue);
};

// ============================================================
// FUNGSI UTAMA: FORWARD CHAINING + CF
// ============================================================
export const diagnose = (selectedGejala: DiagnosaForm[]): CFResult[] => {
  // LANGKAH 1: Forward Chaining - Cari penyakit dari gejala
  const fcResults = forwardChaining(selectedGejala);
  
  // Jika tidak ada penyakit terdeteksi
  if (fcResults.length === 0) {
    return [];
  }

  // LANGKAH 2: Certainty Factor - Hitung tingkat kepastian
  const cfResults = calculateCF(fcResults, selectedGejala);

  return cfResults;
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

// Fungsi untuk mendapatkan interpretasi CF
export const getCFInterpretation = (cfValue: number): string => {
  if (cfValue >= 0.9) return 'Sangat Yakin';
  if (cfValue >= 0.7) return 'Yakin';
  if (cfValue >= 0.5) return 'Cukup Yakin';
  if (cfValue >= 0.3) return 'Sedikit Yakin';
  return 'Tidak Yakin';
};

// Fungsi untuk mendapatkan deskripsi tingkat keyakinan
export const getCFDescription = (cfValue: number): string => {
  const percentage = Math.round(cfValue * 100);
  if (percentage >= 80) {
    return `Tingkat kepercayaan ${percentage}% - Penyakit sangat mungkin terjadi pada tanaman buah naga Anda.`;
  } else if (percentage >= 60) {
    return `Tingkat kepercayaan ${percentage}% - Penyakit cukup mungkin terjadi, perlu perhatian khusus.`;
  } else if (percentage >= 40) {
    return `Tingkat kepercayaan ${percentage}% - Ada kemungkinan penyakit, lakukan pengamatan lebih lanjut.`;
  } else {
    return `Tingkat kepercayaan ${percentage}% - Kemungkinan penyakit rendah, tetap lakukan pencegahan.`;
  }
};

// Fungsi untuk mendapatkan rekomendasi berdasarkan hasil
export const getRekomendasi = (cfValue: number): string[] => {
  if (cfValue >= 0.7) {
    return [
      'Segera lakukan penanganan serius',
      'Konsultasikan dengan ahli pertanian jika memungkinkan',
      'Isolasi tanaman yang terinfeksi untuk mencegah penyebaran',
      'Dokumentasikan gejala untuk evaluasi lebih lanjut'
    ];
  } else if (cfValue >= 0.4) {
    return [
      'Lakukan pengamatan rutin pada tanaman',
      'Terapkan pencegahan sesuai solusi yang diberikan',
      'Perhatikan perkembangan gejala dalam beberapa hari',
      'Siapkan tindakan lanjutan jika gejala memburuk'
    ];
  } else {
    return [
      'Lakukan pencegahan rutin',
      'Jaga kebersihan dan kesehatan tanaman',
      'Pantau kondisi tanaman secara berkala',
      'Terapkan pemupukan dan perawatan yang baik'
    ];
  }
};

// Fungsi untuk format perhitungan CF (untuk tampilan detail)
export const formatCFCalculation = (
  cfUser: number, 
  cfPakar: number
): string => {
  const cfHasil = cfUser * cfPakar;
  return `${cfUser} × ${cfPakar} = ${cfHasil.toFixed(3)}`;
};
