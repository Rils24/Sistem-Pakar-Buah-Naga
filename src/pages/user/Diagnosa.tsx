import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { fetchRules, fetchGejala, fetchPenyakit, fetchPohonKeputusan, insertHasilDiagnosa } from '@/services/supabaseService';
import { 
  Stethoscope, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  GitBranch,
  RotateCcw,
  AlertTriangle,
  Bug,
  Sprout,
  Thermometer,
  History,
  Loader2,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import type { User } from '@/types';

interface DiagnosaProps {
  user: User;
}

interface Jawaban {
  nodeId: string;
  gejalaId: string;
  kodeGejala: string;
  namaGejala: string;
  jawaban: 'ya' | 'tidak';
  cfPakar: number;
}

export const Diagnosa = ({ user }: DiagnosaProps) => {
  const navigate = useNavigate();
  const [currentNodeId, setCurrentNodeId] = useState<string>('root');
  const [jawabanList, setJawabanList] = useState<Jawaban[]>([]);
  const [hasil, setHasil] = useState<string | null>(null);
  const [cfTotal, setCfTotal] = useState<number>(0);
  const [detailPerhitungan, setDetailPerhitungan] = useState<any[]>([]);
  const [allCFResults, setAllCFResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  
  // Data dari Supabase
  const [pohonKeputusan, setPohonKeputusan] = useState<any[]>([]);
  const [penyakitList, setPenyakitList] = useState<any[]>([]);
  const [rulesRef, setRulesRef] = useState<any[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);

  // Muat data pohon keputusan dan master data dari database Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        const [rulesData, gejalaData, penyakitData, pohonData] = await Promise.all([
          fetchRules(),
          fetchGejala(),
          fetchPenyakit(),
          fetchPohonKeputusan()
        ]);
        setPenyakitList(penyakitData);
        setRulesRef(rulesData);

        // Map data dari pohon_keputusan di database ke format frontend secara sinkron dengan master gejala
        const nodes = pohonData.map((node: any) => {
          const matchedGejala = gejalaData.find((g: any) => g.id === node.gejala_id);
          return {
            id: node.id,
            gejalaId: node.gejala_id,
            kodeGejala: matchedGejala ? matchedGejala.kode : node.kode_gejala,
            namaGejala: matchedGejala ? matchedGejala.nama : node.nama_gejala,
            deskripsi: matchedGejala?.deskripsi || node.deskripsi || '',
            ya: node.ya,
            tidak: node.tidak,
            hasil: node.hasil,
            cfPakar: matchedGejala ? matchedGejala.cf_pakar : (node.cf_pakar || 0.8)
          };
        });

        setPohonKeputusan(nodes);
      } catch (err) {
        console.error('Gagal memuat data dari Supabase:', err);
      } finally {
        setIsDataReady(true);
      }
    };
    loadData();
  }, []);

  // Helper untuk lookup data
  const getNodeById = useCallback((id: string) => {
    return pohonKeputusan.find(n => n.id === id);
  }, [pohonKeputusan]);

  const getPenyakitById = useCallback((id: string) => {
    return penyakitList.find(p => p.id === id);
  }, [penyakitList]);

  const formatPertanyaan = (nama: string | undefined | null) => {
    if (!nama) return '';
    let text = nama.trim();
    if (/^apakah/i.test(text)) {
      return text;
    }
    if (text.endsWith('.')) {
      text = text.slice(0, -1);
    }
    text = text.charAt(0).toLowerCase() + text.slice(1);
    return `Apakah ${text}?`;
  };

  const currentNode = getNodeById(currentNodeId);

  // Auto-forward untuk node transisi (group nodes yang bukan pertanyaan)
  // Node seperti hama_group/penyakit_group hanya punya jalur 'ya' tanpa 'tidak'
  useEffect(() => {
    if (!currentNode || !isDataReady) return;
    // Jika node punya 'ya' tapi TIDAK punya 'tidak', dan belum ada hasil → auto forward
    if (currentNode.ya && !currentNode.tidak && !currentNode.hasil) {
      setCurrentNodeId(currentNode.ya);
    }
  }, [currentNodeId, currentNode, isDataReady]);

  // Forward Chaining: proses jawaban dan pindah ke node berikutnya
  const handleJawaban = useCallback((jawaban: 'ya' | 'tidak') => {
    if (!currentNode) return;

    setLoading(true);

    // Simpan jawaban
    const newJawaban: Jawaban = {
      nodeId: currentNode.id,
      gejalaId: currentNode.gejalaId || '',
      kodeGejala: currentNode.kodeGejala,
      namaGejala: currentNode.namaGejala,
      jawaban,
      cfPakar: currentNode.cfPakar
    };

    const updatedJawaban = [...jawabanList, newJawaban];
    setJawabanList(updatedJawaban);

    setTimeout(() => {
      if (jawaban === 'ya' && currentNode.ya) {
        const nextNode = getNodeById(currentNode.ya);
        if (nextNode?.hasil) {
          // Hasil ditemukan!
          setHasil(nextNode.hasil);
          // Hitung CF
          calculateCFResult(updatedJawaban, nextNode.hasil);
        } else {
          setCurrentNodeId(currentNode.ya);
        }
      } else if (jawaban === 'tidak' && currentNode.tidak) {
        const nextNode = getNodeById(currentNode.tidak);
        if (nextNode?.hasil) {
          // Hasil ditemukan!
          setHasil(nextNode.hasil);
          calculateCFResult(updatedJawaban, nextNode.hasil);
        } else {
          setCurrentNodeId(currentNode.tidak);
        }
      } else {
        // Tidak ada jalur lagi
        setHasil('not_found');
      }
      setLoading(false);
    }, 500);
  }, [currentNode, jawabanList]);

  // Hitung CF untuk SEMUA penyakit berdasarkan gejala "Ya"
  const calculateCFResult = async (jawabans: Jawaban[], confirmedPenyakitId: string) => {
    const yaJawabans = jawabans.filter(j => j.jawaban === 'ya' && j.gejalaId);

    if (yaJawabans.length === 0) {
      setCfTotal(0);
      setDetailPerhitungan([]);
      setAllCFResults([]);
      return;
    }

    // ── Hitung CF untuk SETIAP penyakit ─────────────────────────────
    const allResults: any[] = [];

    penyakitList.forEach((p: any) => {
      // Kumpulkan semua gejala_ids dari semua rules penyakit ini
      const pRules = rulesRef.filter((r: any) => r.penyakit_id === p.id);
      if (pRules.length === 0) return;

      const allGejalaForP = new Set<string>(pRules.flatMap((r: any) => r.gejala_ids as string[]));

      // Gejala yang dijawab "Ya" DAN termasuk dalam penyakit ini
      const matching = yaJawabans.filter(j => allGejalaForP.has(j.gejalaId));
      if (matching.length === 0) return;

      // Kombinasi CF
      let cfKombinasi = 0;
      const details: any[] = [];
      matching.forEach((j, idx) => {
        const cfHasil = 1.0 * j.cfPakar;
        const cfSebelumnya = cfKombinasi;
        cfKombinasi = cfKombinasi + cfHasil * (1 - cfKombinasi);
        details.push({
          step: idx + 1,
          gejala: j.namaGejala,
          cfUser: 1.0,
          cfPakar: j.cfPakar,
          cfHasil: cfHasil.toFixed(3),
          cfKombinasi: cfKombinasi.toFixed(3),
          rumus: idx === 0
            ? `CF = 1.0 × ${j.cfPakar} = ${cfHasil.toFixed(3)}`
            : `CF = ${cfSebelumnya.toFixed(3)} + ${cfHasil.toFixed(3)} × (1 - ${cfSebelumnya.toFixed(3)}) = ${cfKombinasi.toFixed(3)}`
        });
      });

      allResults.push({
        penyakit_id: p.id,
        nama_penyakit: p.nama,
        tipe: p.tipe,
        cf_value: cfKombinasi,
        persentase: Math.round(cfKombinasi * 100),
        gejala_cocok: matching.length,
        total_gejala: allGejalaForP.size,
        detail_perhitungan: details
      });
    });

    // Urutkan dari CF tertinggi
    allResults.sort((a, b) => b.cf_value - a.cf_value);
    setAllCFResults(allResults);

    // Cek apakah output dari tree adalah "not found"
    const isTreeNotFound = ['not_found', 'hama_not_found', 'penyakit_not_found'].includes(confirmedPenyakitId);
    let targetPenyakitId = confirmedPenyakitId;

    if (isTreeNotFound && allResults.length > 0) {
      // Jika tree tidak menemukan penyakit tapi ada beberapa gejala "YA" yang cocok dengan penyakit/hama tertentu
      const primaryResult = allResults[0];
      targetPenyakitId = primaryResult.penyakit_id;
      setIsFallback(true);
      setHasil(primaryResult.penyakit_id);
    }

    // Primary = penyakit yang terkonfirmasi dari tree, atau tertinggi
    const primary = allResults.find(r => r.penyakit_id === targetPenyakitId) || allResults[0];
    setCfTotal(primary?.cf_value || 0);
    setDetailPerhitungan(primary?.detail_perhitungan || []);

    // ── Simpan ke Supabase ──────────────────────────────────────────
    const penyakit = getPenyakitById(targetPenyakitId);
    if (penyakit) {
      const hasilDiagnosa = {
        id: `d${Date.now()}`,
        user_id: user.id,
        tanggal: new Date().toISOString(),
        gejala_dipilih: yaJawabans.map(j => ({
          gejala_id: j.gejalaId,
          nama_gejala: j.namaGejala,
          cf_user: 1.0,
          cf_pakar: j.cfPakar
        })),
        hasil_cf: allResults.map(r => ({
          penyakit_id: r.penyakit_id,
          nama_penyakit: r.nama_penyakit,
          cf_value: r.cf_value,
          persentase: r.persentase
        })),
        penyakit_terpilih: targetPenyakitId,
        nama_penyakit_terpilih: penyakit.nama,
        cf_tertinggi: primary?.cf_value || 0,
        solusi: penyakit.solusi
      };

      try {
        await insertHasilDiagnosa(hasilDiagnosa);
      } catch (err) {
        console.error('Gagal menyimpan hasil diagnosa:', err);
        const existing = JSON.parse(localStorage.getItem('hasilDiagnosa') || '[]');
        existing.push(hasilDiagnosa);
        localStorage.setItem('hasilDiagnosa', JSON.stringify(existing));
      }
    }
  };

  const resetDiagnosa = () => {
    setCurrentNodeId('root');
    setJawabanList([]);
    setHasil(null);
    setCfTotal(0);
    setDetailPerhitungan([]);
    setAllCFResults([]);
    setIsFallback(false);
  };

  const getCFInterpretasi = (cf: number): string => {
    if (cf >= 0.9) return 'Sangat Yakin';
    if (cf >= 0.7) return 'Yakin';
    if (cf >= 0.5) return 'Cukup Yakin';
    if (cf >= 0.3) return 'Sedikit Yakin';
    return 'Tidak Yakin';
  };

  // Hitung progress
  const progress = Math.min((jawabanList.length / 8) * 100, 100);

  // ============================================================
  // TAMPILAN HASIL
  // ============================================================
  if (hasil) {
    const penyakit = getPenyakitById(hasil);
    const isHama = penyakit?.tipe === 'hama';
    const isPenyakit = penyakit?.tipe === 'penyakit';

    if (hasil === 'not_found' || hasil === 'hama_not_found' || hasil === 'penyakit_not_found') {
      return (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mx-auto shadow-lg">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Tidak Dapat Diidentifikasi</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Berdasarkan jawaban yang diberikan, sistem tidak dapat mengidentifikasi hama atau penyakit pada tanaman Anda.
            </p>
          </div>

          {/* Riwayat Jawaban */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-base">
                <span className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                  <History className="w-4 h-4 text-amber-600" />
                </span>
                Riwayat Jawaban
                <span className="ml-auto text-xs text-gray-400 font-normal">{jawabanList.length} pertanyaan</span>
              </h4>
              <div className="space-y-2">
                {jawabanList.map((j, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
                    <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      j.jawaban === 'ya' ? 'bg-green-100' : 'bg-red-50'
                    }`}>
                      {j.jawaban === 'ya'
                        ? <CheckCircle className="w-4 h-4 text-green-600" />
                        : <XCircle className="w-4 h-4 text-red-400" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 leading-snug">{j.namaGejala}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{j.kodeGejala}</p>
                    </div>
                    <span className={`flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${
                      j.jawaban === 'ya'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-500 border border-red-200'
                    }`}>
                      {j.jawaban.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action */}
          <div className="flex justify-center">
            <Button
              onClick={resetDiagnosa}
              className="h-12 px-8 text-base bg-pink-600 hover:bg-pink-700 shadow-md"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Coba Lagi
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {isFallback && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4 text-amber-800 shadow-sm">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-semibold text-amber-900 mb-1">Diagnosis Alternatif (Certainty Factor)</h5>
              <p className="leading-relaxed text-sm">
                Sistem tidak menemukan kecocokan 100% pada alur pohon keputusan (Forward Chaining). Namun, berdasarkan gejala-gejala yang Anda jawab <span className="font-semibold text-emerald-700">"YA"</span>, penyakit/hama berikut memiliki persentase kecocokan tertinggi.
              </p>
            </div>
          </div>
        )}

        {/* Header Hasil */}
        <div className="text-center space-y-3">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-lg ${
            isHama 
              ? 'bg-gradient-to-br from-orange-400 to-amber-500' 
              : isPenyakit 
              ? 'bg-gradient-to-br from-rose-400 to-pink-600' 
              : 'bg-gradient-to-br from-emerald-400 to-green-500'
          }`}>
            {isHama ? <Bug className="w-10 h-10 text-white" /> : 
             isPenyakit ? <Sprout className="w-10 h-10 text-white" /> : 
             <CheckCircle className="w-10 h-10 text-white" />}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isHama ? 'Hama Teridentifikasi' : 'Penyakit Teridentifikasi'}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Metode: Forward Chaining + Certainty Factor
            </p>
          </div>
        </div>

        {/* Top Grid: Nama & CF */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Nama & Kode - 2 kolom */}
          <Card className="md:col-span-2 border-0 shadow-md overflow-hidden">
            <div className={`h-1.5 ${isHama ? 'bg-gradient-to-r from-orange-400 to-amber-500' : 'bg-gradient-to-r from-rose-400 to-pink-600'}`} />
            <CardContent className="p-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-4 ${
                isHama ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {isHama ? '🐛 Hama' : '🦠 Penyakit'}
              </span>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {penyakit?.nama}
              </h3>
              <p className="text-gray-400 text-sm font-mono">{penyakit?.kode}</p>
            </CardContent>
          </Card>

          {/* CF Result - 1 kolom */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-pink-500 to-rose-500" />
            <CardContent className="p-6 flex flex-col items-center justify-center h-full">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Tingkat Kepercayaan</p>
              <p className="text-5xl font-extrabold text-pink-600 leading-none">
                {Math.round(cfTotal * 100)}%
              </p>
              <span className={`mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                cfTotal >= 0.9 ? 'bg-green-50 text-green-700 border border-green-200' :
                cfTotal >= 0.7 ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                cfTotal >= 0.5 ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                'bg-gray-50 text-gray-600 border border-gray-200'
              }`}>
                {getCFInterpretasi(cfTotal)}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Deskripsi */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-base">
              <span className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-blue-600" />
              </span>
              Deskripsi
            </h4>
            <p className="text-gray-600 leading-relaxed">{penyakit?.deskripsi}</p>
          </CardContent>
        </Card>

        {/* Gambar Penyakit */}
        {penyakit?.image_urls && penyakit.image_urls.length > 0 && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-base">
                <span className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-purple-600" />
                </span>
                Gambar {isHama ? 'Hama' : 'Penyakit'}
                <span className="ml-auto text-xs text-gray-400 font-normal">{penyakit.image_urls.length} gambar</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {penyakit.image_urls.map((url: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => { setPreviewImages(penyakit.image_urls!); setPreviewIndex(idx); }}
                    className="relative group aspect-[4/3] rounded-xl overflow-hidden border-2 border-gray-100 hover:border-pink-300 transition-all"
                  >
                    <img src={url} alt={`${penyakit.nama} - ${idx+1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium bg-black/50 px-3 py-1 rounded-full">Lihat</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Solusi */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-base">
              <span className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Thermometer className="w-4 h-4 text-emerald-600" />
              </span>
              Solusi Penanganan
            </h4>
            <div className="grid gap-3">
              {penyakit?.solusi.map((s: string, idx: number) => (
                <div key={idx} className="flex items-start gap-4 p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <span className="w-7 h-7 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-gray-700 leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Semua Kemungkinan Penyakit (ranked by CF) */}
        {allCFResults.length > 1 && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-base">
                <span className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <GitBranch className="w-4 h-4 text-indigo-600" />
                </span>
                Kemungkinan Penyakit/Hama Lain
                <span className="ml-auto text-xs text-gray-400 font-normal">{allCFResults.length} terdeteksi</span>
              </h4>
              <div className="space-y-3">
                {allCFResults.map((r, idx) => (
                  <div key={r.penyakit_id} className={`rounded-xl p-4 border transition-all ${
                    idx === 0
                      ? 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200'
                      : 'bg-gray-50 border-gray-100'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white ${
                        idx === 0 ? 'bg-pink-500' : 'bg-gray-400'
                      }`}>{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`font-semibold text-sm ${
                            idx === 0 ? 'text-pink-900' : 'text-gray-700'
                          }`}>{r.nama_penyakit}</span>
                          <span className={`text-sm font-bold flex-shrink-0 ${
                            idx === 0 ? 'text-pink-600' : 'text-gray-500'
                          }`}>{r.persentase}%</span>
                        </div>
                        <div className="mt-1.5 w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              idx === 0
                                ? 'bg-gradient-to-r from-pink-400 to-rose-500'
                                : 'bg-gray-400'
                            }`}
                            style={{ width: `${r.persentase}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {r.gejala_cocok} dari {r.total_gejala} gejala cocok
                          &nbsp;·&nbsp;
                          <span className={r.tipe === 'hama' ? 'text-orange-500' : 'text-rose-500'}>
                            {r.tipe === 'hama' ? '🐛 Hama' : '🦠 Penyakit'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detail Perhitungan CF penyakit utama */}
        {detailPerhitungan.length > 0 && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-base">
                <span className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <GitBranch className="w-4 h-4 text-indigo-600" />
                </span>
                Detail Perhitungan CF
              </h4>
              <div className="space-y-3">
                {detailPerhitungan.map((d, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-7 h-7 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {d.step}
                      </span>
                      <span className="text-gray-800 font-medium text-sm">{d.gejala}</span>
                    </div>
                    <div className="ml-9 space-y-1">
                      <p className="text-xs text-gray-500 font-mono bg-white rounded-md px-3 py-1.5 inline-block border border-gray-100">
                        CF User = 1 (Ya) &nbsp;|&nbsp; CF Pakar = {d.cfPakar}
                      </p>
                      <p className="text-xs text-indigo-600 font-mono font-medium">{d.rumus}</p>
                    </div>
                  </div>
                ))}
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-pink-800">CF Akhir</span>
                    <span className="text-lg font-bold font-mono text-pink-600">
                      {cfTotal.toFixed(3)} ({Math.round(cfTotal * 100)}%)
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Riwayat Pertanyaan & Jawaban */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-base">
              <span className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                <History className="w-4 h-4 text-amber-600" />
              </span>
              Riwayat Pertanyaan & Jawaban
              <span className="ml-auto text-xs text-gray-400 font-normal">{jawabanList.length} pertanyaan</span>
            </h4>
            <div className="space-y-2">
              {jawabanList.map((j, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  {/* Icon */}
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    j.jawaban === 'ya' ? 'bg-green-100' : 'bg-red-50'
                  }`}>
                    {j.jawaban === 'ya' 
                      ? <CheckCircle className="w-4 h-4 text-green-600" /> 
                      : <XCircle className="w-4 h-4 text-red-400" />}
                  </span>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-snug">{j.namaGejala}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      {j.kodeGejala} &nbsp;·&nbsp; CF = {j.jawaban === 'ya' ? '1' : '0'}
                    </p>
                  </div>
                  {/* Badge */}
                  <span className={`flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${
                    j.jawaban === 'ya' 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-500 border border-red-200'
                  }`}>
                    {j.jawaban.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pb-4">
          <Button 
            onClick={() => navigate('/user/riwayat')}
            className="flex-1 h-12 text-base bg-pink-600 hover:bg-pink-700 shadow-md"
          >
            Lihat Riwayat
          </Button>
          <Button 
            variant="outline"
            onClick={resetDiagnosa}
            className="flex-1 h-12 text-base"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Diagnosa Ulang
          </Button>
        </div>

        {/* Image Preview Modal */}
        {previewImages.length > 0 && (
          <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewImages([])}>
            <div className="relative max-w-3xl max-h-[85vh] w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
              <button onClick={() => setPreviewImages([])} className="absolute -top-3 -right-3 z-10 p-2 bg-white rounded-full shadow-lg text-gray-600 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
              <img src={previewImages[previewIndex]} alt="Preview" className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl" />
              {previewImages.length > 1 && (
                <div className="flex items-center gap-4 mt-4">
                  <button onClick={() => setPreviewIndex(i => i > 0 ? i-1 : previewImages.length-1)} className="p-2 bg-white/90 rounded-full hover:bg-white shadow-lg"><ChevronLeft className="w-5 h-5" /></button>
                  <span className="text-white text-sm font-medium">{previewIndex + 1} / {previewImages.length}</span>
                  <button onClick={() => setPreviewIndex(i => i < previewImages.length-1 ? i+1 : 0)} className="p-2 bg-white/90 rounded-full hover:bg-white shadow-lg"><ChevronRight className="w-5 h-5" /></button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // TAMPILAN PERTANYAAN (YA/TIDAK)
  // ============================================================
  if (!isDataReady) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
        <span className="text-gray-500 text-sm">Menyiapkan sistem pakar...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <Stethoscope className="w-6 h-6 text-pink-600" />
          Diagnosa Hama & Penyakit
        </h1>
        <p className="text-gray-400 text-sm">
          Jawab pertanyaan berikut berdasarkan kondisi tanaman Anda
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Pertanyaan ke-{jawabanList.length + 1}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Info FC - hanya tampil di awal */}
      {jawabanList.length === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                <GitBranch className="w-4 h-4 text-blue-600" />
              </span>
              <span className="text-blue-700 font-medium">Forward Chaining</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300" />
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 bg-pink-100 rounded-lg flex items-center justify-center">
                <Thermometer className="w-4 h-4 text-pink-600" />
              </span>
              <span className="text-pink-700 font-medium">Certainty Factor</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            CF User: Ya = 1, Tidak = 0 &nbsp;|&nbsp; Rumus: CF = CF(User) × CF(Pakar)
          </p>
        </div>
      )}

      {/* Pertanyaan Card */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-pink-500 to-rose-500" />
        <CardHeader className="pb-2 pt-5 px-6">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-semibold border border-pink-200">
              {currentNode?.kodeGejala}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              Pertanyaan {jawabanList.length + 1}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 px-6 pb-6">
          {/* Pertanyaan */}
          <div className="text-center py-8">
            <p className="text-lg font-medium text-gray-900 leading-relaxed">
              {currentNode?.gejalaId
                ? formatPertanyaan(currentNode.namaGejala)
                : currentNode?.namaGejala}
            </p>
            {currentNode?.deskripsi && (
              <p className="text-sm text-gray-400 mt-3 max-w-lg mx-auto">
                {currentNode.deskripsi}
              </p>
            )}
          </div>

          {/* Tombol Ya / Tidak */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleJawaban('ya')}
              disabled={loading}
              className="h-14 text-base bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition-all hover:shadow-lg"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              YA 
            </Button>
            <Button
              onClick={() => handleJawaban('tidak')}
              disabled={loading}
              variant="outline"
              className="h-14 text-base border-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all"
            >
              <XCircle className="w-5 h-5 mr-2" />
              TIDAK 
            </Button>
          </div>

          {jawabanList.length > 0 && (
            <div className="flex justify-center pt-2">
              <Button
                variant="ghost"
                onClick={resetDiagnosa}
                disabled={loading}
                className="text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition-all text-sm font-medium gap-2 px-4 py-2"
              >
                <RotateCcw className="w-4 h-4" />
                Mulai Ulang Diagnosa
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Riwayat Jawaban */}
      {jawabanList.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-gray-400" />
              Riwayat Jawaban
              <span className="ml-auto text-xs text-gray-400 font-normal">{jawabanList.length}</span>
            </h4>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {jawabanList.map((j, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                  <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                    j.jawaban === 'ya' ? 'bg-green-100' : 'bg-red-50'
                  }`}>
                    {j.jawaban === 'ya'
                      ? <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-snug truncate">{j.namaGejala}</p>
                    <p className="text-xs text-gray-400 font-mono">{j.kodeGejala}</p>
                  </div>
                  <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    j.jawaban === 'ya'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-500 border border-red-200'
                  }`}>
                    {j.jawaban.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info footer */}
      <div className="bg-blue-50/60 rounded-xl p-5 text-center border border-blue-100">
        <p className="text-sm text-blue-700">
          Jawab setiap pertanyaan dengan jujur berdasarkan kondisi tanaman Anda.
        </p>
        <p className="mt-1 text-xs text-blue-400">
          Sistem akan mengikuti pohon keputusan untuk menemukan hama/penyakit.
        </p>
      </div>
    </div>
  );
};
