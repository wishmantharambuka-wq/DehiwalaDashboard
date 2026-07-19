import { useCallback, useEffect, useRef, useState } from "react";
import { OPENWEATHER_API_KEY, DEHIWALA_COORDS } from "../config";

export interface ForecastPoint {
  dt: number;
  tempC: number;
  feelsLikeC: number;
  humidity: number;
  windSpeedMs: number;
  windDeg: number;
  pressureHpa: number;
  pop: number;
  condition: string;
  icon: string;
}

interface Coords {
  lat: number;
  lon: number;
}

interface OpenWeatherForecastItem {
  dt: number;
  main: { temp: number; feels_like: number; humidity: number; pressure: number };
  wind: { speed: number; deg: number };
  pop: number;
  weather: { description: string; icon: string }[];
}

interface OpenWeatherForecastResponse {
  list: OpenWeatherForecastItem[];
}

export function useForecast(coords: Coords = DEHIWALA_COORDS) {
  const [data, setData] = useState<ForecastPoint[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const coordsRef = useRef(coords);
  coordsRef.current = coords;

  const fetchForecast = useCallback(async () => {
    if (!OPENWEATHER_API_KEY) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { lat, lon } = coordsRef.current;
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Forecast request failed (${res.status})`);
      const json: OpenWeatherForecastResponse = await res.json();
      const points: ForecastPoint[] = json.list.map((item) => ({
        dt: item.dt * 1000,
        tempC: item.main.temp,
        feelsLikeC: item.main.feels_like,
        humidity: item.main.humidity,
        windSpeedMs: item.wind.speed,
        windDeg: item.wind.deg,
        pressureHpa: item.main.pressure,
        pop: item.pop,
        condition: item.weather[0]?.description ?? "",
        icon: item.weather[0]?.icon ?? "01d",
      }));
      setData(points);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch forecast");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForecast();
  }, [coords.lat, coords.lon, fetchForecast]);

  return { data, loading, error, hasApiKey: Boolean(OPENWEATHER_API_KEY) };
}
