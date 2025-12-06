/// <reference lib="dom" />
import React, { useState, useEffect } from 'react';
import { sfx } from '../../services/audioService';
import { Button } from '../Button';

interface PlaygroundProps {
  onComplete: () => void;
}

// Sub-components defined here for simplicity of file structure
const TalkingPotato = () => {
  const [message, setMessage] = useState("Hi. I am a potato.");
  const [isTalking, setIsTalking] = useState(false);

  const messages = [
    "You have unlocked LEVEL 18 HUMAN!",
    "Cake is loading... Please wait.",
    "You are now 1 year closer to becoming a dinosaur.",
    "I have no eyes, but I see you.",
    "Why are you clicking a potato?",
    "Happy Birthday! I got you nothing."
  ];

  const handleClick = () => {
    setIsTalking(true);
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    setMessage(randomMsg);
    setTimeout(() => setIsTalking(false), 500);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-yellow-100/50 rounded-xl border border-yellow-200">
      <div className={`bg-white p-2 rounded-lg mb-2 text-sm shadow relative ${isTalking ? 'scale-110' : ''} transition-transform`}>
        {message}
        <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45"></div>
      </div>
      <div 
        onClick={handleClick}
        className={`text-6xl cursor-pointer select-none transition-transform ${isTalking ? 'animate-bounce' : 'hover:rotate-6'}`}
      >
        🥔
      </div>
    </div>
  );
};

const RedButton = () => {
  const [pushed, setPushed] = useState(false);

  const handlePush = () => {
    setPushed(true);
    sfx.explosion();
    document.body.classList.add('shake-screen');
    
    // Create explosion overlay
    const explosion = document.createElement('div');
    explosion.innerText = "💥";
    explosion.style.position = 'fixed';
    explosion.style.top = '50%';
    explosion.style.left = '50%';
    explosion.style.transform = 'translate(-50%, -50%)';
    explosion.style.fontSize = '200px';
    explosion.style.zIndex = '9999';
    explosion.style.pointerEvents = 'none';
    document.body.appendChild(explosion);

    setTimeout(() => {
      document.body.classList.remove('shake-screen');
      document.body.removeChild(explosion);
      setPushed(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-200/50 rounded-xl border border-gray-300">
      <button 
        onClick={handlePush}
        className="w-24 h-24 rounded-full bg-red-600 border-b-8 border-red-800 shadow-xl active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center text-white font-bold text-xs text-center"
      >
        DO NOT<br/>PRESS
      </button>
      {pushed && <span className="text-red-600 font-bold mt-2 text-sm">I TOLD YOU!</span>}
    </div>
  );
};

const Dancer = () => {
  const [move, setMove] = useState(0);
  const danceMoves = ["animate-bounce", "animate-spin", "animate-pulse"];
  
  const handleClick = () => {
    setMove((prev) => (prev + 1) % danceMoves.length);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-purple-100/50 rounded-xl border border-purple-200">
       <div 
        onClick={handleClick}
        className={`text-6xl cursor-pointer select-none transition-all duration-500 ${danceMoves[move]}`}
       >
         💃
       </div>
       <span className="text-xs text-purple-600 mt-2">Click to dance!</span>
    </div>
  );
};

const Balloon = ({ id, onPop }: { id: number, onPop: (id: number) => void }) => {
  const speed = 5 + Math.random() * 5;
  const left = Math.random() * 80 + 10;
  
  return (
    <div 
      onClick={() => { sfx.pop(); onPop(id); }}
      className="absolute bottom-[-100px] text-6xl cursor-pointer hover:opacity-80 select-none"
      style={{
        left: `${left}%`,
        animation: `floatUp ${speed}s linear infinite`,
        animationDelay: `${Math.random() * 5}s`,
        filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.2))'
      }}
    >
      🎈
    </div>
  );
};

const Playground: React.FC<PlaygroundProps> = ({ onComplete }) => {
  const [balloons, setBalloons] = useState<number[]>([1, 2, 3, 4, 5]);

  const popBalloon = (id: number) => {
    setBalloons(prev => prev.filter(b => b !== id));
    if (balloons.length <= 1) {
      // Regenerate balloons if mostly popped
      setTimeout(() => setBalloons([Date.now(), Date.now()+1, Date.now()+2]), 1000);
    }
  };

  return (
    <div className="relative h-full w-full bg-blue-50 overflow-hidden flex flex-col">
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-120vh) rotate(20deg); }
        }
      `}</style>
      
      {/* Balloons Layer */}
      <div className="absolute inset-0 pointer-events-none z-0">
         {balloons.map(b => (
           <div key={b} className="pointer-events-auto">
             <Balloon id={b} onPop={popBalloon} />
           </div>
         ))}
      </div>

      {/* Main Content Grid */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        <h2 className="text-4xl text-blue-600 font-bold mb-8 text-center drop-shadow-sm">
          Party Playground!
        </h2>
        
        <div className="grid grid-cols-2 gap-4 w-full max-w-lg mb-8">
          <TalkingPotato />
          <RedButton />
          <div className="col-span-2 flex justify-center">
             <Dancer />
          </div>
        </div>

        <Button onClick={onComplete} variant="primary" className="mt-4 text-xl px-8 py-4">
           Bring out the Cake! 🎂
        </Button>
      </div>
    </div>
  );
};

export default Playground;