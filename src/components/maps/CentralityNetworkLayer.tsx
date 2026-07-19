import { useMemo } from "react";
import { GeoJSON } from "react-leaflet";
import type { Feature } from "geojson";
import type { PathOptions } from "leaflet";
import { useCentralityLines, useCentralityProperties } from "../../hooks/useGeoData";
import { scaleColor, CENTRALITY_SCALE, normalize } from "../../utils/geo";
import type { CentralityRadius, CentralityMetric } from "../../types";

interface CentralityNetworkLayerProps {
  metric: CentralityMetric;
  radius: CentralityRadius;
}

// properties row layout: [connectivity, choice500, integration500, choice2000, integration2000, choice5000, integration5000]
// Space-syntax equivalence used for labelling: Integration ≈ Closeness centrality,
// Choice ≈ Betweenness centrality (how often a segment lies on shortest paths).
const RADIUS_TO_INDEX: Record<CentralityMetric, Record<CentralityRadius, number>> = {
  closeness: { 500: 2, 2000: 4, 5000: 6 }, // Integration columns
  betweenness: { 500: 1, 2000: 3, 5000: 5 }, // Choice columns
};

function columnIndex(metric: CentralityMetric, radius: CentralityRadius): number {
  return RADIUS_TO_INDEX[metric][radius];
}

export const CENTRALITY_METRIC_LABELS: Record<CentralityMetric, string> = {
  closeness: "Closeness Centrality",
  betweenness: "Betweenness Centrality",
};

export function useCentralityRange(metric: CentralityMetric, radius: CentralityRadius) {
  const { data: props } = useCentralityProperties();
  const colIdx = columnIndex(metric, radius);
  return useMemo<[number, number]>(() => {
    if (!props) return [0, 1];
    let min = Infinity;
    let max = -Infinity;
    for (const row of props) {
      const v = row[colIdx];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    return [min, max];
  }, [props, colIdx]);
}

export function CentralityNetworkLayer({ metric, radius }: CentralityNetworkLayerProps) {
  const { data: lines } = useCentralityLines();
  const { data: props } = useCentralityProperties();

  const colIdx = columnIndex(metric, radius);
  const range = useCentralityRange(metric, radius);

  const styleFn = useMemo(() => {
    const [min, max] = range;
    return (feature?: Feature): PathOptions => {
      const id = (feature?.properties as { id: number } | undefined)?.id;
      if (id === undefined || !props) {
        return { color: "#2c4d5c", weight: 1, opacity: 0.4 };
      }
      const value = props[id]?.[colIdx] ?? min;
      const t = normalize(value, min, max);
      const color = scaleColor(t, CENTRALITY_SCALE);
      return {
        color,
        weight: 1 + t * 2.4,
        opacity: 0.55 + t * 0.4,
      };
    };
  }, [range, props, colIdx]);

  if (!lines || !props) return null;

  // key forces a clean re-render of the vector layer when metric/radius changes
  return (
    <GeoJSON key={`${metric}-${radius}`} data={lines as GeoJSON.FeatureCollection} style={styleFn} />
  );
}

export function CentralityLegend({
  metric,
  radius,
}: {
  metric: CentralityMetric;
  radius: CentralityRadius;
}) {
  const range = useCentralityRange(metric, radius);
  const stops = 5;
  return (
    <div>
      <div className="text-[10px] text-slate-400 mb-1">
        {CENTRALITY_METRIC_LABELS[metric]} · R{radius}m
      </div>
      <div className="flex h-2.5 rounded-full overflow-hidden">
        {Array.from({ length: stops }).map((_, i) => (
          <div
            key={i}
            className="flex-1"
            style={{ background: scaleColor(i / (stops - 1), CENTRALITY_SCALE) }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-0.5">
        <span>{range[0].toFixed(2)}</span>
        <span>{range[1].toFixed(2)}</span>
      </div>
    </div>
  );
}
