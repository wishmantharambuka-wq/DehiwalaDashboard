import { AnimatePresence, motion } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import { StatCard } from "../ui/StatCard";
import { PopulationPyramid } from "./PopulationPyramid";
import { AgeGapBars } from "./AgeGapBars";
import { ComparisonBars } from "./ComparisonBars";
import { usePopulationData } from "../../hooks/useGeoData";
import { useDashboardStore } from "../../store/useDashboardStore";

export function GNDetailPanel() {
  const { data } = usePopulationData();
  const selectedGN = useDashboardStore((s) => s.selectedGN);
  const setSelectedGN = useDashboardStore((s) => s.setSelectedGN);

  if (!data) return null;

  const record = selectedGN ? data.gnDivisions[selectedGN] : data.cityAggregate;
  const isCity = !selectedGN;

  const comparisonData = Object.values(data.gnDivisions).map((d) => ({
    name: d.name,
    value: d.totalPopulation,
  }));

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={selectedGN ?? "city"}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 24 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col gap-3 h-full overflow-y-auto no-scrollbar pr-1"
      >
        <GlassCard className="p-4" glow>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500">
                {isCity ? "Entire Dehiwala" : "GN Division"}
              </div>
              <h3 className="font-display font-bold text-lg text-cyan-100 glow-text leading-tight mt-0.5">
                {record?.name}
              </h3>
            </div>
            {!isCity && (
              <button
                onClick={() => setSelectedGN(null)}
                className="text-[11px] px-2.5 py-1 rounded-md border border-cyan-400/25 text-cyan-300 hover:bg-cyan-400/10 transition-colors whitespace-nowrap"
              >
                ← City view
              </button>
            )}
          </div>

          {!record ? (
            <p className="text-xs text-slate-500 mt-3">
              No population survey data is available for this GN division in the supplied
              dataset.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <StatCard
                  label="Population"
                  value={record.totalPopulation.toLocaleString()}
                  accent="cyan"
                  compact
                />
                <StatCard
                  label="Male"
                  value={`${record.malePct}%`}
                  sub={record.male.toLocaleString()}
                  accent="teal"
                  compact
                />
                <StatCard
                  label="Female"
                  value={`${record.femalePct}%`}
                  sub={record.female.toLocaleString()}
                  accent="rose"
                  compact
                />
              </div>
              {isCity && "gnCount" in record && (
                <p className="text-[11px] text-slate-500 mt-2">
                  Aggregated across {(record as { gnCount: number }).gnCount} surveyed GN
                  divisions (6 further divisions in the DSD have no population dataset supplied).
                </p>
              )}
            </>
          )}
        </GlassCard>

        {record && (
          <>
            <GlassCard className="p-4">
              <h4 className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-1">
                Age &amp; Gender Pyramid
              </h4>
              <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-teal-400 inline-block" /> Male
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" /> Female
                </span>
              </div>
              <PopulationPyramid ageBands={record.ageBands} height={300} />
            </GlassCard>

            <GlassCard className="p-4">
              <h4 className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-1">
                Age-Group Gender Gap
              </h4>
              <p className="text-[10px] text-slate-500 mb-1">
                Filled bars show which gender leads in each age band (cyan = male-leaning, rose =
                female-leaning).
              </p>
              <AgeGapBars ageBands={record.ageBands} height={300} />
            </GlassCard>
          </>
        )}

        <GlassCard className="p-4">
          <h4 className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-1">
            Population by GN Division
          </h4>
          <ComparisonBars data={comparisonData} highlightName={selectedGN} height={300} />
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
}
