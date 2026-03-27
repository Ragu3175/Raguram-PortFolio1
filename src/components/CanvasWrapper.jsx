import React from 'react';
import { Canvas } from '@react-three/fiber';

export default function CanvasWrapper({ children }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </Canvas>
  );
}
