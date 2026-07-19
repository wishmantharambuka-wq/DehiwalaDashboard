import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { usePopulationData } from "../../hooks/useGeoData";
import { useDashboardStore } from "../../store/useDashboardStore";
import { useProjectedGNDivisions } from "../../hooks/useProjectedGNDivisions";

function FloatingPanel({
  position,
  delay = 0,
  children,
  factor = 600,
}: {
  position: [number, number, number];
  delay?: number;
  children: React.ReactNode;
  factor?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const appeared = useRef(false);

  useFrame((_, delta) => {
    if (!ref.current) return;
    elapsed.current += delta;
    const t = Math.max(0, elapsed.current - delay);
    const progress = Math.min(1, t / 0.7);
    const ease = 1 - Math.pow(1 - progress, 3);
    ref.current.scale.setScalar(ease);
    if (!appeared.current) {
      ref.current.position.y = position[1] + (1 - ease) * 40;
      if (progress > 0.01) appeared.current = true;
    }
    if (appeared.current) {
      ref.current.position.y = position[1] + Math.sin(elapsed.current * 0.5) * 2;
    }
  });

  return (
    <group ref={ref} position={position} scale={0}>
      <Html center distanceFactor={factor} style={{ pointerEvents: "auto" }}>
        {children}
      </Html>
    </group>
  );
}

function CompBar({
  labelA,
  labelB,
  valA,
  valB,
  maxVal,
  colorA,
  colorB,
  format,
}: {
  labelA: string;
  labelB: string;
  valA: number;
  valB: number;
  maxVal: number;
  colorA: string;
  colorB: string;
  format: (v: number) => string;
}) {
  const pctA = maxVal > 0 ? (valA / maxVal) * 100 : 0;
  const pctB = maxVal > 0 ? (valB / maxVal) * 100 : 0;
  const diff = valA - valB;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: colorA, fontWeight: 600 }}>{labelA}</span>
        <span style={{ color: "#64748b", fontFamily: "monospace", fontSize: 10 }}>
          {diff > 0 ? "+" : ""}{format(diff)}
        </span>
        <span style={{ color: colorB, fontWeight: 600 }}>{labelB}</span>
      </div>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <div
            style={{
              height: 18,
              width: `${Math.max(pctA, 6)}%`,
              background: `linear-gradient(to left, ${colorA}, ${colorA}88)`,
              borderRadius: "6px 2px 2px 6px",
              transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)",
            }}
          />
        </div>
        <div style={{ width: 56, textAlign: "center", fontSize: 12, fontFamily: "monospace", color: "#e2e8f0", fontWeight: 700, flexShrink: 0 }}>
          vs
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              height: 18,
              width: `${Math.max(pctB, 6)}%`,
              background: `linear-gradient(to right, ${colorB}, ${colorB}88)`,
              borderRadius: "2px 6px 6px 2px",
              transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)",
            }}
          />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontFamily: "monospace", color: "#cbd5e1", marginTop: 3 }}>
        <span>{format(valA)}</span>
        <span>{format(valB)}</span>
      </div>
    </div>
  );
}

interface ComparisonPanels3DProps {
  pinnedGNs: [string, string];
  center: [number, number];
  citySpan: number;
}

export function ComparisonPanels3D({ pinnedGNs, center, citySpan }: ComparisonPanels3DProps) {
  const { data } = usePopulationData();
  const { divisions } = useProjectedGNDivisions();
  const clearPins = useDashboardStore((s) => s.clearPins);
  const togglePinGN = useDashboardStore((s) => s.togglePinGN);

  const divA = divisions.find((d) => d.name === pinnedGNs[0]);
  const divB = divisions.find((d) => d.name === pinnedGNs[1]);
  const recA = data?.gnDivisions[pinnedGNs[0]];
  const recB = data?.gnDivisions[pinnedGNs[1]];

  if (!divA || !divB || !recA || !recB) return null;

  const cx = center[0];
  const cz = center[1];
  const baseY = 380;

  const colorA = "#22d3ee";
  const colorB = "#f59e0b";

  const maxPop = Math.max(recA.totalPopulation, recB.totalPopulation);
  const maxArea = Math.max(divA.areaKm2, divB.areaKm2);
  const maxDensity = Math.max(divA.densityPerKm2 ?? 0, divB.densityPerKm2 ?? 0);

  const maxAgeBand = Math.max(
    ...recA.ageBands.map((b) => Math.max(b.male, b.female)),
    ...recB.ageBands.map((b) => Math.max(b.male, b.female)),
  );

  return (
    <>
      {/* Card 1: Header + Key Metrics */}
      <FloatingPanel position={[cx, baseY + 100, cz]} delay={0.1} factor={720}>
        <div
          style={{
            width: 500,
            background: "rgba(8, 18, 30, 0.82)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(127, 245, 255, 0.12)",
            borderRadius: 16,
            boxShadow: "0 0 40px rgba(127, 245, 255, 0.06), inset 0 1px 0 rgba(255,255,255,0.05)",
            padding: "18px 22px",
          }}
        >
          {/* Title row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.02em" }}>
              GN Division Comparison
            </div>
            <button
              onClick={clearPins}
              style={{
                fontSize: 12, padding: "4px 12px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)",
                background: "rgba(239,68,68,0.08)", color: "#f87171", cursor: "pointer",
              }}
            >
              Clear Pins
            </button>
          </div>

          {/* Names */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", background: colorA }} />
              <span style={{ fontSize: 16, fontWeight: 700, color: colorA }}>{recA.name}</span>
              <button onClick={() => togglePinGN(pinnedGNs[0])} style={{ fontSize: 10, color: "#64748b", background: "none", border: "none", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => togglePinGN(pinnedGNs[1])} style={{ fontSize: 10, color: "#64748b", background: "none", border: "none", cursor: "pointer" }}>✕</button>
              <span style={{ fontSize: 16, fontWeight: 700, color: colorB }}>{recB.name}</span>
              <span style={{ width: 12, height: 12, borderRadius: "50%", background: colorB }} />
            </div>
          </div>

          {/* Metrics comparison bars */}
          <CompBar labelA="Population" labelB="Population" valA={recA.totalPopulation} valB={recB.totalPopulation} maxVal={maxPop} colorA={colorA} colorB={colorB} format={(v) => Math.abs(v).toLocaleString()} />
          <CompBar labelA="Area" labelB="Area" valA={divA.areaKm2} valB={divB.areaKm2} maxVal={maxArea} colorA={colorA} colorB={colorB} format={(v) => Math.abs(v).toFixed(2) + " km²"} />
          <CompBar labelA="Density" labelB="Density" valA={divA.densityPerKm2 ?? 0} valB={divB.densityPerKm2 ?? 0} maxVal={maxDensity} colorA={colorA} colorB={colorB} format={(v) => Math.round(Math.abs(v)).toLocaleString() + "/km²"} />
        </div>
      </FloatingPanel>

      {/* Card 2: Demographics — Gender & Population */}
      <FloatingPanel position={[cx - 340, baseY, cz]} delay={0.2} factor={720}>
        <div
          style={{
            width: 340,
            background: "rgba(8, 18, 30, 0.82)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(127, 245, 255, 0.08)",
            borderRadius: 16,
            boxShadow: "0 0 30px rgba(127, 245, 255, 0.04)",
            padding: "16px 18px",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
            Gender Breakdown
          </div>

          {/* Two donut charts side by side */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 12 }}>
            {[{ rec: recA, color: colorA }, { rec: recB, color: colorB }].map(({ rec, color }) => (
              <div key={rec.name} style={{ textAlign: "center" }}>
                <svg viewBox="0 0 36 36" style={{ width: 72, height: 72, transform: "rotate(-90deg)" }}>
                  <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke={color} strokeWidth="4"
                    strokeDasharray={`${rec.malePct * 0.88} ${88 - rec.malePct * 0.88}`}
                    strokeLinecap="round" />
                </svg>
                <div style={{ fontSize: 13, fontWeight: 700, color, marginTop: 4 }}>{rec.name}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>
                  M {rec.malePct}% / F {rec.femalePct}%
                </div>
              </div>
            ))}
          </div>

          {/* Population comparison */}
          <div style={{ borderTop: "1px solid rgba(127,245,255,0.06)", paddingTop: 10 }}>
            <div style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Male / Female</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[{ rec: recA, color: colorA }, { rec: recB, color: colorB }].map(({ rec, color }) => (
                <div key={rec.name} style={{ background: `${color}08`, borderRadius: 8, padding: "6px 8px" }}>
                  <div style={{ fontSize: 9, color, fontWeight: 600, marginBottom: 4 }}>{rec.name}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "monospace" }}>
                    <span style={{ color: "#2dd4bf" }}>{rec.male.toLocaleString()}</span>
                    <span style={{ color: "#fb7185" }}>{rec.female.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#64748b" }}>
                    <span>Male</span>
                    <span>Female</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FloatingPanel>

      {/* Card 3: Age Structure Comparison */}
      <FloatingPanel position={[cx + 340, baseY, cz]} delay={0.3} factor={720}>
        <div
          style={{
            width: 350,
            background: "rgba(8, 18, 30, 0.82)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(127, 245, 255, 0.08)",
            borderRadius: 16,
            boxShadow: "0 0 30px rgba(127, 245, 255, 0.04)",
            padding: "16px 18px",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
            Age Distribution
          </div>
          <div style={{ display: "flex", gap: 10, fontSize: 12, marginBottom: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 10, height: 4, borderRadius: 2, background: colorA }} />
              <span style={{ color: colorA }}>{recA.name}</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 10, height: 4, borderRadius: 2, background: colorB }} />
              <span style={{ color: colorB }}>{recB.name}</span>
            </span>
          </div>

          {/* Overlaid age bars */}
          {recA.ageBands.map((bandA, i) => {
            const bandB = recB.ageBands[i];
            if (!bandB) return null;
            const totalA = bandA.male + bandA.female;
            const totalB = bandB.male + bandB.female;
            const pctA = maxAgeBand > 0 ? (totalA / (maxAgeBand * 2)) * 100 : 0;
            const pctB = maxAgeBand > 0 ? (totalB / (maxAgeBand * 2)) * 100 : 0;
            return (
              <div key={bandA.band} style={{ display: "flex", alignItems: "center", gap: 0, height: 16, marginBottom: 1 }}>
                <div style={{ width: 32, textAlign: "right", fontSize: 7, fontFamily: "monospace", color: "#64748b", paddingRight: 4, flexShrink: 0 }}>
                  {bandA.band}
                </div>
                <div style={{ flex: 1, position: "relative", height: 12 }}>
                  <div
                    style={{
                      position: "absolute", top: 0, left: 0, height: 6,
                      width: `${Math.max(pctA, 2)}%`,
                      background: `linear-gradient(to right, ${colorA}cc, ${colorA}44)`,
                      borderRadius: "0 3px 3px 0",
                      transition: "width 0.6s cubic-bezier(0.22,1,0.36,1)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute", top: 6, left: 0, height: 6,
                      width: `${Math.max(pctB, 2)}%`,
                      background: `linear-gradient(to right, ${colorB}cc, ${colorB}44)`,
                      borderRadius: "0 3px 3px 0",
                      transition: "width 0.6s cubic-bezier(0.22,1,0.36,1)",
                    }}
                  />
                </div>
                <div style={{ width: 50, display: "flex", justifyContent: "space-between", fontSize: 7, fontFamily: "monospace", flexShrink: 0, paddingLeft: 4 }}>
                  <span style={{ color: colorA }}>{totalA}</span>
                  <span style={{ color: colorB }}>{totalB}</span>
                </div>
              </div>
            );
          })}
        </div>
      </FloatingPanel>
    </>
  );
}
