import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Stethoscope, 
  Shield, 
  ArrowRight, 
  CheckCircle,
  Leaf, 
  Brain,
  GitBranch,
  Calculator,
  Sparkles,
  ChevronRight,
  Zap,
  Bug
} from 'lucide-react';
import { fetchPenyakit, fetchGejala, fetchRules } from '@/services/supabaseService';
import type { Penyakit, Gejala, Rule } from '@/types';

export const LandingPage = () => {
  const navigate = useNavigate();

  // State untuk data dari database
  const [penyakitData, setPenyakitData] = useState<Penyakit[]>([]);
  const [gejalaCount, setGejalaCount] = useState(0);
  const [rulesCount, setRulesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Pisahkan hama dan penyakit
  const hamaList = penyakitData.filter(p => p.tipe === 'hama');
  const penyakitList = penyakitData.filter(p => p.tipe === 'penyakit');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [penyakitRes, gejalaRes, rulesRes] = await Promise.all([
          fetchPenyakit(),
          fetchGejala(),
          fetchRules()
        ]);
        setPenyakitData(penyakitRes);
        setGejalaCount(gejalaRes.length);
        setRulesCount(rulesRes.length);
      } catch (err) {
        console.error('Gagal memuat data landing page:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const features = [
    {
      icon: GitBranch,
      title: 'Forward Chaining',
      description: 'Sistem mencocokkan gejala yang Anda pilih dengan rules untuk menemukan penyakit yang sesuai'
    },
    {
      icon: Calculator,
      title: 'Certainty Factor',
      description: 'Setiap gejala memiliki nilai CF dari pakar untuk menghitung tingkat kepastian diagnosa'
    },
    {
      icon: Shield,
      title: 'Terpercaya',
      description: 'Metode diagnosa berdasarkan pengetahuan pakar pertanian dan referensi ilmiah'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Pilih Gejala',
      description: 'Pilih gejala yang Anda amati dengan tingkat keyakinan'
    },
    {
      number: '02',
      title: 'Forward Chaining',
      description: 'Sistem mencocokkan gejala dengan rules untuk temukan penyakit'
    },
    {
      number: '03',
      title: 'Certainty Factor',
      description: 'Hitung CF = CF(User) × CF(Pakar) untuk tingkat kepastian'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Sistem Pakar Buah Naga" 
                className="w-10 h-10"
              />
              <span className="font-bold text-xl text-gray-900">
                Sistem Pakar <span className="text-pink-600">Buah Naga</span>
              </span>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Masuk
              </Button>
              <Button 
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
              >
                Daftar
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-pink-50 via-rose-50 to-transparent opacity-70" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-100 to-rose-100 rounded-full blur-3xl opacity-50" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Sistem Pakar Pertanian Cerdas
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Diagnosa Penyakit{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">
                  Buah Naga
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 max-w-xl leading-relaxed">
                Sistem pakar berbasis web dengan metode{' '}
                <strong className="text-pink-600">Forward Chaining</strong> dan{' '}
                <strong className="text-pink-600">Certainty Factor</strong> untuk 
                mendiagnosa penyakit pada tanaman buah naga secara akurat.
              </p>
              
              {/* FC + CF Badge */}
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
                  <GitBranch className="w-4 h-4" />
                  Forward Chaining
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-700 rounded-lg text-sm font-medium border border-pink-200">
                  <Calculator className="w-4 h-4" />
                  Certainty Factor
                </span>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 shadow-lg shadow-pink-200"
                >
                  Mulai Diagnosa
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => document.getElementById('fitur')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Pelajari Lebih
                </Button>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Gratis
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Akurat
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  FC + CF
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 rounded-3xl transform rotate-3 opacity-20" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="/hero-dragonfruit.jpg" 
                  alt="Buah Naga Segar"
                  className="w-full h-auto object-cover"
                />
                {/* Floating Card - Forward Chaining + CF */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Forward Chaining + CF</p>
                      <p className="text-sm text-gray-500">{penyakitData.length} Hama & Penyakit | {gejalaCount} Gejala | {rulesCount} Rules</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-pink-600 to-rose-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-white">{hamaList.length}</p>
              <p className="text-pink-100 mt-1">Jenis Hama</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">{penyakitList.length}</p>
              <p className="text-pink-100 mt-1">Jenis Penyakit</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">{gejalaCount}</p>
              <p className="text-pink-100 mt-1">Gejala (dengan CF)</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">{rulesCount}</p>
              <p className="text-pink-100 mt-1">Rules Forward Chaining</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">FC+CF</p>
              <p className="text-pink-100 mt-1">Metode Diagnosa</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Fitur Unggulan
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Forward Chaining + Certainty Factor
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Kombinasi dua metode sistem pakar untuk diagnosa yang akurat dan terpercaya
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              <Brain className="w-4 h-4" />
              Cara Kerja
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              3 Langkah Diagnosa
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Alur diagnosa dari gejala hingga hasil dengan Forward Chaining dan Certainty Factor
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="text-7xl font-bold text-pink-100 mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <ChevronRight className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Forward Chaining + CF Detail */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Forward Chaining */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                <GitBranch className="w-4 h-4" />
                Forward Chaining
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Penalaran Maju dari Gejala ke Penyakit
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Forward Chaining bekerja dari fakta yang diketahui (gejala) menuju kesimpulan (penyakit). 
                Sistem mencocokkan gejala yang dipilih dengan rules untuk menemukan penyakit yang sesuai.
              </p>
              <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                <h4 className="font-semibold text-blue-900 mb-3">Contoh Rule:</h4>
                <div className="font-mono text-sm text-blue-700 space-y-2">
                  <p><span className="text-pink-600 font-bold">IF</span> Batang membusuk</p>
                  <p><span className="text-pink-600 font-bold">AND</span> Batang lembek berair</p>
                  <p><span className="text-pink-600 font-bold">THEN</span> Busuk Batang (Stem Rot)</p>
                </div>
              </div>
            </div>

            {/* Certainty Factor */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium mb-4">
                <Calculator className="w-4 h-4" />
                Certainty Factor
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Perhitungan Kepastian per Gejala
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Setiap gejala memiliki CF (Certainty Factor) dari pakar. Perhitungan:{' '}
                <strong>CF = CF(User) × CF(Pakar)</strong>. Semakin tinggi CF, semakin yakin diagnosanya.
              </p>
              <div className="bg-white rounded-xl p-6 shadow-md border border-pink-100">
                <h4 className="font-semibold text-pink-900 mb-3">Contoh Perhitungan:</h4>
                <div className="font-mono text-sm text-pink-700 space-y-2">
                  <p>CF User (Yakin) = 0.8</p>
                  <p>CF Pakar (Gejala) = 0.9</p>
                  <p className="border-t pt-2 mt-2">
                    <strong>CF = 0.8 × 0.9 = 0.72 (72%)</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hama & Penyakit Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
              <Leaf className="w-4 h-4" />
              Hama & Penyakit yang Dideteksi
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {penyakitData.length} Jenis Hama & Penyakit Buah Naga
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Sistem dapat mendeteksi berbagai hama dan penyakit umum pada tanaman buah naga
            </p>
          </div>

          {/* Hama */}
          {hamaList.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center">
                  <Bug className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Hama <span className="text-orange-500">({hamaList.length})</span>
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {hamaList.map((hama) => (
                  <div 
                    key={hama.id}
                    className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-orange-100 hover:shadow-md hover:border-orange-200 transition-all"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bug className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium text-sm">{hama.nama}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Penyakit */}
          {penyakitList.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Penyakit <span className="text-pink-500">({penyakitList.length})</span>
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {penyakitList.map((penyakit) => (
                  <div 
                    key={penyakit.id}
                    className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-pink-200 transition-all"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium text-sm">{penyakit.nama}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="text-center text-gray-400 py-8">
              <div className="animate-spin w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full mx-auto mb-3" />
              Memuat data...
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-pink-600 to-rose-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Forward Chaining + Certainty Factor
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Siap untuk Mendiagnosa Tanaman Anda?
          </h2>
          <p className="text-pink-100 text-lg mb-8 max-w-2xl mx-auto">
            Daftar gratis dan gunakan sistem pakar dengan metode Forward Chaining dan Certainty Factor 
            untuk diagnosa penyakit buah naga yang akurat
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-white text-pink-600 hover:bg-gray-100 shadow-lg"
            >
              Daftar Gratis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
              className="border-white text-white hover:bg-white/10"
            >
              Sudah Punya Akun?
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="w-10 h-10"
                />
                <span className="font-bold text-xl text-white">
                  Sistem Pakar <span className="text-pink-500">Buah Naga</span>
                </span>
              </div>
              <p className="text-gray-400 max-w-sm">
                Sistem pakar dengan Forward Chaining dan Certainty Factor untuk 
                mendiagnosa penyakit pada tanaman buah naga.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Menu</h4>
              <ul className="space-y-2">
                <li><a href="#/" className="hover:text-pink-400 transition-colors">Beranda</a></li>
                <li><a href="#/login" className="hover:text-pink-400 transition-colors">Masuk</a></li>
                <li><a href="#/register" className="hover:text-pink-400 transition-colors">Daftar</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Metode</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  Forward Chaining
                </li>
                <li className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Certainty Factor
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm">
              © 2026 Sistem Pakar Buah Naga.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
