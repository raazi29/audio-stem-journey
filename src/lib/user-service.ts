import { supabase } from "@/integrations/supabase/client";
import { User } from "./auth";

// User profile interface
export interface UserProfile extends User {
  phone?: string;
  address?: string;
  preferences?: Record<string, any>;
  last_active?: string;
  device_info?: DeviceInfo;
  is_online?: boolean;
}

// Device information interface
export interface DeviceInfo {
  device_id: string;
  model?: string;
  os_version?: string;
  app_version?: string;
  last_connected?: string;
  installation_id?: string;
}

// User activity interface
export interface UserActivity {
  user_id: string;
  activity_type: string;
  activity_data?: Record<string, any>;
  metadata?: Record<string, any>;
  created_at?: string;
}

/**
 * Create or update a user profile in Supabase
 */
export const upsertUserProfile = async (
  userData: Partial<UserProfile>
): Promise<{ success: boolean; error?: any }> => {
  try {
    if (!userData.id) {
      throw new Error("User ID is required");
    }

    // Check if user profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userData.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is the error code for "no rows returned"
      console.error("Error fetching user profile:", fetchError);
      throw fetchError;
    }

    // Update timestamp
    const now = new Date().toISOString();
    const profile = {
      ...userData,
      updated_at: now,
      last_active: now,
    };

    let result;
    if (!existingProfile) {
      // Create new profile
      profile.created_at = now;
      result = await supabase
        .from("profiles")
        .insert([profile])
        .select();
    } else {
      // Update existing profile
      result = await supabase
        .from("profiles")
        .update(profile)
        .eq("id", userData.id)
        .select();
    }

    if (result.error) throw result.error;

    return { success: true };
  } catch (error) {
    console.error("Error upserting user profile:", error);
    return { success: false, error };
  }
};

/**
 * Get a user profile from Supabase
 */
export const getUserProfile = async (
  userId: string
): Promise<{ profile?: UserProfile; error?: any }> => {
  try {
    // Get user profile
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;

    return { profile: data as UserProfile };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { error };
  }
};

/**
 * Get multiple user profiles from Supabase
 */
export const getUserProfiles = async (
  options: { limit?: number; active_since?: string } = {}
): Promise<{ profiles?: UserProfile[]; error?: any }> => {
  try {
    let query = supabase.from("profiles").select("*");

    // Apply filters if provided
    if (options.active_since) {
      query = query.gte("last_active", options.active_since);
    }

    // Apply limit if provided
    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { profiles: data as UserProfile[] };
  } catch (error) {
    console.error("Error fetching user profiles:", error);
    return { error };
  }
};

/**
 * Update a user's device information
 */
export const updateUserDevice = async (
  userId: string,
  deviceInfo: DeviceInfo
): Promise<{ success: boolean; error?: any }> => {
  try {
    // Get existing profile first
    const { profile } = await getUserProfile(userId);

    if (!profile) {
      throw new Error("User profile not found");
    }

    // Update profile with device info
    const { error } = await supabase
      .from("profiles")
      .update({
        device_info: deviceInfo,
        last_active: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw error;

    // Also store in the devices table for better querying
    const { error: deviceError } = await supabase.from("devices").upsert(
      {
        user_id: userId,
        device_id: deviceInfo.device_id,
        model: deviceInfo.model,
        os_version: deviceInfo.os_version,
        app_version: deviceInfo.app_version,
        last_connected: new Date().toISOString(),
        installation_id: deviceInfo.installation_id,
      },
      { onConflict: "user_id, device_id" }
    );

    if (deviceError) throw deviceError;

    return { success: true };
  } catch (error) {
    console.error("Error updating user device:", error);
    return { success: false, error };
  }
};

/**
 * Track a user activity in Supabase
 */
export const trackUserActivity = async (
  userId: string,
  activityType: string,
  activityData: Record<string, any> = {},
  metadata: Record<string, any> = {}
): Promise<{ success: boolean; error?: any }> => {
  try {
    // Insert activity record
    const { error } = await supabase.from("user_activities").insert({
      user_id: userId,
      activity_type: activityType,
      activity_data: activityData,
      metadata: metadata,
    });

    if (error) throw error;

    // Update user's last active timestamp
    await supabase
      .from("profiles")
      .update({ last_active: new Date().toISOString() })
      .eq("id", userId);

    return { success: true };
  } catch (error) {
    console.error("Error tracking user activity:", error);
    return { success: false, error };
  }
};

/**
 * Set user online status
 */
export const setUserOnlineStatus = async (
  userId: string,
  isOnline: boolean
): Promise<{ success: boolean; error?: any }> => {
  try {
    // Check if status table exists
    const { error: tableCheckError } = await supabase
      .from("online_status")
      .select("user_id")
      .limit(1);

    // Create table if needed via RPC
    if (tableCheckError) {
      await supabase.rpc("ensure_online_status_table");
    }

    // Update or insert online status
    const { data, error } = await supabase
      .from("online_status")
      .upsert(
        {
          user_id: userId,
          is_online: isOnline,
          last_updated: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select();

    if (error) throw error;

    // Also update the profile
    const { data: directData, error: directError } = await supabase
      .from("profiles")
      .update({
        is_online: isOnline,
        last_active: new Date().toISOString(),
      })
      .eq("id", userId)
      .select();

    if (directError) throw directError;

    return { success: true };
  } catch (error) {
    console.error("Error updating online status:", error);
    return { success: false, error };
  }
};

/**
 * Subscribe to user online status changes
 */
export const subscribeToUserStatus = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel("online_status_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "online_status",
      },
      callback
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
};

/**
 * Subscribe to user activity
 */
export const subscribeToUserActivity = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel("user_activity_changes")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "user_activities",
      },
      callback
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
};

/**
 * Get online users count
 */
export const getOnlineUsersCount = async (): Promise<{ count: number; error?: any }> => {
  try {
    const { count, error } = await supabase
      .from("online_status")
      .select("*", { count: "exact" })
      .eq("is_online", true);

    if (error) throw error;

    return { count: count || 0 };
  } catch (error) {
    console.error("Error getting online users count:", error);
    return { count: 0, error };
  }
};

/**
 * Get a user's download history
 */
export const getUserDownloads = async (userId: string): Promise<{
  success: boolean;
  data?: any[];
  error?: any;
}> => {
  try {
    const { data, error } = await supabase
      .from('downloads')
      .select(`
        *,
        app_version:app_version_id (
          id,
          version,
          name,
          description,
          file_url,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('download_date', { ascending: false });
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Error getting user downloads:", error);
    return { success: false, error };
  }
};

/**
 * Update user preferences
 */
export const updateUserPreferences = async (
  userId: string, 
  preferences: object
): Promise<{ success: boolean; error?: any }> => {
  try {
    // Get existing profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', userId)
      .single();
      
    // Merge existing preferences with new ones
    const mergedPreferences = {
      ...(profile?.preferences || {}),
      ...preferences
    };
    
    // Update the profile
    const { error } = await supabase
      .from('profiles')
      .update({ 
        preferences: mergedPreferences,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return { success: false, error };
  }
};

/**
 * Get user's recent activities
 */
export const getUserActivities = async (
  userId: string, 
  limit: number = 10
): Promise<{
  success: boolean;
  activities?: any[];
  error?: any;
}> => {
  try {
    // First check if table exists (some users might not have the latest schema)
    const { error: tableCheckError } = await supabase
      .from('user_activities')
      .select('id')
      .limit(1);
    
    // If table doesn't exist, return empty array
    if (tableCheckError && tableCheckError.code === '42P01') { // 42P01 is "relation does not exist"
      console.warn("user_activities table doesn't exist yet");
      return { success: true, activities: [] };
    }

    // If we have the table, query it
    const { data, error } = await supabase
      .rpc('get_recent_user_activities', { 
        user_id: userId,
        limit_count: limit
      });

    if (error) {
      // If RPC function doesn't exist, try direct query
      if (error.code === '42883') { // 42883 is "function does not exist"
        const { data: directData, error: directError } = await supabase
          .from('user_activities')
          .select('id, activity_type, activity_details, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);
          
        if (directError) throw directError;
        return { success: true, activities: directData };
      }
      
      throw error;
    }

    return { success: true, activities: data };
  } catch (error) {
    console.error("Error getting user activities:", error);
    return { success: false, error };
  }
}; 