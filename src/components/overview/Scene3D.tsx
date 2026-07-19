import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Sparkles } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { GNTile } from "./GNTile";
import { CameraRig } from "./CameraRig";
import { GroundGrid } from "./GroundGrid";
import { FloatingDataPanels } from "./FloatingDataPanels";
import { ComparisonPanels3D } from "./ComparisonPanels3D";
import { OverviewFloatingCards } from "./OverviewFloatingCards";
import { MapPlane3D, LayerControlPanel3D } from "./MapPlane3D";
import { SynthesisBoard3D } from "./SynthesisBoard3D";
import { IssuesBoard3D } from "./IssuesBoard3D";
import { WeatherDashboard3D } from "./WeatherDashboard3D";
import { useProjectedGNDivisions } from "../../hooks/useProjectedGNDivisions";
import { useDashboardStore } from "../../store/useDashboardStore";

const BASE_HEIGHT = 55;
const MIN_HEIGHT = 18;

function SceneContent({ autoRotate, nightMode }: { autoRotate: boolean; nightMode: boolean }) {
  const { divisions, bounds, cityCentroid } = useProjectedGNDivisions();
  const hoveredGN = useDashboardStore((s) => s.hoveredGN);
  const selectedGN = useDashboardStore((s) => s.selectedGN);
  const pinnedGNs = useDashboardStore((s) => s.pinnedGNs);
  const setHoveredGN = useDashboardStore((s) => s.setHoveredGN);
  const setSelectedGN = useDashboardStore((s) => s.setSelectedGN);
  const togglePinGN = useDashboardStore((s) => s.togglePinGN);
  const show2DView = useDashboardStore((s) => s.show2DView);
  const showSynthesis = useDashboardStore((s) => s.showSynthesis);
  const showIssues = useDashboardStore((s) => s.showIssues);
  const showLiveData = useDashboardStore((s) => s.showLiveData);

  const hasComparison = pinnedGNs.length === 2;
  const anyOverlay = show2DView || showSynthesis || showIssues || showLiveData;

  const citySpan = useMemo(() => {
    if (!bounds) return 2200;
    return Math.max(bounds.maxX - bounds.minX, bounds.maxZ - bounds.minZ);
  }, [bounds]);

  const selected = selectedGN ? divisions.find((d) => d.name === selectedGN) : null;

  const boardPos: [number, number, number] = [cityCentroid[0], 500, cityCentroid[1]];

  const compDiv0 = hasComparison ? divisions.find((d) => d.name === pinnedGNs[0]) : null;
  const compDiv1 = hasComparison ? divisions.find((d) => d.name === pinnedGNs[1]) : null;
  const compCenter: [number, number, number] | null =
    compDiv0 && compDiv1
      ? [(compDiv0.centroid[0] + compDiv1.centroid[0]) / 2, 150, (compDiv0.centroid[1] + compDiv1.centroid[1]) / 2]
      : null;

  const focusTarget: [number, number, number] = selected && !hasComparison
    ? [selected.centroid[0], 60, selected.centroid[1]]
    : hasComparison && compCenter
      ? compCenter
      : anyOverlay
        ? [cityCentroid[0], 350, cityCentroid[1]]
        : [cityCentroid[0], 0, cityCentroid[1]];

  const focusDistance = selected && !hasComparison
    ? Math.max(citySpan * 0.38, 550)
    : hasComparison
      ? citySpan * 0.7
      : anyOverlay
        ? citySpan * 0.65
        : citySpan * 1.3;

  const focusPolar = selected && !hasComparison ? 0.72 : hasComparison ? 0.62 : anyOverlay ? 0.5 : 0.68;

  const focusAzimuth = selected && !hasComparison
    ? Math.PI / 4.4
    : anyOverlay
      ? Math.PI / 4
      : Math.PI / 4.4;

  const tileHeight = selected ? BASE_HEIGHT * selected.heightT + MIN_HEIGHT : 0;

  return (
    <>
      {nightMode ? (
        <>
          <ambientLight intensity={0.35} color="#f59e0b" />
          <directionalLight position={[600, 900, 400]} intensity={1.2} color="#fde68a" />
          <directionalLight position={[-500, 400, -600]} intensity={0.3} color="#f97316" />
          <hemisphereLight args={["#92400e", "#0c0a09", 0.5]} />
          <pointLight position={[cityCentroid[0], 400, cityCentroid[1]]} intensity={0.5} color="#fbbf24" distance={2000} />
        </>
      ) : (
        <>
          <ambientLight intensity={0.5} color="#3fa6b8" />
          <directionalLight position={[600, 900, 400]} intensity={1.6} color="#bfefff" />
          <directionalLight position={[-500, 400, -600]} intensity={0.45} color="#8b7cf6" />
          <hemisphereLight args={["#2a5a6a", "#050b14", 0.6]} />
          <pointLight position={[cityCentroid[0], 400, cityCentroid[1]]} intensity={0.6} color="#7ff5ff" distance={2000} />
        </>
      )}

      <GroundGrid size={citySpan} center={cityCentroid} />

      {divisions.map((gn) => (
        <GNTile
          key={gn.name}
          gn={gn}
          isHovered={hoveredGN === gn.name}
          isSelected={selectedGN === gn.name}
          isPinned={pinnedGNs.includes(gn.name)}
          isDimmed={Boolean(selectedGN) && selectedGN !== gn.name && !pinnedGNs.includes(gn.name)}
          onHover={setHoveredGN}
          onSelect={setSelectedGN}
          onTogglePin={togglePinGN}
        />
      ))}

      {hasComparison ? (
        <ComparisonPanels3D
          pinnedGNs={pinnedGNs as [string, string]}
          center={cityCentroid}
          citySpan={citySpan}
        />
      ) : selected ? (
        <FloatingDataPanels selected={selected} tileHeight={tileHeight} />
      ) : (
        !anyOverlay && <OverviewFloatingCards center={cityCentroid} citySpan={citySpan} />
      )}

      {/* 2D Map glass planes — centered above city */}
      {show2DView && !selected && (
        <>
          <MapPlane3D position={boardPos} />
          <LayerControlPanel3D position={[boardPos[0] + citySpan * 0.35, boardPos[1], boardPos[2]]} />
        </>
      )}

      {/* Synthesis board — centered above city */}
      {showSynthesis && !selected && (
        <SynthesisBoard3D position={boardPos} />
      )}

      {/* Issues & Potentials board — centered above city */}
      {showIssues && !selected && (
        <IssuesBoard3D position={boardPos} />
      )}

      {/* Live Weather Dashboard */}
      {showLiveData && !selected && (
        <WeatherDashboard3D center={cityCentroid} citySpan={citySpan} />
      )}

      <Sparkles
        count={80}
        size={2.5}
        scale={[citySpan * 1.4, 90, citySpan * 1.4]}
        position={[cityCentroid[0], 40, cityCentroid[1]]}
        color="#7ff5ff"
        speed={0.15}
        opacity={0.35}
      />

      <CameraRig
        target={focusTarget}
        distance={focusDistance}
        polarAngle={focusPolar}
        azimuthAngle={focusAzimuth}
        autoRotate={!selected && !anyOverlay && !hasComparison && autoRotate}
      />

      <fog attach="fog" args={["#050b14", citySpan * 0.9, citySpan * 3.2]} />
    </>
  );
}

export function Scene3D() {
  const selectedGN = useDashboardStore((s) => s.selectedGN);
  const setSelectedGN = useDashboardStore((s) => s.setSelectedGN);
  const show2DView = useDashboardStore((s) => s.show2DView);
  const setShow2DView = useDashboardStore((s) => s.setShow2DView);
  const showSynthesis = useDashboardStore((s) => s.showSynthesis);
  const setShowSynthesis = useDashboardStore((s) => s.setShowSynthesis);
  const showIssues = useDashboardStore((s) => s.showIssues);
  const setShowIssues = useDashboardStore((s) => s.setShowIssues);
  const showLiveData = useDashboardStore((s) => s.showLiveData);
  const setShowLiveData = useDashboardStore((s) => s.setShowLiveData);
  const isSelected = Boolean(selectedGN);
  const [autoRotate, setAutoRotate] = useState(true);
  const [nightMode, setNightMode] = useState(false);

  const anyOverlay = show2DView || showSynthesis || showIssues || showLiveData;

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ fov: 42, near: 1, far: 20000, position: [400, 900, 700] }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        dpr={[1, 1.75]}
      >
        <color attach="background" args={["#050b14"]} />
        <Suspense fallback={null}>
          <SceneContent autoRotate={autoRotate} nightMode={nightMode} />
          <EffectComposer multisampling={0}>
            <Bloom luminanceThreshold={0.25} luminanceSmoothing={0.35} mipmapBlur intensity={0.9} radius={0.6} />
            <Vignette eskil={false} offset={0.15} darkness={0.9} />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* Top bar */}
      <div className="pointer-events-none absolute top-3 left-3 right-3 flex items-start justify-between gap-3 z-10">
        <AnimatePresence mode="wait">
          {isSelected ? (
            <motion.button
              key="back"
              onClick={() => setSelectedGN(null)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="pointer-events-auto flex items-center gap-1.5 glass-panel-solid rounded-lg px-3 py-2 text-[12px] font-display font-semibold text-cyan-200 hover:bg-cyan-400/10 hover:text-cyan-100 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to Overview
            </motion.button>
          ) : (
            <motion.div
              key="tip"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-panel-solid rounded-lg px-3 py-2 text-[11px] text-slate-300 max-w-xs pointer-events-auto"
            >
              <span className="text-cyan-300 font-semibold">Tip:</span> hover a GN division to
              lift it, click to zoom in and see its data. Drag to orbit, scroll to zoom.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Day / Night toggle */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="pointer-events-auto"
        >
          <button
            onClick={() => setNightMode((v) => !v)}
            className="flex items-center gap-2.5 glass-panel-solid rounded-full px-3 py-1.5 border border-white/[0.08] hover:border-white/[0.15] transition-all"
          >
            {/* Sun icon */}
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" style={{ color: nightMode ? "#64748b" : "#fbbf24", transition: "color 0.4s" }}>
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>

            {/* Toggle track */}
            <div
              style={{
                width: 36,
                height: 18,
                borderRadius: 9,
                background: nightMode ? "rgba(251,191,36,0.25)" : "rgba(56,189,248,0.2)",
                border: `1px solid ${nightMode ? "rgba(251,191,36,0.3)" : "rgba(56,189,248,0.2)"}`,
                position: "relative",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {/* Toggle knob */}
              <div
                style={{
                  position: "absolute",
                  top: 2,
                  left: nightMode ? 20 : 2,
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: nightMode ? "#fbbf24" : "#38bdf8",
                  boxShadow: nightMode ? "0 0 8px rgba(251,191,36,0.5)" : "0 0 8px rgba(56,189,248,0.4)",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </div>

            {/* Moon icon */}
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" style={{ color: nightMode ? "#fbbf24" : "#64748b", transition: "color 0.4s" }}>
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            <span style={{ fontSize: 11, fontWeight: 600, color: nightMode ? "#fde68a" : "#94a3b8", transition: "color 0.4s", minWidth: 32 }}>
              {nightMode ? "Night" : "Day"}
            </span>
          </button>
        </motion.div>
      </div>

      {/* Bottom-right controls */}
      <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-2 items-end">
        <AnimatePresence>
          {!isSelected && (
            <>
              {/* 2D View toggle */}
              <motion.button
                key="2d-btn"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                onClick={() => { setShow2DView(!show2DView); if (!show2DView) setAutoRotate(false); }}
                className={`pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-display font-semibold transition-colors ${
                  show2DView
                    ? "glass-panel-solid border border-violet-400/30 text-violet-200"
                    : "glass-panel-solid border border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/[0.15]"
                }`}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M3 9h18M9 3v18" stroke="currentColor" strokeWidth="1.3" opacity="0.5" />
                  <circle cx="14" cy="14" r="3" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                {show2DView ? "Hide 2D Map" : "2D View"}
              </motion.button>

              {/* Synthesis toggle */}
              <motion.button
                key="synth-btn"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25, delay: 0.03 }}
                onClick={() => { setShowSynthesis(!showSynthesis); if (!showSynthesis) setAutoRotate(false); }}
                className={`pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-display font-semibold transition-colors ${
                  showSynthesis
                    ? "glass-panel-solid border border-amber-400/30 text-amber-200"
                    : "glass-panel-solid border border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/[0.15]"
                }`}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
                {showSynthesis ? "Hide Synthesis" : "Synthesis"}
              </motion.button>

              {/* Issues & Potentials toggle */}
              <motion.button
                key="issues-btn"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25, delay: 0.06 }}
                onClick={() => { setShowIssues(!showIssues); if (!showIssues) setAutoRotate(false); }}
                className={`pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-display font-semibold transition-colors ${
                  showIssues
                    ? "glass-panel-solid border border-rose-400/30 text-rose-200"
                    : "glass-panel-solid border border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/[0.15]"
                }`}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="12" cy="17" r="0.5" fill="currentColor" />
                </svg>
                {showIssues ? "Hide Issues" : "Issues & Potentials"}
              </motion.button>

              {/* Live Data toggle */}
              <motion.button
                key="live-btn"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25, delay: 0.09 }}
                onClick={() => { setShowLiveData(!showLiveData); if (!showLiveData) setAutoRotate(false); }}
                className={`pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-display font-semibold transition-colors ${
                  showLiveData
                    ? "glass-panel-solid border border-emerald-400/30 text-emerald-200"
                    : "glass-panel-solid border border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/[0.15]"
                }`}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {showLiveData ? "Hide Live Data" : "Live Data"}
              </motion.button>

              {/* Auto rotate toggle */}
              {!anyOverlay && (
                <motion.button
                  key="rotate-btn"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => setAutoRotate((v) => !v)}
                  className={`pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-display font-semibold transition-colors ${
                    autoRotate
                      ? "glass-panel-solid border border-cyan-400/30 text-cyan-200"
                      : "glass-panel-solid border border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/[0.15]"
                  }`}
                >
                  <svg viewBox="0 0 24 24" className={`w-4 h-4 ${autoRotate ? "animate-spin" : ""}`} style={autoRotate ? { animationDuration: "3s" } : {}} fill="none">
                    <path d="M21 12a9 9 0 1 1-2.636-6.364" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M21 3v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {autoRotate ? "Stop Rotation" : "Auto Rotate"}
                </motion.button>
              )}

              {/* Screenshot button */}
              <motion.button
                key="screenshot-btn"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25, delay: 0.09 }}
                onClick={() => {
                  const canvas = document.querySelector("canvas");
                  if (!canvas) return;
                  const link = document.createElement("a");
                  link.download = `dehiwala-dashboard-${Date.now()}.png`;
                  link.href = canvas.toDataURL("image/png");
                  link.click();
                }}
                className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-display font-semibold glass-panel-solid border border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/[0.15] transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="12" cy="12" r="1" fill="currentColor" />
                  <path d="M7 5V4a1 1 0 011-1h8a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                Screenshot
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        animate={{ opacity: isSelected || anyOverlay ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="pointer-events-none absolute bottom-3 left-3 z-10"
      >
        <div className="glass-panel-solid rounded-lg px-3 py-2 border border-white/[0.06]">
          <div className="flex items-center gap-4 mb-1.5">
            <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
              <svg viewBox="0 0 16 16" className="w-3 h-3 text-slate-500" fill="none">
                <rect x="2" y="8" width="4" height="6" rx="0.5" fill="currentColor" opacity="0.3" />
                <rect x="6" y="4" width="4" height="10" rx="0.5" fill="currentColor" opacity="0.5" />
                <rect x="10" y="1" width="4" height="13" rx="0.5" fill="currentColor" opacity="0.8" />
              </svg>
              <span className="font-semibold text-slate-300">Height</span> = Population
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
              <div className="w-6 h-2.5 rounded-sm" style={{ background: "linear-gradient(to right, #152238, #1c8fa6, #c9f76c)" }} />
              <span className="font-semibold text-slate-300">Color</span> = Density
            </div>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm" style={{ background: "#152238" }} />
              low
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm" style={{ background: "#1c8fa6" }} />
              mid
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm" style={{ background: "#c9f76c" }} />
              high
            </span>
            <span className="text-slate-600 ml-1">|</span>
            <span className="text-slate-400 text-[8px]">Shift+click to pin & compare</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
