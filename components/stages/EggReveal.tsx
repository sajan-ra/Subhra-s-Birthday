import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { sfx } from '../../services/audioService';
import { Button } from '../Button';

interface EggRevealProps {
  onComplete: () => void;
}

const EggReveal: React.FC<EggRevealProps> = ({ onComplete }) => {
  const [cracks, setCracks] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const eggRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Egg lands on screen (continuing from previous stage)
    if (eggRef.current) {
      gsap.fromTo(eggRef.current, 
        { y: -300, opacity: 0, scale: 0.5 }, 
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "bounce.out" }
      );
    }
  }, []);

  const handleEggClick = () => {
    if (isRevealed) return;
    
    const newCracks = cracks + 1;
    setCracks(newCracks);
    sfx.crack();

    if (eggRef.current) {
      gsap.to(eggRef.current, {
        rotate: Math.random() * 20 - 10,
        scale: 1.05,
        duration: 0.1,
        yoyo: true,
        repeat: 3
      });
    }

    if (newCracks >= 3) {
      revealSurprise();
    }
  };

  const revealSurprise = () => {
    setIsRevealed(true);
    sfx.cheer();
    
    if (eggRef.current && contentRef.current) {
      const tl = gsap.timeline();
      
      // Egg explosion fade out
      tl.to(eggRef.current, {
        scale: 2,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out"
      })
      // Reveal Content
      .fromTo(contentRef.current, 
        { scale: 0, rotation: -180, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 1.2, ease: "elastic.out(1, 0.5)" },
        "-=0.2"
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-pink-50 relative overflow-hidden">
      {!isRevealed && (
         <div className="absolute top-20 text-3xl font-bold text-pink-500 animate-pulse drop-shadow-sm font-comic">
          Crack the egg!
        </div>
      )}

      {/* The Egg */}
      {!isRevealed && (
        <div 
          ref={eggRef}
          onClick={handleEggClick}
          className="text-[180px] cursor-pointer select-none relative z-10 transition-transform hover:scale-105"
          style={{ filter: 'drop-shadow(0px 15px 25px rgba(0,0,0,0.2))' }}
        >
          🥚
          {cracks > 0 && <span className="absolute top-10 left-10 text-6xl text-gray-800 font-bold opacity-60">⚡</span>}
          {cracks > 1 && <span className="absolute bottom-10 right-10 text-6xl text-gray-800 font-bold opacity-60">⚡</span>}
        </div>
      )}

      {/* The Surprise Content */}
      <div ref={contentRef} className="absolute inset-0 flex flex-col items-center justify-center opacity-0 pointer-events-none data-[visible=true]:pointer-events-auto" data-visible={isRevealed}>
        <div className="bg-white p-6 rounded-3xl shadow-2xl transform rotate-2 flex flex-col items-center max-w-sm border-4 border-pink-200">
          <img 
            src="https://images.unsplash.com/photo-1595152452543-e5cca283f547?q=80&w=500&auto=format&fit=crop" 
            alt="Birthday Girl" 
            className="w-56 h-56 rounded-full border-4 border-pink-500 object-cover mb-4 shadow-inner"
          />
          <h2 className="text-4xl text-pink-600 font-bold text-center mb-2 font-comic">Surprise!</h2>
          <p className="text-gray-600 text-center text-lg font-bold">Happy Birthday to You! 🎉</p>
        </div>
        
        <div className="mt-12">
           <Button onClick={onComplete} className="text-xl px-10 py-4 animate-bounce">
             Enter Party Zone →
           </Button>
        </div>
      </div>

      {/* Confetti / Decoration */}
      {isRevealed && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           {Array.from({length: 20}).map((_, i) => (
             <div key={i} className="absolute text-4xl animate-[fall_3s_ease-in_infinite]" style={{
               left: `${Math.random() * 100}%`,
               animationDelay: `${Math.random() * 2}s`
             }}>
               {['✨', '🌸', '💖', '🧁'][Math.floor(Math.random() * 4)]}
             </div>
           ))}
           <style>{`
            @keyframes fall {
              0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
            }
           `}</style>
        </div>
      )}
    </div>
  );
};

export default EggReveal;