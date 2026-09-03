import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PreviewNode, PreviewEdge } from "./pohonPreviewHelpers";

interface PohonPreviewCanvasProps {
  setCanvasRef: (node: HTMLDivElement | null) => void;
  pan: { x: number; y: number };
  zoom: number;
  loading: boolean;
  treePreview: {
    nodes: PreviewNode[];
    edges: PreviewEdge[];
  };
  highlightedElements: {
    nodes: Set<string>;
    edges: Set<string>;
  };
  hoveredNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  handleResetZoom: () => void;
}

/**
 * Sub-komponen PohonPreviewCanvas
 * Menampilkan canvas interaktif SVG: menggambar garis konektor cabang YA/TIDAK,
 * node-node lingkaran, sorotan alur leluhur (Highlighted Ancestor Path), gesture drag pan,
 * serta tombol kontrol perbesaran Zoom (+ / - / Fit).
 */
export const PohonPreviewCanvas = ({
  setCanvasRef,
  pan,
  zoom,
  loading,
  treePreview,
  highlightedElements,
  hoveredNodeId,
  setHoveredNodeId,
  selectedNodeId,
  setSelectedNodeId,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  zoomIn,
  zoomOut,
  handleResetZoom,
}: PohonPreviewCanvasProps) => {
  return (
    <div
      ref={setCanvasRef}
      className="relative bg-zinc-50 overflow-hidden w-full h-full select-none cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Tombol Kontrol Perbesaran (Zoom & Fit Canvas) */}
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
          <span className="text-sm">Memuat preview pohon keputusan...</span>
        </div>
      ) : treePreview.nodes.length > 0 ? (
        <svg
          className="w-full h-full min-w-full min-h-full"
          role="img"
          aria-label="Preview pohon keputusan"
        >
          <defs>
            {/* Definisi Kepala Panah Garis Normal */}
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
            {/* Definisi Kepala Panah Garis Sorot (Highlighted Path) */}
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
            {/* Latar Belakang Garis Grid Transparan */}
            <g opacity="0.04" stroke="#000" strokeWidth="1">
              {Array.from({ length: 40 }).map((_, i) => (
                <line key={`x-${i}`} x1={i * 200} y1={0} x2={i * 200} y2={2000} />
              ))}
              {Array.from({ length: 30 }).map((_, i) => (
                <line key={`y-${i}`} x1={0} y1={i * 100} x2={8000} y2={i * 100} />
              ))}
            </g>

            {/* Render Seluruh Garis Konektor (Edges) */}
            {treePreview.edges.map((edge) => {
              const from = treePreview.nodes.find(
                (node) => node.key === edge.fromKey
              );
              const to = treePreview.nodes.find(
                (node) => node.key === edge.toKey
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

              const isYa = edge.label === "Y";
              const ratio = isYa ? 0.25 : 0.7;
              const labelX = startX + (endX - startX) * ratio + (isYa ? -14 : 14);
              const labelY = startY + (endY - startY) * ratio + (isYa ? 0 : -4);

              const isHighlighted = highlightedElements.edges.has(
                `${from.id}-${to.id}`
              );
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

            {/* Render Lingkaran Node Interaktif */}
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
                    strokeWidth={
                      isNodeHighlighted
                        ? 3
                        : isSelected
                          ? 3.5
                          : isResult
                            ? 2.2
                            : 1.5
                    }
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
  );
};
