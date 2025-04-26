
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type PrivacyLevel = "public" | "friends" | "private";

type User = {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  phone?: string;
  phonePrivacy?: PrivacyLevel;
  emailPrivacy?: PrivacyLevel;
  highScore: number;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
};

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export the AuthProvider as a proper React function component
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
        bio: "I love playing Snake!",
        phonePrivacy: "private",
        emailPrivacy: "private"
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
          bio: foundUser.bio || "",
          phone: foundUser.phone || "",
          phonePrivacy: foundUser.phonePrivacy || "private",
          emailPrivacy: foundUser.emailPrivacy || "private"
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
      bio: "",
      phonePrivacy: "private",
      emailPrivacy: "private",
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
      phonePrivacy: "private",
      emailPrivacy: "private",
    };
    
    setUser(loggedInUser);
    localStorage.setItem("snakeUser", JSON.stringify(loggedInUser));
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
