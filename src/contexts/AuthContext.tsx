
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type User = {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
  highScore: number;
  bio?: string;
  contactDetails?: {
    phone?: string;
    website?: string;
    location?: string;
  };
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  updateProfilePicture: (imageBase64: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("snakeUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // For demo purposes, we'll simulate a successful login for specific credentials
    // In a real app, this would connect to your backend
    if (email === "demo@example.com" && password === "password") {
      const mockUser: User = {
        id: "user-1",
        username: "SnakePlayerOne",
        email: "demo@example.com",
        highScore: 100,
        bio: "Snake enthusiast and game developer",
        contactDetails: {
          location: "Snake City, Reptile Land"
        }
      };
      setUser(mockUser);
      localStorage.setItem("snakeUser", JSON.stringify(mockUser));
      return true;
    }
    
    // Check if any registered users exist in localStorage
    const registeredUsers = localStorage.getItem("registeredUsers");
    if (registeredUsers) {
      const users = JSON.parse(registeredUsers);
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      
      if (foundUser) {
        const loggedInUser: User = {
          id: foundUser.id,
          username: foundUser.username,
          email: foundUser.email,
          highScore: foundUser.highScore || 0,
          profilePicture: foundUser.profilePicture,
          bio: foundUser.bio || '',
          contactDetails: foundUser.contactDetails || {}
        };
        
        setUser(loggedInUser);
        localStorage.setItem("snakeUser", JSON.stringify(loggedInUser));
        return true;
      }
    }
    
    return false;
  };

  const register = async (email: string, username: string, password: string): Promise<boolean> => {
    // Check if username or email already exists
    const registeredUsers = localStorage.getItem("registeredUsers");
    let users = [];
    
    if (registeredUsers) {
      users = JSON.parse(registeredUsers);
      
      const existingUser = users.find(
        (u: any) => u.email === email || u.username === username
      );
      
      if (existingUser) {
        return false;
      }
    }
    
    // Create new user
    const newUser = {
      id: `user-${Date.now()}`,
      username,
      email,
      password, // In a real app, this would be hashed
      highScore: 0,
      bio: '',
      contactDetails: {},
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    localStorage.setItem("registeredUsers", JSON.stringify(users));
    
    // Log the user in
    const loggedInUser: User = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      highScore: 0,
      bio: '',
      contactDetails: {}
    };
    
    setUser(loggedInUser);
    localStorage.setItem("snakeUser", JSON.stringify(loggedInUser));
    return true;
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    // Check if email exists in registered users
    const registeredUsers = localStorage.getItem("registeredUsers");
    if (!registeredUsers) return false;
    
    const users = JSON.parse(registeredUsers);
    const userExists = users.some((u: any) => u.email === email);
    
    if (!userExists) return false;
    
    // In a real app, this would generate a reset token and send an email
    // For demo purposes, we'll just reset to a default password
    const updatedUsers = users.map((u: any) => {
      if (u.email === email) {
        return { ...u, password: "resetpassword" };
      }
      return u;
    });
    
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
    return true;
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem("snakeUser", JSON.stringify(updatedUser));
    
    // Update in registered users as well
    const registeredUsers = localStorage.getItem("registeredUsers");
    if (registeredUsers) {
      const users = JSON.parse(registeredUsers);
      const updatedUsers = users.map((u: any) => 
        u.id === user.id ? { ...u, ...userData, password: u.password } : u
      );
      localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
    }
    
    return true;
  };
  
  const updateProfilePicture = async (imageBase64: string): Promise<boolean> => {
    if (!user) return false;
    
    const updatedUser = { ...user, profilePicture: imageBase64 };
    setUser(updatedUser);
    localStorage.setItem("snakeUser", JSON.stringify(updatedUser));
    
    // Update in registered users as well
    const registeredUsers = localStorage.getItem("registeredUsers");
    if (registeredUsers) {
      const users = JSON.parse(registeredUsers);
      const updatedUsers = users.map((u: any) => 
        u.id === user.id ? { ...u, profilePicture: imageBase64, password: u.password } : u
      );
      localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
    }
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("snakeUser");
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    updateProfilePicture
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
