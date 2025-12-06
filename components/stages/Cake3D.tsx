/// <reference lib="dom" />
import React, { useState, useEffect } from 'react';
import { sfx } from '../../services/audioService';
import { Button } from '../Button';

interface Cake3DProps {
  onRestart: () => void;
  userName?: string;
}

const Cake3D: React.FC<Cake3DProps> = ({ onRestart, userName }) => {
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [slices, setSlices] = useState(Array(8).fill(true)); // 8 visible slices
  const [flameScale, setFlameScale] = useState(1);

  useEffect(() => {
    // Microphone interaction to blow out candles
    let audioContext: AudioContext;
    let analyser: AnalyserNode;
    let micStream: MediaStream;
    let rafId: number;

    const initMic = async () => {
      try {
        micStream = await window.navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(micStream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const buffer = new Uint8Array(analyser.frequencyBinCount);
        
        const tick = () => {
          if (!analyser) return;
          analyser.getByteFrequencyData(buffer);
          const avg = buffer.reduce((a, b) => a + b, 0) / buffer.length;
          
          // Visual feedback for blowing
          if (avg > 10) {
             setFlameScale(Math.max(0.2, 1 - (avg / 50)));
          } else {
             setFlameScale(prev => Math.min(1, prev + 0.1));
          }

          if (avg > 40 && !candlesBlown) { 
             setCandlesBlown(true);
             sfx.cheer();
             sfx.pop();
          }
          rafId = requestAnimationFrame(tick);
        };
        tick();
      } catch (e) {
        console.log("Mic not available", e);
      }
    };

    if (!candlesBlown) {
      initMic();
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (audioContext && audioContext.state !== 'closed') audioContext.close();
      if (micStream) micStream.getTracks().forEach(t => t.stop());
    };
  }, [candlesBlown]);

  const eatSlice = (index: number) => {
    if (!candlesBlown) return;
    if (slices[index]) {
      const newSlices = [...slices];
      newSlices[index] = false;
      setSlices(newSlices);
      sfx.slice();
    }
  };

  return (
    <div className="h-full w-full bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-pulse" 
               style={{ top: `${Math.random()*100}%`, left: `${Math.random()*100}%`, animationDelay: `${Math.random()*5}s` }}></div>
        ))}
      </div>

      <div className="z-10 text-center mb-8">
        <h2 className="text-4xl md:text-6xl font-bold text-pink-500 font-comic drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">
          {candlesBlown ? `HAPPY BIRTHDAY ${userName?.toUpperCase() || 'FRIEND'}!` : "MAKE A WISH!"}
        </h2>
        <p className="text-pink-200 mt-2 text-xl">
          {candlesBlown ? "Click the cake to eat it!" : "Blow into your mic to put out the candles!"}
        </p>
      </div>

      {/* The Cake SVG */}
      <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] transition-transform hover:scale-105">
        <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
          {/* Plate */}
          <circle cx="200" cy="200" r="190" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="4" />
          <circle cx="200" cy="200" r="180" fill="#f1f5f9" opacity="0.5" />

          {/* Slices */}
          <g transform="translate(200, 200)">
            {slices.map((exists, i) => {
              if (!exists) return null;
              const angle = (360 / 8) * i;
              const rotation = `rotate(${angle})`;
              return (
                <g key={i} transform={rotation} onClick={() => eatSlice(i)} className={`cursor-pointer transition-opacity ${candlesBlown ? 'hover:opacity-80' : ''}`}>
                  {/* Slice Wedge */}
                  <path d="M0,0 L-70,-140 A156,156 0 0,1 70,-140 Z" fill="#fcd34d" stroke="#b45309" strokeWidth="2" />
                  {/* Frosting Top */}
                  <path d="M-60,-120 A134,134 0 0,1 60,-120" stroke="#ec4899" strokeWidth="20" fill="none" strokeLinecap="round" />
                  {/* Sprinkles */}
                  <circle cx="0" cy="-100" r="4" fill="#3b82f6" />
                  <circle cx="-20" cy="-110" r="4" fill="#ef4444" />
                  <circle cx="20" cy="-110" r="4" fill="#22c55e" />
                  
                  {/* Candle (Only visible if not blown out, or maybe keep candle body but no flame) */}
                  <g transform="translate(0, -90)">
                    <rect x="-4" y="-20" width="8" height="30" fill="#fce7f3" stroke="#db2777" strokeWidth="1" />
                    <rect x="-4" y="-20" width="8" height="5" fill="#db2777" />
                    <line x1="0" y1="-20" x2="0" y2="-25" stroke="#333" strokeWidth="2" />
                    {/* Flame */}
                    {!candlesBlown && (
                      <path 
                        d="M0,-25 Q-5,-35 0,-45 Q5,-35 0,-25" 
                        fill="#fbbf24" 
                        className="origin-bottom animate-pulse"
                        style={{ transform: `scale(${flameScale})` }}
                      />
                    )}
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {candlesBlown && (
        <div className="mt-12 z-20">
          <Button onClick={onRestart} variant="primary">Play Again ↺</Button>
        </div>
      )}
    </div>
  );
};

export default Cake3D;