import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { ForceGraph3D } from "./ForceGraph3D";
import { synthesisNodes, synthesisEdges, keyArguments, SYNTHESIS_CATEGORY_COLORS, RELATION_COLORS } from "../../data/network-data";
import type { SynthesisNode } from "../../data/network-data";

interface SynthesisBoard3DProps {
  position: [number, number, number];
}

export function SynthesisBoard3D({ position }: SynthesisBoard3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const appeared = useRef(false);
  const [selectedNode, setSelectedNode] = useState<SynthesisNode | null>(null);
  const [activeFinding, setActiveFinding] = useState<string | null>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    elapsed.current += delta;
    const progress = Math.min(1, elapsed.current / 0.8);
    const ease = 1 - Math.pow(1 - progress, 3);
    groupRef.current.scale.setScalar(ease);
    if (!appeared.current && progress > 0.01) appeared.current = true;
    if (appeared.current) {
      groupRef.current.position.y = position[1] + Math.sin(elapsed.current * 0.3 + 0.5) * 3;
    }
  });

  const activeNode: SynthesisNode | null = activeFinding
    ? synthesisNodes.find((n) => n.id === activeFinding) ?? selectedNode
    : selectedNode;

  const connectedEdges = activeNode
    ? synthesisEdges.filter((e) => e.source === activeNode.id || e.target === activeNode.id)
    : [];
  const connectedNodes = activeNode
    ? synthesisNodes.filter((n) => n.id !== activeNode.id && connectedEdges.some((e) => e.source === n.id || e.target === n.id))
    : [];

  return (
    <group ref={groupRef} position={position} scale={0}>
      {/* 3D Force Graph — positioned in front of board (z forward) */}
      <ForceGraph3D
        nodes={synthesisNodes}
        edges={synthesisEdges}
        categoryColors={SYNTHESIS_CATEGORY_COLORS}
        spread={140}
        selectedId={activeFinding}
        onSelectNode={(n) => {
          if (!n) { setSelectedNode(null); setActiveFinding(null); return; }
          const sn = synthesisNodes.find((s) => s.id === n.id) ?? null;
          setSelectedNode(sn);
          setActiveFinding(sn?.id ?? null);
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
          <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 5, letterSpacing: "0.02em" }}>
            Synthesis — Integrated Findings
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 14 }}>
            How spatial layers connect and what they mean for planning
          </div>

          {/* Key Arguments */}
          <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Key Arguments
          </div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 10, marginBottom: 12 }}>
            {keyArguments.map((ka) => (
              <button
                key={ka.findingId}
                onClick={() => {
                  setActiveFinding(activeFinding === ka.findingId ? null : ka.findingId);
                  const node = synthesisNodes.find((n) => n.id === ka.findingId);
                  if (node) setSelectedNode(node);
                }}
                style={{
                  minWidth: 130, padding: "9px 11px", borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left",
                  background: activeFinding === ka.findingId ? "rgba(239,83,80,0.12)" : "rgba(0,0,0,0.2)",
                  borderTop: activeFinding === ka.findingId ? "2px solid #ef5350" : "2px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    background: activeFinding === ka.findingId ? "#ef5350" : "rgba(239,83,80,0.3)",
                    color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0,
                  }}>
                    {ka.number}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#e2e8f0" }}>{ka.title}</span>
                </div>
                <div style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.3 }}>{ka.subtitle}</div>
              </button>
            ))}
          </div>

          {/* Legends */}
          <div style={{ display: "flex", gap: 18, marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>Categories</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", fontSize: 11 }}>
                {Object.entries(SYNTHESIS_CATEGORY_COLORS).map(([cat, color]) => (
                  <span key={cat} style={{ display: "flex", alignItems: "center", gap: 4, color: "#94a3b8" }}>
                    <span style={{ width: 9, height: 9, borderRadius: "50%", background: color, flexShrink: 0 }} />
                    {cat}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>Relations</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", fontSize: 11 }}>
                {Object.entries(RELATION_COLORS).map(([key, color]) => (
                  <span key={key} style={{ display: "flex", alignItems: "center", gap: 4, color: "#94a3b8" }}>
                    <span style={{ width: 14, height: 2.5, background: color, borderRadius: 1 }} />
                    {key.replace("-", " ")}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Finding Details */}
          {activeNode && (
            <div style={{ borderTop: "1px solid rgba(127,245,255,0.08)", paddingTop: 12, marginTop: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: 11, padding: "3px 10px", borderRadius: 10, fontWeight: 700,
                    background: "rgba(239,83,80,0.15)", color: "#ef5350",
                  }}>
                    {activeNode.id}
                  </span>
                  <span style={{
                    fontSize: 11, padding: "3px 10px", borderRadius: 10, fontWeight: 500,
                    background: `${(SYNTHESIS_CATEGORY_COLORS as Record<string, string>)[activeNode.category] || "#888"}22`,
                    color: (SYNTHESIS_CATEGORY_COLORS as Record<string, string>)[activeNode.category] || "#888",
                    textTransform: "capitalize",
                  }}>
                    {activeNode.category}
                  </span>
                </div>
                <button onClick={() => { setSelectedNode(null); setActiveFinding(null); }} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>x</button>
              </div>

              <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>
                {activeNode.label}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5, marginBottom: 12 }}>
                {activeNode.description}
              </div>

              {activeNode.observation && (
                <>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                    Observations
                  </div>
                  {activeNode.observation.map((obs: string, i: number) => (
                    <div key={i} style={{ fontSize: 11, color: "#cbd5e1", lineHeight: 1.5, marginBottom: 5, paddingLeft: 10, borderLeft: "2px solid rgba(127,245,255,0.15)" }}>
                      {obs}
                    </div>
                  ))}
                  <div style={{ height: 8 }} />
                </>
              )}

              {connectedNodes.length > 0 && (
                <>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                    Linked Findings
                  </div>
                  {connectedNodes.map((cn) => {
                    const edge = connectedEdges.find((e) => e.source === cn.id || e.target === cn.id);
                    return (
                      <button
                        key={cn.id}
                        onClick={() => { setSelectedNode(cn); setActiveFinding(cn.id); }}
                        style={{
                          display: "flex", alignItems: "start", gap: 8, width: "100%", textAlign: "left",
                          background: "rgba(0,0,0,0.15)", borderRadius: 10, padding: "7px 10px", border: "none",
                          cursor: "pointer", marginBottom: 4,
                        }}
                      >
                        <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 6, fontWeight: 700, background: "rgba(239,83,80,0.12)", color: "#ef5350", flexShrink: 0, marginTop: 2 }}>
                          {edge?.relation?.replace("-", " ").toUpperCase()}
                        </span>
                        <span style={{ fontSize: 11, color: "#cbd5e1" }}>
                          <strong style={{ color: "#e2e8f0" }}>{cn.id}</strong> — {cn.label}
                        </span>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}
