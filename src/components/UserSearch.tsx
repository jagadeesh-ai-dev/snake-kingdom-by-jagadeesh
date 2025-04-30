
import { useState } from "react";
import { Search, User, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { searchUsers } from "@/contexts/auth/authService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

type UserResult = {
  id: string;
  username: string;
  avatar_url: string | null;
};

const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    const { success, data, error } = await searchUsers(searchTerm);
    setLoading(false);
    
    if (success && data) {
      // Filter out the current user from results
      const filteredResults = data.filter((result: UserResult) => 
        result.id !== user?.id
      );
      setResults(filteredResults);
    } else {
      toast({
        title: "Search Failed",
        description: error || "Failed to search users",
        variant: "destructive",
      });
    }
  };
  
  const handleAddFriend = async (friendId: string) => {
    if (!user) return;
    
    try {
      // Check if friendship already exists
      const { data: existingFriendship } = await supabase
        .from('friends')
        .select('*')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .or(`user_id.eq.${friendId},friend_id.eq.${friendId}`);
      
      if (existingFriendship && existingFriendship.length > 0) {
        toast({
          title: "Already Friends",
          description: "You are already friends with this user",
        });
        return;
      }
      
      // Add friend relationship
      const { error } = await supabase
        .from('friends')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: 'pending'
        });
      
      if (error) throw error;
      
      toast({
        title: "Friend Request Sent",
        description: "Your friend request has been sent",
      });
    } catch (error) {
      console.error("Error adding friend:", error);
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Search users by username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700"
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={loading || !searchTerm.trim()}
          className="bg-snake-primary hover:bg-purple-600"
        >
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>
      
      {results.length > 0 ? (
        <div className="space-y-2 mt-4">
          <h3 className="text-sm font-medium text-gray-400">Search Results</h3>
          <div className="bg-gray-900 rounded-lg divide-y divide-gray-800">
            {results.map((user) => (
              <div key={user.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.username} 
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <User className="text-gray-400" size={20} />
                    )}
                  </div>
                  <span className="font-medium">{user.username}</span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleAddFriend(user.id)}
                  className="flex items-center gap-1 text-sm"
                >
                  <UserPlus size={16} />
                  Add Friend
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : searchTerm && !loading ? (
        <div className="text-center py-4 text-gray-400">
          No users found matching "{searchTerm}"
        </div>
      ) : null}
    </div>
  );
};

export default UserSearch;
