/// <reference lib="dom" />
import React, { useState } from 'react';
import Landing from './components/stages/Landing';
import EggReveal from './components/stages/EggReveal';
import Playground from './components/stages/Playground';
import Cake3D from './components/stages/Cake3D';
import AccessGate from './components/stages/AccessGate';
import { AppStage } from './types';

const App: React.FC = () => {
  // Start directly at Access Code, skipping the fake loading screen
  const [stage, setStage] = useState<AppStage>(AppStage.ACCESS_CODE);

  const renderStage = () => {
    switch (stage) {
      case AppStage.LOADING:
        // Fallback if needed, but not used in initial flow anymore
        return (
          <div className="flex flex-col items-center justify-center h-screen bg-black">
             <div className="text-6xl animate-pulse mb-4">🔒</div>
          </div>
        );
      case AppStage.ACCESS_CODE:
        return <AccessGate onUnlock={() => setStage(AppStage.LANDING)} />;
      case AppStage.LANDING:
        return <Landing onComplete={() => setStage(AppStage.EGG_REVEAL)} />;
      case AppStage.EGG_REVEAL:
        return <EggReveal onComplete={() => setStage(AppStage.PLAYGROUND)} />;
      case AppStage.PLAYGROUND:
        return <Playground onComplete={() => setStage(AppStage.CAKE)} />;
      case AppStage.CAKE:
        return <Cake3D onRestart={() => setStage(AppStage.ACCESS_CODE)} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden">
      {renderStage()}
      
      {/* Background Music Toggle (Mock visual) */}
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={() => window.alert("Imagine soft jazz music playing here! (Audio policy usually requires interaction first)")}
          className="bg-white/50 p-2 rounded-full hover:bg-white/80 transition-colors"
        >
          🎵
        </button>
      </div>
    </div>
  );
};

export default App;