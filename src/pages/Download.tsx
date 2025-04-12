import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Lock, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  LogIn, 
  Github, 
  ExternalLink,
  DollarSign,
  Users,
  Upload,
  X,
  Check,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackDownload, getDownloadStats } from "@/lib/database";
import { 
  listApkFiles,
  ensureApkBucket
} from "@/lib/storage-bucket";
import SupabaseConnectionTest from "@/components/SupabaseConnectionTest";
import { Progress } from "@/components/ui/progress";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter,
  CardDescription
} from "@/components/ui/card";
import {
  AppVersion,
  ApkFile,
  getAppVersions,
  uploadApkFile
} from "@/lib/apk-service";
import { cn } from "@/lib/utils";

// Admin APK Upload Component
const ApkUploader = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [changelog, setChangelog] = useState('');
  const [versionName, setVersionName] = useState('');
  const [versionCode, setVersionCode] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isRequired, setIsRequired] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    
    // Reset states
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);
    
    // Try to extract version from file name if applicable
    if (selectedFile?.name) {
      // Look for patterns like "AppName_v1.0.0.apk" or "AppName-1.0.0.apk"
      const versionMatch = selectedFile.name.match(/[_-]v?(\d+\.\d+\.\d+)/i);
      if (versionMatch && versionMatch[1]) {
        const extractedVersion = versionMatch[1];
        setVersionName(extractedVersion);
        
        // Try to convert to a version code (remove dots and convert to number)
        const codeString = extractedVersion.replace(/\./g, '');
        const code = parseInt(codeString, 10);
        if (!isNaN(code)) {
          setVersionCode(code.toString());
        }
      }
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a file to upload');
      return;
    }
    
    if (!versionName) {
      setUploadError('Please enter a version name');
      return;
    }
    
    if (!versionCode) {
      setUploadError('Please enter a version code');
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(10);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 500);
      
      // Upload the file
      const result = await uploadApkFile(file, {
        versionName,
        versionCode: parseInt(versionCode, 10),
        changelog,
        isPublic,
        isRequired
      });
      
      // TypeScript type assertion to match the expected structure
      const { success, error } = result;
      const version = (result as any).version;
      
      clearInterval(progressInterval);
      
      if (!success || error) {
        setUploadError(error?.message || 'Failed to upload APK file');
        setUploadProgress(0);
        return;
      }
      
      // Success
      setUploadProgress(100);
      setUploadSuccess(true);
      
      toast({
        title: "APK Uploaded Successfully",
        description: `Version ${versionName} has been uploaded and published.`,
      });
      
      // Reset form after a brief delay
      setTimeout(() => {
        setFile(null);
        setChangelog('');
        setVersionName('');
        setVersionCode('');
        setUploadProgress(0);
        setUploadSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error uploading APK:', error);
      setUploadError('An unexpected error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Upload New APK</CardTitle>
        <CardDescription>
          Upload a new version of the app to make it available for download
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {uploadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Upload Failed</AlertTitle>
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}
        
        {uploadSuccess && (
          <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertTitle>Upload Successful</AlertTitle>
            <AlertDescription>Version {versionName} has been uploaded and published</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="apk-file">APK File (Max 100MB)</Label>
          <Input 
            id="apk-file" 
            type="file" 
            accept=".apk" 
            onChange={handleFileChange}
            disabled={isUploading}
            className="cursor-pointer"
          />
          {file && (
            <p className="text-sm text-muted-foreground">
              {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="version-name">Version Name</Label>
            <Input 
              id="version-name" 
              placeholder="e.g. 1.0.0" 
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              disabled={isUploading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="version-code">Version Code</Label>
            <Input 
              id="version-code" 
              placeholder="e.g. 100" 
              value={versionCode}
              onChange={(e) => setVersionCode(e.target.value)}
              disabled={isUploading}
              type="number"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="changelog">Changelog</Label>
          <Textarea 
            id="changelog" 
            placeholder="What's new in this version?"
            value={changelog}
            onChange={(e) => setChangelog(e.target.value)}
            disabled={isUploading}
            rows={4}
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is-public"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={isUploading}
              className="rounded border-gray-300 text-primary focus:ring-primary"
              aria-label="Make this version publicly available"
              title="Make public"
            />
            <Label htmlFor="is-public" className="cursor-pointer">Make Public</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is-required"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              disabled={isUploading}
              className="rounded border-gray-300 text-primary focus:ring-primary"
              aria-label="Mark as required update"
              title="Required update"
            />
            <Label htmlFor="is-required" className="cursor-pointer">Required Update</Label>
          </div>
        </div>
        
        {isUploading && (
          <div className="w-full bg-muted rounded-full h-2.5 mt-4">
            <Progress value={uploadProgress} className="h-2.5" />
            <p className="text-xs text-center mt-1">Uploading: {uploadProgress}%</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full"
          onClick={handleUpload}
          disabled={!file || isUploading}
        >
          {isUploading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </span>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload APK
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Admin Dashboard Component with APK Management
const AdminDashboard = () => {
  const [versions, setVersions] = useState<AppVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch app versions
  const fetchVersions = async () => {
    try {
      setIsLoading(true);
      const { versions, error } = await getAppVersions({ includePrivate: true });
      
      if (error) throw error;
      
      setVersions(versions || []);
    } catch (err) {
      console.error('Error fetching versions:', err);
      setError('Failed to load app versions');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load data on mount and setup realtime subscription
  useEffect(() => {
    fetchVersions();
    
    // Subscribe to changes
    const channel = supabase
      .channel('app_versions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_versions' },
        () => fetchVersions()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  return (
    <div className="space-y-6">
      <ApkUploader />
      
      <Card>
        <CardHeader>
          <CardTitle>App Versions</CardTitle>
          <CardDescription>
            Manage all available versions of the app
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-6">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : versions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No versions available yet
            </div>
          ) : (
            <div className="divide-y">
              {versions.map((version) => (
                <div key={version.id} className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">
                        Version {version.version_name} 
                        {version.is_required && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                            Required
                          </span>
                        )}
                        {!version.is_public && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            Private
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Released: {new Date(version.release_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Downloads: {version.download_count || 0}
                      </div>
                      <a 
                        href={version.apk_file?.public_url} 
                        className="text-sm text-primary hover:underline"
                        download
                      >
                        Download APK
                      </a>
                    </div>
                  </div>
                  
                  {version.changelog && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium">Changelog:</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {version.changelog}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const DownloadPage = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [appVersions, setAppVersions] = useState<AppVersion[]>([]);
  const [apkFiles, setApkFiles] = useState<ApkFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadCounts, setDownloadCounts] = useState<Record<string, number>>({});
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedVersion, setSelectedVersion] = useState<AppVersion | null>(null);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // New version form data
  const [newVersion, setNewVersion] = useState({
    version: "",
    name: "",
    description: "",
    changelog: ""
  });

  // Check if user is logged in and set admin status
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Check if user has admin role
        // For demo purposes, any user with email containing 'admin' is considered an admin
        setIsAdmin(userData.email?.includes('admin') || false);
      } catch (e) {
        console.error("Error parsing user data:", e);
        localStorage.removeItem("user");
      }
    }
    
    // Initialize storage bucket
    ensureApkBucket().catch(err => {
      console.error("Error ensuring APK bucket exists:", err);
    });
  }, []);
  
  // Function to ensure default APK exists in database
  const ensureDefaultApkExists = async () => {
    try {
      // Check if we already have any versions
      const { data: versions } = await supabase
        .from('app_versions')
        .select('id')
        .limit(1);
        
      // If we already have versions, don't add the default one
      if (versions && versions.length > 0) {
        return;
      }
      
      // Default demo APK
      const defaultApkPath = '/downloads/app-debug.apk';
      
      // Create a version object with default values that matches the AppVersion interface
      const { error } = await supabase
        .from('app_versions')
        .insert({
          version_name: '2.0',
          version_code: 200,
          file_path: defaultApkPath,
          file_size: '88000', // 88MB
          description: 'Initial release of STEM Assistant for visually impaired students',
          release_date: new Date().toISOString(),
          is_latest: true,
          version: '2.0'
        });
        
      if (error) {
        console.error("Error adding default APK version:", error);
      } else {
        console.log("Default APK version added successfully");
      }
    } catch (error) {
      console.error("Error ensuring default APK exists:", error);
    }
  };

  // Fetch app versions and download counts from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Ensure default APK exists
        await ensureDefaultApkExists();
        
        // Create a direct link to the local APK file if no versions exist
        const fallbackVersion: AppVersion = {
          id: 'default',
          version_name: '2.0',
          version_code: 200,
          release_date: new Date().toISOString(),
          is_public: true,
          is_required: false,
          apk_file_id: 'default',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          apk_file: {
            id: 'default',
            file_name: 'app-debug.apk',
            version_name: '2.0',
            version_code: 200,
            file_size: 88000 * 1024, // 88MB
            mime_type: 'application/vnd.android.package-archive',
            storage_path: '/downloads/app-debug.apk',
            public_url: `${window.location.origin}/downloads/app-debug.apk`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true
          }
        };
        
        // Fetch app versions from database
        const { data: appVersions, error } = await supabase
          .from('app_versions')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.warn("Error fetching app versions:", error);
          setAppVersions([fallbackVersion]);
        } else if (!appVersions || appVersions.length === 0) {
          setAppVersions([fallbackVersion]);
        } else {
          // Convert DB format to AppVersion interface
          const convertedVersions = appVersions.map((dbVersion: any) => ({
            id: dbVersion.id,
            version_name: dbVersion.version || '',
            version_code: parseInt(dbVersion.version?.replace(/\./g, '') || '100'),
            release_date: dbVersion.release_date || dbVersion.created_at,
            is_public: Boolean(dbVersion.is_latest),
            is_required: Boolean(dbVersion.is_latest),
            apk_file_id: dbVersion.id,
            changelog: dbVersion.description,
            created_at: dbVersion.created_at,
            updated_at: dbVersion.created_at,
            apk_file: {
              id: dbVersion.id,
              file_name: dbVersion.file_path?.split('/').pop() || 'app.apk',
              version_name: dbVersion.version || '',
              version_code: parseInt(dbVersion.version?.replace(/\./g, '') || '100'),
              file_size: parseInt(dbVersion.file_size || '0') * 1024,
              mime_type: 'application/vnd.android.package-archive',
              storage_path: dbVersion.file_path || '',
              public_url: dbVersion.file_path || '',
              created_at: dbVersion.created_at,
              updated_at: dbVersion.created_at,
              is_active: true
            }
          } as AppVersion));
          
          setAppVersions(convertedVersions);
        }
        
        // Fetch APK files from storage
        const { success, data: apkData, error: storageError } = await listApkFiles();
        
        if (storageError) {
          console.error("Error listing APK files:", storageError);
        } else if (success && apkData) {
          // Convert storage results to match the ApkFile interface
          const convertedApkFiles: ApkFile[] = apkData.map(file => ({
            id: file.path,
            file_name: file.name,
            version_name: file.name.split('-')[0] || '',
            version_code: 0,
            file_size: file.size,
            mime_type: 'application/vnd.android.package-archive',
            storage_path: file.path,
            public_url: file.publicUrl,
            created_at: file.createdAt,
            updated_at: file.createdAt,
            is_active: true
          }));
          
          setApkFiles(convertedApkFiles);
        }
        
        // Fetch download counts
        const { data: countData } = await supabase.rpc('get_download_count');
        
        if (countData && Array.isArray(countData)) {
          const countsObject: Record<string, number> = {};
          let total = 0;
          
          countData.forEach((item: any) => {
            countsObject[item.version_id] = item.count;
            total += item.count;
          });
          
          setDownloadCounts(countsObject);
          setTotalDownloads(total);
        }
      } catch (error) {
        console.error('Error fetching app data:', error);
        setError('Failed to load app versions. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Set up real-time subscription for download count updates
    const channel = supabase
      .channel('download_counts')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'downloads' 
      }, (payload) => {
        // Update the download count when a new download is recorded
        setDownloadCounts((prev) => {
          const versionId = payload.new.version_id;
          return {
            ...prev,
            [versionId]: (prev[versionId] || 0) + 1
          };
        });
        setTotalDownloads((prev) => prev + 1);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDownloadClick = (version: AppVersion) => {
    setSelectedVersion(version);
    setShowEmailDialog(true);
    
    // If user is logged in, pre-fill the email
    if (user && user.email) {
      setEmail(user.email);
    }
  };

  const handleDownloadConfirm = async () => {
    if (!selectedVersion) return;
    
    setDownloadStarted(true);
    
    try {
      // Track the download in the database (if possible)
      try {
        await trackDownload(selectedVersion.id, email || undefined);
      } catch (trackError) {
        console.warn("Error tracking download (continuing with download anyway):", trackError);
      }
      
      // Close the dialog
      setShowEmailDialog(false);
      
      // If the file is from public/downloads, use a direct link
      if (selectedVersion.apk_file?.public_url.includes('/downloads/')) {
        // Create an anchor element and trigger download
        const link = document.createElement('a');
        link.href = selectedVersion.apk_file.public_url;
        link.setAttribute('download', `stem-assistant-${selectedVersion.version_name}.apk`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For other URLs, use window.location
        window.location.href = selectedVersion.apk_file?.public_url || '';
      }
      
      toast({
        title: "Download Started",
        description: `STEM Assistant v${selectedVersion.version_name} is being downloaded.`,
        variant: "default",
      });
      
      // Save user info if email provided and not already saved
      if (email && !user) {
        try {
          // Store email in localStorage for future downloads
          localStorage.setItem("downloadEmail", email);
        } catch (e) {
          console.error("Error saving email:", e);
        }
      }
      
      // Reset the email field if it's not the user's email
      if (!user || user.email !== email) {
        setEmail("");
      }
    } catch (err) {
      console.error("Error handling download:", err);
      
      toast({
        title: "Download Failed",
        description: "There was an error starting your download. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Clear the download started state after 5 seconds
      setTimeout(() => {
        setDownloadStarted(false);
      }, 5000);
    }
  };
  
  // Upload APK file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.name.endsWith('.apk')) {
      toast({
        title: "Invalid File",
        description: "Please select an APK file.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Upload the file to storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('apk-files')
        .upload(`${newVersion.version || 'latest'}/${Date.now()}.apk`, file);
        
      if (storageError) throw storageError;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('apk-files')
        .getPublicUrl(storageData.path);
      
      // Create a new version in the database
      const { error: dbError } = await supabase
        .from('app_versions')
        .insert({
          version: newVersion.version,
          file_path: publicUrl,
          file_size: String(Math.round(file.size / 1024)),
          description: newVersion.description || 'New version available',
          release_date: new Date().toISOString(),
          is_latest: true
        });
      
      if (dbError) {
        throw dbError;
      }
      
      // Set previously latest version to not latest
      if (dbError) {
        console.error("Error setting previous versions to not latest:", dbError);
      }
      
      toast({
        title: "Upload Successful",
        description: "New version has been uploaded successfully.",
        variant: "default",
      });
      
      // Reset form
      setNewVersion({
        version: "",
        name: "",
        description: "",
        changelog: ""
      });
      
      // Refresh data
      setShowUploadDialog(false);
      window.location.reload();
    } catch (error) {
      console.error("Error uploading APK:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading the file.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Find the latest version
  const latestVersion = appVersions.find((version) => version.is_required);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <section className="mb-12 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-gradient">
              Download STEM Assistant
            </h1>
            
            {isAdmin && (
              <Button 
                onClick={() => setShowUploadDialog(true)}
                className="glass-morph bg-stem-blue hover:bg-stem-blue/80 text-white"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload New Version
              </Button>
            )}
          </div>
          
          <p className="text-xl text-muted-foreground mb-8">
            Get our accessible app to transform how you experience STEM learning.
            {totalDownloads > 0 && (
              <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-stem-blue/20 text-white">
                <Users className="h-4 w-4 mr-1" /> {totalDownloads} downloads
              </span>
            )}
          </p>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="glass-morph rounded-lg p-8 mb-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <Tabs defaultValue="android">
              <TabsList className="glass-morph mb-6">
                <TabsTrigger value="android" className="data-[state=active]:bg-stem-blue/20 data-[state=active]:text-white">Android</TabsTrigger>
                <TabsTrigger value="ios" disabled className="opacity-50">iOS (Coming Soon)</TabsTrigger>
              </TabsList>
              
              <TabsContent value="android" className="space-y-6">
                <div className="flex items-center justify-between p-4 glass-morph rounded-lg border border-white/10 shadow-md">
                  <div className="flex items-center">
                    <Info className="h-5 w-5 text-stem-blue mr-3" />
                    <span>Compatible with Android 8.0 and above</span>
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : appVersions.length === 0 ? (
                  <Alert className="glass-morph">
                    <Info className="h-4 w-4" />
                    <AlertTitle>No versions available</AlertTitle>
                    <AlertDescription>
                      {isAdmin ? "Upload a new version to get started." : "Please check back later for available versions."}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-6">
                    {appVersions.map((v) => (
                      <div 
                        key={v.id} 
                        className="glass-morph rounded-lg p-6 card-hover border border-white/10 shadow-md"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-semibold">Version {v.version_name}</h3>
                              {v.is_public && v.is_required && (
                                <Badge className="bg-stem-blue text-white">Latest</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                              Released: {new Date(v.release_date).toLocaleDateString()} • Size: {v.apk_file ? (v.apk_file.file_size / (1024 * 1024)).toFixed(2) : 0} MB
                              {downloadCounts[v.id] !== undefined && (
                                <span className="ml-2 text-stem-blue">
                                  {downloadCounts[v.id]} downloads
                                </span>
                              )}
                            </div>
                            <p className="text-sm">{v.changelog}</p>
                          </div>
                          
                          <Button 
                            className="relative overflow-hidden group 
                              bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg
                              transition-all duration-300 border border-blue-500"
                            disabled={downloadStarted}
                            onClick={() => handleDownloadClick(v)}
                          >
                            {downloadStarted ? (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download className="mr-2 h-4 w-4" />
                                Download v{v.version_name}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
        
        <section className="mb-12 animate-fade-in">
          <h2 className="text-3xl font-bold text-gradient-accent mb-6">
            Installation Guide
          </h2>
          
          <div className="glass-morph rounded-lg p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/10">
            <h3 className="text-xl font-semibold mb-4">How to Install the APK</h3>
            <ol className="list-decimal pl-5 space-y-4">
              <li>
                <strong className="text-stem-blue">Download the APK file</strong>
                <p className="text-muted-foreground mt-1">
                  Click the download button above to get the latest version
                </p>
              </li>
              <li>
                <strong className="text-stem-blue">Enable Unknown Sources</strong>
                <p className="text-muted-foreground mt-1">
                  Go to Settings &gt; Security &gt; Unknown Sources and enable it
                </p>
              </li>
              <li>
                <strong className="text-stem-blue">Find the Downloaded File</strong>
                <p className="text-muted-foreground mt-1">
                  Open your Downloads folder and locate the STEM Assistant APK
                </p>
              </li>
              <li>
                <strong className="text-stem-blue">Install the App</strong>
                <p className="text-muted-foreground mt-1">
                  Tap the APK file and follow the installation prompts
                </p>
              </li>
              <li>
                <strong className="text-stem-blue">Open the App</strong>
                <p className="text-muted-foreground mt-1">
                  Once installed, find and open STEM Assistant from your app drawer
                </p>
              </li>
            </ol>
            
            <Alert className="mt-6 border border-white/10 bg-white/5">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Need Help?</AlertTitle>
              <AlertDescription>
                If you're having trouble installing the app, please visit our{" "}
                <Link to="/support" className="font-medium underline underline-offset-4 text-stem-blue hover:text-stem-blue/80">
                  support page
                </Link>{" "}
                for assistance.
              </AlertDescription>
            </Alert>
          </div>
        </section>
        
        <section className="mb-12 animate-fade-in">
          <h2 className="text-3xl font-bold text-gradient-accent mb-6">
            Developer Resources
          </h2>
          
          <div className="glass-morph rounded-lg p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/10">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <Github className="h-6 w-6 text-stem-purple mr-2" />
                  <h3 className="text-xl font-semibold">Open Source</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  STEM Assistant is an open source project. You can contribute to its development on GitHub.
                </p>
                <Button 
                  variant="outline" 
                  className="glass-morph hover:bg-white/10"
                  onClick={() => window.open("https://github.com/AshwinKumarBV-git/Hackathon2025", "_blank")}
                >
                  <Github className="mr-2 h-4 w-4" />
                  View Source Code
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <DollarSign className="h-6 w-6 text-stem-blue mr-2" />
                  <h3 className="text-xl font-semibold">Support Development</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Help us improve and maintain this app by contributing to our project financially.
                </p>
                <Button 
                  variant="outline" 
                  className="glass-morph hover:bg-white/10"
                  onClick={() => window.open("https://github.com/sponsors/AshwinKumarBV-git", "_blank")}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Sponsor on GitHub
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {!user && (
          <section className="text-center animate-fade-in">
            <div className="glass-morph rounded-lg p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/10">
              <h2 className="text-2xl font-bold mb-4">Ready to Download?</h2>
              <p className="text-muted-foreground mb-6">
                Sign in to save your download history and access exclusive features.
              </p>
              <Button 
                size="lg" 
                className="glass-morph relative overflow-hidden group bg-stem-blue hover:bg-stem-blue/80 
                  text-white shadow-md hover:shadow-lg transition-all duration-300 border border-stem-blue/50"
                asChild
              >
                <Link to="/login">
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent 
                    -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In
                </Link>
              </Button>
            </div>
          </section>
        )}
      </div>

      {/* Email collection dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download STEM Assistant {selectedVersion?.version_name}</DialogTitle>
            <DialogDescription>
              Enter your email to track your download (optional)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                We'll only use this to maintain your download history.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDownloadConfirm}>
              <Download className="mr-2 h-4 w-4" />
              Download Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Upload new version dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload New Version</DialogTitle>
            <DialogDescription>
              Upload a new APK file and provide version details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                placeholder="1.2.0"
                value={newVersion.version}
                onChange={(e) => setNewVersion({...newVersion, version: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="STEM Assistant"
                value={newVersion.name}
                onChange={(e) => setNewVersion({...newVersion, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Short description of this release"
                value={newVersion.description}
                onChange={(e) => setNewVersion({...newVersion, description: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="changelog">Changelog</Label>
              <Textarea
                id="changelog"
                placeholder="- Fixed bugs&#10;- Improved performance&#10;- Added new features"
                value={newVersion.changelog}
                onChange={(e) => setNewVersion({...newVersion, changelog: e.target.value})}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2 pt-2">
              <Label htmlFor="apk-file">APK File</Label>
              <Input
                id="apk-file"
                type="file"
                accept=".apk"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={isUploading}
                className="glass-morph"
              />
              <p className="text-xs text-muted-foreground">
                Only .apk files are accepted. Maximum size: 100MB
              </p>
            </div>
            
            {isUploading && (
              <div className="w-full bg-muted rounded-full h-2.5 mt-4">
                <Progress value={uploadProgress} className="h-2.5" />
                <p className="text-xs text-center mt-1">Uploading: {uploadProgress}%</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowUploadDialog(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Dashboard (only for admins) */}
      {isAdmin && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-6">
            Admin Dashboard
          </h2>
          
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
              <TabsTrigger value="upload">APK Upload</TabsTrigger>
              <TabsTrigger value="stats">Download Stats</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload">
              <AdminDashboard />
            </TabsContent>
            
            <TabsContent value="stats">
              {/* Existing stats content can go here */}
              <div className="text-center py-12 text-muted-foreground">
                Download statistics will be displayed here
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default DownloadPage;
