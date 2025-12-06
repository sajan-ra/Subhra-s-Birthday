/// <reference lib="dom" />
import React, { useState } from 'react';
import Landing from './components/stages/Landing';
import EggReveal from './components/stages/EggReveal';
import Playground from './components/stages/Playground';
import Cake3D from './components/stages/Cake3D';
import AccessGate from './components/stages/AccessGate';
import { AppStage } from './types';
import { playBirthdaySong } from './services/audioService';

const App: React.FC = () => {
  // Start directly at Access Code
  const [stage, setStage] = useState<AppStage>(AppStage.ACCESS_CODE);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState<string>("");

  const renderStage = () => {
    switch (stage) {
      case AppStage.LOADING:
        return (
          <div className="flex flex-col items-center justify-center h-screen bg-black">
             <div className="text-6xl animate-pulse mb-4">🔒</div>
          </div>
        );
      case AppStage.ACCESS_CODE:
        return <AccessGate onUnlock={(admin, name) => {
          setIsAdmin(admin);
          setUserName(name);
          setStage(AppStage.LANDING);
          // Play song immediately after unlock
          playBirthdaySong();
        }} />;
      case AppStage.LANDING:
        return <Landing onComplete={() => setStage(AppStage.EGG_REVEAL)} />;
      case AppStage.EGG_REVEAL:
        return <EggReveal onComplete={() => setStage(AppStage.PLAYGROUND)} />;
      case AppStage.PLAYGROUND:
        return <Playground userName={userName} onComplete={() => setStage(AppStage.CAKE)} />;
      case AppStage.CAKE:
        return <Cake3D userName={userName} onRestart={() => setStage(AppStage.ACCESS_CODE)} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden">
      {renderStage()}
      
      {/* Admin indicator (Optional, effectively invisible unless we style it up) */}
      {isAdmin && (
        <div className="fixed top-2 left-2 z-50 pointer-events-none opacity-50">
          <span className="text-[10px] font-mono text-green-500 bg-black/80 px-2 py-1 rounded">ADMIN MODE</span>
        </div>
      )}
    </div>
  );
};

export default App;