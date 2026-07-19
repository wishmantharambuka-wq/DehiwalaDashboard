import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PulseMarkerProps {
  position: [number, number, number];
  color?: string;
  active?: boolean;
  scale?: number;
}

/** Radar-ping marker: a bright core dot plus one or two expanding, fading
 * rings — the glowing "point of interest" pin from the reference dashboard
 * aesthetic. `active` (hover/select) makes it bigger and adds a second ring. */
export function PulseMarker({ position, color = "#7ff5ff", active = false, scale = 1 }: PulseMarkerProps) {
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const clock = useRef(Math.random() * 10);

  const col = useMemo(() => new THREE.Color(color), [color]);

  useFrame((_, delta) => {
    clock.current += delta;
    const speed = active ? 1.3 : 0.7;
    const t1 = ((clock.current * speed) % 1.6) / 1.6;
    const t2 = (((clock.current * speed) + 0.8) % 1.6) / 1.6;

    if (ring1.current) {
      const s = 0.4 + t1 * (active ? 5.5 : 3.2);
      ring1.current.scale.setScalar(s * scale);
      (ring1.current.material as THREE.MeshBasicMaterial).opacity = (1 - t1) * (active ? 0.9 : 0.5);
    }
    if (ring2.current) {
      const s = 0.4 + t2 * (active ? 5.5 : 3.2);
      ring2.current.scale.setScalar(s * scale);
      (ring2.current.material as THREE.MeshBasicMaterial).opacity = active ? (1 - t2) * 0.7 : 0;
    }
    if (core.current) {
      const pulse = 0.75 + Math.sin(clock.current * 4) * 0.25;
      core.current.scale.setScalar((active ? 1.6 : 1) * pulse * scale);
    }
  });

  return (
    <group position={position}>
      <mesh ref={core}>
        <sphereGeometry args={[1.4, 12, 12]} />
        <meshBasicMaterial color={col} toneMapped={false} />
      </mesh>
      <mesh ref={ring1} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.72, 1, 32]} />
        <meshBasicMaterial
          color={col}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={ring2} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.72, 1, 32]} />
        <meshBasicMaterial
          color={col}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
