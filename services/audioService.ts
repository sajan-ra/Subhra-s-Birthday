/// <reference lib="dom" />
// Simple synth to generate sounds without needing external files

let audioCtx: AudioContext | null = null;

const getAudioCtx = () => {
  if (!audioCtx) {
    audioCtx = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const playTone = (freq: number, type: OscillatorType, duration: number, delay = 0) => {
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
  
  gain.gain.setValueAtTime(0.1, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
};

export const playNoise = (duration: number) => {
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') ctx.resume();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  noise.connect(gain);
  gain.connect(ctx.destination);
  noise.start();
};

// Music Sequencer
let beatInterval: number | null = null;
let noteIndex = 0;

export const music = {
  start: () => {
    if (beatInterval) return;
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const bassLine = [110, 110, 146, 146, 98, 98, 130, 130]; 
    
    beatInterval = window.setInterval(() => {
      const time = ctx.currentTime;
      
      // Kick drum
      const kOsc = ctx.createOscillator();
      const kGain = ctx.createGain();
      kOsc.connect(kGain);
      kGain.connect(ctx.destination);
      kOsc.frequency.setValueAtTime(150, time);
      kOsc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
      kGain.gain.setValueAtTime(0.8, time);
      kGain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
      kOsc.start(time);
      kOsc.stop(time + 0.5);

      // Hi-hat
      setTimeout(() => {
         playNoise(0.05);
      }, 250); 

      // Bass synth
      const note = bassLine[noteIndex % bassLine.length];
      const bOsc = ctx.createOscillator();
      const bGain = ctx.createGain();
      bOsc.type = 'sawtooth';
      bOsc.connect(bGain);
      bGain.connect(ctx.destination);
      bOsc.frequency.setValueAtTime(note, time);
      bGain.gain.setValueAtTime(0.1, time);
      bGain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
      bOsc.start(time);
      bOsc.stop(time + 0.4);

      noteIndex++;
    }, 500);
  },
  stop: () => {
    if (beatInterval) {
      clearInterval(beatInterval);
      beatInterval = null;
    }
  }
};

export const sfx = {
  cluck: () => {
    playTone(300, 'sawtooth', 0.1);
    playTone(250, 'sawtooth', 0.1, 0.1);
  },
  pop: () => playTone(600, 'sine', 0.05),
  crack: () => {
    playNoise(0.05);
    playTone(800, 'square', 0.02, 0.02);
  },
  explosion: () => {
    playNoise(1.5);
    playTone(50, 'sawtooth', 1.0);
  },
  slice: () => playNoise(0.2),
  cheer: () => {
    [300, 400, 500, 600, 700].forEach((f, i) => playTone(f, 'sine', 0.5, i * 0.1));
  }
};