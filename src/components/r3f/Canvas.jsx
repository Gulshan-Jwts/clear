import { Canvas as R3FCanvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import { Tunnel } from "./Tunnel";
import { Environment, OrbitControls } from "@react-three/drei";
import ShowCar from "../models/ShowCar";
import * as THREE from "three";

export function Canvas({ tunnel }) {
  const [steeringAngle, setSteeringAngle] = useState(0);
  const [view, setView] = useState(0);

  return (
    <R3FCanvas
      camera={{ position: [0, 0, 0], fov: 85 }}
      gl={{
        antialias: tunnel.settings.antialiasing,
        powerPreference: "high-performance",
        toneMapping: THREE.NoToneMapping,
        outputColorSpace: THREE.LinearSRGBColorSpace,
        toneMappingExposure: 8.8,
      }}
      style={{ background: "#08031aff" }}
      dpr={Math.min(window.devicePixelRatio, 2)}
    >
      <Suspense fallback={null}>
        <Tunnel tunnel={tunnel} rotation={steeringAngle} />
      </Suspense>

      <ambientLight intensity={1.7} />

      <directionalLight
        intensity={4}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <spotLight angle={0.3} intensity={1.5} penumbra={0.5} castShadow />

      {/* <Suspense fallback={null}>
        <Environment
          files="/hdri/space.hdr"
          background
          intensity={0}
          backgroundIntensity={0}
          backgroundBlurriness={0.0}
        />
      </Suspense> */}

      <Suspense fallback={null}>
        <ShowCar
          position={[0, 0, 0]}
          steeringAngleControls={[steeringAngle, setSteeringAngle]}
        />
      </Suspense>
      {/* <OrbitControls  /> */}
    </R3FCanvas>
  );
}
