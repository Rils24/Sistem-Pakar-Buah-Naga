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
  GitBranch,
  RotateCcw,
  AlertTriangle,
  Bug,
  Sprout,
  Thermometer,
  History,
  Loader2,
  ImageIcon,
  Eye
} from 'lucide-react';
import { ImagePreviewModal } from '@/components/ui/ImagePreviewModal';
import type { 
  User, 
  Penyakit, 
  Rule, 
  Gejala, 
  PohonKeputusanNode, 
  JawabanDiagnosa, 
  DetailPerhitunganCFItem,
  HasilDiagnosa
} from '@/types';

interface DiagnosaProps {
  user: User;
}

interface CFResultCalculated {
  penyakit_id: string;
  nama_penyakit: string;
  tipe: 'hama' | 'penyakit';
  cf_value: number;
  persentase: number;
  gejala_cocok: number;
  total_gejala: number;
  detail_perhitungan: DetailPerhitunganCFItem[];
}

export const Diagnosa = ({ user }: DiagnosaProps) => {
  const navigate = useNavigate();
  const [currentNodeId, setCurrentNodeId] = useState<string>('root');
  const [jawabanList, setJawabanList] = useState<JawabanDiagnosa[]>([]);
  const [hasil, setHasil] = useState<string | null>(null);
  const [cfTotal, setCfTotal] = useState<number>(0);
  const [detailPerhitungan, setDetailPerhitungan] = useState<DetailPerhitunganCFItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  
  // Master data dari Supabase
  const [pohonKeputusan, setPohonKeputusan] = useState<PohonKeputusanNode[]>([]);
  const [penyakitList, setPenyakitList] = useState<Penyakit[]>([]);
  const [rulesRef, setRulesRef] = useState<Rule[]>([]);
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
        const nodes: PohonKeputusanNode[] = pohonData.map((node: {
          id: string;
          gejala_id: string;
          kode_gejala: string;
          nama_gejala: string;
          deskripsi?: string;
          ya: string;
          tidak: string;
          hasil?: string;
          cf_pakar?: number;
        }) => {
          const matchedGejala = gejalaData.find((g: Gejala) => g.id === node.gejala_id);
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
  useEffect(() => {
    if (!currentNode || !isDataReady) return;
    if (currentNode.ya && !currentNode.tidak && !currentNode.hasil) {
      setCurrentNodeId(currentNode.ya);
    }
  }, [currentNodeId, currentNode, isDataReady]);

  // Hitung CF untuk SEMUA penyakit berdasarkan gejala "Ya"
  const calculateCFResult = useCallback(async (jawabans: JawabanDiagnosa[], confirmedPenyakitId: string) => {
    const yaJawabans = jawabans.filter(j => 
      j.jawaban === 'ya' && 
      j.gejalaId && 
      j.kodeGejala !== 'G00' && 
      j.nodeId !== 'root' && 
      !j.nodeId.endsWith('_group')
    );

    if (yaJawabans.length === 0) {
      setCfTotal(0);
      setDetailPerhitungan([]);
      return;
    }

    const allResults: CFResultCalculated[] = [];

    penyakitList.forEach((p: Penyakit) => {
      const pRules = rulesRef.filter((r: Rule) => r.penyakit_id === p.id);
      if (pRules.length === 0) return;

      const allGejalaForP = new Set<string>(pRules.flatMap((r: Rule) => r.gejala_ids));
      const matching = yaJawabans.filter(j => allGejalaForP.has(j.gejalaId));
      if (matching.length === 0) return;

      let cfKombinasi = 0;
      const details: DetailPerhitunganCFItem[] = [];

      matching.forEach((j, idx) => {
        const cfHasil = 1.0 * j.cfPakar;
        const cfSebelumnya = cfKombinasi;
        cfKombinasi = cfKombinasi + cfHasil * (1 - cfKombinasi);
        details.push({
          step: idx + 1,
          gejalaNama: j.namaGejala,
          cfUser: 1.0,
          cfPakar: j.cfPakar,
          cfHasil: parseFloat(cfHasil.toFixed(3)),
          cfKombinasi: parseFloat(cfKombinasi.toFixed(3)),
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

    allResults.sort((a, b) => b.cf_value - a.cf_value);

    const isTreeNotFound = ['not_found', 'hama_not_found', 'penyakit_not_found'].includes(confirmedPenyakitId);
    let targetPenyakitId = confirmedPenyakitId;

    if (isTreeNotFound && allResults.length > 0) {
      const primaryResult = allResults[0];
      targetPenyakitId = primaryResult.penyakit_id;
      setIsFallback(true);
      setHasil(primaryResult.penyakit_id);
    }

    const primary = allResults.find(r => r.penyakit_id === targetPenyakitId) || allResults[0];
    setCfTotal(primary?.cf_value || 0);
    setDetailPerhitungan(primary?.detail_perhitungan || []);

    // Simpan ke database Supabase
    const penyakit = getPenyakitById(targetPenyakitId);
    if (penyakit) {
      const hasilDiagnosa: HasilDiagnosa = {
        id: `d${Date.now()}`,
        user_id: user.id,
        tanggal: new Date().toISOString(),
        gejala_dipilih: yaJawabans.map(j => ({
          gejala_id: j.gejalaId,
          nama_gejala: j.namaGejala,
          cf_user: 1.0,
          cf_pakar: j.cfPakar
        })),
        rules_cocok: [],
        hasil_cf: allResults.map(r => ({
          penyakit_id: r.penyakit_id,
          nama_penyakit: r.nama_penyakit,
          cf_value: r.cf_value,
          persentase: r.persentase,
          detail_perhitungan: r.detail_perhitungan.map(d => ({
            gejala_id: '',
            nama_gejala: d.gejalaNama,
            cf_user: d.cfUser,
            cf_pakar: d.cfPakar,
            cf_hasil: d.cfHasil
          }))
        })),
        penyakit_terpilih: targetPenyakitId,
        nama_penyakit_terpilih: penyakit.nama,
        cf_tertinggi: primary?.cf_value || 0,
        solusi: penyakit.solusi
      };

      try {
        await insertHasilDiagnosa(hasilDiagnosa);
      } catch (err) {
        console.error('Gagal menyimpan hasil diagnosa ke Supabase:', err);
        const existing = JSON.parse(localStorage.getItem('hasilDiagnosa') || '[]');
        existing.push(hasilDiagnosa);
        localStorage.setItem('hasilDiagnosa', JSON.stringify(existing));
      }
    }
  }, [penyakitList, rulesRef, getPenyakitById, user.id]);

  // Forward Chaining: proses jawaban dan pindah ke node berikutnya
  const handleJawaban = useCallback((jawaban: 'ya' | 'tidak') => {
    if (!currentNode) return;

    setLoading(true);

    const newJawaban: JawabanDiagnosa = {
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
          setHasil(nextNode.hasil);
          calculateCFResult(updatedJawaban, nextNode.hasil);
        } else {
          setCurrentNodeId(currentNode.ya);
        }
      } else if (jawaban === 'tidak' && currentNode.tidak) {
        const nextNode = getNodeById(currentNode.tidak);
        if (nextNode?.hasil) {
          setHasil(nextNode.hasil);
          calculateCFResult(updatedJawaban, nextNode.hasil);
        } else {
          setCurrentNodeId(currentNode.tidak);
        }
      } else {
        setHasil('not_found');
      }
      setLoading(false);
    }, 500);
  }, [currentNode, jawabanList, getNodeById, calculateCFResult]);

  const resetDiagnosa = () => {
    setCurrentNodeId('root');
    setJawabanList([]);
    setHasil(null);
    setCfTotal(0);
    setDetailPerhitungan([]);
    setIsFallback(false);
  };

  const getCFInterpretasi = (cf: number): string => {
    if (cf >= 0.9) return 'Sangat Yakin';
    if (cf >= 0.7) return 'Yakin';
    if (cf >= 0.5) return 'Cukup Yakin';
    if (cf >= 0.3) return 'Sedikit Yakin';
    return 'Tidak Yakin';
  };

  const progress = Math.min((jawabanList.length / 8) * 100, 100);

  // Loading state awal data Supabase
  if (!isDataReady) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
        <span className="text-gray-500 text-sm">Menyiapkan data diagnosa...</span>
      </div>
    );
  }

  // ============================================================
  // VIEW HASIL DIAGNOSA
  // ============================================================
  if (hasil) {
    const penyakit = getPenyakitById(hasil);
    const isHama = penyakit?.tipe === 'hama';
    const isPenyakit = penyakit?.tipe === 'penyakit';

    if (hasil === 'not_found' || hasil === 'hama_not_found' || hasil === 'penyakit_not_found') {
      return (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mx-auto shadow-lg">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Tidak Dapat Diidentifikasi</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Berdasarkan jawaban yang diberikan, sistem tidak dapat mengidentifikasi hama atau penyakit pada tanaman Anda.
            </p>
          </div>

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

          <Card className="border-0 shadow-md overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-pink-500 to-rose-600" />
            <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Tingkat Kepastian (CF)</p>
              <p className="text-4xl font-extrabold text-pink-600 leading-none my-2">
                {Math.round(cfTotal * 100)}%
              </p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-200">
                {getCFInterpretasi(cfTotal)}
              </span>
              <p className="text-[11px] text-gray-400 mt-2 font-mono">CF Total: {cfTotal.toFixed(4)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Gambar Hama / Penyakit */}
        {penyakit?.image_urls && penyakit.image_urls.length > 0 && (
          <Card className="border-0 shadow-md overflow-hidden">
            <CardContent className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-base">
                <span className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-purple-600" />
                </span>
                Foto {isHama ? 'Hama' : 'Penyakit'} ({penyakit.image_urls.length} Gambar)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {penyakit.image_urls.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setPreviewImages(penyakit.image_urls || []); setPreviewIndex(idx); }}
                    className="relative group aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 hover:border-pink-500 transition-all shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <img 
                      src={imgUrl} 
                      alt={`${penyakit.nama} ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
                        <Eye className="w-5 h-5" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rincian Perhitungan CF (Step-by-step) */}
        {detailPerhitungan.length > 0 && (
          <Card className="border-0 shadow-md overflow-hidden">
            <CardContent className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-base">
                <span className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                  <GitBranch className="w-4 h-4 text-purple-600" />
                </span>
                Rincian Perhitungan Certainty Factor
              </h4>
              <div className="space-y-3">
                {detailPerhitungan.map((item, idx) => (
                  <div key={idx} className="p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-md">
                        Langkah {item.step}
                      </span>
                      <span className="text-xs font-mono font-semibold text-purple-900 bg-white px-2 py-0.5 rounded border border-purple-200">
                        CF Kombinasi: {item.cfKombinasi}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 mb-2">
                      Gejala: {item.gejalaNama}
                    </p>
                    <div className="bg-white p-3 rounded-lg border border-purple-100 text-xs font-mono text-gray-600">
                      <p>{item.rumus}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Deskripsi & Solusi */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-base">
                <span className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                </span>
                Deskripsi
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {penyakit?.deskripsi}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-base">
                <span className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Thermometer className="w-4 h-4 text-emerald-600" />
                </span>
                Solusi & Penanganan
              </h4>
              {penyakit?.solusi && penyakit.solusi.length > 0 ? (
                <ul className="space-y-2.5">
                  {penyakit.solusi.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm italic">Belum ada data solusi.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Button
            onClick={resetDiagnosa}
            className="h-12 px-8 text-base bg-pink-600 hover:bg-pink-700 shadow-md"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Diagnosa Ulang
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/user/riwayat')}
            className="h-12 px-8 text-base border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <History className="w-4 h-4 mr-2" />
            Lihat Riwayat Diagnosa
          </Button>
        </div>

        {/* Modal Preview Gambar Reusable */}
        <ImagePreviewModal
          images={previewImages}
          currentIndex={previewIndex}
          onClose={() => setPreviewImages([])}
          onIndexChange={(idx) => setPreviewIndex(idx)}
        />
      </div>
    );
  }

  // ============================================================
  // TAMPILAN PERTANYAAN
  // ============================================================
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Diagnosa Hama & Penyakit</h2>
            <p className="text-xs text-gray-400 font-mono">Pohon Keputusan (Forward Chaining)</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetDiagnosa}
          className="text-gray-400 hover:text-pink-600"
          title="Mulai ulang"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Pertanyaan {jawabanList.length + 1}</span>
          <span>Kode: {currentNode?.kodeGejala || 'N/A'}</span>
        </div>
        <Progress value={progress} className="h-2 bg-pink-100" />
      </div>

      {/* Main Question Card */}
      <Card className="border-0 shadow-lg relative overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-pink-500 to-rose-600" />
        
        <CardHeader className="pt-8 pb-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-pink-50 text-pink-600 mb-4 shadow-sm">
            <GitBranch className="w-8 h-8" />
          </div>
          <span className="text-xs font-mono text-pink-600 font-semibold bg-pink-50 px-3 py-1 rounded-full uppercase tracking-wider self-center mb-2">
            {currentNode?.kodeGejala}
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug px-4">
            {formatPertanyaan(currentNode?.namaGejala)}
          </h3>
          {currentNode?.deskripsi && (
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              {currentNode.deskripsi}
            </p>
          )}
        </CardHeader>

        <CardContent className="pb-8 pt-4 space-y-6">
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
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

      {/* Modal Preview Gambar Reusable */}
      <ImagePreviewModal
        images={previewImages}
        currentIndex={previewIndex}
        onClose={() => setPreviewImages([])}
        onIndexChange={(idx) => setPreviewIndex(idx)}
      />
    </div>
  );
};
