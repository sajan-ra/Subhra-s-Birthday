import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { sfx } from '../../services/audioService';

interface LandingProps {
  onComplete: () => void;
}

interface ChickenData {
  id: number;
  x: number;
  y: number;
  isWinner: boolean;
  status: 'idle' | 'clicked';
  surpriseType: 'joke' | 'ghost' | 'roast' | 'poof' | 'winner';
  msg?: string;
}

const JOKES = [
  "Not me!",
  "Try again!",
  "Nope!",
  "I'm a duck.",
  "Wrong bird!",
  "Cluck off!",
  "Am I the one?",
  "404 Egg Not Found"
];

const Landing: React.FC<LandingProps> = ({ onComplete }) => {
  const [chickens, setChickens] = useState<ChickenData[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [foundWinner, setFoundWinner] = useState(false);

  useEffect(() => {
    // Generate 20 random chickens
    const newChickens: ChickenData[] = [];
    const winnerIndex = Math.floor(Math.random() * 20);

    for (let i = 0; i < 20; i++) {
      const isWinner = i === winnerIndex;
      let surpriseType: ChickenData['surpriseType'] = 'poof';
      
      if (isWinner) {
        surpriseType = 'winner';
      } else {
        const rand = Math.random();
        if (rand < 0.4) surpriseType = 'joke';
        else if (rand < 0.6) surpriseType = 'roast';
        else if (rand < 0.8) surpriseType = 'ghost';
        else surpriseType = 'poof';
      }

      newChickens.push({
        id: i,
        // Keep them somewhat away from edges (10% to 90%)
        x: Math.random() * 80 + 10, 
        y: Math.random() * 80 + 10,
        isWinner,
        status: 'idle',
        surpriseType,
        msg: surpriseType === 'joke' ? JOKES[Math.floor(Math.random() * JOKES.length)] : undefined
      });
    }
    setChickens(newChickens);
  }, []);

  const handleChickenClick = (id: number) => {
    if (foundWinner) return;

    setChickens(prev => prev.map(c => {
      if (c.id !== id) return c;
      return { ...c, status: 'clicked' };
    }));

    const chicken = chickens.find(c => c.id === id);
    if (!chicken) return;

    if (chicken.isWinner) {
      // Winner Logic
      setFoundWinner(true);
      sfx.cheer();
      
      // Animate Winner
      const el = document.getElementById(`chicken-${id}`);
      if (el) {
        const tl = gsap.timeline();
        // Jump up
        tl.to(el, { y: -100, scale: 1.5, duration: 0.5, ease: "back.out(1.7)" })
          // Lay egg (visualized by a new element appearing below)
          .call(() => {
             sfx.pop();
             const egg = document.createElement('div');
             egg.innerText = '🥚';
             egg.style.position = 'absolute';
             egg.style.left = '50%';
             egg.style.top = '100%';
             egg.style.transform = 'translate(-50%, 0)';
             egg.style.fontSize = '40px';
             el.appendChild(egg);
             
             gsap.from(egg, { y: -20, opacity: 0, duration: 0.3 });
          })
          // Pause then complete
          .to({}, { duration: 1.5 })
          .call(onComplete);
      }
    } else {
      // Decoy Logic
      sfx.cluck();
      
      if (chicken.surpriseType === 'roast') {
         // Change visual to roasted chicken
         sfx.slice();
      } else if (chicken.surpriseType === 'ghost') {
         sfx.slice(); // quiet sound
      }
    }
  };

  return (
    <div ref={containerRef} className="h-full w-full bg-green-100 relative overflow-hidden cursor-crosshair">
      <div className="absolute top-8 left-0 right-0 text-center pointer-events-none z-10">
        <h2 className="text-3xl text-green-700 font-comic font-bold drop-shadow-sm bg-white/80 inline-block px-6 py-2 rounded-full">
          Find the Chicken that lays the egg! 🥚
        </h2>
      </div>

      {chickens.map((c) => (
        <div
          key={c.id}
          id={`chicken-${c.id}`}
          onClick={() => c.status === 'idle' && handleChickenClick(c.id)}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 cursor-pointer select-none"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            zIndex: c.status === 'clicked' ? 0 : 10,
            opacity: c.status === 'clicked' && c.surpriseType === 'ghost' ? 0 : 1,
            transition: c.status === 'clicked' && c.surpriseType === 'ghost' ? 'opacity 1s ease-out' : ''
          }}
        >
          {/* Main Graphic */}
          <div className={`text-5xl ${c.status === 'clicked' && !c.isWinner ? 'grayscale opacity-50' : ''}`}>
             {c.status === 'clicked' && c.surpriseType === 'roast' ? '🍗' : '🐔'}
          </div>

          {/* Feedback Messages/Effects */}
          {c.status === 'clicked' && !c.isWinner && (
            <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 whitespace-nowrap bg-white border border-gray-300 rounded px-2 py-1 text-xs font-bold animate-[bounce_0.5s_ease-out]">
              {c.surpriseType === 'joke' && c.msg}
              {c.surpriseType === 'roast' && "Tasty!"}
              {c.surpriseType === 'ghost' && "Boo!"}
              {c.surpriseType === 'poof' && "Empty!"}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Landing;