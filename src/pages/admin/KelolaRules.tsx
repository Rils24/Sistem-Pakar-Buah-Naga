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
import { Plus, Edit, Trash2, Search, BookOpen, GitBranch, Loader2 } from 'lucide-react';
import { fetchRules, fetchPenyakit, fetchGejala, insertRule, updateRule, deleteRule } from '@/services/supabaseService';
import { toast } from 'sonner';
import type { Rule, Penyakit, Gejala } from '@/types';

export const KelolaRules = () => {
  const [rulesList, setRulesList] = useState<Rule[]>([]);
  const [penyakitList, setPenyakitList] = useState<Penyakit[]>([]);
  const [gejalaList, setGejalaList] = useState<Gejala[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [selectedPenyakit, setSelectedPenyakit] = useState('');
  const [selectedGejalaIds, setSelectedGejalaIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rulesData, penyakitData, gejalaData] = await Promise.all([
        fetchRules(),
        fetchPenyakit(),
        fetchGejala()
      ]);
      setRulesList(rulesData);
      setPenyakitList(penyakitData);
      setGejalaList(gejalaData);
    } catch (err) {
      toast.error('Gagal memuat data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPenyakitName = (id: string) => {
    return penyakitList.find(p => p.id === id)?.nama || 'Unknown';
  };

  const getPenyakitKode = (id: string) => {
    return penyakitList.find(p => p.id === id)?.kode || 'Unknown';
  };

  const getGejalaName = (id: string) => {
    return gejalaList.find(g => g.id === id)?.nama || 'Unknown';
  };

  const getGejalaKode = (id: string) => {
    return gejalaList.find(g => g.id === id)?.kode || 'Unknown';
  };

  const getGejalaCfPakar = (id: string) => {
    return gejalaList.find(g => g.id === id)?.cf_pakar || 0;
  };

  const filteredRules = rulesList.filter(r => 
    getPenyakitName(r.penyakit_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getPenyakitKode(r.penyakit_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingRule(null);
    setSelectedPenyakit('');
    setSelectedGejalaIds([]);
    setIsDialogOpen(true);
  };

  const handleEdit = (rule: Rule) => {
    setEditingRule(rule);
    setSelectedPenyakit(rule.penyakit_id);
    setSelectedGejalaIds([...rule.gejala_ids]);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus rule ini?')) {
      try {
        await deleteRule(id);
        setRulesList(rulesList.filter(r => r.id !== id));
        toast.success('Rule berhasil dihapus');
      } catch (err) {
        toast.error('Gagal menghapus rule');
        console.error(err);
      }
    }
  };

  const handleGejalaToggle = (gejalaId: string) => {
    setSelectedGejalaIds(prev => {
      if (prev.includes(gejalaId)) {
        return prev.filter(id => id !== gejalaId);
      } else {
        return [...prev, gejalaId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedGejalaIds.length === 0) {
      toast.error('Pilih minimal satu gejala');
      return;
    }

    setSaving(true);
    
    try {
      if (editingRule) {
        const updated = await updateRule(editingRule.id, {
          penyakit_id: selectedPenyakit,
          gejala_ids: selectedGejalaIds
        });
        setRulesList(rulesList.map(r => r.id === editingRule.id ? updated : r));
        toast.success('Rule berhasil diperbarui');
      } else {
        const newRule: Rule = {
          id: `r${Date.now()}`,
          penyakit_id: selectedPenyakit,
          gejala_ids: selectedGejalaIds
        };
        const inserted = await insertRule(newRule);
        setRulesList([...rulesList, inserted]);
        toast.success('Rule berhasil ditambahkan');
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast.error('Gagal menyimpan rule');
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
          <h1 className="text-2xl font-bold text-gray-900">Kelola Rules</h1>
          <p className="text-gray-500">
            Aturan Forward Chaining: Jika gejala X maka penyakit Y
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} className="bg-pink-600 hover:bg-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRule ? 'Edit Rule' : 'Tambah Rule Baru'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Pilih Penyakit */}
              <div className="space-y-2">
                <Label htmlFor="penyakit">Penyakit (Konsekuensi / Then)</Label>
                <select
                  id="penyakit"
                  value={selectedPenyakit}
                  onChange={(e) => setSelectedPenyakit(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                >
                  <option value="">Pilih Penyakit</option>
                  {penyakitList.map(p => (
                    <option key={p.id} value={p.id}>{p.kode} - {p.nama}</option>
                  ))}
                </select>
              </div>

              {/* Pilih Gejala (Antecedent / If) */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  Gejala (Antecedent / If)
                </Label>
                <div className="border border-gray-200 rounded-lg p-4 max-h-80 overflow-y-auto">
                  <div className="space-y-2">
                    {gejalaList.map(gejala => {
                      const isSelected = selectedGejalaIds.includes(gejala.id);
                      
                      return (
                        <label 
                          key={gejala.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-pink-500 bg-pink-50' 
                              : 'border-gray-200 hover:border-pink-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleGejalaToggle(gejala.id)}
                            className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium">{gejala.kode} - {gejala.nama}</span>
                          </div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                            CF: {Math.round(gejala.cf_pakar * 100)}%
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {selectedGejalaIds.length} gejala dipilih
                </p>
              </div>

              {/* Preview Rule */}
              {selectedPenyakit && selectedGejalaIds.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <h4 className="font-semibold text-blue-900 mb-3 text-sm">Preview Rule:</h4>
                  <div className="text-sm text-blue-800 font-mono bg-white rounded-lg p-3 border border-blue-100 leading-relaxed">
                    <span className="text-pink-600 font-bold">IF</span>{' '}
                    {selectedGejalaIds.map((id, idx) => (
                      <span key={id}>
                        <span className="font-semibold text-blue-700">{getGejalaKode(id)}</span>
                        {idx < selectedGejalaIds.length - 1 && (
                          <span className="text-gray-400 mx-1">AND</span>
                        )}
                      </span>
                    ))}
                    {' '}<span className="text-pink-600 font-bold">THEN</span>{' '}
                    <span className="font-semibold text-emerald-700">{getPenyakitKode(selectedPenyakit)}</span>
                    <span className="text-gray-500"> — {getPenyakitName(selectedPenyakit)}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" className="bg-pink-600 hover:bg-pink-700" disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingRule ? 'Simpan Perubahan' : 'Tambah Rule'}
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
              placeholder="Cari rule berdasarkan penyakit..."
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
                <TableHead className="w-16">Rule</TableHead>
                <TableHead>IF (Gejala)</TableHead>
                <TableHead>THEN (Penyakit)</TableHead>
                <TableHead className="w-32 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRules.length > 0 ? (
                filteredRules.map((rule, index) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium text-gray-500">
                      R{String(index + 1).padStart(2, '0')}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {rule.gejala_ids.map((gid) => (
                          <div key={gid} className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">{getGejalaKode(gid)}</span>
                            <span className="text-gray-400">-</span>
                            <span className="text-gray-700">{getGejalaName(gid)}</span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-600">
                              CF {Math.round(getGejalaCfPakar(gid) * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                        <div>
                          <span className="font-medium">{getPenyakitKode(rule.penyakit_id)}</span>
                          <span className="text-gray-500"> - {getPenyakitName(rule.penyakit_id)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(rule)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(rule.id)}
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
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    Tidak ada data rules
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Info Forward Chaining */}
      <div className="bg-purple-50 rounded-lg p-4">
        <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
          <GitBranch className="w-4 h-4" />
          Forward Chaining
        </h4>
        <p className="text-sm text-purple-700 mb-2">
          Forward Chaining bekerja dari <strong>gejala</strong> (yang dipilih user) menuju <strong>penyakit</strong> (kesimpulan).
        </p>
        <div className="text-sm text-purple-600 font-mono bg-white rounded p-3">
          <p><strong>IF</strong> Gejala A <strong>AND</strong> Gejala B <strong>AND</strong> Gejala C</p>
          <p><strong>THEN</strong> Penyakit X</p>
        </div>
        <p className="text-sm text-purple-600 mt-2">
          CF ada di setiap gejala (cf_pakar). User menjawab Ya (CF=1) atau Tidak (CF=0). Perhitungan: CF = CF(User) × CF(Pakar/Gejala)
        </p>
      </div>
    </div>
  );
};
