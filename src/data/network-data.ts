export type NodeCategory =
  | "root-cause"
  | "env-issue"
  | "socio-issue"
  | "governance"
  | "potential-planning"
  | "potential-ecology"
  | "stakeholder";

export interface NetworkNode {
  id: string;
  label: string;
  category: NodeCategory;
  description: string;
  connected: string[];
}

export interface NetworkEdge {
  source: string;
  target: string;
  relation: "amplifies" | "mitigates" | "co-located" | "caused-by";
}

export const CATEGORY_COLORS: Record<NodeCategory, string> = {
  "root-cause": "#f5b942",
  "env-issue": "#ef5350",
  "socio-issue": "#ff7043",
  "governance": "#ab47bc",
  "potential-planning": "#66bb6a",
  "potential-ecology": "#42a5f5",
  "stakeholder": "#ec407a",
};

export const CATEGORY_LABELS: Record<NodeCategory, string> = {
  "root-cause": "Root Cause",
  "env-issue": "Environmental Issue",
  "socio-issue": "Socio-Economic Issue",
  "governance": "Governance",
  "potential-planning": "Potential - Planning",
  "potential-ecology": "Potential - Ecology",
  "stakeholder": "Stakeholder",
};

export const RELATION_COLORS: Record<string, string> = {
  amplifies: "#ef5350",
  mitigates: "#66bb6a",
  "co-located": "#78909c",
  "caused-by": "#f5b942",
};

export const issuesNodes: NetworkNode[] = [
  { id: "RC1", label: "Linear Thermal Axis", category: "root-cause", description: "The Galle Road corridor combines highest traffic, highest GSI/FSI, and lowest OSR into a single continuous heat corridor — the structural root cause of Dehiwala's Urban Heat Island.", connected: ["EI1", "EI2", "SI1", "SI3"] },
  { id: "RC2", label: "Low Open Space", category: "root-cause", description: "Most GN divisions show critically low Open Space Ratio — limited unbuilt ground relative to built floor area, reducing ventilation and vegetation cooling across the DSD.", connected: ["EI1", "PP1", "PE2"] },
  { id: "RC3", label: "Mono-functional Core", category: "root-cause", description: "Low land-use entropy across the interior residential core — predominantly single-use residential zones with limited local mixed-use amenities.", connected: ["SI2", "PP3"] },

  { id: "EI1", label: "Urban Heat Island", category: "env-issue", description: "Elevated Land Surface Temperature along the built-up, low-OSR corridor, reinforced by a self-sustaining heat-trap feedback loop (more heat → more AC → more waste heat).", connected: ["RC1", "RC2", "SI1", "PP2"] },
  { id: "EI2", label: "Sea Breeze Blockage", category: "env-issue", description: "High FSI concentrated along the coast forms a vertical wall of buildings that blocks cooling sea breezes from reaching inland areas.", connected: ["RC1", "PP4", "PE1"] },
  { id: "EI3", label: "Wetland Vulnerability", category: "env-issue", description: "The southeastern wetland — one of only two natural cooling assets — faces pressure from surrounding densification and encroachment.", connected: ["PE2", "GOV1"] },

  { id: "SI1", label: "Thermal Stress", category: "socio-issue", description: "Pedestrians, commuters, and street vendors along the highest-heat corridor bear the most direct public-health exposure to thermal discomfort and heat-related illness.", connected: ["EI1", "RC1", "PP2", "STK4"] },
  { id: "SI2", label: "Limited Mixed-Use Access", category: "socio-issue", description: "Residents in the low-entropy interior residential core have fewer walkable local mixed-use amenities, increasing car dependency and reducing neighbourhood vitality.", connected: ["RC3", "PP3"] },
  { id: "SI3", label: "AC Energy Waste", category: "socio-issue", description: "The reinforcing loop: heat drives air-conditioning use, which dumps waste heat outdoors, further intensifying UHI — a growing energy cost burden.", connected: ["EI1", "RC1"] },

  { id: "GOV1", label: "Weak Regulation", category: "governance", description: "No effective setback or height controls along Marine Drive or the coastal strip to preserve wind corridors, and current FSI/GSI thresholds allow continued densification on the hottest corridor.", connected: ["EI2", "EI3", "PP4", "STK1", "STK2"] },

  { id: "PP1", label: "Green Buffer", category: "potential-planning", description: "Dense street-tree canopy along Galle Road frontage to fix critically low open space and provide shade on the primary thermal axis.", connected: ["RC2", "RC1", "STK3"] },
  { id: "PP2", label: "Junction Shading", category: "potential-planning", description: "Pedestrian shade sails and high-albedo / cool pavement materials at Dehiwala Flyover — the densest urban core intersection.", connected: ["SI1", "EI1", "STK1"] },
  { id: "PP3", label: "Thermal Break Infill", category: "potential-planning", description: "Mixed-use infill with pocket parks and plazas to interrupt continuous heat-absorbing blocks along the commercial strip.", connected: ["RC3", "SI2"] },
  { id: "PP4", label: "Wind Corridor Protection", category: "potential-planning", description: "Strict building setbacks and height limits along Marine Drive to keep sea breezes flowing inland — codified through planning scheme.", connected: ["EI2", "GOV1", "STK2"] },
  { id: "PP5", label: "Traffic Optimization", category: "potential-planning", description: "Signal-timing optimisation near Dehiwala Flyover to cut vehicle idling and direct engine heat emissions during peak hours.", connected: ["SI1", "RC1"] },

  { id: "PE1", label: "Coastal Corridor", category: "potential-ecology", description: "Preserve and enhance the coastal strip as a natural cooling corridor and public amenity — distinct from the built-up area.", connected: ["EI2", "STK5"] },
  { id: "PE2", label: "Wetland Conservation", category: "potential-ecology", description: "Protect the southeastern wetland pocket from further encroachment — one of only two natural cooling assets in the DSD.", connected: ["RC2", "EI3", "GOV1"] },
  { id: "PE3", label: "Urban Tree Canopy", category: "potential-ecology", description: "Expand tree canopy coverage across GN divisions, targeting the low-vegetation, highly built-up corridors identified in GSI/OSR analysis.", connected: ["PP1", "EI1"] },

  { id: "STK1", label: "Municipal Council", category: "stakeholder", description: "Dehiwala–Mount Lavinia Municipal Council — primary land-use planning authority for the study area.", connected: ["GOV1", "PP2"] },
  { id: "STK2", label: "Urban Dev. Authority", category: "stakeholder", description: "Urban Development Authority (UDA) — regulates FSI/GSI thresholds and building setbacks through planning schemes.", connected: ["GOV1", "PP4"] },
  { id: "STK3", label: "Road Dev. Authority", category: "stakeholder", description: "Road Development Authority — controls arterial road reservations; tree-planting along Galle Road needs RDA coordination.", connected: ["PP1"] },
  { id: "STK4", label: "Street Vendors", category: "stakeholder", description: "Street vendors and daily commuters — most exposed group along the thermal axis, primary beneficiaries of shading interventions.", connected: ["SI1"] },
  { id: "STK5", label: "Coastal Residents", category: "stakeholder", description: "Residents along the coastal strip — stakeholders in coastal corridor preservation and Marine Drive building controls.", connected: ["PE1"] },
];

export const issuesEdges: NetworkEdge[] = [
  { source: "RC1", target: "EI1", relation: "amplifies" },
  { source: "RC1", target: "EI2", relation: "co-located" },
  { source: "RC1", target: "SI1", relation: "amplifies" },
  { source: "RC1", target: "SI3", relation: "amplifies" },
  { source: "RC2", target: "EI1", relation: "amplifies" },
  { source: "RC3", target: "SI2", relation: "caused-by" },
  { source: "EI1", target: "SI1", relation: "amplifies" },
  { source: "EI1", target: "SI3", relation: "amplifies" },
  { source: "EI2", target: "EI1", relation: "amplifies" },
  { source: "EI3", target: "PE2", relation: "mitigates" },
  { source: "GOV1", target: "EI2", relation: "caused-by" },
  { source: "GOV1", target: "EI3", relation: "caused-by" },
  { source: "PP1", target: "RC2", relation: "mitigates" },
  { source: "PP1", target: "RC1", relation: "mitigates" },
  { source: "PP2", target: "SI1", relation: "mitigates" },
  { source: "PP2", target: "EI1", relation: "mitigates" },
  { source: "PP3", target: "RC3", relation: "mitigates" },
  { source: "PP3", target: "SI2", relation: "mitigates" },
  { source: "PP4", target: "EI2", relation: "mitigates" },
  { source: "PP4", target: "GOV1", relation: "mitigates" },
  { source: "PP5", target: "SI1", relation: "mitigates" },
  { source: "PE1", target: "EI2", relation: "mitigates" },
  { source: "PE2", target: "EI3", relation: "mitigates" },
  { source: "PE2", target: "RC2", relation: "mitigates" },
  { source: "PE3", target: "EI1", relation: "mitigates" },
  { source: "PE3", target: "PP1", relation: "co-located" },
  { source: "STK1", target: "PP2", relation: "co-located" },
  { source: "STK1", target: "GOV1", relation: "co-located" },
  { source: "STK2", target: "PP4", relation: "co-located" },
  { source: "STK2", target: "GOV1", relation: "co-located" },
  { source: "STK3", target: "PP1", relation: "co-located" },
  { source: "STK4", target: "SI1", relation: "co-located" },
  { source: "STK5", target: "PE1", relation: "co-located" },
];

export interface SynthesisNode {
  id: string;
  label: string;
  category: "maturation" | "thermal" | "morphology" | "density" | "social" | "governance";
  description: string;
  observation?: string[];
  connected: string[];
}

export const SYNTHESIS_CATEGORY_COLORS: Record<string, string> = {
  maturation: "#f5b942",
  thermal: "#ef5350",
  morphology: "#42a5f5",
  density: "#66bb6a",
  social: "#ff7043",
  governance: "#ab47bc",
};

export interface KeyArgument {
  number: number;
  title: string;
  subtitle: string;
  findingId: string;
}

export const keyArguments: KeyArgument[] = [
  { number: 1, title: "Linear Thermal Axis", subtitle: "Galle Road corridor combines peak traffic, highest GSI/FSI, and lowest OSR into one continuous heat zone.", findingId: "F1" },
  { number: 2, title: "Entropy Confirms Pattern", subtitle: "Mixed-use intensity peaks on the same corridor, adding vehicular and commercial heat load.", findingId: "F2" },
  { number: 3, title: "Natural Counterweights", subtitle: "Coast and southeastern wetland — lower density, higher open space, measurably cooler.", findingId: "F3" },
  { number: 4, title: "UMI Composite Confirmation", subtitle: "High-UMI cells cluster where centrality + density + low entropy overlap.", findingId: "F4" },
  { number: 5, title: "Corridor Interventions", subtitle: "All leverage points target the Galle Road spine where every stressor stacks.", findingId: "F5" },
  { number: 6, title: "Preserve Cooling Assets", subtitle: "Protect coast and wetland from densification to maintain passive cooling.", findingId: "F6" },
];

export const synthesisNodes: SynthesisNode[] = [
  { id: "F1", label: "Linear Thermal Axis", category: "thermal", description: "The Galle Road corridor where highest traffic, highest GSI/FSI, and lowest OSR overlap — Dehiwala's clearest urban-heat hotspot.", observation: ["Spatial configuration concentrates traffic along Galle Road and Dehiwala Flyover", "Same corridor shows highest GSI/FSI and lowest OSR", "Creates a single continuous heat corridor"], connected: ["F2", "F4", "F5"] },
  { id: "F2", label: "Entropy Confirms", category: "morphology", description: "Land-use entropy peaks on the same corridor, adding vehicular and commercial heat load on top of built-form effects.", observation: ["Mixed-use intensity peaks along Galle Road", "Adds vehicular and commercial heat load", "Confirms the thermal axis pattern"], connected: ["F1", "F4"] },
  { id: "F3", label: "Natural Counterweights", category: "density", description: "Coast and southeastern wetland stand out with lower density, higher open space, and measurably cooler temperatures.", observation: ["Coastal strip provides natural cooling", "Southeastern wetland is a key cooling asset", "Both show lower density and higher OSR"], connected: ["F6"] },
  { id: "F4", label: "UMI Composite", category: "maturation", description: "Urban Maturation Index confirms: 'mature' cells cluster exactly where centrality + density + low entropy overlap.", observation: ["High-UMI cells match high centrality zones", "Reinforces rather than diversifies heat pattern", "Composite confirmation of other metrics"], connected: ["F1", "F2", "F5"] },
  { id: "F5", label: "Corridor Interventions", category: "governance", description: "All identified leverage points target the Galle Road spine — green buffer, junction shading, thermal breaks, wind corridors, traffic management.", observation: ["Green buffer along Galle Road frontage", "Junction shading at Dehiwala Flyover", "Thermal breaks in commercial strip", "Wind corridor protection along Marine Drive", "Traffic signal optimization"], connected: ["F1", "F4", "F6"] },
  { id: "F6", label: "Preserve Cooling", category: "density", description: "Protecting the coastal strip and southeastern wetland from further densification preserves the only two cooling assets keeping the heat pattern from being uniformly severe.", observation: ["Coast and wetland are the only two cooling assets", "Further densification would remove passive cooling", "Critical to maintain these assets"], connected: ["F3", "F5"] },
];

export const synthesisEdges: NetworkEdge[] = [
  { source: "F1", target: "F2", relation: "amplifies" },
  { source: "F1", target: "F4", relation: "amplifies" },
  { source: "F1", target: "F5", relation: "caused-by" },
  { source: "F2", target: "F4", relation: "co-located" },
  { source: "F3", target: "F6", relation: "mitigates" },
  { source: "F4", target: "F5", relation: "caused-by" },
  { source: "F5", target: "F6", relation: "co-located" },
];
