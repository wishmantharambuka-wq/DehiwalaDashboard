import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import type { AgeBand } from "../../types";

interface AgeGapBarsProps {
  ageBands: AgeBand[];
  height?: number;
}

interface GapTooltipItem {
  payload: { band: string; gap: number; male: number; female: number };
}

function GapTooltip({ active, payload }: { active?: boolean; payload?: GapTooltipItem[] }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  const leader = d.gap >= 0 ? "Male" : "Female";
  return (
    <div className="glass-panel-solid rounded-lg px-3 py-2 text-xs min-w-[140px]">
      <div className="font-display font-semibold text-cyan-200 mb-1">Age {d.band}</div>
      <div className="text-slate-300">
        {leader} lead by <span className="font-mono text-amber-300">{Math.abs(d.gap)}</span>
      </div>
      <div className="text-slate-500 mt-1">
        M {d.male.toLocaleString()} · F {d.female.toLocaleString()}
      </div>
    </div>
  );
}

export function AgeGapBars({ ageBands, height = 340 }: AgeGapBarsProps) {
  const data = ageBands.map((b) => ({
    band: b.band,
    gap: b.male - b.female,
    male: b.male,
    female: b.female,
  }));

  const maxAbs = Math.max(...data.map((d) => Math.abs(d.gap)), 1);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <defs>
          <linearGradient id="gapPositive" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#31c4c4" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#7ff5ff" stopOpacity={0.95} />
          </linearGradient>
          <linearGradient id="gapNegative" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#f4657a" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#ff9db0" stopOpacity={0.95} />
          </linearGradient>
        </defs>
        <XAxis
          type="number"
          domain={[-maxAbs * 1.15, maxAbs * 1.15]}
          tick={{ fill: "#5b7d8a", fontSize: 10 }}
          axisLine={{ stroke: "#1e3a47" }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="band"
          width={54}
          tick={{ fill: "#7fa9b4", fontSize: 10 }}
          axisLine={{ stroke: "#1e3a47" }}
          tickLine={false}
        />
        <ReferenceLine x={0} stroke="#2c4d5c" />
        <Tooltip content={<GapTooltip />} cursor={{ fill: "rgba(77,216,230,0.06)" }} />
        <Bar dataKey="gap" radius={[4, 4, 4, 4]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.gap >= 0 ? "url(#gapPositive)" : "url(#gapNegative)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
