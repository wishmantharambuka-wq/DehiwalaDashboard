import type { ReactNode } from "react";
import clsx from "clsx";
import { GlassCard } from "./GlassCard";

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  accent?: "cyan" | "teal" | "amber" | "violet" | "rose";
  icon?: ReactNode;
  sub?: string;
  compact?: boolean;
}

const accentClasses: Record<NonNullable<StatCardProps["accent"]>, string> = {
  cyan: "text-cyan-300",
  teal: "text-teal-300",
  amber: "text-amber-300",
  violet: "text-violet-300",
  rose: "text-rose-300",
};

export function StatCard({
  label,
  value,
  unit,
  accent = "cyan",
  icon,
  sub,
  compact,
}: StatCardProps) {
  return (
    <GlassCard className={clsx("flex flex-col", compact ? "p-3" : "p-4")}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
          {label}
        </span>
        {icon && <span className={clsx("opacity-70", accentClasses[accent])}>{icon}</span>}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span
          className={clsx(
            "font-display font-bold glow-text",
            compact ? "text-xl" : "text-2xl md:text-3xl",
            accentClasses[accent]
          )}
        >
          {value}
        </span>
        {unit && <span className="text-xs text-slate-400">{unit}</span>}
      </div>
      {sub && <span className="text-[11px] text-slate-500 mt-0.5">{sub}</span>}
    </GlassCard>
  );
}
