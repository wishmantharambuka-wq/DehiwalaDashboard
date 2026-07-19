import { lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "./components/layout/Header";
import { TabBar } from "./components/layout/TabBar";
import { useDashboardStore } from "./store/useDashboardStore";

const OverviewPage = lazy(() =>
  import("./components/overview/OverviewPage").then((m) => ({ default: m.OverviewPage })),
);
const StaticMapsPage = lazy(() =>
  import("./components/static-maps/StaticMapsPage").then((m) => ({
    default: m.StaticMapsPage,
  })),
);

function PageLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-cyan-400/70 text-xs font-mono animate-pulse-slow">Loading…</div>
    </div>
  );
}

function ActivePage() {
  const activeTab = useDashboardStore((s) => s.activeTab);

  return (
    <Suspense fallback={<PageLoader />}>
      {activeTab === "overview" && <OverviewPage />}
      {activeTab === "static-maps" && <StaticMapsPage />}
    </Suspense>
  );
}

function App() {
  const activeTab = useDashboardStore((s) => s.activeTab);

  return (
    <div className="min-h-screen h-screen flex flex-col bg-radial-glow">
      <Header />
      <div className="px-4 md:px-5">
        <TabBar />
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
      </div>

      <main className="flex-1 min-h-0 px-4 md:px-5 py-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <ActivePage />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
