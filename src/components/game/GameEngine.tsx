import React, { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Fullscreen, Minimize } from "lucide-react";

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

// Adjusted speed settings to be slower across all difficulty levels
const difficultySettings = {
  EASY: { speed: 250, gridSize: 15 },    // Slower (was 200)
  MEDIUM: { speed: 200, gridSize: 20 },  // Slower (was 150)
  HARD: { speed: 150, gridSize: 25 },    // Slower (was 100)
  EXTREME: { speed: 120, gridSize: 30 }, // Slower (was 70)
};

const GameEngine: React.FC<GameEngineProps> = ({
  initialDifficulty = "MEDIUM",
  onGameOver,
}) => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
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
          cellClasses += " snake-head rounded-full";
        } else if (isSnakeBody) {
          // Apply different styling based on segment position for a more organic look
          const segmentIndex = gameState.snake.findIndex(segment => segment.x === x && segment.y === y);
          const isNeckSegment = segmentIndex === 1 || segmentIndex === 2;
          const isTailSegment = segmentIndex === gameState.snake.length - 1 || segmentIndex === gameState.snake.length - 2;
          
          if (isNeckSegment) {
            cellClasses += " snake-neck rounded-lg";
          } else if (isTailSegment) {
            cellClasses += " snake-tail rounded-lg";
          } else {
            cellClasses += " snake-body rounded-lg";
          }
        } else if (isFood) {
          cellClasses += " snake-food rounded-full animate-pulse-gentle";
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
    <div 
      ref={gameContainerRef}
      className={`game-container relative w-full mx-auto ${isFullscreen ? 'fullscreen-mode h-screen flex flex-col justify-center' : 'aspect-square max-w-xl'}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
    >
      {/* Game grid with enhanced background */}
      <div className="snake-grid relative w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-snake-bg-dark via-snake-bg-mid to-snake-bg-light">
        {/* Background decorative elements */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute top-[20%] left-[15%] w-8 h-8 opacity-20 rounded-full bg-snake-accent animate-pulse-gentle"></div>
          <div className="absolute top-[70%] left-[80%] w-6 h-6 opacity-15 rounded-full bg-snake-accent animate-pulse-gentle" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-[40%] left-[60%] w-10 h-10 opacity-10 rounded-full bg-snake-accent animate-pulse-gentle" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute top-[10%] right-[10%] w-12 h-12 opacity-5 rounded-full bg-snake-accent animate-pulse-gentle" style={{animationDelay: '0.8s'}}></div>
        </div>
        {renderGrid()}
      </div>
      
      {/* Game overlay for pause/game over */}
      {(gameState.paused || gameState.gameOver) && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-10 rounded-lg">
          {gameState.paused ? (
            <>
              <h2 className="text-4xl font-bold text-white mb-6">Paused</h2>
              <div className="flex flex-col gap-3 mb-6">
                <button 
                  className="pixel-button"
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
                <button 
                  className="pixel-button-fullscreen"
                  onClick={toggleFullscreen}
                  aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  {isFullscreen ? (
                    <><Minimize size={18} className="mr-2" /> Exit Fullscreen</>
                  ) : (
                    <><Fullscreen size={18} className="mr-2" /> Enter Fullscreen</>
                  )}
                </button>
              </div>
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
        <div className="text-lg font-semibold text-snake-score">Score: {gameState.score}</div>
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
            {isFullscreen ? <Minimize size={18} /> : <Fullscreen size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameEngine;
