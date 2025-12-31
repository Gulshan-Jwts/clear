import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { Points, BufferGeometry, ShaderMaterial, Color } from "three";
import vertexShader from "../../shaders/vertex.glsl?raw";
import fragmentShader from "../../shaders/fragment.glsl?raw";

export function Stars({ tunnel, rotate }) {
  const pointsRef = useRef();
  const materialRef = useRef();

  const { size, camera } = useThree();

  const starColors = useMemo(
    () => [
      new THREE.Color(0xff6b6b), // coral
      new THREE.Color(0x4ecdc4), // turquoise
      new THREE.Color(0x45b7d1), // sky blue
      new THREE.Color(0x96ceb4), // mint
      new THREE.Color(0xffeaa7), // warm yellow
      new THREE.Color(0xdda0dd), // plum
    ],
    []
  );

  useEffect(() => {
    if (!materialRef.current) return;

    materialRef.current.uniforms.uViewportHeight.value =
      size.height * window.devicePixelRatio;
  }, [size.height]);

  useEffect(() => {
    camera.rotation.y = 450 * (Math.PI / 180);
    camera.rotation.z = 350 * (Math.PI / 180);
    camera.rotation.x = 50 * (Math.PI / 180);

    gsap.to(camera.rotation, {
      x: 0,
      y: 0,
      z: 0,
      duration: 5,
      delay: 1,
      ease: "power3.out",
    });
  }, []);

  const { positions, colors, sizes, shapes } = useMemo(() => {
    const starCount = tunnel.starCount;
    const tunnelSize = tunnel.tunnelSize;
    const tunnelDepth = 300;

    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const shapes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;

      // Create cylindrical tunnel distribution
      const radius = (Math.random() * 0.7 + 0.3) * tunnelSize;
      const angle = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * tunnelDepth * 2;

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = Math.sin(angle) * radius;
      positions[i3 + 2] = z;

      // Assign random vibrant colors
      const colorIndex = Math.floor(Math.random() * starColors.length);
      const selectedColor = starColors[colorIndex];

      const hueShift = (Math.random() - 0.5) * 0.1;
      const saturation = 0.8 + Math.random() * 0.2;
      const lightness = 0.5 + Math.random() * 0.3;

      const finalColor = new Color().copy(selectedColor);
      finalColor.offsetHSL(hueShift, saturation - 0.8, lightness - 0.65);

      colors[i3] = finalColor.r;
      colors[i3 + 1] = finalColor.g;
      colors[i3 + 2] = finalColor.b;

      const random = Math.random();
      sizes[i] = random * 6.95 + 1;

      // Assign shape type
      if (tunnel.shapeMode === 3) {
        shapes[i] = Math.floor(Math.random() * 3); // mixed
      } else {
        shapes[i] = tunnel.shapeMode;
      }
    }

    return { positions, colors, sizes, shapes };
  }, [tunnel.starCount, tunnel.tunnelSize, tunnel.shapeMode, starColors]);

  useFrame((state, delta) => {
    const elapsedTime = state.clock.getElapsedTime();
    const camera = state.camera;

    if (pointsRef.current && pointsRef.current.geometry) {
      const positionArray =
        pointsRef.current.geometry.attributes.position.array;
      const colorArray = pointsRef.current.geometry.attributes.color.array;

      const breathing = Math.sin(elapsedTime * 1.5) * 0.15 + 1.0;

      for (let i = 0; i < tunnel.starCount; i++) {
        const i3 = i * 3;

        // Move stars towards camera
        const speedVariation = 1 + Math.sin(elapsedTime + i * 0.01) * 0.2;
        positionArray[i3 + 2] += tunnel.speed * delta * speedVariation;

        // Reset star position when it passes camera
        if (positionArray[i3 + 2] > camera.position.z + 10) {
          positionArray[i3 + 2] -= 600; // tunnelDepth * 2

          // Randomize position slightly
          const radius = (Math.random() * 0.7 + 0.3) * tunnel.tunnelSize;
          const angle = Math.random() * Math.PI * 2;

          positionArray[i3] = Math.cos(angle) * radius;
          positionArray[i3 + 1] = Math.sin(angle) * radius;

          // Reassign random color
          const colorIndex = Math.floor(Math.random() * starColors.length);
          const selectedColor = starColors[colorIndex];
          const hueShift = (Math.random() - 0.7) * 0.1;
          const saturation = 0.8;
          const lightness = 0.6;

          const finalColor = new Color().copy(selectedColor);
          finalColor.offsetHSL(hueShift, saturation - 0.8, lightness - 0.65);

          colorArray[i3] = finalColor.r;
          colorArray[i3 + 1] = finalColor.g;
          colorArray[i3 + 2] = finalColor.b;
        }
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.geometry.attributes.color.needsUpdate = true;

      // Apply breathing effect
      pointsRef.current.scale.setScalar(breathing);
      pointsRef.current.rotation.z += delta * 0.1;
    }

    // Update shader uniforms
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = elapsedTime;
    }
    // Rotaion based on steering wheel
    const currentZ = pointsRef.current.rotation.z;
    const targetZ = Math.abs(rotate);
    pointsRef.current.rotation.z = THREE.MathUtils.lerp(
      currentZ,
      targetZ,
      0.01
    );
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          itemSize={3}
          count={positions.length / 3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colors}
          itemSize={3}
          count={colors.length / 3}
        />
        <bufferAttribute
          attach="attributes-size"
          array={sizes}
          itemSize={1}
          count={sizes.length}
        />
        <bufferAttribute
          attach="attributes-shape"
          array={shapes}
          itemSize={1}
          count={shapes.length}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ time: { value: 0.0 }, uViewportHeight: { value: 1 } }}
        transparent
        depthWrite={false}
        vertexColors
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
