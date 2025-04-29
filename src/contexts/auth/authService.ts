
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

export const registerUser = async (email: string, username: string, password: string) => {
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
