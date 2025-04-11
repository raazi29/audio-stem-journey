
import { supabase } from "@/integrations/supabase/client";

/**
 * Ensures that the storage bucket for APK files exists
 */
export const ensureApkBucketExists = async () => {
  try {
    // Check if the bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'apk-files');
    
    // If the bucket doesn't exist, create it
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket('apk-files', {
        public: false, // Not public by default for security
        fileSizeLimit: 100000000, // 100MB limit for APK files
      });
      
      if (error) throw error;
      
      // Set up policies for the bucket using SQL instead of RPC
      // This avoids the type error with create_storage_policy
      console.log('APK bucket created successfully');
      
      // Note: We'll manage bucket policies through SQL migrations instead
      // This is safer and more type-safe than using custom RPCs
    }
    
    return { success: true };
  } catch (err) {
    console.error("Error ensuring APK bucket exists:", err);
    return { success: false, error: err };
  }
};

/**
 * Gets a download URL for an APK file
 * @param filePath The path of the file in the storage bucket
 */
export const getApkDownloadUrl = async (filePath: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('apk-files')
      .createSignedUrl(filePath, 60 * 60); // 1 hour expiry
    
    if (error) throw error;
    return { url: data.signedUrl };
  } catch (err) {
    console.error("Error getting download URL:", err);
    return { url: null, error: err };
  }
};
