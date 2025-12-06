/// <reference lib="dom" />
import React, { useState, useEffect } from 'react';
import Landing from './components/stages/Landing';
import EggReveal from './components/stages/EggReveal';
import Playground from './components/stages/Playground';
import Cake3D from './components/stages/Cake3D';
import { AppStage } from './types';
import { playNoise } from './services/audioService';

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.LOADING);

  // Preloading simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setStage(AppStage.LANDING);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const renderStage = () => {
    switch (stage) {
      case AppStage.LOADING:
        return (
          <div className="flex flex-col items-center justify-center h-screen bg-pink-100">
             <div className="text-6xl animate-spin mb-4">🧁</div>
             <h1 className="text-2xl text-pink-600 font-bold">Preparing Birthday Magic...</h1>
          </div>
        );
      case AppStage.LANDING:
        return <Landing onComplete={() => setStage(AppStage.EGG_REVEAL)} />;
      case AppStage.EGG_REVEAL:
        return <EggReveal onComplete={() => setStage(AppStage.PLAYGROUND)} />;
      case AppStage.PLAYGROUND:
        return <Playground onComplete={() => setStage(AppStage.CAKE)} />;
      case AppStage.CAKE:
        return <Cake3D onRestart={() => setStage(AppStage.LANDING)} />;
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