import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  fetchHasilDiagnosa,
  fetchUsers,
  deleteHasilDiagnosa,
  fetchPenyakit,
} from "@/services/supabaseService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Search,
  Calendar,
  Stethoscope,
  Loader2,
  Trash2,
  Eye,
  CheckCircle,
  Thermometer,
  AlertTriangle,
  Users,
  TrendingUp,
  Bug,
  Filter,
  Download,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Printer,
  FileSpreadsheet,
  FileCode,
  ChevronDown,
} from "lucide-react";
import { TablePagination } from "@/components/ui/table-pagination";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

export const LaporanDiagnosa = () => {
  const [laporanList, setLaporanList] = useState<any[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTanggal, setFilterTanggal] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteBulkConfirm, setDeleteBulkConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [penyakitList, setPenyakitList] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Print state
  const [printTarget, setPrintTarget] = useState<"all" | "filtered" | "selected" | "single" | null>(null);
  const [singlePrintItem, setSinglePrintItem] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [diagnosaData, usersData, penyakitData] = await Promise.all([
        fetchHasilDiagnosa(),
        fetchUsers(),
        fetchPenyakit(),
      ]);
      setLaporanList(diagnosaData);
      setPenyakitList(penyakitData);
      const map: Record<string, string> = {};
      usersData.forEach((u: any) => {
        map[u.id] = u.nama;
      });
      setUserMap(map);
    } catch (err) {
      console.error("Gagal memuat laporan:", err);
      toast.error("Gagal memuat data laporan");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: any) => {
    try {
      setDeleting(true);
      await deleteHasilDiagnosa(item.id);
      setLaporanList((prev) => prev.filter((r) => r.id !== item.id));
      setSelectedIds((prev) => prev.filter((id) => id !== item.id));
      setDeleteTarget(null);
      if (selectedItem?.id === item.id) setSelectedItem(null);
      toast.success("Laporan berhasil dihapus");
    } catch (err) {
      toast.error("Gagal menghapus laporan");
    } finally {
      setDeleting(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [
        ...new Set([...prev, ...paginatedList.map((item) => item.id)]),
      ]);
    } else {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedList.some((item) => item.id === id)),
      );
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked
        ? [...new Set([...prev, id])]
        : prev.filter((item) => item !== id),
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      setDeleting(true);
      await Promise.all(selectedIds.map((id) => deleteHasilDiagnosa(id)));
      setLaporanList((prev) =>
        prev.filter((item) => !selectedIds.includes(item.id)),
      );
      setSelectedIds([]);
      setDeleteBulkConfirm(false);
      if (selectedItem && selectedIds.includes(selectedItem.id))
        setSelectedItem(null);
      toast.success("Laporan terpilih berhasil dihapus");
    } catch (err) {
      toast.error("Gagal menghapus laporan terpilih");
    } finally {
      setDeleting(false);
    }
  };

  // Filter data
  const filteredList = laporanList.filter((item) => {
    const nama = (
      item.nama_penyakit_terpilih ||
      item.hasil_cf?.[0]?.nama_penyakit ||
      ""
    ).toLowerCase();
    const userName = (userMap[item.user_id] || "").toLowerCase();
    const matchSearch =
      nama.includes(searchQuery.toLowerCase()) ||
      userName.includes(searchQuery.toLowerCase());
    const matchTanggal =
      !filterTanggal || item.tanggal?.startsWith(filterTanggal);
    return matchSearch && matchTanggal;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredList.length / ITEMS_PER_PAGE),
  );
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredList.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredList, currentPage]);

  // Stats
  const totalDiagnosa = laporanList.length;
  const uniqueUsers = new Set(laporanList.map((i) => i.user_id)).size;
  const avgCF =
    totalDiagnosa > 0
      ? laporanList.reduce((sum, i) => sum + (i.cf_tertinggi || 0), 0) /
        totalDiagnosa
      : 0;

  // Penyakit terbanyak
  const penyakitCount: Record<string, number> = {};
  laporanList.forEach((item) => {
    const nama =
      item.nama_penyakit_terpilih ||
      item.hasil_cf?.[0]?.nama_penyakit ||
      "Unknown";
    penyakitCount[nama] = (penyakitCount[nama] || 0) + 1;
  });
  const topPenyakit = Object.entries(penyakitCount).sort((a, b) => b[1] - a[1]);
  const maxCount = topPenyakit.length > 0 ? topPenyakit[0][1] : 1;

  const getStatusColor = (cf: number) => {
    if (cf >= 0.9) return "bg-green-50 text-green-700 border-green-200";
    if (cf >= 0.7) return "bg-blue-50 text-blue-700 border-blue-200";
    if (cf >= 0.5) return "bg-yellow-50 text-yellow-700 border-yellow-200";
    return "bg-gray-50 text-gray-600 border-gray-200";
  };

  const getCFLabel = (cf: number): string => {
    if (cf >= 0.9) return "Sangat Yakin";
    if (cf >= 0.7) return "Yakin";
    if (cf >= 0.5) return "Cukup Yakin";
    if (cf >= 0.3) return "Sedikit Yakin";
    return "Tidak Yakin";
  };

  // Helper Escape CSV (RFC 4180)
  const escapeCSV = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  // Helper filter target data for export/print
  const getExportData = (target: "all" | "filtered" | "selected") => {
    if (target === "selected") {
      return laporanList.filter((item) => selectedIds.includes(item.id));
    }
    if (target === "filtered") {
      return filteredList;
    }
    return laporanList;
  };

  // Export CSV dengan UTF-8 BOM dan escaping lengkap
  const handleExportCSV = (target: "all" | "filtered" | "selected" = "filtered") => {
    const dataToExport = getExportData(target);
    if (dataToExport.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }

    const headers = [
      "No",
      "ID Laporan",
      "Tanggal Diagnosa",
      "Waktu",
      "Nama User",
      "Hasil Diagnosa",
      "Certainty Factor (CF %)",
      "Kategori Keyakinan",
      "Jumlah Gejala",
      "Daftar Gejala",
      "Solusi / Penanganan",
    ];

    const rows = dataToExport.map((item, idx) => {
      const gejalaNames = (item.gejala_dipilih || [])
        .map((g: any) => g.nama_gejala)
        .join("; ");
      const solusiList = (item.solusi || []).join("; ");
      const dateObj = new Date(item.tanggal);
      const tanggalStr = dateObj.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const waktuStr = dateObj.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const cfPercent = Math.round((item.cf_tertinggi || 0) * 100);
      const cfLabel = getCFLabel(item.cf_tertinggi || 0);
      const penyakitName =
        item.nama_penyakit_terpilih || item.hasil_cf?.[0]?.nama_penyakit || "-";
      const userName = userMap[item.user_id] || "Unknown User";

      return [
        idx + 1,
        escapeCSV(item.id),
        escapeCSV(tanggalStr),
        escapeCSV(waktuStr),
        escapeCSV(userName),
        escapeCSV(penyakitName),
        `${cfPercent}%`,
        escapeCSV(cfLabel),
        item.gejala_dipilih?.length || 0,
        escapeCSV(gejalaNames),
        escapeCSV(solusiList),
      ].join(",");
    });

    // Masukkan UTF-8 BOM \uFEFF agar Microsoft Excel membaca format karakter & separator dengan sempurna
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const label = target === "selected" ? "terpilih" : target === "filtered" ? "terfilter" : "semua";
    a.download = `laporan_diagnosa_${label}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Berhasil mengekspor ${dataToExport.length} data laporan ke CSV`);
  };

  // Export JSON
  const handleExportJSON = (target: "all" | "filtered" | "selected" = "filtered") => {
    const dataToExport = getExportData(target);
    if (dataToExport.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }
    const formattedData = dataToExport.map((item) => ({
      id: item.id,
      tanggal: item.tanggal,
      user_id: item.user_id,
      nama_user: userMap[item.user_id] || "Unknown",
      hasil_diagnosa: item.nama_penyakit_terpilih || item.hasil_cf?.[0]?.nama_penyakit || "-",
      cf_tertinggi: item.cf_tertinggi,
      cf_persentase: `${Math.round((item.cf_tertinggi || 0) * 100)}%`,
      kategori_cf: getCFLabel(item.cf_tertinggi || 0),
      gejala_dipilih: item.gejala_dipilih || [],
      hasil_cf: item.hasil_cf || [],
      solusi: item.solusi || [],
    }));

    const jsonStr = JSON.stringify(formattedData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const label = target === "selected" ? "terpilih" : target === "filtered" ? "terfilter" : "semua";
    a.download = `laporan_diagnosa_${label}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Berhasil mengekspor ${dataToExport.length} data laporan ke JSON`);
  };

  // Print / Cetak PDF
  const handlePrint = (target: "all" | "filtered" | "selected" | "single", item?: any) => {
    if (target === "single" && item) {
      setSinglePrintItem(item);
      setPrintTarget("single");
    } else {
      const dataToPrint = getExportData(target as "all" | "filtered" | "selected");
      if (dataToPrint.length === 0) {
        toast.error("Tidak ada data untuk dicetak");
        return;
      }
      setPrintTarget(target);
      setSinglePrintItem(null);
    }
    setTimeout(() => {
      window.print();
    }, 300);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
        <span className="text-gray-500 text-sm">
          Memuat laporan diagnosa...
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-6 print:hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan Diagnosa</h1>
            <p className="text-gray-400 text-sm mt-1">
              Semua hasil diagnosa dari seluruh user
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-sm self-start sm:self-auto"
              >
                <Download className="w-4 h-4" />
                <span>Export / Cetak Laporan</span>
                {selectedIds.length > 0 && (
                  <span className="ml-1 bg-emerald-800 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                    {selectedIds.length}
                  </span>
                )}
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              {selectedIds.length > 0 && (
                <>
                  <DropdownMenuLabel className="text-xs font-semibold text-emerald-700 bg-emerald-50/80 py-1.5 px-2 rounded">
                    Item Terpilih ({selectedIds.length})
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleExportCSV("selected")}>
                    <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" />
                    Export CSV (Terpilih)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePrint("selected")}>
                    <Printer className="w-4 h-4 mr-2 text-blue-600" />
                    Cetak PDF / Print (Terpilih)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportJSON("selected")}>
                    <FileCode className="w-4 h-4 mr-2 text-amber-600" />
                    Export JSON (Terpilih)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuLabel className="text-xs font-semibold text-gray-500">
                {searchQuery || filterTanggal ? "Data Terfilter" : "Semua Data"} ({filteredList.length})
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleExportCSV("filtered")}>
                <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" />
                Export CSV ({searchQuery || filterTanggal ? "Terfilter" : "Semua"})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePrint("filtered")}>
                <Printer className="w-4 h-4 mr-2 text-blue-600" />
                Cetak PDF / Print ({searchQuery || filterTanggal ? "Terfilter" : "Semua"})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportJSON("filtered")}>
                <FileCode className="w-4 h-4 mr-2 text-amber-600" />
                Export JSON ({searchQuery || filterTanggal ? "Terfilter" : "Semua"})
              </DropdownMenuItem>

              {(searchQuery || filterTanggal) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-semibold text-gray-500">
                    Semua Data Total ({laporanList.length})
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleExportCSV("all")}>
                    <FileSpreadsheet className="w-4 h-4 mr-2 text-gray-600" />
                    Export CSV (Semua {laporanList.length})
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePrint("all")}>
                    <Printer className="w-4 h-4 mr-2 text-gray-600" />
                    Cetak PDF / Print (Semua {laporanList.length})
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      {/* Statistik Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {totalDiagnosa}
                </p>
                <p className="text-xs text-gray-400">Total Diagnosa</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {uniqueUsers}
                </p>
                <p className="text-xs text-gray-400">User Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(avgCF * 100)}%
                </p>
                <p className="text-xs text-gray-400">Rata-rata CF</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Bug className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {topPenyakit.length}
                </p>
                <p className="text-xs text-gray-400">Jenis Terdeteksi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Penyakit Terbanyak (Clean Minimal Grid) */}
      {topPenyakit.length > 0 && (
        <Card className="border-0 shadow-md bg-white overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Hama & Penyakit Sering Terdeteksi
                  </h3>
                  <p className="text-xs text-gray-400">
                    Rekapitulasi {totalDiagnosa} diagnosa user
                  </p>
                </div>
              </div>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-gray-500 hover:text-pink-600 h-7 px-2.5"
                >
                  <X className="w-3.5 h-3.5 mr-1" /> Reset Filter
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {topPenyakit.slice(0, 4).map(([nama, count], idx) => {
                const isSelected = searchQuery.toLowerCase() === nama.toLowerCase();
                const relativePercent = Math.round((count / maxCount) * 100);
                const totalPercent = Math.round((count / (totalDiagnosa || 1)) * 100);

                return (
                  <div
                    key={nama}
                    onClick={() => {
                      if (isSelected) {
                        setSearchQuery("");
                      } else {
                        setSearchQuery(nama);
                        setCurrentPage(1);
                      }
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-pink-50/60 border-pink-300 shadow-xs"
                        : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-[11px] font-bold text-gray-400 font-mono">
                        #{idx + 1}
                      </span>
                      <span className="text-xs text-gray-600 font-medium">
                        <strong className="text-gray-900">{count}</strong> kali{" "}
                        <span className="text-gray-400 text-[11px]">({totalPercent}%)</span>
                      </span>
                    </div>

                    <h4 className="font-semibold text-gray-900 text-sm truncate mb-2.5">
                      {nama}
                    </h4>

                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-pink-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${relativePercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari nama penyakit atau nama user..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="date"
            value={filterTanggal}
            onChange={(e) => {
              setFilterTanggal(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 w-full sm:w-48"
          />
        </div>
      </div>

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
              Pilih laporan untuk hapus massal
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {selectedIds.length} terpilih
        </div>
      </div>

      {/* Tabel Laporan */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardContent className="p-0">
          {filteredList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                      <Checkbox
                        checked={
                          paginatedList.length > 0 &&
                          paginatedList.every((item) =>
                            selectedIds.includes(item.id),
                          )
                        }
                        onCheckedChange={(checked) =>
                          handleSelectAll(checked === true)
                        }
                      />
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                      No
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                      Tanggal
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                      User
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                      Hasil Diagnosa
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                      CF
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                      Gejala
                    </th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedList.map((item, index) => {
                    const cfValue = item.cf_tertinggi || 0;
                    const penyakitName =
                      item.nama_penyakit_terpilih ||
                      item.hasil_cf?.[0]?.nama_penyakit ||
                      "-";
                    const gejalaCount = item.gejala_dipilih?.length || 0;
                    const globalIndex =
                      (currentPage - 1) * ITEMS_PER_PAGE + index;

                    return (
                      <tr
                        key={item.id || index}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-5 py-3.5 text-center">
                          <Checkbox
                            checked={selectedIds.includes(item.id)}
                            onCheckedChange={(checked) =>
                              handleSelectRow(item.id, checked === true)
                            }
                          />
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-500 font-mono">
                          {globalIndex + 1}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="whitespace-nowrap">
                              {new Date(item.tanggal).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5 ml-5">
                            {new Date(item.tanggal).toLocaleTimeString(
                              "id-ID",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-medium text-gray-800">
                            {userMap[item.user_id] || "Unknown"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-semibold text-gray-900">
                            {penyakitName}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-pink-600">
                              {Math.round(cfValue * 100)}%
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getStatusColor(cfValue)}`}
                            >
                              {getCFLabel(cfValue)}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {gejalaCount} gejala
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-pink-600 hover:bg-pink-50"
                              onClick={() => setSelectedItem(item)}
                              title="Lihat detail"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => setDeleteTarget(item)}
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredList.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Belum Ada Laporan
              </h3>
              <p className="text-gray-400 text-sm">
                {searchQuery || filterTanggal
                  ? "Tidak ada data yang sesuai filter."
                  : "Belum ada user yang melakukan diagnosa."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <p className="text-xs text-gray-400 text-center">
        Menampilkan {filteredList.length} dari {totalDiagnosa} laporan diagnosa
      </p>

      {/* ============================================================ */}
      {/* DETAIL DIALOG */}
      {/* ============================================================ */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <div className="bg-gradient-to-r from-pink-600 to-rose-600 p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-white text-lg font-bold">
                Detail Laporan Diagnosa
              </DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2 text-pink-100 text-sm">
                  <Users className="w-4 h-4" />
                  <span>
                    User:{" "}
                    <strong className="text-white">
                      {userMap[selectedItem.user_id] || selectedItem.user_id}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-pink-100 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(selectedItem.tanggal).toLocaleDateString(
                      "id-ID",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          {selectedItem && (
            <div className="p-6 space-y-6">
              {/* Hasil Utama */}
              <div className="flex items-center gap-6 p-5 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100">
                <div className="flex-1">
                  <p className="text-xs font-medium text-pink-500 uppercase tracking-wider mb-1">
                    Hasil Diagnosa
                  </p>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedItem.nama_penyakit_terpilih ||
                      selectedItem.hasil_cf?.[0]?.nama_penyakit}
                  </h3>
                </div>
                <div className="text-center flex-shrink-0">
                  <p className="text-4xl font-extrabold text-pink-600 leading-none">
                    {Math.round((selectedItem.cf_tertinggi || 0) * 100)}%
                  </p>
                  <span
                    className={`mt-1.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedItem.cf_tertinggi || 0)}`}
                  >
                    {getCFLabel(selectedItem.cf_tertinggi || 0)}
                  </span>
                </div>
              </div>

              {/* Gejala */}
              {selectedItem.gejala_dipilih &&
                selectedItem.gejala_dipilih.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                      </span>
                      Gejala yang Teridentifikasi
                      <span className="ml-auto text-xs text-gray-400 font-normal">
                        {selectedItem.gejala_dipilih.length} gejala
                      </span>
                    </h4>
                    <div className="space-y-2">
                      {selectedItem.gejala_dipilih.map(
                        (g: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                          >
                            <span className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-sm text-gray-700 flex-1">
                              {g.nama_gejala}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono bg-white px-2 py-0.5 rounded border border-gray-100">
                              CF Pakar: {g.cf_pakar}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {/* Semua Hasil CF */}
              {selectedItem.hasil_cf && selectedItem.hasil_cf.length > 1 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                    </span>
                    Semua Kemungkinan
                    <span className="ml-auto text-xs text-gray-400 font-normal">
                      {selectedItem.hasil_cf.length} terdeteksi
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {[...selectedItem.hasil_cf]
                      .sort((a: any, b: any) => b.cf_value - a.cf_value)
                      .map((r: any, idx: number) => (
                        <div
                          key={r.penyakit_id || idx}
                          className={`rounded-xl p-3 border ${
                            idx === 0
                              ? "bg-pink-50 border-pink-200"
                              : "bg-gray-50 border-gray-100"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white ${
                                idx === 0 ? "bg-pink-500" : "bg-gray-400"
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={`font-medium text-sm ${idx === 0 ? "text-pink-900" : "text-gray-700"}`}
                                >
                                  {r.nama_penyakit}
                                </span>
                                <span
                                  className={`text-sm font-bold flex-shrink-0 ${idx === 0 ? "text-pink-600" : "text-gray-500"}`}
                                >
                                  {r.persentase ||
                                    Math.round((r.cf_value || 0) * 100)}
                                  %
                                </span>
                              </div>
                              <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${idx === 0 ? "bg-gradient-to-r from-pink-400 to-rose-500" : "bg-gray-400"}`}
                                  style={{
                                    width: `${r.persentase || Math.round((r.cf_value || 0) * 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Solusi */}
              {selectedItem.solusi && selectedItem.solusi.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Thermometer className="w-3.5 h-3.5 text-emerald-600" />
                    </span>
                    Solusi
                  </h4>
                  <div className="space-y-2">
                    {selectedItem.solusi.map((s: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100"
                      >
                        <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {s}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gambar Penyakit dari database */}
              {(() => {
                const penyakitId = selectedItem?.penyakit_terpilih;
                const penyakit = penyakitList.find(
                  (p: any) => p.id === penyakitId,
                );
                if (!penyakit?.image_urls?.length) return null;
                return (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                      </span>
                      Gambar Penyakit
                      <span className="ml-auto text-xs text-gray-400 font-normal">
                        {penyakit.image_urls.length} gambar
                      </span>
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {penyakit.image_urls.map((url: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setPreviewImages(penyakit.image_urls);
                            setPreviewIndex(idx);
                          }}
                          className="relative group aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 hover:border-pink-300 transition-all"
                        >
                          <img
                            src={url}
                            alt={`${penyakit.nama} - ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePrint("single", selectedItem)}
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Cetak Detail (PDF)
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedItem(null);
                    setDeleteTarget(selectedItem);
                  }}
                  className="text-red-500 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus Laporan Ini
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* DELETE CONFIRMATION */}
      {/* ============================================================ */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center">
              Hapus Laporan Diagnosa?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Laporan diagnosa{" "}
              <strong>{deleteTarget?.nama_penyakit_terpilih}</strong> dari user{" "}
              <strong>{userMap[deleteTarget?.user_id] || "Unknown"}</strong>{" "}
              akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3">
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
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

      <AlertDialog
        open={deleteBulkConfirm}
        onOpenChange={() => setDeleteBulkConfirm(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center">
              Hapus Laporan Terpilih?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {selectedIds.length} laporan diagnosa akan dihapus secara
              permanen. Tindakan ini tidak dapat dibatalkan.
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
                  <Trash2 className="w-4 h-4 mr-2" /> Ya, Hapus Semua
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              className="absolute -top-3 -right-3 z-10 p-2 bg-white rounded-full shadow-lg text-gray-600 hover:text-gray-900 cursor-pointer"
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
                  className="p-2 bg-white/90 rounded-full hover:bg-white shadow-lg cursor-pointer"
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
                  className="p-2 bg-white/90 rounded-full hover:bg-white shadow-lg cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>

    {/* ============================================================ */}
    {/* PRINTABLE TEMPLATE (PDF / PRINT VIEW) */}
    {/* ============================================================ */}
    <div className="hidden print:block print:w-full print:p-6 print:text-black font-sans bg-white">
      {printTarget === "single" && singlePrintItem ? (
        /* SINGLE DIAGNOSIS ITEM PRINT SHEET */
        <div className="space-y-6">
          <div className="border-b-2 border-gray-800 pb-4 text-center">
            <h1 className="text-xl font-bold uppercase tracking-wider text-gray-900">
              SISTEM PAKAR DIAGNOSA HAMA & PENYAKIT TANAMAN BUAH NAGA
            </h1>
            <h2 className="text-base font-semibold text-gray-700 mt-1">
              SURAT HASIL DIAGNOSA KELOLA ADMIN
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              ID Laporan: {singlePrintItem.id} | Tanggal: {new Date(singlePrintItem.tanggal).toLocaleString('id-ID')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-lg border border-gray-300">
            <div>
              <p className="text-gray-500 font-medium uppercase">NAMA USER / PETANI</p>
              <p className="font-semibold text-gray-900 text-sm">{userMap[singlePrintItem.user_id] || singlePrintItem.user_id}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium uppercase">TANGGAL DIAGNOSA</p>
              <p className="font-semibold text-gray-900 text-sm">
                {new Date(singlePrintItem.tanggal).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Result Box */}
          <div className="p-4 border-2 border-pink-500 bg-pink-50/50 rounded-xl">
            <p className="text-xs font-bold text-pink-700 uppercase">Hasil Diagnosa Utama</p>
            <div className="flex justify-between items-center mt-1">
              <h3 className="text-xl font-bold text-gray-900">
                {singlePrintItem.nama_penyakit_terpilih || singlePrintItem.hasil_cf?.[0]?.nama_penyakit}
              </h3>
              <div className="text-right">
                <span className="text-3xl font-extrabold text-pink-600">
                  {Math.round((singlePrintItem.cf_tertinggi || 0) * 100)}%
                </span>
                <p className="text-xs font-semibold text-gray-600">{getCFLabel(singlePrintItem.cf_tertinggi || 0)}</p>
              </div>
            </div>
          </div>

          {/* Gejala */}
          <div>
            <h4 className="font-bold text-gray-900 text-xs border-b border-gray-400 pb-1 mb-2">
              GEJALA YANG TERIDENTIFIKASI ({singlePrintItem.gejala_dipilih?.length || 0})
            </h4>
            <table className="w-full text-xs border border-gray-300">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300 text-left">
                  <th className="p-2 w-10 border-r border-gray-300 text-center">No</th>
                  <th className="p-2 border-r border-gray-300">Nama Gejala</th>
                  <th className="p-2 w-24">CF Pakar</th>
                </tr>
              </thead>
              <tbody>
                {(singlePrintItem.gejala_dipilih || []).map((g: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-200">
                    <td className="p-2 border-r border-gray-200 text-center font-mono">{idx + 1}</td>
                    <td className="p-2 border-r border-gray-200">{g.nama_gejala}</td>
                    <td className="p-2 font-mono">{g.cf_pakar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Solusi */}
          {singlePrintItem.solusi && singlePrintItem.solusi.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-900 text-xs border-b border-gray-400 pb-1 mb-2">
                REKOMENDASI PENANGANAN / SOLUSI
              </h4>
              <ol className="list-decimal list-inside text-xs space-y-1 pl-1">
                {singlePrintItem.solusi.map((s: string, idx: number) => (
                  <li key={idx} className="text-gray-800 leading-relaxed">
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Sign-off */}
          <div className="pt-10 flex justify-between text-xs text-gray-600">
            <div>
              <p>Dicetak secara otomatis oleh System</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Sistem Pakar Buah Naga © {new Date().getFullYear()}</p>
            </div>
            <div className="text-center w-48 border-t border-gray-400 pt-2 mt-12">
              <p className="font-semibold text-gray-800">Admin / Pakar Sistem</p>
            </div>
          </div>
        </div>
      ) : (
        /* MULTIPLE/TABLE REPORTS PRINT SHEET */
        <div className="space-y-6">
          <div className="border-b-2 border-gray-900 pb-3 text-center">
            <h1 className="text-xl font-bold uppercase tracking-wider text-gray-900">
              SISTEM PAKAR DIAGNOSA HAMA & PENYAKIT TANAMAN BUAH NAGA
            </h1>
            <h2 className="text-base font-semibold text-gray-700 mt-0.5">
              REKAPITULASI LAPORAN HASIL DIAGNOSA USER
            </h2>
            <div className="flex justify-between items-center text-xs text-gray-500 mt-2 px-2">
              <span>Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              <span>Jumlah Record: {getExportData((printTarget as any) || "filtered").length} Laporan</span>
            </div>
          </div>

          {/* Summary Box */}
          <div className="grid grid-cols-4 gap-3 text-center bg-gray-50 p-3 rounded-lg border border-gray-300 text-xs">
            <div>
              <p className="text-gray-500 font-medium">Total Diagnosa</p>
              <p className="text-lg font-bold text-gray-900">{getExportData((printTarget as any) || "filtered").length}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">User Unik</p>
              <p className="text-lg font-bold text-gray-900">
                {new Set(getExportData((printTarget as any) || "filtered").map((i) => i.user_id)).size}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Rata-rata CF</p>
              <p className="text-lg font-bold text-gray-900">
                {Math.round(
                  (getExportData((printTarget as any) || "filtered").reduce((s, i) => s + (i.cf_tertinggi || 0), 0) /
                    (getExportData((printTarget as any) || "filtered").length || 1)) * 100
                )}%
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Status Filter</p>
              <p className="text-xs font-semibold text-gray-800 mt-1">
                {filterTanggal ? `Tanggal: ${filterTanggal}` : searchQuery ? `Search: "${searchQuery}"` : "Semua Data"}
              </p>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-xs border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-200 text-gray-900 font-bold border-b border-gray-400">
                <th className="border border-gray-400 p-2 text-center w-8">No</th>
                <th className="border border-gray-400 p-2 text-left w-24">Tanggal</th>
                <th className="border border-gray-400 p-2 text-left w-32">Nama User</th>
                <th className="border border-gray-400 p-2 text-left">Hasil Diagnosa</th>
                <th className="border border-gray-400 p-2 text-center w-16">CF (%)</th>
                <th className="border border-gray-400 p-2 text-left">Gejala Terdeteksi</th>
              </tr>
            </thead>
            <tbody>
              {getExportData((printTarget as any) || "filtered").map((item, idx) => (
                <tr key={item.id || idx} className="border-b border-gray-300">
                  <td className="border border-gray-300 p-2 text-center font-mono">{idx + 1}</td>
                  <td className="border border-gray-300 p-2">
                    {new Date(item.tanggal).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="border border-gray-300 p-2 font-medium">
                    {userMap[item.user_id] || "Unknown"}
                  </td>
                  <td className="border border-gray-300 p-2 font-semibold">
                    {item.nama_penyakit_terpilih || item.hasil_cf?.[0]?.nama_penyakit || "-"}
                  </td>
                  <td className="border border-gray-300 p-2 text-center font-bold">
                    {Math.round((item.cf_tertinggi || 0) * 100)}%
                  </td>
                  <td className="border border-gray-300 p-2 text-[11px] leading-tight">
                    {(item.gejala_dipilih || []).map((g: any) => g.nama_gejala).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Signature */}
          <div className="pt-8 flex justify-between text-xs text-gray-600">
            <div>
              <p>Catatan: Dokumen ini dicetak untuk keperluan arsip/laporan administrasi.</p>
            </div>
            <div className="text-center w-52 border-t border-gray-400 pt-2 mt-10">
              <p className="font-semibold text-gray-900">Admin Pengelola Laporan</p>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};
