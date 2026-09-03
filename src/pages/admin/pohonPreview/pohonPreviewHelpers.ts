import type { PohonNode } from "../KelolaPohonKeputusan";

/**
 * Antarmuka (Interface) untuk mewakili objek data Node pada diagram visual pohon keputusan.
 */
export interface PreviewNode {
  key: string;      // Kunci unik elemen untuk React render key
  id: string;       // ID node di database (misal: 'h01_check', 'p01_confirmed')
  code: string;     // Kode singkat tampilan pada lingkaran node (misal: 'G38', 'P01')
  subtitle: string; // Teks deskripsi atau nama gejala/penyakit
  x: number;        // Posisi koordinat sumbu X pada canvas SVG
  y: number;        // Posisi koordinat sumbu Y pada canvas SVG
  kind: "question" | "result" | "missing"; // Jenis node: pertanyaan gejala, hasil akhir, atau target hilang
}

/**
 * Antarmuka (Interface) untuk garis penghubung (Edge) antar-node.
 */
export interface PreviewEdge {
  fromKey: string;  // Key node asal (induk)
  toKey: string;    // Key node tujuan (anak)
  label: "Y" | "T"; // Label jalur cabang: 'Y' (YA) atau 'T' (TIDAK)
}

/**
 * Tipe opsi tab kelompok pohon keputusan yang sedang ditampilkan.
 */
export type PreviewTreeType = "hama" | "penyakit" | "gabungan";

/**
 * Pemetaan Posisi Koordinat Statis (Static Layout Map) untuk seluruh Node Hama dan Penyakit.
 * Menyusun kisi simetris (Sequential Lattice Grid) agar panah cabang lurus & rapi.
 */
export const STATIC_NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  // === NODE AKAR UTAMA & GRUP KATEGORI ===
  "root": { x: 3600, y: 50 },
  "hama_group": { x: 3600, y: 150 },
  "penyakit_group": { x: 8000, y: 150 },

  // === KOLOM DIAGRAM HAMA (H01 - H07) ===
  "h01_check": { x: 600, y: 250 },
  "h01_g02": { x: 490, y: 400 },
  "h01_g03_y": { x: 380, y: 550 },
  "h01_g03_t": { x: 600, y: 550 },
  "h01_g04_y": { x: 380, y: 700 },
  "h01_g04_t": { x: 600, y: 700 },
  "h01_g04_tr": { x: 820, y: 700 },
  "h01_g05_y": { x: 380, y: 850 },
  "h01_g05_t": { x: 600, y: 850 },
  "h01_g05_tr": { x: 820, y: 850 },
  "h01_g06_y": { x: 380, y: 1000 },
  "h01_g06_t": { x: 600, y: 1000 },
  "h01_g06_tr": { x: 820, y: 1000 },
  "h01_confirmed": { x: 600, y: 1150 },

  "h02_check": { x: 1600, y: 250 },
  "h02_g08": { x: 1490, y: 400 },
  "h02_g09_y": { x: 1380, y: 550 },
  "h02_g09_t": { x: 1600, y: 550 },
  "h02_g10_y": { x: 1380, y: 700 },
  "h02_g10_t": { x: 1600, y: 700 },
  "h02_g10_tr": { x: 1820, y: 700 },
  "h02_g11_y": { x: 1380, y: 850 },
  "h02_g11_t": { x: 1600, y: 850 },
  "h02_g11_tr": { x: 1820, y: 850 },
  "h02_confirmed": { x: 1600, y: 1000 },

  "h03_check": { x: 2600, y: 250 },
  "h03_g13": { x: 2490, y: 400 },
  "h03_g14_y": { x: 2380, y: 550 },
  "h03_g14_t": { x: 2600, y: 550 },
  "h03_g15_y": { x: 2380, y: 700 },
  "h03_g15_t": { x: 2600, y: 700 },
  "h03_g15_tr": { x: 2820, y: 700 },
  "h03_confirmed": { x: 2600, y: 850 },

  "h04_check": { x: 3600, y: 250 },
  "h04_g17": { x: 3490, y: 400 },
  "h04_g18_y": { x: 3380, y: 550 },
  "h04_g18_t": { x: 3600, y: 550 },
  "h04_g19_y": { x: 3380, y: 700 },
  "h04_g19_t": { x: 3600, y: 700 },
  "h04_g19_tr": { x: 3820, y: 700 },
  "h04_g20_y": { x: 3380, y: 850 },
  "h04_g20_t": { x: 3600, y: 850 },
  "h04_g20_tr": { x: 3820, y: 850 },
  "h04_confirmed": { x: 3600, y: 1000 },

  "h05_check": { x: 4600, y: 250 },
  "h05_g22": { x: 4490, y: 400 },
  "h05_g23_y": { x: 4380, y: 550 },
  "h05_g23_t": { x: 4600, y: 550 },
  "h05_g24_y": { x: 4380, y: 700 },
  "h05_g24_t": { x: 4600, y: 700 },
  "h05_g24_tr": { x: 4820, y: 700 },
  "h05_g25_y": { x: 4380, y: 850 },
  "h05_g25_t": { x: 4600, y: 850 },
  "h05_g25_tr": { x: 4820, y: 850 },
  "h05_g26_y": { x: 4380, y: 1000 },
  "h05_g26_t": { x: 4600, y: 1000 },
  "h05_g26_tr": { x: 4820, y: 1000 },
  "h05_confirmed": { x: 4600, y: 1150 },

  "h06_check": { x: 5600, y: 250 },
  "h06_g28": { x: 5490, y: 400 },
  "h06_g29_y": { x: 5380, y: 550 },
  "h06_g29_t": { x: 5600, y: 550 },
  "h06_g30_y": { x: 5380, y: 700 },
  "h06_g30_t": { x: 5600, y: 700 },
  "h06_g30_tr": { x: 5820, y: 700 },
  "h06_g31_y": { x: 5380, y: 850 },
  "h06_g31_t": { x: 5600, y: 850 },
  "h06_g31_tr": { x: 5820, y: 850 },
  "h06_confirmed": { x: 5600, y: 1000 },

  "h07_check": { x: 6600, y: 250 },
  "h07_g33": { x: 6490, y: 400 },
  "h07_g34_y": { x: 6380, y: 550 },
  "h07_g34_t": { x: 6600, y: 550 },
  "h07_g35_y": { x: 6380, y: 700 },
  "h07_g35_t": { x: 6600, y: 700 },
  "h07_g35_tr": { x: 6820, y: 700 },
  "h07_g36_y": { x: 6380, y: 850 },
  "h07_g36_t": { x: 6600, y: 850 },
  "h07_g36_tr": { x: 6820, y: 850 },
  "h07_g37_y": { x: 6380, y: 1000 },
  "h07_g37_t": { x: 6600, y: 1000 },
  "h07_g37_tr": { x: 6820, y: 1000 },
  "h07_confirmed": { x: 6600, y: 1150 },
  
  "hama_not_found": { x: 7200, y: 250 },

  // === KOLOM DIAGRAM PENYAKIT (P01 - P06) ===
  "p01_check": { x: 600, y: 250 },
  "p01_g39": { x: 490, y: 400 },
  "p01_g40_y": { x: 380, y: 550 },
  "p01_g40_t": { x: 600, y: 550 },
  "p01_g41_y": { x: 380, y: 700 },
  "p01_g41_t": { x: 600, y: 700 },
  "p01_g41_tr": { x: 820, y: 700 },
  "p01_g42_y": { x: 380, y: 850 },
  "p01_g42_t": { x: 600, y: 850 },
  "p01_g42_tr": { x: 820, y: 850 },
  "p01_g43_y": { x: 380, y: 1000 },
  "p01_g43_t": { x: 600, y: 1000 },
  "p01_g43_tr": { x: 820, y: 1000 },
  "p01_g44_y": { x: 380, y: 1150 },
  "p01_g44_t": { x: 600, y: 1150 },
  "p01_g44_tr": { x: 820, y: 1150 },
  "p01_confirmed": { x: 600, y: 1300 },
  "p01_not_found": { x: 820, y: 1300 },

  "p02_check": { x: 1600, y: 250 },
  "p02_g46": { x: 1490, y: 400 },
  "p02_g47_y": { x: 1380, y: 550 },
  "p02_g47_t": { x: 1600, y: 550 },
  "p02_g48_y": { x: 1380, y: 700 },
  "p02_g48_t": { x: 1600, y: 700 },
  "p02_g48_tr": { x: 1820, y: 700 },
  "p02_g49_y": { x: 1380, y: 850 },
  "p02_g49_t": { x: 1600, y: 850 },
  "p02_g49_tr": { x: 1820, y: 850 },
  "p02_confirmed": { x: 1600, y: 1000 },
  "p02_not_found": { x: 1820, y: 1000 },

  "p03_check": { x: 2600, y: 250 },
  "p03_g51": { x: 2490, y: 400 },
  "p03_g52_y": { x: 2380, y: 550 },
  "p03_g52_t": { x: 2600, y: 550 },
  "p03_g53_y": { x: 2380, y: 700 },
  "p03_g53_t": { x: 2600, y: 700 },
  "p03_g53_tr": { x: 2820, y: 700 },
  "p03_g54_y": { x: 2380, y: 850 },
  "p03_g54_t": { x: 2600, y: 850 },
  "p03_g54_tr": { x: 2820, y: 850 },
  "p03_g55_y": { x: 2380, y: 1000 },
  "p03_g55_t": { x: 2600, y: 1000 },
  "p03_g55_tr": { x: 2820, y: 1000 },
  "p03_g56_y": { x: 2380, y: 1150 },
  "p03_g56_t": { x: 2600, y: 1150 },
  "p03_g56_tr": { x: 2820, y: 1150 },
  "p03_g57_y": { x: 2380, y: 1300 },
  "p03_g57_t": { x: 2600, y: 1300 },
  "p03_g57_tr": { x: 2820, y: 1300 },
  "p03_g58_y": { x: 2380, y: 1450 },
  "p03_g58_t": { x: 2600, y: 1450 },
  "p03_g58_tr": { x: 2820, y: 1450 },
  "p03_g59_y": { x: 2380, y: 1600 },
  "p03_g59_t": { x: 2600, y: 1600 },
  "p03_g59_tr": { x: 2820, y: 1600 },
  "p03_g60_y": { x: 2380, y: 1750 },
  "p03_g60_t": { x: 2600, y: 1750 },
  "p03_g60_tr": { x: 2820, y: 1750 },
  "p03_g61_y": { x: 2380, y: 1900 },
  "p03_g61_t": { x: 2600, y: 1900 },
  "p03_g61_tr": { x: 2820, y: 1900 },
  "p03_confirmed": { x: 2600, y: 2050 },
  "p03_not_found": { x: 2820, y: 2050 },

  "p04_check": { x: 3600, y: 250 },
  "p04_g63": { x: 3490, y: 400 },
  "p04_g64_y": { x: 3380, y: 550 },
  "p04_g64_t": { x: 3600, y: 550 },
  "p04_g65_y": { x: 3380, y: 700 },
  "p04_g65_t": { x: 3600, y: 700 },
  "p04_g65_tr": { x: 3820, y: 700 },
  "p04_g66_y": { x: 3380, y: 850 },
  "p04_g66_t": { x: 3600, y: 850 },
  "p04_g66_tr": { x: 3820, y: 850 },
  "p04_confirmed": { x: 3600, y: 1000 },
  "p04_not_found": { x: 3820, y: 1000 },

  "p05_check": { x: 4600, y: 250 },
  "p05_g68": { x: 4490, y: 400 },
  "p05_g69_y": { x: 4380, y: 550 },
  "p05_g69_t": { x: 4600, y: 550 },
  "p05_g70_y": { x: 4380, y: 700 },
  "p05_g70_t": { x: 4600, y: 700 },
  "p05_g70_tr": { x: 4820, y: 700 },
  "p05_g71_y": { x: 4380, y: 850 },
  "p05_g71_t": { x: 4600, y: 850 },
  "p05_g71_tr": { x: 4820, y: 850 },
  "p05_confirmed": { x: 4600, y: 1000 },
  "p05_not_found": { x: 4820, y: 1000 },

  "p06_check": { x: 5600, y: 250 },
  "p06_g73": { x: 5490, y: 400 },
  "p06_g74_y": { x: 5380, y: 550 },
  "p06_g74_t": { x: 5600, y: 550 },
  "p06_g75_y": { x: 5380, y: 700 },
  "p06_g75_t": { x: 5600, y: 700 },
  "p06_g75_tr": { x: 5820, y: 700 },
  "p06_g76_y": { x: 5380, y: 850 },
  "p06_g76_t": { x: 5600, y: 850 },
  "p06_g76_tr": { x: 5820, y: 850 },
  "p06_confirmed": { x: 5600, y: 1000 },
  "p06_not_found": { x: 5820, y: 1000 },
  "penyakit_not_found": { x: 6600, y: 1000 }
};

/**
 * Mengambil koordinat X dan Y posisi visual node pada diagram canvas SVG.
 * Menyesuaikan pergeseran horizontal ketika pengguna memilih mode tampilan "Gabungan".
 */
export const getCoords = (
  nodeId: string,
  treeType: PreviewTreeType,
  currentPositions: Record<string, { x: number; y: number }>
) => {
  const pos = currentPositions[nodeId];
  
  if (treeType === 'gabungan') {
    if (nodeId === 'root') return { x: 7600, y: 50 };
    if (nodeId === 'hama_group') return { x: 4000, y: 150 };
    if (nodeId === 'penyakit_group') return { x: 11200, y: 150 };
    
    if (nodeId.startsWith('p0') || nodeId === 'penyakit_not_found') {
      const basePos = pos || { x: 600, y: 250 };
      return {
        x: basePos.x + 7600,
        y: basePos.y
      };
    }
  }
  
  if (!pos) return { x: 0, y: 0 };
  
  if (treeType === 'hama') {
    if (nodeId === 'root') return { x: 3600, y: 50 };
    if (nodeId === 'hama_group') return { x: 3600, y: 150 };
  }
  if (treeType === 'penyakit') {
    if (nodeId === 'root') return { x: 3600, y: 50 };
    if (nodeId === 'penyakit_group') return { x: 3600, y: 150 };
  }

  return pos;
};

/**
 * Generator kalkulasi posisi otomatis (Fallback Position Generator) menggunakan algoritma BFS.
 */
export const generateFallbackPositions = (nodes: PohonNode[]) => {
  const positions: Record<string, { x: number; y: number }> = { ...STATIC_NODE_POSITIONS };
  if (!nodes || nodes.length === 0) return positions;

  const groups: Record<string, PohonNode[]> = {};
  
  const resolveGroupKey = (node: PohonNode, visited = new Set<string>()): string => {
    if (visited.has(node.id)) return "other";
    visited.add(node.id);

    const match = node.id.match(/^([hp]\d{2})/i);
    if (match) return match[1].toLowerCase();

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

    const parentNode = nodes.find((p) => p.ya === node.id || p.tidak === node.id);
    if (parentNode) {
      return resolveGroupKey(parentNode, visited);
    }

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

/**
 * Memeriksa dan memvalidasi apakah suatu node termasuk dalam kategori tab yang sedang aktif.
 */
export const isNodeInTreeType = (
  node: PohonNode,
  treeType: PreviewTreeType,
  nodesList: PohonNode[],
  penyakitList: any[]
): boolean => {
  if (treeType === "gabungan") return true;
  if (node.id === "root") return true;

  if (treeType === "hama") {
    if (node.id === "hama_group" || node.id === "hama_not_found") return true;
    if (node.id === "penyakit_group" || node.id === "penyakit_not_found") return false;
  }
  if (treeType === "penyakit") {
    if (node.id === "penyakit_group" || node.id === "penyakit_not_found") return true;
    if (node.id === "hama_group" || node.id === "hama_not_found") return false;
  }

  const idLower = node.id.toLowerCase();
  if (idLower.startsWith("h")) return treeType === "hama";
  if (idLower.startsWith("p")) return treeType === "penyakit";

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

  if (node.kode_gejala) {
    const gNum = parseInt(node.kode_gejala.replace(/\D/g, ""), 10);
    if (!isNaN(gNum)) {
      if (gNum >= 1 && gNum <= 38) return treeType === "hama";
      if (gNum >= 39 && gNum <= 78) return treeType === "penyakit";
    }
  }

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
