import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { insertPohonNode, updatePohonNode, deletePohonNode } from "@/services/supabaseService";
import type { Gejala, Penyakit } from "@/types";
import type { PohonNode } from "../KelolaPohonKeputusan";
import {
  getCoords,
  generateFallbackPositions,
  isNodeInTreeType,
  type PreviewNode,
  type PreviewEdge,
  type PreviewTreeType,
} from "./pohonPreviewHelpers";

import { PohonPreviewSidebar } from "./PohonPreviewSidebar";
import { PohonPreviewCanvas } from "./PohonPreviewCanvas";
import { PohonBranchModal } from "./PohonBranchModal";

/**
 * Antarmuka Props untuk Komponen PohonKeputusanPreview
 */
interface PohonKeputusanPreviewProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  nodesList: PohonNode[];
  gejalaList: Gejala[];
  penyakitList: Penyakit[];
  onEditNode: (node: PohonNode) => void;
  onAddBranchNode?: (parentId: string, branchType: "ya" | "tidak") => void;
  onRefreshData?: () => Promise<void>;
  loading: boolean;
}

/**
 * Komponen Utama: PohonKeputusanPreview (Clean Code Container)
 * Mengendalikan status state utama dan menggabungkan sub-komponen modular:
 * - PohonPreviewSidebar
 * - PohonPreviewCanvas
 * - PohonBranchModal
 */
export const PohonKeputusanPreview = ({
  isOpen,
  onOpenChange,
  nodesList,
  gejalaList,
  penyakitList,
  onEditNode,
  onAddBranchNode: _onAddBranchNode,
  onRefreshData,
  loading,
}: PohonKeputusanPreviewProps) => {
  // State Opsi Tampilan Tab Diagram ("hama", "penyakit", atau "gabungan")
  const [previewTreeType, setPreviewTreeType] = useState<PreviewTreeType>("hama");
  const previewCanvasRef = useRef<HTMLDivElement | null>(null);

  // State Kontrol Zoom, Pan, dan Sorot Interaktif
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const lastCenteredSearchIdRef = useRef<string | null>(null);

  // State Modal Form Tambah Cabang
  const [branchModal, setBranchModal] = useState<{
    isOpen: boolean;
    parentId: string;
    branchType: "ya" | "tidak";
  } | null>(null);

  const [branchFormData, setBranchFormData] = useState({
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

  const [branchTargetMode, setBranchTargetMode] = useState<"existing" | "new">("existing");
  const [selectedExistingTargetId, setSelectedExistingTargetId] = useState<string>("");

  const [savingBranch, setSavingBranch] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingNode, setDeletingNode] = useState(false);

  /**
   * Menghapus node dari canvas visual preview dan Supabase database.
   */
  const handleDeleteBranchNode = async (id: string) => {
    setDeletingNode(true);
    try {
      const referencingNodes = nodesList.filter(
        (n) => n.ya === id || n.tidak === id
      );
      for (const refNode of referencingNodes) {
        const updates: Record<string, any> = {};
        if (refNode.ya === id) updates.ya = null;
        if (refNode.tidak === id) updates.tidak = null;
        await updatePohonNode(refNode.id, updates);
      }

      await deletePohonNode(id);
      toast.success(`Node [${id}] berhasil dihapus`);

      if (onRefreshData) {
        await onRefreshData();
      }

      setSelectedNodeId(null);
      setDeleteConfirmId(null);
    } catch (err) {
      toast.error(`Gagal menghapus node [${id}]`);
      console.error(err);
    } finally {
      setDeletingNode(false);
    }
  };

  /**
   * Membersihkan sambungan jalur terputus (?)
   */
  const handleClearMissingLink = async (targetId: string) => {
    setDeletingNode(true);
    try {
      const referencingNodes = nodesList.filter(
        (n) => n.ya === targetId || n.tidak === targetId
      );
      for (const refNode of referencingNodes) {
        const updates: Record<string, any> = {};
        if (refNode.ya === targetId) updates.ya = null;
        if (refNode.tidak === targetId) updates.tidak = null;
        await updatePohonNode(refNode.id, updates);
      }

      toast.success(`Jalur terputus [${targetId}] berhasil dibersihkan!`);

      if (onRefreshData) {
        await onRefreshData();
      }

      setSelectedNodeId(null);
    } catch (err) {
      toast.error("Gagal membersihkan jalur terputus");
      console.error(err);
    } finally {
      setDeletingNode(false);
    }
  };

  /**
   * Membuka form pembuat node baru untuk menyambung target hilang.
   */
  const handleCreateMissingNode = (targetId: string) => {
    const parentNode = nodesList.find((n) => n.ya === targetId || n.tidak === targetId);
    const parentId = parentNode ? parentNode.id : "node";
    const branchType = parentNode?.ya === targetId ? "ya" : "tidak";

    setBranchFormData({
      id: targetId,
      gejala_id: "",
      kode_gejala: "",
      nama_gejala: "",
      deskripsi: "",
      ya: "",
      tidak: "",
      hasil: "",
      cf_pakar: 0.8,
    });

    setBranchModal({ isOpen: true, parentId, branchType });
  };

  /**
   * Generator ID otomatis bebas bentrok.
   */
  const generateSmartIdForPreview = useCallback(
    (gejalaId?: string, hasilVal?: string, customPrefix?: string) => {
      let basePrefix = customPrefix || "node";

      if (hasilVal) {
        const pMatch = penyakitList.find((p) => p.id === hasilVal);
        basePrefix = pMatch ? `${pMatch.id}_confirmed` : `${hasilVal}_confirmed`;
      } else if (gejalaId) {
        const gMatch = gejalaList.find((g) => g.id === gejalaId);
        if (gMatch) {
          basePrefix = `node_${gMatch.kode.toLowerCase()}`;
        }
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
    [nodesList, gejalaList, penyakitList]
  );

  /**
   * Membuka modal tambah cabang baru.
   */
  const handleOpenAddBranchModal = (parentId: string, branchType: "ya" | "tidak") => {
    const parentPrefix = parentId.replace(/^(node_|g_?)/i, "");
    const branchSuffix = branchType === "ya" ? "y" : "t";

    const defaultId = generateSmartIdForPreview(
      undefined,
      undefined,
      `${parentPrefix}_${branchSuffix}`
    );

    setBranchTargetMode("existing");
    setSelectedExistingTargetId("");

    setBranchFormData({
      id: defaultId,
      gejala_id: "",
      kode_gejala: "",
      nama_gejala: "",
      deskripsi: "",
      ya: "",
      tidak: "",
      hasil: "",
      cf_pakar: 0.8,
    });

    setBranchModal({ isOpen: true, parentId, branchType });
  };

  const handleBranchGejalaChange = (gejalaId: string) => {
    if (!gejalaId) {
      setBranchFormData((prev) => ({
        ...prev,
        gejala_id: "",
        kode_gejala: "",
        nama_gejala: "",
      }));
      return;
    }

    const selectedGejala = gejalaList.find((g) => g.id === gejalaId);
    if (selectedGejala) {
      const autoId = generateSmartIdForPreview(selectedGejala.id, undefined);
      setBranchFormData((prev) => ({
        ...prev,
        id: autoId,
        gejala_id: selectedGejala.id,
        kode_gejala: selectedGejala.kode,
        nama_gejala: selectedGejala.nama,
        cf_pakar: selectedGejala.cf_pakar,
      }));
    }
  };

  const handleBranchHasilChange = (hasilVal: string) => {
    if (!hasilVal) {
      setBranchFormData((prev) => ({ ...prev, hasil: "" }));
      return;
    }

    const selectedPenyakit = penyakitList.find((p) => p.id === hasilVal);
    const autoId = generateSmartIdForPreview(undefined, hasilVal);
    setBranchFormData((prev) => ({
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
    }));
  };

  /**
   * Menyimpan cabang baru / sambungan node ke Supabase.
   */
  const handleSaveBranchNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchModal) return;

    setSavingBranch(true);
    try {
      if (branchTargetMode === "existing") {
        if (!selectedExistingTargetId) {
          toast.error("Silakan pilih target node atau hasil akhir yang ingin dihubungkan!");
          setSavingBranch(false);
          return;
        }

        const { parentId, branchType } = branchModal;
        await updatePohonNode(parentId, { [branchType]: selectedExistingTargetId });

        toast.success(
          `Cabang ${branchType.toUpperCase()} pada [${parentId}] berhasil dihubungkan LANGSUNG ke [${selectedExistingTargetId}]!`
        );

        if (onRefreshData) {
          await onRefreshData();
        }

        setSelectedNodeId(selectedExistingTargetId);
        setBranchModal(null);
      } else {
        let targetId = branchFormData.id.trim();
        if (!targetId) {
          targetId = generateSmartIdForPreview(branchFormData.gejala_id, branchFormData.hasil);
        }

        if (nodesList.some((n) => n.id === targetId)) {
          let counter = 1;
          let resolved = `${targetId}_${counter}`;
          while (nodesList.some((n) => n.id === resolved)) {
            counter++;
            resolved = `${targetId}_${counter}`;
          }
          toast.info(`ID disesuaikan otomatis menjadi [${resolved}] agar tidak bentrok.`);
          targetId = resolved;
        }

        const matchedGejala = branchFormData.gejala_id
          ? gejalaList.find((g) => g.id === branchFormData.gejala_id)
          : null;
        const finalCfPakar = matchedGejala
          ? matchedGejala.cf_pakar
          : parseFloat(String(branchFormData.cf_pakar)) || 0;

        const payload = {
          id: targetId,
          gejala_id: branchFormData.gejala_id || null,
          kode_gejala: branchFormData.kode_gejala || null,
          nama_gejala: branchFormData.nama_gejala || null,
          deskripsi: branchFormData.deskripsi || null,
          ya: branchFormData.ya || null,
          tidak: branchFormData.tidak || null,
          hasil: branchFormData.hasil || null,
          cf_pakar: finalCfPakar,
        };

        const inserted = await insertPohonNode(payload);
        const { parentId, branchType } = branchModal;
        await updatePohonNode(parentId, { [branchType]: inserted.id });

        toast.success(
          `Node [${inserted.id}] berhasil dibuat & otomatis dihubungkan ke cabang ${branchType.toUpperCase()} pada [${parentId}]!`
        );

        if (onRefreshData) {
          await onRefreshData();
        }

        setSelectedNodeId(inserted.id);
        setBranchModal(null);
      }
    } catch (err) {
      toast.error("Gagal menyimpan sambungan cabang");
      console.error(err);
    } finally {
      setSavingBranch(false);
    }
  };

  /**
   * Mengatur ulang perbesaran (zoom) dan pergeseran canvas (pan) ke posisi ideal.
   */
  const handleResetZoom = useCallback(() => {
    const containerWidth = previewCanvasRef.current?.clientWidth || 800;
    const containerHeight = previewCanvasRef.current?.clientHeight || 600;

    let initialZoom = 0.85;
    let initialPanX = 40;
    let initialPanY = 80;

    if (previewTreeType === "gabungan") {
      initialZoom = Math.max(0.35, Math.min(0.55, (containerWidth / 5800) * 2.2));
      initialPanX = Math.round(containerWidth / 2 - 2750 * initialZoom);
      initialPanY = Math.round(containerHeight / 2 - 400 * initialZoom);
    } else if (previewTreeType === "hama") {
      initialZoom = Math.max(0.55, Math.min(0.85, (containerWidth / 3100) * 2.2));
      initialPanX = Math.round(containerWidth / 2 - 750 * initialZoom);
      initialPanY = 80;
    } else {
      initialZoom = Math.max(0.55, Math.min(0.85, (containerWidth / 2700) * 2.2));
      initialPanX = Math.round(containerWidth / 2 - 750 * initialZoom);
      initialPanY = 80;
    }

    setZoom(initialZoom);
    setPan({ x: initialPanX, y: initialPanY });
  }, [previewTreeType]);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      lastCenteredSearchIdRef.current = null;
      const timer = setTimeout(() => {
        handleResetZoom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, previewTreeType, handleResetZoom]);

  /**
   * Gesture Zoom Mouse Wheel terpusat pada kursor.
   */
  const handleWheelNative = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const zoomFactor = 1.15;

    setZoom((prevZoom) => {
      const newZoom = Math.max(
        0.08,
        Math.min(4, e.deltaY < 0 ? prevZoom * zoomFactor : prevZoom / zoomFactor)
      );

      setPan((prevPan) => {
        const contentX = (mouseX - prevPan.x) / prevZoom;
        const contentY = (mouseY - prevPan.y) / prevZoom;
        return {
          x: mouseX - contentX * newZoom,
          y: mouseY - contentY * newZoom,
        };
      });

      return newZoom;
    });
  }, []);

  const setCanvasRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (previewCanvasRef.current) {
        previewCanvasRef.current.removeEventListener("wheel", handleWheelNative);
      }
      previewCanvasRef.current = node;
      if (node) {
        node.addEventListener("wheel", handleWheelNative, { passive: false });
      }
    },
    [handleWheelNative]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as SVGElement;
    if (target.closest(".interactive-node")) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const zoomIn = () => setZoom((z) => Math.min(4, z * 1.2));
  const zoomOut = () => setZoom((z) => Math.max(0.08, z * 0.8));



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

  const getNodeTypeLabel = useCallback(
    (nodeId: string): string => {
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
    },
    [penyakitList]
  );

  const previewStats = useMemo(() => {
    const activeNodes = nodesList.filter((node) =>
      isNodeInTreeType(node, previewTreeType, nodesList, penyakitList)
    );

    const activeIds = new Set(activeNodes.map((n) => n.id));
    let questionCount = 0;
    let resultCount = 0;
    let brokenTargets = 0;

    activeNodes.forEach((node) => {
      if (node.hasil) resultCount++;
      else questionCount++;

      if (node.ya && !activeIds.has(node.ya) && !nodesList.some((n) => n.id === node.ya))
        brokenTargets++;
      if (node.tidak && !activeIds.has(node.tidak) && !nodesList.some((n) => n.id === node.tidak))
        brokenTargets++;
    });

    return { questionCount, resultCount, brokenTargets };
  }, [nodesList, previewTreeType, penyakitList]);

  const treePreview = useMemo(() => {
    const previewNodes: PreviewNode[] = [];
    const previewEdges: PreviewEdge[] = [];

    const activeNodes = nodesList.filter((node) =>
      isNodeInTreeType(node, previewTreeType, nodesList, penyakitList)
    );

    const activeIds = new Set(activeNodes.map((node) => node.id));
    const positionsMap = generateFallbackPositions(nodesList);

    const getCoordsLocal = (nodeId: string) => {
      return getCoords(nodeId, previewTreeType, positionsMap);
    };

    const getPreviewCode = (node: PohonNode) => {
      if (node.kode_gejala) return node.kode_gejala;
      if (node.id === "root") return "G00";
      if (node.id === "hama_group") return "HAMA";
      if (node.id === "penyakit_group") return "PENYAKIT";
      return node.id.toUpperCase().slice(0, 6);
    };

    const getPreviewSubtitle = (node: PohonNode) => {
      if (node.hasil) {
        const penyakit = penyakitList.find((item) => item.id === node.hasil);
        if (penyakit) return penyakit.nama;
        if (node.hasil === "hama_not_found") return "Hama tidak teridentifikasi";
        if (node.hasil === "penyakit_not_found")
          return "Penyakit tidak teridentifikasi";
        return node.hasil;
      }
      return node.nama_gejala || getNodeTypeLabel(node.id);
    };

    activeNodes.forEach((node) => {
      const coords = getCoordsLocal(node.id);
      previewNodes.push({
        key: node.id,
        id: node.id,
        code: getPreviewCode(node),
        subtitle: getPreviewSubtitle(node),
        x: coords.x,
        y: coords.y,
        kind: node.hasil ? "result" : "question",
      });
    });

    const missingNodesMap = new Map<string, PreviewNode>();

    activeNodes.forEach((node) => {
      const fromKey = node.id;
      const fromCoords = getCoordsLocal(node.id);

      const handleTarget = (targetId: string | null, label: "Y" | "T") => {
        if (!targetId) return;

        if (activeIds.has(targetId)) {
          previewEdges.push({
            fromKey,
            toKey: targetId,
            label,
          });
        } else if (!nodesList.some((n) => n.id === targetId)) {
          let missingNode = missingNodesMap.get(targetId);
          if (!missingNode) {
            let mCoords = positionsMap[targetId];
            if (mCoords) {
              mCoords = getCoords(targetId, previewTreeType, positionsMap);
            } else {
              mCoords = {
                x: fromCoords.x + (label === "Y" ? -100 : 100),
                y: fromCoords.y + 100,
              };
            }

            const mKey = `missing-${targetId}-${previewNodes.length}`;
            missingNode = {
              key: mKey,
              id: targetId,
              code: "?",
              subtitle: `Target ${targetId} tidak ditemukan`,
              x: mCoords.x,
              y: mCoords.y,
              kind: "missing",
            };
            missingNodesMap.set(targetId, missingNode);
            previewNodes.push(missingNode);
          }

          previewEdges.push({
            fromKey,
            toKey: missingNode.key,
            label,
          });
        }
      };

      handleTarget(node.ya, "Y");
      handleTarget(node.tidak, "T");
    });

    return { nodes: previewNodes, edges: previewEdges };
  }, [nodesList, previewTreeType, penyakitList, getNodeTypeLabel]);

  const searchMatch = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.trim().toLowerCase();
    return treePreview.nodes.find((n) => {
      return (
        n.id.toLowerCase() === q ||
        n.code.toLowerCase() === q ||
        n.subtitle.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, treePreview.nodes]);

  useEffect(() => {
    if (searchMatch && lastCenteredSearchIdRef.current !== searchMatch.id) {
      setSelectedNodeId(searchMatch.id);
      lastCenteredSearchIdRef.current = searchMatch.id;

      const containerWidth = previewCanvasRef.current?.clientWidth || 800;
      const containerHeight = previewCanvasRef.current?.clientHeight || 600;
      setPan({
        x: Math.round(containerWidth / 2 - searchMatch.x * zoom),
        y: Math.round(containerHeight / 2 - searchMatch.y * zoom),
      });
    } else if (!searchMatch) {
      lastCenteredSearchIdRef.current = null;
    }
  }, [searchMatch, zoom]);

  const highlightedElements = useMemo(() => {
    const nodes = new Set<string>();
    const edges = new Set<string>();

    const activeNodeId =
      hoveredNodeId || selectedNodeId || (searchMatch ? searchMatch.id : "");
    if (!activeNodeId) {
      return { nodes, edges };
    }

    const activePreviewNode = treePreview.nodes.find(
      (n) => n.key === activeNodeId || n.id === activeNodeId
    );
    if (!activePreviewNode) return { nodes, edges };

    const queue = [activePreviewNode.id];
    nodes.add(activePreviewNode.id);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      nodesList.forEach((n) => {
        if (n.ya === currentId || n.tidak === currentId) {
          if (!nodes.has(n.id)) {
            nodes.add(n.id);
            edges.add(`${n.id}-${currentId}`);
            queue.push(n.id);
          }
        }
      });
    }

    return { nodes, edges };
  }, [hoveredNodeId, selectedNodeId, searchMatch, nodesList, treePreview.nodes]);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    const pNode = treePreview.nodes.find((n) => n.id === selectedNodeId);
    if (!pNode) return null;

    const dbNode = nodesList.find((n) => n.id === pNode.id);
    if (dbNode) return { ...dbNode, isMissing: false };

    return {
      id: pNode.id,
      gejala_id: null,
      kode_gejala: null,
      nama_gejala: pNode.subtitle,
      deskripsi: null,
      ya: null,
      tidak: null,
      hasil: null,
      cf_pakar: 0,
      subtitle: pNode.subtitle,
      isMissing: true,
    } as any;
  }, [selectedNodeId, treePreview.nodes, nodesList]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          setSelectedNodeId(null);
          setHoveredNodeId(null);
        }
      }}
    >
      <DialogContent className="max-w-[98vw] sm:max-w-[98vw] w-[98vw] h-[95vh] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Preview Pohon Keputusan</DialogTitle>
        </DialogHeader>
        <div className="grid h-full grid-cols-1 lg:grid-cols-[350px_1fr] bg-white">
          {/* Sub-Komponen 1: Sidebar Kiri */}
          <PohonPreviewSidebar
            previewTreeType={previewTreeType}
            setPreviewTreeType={setPreviewTreeType}
            setSelectedNodeId={setSelectedNodeId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            previewStats={previewStats}
            selectedNode={selectedNode}
            nodesList={nodesList}
            getNodeLabel={getNodeLabel}
            onOpenChange={onOpenChange}
            onEditNode={onEditNode}
            setDeleteConfirmId={setDeleteConfirmId}
            handleOpenAddBranchModal={handleOpenAddBranchModal}
            handleCreateMissingNode={handleCreateMissingNode}
            handleClearMissingLink={handleClearMissingLink}
            deletingNode={deletingNode}
          />

          {/* Sub-Komponen 2: Interactive SVG Canvas */}
          <PohonPreviewCanvas
            setCanvasRef={setCanvasRef}
            pan={pan}
            zoom={zoom}
            loading={loading}
            treePreview={treePreview}
            highlightedElements={highlightedElements}
            hoveredNodeId={hoveredNodeId}
            setHoveredNodeId={setHoveredNodeId}
            selectedNodeId={selectedNodeId}
            setSelectedNodeId={setSelectedNodeId}
            handleMouseDown={handleMouseDown}
            handleMouseMove={handleMouseMove}
            handleMouseUp={handleMouseUp}
            zoomIn={zoomIn}
            zoomOut={zoomOut}
            handleResetZoom={handleResetZoom}
          />
        </div>

        {/* Sub-Komponen 3: Form Modal Tambah Cabang */}
        <PohonBranchModal
          branchModal={branchModal}
          setBranchModal={setBranchModal}
          branchTargetMode={branchTargetMode}
          setBranchTargetMode={setBranchTargetMode}
          selectedExistingTargetId={selectedExistingTargetId}
          setSelectedExistingTargetId={setSelectedExistingTargetId}
          branchFormData={branchFormData}
          setBranchFormData={setBranchFormData}
          nodesList={nodesList}
          gejalaList={gejalaList}
          penyakitList={penyakitList}
          savingBranch={savingBranch}
          handleSaveBranchNode={handleSaveBranchNode}
          handleBranchGejalaChange={handleBranchGejalaChange}
          handleBranchHasilChange={handleBranchHasilChange}
          generateSmartIdForPreview={generateSmartIdForPreview}
        />

        {/* Dialog Konfirmasi Penghapusan Node */}
        <AlertDialog
          open={!!deleteConfirmId}
          onOpenChange={(open) => {
            if (!open) setDeleteConfirmId(null);
          }}
        >
          <AlertDialogContent className="z-[99999]">
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Langkah Pohon Keputusan?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus node{" "}
                <strong className="text-red-600 font-mono">[{deleteConfirmId}]</strong>?
                Node ini dan referensi jalurnya di diagram akan dihapus secara permanen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deletingNode}>Batal</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  if (deleteConfirmId) handleDeleteBranchNode(deleteConfirmId);
                }}
                disabled={deletingNode}
              >
                {deletingNode ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-1" /> Ya, Hapus Node Ini
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};
