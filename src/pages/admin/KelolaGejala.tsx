import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Stethoscope,
  Gauge,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  fetchGejala,
  insertGejala,
  updateGejala,
  deleteGejala,
} from "@/services/supabaseService";
import { TablePagination } from "@/components/ui/table-pagination";
import { toast } from "sonner";
import type { Gejala } from "@/types";

const ITEMS_PER_PAGE = 10;

export const KelolaGejala = () => {
  const [gejalaList, setGejalaList] = useState<Gejala[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGejala, setEditingGejala] = useState<Gejala | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteBulkConfirm, setDeleteBulkConfirm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    kode: "",
    nama: "",
    deskripsi: "",
    cf_pakar: 0.8,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchGejala();
      setGejalaList(data);
    } catch (err) {
      toast.error("Gagal memuat data gejala");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredGejala = gejalaList.filter(
    (g) =>
      g.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.kode.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredGejala.length / ITEMS_PER_PAGE),
  );
  const paginatedGejala = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredGejala.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredGejala, currentPage]);

  const handleAdd = () => {
    setEditingGejala(null);
    setFormData({ kode: "", nama: "", deskripsi: "", cf_pakar: 0.8 });
    setIsDialogOpen(true);
  };

  const handleEdit = (gejala: Gejala) => {
    setEditingGejala(gejala);
    setFormData({
      kode: gejala.kode,
      nama: gejala.nama,
      deskripsi: gejala.deskripsi || "",
      cf_pakar: gejala.cf_pakar,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteGejala(id);
      setGejalaList((prev) => prev.filter((g) => g.id !== id));
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
      toast.success("Gejala berhasil dihapus");
    } catch (err) {
      toast.error("Gagal menghapus gejala");
      console.error(err);
    } finally {
      setDeleting(false);
      setDeleteTargetId(null);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [
        ...new Set([...prev, ...paginatedGejala.map((g) => g.id)]),
      ]);
    } else {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedGejala.some((g) => g.id === id)),
      );
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id),
    );
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    try {
      await Promise.all(selectedIds.map((id) => deleteGejala(id)));
      setGejalaList((prev) => prev.filter((g) => !selectedIds.includes(g.id)));
      setSelectedIds([]);
      toast.success("Gejala terpilih berhasil dihapus");
    } catch (err) {
      toast.error("Gagal menghapus gejala terpilih");
      console.error(err);
    } finally {
      setDeleting(false);
      setDeleteBulkConfirm(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const isG00 = formData.kode.trim().toUpperCase() === "G00";
    const finalCfPakar = isG00 ? 0 : formData.cf_pakar;

    try {
      if (editingGejala) {
        const updated = await updateGejala(editingGejala.id, {
          kode: formData.kode,
          nama: formData.nama,
          deskripsi: formData.deskripsi,
          cf_pakar: finalCfPakar,
        });
        setGejalaList(
          gejalaList.map((g) => (g.id === editingGejala.id ? updated : g)),
        );
        toast.success("Gejala berhasil diperbarui");
      } else {
        const newGejala: Gejala = {
          id: `g${Date.now()}`,
          kode: formData.kode,
          nama: formData.nama,
          deskripsi: formData.deskripsi,
          cf_pakar: finalCfPakar,
        };
        const inserted = await insertGejala(newGejala);
        setGejalaList([...gejalaList, inserted]);
        toast.success("Gejala berhasil ditambahkan");
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast.error("Gagal menyimpan gejala");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getCfColor = (cf: number) => {
    if (cf >= 0.9) return "bg-red-100 text-red-800";
    if (cf >= 0.7) return "bg-orange-100 text-orange-800";
    if (cf >= 0.5) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
        <span className="ml-3 text-gray-600">Memuat data...</span>
      </div>
    );
  }

  const isFormG00 = formData.kode.trim().toUpperCase() === "G00";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Gejala</h1>
          <p className="text-gray-500">
            Manajemen gejala dengan Certainty Factor (CF) dari Pakar
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleAdd}
              className="bg-pink-600 hover:bg-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Gejala
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingGejala ? "Edit Gejala" : "Tambah Gejala Baru"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kode">Kode Gejala</Label>
                  <Input
                    id="kode"
                    value={formData.kode}
                    onChange={(e) =>
                      setFormData({ ...formData, kode: e.target.value })
                    }
                    placeholder="G01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cf_pakar" className="flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    CF Pakar
                  </Label>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <Input
                        id="cf_pakar"
                        type="number"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isFormG00 ? 0 : formData.cf_pakar}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cf_pakar: parseFloat(e.target.value) || 0,
                          })
                        }
                        disabled={isFormG00}
                        className={isFormG00 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
                        required={!isFormG00}
                      />
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {isFormG00 ? "N/A (0%)" : `${Math.round(formData.cf_pakar * 100)}%`}
                      </span>
                    </div>
                    {isFormG00 && (
                      <p className="text-[11px] text-pink-600 italic">
                        * Kode G00 khusus pemisah alur Hama & Penyakit (Tanpa CF Pakar / 0.0)
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Gejala</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  placeholder="Nama gejala"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi (Opsional)</Label>
                <Textarea
                  id="deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
                  }
                  placeholder="Deskripsi gejala..."
                  rows={3}
                />
              </div>

              {/* Info CF */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm">
                  Tentang CF Pakar:
                </h4>
                <p className="text-sm text-blue-700">
                  CF Pakar adalah tingkat kepastian pakar bahwa gejala ini
                  terkait dengan penyakit/hama buah naga. Nilai 0.1 - 1.0. (Khusus G00 bernilai N/A / 0.0 karena hanya pemisah alur).
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-pink-600 hover:bg-pink-700"
                  disabled={saving}
                >
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingGejala ? "Simpan Perubahan" : "Tambah Gejala"}
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
              placeholder="Cari gejala..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          {selectedIds.length > 0 ? (
            <Button
              variant="destructive"
              onClick={() => setDeleteBulkConfirm(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus {selectedIds.length} Terpilih
            </Button>
          ) : (
            <span className="text-sm text-gray-500">
              Pilih gejala untuk hapus massal
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {selectedIds.length} terpilih
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">
                  <input
                    type="checkbox"
                    checked={
                      paginatedGejala.length > 0 &&
                      paginatedGejala.every((g) => selectedIds.includes(g.id))
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-pink-600 rounded border-gray-300"
                  />
                </TableHead>
                <TableHead className="w-20">Kode</TableHead>
                <TableHead>Nama Gejala</TableHead>
                <TableHead className="hidden md:table-cell">
                  Deskripsi
                </TableHead>
                <TableHead className="w-28 text-center">CF Pakar</TableHead>
                <TableHead className="w-32 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedGejala.length > 0 ? (
                paginatedGejala.map((gejala) => (
                  <TableRow key={gejala.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(gejala.id)}
                        onChange={(e) =>
                          handleSelectRow(gejala.id, e.target.checked)
                        }
                        className="h-4 w-4 text-pink-600 rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{gejala.kode}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-blue-600" />
                        {gejala.nama}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-md">
                      <p className="truncate text-gray-500">
                        {gejala.deskripsi || "-"}
                      </p>
                    </TableCell>
                    <TableCell className="text-center">
                      {gejala.kode.trim().toUpperCase() === "G00" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                          N/A (Pemisah Alur)
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCfColor(gejala.cf_pakar)}`}
                        >
                          {Math.round(gejala.cf_pakar * 100)}%
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(gejala)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTargetId(gejala.id)}
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
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    Tidak ada data gejala
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredGejala.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteTargetId}
        onOpenChange={() => setDeleteTargetId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center">
              Hapus Gejala?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Gejala ini akan dihapus secara permanen dan tidak dapat
              dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3">
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTargetId && handleDelete(deleteTargetId)}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" /> Ya, Hapus
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteBulkConfirm} onOpenChange={setDeleteBulkConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center">
              Hapus {selectedIds.length} Gejala Terpilih?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Gejala yang terpilih akan dihapus secara permanen dan tidak dapat
              dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3">
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" /> Ya, Hapus
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Info */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">
          Tentang Certainty Factor (CF):
        </h4>
        <p className="text-sm text-blue-700">
          CF Pakar adalah tingkat kepastian pakar pertanian terhadap suatu
          gejala. Nilai CF digunakan dalam perhitungan Certainty Factor:{" "}
          <strong>CF = CF(User) × CF(Pakar)</strong>. User menjawab Ya (CF=1)
          atau Tidak (CF=0). Total {gejalaList.length} gejala dalam database
          Supabase.
        </p>
      </div>
    </div>
  );
};
