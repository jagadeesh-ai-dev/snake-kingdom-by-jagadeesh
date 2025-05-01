
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "./types";

export const loginUser = async (email: string, password: string) => {
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

// Username validation function
export const validateUsername = (username: string): { valid: boolean; message?: string } => {
  // Check if username contains only lowercase letters, numbers, and underscores
  const usernameRegex = /^[a-z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return { 
      valid: false, 
      message: 'Username can only contain lowercase letters, numbers, and underscores' 
    };
  }
  
  return { valid: true };
};

export const registerUser = async (email: string, username: string, password: string) => {
  try {
    // Validate username
    const validation = validateUsername(username);
    if (!validation.valid) {
      return { success: false, error: validation.message };
    }
    
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

    // Register the user with custom email template
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        },
        emailRedirectTo: `${window.location.origin}/login`
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

export const logoutUser = async () => {
  return await supabase.auth.signOut();
};

export const resetUserPassword = async (email: string) => {
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

export const updateUserProfile = async (userId: string, userData: Partial<Profile>) => {
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
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in update profile:', error);
    return false;
  }
};

export const updateUserProfilePicture = async (userId: string, imageBase64: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        avatar_url: imageBase64,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating avatar:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in avatar update:', error);
    return false;
  }
};

export const searchUsers = async (searchTerm: string) => {
  try {
    // Search users by username
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .ilike('username', `%${searchTerm}%`)
      .limit(10);
    
    if (error) {
      console.error('Error searching users:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error in user search:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const saveGameData = async (userId: string, score: number, gameHistory: any[]) => {
  try {
    // Update highscore if the new score is higher
    if (score > 0) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('highscore')
        .eq('id', userId)
        .single();
      
      if (userProfile && (userProfile.highscore === null || score > userProfile.highscore)) {
        await supabase
          .from('profiles')
          .update({
            highscore: score,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
      }
    }
    
    // Save game history to localStorage
    const historyKey = `gameHistory-${userId}`;
    localStorage.setItem(historyKey, JSON.stringify(gameHistory));
    
    return true;
  } catch (error) {
    console.error('Error saving game data:', error);
    return false;
  }
};
