
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { 
  Camera, 
  User, 
  Check, 
  AlertCircle, 
  Phone, 
  Mail, 
  Pencil 
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-mobile";

type PrivacyLevel = "public" | "friends" | "private";

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Profile form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [phonePrivacy, setPhonePrivacy] = useState<PrivacyLevel>("private");
  const [emailPrivacy, setEmailPrivacy] = useState<PrivacyLevel>("private");
  
  // Section visibility state for mobile accordion
  const [activeSection, setActiveSection] = useState<string | null>("profile-info");
  
  // Validation
  const [bioCount, setBioCount] = useState(0);
  const maxBioLength = 250;
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setBio(user.bio || "");
      setPhone(user.phone || "");
      setProfilePicture(user.profilePicture || null);
      setPhonePrivacy(user.phonePrivacy || "private");
      setEmailPrivacy(user.emailPrivacy || "private");
      setBioCount((user.bio || "").length);
    }
  }, [isAuthenticated, navigate, user]);
  
  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= maxBioLength) {
      setBio(text);
      setBioCount(text.length);
    }
  };
  
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Convert to base64 for storage in localStorage
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const validateForm = () => {
    if (!username.trim()) {
      toast({
        variant: "destructive",
        title: "Username is required",
        description: "Please enter a username.",
      });
      return false;
    }
    
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast({
        variant: "destructive",
        title: "Valid email is required",
        description: "Please enter a valid email address.",
      });
      return false;
    }
    
    if (phone && !/^\+?[0-9]{10,15}$/.test(phone.replace(/[- ]/g, ''))) {
      toast({
        variant: "destructive",
        title: "Invalid phone number",
        description: "Please enter a valid phone number or leave it blank.",
      });
      return false;
    }
    
    return true;
  };
  
  const handleProfileUpdate = () => {
    if (!user || !validateForm()) return;
    
    // Update user in local storage
    const updatedUser = { 
      ...user, 
      username,
      email,
      bio,
      phone,
      profilePicture,
      phonePrivacy,
      emailPrivacy,
    };
    
    localStorage.setItem("snakeUser", JSON.stringify(updatedUser));
    
    // Update in registered users
    const registeredUsers = localStorage.getItem("registeredUsers");
    if (registeredUsers) {
      const users = JSON.parse(registeredUsers);
      const updatedUsers = users.map((u: any) => 
        u.id === user.id ? { 
          ...u, 
          username,
          email,
          bio,
          phone,
          profilePicture,
          phonePrivacy,
          emailPrivacy,
        } : u
      );
      localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
    }
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
      variant: "default",
    });
  };
  
  const ProfileForm = () => (
    <div className="space-y-6">
      {/* Profile Picture */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-32 h-32 bg-snake-primary/30 rounded-full overflow-hidden mb-4 relative">
          {profilePicture ? (
            <img 
              src={profilePicture}
              alt={username}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-full h-full p-6 text-white" />
          )}
          <label className="absolute bottom-0 right-0 bg-snake-primary hover:bg-purple-600 rounded-full p-2 cursor-pointer">
            <Camera size={20} className="text-white" />
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleProfilePictureChange}
            />
          </label>
        </div>
        <p className="text-center text-sm text-gray-400 mb-4">
          Click the camera icon to upload a profile picture
        </p>
      </div>
      
      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your display name"
          className="bg-gray-800 border-gray-700"
        />
      </div>
      
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="flex gap-3">
          <div className="flex-grow">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="bg-gray-800 border-gray-700"
            />
          </div>
          <Select value={emailPrivacy} onValueChange={(value: PrivacyLevel) => setEmailPrivacy(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Privacy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="friends">Friends Only</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number (Optional)</Label>
        <div className="flex gap-3">
          <div className="flex-grow">
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Your phone number"
              className="bg-gray-800 border-gray-700"
            />
          </div>
          <Select value={phonePrivacy} onValueChange={(value: PrivacyLevel) => setPhonePrivacy(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Privacy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="friends">Friends Only</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Bio */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="bio">Bio</Label>
          <span className={`text-xs ${bioCount > maxBioLength - 50 ? 'text-orange-400' : 'text-gray-400'}`}>
            {bioCount}/{maxBioLength}
          </span>
        </div>
        <Textarea
          id="bio"
          value={bio}
          onChange={handleBioChange}
          placeholder="Tell others about yourself"
          className="bg-gray-800 border-gray-700 resize-none h-32"
        />
      </div>
      
      <div className="pt-4">
        <Button 
          onClick={handleProfileUpdate}
          className="w-full bg-snake-primary hover:bg-purple-600"
        >
          <Check className="mr-2 h-4 w-4" /> Save Profile
        </Button>
      </div>
      
      <div className="text-sm text-gray-400 pt-2">
        <p className="flex items-center">
          <AlertCircle size={14} className="mr-1" />
          Your privacy settings control who can see your contact information.
        </p>
      </div>
    </div>
  );
  
  if (!isAuthenticated || !user) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-snake-text">Edit Profile</h1>
      
      {/* Desktop layout */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile sidebar */}
        <div className="col-span-1">
          <div className="bg-snake-background border border-snake-primary/30 rounded-lg p-6 sticky top-4">
            <div className="flex flex-col items-center">
              <Avatar className="w-32 h-32">
                <AvatarImage src={profilePicture || undefined} alt={username} />
                <AvatarFallback className="bg-snake-primary/50 text-white text-4xl">
                  {username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold mt-4 mb-1">{username}</h2>
              <p className="text-gray-400 text-sm mb-4">{email}</p>
              <div className="w-full border-t border-gray-700 my-4"></div>
              <div className="space-y-4 w-full">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-300">{email}</p>
                    <p className="text-xs text-gray-500">Privacy: {emailPrivacy}</p>
                  </div>
                </div>
                {phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-3 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-300">{phone}</p>
                      <p className="text-xs text-gray-500">Privacy: {phonePrivacy}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile form */}
        <div className="col-span-1 md:col-span-2">
          <div className="bg-snake-background border border-snake-primary/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
            <ProfileForm />
          </div>
        </div>
      </div>
      
      {/* Mobile layout */}
      <div className="block md:hidden">
        <div className="bg-snake-background border border-snake-primary/30 rounded-lg p-6 mb-6">
          <div className="flex flex-col items-center">
            <Avatar className="w-28 h-28">
              <AvatarImage src={profilePicture || undefined} alt={username} />
              <AvatarFallback className="bg-snake-primary/50 text-white text-3xl">
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold mt-4 mb-1">{username}</h2>
            <p className="text-gray-400 text-sm mb-2">{email}</p>
            
            {isMobile ? (
              <Drawer>
                <DrawerTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="mt-4 w-full border-snake-primary text-snake-primary hover:bg-snake-primary hover:text-white"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="px-4 pb-6">
                  <DrawerHeader>
                    <DrawerTitle>Edit Profile</DrawerTitle>
                    <DrawerDescription>
                      Update your profile information below
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="px-4">
                    <ProfileForm />
                  </div>
                  <DrawerFooter>
                    <DrawerClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="mt-4 w-full border-snake-primary text-snake-primary hover:bg-snake-primary hover:text-white"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Update your profile information below
                    </DialogDescription>
                  </DialogHeader>
                  <ProfileForm />
                </DialogContent>
              </Dialog>
            )}
            
            <div className="w-full border-t border-gray-700 my-4"></div>
            <div className="space-y-4 w-full">
              {email && (
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-300">{email}</p>
                    <p className="text-xs text-gray-500">Privacy: {emailPrivacy}</p>
                  </div>
                </div>
              )}
              {phone && (
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-300">{phone}</p>
                    <p className="text-xs text-gray-500">Privacy: {phonePrivacy}</p>
                  </div>
                </div>
              )}
            </div>
            
            {bio && (
              <>
                <div className="w-full border-t border-gray-700 my-4"></div>
                <div className="w-full">
                  <h3 className="text-sm text-gray-400 mb-2">About Me</h3>
                  <p className="text-sm text-gray-300">{bio}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
