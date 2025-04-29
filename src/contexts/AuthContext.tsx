import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { AppUser, DbProfile } from "@/types";

type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  highScore?: number;
  bio?: string;
  contactDetails?: {
    phone?: string;
    website?: string;
    location?: string;
  };
};

type AuthContextType = {
  user: AppUser | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (userData: Partial<Profile>) => Promise<boolean>;
  updateProfilePicture: (imageBase64: string) => Promise<boolean>;
  loading: boolean;
};

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
            try {
              const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (error) {
                console.error('Error fetching profile:', error);
              } else if (data) {
                const dbProfile = data as DbProfile;
                
                // Transform database profile to our app profile format
                const appProfile: Profile = {
                  id: dbProfile.id,
                  username: dbProfile.username,
                  avatar_url: dbProfile.avatar_url,
                  highScore: dbProfile.highScore,
                  bio: dbProfile.bio,
                  contactDetails: {
                    phone: dbProfile.phone,
                    website: dbProfile.website,
                    location: dbProfile.location
                  }
                };
                
                setProfile(appProfile);
                
                // Update user with additional fields from profile
                setUser(prevUser => {
                  if (!prevUser) return null;
                  return {
                    ...prevUser,
                    username: dbProfile.username,
                    highScore: dbProfile.highScore,
                    profilePicture: dbProfile.avatar_url,
                    bio: dbProfile.bio,
                    contactDetails: {
                      phone: dbProfile.phone,
                      website: dbProfile.website,
                      location: dbProfile.location
                    }
                  };
                });
              }
            } catch (error) {
              console.error('Error in profile fetch:', error);
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
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error('Error fetching profile:', error);
            } else if (data) {
              const dbProfile = data as DbProfile;
              
              // Transform database profile to our app profile format
              const appProfile: Profile = {
                id: dbProfile.id,
                username: dbProfile.username,
                avatar_url: dbProfile.avatar_url,
                highScore: dbProfile.highScore,
                bio: dbProfile.bio,
                contactDetails: {
                  phone: dbProfile.phone,
                  website: dbProfile.website,
                  location: dbProfile.location
                }
              };
              
              setProfile(appProfile);
              
              // Update user with additional fields from profile
              setUser(prevUser => {
                if (!prevUser) return null;
                return {
                  ...prevUser,
                  username: dbProfile.username,
                  highScore: dbProfile.highScore,
                  profilePicture: dbProfile.avatar_url,
                  bio: dbProfile.bio,
                  contactDetails: {
                    phone: dbProfile.phone,
                    website: dbProfile.website,
                    location: dbProfile.location
                  }
                };
              });
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
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred during login' };
    }
  };

  const register = async (email: string, username: string, password: string) => {
    try {
      // Check if username exists first
      const { data: existingUsers, error: queryError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username);

      if (queryError) {
        return { success: false, error: 'Error checking username availability' };
      }

      if (existingUsers && existingUsers.length > 0) {
        return { success: false, error: 'Username already taken' };
      }

      // Register the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An unexpected error occurred during registration' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const updateProfile = async (userData: Partial<Profile>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: userData.username,
          bio: userData.bio,
          phone: userData.contactDetails?.phone,
          website: userData.contactDetails?.website,
          location: userData.contactDetails?.location,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        return false;
      }

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
      
      return true;
    } catch (error) {
      console.error('Error in update profile:', error);
      return false;
    }
  };

  const updateProfilePicture = async (imageBase64: string) => {
    if (!user) return false;

    try {
      // Update the profile with the avatar URL
      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_url: imageBase64,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating avatar:', error);
        return false;
      }

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
      
      return true;
    } catch (error) {
      console.error('Error in avatar update:', error);
      return false;
    }
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
    updateProfile,
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
