import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import {
  buildShapesFromMultiPolygon,
  buildExtrudedGeometry,
  buildEdgeGeometry,
  applyHeightGradient,
} from "../../utils/threeGeo";
import { scaleColor, DENSITY_SCALE } from "../../utils/geo";
import { PROJECTION_ORIGIN } from "../../config";
import type { ProjectedGN } from "../../hooks/useProjectedGNDivisions";
import { PulseMarker } from "./PulseMarker";

const BASE_HEIGHT = 55;
const MIN_HEIGHT = 18;
const HOVER_LIFT = 30;
const SELECT_LIFT = 120;

interface GNTileProps {
  gn: ProjectedGN;
  isHovered: boolean;
  isSelected: boolean;
  isPinned: boolean;
  isDimmed: boolean;
  onHover: (name: string | null) => void;
  onSelect: (name: string) => void;
  onTogglePin: (name: string) => void;
}

export function GNTile({ gn, isHovered, isSelected, isPinned, isDimmed, onHover, onSelect, onTogglePin }: GNTileProps) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const edgeMatRef = useRef<THREE.LineBasicMaterial>(null);

  const depth = useMemo(() => BASE_HEIGHT * gn.heightT + MIN_HEIGHT, [gn.heightT]);

  const shapes = useMemo(
    () => buildShapesFromMultiPolygon(gn.geometry, PROJECTION_ORIGIN),
    [gn.geometry],
  );

  const SLATE_BLUE_SCALE = ["#1a2a3e", "#1e3a52", "#24506a", "#2a6680", "#357a92"];

  const baseColor = useMemo(() => {
    if (!gn.hasPopulationData) return "#1a2a3e";
    return scaleColor(gn.densityT, SLATE_BLUE_SCALE);
  }, [gn.densityT, gn.hasPopulationData]);

  const geometry = useMemo(() => {
    const geo = buildExtrudedGeometry(shapes, depth);
    const bottom = new THREE.Color(baseColor).multiplyScalar(0.3);
    const top = new THREE.Color(baseColor).lerp(new THREE.Color("#8ab4c8"), 0.25);
    applyHeightGradient(geo, depth, bottom, top);
    return geo;
  }, [shapes, depth, baseColor]);

  const edgeGeometry = useMemo(
    () => buildEdgeGeometry(gn.geometry, PROJECTION_ORIGIN, depth + 0.3),
    [gn.geometry, depth],
  );

  const targetY = isHovered ? HOVER_LIFT : isSelected ? SELECT_LIFT : 0;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const current = groupRef.current.position.y;
    const next = THREE.MathUtils.damp(current, targetY, 5, delta);
    groupRef.current.position.y = next;

    if (matRef.current) {
      const targetEmissive = isSelected
        ? new THREE.Color("#2196ff")
        : isPinned
          ? new THREE.Color("#f59e0b")
          : isHovered
            ? new THREE.Color("#1565c0")
            : new THREE.Color("#000000");
      matRef.current.emissive.lerp(targetEmissive, 1 - Math.pow(0.05, delta));
      matRef.current.emissiveIntensity = THREE.MathUtils.damp(
        matRef.current.emissiveIntensity,
        isSelected ? 0.85 : isPinned ? 0.65 : isHovered ? 0.35 : 0,
        4,
        delta,
      );
      matRef.current.opacity = THREE.MathUtils.damp(
        matRef.current.opacity,
        isDimmed ? 0.2 : gn.hasPopulationData ? 0.92 : 0.4,
        6,
        delta,
      );
    }

    if (edgeMatRef.current) {
      const targetEdgeColor = isSelected
        ? new THREE.Color("#64b5f6")
        : isHovered
          ? new THREE.Color("#90caf9")
          : new THREE.Color("#4a7a8a");
      edgeMatRef.current.color.lerp(targetEdgeColor, 1 - Math.pow(0.05, delta));
      edgeMatRef.current.opacity = THREE.MathUtils.damp(
        edgeMatRef.current.opacity,
        isDimmed ? 0.12 : isSelected ? 1 : isHovered ? 1 : 0.65,
        6,
        delta,
      );
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(gn.name);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        if ((e as unknown as { nativeEvent?: MouseEvent }).nativeEvent?.shiftKey) {
          onTogglePin(gn.name);
        } else {
          onSelect(gn.name);
        }
      }}
    >
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          ref={matRef}
          vertexColors
          transparent
          opacity={isDimmed ? 0.2 : gn.hasPopulationData ? 0.92 : 0.4}
          roughness={0.3}
          metalness={0.15}
          clearcoat={0.8}
          clearcoatRoughness={0.25}
          emissive="#000000"
          emissiveIntensity={0}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <lineSegments geometry={edgeGeometry}>
        <lineBasicMaterial
          ref={edgeMatRef}
          color="#4a7a8a"
          transparent
          opacity={isDimmed ? 0.1 : 0.5}
          toneMapped={false}
        />
      </lineSegments>

      {gn.hasPopulationData && (
        <PulseMarker
          position={[gn.centroid[0], depth + 3, gn.centroid[1]]}
          color={isSelected ? "#64b5f6" : isHovered ? "#90caf9" : "#4a7a8a"}
          active={isHovered || isSelected}
          scale={Math.max(Math.sqrt(gn.areaM2) * 0.03, 6)}
        />
      )}

      {((isHovered && !isSelected) || isPinned) && (
        <Html
          position={[gn.centroid[0], depth + 25, gn.centroid[1]]}
          center
          distanceFactor={900}
          style={{ pointerEvents: "none" }}
        >
          <div className={`px-2.5 py-1.5 rounded-lg glass-panel-solid text-center whitespace-nowrap ${isPinned ? "border border-amber-400/30" : ""}`}>
            {isPinned && (
              <div className="text-[8px] uppercase tracking-widest text-amber-400 mb-0.5">Pinned</div>
            )}
            <div className={`text-[11px] font-display font-semibold leading-tight ${isPinned ? "text-amber-200" : "text-cyan-200"}`}>
              {gn.name}
            </div>
            {gn.hasPopulationData ? (
              <div className={`text-[10px] font-mono leading-tight ${isPinned ? "text-amber-400/80" : "text-cyan-400/80"}`}>
                {gn.population?.toLocaleString()} people
              </div>
            ) : (
              <div className="text-[10px] font-mono text-slate-500 leading-tight">no survey data</div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
