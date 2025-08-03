export interface FruitType {
  id: number;
  name: string;
  radius: number;
  color: string;
  score: number;
}

export interface Fruit {
  id: string;
  type: FruitType;
  x: number;
  y: number;
  body?: Matter.Body;
}

export interface GameState {
  score: number;
  fruits: Fruit[];
  nextFruitType: FruitType;
  isGameOver: boolean;
  isDropping: boolean;
}

export interface GameConfig {
  width: number;
  height: number;
  dropZoneHeight: number;
  gameOverLine: number;
}