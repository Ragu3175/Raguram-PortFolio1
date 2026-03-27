import React, { Suspense, useEffect, useRef, forwardRef, useMemo } from 'react';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, RoundedBox, Stars, Text, Environment, PerspectiveCamera, Points, PointMaterial, Line } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import BrainScene from './scenes/BrainScene';

gsap.registerPlugin(ScrollTrigger);
RectAreaLightUniformsLib.init();

// Extend for R3F
extend({ EffectComposer, RenderPass, UnrealBloomPass });

// Procedural Brushed Metal Texture
const useBrushedMetalTexture = () => {
  return useMemo(() => {
    const size = 128;
    const data = new Uint8Array(size * size * 4);
    for (let i = 0; i < size * size; i++) {
        const stride = i * 4;
        const v = 128 + Math.random() * 64;
        data[stride] = v;
        data[stride + 1] = v;
        data[stride + 2] = v;
        data[stride + 3] = 255;
    }
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.needsUpdate = true;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }, []);
};

// 1. SOPHISTICATED HUMAN-LIKE ANDROID
const AndroidFace = forwardRef(({ ...props }, ref) => {
  const group = useRef();
  const eyeRef = useRef();
  const cheekLRef = useRef();
  const cheekRRef = useRef();
  const metalTexture = useBrushedMetalTexture();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.2) * 0.1;
      group.current.position.y = Math.cos(t * 0.5) * 0.05 + 0.5;
    }
    if (eyeRef.current) eyeRef.current.rotation.y = Math.sin(t * 2) * 0.1;

    // Pulsing cheek LEDs
    const pulse = (Math.sin(t * 4) + 1) / 2;
    if (cheekLRef.current) cheekLRef.current.material.emissiveIntensity = 2 + pulse * 3;
    if (cheekRRef.current) cheekRRef.current.material.emissiveIntensity = 2 + pulse * 3;
  });

  return (
    <group ref={(node) => {
      group.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    }} {...props}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
        
        {/* SKULL STRUCTURE - Polished Obsidian/Chrome */}
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.9, 64, 64]} />
          <meshPhysicalMaterial 
            color="#1a1a1f" 
            metalness={0.9} 
            roughness={0.1} 
            normalMap={metalTexture}
            normalScale={new THREE.Vector2(0.2, 0.2)}
            emissive="#001a33"
            emissiveIntensity={0.5}
            envMapIntensity={1}
          />
        </mesh>

        {/* GLASS FACE MASK */}
        <mesh position={[0, 0.2, 0.45]} scale={[0.95, 1.1, 0.8]}>
          <sphereGeometry args={[1, 64, 64, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
          <meshPhysicalMaterial 
            color="#00f2ff" 
            transmission={0.95} 
            thickness={2} 
            roughness={0} 
            ior={1.5}
            clearcoat={1}
            transparent 
            opacity={0.1} 
          />
        </mesh>

        {/* FOREHEAD HUD SCAN LINES */}
        <group position={[0, 0.7, 0.9]}>
          {[0.08, 0.04, 0, -0.04, -0.08, -0.12].map((y, i) => (
            <rectAreaLight
              key={i}
              width={0.4}
              height={0.03}
              color="#00f5ff"
              intensity={10}
              position={[0, y, 0]}
            />
          ))}
        </group>

        {/* EYES / OPTIC SENSORS */}
        <group ref={eyeRef} position={[0, 0.4, 0.85]}>
          {[-0.4, 0.4].map((x, i) => (
            <group key={i} position={[x, 0, 0]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.2, 0.15, 0.1, 32]} />
                <meshStandardMaterial color="#111" metalness={1} />
              </mesh>
              <mesh>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshPhysicalMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={15} />
                <pointLight intensity={10} distance={2} color="#00f5ff" />
              </mesh>
              <mesh scale={1.4}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshPhysicalMaterial transparent opacity={0.08} color="#00f5ff" />
              </mesh>
            </group>
          ))}
        </group>

        {/* CHEEK LEDs */}
        <mesh ref={cheekLRef} position={[-0.6, -0.1, 0.8]} rotation={[0, -0.4, 0]}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={10} />
        </mesh>
        <mesh ref={cheekRRef} position={[0.6, -0.1, 0.8]} rotation={[0, 0.4, 0]}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={10} />
        </mesh>

        {/* NECK / BODY BASE */}
        <group position={[0, -0.7, 0.1]}>
          <mesh rotation={[-0.1, 0, 0]}>
            <cylinderGeometry args={[0.4, 0.5, 0.6, 32]} />
            <meshPhysicalMaterial color="#111118" metalness={0.9} roughness={0.15} />
          </mesh>
          {/* Neck Rings */}
          {[0.2, 0.1, 0, -0.1].map((y, i) => (
             <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
               <torusGeometry args={[0.45, 0.01, 16, 50]} />
               <meshPhysicalMaterial color="#1a1a2e" metalness={1} />
             </mesh>
          ))}
        </group>

        <OrbitalRing position={[0, -0.2, 0]} rotation={[Math.PI / 2, -0.1, 0]} scale={1.4} />
      </Float>
      <EnergyDischarge count={300} />
    </group>
  );
});

const OrbitalRing = (props) => {
  const ringRef = useRef();
  const orbRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ringRef.current) ringRef.current.rotation.z += 0.005;
    if (orbRef.current) {
        orbRef.current.position.x = Math.cos(t * 1.5) * 1.6;
        orbRef.current.position.y = Math.sin(t * 1.5) * 1.6;
    }
  });

  return (
    <group {...props}>
      {/* Outer Ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.6, 0.02, 16, 100]} />
        <meshPhysicalMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={0.8} metalness={0.6} roughness={0.1} />
      </mesh>
      {/* Inner Ring */}
      <mesh scale={0.95}>
        <torusGeometry args={[1.6, 0.01, 16, 100]} />
        <meshPhysicalMaterial color="#00f5ff" transparent opacity={0.3} />
      </mesh>
      {/* Traveling Orb */}
      <mesh ref={orbRef}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color="#00f5ff" />
      </mesh>
    </group>
  );
};

const EnergyDischarge = ({ count }) => {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 1.5 + Math.random() * 1.5;
      p[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      p[i * 3 + 2] = r * Math.cos(phi);
    }
    return p;
  }, [count]);

  const ref = useRef();
  useFrame(() => { if (ref.current) ref.current.rotation.y += 0.002; });

  return (
    <Points ref={ref} positions={points}>
      <PointMaterial transparent color="#00f5ff" size={0.015} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.4} />
    </Points>
  );
};

const LightWall = () => (
  <group position={[0, 5, -15]}>
    {Array.from({ length: 15 }).map((_, i) => (
      <group key={i} position={[(i % 5 - 2) * 8, Math.floor(i / 5 - 1) * 8, 0]}>
         <mesh>
           <planeGeometry args={[6, 6]} />
           <meshStandardMaterial 
             color="#00f2ff" 
             emissive="#00f2ff" 
             emissiveIntensity={0.1} 
             transparent 
             opacity={0.05} 
           />
         </mesh>
      </group>
    ))}
  </group>
);

const DistortedGrid = () => {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.distort = 0.3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[50, 50, 50, 50]} />
      <MeshDistortMaterial
        color="#00f2ff"
        speed={2}
        distort={0.3}
        wireframe
        transparent
        opacity={0.15}
        ref={meshRef}
      />
    </mesh>
  );
};

const DataStream = () => {
  const particles = useMemo(() => {
    const pos = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return pos;
  }, []);

  const ref = useRef();
  useFrame(() => {
    if (ref.current) {
      ref.current.position.y -= 0.05;
      if (ref.current.position.y < -20) ref.current.position.y = 20;
    }
  });

  return (
    <Points ref={ref} positions={particles}>
      <PointMaterial transparent color="#00f2ff" size={0.05} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.2} />
    </Points>
  );
};

const ScanLines = () => (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 10, background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }} />
);

function PostProcessing() {
  const { gl, scene, camera, size } = useThree();
  const composer = useMemo(() => {
    const composer = new EffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.8, 0.4, 0.2);
    composer.addPass(bloomPass);
    return composer;
  }, [gl, scene, camera, size]);

  useFrame(() => composer.render(), 1);
  return null;
}

function Scene({ cameraRef, headRef, brainRef, overlayRef, scrollRef }) {
  useEffect(() => {
    if (!cameraRef.current || !headRef.current || !brainRef.current) return;
    
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      });

      tl.set(brainRef.current, { visible: false });
      
      // Zoom into head - PORTRAIT FRAMING (z: 5)
      tl.to(cameraRef.current.position, { z: 5, y: 0.5, x: 0, duration: 4 });
      
      // Transition overlay
      tl.to(overlayRef.current, { opacity: 1, backgroundColor: '#00f2ff', duration: 1 }, 3.5);
      
      // Switch scenes
      tl.set(headRef.current, { visible: false }, 4);
      tl.set(brainRef.current, { visible: true }, 4);
      tl.to(cameraRef.current.position, { x: 0, y: 0, z: 10, duration: 0 }, 4);
      tl.to(overlayRef.current, { opacity: 0, duration: 1 }, 4.5);
      
      // JOURNEY THROUGH BRAIN
      tl.to(cameraRef.current.position, { x: -3, y: 2, z: -5, duration: 4 }, 5);
      tl.to(cameraRef.current.position, { x: 4, y: -1, z: -15, duration: 4 }, 9);
      tl.to(cameraRef.current.position, { x: -2, y: -3, z: -25, duration: 4 }, 13);
      tl.to(cameraRef.current.position, { x: 0, y: 0, z: -40, duration: 4 }, 17);
    }, scrollRef);

    return () => ctx.revert();
  }, [cameraRef, headRef, brainRef, overlayRef, scrollRef]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 15]} ref={cameraRef} />
      <ambientLight intensity={1.5} />
      <fogExp2 attach="fog" args={['#000510', 0.015]} />
      
      {/* TRIPLE RECTAREA LIGHT SETUP - Dramatic Boost */}
      <rectAreaLight width={30} height={30} color="#0033ff" intensity={50} position={[-10, 5, 2]} rotation={[0, Math.PI / 4, 0]} />
      <rectAreaLight width={30} height={30} color="#00f5ff" intensity={30} position={[10, 5, 2]} rotation={[0, -Math.PI / 4, 0]} />
      <rectAreaLight width={50} height={50} color="#ffffff" intensity={10} position={[0, 20, 0]} rotation={[Math.PI / 2, 0, 0]} />

      {/* GOD-RAY SPOTLIGHTS - Intense Beams */}
      <spotLight position={[-15, 20, 10]} target-position={[-2, 0, 0]} angle={0.4} penumbra={0.3} intensity={500} color="#00f5ff" />
      <spotLight position={[15, 20, 10]} target-position={[2, 0, 0]} angle={0.4} penumbra={0.3} intensity={500} color="#00f5ff" />

      <group ref={headRef}>
        <AndroidFace scale={2} />
      </group>

      {/* FLOOR GRID WITH GLOW BASE */}
      <group position={[0, -2, 0]}>
        <DistortedGrid />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
           <planeGeometry args={[100, 100]} />
           <meshBasicMaterial color="#000a12" transparent opacity={0.6} />
        </mesh>
      </group>
      
      <group ref={brainRef} visible={false}>
          <BrainScene />
      </group>
      
      <Environment preset="night" />
      <PostProcessing />
    </>
  );
}

// 3. MAIN APP
export default function App() {
  const scrollRef = useRef(null);
  const overlayRef = useRef(null);
  const cameraRef = useRef(null);
  const headRef = useRef(null);
  const brainRef = useRef(null);

  return (
    <div className="main-wrapper" ref={scrollRef}>
      <ScanLines />
      <div className="canvas-container" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1 }}>
        <Canvas shadows>
          <Suspense fallback={null}>
            <Scene cameraRef={cameraRef} headRef={headRef} brainRef={brainRef} overlayRef={overlayRef} scrollRef={scrollRef} />
          </Suspense>
        </Canvas>
      </div>

      <div className="transition-overlay" ref={overlayRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', background: 'transparent', zIndex: 9999, opacity: 0 }} />

      <div className="scroll-container" style={{ position: 'relative', height: '1200vh', width: '100%', pointerEvents: 'auto', zIndex: 2 }}>
        <section className="section s1" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
          <div className="hero-text" style={{ textAlign: 'center' }}>
            <p style={{ color: '#00f2ff', letterSpacing: '0.5rem', fontSize: '1rem', fontWeight: 'bold' }}>FULL STACK DEVELOPER</p>
            <h1 style={{ fontSize: '7rem', color: '#fff', margin: 0, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.9 }}>BUILD.</h1>
            <h1 style={{ fontSize: '7rem', color: '#fff', margin: 0, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.9 }}>SHIP.</h1>
            <h1 style={{ fontSize: '7rem', color: '#00f2ff', margin: 0, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.9 }}>REPEAT.</h1>
            <p style={{ color: '#aaa', fontSize: '1.2rem', marginTop: '1rem' }}>MERN · Three.js · React Native · AI/ML</p>
          </div>
        </section>

        <section className="section s2" style={{ height: '200vh' }}></section>

        {/* Projects Sections */}
        <section className="section" style={{ minHeight: '100vh', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', padding: '5rem 2rem' }}>
          <div style={{ width: '100%', maxWidth: '1200px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            {/* Project 1 */}
            <div className="portfolio-card" style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0, 242, 255, 0.1)', padding: '2rem', borderRadius: '1rem', color: '#fff', transition: 'transform 0.3s' }}>
              <span style={{ color: '#00f2ff', fontSize: '0.8rem', fontWeight: 'bold' }}>MERN · AWS · Docker · Socket.IO</span>
              <h3 style={{ fontSize: '1.8rem', margin: '0.5rem 0' }}>SafeDrive AI</h3>
              <p style={{ color: '#ccc', marginBottom: '1.5rem' }}>IoT fleet monitoring with real-time alerts</p>
              <a href="https://final-year-project-three-red.vercel.app" target="_blank" rel="noreferrer" style={{ color: '#00f2ff', textDecoration: 'none', fontWeight: 'bold' }}>VIEW PROJECT →</a>
            </div>

            {/* Project 2 */}
            <div className="portfolio-card" style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0, 242, 255, 0.1)', padding: '2rem', borderRadius: '1rem', color: '#fff', transition: 'transform 0.3s' }}>
              <span style={{ color: '#00f2ff', fontSize: '0.8rem', fontWeight: 'bold' }}>React Native · Gemini · Groq · Expo</span>
              <h3 style={{ fontSize: '1.8rem', margin: '0.5rem 0' }}>CodePilot</h3>
              <p style={{ color: '#ccc', marginBottom: '1.5rem' }}>Mobile AI code editor with voice & terminal</p>
              <a href="https://github.com/Ragu3175/Mobile-AiCode-Editor" target="_blank" rel="noreferrer" style={{ color: '#00f2ff', textDecoration: 'none', fontWeight: 'bold' }}>VIEW SOURCE →</a>
            </div>

            {/* Project 3 */}
            <div className="portfolio-card" style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0, 242, 255, 0.1)', padding: '2rem', borderRadius: '1rem', color: '#fff', transition: 'transform 0.3s' }}>
              <span style={{ color: '#00f2ff', fontSize: '0.8rem', fontWeight: 'bold' }}>MERN · JWT · Redux · Socket.IO</span>
              <h3 style={{ fontSize: '1.8rem', margin: '0.5rem 0' }}>Task Manager</h3>
              <p style={{ color: '#ccc', marginBottom: '1.5rem' }}>Real-time collaborative task management</p>
              <a href="https://task-assignment-app-delta.vercel.app" target="_blank" rel="noreferrer" style={{ color: '#00f2ff', textDecoration: 'none', fontWeight: 'bold' }}>VIEW PROJECT →</a>
            </div>

            {/* Project 4 */}
            <div className="portfolio-card" style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0, 242, 255, 0.1)', padding: '2rem', borderRadius: '1rem', color: '#fff', transition: 'transform 0.3s' }}>
              <span style={{ color: '#00f2ff', fontSize: '0.8rem', fontWeight: 'bold' }}>MERN · Socket.IO · JWT</span>
              <h3 style={{ fontSize: '1.8rem', margin: '0.5rem 0' }}>Real-Time Messaging</h3>
              <p style={{ color: '#ccc', marginBottom: '1.5rem' }}>Full-duplex chat with live presence</p>
              <a href="https://github.com/Ragu3175" target="_blank" rel="noreferrer" style={{ color: '#00f2ff', textDecoration: 'none', fontWeight: 'bold' }}>VIEW GITHUB →</a>
            </div>

            {/* Project 5 */}
            <div className="portfolio-card" style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0, 242, 255, 0.1)', padding: '2rem', borderRadius: '1rem', color: '#fff', transition: 'transform 0.3s' }}>
              <span style={{ color: '#00f2ff', fontSize: '0.8rem', fontWeight: 'bold' }}>Python · Scikit-learn · ML</span>
              <h3 style={{ fontSize: '1.8rem', margin: '0.5rem 0' }}>Score Predictor</h3>
              <p style={{ color: '#ccc', marginBottom: '1.5rem' }}>Linear & polynomial regression ML pipeline</p>
              <a href="https://github.com/Ragu3175/ML-Projects" target="_blank" rel="noreferrer" style={{ color: '#00f2ff', textDecoration: 'none', fontWeight: 'bold' }}>VIEW PROJECT →</a>
            </div>

          </div>
        </section>

        {/* CTA Section */}
        <section className="section" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="hero-text" style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '4rem', color: '#fff', marginBottom: '2rem' }}>LET'S BUILD SOMETHING REAL.</h1>
            <a href="mailto:ragu317317@gmail.com" className="cta-button" style={{ textDecoration: 'none', padding: '1rem 3rem', background: 'transparent', border: '2px solid #00f2ff', color: '#00f2ff', fontSize: '1.5rem', cursor: 'pointer', transition: 'all 0.3s' }}>HIRE ME</a>
          </div>
        </section>

        {/* Professional Footer */}
        <footer style={{ padding: '4rem 2rem', background: 'rgba(0,0,0,0.5)', borderTop: '1px solid rgba(0, 242, 255, 0.1)', color: '#fff', textAlign: 'center' }}>
          <h2 style={{ color: '#00f2ff', margin: '0 0 1rem 0' }}>Raguram R</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <a href="mailto:ragu317317@gmail.com" style={{ color: '#ccc', textDecoration: 'none' }}>ragu317317@gmail.com</a>
            <a href="https://github.com/Ragu3175" target="_blank" rel="noreferrer" style={{ color: '#ccc', textDecoration: 'none' }}>GitHub</a>
            <a href="https://linkedin.com/in/raguram-r-92504a286" target="_blank" rel="noreferrer" style={{ color: '#ccc', textDecoration: 'none' }}>LinkedIn</a>
            <a href="https://raguram-portfolio.vercel.app" target="_blank" rel="noreferrer" style={{ color: '#ccc', textDecoration: 'none' }}>Portfolio</a>
          </div>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>© 2026 RAGURAM R. ALL RIGHTS RESERVED.</p>
        </footer>
      </div>
    </div>
  );
}
