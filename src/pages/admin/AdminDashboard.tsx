import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchPenyakit, fetchGejala, fetchRules, fetchUsers, fetchHasilDiagnosa } from '@/services/supabaseService';
import { Sprout, Stethoscope, BookOpen, Users, Activity, GitBranch, Calculator, Loader2 } from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalHama: 0,
    totalPenyakit: 0,
    totalHamaPenyakit: 0,
    totalGejala: 0,
    totalRules: 0,
    totalUsers: 0,
    totalDiagnosa: 0
  });

  const [recentDiagnosa, setRecentDiagnosa] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [penyakit, gejala, rules, users, diagnosa] = await Promise.all([
        fetchPenyakit(),
        fetchGejala(),
        fetchRules(),
        fetchUsers(),
        fetchHasilDiagnosa()
      ]);
      
      const totalHama = penyakit.filter((p: any) => p.tipe === 'hama').length;
      const totalPenyakit = penyakit.filter((p: any) => p.tipe === 'penyakit').length;

      setStats({
        totalHama,
        totalPenyakit,
        totalHamaPenyakit: penyakit.length,
        totalGejala: gejala.length,
        totalRules: rules.length,
        totalUsers: users.filter(u => u.role === 'user').length,
        totalDiagnosa: diagnosa.length
      });

      setRecentDiagnosa(diagnosa.slice(0, 5));
    } catch (err) {
      console.error('Gagal memuat data dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Hama & Penyakit',
      value: stats.totalHamaPenyakit,
      sub: `${stats.totalHama} Hama, ${stats.totalPenyakit} Penyakit`,
      icon: Sprout,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      title: 'Total Gejala',
      value: stats.totalGejala,
      icon: Stethoscope,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Rules',
      value: stats.totalRules,
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Diagnosa',
      value: stats.totalDiagnosa,
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-500">
          Sistem Pakar Buah Naga - Diagnosa Hama & Penyakit (Forward Chaining + Certainty Factor)
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {statCards.map((card, index) => (
          <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">{card.title}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{card.value}</p>
                  {card.sub && <p className="text-[11px] sm:text-xs text-gray-400 mt-1">{card.sub}</p>}
                </div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${card.bgColor} rounded-xl flex items-center justify-center shrink-0`}>
                  <card.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Algoritma Info */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Forward Chaining */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <GitBranch className="w-5 h-5" />
              Forward Chaining
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-sm">
              Forward Chaining adalah metode penalaran yang dimulai dari <strong>fakta</strong> (gejala) 
              menuju <strong>kesimpulan</strong> (hama & penyakit). Sistem mencocokkan gejala yang dipilih user 
              dengan rules untuk menemukan hama atau penyakit yang sesuai.
            </p>
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm">Alur Kerja:</h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>User menjawab pertanyaan gejala (Ya/Tidak)</li>
                <li>Sistem cocokkan gejala dengan rules (IF)</li>
                <li>Rules yang cocok menghasilkan hama/penyakit (THEN)</li>
                <li>Dapatkan daftar hama/penyakit yang terdeteksi</li>
              </ol>
            </div>
            <div className="text-sm text-gray-500 font-mono bg-gray-50 rounded p-3">
              <p><strong>IF</strong> Gejala A <strong>AND</strong> Gejala B <strong>THEN</strong> Hama/Penyakit X</p>
            </div>
          </CardContent>
        </Card>

        {/* Certainty Factor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-700">
              <Calculator className="w-5 h-5" />
              Certainty Factor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-sm">
              Certainty Factor (CF) digunakan untuk menghitung <strong>tingkat kepastian</strong> 
              diagnosa. CF ada di setiap gejala (cf_pakar). User menjawab Ya (CF=1) atau Tidak (CF=0).
            </p>
            <div className="bg-pink-50 rounded-lg p-4">
              <h4 className="font-semibold text-pink-900 mb-2 text-sm">Rumus:</h4>
              <div className="space-y-1 text-sm font-mono">
                <p className="text-pink-800">CF(H,E) = CF(User) × CF(Pakar)</p>
                <p className="text-pink-700">CF(Kombinasi) = CF₁ + CF₂ × (1 - CF₁)</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">Komponen CF:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>CF User</strong>: Ya = 1, Tidak = 0</li>
                <li>• <strong>CF Pakar (Gejala)</strong>: Kepastian pakar per gejala (0.1 - 1.0)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Diagnosa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-pink-600" />
            Diagnosa Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentDiagnosa.length > 0 ? (
            <div className="space-y-3">
              {recentDiagnosa.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.nama_penyakit_terpilih || item.hasil_cf?.[0]?.nama_penyakit || 'Tidak diketahui'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(item.tanggal).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      (item.cf_tertinggi || 0) >= 0.7 
                        ? 'bg-red-100 text-red-800'
                        : (item.cf_tertinggi || 0) >= 0.4
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {Math.round((item.cf_tertinggi || 0) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Belum ada data diagnosa</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Akses Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <a 
              href="#/admin/penyakit"
              className="flex items-center gap-3 p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
            >
              <Sprout className="w-6 h-6 text-pink-600" />
              <div>
                <p className="font-medium text-gray-900">Kelola Hama & Penyakit</p>
                <p className="text-sm text-gray-500">{stats.totalHamaPenyakit} data ({stats.totalHama} Hama, {stats.totalPenyakit} Penyakit)</p>
              </div>
            </a>
            <a 
              href="#/admin/gejala"
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Stethoscope className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Kelola Gejala</p>
                <p className="text-sm text-gray-500">{stats.totalGejala} gejala</p>
              </div>
            </a>
            <a 
              href="#/admin/rules"
              className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <BookOpen className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Kelola Rules</p>
                <p className="text-sm text-gray-500">{stats.totalRules} rules</p>
              </div>
            </a>
            <a 
              href="#/admin/users"
              className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Users className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Kelola Users</p>
                <p className="text-sm text-gray-500">{stats.totalUsers} users</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
