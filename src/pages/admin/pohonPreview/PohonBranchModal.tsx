import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Gejala, Penyakit } from "@/types";
import type { PohonNode } from "../KelolaPohonKeputusan";

interface PohonBranchModalProps {
  branchModal: {
    isOpen: boolean;
    parentId: string;
    branchType: "ya" | "tidak";
  } | null;
  setBranchModal: (val: any) => void;
  branchTargetMode: "existing" | "new";
  setBranchTargetMode: (mode: "existing" | "new") => void;
  selectedExistingTargetId: string;
  setSelectedExistingTargetId: (id: string) => void;
  branchFormData: {
    id: string;
    gejala_id: string;
    kode_gejala: string;
    nama_gejala: string;
    deskripsi: string;
    ya: string;
    tidak: string;
    hasil: string;
    cf_pakar: number;
  };
  setBranchFormData: React.Dispatch<React.SetStateAction<{
    id: string;
    gejala_id: string;
    kode_gejala: string;
    nama_gejala: string;
    deskripsi: string;
    ya: string;
    tidak: string;
    hasil: string;
    cf_pakar: number;
  }>>;
  nodesList: PohonNode[];
  gejalaList: Gejala[];
  penyakitList: Penyakit[];
  savingBranch: boolean;
  handleSaveBranchNode: (e: React.FormEvent) => Promise<void>;
  handleBranchGejalaChange: (gejalaId: string) => void;
  handleBranchHasilChange: (hasilVal: string) => void;
  generateSmartIdForPreview: (
    gejalaId?: string,
    hasilVal?: string,
    customPrefix?: string
  ) => string;
}

/**
 * Sub-komponen PohonBranchModal
 * Menampilkan modal dialog pop-up untuk menambahkan cabang baru (cabang YA atau TIDAK)
 * dari node yang dipilih pada visual preview. Mendukung 2 opsi:
 * 1. Penyambungan langsung ke node / hasil akhir yang sudah ada.
 * 2. Pembuatan langkah node baru dengan penentuan ID otomatis.
 */
export const PohonBranchModal = ({
  branchModal,
  setBranchModal,
  branchTargetMode,
  setBranchTargetMode,
  selectedExistingTargetId,
  setSelectedExistingTargetId,
  branchFormData,
  setBranchFormData,
  nodesList,
  gejalaList,
  penyakitList,
  savingBranch,
  handleSaveBranchNode,
  handleBranchGejalaChange,
  handleBranchHasilChange,
  generateSmartIdForPreview,
}: PohonBranchModalProps) => {
  if (!branchModal) return null;

  return (
    <Dialog
      open={branchModal.isOpen}
      onOpenChange={(open) => {
        if (!open) setBranchModal(null);
      }}
    >
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto z-[9999] bg-white border border-pink-100 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2 text-gray-900">
            <span className="p-1 bg-pink-100 rounded-md text-pink-600">➕</span>{" "}
            Tambah Cabang {branchModal.branchType.toUpperCase()} untuk Node [{branchModal.parentId}]
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSaveBranchNode} className="space-y-3.5 pt-2 text-xs">
          {/* Selector Mode Sambungan Cabang */}
          <div className="flex rounded-lg border border-pink-200 p-1 bg-pink-50/40 gap-1">
            <button
              type="button"
              className={`flex-1 text-[11px] font-semibold py-1.5 px-2 rounded-md transition-all ${
                branchTargetMode === "existing"
                  ? "bg-white text-pink-700 shadow-sm border border-pink-300"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setBranchTargetMode("existing")}
            >
              🎯 Hubungkan ke Node/Hasil yang Sudah Ada (Langsung)
            </button>
            <button
              type="button"
              className={`flex-1 text-[11px] font-semibold py-1.5 px-2 rounded-md transition-all ${
                branchTargetMode === "new"
                  ? "bg-white text-pink-700 shadow-sm border border-pink-300"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setBranchTargetMode("new")}
            >
              ➕ Buat Node Langkah Baru
            </button>
          </div>

          {branchTargetMode === "existing" ? (
            <div className="space-y-3 pt-1">
              <div className="p-3 rounded-lg border border-pink-200 bg-pink-50/70 text-pink-900 space-y-1">
                <p className="font-semibold text-xs flex items-center gap-1.5">
                  <span>🔗</span> Sambungan Langsung
                </p>
                <p className="text-[11px] text-pink-800 leading-relaxed">
                  Pilih node atau hasil akhir diagnosa yang sudah ada di pohon
                  untuk dihubungkan langsung dari cabang{" "}
                  <strong className="uppercase font-mono">
                    [{branchModal.branchType}]
                  </strong>{" "}
                  pada <strong className="font-mono">[{branchModal.parentId}]</strong>{" "}
                  tanpa membuat node baru.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="existing_target_node"
                  className="text-xs font-semibold"
                >
                  Pilih Target Node / Hasil Akhir{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <select
                  id="existing_target_node"
                  value={selectedExistingTargetId}
                  onChange={(e) => setSelectedExistingTargetId(e.target.value)}
                  className="w-full px-2.5 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-xs bg-white font-medium"
                  required
                >
                  <option value="">-- Pilih Node Target yang Sudah Ada --</option>

                  <optgroup label="🏆 Hasil Akhir / Terminal Node">
                    {nodesList
                      .filter((n) => n.hasil)
                      .map((n) => {
                        const penyakit = penyakitList.find(
                          (p) => p.id === n.hasil
                        );
                        const labelText = penyakit
                          ? `Hasil: ${penyakit.kode} - ${penyakit.nama}`
                          : n.hasil === "hama_not_found"
                            ? "Hasil: Hama Tidak Teridentifikasi"
                            : n.hasil === "penyakit_not_found"
                              ? "Hasil: Penyakit Tidak Teridentifikasi"
                              : `Hasil: ${n.hasil}`;
                        return (
                          <option key={n.id} value={n.id}>
                            🏆 [{n.id}] {labelText}
                          </option>
                        );
                      })}
                  </optgroup>

                  <optgroup label="🔍 Node Pengecekan Gejala / Pertanyaan">
                    {nodesList
                      .filter(
                        (n) => !n.hasil && n.id !== branchModal.parentId
                      )
                      .map((n) => (
                        <option key={n.id} value={n.id}>
                          🔍 [{n.id}]{" "}
                          {n.kode_gejala ? `${n.kode_gejala}: ` : ""}
                          {n.nama_gejala || n.id}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <Label htmlFor="preview_node_id" className="text-xs font-semibold">
                    ID Langkah / Node (Unik) <span className="text-red-500">*</span>
                  </Label>
                  <span className="text-[10px] text-pink-600 font-medium">
                    *Terisi otomatis
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    id="preview_node_id"
                    placeholder="Contoh: h01_g04_y"
                    value={branchFormData.id}
                    onChange={(e) =>
                      setBranchFormData((prev) => ({
                        ...prev,
                        id: e.target.value.trim(),
                      }))
                    }
                    className="h-8 text-xs font-mono"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap text-[11px] h-8 border-pink-200 hover:bg-pink-50 text-pink-700 font-medium"
                    onClick={() => {
                      const autoId = generateSmartIdForPreview(
                        branchFormData.gejala_id,
                        branchFormData.hasil,
                        `${branchModal.parentId}_${
                          branchModal.branchType === "ya" ? "y" : "t"
                        }`
                      );
                      setBranchFormData((prev) => ({ ...prev, id: autoId }));
                      toast.success(`ID disesuaikan: [${autoId}]`);
                    }}
                  >
                    ✨ Auto ID
                  </Button>
                </div>
              </div>

              <div className="space-y-1 bg-pink-50/50 p-2.5 rounded-lg border border-pink-100">
                <Label
                  htmlFor="preview_gejala"
                  className="text-xs font-semibold text-pink-950 flex items-center gap-1"
                >
                  <span>🔍</span> Hubungkan dengan Gejala (Pilih untuk Otomatis Isi Teks)
                </Label>
                <select
                  id="preview_gejala"
                  value={branchFormData.gejala_id}
                  onChange={(e) => handleBranchGejalaChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-pink-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-xs bg-white"
                >
                  <option value="">
                    -- Bukan Pengecekan Gejala (Direct Terminal Node / Hasil) --
                  </option>
                  {gejalaList.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.kode} - {g.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="preview_nama_gejala" className="text-xs font-semibold">
                  Teks Pertanyaan / Keterangan Langkah{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="preview_nama_gejala"
                  placeholder="Masukkan pertanyaan atau keterangan langkah"
                  value={branchFormData.nama_gejala}
                  onChange={(e) =>
                    setBranchFormData((prev) => ({
                      ...prev,
                      nama_gejala: e.target.value,
                    }))
                  }
                  className="h-8 text-xs"
                  required
                />
                <p className="text-[10px] text-gray-400">
                  💡 Terisi otomatis saat memilih gejala di atas, atau dapat diubah manual.
                </p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="preview_hasil" className="text-xs font-semibold">
                  Atau Tetapkan Sebagai Hasil Akhir Diagnosa (Terminal Node Baru)
                </Label>
                <select
                  id="preview_hasil"
                  value={branchFormData.hasil}
                  onChange={(e) => handleBranchHasilChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-xs bg-white"
                >
                  <option value="">
                    -- Bukan Hasil Akhir (Lanjut ke Pertanyaan Berikutnya) --
                  </option>
                  <optgroup label="🐛 Hasil Hama">
                    {penyakitList
                      .filter((p) => p.tipe === "hama" || p.id.startsWith("h"))
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.kode} - {p.nama}
                        </option>
                      ))}
                    <option value="hama_not_found">
                      Hama Tidak Teridentifikasi
                    </option>
                  </optgroup>
                  <optgroup label="🦠 Hasil Penyakit">
                    {penyakitList
                      .filter(
                        (p) => p.tipe === "penyakit" || p.id.startsWith("p")
                      )
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.kode} - {p.nama}
                        </option>
                      ))}
                    <option value="penyakit_not_found">
                      Penyakit Tidak Teridentifikasi
                    </option>
                  </optgroup>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="preview_deskripsi" className="text-xs font-semibold">
                  Deskripsi / Petunjuk Tambahan (Opsional)
                </Label>
                <Input
                  id="preview_deskripsi"
                  placeholder="Keterangan bantuan bagi petani"
                  value={branchFormData.deskripsi}
                  onChange={(e) =>
                    setBranchFormData((prev) => ({
                      ...prev,
                      deskripsi: e.target.value,
                    }))
                  }
                  className="h-8 text-xs"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setBranchModal(null)}
              disabled={savingBranch}
              className="h-8 text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={savingBranch}
              className="bg-pink-600 hover:bg-pink-700 text-white h-8 text-xs"
            >
              {savingBranch ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Menyimpan...
                </>
              ) : branchTargetMode === "existing" ? (
                "Simpan Sambungan Langsung"
              ) : (
                "Simpan Langkah Cabang Baru"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
