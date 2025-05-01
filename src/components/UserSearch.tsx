
import { useState, useEffect } from "react";
import { Search, User, UserPlus, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Search as user types with debounce
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setResults([]);
      return;
    }
    
    const debounceTimeout = setTimeout(() => {
      handleSearch();
    }, 500);
    
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);
  
  const handleSearch = async () => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) return;
    
    setLoading(true);
    const { success, data, error } = await searchUsers(searchTerm);
    
    if (success && data) {
      // Filter out the current user from results
      const filteredResults = data.filter((result: UserResult) => 
        result.id !== user?.id
      );
      setResults(filteredResults);
      
      // Check for any pending friend requests
      if (user && filteredResults.length > 0) {
        // Get IDs of users in the results
        const ids = filteredResults.map(result => result.id);
        
        // Check for outgoing friend requests
        const { data: outgoingRequests } = await supabase
          .from('friends')
          .select('friend_id, status')
          .eq('user_id', user.id)
          .in('friend_id', ids);
          
        // Check for incoming friend requests
        const { data: incomingRequests } = await supabase
          .from('friends')
          .select('user_id, status')
          .eq('friend_id', user.id)
          .in('user_id', ids);
        
        // Combine both to get all pending requests
        let pendingIds: string[] = [];
        
        if (outgoingRequests) {
          pendingIds = [
            ...pendingIds,
            ...outgoingRequests
              .filter(req => req.status === 'pending')
              .map(req => req.friend_id)
          ];
        }
        
        if (incomingRequests) {
          pendingIds = [
            ...pendingIds,
            ...incomingRequests
              .filter(req => req.status === 'pending')
              .map(req => req.user_id)
          ];
        }
        
        setPendingRequests(pendingIds);
      }
    } else {
      toast({
        title: "Search Failed",
        description: error || "Failed to search users",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };
  
  const handleAddFriend = async (friendId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add friends",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Check if friendship already exists
      const { data: outgoingFriendship } = await supabase
        .from('friends')
        .select('*')
        .eq('user_id', user.id)
        .eq('friend_id', friendId)
        .single();
      
      const { data: incomingFriendship } = await supabase
        .from('friends')
        .select('*')
        .eq('user_id', friendId)
        .eq('friend_id', user.id)
        .single();
      
      if (outgoingFriendship || incomingFriendship) {
        toast({
          title: "Already Friends",
          description: "You are already friends with this user or have a pending request",
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
      
      // Update UI to show pending
      setPendingRequests(prev => [...prev, friendId]);
      
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
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          type="text"
          placeholder="Search users by username (minimum 2 characters)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-gray-800 border-gray-700"
        />
      </div>
      
      {loading && (
        <div className="text-center py-4 text-gray-400">
          Searching...
        </div>
      )}
      
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
                <button 
                  onClick={() => handleAddFriend(user.id)}
                  disabled={pendingRequests.includes(user.id)}
                  className={`flex items-center gap-1 text-sm px-3 py-1 rounded-md ${
                    pendingRequests.includes(user.id) 
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                      : 'bg-snake-primary hover:bg-purple-600 text-white'
                  }`}
                >
                  {pendingRequests.includes(user.id) ? (
                    <>
                      <Check size={16} />
                      Request Sent
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      Add Friend
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : searchTerm.trim().length >= 2 && !loading ? (
        <div className="text-center py-4 text-gray-400">
          No users found matching "{searchTerm}"
        </div>
      ) : searchTerm.trim().length > 0 && searchTerm.trim().length < 2 ? (
        <div className="text-center py-4 text-gray-400">
          Please enter at least 2 characters to search
        </div>
      ) : null}
    </div>
  );
};

export default UserSearch;
