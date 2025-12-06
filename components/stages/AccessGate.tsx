import React, { useState, useEffect, useRef } from 'react';
import { sfx } from '../../services/audioService';

interface AccessGateProps {
  onUnlock: () => void;
}

const AccessGate: React.FC<AccessGateProps> = ({ onUnlock }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const textIndex = useRef(0);
  const fullText = "> SYSTEM LOCKED.\n> AUTHENTICATION REQUIRED.\n> ENTER PASSCODE:";

  useEffect(() => {
    const typeWriter = setInterval(() => {
      if (textIndex.current < fullText.length) {
        setDisplayedText(prev => prev + fullText.charAt(textIndex.current));
        textIndex.current++;
      } else {
        clearInterval(typeWriter);
      }
    }, 50);
    return () => clearInterval(typeWriter);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple hardcoded password check
    if (code.trim().toUpperCase() === 'CHICKEN') {
      setSuccess(true);
      sfx.cheer(); // Play success sound
      setTimeout(onUnlock, 1500); // Wait a bit for effect before switching
    } else {
      setError(true);
      sfx.explosion(); // Play error sound (using explosion for dramatic effect)
      setCode('');
      setTimeout(() => setError(false), 1000);
    }
  };

  return (
    <div className="h-full w-full bg-black text-green-500 font-mono flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Matrix-like background effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none select-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="absolute text-xs" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `pulse ${1 + Math.random()}s infinite`
          }}>
            {Math.random() > 0.5 ? '1' : '0'}
          </div>
        ))}
      </div>

      <div className="max-w-lg w-full z-10 border border-green-900 bg-black/80 p-8 rounded shadow-[0_0_20px_rgba(34,197,94,0.2)]">
        <div className="mb-8 text-xl min-h-[100px] whitespace-pre-line leading-relaxed">
          {displayedText}
          <span className="animate-pulse">_</span>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-700">{'>'}</span>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="TYPE CODE HERE..."
              autoFocus
              disabled={success}
              className={`w-full bg-gray-900 border-2 ${error ? 'border-red-500 text-red-500' : (success ? 'border-green-400 text-green-400' : 'border-green-800 text-green-500')} pl-10 pr-4 py-4 rounded font-mono text-xl outline-none focus:border-green-500 focus:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all uppercase placeholder-green-900`}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={success}
            className={`mt-4 py-4 px-6 font-bold tracking-widest transition-all ${success ? 'bg-green-500 text-black scale-105' : 'bg-green-900/30 text-green-500 border border-green-700 hover:bg-green-800 hover:text-green-300'}`}
          >
            {success ? 'ACCESS GRANTED' : (error ? 'ACCESS DENIED' : 'UNLOCK SYSTEM')}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-green-900 text-xs text-green-800 flex justify-between">
          <span>SECURE_CONNECTION: ESTABLISHED</span>
          <span className="animate-pulse">HINT: THE BIRD FROM BEFORE</span>
        </div>
      </div>
    </div>
  );
};

export default AccessGate;