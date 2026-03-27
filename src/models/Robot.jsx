import React, { useRef } from 'react';
import { useGLTF, Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

export default function Robot(props) {
  const group = useRef();
  
  const { scene } = useGLTF('/models/portrait-from-the-future_zerodesign.glb');

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={group} {...props} dispose={null}>
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <primitive object={scene} scale={2} position={[0, -1, 0]} />
      </Float>
    </group>
  );
}

useGLTF.preload('/models/portrait-from-the-future_zerodesign.glb');
