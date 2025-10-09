import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import * as THREE from "three";

function FloatingSphere() {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Rotate the sphere slowly
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;

      // Add floating motion
      meshRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} position={[0, 0, 0]}>
      <meshStandardMaterial
        color="#4A90E2"
        emissive="#1E40AF"
        emissiveIntensity={0.3}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
}

const Scene3D = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        background: "linear-gradient(135deg, #141E30 0%, #243B55 100%)",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4A90E2" />

        {/* 3D Objects */}
        <FloatingSphere />

        {/* Controls - rotation only, no zoom */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
};

export default Scene3D;
