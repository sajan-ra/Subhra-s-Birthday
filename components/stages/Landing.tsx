import React, { useRef, useState, useLayoutEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, ContactShadows, Float, Text, Environment, Html, PerspectiveCamera } from '@react-three/drei';
import gsap from 'gsap';
import * as THREE from 'three';
import { sfx } from '../../services/audioService';

interface LandingProps {
  onComplete: () => void;
}

// A composed 3D Chicken using primitives to look "Toy Realistic"
const Chicken3D = ({ onClick, isFlying }: { onClick: () => void, isFlying: boolean }) => {
  const group = useRef<THREE.Group>(null);
  const wingsRef = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    if (isFlying && group.current && wingsRef.current) {
      // Fly away animation
      const tl = gsap.timeline();
      
      // 1. Squat
      tl.to(group.current.scale, {
        y: 0.8,
        x: 1.1,
        z: 1.1,
        duration: 0.2,
        ease: "power1.inOut",
        yoyo: true,
        repeat: 1
      })
      // 2. Jump and Fly
      .to(group.current.position, {
        y: 10,
        x: 5,
        z: -5,
        duration: 1.5,
        ease: "power2.in",
        delay: 0.1
      })
      .to(group.current.rotation, {
        y: Math.PI / 4,
        x: -Math.PI / 6,
        duration: 1.5,
      }, "<");

      // Flap wings frantically
      gsap.to(wingsRef.current.rotation, {
        x: Math.PI / 2,
        duration: 0.1,
        yoyo: true,
        repeat: 15
      });
    }
  }, [isFlying]);

  useFrame((state) => {
    if (!isFlying && group.current) {
      // Idle breathing
      group.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 0.9; // Base height 0.9
      
      // Idle wing twitch
      if (wingsRef.current) {
          wingsRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 4) * 0.05;
      }
    }
  });

  return (
    <group ref={group} onClick={(e) => { e.stopPropagation(); onClick(); }} position={[0, 0.9, 0]}>
      {/* Body Main */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.9} />
      </mesh>
      
      {/* Chest puffs for realism */}
      <mesh position={[0, -0.2, 0.4]} rotation={[0.5, 0, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.9} />
      </mesh>

      {/* Tail Feathers */}
      <group position={[0, 0.2, -0.6]} rotation={[-0.5, 0, 0]}>
        <mesh castShadow position={[0, 0, 0]}>
            <coneGeometry args={[0.4, 0.8, 32]} />
            <meshStandardMaterial color="#e5e5e5" />
        </mesh>
      </group>

      {/* Wings Group */}
      <group ref={wingsRef}>
        <mesh position={[0.65, 0.1, 0]} rotation={[0, 0, -0.2]} castShadow>
          <sphereGeometry args={[0.2, 32, 16]} scale={[1, 2.5, 1.5]} />
          <meshStandardMaterial color="#ffffff" roughness={1} />
        </mesh>
        <mesh position={[-0.65, 0.1, 0]} rotation={[0, 0, 0.2]} castShadow>
          <sphereGeometry args={[0.2, 32, 16]} scale={[1, 2.5, 1.5]} />
          <meshStandardMaterial color="#ffffff" roughness={1} />
        </mesh>
      </group>

      {/* Head Group */}
      <group position={[0, 0.7, 0.3]}>
        {/* Neck feather blending */}
        <mesh position={[0, -0.2, -0.1]}>
           <cylinderGeometry args={[0.3, 0.4, 0.4]} />
           <meshStandardMaterial color="#f0f0f0" />
        </mesh>

        {/* Head */}
        <mesh castShadow>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>
        
        {/* Eyes */}
        <mesh position={[0.15, 0.1, 0.25]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="black" roughness={0.2} />
        </mesh>
        <mesh position={[-0.15, 0.1, 0.25]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="black" roughness={0.2} />
        </mesh>

        {/* Beak */}
        <mesh position={[0, 0, 0.35]} rotation={[Math.PI/2, 0, 0]}>
          <coneGeometry args={[0.08, 0.2, 32]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>

        {/* Comb (Red thing on top) */}
        <group position={[0, 0.3, 0]}>
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0, 0.05, -0.12]}>
                <sphereGeometry args={[0.07, 16, 16]} />
                <meshStandardMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0, -0.02, 0.12]}>
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshStandardMaterial color="#ef4444" />
            </mesh>
        </group>

        {/* Wattle (Red thing under beak) */}
        <mesh position={[0, -0.15, 0.25]}>
           <sphereGeometry args={[0.06, 16, 16]} />
           <meshStandardMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* Legs */}
      <group position={[0, -0.5, 0]}>
         {/* Thighs */}
         <mesh position={[0.25, 0.1, 0]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#f0f0f0" />
         </mesh>
         <mesh position={[-0.25, 0.1, 0]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#f0f0f0" />
         </mesh>

         {/* Sticks */}
         <mesh position={[0.25, -0.2, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.6]} />
            <meshStandardMaterial color="#fbbf24" />
         </mesh>
         <mesh position={[-0.25, -0.2, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.6]} />
            <meshStandardMaterial color="#fbbf24" />
         </mesh>
         
         {/* Feet */}
         <mesh position={[0.25, -0.5, 0.1]} rotation={[Math.PI/2, 0, 0]}>
             <boxGeometry args={[0.12, 0.3, 0.04]} />
             <meshStandardMaterial color="#fbbf24" />
         </mesh>
         <mesh position={[-0.25, -0.5, 0.1]} rotation={[Math.PI/2, 0, 0]}>
             <boxGeometry args={[0.12, 0.3, 0.04]} />
             <meshStandardMaterial color="#fbbf24" />
         </mesh>
      </group>
    </group>
  );
};

const Egg3D = ({ visible }: { visible: boolean }) => {
  const mesh = useRef<THREE.Mesh>(null);

  useLayoutEffect(() => {
    if (visible && mesh.current) {
      gsap.fromTo(mesh.current.scale, 
        { x: 0, y: 0, z: 0 }, 
        { x: 1, y: 1, z: 1, duration: 0.4, ease: "elastic.out(1, 0.5)" }
      );
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <mesh ref={mesh} position={[0, 0.6, 0]} castShadow receiveShadow>
      {/* Egg Shape */}
      <sphereGeometry args={[0.5, 32, 32]} />
      {/* Slight stretch to make it egg-like */}
      <meshStandardMaterial color="#fefce8" roughness={0.3} />
    </mesh>
  );
};

const Scene = ({ onComplete }: { onComplete: () => void }) => {
  const [isFlying, setIsFlying] = useState(false);
  const [eggVisible, setEggVisible] = useState(false);

  const handleClick = () => {
    if (isFlying) return;
    setIsFlying(true);
    sfx.cluck();
    
    // Time the egg appearance with the squat animation
    setTimeout(() => {
        setEggVisible(true);
        sfx.pop();
    }, 300);

    // Complete stage after chicken flies away
    setTimeout(() => {
        onComplete();
    }, 1500);
  };

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 6]} />
      <Sky sunPosition={[100, 20, 100]} turbidity={0.5} rayleigh={0.5} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
      <Environment preset="park" />
      
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <Chicken3D onClick={handleClick} isFlying={isFlying} />
      </Float>
      
      <Egg3D visible={eggVisible} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>
      
      <ContactShadows opacity={0.4} scale={10} blur={2} far={4} />

      {!isFlying && (
        <Float position={[0, 3.5, 0]} speed={3} floatIntensity={0.5}>
          <Text
            font="https://fonts.gstatic.com/s/fredokaone/v13/k3kUo8kEI-tA1RRcTZGmTlHGCac.woff"
            fontSize={0.5}
            color="white"
            outlineWidth={0.04}
            outlineColor="#ec4899"
          >
            TAP ME!
          </Text>
        </Float>
      )}
    </>
  );
};

const Landing: React.FC<LandingProps> = ({ onComplete }) => {
  return (
    <div className="h-full w-full bg-sky-300">
      <Canvas shadows camera={{ position: [0, 2, 6], fov: 45 }}>
        <Suspense fallback={<Html center><div className="text-white font-bold text-2xl animate-pulse">Loading Chicken...</div></Html>}>
           <Scene onComplete={onComplete} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Landing;