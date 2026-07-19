import { useMemo } from "react";
import { useGridAnalysis } from "./useGeoData";
import type { Feature } from "geojson";
import type { GridCellProperties } from "../types";

export interface GridSummary {
  avgFSI: number;
  avgGSI: number;
  avgOSR: number;
  avgEntropy: number;
  avgUMI: number;
  avgCentrality: number;
  dominantLanduse: string;
  cellCount: number;
}

export function useGridSummaryStats(): GridSummary | null {
  const { data } = useGridAnalysis();

  return useMemo(() => {
    if (!data) return null;
    const features = data.features as unknown as Feature<GeoJSON.Geometry, GridCellProperties>[];
    const n = features.length;
    if (n === 0) return null;

    let fsi = 0;
    let gsi = 0;
    let osr = 0;
    let osrCount = 0;
    let entropy = 0;
    let umi = 0;
    let centrality = 0;
    const landuseCounts: Record<string, number> = {};

    for (const f of features) {
      const p = f.properties;
      fsi += p.FSI ?? 0;
      gsi += p.GSI ?? 0;
      if (p.OSR !== null && p.OSR !== undefined) {
        osr += p.OSR;
        osrCount++;
      }
      entropy += p.entropyIndex ?? 0;
      umi += p.UMI ?? 0;
      centrality += p.centralityNorm ?? 0;
      const lu = p.dominantLanduse ?? "Unknown";
      landuseCounts[lu] = (landuseCounts[lu] ?? 0) + 1;
    }

    const dominant = Object.entries(landuseCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    return {
      avgFSI: fsi / n,
      avgGSI: gsi / n,
      avgOSR: osrCount > 0 ? osr / osrCount : 0,
      avgEntropy: entropy / n,
      avgUMI: umi / n,
      avgCentrality: centrality / n,
      dominantLanduse: dominant,
      cellCount: n,
    };
  }, [data]);
}
