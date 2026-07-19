import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { ForceGraph3D } from "./ForceGraph3D";
import { issuesNodes, issuesEdges, CATEGORY_COLORS, CATEGORY_LABELS, RELATION_COLORS } from "../../data/network-data";
import { swot } from "../../data/content";
import type { NetworkNode, NodeCategory } from "../../data/network-data";

interface IssuesBoard3DProps {
  position: [number, number, number];
}

const SWOT_COLORS: Record<string, string> = {
  strengths: "#26a69a",
  weaknesses: "#ef5350",
  opportunities: "#42a5f5",
  threats: "#f5b942",
};

export function IssuesBoard3D({ position }: IssuesBoard3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const appeared = useRef(false);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [innerTab, setInnerTab] = useState<"network" | "swot">("network");

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    elapsed.current += delta;
    const progress = Math.min(1, elapsed.current / 0.8);
    const ease = 1 - Math.pow(1 - progress, 3);
    groupRef.current.scale.setScalar(ease);
    if (!appeared.current && progress > 0.01) appeared.current = true;
    if (appeared.current) {
      groupRef.current.position.y = position[1] + Math.sin(elapsed.current * 0.3) * 3;
    }
  });

  const connectedEdges = selectedNode
    ? issuesEdges.filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
    : [];
  const connectedNodes = selectedNode
    ? issuesNodes.filter((n) => n.id !== selectedNode.id && connectedEdges.some((e) => e.source === n.id || e.target === n.id))
    : [];

  return (
    <group ref={groupRef} position={position} scale={0}>
      {/* 3D Force Graph — positioned in front of board (z forward) */}
      <ForceGraph3D
        nodes={issuesNodes}
        edges={issuesEdges}
        categoryColors={CATEGORY_COLORS as Record<string, string>}
        spread={180}
        selectedId={selectedNode?.id ?? null}
        onSelectNode={(n) => {
          if (!n) { setSelectedNode(null); return; }
          const nn = issuesNodes.find((s) => s.id === n.id) ?? null;
          setSelectedNode(nn);
        }}
        position={[-60, 0, 350]}
      />

      {/* Info Panel */}
      <Html center distanceFactor={780} position={[220, 10, 0]} style={{ pointerEvents: "auto" }}>
        <div style={{
          width: 420, maxHeight: 640, overflowY: "auto",
          background: "rgba(8, 18, 30, 0.82)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(127, 245, 255, 0.12)", borderRadius: 18,
          boxShadow: "0 0 40px rgba(127, 245, 255, 0.06), inset 0 1px 0 rgba(255,255,255,0.05)",
          padding: "20px 22px",
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 12, letterSpacing: "0.02em" }}>
            Issues & Potentials
          </div>

          {/* Tab buttons */}
          <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
            {(["network", "swot"] as const).map((t) => (
              <button key={t} onClick={() => setInnerTab(t)} style={{
                padding: "7px 18px", borderRadius: 10, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
                background: innerTab === t ? "rgba(34,211,238,0.12)" : "rgba(0,0,0,0.2)",
                color: innerTab === t ? "#a5f3fc" : "#94a3b8",
                transition: "all 0.15s",
              }}>
                {t === "network" ? "Network" : "SWOT"}
              </button>
            ))}
          </div>

          {innerTab === "network" && (
            <>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>
                Click a node in the 3D graph to explore connections.
              </div>

              {/* Category legend */}
              <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>Categories</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", fontSize: 11, marginBottom: 10 }}>
                {(Object.entries(CATEGORY_LABELS) as [NodeCategory, string][]).map(([cat, label]) => (
                  <span key={cat} style={{ display: "flex", alignItems: "center", gap: 4, color: "#94a3b8" }}>
                    <span style={{ width: 9, height: 9, borderRadius: "50%", background: CATEGORY_COLORS[cat], flexShrink: 0 }} />
                    {label}
                  </span>
                ))}
              </div>

              {/* Relation legend */}
              <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>Relations</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", fontSize: 11, marginBottom: 10 }}>
                {Object.entries(RELATION_COLORS).map(([key, color]) => (
                  <span key={key} style={{ display: "flex", alignItems: "center", gap: 4, color: "#94a3b8" }}>
                    <span style={{ width: 14, height: 2.5, background: color, borderRadius: 1 }} />
                    {key.charAt(0).toUpperCase() + key.slice(1).replace("-", " ")}
                  </span>
                ))}
              </div>

              {/* Selected Node Details */}
              {selectedNode && (
                <div style={{ borderTop: "1px solid rgba(127,245,255,0.08)", paddingTop: 12, marginTop: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                    <span style={{
                      fontSize: 11, padding: "3px 10px", borderRadius: 10, fontWeight: 600,
                      background: `${CATEGORY_COLORS[selectedNode.category]}22`,
                      color: CATEGORY_COLORS[selectedNode.category],
                    }}>
                      {CATEGORY_LABELS[selectedNode.category]}
                    </span>
                    <button onClick={() => setSelectedNode(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>x</button>
                  </div>

                  <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>
                    {selectedNode.label}
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5, marginBottom: 12 }}>
                    {selectedNode.description}
                  </div>

                  {connectedNodes.length > 0 && (
                    <>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                        Connected To
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {connectedNodes.map((cn) => (
                          <button
                            key={cn.id}
                            onClick={() => setSelectedNode(cn)}
                            style={{
                              fontSize: 11, padding: "5px 10px", borderRadius: 10, border: "none", cursor: "pointer",
                              background: `${CATEGORY_COLORS[cn.category]}22`,
                              color: CATEGORY_COLORS[cn.category],
                              fontWeight: 500,
                            }}
                          >
                            {cn.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {innerTab === "swot" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {(Object.entries(swot) as [string, string[]][]).map(([key, items]) => (
                <div key={key} style={{
                  background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: "10px 12px",
                  borderLeft: `3px solid ${SWOT_COLORS[key]}`,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: SWOT_COLORS[key], textTransform: "capitalize", marginBottom: 6 }}>
                    {key}
                  </div>
                  {items.map((item, i) => (
                    <div key={i} style={{ fontSize: 10, color: "#cbd5e1", lineHeight: 1.5, marginBottom: 4, paddingLeft: 8, borderLeft: "2px solid rgba(255,255,255,0.06)" }}>
                      {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}
