import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserCircle, Mail, User, CheckCircle, Lock, Loader2 } from 'lucide-react';
import type { User as UserType } from '@/types';

interface ProfilProps {
  user: UserType;
  onUpdate: (data: Partial<UserType>) => Promise<{ success: boolean; message: string }>;
}

interface FeedbackMessage {
  type: 'success' | 'error' | '';
  text: string;
}

export const Profil = ({ user, onUpdate }: ProfilProps) => {
  const [formData, setFormData] = useState({
    nama: user.nama,
    email: user.email
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState<FeedbackMessage>({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState<FeedbackMessage>({ type: '', text: '' });
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setSaving(true);

    try {
      const result = await onUpdate(formData);
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat memperbarui profil' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });
    setSavingPassword(true);

    if (passwordData.currentPassword !== user.password) {
      setPasswordMessage({ type: 'error', text: 'Password saat ini salah' });
      setSavingPassword(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password baru minimal 6 karakter' });
      setSavingPassword(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Konfirmasi password tidak cocok' });
      setSavingPassword(false);
      return;
    }

    try {
      const result = await onUpdate({ password: passwordData.newPassword });
      if (result.success) {
        setPasswordMessage({ type: 'success', text: 'Password berhasil diubah' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'Terjadi kesalahan saat mengubah password' });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <UserCircle className="w-6 h-6 text-pink-600" />
          Profil Saya
        </h1>
        <p className="text-gray-500">
          Kelola informasi profil dan keamanan akun Anda
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-pink-600" />
              Informasi Profil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {message.text && (
                <Alert className={message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                  <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {user.nama.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="pl-10"
                    required
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
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={user.role === 'admin' ? 'Administrator' : 'Pengguna'}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <div className="space-y-2">
                <Label>Bergabung Sejak</Label>
                <Input
                  value={new Date(user.created_at || Date.now()).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <Button 
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700"
                disabled={saving}
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
                ) : (
                  <><CheckCircle className="w-4 h-4 mr-2" /> Simpan Perubahan</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-pink-600" />
              Ubah Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordMessage.text && (
                <Alert className={passwordMessage.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                  <AlertDescription className={passwordMessage.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                    {passwordMessage.text}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="currentPassword">Password Saat Ini</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Masukkan password saat ini"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Password Baru</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Ulangi password baru"
                  required
                />
              </div>

              <Button 
                type="submit"
                variant="outline"
                className="w-full"
                disabled={savingPassword}
              >
                {savingPassword ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengubah...</>
                ) : (
                  <><Lock className="w-4 h-4 mr-2" /> Ubah Password</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
