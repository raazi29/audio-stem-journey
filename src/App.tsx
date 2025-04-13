import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AnimationLoadProvider } from "@/components/AnimationLoadProvider";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser } from "@/lib/auth";
import { upsertUserProfile, trackUserActivity } from "@/lib/user-service";
import { AuthProvider } from "@/lib/auth.tsx";

// Layout
import Layout from "./components/layout/Layout";
import AuthLayout from "./components/layout/AuthLayout";

// Pages
import Home from "./pages/Home";
import Index from "./pages/Index";
import About from "./pages/About";
import Support from "./pages/Support";
import Download from "./pages/Download";
import Accessibility from "./pages/Accessibility";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ApkManager from "./pages/ApkManager";
import AdminDashboard from "./pages/admin/Dashboard";
import AuthCallback from "./pages/AuthCallback";

// Sync service
import { syncLocalDownloads } from "@/lib/download-tracker";

const queryClient = new QueryClient();

// Handle syncing local data when online
const syncLocalData = async () => {
  // Get current user
  const { user } = await getCurrentUser();
  if (!user || !user.id || user.id.startsWith('local-')) {
    return; // No authenticated user to sync with
  }
  
  // Sync local downloads to the server
  try {
    const result = await syncLocalDownloads();
    if (result.success) {
      console.log(`${result.synced} local downloads synced successfully`);
    }
    
    // Additional activity tracking if needed
    if (result.synced > 0) {
      await trackUserActivity(user.id, 'sync', {
        downloads_synced: result.synced,
        timestamp: new Date().toISOString()
      });
    }
  } catch (e) {
    console.error("Error syncing local downloads:", e);
  }
};

const App = () => {
  // Initialize Supabase session from localStorage if available
  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // This is a simplified approach - in a production app, you'd want to verify the session
        console.log("User data found in localStorage");
        
        // Check if this is a local user that needs to be synced
        if (userData.id && userData.id.startsWith('local-')) {
          console.log("Local user detected, will try to sync when online");
        }
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
      }
    }
    
    // Initialize Supabase connection and sync data
    const initializeSupabase = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting Supabase session:", error);
        } else if (data?.session) {
          console.log("Supabase session initialized");
          
          // Check for un-synced local data
          syncLocalData();
        }
      } catch (error) {
        console.error("Supabase initialization error:", error);
      }
    };
    
    // Handle online/offline status
    const handleOnline = () => {
      console.log("App is online, syncing data...");
      initializeSupabase();
    };
    
    // Initialize
    initializeSupabase();
    
    // Set up online event listener for reconnection
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AnimationLoadProvider>
              <AuthProvider>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="old" element={<Index />} />
                    <Route path="about" element={<About />} />
                    <Route path="support" element={<Support />} />
                    <Route path="download" element={<Download />} />
                    <Route path="accessibility" element={<Accessibility />} />
                    <Route path="apk-manager" element={<ApkManager />} />
                    <Route path="admin" element={<AdminDashboard />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                  <Route element={<AuthLayout />}>
                    <Route path="login" element={<Login />} />
                    <Route path="signup" element={<Signup />} />
                    <Route path="auth/callback" element={<AuthCallback />} />
                  </Route>
                </Routes>
              </AuthProvider>
            </AnimationLoadProvider>
          </TooltipProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
