import React, { useRef, useMemo, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, RoundedBox, Torus } from '@react-three/drei';
import * as THREE from 'three';

const CyberHead = forwardRef(({ ...props }, ref) => {
  const group = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.3) * 0.15;
      group.current.position.y = Math.cos(t * 0.8) * 0.1;
    }
  });

  return (
    <group ref={(node) => {
      group.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    }} {...props}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        
        {/* CENTER BOX (Bright/Wireframe) */}
        <mesh>
          <boxGeometry args={[1.6, 2.1, 1.1]} />
          <meshStandardMaterial 
            color="#00f2ff" 
            emissive="#00f2ff" 
            emissiveIntensity={1} 
            wireframe 
          />
        </mesh>
        
        {/* ARMOR PANELS - Using lighter gray so they are visible */}
        <group scale={1.2}>
          <RoundedBox args={[1.5, 0.8, 0.5]} radius={0.1} smoothness={4} position={[0, 0.8, 0.5]}>
            <meshStandardMaterial color="#222" metalness={1} roughness={0.3} />
          </RoundedBox>
          <RoundedBox args={[0.5, 1, 0.5]} radius={0.1} smoothness={4} position={[0.8, -0.2, 0.5]}>
            <meshStandardMaterial color="#222" metalness={1} roughness={0.3} />
          </RoundedBox>
          <RoundedBox args={[-0.5, 1, 0.5]} radius={0.1} smoothness={4} position={[-0.8, -0.2, 0.5]}>
            <meshStandardMaterial color="#222" metalness={1} roughness={0.3} />
          </RoundedBox>
          <RoundedBox args={[0.8, 0.4, 0.6]} radius={0.1} smoothness={4} position={[0, -0.9, 0.4]}>
            <meshStandardMaterial color="#222" metalness={1} roughness={0.3} />
          </RoundedBox>
        </group>

        {/* GLOWING EYES */}
        <group position={[0, 0.4, 1.1]}>
          <group position={[-0.5, 0, 0]}>
            <mesh>
              <sphereGeometry args={[0.15, 32, 32]} />
              <meshBasicMaterial color="#00f2ff" />
              <pointLight intensity={5} distance={3} color="#00f2ff" />
            </mesh>
          </group>
          <group position={[0.5, 0, 0]}>
            <mesh>
              <sphereGeometry args={[0.15, 32, 32]} />
              <meshBasicMaterial color="#00f2ff" />
              <pointLight intensity={5} distance={3} color="#00f2ff" />
            </mesh>
          </group>
        </group>

        {/* DIGITAL AURA (Larger and more visible) */}
        <mesh scale={2.5}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial
            color="#00f2ff"
            speed={2}
            distort={0.4}
            transparent
            opacity={0.1}
          />
        </mesh>
      </Float>
    </group>
  );
});

export default CyberHead;
