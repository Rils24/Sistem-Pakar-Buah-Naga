import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2, Search, Users, User, Shield, Loader2 } from 'lucide-react';
import { fetchUsers, updateUser, deleteUserById } from '@/services/supabaseService';
import { toast } from 'sonner';
import type { User as UserType } from '@/types';

export const KelolaUsers = () => {
  const [usersList, setUsersList] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    role: 'user' as 'admin' | 'user'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsersList(data);
    } catch (err) {
      toast.error('Gagal memuat data users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      nama: user.nama,
      email: user.email,
      role: user.role
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      try {
        await deleteUserById(id);
        setUsersList(usersList.filter(u => u.id !== id));
        toast.success('User berhasil dihapus');
      } catch (err) {
        toast.error('Gagal menghapus user');
        console.error(err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (editingUser) {
        const updated = await updateUser(editingUser.id, formData);
        setUsersList(usersList.map(u => u.id === editingUser.id ? updated : u));
        toast.success('User berhasil diperbarui');
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast.error('Gagal menyimpan user');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Shield className="w-3 h-3" />
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <User className="w-3 h-3" />
        User
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
        <span className="ml-3 text-gray-600">Memuat data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Users</h1>
          <p className="text-gray-500">Manajemen data pengguna sistem</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Tanggal Daftar</TableHead>
                <TableHead className="w-32 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {user.nama.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium">{user.nama}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="hidden md:table-cell text-gray-500">
                      {new Date(user.created_at || Date.now()).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-700"
                          disabled={user.role === 'admin'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Tidak ada data user
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama</Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="bg-pink-600 hover:bg-pink-700" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Info */}
      <div className="bg-green-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-green-600" />
          <p className="text-sm font-medium text-green-800">Statistik User</p>
        </div>
        <p className="text-sm text-green-700">
          Total Users: {usersList.length} | Admin: {usersList.filter(u => u.role === 'admin').length} | 
          User Biasa: {usersList.filter(u => u.role === 'user').length}
        </p>
      </div>
    </div>
  );
};
