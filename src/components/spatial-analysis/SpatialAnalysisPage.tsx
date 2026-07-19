import { GlassCard } from "../ui/GlassCard";
import { Toggle } from "../ui/Toggle";
import { SegmentedControl } from "../ui/SegmentedControl";
import { FloatingMapPanel } from "../ui/FloatingMapPanel";
import { MapCanvas } from "../maps/MapCanvas";
import { GNBoundariesLayer } from "../maps/GNBoundariesLayer";
import { LanduseLayer, LanduseLegend } from "../maps/LanduseLayer";
import { GridAnalysisLayer, GridMetricLegend } from "../maps/GridAnalysisLayer";
import {
  CentralityNetworkLayer,
  CentralityLegend,
} from "../maps/CentralityNetworkLayer";
import { UHIOverlayLayer, UHILegend } from "../maps/UHIOverlayLayer";
import { useDashboardStore } from "../../store/useDashboardStore";
import type { GridMetric } from "../../types";

const densityMetricOptions: { value: GridMetric; label: string }[] = [
  { value: "FSI", label: "FSI" },
  { value: "GSI", label: "GSI" },
  { value: "OSR", label: "OSR" },
  { value: "entropyIndex", label: "Entropy" },
  { value: "UMI", label: "UMI" },
];

export function SpatialAnalysisPage() {
  const layers = useDashboardStore((s) => s.layers);
  const toggleLayer = useDashboardStore((s) => s.toggleLayer);
  const gridMetric = useDashboardStore((s) => s.gridMetric);
  const setGridMetric = useDashboardStore((s) => s.setGridMetric);
  const centralityRadius = useDashboardStore((s) => s.centralityRadius);
  const setCentralityRadius = useDashboardStore((s) => s.setCentralityRadius);
  const centralityMetric = useDashboardStore((s) => s.centralityMetric);
  const setCentralityMetric = useDashboardStore((s) => s.setCentralityMetric);

  return (
    <div className="h-full">
      <GlassCard className="relative overflow-hidden h-full" glow>
        <MapCanvas>
          {layers.landuse && <LanduseLayer />}
          {layers.gridAnalysis && <GridAnalysisLayer metric={gridMetric} />}
          {layers.urbanMaturation && <GridAnalysisLayer metric="UMI" />}
          {layers.centralityNetwork && (
            <CentralityNetworkLayer metric={centralityMetric} radius={centralityRadius} />
          )}
          {layers.urbanHeat && <UHIOverlayLayer />}
          {layers.gnBoundaries && <GNBoundariesLayer />}
        </MapCanvas>

        <FloatingMapPanel title="Layer controls">
          <Toggle
            label="GN boundaries"
            checked={layers.gnBoundaries}
            onChange={() => toggleLayer("gnBoundaries")}
            swatch="#7ff5ff"
          />
          <Toggle
            label="Land use"
            checked={layers.landuse}
            onChange={() => toggleLayer("landuse")}
            swatch="#f5b942"
          />
          <Toggle
            label="Centrality network"
            checked={layers.centralityNetwork}
            onChange={() => toggleLayer("centralityNetwork")}
            swatch="#ff6bf0"
          />
          <Toggle
            label="Density analysis"
            checked={layers.gridAnalysis}
            onChange={() => toggleLayer("gridAnalysis")}
            swatch="#50fa7b"
          />
          <Toggle
            label="Urban maturation"
            checked={layers.urbanMaturation}
            onChange={() => toggleLayer("urbanMaturation")}
            swatch="#bd93f9"
          />
          <Toggle
            label="Urban heat island"
            checked={layers.urbanHeat}
            onChange={() => toggleLayer("urbanHeat")}
            swatch="#e84030"
          />

          {layers.centralityNetwork && (
            <>
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
            </>
          )}

          {layers.gridAnalysis && (
            <>
              <div className="h-px bg-white/10 my-1" />
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                Density metric
              </div>
              <SegmentedControl value={gridMetric} onChange={setGridMetric} options={densityMetricOptions} />
              <GridMetricLegend metric={gridMetric} />
            </>
          )}

          {layers.urbanMaturation && (
            <>
              <div className="h-px bg-white/10 my-1" />
              <GridMetricLegend metric="UMI" />
            </>
          )}

          {layers.urbanHeat && (
            <>
              <div className="h-px bg-white/10 my-1" />
              <UHILegend />
            </>
          )}

          {layers.landuse && (
            <>
              <div className="h-px bg-white/10 my-1" />
              <LanduseLegend />
            </>
          )}
        </FloatingMapPanel>
      </GlassCard>
    </div>
  );
}
