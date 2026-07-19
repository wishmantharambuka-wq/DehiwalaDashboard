// ---------------------------------------------------------------------------
// Narrative content synthesised from the uploaded presentation PDFs:
//   - "Centrality analysis, FSI, GSI, OSR etc." (PL2307 Planning Techniques)
//   - "Spatial Pattern Analysis of Land Use in Dehiwala" (PL1301 Planning Theory)
//   - "CLD _ new.pdf" — Causal Loop Analysis of Urban Heat in Dehiwala
//   - "Wind Simulation.pdf" (PL2306 Spatial Data Analytics & Visualization)
//
// This is a first-pass synthesis meant to seed the dashboard with real,
// evidence-grounded content instead of generic placeholders. Treat it as a
// draft — refine the wording, add citations, and expand it as your analysis
// develops.
// ---------------------------------------------------------------------------

export interface FindingBlock {
  title: string;
  points: string[];
}

// ---------- Focus Area: Centrality ----------
export const centralityFindings: FindingBlock[] = [
  {
    title: "Closeness Centrality",
    points: [
      "Measures how easily a street segment can reach every other segment in the network — higher values mean better accessibility.",
      "At 500m, high integration is localized around small cluster centres, revealing highly walkable neighbourhood cores.",
      "At 2000m, integration shifts toward intermediate, district-level centres.",
      "At 5000m, a distinct red cluster forms in the middle-north of the grid — the structural and economic core of the whole study area.",
    ],
  },
  {
    title: "Betweenness Centrality",
    points: [
      "Measures how often a segment is used as a shortcut or primary transit link — i.e. 'traffic choice'.",
      "At 500m, high values scatter evenly across local grids — everyday neighbourhood main streets.",
      "At 2000m, major arterials and sub-arterials light up strongly — town-scale vehicular traffic.",
      "At 5000m, only the backbone remains red: the north–south coastal spine road and key radial connectors inland carry the highest regional transit exposure.",
    ],
  },
  {
    title: "Why centrality matters for heat",
    points: [
      "High closeness/betweenness → high accessibility → intensive urban activity → higher heat accumulation, reinforcing the Urban Heat Island effect along the busiest corridors.",
    ],
  },
];

// ---------- Focus Area: Density ----------
export const densityFindings: FindingBlock[] = [
  {
    title: "Ground Space Index (GSI)",
    points: [
      "GSI measures the proportion of land occupied by building footprints — high GSI means less open space, less vegetation, and higher heat retention.",
      "A continuous, high-GSI thermal belt overlays the Galle Road transit axis (a 'Linear Thermal Axis').",
      "The narrow coastal strip along the beach stays significantly cooler — a natural cooling zone.",
    ],
  },
  {
    title: "Floor Space Index (FSI)",
    points: [
      "FSI captures vertical density / building volume — taller, denser buildings reduce air circulation and increase heat storage in built surfaces.",
      "High FSI is concentrated along the coast, forming a vertical wall that can block cooling sea breezes.",
      "The low-rise interior acts as a cooler buffer, but development is fragmented and uneven overall.",
    ],
  },
  {
    title: "Open Space Ratio (OSR)",
    points: [
      "OSR is the amount of unbuilt, open ground relative to total floor area — higher OSR means better ventilation and cooling potential.",
      "Most of Dehiwala shows low OSR — a highly built-up urban fabric with limited open space.",
      "The southeastern wetland pocket is a key cooling zone; open spaces elsewhere are scattered and small.",
    ],
  },
  {
    title: "Land-use Entropy (mixing diversity)",
    points: [
      "Most of the study area shows low entropy — a dominant, largely mono-functional residential core.",
      "Higher entropy (more mixed-use) concentrates along Galle Road and major intersections.",
      "Low-entropy residential zones retain heat over large areas, while high-entropy corridors create concentrated hotspots from commercial activity and traffic.",
    ],
  },
];

// ---------- Focus Area: Urban Maturation ----------
export const urbanMaturationFindings: FindingBlock[] = [
  {
    title: "Urban Maturation Index (UMI)",
    points: [
      "UMI combines built-up intensity, density and centrality into a single score of how developed / 'mature' an area is.",
      "High-UMI zones concentrate along the Galle Road coastal corridor, major transport routes, and local commercial/transport hubs.",
      "Low-UMI zones dominate inland areas, with pockets of areas still developing in between.",
    ],
  },
  {
    title: "How maturation drives heat",
    points: [
      "Concrete sinks: mature areas have more buildings and roads that absorb and store heat.",
      "Urban canyons: dense buildings trap air between streets, blocking wind flow.",
      "Lost natural cooling: fewer trees and less vegetation in mature zones reduce evapotranspirative cooling.",
    ],
  },
];

// ---------- Environmental Analysis ----------
export const heatCausalLoops: FindingBlock[] = [
  {
    title: "Reinforcing Loop (R1) — the 'Heat Trap'",
    points: [
      "Rising Urban Heat Intensity → greater thermal discomfort → more air-conditioning use → higher energy consumption → more waste heat emitted → further increases Urban Heat Intensity.",
      "Because the effect keeps growing in the same direction, this loop reinforces (worsens) the heat problem over time.",
    ],
  },
  {
    title: "Balancing Loop (B1) — the 'Greening Response'",
    points: [
      "As Urban Heat Intensity increases, awareness grows, which can trigger tree-planting and greening responses.",
      "Tree canopy supports shade and evapotranspiration — both cool the surrounding environment and push back against rising temperature.",
    ],
  },
  {
    title: "Planning intervention identified",
    points: [
      "Urban Tree Planting and Shaded Streets Program — targeting the low-vegetation, highly built-up corridors (especially Galle Road) identified across the FSI/GSI/OSR analysis.",
    ],
  },
];

export const leveragePoints: FindingBlock[] = [
  {
    title: "Leverage points for intervention",
    points: [
      "Green Buffer (Galle Road): dense street-tree canopies along the frontage to fix critically low open space.",
      "Junction Shading (Dehiwala Flyover): pedestrian shade sails and high-albedo / cool pavement materials at the dense urban core.",
      "Thermal Breaks (Commercial Strip): mixed-use infill — mini pocket parks and plazas — to interrupt continuous heat-absorbing blocks.",
      "Wind Corridors (Marine Drive): strict building setbacks and height limits to keep sea breezes flowing inland.",
      "Traffic Management (near Dehiwala Flyover): optimise peak midday signal timing to cut vehicle idling and direct engine heat emissions.",
    ],
  },
];

export const windAnalysisNotes: FindingBlock[] = [
  {
    title: "Urban wind & microclimate (ENVI-met workflow)",
    points: [
      "Wind circulation controls air movement, thermal comfort, pollutant dispersion, and natural ventilation potential across the study area.",
      "Key airflow behaviours expected in Dehiwala's dense urban fabric: channeling between parallel buildings (Venturi effect), blockage & deflection around large blocks, corner acceleration, and limited natural shelter zones.",
      "A pilot ENVI-met simulation was run for a small sub-area (Ratnakara Place) under the free-tier plan; the free tier limits study-area size, 3D export and animation export, so results here are indicative/methodological rather than a full city-wide quantified wind map.",
      "This is a good next step to expand: a full-area wind simulation would sharpen the Wind Corridor leverage point above.",
    ],
  },
];

// ---------- Synthesis ----------
export const synthesisNarrative: FindingBlock[] = [
  {
    title: "How the layers connect",
    points: [
      "Spatial configuration (centrality) concentrates traffic and footfall along Galle Road and the Dehiwala Flyover — the same corridor that shows the highest GSI/FSI and the lowest OSR.",
      "That overlap compounds into a single 'Linear Thermal Axis': the corridor with the most movement is also the most built-up and the least ventilated, producing Dehiwala's clearest urban-heat hotspot.",
      "Land-use entropy confirms the pattern — mixed-use intensity peaks on the same corridor, adding vehicular and commercial heat load on top of the built-form effect.",
      "The coast and the southeastern wetland stand out as the two natural counterweights: lower density, higher open space, and measurably cooler — they are the area's main passive-cooling assets.",
      "The Urban Maturation Index reads as a composite confirmation: 'mature' (high-UMI) cells cluster exactly where centrality + density + low entropy diversity overlap, reinforcing rather than diversifying the heat pattern.",
    ],
  },
  {
    title: "Planning implication",
    points: [
      "Interventions concentrated on the Galle Road / Dehiwala Junction corridor address the point where every stressor (traffic, density, low open space) stacks — this is why the identified leverage points (green buffer, junction shading, thermal breaks, wind corridors, traffic management) all target that same spine.",
      "Protecting the coastal strip and the southeastern wetland from further densification preserves the only two cooling assets currently keeping the composite UMI/heat pattern from being uniformly severe.",
    ],
  },
];

// ---------- Issues & Potentials: SWOT ----------
export interface SwotContent {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export const swot: SwotContent = {
  strengths: [
    "Well-established, highly accessible commercial spine along Galle Road / Hill Street with strong closeness & betweenness centrality — an economic asset, not just a heat liability.",
    "Coastal strip functions as a natural cooling corridor and public amenity, distinct from the rest of the built-up area.",
    "A southeastern wetland pocket provides open space / cooling capacity within an otherwise dense DSD.",
    "Existing GIS, space-syntax (depthmapX) and ENVI-met methodological groundwork already in place to guide targeted, evidence-based interventions.",
  ],
  weaknesses: [
    "Low Open Space Ratio (OSR) across most GN divisions — limited unbuilt ground relative to built floor area.",
    "High FSI/GSI concentrated exactly on the highest-traffic corridor, compounding heat retention where it's already worst.",
    "Predominantly low land-use entropy (mono-functional residential core) away from the main road, limiting local walkable mixed-use options.",
    "No full-area, quantified wind-flow simulation yet — current ENVI-met work is a small pilot area only.",
  ],
  opportunities: [
    "Targeted 'Green Buffer' street-tree canopy along Galle Road frontage.",
    "Junction shading and cool-pavement materials at Dehiwala Flyover.",
    "Mixed-use infill (pocket parks/plazas) as thermal breaks along the commercial strip.",
    "Building setback / height controls along Marine Drive to preserve sea-breeze wind corridors inland.",
    "Signal-timing optimisation near the flyover to cut vehicle idling and engine heat.",
  ],
  threats: [
    "Coastal boundary constrains growth to a semi-circular pattern (per the bid-rent / radial-growth analysis), concentrating demographic and economic pressure — and therefore heat — onto the landward corridor over time.",
    "Continued infill along the high-centrality spine without mitigation would deepen the reinforcing 'heat trap' loop (more heat → more AC use → more waste heat).",
    "Loss of the remaining wetland or coastal open space would remove one of only two natural cooling assets identified in the study area.",
  ],
};

// ---------- Issues & Potentials: PESTEL ----------
export interface PestelContent {
  political: string[];
  economic: string[];
  social: string[];
  technological: string[];
  environmental: string[];
  legal: string[];
}

export const pestel: PestelContent = {
  political: [
    "Dehiwala–Mount Lavinia Municipal Council and the Urban Development Authority (UDA) are the primary land-use planning authorities for the study area.",
    "Any tree-planting, shading or setback intervention along Galle Road would need coordination between the Road Development Authority (for the arterial road reservation) and the Municipal Council.",
  ],
  economic: [
    "The Galle Road / Hill Street / Dehiwala Junction corridor is the area's primary commercial engine, driven by its high accessibility (closeness & betweenness centrality).",
    "Heat-driven reduction in outdoor comfort risks suppressing pedestrian foot traffic and, in turn, local business vitality along that same corridor.",
  ],
  social: [
    "Pedestrians, commuters and street vendors along the highest-heat corridor bear the most direct public-health exposure to thermal stress.",
    "Residents in the low-entropy interior residential core have comparatively fewer walkable local mixed-use amenities.",
  ],
  technological: [
    "Analysis relied on OpenStreetMap road network data, depthmapX angular segment analysis (closeness/betweenness), QGIS/ArcGIS Pro density-grid processing, GeoPandas entropy computation, and ENVI-met microclimate simulation.",
    "Landsat 8 thermal imagery was used to derive Land Surface Temperature for the urban-heat baseline.",
  ],
  environmental: [
    "Urban Heat Island intensity is elevated along the built-up, low-OSR corridor and is reinforced by a self-sustaining heat-trap feedback loop (more heat → more AC → more waste heat).",
    "The coastal strip and southeastern wetland are the area's main remaining natural cooling assets.",
  ],
  legal: [
    "FSI/GSI thresholds and building height/setback rules under UDA planning regulations directly shape the density patterns measured in this study.",
    "Any Marine Drive setback or height-limit intervention to protect wind corridors would need to be codified through the relevant planning scheme / development plan.",
  ],
};
