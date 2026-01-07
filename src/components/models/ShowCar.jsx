import React, { useState, useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useLoader, useFrame } from "@react-three/fiber";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import reflectVertex from "@/shaders/reflect.vert";
import reflectFrag from "@/shaders/reflect.frag";
import * as THREE from "three";
import { ShaderMaterial } from "three";
import gsap from "gsap";

function ShowCar(props) {
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const { nodes, materials, scene } = useGLTF("/models/showCar.glb");
  const [angle, setAngle] = props.steeringAngleControls;
  const [listenTouch, setListenTouch] = props.touchListenControls;
  const [isHandleVisible, setIsHandleVisible] = useState(false);
  const [isHandleAnimating, setIsHandleAnimating] = useState(true);
  const meshRef = useRef();
  const interactionTime = useRef(0);
  const isActive = useRef(false);

  const normalPos = useRef(new THREE.Vector3(0, 2, -0.8));
  const activePos = useRef(new THREE.Vector3(0, 2.15, -0.4));

  const normalScale = useRef(new THREE.Vector3(0.6, 0.55, 0.6));
  const activeScale = useRef(new THREE.Vector3(0.72, 0.66, 0.72));

  const steeringInitAnimStartTime = useRef(null);
  const steeringInitAnimStartPos = useRef(new THREE.Vector3(2.5, 1, 1.5));
  const steeringInitAnimWorldPos = useRef(new THREE.Vector3(0, 2, -0.8));

  const startInteraction = () => {
    interactionTime.current = performance.now();
    isActive.current = true;
  };

  const endInteraction = () => {
    isActive.current = false;
  };

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material.envMapIntensity = 4;
        child.material.roughness = 0.1;
        child.material.metalness = 0.5;
        child.material.needsUpdate = true;
      }
    });
  }, [scene]);

  useEffect(() => {
    if (!listenTouch) return;

    const updatePosition = (x, y) => {
      mouse.current.x = (x / window.innerWidth) * 2 - 1;
      mouse.current.y = -(y / window.innerHeight) * 2 + 1;
    };

    const handleMouseMove = (event) => {
      updatePosition(event.clientX, event.clientY);
      startInteraction();
    };

    const handleTouchStart = (event) => {
      if (event.touches.length > 0) {
        const t = event.touches[0];
        updatePosition(t.clientX, t.clientY);
        startInteraction();
      }
    };

    const handleTouchMove = (event) => {
      if (event.touches.length > 0) {
        const t = event.touches[0];
        updatePosition(t.clientX, t.clientY);
        startInteraction();
      }
    };

    const handleTouchEnd = () => {
      endInteraction();
    };

    const handleTouchCancel = () => {
      endInteraction();
    };

    const visibleTimeout = setTimeout(() => {
      setIsHandleVisible(true);
    }, 3000);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchcancel", handleTouchCancel);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchCancel);
      clearTimeout(visibleTimeout);
    };
  }, [listenTouch]);

  // const hdrTexture = useLoader(RGBELoader, "/hdri/showHdr2.hdr");
  // hdrTexture.mapping = THREE.EquirectangularReflectionMapping;

  // const tempMaterial = useMemo(
  //   () =>
  //     new ShaderMaterial({
  //       vertexShader: reflectVertex,
  //       fragmentShader: reflectFrag,
  //       uniforms: {
  //         envMap: { value: hdrTexture },
  //         cameraPosition: { value: new THREE.Vector3() },
  //       },
  //       side: THREE.DoubleSide,
  //       transparent: false,
  //     }),
  //   [hdrTexture]
  // );

  const tempMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#888888",
        metalness: 0,
        roughness: 1,
      }),
    []
  );

  function cubicBezier(t, p0, p1, p2, p3) {
    const u = 1 - t;
    return (
      u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
    );
  }

  useFrame(({ camera }) => {
    if (!meshRef.current) return;

    const now = performance.now();

    if (isHandleAnimating) {
      const elapsed = now - steeringInitAnimStartTime.current;

      const t = THREE.MathUtils.clamp(elapsed / 4000, 0, 1);

      // smooth easing (optional but recommended)
      const easedT = cubicBezier(t, 0.4, -0.02, 0.37, 1.05);

      const target = steeringInitAnimWorldPos.current.clone();
      target.add(
        new THREE.Vector3(
          camera.position.x,
          camera.position.z + 0.7,
          camera.position.y - 0.2
        )
      );

      meshRef.current.position.lerpVectors(
        steeringInitAnimStartPos.current,
        target,
        easedT
      );
      if (t >= 1) {
        setIsHandleAnimating(false);
      }

      return;
    }

    if (!isHandleVisible) return;

    const isLocalActive = now - interactionTime.current > 1500;

    if (isLocalActive) {
      isActive.current = false;
    }
    // if (tempMaterial) {
    //   tempMaterial.uniforms.cameraPosition.value.copy(camera.position);
    // }
    const targetPos = !isLocalActive ? activePos.current : normalPos.current;

    meshRef.current.position.lerp(targetPos, 0.08);

    const targetScale = !isLocalActive
      ? activeScale.current
      : normalScale.current;

    meshRef.current.scale.lerp(targetScale, 0.08);

    // get steering wheel position
    const steeringWorldPos = new THREE.Vector3();
    meshRef.current.getWorldPosition(steeringWorldPos);

    // Get ray from mouse
    raycaster.current.setFromCamera(mouse.current, camera);

    // Find intersection with a plane at steering depth
    const plane = new THREE.Plane(
      new THREE.Vector3(0, 0, 1),
      -steeringWorldPos.z
    );
    const mouseWorldPoint = new THREE.Vector3();
    raycaster.current.ray.intersectPlane(plane, mouseWorldPoint);

    // Get vector from steering to mouse
    const dirVector = mouseWorldPoint.clone().sub(steeringWorldPos);

    // Calculate angle in radians (optional normalize)
    const angleRad = Math.atan2(dirVector.y, dirVector.x);
    setAngle(angleRad);

    // store target values
    const currentRotationZ = meshRef.current.rotation.z;
    const targetRotationZ = Math.abs(angle) - 90 * (Math.PI / 180);

    meshRef.current.position
      .set(camera.position.x, camera.position.z + 0.7, camera.position.y - 0.2)
      .add(new THREE.Vector3(0, 2, -0.8));
    meshRef.current.rotation.set(
      70 * (Math.PI / 180),
      0,
      THREE.MathUtils.lerp(currentRotationZ, targetRotationZ, 0.1)
    );
  });

  useEffect(() => {
    if (!meshRef.current) return;
    meshRef.current.position.copy(steeringInitAnimStartPos.current); // near camera
    meshRef.current.rotation.set(70 * (Math.PI / 180), 0, 0 * (Math.PI / 180));
    meshRef.current.scale.set(0.6, 0.55, 0.6); // small

    steeringInitAnimStartTime.current = performance.now();
  }, []);

  return (
    <group dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          ref={meshRef}
          castShadow
          receiveShadow
          visible={isHandleVisible}
          geometry={nodes.Object_6.geometry}
          material={materials["07_-_Default"]}
          position={[-1.2, 3, -0.3]}
          rotation={[0, 70 * (Math.PI / 180), Math.PI / 2]}
          scale={[0.5, 0.45, 0.3]}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.backLights.geometry}
          material={materials.redlights}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.carDetail001.geometry}
          material={materials.greyplastic}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.carDetail002.geometry}
          material={materials.greyplastic}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.carDetail003.geometry}
          material={materials.greyplastic}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.carDetail004.geometry}
          material={materials.greyplastic}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.carDetail005.geometry}
          material={materials.greyplastic}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.carDetail006.geometry}
          material={materials.orangelamps}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.door001.geometry}
          material={tempMaterial}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.door002.geometry}
          material={tempMaterial}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.glass001.geometry}
          material={materials.glass}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.glass002.geometry}
          material={materials.glass}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.glass003.geometry}
          material={materials.glass}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.glass004.geometry}
          material={materials.glass}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.hornDetail.geometry}
          material={materials.frlights}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.mainBody.geometry}
          material={tempMaterial}
        />
        <group position={[0.016, -0.015, -0.011]}>
          <mesh
            castShadow
            receiveShadow
            visible={false}
            geometry={nodes.Object_17.geometry}
            material={materials.tiretread}
          />
          <mesh
            castShadow
            receiveShadow
            visible={false}
            geometry={nodes.Object_17_1.geometry}
            material={materials.carbody}
          />
          <mesh
            castShadow
            receiveShadow
            visible={false}
            geometry={nodes.Object_17_2.geometry}
            material={materials.rimstar}
          />
        </group>
        <group position={[0.016, -0.015, -0.011]}>
          <mesh
            castShadow
            receiveShadow
            visible={false}
            geometry={nodes.Object_17001.geometry}
            material={materials.tiretread}
          />
          <mesh
            castShadow
            receiveShadow
            visible={false}
            geometry={nodes.Object_17001_1.geometry}
            material={materials.carbody}
          />
          <mesh
            castShadow
            receiveShadow
            visible={false}
            geometry={nodes.Object_17001_2.geometry}
            material={materials.rimstar}
          />
        </group>
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.Object_6_1.geometry}
          material={materials.blackl}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.Object_6_2.geometry}
          material={materials.carlights}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.Object_6_3.geometry}
          material={materials.hlight}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.Object_6_4.geometry}
          material={materials.yellow}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.Object_11001.geometry}
          material={materials.hlight}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.Object_11001_1.geometry}
          material={materials.carlights}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.Object_11001_2.geometry}
          material={materials.blackl}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.Object_11001_3.geometry}
          material={materials.yellow}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.Object_7003.geometry}
          material={materials.carbody}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.Object_7003_1.geometry}
          material={materials.rimstar}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.Object_7003_2.geometry}
          material={materials.tiretread}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.Object_16001.geometry}
          material={materials.rimstar}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.Object_16001_1.geometry}
          material={materials.carbody}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={nodes.Object_16001_2.geometry}
          material={materials.tiretread}
        />
      </group>
    </group>
  );
}

export default ShowCar;

useGLTF.preload("/models/showCar.glb");
