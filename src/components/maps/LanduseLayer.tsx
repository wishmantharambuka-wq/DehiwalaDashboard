import { GeoJSON } from "react-leaflet";
import type { Feature } from "geojson";
import type { Layer, PathOptions } from "leaflet";
import { useLanduse } from "../../hooks/useGeoData";
import type { LanduseProperties } from "../../types";

export const LANDUSE_COLORS: Record<string, string> = {
  Residential: "#f5b942",
  Commercial: "#f4657a",
  Institutional: "#8b7cf6",
  Cultural: "#c084fc",
  Transport: "#5b7d8a",
  "Public Space": "#7ff5ff",
  "Barren Land": "#8a7a5c",
  "Under Construction": "#d97706",
  Industrial: "#e2643a",
  Agriculture: "#8ee06b",
  "Coastal area": "#42d4c0",
  Water: "#2f7fd1",
};

export function landuseColor(mainClass: string): string {
  return LANDUSE_COLORS[mainClass] ?? "#6b7f8a";
}

export function LanduseLayer() {
  const { data } = useLanduse();
  if (!data) return null;

  return (
    <GeoJSON
      data={data as GeoJSON.FeatureCollection}
      style={(feature) => {
        const props = feature?.properties as LanduseProperties;
        const color = landuseColor(props?.mainClass);
        const opts: PathOptions = {
          color,
          weight: 0.5,
          opacity: 0.6,
          fillColor: color,
          fillOpacity: 0.45,
        };
        return opts;
      }}
      onEachFeature={(feature: Feature, layer: Layer) => {
        const props = feature.properties as LanduseProperties;
        layer.bindTooltip(`${props.subClass} (${props.mainClass})`, {
          sticky: true,
          className: "gn-tooltip",
        });
      }}
    />
  );
}

export function LanduseLegend() {
  const items = Object.entries(LANDUSE_COLORS);
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-slate-300">
      {items.map(([label, color]) => (
        <div key={label} className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-sm shrink-0"
            style={{ background: color }}
          />
          <span className="truncate">{label}</span>
        </div>
      ))}
    </div>
  );
}
