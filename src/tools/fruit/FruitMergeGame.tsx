import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { GameState, Fruit } from './types';
import { GAME_CONFIG, FRUIT_TYPES, getRandomDroppableFruitType } from './constants';
import { PhysicsEngine } from './physics';
import { Button } from '@/components/ui/button';

const FruitMergeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const physicsEngineRef = useRef<PhysicsEngine | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    fruits: [],
    nextFruitType: getRandomDroppableFruitType(),
    isGameOver: false,
    isDropping: false,
  });
  const [dropPosition, setDropPosition] = useState<number>(GAME_CONFIG.width / 2);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);

  const handleMerge = useCallback((fruit1: Fruit, fruit2: Fruit, newFruit: Fruit) => {
    setGameState(prev => ({
      ...prev,
      score: prev.score + fruit1.type.score + fruit2.type.score + newFruit.type.score,
    }));
  }, []);

  const handleGameOver = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isGameOver: true,
    }));
  }, []);

  const initializeGame = useCallback(() => {
    if (!canvasRef.current) return;

    // Clean up existing engine
    if (physicsEngineRef.current) {
      physicsEngineRef.current.destroy();
    }

    // Create new physics engine
    physicsEngineRef.current = new PhysicsEngine(
      canvasRef.current,
      GAME_CONFIG,
      handleMerge,
      handleGameOver
    );

    setGameState({
      score: 0,
      fruits: [],
      nextFruitType: getRandomDroppableFruitType(),
      isGameOver: false,
      isDropping: false,
    });
    setIsGameStarted(true);
  }, [handleMerge, handleGameOver]);

  const dropFruit = useCallback(() => {
    if (!physicsEngineRef.current || gameState.isDropping || gameState.isGameOver) return;

    setGameState(prev => ({ ...prev, isDropping: true }));

    // Create fruit at drop position
    const fruit = physicsEngineRef.current!.createFruit(
      gameState.nextFruitType,
      dropPosition,
      50
    );

    // Update game state
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        isDropping: false,
        nextFruitType: getRandomDroppableFruitType(),
        fruits: [...prev.fruits, fruit],
      }));
    }, 500);
  }, [dropPosition, gameState.isDropping, gameState.isGameOver, gameState.nextFruitType]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || gameState.isDropping || gameState.isGameOver) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const constrainedX = Math.max(
      gameState.nextFruitType.radius,
      Math.min(GAME_CONFIG.width - gameState.nextFruitType.radius, x)
    );
    setDropPosition(constrainedX);
  }, [gameState.isDropping, gameState.isGameOver, gameState.nextFruitType.radius]);

  const handleClick = useCallback(() => {
    if (isGameStarted) {
      dropFruit();
    }
  }, [isGameStarted, dropFruit]);

  const restartGame = useCallback(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    const updateLoop = () => {
      if (physicsEngineRef.current) {
        physicsEngineRef.current.updateFruitPositions();
      }
      requestAnimationFrame(updateLoop);
    };

    if (isGameStarted) {
      updateLoop();
    }

    return () => {
      if (physicsEngineRef.current) {
        physicsEngineRef.current.destroy();
      }
    };
  }, [isGameStarted]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
          Fruit Merge Game
        </h1>
        
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Game Canvas */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {/* Drop line indicator */}
              {isGameStarted && !gameState.isGameOver && (
                <>
                  <div 
                    className="absolute top-0 w-0.5 bg-red-400 opacity-50 pointer-events-none z-10"
                    style={{
                      height: `${GAME_CONFIG.dropZoneHeight}px`,
                      left: `${dropPosition}px`,
                      transform: 'translateX(-50%)',
                    }}
                  />
                  {/* Next fruit preview */}
                  <div
                    className="absolute rounded-full opacity-70 pointer-events-none z-10 border-2 border-gray-400"
                    style={{
                      width: `${gameState.nextFruitType.radius * 2}px`,
                      height: `${gameState.nextFruitType.radius * 2}px`,
                      backgroundColor: gameState.nextFruitType.color,
                      left: `${dropPosition}px`,
                      top: `${50 - gameState.nextFruitType.radius}px`,
                      transform: 'translateX(-50%)',
                    }}
                  />
                </>
              )}
              
              <canvas
                ref={canvasRef}
                width={GAME_CONFIG.width}
                height={GAME_CONFIG.height}
                className="border-2 border-gray-400 rounded cursor-crosshair"
                onMouseMove={handleMouseMove}
                onClick={handleClick}
                style={{ display: isGameStarted ? 'block' : 'none' }}
              />
              
              {/* Game over overlay */}
              {gameState.isGameOver && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                  <div className="bg-white p-6 rounded-lg text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Game Over!</h2>
                    <p className="text-lg mb-4">Final Score: {gameState.score}</p>
                    <Button onClick={restartGame}>Play Again</Button>
                  </div>
                </div>
              )}
            </div>
            
            {!isGameStarted && (
              <div className="text-center">
                <div 
                  className="border-2 border-gray-400 rounded mb-4 bg-gray-100 flex items-center justify-center"
                  style={{ 
                    width: GAME_CONFIG.width, 
                    height: GAME_CONFIG.height 
                  }}
                >
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Fruit Merge Game</h2>
                    <p className="text-gray-600 mb-6 max-w-md">
                      Drop fruits to merge them! Same fruits combine into bigger ones. 
                      Don't let them reach the red line!
                    </p>
                    <Button onClick={initializeGame} size="lg">
                      Start Game
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Game Info Panel */}
          <div className="flex flex-col gap-4 lg:min-w-[300px]">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Score</h3>
              <p className="text-2xl font-bold text-blue-600">{gameState.score}</p>
            </div>

            {isGameStarted && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Next Fruit</h3>
                <div className="flex items-center gap-2">
                  <div
                    className="rounded-full border-2 border-gray-300"
                    style={{
                      width: `${gameState.nextFruitType.radius}px`,
                      height: `${gameState.nextFruitType.radius}px`,
                      backgroundColor: gameState.nextFruitType.color,
                    }}
                  />
                  <span className="font-medium">{gameState.nextFruitType.name}</span>
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Fruit Types</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {FRUIT_TYPES.map((fruit) => (
                  <div key={fruit.id} className="flex items-center gap-2">
                    <div
                      className="rounded-full border border-gray-300"
                      style={{
                        width: `${Math.max(12, fruit.radius / 2)}px`,
                        height: `${Math.max(12, fruit.radius / 2)}px`,
                        backgroundColor: fruit.color,
                      }}
                    />
                    <span className="truncate">{fruit.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">How to Play</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Move mouse to aim</li>
                <li>• Click to drop fruit</li>
                <li>• Merge same fruits</li>
                <li>• Don't hit the red line!</li>
              </ul>
            </div>

            {isGameStarted && (
              <Button 
                onClick={restartGame} 
                variant="outline"
                className="w-full"
              >
                Restart Game
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FruitMergeGame;