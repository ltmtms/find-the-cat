export interface HitBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Level {
  id: number;
  name: string;
  image: string;
  countdown: number;
  hitBox: HitBox;
}

export interface LevelsData {
  levels: Level[];
}

export type GamePhase = 'start' | 'playing' | 'success' | 'fail' | 'gameover' | 'victory';
