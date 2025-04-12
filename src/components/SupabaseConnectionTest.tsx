import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Check, X, Database, ServerOff, HardDrive } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ConnectionStatusProps {
  label: string;
  connected: boolean;
  loading: boolean;
}

const ConnectionStatus = ({ label, connected, loading }: ConnectionStatusProps) => {
  return (
    <div className="flex items-center space-x-2">
      {loading ? (
        <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-blue-500 animate-spin" />
      ) : connected ? (
        <Check className="h-5 w-5 text-green-500" />
      ) : (
        <X className="h-5 w-5 text-red-500" />
      )}
      <span className={connected ? "text-green-500" : "text-red-500"}>
        {label}: {connected ? "Connected" : "Disconnected"}
      </span>
    </div>
  );
};

export default function SupabaseConnectionTest() {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [dbAccess, setDbAccess] = useState(false);
  const [storageAccess, setStorageAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [projectRef, setProjectRef] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Test basic connection
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }
      
      setConnected(true);
      
      // Get project details
      const { data: configData } = await supabase.rpc('get_project_ref');
      if (configData) {
        setProjectRef(configData);
      }
      
      // Test Database access - try to get profiles count
      try {
        const { count, error: countError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        if (!countError) {
          setDbAccess(true);
          setUserCount(count || 0);
        } else {
          console.warn("Database access error:", countError);
          setDbAccess(false);
        }
      } catch (dbError) {
        console.error("Database test error:", dbError);
        setDbAccess(false);
      }
      
      // Test Storage access
      try {
        const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
        
        setStorageAccess(!storageError && !!buckets);
        
        if (storageError) {
          console.warn("Storage access error:", storageError);
        }
      } catch (storageError) {
        console.error("Storage test error:", storageError);
        setStorageAccess(false);
      }
    } catch (err) {
      console.error("Supabase connection test error:", err);
      setError((err as Error).message);
      setConnected(false);
      setDbAccess(false);
      setStorageAccess(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="glass-morph p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Supabase Connection Status</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={testConnection}
          disabled={loading}
          className="glass-morph"
        >
          Test Connection
        </Button>
      </div>
      
      <div className="space-y-2">
        <ConnectionStatus 
          label="API Connection" 
          connected={connected} 
          loading={loading} 
        />
        <ConnectionStatus 
          label="Database Access" 
          connected={dbAccess} 
          loading={loading} 
        />
        <ConnectionStatus 
          label="Storage Access" 
          connected={storageAccess} 
          loading={loading} 
        />
      </div>
      
      {projectRef && (
        <div className="mt-3 text-sm">
          <p>Project Ref: <span className="font-mono">{projectRef}</span></p>
        </div>
      )}
      
      {userCount !== null && dbAccess && (
        <div className="mt-1 text-sm">
          <p>User Profiles: {userCount}</p>
        </div>
      )}
      
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
} 