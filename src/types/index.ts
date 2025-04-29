
import { User as SupabaseUser } from "@supabase/supabase-js";

// Extended user type that includes our custom properties
export interface AppUser extends SupabaseUser {
  username?: string;
  highScore?: number;
  profilePicture?: string;
  bio?: string;
  contactDetails?: {
    phone?: string;
    website?: string;
    location?: string;
  };
}

// Database profile type that matches our database schema
export interface DbProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  highScore?: number;
  bio?: string;
  phone?: string;
  website?: string;
  location?: string;
}
