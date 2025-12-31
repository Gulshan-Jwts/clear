import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector2 } from "three";
import { Stars } from "./Stars";
import { TunnelRings } from "./TunnelRings";
import * as Three from "three";

export function Tunnel({ tunnel, rotation }) {
  const groupRef = useRef();
  const mouse = useRef(new Vector2());
  const scrollY = useRef(0);
  const { scene } = useThree(); // yeh aapka Canvas ka scene hai

  useEffect(() => {
    // DataTexture ya solid color assign kar sakte ho
    const size = 256;
    const data = new Uint8Array(size * 3);
    for (let i = 0; i < size; i++) {
      const t = i / (size - 1);
      data[i * 3] = t * 255; // R
      data[i * 3 + 1] = (1 - t) * 255; // G
      data[i * 3 + 2] = 128; // B
    }

    const texture = new Three.DataTexture(data, size, 1, Three.RGBFormat);
    texture.needsUpdate = true;

    scene.background = texture;
  }, [scene]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleTouchMove = (event) => {
      if (event.touches.length > 0) {
        mouse.current.x =
          (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.current.y =
          -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    };

    const handleScroll = () => {
      scrollY.current = window.scrollY;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useFrame((state, delta) => {
    const { camera } = state;
    const elapsedTime = state.clock.getElapsedTime();

    // Smooth camera movement with mouse
    const targetRotY = mouse.current.x * 0.5;
    const targetRotX = mouse.current.y * 0.3;

    camera.rotation.y += (targetRotY - camera.rotation.y) * delta * 2;
    camera.rotation.x += (targetRotX - camera.rotation.x) * delta * 2;

    // Add subtle camera oscillation
    camera.position.x = Math.sin(elapsedTime * 0.5) * 2;
    camera.position.y = Math.cos(elapsedTime * 0.3) * 1.5;

    // Update scroll effect
    if (groupRef.current) {
      groupRef.current.position.z = -scrollY.current * 0.5;
      groupRef.current.position.y = scrollY.current * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <Stars tunnel={tunnel} rotate={rotation} />
      <TunnelRings tunnel={tunnel} />
    </group>
  );
}
