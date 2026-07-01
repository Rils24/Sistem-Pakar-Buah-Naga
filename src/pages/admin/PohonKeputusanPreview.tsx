import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Download } from "lucide-react";
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
  const positions = { ...STATIC_NODE_POSITIONS };
  const groups: Record<string, PohonNode[]> = {};
  
  nodes.forEach(n => {
    if (n.id === 'root' || n.id === 'hama_group' || n.id === 'penyakit_group') return;
    const match = n.id.match(/^([hp]\d{2})/);
    if (match) {
      const grp = match[1];
      if (!groups[grp]) groups[grp] = [];
      groups[grp].push(n);
    }
  });

  for (const grp in groups) {
    const grpNodes = groups[grp];
    const startNode = grpNodes.find(n => n.id.endsWith('_check'));
    if (!startNode) continue;

    // BFS to assign levels and coordinates
    const queue = [{ id: startNode.id, depth: 0, offset: 0 }];
    const visited = new Set<string>();
    
    const idx = parseInt(grp.substring(1), 10);
    const columnCenter = (idx - 1) * 400 + 300;

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current.id)) continue;
      visited.add(current.id);

      const node = grpNodes.find(n => n.id === current.id);
      if (!node) continue;

      if (!positions[node.id]) {
        const calculatedX = columnCenter + current.offset * 85;
        const calculatedY = 250 + current.depth * 100;
        positions[node.id] = { x: calculatedX, y: calculatedY };
      }

      if (node.ya && grpNodes.some(n => n.id === node.ya)) {
        queue.push({ id: node.ya, depth: current.depth + 1, offset: current.offset - 0.7 });
      }
      if (node.tidak && grpNodes.some(n => n.id === node.tidak)) {
        queue.push({ id: node.tidak, depth: current.depth + 1, offset: current.offset + 0.7 });
      }
    }

    // Catch orphan nodes
    grpNodes.forEach(n => {
      if (!positions[n.id]) {
        positions[n.id] = { x: columnCenter, y: 750 };
      }
    });
  }

  return positions;
};

export const PohonKeputusanPreview = ({
  isOpen,
  onOpenChange,
  nodesList,
  gejalaList: _gejalaList,
  penyakitList,
  onEditNode,
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
    const activeNodes = nodesList.filter((node) => {
      if (previewTreeType === "gabungan") return true;
      if (previewTreeType === "hama") {
        return node.id === "root" || node.id.startsWith("h") || node.id === "hama_group" || node.id === "hama_not_found";
      }
      return node.id === "root" || node.id.startsWith("p") || node.id === "penyakit_group" || node.id === "penyakit_not_found";
    });

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
  }, [nodesList, previewTreeType]);

  const treePreview = useMemo(() => {
    const previewNodes: PreviewNode[] = [];
    const previewEdges: PreviewEdge[] = [];
    
    // 1. Get active nodes based on previewTreeType
    const activeNodes = nodesList.filter((node) => {
      if (previewTreeType === "gabungan") return true;
      if (previewTreeType === "hama") {
        return node.id === "root" || node.id.startsWith("h") || node.id === "hama_group" || node.id === "hama_not_found";
      }
      return node.id === "root" || node.id.startsWith("p") || node.id === "penyakit_group" || node.id === "penyakit_not_found";
    });
    
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
    if (dbNode) return dbNode;
    
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
      subtitle: pNode.subtitle
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
                <input
                  type="text"
                  placeholder="Ketik kode, nama gejala..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-8 py-1.5 text-xs border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-base font-bold"
                  >
                    &times;
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

                  {/* Edit Shortcut */}
                  {!selectedNode.id.startsWith("missing") && (
                    <div className="pt-2">
                      <Button
                        size="sm"
                        className="w-full bg-pink-600 hover:bg-pink-700 text-xs py-1 h-8"
                        onClick={() => {
                          const nodeObj = nodesList.find(n => n.id === selectedNode.id);
                          if (nodeObj) {
                            onOpenChange(false);
                            onEditNode(nodeObj);
                          }
                        }}
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        Edit Node Ini
                      </Button>
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
      </DialogContent>
    </Dialog>
  );
};
