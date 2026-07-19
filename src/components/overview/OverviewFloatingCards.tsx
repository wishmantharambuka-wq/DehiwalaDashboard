import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { usePopulationData, useLanduse } from "../../hooks/useGeoData";
import { useClimate } from "../../hooks/useClimate";
import { useForecast } from "../../hooks/useForecast";
import { useProjectedGNDivisions } from "../../hooks/useProjectedGNDivisions";
import { DEHIWALA_COORDS } from "../../config";
import type { LanduseProperties } from "../../types";
import type { Feature } from "geojson";

const CARD_FACTOR = 960;

interface FloatingCardProps {
  position: [number, number, number];
  delay?: number;
  factor?: number;
  floatAmp?: number;
  floatSpeed?: number;
  children: React.ReactNode;
}

function FloatingCard({ position, delay = 0, factor = CARD_FACTOR, floatAmp = 3.5, floatSpeed = 0.5, children }: FloatingCardProps) {
  const ref = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const appeared = useRef(false);

  useFrame((_, delta) => {
    if (!ref.current) return;
    elapsed.current += delta;
    const t = Math.max(0, elapsed.current - delay);
    const progress = Math.min(1, t / 0.8);
    const ease = 1 - Math.pow(1 - progress, 3);
    ref.current.scale.setScalar(ease);
    if (!appeared.current) {
      ref.current.position.y = position[1] + (1 - ease) * 50;
      if (progress > 0.01) appeared.current = true;
    }
    if (appeared.current) {
      ref.current.position.y = position[1] + Math.sin(elapsed.current * floatSpeed + delay * 2) * floatAmp;
    }
  });

  return (
    <group ref={ref} position={position} scale={0}>
      <Html center distanceFactor={factor} style={{ pointerEvents: "none" }}>
        {children}
      </Html>
    </group>
  );
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDay(ts: number) {
  return new Date(ts).toLocaleDateString([], { weekday: "short" });
}

function MiniSparkline({ data, color, height = 56, width = 320 }: { data: number[]; color: string; height?: number; width?: number }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${height - ((v - min) / range) * (height - 6) - 3}`).join(" ");
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  const id = `sg-${color.replace("#", "")}-${width}-${height}`;

  return (
    <svg width={width} height={height} className="block">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${id})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        const y = height - ((v - min) / range) * (height - 6) - 3;
        return <circle key={i} cx={i * step} cy={y} r="2" fill={color} opacity="0.6" />;
      })}
    </svg>
  );
}

function CardShell({
  accent,
  children,
  width = 460,
  icon,
}: {
  accent: string;
  children: React.ReactNode;
  width?: number;
  icon?: string;
}) {
  return (
    <div
      style={{
        width,
        background: "rgba(8, 18, 30, 0.85)",
        backdropFilter: "blur(20px)",
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.06)",
        borderLeft: `3px solid ${accent}`,
        boxShadow: `0 4px 30px rgba(0,0,0,0.3), 0 0 40px ${accent}08, inset 0 1px 0 rgba(255,255,255,0.04)`,
        padding: "20px 24px",
        position: "relative" as const,
        overflow: "hidden" as const,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(to right, ${accent}60, transparent)`,
        }}
      />
      {icon && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 16,
            fontSize: 28,
            opacity: 0.12,
          }}
        >
          {icon}
        </div>
      )}
      {children}
    </div>
  );
}

/* ─── Ring position helper ──────────────────────────────
 *  Places cards on a circle around (cx, cz).
 *  angleSlot: index (0-based) into N evenly-spaced slots
 *  N: total number of slots
 *  radius: ring radius in world units
 *  baseY: centre Y height
 *  yOffset: per-card vertical variation
 * ───────────────────────────────────────────────────── */
function ringPos(
  cx: number, cz: number,
  angleSlot: number, N: number,
  radius: number, baseY: number, yOffset = 0,
): [number, number, number] {
  const angle = (angleSlot / N) * Math.PI * 2 - Math.PI / 2;
  return [
    cx + Math.cos(angle) * radius,
    baseY + yOffset,
    cz + Math.sin(angle) * radius,
  ];
}

interface OverviewFloatingCardsProps {
  center: [number, number];
  citySpan: number;
}

export function OverviewFloatingCards({ center, citySpan }: OverviewFloatingCardsProps) {
  const { data: popData } = usePopulationData();
  const { data: climate } = useClimate(DEHIWALA_COORDS);
  const { data: forecast } = useForecast(DEHIWALA_COORDS);
  const { divisions } = useProjectedGNDivisions();
  const lu = useLanduse();

  const cx = center[0];
  const cz = center[1];
  const radius = citySpan * 0.6;
  const baseY = 120;
  const N = 13;

  const tempHistory = forecast?.slice(0, 16).map((p) => p.tempC) ?? [];
  const humidityHistory = forecast?.slice(0, 16).map((p) => p.humidity) ?? [];
  const windHistory = forecast?.slice(0, 16).map((p) => p.windSpeedMs) ?? [];
  const rainHistory = forecast?.slice(0, 16).map((p) => p.pop * 100) ?? [];

  const dailyForecast = forecast
    ? [0, 8, 16, 24, 32].map((i) => forecast[Math.min(i, forecast.length - 1)]).filter(Boolean)
    : [];

  const totalAreaKm2 = useMemo(() => divisions.reduce((s, d) => s + d.areaKm2, 0), [divisions]);
  const avgDensity = useMemo(() => {
    const withDensity = divisions.filter((d) => d.densityPerKm2 !== null);
    if (!withDensity.length) return 0;
    return withDensity.reduce((s, d) => s + (d.densityPerKm2 ?? 0), 0) / withDensity.length;
  }, [divisions]);

  const totalPopulation = popData?.cityAggregate.totalPopulation ?? 0;
  const overallDensity = totalAreaKm2 > 0 ? totalPopulation / totalAreaKm2 : avgDensity;

  const landuseBreakdown = useMemo(() => {
    if (!lu.data) return [];
    const features = lu.data.features as unknown as Feature<GeoJSON.Geometry, LanduseProperties>[];
    const map: Record<string, number> = {};
    let total = 0;
    for (const f of features) {
      const a = f.properties.areaM2 || 0;
      map[f.properties.mainClass] = (map[f.properties.mainClass] || 0) + a;
      total += a;
    }
    return Object.entries(map)
      .map(([name, area]) => ({ name, area, pct: total > 0 ? (area / total) * 100 : 0 }))
      .sort((a, b) => b.area - a.area)
      .slice(0, 8);
  }, [lu.data]);

  const builtUpPct = useMemo(() => {
    if (!lu.data) return null;
    const features = lu.data.features as unknown as Feature<GeoJSON.Geometry, LanduseProperties>[];
    let built = 0, total = 0;
    for (const f of features) {
      const a = f.properties.areaM2 || 0;
      total += a;
      if (f.properties.domain === "Built-up") built += a;
    }
    return total > 0 ? Math.round((built / total) * 100) : null;
  }, [lu.data]);

  const comparisonData = popData
    ? Object.values(popData.gnDivisions)
        .map((d) => ({ name: d.name, pop: d.totalPopulation }))
        .sort((a, b) => b.pop - a.pop)
    : [];
  const maxPop = comparisonData[0]?.pop ?? 1;

  const luColors: Record<string, string> = {
    Residential: "#64b5f6",
    Transport: "#ffa726",
    Commercial: "#ab47bc",
    Institutional: "#26a69a",
    "Public Space": "#66bb6a",
    Water: "#42a5f5",
    Cultural: "#ef5350",
    "Coastal area": "#29b6f6",
    Industrial: "#8d6e63",
    "Barren Land": "#bdbdbd",
    "Under Construction": "#ffca28",
    Agriculture: "#9ccc65",
  };

  const maxAgeBand = popData
    ? Math.max(...popData.cityAggregate.ageBands.map((b) => Math.max(b.male, b.female)))
    : 1;

  /* ════════════════════════════════════════════════════
   *  CIRCULAR LAYOUT — 13 slots around the ring
   *
   *  Slot 0–3  : Demographics & Population  (top arc)
   *  Slot 4–8  : Weather & Climate          (left-bottom arc)
   *  Slot 9–12 : Land & Geography           (right-bottom arc)
   * ════════════════════════════════════════════════════ */

  return (
    <>
      {/* ═══════════════════════════════════════════
       *  ARC 1 — Demographics & Population (slots 0-3)
       * ═══════════════════════════════════════════ */}

      {/* Slot 0: Total Population — hero */}
      {popData && (
        <FloatingCard position={ringPos(cx, cz, 0, N, radius, baseY, 15)} delay={0.1}>
          <CardShell accent="#22d3ee" width={480} icon="👥">
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "#22d3ee", opacity: 0.7, marginBottom: 6, fontWeight: 600 }}>
              Total Population
            </div>
            <div style={{ fontSize: 52, fontWeight: 800, color: "#cffafe", lineHeight: 1.1, marginBottom: 4 }}>
              {popData.cityAggregate.totalPopulation.toLocaleString()}
            </div>
            <div style={{ fontSize: 14, color: "#64748b", marginBottom: 16 }}>
              {popData.cityAggregate.gnCount} surveyed GN divisions
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: "rgba(45,212,191,0.06)", borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(45,212,191,0.1)" }}>
                <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Male</div>
                <div style={{ fontSize: 30, fontWeight: 700, color: "#2dd4bf" }}>{popData.cityAggregate.malePct}%</div>
                <div style={{ fontSize: 13, fontFamily: "monospace", color: "#64748b" }}>{popData.cityAggregate.male.toLocaleString()}</div>
              </div>
              <div style={{ background: "rgba(251,113,133,0.06)", borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(251,113,133,0.1)" }}>
                <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Female</div>
                <div style={{ fontSize: 30, fontWeight: 700, color: "#fb7185" }}>{popData.cityAggregate.femalePct}%</div>
                <div style={{ fontSize: 13, fontFamily: "monospace", color: "#64748b" }}>{popData.cityAggregate.female.toLocaleString()}</div>
              </div>
            </div>
          </CardShell>
        </FloatingCard>
      )}

      {/* Slot 1: Population Density */}
      <FloatingCard position={ringPos(cx, cz, 1, N, radius, baseY, -10)} delay={0.18} floatSpeed={0.48}>
        <CardShell accent="#fb923c" width={460} icon="📊">
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "#fb923c", opacity: 0.7, marginBottom: 6, fontWeight: 600 }}>
            Population Density
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 48, fontWeight: 800, color: "#fed7aa" }}>{Math.round(overallDensity).toLocaleString()}</span>
            <span style={{ fontSize: 16, color: "#64748b" }}>persons / km²</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Population</div>
              <div style={{ fontSize: 20, fontFamily: "monospace", fontWeight: 600, color: "#e2e8f0" }}>{totalPopulation.toLocaleString()}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Area</div>
              <div style={{ fontSize: 20, fontFamily: "monospace", fontWeight: 600, color: "#e2e8f0" }}>{totalAreaKm2.toFixed(2)} km²</div>
            </div>
          </div>
        </CardShell>
      </FloatingCard>

      {/* Slot 2: Population by Division */}
      {comparisonData.length > 0 && (
        <FloatingCard position={ringPos(cx, cz, 2, N, radius, baseY, 5)} delay={0.26} floatSpeed={0.4}>
          <CardShell accent="#e879f9" width={460} icon="🏘">
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "#e879f9", opacity: 0.7, marginBottom: 10, fontWeight: 600 }}>
              Population by Division
            </div>
            {comparisonData.map((d, i) => {
              const pct = (d.pop / maxPop) * 100;
              const t = comparisonData.length > 1 ? i / (comparisonData.length - 1) : 0;
              const barColor = `hsl(${185 + t * 40}, 65%, ${55 - t * 10}%)`;
              return (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8, height: 26 }}>
                  <div style={{ width: 80, textAlign: "right", fontSize: 12, fontFamily: "monospace", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>{d.name}</div>
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: 6, overflow: "hidden", height: 18 }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.max(pct, 4)}%`,
                        background: `linear-gradient(to right, ${barColor}cc, ${barColor})`,
                        borderRadius: 6,
                        transition: `width 1s cubic-bezier(0.22,1,0.36,1) ${i * 0.05}s`,
                      }}
                    />
                  </div>
                  <div style={{ width: 48, fontSize: 12, fontFamily: "monospace", color: "#64748b", flexShrink: 0, textAlign: "right" }}>{(d.pop / 1000).toFixed(1)}k</div>
                </div>
              );
            })}
          </CardShell>
        </FloatingCard>
      )}

      {/* Slot 3: Population Structure (age pyramid) */}
      {popData && (
        <FloatingCard position={ringPos(cx, cz, 3, N, radius, baseY, -15)} delay={0.34} floatSpeed={0.35}>
          <CardShell accent="#f472b6" width={480} icon="🧬">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#e87898" }} />
                <span style={{ fontSize: 12, color: "#94a3b8" }}>Male</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Age Structure</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>Female</span>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#4dd8e6" }} />
              </div>
            </div>
            {popData.cityAggregate.ageBands.map((band, i) => {
              const leftPct = maxAgeBand > 0 ? (band.male / maxAgeBand) * 100 : 0;
              const rightPct = maxAgeBand > 0 ? (band.female / maxAgeBand) * 100 : 0;
              return (
                <div key={band.band} style={{ display: "flex", alignItems: "center", gap: 0, height: 22 }}>
                  <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                    <div style={{
                      height: 16, borderRadius: "8px 2px 2px 8px",
                      width: `${leftPct}%`,
                      background: "linear-gradient(to left, #e87898, #e8789844)",
                      transition: `width 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.03}s`,
                    }} />
                  </div>
                  <div style={{ width: 52, textAlign: "center", fontSize: 11, fontFamily: "monospace", color: "#64748b", flexShrink: 0, padding: "0 2px" }}>
                    {band.band}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      height: 16, borderRadius: "2px 8px 8px 2px",
                      width: `${rightPct}%`,
                      background: "linear-gradient(to right, #4dd8e6, #4dd8e644)",
                      transition: `width 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.03}s`,
                    }} />
                  </div>
                </div>
              );
            })}
          </CardShell>
        </FloatingCard>
      )}

      {/* ═══════════════════════════════════════════
       *  ARC 2 — Weather & Climate (slots 4-8)
       * ═══════════════════════════════════════════ */}

      {/* Slot 4: Live Weather — hero */}
      {climate && (
        <FloatingCard position={ringPos(cx, cz, 4, N, radius, baseY, 10)} delay={0.15} floatSpeed={0.55}>
          <CardShell accent="#fbbf24" width={480} icon="🌤">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "#fbbf24", opacity: 0.7, fontWeight: 600 }}>Live Weather</div>
              <div style={{ fontSize: 12, fontFamily: "monospace", color: "#475569" }}>{formatTime(climate.updatedAt)}</div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 64, fontWeight: 800, color: "#fde68a", lineHeight: 1 }}>{Math.round(climate.tempC)}°</span>
              <span style={{ fontSize: 18, color: "#94a3b8", textTransform: "capitalize" }}>{climate.condition}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { label: "Feels like", value: `${Math.round(climate.feelsLikeC)}°`, color: "#fbbf24" },
                { label: "Humidity", value: `${climate.humidity}%`, color: "#38bdf8" },
                { label: "Wind", value: `${climate.windSpeedMs.toFixed(1)} m/s`, color: "#2dd4bf" },
                { label: "Pressure", value: `${climate.pressureHpa} hPa`, color: "#a78bfa" },
                { label: "Visibility", value: `${climate.visibilityKm.toFixed(1)} km`, color: "#94a3b8" },
                { label: "Wind Dir", value: `${climate.windDeg}°`, color: "#2dd4bf" },
              ].map((item) => (
                <div key={item.label} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "8px 10px", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 16, fontFamily: "monospace", fontWeight: 600, color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>
          </CardShell>
        </FloatingCard>
      )}

      {/* Slot 5: Temperature Trend */}
      {tempHistory.length > 2 && (
        <FloatingCard position={ringPos(cx, cz, 5, N, radius, baseY, -5)} delay={0.22} floatSpeed={0.45}>
          <CardShell accent="#fbbf24" width={460} icon="🌡">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: "#fbbf24", opacity: 0.7, fontWeight: 600 }}>Temperature</div>
              <div style={{ fontSize: 11, color: "#475569" }}>48h trend</div>
            </div>
            <MiniSparkline data={tempHistory} color="#fbbf24" height={60} width={400} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ fontSize: 13, fontFamily: "monospace", color: "#64748b" }}>{Math.min(...tempHistory).toFixed(1)}°C</span>
              <span style={{ fontSize: 13, fontFamily: "monospace", color: "#fbbf24", fontWeight: 600 }}>{Math.max(...tempHistory).toFixed(1)}°C</span>
            </div>
          </CardShell>
        </FloatingCard>
      )}

      {/* Slot 6: Humidity Trend */}
      {humidityHistory.length > 2 && (
        <FloatingCard position={ringPos(cx, cz, 6, N, radius, baseY, 8)} delay={0.30} floatSpeed={0.52}>
          <CardShell accent="#38bdf8" width={460} icon="💧">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: "#38bdf8", opacity: 0.7, fontWeight: 600 }}>Humidity</div>
              <div style={{ fontSize: 11, color: "#475569" }}>48h trend</div>
            </div>
            <MiniSparkline data={humidityHistory} color="#38bdf8" height={60} width={400} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ fontSize: 13, fontFamily: "monospace", color: "#64748b" }}>{Math.min(...humidityHistory)}%</span>
              <span style={{ fontSize: 13, fontFamily: "monospace", color: "#38bdf8", fontWeight: 600 }}>{Math.max(...humidityHistory)}%</span>
            </div>
          </CardShell>
        </FloatingCard>
      )}

      {/* Slot 7: Wind Speed Trend */}
      {windHistory.length > 2 && (
        <FloatingCard position={ringPos(cx, cz, 7, N, radius, baseY, -12)} delay={0.38} floatSpeed={0.38}>
          <CardShell accent="#2dd4bf" width={460} icon="🌬">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: "#2dd4bf", opacity: 0.7, fontWeight: 600 }}>Wind Speed</div>
              <div style={{ fontSize: 11, color: "#475569" }}>48h trend</div>
            </div>
            <MiniSparkline data={windHistory} color="#2dd4bf" height={60} width={400} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ fontSize: 13, fontFamily: "monospace", color: "#64748b" }}>{Math.min(...windHistory).toFixed(1)} m/s</span>
              <span style={{ fontSize: 13, fontFamily: "monospace", color: "#2dd4bf", fontWeight: 600 }}>{Math.max(...windHistory).toFixed(1)} m/s</span>
            </div>
          </CardShell>
        </FloatingCard>
      )}

      {/* Slot 8: 5-Day Forecast */}
      {dailyForecast.length > 0 && (
        <FloatingCard position={ringPos(cx, cz, 8, N, radius, baseY, 5)} delay={0.46} floatSpeed={0.46}>
          <CardShell accent="#f59e0b" width={460} icon="📅">
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: "#f59e0b", opacity: 0.7, marginBottom: 14, fontWeight: 600 }}>5-Day Forecast</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
              {dailyForecast.map((f, i) => (
                <div key={i} style={{
                  flex: 1, textAlign: "center",
                  background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: "10px 6px",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{formatDay(f.dt)}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: "#fde68a" }}>{Math.round(f.tempC)}°</div>
                  <div style={{ fontSize: 12, color: "#38bdf8", opacity: 0.7 }}>{f.humidity}%</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{f.windSpeedMs.toFixed(1)} m/s</div>
                </div>
              ))}
            </div>
          </CardShell>
        </FloatingCard>
      )}

      {/* ═══════════════════════════════════════════
       *  ARC 3 — Land & Geography (slots 9-12)
       * ═══════════════════════════════════════════ */}

      {/* Slot 9: Total Land Area */}
      <FloatingCard position={ringPos(cx, cz, 9, N, radius, baseY, 10)} delay={0.15} floatSpeed={0.42}>
        <CardShell accent="#a78bfa" width={440} icon="🗺">
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "#a78bfa", opacity: 0.7, marginBottom: 6, fontWeight: 600 }}>
            Total Land Area
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 52, fontWeight: 800, color: "#ddd6fe" }}>{totalAreaKm2.toFixed(2)}</span>
            <span style={{ fontSize: 18, color: "#64748b" }}>km²</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>In m²</div>
              <div style={{ fontSize: 18, fontFamily: "monospace", fontWeight: 600, color: "#e2e8f0" }}>{Math.round(totalAreaKm2 * 1_000_000).toLocaleString()}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Hectares</div>
              <div style={{ fontSize: 18, fontFamily: "monospace", fontWeight: 600, color: "#e2e8f0" }}>{(totalAreaKm2 * 100).toFixed(1)}</div>
            </div>
          </div>
        </CardShell>
      </FloatingCard>

      {/* Slot 10: Built-up Area */}
      <FloatingCard position={ringPos(cx, cz, 10, N, radius, baseY, -8)} delay={0.22} floatSpeed={0.38}>
        <CardShell accent="#f43f5e" width={440} icon="🏗">
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "#f43f5e", opacity: 0.7, marginBottom: 6, fontWeight: 600 }}>
            Built-up Area
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 52, fontWeight: 800, color: "#fecdd3" }}>{builtUpPct ?? "—"}%</span>
            <span style={{ fontSize: 16, color: "#64748b" }}>of total land</span>
          </div>
          {builtUpPct !== null && (
            <div>
              <div style={{ height: 14, borderRadius: 8, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 8,
                  width: `${builtUpPct}%`,
                  background: "linear-gradient(to right, #f43f5e, #fb7185)",
                  transition: "width 1.2s ease-out",
                  boxShadow: "0 0 12px rgba(244,63,94,0.3)",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 11, color: "#475569" }}>0%</span>
                <span style={{ fontSize: 12, color: "#fb7185", fontWeight: 600 }}>{builtUpPct}% built-up</span>
                <span style={{ fontSize: 11, color: "#475569" }}>100%</span>
              </div>
            </div>
          )}
        </CardShell>
      </FloatingCard>

      {/* Slot 11: Rainfall Probability */}
      {rainHistory.length > 2 && (
        <FloatingCard position={ringPos(cx, cz, 11, N, radius, baseY, 12)} delay={0.30} floatSpeed={0.44}>
          <CardShell accent="#60a5fa" width={440} icon="🌧">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: "#60a5fa", opacity: 0.7, fontWeight: 600 }}>Rainfall Probability</div>
              <div style={{ fontSize: 11, color: "#475569" }}>48h trend</div>
            </div>
            <MiniSparkline data={rainHistory} color="#60a5fa" height={60} width={380} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ fontSize: 13, fontFamily: "monospace", color: "#64748b" }}>{Math.min(...rainHistory).toFixed(0)}%</span>
              <span style={{ fontSize: 13, fontFamily: "monospace", color: "#60a5fa", fontWeight: 600 }}>{Math.max(...rainHistory).toFixed(0)}%</span>
            </div>
          </CardShell>
        </FloatingCard>
      )}

      {/* Slot 12: Land Use Distribution */}
      {landuseBreakdown.length > 0 && (
        <FloatingCard position={ringPos(cx, cz, 12, N, radius, baseY, -5)} delay={0.38} floatSpeed={0.48}>
          <CardShell accent="#84cc16" width={480} icon="🌿">
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "#84cc16", opacity: 0.7, marginBottom: 10, fontWeight: 600 }}>
              Land Use Distribution
            </div>
            {landuseBreakdown.map((item, i) => {
              const color = luColors[item.name] || "#64748b";
              return (
                <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 8, height: 26 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: color, flexShrink: 0 }} />
                  <div style={{ width: 90, fontSize: 12, fontFamily: "monospace", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>{item.name}</div>
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: 6, overflow: "hidden", height: 18 }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.max(item.pct, 3)}%`,
                      background: `linear-gradient(to right, ${color}88, ${color})`,
                      borderRadius: 6,
                      transition: `width 1s cubic-bezier(0.22,1,0.36,1) ${i * 0.05}s`,
                    }} />
                  </div>
                  <div style={{ width: 48, fontSize: 12, fontFamily: "monospace", color: "#64748b", flexShrink: 0, textAlign: "right" }}>{item.pct.toFixed(1)}%</div>
                </div>
              );
            })}
          </CardShell>
        </FloatingCard>
      )}
    </>
  );
}
