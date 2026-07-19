import { useMemo } from "react";
import { GeoJSON } from "react-leaflet";
import type { Feature } from "geojson";
import type { Layer, PathOptions } from "leaflet";
import { useGridAnalysis } from "../../hooks/useGeoData";
import { scaleColor, DENSITY_SCALE, normalize } from "../../utils/geo";
import type { GridCellProperties, GridMetric } from "../../types";

export const GRID_METRIC_LABELS: Record<GridMetric, string> = {
  FSI: "Floor Space Index (FSI)",
  GSI: "Ground Space Index (GSI)",
  OSR: "Open Space Ratio (OSR)",
  entropyIndex: "Land-use Entropy",
  UMI: "Urban Maturation Index",
  centralityNorm: "Centrality (normalized)",
};

export const GRID_METRIC_RANGES: Record<GridMetric, [number, number]> = {
  FSI: [0, 1.5],
  GSI: [0, 1],
  OSR: [0, 1],
  entropyIndex: [0, 0.7],
  UMI: [0.2, 0.56],
  centralityNorm: [0, 1],
};

interface GridAnalysisLayerProps {
  metric: GridMetric;
}

export function GridAnalysisLayer({ metric }: GridAnalysisLayerProps) {
  const { data } = useGridAnalysis();

  const styleFn = useMemo(() => {
    const [min, max] = GRID_METRIC_RANGES[metric];
    return (feature?: Feature): PathOptions => {
      const props = feature?.properties as GridCellProperties | undefined;
      const raw = props ? (props[metric] as number | null) : null;
      if (raw === null || raw === undefined) {
        return { color: "#2a3d47", weight: 0.2, fillOpacity: 0, opacity: 0 };
      }
      const t = normalize(raw, min, max);
      const color = scaleColor(t, DENSITY_SCALE);
      return {
        color,
        weight: 0.15,
        opacity: 0.35,
        fillColor: color,
        fillOpacity: 0.62,
      };
    };
  }, [metric]);

  if (!data) return null;

  return (
    <GeoJSON
      key={metric}
      data={data as GeoJSON.FeatureCollection}
      style={styleFn}
      onEachFeature={(feature: Feature, layer: Layer) => {
        const props = feature.properties as GridCellProperties;
        const value = props[metric];
        layer.bindTooltip(
          `${GRID_METRIC_LABELS[metric]}: ${value !== null && value !== undefined ? value.toFixed(3) : "n/a"}<br/>Dominant land use: ${props.dominantLanduse ?? "—"}`,
          { sticky: true, className: "gn-tooltip" },
        );
      }}
    />
  );
}

export function GridMetricLegend({ metric }: { metric: GridMetric }) {
  const [min, max] = GRID_METRIC_RANGES[metric];
  const stops = 5;
  return (
    <div>
      <div className="text-[10px] text-slate-400 mb-1">{GRID_METRIC_LABELS[metric]}</div>
      <div className="flex h-2.5 rounded-full overflow-hidden">
        {Array.from({ length: stops }).map((_, i) => (
          <div
            key={i}
            className="flex-1"
            style={{ background: scaleColor(i / (stops - 1), DENSITY_SCALE) }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-0.5">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
