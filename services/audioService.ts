/// <reference lib="dom" />
// Simple synth to generate sounds without needing external files
// This ensures the app works immediately without 404s on audio files.

// Fix: cast window to any to avoid property missing error on Window type
const audioCtx = new ((window as any).AudioContext || (window as any).webkitAudioContext)();

export const playTone = (freq: number, type: OscillatorType, duration: number, delay = 0) => {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
  
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start(audioCtx.currentTime + delay);
  osc.stop(audioCtx.currentTime + delay + duration);
};

export const playNoise = (duration: number) => {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  
  noise.connect(gain);
  gain.connect(audioCtx.destination);
  noise.start();
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