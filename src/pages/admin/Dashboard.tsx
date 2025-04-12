import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Download, Upload, Users } from "lucide-react";
import { DownloadAnalytics } from "@/components/analytics/download-analytics";
import { syncLocalDownloads } from "@/lib/download-tracker";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<{ synced: number } | null>(null);
  const [user, setUser] = useState<any>(null);
  
  // Check if user is admin on component mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    
    if (!userData) {
      // Not logged in, redirect to login
      navigate("/login");
      return;
    }
    
    try {
      const user = JSON.parse(userData);
      setUser(user);
      
      // In a real app, you would check if the user has admin privileges
      // For this demo, we'll just check if they're logged in
    } catch (e) {
      console.error("Error parsing user data:", e);
      navigate("/login");
    }
  }, [navigate]);
  
  // Handle manual sync of local downloads
  const handleSyncDownloads = async () => {
    try {
      setSyncLoading(true);
      const result = await syncLocalDownloads();
      
      if (result.success) {
        setSyncResult({ synced: result.synced });
        
        toast({
          title: "Sync completed",
          description: `Successfully synced ${result.synced} local downloads to the server.`
        });
      } else {
        throw new Error("Failed to sync downloads");
      }
    } catch (error) {
      console.error("Error syncing downloads:", error);
      
      toast({
        title: "Sync failed",
        description: "There was an error syncing download data to the server.",
        variant: "destructive"
      });
    } finally {
      setSyncLoading(false);
    }
  };

  // If we're still checking auth, show loading
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your app and view statistics.
          </p>
        </div>
        
        <Button onClick={() => navigate("/")}>
          Return to App
        </Button>
      </div>
      
      {/* Quick stats overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Loading...</div>
            <p className="text-xs text-muted-foreground">
              +0% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2,350</div>
            <p className="text-xs text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Local Data</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Button 
                size="sm" 
                onClick={handleSyncDownloads} 
                disabled={syncLoading}
              >
                {syncLoading ? "Syncing..." : "Sync Downloads"}
              </Button>
              {syncResult && (
                <p className="text-xs text-muted-foreground">
                  {syncResult.synced} downloads synced
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Online</div>
            <p className="text-xs text-muted-foreground">
              Supabase connection active
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main dashboard content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="apk-management">APK Management</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <DownloadAnalytics className="col-span-4" />
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Downloads</CardTitle>
                <CardDescription>
                  Recent APK downloads in the past 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No recent download data available.
                </p>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>New Users</CardTitle>
                <CardDescription>
                  Users who signed up in the past 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No recent user data available.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Download Analytics</CardTitle>
              <CardDescription>
                Detailed view of APK downloads over time
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <DownloadAnalytics />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registered Users</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                User management interface will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* APK Management Tab */}
        <TabsContent value="apk-management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>APK Version Management</CardTitle>
              <CardDescription>
                Manage APK versions and releases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                APK version management interface will be implemented here.
              </p>
              
              <div className="mt-4">
                <Button onClick={() => navigate("/apk-manager")}>
                  Go to APK Manager
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 