import { useState, useEffect, useMemo, useCallback } from "react";
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
  Loader2,
  RefreshCw,
  AlertTriangle,
  Eye,
  X,
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
import { PohonKeputusanPreview } from "./PohonKeputusanPreview";

const ITEMS_PER_PAGE = 10;

export interface PohonNode {
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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [parentBranchContext, setParentBranchContext] = useState<{
    parentId: string;
    branchType: "ya" | "tidak";
  } | null>(null);

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

  /**
   * Helper pembuat ID node otomatis & unik (bebas bentrok).
   * Menghasilkan ID terstruktur seperti `node_g01`, `h01_g02_y`, atau `h01_confirmed`.
   * Jika ID sudah terpakai, otomatis menambahkan suffix angka increment (e.g. `_1`, `_2`).
   */
  const generateSmartId = useCallback(
    (gejalaId?: string, hasilVal?: string, customPrefix?: string) => {
      let basePrefix = "node";

      if (hasilVal) {
        const pMatch = penyakitList.find((p) => p.id === hasilVal);
        basePrefix = pMatch ? `${pMatch.id}_confirmed` : `${hasilVal}_confirmed`;
      } else if (gejalaId) {
        const gMatch = gejalaList.find((g) => g.id === gejalaId);
        if (gMatch) {
          basePrefix = `node_${gMatch.kode.toLowerCase()}`;
        }
      } else if (customPrefix) {
        basePrefix = customPrefix;
      }

      if (editingNode && editingNode.id.startsWith(basePrefix)) {
        return editingNode.id;
      }

      let candidate = basePrefix;
      let counter = 1;
      const existingIds = new Set(nodesList.map((n) => n.id));

      while (existingIds.has(candidate)) {
        candidate = `${basePrefix}_${counter}`;
        counter++;
      }

      return candidate;
    },
    [editingNode, gejalaList, penyakitList, nodesList]
  );

  /**
   * Mengatur konteks untuk menambahkan node/cabang baru langsung dari visual preview pohon.
   * Mengisi ID yang disarankan secara otomatis berdasarkan ID parent dan tipe cabang (YA/TIDAK),
   * lalu membuka dialog form penambahan node.
   */
  const handleAddBranchFromPreview = (parentId: string, branchType: "ya" | "tidak") => {
    const parentNode = nodesList.find((n) => n.id === parentId);
    const parentPrefix = parentNode ? parentNode.id : "node";
    const branchSuffix = branchType === "ya" ? "y" : "t";

    const suggestedId = generateSmartId(
      undefined,
      undefined,
      `${parentPrefix}_${branchSuffix}`
    );

    setParentBranchContext({ parentId, branchType });
    setEditingNode(null);
    setFormData({
      id: suggestedId,
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

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Mengambil (fetch) seluruh data pohon keputusan, data gejala, dan data penyakit
   * secara bersamaan dari database Supabase, lalu memperbarui state komponen.
   */
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

  /**
   * Menghasilkan label teks deskriptif untuk suatu node berdasarkan ID node.
   * Menampilkan kode gejala, nama penyakit/hama hasil akhir, atau penanda khusus alur.
   */
  const getNodeLabel = (nodeId: string | null): string => {
    if (!nodeId) return "Selesai / Tanpa Target";
    const targetNode = nodesList.find((n) => n.id === nodeId);
    if (!targetNode) {
      if (nodeId === "hama_not_found") return "Hasil: Hama Tidak Teridentifikasi";
      if (nodeId === "penyakit_not_found")
        return "Hasil: Penyakit Tidak Teridentifikasi";
      return `[${nodeId}]`;
    }

    if (targetNode.hasil) {
      const penyakit = penyakitList.find((p) => p.id === targetNode.hasil);
      return penyakit
        ? `🏆 ${penyakit.kode} - ${penyakit.nama}`
        : `🏆 ${targetNode.hasil}`;
    }

    if (targetNode.kode_gejala) {
      return `${targetNode.kode_gejala}: ${targetNode.nama_gejala || ""}`;
    }

    if (targetNode.id === "root") return "🚩 Awal Diagnosa (G00)";
    if (targetNode.id === "hama_group") return "🐛 Kelompok Hama";
    if (targetNode.id === "penyakit_group") return "🦠 Kelompok Penyakit";

    return targetNode.nama_gejala || targetNode.id;
  };

  /**
   * Menentukan jenis/tipe node berdasarkan pola ID (seperti root, check, confirmed, cabang YA/TIDAK)
   * untuk ditampilkan sebagai badge atau label pengenal di tabel alur.
   */
  const getNodeTypeLabel = (nodeId: string): string => {
    if (nodeId === "root") return "🚩 Awal Diagnosa";
    if (nodeId === "hama_group") return "🐛 Kelompok Hama";
    if (nodeId === "penyakit_group") return "🦠 Kelompok Penyakit";

    if (nodeId.endsWith("_check")) {
      const penyakitId = nodeId.replace("_check", "");
      const penyakit = penyakitList.find((p) => p.id === penyakitId);
      return penyakit ? `🔍 Cek: ${penyakit.nama}` : `🔍 Cek: ${penyakitId.toUpperCase()}`;
    }

    if (nodeId.endsWith("_confirmed")) {
      const penyakitId = nodeId.replace("_confirmed", "");
      const penyakit = penyakitList.find((p) => p.id === penyakitId);
      return penyakit ? `🏆 Hasil: ${penyakit.nama}` : "🏆 Hasil";
    }

    const targetNode = nodesList.find((n) => n.id === nodeId);
    if (targetNode?.hasil) {
      const penyakit = penyakitList.find((p) => p.id === targetNode.hasil);
      return penyakit ? `🏆 Hasil: ${penyakit.nama}` : `🏆 Hasil: ${targetNode.hasil}`;
    }

    const match = nodeId.match(/^([a-z0-9]+)_(g[0-9]+)(?:_(y|t|tr))?$/);
    if (match) {
      const kodeGejala = match[2].toUpperCase();
      const suffix = match[3];
      if (suffix === "y") return `Pertanyaan ${kodeGejala} (YA)`;
      if (suffix === "t") return `Pertanyaan ${kodeGejala} (TIDAK)`;
      if (suffix === "tr") return `Pertanyaan ${kodeGejala} (TIDAK Alt)`;
      return `Pertanyaan ${kodeGejala}`;
    }

    return `Langkah (${nodeId})`;
  };

  /**
   * Menformat opsi tampilan node pada dropdown select (pilihan target YA/TIDAK),
   * melengkapi dengan ikon status, kode gejala, dan tag cabang (YA / TIDAK / TIDAK Alt).
   */
  const getNodeOptionLabel = (n: PohonNode): string => {
    if (n.id === "root") return "🚩 [root] Awal Diagnosa (G00)";
    if (n.id === "hama_group") return "🐛 [hama_group] Kelompok Hama";
    if (n.id === "penyakit_group") return "🦠 [penyakit_group] Kelompok Penyakit";

    if (n.id.endsWith("_check")) {
      const penyakitId = n.id.replace("_check", "");
      const penyakit = penyakitList.find((p) => p.id === penyakitId);
      return `🔍 [${n.id}] Mulai Cek ${penyakit ? penyakit.nama : penyakitId.toUpperCase()}`;
    }

    if (n.hasil) {
      const penyakit = penyakitList.find((p) => p.id === n.hasil);
      const namaHasil = penyakit
        ? `${penyakit.kode} - ${penyakit.nama}`
        : n.hasil === "hama_not_found"
          ? "Hama Tidak Teridentifikasi"
          : n.hasil === "penyakit_not_found"
            ? "Penyakit Tidak Teridentifikasi"
            : n.hasil.toUpperCase();
      return `🏆 [${n.id}] HASIL AKHIR: ${namaHasil}`;
    }

    // Tentukan suffix jalur (YA / TIDAK / TIDAK Alt) secara jelas dalam Bahasa Indonesia
    let tagJalur = "";
    if (n.id.endsWith("_y")) tagJalur = " (Cabang YA)";
    else if (n.id.endsWith("_tr")) tagJalur = " (Cabang TIDAK Alt 2)";
    else if (n.id.endsWith("_t")) tagJalur = " (Cabang TIDAK)";

    if (n.kode_gejala) {
      const textGejala = n.nama_gejala || "";
      const truncated = textGejala.length > 40 ? textGejala.slice(0, 40) + "..." : textGejala;
      return `[${n.id}] ${n.kode_gejala}${tagJalur}: ${truncated}`;
    }

    return `[${n.id}] ${n.nama_gejala || n.id}${tagJalur}`;
  };

  /**
   * Membaca daftar node dan mengelompokkannya ke dalam opsi dropdown berkategori (<optgroup>):
   * - Gerbang Utama & Group (Root)
   * - Alur Pertanyaan Hama (H01 - H07)
   * - Alur Pertanyaan Penyakit (P01 - P06)
   * - Langkah Pertanyaan Lainnya
   * - Hasil Akhir Diagnosa (Terminal Node)
   */
  const renderCategorizedOptions = useCallback(() => {
    const rootGroupNodes = nodesList.filter(
      (n) => n.id === "root" || n.id === "hama_group" || n.id === "penyakit_group"
    );
    const hamaNodes = nodesList.filter(
      (n) => n.id.startsWith("h") && !n.hasil && n.id !== "hama_group"
    );
    const penyakitNodes = nodesList.filter(
      (n) => n.id.startsWith("p") && !n.hasil && n.id !== "penyakit_group"
    );
    const terminalNodes = nodesList.filter((n) => !!n.hasil);
    const otherNodes = nodesList.filter(
      (n) =>
        !rootGroupNodes.some((r) => r.id === n.id) &&
        !hamaNodes.some((h) => h.id === n.id) &&
        !penyakitNodes.some((p) => p.id === n.id) &&
        !terminalNodes.some((t) => t.id === n.id)
    );

    return (
      <>
        <option value="">-- Selesai / Pindah ke Hasil Akhir --</option>
        {rootGroupNodes.length > 0 && (
          <optgroup label="🚩 Gerbang Utama & Group">
            {rootGroupNodes.map((n) => (
              <option key={n.id} value={n.id}>
                {getNodeOptionLabel(n)}
              </option>
            ))}
          </optgroup>
        )}
        {hamaNodes.length > 0 && (
          <optgroup label="🐛 Alur Pertanyaan Hama (H01 - H07)">
            {hamaNodes.map((n) => (
              <option key={n.id} value={n.id}>
                {getNodeOptionLabel(n)}
              </option>
            ))}
          </optgroup>
        )}
        {penyakitNodes.length > 0 && (
          <optgroup label="🦠 Alur Pertanyaan Penyakit (P01 - P06)">
            {penyakitNodes.map((n) => (
              <option key={n.id} value={n.id}>
                {getNodeOptionLabel(n)}
              </option>
            ))}
          </optgroup>
        )}
        {otherNodes.length > 0 && (
          <optgroup label="❓ Langkah Pertanyaan Lainnya">
            {otherNodes.map((n) => (
              <option key={n.id} value={n.id}>
                {getNodeOptionLabel(n)}
              </option>
            ))}
          </optgroup>
        )}
        {terminalNodes.length > 0 && (
          <optgroup label="🏆 Hasil Akhir Diagnosa (Terminal Node)">
            {terminalNodes.map((n) => (
              <option key={n.id} value={n.id}>
                {getNodeOptionLabel(n)}
              </option>
            ))}
          </optgroup>
        )}
      </>
    );
  }, [nodesList, penyakitList]);

  /**
   * Membuka modal dialog penambahan node baru dengan mengosongkan/mereset form state.
   */
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

  /**
   * Membuka modal dialog edit dengan mengisi form state sesuai data node yang dipilih.
   */
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

  /**
   * Menghapus satu node pohon keputusan dari database Supabase berdasarkan ID-nya,
   * kemudian memperbarui daftar node di state lokal.
   */
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

  /**
   * Menangani toggle checkbox "Pilih Semua" untuk memilih/membatalkan pilihan
   * seluruh node yang sedang tampil pada halaman tabel aktif.
   */
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

  /**
   * Menangani toggle seleksi checkbox pada baris tabel tertentu untuk aksi hapus massal.
   */
  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id),
    );
  };

  /**
   * Menghapus beberapa node yang dipilih secara bersamaan (bulk deletion)
   * dari database Supabase menggunakan Promise.all.
   */
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

  /**
   * Menangani perubahan pilihan dropdown gejala pada form dialog.
   * Mengisi otomatis kode gejala, nama gejala, nilai CF pakar dari master gejala,
   * dan membuat Smart ID baru secara otomatis (jika menambah node baru).
   */
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
      setFormData((prev) => {
        const autoId = !editingNode ? generateSmartId(selectedGejala.id, undefined) : prev.id;
        return {
          ...prev,
          id: autoId,
          gejala_id: selectedGejala.id,
          kode_gejala: selectedGejala.kode,
          nama_gejala: selectedGejala.nama,
          cf_pakar: selectedGejala.cf_pakar,
        };
      });
    }
  };

  /**
   * Menangani perubahan pilihan dropdown hasil akhir (penyakit/hama) pada form dialog.
   * Otomatis membuat ID terminal (e.g. `p01_confirmed`) dan mengisi keterangan hasil akhir.
   */
  const handleHasilChange = (hasilVal: string) => {
    if (!hasilVal) {
      setFormData((prev) => ({ ...prev, hasil: "" }));
      return;
    }

    const selectedPenyakit = penyakitList.find((p) => p.id === hasilVal);
    setFormData((prev) => {
      const autoId = !editingNode ? generateSmartId(undefined, hasilVal) : prev.id;
      return {
        ...prev,
        id: autoId,
        hasil: hasilVal,
        nama_gejala: selectedPenyakit
          ? `Hasil: ${selectedPenyakit.nama} terdeteksi!`
          : hasilVal === "hama_not_found"
            ? "Hama tidak dapat diidentifikasi."
            : hasilVal === "penyakit_not_found"
              ? "Penyakit tidak dapat diidentifikasi."
              : prev.nama_gejala,
      };
    });
  };

  /**
   * Menangani proses simpan form (tambah atau edit node pohon keputusan).
   * - Memeriksa dan menyelesaikan konflik ID otomatis.
   * - Memperbarui referensi target YA/TIDAK pada node induk jika ID node diubah.
   * - Otomatis menghubungkan node baru ke parent node jika dibuat dari konteks visual preview.
   * - Menyimpan payload data ke Supabase (insert/update).
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let targetId = formData.id.trim();
    if (!targetId) {
      targetId = generateSmartId(formData.gejala_id, formData.hasil);
    }

    // Resolusi Konflik ID Otomatis
    if (!editingNode && nodesList.some((n) => n.id === targetId)) {
      let counter = 1;
      let resolved = `${targetId}_${counter}`;
      while (nodesList.some((n) => n.id === resolved)) {
        counter++;
        resolved = `${targetId}_${counter}`;
      }
      toast.info(`ID disesuaikan otomatis menjadi [${resolved}] agar tidak bentrok.`);
      targetId = resolved;
    }

    setSaving(true);
    const matchedGejala = formData.gejala_id
      ? gejalaList.find((g) => g.id === formData.gejala_id)
      : null;
    const finalCfPakar = matchedGejala
      ? matchedGejala.cf_pakar
      : parseFloat(String(formData.cf_pakar)) || 0;

    const payload = {
      id: targetId,
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
        if (editingNode.id !== payload.id) {
          if (nodesList.some((n) => n.id === payload.id)) {
            toast.error("ID Langkah baru sudah digunakan oleh langkah lain");
            setSaving(false);
            return;
          }
          // Otomatis perbarui referensi YA / TIDAK pada node lain yang mengarah ke ID lama
          const referencingNodes = nodesList.filter(
            (n) => n.ya === editingNode.id || n.tidak === editingNode.id
          );
          for (const refNode of referencingNodes) {
            const refUpdates: any = {};
            if (refNode.ya === editingNode.id) refUpdates.ya = payload.id;
            if (refNode.tidak === editingNode.id) refUpdates.tidak = payload.id;
            await updatePohonNode(refNode.id, refUpdates);
          }
        }
        await updatePohonNode(editingNode.id, payload);
        await loadData();
        toast.success("Langkah & referensi alur berhasil diperbarui");
      } else {
        const inserted = await insertPohonNode(payload);

        // Jika dibuat dari konteks visual + cabang parent (Tambah Cabang dari preview)
        if (parentBranchContext) {
          const { parentId, branchType } = parentBranchContext;
          await updatePohonNode(parentId, { [branchType]: inserted.id });
          toast.success(
            `Node [${inserted.id}] dibuat & otomatis dihubungkan ke cabang ${branchType.toUpperCase()} pada [${parentId}]!`
          );
          setParentBranchContext(null);
        } else {
          toast.success("Langkah berhasil ditambahkan");
        }

        await loadData();
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
            Kelola Pohon Keputusan (Decision Tree)
          </h1>
          <p className="text-gray-500">
            Atur alur percabangan Ya/Tidak secara dinamis sesuai struktur pohon pakar
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={() => setIsPreviewOpen(true)}
            className="bg-pink-600 hover:bg-pink-700 text-white"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Visual Pohon
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={handleAdd}
                className="bg-pink-600 hover:bg-pink-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Langkah (Node)
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingNode
                    ? `Edit Langkah [${editingNode.id}]`
                    : "Tambah Langkah Baru (Node Pohon Keputusan)"}
                </DialogTitle>
              </DialogHeader>

              {/* Box Penjelasan ID Langkah */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 space-y-1">
                <p className="font-semibold flex items-center gap-1 text-amber-950">
                  <span>💡</span> Penamaan ID Langkah (Struktur Pakar):
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-amber-800 text-[11px]">
                  <li><code className="bg-amber-100 px-1 rounded font-bold">h01_g01</code> : Pengecekan Gejala 1 pada Hama 1</li>
                  <li><code className="bg-amber-100 px-1 rounded font-bold">h01_g02_y</code> : Cabang setelah menjawab <strong>YA</strong> di G01</li>
                  <li><code className="bg-amber-100 px-1 rounded font-bold">h01_g02_t</code> : Cabang setelah menjawab <strong>TIDAK</strong> di G01</li>
                  <li><code className="bg-amber-100 px-1 rounded font-bold">h01_confirmed</code> : Ujung alur ➔ Hasil Diagnosa Hama 1 terdeteksi</li>
                </ul>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* ID Node */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="node_id">
                      ID Langkah / Node (Unik) <span className="text-red-500">*</span>
                    </Label>
                    {!editingNode && (
                      <span className="text-[11px] text-pink-600 font-medium">
                        *Terisi otomatis atau buat manual
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="node_id"
                      placeholder="Contoh: h01_g01 atau p02_g14_y"
                      value={formData.id}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, id: e.target.value.trim() }))
                      }
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap text-xs border-pink-200 hover:bg-pink-50 text-pink-700"
                      onClick={() => {
                        const autoId = generateSmartId(formData.gejala_id, formData.hasil);
                        setFormData((prev) => ({ ...prev, id: autoId }));
                        toast.success(`ID otomatis dibuat: [${autoId}]`);
                      }}
                    >
                      ✨ Auto ID
                    </Button>
                  </div>
                  {nodesList.some((n) => n.id === formData.id && editingNode?.id !== formData.id) && (
                    <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                      <span>⚠️</span> ID ini sudah digunakan. Sistem akan menambahkan akhiran unik secara otomatis saat disimpan.
                    </p>
                  )}
                  <p className="text-[11px] text-gray-500">
                    Gunakan huruf kecil, angka, dan underscore (_). Jangan ada spasi.
                  </p>
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
                      -- Bukan Pengecekan Gejala (Node Root / Group Pembuka) --
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
                    Teks Pertanyaan / Keterangan Langkah
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
                    Deskripsi / Petunjuk Tambahan (Opsional)
                  </Label>
                  <Input
                    id="deskripsi"
                    placeholder="Keterangan bantuan bagi user"
                    value={formData.deskripsi}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deskripsi: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* YA Target */}
                  <div className="space-y-1">
                    <Label htmlFor="ya_target">
                      Jika Jawab YA ➔ Lanjut Ke Langkah:
                    </Label>
                    <select
                      id="ya_target"
                      value={formData.ya}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, ya: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                    >
                      {renderCategorizedOptions()}
                    </select>
                  </div>

                  {/* TIDAK Target */}
                  <div className="space-y-1">
                    <Label htmlFor="tidak_target">
                      Jika Jawab TIDAK ➔ Lanjut Ke Langkah:
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
                      {renderCategorizedOptions()}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Hasil Terminal */}
                  <div className="space-y-1">
                    <Label htmlFor="hasil">
                      🏆 Hasil Diagnosa (Ujung Alur)
                    </Label>
                    <select
                      id="hasil"
                      value={formData.hasil}
                      onChange={(e) => handleHasilChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                    >
                      <option value="">
                        -- Pertanyaan Biasa (Lanjut ke Langkah Lain) --
                      </option>
                      <optgroup label="Hama & Penyakit">
                        {penyakitList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.kode} - {p.nama} ({p.tipe.toUpperCase()})
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
                    <p className="text-[11px] text-gray-500">
                      Pilih Hama/Penyakit HANYA jika langkah ini merupakan keputusan akhir (ujung pohon).
                    </p>
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
                        formData.hasil
                          ? "-"
                          : formData.gejala_id
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
                      disabled={!!formData.gejala_id || !!formData.hasil}
                      className={
                        formData.gejala_id || formData.hasil
                          ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                          : ""
                      }
                    />
                    {formData.hasil ? (
                      <p className="text-[11px] text-gray-500 italic mt-0.5">
                        * Node hasil akhir tidak menggunakan CF Pakar (CF dihitung dinamis dari gejala).
                      </p>
                    ) : formData.gejala_id ? (
                      <p className="text-[11px] text-pink-600 italic mt-0.5">
                        * CF Pakar dikunci & disinkronkan otomatis dari data master gejala.
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Preview Alur */}
                <div className="bg-pink-50 rounded-xl p-3 border border-pink-100 text-xs text-pink-800 space-y-1">
                  <p>
                    <strong>Alur Singkat Langkah Ini:</strong>
                  </p>
                  <p>
                    Langkah:{" "}
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
                    Simpan Langkah
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Panduan Utama Pengelolaan Pohon */}
      <Card className="border-pink-200 bg-gradient-to-r from-pink-50 via-white to-rose-50 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-lg">
              📖
            </div>
            <div className="space-y-3 text-sm text-gray-800 w-full">
              <div>
                <h3 className="text-base font-bold text-pink-950 flex items-center gap-2">
                  Panduan Pengelolaan Alur Pohon Keputusan (Decision Tree)
                </h3>
                <p className="text-xs text-gray-600">
                  Pohon keputusan mengatur alur pertanyaan interaktif kepada pengguna dari gejala awal hingga hasil diagnosa akhir.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 pt-1">
                <div className="bg-white p-3.5 rounded-lg border border-pink-100 shadow-2xs space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-xs text-pink-700">
                    <span className="w-5 h-5 bg-pink-100 rounded-full flex items-center justify-center text-[10px]">1</span>
                    Awal Diagnosa (Root)
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Diagnosa selalu dimulai dari langkah <strong>root (G00)</strong> untuk memisahkan alur menuju kelompok <strong>Hama</strong> atau <strong>Penyakit</strong>.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-blue-100 shadow-2xs space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-xs text-blue-700">
                    <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-[10px]">2</span>
                    Pertanyaan & Percabangan
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    - <strong>Jika Jawab YA</strong> ➔ Alur berpindah ke ID Langkah di kolom Target YA.<br/>
                    - <strong>Jika Jawab TIDAK</strong> ➔ Alur berpindah ke ID Langkah di kolom Target TIDAK.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-green-100 shadow-2xs space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-xs text-green-700">
                    <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-[10px]">3</span>
                    Keputusan Akhir (Ujung)
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Jika alur sudah mencapai akhir diagnosa, kosongkan target YA/TIDAK lalu tentukan <strong>Hasil Diagnosa (Hama / Penyakit)</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
              className="pl-10 pr-16"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
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
                        if (node.hasil) {
                          return (
                            <span className="text-gray-400 font-sans text-xs italic">
                              -
                            </span>
                          );
                        }
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


      <PohonKeputusanPreview
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        nodesList={nodesList}
        gejalaList={gejalaList}
        penyakitList={penyakitList}
        onEditNode={handleEdit}
        onAddBranchNode={handleAddBranchFromPreview}
        onRefreshData={loadData}
        loading={loading}
      />
    </div>
  );
};
