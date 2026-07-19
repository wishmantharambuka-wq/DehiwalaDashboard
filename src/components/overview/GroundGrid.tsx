import { useMemo } from "react";
import { Grid, MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";

interface GroundGridProps {
  size: number;
  center: [number, number];
}

/** Radial glow halo texture — bright cyan core fading to transparent, laid
 * flat under the city to read as the "energy field" the terrain sits in. */
function useHaloTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, "rgba(127, 245, 255, 0.55)");
    gradient.addColorStop(0.35, "rgba(77, 216, 230, 0.28)");
    gradient.addColorStop(0.7, "rgba(31, 90, 107, 0.08)");
    gradient.addColorStop(1, "rgba(5, 11, 20, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

export function GroundGrid({ size, center }: GroundGridProps) {
  const halo = useHaloTexture();

  return (
    <group position={[center[0], -2, center[1]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, 0]}>
        <planeGeometry args={[size * 1.5, size * 1.5]} />
        <meshBasicMaterial
          map={halo}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <Grid
        args={[size * 1.6, size * 1.6]}
        cellSize={60}
        cellThickness={0.6}
        cellColor="#123244"
        sectionSize={300}
        sectionThickness={1.1}
        sectionColor="#1f5a6b"
        fadeDistance={size * 2.2}
        fadeStrength={1.4}
        infiniteGrid={false}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
        <planeGeometry args={[size * 1.6, size * 1.6]} />
        <MeshReflectorMaterial
          blur={[300, 80]}
          resolution={1024}
          mixBlur={1}
          mixStrength={25}
          roughness={0.9}
          depthScale={1}
          minDepthThreshold={0.85}
          color="#040a12"
          metalness={0.4}
          mirror={0.35}
        />
      </mesh>
    </group>
  );
}
