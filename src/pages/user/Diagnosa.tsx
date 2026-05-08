import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getNodeById } from '@/data/pohonKeputusan';
import { getPenyakitById } from '@/data/penyakit';
import { insertHasilDiagnosa } from '@/services/supabaseService';
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
  Thermometer
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
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="border-2 border-yellow-200">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Tidak Dapat Diidentifikasi
              </h3>
              <p className="text-gray-600 mb-6">
                Berdasarkan jawaban yang diberikan, sistem tidak dapat mengidentifikasi hama atau penyakit.
              </p>
              
              {/* Riwayat Jawaban */}
              <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Riwayat Jawaban:</h4>
                <div className="space-y-2">
                  {jawabanList.map((j, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className={j.jawaban === 'ya' ? 'text-green-600' : 'text-red-500'}>
                        {j.jawaban === 'ya' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </span>
                      <span className="text-gray-600">{j.kodeGejala}</span>
                      <span className="text-gray-400">-</span>
                      <span className="text-gray-700 truncate">{j.namaGejala}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={resetDiagnosa}
                className="bg-pink-600 hover:bg-pink-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Coba Lagi
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Hasil */}
        <div className="text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isHama ? 'bg-orange-100' : isPenyakit ? 'bg-red-100' : 'bg-green-100'
          }`}>
            {isHama ? <Bug className="w-10 h-10 text-orange-600" /> : 
             isPenyakit ? <Sprout className="w-10 h-10 text-red-600" /> : 
             <CheckCircle className="w-10 h-10 text-green-600" />}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isHama ? 'Hama Teridentifikasi' : 'Penyakit Teridentifikasi'}
          </h2>
          <p className="text-gray-500">
            Forward Chaining + Certainty Factor
          </p>
        </div>

        {/* Detail Hasil */}
        <Card className="border-2 border-pink-200">
          <CardContent className="p-6">
            {/* Nama & Kode */}
            <div className="text-center mb-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                isHama ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
              }`}>
                {isHama ? 'HAMA' : 'PENYAKIT'}
              </span>
              <h3 className="text-2xl font-bold text-gray-900">
                {penyakit?.nama}
              </h3>
              <p className="text-gray-500">{penyakit?.kode}</p>
            </div>

            {/* CF Result */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 mb-6 text-center">
              <p className="text-sm text-gray-600 mb-1">Tingkat Kepercayaan (CF)</p>
              <p className="text-4xl font-bold text-pink-600">
                {Math.round(cfTotal * 100)}%
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {getCFInterpretasi(cfTotal)}
              </p>
            </div>

            {/* Deskripsi */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Deskripsi:</h4>
              <p className="text-gray-600 text-sm">{penyakit?.deskripsi}</p>
            </div>

            {/* Solusi */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-pink-600" />
                Solusi Penanganan:
              </h4>
              <div className="space-y-2">
                {penyakit?.solusi.map((s, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-gray-700 text-sm">{s}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Detail Perhitungan CF */}
            {detailPerhitungan.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Detail Perhitungan CF:
                </h4>
                <div className="space-y-2">
                  {detailPerhitungan.map((d, idx) => (
                    <div key={idx} className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-blue-600 font-mono">Step {d.step}:</span>
                        <span className="text-gray-600 truncate">{d.gejala}</span>
                      </div>
                      <p className="text-xs text-gray-500 font-mono mt-1">
                        CF User = 1 (Ya), CF Pakar = {d.cfPakar}
                      </p>
                      <p className="text-xs text-gray-500 font-mono mt-1">
                        {d.rumus}
                      </p>
                    </div>
                  ))}
                  <div className="bg-pink-50 rounded-lg p-3">
                    <p className="text-sm font-mono text-pink-700">
                      <strong>CF Akhir = {cfTotal.toFixed(3)} ({Math.round(cfTotal * 100)}%)</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Riwayat Jawaban */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Riwayat Pertanyaan & Jawaban:
              </h4>
              <div className="space-y-2">
                {jawabanList.map((j, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm flex-1">
                      <span className={j.jawaban === 'ya' ? 'text-green-600' : 'text-red-500'}>
                        {j.jawaban === 'ya' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </span>
                      <span className="text-gray-500 font-mono text-xs">{j.kodeGejala}</span>
                      <span className="text-gray-700 truncate">{j.namaGejala}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">CF={j.jawaban === 'ya' ? '1' : '0'}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        j.jawaban === 'ya' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {j.jawaban.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => navigate('/user/riwayat')}
            className="flex-1 bg-pink-600 hover:bg-pink-700"
          >
            Lihat Riwayat
          </Button>
          <Button 
            variant="outline"
            onClick={resetDiagnosa}
            className="flex-1"
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
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <Stethoscope className="w-6 h-6 text-pink-600" />
          Diagnosa Hama & Penyakit
        </h1>
        <p className="text-gray-500">
          Jawab pertanyaan dengan Ya atau Tidak
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

      {/* Info FC */}
      {jawabanList.length === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700 font-medium">Forward Chaining</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-pink-600" />
              <span className="text-pink-700 font-medium">Certainty Factor</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            CF User: Ya = 1, Tidak = 0 | Rumus: CF = CF(User) × CF(Pakar)
          </p>
        </div>
      )}

      {/* Pertanyaan Card */}
      <Card className="border-2 border-pink-100 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
              {currentNode?.kodeGejala}
            </span>
            <span className="text-xs text-gray-400">
              Pertanyaan {jawabanList.length + 1}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pertanyaan */}
          <div className="text-center py-6">
            <p className="text-lg text-gray-900 leading-relaxed">
              {currentNode?.namaGejala}
            </p>
            {currentNode?.deskripsi && (
              <p className="text-sm text-gray-500 mt-2">
                {currentNode.deskripsi}
              </p>
            )}
          </div>

          {/* Tombol Ya / Tidak */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleJawaban('ya')}
              disabled={loading}
              className="h-16 text-lg bg-green-500 hover:bg-green-600 text-white"
            >
              <CheckCircle className="w-6 h-6 mr-2" />
              YA (CF=1)
            </Button>
            <Button
              onClick={() => handleJawaban('tidak')}
              disabled={loading}
              variant="outline"
              className="h-16 text-lg border-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <XCircle className="w-6 h-6 mr-2" />
              TIDAK (CF=0)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Riwayat Jawaban */}
      {jawabanList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">
              Riwayat Jawaban ({jawabanList.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {jawabanList.map((j, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                  <div className="flex items-center gap-2 flex-1">
                    <span className={j.jawaban === 'ya' ? 'text-green-600' : 'text-red-500'}>
                      {j.jawaban === 'ya' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </span>
                    <span className="text-gray-500 font-mono text-xs">{j.kodeGejala}</span>
                    <span className="text-gray-600 truncate">{j.namaGejala}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    j.jawaban === 'ya' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {j.jawaban.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <div className="bg-blue-50 rounded-lg p-4 text-center text-sm text-blue-700">
        <p>
          Jawab setiap pertanyaan dengan jujur berdasarkan kondisi tanaman Anda.
        </p>
        <p className="mt-1 text-blue-500">
          Sistem akan mengikuti pohon keputusan untuk menemukan hama/penyakit.
        </p>
      </div>
    </div>
  );
};
