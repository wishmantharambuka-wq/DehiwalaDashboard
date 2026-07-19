import { useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Toggle } from "../ui/Toggle";
import { FloatingMapPanel } from "../ui/FloatingMapPanel";
import { ImageLightbox } from "../ui/ImageLightbox";
import { MapCanvas } from "../maps/MapCanvas";
import { GNBoundariesLayer } from "../maps/GNBoundariesLayer";
import { LanduseLayer, LanduseLegend } from "../maps/LanduseLayer";
import { UHIOverlayLayer, UHILegend } from "../maps/UHIOverlayLayer";
import { ClimateWidget } from "../overview/ClimateWidget";
import { useDashboardStore } from "../../store/useDashboardStore";
import { heatCausalLoops, leveragePoints, windAnalysisNotes, type FindingBlock } from "../../data/content";

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
                <span className="text-amber-400/70 mt-0.5">▸</span>
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

export function EnvironmentalPage() {
  const layers = useDashboardStore((s) => s.layers);
  const toggleLayer = useDashboardStore((s) => s.toggleLayer);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  const openLightbox = (src: string, alt: string) => setLightbox({ src, alt });

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-3 flex-1 min-h-0">
        <GlassCard className="relative overflow-hidden min-h-[460px] lg:min-h-0" glow>
          <MapCanvas>
            {layers.urbanHeat && <UHIOverlayLayer />}
            {layers.landuse && <LanduseLayer />}
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
            <Toggle
              label="Urban heat island"
              checked={layers.urbanHeat}
              onChange={() => toggleLayer("urbanHeat")}
              swatch="#e84030"
            />

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

        <div className="flex flex-col gap-3 min-h-0 overflow-y-auto no-scrollbar pr-1">
          <ClimateWidget />

          <GlassCard className="p-4">
            <h4 className="font-display font-semibold text-sm text-cyan-200 mb-2">
              Reference Maps
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <AnalysisImage
                src="/data/images/urban-heat-map.jpg"
                label="Urban Heat Map"
                onOpen={openLightbox}
              />
              <AnalysisImage
                src="/data/images/uhi-overlay.png"
                label="UHI Raster Overlay"
                onOpen={openLightbox}
              />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <FindingsList blocks={heatCausalLoops} />
          </GlassCard>

          <GlassCard className="p-4">
            <FindingsList blocks={leveragePoints} />
          </GlassCard>

          <GlassCard className="p-4">
            <FindingsList blocks={windAnalysisNotes} />
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
