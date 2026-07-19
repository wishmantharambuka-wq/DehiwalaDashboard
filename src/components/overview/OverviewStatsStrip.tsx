import { useMemo } from "react";
import { StatCard } from "../ui/StatCard";
import { usePopulationData, useGNDivisions, useLanduse } from "../../hooks/useGeoData";
import type { LanduseProperties } from "../../types";
import type { Feature } from "geojson";

export function OverviewStatsStrip() {
  const pop = usePopulationData();
  const gnd = useGNDivisions();
  const lu = useLanduse();

  const builtUpPct = useMemo(() => {
    if (!lu.data) return null;
    const features = lu.data.features as unknown as Feature<GeoJSON.Geometry, LanduseProperties>[];
    let built = 0;
    let total = 0;
    for (const f of features) {
      const area = f.properties.areaM2 || 0;
      total += area;
      if (f.properties.domain === "Built-up") built += area;
    }
    return total > 0 ? Math.round((built / total) * 100) : null;
  }, [lu.data]);

  const gnCount = gnd.data?.features.length ?? null;
  const surveyedCount = pop.data?.cityAggregate.gnCount ?? null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        label="Total Population"
        value={pop.data ? pop.data.cityAggregate.totalPopulation.toLocaleString() : "—"}
        sub="surveyed GN divisions"
        accent="cyan"
      />
      <StatCard
        label="GN Divisions"
        value={gnCount ? `${gnCount}` : "—"}
        sub={surveyedCount ? `${surveyedCount} with population data` : undefined}
        accent="teal"
      />
      <StatCard
        label="Built-up Land"
        value={builtUpPct !== null ? `${builtUpPct}%` : "—"}
        sub="of mapped land use area"
        accent="amber"
      />
      <StatCard
        label="Male : Female"
        value={
          pop.data
            ? `${pop.data.cityAggregate.malePct}:${pop.data.cityAggregate.femalePct}`
            : "—"
        }
        sub="city-wide ratio"
        accent="violet"
      />
    </div>
  );
}
