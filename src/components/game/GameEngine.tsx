import React, { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Fullscreen } from "lucide-react";

export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
export type Difficulty = "EASY" | "MEDIUM" | "HARD" | "EXTREME";

export type Position = {
  x: number;
  y: number;
};

export type Obstacle = {
  x: number;
  y: number;
  type: "rock" | "tree" | "water";
};

export type GameState = {
  snake: Position[];
  food: Position;
  direction: Direction;
  gameOver: boolean;
  paused: boolean;
  score: number;
  difficulty: Difficulty;
  gridSize: number;
  cameraOffset: Position;
  obstacles: Obstacle[];
  distanceTraveled: number;
};

type GameEngineProps = {
  initialDifficulty?: Difficulty;
  onGameOver?: (score: number, distance: number) => void;
};

const difficultySettings = {
  EASY: { speed: 200, gridSize: 60, obstacleFrequency: 0.03 },
  MEDIUM: { speed: 150, gridSize: 80, obstacleFrequency: 0.05 },
  HARD: { speed: 100, gridSize: 100, obstacleFrequency: 0.07 },
  EXTREME: { speed: 70, gridSize: 120, obstacleFrequency: 0.1 },
};

const VISIBLE_GRID_SIZE = 20; // How many cells are visible in the viewport at once

const GameEngine: React.FC<GameEngineProps> = ({
  initialDifficulty = "MEDIUM",
  onGameOver,
}) => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Game state
  const [gameState, setGameState] = useState<GameState>(() => {
    const gridSize = difficultySettings[initialDifficulty].gridSize;
    const startX = Math.floor(gridSize / 2);
    const startY = Math.floor(gridSize / 2);
    
    return {
      snake: [{ x: startX, y: startY }, { x: startX - 1, y: startY }],
      food: { x: startX + 5, y: startY },
      direction: "RIGHT",
      gameOver: false,
      paused: false,
      score: 0,
      difficulty: initialDifficulty,
      gridSize: gridSize,
      cameraOffset: { x: startX - Math.floor(VISIBLE_GRID_SIZE / 2), y: startY - Math.floor(VISIBLE_GRID_SIZE / 2) },
      obstacles: [],
      distanceTraveled: 0,
    };
  });
  
  // Game settings
  const gridSize = gameState.gridSize;
  const visibleCellSize = 100 / VISIBLE_GRID_SIZE; // percentage-based for responsive design
  const speed = difficultySettings[gameState.difficulty].speed;
  const obstacleFrequency = difficultySettings[gameState.difficulty].obstacleFrequency;
  
  // Game refs
  const gameLoopRef = useRef<number | null>(null);
  const lastRenderTimeRef = useRef<number>(0);
  const directionQueueRef = useRef<Direction[]>([]);
  
  // Helper functions
  const getRandomPositionInView = useCallback((): Position => {
    const head = gameState.snake[0];
    const cameraCenter = {
      x: gameState.cameraOffset.x + Math.floor(VISIBLE_GRID_SIZE / 2),
      y: gameState.cameraOffset.y + Math.floor(VISIBLE_GRID_SIZE / 2)
    };
    
    // Generate position ahead of the snake in its direction of travel
    let viewDistance = 15; // How far ahead to spawn objects
    let spawnX, spawnY;
    
    switch (gameState.direction) {
      case "RIGHT":
        spawnX = head.x + viewDistance + Math.floor(Math.random() * 10);
        spawnY = head.y + (Math.random() * 10 - 5);
        break;
      case "LEFT":
        spawnX = head.x - viewDistance - Math.floor(Math.random() * 10);
        spawnY = head.y + (Math.random() * 10 - 5);
        break;
      case "UP":
        spawnX = head.x + (Math.random() * 10 - 5);
        spawnY = head.y - viewDistance - Math.floor(Math.random() * 10);
        break;
      case "DOWN":
        spawnX = head.x + (Math.random() * 10 - 5);
        spawnY = head.y + viewDistance + Math.floor(Math.random() * 10);
        break;
    }
    
    return { 
      x: Math.floor(Math.max(0, Math.min(gridSize - 1, spawnX))), 
      y: Math.floor(Math.max(0, Math.min(gridSize - 1, spawnY))) 
    };
  }, [gameState.direction, gameState.snake, gameState.cameraOffset, gridSize]);
  
  const getRandomFoodPosition = useCallback((): Position => {
    const newPosition = getRandomPositionInView();
    
    // Check if the food is on the snake or obstacles
    const isOnSnake = gameState.snake.some(segment => 
      segment.x === newPosition.x && segment.y === newPosition.y
    );
    
    const isOnObstacle = gameState.obstacles.some(obstacle => 
      obstacle.x === newPosition.x && obstacle.y === newPosition.y
    );
    
    if (isOnSnake || isOnObstacle) {
      return getRandomFoodPosition();
    }
    
    return newPosition;
  }, [gameState.obstacles, gameState.snake, getRandomPositionInView]);
  
  const generateObstacles = useCallback(() => {
    if (Math.random() > obstacleFrequency) return [];
    
    const newObstacle = getRandomPositionInView();
    const isOnSnake = gameState.snake.some(segment => 
      segment.x === newObstacle.x && segment.y === newObstacle.y
    );
    
    const isOnFood = gameState.food.x === newObstacle.x && gameState.food.y === newObstacle.y;
    
    if (isOnSnake || isOnFood) {
      return [];
    }
    
    const obstacleTypes: ("rock" | "tree" | "water")[] = ["rock", "tree", "water"];
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    
    return [{ ...newObstacle, type }];
  }, [gameState.food, gameState.snake, getRandomPositionInView, obstacleFrequency]);
  
  const updateCamera = useCallback(() => {
    if (gameState.snake.length === 0) return { x: 0, y: 0 };
    
    const head = gameState.snake[0];
    // Determine camera offset to keep snake in center
    const offsetX = Math.max(0, Math.min(gridSize - VISIBLE_GRID_SIZE, head.x - Math.floor(VISIBLE_GRID_SIZE / 2)));
    const offsetY = Math.max(0, Math.min(gridSize - VISIBLE_GRID_SIZE, head.y - Math.floor(VISIBLE_GRID_SIZE / 2)));
    
    return { x: offsetX, y: offsetY };
  }, [gameState.snake, gridSize]);
  
  const resetGame = useCallback(() => {
    // Reset game state with centered snake
    const startX = Math.floor(gridSize / 2);
    const startY = Math.floor(gridSize / 2);
    
    setGameState({
      snake: [{ x: startX, y: startY }, { x: startX - 1, y: startY }],
      food: { x: startX + 5, y: startY },
      direction: "RIGHT",
      gameOver: false,
      paused: false,
      score: 0,
      difficulty: gameState.difficulty,
      gridSize,
      cameraOffset: { x: startX - Math.floor(VISIBLE_GRID_SIZE / 2), y: startY - Math.floor(VISIBLE_GRID_SIZE / 2) },
      obstacles: [],
      distanceTraveled: 0,
    });
    
    directionQueueRef.current = [];
    
    toast({
      title: "New Adventure Begins",
      description: `Difficulty: ${gameState.difficulty}`,
    });
  }, [gameState.difficulty, gridSize, toast]);
  
  const changeDifficulty = (newDifficulty: Difficulty) => {
    setGameState(prev => ({
      ...prev,
      difficulty: newDifficulty,
      gridSize: difficultySettings[newDifficulty].gridSize,
      gameOver: true, // End current game to restart with new settings
    }));
    
    toast({
      title: "Difficulty Changed",
      description: `New difficulty set to ${newDifficulty}`,
    });
  };
  
  const togglePause = () => {
    setGameState(prev => ({ ...prev, paused: !prev.paused }));
    
    if (gameState.paused) {
      toast({ title: "Adventure Resumed" });
    } else {
      toast({ title: "Adventure Paused" });
    }
  };
  
  const checkCollision = (head: Position): boolean => {
    // Check if snake hit itself (excluding the tail which will move)
    for (let i = 1; i < gameState.snake.length; i++) {
      if (gameState.snake[i].x === head.x && gameState.snake[i].y === head.y) {
        return true;
      }
    }
    
    // Check if snake hit an obstacle
    for (let i = 0; i < gameState.obstacles.length; i++) {
      if (gameState.obstacles[i].x === head.x && gameState.obstacles[i].y === head.y) {
        return true;
      }
    }
    
    return false;
  };
  
  const cleanupOffscreenObjects = useCallback(() => {
    const cameraMinX = gameState.cameraOffset.x - 10;
    const cameraMaxX = gameState.cameraOffset.x + VISIBLE_GRID_SIZE + 10;
    const cameraMinY = gameState.cameraOffset.y - 10;
    const cameraMaxY = gameState.cameraOffset.y + VISIBLE_GRID_SIZE + 10;
    
    // Clean up obstacles that are far from view
    const updatedObstacles = gameState.obstacles.filter(obstacle => {
      return (
        obstacle.x >= cameraMinX &&
        obstacle.x <= cameraMaxX &&
        obstacle.y >= cameraMinY &&
        obstacle.y <= cameraMaxY
      );
    });
    
    return updatedObstacles;
  }, [gameState.cameraOffset, gameState.obstacles]);
  
  const moveSnake = useCallback(() => {
    // Process direction queue (allows for quick turns)
    let newDirection = gameState.direction;
    if (directionQueueRef.current.length > 0) {
      const nextDirection = directionQueueRef.current.shift() as Direction;
      
      // Prevent 180-degree turns
      if (
        (newDirection === "UP" && nextDirection !== "DOWN") ||
        (newDirection === "DOWN" && nextDirection !== "UP") ||
        (newDirection === "LEFT" && nextDirection !== "RIGHT") ||
        (newDirection === "RIGHT" && nextDirection !== "LEFT")
      ) {
        newDirection = nextDirection;
      }
    }
    
    // Calculate new head position
    const head = { ...gameState.snake[0] };
    switch (newDirection) {
      case "UP":
        head.y -= 1;
        break;
      case "DOWN":
        head.y += 1;
        break;
      case "LEFT":
        head.x -= 1;
        break;
      case "RIGHT":
        head.x += 1;
        break;
    }
    
    // Update distance traveled
    const distanceTraveled = gameState.distanceTraveled + 1;
    
    // Check for collisions
    if (checkCollision(head)) {
      setGameState(prev => ({ ...prev, gameOver: true }));
      
      if (onGameOver) {
        onGameOver(gameState.score, distanceTraveled);
      }
      
      // Save high score if authenticated and score is higher than current high score
      if (isAuthenticated && user && gameState.score > (user.highScore || 0)) {
        // Update local storage first
        const updatedUser = { ...user, highScore: gameState.score };
        localStorage.setItem("snakeUser", JSON.stringify(updatedUser));
        
        // Update registered users array too
        const registeredUsers = localStorage.getItem("registeredUsers");
        if (registeredUsers) {
          const users = JSON.parse(registeredUsers);
          const updatedUsers = users.map((u: any) => 
            u.id === user.id ? { ...u, highScore: gameState.score } : u
          );
          localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
        }
        
        toast({
          title: "New High Score!",
          description: `You achieved a new personal best of ${gameState.score}!`,
        });
      }
      
      return;
    }
    
    // Create new snake array
    const newSnake = [head, ...gameState.snake];
    
    // Check if snake ate food
    let newFood = gameState.food;
    let newScore = gameState.score;
    let newObstacles = [...gameState.obstacles];
    
    if (head.x === gameState.food.x && head.y === gameState.food.y) {
      // Don't remove tail (snake grows)
      newFood = getRandomFoodPosition();
      newScore = gameState.score + 10;
      
      // Add new obstacles after eating food
      const obstacles = generateObstacles();
      if (obstacles.length > 0) {
        newObstacles = [...newObstacles, ...obstacles];
      }
    } else {
      // Remove tail
      newSnake.pop();
      
      // Occasionally generate obstacles during normal movement
      if (Math.random() < obstacleFrequency * 0.2) {
        const obstacles = generateObstacles();
        if (obstacles.length > 0) {
          newObstacles = [...newObstacles, ...obstacles];
        }
      }
    }
    
    // Clean up obstacles that are far from view
    newObstacles = cleanupOffscreenObjects();
    
    // Update camera position
    const newCameraOffset = updateCamera();
    
    // Update game state
    setGameState(prev => ({
      ...prev,
      snake: newSnake,
      food: newFood,
      direction: newDirection,
      score: newScore,
      obstacles: newObstacles,
      cameraOffset: newCameraOffset,
      distanceTraveled,
    }));
  }, [
    gameState, 
    getRandomFoodPosition, 
    isAuthenticated, 
    onGameOver, 
    user, 
    toast, 
    cleanupOffscreenObjects, 
    updateCamera,
    generateObstacles,
    obstacleFrequency
  ]);
  
  // Fullscreen handler
  const toggleFullscreen = () => {
    if (!gameContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().catch(err => {
        toast({
          title: "Fullscreen Error",
          description: `Error attempting to enable full-screen mode: ${err.message}`,
        });
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.gameOver) {
        if (e.key === " " || e.key === "Enter") {
          resetGame();
        }
        return;
      }
      
      if (e.key === " ") {
        togglePause();
        return;
      }
      
      if (gameState.paused) return;
      
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (gameState.direction !== "DOWN") {
            directionQueueRef.current.push("UP");
          }
          break;
        case "ArrowDown":
        case "s":
        case "S":
          if (gameState.direction !== "UP") {
            directionQueueRef.current.push("DOWN");
          }
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          if (gameState.direction !== "RIGHT") {
            directionQueueRef.current.push("LEFT");
          }
          break;
        case "ArrowRight":
        case "d":
        case "D":
          if (gameState.direction !== "LEFT") {
            directionQueueRef.current.push("RIGHT");
          }
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState.direction, gameState.gameOver, gameState.paused, resetGame]);
  
  // Touch controls
  const handleTouchStart = useRef<Position | null>(null);
  
  const onTouchStart = (e: React.TouchEvent) => {
    if (gameState.gameOver || gameState.paused) return;
    
    const touch = e.touches[0];
    handleTouchStart.current = { x: touch.clientX, y: touch.clientY };
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    if (!handleTouchStart.current || gameState.gameOver || gameState.paused) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - handleTouchStart.current.x;
    const deltaY = touch.clientY - handleTouchStart.current.y;
    
    // Determine swipe direction (if swipe is significant)
    const minSwipeDist = 30;
    
    if (Math.abs(deltaX) > minSwipeDist || Math.abs(deltaY) > minSwipeDist) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0 && gameState.direction !== "LEFT") {
          directionQueueRef.current = ["RIGHT"];
        } else if (deltaX < 0 && gameState.direction !== "RIGHT") {
          directionQueueRef.current = ["LEFT"];
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && gameState.direction !== "UP") {
          directionQueueRef.current = ["DOWN"];
        } else if (deltaY < 0 && gameState.direction !== "DOWN") {
          directionQueueRef.current = ["UP"];
        }
      }
      
      // Reset touch start position
      handleTouchStart.current = { x: touch.clientX, y: touch.clientY };
    }
  };
  
  // Direction button handlers
  const handleDirectionButton = (direction: Direction) => {
    if (gameState.gameOver || gameState.paused) return;
    
    switch (direction) {
      case "UP":
        if (gameState.direction !== "DOWN") {
          directionQueueRef.current.push("UP");
        }
        break;
      case "DOWN":
        if (gameState.direction !== "UP") {
          directionQueueRef.current.push("DOWN");
        }
        break;
      case "LEFT":
        if (gameState.direction !== "RIGHT") {
          directionQueueRef.current.push("LEFT");
        }
        break;
      case "RIGHT":
        if (gameState.direction !== "LEFT") {
          directionQueueRef.current.push("RIGHT");
        }
        break;
    }
  };
  
  // Game loop
  useEffect(() => {
    if (gameState.gameOver || gameState.paused) return;
    
    const gameLoop = (currentTime: number) => {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      
      const secondsSinceLastRender = (currentTime - lastRenderTimeRef.current) / 1000;
      if (secondsSinceLastRender < speed / 1000) return;
      
      lastRenderTimeRef.current = currentTime;
      moveSnake();
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.gameOver, gameState.paused, moveSnake, speed]);
  
  // Handle difficulty change
  useEffect(() => {
    if (initialDifficulty !== gameState.difficulty) {
      changeDifficulty(initialDifficulty);
    }
  }, [initialDifficulty, gameState.difficulty]);
  
  const renderGrid = () => {
    const cells = [];
    
    // Calculate which part of the grid to render based on camera position
    const cameraX = gameState.cameraOffset.x;
    const cameraY = gameState.cameraOffset.y;
    
    // Generate grid cells (only what's visible)
    for (let y = 0; y < VISIBLE_GRID_SIZE; y++) {
      for (let x = 0; x < VISIBLE_GRID_SIZE; x++) {
        // Convert to world coordinates
        const worldX = x + cameraX;
        const worldY = y + cameraY;
        
        // Cell styling
        const isFood = gameState.food.x === worldX && gameState.food.y === worldY;
        const isSnakeHead = gameState.snake[0].x === worldX && gameState.snake[0].y === worldY;
        const isSnakeBody = gameState.snake.some((segment, index) => 
          index > 0 && segment.x === worldX && segment.y === worldY
        );
        
        const obstacle = gameState.obstacles.find(obs => obs.x === worldX && obs.y === worldY);
        
        let cellClasses = "snake-cell absolute";
        
        if (isSnakeHead) {
          cellClasses += " bg-snake-primary rounded-sm";
        } else if (isSnakeBody) {
          cellClasses += " bg-snake-secondary rounded-sm";
        } else if (isFood) {
          cellClasses += " bg-snake-food rounded-full animate-pulse-gentle";
        } else if (obstacle) {
          switch (obstacle.type) {
            case "rock":
              cellClasses += " bg-gray-500 rounded";
              break;
            case "tree":
              cellClasses += " bg-green-700 rounded";
              break;
            case "water":
              cellClasses += " bg-blue-500 rounded";
              break;
          }
        } else {
          cellClasses += " bg-transparent";
        }
        
        // Add grid line for better visibility
        cellClasses += " border border-gray-800/10";
        
        cells.push(
          <div
            key={`${worldX}-${worldY}`}
            className={cellClasses}
            style={{
              left: `${x * visibleCellSize}%`,
              top: `${y * visibleCellSize}%`,
              width: `${visibleCellSize}%`,
              height: `${visibleCellSize}%`,
            }}
          />
        );
      }
    }
    
    return cells;
  };
  
  return (
    <div 
      ref={gameContainerRef}
      className={`game-container relative w-full mx-auto ${isFullscreen ? 'fullscreen-mode h-screen flex flex-col justify-center' : 'aspect-square max-w-xl'}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
    >
      {/* Game grid */}
      <div className="snake-grid relative w-full h-full bg-gradient-to-b from-snake-background to-gray-900 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-[url('/snake-bg-pattern.png')] opacity-10 bg-repeat"></div>
        {renderGrid()}
      </div>
      
      {/* Game overlay for pause/game over */}
      {(gameState.paused || gameState.gameOver) && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-10 rounded-lg">
          {gameState.paused ? (
            <>
              <h2 className="text-4xl font-bold text-white mb-6">Paused</h2>
              <button 
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg mb-4"
                onClick={togglePause}
              >
                Resume Adventure
              </button>
              <button 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg"
                onClick={resetGame}
              >
                Restart Adventure
              </button>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-bold text-snake-danger mb-2">Adventure Over</h2>
              <p className="text-2xl text-white mb-2">Score: {gameState.score}</p>
              <p className="text-xl text-gray-300 mb-6">Distance: {gameState.distanceTraveled} units</p>
              <button 
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg"
                onClick={resetGame}
              >
                New Adventure
              </button>
            </>
          )}
        </div>
      )}
      
      {/* Mobile direction controls */}
      <div className={`direction-controls ${isFullscreen ? 'mt-4' : 'mt-2'} md:hidden`}>
        <div className="grid grid-cols-3 gap-1 max-w-xs mx-auto">
          <div className="col-start-2">
            <button 
              className="w-full h-12 bg-snake-primary/70 hover:bg-snake-primary rounded-md flex items-center justify-center"
              onClick={() => handleDirectionButton("UP")}
              aria-label="Move Up"
            >
              <ArrowUp size={24} />
            </button>
          </div>
          <div className="col-start-1 row-start-2">
            <button 
              className="w-full h-12 bg-snake-primary/70 hover:bg-snake-primary rounded-md flex items-center justify-center" 
              onClick={() => handleDirectionButton("LEFT")}
              aria-label="Move Left"
            >
              <ArrowLeft size={24} />
            </button>
          </div>
          <div className="col-start-3 row-start-2">
            <button 
              className="w-full h-12 bg-snake-primary/70 hover:bg-snake-primary rounded-md flex items-center justify-center"
              onClick={() => handleDirectionButton("RIGHT")}
              aria-label="Move Right"
            >
              <ArrowRight size={24} />
            </button>
          </div>
          <div className="col-start-2 row-start-3">
            <button 
              className="w-full h-12 bg-snake-primary/70 hover:bg-snake-primary rounded-md flex items-center justify-center"
              onClick={() => handleDirectionButton("DOWN")}
              aria-label="Move Down"
            >
              <ArrowDown size={24} />
            </button>
          </div>
        </div>
      </div>
      
      {/* HUD */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex flex-col md:flex-row md:items-center md:gap-4">
          <div className="text-lg font-semibold text-snake-score">Score: {gameState.score}</div>
          <div className="text-lg font-semibold text-purple-300">Distance: {gameState.distanceTraveled}</div>
        </div>
        <div className="space-x-2">
          <button 
            className="px-4 py-1 rounded bg-snake-primary hover:bg-purple-600 text-white transition-colors"
            onClick={togglePause}
            disabled={gameState.gameOver}
          >
            {gameState.paused ? "Resume" : "Pause"}
          </button>
          <button 
            className="px-4 py-1 rounded bg-snake-secondary hover:bg-indigo-600 text-white transition-colors"
            onClick={resetGame}
          >
            Restart
          </button>
          <button 
            className="px-4 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            onClick={toggleFullscreen}
            aria-label="Toggle fullscreen"
          >
            <Fullscreen size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameEngine;
