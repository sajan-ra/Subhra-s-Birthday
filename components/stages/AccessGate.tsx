import React, { useState, useEffect, useRef } from 'react';
import { sfx } from '../../services/audioService';

interface AccessGateProps {
  onUnlock: (isAdmin: boolean, name: string) => void;
}

const AccessGate: React.FC<AccessGateProps> = ({ onUnlock }) => {
  const [identity, setIdentity] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const textIndex = useRef(0);
  const fullText = "> SYSTEM LOCKED.\n> IDENTITY VERIFICATION INITIATED.\n> PLEASE ENTER CREDENTIALS:";

  useEffect(() => {
    const typeWriter = setInterval(() => {
      if (textIndex.current < fullText.length) {
        setDisplayedText(prev => prev + fullText.charAt(textIndex.current));
        textIndex.current++;
      } else {
        clearInterval(typeWriter);
      }
    }, 40);
    return () => clearInterval(typeWriter);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation for identity
    if (!identity.trim()) {
      setError(true);
      sfx.explosion();
      setTimeout(() => setError(false), 1000);
      return;
    }

    const normalizedId = identity.trim().toLowerCase();
    const isAdminUser = normalizedId === 'subh';

    // Passcode check
    if (code.trim().toUpperCase() === 'CHICKEN') {
      setSuccess(true);
      
      if (isAdminUser) {
        sfx.cheer(); // You might want a specific admin sound later
        // Visual feedback for admin
        setDisplayedText(prev => prev + "\n\n> ROOT USER DETECTED.\n> ADMIN PRIVILEGES: GRANTED.");
      } else {
        sfx.cheer(); 
      }

      setTimeout(() => onUnlock(isAdminUser, identity.trim()), 1500); 
    } else {
      setError(true);
      sfx.explosion();
      setCode('');
      setTimeout(() => setError(false), 1000);
    }
  };

  const inputBaseStyle = `w-full bg-gray-900 border-2 pl-10 pr-4 py-3 rounded font-mono text-lg outline-none transition-all uppercase placeholder-green-900 mb-1`;
  const normalStyle = "border-green-800 text-green-500 focus:border-green-500 focus:shadow-[0_0_15px_rgba(34,197,94,0.3)]";
  const errorStyle = "border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]";
  const successStyle = "border-green-400 text-green-400 bg-green-900/20";

  const getStyle = () => {
    if (success) return successStyle;
    if (error) return errorStyle;
    return normalStyle;
  };

  return (
    <div className="h-full w-full bg-black text-green-500 font-mono flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Matrix-like background effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none select-none overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="absolute text-xs" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `pulse ${1 + Math.random()}s infinite`
          }}>
            {Math.random() > 0.5 ? '1' : '0'}
          </div>
        ))}
      </div>

      <div className="max-w-lg w-full z-10 border border-green-900 bg-black/90 p-8 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.15)] backdrop-blur-sm">
        <div className="mb-6 text-lg min-h-[80px] whitespace-pre-line leading-relaxed font-bold">
          {displayedText}
          <span className="animate-pulse inline-block w-3 h-5 bg-green-500 ml-1 align-middle"></span>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Identity Input */}
          <div>
            <label className="block text-xs font-bold text-green-700 mb-1 tracking-widest">&gt;&gt; AGENT_ID (NAME/EMAIL)</label>
            <div className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${error ? 'text-red-700' : 'text-green-700'}`}>{'>'}</span>
              <input
                type="text"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                placeholder="ENTER IDENTIFIER..."
                autoFocus
                disabled={success}
                className={`${inputBaseStyle} ${getStyle()}`}
              />
            </div>
          </div>

          {/* Passcode Input */}
          <div>
            <label className="block text-xs font-bold text-green-700 mb-1 tracking-widest">&gt;&gt; SECURITY_CODE</label>
            <div className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${error ? 'text-red-700' : 'text-green-700'}`}>{'>'}</span>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="ENTER PASSCODE..."
                disabled={success}
                className={`${inputBaseStyle} ${getStyle()}`}
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={success}
            className={`mt-2 py-4 px-6 font-bold tracking-[0.2em] transition-all transform hover:scale-[1.02] active:scale-[0.98] rounded ${success ? 'bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.5)]' : 'bg-green-900/20 text-green-500 border border-green-700 hover:bg-green-900/40 hover:text-green-300 hover:border-green-500'}`}
          >
            {success ? 'ACCESS GRANTED' : (error ? 'ACCESS DENIED' : 'AUTHENTICATE')}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-green-900/50 text-[10px] text-green-800 flex justify-between uppercase">
          <span>Encryption: AES-256</span>
          <span className="animate-pulse">Status: WAITING...</span>
        </div>
      </div>
    </div>
  );
};

export default AccessGate;