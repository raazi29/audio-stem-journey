import { supabase } from "@/integrations/supabase/client";

/**
 * Interface for download data
 */
export interface DownloadData {
  user_id?: string;
  app_version?: string;
  platform: string;
  device_info?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Tracks a download in the database
 */
export const trackDownload = async (downloadData: DownloadData): Promise<{
  success: boolean;
  data?: any;
  error?: any;
}> => {
  try {
    console.log('Tracking download:', downloadData);
    
    // Get current user if available
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || downloadData.user_id || null;
    
    // Get user's IP address for analytics (using a service)
    let ipAddress;
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      ipAddress = data.ip;
    } catch (err) {
      console.error('Could not get IP address:', err);
      ipAddress = null;
    }
    
    // Get device info
    const deviceInfo = downloadData.device_info || getBrowserInfo();
    
    // Create download record
    const { data, error } = await supabase.from('downloads').insert({
      user_id: userId,
      download_date: new Date().toISOString(),
      app_version: downloadData.app_version || '1.0.0',
      platform: downloadData.platform,
      device_info: deviceInfo,
      ip_address: ipAddress,
      metadata: downloadData.metadata || {}
    }).select();
    
    if (error) {
      console.error('Error saving download data:', error);
      
      // If there's a network issue or the table doesn't exist yet, save locally
      if (error.message?.includes('Failed to fetch') || 
          error.message?.includes('NetworkError') ||
          error.message?.includes('relation "downloads" does not exist')) {
        
        saveDownloadLocally({
          user_id: userId,
          download_date: new Date().toISOString(),
          app_version: downloadData.app_version || '1.0.0',
          platform: downloadData.platform,
          device_info: deviceInfo,
          metadata: downloadData.metadata || {},
          is_synced: false
        });
        
        return { success: true, data: { id: 'local-' + Date.now(), synced: false } };
      }
      
      throw error;
    }
    
    console.log('Download tracked successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error tracking download:', error);
    return { success: false, error };
  }
};

/**
 * Save download data locally (for offline or error cases)
 */
const saveDownloadLocally = (downloadData: any) => {
  try {
    const localDownloads = JSON.parse(localStorage.getItem('localDownloads') || '[]');
    localDownloads.push({
      ...downloadData,
      id: 'local-' + Date.now()
    });
    localStorage.setItem('localDownloads', JSON.stringify(localDownloads));
    console.log('Download saved locally');
  } catch (err) {
    console.error('Error saving download locally:', err);
  }
};

/**
 * Get browser and device information
 */
const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  const browserInfo = {
    userAgent,
    browser: detectBrowser(userAgent),
    os: detectOS(userAgent),
    device: detectDevice(userAgent),
    screenSize: {
      width: window.screen.width,
      height: window.screen.height
    },
    language: navigator.language,
    timestamp: new Date().toISOString()
  };
  return browserInfo;
};

/**
 * Detect browser from user agent
 */
const detectBrowser = (userAgent: string) => {
  if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
  if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
  if (userAgent.indexOf('Safari') > -1) return 'Safari';
  if (userAgent.indexOf('Edge') > -1) return 'Edge';
  if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) return 'Internet Explorer';
  return 'Unknown';
};

/**
 * Detect OS from user agent
 */
const detectOS = (userAgent: string) => {
  if (userAgent.indexOf('Windows') > -1) return 'Windows';
  if (userAgent.indexOf('Mac') > -1) return 'MacOS';
  if (userAgent.indexOf('Linux') > -1) return 'Linux';
  if (userAgent.indexOf('Android') > -1) return 'Android';
  if (userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) return 'iOS';
  return 'Unknown';
};

/**
 * Detect device type from user agent
 */
const detectDevice = (userAgent: string) => {
  if (userAgent.indexOf('Mobi') > -1) return 'Mobile';
  if (userAgent.indexOf('Tablet') > -1 || userAgent.indexOf('iPad') > -1) return 'Tablet';
  return 'Desktop';
};

/**
 * Sync locally stored downloads to the server
 */
export const syncLocalDownloads = async (): Promise<{
  success: boolean;
  syncedCount: number;
  error?: any;
}> => {
  try {
    const localDownloads = JSON.parse(localStorage.getItem('localDownloads') || '[]');
    
    if (localDownloads.length === 0) {
      return { success: true, syncedCount: 0 };
    }
    
    console.log(`Syncing ${localDownloads.length} local downloads...`);
    
    let syncedCount = 0;
    const remainingDownloads = [];
    
    for (const download of localDownloads) {
      try {
        // Remove local ID before sending to server
        const { id, is_synced, ...downloadData } = download;
        
        const { error } = await supabase.from('downloads').insert(downloadData);
        
        if (!error) {
          syncedCount++;
        } else {
          console.error('Error syncing download:', error);
          remainingDownloads.push(download);
        }
      } catch (err) {
        console.error('Error during download sync:', err);
        remainingDownloads.push(download);
      }
    }
    
    // Update local storage with remaining unsynchronized downloads
    localStorage.setItem('localDownloads', JSON.stringify(remainingDownloads));
    
    console.log(`Synced ${syncedCount} downloads. ${remainingDownloads.length} remaining.`);
    
    return { success: true, syncedCount };
  } catch (error) {
    console.error('Error syncing downloads:', error);
    return { success: false, syncedCount: 0, error };
  }
};

/**
 * Get download statistics
 */
export const getDownloadStats = async (): Promise<{
  success: boolean;
  stats?: any;
  error?: any;
}> => {
  try {
    // Get total downloads
    const { data: totalData, error: totalError } = await supabase
      .from('downloads')
      .select('id', { count: 'exact' });
      
    if (totalError) throw totalError;
    
    // Get downloads by platform
    const { data: platformData, error: platformError } = await supabase
      .from('downloads')
      .select('platform, id')
      .order('platform');
      
    if (platformError) throw platformError;
    
    // Process platform stats
    const platformStats = platformData.reduce((acc: Record<string, number>, curr: any) => {
      const platform = curr.platform || 'Unknown';
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {});
    
    // Get recent downloads
    const { data: recentData, error: recentError } = await supabase
      .from('downloads')
      .select('*')
      .order('download_date', { ascending: false })
      .limit(10);
      
    if (recentError) throw recentError;
    
    // Calculate local downloads too
    const localDownloads = JSON.parse(localStorage.getItem('localDownloads') || '[]');
    
    return {
      success: true,
      stats: {
        total: (totalData as any).length + localDownloads.length,
        platforms: platformStats,
        recent: recentData,
        localCount: localDownloads.length
      }
    };
  } catch (error) {
    console.error('Error fetching download statistics:', error);
    return { success: false, error };
  }
}; 