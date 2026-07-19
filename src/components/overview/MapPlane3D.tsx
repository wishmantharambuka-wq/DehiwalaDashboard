import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { MapCanvas } from "../maps/MapCanvas";
import { GNBoundariesLayer } from "../maps/GNBoundariesLayer";
import { LanduseLayer } from "../maps/LanduseLayer";
import { GridAnalysisLayer } from "../maps/GridAnalysisLayer";
import { CentralityNetworkLayer } from "../maps/CentralityNetworkLayer";
import { UHIOverlayLayer } from "../maps/UHIOverlayLayer";
import { useDashboardStore } from "../../store/useDashboardStore";

interface MapPlane3DProps {
  position: [number, number, number];
}

export function MapPlane3D({ position }: MapPlane3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const appeared = useRef(false);

  const layers = useDashboardStore((s) => s.layers);
  const gridMetric = useDashboardStore((s) => s.gridMetric);
  const centralityMetric = useDashboardStore((s) => s.centralityMetric);
  const centralityRadius = useDashboardStore((s) => s.centralityRadius);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    elapsed.current += delta;

    const progress = Math.min(1, elapsed.current / 0.8);
    const ease = 1 - Math.pow(1 - progress, 3);
    groupRef.current.scale.setScalar(ease);

    if (!appeared.current && progress > 0.01) {
      appeared.current = true;
    }
    if (appeared.current) {
      groupRef.current.position.y = position[1] + Math.sin(elapsed.current * 0.3) * 3;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, 0, 0]}
      scale={0}
    >
      <Html
        center
        distanceFactor={780}
        style={{ pointerEvents: "auto" }}
      >
        <div
          style={{
            width: 740,
            height: 520,
            background: "rgba(8, 18, 30, 0.55)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(127, 245, 255, 0.15)",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 0 40px rgba(127, 245, 255, 0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <MapCanvas>
            {layers.landuse && <LanduseLayer />}
            {layers.gridAnalysis && <GridAnalysisLayer metric={gridMetric} />}
            {layers.urbanMaturation && <GridAnalysisLayer metric="UMI" />}
            {layers.centralityNetwork && (
              <CentralityNetworkLayer metric={centralityMetric} radius={centralityRadius} />
            )}
            {layers.urbanHeat && <UHIOverlayLayer />}
            {layers.gnBoundaries && <GNBoundariesLayer />}
          </MapCanvas>
        </div>
      </Html>
    </group>
  );
}

interface LayerControlPanel3DProps {
  position: [number, number, number];
}

function ToggleSwitch({ on, onClick, color, label }: { on: boolean; onClick: () => void; color: string; label: string }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0, width: "100%", textAlign: "left" }}>
      <span style={{ width: 28, height: 16, borderRadius: 8, background: on ? "rgba(34,211,238,0.5)" : "rgba(51,65,85,0.6)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
        <span style={{ position: "absolute", top: 2, left: on ? 14 : 2, width: 12, height: 12, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
      </span>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 11, color: on ? "#e2e8f0" : "#94a3b8", transition: "color 0.2s" }}>{label}</span>
    </button>
  );
}

function SegmentBtn({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: "3px 6px", borderRadius: 6, fontSize: 10, fontWeight: 500, border: "none", cursor: "pointer", whiteSpace: "nowrap",
        background: active ? "rgba(34,211,238,0.15)" : "transparent",
        color: active ? "#a5f3fc" : "#94a3b8",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "4px 0" }} />;
}

function SectionLabel({ children }: { children: string }) {
  return <div style={{ fontSize: 9, letterSpacing: "0.1em", color: "rgba(148,163,184,0.6)", textTransform: "uppercase", fontWeight: 600, marginTop: 2 }}>{children}</div>;
}

export function LayerControlPanel3D({ position }: LayerControlPanel3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const appeared = useRef(false);

  const layers = useDashboardStore((s) => s.layers);
  const toggleLayer = useDashboardStore((s) => s.toggleLayer);
  const centralityMetric = useDashboardStore((s) => s.centralityMetric);
  const setCentralityMetric = useDashboardStore((s) => s.setCentralityMetric);
  const centralityRadius = useDashboardStore((s) => s.centralityRadius);
  const setCentralityRadius = useDashboardStore((s) => s.setCentralityRadius);
  const gridMetric = useDashboardStore((s) => s.gridMetric);
  const setGridMetric = useDashboardStore((s) => s.setGridMetric);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    elapsed.current += delta;
    const progress = Math.min(1, elapsed.current / 0.8);
    const ease = 1 - Math.pow(1 - progress, 3);
    groupRef.current.scale.setScalar(ease);
    if (!appeared.current && progress > 0.01) appeared.current = true;
    if (appeared.current) {
      groupRef.current.position.y = position[1] + Math.sin(elapsed.current * 0.4 + 1) * 2;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={0}>
      <Html
        center
        distanceFactor={780}
        style={{ pointerEvents: "auto" }}
      >
        <div
          style={{
            width: 230,
            maxHeight: 520,
            overflowY: "auto",
            padding: "14px 16px",
            background: "rgba(8, 18, 30, 0.7)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(127, 245, 255, 0.12)",
            borderRadius: 14,
            boxShadow: "0 0 30px rgba(127, 245, 255, 0.06), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: "0.1em", color: "rgba(148,163,184,0.7)", textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>
            Layer Controls
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <ToggleSwitch on={layers.gnBoundaries} onClick={() => toggleLayer("gnBoundaries")} color="#7ff5ff" label="GN Boundaries" />
            <ToggleSwitch on={layers.landuse} onClick={() => toggleLayer("landuse")} color="#f5b942" label="Land Use" />

            {layers.landuse && (
              <>
                <Divider />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 10px", fontSize: 10, color: "#cbd5e1" }}>
                  {[
                    ["Residential", "#64b5f6"], ["Transport", "#ffa726"], ["Commercial", "#ab47bc"],
                    ["Institutional", "#26a69a"], ["Public Space", "#66bb6a"], ["Water", "#42a5f5"],
                    ["Cultural", "#ef5350"], ["Coastal area", "#29b6f6"], ["Industrial", "#8d6e63"],
                  ].map(([l, c]) => (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: c, flexShrink: 0 }} />
                      <span style={{ fontSize: 9 }}>{l}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <Divider />
            <ToggleSwitch on={layers.centralityNetwork} onClick={() => toggleLayer("centralityNetwork")} color="#ff6bf0" label="Centrality" />

            {layers.centralityNetwork && (
              <>
                <SectionLabel>Centrality type</SectionLabel>
                <div style={{ display: "flex", gap: 2, background: "rgba(0,0,0,0.25)", borderRadius: 8, padding: 2 }}>
                  <SegmentBtn active={centralityMetric === "closeness"} label="Closeness" onClick={() => setCentralityMetric("closeness")} />
                  <SegmentBtn active={centralityMetric === "betweenness"} label="Betweenness" onClick={() => setCentralityMetric("betweenness")} />
                </div>
                <SectionLabel>Radius</SectionLabel>
                <div style={{ display: "flex", gap: 2, background: "rgba(0,0,0,0.25)", borderRadius: 8, padding: 2 }}>
                  <SegmentBtn active={centralityRadius === 500} label="500m" onClick={() => setCentralityRadius(500)} />
                  <SegmentBtn active={centralityRadius === 2000} label="2000m" onClick={() => setCentralityRadius(2000)} />
                  <SegmentBtn active={centralityRadius === 5000} label="5000m" onClick={() => setCentralityRadius(5000)} />
                </div>
                <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 2 }}>
                  {centralityMetric === "closeness" ? "Closeness" : "Betweenness"} · R{centralityRadius}m
                </div>
                <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden" }}>
                  {["#1a0533", "#6b21a8", "#c026d3", "#f472b6", "#fdf4ff"].map((c, i) => (
                    <div key={i} style={{ flex: 1, background: c }} />
                  ))}
                </div>
              </>
            )}

            <Divider />
            <ToggleSwitch on={layers.gridAnalysis} onClick={() => toggleLayer("gridAnalysis")} color="#50fa7b" label="Density" />

            {layers.gridAnalysis && (
              <>
                <SectionLabel>Density metric</SectionLabel>
                <div style={{ display: "flex", gap: 2, background: "rgba(0,0,0,0.25)", borderRadius: 8, padding: 2, flexWrap: "wrap" }}>
                  {(["FSI", "GSI", "OSR", "entropyIndex"] as const).map((m) => (
                    <SegmentBtn key={m} active={gridMetric === m} label={m === "entropyIndex" ? "Entropy" : m} onClick={() => setGridMetric(m)} />
                  ))}
                </div>
                <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden" }}>
                  {["#0d1b2a", "#1b4332", "#2d6a4f", "#52b788", "#95d5b2"].map((c, i) => (
                    <div key={i} style={{ flex: 1, background: c }} />
                  ))}
                </div>
              </>
            )}

            <Divider />
            <ToggleSwitch on={layers.urbanMaturation} onClick={() => toggleLayer("urbanMaturation")} color="#bd93f9" label="Maturation (UMI)" />

            {layers.urbanMaturation && (
              <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden" }}>
                {["#0d1b2a", "#1b4332", "#2d6a4f", "#52b788", "#95d5b2"].map((c, i) => (
                  <div key={i} style={{ flex: 1, background: c }} />
                ))}
              </div>
            )}

            <Divider />
            <ToggleSwitch on={layers.urbanHeat} onClick={() => toggleLayer("urbanHeat")} color="#e84030" label="Urban Heat Island" />

            {layers.urbanHeat && (
              <>
                <div style={{ fontSize: 9, color: "#94a3b8" }}>Surface Temperature</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 9, color: "#67e8f9", fontFamily: "monospace" }}>31.5°C</span>
                  <div style={{ flex: 1, height: 8, borderRadius: 4, background: "linear-gradient(to right, #0a2878, #1e8cc8, #32c864, #c8dc32, #f0961e, #c81e1e)" }} />
                  <span style={{ fontSize: 9, color: "#fb7185", fontFamily: "monospace" }}>42.7°C</span>
                </div>
              </>
            )}
          </div>
        </div>
      </Html>
    </group>
  );
}
