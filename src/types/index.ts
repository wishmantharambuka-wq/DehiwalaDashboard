// ---------- Population ----------
export interface AgeBand {
  band: string;
  male: number;
  female: number;
  total: number;
}

export interface GNPopulation {
  name: string;
  totalPopulation: number;
  male: number;
  female: number;
  malePct: number;
  femalePct: number;
  ageBands: AgeBand[];
}

export interface CityAggregate extends GNPopulation {
  gnCount: number;
}

export interface PopulationData {
  gnDivisions: Record<string, GNPopulation>;
  cityAggregate: CityAggregate;
}

// ---------- GeoJSON light types ----------
export interface GNProperties {
  name: string;
  pcode: string;
  nameSinhala: string | null;
  hasPopulationData: boolean;
}

export interface GridCellProperties {
  gridId: number;
  cellAreaM2: number;
  builtUpM2: number;
  FSI: number;
  GSI: number;
  OSR: number | null;
  entropyIndex: number;
  dominantLanduse: string;
  centralityRaw: number;
  FSI_norm: number;
  GSI_norm: number;
  OSR_norm: number | null;
  entropyNorm: number;
  centralityNorm: number;
  UMI: number;
}

export interface LanduseProperties {
  domain: string;
  mainClass: string;
  subClass: string;
  areaM2: number;
}

export type GridMetric = "FSI" | "GSI" | "OSR" | "entropyIndex" | "UMI" | "centralityNorm";
export type CentralityRadius = 500 | 2000 | 5000;
export type CentralityMetric = "closeness" | "betweenness";

// ---------- Tabs ----------
export type TabId =
  | "overview"
  | "static-maps";

// ---------- Climate ----------
export interface ClimateSnapshot {
  tempC: number;
  feelsLikeC: number;
  humidity: number;
  windSpeedMs: number;
  windDeg: number;
  condition: string;
  icon: string;
  pressureHpa: number;
  visibilityKm: number;
  updatedAt: number;
}
