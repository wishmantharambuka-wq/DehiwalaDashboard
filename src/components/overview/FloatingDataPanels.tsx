import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { usePopulationData } from "../../hooks/useGeoData";
import { useDashboardStore } from "../../store/useDashboardStore";
import { useProjectedGNDivisions } from "../../hooks/useProjectedGNDivisions";
import type { ProjectedGN } from "../../hooks/useProjectedGNDivisions";

interface FloatingPanelProps {
  position: [number, number, number];
  delay?: number;
  children: React.ReactNode;
  factor?: number;
}

function FloatingPanel({ position, delay = 0, children, factor = 680 }: FloatingPanelProps) {
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
      ref.current.position.y = position[1] + Math.sin(elapsed.current * 0.6) * 2.5;
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

type TabId = "population" | "area" | "density" | "structure";

const TABS: { id: TabId; label: string }[] = [
  { id: "population", label: "Population" },
  { id: "area", label: "Area" },
  { id: "density", label: "Density" },
  { id: "structure", label: "Structure" },
];

interface FloatingDataPanelsProps {
  selected: ProjectedGN;
  tileHeight: number;
}

export function FloatingDataPanels({ selected, tileHeight }: FloatingDataPanelsProps) {
  const { data } = usePopulationData();
  const selectedGN = useDashboardStore((s) => s.selectedGN);
  const setSelectedGN = useDashboardStore((s) => s.setSelectedGN);
  const { divisions } = useProjectedGNDivisions();
  const [activeTab, setActiveTab] = useState<TabId>("population");

  if (!data || !selectedGN) return null;

  const record = data.gnDivisions[selectedGN];
  if (!record) return null;

  const cx = selected.centroid[0];
  const cz = selected.centroid[1];
  const liftY = tileHeight + 150;

  const comparisonData = Object.values(data.gnDivisions)
    .map((d) => ({ name: d.name, value: d.totalPopulation }))
    .sort((a, b) => b.value - a.value);
  const maxPop = comparisonData[0]?.value ?? 1;

  const maxAgeBand = Math.max(...record.ageBands.map((b) => Math.max(b.male, b.female)));

  const allDivisions = divisions.filter((d) => d.population !== null);
  const maxArea = Math.max(...allDivisions.map((d) => d.areaKm2));
  const maxDensity = Math.max(...allDivisions.map((d) => d.densityPerKm2 ?? 0));

  return (
    <>
      {/* Header card with tabs — above tile */}
      <FloatingPanel position={[cx, liftY + 80, cz]} delay={0.1}>
        <div className="glass-panel-solid rounded-2xl px-7 py-5 border border-cyan-400/20 w-[400px]">
          {/* Title row */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-500">GN Division</div>
              <div className="text-xl font-display font-bold text-cyan-200 glow-text">{record.name}</div>
            </div>
            <button
              onClick={() => setSelectedGN(null)}
              className="text-[13px] px-4 py-2 rounded-lg border border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/10 transition-colors"
            >
              ← Back
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06] mb-3">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-2 py-1.5 rounded-md text-[10px] font-display font-semibold tracking-wide transition-all ${
                  activeTab === tab.id
                    ? "bg-cyan-400/15 text-cyan-200 shadow-sm"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick stats (always visible) */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="text-[9px] text-slate-500 uppercase">Pop.</div>
              <div className="text-sm font-display font-bold text-cyan-200">{record.totalPopulation.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500 uppercase">Area</div>
              <div className="text-sm font-display font-bold text-amber-200">{selected.areaKm2.toFixed(2)} km²</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500 uppercase">Density</div>
              <div className="text-sm font-display font-bold text-orange-300">{Math.round(selected.densityPerKm2 ?? 0).toLocaleString()}/km²</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500 uppercase">M / F</div>
              <div className="text-sm font-display font-bold text-teal-200">{record.malePct}/{record.femalePct}</div>
            </div>
          </div>
        </div>
      </FloatingPanel>

      {/* Tab content — positioned around the tile */}

      {activeTab === "population" && (
        <>
          {/* Gender split + comparison bars — left */}
          <FloatingPanel position={[cx - 280, liftY + 10, cz]} delay={0.2}>
            <div className="glass-panel-solid rounded-2xl px-5 py-4 border border-cyan-400/12 w-[310px]">
              <div className="text-[10px] uppercase tracking-widest text-cyan-400/50 mb-2">Gender Breakdown</div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-2xl font-display font-bold text-teal-300">{record.malePct}%</div>
                  <div className="text-[10px] text-slate-500">Male</div>
                  <div className="text-xs font-mono text-slate-400">{record.male.toLocaleString()}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-display font-bold text-rose-300">{record.femalePct}%</div>
                  <div className="text-[10px] text-slate-500">Female</div>
                  <div className="text-xs font-mono text-slate-400">{record.female.toLocaleString()}</div>
                </div>
              </div>
              {/* Donut */}
              <div className="flex justify-center">
                <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#2dd4bf" strokeWidth="4"
                    strokeDasharray={`${record.malePct * 0.88} ${88 - record.malePct * 0.88}`}
                    strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </FloatingPanel>

          {/* Population comparison — right */}
          <FloatingPanel position={[cx + 280, liftY + 10, cz]} delay={0.3}>
            <div className="w-[310px]">
              <div className="text-[10px] font-display font-semibold text-slate-400 mb-2 px-1">
                All Divisions
              </div>
              {comparisonData.map((d, i) => {
                const pct = (d.value / maxPop) * 100;
                const t = comparisonData.length > 1 ? i / (comparisonData.length - 1) : 0;
                const hue = 340 - t * 30;
                const isThis = d.name === selectedGN;
                return (
                  <div key={d.name} className="flex items-center gap-2 h-[18px]">
                    <div className={`w-[60px] text-right text-[9px] font-mono truncate shrink-0 ${isThis ? "text-cyan-300 font-bold" : "text-slate-400"}`}>{d.name}</div>
                    <div className="flex-1">
                      <div
                        className="h-[12px] rounded-full"
                        style={{
                          width: `${Math.max(pct, 4)}%`,
                          background: isThis
                            ? "linear-gradient(to right, #0ea5e9, #7ff5ff)"
                            : `linear-gradient(to right, hsl(${hue}, 55%, 45%), hsl(${hue}, 65%, 62%))`,
                          boxShadow: isThis ? "0 0 10px #7ff5ff44" : "none",
                          transition: `width 1s cubic-bezier(0.22,1,0.36,1) ${i * 0.04}s`,
                        }}
                      />
                    </div>
                    <div className="w-[32px] text-[9px] font-mono text-slate-500 shrink-0">{(d.value / 1000).toFixed(1)}k</div>
                  </div>
                );
              })}
            </div>
          </FloatingPanel>
        </>
      )}

      {activeTab === "area" && (
        <>
          {/* Area detail — left */}
          <FloatingPanel position={[cx - 280, liftY + 10, cz]} delay={0.15}>
            <div className="glass-panel-solid rounded-2xl px-5 py-4 border border-amber-400/12 w-[310px]">
              <div className="text-[10px] uppercase tracking-widest text-amber-400/50 mb-2">Area Details</div>
              <div className="text-center mb-3">
                <div className="text-3xl font-display font-bold text-amber-200">{selected.areaKm2.toFixed(3)}</div>
                <div className="text-xs text-slate-500">km²</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-[9px] text-slate-500 uppercase">In m²</div>
                  <div className="text-sm font-mono text-slate-300">{Math.round(selected.areaM2).toLocaleString()}</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] text-slate-500 uppercase">Hectares</div>
                  <div className="text-sm font-mono text-slate-300">{(selected.areaM2 / 10000).toFixed(2)}</div>
                </div>
              </div>
            </div>
          </FloatingPanel>

          {/* Area comparison — right */}
          <FloatingPanel position={[cx + 280, liftY + 10, cz]} delay={0.25}>
            <div className="w-[310px]">
              <div className="text-[10px] font-display font-semibold text-slate-400 mb-2 px-1">
                Area Comparison
              </div>
              {allDivisions
                .sort((a, b) => b.areaKm2 - a.areaKm2)
                .map((d, i) => {
                  const pct = maxArea > 0 ? (d.areaKm2 / maxArea) * 100 : 0;
                  const isThis = d.name === selectedGN;
                  return (
                    <div key={d.name} className="flex items-center gap-2 h-[18px]">
                      <div className={`w-[60px] text-right text-[9px] font-mono truncate shrink-0 ${isThis ? "text-amber-300 font-bold" : "text-slate-400"}`}>{d.name}</div>
                      <div className="flex-1">
                        <div
                          className="h-[12px] rounded-full"
                          style={{
                            width: `${Math.max(pct, 4)}%`,
                            background: isThis
                              ? "linear-gradient(to right, #d97706, #fbbf24)"
                              : "linear-gradient(to right, #92400e66, #b4560088)",
                            boxShadow: isThis ? "0 0 10px #fbbf2444" : "none",
                            transition: `width 1s cubic-bezier(0.22,1,0.36,1) ${i * 0.04}s`,
                          }}
                        />
                      </div>
                      <div className="w-[40px] text-[9px] font-mono text-slate-500 shrink-0">{d.areaKm2.toFixed(2)}</div>
                    </div>
                  );
                })}
            </div>
          </FloatingPanel>
        </>
      )}

      {activeTab === "density" && (
        <>
          {/* Density detail — left */}
          <FloatingPanel position={[cx - 280, liftY + 10, cz]} delay={0.15}>
            <div className="glass-panel-solid rounded-2xl px-5 py-4 border border-orange-400/12 w-[310px]">
              <div className="text-[10px] uppercase tracking-widest text-orange-400/50 mb-2">Density Details</div>
              <div className="text-center mb-3">
                <div className="text-3xl font-display font-bold text-orange-300">{Math.round(selected.densityPerKm2 ?? 0).toLocaleString()}</div>
                <div className="text-xs text-slate-500">persons / km²</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-[9px] text-slate-500 uppercase">Population</div>
                  <div className="text-sm font-mono text-slate-300">{record.totalPopulation.toLocaleString()}</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] text-slate-500 uppercase">Area</div>
                  <div className="text-sm font-mono text-slate-300">{selected.areaKm2.toFixed(3)} km²</div>
                </div>
              </div>
            </div>
          </FloatingPanel>

          {/* Density comparison — right */}
          <FloatingPanel position={[cx + 280, liftY + 10, cz]} delay={0.25}>
            <div className="w-[310px]">
              <div className="text-[10px] font-display font-semibold text-slate-400 mb-2 px-1">
                Density Comparison
              </div>
              {allDivisions
                .sort((a, b) => (b.densityPerKm2 ?? 0) - (a.densityPerKm2 ?? 0))
                .map((d, i) => {
                  const pct = maxDensity > 0 ? ((d.densityPerKm2 ?? 0) / maxDensity) * 100 : 0;
                  const isThis = d.name === selectedGN;
                  return (
                    <div key={d.name} className="flex items-center gap-2 h-[18px]">
                      <div className={`w-[60px] text-right text-[9px] font-mono truncate shrink-0 ${isThis ? "text-orange-300 font-bold" : "text-slate-400"}`}>{d.name}</div>
                      <div className="flex-1">
                        <div
                          className="h-[12px] rounded-full"
                          style={{
                            width: `${Math.max(pct, 4)}%`,
                            background: isThis
                              ? "linear-gradient(to right, #ea580c, #fb923c)"
                              : "linear-gradient(to right, #7c2d1266, #9a3412aa)",
                            boxShadow: isThis ? "0 0 10px #fb923c44" : "none",
                            transition: `width 1s cubic-bezier(0.22,1,0.36,1) ${i * 0.04}s`,
                          }}
                        />
                      </div>
                      <div className="w-[40px] text-[9px] font-mono text-slate-500 shrink-0">{Math.round(d.densityPerKm2 ?? 0).toLocaleString()}</div>
                    </div>
                  );
                })}
            </div>
          </FloatingPanel>
        </>
      )}

      {activeTab === "structure" && (
        <>
          {/* Age pyramid — left (same graph style as before) */}
          <FloatingPanel position={[cx - 280, liftY + 10, cz]} delay={0.15}>
            <div className="w-[310px]">
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#e87898" }} />
                  <span className="text-[9px] text-slate-500">Male</span>
                </div>
                <span className="text-[10px] font-display font-semibold text-slate-400">Age Pyramid</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-slate-500">Female</span>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#4dd8e6" }} />
                </div>
              </div>
              {record.ageBands.map((band, i) => {
                const leftPct = maxAgeBand > 0 ? (band.male / maxAgeBand) * 100 : 0;
                const rightPct = maxAgeBand > 0 ? (band.female / maxAgeBand) * 100 : 0;
                return (
                  <div key={band.band} className="flex items-center gap-0 h-[15px]">
                    <div className="flex-1 flex justify-end">
                      <div
                        className="h-[11px] rounded-l-full"
                        style={{
                          width: `${leftPct}%`,
                          background: "linear-gradient(to left, #e87898, #e8789866)",
                          transition: `width 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.03}s`,
                        }}
                      />
                    </div>
                    <div className="w-[36px] text-center text-[7px] font-mono text-slate-400 shrink-0 px-0.5">
                      {band.band}
                    </div>
                    <div className="flex-1 flex justify-start">
                      <div
                        className="h-[11px] rounded-r-full"
                        style={{
                          width: `${rightPct}%`,
                          background: "linear-gradient(to right, #4dd8e6, #4dd8e666)",
                          transition: `width 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.03}s`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </FloatingPanel>

          {/* Age band table — right */}
          <FloatingPanel position={[cx + 280, liftY + 10, cz]} delay={0.25}>
            <div className="glass-panel-solid rounded-2xl px-4 py-3 border border-violet-400/12 w-[300px]">
              <div className="text-[10px] uppercase tracking-widest text-violet-400/50 mb-2">Age Distribution</div>
              <div className="space-y-0.5">
                {record.ageBands.slice(0, 10).map((band) => {
                  const total = band.male + band.female;
                  const pct = record.totalPopulation > 0 ? ((total / record.totalPopulation) * 100).toFixed(1) : "0";
                  return (
                    <div key={band.band} className="flex items-center justify-between text-[9px]">
                      <span className="text-slate-400 font-mono w-[40px]">{band.band}</span>
                      <span className="text-slate-500 font-mono">{total.toLocaleString()}</span>
                      <div className="w-[50px] h-[6px] bg-white/[0.04] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-violet-400/60" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-violet-300 font-mono w-[30px] text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </FloatingPanel>
        </>
      )}
    </>
  );
}
