import { useEffect, useState } from "react";
import { ImageOverlay, useMap } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";

interface UHIMeta {
  bounds: [[number, number], [number, number]];
  tempMin: number;
  tempMax: number;
  unit: string;
}

export function UHIOverlayLayer() {
  const [meta, setMeta] = useState<UHIMeta | null>(null);
  const map = useMap();

  useEffect(() => {
    fetch("/data/uhi-metadata.json")
      .then((r) => r.json())
      .then((d: UHIMeta) => setMeta(d));
  }, []);

  if (!meta) return null;

  const bounds: LatLngBoundsExpression = meta.bounds;

  return (
    <ImageOverlay
      url="/data/images/uhi-overlay.png"
      bounds={bounds}
      opacity={0.75}
      interactive={false}
      eventHandlers={{
        add: () => map.fitBounds(bounds, { padding: [30, 30] }),
      }}
    />
  );
}

export function UHILegend() {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[10px] text-slate-400 font-medium">
        Surface Temperature
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-cyan-300 font-mono">31.5°C</span>
        <div
          className="flex-1 h-2.5 rounded-sm"
          style={{
            background:
              "linear-gradient(to right, #0a2878, #1e8cc8, #32c864, #c8dc32, #f0961e, #c81e1e)",
          }}
        />
        <span className="text-[10px] text-rose-400 font-mono">42.7°C</span>
      </div>
    </div>
  );
}
