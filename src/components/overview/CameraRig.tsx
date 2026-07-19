import { useEffect, useRef, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

interface CameraRigProps {
  target: [number, number, number];
  distance: number;
  polarAngle?: number;
  azimuthAngle?: number;
  autoRotate?: boolean;
}

export function CameraRig({ target, distance, polarAngle = 0.62, azimuthAngle = Math.PI / 4.4, autoRotate = false }: CameraRigProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const animating = useRef(false);
  const animTime = useRef(0);
  const prevTarget = useRef<[number, number, number]>(target);
  const prevDistance = useRef(distance);
  const desiredTarget = useRef(new THREE.Vector3(...target));
  const desiredPos = useRef(new THREE.Vector3());
  const initialized = useRef(false);
  const firstFrameDone = useRef(false);

  const stopAnimation = useCallback(() => {
    animating.current = false;
  }, []);

  useEffect(() => {
    const targetChanged =
      prevTarget.current[0] !== target[0] ||
      prevTarget.current[1] !== target[1] ||
      prevTarget.current[2] !== target[2];
    const distChanged = Math.abs(prevDistance.current - distance) > 1;
    if (targetChanged || distChanged || !initialized.current) {
      animating.current = true;
      animTime.current = 0;
      prevTarget.current = target;
      prevDistance.current = distance;
      initialized.current = true;
    }
  }, [target, distance, polarAngle, azimuthAngle]);

  useFrame((_, delta) => {
    if (!animating.current) return;

    animTime.current += delta;

    desiredTarget.current.set(target[0], target[1], target[2]);

    const offsetX = distance * Math.sin(polarAngle) * Math.sin(azimuthAngle);
    const offsetZ = distance * Math.sin(polarAngle) * Math.cos(azimuthAngle);
    const offsetY = distance * Math.cos(polarAngle);
    desiredPos.current.set(target[0] + offsetX, target[1] + offsetY, target[2] + offsetZ);

    if (!firstFrameDone.current) {
      const introDistance = distance * 3.5;
      const introPolar = 0.2;
      const introAzimuth = azimuthAngle - 0.6;
      camera.position.set(
        target[0] + introDistance * Math.sin(introPolar) * Math.sin(introAzimuth),
        target[1] + introDistance * Math.cos(introPolar),
        target[2] + introDistance * Math.sin(introPolar) * Math.cos(introAzimuth),
      );
      if (controlsRef.current) {
        controlsRef.current.target.set(target[0], target[1] + 300, target[2]);
        controlsRef.current.update();
      }
      firstFrameDone.current = true;
      return;
    }

    const smoothness = 2.0;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, desiredPos.current.x, smoothness, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, desiredPos.current.y, smoothness, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, desiredPos.current.z, smoothness, delta);

    if (controlsRef.current) {
      const c = controlsRef.current.target;
      c.x = THREE.MathUtils.damp(c.x, desiredTarget.current.x, smoothness, delta);
      c.y = THREE.MathUtils.damp(c.y, desiredTarget.current.y, smoothness, delta);
      c.z = THREE.MathUtils.damp(c.z, desiredTarget.current.z, smoothness, delta);
      controlsRef.current.update();
    }

    const posDist = camera.position.distanceTo(desiredPos.current);
    if (posDist < 10 || animTime.current > 3) {
      animating.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      onStart={stopAnimation}
      enablePan
      panSpeed={0.5}
      minDistance={180}
      maxDistance={4000}
      minPolarAngle={0.15}
      maxPolarAngle={1.35}
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.5}
      zoomSpeed={0.7}
      autoRotate={autoRotate}
      autoRotateSpeed={1.2}
    />
  );
}
