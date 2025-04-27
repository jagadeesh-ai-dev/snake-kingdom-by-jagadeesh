
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, UserCheck, UserX } from "lucide-react";

// Simulated user data since we don't have a real database yet
const MOCK_USERS = [
  { id: "user1", username: "snake_master", profilePicture: "", status: "online" },
  { id: "user2", username: "apple_eater", profilePicture: "", status: "offline" },
  { id: "user3", username: "python_dev", profilePicture: "", status: "online" },
  { id: "user4", username: "game_lover", profilePicture: "", status: "away" }
];

const Friends = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Simulated data
  const [friends, setFriends] = useState([MOCK_USERS[0], MOCK_USERS[2]]);
  const [requests, setRequests] = useState([MOCK_USERS[1]]);
  const [sent, setSent] = useState([MOCK_USERS[3]]);
  
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Friends</h1>
          <p className="mb-6">Please log in to see your friends and send friend requests.</p>
          <Button
            onClick={() => window.location.href = "/login"}
            className="bg-snake-primary hover:bg-purple-600"
          >
            Log In
          </Button>
        </div>
      </div>
    );
  }
  
  const handleAcceptRequest = (userId: string) => {
    // Simulate accepting friend request
    const acceptedUser = requests.find(req => req.id === userId);
    if (acceptedUser) {
      setRequests(requests.filter(req => req.id !== userId));
      setFriends([...friends, acceptedUser]);
      
      toast({
        title: "Friend Request Accepted",
        description: `You are now friends with ${acceptedUser.username}.`
      });
    }
  };
  
  const handleRejectRequest = (userId: string) => {
    // Simulate rejecting friend request
    const rejectedUser = requests.find(req => req.id === userId);
    if (rejectedUser) {
      setRequests(requests.filter(req => req.id !== userId));
      
      toast({
        title: "Friend Request Rejected",
        description: `You have rejected ${rejectedUser.username}'s friend request.`
      });
    }
  };
  
  const handleCancelRequest = (userId: string) => {
    // Simulate canceling friend request
    const canceledUser = sent.find(s => s.id === userId);
    if (canceledUser) {
      setSent(sent.filter(s => s.id !== userId));
      
      toast({
        title: "Friend Request Canceled",
        description: `You have canceled your friend request to ${canceledUser.username}.`
      });
    }
  };
  
  const handleRemoveFriend = (userId: string) => {
    // Simulate removing friend
    const removedUser = friends.find(friend => friend.id === userId);
    if (removedUser) {
      setFriends(friends.filter(friend => friend.id !== userId));
      
      toast({
        title: "Friend Removed",
        description: `You have removed ${removedUser.username} from your friends.`
      });
    }
  };
  
  const handleSendRequest = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username to search.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if user exists
    const foundUser = MOCK_USERS.find(u => 
      u.username.toLowerCase() === searchQuery.toLowerCase() && 
      u.id !== user?.id
    );
    
    if (!foundUser) {
      toast({
        title: "User Not Found",
        description: "No user with that username was found.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if already friends or request already sent
    if (friends.some(f => f.id === foundUser.id)) {
      toast({
        title: "Already Friends",
        description: `You are already friends with ${foundUser.username}.`,
        variant: "destructive"
      });
      return;
    }
    
    if (sent.some(s => s.id === foundUser.id)) {
      toast({
        title: "Request Already Sent",
        description: `You have already sent a friend request to ${foundUser.username}.`,
        variant: "destructive"
      });
      return;
    }
    
    if (requests.some(r => r.id === foundUser.id)) {
      toast({
        title: "Request Pending",
        description: `${foundUser.username} has already sent you a friend request.`,
        variant: "destructive"
      });
      return;
    }
    
    // Add to sent requests
    setSent([...sent, foundUser]);
    
    toast({
      title: "Friend Request Sent",
      description: `Your friend request to ${foundUser.username} has been sent.`
    });
    
    setSearchQuery("");
  };
  
  const handleChallenge = (userId: string) => {
    const challengedUser = friends.find(friend => friend.id === userId);
    if (challengedUser) {
      toast({
        title: "Challenge Sent",
        description: `You have challenged ${challengedUser.username} to a snake game!`
      });
    }
  };
  
  const filteredFriends = friends.filter(friend => 
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-snake-text mb-8">Friends</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-snake-background border border-snake-primary/30 rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input 
              placeholder="Search for a user..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800 border-gray-700"
            />
            <Button 
              onClick={handleSendRequest}
              className="bg-snake-primary hover:bg-purple-600 whitespace-nowrap"
            >
              <UserPlus className="mr-2 h-4 w-4" /> Send Request
            </Button>
          </div>
          
          <Tabs defaultValue="friends" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="friends">Friends ({friends.length})</TabsTrigger>
              <TabsTrigger value="requests">Requests ({requests.length})</TabsTrigger>
              <TabsTrigger value="sent">Sent ({sent.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="friends">
              {friends.length > 0 ? (
                <div className="space-y-4">
                  {filteredFriends.map(friend => (
                    <div 
                      key={friend.id} 
                      className="flex items-center justify-between p-4 bg-gray-800 bg-opacity-30 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          {friend.profilePicture ? (
                            <AvatarImage src={friend.profilePicture} alt={friend.username} />
                          ) : (
                            <AvatarFallback className="bg-snake-primary">
                              {friend.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        
                        <div>
                          <p className="font-medium">{friend.username}</p>
                          <p className="text-xs text-gray-400">
                            {friend.status === "online" ? (
                              <span className="text-green-500">● Online</span>
                            ) : friend.status === "away" ? (
                              <span className="text-yellow-500">● Away</span>
                            ) : (
                              <span className="text-gray-500">● Offline</span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleChallenge(friend.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Challenge
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleRemoveFriend(friend.id)}
                          variant="ghost"
                          className="text-gray-400 hover:text-red-500"
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>You don't have any friends yet.</p>
                  <p className="text-sm mt-2">Search for users to send friend requests.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="requests">
              {requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.map(req => (
                    <div 
                      key={req.id} 
                      className="flex items-center justify-between p-4 bg-gray-800 bg-opacity-30 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          {req.profilePicture ? (
                            <AvatarImage src={req.profilePicture} alt={req.username} />
                          ) : (
                            <AvatarFallback className="bg-snake-primary">
                              {req.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        
                        <p className="font-medium">{req.username}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(req.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <UserCheck className="h-4 w-4 mr-1" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleRejectRequest(req.id)}
                          variant="destructive"
                        >
                          <UserX className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>No friend requests at the moment.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="sent">
              {sent.length > 0 ? (
                <div className="space-y-4">
                  {sent.map(s => (
                    <div 
                      key={s.id} 
                      className="flex items-center justify-between p-4 bg-gray-800 bg-opacity-30 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          {s.profilePicture ? (
                            <AvatarImage src={s.profilePicture} alt={s.username} />
                          ) : (
                            <AvatarFallback className="bg-snake-primary">
                              {s.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        
                        <p className="font-medium">{s.username}</p>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => handleCancelRequest(s.id)}
                        variant="destructive"
                      >
                        Cancel
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>You haven't sent any friend requests.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Friends;
