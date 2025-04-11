
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

// Define the app version interface
interface AppVersion {
  id: string;
  version: string;
  date: string;
  size: string;
  notes: string;
  downloadCount?: number;
}

const DownloadPage = () => {
  const { toast } = useToast();
  const { user } = useSupabaseAuth();
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [versions, setVersions] = useState<AppVersion[]>([
    {
      id: "1",
      version: "1.2",
      date: "April 10, 2025",
      size: "45 MB",
      notes: "Latest version with improved camera focus and faster equation processing."
    },
    {
      id: "2",
      version: "1.1",
      date: "March 15, 2025",
      size: "43 MB",
      notes: "Added support for complex calculus equations and improved haptic feedback."
    },
    {
      id: "3",
      version: "1.0",
      date: "February 1, 2025",
      size: "40 MB",
      notes: "Initial release with core functionality for STEM learning."
    }
  ]);
  const [totalDownloads, setTotalDownloads] = useState<number>(0);
  
  // Fetch app versions and download counts from Supabase
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const { data: appVersions, error } = await supabase
          .from('app_versions')
          .select('*')
          .order('release_date', { ascending: false });
        
        if (error) {
          console.error("Error fetching app versions:", error);
          return;
        }
        
        if (appVersions && appVersions.length > 0) {
          const formattedVersions = appVersions.map(v => ({
            id: v.id,
            version: v.version,
            date: new Date(v.release_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            size: v.file_size,
            notes: v.description || ""
          }));
          setVersions(formattedVersions);
        }
        
        // Get total download count
        const { data: countData } = await supabase.rpc('get_download_count');
        if (countData) {
          setTotalDownloads(countData);
        }
      } catch (err) {
        console.error("Error loading app data:", err);
      }
    };
    
    fetchVersions();
    
    // Set up realtime subscription for downloads
    const channel = supabase
      .channel('public:downloads')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'downloads' 
      }, () => {
        // Increment the download count when a new download occurs
        setTotalDownloads(prev => prev + 1);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDownload = async (version: AppVersion) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to download the app.",
        variant: "destructive",
      });
      return;
    }

    setDownloadStarted(true);
    
    try {
      // Record the download in the database
      await supabase.from('downloads').insert({
        app_version_id: version.id,
        user_id: user.id,
        ip_address: "anonymous", // For privacy
        user_agent: navigator.userAgent
      });
    } catch (err) {
      console.error("Error recording download:", err);
    }
    
    toast({
      title: "Download Started",
      description: `STEM Assistant v${version.version} is being downloaded.`,
      variant: "default",
    });
    
    // Clear the download started state after 5 seconds
    setTimeout(() => {
      setDownloadStarted(false);
    }, 5000);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <section className="mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-gradient mb-6">
            Download STEM Assistant
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Get our accessible app to transform how you experience STEM learning.
            {totalDownloads > 0 && (
              <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-stem-blue/20 text-white">
                <Users className="h-4 w-4 mr-1" /> {totalDownloads} downloads
              </span>
            )}
          </p>

          {!user && (
            <Alert variant="destructive" className="mb-8 border-destructive/20 bg-destructive/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription>
                You need to be logged in to download the app.{" "}
                <Link to="/login" className="font-medium underline underline-offset-4 text-white hover:text-white/80">
                  Sign in here
                </Link>
              </AlertDescription>
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
                
                <div className="space-y-6">
                  {versions.map((v) => (
                    <div 
                      key={v.id} 
                      className="glass-morph rounded-lg p-6 card-hover border border-white/10 shadow-md"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-1">Version {v.version}</h3>
                          <div className="text-sm text-muted-foreground mb-2">
                            Released: {v.date} • Size: {v.size}
                            {v.downloadCount !== undefined && (
                              <span className="ml-2 text-stem-blue">
                                {v.downloadCount} downloads
                              </span>
                            )}
                          </div>
                          <p className="text-sm">{v.notes}</p>
                        </div>
                        
                        <Button 
                          className={`glass-morph relative overflow-hidden group ${!user ? 'opacity-70' : ''} 
                            bg-stem-blue hover:bg-stem-blue/80 text-white shadow-md hover:shadow-lg
                            transition-all duration-300 border border-stem-blue/50`}
                          disabled={!user || downloadStarted}
                          onClick={() => handleDownload(v)}
                        >
                          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent 
                            -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                          {!user ? (
                            <>
                              <Lock className="mr-2 h-4 w-4" />
                              Login Required
                            </>
                          ) : downloadStarted ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="mr-2 h-4 w-4" />
                              Download v{v.version}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
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
                  onClick={() => window.open("https://github.com/stem-assistant/app", "_blank")}
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
                  onClick={() => window.open("https://github.com/sponsors/stem-assistant", "_blank")}
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
                Sign in to access download links and start your accessible STEM learning journey.
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
                  Sign In to Download
                </Link>
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default DownloadPage;
