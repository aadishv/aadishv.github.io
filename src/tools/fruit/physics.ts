import Matter from 'matter-js';
import type { Fruit, FruitType, GameConfig } from './types';
import { GAME_CONFIG, getNextFruitType } from './constants';

export class PhysicsEngine {
  private engine: Matter.Engine;
  private world: Matter.World;
  private render?: Matter.Render;
  private runner?: Matter.Runner;
  private onMerge?: (fruit1: Fruit, fruit2: Fruit, newFruit: Fruit) => void;
  private onGameOver?: () => void;
  private fruits: Map<string, Fruit> = new Map();

  constructor(
    canvas: HTMLCanvasElement,
    config: GameConfig,
    onMerge?: (fruit1: Fruit, fruit2: Fruit, newFruit: Fruit) => void,
    onGameOver?: () => void
  ) {
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
    this.onMerge = onMerge;
    this.onGameOver = onGameOver;

    // Set up gravity
    this.engine.gravity.y = GAME_CONFIG.gravity;

    // Set up renderer
    this.render = Matter.Render.create({
      canvas,
      engine: this.engine,
      options: {
        width: config.width,
        height: config.height,
        wireframes: false,
        background: '#f0f8ff',
        showVelocity: false,
        showAngleIndicator: false,
      },
    });

    // Create walls
    this.createWalls(config);

    // Set up collision detection
    this.setupCollisionDetection();

    // Start the renderer and runner
    Matter.Render.run(this.render);
    this.runner = Matter.Runner.create();
    Matter.Runner.run(this.runner, this.engine);
  }

  private createWalls(config: GameConfig): void {
    const walls = [
      // Left wall
      Matter.Bodies.rectangle(
        -GAME_CONFIG.wallThickness / 2,
        config.height / 2,
        GAME_CONFIG.wallThickness,
        config.height,
        { isStatic: true, render: { fillStyle: '#8B4513' } }
      ),
      // Right wall
      Matter.Bodies.rectangle(
        config.width + GAME_CONFIG.wallThickness / 2,
        config.height / 2,
        GAME_CONFIG.wallThickness,
        config.height,
        { isStatic: true, render: { fillStyle: '#8B4513' } }
      ),
      // Bottom wall
      Matter.Bodies.rectangle(
        config.width / 2,
        config.height + GAME_CONFIG.wallThickness / 2,
        config.width + GAME_CONFIG.wallThickness * 2,
        GAME_CONFIG.wallThickness,
        { isStatic: true, render: { fillStyle: '#8B4513' } }
      ),
    ];

    Matter.World.add(this.world, walls);
  }

  private setupCollisionDetection(): void {
    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        const fruitA = this.findFruitByBody(bodyA);
        const fruitB = this.findFruitByBody(bodyB);

        if (fruitA && fruitB && fruitA.type.id === fruitB.type.id) {
          this.mergeFruits(fruitA, fruitB);
        }
      });
    });
  }

  private findFruitByBody(body: Matter.Body): Fruit | undefined {
    for (const fruit of this.fruits.values()) {
      if (fruit.body === body) {
        return fruit;
      }
    }
    return undefined;
  }

  private mergeFruits(fruit1: Fruit, fruit2: Fruit): void {
    const nextType = getNextFruitType(fruit1.type);
    if (!nextType) return;

    // Calculate merge position
    const x = (fruit1.x + fruit2.x) / 2;
    const y = (fruit1.y + fruit2.y) / 2;

    // Remove old fruits
    this.removeFruit(fruit1);
    this.removeFruit(fruit2);

    // Create new merged fruit
    const newFruit = this.createFruit(nextType, x, y);

    // Trigger merge callback
    if (this.onMerge) {
      this.onMerge(fruit1, fruit2, newFruit);
    }
  }

  public createFruit(type: FruitType, x: number, y: number): Fruit {
    const fruitId = `fruit_${Date.now()}_${Math.random()}`;
    
    const body = Matter.Bodies.circle(x, y, type.radius, {
      restitution: GAME_CONFIG.restitution,
      friction: GAME_CONFIG.friction,
      density: 0.001,
      render: {
        fillStyle: type.color,
        strokeStyle: '#333',
        lineWidth: 2,
      },
    });

    const fruit: Fruit = {
      id: fruitId,
      type,
      x,
      y,
      body,
    };

    Matter.World.add(this.world, body);
    this.fruits.set(fruitId, fruit);

    return fruit;
  }

  public removeFruit(fruit: Fruit): void {
    if (fruit.body) {
      Matter.World.remove(this.world, fruit.body);
    }
    this.fruits.delete(fruit.id);
  }

  public updateFruitPositions(): void {
    this.fruits.forEach((fruit) => {
      if (fruit.body) {
        fruit.x = fruit.body.position.x;
        fruit.y = fruit.body.position.y;

        // Check for game over condition
        if (fruit.y < GAME_CONFIG.gameOverLine && this.onGameOver) {
          this.onGameOver();
        }
      }
    });
  }

  public getAllFruits(): Fruit[] {
    return Array.from(this.fruits.values());
  }

  public destroy(): void {
    if (this.render) {
      Matter.Render.stop(this.render);
    }
    if (this.runner) {
      Matter.Runner.stop(this.runner);
    }
    Matter.Engine.clear(this.engine);
  }
}