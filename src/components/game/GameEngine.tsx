
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import GameUI from "./GameUI";

export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
export type Difficulty = "EASY" | "MEDIUM" | "HARD" | "EXTREME";

export type Position = {
  x: number;
  y: number;
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
};

type GameEngineProps = {
  initialDifficulty?: Difficulty;
  onGameOver?: (score: number) => void;
};

const difficultySettings = {
  EASY: { speed: 200, gridSize: 15 },
  MEDIUM: { speed: 150, gridSize: 20 },
  HARD: { speed: 100, gridSize: 25 },
  EXTREME: { speed: 70, gridSize: 30 },
};

const GameEngine: React.FC<GameEngineProps> = ({
  initialDifficulty = "MEDIUM",
  onGameOver,
}) => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    snake: [{ x: 2, y: 2 }, { x: 1, y: 2 }],
    food: { x: 5, y: 5 },
    direction: "RIGHT",
    gameOver: false,
    paused: false,
    score: 0,
    difficulty: initialDifficulty,
    gridSize: difficultySettings[initialDifficulty].gridSize,
  });
  
  // Game settings
  const gridSize = gameState.gridSize;
  const cellSize = 100 / gridSize; // percentage-based for responsive design
  const speed = difficultySettings[gameState.difficulty].speed;
  
  // Game refs
  const gameLoopRef = useRef<number | null>(null);
  const lastRenderTimeRef = useRef<number>(0);
  const directionQueueRef = useRef<Direction[]>([]);
  
  // Helper functions
  const getRandomFoodPosition = useCallback((): Position => {
    const x = Math.floor(Math.random() * gridSize);
    const y = Math.floor(Math.random() * gridSize);
    
    // Check if the food is on the snake
    const isOnSnake = gameState.snake.some(segment => segment.x === x && segment.y === y);
    
    if (isOnSnake) {
      return getRandomFoodPosition();
    }
    
    return { x, y };
  }, [gameState.snake, gridSize]);
  
  const resetGame = useCallback(() => {
    // Reset snake to initial position
    const initialSnake = [
      { x: Math.floor(gridSize / 4), y: Math.floor(gridSize / 2) },
      { x: Math.floor(gridSize / 4) - 1, y: Math.floor(gridSize / 2) },
    ];
    
    setGameState({
      snake: initialSnake,
      food: getRandomFoodPosition(),
      direction: "RIGHT",
      gameOver: false,
      paused: false,
      score: 0,
      difficulty: gameState.difficulty,
      gridSize,
    });
    
    directionQueueRef.current = [];
    
    toast({
      title: "New Game Started",
      description: `Difficulty: ${gameState.difficulty}`,
    });
  }, [gameState.difficulty, getRandomFoodPosition, gridSize, toast]);
  
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
      toast({ title: "Game Resumed" });
    } else {
      toast({ title: "Game Paused" });
    }
  };
  
  const checkCollision = (head: Position): boolean => {
    // Check if snake hit the wall
    if (
      head.x < 0 ||
      head.x >= gridSize ||
      head.y < 0 ||
      head.y >= gridSize
    ) {
      return true;
    }
    
    // Check if snake hit itself (excluding the tail which will move)
    for (let i = 1; i < gameState.snake.length; i++) {
      if (gameState.snake[i].x === head.x && gameState.snake[i].y === head.y) {
        return true;
      }
    }
    
    return false;
  };
  
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
    
    // Check for collisions
    if (checkCollision(head)) {
      setGameState(prev => ({ ...prev, gameOver: true }));
      
      if (onGameOver) {
        onGameOver(gameState.score);
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
    
    if (head.x === gameState.food.x && head.y === gameState.food.y) {
      // Don't remove tail (snake grows)
      newFood = getRandomFoodPosition();
      newScore = gameState.score + 10;
    } else {
      // Remove tail
      newSnake.pop();
    }
    
    // Update game state
    setGameState(prev => ({
      ...prev,
      snake: newSnake,
      food: newFood,
      direction: newDirection,
      score: newScore,
    }));
  }, [gameState, getRandomFoodPosition, isAuthenticated, onGameOver, user, toast]);
  
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
  
  // Handle direction change from UI controls
  const handleDirectionChange = (direction: Direction) => {
    if (gameState.gameOver || gameState.paused) return;
    
    // Prevent 180-degree turns
    if (
      (gameState.direction === "UP" && direction === "DOWN") ||
      (gameState.direction === "DOWN" && direction === "UP") ||
      (gameState.direction === "LEFT" && direction === "RIGHT") ||
      (gameState.direction === "RIGHT" && direction === "LEFT")
    ) {
      return;
    }
    
    directionQueueRef.current.push(direction);
  };
  
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
    
    // Generate grid cells
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        // Cell styling
        const isFood = gameState.food.x === x && gameState.food.y === y;
        const isSnakeHead = gameState.snake[0].x === x && gameState.snake[0].y === y;
        const isSnakeBody = gameState.snake.some((segment, index) => 
          index > 0 && segment.x === x && segment.y === y
        );
        
        let cellClasses = "snake-cell absolute";
        
        if (isSnakeHead) {
          cellClasses += " bg-snake-primary rounded-sm";
        } else if (isSnakeBody) {
          cellClasses += " bg-snake-secondary rounded-sm";
        } else if (isFood) {
          cellClasses += " bg-snake-food rounded-full animate-pulse-gentle";
        } else {
          cellClasses += " bg-transparent";
        }
        
        cells.push(
          <div
            key={`${x}-${y}`}
            className={cellClasses}
            style={{
              left: `${x * cellSize}%`,
              top: `${y * cellSize}%`,
              width: `${cellSize}%`,
              height: `${cellSize}%`,
            }}
          />
        );
      }
    }
    
    return cells;
  };
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className="game-container aspect-square relative w-full max-w-md mx-auto"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
      >
        {/* Game grid */}
        <div className="snake-grid relative w-full h-full bg-snake-background rounded-lg overflow-hidden">
          {renderGrid()}
        </div>
        
        {/* Game overlay for pause/game over */}
        {(gameState.paused || gameState.gameOver) && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-10 rounded-lg">
            {gameState.paused ? (
              <>
                <h2 className="text-4xl font-bold text-white mb-6">Paused</h2>
                <button 
                  className="pixel-button mb-4" 
                  onClick={togglePause}
                >
                  Resume Game
                </button>
                <button 
                  className="pixel-button-secondary" 
                  onClick={resetGame}
                >
                  Restart Game
                </button>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-bold text-snake-danger mb-2">Game Over</h2>
                <p className="text-2xl text-white mb-6">Score: {gameState.score}</p>
                <button 
                  className="pixel-button" 
                  onClick={resetGame}
                >
                  Play Again
                </button>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Game UI Controls */}
      <GameUI 
        onDirectionChange={handleDirectionChange}
        onPause={togglePause}
        onResume={togglePause}
        onRestart={resetGame}
        isPaused={gameState.paused}
        isGameOver={gameState.gameOver}
        score={gameState.score}
      />
    </div>
  );
};

export default GameEngine;
