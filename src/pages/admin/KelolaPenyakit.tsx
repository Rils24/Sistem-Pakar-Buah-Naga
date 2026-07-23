import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Sprout,
  Loader2,
  ImagePlus,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import {
  fetchPenyakit,
  insertPenyakit,
  updatePenyakit,
  deletePenyakit,
  uploadMultiplePenyakitImages,
  deleteMultiplePenyakitImages,
} from "@/services/supabaseService";
import { TablePagination } from "@/components/ui/table-pagination";
import { toast } from "sonner";
import type { Penyakit } from "@/types";

const ITEMS_PER_PAGE = 10;

export const KelolaPenyakit = () => {
  const [penyakitList, setPenyakitList] = useState<Penyakit[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPenyakit, setEditingPenyakit] = useState<Penyakit | null>(null);
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
    solusi: "",
    tipe: "penyakit" as "hama" | "penyakit",
  });

  // Multi-image state
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [existingUrls, setExistingUrls] = useState<string[]>([]);
  const [removedUrls, setRemovedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview modal
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setPenyakitList(await fetchPenyakit());
    } catch {
      toast.error("Gagal memuat data penyakit");
    } finally {
      setLoading(false);
    }
  };

  const filteredPenyakit = penyakitList.filter(
    (p) =>
      p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.kode.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPenyakit.length / ITEMS_PER_PAGE),
  );
  const paginatedPenyakit = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPenyakit.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPenyakit, currentPage]);

  const resetImageState = () => {
    setNewFiles([]);
    setNewPreviews([]);
    setExistingUrls([]);
    setRemovedUrls([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAdd = () => {
    setEditingPenyakit(null);
    setFormData({
      kode: "",
      nama: "",
      deskripsi: "",
      solusi: "",
      tipe: "penyakit",
    });
    resetImageState();
    setIsDialogOpen(true);
  };

  const handleEdit = (p: Penyakit) => {
    setEditingPenyakit(p);
    setFormData({
      kode: p.kode,
      nama: p.nama,
      deskripsi: p.deskripsi,
      solusi: p.solusi.join("\n"),
      tipe: p.tipe,
    });
    resetImageState();
    setExistingUrls(p.image_urls || []);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const p = penyakitList.find((x) => x.id === id);
      if (p?.image_urls?.length)
        await deleteMultiplePenyakitImages(p.image_urls);
      await deletePenyakit(id);
      setPenyakitList(penyakitList.filter((x) => x.id !== id));
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
      toast.success("Penyakit berhasil dihapus");
    } catch (err) {
      toast.error("Gagal menghapus penyakit");
      console.error(err);
    } finally {
      setDeleting(false);
      setDeleteTargetId(null);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [
        ...new Set([...prev, ...paginatedPenyakit.map((p) => p.id)]),
      ]);
    } else {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedPenyakit.some((p) => p.id === id)),
      );
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id),
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setDeleting(true);
    try {
      await Promise.all(
        selectedIds.map(async (id) => {
          const p = penyakitList.find((x) => x.id === id);
          if (p?.image_urls?.length)
            await deleteMultiplePenyakitImages(p.image_urls);
          await deletePenyakit(id);
        }),
      );
      setPenyakitList((prev) =>
        prev.filter((p) => !selectedIds.includes(p.id)),
      );
      setSelectedIds([]);
      toast.success("Penyakit terpilih berhasil dihapus");
    } catch (err) {
      toast.error("Gagal menghapus penyakit terpilih");
      console.error(err);
    } finally {
      setDeleting(false);
      setDeleteBulkConfirm(false);
    }
  };

  // File handling
  const addFiles = (files: FileList | File[]) => {
    const validFiles: File[] = [];
    const previews: string[] = [];
    const totalCount = existingUrls.length + newFiles.length;

    Array.from(files).forEach((f) => {
      if (!f.type.startsWith("image/")) {
        toast.error(`${f.name} bukan gambar`);
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} melebihi 5MB`);
        return;
      }
      if (totalCount + validFiles.length >= 10) {
        toast.error("Maksimal 10 gambar");
        return;
      }
      validFiles.push(f);
    });

    validFiles.forEach((f) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === validFiles.length) {
          setNewFiles((prev) => [...prev, ...validFiles]);
          setNewPreviews((prev) => [...prev, ...previews]);
        }
      };
      reader.readAsDataURL(f);
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const removeExisting = (url: string) => {
    setExistingUrls((prev) => prev.filter((u) => u !== url));
    setRemovedUrls((prev) => [...prev, url]);
  };

  const removeNew = (idx: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const openPreview = (images: string[], startIdx: number) => {
    setPreviewImages(images);
    setPreviewIndex(startIdx);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const solusiArray = formData.solusi.split("\n").filter((s) => s.trim());

    try {
      // Delete removed images from storage
      if (removedUrls.length) await deleteMultiplePenyakitImages(removedUrls);

      // Upload new images
      let uploadedUrls: string[] = [];
      if (newFiles.length) {
        setUploading(true);
        uploadedUrls = await uploadMultiplePenyakitImages(newFiles);
        setUploading(false);
      }

      const finalUrls = [...existingUrls, ...uploadedUrls];

      if (editingPenyakit) {
        const updated = await updatePenyakit(editingPenyakit.id, {
          kode: formData.kode,
          nama: formData.nama,
          deskripsi: formData.deskripsi,
          solusi: solusiArray,
          tipe: formData.tipe,
          image_urls: finalUrls,
        });
        setPenyakitList(
          penyakitList.map((p) => (p.id === editingPenyakit.id ? updated : p)),
        );
        toast.success("Penyakit berhasil diperbarui");
      } else {
        const newP: Penyakit = {
          id: `${formData.tipe === "hama" ? "h" : "p"}${Date.now()}`,
          kode: formData.kode,
          nama: formData.nama,
          deskripsi: formData.deskripsi,
          solusi: solusiArray,
          tipe: formData.tipe,
          image_urls: finalUrls.length ? finalUrls : undefined,
        };
        const inserted = await insertPenyakit(newP);
        setPenyakitList([...penyakitList, inserted]);
        toast.success("Penyakit berhasil ditambahkan");
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast.error("Gagal menyimpan penyakit");
      console.error(err);
    } finally {
      setSaving(false);
      setUploading(false);
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

  const allFormImages = [...existingUrls, ...newPreviews];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Hama & Penyakit</h1>
          <p className="text-gray-500">Manajemen data hama & penyakit buah naga</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleAdd}
              className="bg-pink-600 hover:bg-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" /> Tambah Penyakit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPenyakit ? "Edit Penyakit" : "Tambah Penyakit Baru"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kode">Kode Penyakit</Label>
                  <Input
                    id="kode"
                    value={formData.kode}
                    onChange={(e) =>
                      setFormData({ ...formData, kode: e.target.value })
                    }
                    placeholder="P01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipe">Tipe</Label>
                  <select
                    id="tipe"
                    value={formData.tipe}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipe: e.target.value as "hama" | "penyakit",
                      })
                    }
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
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  placeholder="Nama penyakit"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <Textarea
                  id="deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, solusi: e.target.value })
                  }
                  placeholder={"1. Solusi pertama\n2. Solusi kedua"}
                  rows={5}
                  required
                />
              </div>

              {/* Multi Image Upload */}
              <div className="space-y-2">
                <Label>
                  Gambar Penyakit{" "}
                  <span className="text-xs text-gray-400 font-normal">
                    ({allFormImages.length}/10)
                  </span>
                </Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                />

                {/* Image Grid */}
                {allFormImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
                    {existingUrls.map((url, i) => (
                      <div
                        key={`ex-${i}`}
                        className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50"
                      >
                        <img
                          src={url}
                          alt={`Gambar ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => openPreview(allFormImages, i)}
                            className="p-1.5 bg-white rounded-full text-gray-700 hover:bg-gray-100 shadow-lg"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeExisting(url)}
                            className="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 shadow-lg"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="absolute bottom-1 left-1 text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full">
                          Tersimpan
                        </span>
                      </div>
                    ))}
                    {newPreviews.map((preview, i) => (
                      <div
                        key={`new-${i}`}
                        className="relative group aspect-square rounded-lg overflow-hidden border-2 border-pink-300 bg-gray-50"
                      >
                        <img
                          src={preview}
                          alt={`Baru ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              openPreview(
                                allFormImages,
                                existingUrls.length + i,
                              )
                            }
                            className="p-1.5 bg-white rounded-full text-gray-700 hover:bg-gray-100 shadow-lg"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeNew(i)}
                            className="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 shadow-lg"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="absolute bottom-1 left-1 text-[10px] bg-pink-500 text-white px-1.5 py-0.5 rounded-full">
                          Baru
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Dropzone */}
                {allFormImages.length < 10 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200
                      ${isDragging ? "border-pink-500 bg-pink-50 scale-[1.02]" : "border-gray-300 hover:border-pink-400 hover:bg-pink-50/50"}`}
                  >
                    <ImagePlus
                      className={`w-8 h-8 mx-auto mb-2 ${isDragging ? "text-pink-500" : "text-gray-400"}`}
                    />
                    <p className="text-sm font-medium text-gray-600">
                      {isDragging
                        ? "Lepaskan gambar..."
                        : "Klik atau seret gambar ke sini"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPG, PNG, WEBP • Maks 5MB/file • Bisa pilih banyak
                      sekaligus
                    </p>
                  </div>
                )}
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
                  disabled={saving || uploading}
                >
                  {(saving || uploading) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {uploading
                    ? "Mengupload gambar..."
                    : editingPenyakit
                      ? "Simpan Perubahan"
                      : "Tambah Penyakit"}
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
              Pilih penyakit untuk hapus massal
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
                      paginatedPenyakit.length > 0 &&
                      paginatedPenyakit.every((p) => selectedIds.includes(p.id))
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-pink-600 rounded border-gray-300"
                  />
                </TableHead>
                <TableHead className="w-20">Kode</TableHead>
                <TableHead className="w-20">Tipe</TableHead>
                <TableHead className="w-28">Gambar</TableHead>
                <TableHead>Nama Penyakit</TableHead>
                <TableHead className="hidden md:table-cell">
                  Deskripsi
                </TableHead>
                <TableHead className="w-32 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPenyakit.length > 0 ? (
                paginatedPenyakit.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={(e) =>
                          handleSelectRow(p.id, e.target.checked)
                        }
                        className="h-4 w-4 text-pink-600 rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{p.kode}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.tipe === "hama" ? "bg-orange-100 text-orange-800" : "bg-red-100 text-red-800"}`}
                      >
                        {p.tipe === "hama" ? "Hama" : "Penyakit"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {p.image_urls?.length ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openPreview(p.image_urls!, 0)}
                            className="relative group rounded-md overflow-hidden w-10 h-10 border border-gray-200 hover:border-pink-400 transition-colors flex-shrink-0"
                          >
                            <img
                              src={p.image_urls[0]}
                              alt={p.nama}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye className="w-3 h-3 text-white" />
                            </div>
                          </button>
                          {p.image_urls.length > 1 && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                              +{p.image_urls.length - 1}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-md border border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                          <ImagePlus className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Sprout className="w-4 h-4 text-pink-600" />
                        {p.nama}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-md">
                      <p className="truncate">{p.deskripsi}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(p)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTargetId(p.id)}
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
                    colSpan={7}
                    className="text-center py-8 text-gray-500"
                  >
                    Tidak ada data penyakit
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredPenyakit.length}
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
              Hapus Penyakit?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Penyakit ini akan dihapus secara permanen dari sistem.
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
              Hapus {selectedIds.length} Penyakit Terpilih?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Penyakit yang dipilih akan dihapus secara permanen.
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

      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>Info:</strong> Total {penyakitList.length} penyakit.
          Ditampilkan: {filteredPenyakit.length}
        </p>
      </div>

      {/* Image Preview Modal */}
      {previewImages.length > 0 && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImages([])}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImages([])}
              className="absolute -top-3 -right-3 z-10 p-2 bg-white rounded-full shadow-lg text-gray-600 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImages[previewIndex]}
              alt="Preview"
              className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl"
            />
            {previewImages.length > 1 && (
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={() =>
                    setPreviewIndex((i) =>
                      i > 0 ? i - 1 : previewImages.length - 1,
                    )
                  }
                  className="p-2 bg-white/90 rounded-full hover:bg-white shadow-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-white text-sm font-medium">
                  {previewIndex + 1} / {previewImages.length}
                </span>
                <button
                  onClick={() =>
                    setPreviewIndex((i) =>
                      i < previewImages.length - 1 ? i + 1 : 0,
                    )
                  }
                  className="p-2 bg-white/90 rounded-full hover:bg-white shadow-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
