import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import {
  RingGeometry,
  MeshBasicMaterial,
  Color,
  DoubleSide,
  AdditiveBlending,
} from "three";

export function TunnelRings({ tunnel }) {
  const groupRef = useRef();

  const ringCount = 15; // SAME AS HTML
  const tunnelDepth = 300; // SAME AS HTML

  const rings = useMemo(() => {
    const geometry = new RingGeometry(
      tunnel.tunnelSize * 0.8,
      tunnel.tunnelSize * 1.2,
      32,
      1
    );

    return Array.from({ length: ringCount }, (_, i) => {
      const hue = (i / ringCount) * 0.8 + 0.1;

      const material = new MeshBasicMaterial({
        color: new Color().setHSL(hue, 0.7, 0.45),
        transparent: true,
        opacity: 0.25,
        side: DoubleSide,
        blending: AdditiveBlending,
        depthWrite: false,
      });

      const z = (i - ringCount / 2) * (tunnelDepth / ringCount);

      return { geometry, material, z, index: i };
    });
  }, [tunnel.tunnelSize]);

  useFrame((state, delta) => {
    const { camera, clock } = state;
    const elapsedTime = clock.getElapsedTime();

    groupRef.current.children.forEach((mesh, index) => {
      // Move ring forward
      mesh.position.z += tunnel.speed * delta;

      if (mesh.position.z > camera.position.z + 50) {
        mesh.position.z -= tunnelDepth;
      }

      // Rotation
      mesh.rotation.z += delta * (0.3 + index * 0.05);

      // Pulse scale
      const pulseScale = 1 + Math.sin(elapsedTime * 2 + index * 0.8) * 0.08;
      mesh.scale.set(pulseScale, pulseScale, 1);

      // Opacity (same math)
      const distance = Math.abs(mesh.position.z - camera.position.z);
      const baseOpacity = Math.max(0.05, 0.25 - distance / tunnelDepth);
      const glowPulse = Math.sin(elapsedTime * 3 + index * 1.2) * 0.1 + 1;

      mesh.material.opacity = baseOpacity * glowPulse;

      // 🌈 SAME color cycling
      const hue = (elapsedTime * 0.1 + index * 0.15) % 1;
      mesh.material.color.setHSL(hue, 0.7, 0.35);
    });
  });

  return (
    <group ref={groupRef}>
      {rings.map((ring, i) => (
        <mesh
          key={i}
          geometry={ring.geometry}
          material={ring.material}
          position={[0, 0, ring.z]}
        />
      ))}
    </group>
  );
}
