
import { Session } from "@supabase/supabase-js";
import { AppUser, DbProfile } from "@/types";

export type Profile = {
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

export type AuthContextType = {
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
