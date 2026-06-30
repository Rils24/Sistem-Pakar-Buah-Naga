import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  GitBranch,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import {
  fetchPohonKeputusan,
  fetchGejala,
  fetchPenyakit,
  insertPohonNode,
  updatePohonNode,
  deletePohonNode,
} from "@/services/supabaseService";
import { TablePagination } from "@/components/ui/table-pagination";
import { toast } from "sonner";
import type { Gejala, Penyakit } from "@/types";

const ITEMS_PER_PAGE = 10;

interface PohonNode {
  id: string;
  gejala_id: string | null;
  kode_gejala: string | null;
  nama_gejala: string | null;
  deskripsi: string | null;
  ya: string | null;
  tidak: string | null;
  hasil: string | null;
  cf_pakar: number;
}

export const KelolaPohonKeputusan = () => {
  const [nodesList, setNodesList] = useState<PohonNode[]>([]);
  const [gejalaList, setGejalaList] = useState<Gejala[]>([]);
  const [penyakitList, setPenyakitList] = useState<Penyakit[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<PohonNode | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    id: "",
    gejala_id: "",
    kode_gejala: "",
    nama_gejala: "",
    deskripsi: "",
    ya: "",
    tidak: "",
    hasil: "",
    cf_pakar: 0.8,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteBulkConfirm, setDeleteBulkConfirm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pohonData, gejalaData, penyakitData] = await Promise.all([
        fetchPohonKeputusan(),
        fetchGejala(),
        fetchPenyakit(),
      ]);
      setNodesList(pohonData);
      setGejalaList(gejalaData);
      setPenyakitList(penyakitData);
      setSelectedIds([]);
    } catch (err) {
      toast.error("Gagal memuat data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getNodeLabel = (nodeId: string | null): string => {
    if (!nodeId) return "Selesai";
    const targetNode = nodesList.find((n) => n.id === nodeId);
    if (!targetNode) {
      if (nodeId === "hama_not_found") return "Hama Tidak Teridentifikasi";
      if (nodeId === "penyakit_not_found")
        return "Penyakit Tidak Teridentifikasi";
      return `[${nodeId}]`;
    }

    if (targetNode.hasil) {
      const penyakit = penyakitList.find((p) => p.id === targetNode.hasil);
      return penyakit
        ? `Hasil: ${penyakit.nama}`
        : targetNode.hasil === "hama_not_found"
          ? "Hasil: Hama Tidak Teridentifikasi"
          : targetNode.hasil === "penyakit_not_found"
            ? "Hasil: Penyakit Tidak Teridentifikasi"
            : `Hasil: ${targetNode.hasil.toUpperCase()}`;
    }

    if (targetNode.kode_gejala) {
      return `Cek ${targetNode.kode_gejala}: ${targetNode.nama_gejala || ""}`;
    }

    if (targetNode.id === "hama_group") return "Grup Hama";
    if (targetNode.id === "penyakit_group") return "Grup Penyakit";

    if (targetNode.id.endsWith("_check")) {
      const penyakitId = targetNode.id.replace("_check", "");
      const penyakit = penyakitList.find((p) => p.id === penyakitId);
      return penyakit
        ? `Mulai Cek ${penyakit.nama}`
        : `Mulai Cek ${penyakitId.toUpperCase()}`;
    }

    if (targetNode.id.endsWith("_confirmed")) {
      const penyakitId = targetNode.id.replace("_confirmed", "");
      const penyakit = penyakitList.find((p) => p.id === penyakitId);
      return penyakit ? `Hasil Akhir: ${penyakit.nama}` : "Hasil Akhir";
    }

    return targetNode.id;
  };

  const getNodeTypeLabel = (nodeId: string): string => {
    if (nodeId === "root") return "Mulai Diagnosa";
    if (nodeId === "hama_group") return "Grup Hama";
    if (nodeId === "penyakit_group") return "Grup Penyakit";

    if (nodeId.endsWith("_check")) {
      const penyakitId = nodeId.replace("_check", "");
      const penyakit = penyakitList.find((p) => p.id === penyakitId);
      return penyakit
        ? `Cek ${penyakit.nama}`
        : `Cek ${penyakitId.toUpperCase()}`;
    }

    if (nodeId.endsWith("_confirmed")) {
      const penyakitId = nodeId.replace("_confirmed", "");
      const penyakit = penyakitList.find((p) => p.id === penyakitId);
      return penyakit ? `Hasil Akhir: ${penyakit.nama}` : "Hasil Akhir";
    }

    const match = nodeId.match(/^([a-z0-9]+)_(g[0-9]+)(?:_(y|t|tr))?$/);
    if (match) {
      const kodeGejala = match[2].toUpperCase();
      const suffix = match[3];
      if (suffix === "y") return `Langkah ${kodeGejala} (jalur YA)`;
      if (suffix === "t") return `Langkah ${kodeGejala} (jalur TIDAK)`;
      if (suffix === "tr")
        return `Langkah ${kodeGejala} (jalur TIDAK alternatif)`;
      return `Langkah ${kodeGejala}`;
    }

    return `Langkah ${nodeId}`;
  };

  const handleAdd = () => {
    setEditingNode(null);
    setFormData({
      id: "",
      gejala_id: "",
      kode_gejala: "",
      nama_gejala: "",
      deskripsi: "",
      ya: "",
      tidak: "",
      hasil: "",
      cf_pakar: 0.8,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (node: PohonNode) => {
    setEditingNode(node);
    setFormData({
      id: node.id,
      gejala_id: node.gejala_id || "",
      kode_gejala: node.kode_gejala || "",
      nama_gejala: node.nama_gejala || "",
      deskripsi: node.deskripsi || "",
      ya: node.ya || "",
      tidak: node.tidak || "",
      hasil: node.hasil || "",
      cf_pakar: node.cf_pakar,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deletePohonNode(id);
      setNodesList(nodesList.filter((n) => n.id !== id));
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
      toast.success("Node berhasil dihapus");
    } catch (err) {
      toast.error("Gagal menghapus node");
      console.error(err);
    } finally {
      setDeleting(false);
      setDeleteTargetId(null);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [
        ...new Set([...prev, ...paginatedNodes.map((node) => node.id)]),
      ]);
    } else {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedNodes.some((node) => node.id === id)),
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
      await Promise.all(selectedIds.map((id) => deletePohonNode(id)));
      setNodesList((prev) =>
        prev.filter((node) => !selectedIds.includes(node.id)),
      );
      setSelectedIds([]);
      toast.success("Node terpilih berhasil dihapus");
    } catch (err) {
      toast.error("Gagal menghapus node terpilih");
      console.error(err);
    } finally {
      setDeleting(false);
      setDeleteBulkConfirm(false);
    }
  };

  const handleGejalaChange = (gejalaId: string) => {
    if (!gejalaId) {
      setFormData((prev) => ({
        ...prev,
        gejala_id: "",
        kode_gejala: "",
        nama_gejala: "",
      }));
      return;
    }

    const selectedGejala = gejalaList.find((g) => g.id === gejalaId);
    if (selectedGejala) {
      setFormData((prev) => ({
        ...prev,
        gejala_id: selectedGejala.id,
        kode_gejala: selectedGejala.kode,
        nama_gejala: selectedGejala.nama,
        cf_pakar: selectedGejala.cf_pakar,
      }));
    }
  };

  const handleHasilChange = (hasilVal: string) => {
    if (!hasilVal) {
      setFormData((prev) => ({ ...prev, hasil: "" }));
      return;
    }

    const selectedPenyakit = penyakitList.find((p) => p.id === hasilVal);
    setFormData((prev) => ({
      ...prev,
      hasil: hasilVal,
      // Jika terminal node hasil, nama node-nya disesuaikan
      nama_gejala: selectedPenyakit
        ? `Hasil: ${selectedPenyakit.nama} terdeteksi!`
        : hasilVal === "hama_not_found"
          ? "Hama tidak dapat diidentifikasi."
          : hasilVal === "penyakit_not_found"
            ? "Penyakit tidak dapat diidentifikasi."
            : prev.nama_gejala,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.id) {
      toast.error("ID Node harus diisi");
      return;
    }

    setSaving(true);
    const matchedGejala = formData.gejala_id
      ? gejalaList.find((g) => g.id === formData.gejala_id)
      : null;
    const finalCfPakar = matchedGejala
      ? matchedGejala.cf_pakar
      : parseFloat(String(formData.cf_pakar)) || 0;

    const payload = {
      id: formData.id,
      gejala_id: formData.gejala_id || null,
      kode_gejala: formData.kode_gejala || null,
      nama_gejala: formData.nama_gejala || null,
      deskripsi: formData.deskripsi || null,
      ya: formData.ya || null,
      tidak: formData.tidak || null,
      hasil: formData.hasil || null,
      cf_pakar: finalCfPakar,
    };

    try {
      if (editingNode) {
        const updated = await updatePohonNode(editingNode.id, payload);
        setNodesList(
          nodesList.map((n) => (n.id === editingNode.id ? updated : n)),
        );
        toast.success("Node berhasil diperbarui");
      } else {
        // Cek jika ID sudah ada
        if (nodesList.some((n) => n.id === payload.id)) {
          toast.error("ID Node sudah digunakan");
          setSaving(false);
          return;
        }
        const inserted = await insertPohonNode(payload);
        setNodesList([...nodesList, inserted]);
        toast.success("Node berhasil ditambahkan");
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast.error("Gagal menyimpan data");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filteredNodes = nodesList.filter(
    (n) =>
      n.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.kode_gejala &&
        n.kode_gejala.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (n.nama_gejala &&
        n.nama_gejala.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (n.hasil && n.hasil.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredNodes.length / ITEMS_PER_PAGE),
  );
  const paginatedNodes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredNodes.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredNodes, currentPage]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Kelola Pohon Keputusan
          </h1>
          <p className="text-gray-500">
            Atur percabangan Ya/Tidak secara dinamis sesuai struktur pohon pakar
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={handleAdd}
                className="bg-pink-600 hover:bg-pink-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Node
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingNode
                    ? `Edit Node [${editingNode.id}]`
                    : "Tambah Node Baru"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* ID Node */}
                <div className="space-y-1">
                  <Label htmlFor="node_id">
                    ID Node (Unik, misal: h01_g02)
                  </Label>
                  <Input
                    id="node_id"
                    placeholder="Masukkan ID Node unik"
                    value={formData.id}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, id: e.target.value }))
                    }
                    disabled={!!editingNode}
                    required
                  />
                </div>

                {/* Pilih Gejala (jika ada) */}
                <div className="space-y-1">
                  <Label htmlFor="gejala">
                    Hubungkan dengan Gejala (Opsional)
                  </Label>
                  <select
                    id="gejala"
                    value={formData.gejala_id}
                    onChange={(e) => handleGejalaChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                  >
                    <option value="">
                      -- Bukan Node Gejala (Misal: Root / Group Node) --
                    </option>
                    {gejalaList.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.kode} - {g.nama}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nama/Teks Pertanyaan */}
                <div className="space-y-1">
                  <Label htmlFor="nama_gejala">
                    Teks Pertanyaan / Keterangan Node
                  </Label>
                  <Input
                    id="nama_gejala"
                    placeholder="Apakah tanaman mengalami gejala X?"
                    value={formData.nama_gejala}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        nama_gejala: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                {/* Deskripsi */}
                <div className="space-y-1">
                  <Label htmlFor="deskripsi">
                    Deskripsi Singkat (Opsional)
                  </Label>
                  <Input
                    id="deskripsi"
                    placeholder="Keterangan tambahan"
                    value={formData.deskripsi}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deskripsi: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* YA Target */}
                  <div className="space-y-1">
                    <Label htmlFor="ya_target">
                      Jika Jawaban YA (Lanjut ke Langkah)
                    </Label>
                    <select
                      id="ya_target"
                      value={formData.ya}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, ya: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                    >
                      <option value="">-- Selesai / Pindah ke Hasil --</option>
                      {nodesList.map((n) => {
                        const label = getNodeLabel(n.id);
                        const typeLabel = getNodeTypeLabel(n.id);
                        return (
                          <option key={n.id} value={n.id}>
                            [{n.id} - {typeLabel}]{" "}
                            {label.length > 50
                              ? label.slice(0, 50) + "..."
                              : label}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* TIDAK Target */}
                  <div className="space-y-1">
                    <Label htmlFor="tidak_target">
                      Jika Jawaban TIDAK (Lanjut ke Langkah)
                    </Label>
                    <select
                      id="tidak_target"
                      value={formData.tidak}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          tidak: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                    >
                      <option value="">-- Selesai / Pindah ke Hasil --</option>
                      {nodesList.map((n) => {
                        const label = getNodeLabel(n.id);
                        const typeLabel = getNodeTypeLabel(n.id);
                        return (
                          <option key={n.id} value={n.id}>
                            [{n.id} - {typeLabel}]{" "}
                            {label.length > 50
                              ? label.slice(0, 50) + "..."
                              : label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Hasil Terminal */}
                  <div className="space-y-1">
                    <Label htmlFor="hasil">
                      Penyakit/Hama Teridentifikasi (Jika Ujung)
                    </Label>
                    <select
                      id="hasil"
                      value={formData.hasil}
                      onChange={(e) => handleHasilChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                    >
                      <option value="">
                        -- Bukan Ujung Alur (Bukan Terminal Leaf) --
                      </option>
                      <optgroup label="Hama & Penyakit">
                        {penyakitList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.kode} - {p.nama}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Hasil Khusus">
                        <option value="hama_not_found">
                          Hama Tidak Teridentifikasi
                        </option>
                        <option value="penyakit_not_found">
                          Penyakit Tidak Teridentifikasi
                        </option>
                      </optgroup>
                    </select>
                  </div>

                  {/* CF Pakar */}
                  <div className="space-y-1">
                    <Label htmlFor="cf_pakar">
                      Certainty Factor (CF) Pakar (0 - 1.0)
                    </Label>
                    <Input
                      id="cf_pakar"
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={
                        formData.gejala_id
                          ? (gejalaList.find((g) => g.id === formData.gejala_id)
                              ?.cf_pakar ?? formData.cf_pakar)
                          : formData.cf_pakar
                      }
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          cf_pakar: parseFloat(e.target.value) || 0,
                        }))
                      }
                      disabled={!!formData.gejala_id}
                      className={
                        formData.gejala_id
                          ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                          : ""
                      }
                    />
                    {formData.gejala_id && (
                      <p className="text-[11px] text-pink-600 italic mt-0.5">
                        * CF Pakar dikunci & disinkronkan otomatis dari data
                        master gejala.
                      </p>
                    )}
                  </div>
                </div>

                {/* Preview Alur */}
                <div className="bg-pink-50 rounded-xl p-3 border border-pink-100 text-xs text-pink-800 space-y-1">
                  <p>
                    <strong>Alur Singkat:</strong>
                  </p>
                  <p>
                    Node:{" "}
                    <span className="font-semibold">
                      {formData.id || "(Belum diisi)"}
                    </span>{" "}
                    {formData.kode_gejala ? `(${formData.kode_gejala})` : ""} -{" "}
                    <span className="italic text-gray-700">
                      {formData.nama_gejala || "(Tanpa Keterangan)"}
                    </span>
                  </p>
                  <p>
                    ↳ <span className="text-emerald-700 font-bold">YA</span>{" "}
                    &rarr;{" "}
                    {formData.ya ? (
                      <span className="font-semibold text-emerald-800">
                        {formData.ya} ({getNodeLabel(formData.ya)})
                      </span>
                    ) : (
                      <span className="italic text-gray-500">
                        Hasil:{" "}
                        {formData.hasil ? getNodeLabel(formData.id) : "Selesai"}
                      </span>
                    )}
                  </p>
                  <p>
                    ↳ <span className="text-red-700 font-bold">TIDAK</span>{" "}
                    &rarr;{" "}
                    {formData.tidak ? (
                      <span className="font-semibold text-red-800">
                        {formData.tidak} ({getNodeLabel(formData.tidak)})
                      </span>
                    ) : (
                      <span className="italic text-gray-500">
                        Hasil:{" "}
                        {formData.hasil ? getNodeLabel(formData.id) : "Selesai"}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
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
                    {saving && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Simpan Node
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari berdasarkan Node ID, kode/nama gejala, atau kesimpulan..."
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
              Pilih node untuk hapus massal
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {selectedIds.length} terpilih
        </div>
      </div>

      {/* Table List */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[48px] text-center">
                  <Checkbox
                    checked={
                      paginatedNodes.length > 0 &&
                      paginatedNodes.every((node) =>
                        selectedIds.includes(node.id),
                      )
                        ? true
                        : selectedIds.some((id) =>
                              paginatedNodes.some((node) => node.id === id),
                            )
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={(checked) =>
                      handleSelectAll(checked === true)
                    }
                  />
                </TableHead>
                <TableHead className="w-[180px]">ID Langkah (Alur)</TableHead>
                <TableHead className="w-[100px]">Kode Gejala</TableHead>
                <TableHead>Pertanyaan / Deskripsi Node</TableHead>
                <TableHead className="w-[150px]">Jika Jawaban YA</TableHead>
                <TableHead className="w-[150px]">Jika Jawaban TIDAK</TableHead>
                <TableHead className="w-[180px]">
                  Hasil Akhir Diagnosa
                </TableHead>
                <TableHead className="w-[80px] text-center">Bobot CF</TableHead>
                <TableHead className="w-[100px] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-20 text-gray-500"
                  >
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-pink-600 mb-2" />
                    Memuat data pohon keputusan...
                  </TableCell>
                </TableRow>
              ) : filteredNodes.length > 0 ? (
                paginatedNodes.map((node) => (
                  <TableRow key={node.id} className="hover:bg-gray-50/50">
                    <TableCell className="text-center">
                      <Checkbox
                        checked={selectedIds.includes(node.id)}
                        onCheckedChange={(checked) =>
                          handleSelectRow(node.id, checked === true)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm font-semibold text-gray-800">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-bold">
                          {node.id}
                        </span>
                        <span className="text-[10px] text-gray-500 font-normal mt-0.5 leading-none">
                          {getNodeTypeLabel(node.id)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const matched = node.gejala_id
                          ? gejalaList.find((g) => g.id === node.gejala_id)
                          : null;
                        const kode = matched ? matched.kode : node.kode_gejala;
                        return kode ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-pink-100 text-pink-800">
                            {kode}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs italic">
                            Sistem
                          </span>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {(() => {
                            const matched = node.gejala_id
                              ? gejalaList.find((g) => g.id === node.gejala_id)
                              : null;
                            return matched ? matched.nama : node.nama_gejala;
                          })()}
                        </p>
                        {node.deskripsi && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                            {node.deskripsi}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {node.ya ? (
                        <div
                          className="flex flex-col"
                          title={getNodeLabel(node.ya)}
                        >
                          <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 w-max mb-0.5">
                            {node.ya}
                          </span>
                          <span className="text-xs text-gray-500 max-w-[140px] truncate block">
                            {getNodeLabel(node.ya)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic">
                          Selesai
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {node.tidak ? (
                        <div
                          className="flex flex-col"
                          title={getNodeLabel(node.tidak)}
                        >
                          <span className="text-[10px] font-mono font-semibold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 w-max mb-0.5">
                            {node.tidak}
                          </span>
                          <span className="text-xs text-gray-500 max-w-[140px] truncate block">
                            {getNodeLabel(node.tidak)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic">
                          Selesai
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {node.hasil ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 w-max mb-0.5">
                            🏆 {node.hasil.toUpperCase()}
                          </span>
                          <span
                            className="text-xs text-gray-500 max-w-[150px] truncate block"
                            title={node.hasil}
                          >
                            {(() => {
                              const p = penyakitList.find(
                                (x) => x.id === node.hasil,
                              );
                              return p
                                ? p.nama
                                : node.hasil === "hama_not_found"
                                  ? "Hama Tidak Teridentifikasi"
                                  : node.hasil === "penyakit_not_found"
                                    ? "Penyakit Tidak Teridentifikasi"
                                    : node.hasil;
                            })()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm">
                      {(() => {
                        const matched = node.gejala_id
                          ? gejalaList.find((g) => g.id === node.gejala_id)
                          : null;
                        return matched ? matched.cf_pakar : node.cf_pakar;
                      })()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(node)}
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTargetId(node.id)}
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
                    colSpan={9}
                    className="text-center py-8 text-gray-500"
                  >
                    Tidak ada data node
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredNodes.length}
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
              Hapus Node?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Node ini akan dihapus secara permanen dan tidak dapat
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
              Hapus {selectedIds.length} Node Terpilih?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Node yang dipilih akan dihapus secara permanen dan tidak dapat
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

      {/* Info Help */}
      <div className="bg-pink-50 rounded-xl p-4 border border-pink-100 flex gap-3">
        <GitBranch className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-pink-900">
          <h4 className="font-semibold mb-1">Panduan Pengelolaan Pohon:</h4>
          <ul className="list-disc pl-4 space-y-1 text-xs leading-relaxed text-pink-800">
            <li>
              <strong>Root Node</strong> adalah node awal dengan ID `root` yang
              menanyakan gejala pembeda umum `G00`.
            </li>
            <li>
              Untuk membuat <strong>Node Pertanyaan</strong>, pilih Gejala dan
              arahkan target YA / TIDAK ke Node ID selanjutnya.
            </li>
            <li>
              Untuk membuat <strong>Node Kesimpulan (Ujung Alur)</strong>,
              kosongkan target YA / TIDAK, lalu pilih Hama/Penyakit
              Teridentifikasi di dropdown kesimpulan.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
