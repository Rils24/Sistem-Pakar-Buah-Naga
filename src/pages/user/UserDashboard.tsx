import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchHasilDiagnosaByUserId, fetchPenyakit, fetchGejala } from '@/services/supabaseService';
import { 
  Stethoscope, 
  History, 
  Sprout, 
  Activity, 
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import type { User } from '@/types';

interface UserDashboardProps {
  user: User;
}

export const UserDashboard = ({ user }: UserDashboardProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDiagnosa: 0,
    totalHama: 0,
    totalPenyakit: 0,
    totalHamaPenyakit: 0,
    totalGejala: 0,
    diagnosaTerakhir: null as any
  });

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [riwayat, penyakit, gejala] = await Promise.all([
        fetchHasilDiagnosaByUserId(user.id),
        fetchPenyakit(),
        fetchGejala()
      ]);
      
      const totalHama = penyakit.filter((p: any) => p.tipe === 'hama').length;
      const totalPenyakit = penyakit.filter((p: any) => p.tipe === 'penyakit').length;

      setStats({
        totalDiagnosa: riwayat.length,
        totalHama,
        totalPenyakit,
        totalHamaPenyakit: penyakit.length,
        totalGejala: gejala.length,
        diagnosaTerakhir: riwayat[0] || null
      });
    } catch (err) {
      console.error('Gagal memuat data dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
        <span className="ml-3 text-gray-600">Memuat dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl p-6 sm:p-8 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Selamat Datang, {user.nama}!
        </h1>
        <p className="text-pink-100 text-sm sm:text-lg">
          Sistem Pakar Buah Naga siap membantu mendiagnosa hama & penyakit pada tanaman Anda
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => navigate('/user/diagnosa')}>
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-pink-100 rounded-2xl flex items-center justify-center mb-4">
                  <Stethoscope className="w-6 h-6 sm:w-7 sm:h-7 text-pink-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  Mulai Diagnosa
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  Jawab pertanyaan Ya/Tidak untuk mendapatkan diagnosa hama & penyakit
                </p>
                <Button className="bg-pink-600 hover:bg-pink-700 w-full sm:w-auto">
                  Diagnosa Sekarang
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => navigate('/user/riwayat')}>
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                  <History className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  Riwayat Diagnosa
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  Lihat kembali hasil diagnosa sebelumnya dan pantau perkembangan tanaman
                </p>
                <Button variant="outline" className="w-full sm:w-auto">
                  Lihat Riwayat
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Total Diagnosa</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalDiagnosa}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                <Sprout className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Hama & Penyakit</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalHamaPenyakit}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Total Gejala</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalGejala}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Metode</p>
                <p className="text-base sm:text-lg font-bold text-gray-900">FC + CF</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Diagnosa */}
      {stats.diagnosaTerakhir && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-pink-600" />
              Diagnosa Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-lg text-gray-900">
                  {stats.diagnosaTerakhir.nama_penyakit_terpilih || stats.diagnosaTerakhir.hasil_cf?.[0]?.nama_penyakit}
                </p>
                <p className="text-gray-500">
                  {new Date(stats.diagnosaTerakhir.tanggal).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Tingkat Kepercayaan</p>
                  <p className={`text-2xl font-bold ${
                    (stats.diagnosaTerakhir.cf_tertinggi || 0) >= 0.7 
                      ? 'text-red-600'
                      : (stats.diagnosaTerakhir.cf_tertinggi || 0) >= 0.4
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`}>
                    {Math.round((stats.diagnosaTerakhir.cf_tertinggi || 0) * 100)}%
                  </p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/user/riwayat')}
                >
                  Detail
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-2">
          Tentang Metode Certainty Factor
        </h4>
        <p className="text-blue-700 text-sm">
          Certainty Factor (CF) adalah metode untuk menghitung tingkat kepastian dalam sistem pakar. 
          User menjawab Ya (CF=1) atau Tidak (CF=0), lalu dikombinasikan dengan CF Pakar untuk 
          menghasilkan diagnosa yang akurat.
        </p>
      </div>
    </div>
  );
};
