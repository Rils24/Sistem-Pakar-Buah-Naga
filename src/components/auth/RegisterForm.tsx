import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RegisterFormProps {
  onSubmit: (nama: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  onNavigateToLogin: () => void;
}

export const RegisterForm = ({ onSubmit, onNavigateToLogin }: RegisterFormProps) => {
  const navigate = useNavigate();
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validasi
    if (!nama || !email || !password || !confirmPassword) {
      setError('Semua field harus diisi');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      setLoading(false);
      return;
    }

    const result = await onSubmit(nama, email, password);
    
    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => {
        onNavigateToLogin();
      }, 2000);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Top Bar with Back Button */}
      <div className="p-4">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <img 
                src="/logo.png" 
                alt="Sistem Pakar Buah Naga" 
                className="w-20 h-20"
              />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Buat Akun Baru
              </CardTitle>
              <CardDescription className="text-gray-500">
                Daftar untuk mengakses Sistem Pakar Buah Naga
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-700">{success}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="nama"
                    type="text"
                    placeholder="Nama lengkap Anda"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ulangi password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                disabled={loading}
              >
                {loading ? 'Mendaftar...' : 'Daftar'}
              </Button>

              <div className="text-center text-sm text-gray-500">
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="text-pink-600 hover:text-pink-700 font-medium"
                >
                  Masuk di sini
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
