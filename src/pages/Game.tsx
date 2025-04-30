
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import GameEngine, { Difficulty } from "@/components/game/GameEngine";
import GameControls from "@/components/game/GameControls";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";

const Game = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [difficulty, setDifficulty] = useState<Difficulty>("MEDIUM");
  const [gameHistory, setGameHistory] = useState<{score: number; date: string}[]>([]);
  
  // Load game history from localStorage
  useEffect(() => {
    if (isAuthenticated && user) {
      const historyKey = `gameHistory-${user.id}`;
      const savedHistory = localStorage.getItem(historyKey);
      
      if (savedHistory) {
        setGameHistory(JSON.parse(savedHistory));
      }
    }
  }, [isAuthenticated, user]);
  
  // Handle game over
  const handleGameOver = (score: number) => {
    if (isAuthenticated && user) {
      // Save game to history
      const newGame = { score, date: new Date().toISOString() };
      const updatedHistory = [newGame, ...gameHistory].slice(0, 10); // Keep last 10 games
      
      setGameHistory(updatedHistory);
      
      // Save to localStorage
      const historyKey = `gameHistory-${user.id}`;
      localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
      
      toast({
        title: "Game Over",
        description: `You scored ${score} points!`,
      });
      
      // Update high score if needed
      if (score > (user.highScore || 0)) {
        toast({
          title: "New High Score!",
          description: "You've beaten your previous record!",
        });
      }
    }
  };
  
  const changeDifficulty = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-snake-text">Snake Game</h1>
        <Button 
          variant="outline"
          onClick={() => navigate('/leaderboard')}
          className="flex gap-2 items-center border-snake-primary text-snake-primary hover:bg-snake-primary hover:text-white"
        >
          <Trophy size={18} />
          <span>Leaderboard</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Game Settings */}
          <GameControls 
            onChangeDifficulty={changeDifficulty} 
            currentDifficulty={difficulty}
          />
          
          {/* Game Canvas */}
          <GameEngine 
            initialDifficulty={difficulty}
            onGameOver={handleGameOver}
          />
        </div>
        
        <div>
          {/* Player Stats */}
          {isAuthenticated && user ? (
            <div className="bg-snake-background border border-snake-primary/30 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4 border-b border-snake-grid pb-2">Player Stats</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-snake-text">High Score</h3>
                  <p className="text-3xl font-bold text-snake-score">{user.highScore || 0}</p>
                </div>
                
                {gameHistory.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-snake-text mb-2">Recent Games</h3>
                    <div className="space-y-2">
                      {gameHistory.slice(0, 5).map((game, index) => (
                        <div 
                          key={index} 
                          className="bg-gray-800 bg-opacity-30 p-2 rounded flex justify-between"
                        >
                          <span>{formatDate(game.date)}</span>
                          <span className="font-medium text-snake-score">{game.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-snake-background border border-snake-primary/30 rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold mb-3">Sign in to track your progress</h2>
              <p className="mb-4 text-gray-400">Create an account to save your high scores and compete on the leaderboard.</p>
              <div className="space-x-3">
                <Button 
                  onClick={() => navigate('/login')}
                  className="bg-snake-primary hover:bg-purple-600"
                >
                  Login
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/register')}
                  className="border-snake-primary text-snake-primary hover:bg-snake-primary hover:text-white"
                >
                  Register
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Game;
