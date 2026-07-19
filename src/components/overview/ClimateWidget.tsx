import { useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { useClimate } from "../../hooks/useClimate";
import { DEHIWALA_COORDS } from "../../config";

function WeatherIcon({ code }: { code: string }) {
  // Minimal glyph set keyed by OpenWeather icon prefix (first 2 chars)
  const key = code.slice(0, 2);
  const common = "w-9 h-9";
  switch (key) {
    case "01":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none">
          <circle cx="12" cy="12" r="5" fill="#f5b942" />
          <g stroke="#f5b942" strokeWidth="1.4" strokeLinecap="round">
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </g>
        </svg>
      );
    case "02":
    case "03":
    case "04":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none">
          <circle cx="9" cy="10" r="4" fill="#f5b942" opacity={0.8} />
          <path
            d="M6 18h11a3.5 3.5 0 0 0 .5-6.96A5 5 0 0 0 8 9.6 3.5 3.5 0 0 0 6 18Z"
            fill="#9fd8e6"
          />
        </svg>
      );
    case "09":
    case "10":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none">
          <path
            d="M6 15h11a3.5 3.5 0 0 0 .5-6.96A5 5 0 0 0 8 6.6 3.5 3.5 0 0 0 6 15Z"
            fill="#7fa9b4"
          />
          <g stroke="#4dd8e6" strokeWidth="1.4" strokeLinecap="round">
            <path d="M8 18v2M12 18v2M16 18v2" />
          </g>
        </svg>
      );
    case "11":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none">
          <path
            d="M6 14h11a3.5 3.5 0 0 0 .5-6.96A5 5 0 0 0 8 5.6 3.5 3.5 0 0 0 6 14Z"
            fill="#7fa9b4"
          />
          <path d="M12 15l-2 4h2.4l-1.4 4 4-5.6h-2.4L14 15z" fill="#f5b942" />
        </svg>
      );
    case "13":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none">
          <path
            d="M6 14h11a3.5 3.5 0 0 0 .5-6.96A5 5 0 0 0 8 5.6 3.5 3.5 0 0 0 6 14Z"
            fill="#9fd8e6"
          />
          <g fill="#e7f4f8">
            <circle cx="8" cy="18" r="1" />
            <circle cx="12" cy="19" r="1" />
            <circle cx="16" cy="18" r="1" />
          </g>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none">
          <path
            d="M6 15h11a3.5 3.5 0 0 0 .5-6.96A5 5 0 0 0 8 6.6 3.5 3.5 0 0 0 6 15Z"
            fill="#9fd8e6"
          />
        </svg>
      );
  }
}

interface ClimateWidgetProps {
  compact?: boolean;
  coords?: { lat: number; lon: number };
  locationLabel?: string;
}

export function ClimateWidget({ compact, coords, locationLabel }: ClimateWidgetProps) {
  const { data, loading, error, hasApiKey, refresh } = useClimate(coords ?? DEHIWALA_COORDS);
  const [copied, setCopied] = useState(false);

  return (
    <GlassCard className={compact ? "p-3" : "p-4"} glow>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
          Live Climate · {locationLabel ?? "Dehiwala"}
        </span>
        <button
          onClick={refresh}
          className="text-cyan-400/70 hover:text-cyan-300 transition-colors"
          title="Refresh now"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none">
            <path
              d="M4 4v5h5M20 20v-5h-5M4.5 15a8 8 0 0 0 14.6 2.5M19.5 9A8 8 0 0 0 4.9 6.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {!hasApiKey && (
        <div className="text-xs text-slate-400 leading-relaxed">
          <p className="mb-2">
            Add your free OpenWeatherMap API key to switch this on — live temperature, humidity
            and wind for Dehiwala will appear here automatically.
          </p>
          <button
            onClick={() => {
              navigator.clipboard?.writeText("VITE_OPENWEATHER_API_KEY=").catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="font-mono text-[11px] px-2 py-1 rounded bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/20 transition-colors"
          >
            {copied ? "copied ✓" : "copy .env variable name"}
          </button>
          <p className="mt-2 text-[11px] text-slate-500">
            See <span className="font-mono">.env.example</span> in the project root.
          </p>
        </div>
      )}

      {hasApiKey && loading && !data && (
        <div className="text-xs text-slate-500 animate-pulse-slow">Fetching live conditions…</div>
      )}

      {hasApiKey && error && !data && (
        <div className="text-xs text-rose-300">Couldn't reach OpenWeather: {error}</div>
      )}

      {data && (
        <div>
          <div className="flex items-center gap-3">
            <WeatherIcon code={data.icon} />
            <div>
              <div className="text-2xl font-display font-bold text-cyan-200 glow-text leading-none">
                {Math.round(data.tempC)}°C
              </div>
              <div className="text-[11px] text-slate-400 capitalize">{data.condition}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Feels</div>
              <div className="text-sm font-mono text-cyan-300">{Math.round(data.feelsLikeC)}°</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Humidity</div>
              <div className="text-sm font-mono text-cyan-300">{data.humidity}%</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Wind</div>
              <div className="text-sm font-mono text-cyan-300">{data.windSpeedMs.toFixed(1)}m/s</div>
            </div>
          </div>
          <div className="text-[10px] text-slate-600 mt-2 font-mono">
            updated {new Date(data.updatedAt).toLocaleTimeString()}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
