import { useState, type ReactNode } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { GlassCard } from "./GlassCard";

interface FloatingMapPanelProps {
  children: ReactNode;
  title?: string;
  defaultOpen?: boolean;
  side?: "left" | "right";
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
      <path
        d="M12 3l9 4.9-9 4.9-9-4.9L12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M3 12.1l9 4.9 9-4.9M3 16.9l9 4.9 9-4.9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * A small circular toggle button (top corner of a map) that expands into a
 * glass panel — mirrors the "Map Layers" flyout pattern, positioned so it
 * never collides with Leaflet's built-in zoom control (which sits top-left).
 */
export function FloatingMapPanel({
  children,
  title = "Map layers",
  defaultOpen = true,
  side = "right",
}: FloatingMapPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={clsx(
        "absolute z-[500] flex flex-col items-end gap-2",
        side === "right" ? "top-3 right-3 items-end" : "top-3 left-3 items-start",
      )}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "w-9 h-9 rounded-full glass-panel-solid flex items-center justify-center transition-colors shrink-0",
          open ? "text-cyan-200 bg-cyan-400/10" : "text-cyan-300/70 hover:text-cyan-100",
        )}
        title={open ? `Hide ${title.toLowerCase()}` : `Show ${title.toLowerCase()}`}
      >
        <LayersIcon />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="w-56 max-h-[calc(100vh-220px)] overflow-y-auto no-scrollbar"
          >
            <GlassCard solid className="p-3 flex flex-col gap-2.5">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                {title}
              </div>
              {children}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
