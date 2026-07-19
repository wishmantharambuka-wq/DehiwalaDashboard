import { useRef, useEffect, useState, useCallback } from "react";
import type { NetworkEdge } from "../../data/network-data";
import { CATEGORY_COLORS, CATEGORY_LABELS, RELATION_COLORS } from "../../data/network-data";

interface GraphNode {
  id: string;
  label: string;
  category: string;
  description: string;
  connected: string[];
}

interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface ForceGraphProps {
  nodes: GraphNode[];
  edges: NetworkEdge[];
  categoryColors?: Record<string, string>;
  width?: number;
  height?: number;
  onSelectNode?: (node: GraphNode | null) => void;
}

export function ForceGraph({ nodes, edges, categoryColors = CATEGORY_COLORS, width = 600, height = 420, onSelectNode }: ForceGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simNodes = useRef<SimNode[]>([]);
  const animRef = useRef(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const dragging = useRef<string | null>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const angle = (2 * Math.PI) / nodes.length;
    const r = Math.min(width, height) * 0.32;
    simNodes.current = nodes.map((n, i) => ({
      ...n,
      x: width / 2 + r * Math.cos(angle * i),
      y: height / 2 + r * Math.sin(angle * i),
      vx: 0,
      vy: 0,
    }));
  }, [nodes, width, height]);

  const getNode = useCallback((id: string) => simNodes.current.find((n) => n.id === id), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tick = () => {
      const sn = simNodes.current;
      const cx = width / 2;
      const cy = height / 2;

      for (let i = 0; i < sn.length; i++) {
        if (sn[i].id === dragging.current) continue;
        for (let j = i + 1; j < sn.length; j++) {
          if (sn[j].id === dragging.current) continue;
          const dx = sn[j].x - sn[i].x;
          const dy = sn[j].y - sn[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 1200 / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          sn[i].vx -= fx;
          sn[i].vy -= fy;
          sn[j].vx += fx;
          sn[j].vy += fy;
        }
      }

      for (const e of edges) {
        const a = getNode(e.source);
        const b = getNode(e.target);
        if (!a || !b || a.id === dragging.current || b.id === dragging.current) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 90) * 0.004;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }

      for (const n of sn) {
        if (n.id === dragging.current) {
          n.x = mousePos.current.x;
          n.y = mousePos.current.y;
          n.vx = 0;
          n.vy = 0;
          continue;
        }
        n.vx += (cx - n.x) * 0.001;
        n.vy += (cy - n.y) * 0.001;
        n.vx *= 0.85;
        n.vy *= 0.85;
        n.x += n.vx;
        n.y += n.vy;
        n.x = Math.max(20, Math.min(width - 20, n.x));
        n.y = Math.max(20, Math.min(height - 20, n.y));
      }

      ctx.clearRect(0, 0, width, height);

      for (const e of edges) {
        const a = getNode(e.source);
        const b = getNode(e.target);
        if (!a || !b) continue;
        const isHighlighted = selectedId && (a.id === selectedId || b.id === selectedId);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = isHighlighted ? (RELATION_COLORS[e.relation] || "#555") : "rgba(120,120,140,0.15)";
        ctx.lineWidth = isHighlighted ? 2 : 0.8;
        ctx.stroke();
      }

      for (const n of sn) {
        const isSelected = n.id === selectedId;
        const isHovered = n.id === hoveredId;
        const isConnected = selectedId && (n.id === selectedId || edges.some((e) => (e.source === selectedId && e.target === n.id) || (e.target === selectedId && e.source === n.id)));
        const dimmed = selectedId && !isConnected;
        const r = isSelected ? 10 : isHovered ? 9 : 7;
        const color = categoryColors[n.category] || "#888";

        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 3, 0, Math.PI * 2);
        ctx.fillStyle = dimmed ? "rgba(0,0,0,0)" : `${color}33`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = dimmed ? `${color}44` : color;
        ctx.fill();
        if (isSelected) {
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        if (!dimmed) {
          ctx.font = "bold 9px system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.fillStyle = dimmed ? "rgba(200,200,200,0.3)" : "rgba(220,230,240,0.9)";
          ctx.fillText(n.label, n.x, n.y + r + 13);
        }
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [edges, getNode, width, height, selectedId, hoveredId, categoryColors]);

  const hitTest = (mx: number, my: number) => {
    for (const n of simNodes.current) {
      const dx = n.x - mx;
      const dy = n.y - my;
      if (dx * dx + dy * dy < 144) return n;
    }
    return null;
  };

  const getCanvasPos = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  return (
    <div style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ display: "block", cursor: hoveredId ? "pointer" : "default" }}
        onMouseMove={(e) => {
          const pos = getCanvasPos(e);
          mousePos.current = pos;
          if (dragging.current) return;
          const hit = hitTest(pos.x, pos.y);
          setHoveredId(hit?.id || null);
        }}
        onMouseDown={(e) => {
          const pos = getCanvasPos(e);
          const hit = hitTest(pos.x, pos.y);
          if (hit) {
            dragging.current = hit.id;
            setSelectedId(hit.id);
            onSelectNode?.(hit);
          }
        }}
        onMouseUp={() => { dragging.current = null; }}
        onMouseLeave={() => { dragging.current = null; setHoveredId(null); }}
        onClick={(e) => {
          const pos = getCanvasPos(e);
          const hit = hitTest(pos.x, pos.y);
          if (!hit) {
            setSelectedId(null);
            onSelectNode?.(null);
          }
        }}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", padding: "8px 4px 0", fontSize: 9 }}>
        {Array.from(new Set(nodes.map((n) => n.category))).map((cat) => {
          const color = categoryColors[cat] || "#888";
          const label = CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat.charAt(0).toUpperCase() + cat.slice(1);
          return (
            <span key={cat} style={{ display: "flex", alignItems: "center", gap: 4, color: "#94a3b8" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
