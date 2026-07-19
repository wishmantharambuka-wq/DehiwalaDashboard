import { useJsonData } from "./useJsonData";
import type { PopulationData } from "../types";
import type { FeatureCollection } from "geojson";

export function usePopulationData() {
  return useJsonData<PopulationData>("/data/population.json");
}

export function useGNDivisions() {
  return useJsonData<FeatureCollection>("/data/gn-divisions.geojson");
}

export function useBoundary() {
  return useJsonData<FeatureCollection>("/data/boundary.geojson");
}

export function useLanduse() {
  return useJsonData<FeatureCollection>("/data/landuse.geojson");
}

export function useGridAnalysis() {
  return useJsonData<FeatureCollection>("/data/grid-analysis.geojson");
}

export function useCentralityLines() {
  return useJsonData<FeatureCollection>("/data/centrality-lines.geojson");
}

// properties array aligned by index with centrality-lines features:
// [connectivity, choice500, integration500, choice2000, integration2000, choice5000, integration5000]
export type CentralityPropsRow = [number, number, number, number, number, number, number];

export function useCentralityProperties() {
  return useJsonData<CentralityPropsRow[]>("/data/centrality-properties.json");
}
