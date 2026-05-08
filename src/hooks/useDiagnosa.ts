import { useState, useCallback } from 'react';
import type { DiagnosaForm, HasilDiagnosa } from '@/types';
import { forwardChaining, calculateCF } from '@/utils/cfAlgorithm';
import { getPenyakitById } from '@/data/penyakit';
import { getGejalaById } from '@/data/gejala';

export const useDiagnosa = () => {
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [forwardChainingResult, setForwardChainingResult] = useState<any>(null);
  const [cfResult, setCfResult] = useState<any>(null);

  const lakukanDiagnosa = useCallback((selectedGejala: DiagnosaForm[], userId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Validasi
      if (selectedGejala.length === 0) {
        setError('Pilih minimal satu gejala untuk melakukan diagnosa');
        setLoading(false);
        return null;
      }

      // ============================================================
      // ALUR: FORWARD CHAINING → CF
      // ============================================================
      
      // LANGKAH 1: FORWARD CHAINING
      // Dari gejala yang dipilih → Cari rules yang cocok → Dapatkan penyakit
      const fcResults = forwardChaining(selectedGejala);
      setForwardChainingResult(fcResults);

      if (fcResults.length === 0) {
        setError('Tidak ada penyakit yang terdeteksi berdasarkan gejala yang dipilih');
        setLoading(false);
        return null;
      }

      // LANGKAH 2: CERTAINTY FACTOR
      // Hitung tingkat kepastian untuk setiap penyakit
      const cfResults = calculateCF(fcResults, selectedGejala);
      setCfResult(cfResults);

      if (cfResults.length === 0) {
        setError('Tidak dapat menghitung tingkat kepastian');
        setLoading(false);
        return null;
      }

      // Simpan hasil
      const penyakitTerpilih = getPenyakitById(cfResults[0].penyakitId);
      
      const hasilDiagnosa: HasilDiagnosa = {
        id: `d${Date.now()}`,
        user_id: userId,
        tanggal: new Date().toISOString(),
        
        // Gejala yang dipilih dengan CF
        gejala_dipilih: selectedGejala.map(sg => {
          const gejala = getGejalaById(sg.gejalaId);
          return {
            gejala_id: sg.gejalaId,
            nama_gejala: gejala?.nama || 'Unknown',
            cf_user: sg.cfUser,
            cf_pakar: gejala?.cf_pakar || 0
          };
        }),
        
        // Rules yang cocok (Forward Chaining)
        rules_cocok: fcResults.map(fc => ({
          rule_id: fc.penyakitId,
          penyakit_id: fc.penyakitId,
          nama_penyakit: fc.namaPenyakit,
          gejala_cocok: fc.gejalaCocok.map(g => g.namaGejala)
        })),
        
        // Hasil CF
        hasil_cf: cfResults.map(cf => ({
          penyakit_id: cf.penyakitId,
          nama_penyakit: cf.namaPenyakit,
          cf_value: cf.cfValue,
          persentase: cf.persentase,
          detail_perhitungan: cf.matchedGejala.map(mg => ({
            gejala_id: mg.gejalaId,
            nama_gejala: mg.namaGejala,
            cf_user: mg.cfUser,
            cf_pakar: mg.cfPakar,
            cf_hasil: mg.cfHasil
          }))
        })),
        
        // Kesimpulan
        penyakit_terpilih: cfResults[0].penyakitId,
        nama_penyakit_terpilih: cfResults[0].namaPenyakit,
        cf_tertinggi: cfResults[0].cfValue,
        solusi: penyakitTerpilih?.solusi || []
      };

      // Simpan ke localStorage (nanti ganti ke Supabase)
      const existing = JSON.parse(localStorage.getItem('hasilDiagnosa') || '[]');
      existing.push(hasilDiagnosa);
      localStorage.setItem('hasilDiagnosa', JSON.stringify(existing));

      setHasil(cfResults);
      setLoading(false);
      
      return hasilDiagnosa;
    } catch (err) {
      setError('Terjadi kesalahan saat melakukan diagnosa');
      setLoading(false);
      return null;
    }
  }, []);

  const resetHasil = useCallback(() => {
    setHasil(null);
    setForwardChainingResult(null);
    setCfResult(null);
    setError(null);
  }, []);

  const getRiwayatUser = useCallback((userId: string) => {
    const allHasil = JSON.parse(localStorage.getItem('hasilDiagnosa') || '[]');
    return allHasil.filter((h: any) => h.user_id === userId);
  }, []);

  return {
    loading,
    hasil,
    error,
    forwardChainingResult,
    cfResult,
    lakukanDiagnosa,
    resetHasil,
    getRiwayatUser
  };
};
