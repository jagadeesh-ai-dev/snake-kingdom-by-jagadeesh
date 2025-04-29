
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { AppUser } from "@/types";
import { AuthContextType, Profile } from "./types";
import { 
  fetchUserProfile,
  transformDbProfileToAppProfile, 
  updateUserWithProfileData 
} from "./authUtils";
import {
  loginUser,
  registerUser,
  logoutUser,
  resetUserPassword,
  updateUserProfile,
  updateUserProfilePicture
} from "./authService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Cast as AppUser and set initial user
          setUser(session.user as AppUser);

          // Only fetch profile when there's a user and on relevant events
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            const dbProfile = await fetchUserProfile(session.user.id);
            
            if (dbProfile) {
              // Transform database profile to our app profile format
              const appProfile = transformDbProfileToAppProfile(dbProfile);
              setProfile(appProfile);
              
              // Update user with additional fields from profile
              setUser(prevUser => updateUserWithProfileData(prevUser, dbProfile));
            }
          }
        } else if (!session) {
          setUser(null);
          setProfile(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        // Cast as AppUser and set initial user
        setUser(session.user as AppUser);
        
        // Fetch profile data
        fetchUserProfile(session.user.id).then(dbProfile => {
          if (dbProfile) {
            // Transform database profile to our app profile format
            const appProfile = transformDbProfileToAppProfile(dbProfile);
            setProfile(appProfile);
            
            // Update user with additional fields from profile
            setUser(prevUser => updateUserWithProfileData(prevUser, dbProfile));
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    return await loginUser(email, password);
  };

  const register = async (email: string, username: string, password: string) => {
    return await registerUser(email, username, password);
  };

  const logout = async () => {
    await logoutUser();
  };

  const resetPassword = async (email: string) => {
    return await resetUserPassword(email);
  };

  const updateProfileData = async (userData: Partial<Profile>) => {
    if (!user) return false;

    const success = await updateUserProfile(user.id, userData);
    
    if (success) {
      // Update the local state
      setProfile(prev => prev ? { ...prev, ...userData } : null);
      
      // Update the user object as well
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          username: userData.username || prevUser.username,
          bio: userData.bio || prevUser.bio,
          contactDetails: {
            ...prevUser.contactDetails,
            ...userData.contactDetails
          }
        };
      });
    }
    
    return success;
  };

  const updateProfilePicture = async (imageBase64: string) => {
    if (!user) return false;

    const success = await updateUserProfilePicture(user.id, imageBase64);
    
    if (success) {
      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: imageBase64 } : null);
      
      // Update user object
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          profilePicture: imageBase64
        };
      });
    }
    
    return success;
  };

  const value = {
    user,
    profile,
    isAuthenticated: !!user,
    session,
    login,
    register,
    logout,
    resetPassword,
    updateProfile: updateProfileData,
    updateProfilePicture,
    loading
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
