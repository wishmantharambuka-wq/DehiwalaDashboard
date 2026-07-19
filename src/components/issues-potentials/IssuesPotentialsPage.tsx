import { useState } from "react";
import clsx from "clsx";
import { GlassCard } from "../ui/GlassCard";
import { Toggle } from "../ui/Toggle";
import { SegmentedControl } from "../ui/SegmentedControl";
import { FloatingMapPanel } from "../ui/FloatingMapPanel";
import { MapCanvas } from "../maps/MapCanvas";
import { GNBoundariesLayer } from "../maps/GNBoundariesLayer";
import { CentralityNetworkLayer, CentralityLegend } from "../maps/CentralityNetworkLayer";
import { useDashboardStore } from "../../store/useDashboardStore";
import { swot, pestel } from "../../data/content";

type InnerTab = "network" | "swot" | "pestel";

const TABS: { id: InnerTab; label: string }[] = [
  { id: "network", label: "Network Overview" },
  { id: "swot", label: "SWOT" },
  { id: "pestel", label: "PESTEL" },
];

const SWOT_META = [
  { key: "strengths" as const, label: "Strengths", color: "#31c4c4", bg: "bg-teal-400/10", border: "border-teal-400/30" },
  { key: "weaknesses" as const, label: "Weaknesses", color: "#f4657a", bg: "bg-rose-400/10", border: "border-rose-400/30" },
  { key: "opportunities" as const, label: "Opportunities", color: "#7ff5ff", bg: "bg-cyan-400/10", border: "border-cyan-400/30" },
  { key: "threats" as const, label: "Threats", color: "#f5b942", bg: "bg-amber-400/10", border: "border-amber-400/30" },
];

const PESTEL_META = [
  { key: "political" as const, label: "Political" },
  { key: "economic" as const, label: "Economic" },
  { key: "social" as const, label: "Social" },
  { key: "technological" as const, label: "Technological" },
  { key: "environmental" as const, label: "Environmental" },
  { key: "legal" as const, label: "Legal" },
];

function NetworkOverview() {
  const layers = useDashboardStore((s) => s.layers);
  const toggleLayer = useDashboardStore((s) => s.toggleLayer);
  const centralityRadius = useDashboardStore((s) => s.centralityRadius);
  const setCentralityRadius = useDashboardStore((s) => s.setCentralityRadius);
  const centralityMetric = useDashboardStore((s) => s.centralityMetric);
  const setCentralityMetric = useDashboardStore((s) => s.setCentralityMetric);

  return (
    <GlassCard className="relative overflow-hidden min-h-[460px]" glow>
      <MapCanvas>
        <CentralityNetworkLayer metric={centralityMetric} radius={centralityRadius} />
        {layers.gnBoundaries && <GNBoundariesLayer />}
      </MapCanvas>

      <FloatingMapPanel title="Network layer">
        <Toggle
          label="GN division boundaries"
          checked={layers.gnBoundaries}
          onChange={() => toggleLayer("gnBoundaries")}
          swatch="#7ff5ff"
        />
        <div className="h-px bg-white/10 my-1" />
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
          Centrality type
        </div>
        <SegmentedControl
          value={centralityMetric}
          onChange={setCentralityMetric}
          options={[
            { value: "closeness", label: "Closeness" },
            { value: "betweenness", label: "Betweenness" },
          ]}
        />
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mt-1">
          Analysis radius
        </div>
        <SegmentedControl
          value={centralityRadius}
          onChange={setCentralityRadius}
          options={[
            { value: 500, label: "500m" },
            { value: 2000, label: "2000m" },
            { value: 5000, label: "5000m" },
          ]}
        />
        <CentralityLegend metric={centralityMetric} radius={centralityRadius} />
      </FloatingMapPanel>

      <div className="absolute bottom-3 left-3 max-w-xs z-[400]">
        <GlassCard solid className="p-3 text-[11px] text-slate-300 leading-relaxed">
          High-{centralityMetric} segments concentrate near Dehiwala Junction and along Galle
          Road — the same corridor identified as the area's primary economic asset <em>and</em>{" "}
          its sharpest heat-vulnerability point in the Environmental Analysis tab.
        </GlassCard>
      </div>
    </GlassCard>
  );
}

function SwotGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {SWOT_META.map((meta) => (
        <GlassCard key={meta.key} className={clsx("p-4 border", meta.border, meta.bg)}>
          <h4
            className="font-display font-bold text-sm mb-2 tracking-wide"
            style={{ color: meta.color }}
          >
            {meta.label}
          </h4>
          <ul className="space-y-1.5">
            {swot[meta.key].map((item, i) => (
              <li key={i} className="text-[12px] text-slate-300 leading-relaxed flex gap-1.5">
                <span style={{ color: meta.color }} className="mt-0.5">
                  ▸
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      ))}
    </div>
  );
}

function PestelGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {PESTEL_META.map((meta) => (
        <GlassCard key={meta.key} className="p-4">
          <h4 className="font-display font-semibold text-sm text-cyan-200 mb-2">{meta.label}</h4>
          <ul className="space-y-1.5">
            {pestel[meta.key].map((item, i) => (
              <li key={i} className="text-[12px] text-slate-300 leading-relaxed flex gap-1.5">
                <span className="text-cyan-400/70 mt-0.5">▸</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      ))}
    </div>
  );
}

export function IssuesPotentialsPage() {
  const [tab, setTab] = useState<InnerTab>("network");

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto no-scrollbar pr-1">
      <div className="flex gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              "px-3.5 py-1.5 rounded-lg text-xs font-display font-semibold tracking-wide transition-colors border",
              tab === t.id
                ? "bg-cyan-400/15 border-cyan-400/40 text-cyan-200"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "network" && <NetworkOverview />}
      {tab === "swot" && <SwotGrid />}
      {tab === "pestel" && <PestelGrid />}

      <GlassCard className="p-3">
        <p className="text-[10.5px] text-slate-500 leading-relaxed">
          SWOT and PESTEL content is a first-pass synthesis drafted from the uploaded centrality,
          density, land-use and causal-loop analyses — review, adjust, and add citations before
          using this in a formal submission.
        </p>
      </GlassCard>
    </div>
  );
}
