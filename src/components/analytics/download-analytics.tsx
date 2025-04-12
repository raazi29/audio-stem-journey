import { useEffect, useState } from "react";
import { getDownloadStats, subscribeToDownloads } from "@/lib/download-tracker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from "lucide-react";

interface DownloadStatisticsProps {
  className?: string;
}

export function DownloadAnalytics({ className = "" }: DownloadStatisticsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    byVersion: Record<string, { count: number; versionName: string }>;
  }>({
    total: 0,
    byVersion: {}
  });
  
  // Format data for chart
  const formatChartData = () => {
    return Object.entries(stats.byVersion).map(([versionId, data]) => ({
      versionName: data.versionName,
      downloads: data.count
    }));
  };

  // Load download statistics
  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getDownloadStats();
      setStats(data);
    } catch (err) {
      console.error("Error loading download statistics:", err);
      setError("Failed to load download statistics");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Initial load
    loadStats();
    
    // Set up real-time subscription
    const subscription = subscribeToDownloads(() => {
      loadStats();
    });
    
    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle rendering based on state
  if (loading) {
    return (
      <Card className={`${className} min-h-[300px]`}>
        <CardHeader>
          <CardTitle>APK Download Statistics</CardTitle>
          <CardDescription>Loading download data...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[220px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className={`${className} min-h-[300px]`}>
        <CardHeader>
          <CardTitle>APK Download Statistics</CardTitle>
          <CardDescription>Error loading statistics</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[220px]">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (stats.total === 0) {
    return (
      <Card className={`${className} min-h-[300px]`}>
        <CardHeader>
          <CardTitle>APK Download Statistics</CardTitle>
          <CardDescription>No downloads recorded yet</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[220px]">
          <p className="text-muted-foreground">No download data available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>APK Download Statistics</CardTitle>
        <CardDescription>Total downloads: {stats.total}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formatChartData()}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="versionName" 
                label={{ 
                  value: 'App Version', 
                  position: 'bottom', 
                  offset: 0 
                }}
                angle={-45}
                textAnchor="end"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ 
                  value: 'Downloads', 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              <Tooltip />
              <Bar dataKey="downloads" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 