
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
      
      // Set up policies for the bucket
      await supabase.rpc('create_storage_policy', {
        bucket_name: 'apk-files',
        policy_name: 'Allow authenticated users to download APKs',
        definition: 'auth.role() = \'authenticated\'',
        policy_type: 'download'
      });
      
      await supabase.rpc('create_storage_policy', {
        bucket_name: 'apk-files',
        policy_name: 'Allow admin to upload APKs',
        definition: 'auth.role() = \'authenticated\'', // In a real app, you'd check for admin role
        policy_type: 'upload'
      });
      
      console.log('APK bucket created successfully');
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
