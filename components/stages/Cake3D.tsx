/// <reference lib="dom" />
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles, Text, Float, Html } from '@react-three/drei';
import { Physics, useBox, usePlane } from '@react-three/cannon';
import { sfx } from '../../services/audioService';
import { Button } from '../Button';

// Augment JSX namespace for Three.js elements and all other elements to fix missing types
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

interface Cake3DProps {
  onRestart: () => void;
}

const Floor = () => {
  const [ref] = usePlane(() => ({ 
    rotation: [-Math.PI / 2, 0, 0], 
    position: [0, -2, 0],
    type: 'Static',
    material: { friction: 0.8 } 
  }));
  return (
    <mesh ref={ref as any} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color="#fdf2f8" />
    </mesh>
  );
};

const Candle = ({ position, blownOut }: { position: [number, number, number], blownOut: boolean }) => {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]}>
         <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
         <meshStandardMaterial color="#fce7f3" />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
         <cylinderGeometry args={[0.01, 0.01, 0.1, 4]} />
         <meshStandardMaterial color="#333" />
      </mesh>
      {!blownOut && (
        <mesh position={[0, 0.45, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="orange" emissive="orange" emissiveIntensity={2} />
          <pointLight distance={3} intensity={1} color="#ffaa00" />
        </mesh>
      )}
    </group>
  );
};

const CakeSlice = ({ 
  index, 
  total, 
  onInteract, 
  candlesBlown 
}: { 
  index: number; 
  total: number; 
  onInteract: () => void; 
  candlesBlown: boolean;
  key?: any; 
}) => {
  const angleStep = (Math.PI * 2) / total;
  const angle = index * angleStep;
  const radius = 1;
  // Offset from center to allow clean separation
  const x = Math.sin(angle + angleStep/2) * 0.1;
  const z = Math.cos(angle + angleStep/2) * 0.1;

  const [isDetached, setIsDetached] = useState(false);
  
  // Calculate physics box size/rotation roughly matching the wedge
  const [ref, api] = useBox(() => ({
    mass: isDetached ? 1 : 0,
    args: [0.6, 0.8, 1], // Approximation of wedge
    position: [x, -0.5, z],
    rotation: [0, angle + angleStep/2, 0],
  }));

  const handleClick = (e: any) => {
    if (!candlesBlown) return;
    e.stopPropagation();
    
    if (!isDetached) {
      setIsDetached(true);
      sfx.slice();
      onInteract();
      
      // Eject slice
      const ejectForce = 4;
      api.applyImpulse(
        [Math.sin(angle + angleStep/2) * ejectForce, 3, Math.cos(angle + angleStep/2) * ejectForce],
        [0, 0, 0]
      );
      api.applyTorque([Math.random(), Math.random(), Math.random()]);
    }
  };

  return (
    <group ref={ref as any} onClick={handleClick}>
      <group rotation={[0, -angleStep/2, 0]}> {/* Adjust visual to align with physics box rotation */}
         <mesh castShadow receiveShadow>
            <cylinderGeometry 
              args={[radius, radius, 0.8, 32, 1, false, 0, angleStep]} 
            />
            <meshStandardMaterial color={index % 2 === 0 ? "#ec4899" : "#f472b6"} />
         </mesh>
         <mesh position={[0, 0.41, 0]}>
            <cylinderGeometry 
              args={[radius * 0.95, radius * 0.95, 0.05, 32, 1, false, 0, angleStep]} 
            />
            <meshStandardMaterial color="white" />
         </mesh>
         
         {/* Candle centered on wedge arc */}
         <Candle 
           position={[Math.sin(angleStep/2)*0.6, 0.4, Math.cos(angleStep/2)*0.6]} 
           blownOut={candlesBlown} 
         />
      </group>
    </group>
  );
};

const Scene = ({ onRestart }: { onRestart: () => void }) => {
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    let audioContext: AudioContext;
    let analyser: AnalyserNode;
    let micStream: MediaStream;
    let rafId: number;

    const initMic = async () => {
      try {
        // Fix: Use window.navigator to ensure access in all contexts
        micStream = await window.navigator.mediaDevices.getUserMedia({ audio: true });
        // Fix: Cast window to any for webkit prefix support
        audioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(micStream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const buffer = new Uint8Array(analyser.frequencyBinCount);
        
        const tick = () => {
          analyser.getByteFrequencyData(buffer);
          const avg = buffer.reduce((a, b) => a + b, 0) / buffer.length;
          setVolume(avg);
          
          if (avg > 30 && !candlesBlown) { // Threshold
             setCandlesBlown(true);
             sfx.cheer();
          }
          rafId = requestAnimationFrame(tick);
        };
        tick();
      } catch (e) {
        console.log("Mic not available", e);
      }
    };
    initMic();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (audioContext) audioContext.close();
      // Fix: cast to any to ensure getTracks is accessible even if type definition is old
      if (micStream) (micStream as any).getTracks().forEach((t: any) => t.stop());
    };
  }, [candlesBlown]);

  return (
    <>
      <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2.2} />
      <ambientLight intensity={0.6} />
      <spotLight position={[5, 10, 5]} angle={0.5} penumbra={1} intensity={1} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.5} />
      <Stars count={2000} factor={4} fade />
      
      {candlesBlown && <Sparkles count={200} scale={12} size={6} speed={0.4} opacity={1} color="#FFD700" position={[0, 2, 0]} />}

      <Physics>
        <Floor />
        {Array.from({ length: 8 }).map((_, i) => (
          <CakeSlice 
            key={i} 
            index={i} 
            total={8} 
            candlesBlown={candlesBlown} 
            onInteract={() => {}} 
          />
        ))}
      </Physics>

      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5} position={[0, 2.5, 0]}>
         <Text
           font="https://fonts.gstatic.com/s/fredokaone/v13/k3kUo8kEI-tA1RRcTZGmTlHGCac.woff"
           fontSize={0.6}
           color="#ec4899"
           anchorX="center"
           anchorY="middle"
           outlineWidth={0.02}
           outlineColor="#ffffff"
         >
           {!candlesBlown ? (volume > 10 ? "BLOW HARDER!" : "BLOW OUT THE CANDLES!") : "HAPPY BIRTHDAY!"}
         </Text>
      </Float>
    </>
  );
};

const Cake3D: React.FC<Cake3DProps> = ({ onRestart }) => {
  return (
    <div className="h-full w-full relative bg-gradient-to-b from-slate-900 to-purple-900">
      <Canvas shadows camera={{ position: [0, 4, 6], fov: 45 }}>
        <Scene onRestart={onRestart} />
      </Canvas>
      
      <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
        <div className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl pointer-events-auto text-center max-w-sm mx-4">
          <p className="text-sm font-bold text-gray-700 mb-3">
            🎤 Blow into your microphone to extinguish the candles, then click slices to eat the cake!
          </p>
          <Button onClick={onRestart} variant="primary">Start Over ↺</Button>
        </div>
      </div>
    </div>
  );
};

export default Cake3D;