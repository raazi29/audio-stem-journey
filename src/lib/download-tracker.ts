
import { supabase } from "@/integrations/supabase/client";

/**
 * Records a download in the database
 * @param versionId The ID of the app version being downloaded
 * @param userId The ID of the user downloading the app
 */
export const recordDownload = async (versionId: string, userId: string) => {
  try {
    const { error } = await supabase.from('downloads').insert({
      app_version_id: versionId,
      user_id: userId,
      ip_address: "anonymous", // For privacy
      user_agent: navigator.userAgent
    });
    
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error("Error recording download:", err);
    return { success: false, error: err };
  }
};

/**
 * Gets the total number of downloads
 */
export const getTotalDownloads = async () => {
  try {
    const { data, error } = await supabase.rpc('get_download_count');
    
    if (error) throw error;
    return { count: data || 0 };
  } catch (err) {
    console.error("Error getting download count:", err);
    return { count: 0, error: err };
  }
};

/**
 * Gets the number of downloads for a specific version
 * @param versionId The ID of the app version
 */
export const getVersionDownloads = async (versionId: string) => {
  try {
    const { data, error } = await supabase.rpc('get_download_count', { version_id: versionId });
    
    if (error) throw error;
    return { count: data || 0 };
  } catch (err) {
    console.error("Error getting version download count:", err);
    return { count: 0, error: err };
  }
};

/**
 * Subscribe to download updates
 * @param callback Function to call when a new download is recorded
 */
export const subscribeToDownloads = (callback: () => void) => {
  const channel = supabase
    .channel('public:downloads')
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'downloads' 
    }, callback)
    .subscribe();
  
  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    }
  };
};
