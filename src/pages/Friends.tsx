
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import UserSearch from "@/components/UserSearch";
import Chat from "@/components/Chat";

type FriendRequest = {
  id: string;
  username: string;
  avatar_url: string | null;
  request_id: string;
};

const Friends = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to access the friends page",
      });
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate, toast]);
  
  // Fetch friend requests
  useEffect(() => {
    if (!user) return;
    
    const fetchFriendRequests = async () => {
      try {
        // Fetch friend requests where the current user is the receiver and the status is pending
        const { data: friendRequests, error } = await supabase
          .from('friends')
          .select('id, user_id')
          .eq('friend_id', user.id)
          .eq('status', 'pending');
        
        if (error) throw error;
        
        if (friendRequests && friendRequests.length > 0) {
          // Get the user IDs of the requestors
          const requestorIds = friendRequests.map(request => request.user_id);
          
          // Fetch profile data for those users
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', requestorIds);
          
          if (profilesError) throw profilesError;
          
          if (profiles) {
            // Create a map of request IDs to request data
            const requestMap: Record<string, string> = {};
            friendRequests.forEach(request => {
              requestMap[request.user_id] = request.id;
            });
            
            // Transform the data
            const requests: FriendRequest[] = profiles.map(profile => ({
              id: profile.id,
              username: profile.username,
              avatar_url: profile.avatar_url,
              request_id: requestMap[profile.id]
            }));
            
            setPendingRequests(requests);
          }
        }
      } catch (error) {
        console.error("Error fetching friend requests:", error);
        toast({
          title: "Error",
          description: "Failed to load friend requests",
          variant: "destructive",
        });
      } finally {
        setPageLoading(false);
      }
    };
    
    fetchFriendRequests();
  }, [user, toast]);
  
  const handleFriendRequest = async (requestId: string, action: 'accept' | 'reject') => {
    if (!user) return;
    
    try {
      if (action === 'accept') {
        // Update the friend request status to accepted
        const { error } = await supabase
          .from('friends')
          .update({ status: 'accepted' })
          .eq('id', requestId);
        
        if (error) throw error;
        
        toast({
          title: "Friend Request Accepted",
          description: "You are now friends with this user",
        });
      } else {
        // Delete the friend request
        const { error } = await supabase
          .from('friends')
          .delete()
          .eq('id', requestId);
        
        if (error) throw error;
        
        toast({
          title: "Friend Request Rejected",
          description: "Friend request has been rejected",
        });
      }
      
      // Remove the request from the state
      setPendingRequests(prev => prev.filter(request => request.request_id !== requestId));
    } catch (error) {
      console.error(`Error ${action}ing friend request:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} friend request`,
        variant: "destructive",
      });
    }
  };
  
  // If still loading auth state, show loading indicator
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[50vh]">
        <div className="text-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, user will be redirected by the useEffect
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Friends & Messaging</h1>
      
      <Tabs defaultValue="chat">
        <TabsList className="mb-8">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="find">Find Friends</TabsTrigger>
          <TabsTrigger value="requests">
            Friend Requests
            {pendingRequests.length > 0 && (
              <span className="ml-2 bg-snake-primary text-white text-xs rounded-full px-2 py-0.5">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>Chat with Friends</CardTitle>
            </CardHeader>
            <CardContent>
              <Chat />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="find">
          <Card>
            <CardHeader>
              <CardTitle>Find Friends</CardTitle>
            </CardHeader>
            <CardContent>
              <UserSearch />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Friend Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {pageLoading ? (
                <p className="text-center text-gray-400 py-8">Loading friend requests...</p>
              ) : pendingRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingRequests.map(request => (
                    <div 
                      key={request.request_id}
                      className="bg-gray-900 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={request.avatar_url || undefined} />
                          <AvatarFallback>
                            {request.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{request.username}</p>
                          <p className="text-sm text-gray-400">Wants to be friends</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="default" 
                          size="sm"
                          className="bg-snake-primary hover:bg-purple-600"
                          onClick={() => handleFriendRequest(request.request_id, 'accept')}
                        >
                          Accept
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          onClick={() => handleFriendRequest(request.request_id, 'reject')}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-8">No pending friend requests</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Friends;
