import { supabase } from "@/integrations/supabase/client";
import { trackUserActivity } from "./user-service";

// Function to save user info to the database without authentication
export const saveUserInfo = async (userData: {
  id?: string;
  email: string;
  name?: string;
  preferences?: Record<string, any>;
}) => {
  try {
    // If we have an ID (from Supabase Auth), use it directly
    if (userData.id) {
      // Update or insert user data with the provided ID
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: userData.id,
          email: userData.email,
          name: userData.name || null,
          preferences: userData.preferences || {},
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString() // Only used for new records
        }, { 
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error upserting user with ID:', error);
        return { success: false, error };
      }
      
      return { success: true, user: data || userData };
    }
    
    // If no ID provided, check if user already exists by email
    const { data: existingUser, error: searchError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userData.email)
      .single();
    
    if (searchError && searchError.code !== 'PGRST116') {
      console.error('Error checking for existing user:', searchError);
      return { success: false, error: searchError };
    }
    
    // Update or insert user data
    if (existingUser) {
      // Update existing user
      const { error } = await supabase
        .from('users')
        .update({
          name: userData.name,
          preferences: userData.preferences,
          updated_at: new Date().toISOString()
        })
        .eq('email', userData.email);
        
      if (error) {
        console.error('Error updating user:', error);
        return { success: false, error };
      }
      
      return { 
        success: true, 
        user: { ...existingUser, ...userData }
      };
    } else {
      // Insert new user
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          name: userData.name || null,
          preferences: userData.preferences || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating user:', error);
        return { success: false, error };
      }
      
      return { success: true, user: data };
    }
  } catch (error) {
    console.error('Unexpected error in saveUserInfo:', error);
    return { success: false, error };
  }
};

// Function to get user info without authentication
export const getUserInfo = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
      
    if (error) {
      console.error('Error getting user info:', error);
      return { success: false, error };
    }
    
    return { success: true, user: data };
  } catch (error) {
    console.error('Unexpected error in getUserInfo:', error);
    return { success: false, error };
  }
};

// Function to handle file uploads without authentication
export const uploadFile = async (file: File, bucketName: string, fileName?: string) => {
  try {
    const fileExt = file.name.split('.').pop();
    const finalFileName = fileName || `${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(finalFileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      return { success: false, error };
    }
    
    // Get the public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(finalFileName);
    
    return { 
      success: true, 
      filePath: data.path,
      publicUrl
    };
  } catch (error) {
    console.error('Unexpected error in uploadFile:', error);
    return { success: false, error };
  }
};

/**
 * Track a download in the database
 */
export const trackDownload = async (
  appVersionId: string, 
  userEmail?: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    // Get current user
    let userId: string | null = null;
    
    // Check if we have a logged in user
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.id && !user.id.startsWith('local-')) {
          userId = user.id;
        }
      } catch (e) {
        console.error("Error parsing user data for download tracking:", e);
      }
    }
    
    // Create download record
    const downloadData = {
      app_version_id: appVersionId,
      download_date: new Date().toISOString(),
      user_id: userId,
      user_agent: navigator.userAgent,
      email: userEmail || null
    };
    
    // Track in Supabase
    const { error } = await supabase
      .from('downloads')
      .insert(downloadData);
    
    if (error) {
      console.error("Error tracking download in Supabase:", error);
      
      // Store in localStorage as fallback
      const localDownloads = JSON.parse(localStorage.getItem("downloads") || "[]");
      localDownloads.push({
        ...downloadData,
        id: `local-${Date.now()}`,
        created_at: new Date().toISOString()
      });
      localStorage.setItem("downloads", JSON.stringify(localDownloads));
    }
    
    // If we have a user ID, also track activity
    if (userId) {
      await trackUserActivity(userId, 'download', {
        app_version_id: appVersionId,
        timestamp: new Date().toISOString()
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error tracking download:", error);
    
    // Try local storage as a fallback
    try {
      const localDownloads = JSON.parse(localStorage.getItem("downloads") || "[]");
      localDownloads.push({
        app_version_id: appVersionId,
        download_date: new Date().toISOString(),
        user_email: userEmail,
        user_agent: navigator.userAgent,
        id: `local-${Date.now()}`
      });
      localStorage.setItem("downloads", JSON.stringify(localDownloads));
    } catch (e) {
      console.error("Error with local download tracking:", e);
    }
    
    return { success: false, error };
  }
};

/**
 * Get download statistics 
 */
export const getDownloadStats = async (): Promise<{
  total: number;
  byVersion: Record<string, number>;
}> => {
  try {
    // Default response
    const result = {
      total: 0,
      byVersion: {} as Record<string, number>
    };
    
    // Try to get from Supabase first
    try {
      const { data, error } = await supabase.rpc('get_download_count');
      
      if (error) throw error;
      
      if (data && Array.isArray(data)) {
        data.forEach((item: any) => {
          result.byVersion[item.version_id] = item.count;
          result.total += item.count;
        });
      }
    } catch (e) {
      console.error("Error getting download stats from Supabase:", e);
      
      // Try direct query as fallback
      try {
        const { data, error } = await supabase
          .from('downloads')
          .select('app_version_id, count')
          .select('app_version_id')
          .select('app_version_id')
          .select('*');
        
        if (error) throw error;
        
        if (data && Array.isArray(data)) {
          // Count downloads per version
          const countsByVersion: Record<string, number> = {};
          
          data.forEach((item) => {
            const versionId = item.app_version_id;
            countsByVersion[versionId] = (countsByVersion[versionId] || 0) + 1;
          });
          
          result.byVersion = countsByVersion;
          result.total = data.length;
        }
      } catch (innerError) {
        console.error("Error with fallback download stats query:", innerError);
      }
    }
    
    // Also check local downloads
    try {
      const localDownloads = JSON.parse(localStorage.getItem("downloads") || "[]");
      
      if (localDownloads.length > 0) {
        localDownloads.forEach((download: any) => {
          const versionId = download.app_version_id;
          result.byVersion[versionId] = (result.byVersion[versionId] || 0) + 1;
          result.total++;
        });
      }
    } catch (e) {
      console.error("Error processing local downloads:", e);
    }
    
    return result;
  } catch (error) {
    console.error("Error getting download stats:", error);
    return { total: 0, byVersion: {} };
  }
}; 