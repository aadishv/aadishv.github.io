import type { FruitType } from './types';

// Suika-style fruit progression from smallest to largest
export const FRUIT_TYPES: FruitType[] = [
  { id: 0, name: 'Cherry', radius: 15, color: '#ff6b6b', score: 1 },
  { id: 1, name: 'Strawberry', radius: 18, color: '#ff8e8e', score: 3 },
  { id: 2, name: 'Grape', radius: 22, color: '#9c88ff', score: 6 },
  { id: 3, name: 'Orange', radius: 25, color: '#ffa726', score: 10 },
  { id: 4, name: 'Persimmon', radius: 28, color: '#ff7043', score: 15 },
  { id: 5, name: 'Apple', radius: 32, color: '#ef5350', score: 21 },
  { id: 6, name: 'Pear', radius: 35, color: '#9ccc65', score: 28 },
  { id: 7, name: 'Peach', radius: 38, color: '#ffb74d', score: 36 },
  { id: 8, name: 'Pineapple', radius: 42, color: '#ffca28', score: 45 },
  { id: 9, name: 'Melon', radius: 45, color: '#81c784', score: 55 },
  { id: 10, name: 'Watermelon', radius: 50, color: '#4caf50', score: 66 },
];

export const GAME_CONFIG = {
  width: 600,
  height: 800,
  dropZoneHeight: 100,
  gameOverLine: 150,
  wallThickness: 10,
  gravity: 0.001,
  restitution: 0.3,
  friction: 0.5,
} as const;

export const getRandomDroppableFruitType = (): FruitType => {
  // Only allow dropping the first 5 fruit types (smaller ones)
  const droppableTypes = FRUIT_TYPES.slice(0, 5);
  return droppableTypes[Math.floor(Math.random() * droppableTypes.length)];
};

export const getNextFruitType = (currentType: FruitType): FruitType | null => {
  if (currentType.id >= FRUIT_TYPES.length - 1) return null;
  return FRUIT_TYPES[currentType.id + 1];
};