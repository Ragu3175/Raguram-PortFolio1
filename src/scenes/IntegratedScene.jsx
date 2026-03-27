import React from 'react';
import CyberHead from '../models/CyberHead';
import BrainScene from './BrainScene';
import { Environment, PerspectiveCamera, ContactShadows, Stars } from '@react-three/drei';

export default function IntegratedScene({ cameraRef, headRef, brainRef }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 10]} ref={cameraRef} />
      
      <gridHelper args={[100, 100, '#00f2ff', '#111']} position={[0, -2, 0]} />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.01, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#050505" roughness={0.8} />
      </mesh>
      
      <ambientLight intensity={1} />
      <pointLight position={[10, 10, 10]} intensity={20} color="#ffffff" />
      <directionalLight position={[-5, 5, 5]} intensity={5} />
      
      <group ref={headRef}>
        <CyberHead scale={2} position={[0, 0.5, 0]} />
        <ContactShadows
          position={[0, -2, 0]}
          opacity={0.6}
          scale={15}
          blur={1.5}
          far={5}
        />
      </group>

      {/* BRAIN / INNER MIND GROUP */}
      <group ref={brainRef} position={[0, 0, -20]} visible={false}>
        <BrainScene />
      </group>
      
      <Environment preset="city" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </>
  );
}
