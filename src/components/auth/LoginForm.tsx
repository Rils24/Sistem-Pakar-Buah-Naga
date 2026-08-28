import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, HelpCircle, MessageCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  onNavigateToRegister: () => void;
}

// ── Ganti nomor WA dan nama admin sesuai kebutuhan ──
const ADMIN_WHATSAPP = "6289673525057"; // Format: kode negara + nomor tanpa 0 di depan
const ADMIN_NAME = "Admin Sistem Pakar";

export const LoginForm = ({ onSubmit, onNavigateToRegister }: LoginFormProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotInfo, setShowForgotInfo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Email dan password harus diisi');
      setLoading(false);
      return;
    }

    const result = await onSubmit(email, password);
    
    if (!result.success) {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const waMessage = encodeURIComponent(
    `Halo ${ADMIN_NAME}, saya lupa password akun Sistem Pakar Buah Naga. Mohon bantuannya untuk mereset password saya.\n\nEmail: ${email || '(belum diisi)'}`
  );

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
                Selamat Datang
              </CardTitle>
              <CardDescription className="text-gray-500">
                Masuk ke Sistem Pakar Buah Naga
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
                    placeholder="••••••••"
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

              {/* Lupa Password Link */}
              <div className="flex justify-end -mt-1">
                <button
                  type="button"
                  onClick={() => setShowForgotInfo(!showForgotInfo)}
                  className="text-xs text-gray-400 hover:text-pink-600 flex items-center gap-1 transition-colors"
                >
                  <HelpCircle className="w-3 h-3" />
                  Lupa password?
                </button>
              </div>

              {/* Expandable Forgot Password Info */}
              {showForgotInfo && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="w-4 h-4 text-amber-600" />
                      </div>
                      <p className="text-sm font-medium text-amber-800">
                        Lupa Password?
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowForgotInfo(false)}
                      className="text-amber-400 hover:text-amber-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Sistem ini tidak menggunakan verifikasi email. Silakan hubungi admin 
                    untuk mereset password akun Anda.
                  </p>
                  <a
                    href={`https://wa.me/${ADMIN_WHATSAPP}?text=${waMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Hubungi Admin via WhatsApp
                  </a>
                  <p className="text-[10px] text-amber-500 text-center">
                    Sertakan email akun Anda saat menghubungi admin
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                disabled={loading}
              >
                {loading ? 'Memuat...' : 'Masuk'}
              </Button>

              <div className="text-center text-sm text-gray-500">
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={onNavigateToRegister}
                  className="text-pink-600 hover:text-pink-700 font-medium"
                >
                  Daftar sekarang
                </button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
