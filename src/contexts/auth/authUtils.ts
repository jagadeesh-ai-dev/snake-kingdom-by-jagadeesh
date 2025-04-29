
import { supabase } from "@/integrations/supabase/client";
import { AppUser, DbProfile } from "@/types";
import { Profile } from "./types";

export const transformDbProfileToAppProfile = (dbProfile: DbProfile): Profile => {
  return {
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
};

export const updateUserWithProfileData = (user: AppUser | null, profile: DbProfile): AppUser | null => {
  if (!user) return null;
  
  return {
    ...user,
    username: profile.username,
    highScore: profile.highScore,
    profilePicture: profile.avatar_url,
    bio: profile.bio,
    contactDetails: {
      phone: profile.phone,
      website: profile.website,
      location: profile.location
    }
  };
};

export const fetchUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return data as DbProfile;
  } catch (error) {
    console.error('Error in profile fetch:', error);
    return null;
  }
};
