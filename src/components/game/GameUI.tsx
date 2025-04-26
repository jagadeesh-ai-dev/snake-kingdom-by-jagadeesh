
import React from "react";
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Pause,
  Play,
  RotateCcw
} from "lucide-react";
import { Direction } from "./GameEngine";
import { Button } from "@/components/ui/button";

interface GameUIProps {
  onDirectionChange: (direction: Direction) => void;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  isPaused: boolean;
  isGameOver: boolean;
  score: number;
}

const GameUI: React.FC<GameUIProps> = ({
  onDirectionChange,
  onPause,
  onResume,
  onRestart,
  isPaused,
  isGameOver,
  score
}) => {
  return (
    <div className="mt-4 w-full">
      {/* Score display */}
      <div className="text-lg font-semibold text-snake-score mb-4">Score: {score}</div>
      
      {/* Game controls */}
      <div className="flex flex-col items-center gap-2">
        {/* Direction controls */}
        <div className="grid grid-cols-3 gap-2 w-48 h-48">
          {/* Top row */}
          <div className="col-start-2">
            <Button 
              variant="outline"
              size="lg"
              className="w-full h-full aspect-square border-2 border-snake-primary/50 bg-snake-primary/20 hover:bg-snake-primary/40"
              onClick={() => onDirectionChange("UP")}
              disabled={isPaused || isGameOver}
            >
              <ArrowUp size={24} className="text-snake-primary" />
            </Button>
          </div>
          
          {/* Middle row */}
          <div>
            <Button 
              variant="outline"
              size="lg"
              className="w-full h-full aspect-square border-2 border-snake-primary/50 bg-snake-primary/20 hover:bg-snake-primary/40"
              onClick={() => onDirectionChange("LEFT")}
              disabled={isPaused || isGameOver}
            >
              <ArrowLeft size={24} className="text-snake-primary" />
            </Button>
          </div>
          <div className="flex items-center justify-center">
            {/* Center space left empty for visibility */}
          </div>
          <div>
            <Button 
              variant="outline"
              size="lg"
              className="w-full h-full aspect-square border-2 border-snake-primary/50 bg-snake-primary/20 hover:bg-snake-primary/40"
              onClick={() => onDirectionChange("RIGHT")}
              disabled={isPaused || isGameOver}
            >
              <ArrowRight size={24} className="text-snake-primary" />
            </Button>
          </div>
          
          {/* Bottom row */}
          <div className="col-start-2">
            <Button 
              variant="outline"
              size="lg"
              className="w-full h-full aspect-square border-2 border-snake-primary/50 bg-snake-primary/20 hover:bg-snake-primary/40"
              onClick={() => onDirectionChange("DOWN")}
              disabled={isPaused || isGameOver}
            >
              <ArrowDown size={24} className="text-snake-primary" />
            </Button>
          </div>
        </div>
        
        {/* Game controls */}
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline"
            className="border-2 border-snake-primary/50 bg-snake-primary/20 hover:bg-snake-primary/40"
            onClick={isPaused ? onResume : onPause}
            disabled={isGameOver}
          >
            {isPaused ? <Play size={20} /> : <Pause size={20} />}
          </Button>
          <Button 
            variant="outline"
            className="border-2 border-snake-primary/50 bg-snake-primary/20 hover:bg-snake-primary/40"
            onClick={onRestart}
          >
            <RotateCcw size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameUI;
