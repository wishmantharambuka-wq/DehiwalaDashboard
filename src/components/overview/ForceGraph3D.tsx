import { useRef, useEffect, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Html } from "@react-three/drei";
import * as THREE from "three";
import type { NetworkEdge } from "../../data/network-data";
import { RELATION_COLORS } from "../../data/network-data";

export interface GraphNode3D {
  id: string;
  label: string;
  category: string;
  description: string;
  connected: string[];
}

interface SimNode3D extends GraphNode3D {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
}

interface ForceGraph3DProps {
  nodes: GraphNode3D[];
  edges: NetworkEdge[];
  categoryColors: Record<string, string>;
  spread?: number;
  selectedId: string | null;
  onSelectNode: (node: GraphNode3D | null) => void;
  position?: [number, number, number];
}

/* ---------- Node sphere ---------- */

function NodeSphere({
  simRef, nodeIndex, node, color,
  isSelected, isConnected, isDimmed, onSelect,
}: {
  simRef: { current: SimNode3D[] };
  nodeIndex: number;
  node: GraphNode3D;
  color: string;
  isSelected: boolean;
  isConnected: boolean;
  isDimmed: boolean;
  onSelect: (node: GraphNode3D) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    const sim = simRef.current[nodeIndex];
    if (!groupRef.current || !sim) return;
    groupRef.current.position.set(sim.x, sim.y, sim.z);
  });

  const radius = isSelected ? 12 : isConnected ? 10 : 8;

  return (
    <group ref={groupRef}>
      {!isDimmed && (
        <mesh>
          <sphereGeometry args={[radius * 2.5, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={isSelected ? 0.14 : 0.05} depthWrite={false} />
        </mesh>
      )}
      <mesh
        onClick={(e) => { e.stopPropagation(); onSelect(node); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = "default"; }}
      >
        <sphereGeometry args={[radius, 20, 20]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 1.2 : hovered ? 0.9 : isConnected ? 0.6 : 0.25}
          transparent
          opacity={isDimmed ? 0.12 : 1}
          roughness={0.25}
          metalness={0.15}
        />
      </mesh>
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius + 2, radius + 4, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
      {!isDimmed && (
        <Text
          position={[0, -(radius + 6), 0]}
          fontSize={isSelected ? 5 : 4}
          color={isSelected ? "#ffffff" : isConnected ? "#e2e8f0" : "#94a3b8"}
          anchorX="center"
          anchorY="top"
          maxWidth={100}
        >
          {node.label}
        </Text>
      )}
      {hovered && !isSelected && !isDimmed && (
        <Html position={[0, radius + 14, 0]} center style={{ pointerEvents: "none" }}>
          <div style={{
            background: "rgba(8, 18, 30, 0.9)", backdropFilter: "blur(12px)",
            border: `1px solid ${color}44`, borderRadius: 10, padding: "6px 10px",
            whiteSpace: "nowrap", boxShadow: `0 0 16px ${color}22`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }}>{node.label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
              <span style={{ fontSize: 9, color: "#94a3b8", textTransform: "capitalize" }}>{node.category.replace("-", " ")}</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ---------- Edge line ---------- */

function EdgeLine({
  simRef, sourceIndex, targetIndex, color, isHighlighted, isDimmed,
}: {
  simRef: { current: SimNode3D[] };
  sourceIndex: number;
  targetIndex: number;
  color: string;
  isHighlighted: boolean;
  isDimmed: boolean;
}) {
  const line = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
    const mat = new THREE.LineBasicMaterial({ transparent: true, depthWrite: false });
    return new THREE.Line(geom, mat);
  }, []);

  useFrame(() => {
    const a = simRef.current[sourceIndex];
    const b = simRef.current[targetIndex];
    if (!a || !b) return;
    const attr = line.geometry.getAttribute("position") as THREE.BufferAttribute;
    (attr.array as Float32Array).set([a.x, a.y, a.z, b.x, b.y, b.z]);
    attr.needsUpdate = true;
    const mat = line.material as THREE.LineBasicMaterial;
    mat.color.set(isHighlighted ? color : "#475569");
    mat.opacity = isDimmed ? 0.03 : isHighlighted ? 0.7 : 0.12;
  });

  useEffect(() => () => {
    line.geometry.dispose();
    (line.material as THREE.Material).dispose();
  }, [line]);

  return <primitive object={line} />;
}

/* ---------- Main component ---------- */

export function ForceGraph3D({
  nodes, edges, categoryColors, spread = 120,
  selectedId, onSelectNode, position = [0, 0, 0],
}: ForceGraph3DProps) {
  const simRef = useRef<SimNode3D[]>([]);

  useEffect(() => {
    const phi = (1 + Math.sqrt(5)) / 2;
    const count = nodes.length || 1;
    simRef.current = nodes.map((n, i) => {
      const yNorm = count > 1 ? 1 - (2 * i) / (count - 1) : 0;
      const r = Math.sqrt(Math.max(0, 1 - yNorm * yNorm));
      const theta = (2 * Math.PI * i) / phi;
      return {
        ...n,
        x: r * Math.cos(theta) * spread,
        y: yNorm * spread * 0.5,
        z: r * Math.sin(theta) * spread * 0.4,
        vx: 0, vy: 0, vz: 0,
      };
    });
  }, [nodes, spread]);

  const edgeInfo = useMemo(() =>
    edges.map((e) => ({
      ...e,
      si: nodes.findIndex((n) => n.id === e.source),
      ti: nodes.findIndex((n) => n.id === e.target),
    })).filter((e) => e.si >= 0 && e.ti >= 0),
  [edges, nodes]);

  useFrame(() => {
    const sn = simRef.current;
    if (sn.length === 0) return;

    for (let i = 0; i < sn.length; i++) {
      for (let j = i + 1; j < sn.length; j++) {
        const dx = sn[j].x - sn[i].x;
        const dy = sn[j].y - sn[i].y;
        const dz = sn[j].z - sn[i].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
        const f = 2000 / (dist * dist);
        const fx = (dx / dist) * f;
        const fy = (dy / dist) * f;
        const fz = (dz / dist) * f;
        sn[i].vx -= fx; sn[i].vy -= fy; sn[i].vz -= fz;
        sn[j].vx += fx; sn[j].vy += fy; sn[j].vz += fz;
      }
    }

    for (const e of edgeInfo) {
      const a = sn[e.si], b = sn[e.ti];
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dz = b.z - a.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
      const f = (dist - spread * 0.35) * 0.003;
      const fx = (dx / dist) * f;
      const fy = (dy / dist) * f;
      const fz = (dz / dist) * f;
      a.vx += fx; a.vy += fy; a.vz += fz;
      b.vx -= fx; b.vy -= fy; b.vz -= fz;
    }

    for (const n of sn) {
      n.vx -= n.x * 0.001;
      n.vy -= n.y * 0.001;
      n.vz -= n.z * 0.001;
      n.vx *= 0.87;
      n.vy *= 0.87;
      n.vz *= 0.87;
      n.x += n.vx;
      n.y += n.vy;
      n.z += n.vz;
    }
  });

  return (
    <group position={position}>
      {edgeInfo.map((e) => {
        const isHigh = !!selectedId && (e.source === selectedId || e.target === selectedId);
        const isDim = !!selectedId && !isHigh;
        return (
          <EdgeLine
            key={`${e.source}-${e.target}`}
            simRef={simRef}
            sourceIndex={e.si}
            targetIndex={e.ti}
            color={RELATION_COLORS[e.relation] || "#555"}
            isHighlighted={isHigh}
            isDimmed={isDim}
          />
        );
      })}
      {nodes.map((node, i) => {
        const isSel = node.id === selectedId;
        const isCon = !!selectedId && !isSel && edges.some(
          (e) => (e.source === selectedId && e.target === node.id) || (e.target === selectedId && e.source === node.id),
        );
        const isDim = !!selectedId && !isSel && !isCon;
        return (
          <NodeSphere
            key={node.id}
            simRef={simRef}
            nodeIndex={i}
            node={node}
            color={categoryColors[node.category] || "#888"}
            isSelected={isSel}
            isConnected={isCon}
            isDimmed={isDim}
            onSelect={onSelectNode}
          />
        );
      })}
    </group>
  );
}
