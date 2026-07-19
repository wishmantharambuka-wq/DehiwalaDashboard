import type { ReactNode } from "react";
import clsx from "clsx";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  solid?: boolean;
  glow?: boolean;
  as?: "div" | "section";
}

export function GlassCard({ children, className, solid, glow, as = "div" }: GlassCardProps) {
  const Comp = as;
  return (
    <Comp
      className={clsx(
        "rounded-2xl",
        solid ? "glass-panel-solid" : "glass-panel",
        glow && "glow-border",
        className
      )}
    >
      {children}
    </Comp>
  );
}
