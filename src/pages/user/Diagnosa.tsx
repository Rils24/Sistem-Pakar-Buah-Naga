import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { fetchRules, fetchGejala, fetchPenyakit, insertHasilDiagnosa } from '@/services/supabaseService';
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
  Loader2
} from 'lucide-react';
import type { User } from '@/types';

interface DiagnosaProps {
  user: User;
}

interface Jawaban {
  nodeId: string;
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
  const [loading, setLoading] = useState(false);
  
  // Data dari Supabase
  const [pohonKeputusan, setPohonKeputusan] = useState<any[]>([]);
  const [penyakitList, setPenyakitList] = useState<any[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);

  // Build pohon keputusan secara dinamis dari rules + gejala + penyakit
  useEffect(() => {
    const loadData = async () => {
      try {
        const [rulesData, gejalaData, penyakitData] = await Promise.all([
          fetchRules(),
          fetchGejala(),
          fetchPenyakit()
        ]);
        setPenyakitList(penyakitData);

        // Helper: cari gejala by id
        const getGejala = (id: string) => gejalaData.find((g: any) => g.id === id);
        const getPenyakit = (id: string) => penyakitData.find((p: any) => p.id === id);

        // Pisahkan rules ke hama vs penyakit
        const hamaRules = rulesData.filter((r: any) => getPenyakit(r.penyakit_id)?.tipe === 'hama');
        const penyakitRules = rulesData.filter((r: any) => getPenyakit(r.penyakit_id)?.tipe === 'penyakit');

        const nodes: any[] = [];

        // ROOT NODE: pertanyaan pembeda hama vs penyakit (G00)
        const g00 = getGejala('g00');
        nodes.push({
          id: 'root',
          kodeGejala: g00?.kode || 'G00',
          namaGejala: g00?.nama || 'Apakah ditemukan serangga/hewan, jejak lendir/jaring, cairan lengket, atau kerusakan fisik?',
          deskripsi: 'Gejala pembeda utama antara hama dan penyakit',
          ya: 'hama_group',
          tidak: 'penyakit_group',
          cfPakar: g00?.cf_pakar ?? 1.0
        });

        // HAMA GROUP node
        nodes.push({
          id: 'hama_group',
          kodeGejala: 'HAMA',
          namaGejala: 'Tanda-tanda menunjukkan adanya HAMA. Mari kita identifikasi jenis hama yang menyerang.',
          ya: hamaRules.length > 0 ? `rule_${hamaRules[0].id}_0` : 'hama_not_found',
          tidak: '',
          cfPakar: 1.0
        });

        // PENYAKIT GROUP node
        nodes.push({
          id: 'penyakit_group',
          kodeGejala: 'PENYAKIT',
          namaGejala: 'Tanda-tanda menunjukkan adanya PENYAKIT. Mari kita identifikasi jenis penyakit yang menyerang.',
          ya: penyakitRules.length > 0 ? `rule_${penyakitRules[0].id}_0` : 'penyakit_not_found',
          tidak: '',
          cfPakar: 1.0
        });

        // Buat node untuk setiap rule (hama + penyakit)
        const buildRuleNodes = (rules: any[], notFoundId: string) => {
          rules.forEach((rule: any, ruleIdx: number) => {
            const penyakit = getPenyakit(rule.penyakit_id);
            const gejalaIds: string[] = rule.gejala_ids;
            const nextRuleFirstNode = ruleIdx < rules.length - 1
              ? `rule_${rules[ruleIdx + 1].id}_0`
              : notFoundId;

            // Confirmed leaf node untuk rule ini
            nodes.push({
              id: `rule_${rule.id}_confirmed`,
              kodeGejala: penyakit?.kode || rule.penyakit_id,
              namaGejala: `Hasil: ${penyakit?.nama || 'Unknown'} terdeteksi!`,
              hasil: rule.penyakit_id,
              cfPakar: 0.95
            });

            // Buat chain node untuk setiap gejala dalam rule
            gejalaIds.forEach((gId: string, gIdx: number) => {
              const gejala = getGejala(gId);
              const nodeId = `rule_${rule.id}_${gIdx}`;
              
              // YA → ke gejala berikutnya dalam rule, atau confirmed
              const yaTarget = gIdx < gejalaIds.length - 1
                ? `rule_${rule.id}_${gIdx + 1}`
                : `rule_${rule.id}_confirmed`;

              // TIDAK → ke rule berikutnya
              const tidakTarget = nextRuleFirstNode;

              nodes.push({
                id: nodeId,
                kodeGejala: gejala?.kode || gId.toUpperCase(),
                namaGejala: gejala?.nama ? `Apakah ${gejala.nama.charAt(0).toLowerCase()}${gejala.nama.slice(1)}?` : gId,
                ya: yaTarget,
                tidak: tidakTarget,
                cfPakar: gejala?.cf_pakar ?? 0.8
              });
            });
          });
        };

        buildRuleNodes(hamaRules, 'hama_not_found');
        buildRuleNodes(penyakitRules, 'penyakit_not_found');

        // Not found nodes
        nodes.push({
          id: 'hama_not_found',
          kodeGejala: 'HAMA?',
          namaGejala: 'Hama tidak dapat diidentifikasi.',
          hasil: 'hama_not_found',
          cfPakar: 0
        });
        nodes.push({
          id: 'penyakit_not_found',
          kodeGejala: 'PENYAKIT?',
          namaGejala: 'Penyakit tidak dapat diidentifikasi.',
          hasil: 'penyakit_not_found',
          cfPakar: 0
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

  const currentNode = getNodeById(currentNodeId);

  // Forward Chaining: proses jawaban dan pindah ke node berikutnya
  const handleJawaban = useCallback((jawaban: 'ya' | 'tidak') => {
    if (!currentNode) return;

    setLoading(true);

    // Simpan jawaban
    const newJawaban: Jawaban = {
      nodeId: currentNode.id,
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

  // Hitung CF dari jawaban
  // CF User = 1 (Ya) atau 0 (Tidak)
  const calculateCFResult = async (jawabans: Jawaban[], penyakitId: string) => {
    const yaJawabans = jawabans.filter(j => j.jawaban === 'ya');
    
    if (yaJawabans.length === 0) {
      setCfTotal(0);
      setDetailPerhitungan([]);
      return;
    }

    // CF perhitungan: CF = CF(User) × CF(Pakar)
    // User memberikan jawaban Ya = 1.0, Tidak = 0.0
    const cfUser = 1.0;
    
    let cfKombinasi = 0;
    const details: any[] = [];

    yaJawabans.forEach((j, idx) => {
      const cfHasil = cfUser * j.cfPakar;
      const cfSebelumnya = cfKombinasi;
      cfKombinasi = cfKombinasi + cfHasil * (1 - cfKombinasi);

      details.push({
        step: idx + 1,
        gejala: j.namaGejala,
        cfUser,
        cfPakar: j.cfPakar,
        cfHasil: cfHasil.toFixed(3),
        cfKombinasi: cfKombinasi.toFixed(3),
        rumus: idx === 0 
          ? `CF = ${cfUser} × ${j.cfPakar} = ${cfHasil.toFixed(3)}`
          : `CF = ${cfSebelumnya.toFixed(3)} + ${cfHasil.toFixed(3)} × (1 - ${cfSebelumnya.toFixed(3)}) = ${cfKombinasi.toFixed(3)}`
      });
    });

    setCfTotal(cfKombinasi);
    setDetailPerhitungan(details);

    // Simpan hasil ke Supabase
    const penyakit = getPenyakitById(penyakitId);
    if (penyakit) {
      const hasilDiagnosa = {
        id: `d${Date.now()}`,
        user_id: user.id,
        tanggal: new Date().toISOString(),
        gejala_dipilih: yaJawabans.map(j => ({
          gejala_id: j.nodeId,
          nama_gejala: j.namaGejala,
          cf_user: cfUser,
          cf_pakar: j.cfPakar
        })),
        hasil_cf: [{
          penyakit_id: penyakitId,
          nama_penyakit: penyakit.nama,
          cf_value: cfKombinasi,
          persentase: Math.round(cfKombinasi * 100)
        }],
        penyakit_terpilih: penyakitId,
        nama_penyakit_terpilih: penyakit.nama,
        cf_tertinggi: cfKombinasi,
        solusi: penyakit.solusi
      };

      try {
        await insertHasilDiagnosa(hasilDiagnosa);
      } catch (err) {
        console.error('Gagal menyimpan hasil diagnosa ke Supabase:', err);
        // Fallback: simpan ke localStorage
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

        {/* Detail Perhitungan CF */}
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
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-7 h-7 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {d.step}
                        </span>
                        <span className="text-gray-800 font-medium text-sm">{d.gejala}</span>
                      </div>
                    </div>
                    <div className="ml-9 space-y-1">
                      <p className="text-xs text-gray-500 font-mono bg-white rounded-md px-3 py-1.5 inline-block border border-gray-100">
                        CF User = 1 (Ya) &nbsp;|&nbsp; CF Pakar = {d.cfPakar}
                      </p>
                      <p className="text-xs text-indigo-600 font-mono font-medium">
                        {d.rumus}
                      </p>
                    </div>
                  </div>
                ))}
                {/* CF Final */}
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
              {currentNode?.namaGejala}
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
              YA (CF=1)
            </Button>
            <Button
              onClick={() => handleJawaban('tidak')}
              disabled={loading}
              variant="outline"
              className="h-14 text-base border-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all"
            >
              <XCircle className="w-5 h-5 mr-2" />
              TIDAK (CF=0)
            </Button>
          </div>
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
