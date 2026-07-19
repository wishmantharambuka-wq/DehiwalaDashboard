import { useCallback, useEffect, useRef, useState } from "react";
import { OPENWEATHER_API_KEY, DEHIWALA_COORDS, CLIMATE_REFRESH_INTERVAL_MS } from "../config";
import type { ClimateSnapshot } from "../types";

interface OpenWeatherResponse {
  main: { temp: number; feels_like: number; humidity: number; pressure: number };
  wind: { speed: number; deg: number };
  weather: { main: string; description: string; icon: string }[];
  visibility: number;
}

interface ClimateState {
  data: ClimateSnapshot | null;
  loading: boolean;
  error: string | null;
  hasApiKey: boolean;
  refresh: () => void;
}

interface Coords {
  lat: number;
  lon: number;
}

/**
 * Fetches live OpenWeather conditions for the given coordinates (defaults to
 * central Dehiwala). Pass a different `coords` object (e.g. a GN division's
 * centroid) to have the widget follow the current map selection — it
 * automatically re-fetches whenever the coordinates change.
 */
export function useClimate(coords: Coords = DEHIWALA_COORDS): ClimateState {
  const [data, setData] = useState<ClimateSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const coordsRef = useRef(coords);
  coordsRef.current = coords;

  const fetchWeather = useCallback(async () => {
    if (!OPENWEATHER_API_KEY) {
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    try {
      const { lat, lon } = coordsRef.current;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`OpenWeather request failed (${res.status})`);
      const json: OpenWeatherResponse = await res.json();
      setData({
        tempC: json.main.temp,
        feelsLikeC: json.main.feels_like,
        humidity: json.main.humidity,
        windSpeedMs: json.wind.speed,
        windDeg: json.wind.deg,
        condition: json.weather[0]?.description ?? "—",
        icon: json.weather[0]?.icon ?? "01d",
        pressureHpa: json.main.pressure,
        visibilityKm: json.visibility / 1000,
        updatedAt: Date.now(),
      });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch climate data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch whenever the target coordinates change (e.g. selecting a GN division)
  useEffect(() => {
    fetchWeather();
  }, [coords.lat, coords.lon, fetchWeather]);

  // Independent background refresh interval
  useEffect(() => {
    const id = setInterval(fetchWeather, CLIMATE_REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchWeather]);

  return { data, loading, error, hasApiKey: Boolean(OPENWEATHER_API_KEY), refresh: fetchWeather };
}
