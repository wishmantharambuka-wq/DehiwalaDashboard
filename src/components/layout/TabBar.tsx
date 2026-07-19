import clsx from "clsx";
import { motion } from "framer-motion";
import type { TabId } from "../../types";
import { useDashboardStore } from "../../store/useDashboardStore";

const TABS: { id: TabId; label: string; sub: string }[] = [
  { id: "overview", label: "Overview", sub: "3D city view" },
  { id: "static-maps", label: "Static Maps", sub: "Reference map gallery" },
];

export function TabBar() {
  const activeTab = useDashboardStore((s) => s.activeTab);
  const setActiveTab = useDashboardStore((s) => s.setActiveTab);

  return (
    <nav className="w-full overflow-x-auto no-scrollbar">
      <div className="flex items-stretch gap-1 min-w-max px-1">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "relative px-4 py-2.5 rounded-t-lg transition-colors duration-200 text-left group",
                active ? "text-cyan-200" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <div className="font-display font-semibold text-sm tracking-wide">
                {tab.label}
              </div>
              <div
                className={clsx(
                  "text-[10px] tracking-wide transition-colors",
                  active ? "text-cyan-400/70" : "text-slate-600 group-hover:text-slate-500"
                )}
              >
                {tab.sub}
              </div>
              {active && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute left-2 right-2 -bottom-px h-[2px] bg-gradient-to-r from-cyan-400/40 via-cyan-300 to-cyan-400/40 rounded-full"
                  style={{ boxShadow: "0 0 8px rgba(127,245,255,0.8)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
