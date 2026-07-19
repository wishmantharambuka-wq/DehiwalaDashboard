import { useMemo } from "react";
import type { Feature, FeatureCollection, MultiPolygon as GeoMultiPolygon } from "geojson";
import { useGNDivisions } from "./useGeoData";
import { usePopulationData } from "./useGeoData";
import { multiPolygonMetrics, normalize } from "../utils/geo";
import { PROJECTION_ORIGIN } from "../config";
import type { GNProperties } from "../types";

export interface ProjectedGN {
  name: string;
  pcode: string;
  hasPopulationData: boolean;
  geometry: GeoMultiPolygon["coordinates"];
  areaM2: number;
  areaKm2: number;
  centroid: [number, number]; // local meters [x, z]
  population: number | null;
  densityPerKm2: number | null;
  heightT: number; // 0..1 normalized height factor for extrusion
  densityT: number; // 0..1 normalized density factor for color
}

export interface ProjectedGNResult {
  loading: boolean;
  error: string | null;
  divisions: ProjectedGN[];
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number } | null;
  cityCentroid: [number, number];
}

export function useProjectedGNDivisions(): ProjectedGNResult {
  const gnd = useGNDivisions();
  const pop = usePopulationData();

  return useMemo(() => {
    if (gnd.loading || pop.loading || !gnd.data || !pop.data) {
      return {
        loading: true,
        error: gnd.error || pop.error,
        divisions: [],
        bounds: null,
        cityCentroid: [0, 0],
      };
    }

    const fc = gnd.data as FeatureCollection<GeoMultiPolygon, GNProperties>;
    const raw = fc.features.map((feat: Feature<GeoMultiPolygon, GNProperties>) => {
      const mp = feat.geometry.coordinates;
      const { area, centroid: rawCentroid } = multiPolygonMetrics(mp, PROJECTION_ORIGIN);
      const centroid: [number, number] = [rawCentroid[0], -rawCentroid[1]];
      const name = feat.properties.name;
      const popRecord = pop.data!.gnDivisions[name];
      const population = popRecord ? popRecord.totalPopulation : null;
      const areaKm2 = area / 1_000_000;
      const density = population && areaKm2 > 0 ? population / areaKm2 : null;
      return {
        name,
        pcode: feat.properties.pcode,
        hasPopulationData: feat.properties.hasPopulationData,
        geometry: mp,
        areaM2: area,
        areaKm2,
        centroid,
        population,
        densityPerKm2: density,
      };
    });

    const densities = raw.map((d) => d.densityPerKm2).filter((d): d is number => d !== null);
    const minDensity = Math.min(...densities);
    const maxDensity = Math.max(...densities);
    const pops = raw.map((d) => d.population).filter((p): p is number => p !== null);
    const minPop = Math.min(...pops);
    const maxPop = Math.max(...pops);

    const divisions: ProjectedGN[] = raw.map((d) => ({
      ...d,
      heightT:
        d.population !== null ? 0.25 + 0.75 * normalize(d.population, minPop, maxPop) : 0.12,
      densityT:
        d.densityPerKm2 !== null ? normalize(d.densityPerKm2, minDensity, maxDensity) : 0,
    }));

    const xs = divisions.flatMap((d) => [d.centroid[0]]);
    const zs = divisions.flatMap((d) => [d.centroid[1]]);
    const bounds = {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minZ: Math.min(...zs),
      maxZ: Math.max(...zs),
    };
    const cityCentroid: [number, number] = [
      (bounds.minX + bounds.maxX) / 2,
      (bounds.minZ + bounds.maxZ) / 2,
    ];

    return { loading: false, error: null, divisions, bounds, cityCentroid };
  }, [gnd.data, gnd.loading, gnd.error, pop.data, pop.loading, pop.error]);
}
