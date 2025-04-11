
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Save, Trash2, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/lib/auth";

interface AppVersion {
  id: string;
  version: string;
  release_date: string;
  description: string;
  file_path: string;
  file_size: string;
  is_latest: boolean;
}

export default function AppVersionManager() {
  const { toast } = useToast();
  const { user } = useSupabaseAuth();
  const [loading, setLoading] = useState(false);
  const [versions, setVersions] = useState<AppVersion[]>([]);
  const [newVersion, setNewVersion] = useState({
    version: "",
    description: "",
    file: null as File | null,
  });
  const [error, setError] = useState<string | null>(null);
  
  // Fetch app versions from Supabase
  const fetchVersions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_versions')
        .select('*')
        .order('release_date', { ascending: false });
      
      if (error) throw error;
      if (data) setVersions(data);
    } catch (err) {
      console.error("Error fetching app versions:", err);
      setError("Failed to load app versions");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) fetchVersions();
  }, [user]);
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewVersion({ ...newVersion, file });
  };
  
  // Handle form submission to create a new app version
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!newVersion.file || !newVersion.version) {
      setError("Please provide a version number and APK file");
      return;
    }
    
    try {
      setLoading(true);
      
      // 1. Upload the APK file to storage
      const fileName = `v${newVersion.version}/${new Date().getTime()}_${newVersion.file.name}`;
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('apk-files')
        .upload(fileName, newVersion.file);
      
      if (uploadError) throw uploadError;
      
      // 2. Create a record in the app_versions table
      const { data: versionData, error: versionError } = await supabase
        .from('app_versions')
        .insert({
          version: newVersion.version,
          description: newVersion.description,
          file_path: fileData.path,
          file_size: `${Math.round(newVersion.file.size / 1024 / 1024 * 10) / 10} MB`,
          is_latest: versions.length === 0 // Set as latest if it's the first version
        })
        .select()
        .single();
      
      if (versionError) throw versionError;
      
      // 3. If this is the only version, set it as the latest
      if (versions.length === 0 && versionData) {
        await supabase.rpc('set_latest_version', { version_id: versionData.id });
      }
      
      toast({
        title: "Version Added",
        description: `Version ${newVersion.version} has been added successfully.`,
      });
      
      // Reset form and refresh versions
      setNewVersion({ version: "", description: "", file: null });
      fetchVersions();
    } catch (err) {
      console.error("Error adding app version:", err);
      setError("Failed to add app version");
    } finally {
      setLoading(false);
    }
  };
  
  // Set a version as the latest
  const setAsLatest = async (version: AppVersion) => {
    try {
      setLoading(true);
      await supabase.rpc('set_latest_version', { version_id: version.id });
      toast({
        title: "Version Updated",
        description: `Version ${version.version} is now set as the latest.`,
      });
      fetchVersions();
    } catch (err) {
      console.error("Error updating latest version:", err);
      toast({
        title: "Update Failed",
        description: "Could not update the latest version.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a version
  const deleteVersion = async (version: AppVersion) => {
    if (!confirm(`Are you sure you want to delete version ${version.version}?`)) {
      return;
    }
    
    try {
      setLoading(true);
      
      // First, delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('apk-files')
        .remove([version.file_path]);
      
      if (storageError) console.error("Error removing file:", storageError);
      
      // Then delete the version record
      const { error } = await supabase
        .from('app_versions')
        .delete()
        .eq('id', version.id);
      
      if (error) throw error;
      
      toast({
        title: "Version Deleted",
        description: `Version ${version.version} has been deleted.`,
      });
      
      fetchVersions();
    } catch (err) {
      console.error("Error deleting version:", err);
      toast({
        title: "Delete Failed",
        description: "Could not delete the version.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>
            You need to be logged in to manage app versions.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New App Version</CardTitle>
          <CardDescription>
            Upload a new APK file and provide version details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="version">Version Number</Label>
              <Input
                id="version"
                placeholder="e.g. 1.0.0"
                value={newVersion.version}
                onChange={(e) => setNewVersion({ ...newVersion, version: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Release Notes</Label>
              <Textarea
                id="description"
                placeholder="Describe what's new in this version"
                value={newVersion.description}
                onChange={(e) => setNewVersion({ ...newVersion, description: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apk-file">APK File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="apk-file"
                  type="file"
                  accept=".apk"
                  onChange={handleFileChange}
                  className="flex-1"
                  required
                />
                <Button type="button" variant="outline" onClick={() => setNewVersion({ ...newVersion, file: null })}>
                  Clear
                </Button>
              </div>
              {newVersion.file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {newVersion.file.name} ({Math.round(newVersion.file.size / 1024 / 1024 * 10) / 10} MB)
                </p>
              )}
            </div>
            
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Uploading..." : "Upload New Version"}
              <Upload className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Manage Versions</CardTitle>
            <Button variant="outline" size="icon" onClick={fetchVersions} disabled={loading}>
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            View, edit and delete app versions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4">Loading versions...</p>
          ) : versions.length === 0 ? (
            <p className="text-center py-4">No versions available. Add your first version above.</p>
          ) : (
            <div className="space-y-4">
              {versions.map((version) => (
                <div key={version.id} className="p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium flex items-center">
                      Version {version.version}
                      {version.is_latest && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-stem-blue/20 text-stem-blue rounded-full">
                          Latest
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(version.release_date).toLocaleDateString()} • {version.file_size}
                    </p>
                    <p className="text-sm mt-1">{version.description || "No description provided"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!version.is_latest && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setAsLatest(version)} 
                        disabled={loading}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Set as Latest
                      </Button>
                    )}
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteVersion(version)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Managing {versions.length} version{versions.length !== 1 ? 's' : ''}
        </CardFooter>
      </Card>
    </div>
  );
}
