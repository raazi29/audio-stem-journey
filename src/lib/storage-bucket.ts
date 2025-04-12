import { supabase } from "@/integrations/supabase/client";

/**
 * Ensures that the APK storage bucket exists
 * Creates it if it doesn't exist yet
 */
export const ensureApkBucket = async (): Promise<{ success: boolean; error?: any }> => {
  try {
    // Check if the bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return { success: false, error: listError };
    }
    
    const apkBucket = buckets?.find(bucket => bucket.name === 'apk-files');
    
    // If the bucket doesn't exist, create it
    if (!apkBucket) {
      const { error: createError } = await supabase.storage.createBucket('apk-files', {
        public: true,
        fileSizeLimit: 1024 * 1024 * 100, // 100MB limit
        allowedMimeTypes: ['application/vnd.android.package-archive', 'application/octet-stream']
      });
      
      if (createError) {
        console.error('Error creating apk bucket:', createError);
        return { success: false, error: createError };
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in ensureApkBucket:', error);
    return { success: false, error };
  }
};

/**
 * Upload an APK file to the storage bucket
 */
export const uploadApkFile = async (
  file: File,
  options?: {
    fileName?: string;
    folderPath?: string;
    metadata?: Record<string, string>;
  }
): Promise<{
  success: boolean;
  data?: { path: string; publicUrl: string; size: number };
  error?: any;
}> => {
  try {
    // Ensure the APK bucket exists
    const { success: bucketSuccess, error: bucketError } = await ensureApkBucket();
    
    if (!bucketSuccess) {
      return { success: false, error: bucketError };
    }
    
    // Check if file is actually an APK
    if (!file.name.endsWith('.apk') && file.type !== 'application/vnd.android.package-archive') {
      return { 
        success: false, 
        error: new Error('Invalid file type. Only APK files are allowed.') 
      };
    }
    
    // Generate file path
    const folderPath = options?.folderPath || '';
    const fileExt = file.name.split('.').pop() || 'apk';
    const fileName = options?.fileName || `${Date.now()}.${fileExt}`;
    const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from('apk-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'application/vnd.android.package-archive',
        metadata: options?.metadata
      });
    
    if (error) {
      console.error('Error uploading APK file:', error);
      return { success: false, error };
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('apk-files')
      .getPublicUrl(data.path);
    
    return { 
      success: true, 
      data: {
        path: data.path,
        publicUrl,
        size: file.size
      }
    };
  } catch (error) {
    console.error('Unexpected error in uploadApkFile:', error);
    return { success: false, error };
  }
};

/**
 * Get information about an APK file from storage
 */
export const getApkFileInfo = async (filePath: string): Promise<{
  success: boolean;
  data?: { size: number; publicUrl: string; createdAt: string; updatedAt: string };
  error?: any;
}> => {
  try {
    // Get file info
    const { data, error } = await supabase.storage
      .from('apk-files')
      .list('', {
        search: filePath,
        limit: 1,
      });
    
    if (error) {
      console.error('Error getting APK file info:', error);
      return { success: false, error };
    }
    
    if (!data || data.length === 0) {
      return { 
        success: false, 
        error: new Error('APK file not found.') 
      };
    }
    
    const fileInfo = data[0];
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('apk-files')
      .getPublicUrl(filePath);
    
    return { 
      success: true, 
      data: {
        size: fileInfo.metadata?.size || 0,
        publicUrl,
        createdAt: fileInfo.created_at,
        updatedAt: fileInfo.updated_at
      }
    };
  } catch (error) {
    console.error('Unexpected error in getApkFileInfo:', error);
    return { success: false, error };
  }
};

/**
 * List all APK files in the storage
 */
export const listApkFiles = async (options?: {
  folderPath?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  success: boolean;
  data?: Array<{
    name: string;
    path: string;
    publicUrl: string;
    size: number;
    createdAt: string;
  }>;
  error?: any;
}> => {
  try {
    const folderPath = options?.folderPath || '';
    const limit = options?.limit || 100;
    const offset = options?.offset || 0;
    
    // List files
    const { data, error } = await supabase.storage
      .from('apk-files')
      .list(folderPath, {
        limit,
        offset,
        sortBy: { column: 'created_at', order: 'desc' }
      });
    
    if (error) {
      console.error('Error listing APK files:', error);
      return { success: false, error };
    }
    
    // Filter out folders
    const files = data.filter(item => !item.id.endsWith('/'));
    
    // Map to more useful format
    const mappedFiles = files.map(file => {
      const filePath = folderPath ? `${folderPath}/${file.name}` : file.name;
      const { data: { publicUrl } } = supabase.storage
        .from('apk-files')
        .getPublicUrl(filePath);
      
      return {
        name: file.name,
        path: filePath,
        publicUrl,
        size: file.metadata?.size || 0,
        createdAt: file.created_at
      };
    });
    
    return { success: true, data: mappedFiles };
  } catch (error) {
    console.error('Unexpected error in listApkFiles:', error);
    return { success: false, error };
  }
};

/**
 * Delete an APK file from storage
 */
export const deleteApkFile = async (filePath: string): Promise<{
  success: boolean;
  error?: any;
}> => {
  try {
    const { error } = await supabase.storage
      .from('apk-files')
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting APK file:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in deleteApkFile:', error);
    return { success: false, error };
  }
};
