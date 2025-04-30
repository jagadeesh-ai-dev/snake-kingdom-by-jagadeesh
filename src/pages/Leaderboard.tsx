
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Trophy, ChevronUp, ChevronDown, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type LeaderboardEntry = {
  id: string;
  username: string;
  highScore: number;
  profilePicture?: string;
};

const Leaderboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch leaderboard data from Supabase
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, highscore, avatar_url')
          .not('highscore', 'is', null)
          .order('highscore', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Transform the data to match our LeaderboardEntry type
        const entries: LeaderboardEntry[] = data.map((item) => ({
          id: item.id,
          username: item.username,
          highScore: item.highscore || 0,
          profilePicture: item.avatar_url,
        }));
        
        setLeaderboardData(entries);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load leaderboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, []);
  
  // Handle sorting
  const sortData = (direction: "asc" | "desc") => {
    setSortDirection(direction);
  };
  
  // Filter and sort data
  const filteredData = leaderboardData
    .filter((entry) => 
      entry.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => 
      sortDirection === "desc" 
        ? b.highScore - a.highScore 
        : a.highScore - b.highScore
    );
  
  const userRank = user 
    ? filteredData.findIndex(entry => entry.id === user.id) + 1 
    : -1;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-snake-text flex items-center gap-2">
            <Trophy className="text-yellow-400" />
            Leaderboard
          </h1>
          <p className="text-gray-400 mt-2">See who has the highest scores</p>
        </div>
        
        {/* Search box */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700"
          />
        </div>
      </div>
      
      {/* User's rank card (if logged in) */}
      {user && userRank > 0 && (
        <div className="mb-6 bg-purple-900/30 rounded-lg p-4 border border-snake-primary/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-snake-primary rounded-full flex items-center justify-center">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.username} 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className="text-white" size={20} />
                )}
              </div>
              <div>
                <p className="font-medium">Your Rank</p>
                <p className="text-xl font-bold text-snake-text">{userRank}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">Your High Score</p>
              <p className="text-xl font-bold text-snake-score">{user.highScore || 0}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Leaderboard table */}
      <div className="bg-snake-background border border-snake-primary/30 rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-900/50 border-b border-snake-grid flex items-center justify-between">
          <h2 className="font-semibold">Global Rankings</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Sort by:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => sortData("desc")}
              className={`p-1 h-8 ${sortDirection === "desc" ? "bg-gray-800" : ""}`}
            >
              <ChevronDown size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => sortData("asc")}
              className={`p-1 h-8 ${sortDirection === "asc" ? "bg-gray-800" : ""}`}
            >
              <ChevronUp size={16} />
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">Loading leaderboard data...</p>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="divide-y divide-snake-grid">
            {filteredData.map((entry, index) => {
              const isCurrentUser = user?.id === entry.id;
              
              return (
                <div 
                  key={entry.id}
                  className={`flex items-center p-4 ${
                    isCurrentUser ? "bg-purple-900/20" : ""
                  }`}
                >
                  <div className="w-10 text-center font-bold">
                    {index === 0 && <Trophy className="text-yellow-400 mx-auto" size={24} />}
                    {index === 1 && <Trophy className="text-gray-400 mx-auto" size={20} />}
                    {index === 2 && <Trophy className="text-amber-700 mx-auto" size={18} />}
                    {index > 2 && `${index + 1}`}
                  </div>
                  
                  <div className="ml-4 flex-grow flex items-center gap-3">
                    <div className="w-8 h-8 bg-snake-primary/50 rounded-full flex items-center justify-center">
                      {entry.profilePicture ? (
                        <img 
                          src={entry.profilePicture} 
                          alt={entry.username} 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <User className="text-white" size={16} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{entry.username}</p>
                      {isCurrentUser && (
                        <span className="text-xs bg-purple-900 px-2 py-0.5 rounded text-purple-200">You</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xl font-bold text-snake-score">{entry.highScore}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-400">No players found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
