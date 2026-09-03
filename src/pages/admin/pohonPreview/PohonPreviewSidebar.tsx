import { Search, X, Edit, Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PohonNode } from "../KelolaPohonKeputusan";
import type { PreviewTreeType } from "./pohonPreviewHelpers";

interface PohonPreviewSidebarProps {
  previewTreeType: PreviewTreeType;
  setPreviewTreeType: (type: PreviewTreeType) => void;
  setSelectedNodeId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  previewStats: {
    questionCount: number;
    resultCount: number;
    brokenTargets: number;
  };
  selectedNode: any;
  nodesList: PohonNode[];
  getNodeLabel: (nodeId: string | null) => string;
  onOpenChange: (open: boolean) => void;
  onEditNode: (node: PohonNode) => void;
  setDeleteConfirmId: (id: string | null) => void;
  handleOpenAddBranchModal: (parentId: string, branchType: "ya" | "tidak") => void;
  handleCreateMissingNode: (targetId: string) => void;
  handleClearMissingLink: (targetId: string) => void;
  deletingNode: boolean;
}

/**
 * Sub-komponen PohonPreviewSidebar
 * Menampilkan panel kontrol samping kiri: Pemilih Tab Kategori, Kotak Pencarian, Statistik Ringkas,
 * Card Detail Node yang Diklik, Tombol Aksi Cepat, dan Legenda.
 */
export const PohonPreviewSidebar = ({
  previewTreeType,
  setPreviewTreeType,
  setSelectedNodeId,
  searchQuery,
  setSearchQuery,
  previewStats,
  selectedNode,
  nodesList,
  getNodeLabel,
  onOpenChange,
  onEditNode,
  setDeleteConfirmId,
  handleOpenAddBranchModal,
  handleCreateMissingNode,
  handleClearMissingLink,
  deletingNode,
}: PohonPreviewSidebarProps) => {
  return (
    <aside className="border-r border-gray-200 bg-gray-50 p-4 flex flex-col gap-4 overflow-y-auto">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Pohon Keputusan</h2>
        <p className="text-xs text-gray-500 mt-1">
          Preview alur diagnosa hama dan penyakit buah naga.
        </p>
      </div>

      {/* Pemilih Tab Kategori (Hama / Penyakit / Gabungan) */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase text-gray-500">
          Pilih Kelompok
        </p>
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-white p-1 border">
          {(["hama", "penyakit", "gabungan"] as PreviewTreeType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setPreviewTreeType(type);
                setSelectedNodeId(null);
              }}
              className={`px-2 py-2 rounded-md text-xs font-semibold capitalize transition ${
                previewTreeType === type
                  ? "bg-pink-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Kotak Pencarian Node / Gejala */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase text-gray-500">
          Cari Node / Gejala
        </p>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Ketik kode, nama gejala..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 text-xs border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-md transition-colors"
              title="Bersihkan Pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Statistik Ringkas Node */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border bg-white p-3">
          <p className="text-2xl font-bold text-gray-900">
            {previewStats.questionCount}
          </p>
          <p className="text-xs text-gray-500">Node alur</p>
        </div>
        <div className="rounded-lg border bg-white p-3">
          <p className="text-2xl font-bold text-blue-700">
            {previewStats.resultCount}
          </p>
          <p className="text-xs text-gray-500">Hasil akhir</p>
        </div>
      </div>

      {previewStats.brokenTargets > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 animate-pulse">
          {previewStats.brokenTargets} target cabang tidak ditemukan.
        </div>
      )}

      {/* Panel Informasi Detail Node yang Diklik */}
      <div className="border-t border-gray-200 pt-4 flex-1 flex flex-col min-h-0">
        <p className="text-[11px] font-semibold uppercase text-gray-500 mb-2">
          Detail Node
        </p>
        {selectedNode ? (
          <div className="bg-white rounded-lg border p-3 text-xs space-y-3 overflow-y-auto flex-1 shadow-sm">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-mono font-bold text-sm text-gray-900">
                  {selectedNode.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    selectedNode.hasil
                      ? "bg-blue-100 text-blue-800"
                      : selectedNode.id === "root" ||
                          selectedNode.id.endsWith("_group")
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-pink-100 text-pink-800"
                  }`}
                >
                  {selectedNode.hasil
                    ? "Hasil Akhir"
                    : selectedNode.id === "root"
                      ? "Root Node"
                      : selectedNode.id.endsWith("_group")
                        ? "Group Node"
                        : "Gejala"}
                </span>
              </div>
              <p className="font-medium text-gray-700 leading-relaxed">
                {selectedNode.nama_gejala || selectedNode.subtitle}
              </p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-dashed text-gray-600">
              {selectedNode.kode_gejala && (
                <div>
                  <strong>Kode Gejala:</strong>{" "}
                  <span className="font-semibold text-pink-600">
                    {selectedNode.kode_gejala}
                  </span>
                </div>
              )}
              {selectedNode.cf_pakar !== undefined && (
                <div>
                  <strong>CF Pakar:</strong>{" "}
                  <code className="bg-gray-100 px-1 rounded">
                    {selectedNode.cf_pakar}
                  </code>
                </div>
              )}
              {selectedNode.ya && (
                <div>
                  <strong>Jika YA (Y) &rarr;</strong>{" "}
                  <code className="text-emerald-700 font-bold bg-emerald-50 px-1 rounded">
                    {selectedNode.ya}
                  </code>
                  <p
                    className="text-[10px] text-gray-500 pl-2 truncate"
                    title={getNodeLabel(selectedNode.ya)}
                  >
                    {getNodeLabel(selectedNode.ya)}
                  </p>
                </div>
              )}
              {selectedNode.tidak && (
                <div>
                  <strong>Jika TIDAK (T) &rarr;</strong>{" "}
                  <code className="text-red-700 font-bold bg-red-50 px-1 rounded">
                    {selectedNode.tidak}
                  </code>
                  <p
                    className="text-[10px] text-gray-500 pl-2 truncate"
                    title={getNodeLabel(selectedNode.tidak)}
                  >
                    {getNodeLabel(selectedNode.tidak)}
                  </p>
                </div>
              )}
              {selectedNode.hasil && (
                <div>
                  <strong>Kesimpulan:</strong>{" "}
                  <span className="font-bold text-blue-700">
                    {getNodeLabel(selectedNode.id)}
                  </span>
                </div>
              )}
            </div>

            {/* Tombol Aksi Cepat (Edit, Hapus, Tambah Cabang) */}
            {selectedNode.isMissing ? (
              <div className="pt-2 space-y-2">
                <div className="p-2.5 rounded-lg border border-red-200 bg-red-50 text-red-800 space-y-1">
                  <p className="font-semibold flex items-center gap-1 text-[11px]">
                    <span>⚠️</span> Jalur Terputus / Target Hilang
                  </p>
                  <p className="text-[10px] leading-relaxed text-red-700">
                    Target node{" "}
                    <code className="font-bold font-mono">
                      [{selectedNode.id}]
                    </code>{" "}
                    dirujuk oleh node induk tetapi belum dibuat di database.
                  </p>
                </div>
                <div className="space-y-1.5 pt-1">
                  <Button
                    size="sm"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-8 px-1"
                    onClick={() => handleCreateMissingNode(selectedNode.id)}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />+ Buat Node [{selectedNode.id}] Sekarang
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-red-300 text-red-700 hover:bg-red-50 text-[11px] h-8 px-1"
                    onClick={() => handleClearMissingLink(selectedNode.id)}
                    disabled={deletingNode}
                  >
                    {deletingNode ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Membersihkan...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Putus Jalur Terputus Ini
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="pt-2 space-y-2">
                <div className="grid grid-cols-2 gap-1.5">
                  <Button
                    size="sm"
                    className="bg-pink-600 hover:bg-pink-700 text-white text-[11px] py-1 h-8 px-1"
                    onClick={() => {
                      const nodeObj = nodesList.find(
                        (n) => n.id === selectedNode.id
                      );
                      if (nodeObj) {
                        onOpenChange(false);
                        onEditNode(nodeObj);
                      }
                    }}
                  >
                    <Edit className="w-3.5 h-3.5 mr-1" />
                    Edit Node
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 text-[11px] py-1 h-8 px-1"
                    onClick={() => setDeleteConfirmId(selectedNode.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Hapus Node
                  </Button>
                </div>

                {!selectedNode.hasil && (
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 text-[11px] h-8 px-1"
                      onClick={() =>
                        handleOpenAddBranchModal(selectedNode.id, "ya")
                      }
                    >
                      <Plus className="w-3 h-3 mr-0.5" />+ Cabang YA
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-red-50 hover:bg-red-100 text-red-800 border-red-300 text-[11px] h-8 px-1"
                      onClick={() =>
                        handleOpenAddBranchModal(selectedNode.id, "tidak")
                      }
                    >
                      <Plus className="w-3 h-3 mr-0.5" />+ Cabang TIDAK
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-dashed p-4 text-center text-xs text-gray-400 my-auto">
            Klik node pada pohon untuk melihat detail di sini.
          </div>
        )}
      </div>



      {/* Legenda Keterangan Warna dan Garis */}
      <div className="space-y-2 text-xs text-gray-600 border-t border-gray-200 pt-4">
        <p className="text-[11px] font-semibold uppercase text-gray-500">
          Legenda
        </p>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-white border-2 border-gray-900" />
          Gejala / pertanyaan
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-100 border-4 border-blue-600" />
          Hasil akhir diagnosa
        </div>
        <div className="flex items-center gap-2">
          <span className="w-8 border-t-2 border-gray-900" />
          Jalur YA
        </div>
        <div className="flex items-center gap-2">
          <span className="w-8 border-t-2 border-dashed border-gray-900" />
          Jalur TIDAK
        </div>
      </div>
    </aside>
  );
};
