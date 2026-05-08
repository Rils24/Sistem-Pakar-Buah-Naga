import type { Rule } from '@/types';

// ============================================================
// RULES FORWARD CHAINING - BUAH NAGA
// ============================================================
// Setiap rule menghubungkan gejala-gejala → hama/penyakit
// CF ada di setiap gejala (cf_pakar), bukan di rule
// ID sesuai dengan penyakit.ts dan gejala.ts
// ============================================================

export const rulesBuahNaga: Rule[] = [
  // ===== HAMA =====

  // H01 - Kutu Putih: gejala g01-g06
  {
    id: 'r01',
    penyakit_id: 'h01',
    gejala_ids: ['g01', 'g02', 'g03', 'g04', 'g05', 'g06']
  },

  // H02 - Aphids (Kutu Daun): gejala g07-g11
  {
    id: 'r02',
    penyakit_id: 'h02',
    gejala_ids: ['g07', 'g08', 'g09', 'g10', 'g11']
  },

  // H03 - Kutu Sisik: gejala g12-g15
  {
    id: 'r03',
    penyakit_id: 'h03',
    gejala_ids: ['g12', 'g13', 'g14', 'g15']
  },

  // H04 - Lalat Buah: gejala g16-g20
  {
    id: 'r04',
    penyakit_id: 'h04',
    gejala_ids: ['g16', 'g17', 'g18', 'g19', 'g20']
  },

  // H05 - Bekicot: gejala g21-g26
  {
    id: 'r05',
    penyakit_id: 'h05',
    gejala_ids: ['g21', 'g22', 'g23', 'g24', 'g25', 'g26']
  },

  // H06 - Belalang: gejala g27-g31
  {
    id: 'r06',
    penyakit_id: 'h06',
    gejala_ids: ['g27', 'g28', 'g29', 'g30', 'g31']
  },

  // H07 - Tungau: gejala g32-g37
  {
    id: 'r07',
    penyakit_id: 'h07',
    gejala_ids: ['g32', 'g33', 'g34', 'g35', 'g36', 'g37']
  },

  // ===== PENYAKIT =====

  // P01 - Kanker Batang dan Buah: gejala g38-g44
  {
    id: 'r08',
    penyakit_id: 'p01',
    gejala_ids: ['g38', 'g39', 'g40', 'g41', 'g42', 'g43', 'g44']
  },

  // P02 - Antraknosa: gejala g45-g49
  {
    id: 'r09',
    penyakit_id: 'p02',
    gejala_ids: ['g45', 'g46', 'g47', 'g48', 'g49']
  },

  // P03 - Busuk Batang: gejala g50-g61
  {
    id: 'r10',
    penyakit_id: 'p03',
    gejala_ids: ['g50', 'g51', 'g52', 'g53', 'g54', 'g55', 'g56', 'g57', 'g58', 'g59', 'g60', 'g61']
  },

  // P04 - Kudis / Scab: gejala g62-g66
  {
    id: 'r11',
    penyakit_id: 'p04',
    gejala_ids: ['g62', 'g63', 'g64', 'g65', 'g66']
  },

  // P05 - Mosaik / Bercak Nekrotik: gejala g67-g71
  {
    id: 'r12',
    penyakit_id: 'p05',
    gejala_ids: ['g67', 'g68', 'g69', 'g70', 'g71']
  },

  // P06 - Puru Akar: gejala g72-g76
  {
    id: 'r13',
    penyakit_id: 'p06',
    gejala_ids: ['g72', 'g73', 'g74', 'g75', 'g76']
  }
];

// Fungsi untuk mendapatkan rules berdasarkan penyakit
export const getRulesByPenyakitId = (penyakitId: string): Rule[] => {
  return rulesBuahNaga.filter(rule => rule.penyakit_id === penyakitId);
};

// Fungsi untuk mendapatkan rule berdasarkan id
export const getRuleById = (id: string): Rule | undefined => {
  return rulesBuahNaga.find(rule => rule.id === id);
};
