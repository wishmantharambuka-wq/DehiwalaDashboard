import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import type { ReactNode } from "react";
import L from "leaflet";
import type { Map as LeafletMap, LatLngBounds } from "leaflet";
import { useBoundary } from "../../hooks/useGeoData";

const FALLBACK_BOUNDS: [[number, number], [number, number]] = [
  [6.8395, 79.858],
  [6.867, 79.881],
];

const FIT_PADDING: [number, number] = [28, 28];

function ResetViewControl({ onReset }: { onReset: () => void }) {
  return (
    <button
      onClick={onReset}
      title="Reset view to full boundary"
      className="absolute z-[500] w-8 h-8 rounded-md glass-panel-solid flex items-center justify-center text-cyan-300 hover:text-cyan-100 hover:bg-cyan-400/10 transition-colors"
      style={{ top: 12, left: 56 }}
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
        <path
          d="M3 11l9-8 9 8M5 10v10h14V10"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

interface MapCanvasProps {
  children?: ReactNode;
  className?: string;
}

export function MapCanvas({ children, className }: MapCanvasProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const { data: boundaryData } = useBoundary();
  const didInitialFit = useRef(false);

  const bounds: LatLngBounds | null = useMemo(() => {
    if (!boundaryData) return null;
    const layer = L.geoJSON(boundaryData as GeoJSON.FeatureCollection);
    const b = layer.getBounds();
    return b.isValid() ? b : null;
  }, [boundaryData]);

  useEffect(() => {
    if (!bounds || !mapRef.current || didInitialFit.current) return;
    mapRef.current.fitBounds(bounds, { padding: FIT_PADDING });
    didInitialFit.current = true;
  }, [bounds]);

  const handleReset = () => {
    if (mapRef.current && bounds) {
      mapRef.current.fitBounds(bounds, { padding: FIT_PADDING });
    }
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        ref={mapRef}
        bounds={FALLBACK_BOUNDS}
        className={className ?? "w-full h-full"}
        preferCanvas
        zoomControl={true}
        attributionControl={true}
        style={{ background: "#071018" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={20}
        />
        {children}
      </MapContainer>
      {bounds && <ResetViewControl onReset={handleReset} />}
    </div>
  );
}
