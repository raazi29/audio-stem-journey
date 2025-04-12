import { supabase } from "@/integrations/supabase/client";

/**
 * Interface for download tracking
 */
export interface DownloadData {
  app_version_id: string;
  user_id?: string;
  email?: string;
  user_agent?: string;
  ip_address?: string;
}

/**
 * Records a download in the database
 * @param versionId The ID of the app version being downloaded
 * @param userData Optional user data (id or email)
 */
export const recordDownload = async (
  versionId: string, 
  userData?: { userId?: string; email?: string }
) => {
  try {
    // Prepare download data
    const downloadData: DownloadData = {
      app_version_id: versionId,
      user_agent: navigator.userAgent,
      ip_address: "anonymous" // For privacy
    };
    
    // Add user information if available
    if (userData?.userId) {
      downloadData.user_id = userData.userId;
    }
    
    if (userData?.email) {
      downloadData.email = userData.email;
    }
    
    // Try to get user from local storage if not provided
    if (!downloadData.user_id && !downloadData.email) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.id) downloadData.user_id = user.id;
          if (user.email) downloadData.email = user.email;
        } catch (e) {
          console.error("Error parsing user data for download tracking:", e);
        }
      }
    }
    
    // Insert download record
    const { error } = await supabase.from('downloads').insert(downloadData);
    
    if (error) {
      console.error("Error recording download:", error);
      
      // Store locally as fallback
      const localDownloads = JSON.parse(localStorage.getItem("downloads") || "[]");
      localDownloads.push({
        ...downloadData,
        id: `local-${Date.now()}`,
        download_date: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
      localStorage.setItem("downloads", JSON.stringify(localDownloads));
    }
    
    return { success: true };
  } catch (err) {
    console.error("Error recording download:", err);
    
    // Try local storage as fallback
    try {
      const localDownloads = JSON.parse(localStorage.getItem("downloads") || "[]");
      localDownloads.push({
        app_version_id: versionId,
        user_agent: navigator.userAgent,
        id: `local-${Date.now()}`,
        download_date: new Date().toISOString()
      });
      localStorage.setItem("downloads", JSON.stringify(localDownloads));
    } catch (e) {
      console.error("Error with local download tracking:", e);
    }
    
    return { success: false, error: err };
  }
};

/**
 * Gets the total number of downloads
 */
export const getTotalDownloads = async () => {
  try {
    const { data, error } = await supabase.rpc('get_total_downloads');
    
    if (error) throw error;
    
    // Add local downloads that haven't been synced
    const localDownloads = JSON.parse(localStorage.getItem("downloads") || "[]");
    const localCount = localDownloads.length;
    
    return { count: (data || 0) + localCount };
  } catch (err) {
    console.error("Error getting download count:", err);
    
    // Fallback to local count
    const localDownloads = JSON.parse(localStorage.getItem("downloads") || "[]");
    return { count: localDownloads.length, error: err };
  }
};

/**
 * Gets detailed download statistics
 */
export const getDownloadStats = async () => {
  try {
    const { data, error } = await supabase.rpc('get_download_count');
    
    if (error) throw error;
    
    // Format the data for easy consumption
    const formattedData = {
      total: 0,
      byVersion: {} as Record<string, { count: number; versionName: string }>
    };
    
    if (data && Array.isArray(data)) {
      data.forEach((item: any) => {
        formattedData.byVersion[item.version_id] = {
          count: item.count,
          versionName: item.version_name
        };
        formattedData.total += Number(item.count) || 0;
      });
    }
    
    return formattedData;
  } catch (err) {
    console.error("Error getting download stats:", err);
    return { 
      total: 0, 
      byVersion: {},
      error: err 
    };
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

/**
 * Sync local downloads to the server when online
 */
export const syncLocalDownloads = async () => {
  try {
    const localDownloads = JSON.parse(localStorage.getItem("downloads") || "[]");
    
    if (localDownloads.length === 0) {
      return { success: true, synced: 0 };
    }
    
    // Filter out local IDs and prepare for insertion
    const downloadsToSync = localDownloads.map((download: any) => {
      const { id, ...rest } = download;
      return rest;
    });
    
    const { error } = await supabase.from('downloads').insert(downloadsToSync);
    
    if (error) throw error;
    
    // Clear local downloads after successful sync
    localStorage.setItem("downloads", "[]");
    
    return {
      success: true,
      synced: localDownloads.length
    };
  } catch (err) {
    console.error("Error syncing local downloads:", err);
    return {
      success: false,
      error: err
    };
  }
};
