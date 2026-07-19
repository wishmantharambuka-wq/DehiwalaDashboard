// Lightweight equirectangular projection: converts lon/lat degrees to local
// planar meters around a chosen origin. Good enough for a study area a few
// km across (Dehiwala DSD is ~5km x 2.5km).

export interface Origin {
  lon: number;
  lat: number;
}

const METERS_PER_DEG_LAT = 110_574;

export function metersPerDegLon(lat: number): number {
  return 111_320 * Math.cos((lat * Math.PI) / 180);
}

/** Project [lon, lat] -> [x, z] meters, x = east, z = south (so north is -z) */
export function project(lon: number, lat: number, origin: Origin): [number, number] {
  const x = (lon - origin.lon) * metersPerDegLon(origin.lat);
  const z = (origin.lat - lat) * METERS_PER_DEG_LAT; // north = -z, positive z = south
  return [x, z];
}

export function unproject(x: number, z: number, origin: Origin): [number, number] {
  const lon = origin.lon + x / metersPerDegLon(origin.lat);
  const lat = origin.lat - z / METERS_PER_DEG_LAT;
  return [lon, lat];
}

/** Ring = array of [lon, lat] pairs (GeoJSON linear ring, first == last) */
export type Ring = number[][];
export type Polygon = Ring[]; // [outer, ...holes]
export type MultiPolygon = Polygon[];

export function projectRing(ring: Ring, origin: Origin): [number, number][] {
  return ring.map(([lon, lat]) => project(lon, lat, origin));
}

/** Shoelace formula area (unsigned), works on projected local coords */
export function ringArea(points: [number, number][]): number {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
}

export function ringCentroid(points: [number, number][]): [number, number] {
  let x = 0;
  let y = 0;
  for (const p of points) {
    x += p[0];
    y += p[1];
  }
  return [x / points.length, y / points.length];
}

/** Compute area (m^2) and centroid for a whole MultiPolygon (outer rings only, minus holes) */
export function multiPolygonMetrics(mp: MultiPolygon, origin: Origin) {
  let totalArea = 0;
  let cx = 0;
  let cy = 0;
  let weightSum = 0;

  for (const polygon of mp) {
    const [outer, ...holes] = polygon;
    const outerPts = projectRing(outer, origin);
    const outerArea = ringArea(outerPts);
    let holesArea = 0;
    for (const hole of holes) {
      holesArea += ringArea(projectRing(hole, origin));
    }
    const area = Math.max(outerArea - holesArea, 0);
    const [ox, oy] = ringCentroid(outerPts);
    totalArea += area;
    cx += ox * area;
    cy += oy * area;
    weightSum += area;
  }

  if (weightSum === 0) return { area: 0, centroid: [0, 0] as [number, number] };
  return { area: totalArea, centroid: [cx / weightSum, cy / weightSum] as [number, number] };
}

// ---------- Color scales ----------

/** Interpolate between two hex colors */
export function lerpColor(a: string, b: string, t: number): string {
  const ah = parseInt(a.slice(1), 16);
  const bh = parseInt(b.slice(1), 16);
  const ar = (ah >> 16) & 0xff;
  const ag = (ah >> 8) & 0xff;
  const ab = ah & 0xff;
  const br = (bh >> 16) & 0xff;
  const bg = (bh >> 8) & 0xff;
  const bb = bh & 0xff;
  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);
  return `#${((1 << 24) + (rr << 16) + (rg << 8) + rb).toString(16).slice(1)}`;
}

const TEAL_SCALE = ["#0e3b45", "#12626e", "#1a8f96", "#31c4c4", "#7ff5ff"];

export function scaleColor(t: number, stops: string[] = TEAL_SCALE): string {
  const clamped = Math.min(Math.max(t, 0), 1);
  const segments = stops.length - 1;
  const scaled = clamped * segments;
  const idx = Math.min(Math.floor(scaled), segments - 1);
  const localT = scaled - idx;
  return lerpColor(stops[idx], stops[idx + 1], localT);
}

export const DENSITY_SCALE = ["#152238", "#1c3f5c", "#1c8fa6", "#42d4c0", "#c9f76c"];
export const HEAT_SCALE = ["#0e2a4a", "#1f6f8b", "#e8b84b", "#e2643a", "#c22a2a"];
export const CENTRALITY_SCALE = ["#0d1f3a", "#2557a8", "#3aa0d1", "#6be4d0", "#e8fa6b"];

export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
}
