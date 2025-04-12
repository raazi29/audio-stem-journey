import { supabase } from "@/integrations/supabase/client";
import { DeviceInfo } from "./user-service";

// APK file interface
export interface ApkFile {
  id: string;
  file_name: string;
  version_name: string;
  version_code: number;
  file_size: number;
  mime_type: string;
  storage_path: string;
  public_url: string;
  created_at: string;
  updated_at: string;
  changelog?: string;
  is_active: boolean;
  checksum?: string;
}

// App version interface
export interface AppVersion {
  id: string;
  version_name: string;
  version_code: number;
  release_date: string;
  is_public: boolean;
  is_required: boolean;
  apk_file_id: string;
  apk_file?: ApkFile;
  changelog?: string;
  created_at: string;
  updated_at: string;
  download_count?: number;
}

// Installation data interface
export interface InstallationData {
  id?: string;
  user_id?: string;
  app_version_id: string;
  device_id: string;
  installation_date: string;
  device_info?: DeviceInfo;
  status: 'installed' | 'updated' | 'uninstalled';
  metadata?: Record<string, any>;
}

/**
 * Initialize APK storage bucket
 */
export const initApkStorage = async (): Promise<{ success: boolean; error?: any }> => {
  try {
    // Check if APK bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) throw listError;
    
    // Create bucket if it doesn't exist
    if (!buckets.find(b => b.name === 'apk-files')) {
      const { error: createError } = await supabase.storage.createBucket('apk-files', {
        public: true,
        fileSizeLimit: 100 * 1024 * 1024, // 100MB limit for APK files
        allowedMimeTypes: ['application/vnd.android.package-archive', 'application/octet-stream']
      });
      
      if (createError) throw createError;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing APK storage:', error);
    return { success: false, error };
  }
};

/**
 * Upload APK file to storage
 */
export const uploadApkFile = async (
  file: File,
  versionData: {
    versionName: string;
    versionCode: number;
    changelog?: string;
    isPublic?: boolean;
    isRequired?: boolean;
  }
): Promise<{ success: boolean; version?: AppVersion; error?: any }> => {
  try {
    // Ensure storage bucket exists
    await initApkStorage();
    
    // Generate a unique file path (use version name and code for better organization)
    const filePath = `${versionData.versionName}/${versionData.versionCode}/${file.name}`;
    
    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('apk-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });
      
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('apk-files')
      .getPublicUrl(filePath);
      
    // Add record to APK files table
    const apkFileData: Partial<ApkFile> = {
      file_name: file.name,
      version_name: versionData.versionName,
      version_code: versionData.versionCode,
      file_size: file.size,
      mime_type: file.type,
      storage_path: uploadData.path,
      public_url: publicUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      changelog: versionData.changelog,
      is_active: true,
    };
    
    const { data: apkFile, error: apkError } = await supabase
      .from('apk_files')
      .insert(apkFileData)
      .select()
      .single();
      
    if (apkError) throw apkError;
    
    // Add record to app versions table
    const versionRecord: Partial<AppVersion> = {
      version_name: versionData.versionName,
      version_code: versionData.versionCode,
      release_date: new Date().toISOString(),
      is_public: versionData.isPublic ?? true,
      is_required: versionData.isRequired ?? false,
      apk_file_id: apkFile.id,
      changelog: versionData.changelog,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const { data: version, error: versionError } = await supabase
      .from('app_versions')
      .insert(versionRecord)
      .select(`
        *,
        apk_file:apk_files(*)
      `)
      .single();
      
    if (versionError) throw versionError;
    
    return { success: true, version: version as AppVersion };
  } catch (error) {
    console.error('Error uploading APK file:', error);
    return { success: false, error };
  }
};

/**
 * Get all app versions
 */
export const getAppVersions = async (options: { 
  includePrivate?: boolean,
  limit?: number,
  offset?: number,
} = {}): Promise<{ versions?: AppVersion[]; error?: any }> => {
  try {
    let query = supabase
      .from('app_versions')
      .select(`
        *,
        apk_file:apk_files(*),
        download_count:downloads(count)
      `);
      
    // Filter out private versions unless specified
    if (!options.includePrivate) {
      query = query.eq('is_public', true);
    }
    
    // Apply limit and offset if provided
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }
    
    // Order by version code descending (newest first)
    query = query.order('version_code', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return { versions: data as AppVersion[] };
  } catch (error) {
    console.error('Error fetching app versions:', error);
    return { error };
  }
};

/**
 * Get a specific app version
 */
export const getAppVersion = async (versionId: string): Promise<{ version?: AppVersion; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('app_versions')
      .select(`
        *,
        apk_file:apk_files(*),
        download_count:downloads(count)
      `)
      .eq('id', versionId)
      .single();
      
    if (error) throw error;
    
    return { version: data as AppVersion };
  } catch (error) {
    console.error('Error fetching app version:', error);
    return { error };
  }
};

/**
 * Record APK installation
 */
export const recordInstallation = async (
  installData: InstallationData
): Promise<{ success: boolean; installation?: InstallationData; error?: any }> => {
  try {
    const installRecord = {
      ...installData,
      installation_date: installData.installation_date || new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('installations')
      .insert(installRecord)
      .select()
      .single();
      
    if (error) throw error;
    
    // Update download count (if the status is 'installed')
    if (installData.status === 'installed') {
      await supabase.from('downloads').insert({
        app_version_id: installData.app_version_id,
        user_id: installData.user_id || null,
        device_id: installData.device_id,
        downloaded_at: new Date().toISOString(),
      }).then(result => {
        if (result.error) {
          console.warn('Error recording download:', result.error);
        }
      });
    }
    
    return { success: true, installation: data as InstallationData };
  } catch (error) {
    console.error('Error recording installation:', error);
    return { success: false, error };
  }
};

/**
 * Get installations for a user
 */
export const getUserInstallations = async (
  userId: string
): Promise<{ installations?: InstallationData[]; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('installations')
      .select(`
        *,
        app_version:app_versions(*)
      `)
      .eq('user_id', userId)
      .order('installation_date', { ascending: false });
      
    if (error) throw error;
    
    return { installations: data as InstallationData[] };
  } catch (error) {
    console.error('Error fetching user installations:', error);
    return { error };
  }
};

/**
 * Subscribe to installation events
 */
export const subscribeToInstallations = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('installations_channel')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'installations' },
      callback
    )
    .subscribe();
    
  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    }
  };
};

/**
 * Get installation statistics
 */
export const getInstallationStats = async (): Promise<{ 
  stats?: { 
    total: number;
    active: number;
    byVersion: Record<string, number>;
  }; 
  error?: any 
}> => {
  try {
    // Get total installations
    const { count: total, error: totalError } = await supabase
      .from('installations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'installed');
      
    if (totalError) throw totalError;
    
    // Get active installations (not uninstalled)
    const { count: active, error: activeError } = await supabase
      .from('installations')
      .select('*', { count: 'exact', head: true })
      .in('status', ['installed', 'updated']);
      
    if (activeError) throw activeError;
    
    // Get breakdown by version
    const { data: versionData, error: versionError } = await supabase.rpc(
      'get_installations_by_version'
    );
    
    if (versionError) throw versionError;
    
    // Convert to record format
    const byVersion: Record<string, number> = {};
    if (versionData) {
      versionData.forEach((item: any) => {
        byVersion[item.version_name] = item.count;
      });
    }
    
    return { 
      stats: {
        total: total || 0,
        active: active || 0,
        byVersion
      }
    };
  } catch (error) {
    console.error('Error fetching installation stats:', error);
    return { error };
  }
};

/**
 * Update APK file data
 */
export const updateApkFile = async (
  fileId: string,
  updateData: Partial<ApkFile>
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('apk_files')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error updating APK file:', error);
    return { success: false, error };
  }
};

/**
 * Update app version
 */
export const updateAppVersion = async (
  versionId: string,
  updateData: Partial<AppVersion>
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('app_versions')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', versionId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error updating app version:', error);
    return { success: false, error };
  }
}; 