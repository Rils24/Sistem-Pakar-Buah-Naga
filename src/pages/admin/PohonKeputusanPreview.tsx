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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Edit, Download, Plus, Trash2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { insertPohonNode, updatePohonNode, deletePohonNode } from "@/services/supabaseService";
import type { Gejala, Penyakit } from "@/types";
import type { PohonNode } from "./KelolaPohonKeputusan";

// Interfaces for preview tree mapping
interface PreviewNode {
  key: string;
  id: string;
  code: string;
  subtitle: string;
  x: number;
  y: number;
  kind: "question" | "result" | "missing";
}

interface PreviewEdge {
  fromKey: string;
  toKey: string;
  label: "Y" | "T";
}

type PreviewTreeType = "hama" | "penyakit" | "gabungan";

interface PohonKeputusanPreviewProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  nodesList: PohonNode[];
  gejalaList: Gejala[];
  penyakitList: Penyakit[];
  onEditNode: (node: PohonNode) => void;
  onAddBranchNode?: (parentId: string, branchType: 'ya' | 'tidak') => void;
  onRefreshData?: () => Promise<void>;
  loading: boolean;
}

const STATIC_NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  // ROOT & GROUPS
  "root": { x: 1500, y: 50 },
  "hama_group": { x: 750, y: 150 },
  "penyakit_group": { x: 2250, y: 150 },

  // === HAMA COLUMNS ===
  // H01: Kutu Putih (Col 0, X-Center: 350)
  "h01_check": { x: 300, y: 250 },
  "h01_g02": { x: 220, y: 350 },
  "h01_g03_y": { x: 140, y: 450 },
  "h01_g03_t": { x: 300, y: 450 },
  "h01_g04_y": { x: 80, y: 550 },
  "h01_g04_t": { x: 200, y: 550 },
  "h01_g04_tr": { x: 400, y: 550 },
  "h01_g05": { x: 60, y: 650 },
  "h01_g06": { x: 60, y: 750 },
  "h01_confirmed": { x: 220, y: 850 },

  // H02: Aphids (Col 1, X-Center: 750)
  "h02_check": { x: 700, y: 250 },
  "h02_g08": { x: 620, y: 350 },
  "h02_g09_y": { x: 540, y: 450 },
  "h02_g09_t": { x: 700, y: 450 },
  "h02_g10": { x: 480, y: 550 },
  "h02_g10_t": { x: 620, y: 550 },
  "h02_g11": { x: 480, y: 650 },
  "h02_confirmed": { x: 620, y: 750 },

  // H03: Kutu Sisik (Col 2, X-Center: 1100)
  "h03_check": { x: 1100, y: 250 },
  "h03_g13": { x: 1020, y: 350 },
  "h03_g14_y": { x: 940, y: 450 },
  "h03_g14_t": { x: 1100, y: 450 },
  "h03_g15": { x: 880, y: 550 },
  "h03_g15_t": { x: 1020, y: 550 },
  "h03_confirmed": { x: 1020, y: 650 },

  // H04: Lalat Buah (Col 3, X-Center: 1500)
  "h04_check": { x: 1500, y: 250 },
  "h04_g17": { x: 1420, y: 350 },
  "h04_g18_y": { x: 1340, y: 450 },
  "h04_g18_t": { x: 1500, y: 450 },
  "h04_g19_y": { x: 1260, y: 550 },
  "h04_g19_t": { x: 1420, y: 550 },
  "h04_g19_tr": { x: 1580, y: 550 },
  "h04_g20": { x: 1260, y: 650 },
  "h04_confirmed": { x: 1420, y: 750 },

  // H05: Bekicot (Col 4, X-Center: 1900)
  "h05_check": { x: 1900, y: 250 },
  "h05_g22": { x: 1820, y: 350 },
  "h05_g23_y": { x: 1740, y: 450 },
  "h05_g23_t": { x: 1900, y: 450 },
  "h05_g24": { x: 1740, y: 550 },
  "h05_g25": { x: 1740, y: 650 },
  "h05_g26": { x: 1740, y: 750 },
  "h05_confirmed": { x: 1820, y: 850 },

  // H06: Belalang (Col 5, X-Center: 2300)
  "h06_check": { x: 2300, y: 250 },
  "h06_g28": { x: 2220, y: 350 },
  "h06_g29_y": { x: 2140, y: 450 },
  "h06_g29_t": { x: 2300, y: 450 },
  "h06_g30": { x: 2060, y: 550 },
  "h06_g30_t": { x: 2220, y: 550 },
  "h06_g31": { x: 2060, y: 650 },
  "h06_confirmed": { x: 2220, y: 750 },

  // H07: Tungau (Col 6, X-Center: 2700)
  "h07_check": { x: 2700, y: 250 },
  "h07_g33": { x: 2620, y: 350 },
  "h07_g34_y": { x: 2540, y: 450 },
  "h07_g34_t": { x: 2700, y: 450 },
  "h07_g35_y": { x: 2460, y: 550 },
  "h07_g35_t": { x: 2620, y: 550 },
  "h07_g35_tr": { x: 2780, y: 550 },
  "h07_g36": { x: 2460, y: 650 },
  "h07_g37": { x: 2460, y: 750 },
  "h07_confirmed": { x: 2620, y: 850 },
  
  "hama_not_found": { x: 2880, y: 350 },

  // === PENYAKIT COLUMNS ===
  // P01: Kanker Batang (Col 0, X-Center: 300)
  "p01_check": { x: 300, y: 250 },
  "p01_g39": { x: 300, y: 350 },
  "p01_g40_y": { x: 220, y: 450 },
  "p01_g40_t": { x: 380, y: 450 },
  "p01_g41": { x: 220, y: 550 },
  "p01_g42": { x: 220, y: 650 },
  "p01_g43": { x: 220, y: 750 },
  "p01_g44": { x: 220, y: 850 },
  "p01_confirmed": { x: 300, y: 950 },

  // P02: Antraknosa (Col 1, X-Center: 700)
  "p02_check": { x: 700, y: 250 },
  "p02_g46": { x: 620, y: 350 },
  "p02_g47_y": { x: 540, y: 450 },
  "p02_g47_t": { x: 700, y: 450 },
  "p02_g48": { x: 540, y: 550 },
  "p02_g49": { x: 540, y: 650 },
  "p02_confirmed": { x: 620, y: 750 },

  // P03: Busuk Batang (Col 2, X-Center: 1100)
  "p03_check": { x: 1100, y: 250 },
  "p03_g51": { x: 1100, y: 350 },
  "p03_g52_y": { x: 1000, y: 450 },
  "p03_g52_t": { x: 1200, y: 450 },
  "p03_g53": { x: 1000, y: 550 },
  "p03_g54": { x: 1000, y: 650 },
  "p03_g55": { x: 1000, y: 750 },
  "p03_g56": { x: 1000, y: 850 },
  "p03_g57": { x: 1000, y: 950 },
  "p03_g58": { x: 1000, y: 1050 },
  "p03_g59": { x: 1000, y: 1150 },
  "p03_g60": { x: 1000, y: 1250 },
  "p03_g61": { x: 1000, y: 1350 },
  "p03_confirmed": { x: 1100, y: 1450 },

  // P04: Kudis (Col 3, X-Center: 1500)
  "p04_check": { x: 1500, y: 250 },
  "p04_g63": { x: 1420, y: 350 },
  "p04_g64_y": { x: 1340, y: 450 },
  "p04_g64_t": { x: 1500, y: 450 },
  "p04_g65": { x: 1340, y: 550 },
  "p04_g66": { x: 1340, y: 650 },
  "p04_confirmed": { x: 1420, y: 750 },

  // P05: Mosaik (Col 4, X-Center: 1900)
  "p05_check": { x: 1900, y: 250 },
  "p05_g68": { x: 1820, y: 350 },
  "p05_g69_y": { x: 1740, y: 450 },
  "p05_g69_t": { x: 1900, y: 450 },
  "p05_g70": { x: 1740, y: 550 },
  "p05_g71": { x: 1740, y: 650 },
  "p05_confirmed": { x: 1820, y: 750 },

  // P06: Puru Akar (Col 5, X-Center: 2300)
  "p06_check": { x: 2300, y: 250 },
  "p06_g73": { x: 2220, y: 350 },
  "p06_g74_y": { x: 2140, y: 450 },
  "p06_g74_t": { x: 2300, y: 450 },
  "p06_g75": { x: 2140, y: 550 },
  "p06_g76": { x: 2140, y: 650 },
  "p06_confirmed": { x: 2220, y: 750 },
  
  "penyakit_not_found": { x: 2480, y: 350 }
};

const getCoords = (
  nodeId: string,
  treeType: PreviewTreeType,
  currentPositions: Record<string, { x: number; y: number }>
) => {
  const pos = currentPositions[nodeId];
  if (!pos) return { x: 0, y: 0 };
  
  // In combined view, offset all penyakit nodes horizontally to prevent overlap
  if (treeType === 'gabungan' && (nodeId.startsWith('p0') || nodeId === 'penyakit_group' || nodeId === 'penyakit_not_found')) {
    return {
      x: pos.x + 2800,
      y: pos.y
    };
  }
  
  // Shift root and groups slightly in single-tree views for aesthetic layout
  if (treeType === 'hama') {
    if (nodeId === 'root') return { x: 300, y: 50 };
    if (nodeId === 'hama_group') return { x: 300, y: 150 };
  }
  if (treeType === 'penyakit') {
    if (nodeId === 'root') return { x: 300, y: 50 };
    if (nodeId === 'penyakit_group') return { x: 300, y: 150 };
  }

  return pos;
};

const generateFallbackPositions = (nodes: PohonNode[]) => {
  const positions: Record<string, { x: number; y: number }> = { ...STATIC_NODE_POSITIONS };
  if (!nodes || nodes.length === 0) return positions;

  // 1. Group nodes dynamically
  const groups: Record<string, PohonNode[]> = {};
  
  // Helper to resolve group key for a node
  const resolveGroupKey = (node: PohonNode, visited = new Set<string>()): string => {
    if (visited.has(node.id)) return "other";
    visited.add(node.id);

    // Direct match h01..h07 or p01..p06
    const match = node.id.match(/^([hp]\d{2})/i);
    if (match) return match[1].toLowerCase();

    // Check kode_gejala e.g. G25 -> H05 range
    if (node.kode_gejala) {
      const gNum = parseInt(node.kode_gejala.replace(/\D/g, ""), 10);
      if (gNum >= 1 && gNum <= 6) return "h01";
      if (gNum >= 7 && gNum <= 12) return "h02";
      if (gNum >= 13 && gNum <= 16) return "h03";
      if (gNum >= 17 && gNum <= 21) return "h04";
      if (gNum >= 22 && gNum <= 27) return "h05";
      if (gNum >= 28 && gNum <= 32) return "h06";
      if (gNum >= 33 && gNum <= 38) return "h07";
      if (gNum >= 39 && gNum <= 45) return "p01";
      if (gNum >= 46 && gNum <= 50) return "p02";
      if (gNum >= 51 && gNum <= 62) return "p03";
      if (gNum >= 63 && gNum <= 67) return "p04";
      if (gNum >= 68 && gNum <= 72) return "p05";
      if (gNum >= 73 && gNum <= 78) return "p06";
    }

    // Trace parent node
    const parentNode = nodes.find((p) => p.ya === node.id || p.tidak === node.id);
    if (parentNode) {
      return resolveGroupKey(parentNode, visited);
    }

    // Trace child node
    if (node.ya) {
      const childNode = nodes.find((c) => c.id === node.ya);
      if (childNode) return resolveGroupKey(childNode, visited);
    }
    if (node.tidak) {
      const childNode = nodes.find((c) => c.id === node.tidak);
      if (childNode) return resolveGroupKey(childNode, visited);
    }

    return "other";
  };

  nodes.forEach((n) => {
    if (n.id === "root" || n.id === "hama_group" || n.id === "penyakit_group") return;
    const grpKey = resolveGroupKey(n);
    if (!groups[grpKey]) groups[grpKey] = [];
    groups[grpKey].push(n);
  });

  // Calculate layout coordinates for each group
  Object.keys(groups).forEach((grpKey) => {
    const grpNodes = groups[grpKey];
    let columnCenterX = 300;

    if (grpKey.startsWith("h")) {
      const idx = parseInt(grpKey.substring(1), 10) || 1;
      columnCenterX = (idx - 1) * 400 + 300;
    } else if (grpKey.startsWith("p")) {
      const idx = parseInt(grpKey.substring(1), 10) || 1;
      columnCenterX = (idx - 1) * 400 + 300;
    }

    // BFS starting from top node of group
    let startNode = grpNodes.find((n) => n.id.endsWith("_check"));
    if (!startNode) {
      const targetIds = new Set(grpNodes.flatMap((n) => [n.ya, n.tidak].filter(Boolean)));
      startNode = grpNodes.find((n) => !targetIds.has(n.id)) || grpNodes[0];
    }

    if (startNode) {
      const queue: Array<{ id: string; depth: number; offset: number }> = [
        { id: startNode.id, depth: 0, offset: 0 },
      ];
      const visited = new Set<string>();

      while (queue.length > 0) {
        const curr = queue.shift()!;
        if (visited.has(curr.id)) continue;
        visited.add(curr.id);

        const nodeObj = grpNodes.find((n) => n.id === curr.id) || nodes.find((n) => n.id === curr.id);

        if (!positions[curr.id]) {
          const calculatedX = columnCenterX + curr.offset * 85;
          const calculatedY = 250 + curr.depth * 100;
          positions[curr.id] = { x: calculatedX, y: calculatedY };
        }

        if (nodeObj) {
          if (nodeObj.ya && grpNodes.some((n) => n.id === nodeObj.ya)) {
            queue.push({ id: nodeObj.ya, depth: curr.depth + 1, offset: curr.offset - 0.7 });
          }
          if (nodeObj.tidak && grpNodes.some((n) => n.id === nodeObj.tidak)) {
            queue.push({ id: nodeObj.tidak, depth: curr.depth + 1, offset: curr.offset + 0.7 });
          }
        }
      }
    }

    // Position remaining orphan nodes relative to parent
    grpNodes.forEach((n) => {
      if (!positions[n.id]) {
        const parent = grpNodes.find((p) => p.ya === n.id || p.tidak === n.id) || nodes.find((p) => p.ya === n.id || p.tidak === n.id);
        if (parent && positions[parent.id]) {
          const isTidak = parent.tidak === n.id;
          positions[n.id] = {
            x: positions[parent.id].x + (isTidak ? 85 : -85),
            y: positions[parent.id].y + 100,
          };
        } else {
          positions[n.id] = { x: columnCenterX, y: 750 };
        }
      }
    });
  });

  // Catch-all for any unassigned node in nodes list
  nodes.forEach((n) => {
    if (!positions[n.id]) {
      const parent = nodes.find((p) => p.ya === n.id || p.tidak === n.id);
      if (parent && positions[parent.id]) {
        const isTidak = parent.tidak === n.id;
        positions[n.id] = {
          x: positions[parent.id].x + (isTidak ? 85 : -85),
          y: positions[parent.id].y + 100,
        };
      } else {
        positions[n.id] = { x: 300, y: 450 };
      }
    }
  });

  return positions;
};

const isNodeInTreeType = (
  node: PohonNode,
  treeType: PreviewTreeType,
  nodesList: PohonNode[],
  penyakitList: any[]
): boolean => {
  if (treeType === "gabungan") return true;

  if (node.id === "root") return true;

  // Header groups & not_found nodes
  if (treeType === "hama") {
    if (node.id === "hama_group" || node.id === "hama_not_found") return true;
    if (node.id === "penyakit_group" || node.id === "penyakit_not_found") return false;
  }
  if (treeType === "penyakit") {
    if (node.id === "penyakit_group" || node.id === "penyakit_not_found") return true;
    if (node.id === "hama_group" || node.id === "hama_not_found") return false;
  }

  // Direct ID prefix match (h01..h07 is HAMA only, p01..p06 is PENYAKIT only)
  const idLower = node.id.toLowerCase();
  if (idLower.startsWith("h")) return treeType === "hama";
  if (idLower.startsWith("p")) return treeType === "penyakit";

  // Terminal node disease match
  if (node.hasil) {
    if (node.hasil === "hama_not_found") return treeType === "hama";
    if (node.hasil === "penyakit_not_found") return treeType === "penyakit";
    const matchedPenyakit = penyakitList.find((p) => p.id === node.hasil);
    if (matchedPenyakit) {
      if (matchedPenyakit.tipe === "hama" || matchedPenyakit.id.startsWith("h")) {
        return treeType === "hama";
      }
      if (matchedPenyakit.tipe === "penyakit" || matchedPenyakit.id.startsWith("p")) {
        return treeType === "penyakit";
      }
    }
  }

  // Symptom code range match (G01-G38 Hama, G39-G78 Penyakit)
  if (node.kode_gejala) {
    const gNum = parseInt(node.kode_gejala.replace(/\D/g, ""), 10);
    if (!isNaN(gNum)) {
      if (gNum >= 1 && gNum <= 38) return treeType === "hama";
      if (gNum >= 39 && gNum <= 78) return treeType === "penyakit";
    }
  }

  // Parent ancestor tracing (only upwards to avoid crossing branches via root)
  const targetPrefix = treeType === "hama" ? "h" : "p";
  const forbiddenPrefix = treeType === "hama" ? "p" : "h";
  const visited = new Set<string>();

  const isAncestorConnected = (currId: string): boolean => {
    if (visited.has(currId)) return false;
    visited.add(currId);

    const currLower = currId.toLowerCase();
    if (currLower.startsWith(targetPrefix)) return true;
    if (currLower.startsWith(forbiddenPrefix) || currId === "root") return false;

    const parents = nodesList.filter((p) => p.ya === currId || p.tidak === currId);
    for (const p of parents) {
      if (isAncestorConnected(p.id)) return true;
    }

    return false;
  };

  return isAncestorConnected(node.id);
};

export const PohonKeputusanPreview = ({
  isOpen,
  onOpenChange,
  nodesList,
  gejalaList,
  penyakitList,
  onEditNode,
  onAddBranchNode: _onAddBranchNode,
  onRefreshData,
  loading
}: PohonKeputusanPreviewProps) => {
  const [previewTreeType, setPreviewTreeType] = useState<PreviewTreeType>("hama");
  const previewCanvasRef = useRef<HTMLDivElement | null>(null);

  // Zoom & Pan & Highlight States for Preview
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const lastCenteredSearchIdRef = useRef<string | null>(null);

  // State Modal Tambah Cabang Langsung di Preview
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

  const handleDeleteBranchNode = async (id: string) => {
    setDeletingNode(true);
    try {
      // 1. TERLEBIH DAHULU: Putus/bersihkan referensi pada node-node induk yang mengarah ke ID ini
      const referencingNodes = nodesList.filter(
        (n) => n.ya === id || n.tidak === id
      );
      for (const refNode of referencingNodes) {
        const updates: Record<string, any> = {};
        if (refNode.ya === id) updates.ya = null;
        if (refNode.tidak === id) updates.tidak = null;
        await updatePohonNode(refNode.id, updates);
      }

      // 2. KEMUDIAN: Hapus node itu sendiri dari database
      await deletePohonNode(id);

      toast.success(`Node [${id}] berhasil dihapus`);

      // 3. Refresh data induk secara otomatis
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

  // Handler untuk membersihkan jalur terputus (missing target ?)
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

  // Handler untuk buat node baru langsung mengisi ID missing target
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

  // Helper Auto ID Unik untuk Preview Modal
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

  const handleOpenAddBranchModal = (parentId: string, branchType: 'ya' | 'tidak') => {
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
        nama_gejala: selectedGejala.nama, // OTOMATIS TERISI DENGAN TEKS GEJALA!
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
        // Mode 2: Buat Node Baru
        let targetId = branchFormData.id.trim();
        if (!targetId) {
          targetId = generateSmartIdForPreview(branchFormData.gejala_id, branchFormData.hasil);
        }

        // Auto-resolve ID conflict
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

        // 1. Insert node baru ke Supabase
        const inserted = await insertPohonNode(payload);

        // 2. Hubungkan node induk (parent) ke node baru ini
        const { parentId, branchType } = branchModal;
        await updatePohonNode(parentId, { [branchType]: inserted.id });

        toast.success(
          `Node [${inserted.id}] berhasil dibuat & otomatis dihubungkan ke cabang ${branchType.toUpperCase()} pada [${parentId}]!`
        );

        // 3. Refresh data induk
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

  // Reset zoom and pan on type change or opening
  const handleResetZoom = useCallback(() => {
    const containerWidth = previewCanvasRef.current?.clientWidth || 800;
    const containerHeight = previewCanvasRef.current?.clientHeight || 600;
    
    let initialZoom = 0.85;
    let initialPanX = 40;
    let initialPanY = 80;

    if (previewTreeType === "gabungan") {
      // In combined view, center horizontally on the combined tree center (approx x = 2750)
      initialZoom = Math.max(0.35, Math.min(0.55, (containerWidth / 5800) * 2.2));
      initialPanX = Math.round(containerWidth / 2 - 2750 * initialZoom);
      initialPanY = Math.round(containerHeight / 2 - 400 * initialZoom);
    } else if (previewTreeType === "hama") {
      // Hama has root shifted to 300, and spans from 60 to 2880. Center on the middle of first few columns (x = 750)
      initialZoom = Math.max(0.55, Math.min(0.85, (containerWidth / 3100) * 2.2));
      initialPanX = Math.round(containerWidth / 2 - 750 * initialZoom);
      initialPanY = 80;
    } else { // penyakit
      // Penyakit has root shifted to 300, and group at 300. Center on x = 750 (first few columns)
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

  // Handle native wheel zoom centered on mouse pointer (non-passive listener)
  const handleWheelNative = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = 1.15;
    
    setZoom((prevZoom) => {
      const newZoom = Math.max(0.08, Math.min(4, e.deltaY < 0 ? prevZoom * zoomFactor : prevZoom / zoomFactor));
      
      setPan((prevPan) => {
        const contentX = (mouseX - prevPan.x) / prevZoom;
        const contentY = (mouseY - prevPan.y) / prevZoom;
        return {
          x: mouseX - contentX * newZoom,
          y: mouseY - contentY * newZoom
        };
      });
      
      return newZoom;
    });
  }, []);

  const setCanvasRef = useCallback((node: HTMLDivElement | null) => {
    if (previewCanvasRef.current) {
      previewCanvasRef.current.removeEventListener("wheel", handleWheelNative);
    }
    previewCanvasRef.current = node;
    if (node) {
      node.addEventListener("wheel", handleWheelNative, { passive: false });
    }
  }, [handleWheelNative]);

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

  const downloadSVG = useCallback(() => {
    const svgElement = previewCanvasRef.current?.querySelector("svg");
    if (!svgElement) return;

    // Clone the node so we don't modify the original
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;
    
    // Set explicit width/height on the cloned svg based on active tab so it doesn't crop
    let maxX = 3000;
    let maxY = 1200;
    if (previewTreeType === "hama") {
      maxX = 3100;
      maxY = 1000;
    } else if (previewTreeType === "penyakit") {
      maxX = 2700;
      maxY = 1600;
    } else {
      maxX = 5800;
      maxY = 1600;
    }
    clonedSvg.setAttribute("width", maxX.toString());
    clonedSvg.setAttribute("height", maxY.toString());

    // Serialize to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clonedSvg);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `pohon_keputusan_${previewTreeType}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  }, [previewTreeType]);

  // Node Helper Lookups
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

  const getNodeTypeLabel = useCallback((nodeId: string): string => {
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
  }, [penyakitList]);

  // Calculations for preview structures
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

      if (node.ya && !activeIds.has(node.ya) && !nodesList.some((n) => n.id === node.ya)) brokenTargets++;
      if (node.tidak && !activeIds.has(node.tidak) && !nodesList.some((n) => n.id === node.tidak)) brokenTargets++;
    });

    return { questionCount, resultCount, brokenTargets };
  }, [nodesList, previewTreeType, penyakitList]);

  const treePreview = useMemo(() => {
    const previewNodes: PreviewNode[] = [];
    const previewEdges: PreviewEdge[] = [];
    
    // 1. Get active nodes based on previewTreeType
    const activeNodes = nodesList.filter((node) =>
      isNodeInTreeType(node, previewTreeType, nodesList, penyakitList)
    );
    
    const activeIds = new Set(activeNodes.map(node => node.id));
    
    // 2. Generate the position map including fallbacks
    const positionsMap = generateFallbackPositions(nodesList);
    
    // Helper to get coordinates
    const getCoordsLocal = (nodeId: string) => {
      return getCoords(nodeId, previewTreeType, positionsMap);
    };
    
    // Helper to define kinds, codes and subtitles
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

    // 3. Map active nodes to PreviewNode objects
    activeNodes.forEach(node => {
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

    // 4. Trace edges and add missing nodes
    const missingNodesMap = new Map<string, PreviewNode>();
    
    activeNodes.forEach(node => {
      const fromKey = node.id;
      const fromCoords = getCoordsLocal(node.id);
      
      const handleTarget = (targetId: string | null, label: "Y" | "T") => {
        if (!targetId) return;
        
        if (activeIds.has(targetId)) {
          // Normal edge
          previewEdges.push({
            fromKey,
            toKey: targetId,
            label,
          });
        } else if (!nodesList.some(node => node.id === targetId)) {
          // Target is truly missing from the database
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

  // Find matching node from search
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

      // Center view on the matched node
      const containerWidth = previewCanvasRef.current?.clientWidth || 800;
      const containerHeight = previewCanvasRef.current?.clientHeight || 600;
      setPan({
        x: Math.round(containerWidth / 2 - searchMatch.x * zoom),
        y: Math.round(containerHeight / 2 - searchMatch.y * zoom),
      });
    } else if (!searchMatch) {
      lastCenteredSearchIdRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchMatch]);

  // Ancestor tracing calculations
  const highlightedElements = useMemo(() => {
    const nodes = new Set<string>();
    const edges = new Set<string>();

    const activeNodeId = hoveredNodeId || selectedNodeId || (searchMatch ? searchMatch.id : "");
    if (!activeNodeId) {
      return { nodes, edges };
    }

    const activePreviewNode = treePreview.nodes.find((n) => n.key === activeNodeId || n.id === activeNodeId);
    if (!activePreviewNode) return { nodes, edges };

    // Traverse upwards from target node to the root/start node of its group
    const queue = [activePreviewNode.id];
    nodes.add(activePreviewNode.id);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      // Find nodes that point to currentId (either through 'ya' or 'tidak')
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
    const pNode = treePreview.nodes.find(n => n.id === selectedNodeId);
    if (!pNode) return null;
    
    // Find db node or return virtual/missing representation
    const dbNode = nodesList.find(n => n.id === pNode.id);
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
      isMissing: true
    } as any;
  }, [selectedNodeId, treePreview.nodes, nodesList]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        setSelectedNodeId(null);
        setHoveredNodeId(null);
      }
    }}>
      <DialogContent className="max-w-[98vw] sm:max-w-[98vw] w-[98vw] h-[95vh] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Preview Pohon Keputusan</DialogTitle>
        </DialogHeader>
        <div className="grid h-full grid-cols-1 lg:grid-cols-[350px_1fr] bg-white">
          <aside className="border-r border-gray-200 bg-gray-50 p-4 flex flex-col gap-4 overflow-y-auto">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Pohon Keputusan
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Preview alur diagnosa hama dan penyakit buah naga.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase text-gray-500">
                Pilih Kelompok
              </p>
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-white p-1 border">
                {(["hama", "penyakit", "gabungan"] as PreviewTreeType[]).map(
                  (type) => (
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
                  ),
                )}
              </div>
            </div>

            {/* Search Box */}
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
                    title="Clear Search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

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

            {/* Detail Node Section */}
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
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        selectedNode.hasil
                          ? "bg-blue-100 text-blue-800"
                          : selectedNode.id === "root" || selectedNode.id.endsWith("_group")
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-pink-100 text-pink-800"
                      }`}>
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
                        <span className="font-semibold text-pink-600">{selectedNode.kode_gejala}</span>
                      </div>
                    )}
                    {selectedNode.cf_pakar !== undefined && (
                      <div>
                        <strong>CF Pakar:</strong>{" "}
                        <code className="bg-gray-100 px-1 rounded">{selectedNode.cf_pakar}</code>
                      </div>
                    )}
                    {selectedNode.ya && (
                      <div>
                        <strong>Jika YA (Y) &rarr;</strong>{" "}
                        <code className="text-emerald-700 font-bold bg-emerald-50 px-1 rounded">{selectedNode.ya}</code>
                        <p className="text-[10px] text-gray-500 pl-2 truncate" title={getNodeLabel(selectedNode.ya)}>
                          {getNodeLabel(selectedNode.ya)}
                        </p>
                      </div>
                    )}
                    {selectedNode.tidak && (
                      <div>
                        <strong>Jika TIDAK (T) &rarr;</strong>{" "}
                        <code className="text-red-700 font-bold bg-red-50 px-1 rounded">{selectedNode.tidak}</code>
                        <p className="text-[10px] text-gray-500 pl-2 truncate" title={getNodeLabel(selectedNode.tidak)}>
                          {getNodeLabel(selectedNode.tidak)}
                        </p>
                      </div>
                    )}
                    {selectedNode.hasil && (
                      <div>
                        <strong>Kesimpulan:</strong>{" "}
                        <span className="font-bold text-blue-700">{getNodeLabel(selectedNode.id)}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Shortcuts */}
                  {selectedNode.isMissing ? (
                    <div className="pt-2 space-y-2">
                      <div className="p-2.5 rounded-lg border border-red-200 bg-red-50 text-red-800 space-y-1">
                        <p className="font-semibold flex items-center gap-1 text-[11px]">
                          <span>⚠️</span> Jalur Terputus / Target Hilang
                        </p>
                        <p className="text-[10px] leading-relaxed text-red-700">
                          Target node <code className="font-bold font-mono">[{selectedNode.id}]</code> dirujuk oleh node induk tetapi belum dibuat di database.
                        </p>
                      </div>
                      <div className="space-y-1.5 pt-1">
                        <Button
                          size="sm"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-8 px-1"
                          onClick={() => handleCreateMissingNode(selectedNode.id)}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          + Buat Node [{selectedNode.id}] Sekarang
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
                            const nodeObj = nodesList.find(n => n.id === selectedNode.id);
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
                            onClick={() => handleOpenAddBranchModal(selectedNode.id, 'ya')}
                          >
                            <Plus className="w-3 h-3 mr-0.5" />
                            + Cabang YA
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-red-50 hover:bg-red-100 text-red-800 border-red-300 text-[11px] h-8 px-1"
                            onClick={() => handleOpenAddBranchModal(selectedNode.id, 'tidak')}
                          >
                            <Plus className="w-3 h-3 mr-0.5" />
                            + Cabang TIDAK
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

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs hover:bg-gray-100"
                onClick={downloadSVG}
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Unduh Gambar (SVG)
              </Button>
            </div>

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

          <div
            ref={setCanvasRef}
            className="relative bg-zinc-50 overflow-hidden w-full h-full select-none cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Zoom controls */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
              <Button
                size="icon"
                variant="outline"
                className="w-10 h-10 rounded-lg bg-white shadow-md border hover:bg-gray-50 text-gray-700 font-bold text-lg"
                onClick={zoomIn}
                title="Perbesar"
              >
                +
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="w-10 h-10 rounded-lg bg-white shadow-md border hover:bg-gray-50 text-gray-700 font-bold text-lg"
                onClick={zoomOut}
                title="Perkecil"
              >
                -
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="w-10 h-10 rounded-lg bg-white shadow-md border hover:bg-gray-50 text-gray-700 text-xs font-semibold"
                onClick={handleResetZoom}
                title="Fit Tampilan"
              >
                Fit
              </Button>
            </div>

            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin text-pink-600 mb-3" />
                <span className="text-sm">
                  Memuat preview pohon keputusan...
                </span>
              </div>
            ) : treePreview.nodes.length > 0 ? (
              <svg
                className="w-full h-full min-w-full min-h-full"
                role="img"
                aria-label="Preview pohon keputusan"
              >
                <defs>
                  <marker
                    id="tree-arrow"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#111111" />
                  </marker>
                  <marker
                    id="tree-arrow-highlighted"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
                  </marker>
                </defs>

                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                  {/* Grid Background lines */}
                  <g opacity="0.04" stroke="#000" strokeWidth="1">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <line key={`x-${i}`} x1={i * 200} y1={0} x2={i * 200} y2={2000} />
                    ))}
                    {Array.from({ length: 30 }).map((_, i) => (
                      <line key={`y-${i}`} x1={0} y1={i * 100} x2={8000} y2={i * 100} />
                    ))}
                  </g>

                  {/* Render Edges (Connecting Lines) */}
                  {treePreview.edges.map((edge) => {
                    const from = treePreview.nodes.find(
                      (node) => node.key === edge.fromKey,
                    );
                    const to = treePreview.nodes.find(
                      (node) => node.key === edge.toKey,
                    );
                    if (!from || !to) return null;

                    const dx = to.x - from.x;
                    const dy = to.y - from.y;
                    const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
                    const ux = dx / distance;
                    const uy = dy / distance;
                    
                    const startX = from.x + ux * 20;
                    const startY = from.y + uy * 20;
                    const endX = to.x - ux * 20;
                    const endY = to.y - uy * 20;
                    
                    const labelX = startX + (endX - startX) * 0.35 - uy * 6;
                    const labelY = startY + (endY - startY) * 0.35 + ux * 6;

                    const isHighlighted = highlightedElements.edges.has(`${from.id}-${to.id}`);
                    const isMuted = hoveredNodeId && !isHighlighted;

                    return (
                      <g
                        key={`${edge.fromKey}-${edge.toKey}-${edge.label}`}
                        className="transition-opacity duration-200"
                        style={{ opacity: isMuted ? 0.15 : 1 }}
                      >
                        <line
                          x1={startX}
                          y1={startY}
                          x2={endX}
                          y2={endY}
                          stroke={isHighlighted ? "#ef4444" : "#111111"}
                          strokeWidth={isHighlighted ? 2.5 : 1.2}
                          strokeDasharray={edge.label === "T" ? "4,4" : undefined}
                          markerEnd={
                            isHighlighted
                              ? "url(#tree-arrow-highlighted)"
                              : "url(#tree-arrow)"
                          }
                          className="transition-[stroke,stroke-width] duration-200"
                        />
                        <text
                          x={labelX}
                          y={labelY}
                          textAnchor="middle"
                          dominantBaseline="central"
                          className={`text-[9px] font-bold select-none ${
                            isHighlighted ? "fill-red-600" : "fill-gray-900"
                          }`}
                        >
                          {edge.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Render Nodes */}
                  {treePreview.nodes.map((node) => {
                    const isResult = node.kind === "result";
                    const isMissing = node.kind === "missing";
                    const isNodeHighlighted = highlightedElements.nodes.has(node.id);
                    const isSelected = selectedNodeId === node.id;
                    const isMuted = hoveredNodeId && !isNodeHighlighted;
                    
                    const fontSize =
                      node.code.length > 5
                        ? 7.5
                        : node.code.length > 3
                          ? 9
                          : 11;

                    return (
                      <g
                        key={node.key}
                        transform={`translate(${node.x}, ${node.y})`}
                        className="interactive-node cursor-pointer transition-opacity duration-200"
                        style={{ opacity: isMuted ? 0.15 : 1 }}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        onClick={() => setSelectedNodeId(node.id)}
                      >
                        <circle
                          r="20"
                          fill={
                            isNodeHighlighted
                              ? "#fee2e2"
                              : isSelected
                                ? "#fdf2f8"
                                : isMissing
                                  ? "#fee2e2"
                                  : "#ffffff"
                          }
                          stroke={
                            isNodeHighlighted
                              ? "#ef4444"
                              : isSelected
                                ? "#db2777"
                                : isMissing
                                  ? "#ef4444"
                                  : "#111111"
                          }
                          strokeWidth={isNodeHighlighted ? 3 : (isSelected ? 3.5 : (isResult ? 2.2 : 1.5))}
                          className="transition-[fill,stroke,stroke-width] duration-200"
                        />
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          className={`font-bold transition-colors duration-200 select-none ${
                            isNodeHighlighted 
                              ? "fill-red-700" 
                              : isSelected 
                                ? "fill-pink-700" 
                                : "fill-gray-900"
                          }`}
                          style={{ fontSize: `${fontSize}px` }}
                        >
                          {node.code}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <span>Pohon keputusan kosong.</span>
              </div>
            )}
          </div>
        </div>

        {/* Inner Dialog untuk Tambah Cabang Langsung di Preview */}
        {branchModal && (
          <Dialog
            open={branchModal.isOpen}
            onOpenChange={(open) => {
              if (!open) setBranchModal(null);
            }}
          >
            <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto z-[9999] bg-white border border-pink-100 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-base flex items-center gap-2 text-gray-900">
                  <span className="p-1 bg-pink-100 rounded-md text-pink-600">➕</span> Tambah Cabang {branchModal.branchType.toUpperCase()} untuk Node [{branchModal.parentId}]
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
                        Pilih node atau hasil akhir diagnosa yang sudah ada di pohon untuk dihubungkan langsung dari cabang <strong className="uppercase font-mono">[{branchModal.branchType}]</strong> pada <strong className="font-mono">[{branchModal.parentId}]</strong> tanpa membuat node baru.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="existing_target_node" className="text-xs font-semibold">
                        Pilih Target Node / Hasil Akhir <span className="text-red-500">*</span>
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
                              const penyakit = penyakitList.find((p) => p.id === n.hasil);
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
                            .filter((n) => !n.hasil && n.id !== branchModal.parentId)
                            .map((n) => (
                              <option key={n.id} value={n.id}>
                                🔍 [{n.id}] {n.kode_gejala ? `${n.kode_gejala}: ` : ""}{n.nama_gejala || n.id}
                              </option>
                            ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* ID Node */}
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
                            setBranchFormData((prev) => ({ ...prev, id: e.target.value.trim() }))
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
                              `${branchModal.parentId}_${branchModal.branchType === "ya" ? "y" : "t"}`
                            );
                            setBranchFormData((prev) => ({ ...prev, id: autoId }));
                            toast.success(`ID disesuaikan: [${autoId}]`);
                          }}
                        >
                          ✨ Auto ID
                        </Button>
                      </div>
                    </div>

                    {/* Pilih Gejala (jika ada) */}
                    <div className="space-y-1 bg-pink-50/50 p-2.5 rounded-lg border border-pink-100">
                      <Label htmlFor="preview_gejala" className="text-xs font-semibold text-pink-950 flex items-center gap-1">
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

                    {/* Teks Pertanyaan / Keterangan Langkah */}
                    <div className="space-y-1">
                      <Label htmlFor="preview_nama_gejala" className="text-xs font-semibold">
                        Teks Pertanyaan / Keterangan Langkah <span className="text-red-500">*</span>
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

                    {/* Pilih Hasil Akhir Diagnosa (Opsional jika ini node terminal) */}
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
                        <option value="">-- Bukan Hasil Akhir (Lanjut ke Pertanyaan Berikutnya) --</option>
                        <optgroup label="🐛 Hasil Hama">
                          {penyakitList
                            .filter((p) => p.tipe === "hama" || p.id.startsWith("h"))
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.kode} - {p.nama}
                              </option>
                            ))}
                          <option value="hama_not_found">Hama Tidak Teridentifikasi</option>
                        </optgroup>
                        <optgroup label="🦠 Hasil Penyakit">
                          {penyakitList
                            .filter((p) => p.tipe === "penyakit" || p.id.startsWith("p"))
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.kode} - {p.nama}
                              </option>
                            ))}
                          <option value="penyakit_not_found">Penyakit Tidak Teridentifikasi</option>
                        </optgroup>
                      </select>
                    </div>

                    {/* Deskripsi */}
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
        )}

        {/* Confirm Delete Alert Dialog */}
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
