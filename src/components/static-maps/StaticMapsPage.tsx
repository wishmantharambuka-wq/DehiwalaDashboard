import { useState } from "react";
import { ImageLightbox } from "../ui/ImageLightbox";

interface MapEntry {
  src: string;
  label: string;
  category: string;
}

const MAPS: MapEntry[] = [
  { src: "/data/images/closeness-500m.jpg", label: "Closeness Centrality · 500m", category: "Centrality" },
  { src: "/data/images/closeness-2000m.jpg", label: "Closeness Centrality · 2000m", category: "Centrality" },
  { src: "/data/images/closeness-5000m.jpg", label: "Closeness Centrality · 5000m", category: "Centrality" },
  { src: "/data/images/betweenness-500m.jpg", label: "Betweenness Centrality · 500m", category: "Centrality" },
  { src: "/data/images/betweenness-2000m.jpg", label: "Betweenness Centrality · 2000m", category: "Centrality" },
  { src: "/data/images/betweenness-5000m.jpg", label: "Betweenness Centrality · 5000m", category: "Centrality" },
  { src: "/data/images/fsi-map.jpg", label: "Floor Space Index (FSI)", category: "Density" },
  { src: "/data/images/gsi-map.jpg", label: "Ground Space Index (GSI)", category: "Density" },
  { src: "/data/images/osr-map.jpg", label: "Open Space Ratio (OSR)", category: "Density" },
  { src: "/data/images/entropy-map.jpg", label: "Land-use Entropy", category: "Density" },
  { src: "/data/images/umi-map.jpg", label: "Urban Maturation Index", category: "Maturation" },
  { src: "/data/images/landuse-map.jpg", label: "Land Use Classification", category: "Land Use" },
  { src: "/data/images/urban-heat-map.jpg", label: "Urban Heat Island", category: "Environmental" },
  { src: "/data/images/uhi-overlay.png", label: "UHI Raster Overlay", category: "Environmental" },
];

const CATEGORIES = [...new Set(MAPS.map((m) => m.category))];

export function StaticMapsPage() {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [filter, setFilter] = useState<string>("All");

  const filtered = filter === "All" ? MAPS : MAPS.filter((m) => m.category === filter);

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilter("All")}
          className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold tracking-wide transition-colors border ${
            filter === "All"
              ? "bg-cyan-400/15 border-cyan-400/40 text-cyan-200"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold tracking-wide transition-colors border ${
              filter === cat
                ? "bg-cyan-400/15 border-cyan-400/40 text-cyan-200"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((m) => (
            <button
              key={m.src}
              onClick={() => setLightbox({ src: m.src, alt: m.label })}
              className="group text-left"
            >
              <div className="rounded-xl overflow-hidden border border-cyan-400/10 hover:border-cyan-400/30 transition-colors bg-white/[0.02]">
                <img
                  src={m.src}
                  alt={m.label}
                  className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="mt-1.5 px-0.5">
                <div className="text-[11px] font-display font-semibold text-slate-300 group-hover:text-cyan-200 transition-colors leading-tight">
                  {m.label}
                </div>
                <div className="text-[9px] text-slate-600 uppercase tracking-wider mt-0.5">{m.category}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <ImageLightbox
        src={lightbox?.src ?? null}
        alt={lightbox?.alt}
        onClose={() => setLightbox(null)}
      />
    </div>
  );
}
