import { useState, useEffect, useRef } from "react";
import { Send, MinusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";

type Friend = {
  id: string;
  username: string;
  avatar_url: string | null;
};

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  sender?: {
    username: string;
    avatar_url: string | null;
  };
};

const Chat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  
  // Fetch friends list
  useEffect(() => {
    if (!user) return;
    
    const fetchFriends = async () => {
      try {
        // We'll use separate queries and handle the data transformation in JS
        // First fetch accepted friendships where user is the requestor
        const { data: sentRequests, error: sentError } = await supabase
          .from('friends')
          .select(`
            friend_id,
            profiles!friends_friend_id_fkey(id, username, avatar_url)
          `)
          .eq('user_id', user.id)
          .eq('status', 'accepted');
        
        if (sentError) throw sentError;
        
        // Then fetch accepted friendships where user is the receiver
        const { data: receivedRequests, error: receivedError } = await supabase
          .from('friends')
          .select(`
            user_id,
            profiles!friends_user_id_fkey(id, username, avatar_url)
          `)
          .eq('friend_id', user.id)
          .eq('status', 'accepted');
        
        if (receivedError) throw receivedError;
        
        // Combine and transform the results
        const friendsList: Friend[] = [];
        
        if (sentRequests) {
          sentRequests.forEach(item => {
            if (item.profiles) {
              friendsList.push({
                id: item.profiles.id,
                username: item.profiles.username,
                avatar_url: item.profiles.avatar_url
              });
            }
          });
        }
        
        if (receivedRequests) {
          receivedRequests.forEach(item => {
            if (item.profiles) {
              friendsList.push({
                id: item.profiles.id,
                username: item.profiles.username,
                avatar_url: item.profiles.avatar_url
              });
            }
          });
        }
        
        setFriends(friendsList);
      } catch (error) {
        console.error("Error fetching friends:", error);
        toast({
          title: "Error",
          description: "Failed to load friends list",
          variant: "destructive",
        });
      }
    };
    
    fetchFriends();
  }, [user, toast]);
  
  // Fetch messages when a friend is selected
  useEffect(() => {
    if (!user || !selectedFriend) return;
    
    const fetchMessages = async () => {
      try {
        // Fetch messages between current user and selected friend
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id, sender_id, receiver_id, content, created_at,
            profiles!messages_sender_id_fkey(username, avatar_url)
          `)
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedFriend.id}),and(sender_id.eq.${selectedFriend.id},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        if (data) {
          // Transform the data to match our Message type
          const formattedMessages: Message[] = data.map(item => ({
            id: item.id,
            sender_id: item.sender_id,
            receiver_id: item.receiver_id,
            content: item.content,
            created_at: item.created_at,
            sender: {
              username: item.profiles?.username || 'Unknown',
              avatar_url: item.profiles?.avatar_url
            }
          }));
          
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      }
    };
    
    fetchMessages();
    
    // Subscribe to new messages
    const channelName = `chat-${[user.id, selectedFriend.id].sort().join('-')}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or(and(sender_id=eq.${user.id},receiver_id=eq.${selectedFriend.id}),and(sender_id=eq.${selectedFriend.id},receiver_id=eq.${user.id}))`,
      }, async (payload) => {
        // Fetch the sender information for the new message
        const { data } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', payload.new.sender_id)
          .single();
            
        if (data) {
          const newMessage: Message = {
            id: payload.new.id,
            sender_id: payload.new.sender_id,
            receiver_id: payload.new.receiver_id,
            content: payload.new.content,
            created_at: payload.new.created_at,
            sender: {
              username: data.username,
              avatar_url: data.avatar_url
            }
          };
          
          setMessages(prev => [...prev, newMessage]);
        }
      })
      .subscribe();
    
    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedFriend, toast]);
  
  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!user || !selectedFriend || !newMessage.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedFriend.id,
          content: newMessage.trim()
        });
      
      if (error) throw error;
      
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex h-[600px] border border-snake-primary/30 rounded-lg overflow-hidden">
      {/* Friends List */}
      <div className="w-1/3 border-r border-snake-primary/30 bg-gray-900/50">
        <div className="p-3 border-b border-snake-primary/30">
          <h2 className="font-semibold text-snake-text">Friends</h2>
        </div>
        <ScrollArea className="h-[calc(600px-50px)]">
          {friends.length > 0 ? (
            <div className="divide-y divide-gray-800">
              {friends.map(friend => (
                <div 
                  key={friend.id}
                  className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-800 transition-colors ${
                    selectedFriend?.id === friend.id ? "bg-gray-800" : ""
                  }`}
                  onClick={() => setSelectedFriend(friend)}
                >
                  <Avatar>
                    <AvatarImage src={friend.avatar_url || undefined} />
                    <AvatarFallback>{friend.username?.substring(0, 2).toUpperCase() || 'UN'}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-snake-text">{friend.username}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-400">
              No friends yet. Search for users to add friends.
            </div>
          )}
        </ScrollArea>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedFriend ? (
          <>
            {/* Friend Info */}
            <div className="p-3 border-b border-snake-primary/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedFriend.avatar_url || undefined} />
                  <AvatarFallback>
                    {selectedFriend.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="font-semibold text-snake-text">{selectedFriend.username}</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400"
                onClick={() => setSelectedFriend(null)}
              >
                <MinusCircle size={18} />
              </Button>
            </div>
            
            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.length > 0 ? (
                  messages.map(message => {
                    const isOwnMessage = message.sender_id === user?.id;
                    
                    return (
                      <div 
                        key={message.id}
                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`flex items-start gap-2 max-w-[80%] ${isOwnMessage ? "flex-row-reverse" : ""}`}>
                          {!isOwnMessage && (
                            <Avatar className="mt-1">
                              <AvatarImage src={message.sender?.avatar_url || undefined} />
                              <AvatarFallback>
                                {message.sender?.username.substring(0, 2).toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div>
                            <div 
                              className={`rounded-lg p-3 ${
                                isOwnMessage 
                                  ? "bg-snake-primary text-white" 
                                  : "bg-gray-800 text-snake-text"
                              }`}
                            >
                              {message.content}
                            </div>
                            <div 
                              className={`text-xs text-gray-400 mt-1 ${isOwnMessage ? "text-right" : ""}`}
                            >
                              {new Date(message.created_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-400">
                    No messages yet. Start the conversation!
                  </div>
                )}
              </div>
            </ScrollArea>
            
            {/* Message Input */}
            <div className="p-3 border-t border-snake-primary/30 flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="bg-gray-800 border-gray-700"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={loading || !newMessage.trim()}
                className="bg-snake-primary hover:bg-purple-600"
              >
                <Send size={18} />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a friend to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
