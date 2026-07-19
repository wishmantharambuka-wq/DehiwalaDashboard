import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { AgeBand } from "../../types";

interface PopulationPyramidProps {
  ageBands: AgeBand[];
  height?: number;
}

interface TooltipPayloadItem {
  dataKey: string;
  value: number;
  payload: { band: string };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload || !payload.length) return null;
  const male = payload.find((p) => p.dataKey === "maleNeg");
  const female = payload.find((p) => p.dataKey === "female");
  return (
    <div className="glass-panel-solid rounded-lg px-3 py-2 text-xs">
      <div className="font-display font-semibold text-cyan-200 mb-1">
        Age {payload[0].payload.band}
      </div>
      <div className="text-cyan-300">Male: {Math.abs(male?.value ?? 0).toLocaleString()}</div>
      <div className="text-rose-300">Female: {(female?.value ?? 0).toLocaleString()}</div>
    </div>
  );
}

export function PopulationPyramid({ ageBands, height = 340 }: PopulationPyramidProps) {
  const data = ageBands.map((b) => ({
    band: b.band,
    maleNeg: -b.male,
    female: b.female,
  }));

  const maxVal = Math.max(...ageBands.map((b) => Math.max(b.male, b.female)), 1);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" stackOffset="sign" margin={{ left: 8, right: 8 }}>
        <XAxis
          type="number"
          domain={[-maxVal * 1.05, maxVal * 1.05]}
          tick={{ fill: "#5b7d8a", fontSize: 10 }}
          tickFormatter={(v: number) => Math.abs(v).toString()}
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
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(77,216,230,0.06)" }} />
        <Bar dataKey="maleNeg" stackId="pyr" radius={[3, 0, 0, 3]}>
          {data.map((_, i) => (
            <Cell key={i} fill="#31c4c4" fillOpacity={0.85} />
          ))}
        </Bar>
        <Bar dataKey="female" stackId="pyr" radius={[0, 3, 3, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill="#f4657a" fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
