
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Difficulty } from "./GameEngine";
import { Settings } from "lucide-react";

interface GameControlsProps {
  onChangeDifficulty: (difficulty: Difficulty) => void;
  currentDifficulty: Difficulty;
}

const GameControls = ({ onChangeDifficulty, currentDifficulty }: GameControlsProps) => {
  const [showControls, setShowControls] = useState(false);
  
  const difficulties: Difficulty[] = ["EASY", "MEDIUM", "HARD", "EXTREME"];
  
  return (
    <div className="mb-6">
      <Button 
        variant="outline"
        onClick={() => setShowControls(!showControls)}
        className="flex items-center gap-2 mb-4"
      >
        <Settings size={18} />
        <span>{showControls ? "Hide Controls" : "Game Settings"}</span>
      </Button>
      
      {showControls && (
        <div className="bg-snake-background border border-snake-primary/30 rounded-lg p-4 mb-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Difficulty</h3>
            <div className="flex flex-wrap gap-2">
              {difficulties.map((difficulty) => (
                <Button
                  key={difficulty}
                  variant={currentDifficulty === difficulty ? "default" : "outline"}
                  onClick={() => onChangeDifficulty(difficulty)}
                  className={`${
                    currentDifficulty === difficulty 
                      ? "bg-snake-primary hover:bg-purple-600" 
                      : "border-snake-primary text-snake-primary hover:bg-snake-primary hover:text-white"
                  }`}
                >
                  {difficulty}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 bg-opacity-50 p-3 rounded-lg">
                <h4 className="font-medium mb-1">Desktop</h4>
                <ul className="text-sm text-gray-300">
                  <li>Arrow Keys or WASD - Move Snake</li>
                  <li>Space - Pause/Resume Game</li>
                  <li>Enter/Space - Restart (when game over)</li>
                </ul>
              </div>
              <div className="bg-gray-800 bg-opacity-50 p-3 rounded-lg">
                <h4 className="font-medium mb-1">Mobile</h4>
                <ul className="text-sm text-gray-300">
                  <li>Swipe - Move Snake</li>
                  <li>Tap Pause Button - Pause/Resume Game</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameControls;
