import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { saveUserInfo, getUserInfo, trackDownload } from "@/lib/database";

const DirectAccessDemo = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle saving user info
  const handleSaveUser = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Parse preferences as JSON if provided
      let preferencesObj = {};
      if (preferences.trim()) {
        try {
          preferencesObj = JSON.parse(preferences);
        } catch (e) {
          setError("Invalid JSON format for preferences");
          setLoading(false);
          return;
        }
      }

      // Call the database function
      const response = await saveUserInfo({
        email,
        name: name || undefined,
        preferences: Object.keys(preferencesObj).length > 0 ? preferencesObj : undefined
      });

      if (response.success) {
        setResult({
          action: "save",
          data: response.user
        });
      } else {
        setError(`Error saving user: ${response.error?.message || "Unknown error"}`);
      }
    } catch (e) {
      setError(`Unexpected error: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle getting user info
  const handleGetUser = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await getUserInfo(email);

      if (response.success) {
        setResult({
          action: "get",
          data: response.user
        });
        
        // Update the form with the fetched data
        if (response.user) {
          setName(response.user.name || "");
          setPreferences(
            response.user.preferences 
              ? JSON.stringify(response.user.preferences, null, 2) 
              : ""
          );
        }
      } else {
        setError(`Error getting user: ${response.error?.message || "Unknown error"}`);
      }
    } catch (e) {
      setError(`Unexpected error: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle tracking a download
  const handleTrackDownload = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Using a fake version ID for demonstration
      const versionId = "demo-version-1";
      const response = await trackDownload(versionId, email || undefined);

      if (response.success) {
        setResult({
          action: "download",
          message: `Successfully tracked download for version ${versionId}${email ? ` by ${email}` : ""}`
        });
      } else {
        setError(`Error tracking download: ${response.error?.message || "Unknown error"}`);
      }
    } catch (e) {
      setError(`Unexpected error: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Card className="glass-morph">
        <CardHeader>
          <CardTitle className="text-gradient">Direct Database Access Demo</CardTitle>
          <CardDescription>
            This page demonstrates direct database access without requiring authentication
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert>
              <AlertDescription>
                <div className="font-medium">
                  {result.action === "save" && "User saved successfully!"}
                  {result.action === "get" && "User retrieved successfully!"}
                  {result.action === "download" && result.message}
                </div>
                {(result.action === "save" || result.action === "get") && result.data && (
                  <pre className="mt-2 rounded bg-slate-950 p-2 text-xs text-white overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="glass-morph"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="glass-morph"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preferences">
                Preferences (JSON format, optional)
              </Label>
              <Textarea
                id="preferences"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder='{"theme": "dark", "notifications": true}'
                className="glass-morph min-h-24"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <Button 
              onClick={handleSaveUser} 
              disabled={loading || !email} 
              className="glass-morph"
            >
              {loading ? "Processing..." : "Save User Info"}
            </Button>
            
            <Button 
              onClick={handleGetUser} 
              disabled={loading || !email} 
              variant="outline" 
              className="glass-morph"
            >
              {loading ? "Processing..." : "Get User Info"}
            </Button>
            
            <Button 
              onClick={handleTrackDownload} 
              disabled={loading} 
              variant="outline" 
              className="glass-morph"
            >
              {loading ? "Processing..." : "Track Demo Download"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DirectAccessDemo; 