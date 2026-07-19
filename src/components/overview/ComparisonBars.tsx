import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ComparisonBarsProps {
  data: { name: string; value: number }[];
  highlightName?: string | null;
  height?: number;
  valueSuffix?: string;
}

interface CompTooltipItem {
  payload: { name: string; value: number };
}

function CompTooltip({
  active,
  payload,
  valueSuffix,
}: {
  active?: boolean;
  payload?: CompTooltipItem[];
  valueSuffix?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-panel-solid rounded-lg px-3 py-2 text-xs">
      <div className="font-display font-semibold text-cyan-200">{d.name}</div>
      <div className="font-mono text-cyan-300">
        {d.value.toLocaleString()}
        {valueSuffix ?? ""}
      </div>
    </div>
  );
}

export function ComparisonBars({
  data,
  highlightName,
  height = 320,
  valueSuffix,
}: ComparisonBarsProps) {
  const sorted = [...data].sort((a, b) => b.value - a.value);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={sorted} layout="vertical" margin={{ left: 8, right: 24 }}>
        <XAxis type="number" tick={{ fill: "#5b7d8a", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#1e3a47" }} />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tick={{ fill: "#7fa9b4", fontSize: 10 }}
          axisLine={{ stroke: "#1e3a47" }}
          tickLine={false}
        />
        <Tooltip
          content={<CompTooltip valueSuffix={valueSuffix} />}
          cursor={{ fill: "rgba(77,216,230,0.06)" }}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
          {sorted.map((d, i) => (
            <Cell
              key={i}
              fill={d.name === highlightName ? "#7ff5ff" : "#1c8fa6"}
              fillOpacity={d.name === highlightName ? 1 : 0.65}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
