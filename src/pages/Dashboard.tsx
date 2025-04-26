
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { User, Gamepad, Award, BarChart, ChevronRight } from "lucide-react";

type GameHistoryEntry = {
  score: number;
  date: string;
  difficulty?: string;
};

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [username, setUsername] = useState("");
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);
  const [stats, setStats] = useState({
    totalGames: 0,
    avgScore: 0,
  });
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (user) {
      setUsername(user.username);
      
      // Load game history
      const historyKey = `gameHistory-${user.id}`;
      const savedHistory = localStorage.getItem(historyKey);
      
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        setGameHistory(history);
        
        // Calculate stats
        const totalGames = history.length;
        const totalScore = history.reduce((sum: number, game: GameHistoryEntry) => sum + game.score, 0);
        const avgScore = totalGames > 0 ? Math.round(totalScore / totalGames) : 0;
        
        setStats({
          totalGames,
          avgScore,
        });
      }
    }
  }, [isAuthenticated, navigate, user]);
  
  const handleProfileUpdate = () => {
    if (!user) return;
    
    // Update username in local storage
    const updatedUser = { ...user, username };
    localStorage.setItem("snakeUser", JSON.stringify(updatedUser));
    
    // Update in registered users
    const registeredUsers = localStorage.getItem("registeredUsers");
    if (registeredUsers) {
      const users = JSON.parse(registeredUsers);
      const updatedUsers = users.map((u: any) => 
        u.id === user.id ? { ...u, username } : u
      );
      localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
    }
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };
  
  if (!isAuthenticated || !user) {
    return null; // Prevent rendering if not authenticated
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-snake-text">Player Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile */}
        <div className="lg:col-span-1">
          <div className="bg-snake-background border border-snake-primary/30 rounded-lg p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 bg-snake-primary/50 rounded-full flex items-center justify-center mb-4">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.username} 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className="text-white" size={36} />
                )}
              </div>
              <h2 className="text-2xl font-bold">{user.username}</h2>
              <p className="text-gray-400">{user.email}</p>
            </div>
            
            <div className="divide-y divide-snake-grid">
              <div className="py-4">
                <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <Button
                    onClick={handleProfileUpdate}
                    className="w-full bg-snake-primary hover:bg-purple-600"
                  >
                    Update Profile
                  </Button>
                </div>
              </div>
              
              <div className="py-4">
                <h3 className="text-lg font-semibold mb-2">Account Info</h3>
                <p className="text-sm text-gray-400">Member since {new Date().toLocaleDateString()}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>High Score</span>
                    <span className="font-bold text-snake-score">{user.highScore || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Games Played</span>
                    <span className="font-bold">{stats.totalGames}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Score</span>
                    <span className="font-bold">{stats.avgScore}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Button 
              onClick={() => navigate("/game")} 
              className="w-full flex items-center justify-center gap-2 bg-snake-primary hover:bg-purple-600 py-6"
            >
              <Gamepad size={20} />
              <span className="text-lg">Play Now</span>
            </Button>
          </div>
        </div>
        
        {/* Right Column - Stats & History */}
        <div className="lg:col-span-2">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-lg p-4 border border-snake-primary/30">
              <div className="flex items-center gap-3 mb-2">
                <Gamepad className="text-purple-400" />
                <h3 className="font-semibold">Games Played</h3>
              </div>
              <p className="text-3xl font-bold">{stats.totalGames}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-lg p-4 border border-snake-primary/30">
              <div className="flex items-center gap-3 mb-2">
                <Award className="text-purple-400" />
                <h3 className="font-semibold">High Score</h3>
              </div>
              <p className="text-3xl font-bold text-snake-score">{user.highScore || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-lg p-4 border border-snake-primary/30">
              <div className="flex items-center gap-3 mb-2">
                <BarChart className="text-purple-400" />
                <h3 className="font-semibold">Average Score</h3>
              </div>
              <p className="text-3xl font-bold">{stats.avgScore}</p>
            </div>
          </div>
          
          {/* Game History */}
          <div className="bg-snake-background border border-snake-primary/30 rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-900/50 border-b border-snake-grid flex justify-between items-center">
              <h2 className="font-semibold">Recent Game History</h2>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs flex items-center"
                onClick={() => navigate('/game')}
              >
                Play Again <ChevronRight size={14} />
              </Button>
            </div>
            
            {gameHistory.length > 0 ? (
              <div className="divide-y divide-snake-grid">
                {gameHistory.map((game, index) => (
                  <div key={index} className="flex items-center p-4">
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mr-4">
                      <Gamepad className="text-gray-400" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <p className="font-medium">Game #{stats.totalGames - index}</p>
                        <p className="font-bold text-snake-score">{game.score} pts</p>
                      </div>
                      <p className="text-xs text-gray-400">{formatDate(game.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-400">No game history available yet.</p>
                <Button 
                  onClick={() => navigate('/game')} 
                  className="mt-4 bg-snake-primary hover:bg-purple-600"
                >
                  Play Your First Game
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
