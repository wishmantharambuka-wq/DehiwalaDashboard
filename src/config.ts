// ---------------------------------------------------------------------------
// App configuration
// ---------------------------------------------------------------------------
// OpenWeatherMap API key
// ---------------------------------------------------------------------------
// Get a free key at https://home.openweathermap.org/api_keys (Current Weather
// Data / One Call API 3.0 both work with the same key).
//
// Preferred way to set it: create a file named `.env` in the project root
// (copy `.env.example`) and set:
//
//   VITE_OPENWEATHER_API_KEY=your_real_key_here
//
// Vite will inject it at build time. If you'd rather hardcode it for a quick
// local test, you can also just paste it directly into the fallback string
// below (between the quotes) — but the .env approach is safer if you ever
// share this folder or push it to GitHub.
// ---------------------------------------------------------------------------

export const OPENWEATHER_API_KEY: string =
  import.meta.env.VITE_OPENWEATHER_API_KEY || "";

// Dehiwala town centre — used for the live climate widget on the Overview tab.
export const DEHIWALA_COORDS = {
  lat: 6.8535,
  lon: 79.8656,
};

// How often to refresh the live weather data, in milliseconds.
export const CLIMATE_REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

// Local projection origin used to flatten Dehiwala's lon/lat GeoJSON into a
// meter-based plane for the 3D scene. Roughly the centroid of the DSD.
export const PROJECTION_ORIGIN = {
  lon: 79.8681,
  lat: 6.8529,
};
