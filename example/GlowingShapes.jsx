import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Sparkles, Billboard, MeshTransmissionMaterial } from '@react-three/drei';
import { LayerMaterial, Depth } from 'lamina';

const Shape = ({
  type,
  size = 0.3,
  amount = 50,
  color = 'white',
  emissive,
  glow,
  resolution = 128,
  samples = 16,
  thickness = 1,
  envMapIntensity = 1,
  transmission = 1,
  rotationSpeed = 0.01,
  ...props
}) => {
  const shapeRef = useRef();

  useFrame(() => {
    if (shapeRef.current) {
      shapeRef.current.rotation.y += rotationSpeed;
      shapeRef.current.rotation.x += rotationSpeed*0.5;

    }
  });

  let geometry;
  switch (type) {
    case 'sphere':
      geometry = <sphereGeometry args={[size, 64, 64]} />;
      break;
    case 'cube':
      geometry = <boxGeometry args={[size, size, size]} />;
      break;
    case 'tetrahedron':
      geometry = <tetrahedronGeometry args={[size, 0]} />;
      break;
    default:
      geometry = <sphereGeometry args={[size, 64, 64]} />;
  }

  return (
    <mesh ref={shapeRef} {...props}>
      {geometry}
      <MeshTransmissionMaterial
        roughness={0.5}
        color={color}
        emissive={emissive || color}
        envMapIntensity={envMapIntensity}
        thickness={thickness}
        transmission={transmission}
        metalness={0.1}
        resolution={resolution}
        samples={samples}
      />
      <Glow scale={size * 1.2} near={-25} color={glow || emissive || color} />
      <Sparkles count={amount} scale={size * 2} size={6} speed={0.01} />
    </mesh>
  );
};

const Glow = ({ color, scale = 0.3, near = -2, far = 2 }) => (
  <Billboard>
    <mesh>
      <circleGeometry args={[2 * scale, 16]} />
      <LayerMaterial
        transparent
        depthWrite={false}
        blending={THREE.CustomBlending}
        blendEquation={THREE.AddEquation}
        blendSrc={THREE.SrcAlphaFactor}
        blendDst={THREE.DstAlphaFactor}>
        <Depth colorA={color} colorB="black" alpha={1} mode="normal" near={near * scale} far={far * scale} origin={[1, 1, 1]} />
        <Depth colorA={color} colorB="black" alpha={0.5} mode="normal" near={-40 * scale} far={far * .2 * scale} origin={[0, 0, 0]} />
        <Depth colorA={color} colorB="black" alpha={1} mode="add" near={-15 * scale} far={far * 0.1 * scale} origin={[0, 0, 0]} />
        <Depth colorA={color} colorB="black" alpha={1} mode="add" near={-10 * scale} far={far * 0.4 * scale} origin={[0, 0, 0]} />
      </LayerMaterial>
    </mesh>
  </Billboard>
);

export const GlowingShapes = ({ shapes }) => {
  return (
    <>
      {shapes.map((shape, index) => (
        <Shape key={index} {...shape} />
      ))}
    </>
  );
};
