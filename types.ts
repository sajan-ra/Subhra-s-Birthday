export enum AppStage {
  LOADING = 'LOADING',
  LANDING = 'LANDING',
  EGG_REVEAL = 'EGG_REVEAL',
  PLAYGROUND = 'PLAYGROUND',
  CAKE = 'CAKE'
}

export interface AudioContextType {
  playCluck: () => void;
  playPop: () => void;
  playCrack: () => void;
  playExplosion: () => void;
  playSlice: () => void;
  playCheer: () => void;
  toggleMusic: () => void;
  isMuted: boolean;
}
