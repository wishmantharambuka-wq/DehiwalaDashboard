import { create } from "zustand";
import type { TabId, CentralityRadius, CentralityMetric, GridMetric } from "../types";

interface MapLayerState {
  gnBoundaries: boolean;
  landuse: boolean;
  gridAnalysis: boolean;
  centralityNetwork: boolean;
  urbanHeat: boolean;
  urbanMaturation: boolean;
}

interface DashboardState {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

  // Overview 3D scene selection
  hoveredGN: string | null;
  selectedGN: string | null;
  setHoveredGN: (name: string | null) => void;
  setSelectedGN: (name: string | null) => void;

  // GN pin/compare (max 2)
  pinnedGNs: string[];
  togglePinGN: (name: string) => void;
  clearPins: () => void;

  // 3D workspace overlay views
  show2DView: boolean;
  setShow2DView: (v: boolean) => void;
  showSynthesis: boolean;
  setShowSynthesis: (v: boolean) => void;
  showIssues: boolean;
  setShowIssues: (v: boolean) => void;
  showLiveData: boolean;
  setShowLiveData: (v: boolean) => void;

  // Weather chart spawned in 3D
  activeWeatherChart: string | null;
  setActiveWeatherChart: (metric: string | null) => void;

  // Focus area map controls
  gridMetric: GridMetric;
  setGridMetric: (m: GridMetric) => void;
  centralityRadius: CentralityRadius;
  setCentralityRadius: (r: CentralityRadius) => void;
  centralityMetric: CentralityMetric;
  setCentralityMetric: (m: CentralityMetric) => void;

  // Shared real-map layer toggles
  layers: MapLayerState;
  toggleLayer: (key: keyof MapLayerState) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeTab: "overview",
  setActiveTab: (tab) => set({ activeTab: tab }),

  hoveredGN: null,
  selectedGN: null,
  setHoveredGN: (name) => set({ hoveredGN: name }),
  setSelectedGN: (name) => set({ selectedGN: name }),

  pinnedGNs: [],
  togglePinGN: (name) =>
    set((state) => {
      const idx = state.pinnedGNs.indexOf(name);
      if (idx >= 0) return { pinnedGNs: state.pinnedGNs.filter((_, i) => i !== idx) };
      if (state.pinnedGNs.length >= 2) return { pinnedGNs: [state.pinnedGNs[1], name] };
      return { pinnedGNs: [...state.pinnedGNs, name] };
    }),
  clearPins: () => set({ pinnedGNs: [] }),

  show2DView: false,
  setShow2DView: (v) => set({ show2DView: v, showSynthesis: false, showIssues: false, showLiveData: false }),
  showSynthesis: false,
  setShowSynthesis: (v) => set({ showSynthesis: v, show2DView: false, showIssues: false, showLiveData: false }),
  showIssues: false,
  setShowIssues: (v) => set({ showIssues: v, show2DView: false, showSynthesis: false, showLiveData: false }),
  showLiveData: false,
  setShowLiveData: (v) => set({ showLiveData: v, show2DView: false, showSynthesis: false, showIssues: false, activeWeatherChart: null }),

  activeWeatherChart: null,
  setActiveWeatherChart: (metric) => set({ activeWeatherChart: metric }),

  gridMetric: "UMI",
  setGridMetric: (m) => set({ gridMetric: m }),
  centralityRadius: 2000,
  setCentralityRadius: (r) => set({ centralityRadius: r }),
  centralityMetric: "closeness",
  setCentralityMetric: (m) => set({ centralityMetric: m }),

  layers: {
    gnBoundaries: true,
    landuse: false,
    gridAnalysis: false,
    centralityNetwork: false,
    urbanHeat: false,
    urbanMaturation: false,
  },
  toggleLayer: (key) =>
    set((state) => ({ layers: { ...state.layers, [key]: !state.layers[key] } })),
}));
