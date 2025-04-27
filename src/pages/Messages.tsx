
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, Mic, MicOff, Send, User } from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-mobile";

// Mock friend data
const MOCK_FRIENDS = [
  { id: "user1", username: "snake_master", profilePicture: "", lastMessage: "Hey, want to play a game?", lastMessageTime: "12:30" },
  { id: "user2", username: "apple_eater", profilePicture: "", lastMessage: "I beat your high score!", lastMessageTime: "Yesterday" },
  { id: "user3", username: "python_dev", profilePicture: "", lastMessage: "Check out this new strategy", lastMessageTime: "Monday" },
];

// Mock messages data
const MOCK_MESSAGES = {
  "user1": [
    { id: "m1", senderId: "user1", text: "Hey, want to play a game?", timestamp: "12:30", isVoice: false },
    { id: "m2", senderId: "currentUser", text: "Sure, I'm online now!", timestamp: "12:31", isVoice: false },
    { id: "m3", senderId: "user1", text: "Great! I'll challenge you", timestamp: "12:32", isVoice: false },
    { id: "m4", senderId: "currentUser", text: "Let's do it!", timestamp: "12:33", isVoice: false },
  ],
  "user2": [
    { id: "m5", senderId: "user2", text: "I beat your high score!", timestamp: "Yesterday", isVoice: false },
    { id: "m6", senderId: "currentUser", text: "No way! What score did you get?", timestamp: "Yesterday", isVoice: false },
    { id: "m7", senderId: "user2", text: "145 points!", timestamp: "Yesterday", isVoice: false },
    { id: "m8", senderId: "currentUser", text: "Impressive! I'll try to beat it tonight", timestamp: "Yesterday", isVoice: false },
  ],
  "user3": [
    { id: "m9", senderId: "currentUser", text: "How's it going?", timestamp: "Monday", isVoice: false },
    { id: "m10", senderId: "user3", text: "Good! Check out this new strategy", timestamp: "Monday", isVoice: false },
    { id: "m11", senderId: "user3", text: "Go for the corners first", timestamp: "Monday", isVoice: false },
    { id: "m12", senderId: "currentUser", text: "Thanks for the tip!", timestamp: "Monday", isVoice: false },
  ],
};

const Messages = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const messagesEndRef = useRef(null);
  
  const [friends, setFriends] = useState(MOCK_FRIENDS);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedFriend]);
  
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Messages</h1>
          <p className="mb-6">Please log in to see your messages.</p>
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
  
  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
    if (isMobile) {
      setIsDrawerOpen(false);
    }
  };
  
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedFriend) return;
    
    const newMessage = {
      id: `m${Date.now()}`,
      senderId: "currentUser",
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoice: false,
    };
    
    // Add message to conversation
    setMessages(prev => ({
      ...prev,
      [selectedFriend.id]: [...(prev[selectedFriend.id] || []), newMessage],
    }));
    
    // Update last message in friend list
    setFriends(prev => prev.map(friend => 
      friend.id === selectedFriend.id 
        ? { 
            ...friend, 
            lastMessage: messageText, 
            lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          } 
        : friend
    ));
    
    setMessageText("");
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const toggleVoiceRecording = () => {
    if (isRecording) {
      // Simulate ending recording
      setIsRecording(false);
      
      toast({
        title: "Voice Message Recorded",
        description: "Your voice message has been recorded and sent.",
      });
      
      // Create a simulated voice message
      const newVoiceMessage = {
        id: `m${Date.now()}`,
        senderId: "currentUser",
        text: "🎤 Voice message (0:08)",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isVoice: true,
      };
      
      // Add to conversation
      setMessages(prev => ({
        ...prev,
        [selectedFriend.id]: [...(prev[selectedFriend.id] || []), newVoiceMessage],
      }));
      
      // Update last message
      setFriends(prev => prev.map(friend => 
        friend.id === selectedFriend.id 
          ? { 
              ...friend, 
              lastMessage: "🎤 Voice message", 
              lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            } 
          : friend
      ));
    } else {
      // Simulate starting recording
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Recording voice message... Press the button again to stop and send.",
      });
    }
  };
  
  const renderChatMessage = (message, index, currentMessages) => {
    const isCurrentUser = message.senderId === "currentUser";
    const showTimestamp = index === 0 || 
      currentMessages[index - 1].senderId !== message.senderId;
    
    return (
      <div 
        key={message.id}
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}
      >
        <div className={`max-w-[75%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
          {showTimestamp && (
            <div className="text-xs text-gray-400 mb-1">
              {message.timestamp}
            </div>
          )}
          
          <div 
            className={`px-4 py-2 rounded-lg ${
              isCurrentUser 
                ? 'bg-snake-primary text-white rounded-br-none' 
                : 'bg-gray-700 text-white rounded-bl-none'
            } ${message.isVoice ? 'flex items-center' : ''}`}
          >
            {message.isVoice ? (
              <>
                <Mic className="h-4 w-4 mr-2" />
                <span>{message.text}</span>
              </>
            ) : (
              message.text
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-snake-text mb-8 flex items-center gap-2">
        <MessageSquare className="h-6 w-6" /> Messages
      </h1>
      
      <div className="bg-snake-background border border-snake-primary/30 rounded-lg overflow-hidden">
        <div className="flex h-[calc(80vh-8rem)]">
          {/* Friends list - hidden on mobile */}
          <div className={`${isMobile ? 'hidden' : 'block'} w-1/3 border-r border-gray-700`}>
            <div className="p-4 border-b border-gray-700">
              <Input 
                placeholder="Search conversations..." 
                className="bg-gray-800 border-gray-700"
              />
            </div>
            
            <div className="overflow-y-auto h-[calc(80vh-12rem)]">
              {friends.map(friend => (
                <div 
                  key={friend.id}
                  className={`flex items-center p-4 cursor-pointer hover:bg-gray-800 ${
                    selectedFriend?.id === friend.id ? 'bg-gray-800' : ''
                  }`}
                  onClick={() => handleSelectFriend(friend)}
                >
                  <Avatar className="h-10 w-10 mr-3">
                    {friend.profilePicture ? (
                      <AvatarImage src={friend.profilePicture} alt={friend.username} />
                    ) : (
                      <AvatarFallback className="bg-snake-primary">
                        {friend.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium truncate">{friend.username}</h3>
                      <span className="text-xs text-gray-400">{friend.lastMessageTime}</span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">{friend.lastMessage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Mobile drawer for friends list */}
          {isMobile && (
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="absolute top-4 left-4 z-10 bg-gray-800"
                >
                  <User className="h-4 w-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="bg-gray-900 max-h-[90vh]">
                <div className="p-4 max-w-md mx-auto w-full">
                  <h2 className="text-xl font-bold mb-4">Conversations</h2>
                  <Input 
                    placeholder="Search conversations..." 
                    className="bg-gray-800 border-gray-700 mb-4"
                  />
                  
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {friends.map(friend => (
                      <div 
                        key={friend.id}
                        className="flex items-center p-4 rounded-lg cursor-pointer hover:bg-gray-800"
                        onClick={() => handleSelectFriend(friend)}
                      >
                        <Avatar className="h-10 w-10 mr-3">
                          {friend.profilePicture ? (
                            <AvatarImage src={friend.profilePicture} alt={friend.username} />
                          ) : (
                            <AvatarFallback className="bg-snake-primary">
                              {friend.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        
                        <div className="flex-1 overflow-hidden">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium truncate">{friend.username}</h3>
                            <span className="text-xs text-gray-400">{friend.lastMessageTime}</span>
                          </div>
                          <p className="text-sm text-gray-400 truncate">{friend.lastMessage}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          )}
          
          {/* Chat area */}
          <div className={`${isMobile ? 'w-full' : 'w-2/3'} flex flex-col`}>
            {selectedFriend ? (
              <>
                {/* Chat header */}
                <div className="p-4 border-b border-gray-700 flex items-center">
                  <Avatar className="h-8 w-8 mr-3">
                    {selectedFriend.profilePicture ? (
                      <AvatarImage src={selectedFriend.profilePicture} alt={selectedFriend.username} />
                    ) : (
                      <AvatarFallback className="bg-snake-primary">
                        {selectedFriend.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <h2 className="font-medium">{selectedFriend.username}</h2>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-auto border-green-500 text-green-500 hover:bg-green-800 hover:text-white hover:border-green-800"
                  >
                    Challenge to Game
                  </Button>
                </div>
                
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {messages[selectedFriend.id]?.map((message, index, arr) => 
                      renderChatMessage(message, index, arr)
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
                
                {/* Input area */}
                <div className="p-4 border-t border-gray-700 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className={isRecording ? "bg-red-600 text-white border-red-600" : ""}
                    onClick={toggleVoiceRecording}
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  
                  <Input
                    placeholder={isRecording ? "Recording..." : "Type a message..."}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={isRecording}
                    className="bg-gray-800 border-gray-700"
                  />
                  
                  <Button
                    size="icon"
                    disabled={!messageText.trim() && !isRecording}
                    onClick={handleSendMessage}
                    className="bg-snake-primary hover:bg-purple-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-4">
                <MessageSquare className="h-16 w-16 text-gray-600 mb-4" />
                <h2 className="text-xl font-medium text-gray-400 mb-2">Your Messages</h2>
                <p className="text-gray-500 text-center max-w-xs">
                  {isMobile 
                    ? "Click the user button to select a conversation"
                    : "Select a conversation to start chatting"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
