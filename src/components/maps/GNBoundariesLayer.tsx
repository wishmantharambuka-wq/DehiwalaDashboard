import { GeoJSON } from "react-leaflet";
import type { Feature } from "geojson";
import type { Layer, PathOptions } from "leaflet";
import { useGNDivisions } from "../../hooks/useGeoData";
import type { GNProperties } from "../../types";

const style: PathOptions = {
  color: "#7ff5ff",
  weight: 1.4,
  opacity: 0.85,
  fillColor: "#4dd8e6",
  fillOpacity: 0.04,
};

export function GNBoundariesLayer() {
  const { data } = useGNDivisions();
  if (!data) return null;

  return (
    <GeoJSON
      data={data as GeoJSON.FeatureCollection}
      style={style}
      onEachFeature={(feature: Feature, layer: Layer) => {
        const props = feature.properties as GNProperties;
        layer.bindTooltip(props.name, {
          sticky: true,
          className: "gn-tooltip",
        });
      }}
    />
  );
}
