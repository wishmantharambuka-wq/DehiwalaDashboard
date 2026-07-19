# Dehiwala Spatial Intelligence Dashboard

An interactive spatial-analytics dashboard for the **Dehiwala Divisional Secretariat Division** (Colombo District, Western Province, Sri Lanka), built from your `Dashboard Data.zip` (population census, GN division boundaries, land use, FSI/GSI/OSR/Entropy/UMI grid analysis, and depthmapX space-syntax network data).

Built with **React 19 + TypeScript + Vite**, a custom **Three.js** 3D city scene, **Leaflet/OpenStreetMap** for the analytical map pages, **Recharts** for data visualisation, **Tailwind CSS v4** for the glass/neon UI, and **Zustand** for state.

---

## What changed in this revision

- **Fixed a real bug in the 3D scene**: a custom geometry-merge helper was dropping
  Three.js's triangle index buffer for any GN division made of multiple polygon parts
  (Watarappala), corrupting its mesh and — in some browsers/GPUs — crashing the whole
  WebGL context. This is why the 3D map could look broken. It's fixed now.
- **3D scene is now visibly extruded** (brighter lighting, glass material, a thin
  faceted wireframe across each division's top surface) instead of nearly-invisible
  fill, plus an explicit **"← Back to Overview"** button.
- **Live climate widget now follows your GN selection** — click a division in the 3D
  view and the climate card re-fetches for that division's location automatically.
- **Environmental Analysis**: the heat map is now shown as a reference image card
  instead of an (unavoidably misaligned) overlay on the live map — see §4 for why.
- **Focus Area → Centrality**: relabelled to **Closeness** / **Betweenness**
  (standard equivalents of the source data's Integration/Choice metrics) with a
  working 500m / 2000m / 5000m radius selector.
- **All Leaflet map pages**: fixed the map-layers panel overlapping the zoom control
  (moved to a collapsible button, top-right), and added a **reset-view (⌂) button**
  next to the zoom controls so you can always get back to the full boundary.
- Added `DATA_NEEDED.md` — a list of what to upload later to add the features from
  the reference dashboard you shared (road-level property stats, multi-scale buffer
  analysis, etc.) that need data you haven't provided yet.

---

## 1. Quick start

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

To build a static production bundle:

```bash
npm run build     # outputs to dist/
npm run preview   # serve the production build locally to test it
```

## 2. OpenWeatherMap API key (live climate widget)

Your key is already wired up in `.env` (`VITE_OPENWEATHER_API_KEY`), so the Overview
and Environmental Analysis climate widgets should work as soon as you `npm run dev`.
The widget automatically re-fetches for whichever GN division you last clicked in the
3D view (shown in its title), and falls back to central Dehiwala when nothing is
selected.

**If it shows "Couldn't reach OpenWeather" at first:**
- Brand-new OpenWeather keys can take up to ~2 hours to activate — this is normal for
  a freshly created key, not a bug in the app.
- Double-check the key is still listed as active under **API keys** on your
  OpenWeatherMap account.
- Open your browser's dev tools → Network tab and check the actual response for the
  `api.openweathermap.org/data/2.5/weather` request — a `401` means the key isn't
  active/valid yet; anything else, paste the error and I can help debug it.

**Heads-up on deploying publicly** (e.g. GitHub Pages, like your friend's dashboard):
since this is a fully client-side app, the API key gets bundled into the JS that ships
to the browser and is visible in Network requests — there's no way to fully hide a
key from a static site without adding a backend. For a student/portfolio project this
is normal and low-risk (OpenWeather's free tier has generous limits and no billing
risk), but don't reuse this exact key for anything sensitive later.

To swap in a different key later: edit `.env` in the project root, or copy
`.env.example` fresh if you ever need to reset it.

## 3. What's on each tab

| Tab | What it shows |
|---|---|
| **Overview** | A 3D, glass-styled model of Dehiwala's 16 GN divisions. With nothing selected it shows city-wide totals. Hover a division to lift it; click to zoom in and reveal its population pyramid, age-group gender-gap chart, and a division-vs-division comparison. Includes the live climate widget. |
| **Focus Area** | Real OpenStreetMap-based maps with three sub-tabs — **Centrality** (depthmapX closeness/choice/integration, selectable by 500 / 2000 / 5000 m radius), **Density** (FSI / GSI / OSR / land-use entropy choropleths), **Urban Maturation** (UMI choropleth) — each paired with the grounded findings from your presentation decks and the original analysis map images. GN boundaries and land use can be toggled on/off. |
| **Environmental Analysis** | Urban heat map overlay (opacity adjustable) on the real map, plus the causal-loop (reinforcing "heat trap" / balancing "greening response") analysis, identified leverage points for intervention, wind/microclimate notes, and the live climate widget. |
| **Synthesis** | Integrated findings connecting centrality → density → land use → urban heat into one storyline, plus a city-wide composite indicator dashboard (avg. FSI/GSI/OSR/UMI/entropy, dominant land use, total population). |
| **Issues & Potentials** | Network overview map (same centrality layer, reusable radius/metric controls), plus SWOT and PESTEL frameworks synthesised from your uploaded analyses. |

All narrative content (findings, SWOT, PESTEL) lives in **`src/data/content.ts`** as
plain arrays of strings — edit it directly, no need to touch any component code.

## 4. Data notes & honesty flags

- **Population data covers 10 of the 16 GN divisions**: Dehiwala East, Dehiwala West,
  Galwala, Hathbodhiya, Jayathilaka, Karagampitiya, Kawdana West, Malwatta, Mount
  Lavinia, Udyanaya. The other 6 (Wellawatta South, Sri Saranankara, Kalubovila,
  Nedimala, Kawdana East, Watarappala) render on the map/3D scene but are labelled
  "no survey data" — add their population data to `public/data/population.json`
  (see its structure) if you obtain it later.
- **The urban-heat map is shown as a reference image, not a map overlay.** The
  source JPEG has no embedded geo-coordinates, so any overlay placement on the live
  Leaflet map would be a guess — and an earlier version of this dashboard did exactly
  that, which is why it looked visibly misaligned. Showing it as a labelled reference
  card next to a real, correctly-scaled map (GN boundaries + land use) is more honest
  than a wrong-but-confident overlay. If you can get the original heat-map source
  georeferenced (e.g. re-export it from QGIS/ArcGIS with a world file or as a proper
  GeoTIFF), send it over and I'll wire it in as a true overlay.
- **Wind simulation** in the source PDFs was a small ENVI-met pilot (free-tier,
  single sub-area), not a full quantified city-wide wind map — the Environmental
  tab notes this explicitly rather than presenting it as complete.
- **SWOT / PESTEL / Synthesis narrative** is a first-pass AI-assisted synthesis of
  your own uploaded presentations (centrality/FSI/GSI/OSR analysis, land-use
  spatial-pattern analysis, urban-heat causal-loop diagram, wind simulation deck).
  Review and refine before using it in a formal submission.

## 5. Project structure

```
dehiwala-dashboard/
├── public/
│   └── data/                      # all processed data the app fetches at runtime
│       ├── population.json        # population by GN division + city aggregate
│       ├── gn-divisions.geojson    # 16 GN division boundaries (simplified)
│       ├── boundary.geojson        # outer Dehiwala DSD boundary
│       ├── landuse.geojson         # 704 land-use parcels (domain/class/sub-class)
│       ├── grid-analysis.geojson   # 1,617 grid cells: FSI/GSI/OSR/Entropy/UMI/Centrality
│       ├── centrality-lines.geojson    # 37,148 street-segment geometries (depthmapX)
│       ├── centrality-properties.json  # matching per-segment metrics (by array index)
│       └── images/                 # compressed analysis map JPEGs used in-app
├── src/
│   ├── config.ts                  # OpenWeather key, coords, projection origin
│   ├── types/                     # shared TypeScript types
│   ├── store/useDashboardStore.ts # Zustand store: active tab, selection, map layers
│   ├── data/content.ts            # ALL narrative text (findings, SWOT, PESTEL) — edit here
│   ├── utils/
│   │   ├── geo.ts                 # lon/lat → local-meter projection, color scales
│   │   └── threeGeo.ts            # GeoJSON → Three.js extruded geometry helpers
│   ├── hooks/                     # data-fetching hooks (population, geojson, climate, grid stats)
│   └── components/
│       ├── layout/                # Header, horizontal TabBar
│       ├── overview/              # 3D scene (Scene3D, GNTile, CameraRig, GroundGrid),
│       │                          # climate widget, population charts, detail panel
│       ├── maps/                  # shared Leaflet layers (GN boundaries, land use,
│       │                          # grid choropleth, centrality network, raster overlay)
│       ├── focus-area/            # Centrality / Density / Urban Maturation sub-tabs
│       ├── environmental/         # heat overlay + causal-loop findings
│       ├── synthesis/             # integrated findings + composite KPIs
│       ├── issues-potentials/     # network overview + SWOT + PESTEL
│       └── ui/                    # GlassCard, StatCard, Toggle, SegmentedControl
└── .env.example
```

See also **`DATA_NEEDED.md`** in this same folder for a list of what to upload next
if you want to add the extra features from the reference dashboard you shared.

The original, full-resolution source files you uploaded (raw GeoJSONs, presentation
PDFs, full-size analysis map images, and per-GN population workbooks) are kept
untouched in **`source-data/`** at the root of this zip, one level above the app,
for future reference — they are not used directly by the running app (which reads
the optimised copies in `public/data/`).

## 6. Editing / extending

- **Add the 6 missing GN divisions' population**: open
  `public/data/population.json`, add an entry under `gnDivisions` following the
  existing shape (`totalPopulation`, `male`, `female`, `malePct`, `femalePct`,
  `ageBands[]`), and flip `hasPopulationData` to `true` for that division in
  `public/data/gn-divisions.geojson`.
- **Swap the OSM basemap style**: `src/components/maps/MapCanvas.tsx` uses
  CARTO's dark OSM-derived tiles (`dark_all`) to match the UI theme. Swap the
  `TileLayer` `url`/`attribution` for the standard
  `https://tile.openstreetmap.org/{z}/{x}/{y}.png` raster if you'd prefer the
  classic OSM look.
- **Re-run the data pipeline**: if you get updated GeoJSON/Excel exports, the
  Python preprocessing approach used to build `public/data/*` (simplify
  properties, round coordinate precision, split the large centrality network into
  geometry + compact properties arrays) is straightforward to redo — ask an AI
  assistant or see the shapes already in `public/data/*.geojson` as a reference
  for the expected schema.

## 7. Tech stack

React 19 · TypeScript · Vite 8 · Tailwind CSS v4 · Three.js + @react-three/fiber
+ @react-three/drei · Leaflet + react-leaflet · Recharts · Framer Motion · Zustand

No backend required — everything runs client-side against the static files in
`public/data/`, so this can be deployed anywhere that serves static files
(Vercel, Netlify, GitHub Pages, or your own server).
