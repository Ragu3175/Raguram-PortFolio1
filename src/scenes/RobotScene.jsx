import React from 'react';
import CyberHead from '../models/CyberHead';
import { Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei';

export default function RobotScene({ cameraRef, headRef }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} ref={cameraRef} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
      <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
      
      <CyberHead ref={headRef} position={[0, 0, 0]} scale={1.5} />
      
      <ContactShadows
        position={[0, -2, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
        far={4.5}
      />
      
      <Environment preset="night" />
    </>
  );
}
