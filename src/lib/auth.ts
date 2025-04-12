import { supabase } from "@/integrations/supabase/client";
import { upsertUserProfile, trackUserActivity } from "./user-service";

// Basic user interface
export interface User {
  id?: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at?: string;
}

/**
 * Sign up with email and password
 */
export const signUp = async (email: string, password: string): Promise<{ 
  success: boolean; 
  user?: User | null; 
  error?: any 
}> => {
  try {
    // Sign up with Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      console.error("Supabase signup error:", error);
      
      // If there's a network issue, create a local user instead
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        console.log("Network error detected, using local fallback for signup");
        
        // Create a mock user for offline usage
        const mockUser: User = {
          id: `local-${Date.now()}`,
          email,
          created_at: new Date().toISOString()
        };
        
        // Store locally
        try {
          const existingUsers = JSON.parse(localStorage.getItem("localUsers") || "[]");
          existingUsers.push({
            email,
            password, // NOTE: In a real app, never store plaintext passwords, this is for demo only
            id: mockUser.id,
            created_at: mockUser.created_at
          });
          localStorage.setItem("localUsers", JSON.stringify(existingUsers));
          return { success: true, user: mockUser };
        } catch (err) {
          console.error("Error storing local user:", err);
          throw error;
        }
      } else {
        throw error;
      }
    }
    
    if (data?.user) {
      const userData: User = {
        id: data.user.id,
        email: data.user.email || email,
        created_at: data.user.created_at,
      };
      
      // Create user profile in Supabase
      const { success, error: profileError } = await upsertUserProfile(userData);
      
      if (!success) {
        console.error("Error creating user profile:", profileError);
      } else {
        // Track signup activity
        trackUserActivity(userData.id!, 'signup', {}, {
          method: 'email',
          timestamp: new Date().toISOString()
        }).catch(err => console.error("Error tracking signup:", err));
      }
      
      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Return success
      return { success: true, user: userData };
    }
    
    return { success: true, user: null };
  } catch (error) {
    console.error("Error signing up:", error);
    
    // If there's any other error, try to use local authentication
    try {
      const mockUser: User = {
        id: `local-${Date.now()}`,
        email,
        created_at: new Date().toISOString()
      };
      
      const existingUsers = JSON.parse(localStorage.getItem("localUsers") || "[]");
      existingUsers.push({
        email,
        password, // Again, don't do this in production
        id: mockUser.id,
        created_at: mockUser.created_at
      });
      localStorage.setItem("localUsers", JSON.stringify(existingUsers));
      
      return { success: true, user: mockUser };
    } catch (err) {
      console.error("Error with local fallback:", err);
      return { success: false, error };
    }
  }
};

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string): Promise<{ 
  success: boolean; 
  user?: User | null; 
  error?: any 
}> => {
  try {
    // Try Supabase auth first
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Supabase signin error:", error);
      
      // If there's a network issue, try local authentication
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        console.log("Network error detected, using local fallback for signin");
        
        // Check local users
        try {
          const localUsers = JSON.parse(localStorage.getItem("localUsers") || "[]");
          const user = localUsers.find((u: any) => u.email === email && u.password === password);
          
          if (user) {
            const userData: User = {
              id: user.id,
              email: user.email,
              created_at: user.created_at
            };
            
            localStorage.setItem("user", JSON.stringify(userData));
            return { success: true, user: userData };
          } else {
            return { success: false, error: new Error("Invalid email or password") };
          }
        } catch (err) {
          console.error("Error with local auth:", err);
          throw error;
        }
      } else {
        throw error;
      }
    }
    
    if (data?.user) {
      const userData: User = {
        id: data.user.id,
        email: data.user.email || email,
        created_at: data.user.created_at,
      };
      
      // Ensure user profile exists
      upsertUserProfile(userData).catch(err => {
        console.error("Error ensuring profile exists:", err);
      });
      
      // Track login activity
      if (userData.id) {
        trackUserActivity(userData.id, 'login', {}, {
          method: 'email',
          timestamp: new Date().toISOString()
        }).catch(err => console.error("Error tracking login:", err));
      }
      
      // Store user in localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Return success
      return { success: true, user: userData };
    }
    
    return { success: true, user: null };
  } catch (error) {
    console.error("Error signing in:", error);
    
    // Try local authentication as fallback for any error
    try {
      const localUsers = JSON.parse(localStorage.getItem("localUsers") || "[]");
      const user = localUsers.find((u: any) => u.email === email && u.password === password);
      
      if (user) {
        const userData: User = {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        };
        
        localStorage.setItem("user", JSON.stringify(userData));
        return { success: true, user: userData };
      }
    } catch (err) {
      console.error("Error with local auth fallback:", err);
    }
    
    return { success: false, error };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<{ success: boolean; error?: any }> => {
  try {
    // Get user before signing out to track activity
    const userData = localStorage.getItem("user");
    let userId: string | undefined;
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        userId = user.id;
        
        // Track logout activity if we have a valid user ID
        if (userId && !userId.startsWith('local-')) {
          await trackUserActivity(userId, 'logout', {}, {
            timestamp: new Date().toISOString()
          });
        }
      } catch (e) {
        console.error("Error parsing user data before logout:", e);
      }
    }
    
    const { error } = await supabase.auth.signOut();
    
    // Always remove local user data regardless of Supabase result
    localStorage.removeItem("user");
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error signing out:", error);
    
    // Even if Supabase fails, we can still remove local storage
    localStorage.removeItem("user");
    return { success: true };
  }
};

/**
 * Get the current user
 */
export const getCurrentUser = async (): Promise<{ 
  user: User | null; 
  error?: any 
}> => {
  try {
    // Try to get user from localStorage first
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        return { user: JSON.parse(storedUser) };
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem("user");
      }
    }
    
    // Then try Supabase
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    
    if (data?.user) {
      const userData: User = {
        id: data.user.id,
        email: data.user.email || '',
        created_at: data.user.created_at,
      };
      
      // Store in localStorage for future use
      localStorage.setItem("user", JSON.stringify(userData));
      
      return { user: userData };
    }
    
    return { user: null };
  } catch (error) {
    console.error("Error getting current user:", error);
    return { user: null, error };
  }
};

/**
 * Test the Supabase connection
 */
export const testSupabaseConnection = async (): Promise<{ 
  connected: boolean; 
  dbAccess: boolean;
  storageAccess: boolean;
  error?: any 
}> => {
  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(`Connection error: ${error.message}`);
    }
    
    // Test Database access
    const { error: dbError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    // Test Storage access
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    
    return { 
      connected: true,
      dbAccess: !dbError,
      storageAccess: !storageError && !!buckets
    };
  } catch (error) {
    console.error("Supabase connection test error:", error);
    return { 
      connected: false, 
      dbAccess: false,
      storageAccess: false,
      error 
    };
  }
}; 