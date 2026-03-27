import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Stars, Float, Text, Points, PointMaterial, Line, Sphere, MeshDistortMaterial } from '@react-three/drei';

const NeuralHub = ({ position, label, color = "#00f2ff" }) => {
  const meshRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.distort = 0.4 + Math.sin(t) * 0.2;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          transmission={0.5}
          thickness={1}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>
      {/* Halo Sphere */}
      <mesh scale={1.3}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshPhysicalMaterial transparent opacity={0.1} color={color} />
      </mesh>
      <pointLight intensity={5} color={color} distance={10} />
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.4}
        color="#fff"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};

const pulseShader = {
  uniforms: {
    color: { value: new THREE.Color("#00f2ff") },
    time: { value: 0 },
  },
  vertexShader: `
    varying float vProgress;
    varying vec3 vPosition;
    void main() {
      vProgress = (position.y + 10.0) / 20.0; // Rough approximation for dash
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 color;
    uniform float time;
    varying float vProgress;
    varying vec3 vPosition;
    void main() {
      float distanceToStart = length(vPosition);
      float dash = sin(distanceToStart * 2.0 - time * 5.0);
      if (dash < 0.0) discard;
      gl_FragColor = vec4(color, 1.0);
    }
  `
};

const PulsingLine = ({ start, end, color = "#00f2ff" }) => {
  const materialRef = useRef();
  const path = useMemo(() => new THREE.CatmullRomCurve3([
      new THREE.Vector3(...start),
      new THREE.Vector3(...end)
  ]), [start, end]);
  
  useFrame((state) => {
    if (materialRef.current) {
        materialRef.current.uniforms.time.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh>
      <tubeGeometry args={[path, 64, 0.02, 8, false]} />
      <shaderMaterial 
        ref={materialRef}
        args={[pulseShader]}
        transparent
        uniforms-color-value={new THREE.Color(color)}
      />
    </mesh>
  );
};

export default function BrainScene() {
  const groupRef = useRef();
  const hubs = useMemo(() => [
    { pos: [-3, 2, -10], label: "React.js", color: "#00f2ff" },
    { pos: [4, -1, -20], label: "Node.js", color: "#ff00ff" },
    { pos: [-2, -3, -30], label: "MongoDB", color: "#00ff00" },
    { pos: [0, 0, -45], label: "Full Stack", color: "#00f2ff" }
  ], []);

  const connections = useMemo(() => {
    const lines = [];
    for (let i = 0; i < hubs.length - 1; i++) {
        lines.push({ start: hubs[i].pos, end: hubs[i+1].pos, color: hubs[i].color });
    }
    hubs.forEach((h, i) => {
        if (h.label !== "Core") {
            lines.push({ start: h.pos, end: hubs[hubs.length - 1].pos, color: h.color });
        }
    });
    return lines;
  }, [hubs]);

  const backgroundParticles = useMemo(() => {
    const pos = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y += 0.001;
  });

  return (
    <group ref={groupRef}>
      <color attach="background" args={['#020015']} />
      <ambientLight intensity={1} />
      <pointLight position={[0, 0, -20]} intensity={10} color="#00f2ff" distance={100} />
      
      {/* Skull Wall */}
      <mesh scale={7}>
          <icosahedronGeometry args={[8, 1]} />
          <meshStandardMaterial wireframe color="#0a0a3a" transparent opacity={0.4} metalness={1} roughness={0} />
      </mesh>

      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      
      <Points positions={backgroundParticles} stride={3}>
        <PointMaterial 
          transparent 
          color="#00f2ff" 
          size={0.06} 
          sizeAttenuation 
          depthWrite={false} 
          blending={THREE.AdditiveBlending} 
          opacity={0.3} 
        />
      </Points>

      {hubs.map((hub, i) => (
        <NeuralHub key={i} position={hub.pos} label={hub.label} color={hub.color} />
      ))}

      {connections.map((conn, i) => (
          <PulsingLine key={i} start={conn.start} end={conn.end} color={conn.color} />
      ))}

      <fogExp2 attach="fog" args={['#020015', 0.02]} />
    </group>
  );
}
