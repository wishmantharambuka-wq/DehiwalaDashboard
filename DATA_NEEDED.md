# Data to upload later — to match your friend's Mount Lavinia dashboard

You shared screenshots of a friend's dashboard (`bronxtj.github.io/mount-lavinia-dashboard`)
that goes further in a few places. Here's what's already covered with your existing
data, and what you'd need to **upload separately** for me to build out the rest.

## ✅ Already covered with your existing `Dashboard Data.zip`

- GN division boundaries, population by age/sex, land use, FSI/GSI/OSR/Entropy/UMI grid,
  and the depthmapX centrality network (Closeness ≈ Integration, Betweenness ≈ Choice) —
  all wired into Overview / Focus Area / Synthesis / Issues & Potentials.
- Live climate widget (OpenWeather).

## 📋 What to upload for feature parity with the reference dashboard

### 1. Movement & Behaviour tab (their dashboard has this as its own tab)
Your friend's dashboard shows road-level property/land-use stats per selected road
segment ("Road Property Analysis — Selected Main Roads", with residential/commercial/
vacant % per road, and road rankings). To build this, upload:
- A **road/street segment shapefile or GeoJSON** with a name per segment (e.g.
  "Hotel Road Left/Right") — your current centrality GeoJSON has road *segments* but
  no readable names, only Depthmap IDs.
- A **property/parcel registry** (residential % / commercial % / vacant % / total
  properties) per road or per parcel, if you have one — this looks like it comes from
  a municipal property database your friend had access to.

### 2. Multi-scale buffer analysis (500m / 2000m / 3000m / 5000m rings around a point)
Their dashboard re-runs every metric (centrality, density, entropy, UMI) inside
**circular buffers of increasing radius around one fixed study point** (e.g. Mount
Lavinia Junction), rather than across the whole DSD like yours does. If you want this
exact interaction:
- Confirm the **anchor point** (lat/lon) you want buffers centered on (e.g. Dehiwala
  Junction, Galle Road/Hill Street junction).
- Everything else (FSI/GSI/OSR/Entropy/UMI/centrality) can be **re-derived from your
  existing grid + centrality data** by spatially filtering to each buffer radius — no
  new raw data needed, just the anchor point, and I can build the 500/2000/3000/5000m
  toggle exactly like the reference.

### 3. Hexagonal grid instead of square grid
Their choropleth uses hexagonal cells; yours (from `FSI,GSI,OSR,Entropy and
matuaration of dehiwala.geojson`) is a square grid. This is a cosmetic/methodological
choice, not missing data — say the word and I can re-tessellate your existing square
grid values into hexagons (or keep square, which is equally valid).

### 4. Up-to-date / provisional census
Their population source is explicitly labelled **"Census of Population and Housing
2024 (Provisional)"**. Your `Combined_GN_Population_Data.xlsx` doesn't state its
census year — if you have a newer provisional 2024 dataset for Dehiwala's GN
divisions, upload it and I'll swap it in (and it'll also let me fill in the 6 GN
divisions currently missing population data).

### 5. Air quality / UV / rainfall
Their "Real-Time Environmental Conditions" panel shows AQI, PM2.5, UV index, and a
24-hour temperature/feels-like forecast, sourced from **Open-Meteo** (free, no API
key, includes air quality) in addition to OpenWeather. No upload needed for this one
— if you'd like it, just confirm and I'll add an Open-Meteo panel alongside the
existing OpenWeather widget (they're complementary: OpenWeather for current
conditions, Open-Meteo for the forecast + AQI/UV, which OpenWeather's free tier
doesn't include).

### 6. Housing units / building counts
Their Overview shows "Total Housing Units" and "Housing Density" cards. If your
Combined Population workbook (or a separate building-count dataset) has housing-unit
counts per GN division, upload it and I'll add matching stat cards.

---

**How to send it:** re-upload as a new zip (or individual files) in the chat with a
short note on which item(s) above it corresponds to, and I'll wire it into the
existing dashboard structure — no need to rebuild anything from scratch.
