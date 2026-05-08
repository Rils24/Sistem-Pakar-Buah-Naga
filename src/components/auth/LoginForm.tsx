import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  onNavigateToRegister: () => void;
}

export const LoginForm = ({ onSubmit, onNavigateToRegister }: LoginFormProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-center text-gray-400">
                  Akun Demo Admin:<br />
                  Email: admin@sistempakar.com | Password: admin123
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
