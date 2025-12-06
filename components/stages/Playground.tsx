/// <reference lib="dom" />
import React, { useState, useEffect, useMemo } from 'react';
import { music, sfx } from '../../services/audioService';
import { Button } from '../Button';

interface PlaygroundProps {
  onComplete: () => void;
  userName: string;
}

// --- Visual & Animation Types ---
type DanceMove = 'bounce' | 'twist' | 'wave' | 'floss';
type Formation = 'line' | 'circle';

interface StickmanProps {
  name: string;
  color: string;
  isDancing: boolean;
  formation: Formation;
  index: number;
  total: number;
  isUser: boolean;
  isBirthdayGirl?: boolean;
}

const Stickman: React.FC<StickmanProps> = ({ name, color, isDancing, formation, index, total, isUser, isBirthdayGirl }) => {
  // Randomize dance move for variety in line mode
  const danceMove = useMemo<DanceMove>(() => {
    const moves: DanceMove[] = ['bounce', 'twist', 'wave', 'floss'];
    return moves[Math.floor(Math.random() * moves.length)];
  }, []);

  // Calculate position for Circle Formation
  const circleStyle = useMemo(() => {
    if (formation !== 'circle') return {};
    
    // Birthday Girl goes to dead center in circle mode
    if (isBirthdayGirl) {
      return {
        position: 'absolute' as const,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%) scale(1.1)',
        zIndex: 200 // Always on top
      };
    }
    
    // Ellipse math for 3D circle effect for everyone else
    // We adjust index/total to account for the fact that one person (BG) is in middle
    // But simplistic approach: just map the current index to the circle
    const angle = (index / total) * 2 * Math.PI; 
    const radiusX = 300; // Width of circle
    const radiusY = 100; // Depth of circle (for perspective)
    
    const x = Math.cos(angle) * radiusX;
    const y = Math.sin(angle) * radiusY;
    
    // Scale based on Y (closer items look bigger)
    const scale = 0.8 + ((y + radiusY) / (radiusY * 2)) * 0.4;
    
    // Z-index based on Y so front items cover back items
    const zIndex = Math.floor(scale * 100);

    return {
      position: 'absolute' as const,
      left: '50%',
      top: '50%',
      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`,
      zIndex
    };
  }, [formation, index, total, isBirthdayGirl]);

  // Determine Animation Class
  const getAnimationClass = () => {
    // Birthday girl does NOT dance
    if (isBirthdayGirl) return '';
    
    if (!isDancing) return '';
    if (formation === 'circle') return 'animate-sway'; // Synchronized swaying in circle
    return `animate-${danceMove}`;
  };

  return (
    <div 
      className={`flex flex-col items-center justify-end w-24 h-48 transition-all duration-1000 ease-in-out ${formation === 'line' ? 'mx-2 relative' : ''}`}
      style={circleStyle}
    >
      {/* Name Tag */}
      <div 
        className={`mb-2 px-2 py-1 rounded text-xs font-bold whitespace-nowrap border-2 shadow-sm transition-opacity duration-300
          ${isUser ? 'bg-yellow-300 border-yellow-500 text-black scale-110 z-20' : 'bg-white/90 border-gray-300 text-gray-800'}
          ${isBirthdayGirl ? 'bg-pink-400 border-pink-600 text-white scale-125 z-30' : ''}
        `}
      >
        {name} {isUser && !isBirthdayGirl && '★'} {isBirthdayGirl && '👑'}
      </div>

      {/* The Stickman Figure Wrapper (applies the dance move) */}
      <div className={`relative w-20 h-40 flex flex-col items-center ${getAnimationClass()}`}>
        
        {/* BIRTHDAY HAT (Only for Birthday Girl) */}
        {isBirthdayGirl && (
          <div className="absolute -top-12 z-20 animate-[bounce_2s_infinite]">
             {/* Cone */}
             <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-b-[40px] border-l-transparent border-r-transparent border-b-pink-500 relative">
                {/* Pom pom */}
                <div className="absolute -top-[5px] -left-[5px] w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse"></div>
                {/* Stripes/Dots decoration */}
                <div className="absolute top-[10px] -left-[5px] w-2.5 h-2.5 bg-yellow-300 rounded-full opacity-50"></div>
                <div className="absolute top-[25px] left-[2px] w-2.5 h-2.5 bg-cyan-300 rounded-full opacity-50"></div>
             </div>
          </div>
        )}

        {/* HEAD */}
        <div 
          className="w-12 h-12 rounded-full border-[3px] bg-white relative z-10 overflow-hidden shadow-sm"
          style={{ borderColor: color }}
        >
          {/* Face */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
            {/* Eyes */}
            <div className={`absolute top-3 left-3 w-1.5 h-2 bg-black rounded-full ${isBirthdayGirl ? '' : 'animate-blink'}`}></div>
            <div className={`absolute top-3 right-3 w-1.5 h-2 bg-black rounded-full ${isBirthdayGirl ? '' : 'animate-blink'}`}></div>
            
            {/* Mouth */}
            <div className={`
              absolute bottom-3 left-1/2 -translate-x-1/2 w-6 h-3 border-b-2 border-black rounded-[50%] transition-all 
              ${isDancing && !isBirthdayGirl ? 'h-5 border-b-4 animate-[mouthSing_0.5s_infinite]' : ''}
              ${isBirthdayGirl ? 'w-5 h-2 border-b-2 mb-1' : ''} /* Gentle smile for BG */
            `}></div>
            
            {/* Blush */}
            <div className="absolute top-6 left-1 w-2 h-1 bg-pink-300 rounded-full opacity-50"></div>
            <div className="absolute top-6 right-1 w-2 h-1 bg-pink-300 rounded-full opacity-50"></div>
          </div>
        </div>

        {/* BODY */}
        <div 
          className="w-1.5 h-14 bg-black relative z-0 rounded-full"
          style={{ backgroundColor: color }}
        >
          {/* ARMS */}
          {formation === 'circle' && !isBirthdayGirl ? (
             // Holding Hands Pose (Joined) - exclude BG
             <>
               <div className="absolute top-1 left-1/2 w-12 h-1.5 origin-left -rotate-[20deg] rounded-full" style={{ backgroundColor: color }}></div>
               <div className="absolute top-1 left-1/2 w-12 h-1.5 origin-left rotate-[200deg] rounded-full" style={{ backgroundColor: color }}></div>
             </>
          ) : (
             // Freestyle Arms (or folded/relaxed for BG)
             <>
                <div className={`absolute top-2 left-1/2 w-10 h-1.5 origin-left rounded-full arm-left ${isBirthdayGirl ? 'rotate-[70deg]' : ''}`} style={{ backgroundColor: color }}></div>
                <div className={`absolute top-2 left-1/2 w-10 h-1.5 origin-left rounded-full arm-right ${isBirthdayGirl ? 'rotate-[110deg]' : ''}`} style={{ backgroundColor: color }}></div>
             </>
          )}
        </div>

        {/* LEGS */}
        <div className="relative w-full h-14">
           <div 
             className="absolute top-0 left-1/2 w-1.5 h-14 origin-top -translate-x-1/2 rotate-[-15deg] rounded-full leg-left"
             style={{ backgroundColor: color }}
           ></div>
           <div 
             className="absolute top-0 left-1/2 w-1.5 h-14 origin-top -translate-x-1/2 rotate-[15deg] rounded-full leg-right"
             style={{ backgroundColor: color }}
           ></div>
        </div>

      </div>
    </div>
  );
};

const Playground: React.FC<PlaygroundProps> = ({ onComplete, userName }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDancing, setIsDancing] = useState(false);
  const [formation, setFormation] = useState<Formation>('line');
  const [guests, setGuests] = useState<{name: string, color: string, isUser: boolean, isBirthdayGirl?: boolean}[]>([]);

  useEffect(() => {
    // Generate crowd
    const fakeNames = ["Alice", "Bob", "Charlie", "Diana", "Ethan", "Fiona", "George", "Hannah"];
    const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f43f5e"];
    
    // Prepare User
    const finalUserName = (userName && userName.trim() !== "") ? userName : "You";
    const isUserSubh = finalUserName.toLowerCase() === 'subh';

    // 1. Create User Object
    const userObj = {
      name: finalUserName,
      color: isUserSubh ? '#ec4899' : '#4f46e5', // Pink if Subh, else Indigo
      isUser: true,
      isBirthdayGirl: isUserSubh
    };

    // 2. Create Others
    let others = fakeNames.map((name, i) => ({
      name,
      color: colors[i % colors.length],
      isUser: false,
      isBirthdayGirl: false
    }));

    // 3. Handle Subh NPC if user is NOT Subh
    let birthdayGirl = userObj.isBirthdayGirl ? userObj : null;
    
    if (!birthdayGirl) {
      // Add Subh as NPC
      const subhNPC = {
        name: "Subh",
        color: "#ec4899",
        isUser: false,
        isBirthdayGirl: true
      };
      birthdayGirl = subhNPC;
      // Add user to others list since they are not the birthday girl
      others.push(userObj);
    } else {
      // User IS the birthday girl, so just use others list as is
    }

    // Shuffle others
    others = others.sort(() => Math.random() - 0.5);

    // 4. Construct Final Array: [Half Others, Birthday Girl, Half Others]
    // This puts her in the middle for Line formation
    const middleIndex = Math.floor(others.length / 2);
    const finalGuests = [
      ...others.slice(0, middleIndex),
      birthdayGirl!,
      ...others.slice(middleIndex)
    ];

    setGuests(finalGuests);

    return () => {
      music.stop();
    };
  }, [userName]);

  // Choreography Timer
  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      // Automatic steps: Toggle formation every 8 seconds to simulate a choreographed dance
      interval = window.setInterval(() => {
        setFormation(prev => prev === 'line' ? 'circle' : 'line');
      }, 8000);
    } else {
      setFormation('line');
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const toggleMusic = () => {
    if (isPlaying) {
      music.stop();
      setIsPlaying(false);
      setIsDancing(false);
    } else {
      music.start();
      setIsPlaying(true);
      setIsDancing(true);
    }
  };

  return (
    <div className="relative h-full w-full bg-slate-900 overflow-hidden flex flex-col items-center">
      
      {/* GLOBAL ANIMATION STYLES */}
      <style>{`
        @keyframes blink { 0%, 90%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.1); } }
        .animate-blink { animation: blink 3s infinite; }
        
        @keyframes mouthSing { 0%, 100% { height: 12px; } 50% { height: 20px; } }

        /* Dance: Bounce (Arms wave up and down) */
        @keyframes bounceBody {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bounceArm {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(150deg); } 
        }
        .animate-bounce .head { animation: headBob 0.5s infinite; }
        .animate-bounce { animation: bounceBody 0.5s infinite; }
        .animate-bounce .arm-left { animation: bounceArm 0.5s infinite; }
        .animate-bounce .arm-right { animation: bounceArm 0.5s infinite; animation-delay: 0.1s; }
        
        /* Dance: Twist */
        @keyframes twistBody {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
        .animate-twist { animation: twistBody 0.8s infinite ease-in-out; }
        .animate-twist .arm-left { transform: rotate(120deg); transition: transform 0.5s; }
        .animate-twist .arm-right { transform: rotate(-120deg); transition: transform 0.5s; }

        /* Dance: Wave */
        @keyframes waveBody {
          0%, 100% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
        }
        @keyframes waveArmLeft {
          0%, 100% { transform: rotate(140deg); }
          50% { transform: rotate(100deg); }
        }
        @keyframes waveArmRight {
          0%, 100% { transform: rotate(-100deg); }
          50% { transform: rotate(-140deg); }
        }
        .animate-wave { animation: waveBody 1s infinite ease-in-out; }
        .animate-wave .arm-left { animation: waveArmLeft 1s infinite ease-in-out; }
        .animate-wave .arm-right { animation: waveArmRight 1s infinite ease-in-out; }

        /* Dance: Floss */
        @keyframes flossBody {
          0%, 100% { transform: translateX(-15px) rotate(-5deg); }
          50% { transform: translateX(15px) rotate(5deg); }
        }
        @keyframes flossArmLeft {
          0%, 100% { transform: rotate(60deg); }
          50% { transform: rotate(-40deg); }
        }
        @keyframes flossArmRight {
          0%, 100% { transform: rotate(60deg); }
          50% { transform: rotate(-40deg); }
        }
        .animate-floss { animation: flossBody 0.6s infinite ease-in-out; }
        .animate-floss .arm-left { animation: flossArmLeft 0.6s infinite ease-in-out; }
        .animate-floss .arm-right { animation: flossArmRight 0.6s infinite ease-in-out; }

        /* Dance: Circle Sway (Bobbing + Rotating) */
        @keyframes circleBob {
          0%, 100% { transform: rotate(-5deg) translateY(0); }
          50% { transform: rotate(5deg) translateY(-10px); }
        }
        .animate-sway { animation: circleBob 2s infinite ease-in-out; transform-origin: bottom center; }
      `}</style>

      {/* Disco Floor Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black">
        {isPlaying && (
          <>
            {/* Spinning lights */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,0,128,0.2)_20deg,transparent_40deg,rgba(0,255,255,0.2)_60deg,transparent_80deg)] animate-[spin_5s_linear_infinite] pointer-events-none"></div>
            {/* Flashing floor */}
            <div className="absolute bottom-0 w-full h-1/2 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:40px_40px] opacity-20 animate-[pulse_1s_infinite]"></div>
          </>
        )}
      </div>

      {/* Header */}
      <div className="relative z-10 pt-6 mb-2 text-center">
        <h2 className={`text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)] ${isPlaying ? 'animate-bounce' : ''}`}>
          {formation === 'circle' ? "CIRCLE TIME!" : "DANCE FLOOR"}
        </h2>
      </div>

      {/* DANCE STAGE CONTAINER */}
      <div className="flex-1 w-full relative z-10 flex items-center justify-center overflow-hidden perspective-[1000px]">
         
         {/* Layout Container */}
         <div className={`transition-all duration-1000 ${formation === 'line' ? 'flex items-end justify-center w-full max-w-6xl px-4' : 'relative w-[600px] h-[400px]'}`}>
            {guests.map((g, i) => (
              <Stickman 
                key={i} 
                name={g.name} 
                color={g.color} 
                isDancing={isDancing}
                formation={formation}
                index={i}
                total={guests.length}
                isUser={g.isUser}
                isBirthdayGirl={g.isBirthdayGirl}
              />
            ))}
         </div>

      </div>

      {/* Controls */}
      <div className="relative z-20 w-full bg-slate-900/90 backdrop-blur border-t border-slate-700 p-4 flex flex-col md:flex-row items-center justify-center gap-6 shadow-2xl">
         <div className="flex gap-4">
            <Button onClick={toggleMusic} variant={isPlaying ? 'danger' : 'primary'} className="w-48 shadow-purple-500/50 text-xl py-4">
               {isPlaying ? 'STOP MUSIC ⏹️' : 'LET\'S PARTY! 🎵'}
            </Button>
         </div>

         <Button onClick={() => { music.stop(); onComplete(); }} className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-extrabold border-none shadow-lg hover:shadow-yellow-500/50 transform hover:scale-110 transition-all ml-auto">
            CAKE TIME 🎂
         </Button>
      </div>
    </div>
  );
};

export default Playground;