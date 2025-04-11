
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Lock, AlertTriangle, Info, CheckCircle, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/lib/auth";

const DownloadPage = () => {
  const { toast } = useToast();
  const { user } = useSupabaseAuth();
  const [downloadStarted, setDownloadStarted] = useState(false);
  
  // Simulate different versions of the app
  const versions = [
    {
      version: "1.2",
      date: "April 10, 2025",
      size: "45 MB",
      notes: "Latest version with improved camera focus and faster equation processing."
    },
    {
      version: "1.1",
      date: "March 15, 2025",
      size: "43 MB",
      notes: "Added support for complex calculus equations and improved haptic feedback."
    },
    {
      version: "1.0",
      date: "February 1, 2025",
      size: "40 MB",
      notes: "Initial release with core functionality for STEM learning."
    }
  ];

  const handleDownload = (version: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to download the app.",
        variant: "destructive",
      });
      return;
    }

    setDownloadStarted(true);
    
    toast({
      title: "Download Started",
      description: `STEM Assistant v${version} is being downloaded.`,
      variant: "default",
    });
    
    // Clear the download started state after 5 seconds
    setTimeout(() => {
      setDownloadStarted(false);
    }, 5000);
  };

  // Reset download state when component unmounts
  useEffect(() => {
    return () => setDownloadStarted(false);
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <section className="mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-gradient mb-6">
            Download STEM Assistant
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Get our accessible app to transform how you experience STEM learning.
          </p>

          {!user && (
            <Alert variant="destructive" className="mb-8">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription>
                You need to be logged in to download the app.{" "}
                <Link to="/login" className="font-medium underline underline-offset-4">
                  Sign in here
                </Link>
              </AlertDescription>
            </Alert>
          )}

          <div className="glass-morph rounded-lg p-8 mb-8">
            <Tabs defaultValue="android">
              <TabsList className="glass-morph mb-6">
                <TabsTrigger value="android">Android</TabsTrigger>
                <TabsTrigger value="ios" disabled>iOS (Coming Soon)</TabsTrigger>
              </TabsList>
              
              <TabsContent value="android" className="space-y-6">
                <div className="flex items-center justify-between p-4 glass-morph rounded-lg">
                  <div className="flex items-center">
                    <Info className="h-5 w-5 text-stem-blue mr-3" />
                    <span>Compatible with Android 8.0 and above</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {versions.map((v) => (
                    <div 
                      key={v.version} 
                      className="glass-morph rounded-lg p-6 card-hover"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-1">Version {v.version}</h3>
                          <div className="text-sm text-muted-foreground mb-2">
                            Released: {v.date} • Size: {v.size}
                          </div>
                          <p className="text-sm">{v.notes}</p>
                        </div>
                        
                        <Button 
                          className={`glass-morph ${!user ? 'opacity-70' : ''}`}
                          disabled={!user || downloadStarted}
                          onClick={() => handleDownload(v.version)}
                        >
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
          
          <div className="glass-morph rounded-lg p-8">
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
            
            <Alert className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Need Help?</AlertTitle>
              <AlertDescription>
                If you're having trouble installing the app, please visit our{" "}
                <Link to="/support" className="font-medium underline underline-offset-4">
                  support page
                </Link>{" "}
                for assistance.
              </AlertDescription>
            </Alert>
          </div>
        </section>
        
        {!user && (
          <section className="text-center animate-fade-in">
            <div className="glass-morph rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Download?</h2>
              <p className="text-muted-foreground mb-6">
                Sign in to access download links and start your accessible STEM learning journey.
              </p>
              <Button size="lg" className="glass-morph" asChild>
                <Link to="/login">
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
