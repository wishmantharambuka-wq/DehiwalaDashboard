import { GlassCard } from "../ui/GlassCard";
import { StatCard } from "../ui/StatCard";
import { usePopulationData } from "../../hooks/useGeoData";
import { useGridSummaryStats } from "../../hooks/useGridSummaryStats";
import { synthesisNarrative, type FindingBlock } from "../../data/content";

function NarrativeBlock({ block, index }: { block: FindingBlock; index: number }) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-7 h-7 rounded-full bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center font-mono text-xs text-cyan-300">
          {index + 1}
        </div>
        <div>
          <h4 className="font-display font-semibold text-sm text-cyan-200 mb-2">{block.title}</h4>
          <ul className="space-y-2">
            {block.points.map((p, i) => (
              <li key={i} className="text-[12.5px] text-slate-300 leading-relaxed">
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </GlassCard>
  );
}

export function SynthesisPage() {
  const pop = usePopulationData();
  const grid = useGridSummaryStats();

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto no-scrollbar pr-1">
      <GlassCard className="p-4" glow>
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1">
          City-wide composite indicators
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          <StatCard
            label="Avg. FSI"
            value={grid ? grid.avgFSI.toFixed(2) : "—"}
            sub="floor space index"
            accent="cyan"
            compact
          />
          <StatCard
            label="Avg. GSI"
            value={grid ? grid.avgGSI.toFixed(2) : "—"}
            sub="ground space index"
            accent="teal"
            compact
          />
          <StatCard
            label="Avg. OSR"
            value={grid ? grid.avgOSR.toFixed(2) : "—"}
            sub="open space ratio"
            accent="violet"
            compact
          />
          <StatCard
            label="Avg. UMI"
            value={grid ? grid.avgUMI.toFixed(2) : "—"}
            sub="urban maturation index"
            accent="amber"
            compact
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
          <StatCard
            label="Total Population"
            value={pop.data ? pop.data.cityAggregate.totalPopulation.toLocaleString() : "—"}
            accent="cyan"
            compact
          />
          <StatCard
            label="Dominant Land Use"
            value={grid ? grid.dominantLanduse : "—"}
            sub={`across ${grid?.cellCount ?? 0} analysis cells`}
            accent="teal"
            compact
          />
          <StatCard
            label="Avg. Land-use Entropy"
            value={grid ? grid.avgEntropy.toFixed(2) : "—"}
            sub="mixing diversity, 0–1"
            accent="rose"
            compact
          />
        </div>
      </GlassCard>

      <div className="flex flex-col gap-3">
        {synthesisNarrative.map((block, i) => (
          <NarrativeBlock key={block.title} block={block} index={i} />
        ))}
      </div>

      <GlassCard className="p-4">
        <p className="text-[11px] text-slate-500 leading-relaxed">
          This synthesis links the Focus Area (centrality, density, urban maturation) and
          Environmental Analysis (urban heat causal loops) tabs into a single storyline, drafted
          from the uploaded PL2307 / PL1301 presentation analyses. Treat it as a first-pass
          integration to refine as your own interpretation develops.
        </p>
      </GlassCard>
    </div>
  );
}
