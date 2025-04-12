import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import {
  Upload,
  X,
  Check,
  AlertCircle,
  Download,
  BarChart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SupabaseConnectionTest from "@/components/SupabaseConnectionTest";
import { 
  AppVersion, 
  ApkFile, 
  uploadApkFile, 
  getAppVersions,
  getInstallationStats
} from "@/lib/apk-service";

// APK Upload Component
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
      const { success, version, error } = await uploadApkFile(file, {
        versionName,
        versionCode: parseInt(versionCode, 10),
        changelog,
        isPublic,
        isRequired
      });
      
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
          <Alert>
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
            />
            <Label htmlFor="is-required" className="cursor-pointer">Required Update</Label>
          </div>
        </div>
        
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
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

// Version List Component
const VersionsList = () => {
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
    } catch (err: any) {
      console.error('Error fetching versions:', err);
      setError(err?.message || 'Failed to load app versions');
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
                    {version.apk_file?.public_url && (
                      <a 
                        href={version.apk_file.public_url} 
                        className="text-sm text-primary hover:underline"
                        download
                      >
                        Download APK
                      </a>
                    )}
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
  );
};

// Installation Stats Component
const InstallationStats = () => {
  const [stats, setStats] = useState<{
    total: number;
    active: number;
    byVersion: Record<string, number>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const { stats: statsData, error } = await getInstallationStats();
        
        if (error) throw error;
        
        setStats(statsData || { total: 0, active: 0, byVersion: {} });
      } catch (err: any) {
        console.error('Error fetching installation stats:', err);
        setError(err?.message || 'Failed to load installation statistics');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Installation Statistics</CardTitle>
        <CardDescription>
          Track how many users have installed your app
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
        ) : stats ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Total Installations</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Active Installations</p>
                <p className="text-3xl font-bold">{stats.active}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Installations by Version</h3>
              
              {Object.keys(stats.byVersion).length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No installation data available yet
                </p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(stats.byVersion).map(([version, count]) => (
                    <div key={version} className="flex items-center justify-between">
                      <span className="text-sm">Version {version}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No statistics available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main APK Manager Component
const ApkManager = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data } = await supabase
            .from('admins')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
            
          setIsAdmin(!!data);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
      }
    };
    
    checkAdminStatus();
  }, []);

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Restricted</AlertTitle>
          <AlertDescription>
            You need administrator access to view this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">APK Manager</h1>
      
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-6">
          <TabsTrigger value="upload">Upload APK</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <ApkUploader />
        </TabsContent>
        
        <TabsContent value="versions">
          <VersionsList />
        </TabsContent>
        
        <TabsContent value="stats">
          <InstallationStats />
        </TabsContent>
      </Tabs>
      
      <div className="mt-8">
        <SupabaseConnectionTest />
      </div>
    </div>
  );
};

export default ApkManager; 