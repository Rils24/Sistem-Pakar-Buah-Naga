import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2, Search, Sprout, Loader2 } from 'lucide-react';
import { fetchPenyakit, insertPenyakit, updatePenyakit, deletePenyakit } from '@/services/supabaseService';
import { toast } from 'sonner';
import type { Penyakit } from '@/types';

export const KelolaPenyakit = () => {
  const [penyakitList, setPenyakitList] = useState<Penyakit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPenyakit, setEditingPenyakit] = useState<Penyakit | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    deskripsi: '',
    solusi: '',
    tipe: 'penyakit' as 'hama' | 'penyakit'
  });

  // Fetch data dari Supabase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchPenyakit();
      setPenyakitList(data);
    } catch (err) {
      toast.error('Gagal memuat data penyakit');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPenyakit = penyakitList.filter(p => 
    p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.kode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingPenyakit(null);
    setFormData({ kode: '', nama: '', deskripsi: '', solusi: '', tipe: 'penyakit' });
    setIsDialogOpen(true);
  };

  const handleEdit = (penyakit: Penyakit) => {
    setEditingPenyakit(penyakit);
    setFormData({
      kode: penyakit.kode,
      nama: penyakit.nama,
      deskripsi: penyakit.deskripsi,
      solusi: penyakit.solusi.join('\n'),
      tipe: penyakit.tipe
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus penyakit ini?')) {
      try {
        await deletePenyakit(id);
        setPenyakitList(penyakitList.filter(p => p.id !== id));
        toast.success('Penyakit berhasil dihapus');
      } catch (err) {
        toast.error('Gagal menghapus penyakit');
        console.error(err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const solusiArray = formData.solusi.split('\n').filter(s => s.trim() !== '');
    
    try {
      if (editingPenyakit) {
        const updated = await updatePenyakit(editingPenyakit.id, {
          kode: formData.kode,
          nama: formData.nama,
          deskripsi: formData.deskripsi,
          solusi: solusiArray,
          tipe: formData.tipe
        });
        setPenyakitList(penyakitList.map(p => p.id === editingPenyakit.id ? updated : p));
        toast.success('Penyakit berhasil diperbarui');
      } else {
        const newPenyakit: Penyakit = {
          id: `${formData.tipe === 'hama' ? 'h' : 'p'}${Date.now()}`,
          kode: formData.kode,
          nama: formData.nama,
          deskripsi: formData.deskripsi,
          solusi: solusiArray,
          tipe: formData.tipe
        };
        const inserted = await insertPenyakit(newPenyakit);
        setPenyakitList([...penyakitList, inserted]);
        toast.success('Penyakit berhasil ditambahkan');
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast.error('Gagal menyimpan penyakit');
      console.error(err);
    } finally {
      setSaving(false);
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Kelola Penyakit</h1>
          <p className="text-gray-500">Manajemen data penyakit buah naga</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} className="bg-pink-600 hover:bg-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Penyakit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPenyakit ? 'Edit Penyakit' : 'Tambah Penyakit Baru'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kode">Kode Penyakit</Label>
                  <Input
                    id="kode"
                    value={formData.kode}
                    onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                    placeholder="P01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipe">Tipe</Label>
                  <select
                    id="tipe"
                    value={formData.tipe}
                    onChange={(e) => setFormData({ ...formData, tipe: e.target.value as 'hama' | 'penyakit' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="hama">Hama</option>
                    <option value="penyakit">Penyakit</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Penyakit</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Nama penyakit"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <Textarea
                  id="deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  placeholder="Deskripsi penyakit..."
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="solusi">Solusi (satu per baris)</Label>
                <Textarea
                  id="solusi"
                  value={formData.solusi}
                  onChange={(e) => setFormData({ ...formData, solusi: e.target.value })}
                  placeholder={"1. Solusi pertama\n2. Solusi kedua\n3. Solusi ketiga"}
                  rows={5}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" className="bg-pink-600 hover:bg-pink-700" disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingPenyakit ? 'Simpan Perubahan' : 'Tambah Penyakit'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari penyakit..."
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
                <TableHead className="w-20">Kode</TableHead>
                <TableHead className="w-20">Tipe</TableHead>
                <TableHead>Nama Penyakit</TableHead>
                <TableHead className="hidden md:table-cell">Deskripsi</TableHead>
                <TableHead className="w-32 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPenyakit.length > 0 ? (
                filteredPenyakit.map((penyakit) => (
                  <TableRow key={penyakit.id}>
                    <TableCell className="font-medium">{penyakit.kode}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        penyakit.tipe === 'hama' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {penyakit.tipe === 'hama' ? 'Hama' : 'Penyakit'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Sprout className="w-4 h-4 text-pink-600" />
                        {penyakit.nama}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-md">
                      <p className="truncate">{penyakit.deskripsi}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(penyakit)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(penyakit.id)}
                          className="text-red-600 hover:text-red-700"
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
                    Tidak ada data penyakit
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Info */}
      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>Info:</strong> Total {penyakitList.length} penyakit dalam database Supabase. 
          Penyakit yang ditampilkan: {filteredPenyakit.length}
        </p>
      </div>
    </div>
  );
};
