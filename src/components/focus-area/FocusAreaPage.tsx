import { useState } from "react";
import clsx from "clsx";
import { GlassCard } from "../ui/GlassCard";
import { Toggle } from "../ui/Toggle";
import { SegmentedControl } from "../ui/SegmentedControl";
import { FloatingMapPanel } from "../ui/FloatingMapPanel";
import { ImageLightbox } from "../ui/ImageLightbox";
import { MapCanvas } from "../maps/MapCanvas";
import { GNBoundariesLayer } from "../maps/GNBoundariesLayer";
import { LanduseLayer, LanduseLegend } from "../maps/LanduseLayer";
import { GridAnalysisLayer, GridMetricLegend } from "../maps/GridAnalysisLayer";
import {
  CentralityNetworkLayer,
  CentralityLegend,
} from "../maps/CentralityNetworkLayer";
import { useDashboardStore } from "../../store/useDashboardStore";
import type { GridMetric } from "../../types";
import {
  centralityFindings,
  densityFindings,
  urbanMaturationFindings,
  type FindingBlock,
} from "../../data/content";

type SubTab = "centrality" | "density" | "maturation";

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: "centrality", label: "Centrality" },
  { id: "density", label: "Density" },
  { id: "maturation", label: "Urban Maturation" },
];

function FindingsList({ blocks }: { blocks: FindingBlock[] }) {
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block) => (
        <div key={block.title}>
          <h4 className="font-display font-semibold text-sm text-cyan-200 mb-1.5">
            {block.title}
          </h4>
          <ul className="space-y-1.5">
            {block.points.map((p, i) => (
              <li key={i} className="text-[12px] text-slate-300 leading-relaxed flex gap-1.5">
                <span className="text-cyan-400/70 mt-0.5">▸</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function AnalysisImage({ src, label, onOpen }: { src: string; label: string; onOpen: (src: string, label: string) => void }) {
  return (
    <button onClick={() => onOpen(src, label)} className="block group text-left w-full">
      <div className="rounded-lg overflow-hidden border border-cyan-400/15">
        <img
          src={src}
          alt={label}
          className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="text-[10px] text-slate-500 mt-1 text-center group-hover:text-slate-300 transition-colors">{label}</div>
    </button>
  );
}

export function FocusAreaPage() {
  const [subTab, setSubTab] = useState<SubTab>("centrality");
  const layers = useDashboardStore((s) => s.layers);
  const toggleLayer = useDashboardStore((s) => s.toggleLayer);
  const gridMetric = useDashboardStore((s) => s.gridMetric);
  const setGridMetric = useDashboardStore((s) => s.setGridMetric);
  const centralityRadius = useDashboardStore((s) => s.centralityRadius);
  const setCentralityRadius = useDashboardStore((s) => s.setCentralityRadius);
  const centralityMetric = useDashboardStore((s) => s.centralityMetric);
  const setCentralityMetric = useDashboardStore((s) => s.setCentralityMetric);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  const openLightbox = (src: string, alt: string) => setLightbox({ src, alt });

  const densityMetricOptions: { value: GridMetric; label: string }[] = [
    { value: "FSI", label: "FSI" },
    { value: "GSI", label: "GSI" },
    { value: "OSR", label: "OSR" },
    { value: "entropyIndex", label: "Entropy" },
  ];

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex gap-1.5">
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={clsx(
              "px-3.5 py-1.5 rounded-lg text-xs font-display font-semibold tracking-wide transition-colors border",
              subTab === t.id
                ? "bg-cyan-400/15 border-cyan-400/40 text-cyan-200"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-3 flex-1 min-h-0">
        <GlassCard className="relative overflow-hidden min-h-[460px] lg:min-h-0" glow>
          <MapCanvas>
            {layers.landuse && <LanduseLayer />}
            {subTab === "density" && layers.gridAnalysis && <GridAnalysisLayer metric={gridMetric} />}
            {subTab === "maturation" && layers.urbanMaturation && <GridAnalysisLayer metric="UMI" />}
            {subTab === "centrality" && layers.centralityNetwork && (
              <CentralityNetworkLayer metric={centralityMetric} radius={centralityRadius} />
            )}
            {layers.gnBoundaries && <GNBoundariesLayer />}
          </MapCanvas>

          <FloatingMapPanel title="Map layers">
            <Toggle
              label="GN division boundaries"
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

            {subTab === "centrality" && (
              <>
                <Toggle
                  label="Centrality network"
                  checked={layers.centralityNetwork}
                  onChange={() => toggleLayer("centralityNetwork")}
                  swatch="#ff6bf0"
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
              </>
            )}

            {subTab === "density" && (
              <>
                <Toggle
                  label="Density analysis"
                  checked={layers.gridAnalysis}
                  onChange={() => toggleLayer("gridAnalysis")}
                  swatch="#50fa7b"
                />
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
              </>
            )}

            {subTab === "maturation" && (
              <>
                <Toggle
                  label="Urban maturation"
                  checked={layers.urbanMaturation}
                  onChange={() => toggleLayer("urbanMaturation")}
                  swatch="#bd93f9"
                />
                {layers.urbanMaturation && (
                  <>
                    <div className="h-px bg-white/10 my-1" />
                    <GridMetricLegend metric="UMI" />
                  </>
                )}
              </>
            )}

            {layers.landuse && (
              <>
                <div className="h-px bg-white/10 my-1" />
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                  Land use
                </div>
                <LanduseLegend />
              </>
            )}
          </FloatingMapPanel>
        </GlassCard>

        <div className="flex flex-col gap-3 min-h-0 overflow-y-auto no-scrollbar pr-1">
          <GlassCard className="p-4">
            {subTab === "centrality" && <FindingsList blocks={centralityFindings} />}
            {subTab === "density" && <FindingsList blocks={densityFindings} />}
            {subTab === "maturation" && <FindingsList blocks={urbanMaturationFindings} />}
          </GlassCard>

          <GlassCard className="p-4">
            <h4 className="font-display font-semibold text-sm text-cyan-200 mb-2">
              Supporting analysis maps
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {subTab === "centrality" && (
                <>
                  <AnalysisImage src="/data/images/closeness-500m.jpg" label="Closeness · 500m" onOpen={openLightbox} />
                  <AnalysisImage src="/data/images/closeness-2000m.jpg" label="Closeness · 2000m" onOpen={openLightbox} />
                  <AnalysisImage src="/data/images/closeness-5000m.jpg" label="Closeness · 5000m" onOpen={openLightbox} />
                  <AnalysisImage src="/data/images/betweenness-2000m.jpg" label="Betweenness · 2000m" onOpen={openLightbox} />
                </>
              )}
              {subTab === "density" && (
                <>
                  <AnalysisImage src="/data/images/fsi-map.jpg" label="FSI" onOpen={openLightbox} />
                  <AnalysisImage src="/data/images/gsi-map.jpg" label="GSI" onOpen={openLightbox} />
                  <AnalysisImage src="/data/images/osr-map.jpg" label="OSR" onOpen={openLightbox} />
                  <AnalysisImage src="/data/images/entropy-map.jpg" label="Land-use Entropy" onOpen={openLightbox} />
                </>
              )}
              {subTab === "maturation" && (
                <>
                  <AnalysisImage src="/data/images/umi-map.jpg" label="Urban Maturation Index" onOpen={openLightbox} />
                  <AnalysisImage src="/data/images/landuse-map.jpg" label="Land Use" onOpen={openLightbox} />
                </>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      <ImageLightbox
        src={lightbox?.src ?? null}
        alt={lightbox?.alt}
        onClose={() => setLightbox(null)}
      />
    </div>
  );
}
