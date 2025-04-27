
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User, MapPin, Phone, Globe } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

const Profile = () => {
  const { user, updateProfile, updateProfilePicture } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  
  const [bio, setBio] = useState(user?.bio || "");
  const [phone, setPhone] = useState(user?.contactDetails?.phone || "");
  const [website, setWebsite] = useState(user?.contactDetails?.website || "");
  const [location, setLocation] = useState(user?.contactDetails?.location || "");
  const [isSaving, setIsSaving] = useState(false);
  
  // Game history from local storage
  const [gameHistory, setGameHistory] = useState<{score: number; date: string}[]>(() => {
    if (!user) return [];
    
    const historyKey = `gameHistory-${user.id}`;
    const savedHistory = localStorage.getItem(historyKey);
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  
  if (!user) {
    navigate("/login");
    return null;
  }
  
  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    try {
      const success = await updateProfile({ 
        bio,
        contactDetails: {
          phone,
          website,
          location
        }
      });
      
      if (success) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleProfilePictureClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // File size validation (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should not exceed 2MB",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        const imageBase64 = event.target.result.toString();
        
        try {
          const success = await updateProfilePicture(imageBase64);
          
          if (success) {
            toast({
              title: "Profile Picture Updated",
              description: "Your profile picture has been updated successfully.",
            });
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to update profile picture. Please try again.",
            variant: "destructive",
          });
        }
      }
    };
    
    reader.readAsDataURL(file);
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
      <h1 className="text-3xl md:text-4xl font-bold text-snake-text mb-8">Your Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-snake-background border border-snake-primary/30 rounded-lg p-6 sticky top-4">
            <div className="flex flex-col items-center">
              <div className="relative mb-4 group cursor-pointer" onClick={handleProfilePictureClick}>
                <Avatar className="w-32 h-32 border-4 border-snake-primary">
                  {user.profilePicture ? (
                    <AvatarImage src={user.profilePicture} alt={user.username} />
                  ) : (
                    <AvatarFallback className="bg-snake-primary text-4xl">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="text-white" size={32} />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              
              <h2 className="text-2xl font-bold">{user.username}</h2>
              <p className="text-gray-400 mt-1">{user.email}</p>
              
              <div className="w-full border-t border-snake-grid my-6"></div>
              
              <div className="w-full">
                <div className="flex justify-between mb-4">
                  <span className="text-gray-400">High Score</span>
                  <span className="font-bold text-snake-score">{user.highScore}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-gray-400">Games Played</span>
                  <span className="font-bold">{gameHistory.length}</span>
                </div>
              </div>
              
              {user.contactDetails && (
                <div className="w-full mt-4">
                  {user.contactDetails.location && (
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <MapPin size={16} />
                      <span>{user.contactDetails.location}</span>
                    </div>
                  )}
                  {user.contactDetails.phone && (
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <Phone size={16} />
                      <span>{user.contactDetails.phone}</span>
                    </div>
                  )}
                  {user.contactDetails.website && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Globe size={16} />
                      <a 
                        href={user.contactDetails.website.startsWith('http') ? user.contactDetails.website : `https://${user.contactDetails.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-snake-primary hover:underline"
                      >
                        {user.contactDetails.website}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="games">Game History</TabsTrigger>
              <TabsTrigger value="edit">Edit Profile</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about">
              <div className="bg-snake-background border border-snake-primary/30 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-snake-text">Bio</h3>
                {user.bio ? (
                  <p className="text-gray-300 whitespace-pre-wrap">{user.bio}</p>
                ) : (
                  <p className="text-gray-400 italic">No bio yet. Add one in the Edit Profile section.</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="games">
              <div className="bg-snake-background border border-snake-primary/30 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-snake-text">Game History</h3>
                
                {gameHistory.length > 0 ? (
                  <div className="space-y-2">
                    {gameHistory.map((game, index) => (
                      <div 
                        key={index} 
                        className="bg-gray-800 bg-opacity-30 p-3 rounded flex justify-between items-center"
                      >
                        <span>{formatDate(game.date)}</span>
                        <span className="font-medium text-snake-score">{game.score}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No games played yet.</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="edit">
              <div className="bg-snake-background border border-snake-primary/30 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-6 text-snake-text">Edit Profile</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Bio</label>
                    <Textarea 
                      value={bio} 
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="bg-gray-800 border-gray-700 min-h-[120px]"
                    />
                  </div>
                  
                  <h4 className="text-lg font-medium mt-4 mb-2">Contact Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <Input 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Your phone number"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <Input 
                      value={website} 
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="Your website"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <Input 
                      value={location} 
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Your location"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="mt-4 bg-snake-primary hover:bg-purple-600"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
