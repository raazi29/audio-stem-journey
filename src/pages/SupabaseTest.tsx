import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Database, AlertTriangle, Loader2 } from "lucide-react";
import Spline from '@splinetool/react-spline';

export default function SupabaseTest() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [splineLoaded, setSplineLoaded] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setMessage("");
    setError(null);
    
    try {
      // Test basic connection
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw new Error(`Connection error: ${error.message}`);
      }
      // Test Database access
      const { data: projectRef, error: projectError } = await supabase.rpc('get_download_count');
      
      if (projectError) {
        setMessage(`Connected to API but database function error: ${projectError.message}`);
        setConnected(false);
        return;
      }
      
      setConnected(true);
      setMessage(`Connected successfully to project: ${projectRef || 'hupeyekrlkfgfwdmxjzg'}`);
    } catch (err) {
      console.error("Connection test error:", err);
      setError((err as Error).message);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="relative min-h-[400px] mb-8 rounded-lg overflow-hidden glass-morph">
        {/* Fallback gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-stem-blue/20 via-stem-purple/20 to-transparent"></div>
        
        {/* 3D Spline scene */}
        <div className="absolute inset-0">
          <Spline 
            scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
            onLoad={() => setSplineLoaded(true)}
          />
          
          {/* Loading indicator */}
          {!splineLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
              <div className="flex flex-col items-center">
                <Loader2 className="h-10 w-10 animate-spin text-white mb-2" />
                <p className="text-sm text-white/80">Loading 3D scene...</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Text overlay on top of the animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="p-6 bg-black/40 backdrop-blur-md rounded-lg text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Supabase Connection Test</h1>
            <p className="text-white/80">Testing connection with token: sbp_e3548b493325bfb47af8208dba66c8d58aaeea02</p>
          </div>
        </div>
      </div>
      
      <Card className="glass-morph max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Supabase Connection Status
          </CardTitle>
          <CardDescription>
            Testing connection to Supabase with your access token
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : connected === true ? (
            <Alert variant="default" className="border-green-500/20 bg-green-500/10">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <AlertTitle>Connected</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <XCircle className="h-5 w-5" />
              <AlertTitle>Connection Failed</AlertTitle>
              <AlertDescription>
                {error || "Unable to connect to Supabase."}
                {message && <div className="mt-2">{message}</div>}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Data being sent to Supabase */}
          <div className="mt-6 border border-white/10 rounded-md p-4">
            <h3 className="text-sm font-medium mb-2">Data being sent to Supabase:</h3>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" /> 
                <span>User profiles (on signup/login)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" /> 
                <span>Download activities (when apps are downloaded)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" /> 
                <span>User session data (during authentication)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" /> 
                <span>App version information (for update management)</span>
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={testConnection} 
            className="w-full"
            disabled={loading}
          >
            {loading ? "Testing..." : "Test Connection Again"}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="max-w-xl mx-auto mt-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Fallback System Active</AlertTitle>
          <AlertDescription>
            If Supabase connection fails, the app will automatically store data locally and sync when connection is restored.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
} 