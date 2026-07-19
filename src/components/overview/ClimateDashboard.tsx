import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { GlassCard } from "../ui/GlassCard";
import { useClimate } from "../../hooks/useClimate";
import { useForecast } from "../../hooks/useForecast";
import type { ForecastPoint } from "../../hooks/useForecast";
import { DEHIWALA_COORDS } from "../../config";

interface Coords {
  lat: number;
  lon: number;
}

interface ClimateDashboardProps {
  coords?: Coords;
  locationLabel?: string;
}

function formatTime(dt: number) {
  return new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDay(dt: number) {
  return new Date(dt).toLocaleDateString([], { weekday: "short", day: "numeric" });
}

function WindCompass({ deg, speed }: { deg: number; speed: number }) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const idx = Math.round(deg / 45) % 8;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 64 64" className="w-full h-full">
          <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(127,245,255,0.15)" strokeWidth="1" />
          <circle cx="32" cy="32" r="20" fill="none" stroke="rgba(127,245,255,0.08)" strokeWidth="0.5" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line
              key={a}
              x1={32 + 25 * Math.sin((a * Math.PI) / 180)}
              y1={32 - 25 * Math.cos((a * Math.PI) / 180)}
              x2={32 + 28 * Math.sin((a * Math.PI) / 180)}
              y2={32 - 28 * Math.cos((a * Math.PI) / 180)}
              stroke="rgba(127,245,255,0.3)"
              strokeWidth="1"
            />
          ))}
          <g transform={`rotate(${deg}, 32, 32)`}>
            <line x1="32" y1="32" x2="32" y2="10" stroke="#7ff5ff" strokeWidth="2" strokeLinecap="round" />
            <polygon points="32,6 28,14 36,14" fill="#7ff5ff" />
          </g>
          <circle cx="32" cy="32" r="3" fill="#0d1b2a" stroke="#7ff5ff" strokeWidth="1" />
        </svg>
      </div>
      <div className="text-[10px] text-slate-400">
        {directions[idx]} · {speed.toFixed(1)} m/s
      </div>
    </div>
  );
}

function ClimateStatCard({
  label,
  value,
  unit,
  icon,
  color = "#7ff5ff",
}: {
  label: string;
  value: string;
  unit?: string;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
        <div className="text-sm font-mono font-semibold" style={{ color }}>
          {value}
          {unit && <span className="text-[10px] text-slate-500 ml-0.5">{unit}</span>}
        </div>
      </div>
    </div>
  );
}

function ChartTooltipContent({ payload, label }: { payload?: { value: number; name: string; color: string }[]; label?: string }) {
  if (!payload?.length) return null;
  return (
    <div className="glass-panel-solid rounded-lg px-3 py-2 text-[11px] border border-cyan-400/20">
      <div className="text-slate-400 mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-mono" style={{ color: p.color }}>{typeof p.value === "number" ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

function DailySummary({ points }: { points: ForecastPoint[] }) {
  const dailyData = useMemo(() => {
    const days = new Map<string, ForecastPoint[]>();
    for (const p of points) {
      const key = new Date(p.dt).toLocaleDateString();
      const arr = days.get(key) ?? [];
      arr.push(p);
      days.set(key, arr);
    }
    return Array.from(days.entries()).map(([, pts]) => {
      const temps = pts.map((p) => p.tempC);
      const humids = pts.map((p) => p.humidity);
      return {
        day: formatDay(pts[0].dt),
        dt: pts[0].dt,
        maxTemp: Math.max(...temps),
        minTemp: Math.min(...temps),
        avgHumidity: Math.round(humids.reduce((a, b) => a + b, 0) / humids.length),
        maxWind: Math.max(...pts.map((p) => p.windSpeedMs)),
        avgPop: Math.round((pts.reduce((a, b) => a + b.pop, 0) / pts.length) * 100),
        icon: pts[Math.floor(pts.length / 2)].icon,
        condition: pts[Math.floor(pts.length / 2)].condition,
      };
    });
  }, [points]);

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {dailyData.map((d) => (
        <div
          key={d.day}
          className="flex-shrink-0 w-[72px] p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center"
        >
          <div className="text-[10px] text-slate-400 font-medium">{d.day}</div>
          <div className="text-[11px] font-mono text-cyan-300 mt-1">
            {Math.round(d.maxTemp)}°
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            {Math.round(d.minTemp)}°
          </div>
          <div className="text-[9px] text-slate-500 mt-1 capitalize truncate">{d.condition}</div>
          <div className="text-[9px] text-cyan-400/60 mt-0.5">{d.avgPop}% rain</div>
        </div>
      ))}
    </div>
  );
}

export function ClimateDashboard({ coords, locationLabel }: ClimateDashboardProps) {
  const effectiveCoords = coords ?? DEHIWALA_COORDS;
  const { data: current, refresh } = useClimate(effectiveCoords);
  const { data: forecast } = useForecast(effectiveCoords);

  const chartData = useMemo(() => {
    if (!forecast) return [];
    return forecast.map((p) => ({
      time: formatTime(p.dt),
      dayTime: `${formatDay(p.dt)} ${formatTime(p.dt)}`,
      temp: p.tempC,
      feelsLike: p.feelsLikeC,
      humidity: p.humidity,
      wind: p.windSpeedMs,
      pressure: p.pressureHpa,
      rain: Math.round(p.pop * 100),
    }));
  }, [forecast]);

  const next24h = chartData.slice(0, 8);

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto no-scrollbar pr-1">
      {/* Current conditions header */}
      <GlassCard className="p-4" glow>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500">
              Live Weather
            </div>
            <h3 className="font-display font-bold text-lg text-cyan-100 glow-text leading-tight mt-0.5">
              {locationLabel ?? "Dehiwala"}
            </h3>
          </div>
          <button
            onClick={refresh}
            className="text-cyan-400/70 hover:text-cyan-300 transition-colors p-1.5 rounded-lg hover:bg-cyan-400/10"
            title="Refresh"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <path
                d="M4 4v5h5M20 20v-5h-5M4.5 15a8 8 0 0 0 14.6 2.5M19.5 9A8 8 0 0 0 4.9 6.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {current && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-display font-bold text-cyan-200 glow-text leading-none">
                  {Math.round(current.tempC)}°C
                </div>
                <div className="text-[12px] text-slate-400 capitalize mt-1">{current.condition}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Feels like {Math.round(current.feelsLikeC)}°C
                </div>
              </div>
              <WindCompass deg={current.windDeg} speed={current.windSpeedMs} />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <ClimateStatCard
                label="Humidity"
                value={`${current.humidity}`}
                unit="%"
                color="#4dd8e6"
                icon={
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#4dd8e6" strokeWidth="1.5">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  </svg>
                }
              />
              <ClimateStatCard
                label="Wind Speed"
                value={current.windSpeedMs.toFixed(1)}
                unit="m/s"
                color="#7ff5ff"
                icon={
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#7ff5ff" strokeWidth="1.5">
                    <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
              />
              <ClimateStatCard
                label="Pressure"
                value={`${current.pressureHpa}`}
                unit="hPa"
                color="#bd93f9"
                icon={
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#bd93f9" strokeWidth="1.5">
                    <path d="M12 2v20M2 12h20" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                }
              />
              <ClimateStatCard
                label="Visibility"
                value={current.visibilityKm.toFixed(1)}
                unit="km"
                color="#f5b942"
                icon={
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#f5b942" strokeWidth="1.5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                }
              />
            </div>

            <div className="text-[10px] text-slate-600 mt-2 font-mono text-right">
              updated {new Date(current.updatedAt).toLocaleTimeString()}
            </div>
          </>
        )}
      </GlassCard>

      {/* 5-Day Summary */}
      {forecast && (
        <GlassCard className="p-4">
          <h4 className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-2">
            5-Day Forecast
          </h4>
          <DailySummary points={forecast} />
        </GlassCard>
      )}

      {/* Temperature trend chart */}
      {next24h.length > 0 && (
        <GlassCard className="p-4">
          <h4 className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-2">
            Temperature Trend (24h)
          </h4>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={next24h}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7ff5ff" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#7ff5ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="feelsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f5b942" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#f5b942" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} unit="°" />
                <Tooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="temp" name="Temp" stroke="#7ff5ff" fill="url(#tempGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="feelsLike" name="Feels like" stroke="#f5b942" fill="url(#feelsGrad)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-1 justify-center">
            <span className="flex items-center gap-1 text-[9px] text-slate-500">
              <span className="w-3 h-0.5 bg-cyan-400 inline-block rounded" /> Temperature
            </span>
            <span className="flex items-center gap-1 text-[9px] text-slate-500">
              <span className="w-3 h-0.5 bg-amber-400 inline-block rounded border-dashed" /> Feels like
            </span>
          </div>
        </GlassCard>
      )}

      {/* Humidity & Rain probability */}
      {next24h.length > 0 && (
        <GlassCard className="p-4">
          <h4 className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-2">
            Humidity & Rain Probability (24h)
          </h4>
          <div className="h-[130px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={next24h}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="humidity" name="Humidity" fill="#4dd8e6" opacity={0.6} radius={[2, 2, 0, 0]} />
                <Bar dataKey="rain" name="Rain %" fill="#bd93f9" opacity={0.5} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-1 justify-center">
            <span className="flex items-center gap-1 text-[9px] text-slate-500">
              <span className="w-2 h-2 rounded-sm bg-[#4dd8e6] opacity-60 inline-block" /> Humidity
            </span>
            <span className="flex items-center gap-1 text-[9px] text-slate-500">
              <span className="w-2 h-2 rounded-sm bg-[#bd93f9] opacity-50 inline-block" /> Rain
            </span>
          </div>
        </GlassCard>
      )}

      {/* Wind Speed trend */}
      {next24h.length > 0 && (
        <GlassCard className="p-4">
          <h4 className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-2">
            Wind Speed (24h)
          </h4>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={next24h}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} unit=" m/s" />
                <Tooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="wind" name="Wind" stroke="#50fa7b" strokeWidth={2} dot={{ r: 3, fill: "#50fa7b" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {/* Pressure trend */}
      {next24h.length > 0 && (
        <GlassCard className="p-4">
          <h4 className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-2">
            Atmospheric Pressure (24h)
          </h4>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={next24h}>
                <defs>
                  <linearGradient id="pressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#bd93f9" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#bd93f9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} unit=" hPa" />
                <Tooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="pressure" name="Pressure" stroke="#bd93f9" fill="url(#pressGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
