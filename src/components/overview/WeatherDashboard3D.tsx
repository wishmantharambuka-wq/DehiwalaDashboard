import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useClimate } from "../../hooks/useClimate";
import { useForecast } from "../../hooks/useForecast";
import { DEHIWALA_COORDS } from "../../config";
import { useDashboardStore } from "../../store/useDashboardStore";
import type { ForecastPoint } from "../../hooks/useForecast";

function FloatingPanel({
  position,
  delay = 0,
  children,
  factor = 700,
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
      ref.current.position.y =
        position[1] + Math.sin(elapsed.current * 0.45 + delay * 2) * 2.5;
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

function Sparkline({
  data,
  color,
  height = 48,
  width = 220,
}: {
  data: number[];
  color: string;
  height?: number;
  width?: number;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data
    .map((v, i) => `${i * step},${height - ((v - min) / range) * (height - 6) - 3}`)
    .join(" ");
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  const id = `wdash-${color.replace("#", "")}-${width}`;

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${id})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DetailedChart({
  data,
  color,
  label,
  unit,
  height = 140,
  width = 400,
}: {
  data: { time: string; value: number }[];
  color: string;
  label: string;
  unit: string;
  height?: number;
  width?: number;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data.map((d) => d.value));
  const max = Math.max(...data.map((d) => d.value));
  const range = max - min || 1;
  const padH = 40;
  const padV = 24;
  const chartW = width - padH * 2;
  const chartH = height - padV * 2;
  const step = chartW / (data.length - 1);

  const points = data
    .map(
      (d, i) =>
        `${padH + i * step},${padV + chartH - ((d.value - min) / range) * chartH}`,
    )
    .join(" ");

  const gridLines = 4;

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const y = padV + (i / gridLines) * chartH;
        const val = max - (i / gridLines) * range;
        return (
          <g key={i}>
            <line
              x1={padH}
              y1={y}
              x2={width - padH}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
            <text
              x={padH - 4}
              y={y + 3}
              textAnchor="end"
              fill="#64748b"
              fontSize="9"
              fontFamily="monospace"
            >
              {val.toFixed(1)}
            </text>
          </g>
        );
      })}

      {data
        .filter((_, i) => i % Math.max(1, Math.floor(data.length / 6)) === 0)
        .map((d, i) => {
          const idx = data.indexOf(d);
          const x = padH + idx * step;
          return (
            <text
              key={i}
              x={x}
              y={height - 4}
              textAnchor="middle"
              fill="#64748b"
              fontSize="8"
              fontFamily="monospace"
            >
              {d.time}
            </text>
          );
        })}

      <defs>
        <linearGradient id={`chart-${label}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <polygon
        points={`${padH},${padV + chartH} ${points} ${padH + (data.length - 1) * step},${padV + chartH}`}
        fill={`url(#chart-${label})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {data.map((d, i) => {
        const x = padH + i * step;
        const y = padV + chartH - ((d.value - min) / range) * chartH;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="2.5"
            fill={color}
            opacity="0.7"
          />
        );
      })}

      <text x={width / 2} y={14} textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">
        {label} ({unit})
      </text>
    </svg>
  );
}

const METRICS = [
  { key: "temperature", label: "Temperature", icon: "🌡", unit: "°C", color: "#fbbf24" },
  { key: "humidity", label: "Humidity", icon: "💧", unit: "%", color: "#38bdf8" },
  { key: "wind", label: "Wind Speed", icon: "🌬", unit: "m/s", color: "#2dd4bf" },
  { key: "pressure", label: "Pressure", icon: "📊", unit: "hPa", color: "#a78bfa" },
] as const;

type MetricKey = (typeof METRICS)[number]["key"];

function getCurrentValue(
  climate: { tempC: number; humidity: number; windSpeedMs: number; pressureHpa: number } | null,
  key: MetricKey,
): number {
  if (!climate) return 0;
  switch (key) {
    case "temperature":
      return climate.tempC;
    case "humidity":
      return climate.humidity;
    case "wind":
      return climate.windSpeedMs;
    case "pressure":
      return climate.pressureHpa;
  }
}

function getHistoryData(
  forecast: ForecastPoint[] | null,
  key: MetricKey,
): { time: string; value: number }[] {
  if (!forecast) return [];
  const points = forecast.slice(0, 16);
  return points.map((p) => {
    const time = new Date(p.dt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    let value: number;
    switch (key) {
      case "temperature":
        value = p.tempC;
        break;
      case "humidity":
        value = p.humidity;
        break;
      case "wind":
        value = p.windSpeedMs;
        break;
      case "pressure":
        value = p.pressureHpa;
        break;
    }
    return { time, value };
  });
}

function getSparklineData(forecast: ForecastPoint[] | null, key: MetricKey): number[] {
  if (!forecast) return [];
  return forecast.slice(0, 12).map((p) => {
    switch (key) {
      case "temperature":
        return p.tempC;
      case "humidity":
        return p.humidity;
      case "wind":
        return p.windSpeedMs;
      case "pressure":
        return p.pressureHpa;
    }
  });
}

interface WeatherDashboard3DProps {
  center: [number, number];
  citySpan: number;
}

export function WeatherDashboard3D({ center, citySpan }: WeatherDashboard3DProps) {
  const { data: climate } = useClimate(DEHIWALA_COORDS);
  const { data: forecast } = useForecast(DEHIWALA_COORDS);
  const activeChart = useDashboardStore((s) => s.activeWeatherChart);
  const setActiveChart = useDashboardStore((s) => s.setActiveWeatherChart);
  const setShowLiveData = useDashboardStore((s) => s.setShowLiveData);

  const cx = center[0];
  const cz = center[1];
  const baseY = 500;

  const updatedTime = climate
    ? new Date(climate.updatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  const activeMetric = METRICS.find((m) => m.key === activeChart);
  const chartData = activeMetric ? getHistoryData(forecast, activeMetric.key) : [];

  return (
    <>
      {/* Main dashboard card — top center */}
      <FloatingPanel position={[cx, baseY, cz]} delay={0.1} factor={780}>
        <div
          style={{
            width: 560,
            background: "rgba(8, 18, 30, 0.88)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(127, 245, 255, 0.12)",
            borderRadius: 20,
            boxShadow:
              "0 0 60px rgba(127, 245, 255, 0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
            padding: "24px 28px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "#22d3ee",
                  opacity: 0.7,
                  marginBottom: 4,
                }}
              >
                Live Data Dashboard
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#e2e8f0",
                }}
              >
                Dehiwala Climate Monitor
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: "rgba(34, 211, 238, 0.08)",
                  border: "1px solid rgba(34, 211, 238, 0.15)",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#22d3ee",
                    boxShadow: "0 0 6px #22d3ee",
                  }}
                />
                <span style={{ fontSize: 11, color: "#22d3ee", fontWeight: 600 }}>
                  LIVE
                </span>
              </div>
              <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>
                {updatedTime}
              </span>
              <button
                onClick={() => setShowLiveData(false)}
                style={{
                  fontSize: 11,
                  padding: "4px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(239,68,68,0.2)",
                  background: "rgba(239,68,68,0.08)",
                  color: "#f87171",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>

          {/* Current condition banner */}
          {climate && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "12px 16px",
                background: "rgba(255,255,255,0.02)",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.04)",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  color: "#fbbf24",
                  lineHeight: 1,
                }}
              >
                {Math.round(climate.tempC)}°
              </div>
              <div>
                <div
                  style={{
                    fontSize: 15,
                    color: "#e2e8f0",
                    textTransform: "capitalize",
                    fontWeight: 600,
                  }}
                >
                  {climate.condition}
                </div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  Feels like {Math.round(climate.feelsLikeC)}° · Visibility{" "}
                  {climate.visibilityKm.toFixed(1)} km
                </div>
              </div>
            </div>
          )}

          {/* Nested metric cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {METRICS.map((metric) => {
              const value = getCurrentValue(climate, metric.key);
              const sparkData = getSparklineData(forecast, metric.key);
              const isActive = activeChart === metric.key;
              return (
                <button
                  key={metric.key}
                  onClick={() =>
                    setActiveChart(isActive ? null : metric.key)
                  }
                  style={{
                    background: isActive
                      ? `${metric.color}12`
                      : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isActive ? `${metric.color}40` : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 14,
                    padding: "14px 16px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{metric.icon}</span>
                      <span
                        style={{
                          fontSize: 12,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          fontWeight: 600,
                        }}
                      >
                        {metric.label}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: isActive ? metric.color : "#475569",
                        fontWeight: 600,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: isActive
                          ? `${metric.color}15`
                          : "transparent",
                      }}
                    >
                      {isActive ? "VIEWING" : "CLICK"}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: metric.color,
                      fontFamily: "monospace",
                      marginBottom: 6,
                    }}
                  >
                    {metric.key === "pressure"
                      ? Math.round(value)
                      : value.toFixed(1)}
                    <span
                      style={{
                        fontSize: 13,
                        color: "#64748b",
                        marginLeft: 4,
                      }}
                    >
                      {metric.unit}
                    </span>
                  </div>
                  <Sparkline
                    data={sparkData}
                    color={metric.color}
                    height={36}
                    width={220}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </FloatingPanel>

      {/* Spawned floating chart card */}
      {activeMetric && chartData.length > 2 && (
        <FloatingPanel
          position={[cx + citySpan * 0.35, baseY - 80, cz]}
          delay={0.15}
          factor={750}
        >
          <div
            style={{
              width: 480,
              background: "rgba(8, 18, 30, 0.9)",
              backdropFilter: "blur(20px)",
              border: `1px solid ${activeMetric.color}30`,
              borderRadius: 18,
              boxShadow: `0 0 40px ${activeMetric.color}15`,
              padding: "20px 24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>{activeMetric.icon}</span>
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#e2e8f0",
                    }}
                  >
                    {activeMetric.label} Trend
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>
                    48h data from OpenWeatherMap
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveChart(null)}
                style={{
                  fontSize: 10,
                  padding: "3px 10px",
                  borderRadius: 8,
                  border: `1px solid ${activeMetric.color}30`,
                  background: `${activeMetric.color}08`,
                  color: activeMetric.color,
                  cursor: "pointer",
                }}
              >
                Close Chart
              </button>
            </div>

            <DetailedChart
              data={chartData}
              color={activeMetric.color}
              label={activeMetric.label}
              unit={activeMetric.unit}
              height={160}
              width={432}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 10,
                padding: "8px 12px",
                background: "rgba(255,255,255,0.02)",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase" }}>
                  Current
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: activeMetric.color,
                    fontFamily: "monospace",
                  }}
                >
                  {activeMetric.key === "pressure"
                    ? Math.round(getCurrentValue(climate, activeMetric.key))
                    : getCurrentValue(climate, activeMetric.key).toFixed(1)}
                  {activeMetric.unit}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase" }}>
                  Min
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#94a3b8",
                    fontFamily: "monospace",
                  }}
                >
                  {Math.min(...chartData.map((d) => d.value)).toFixed(1)}
                  {activeMetric.unit}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase" }}>
                  Max
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#94a3b8",
                    fontFamily: "monospace",
                  }}
                >
                  {Math.max(...chartData.map((d) => d.value)).toFixed(1)}
                  {activeMetric.unit}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase" }}>
                  Avg
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#94a3b8",
                    fontFamily: "monospace",
                  }}
                >
                  {(
                    chartData.reduce((s, d) => s + d.value, 0) / chartData.length
                  ).toFixed(1)}
                  {activeMetric.unit}
                </div>
              </div>
            </div>
          </div>
        </FloatingPanel>
      )}

    </>
  );
}
