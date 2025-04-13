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
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
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
      
      // Create user profile in Supabase profiles table
      try {
        // Check if profile exists first
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userData.id)
          .single();
        
        if (!existingProfile) {
          // Insert directly into the profiles table
          const { error: profileError } = await supabase.from('profiles').insert([
            { 
              id: userData.id, 
              email: userData.email,
              created_at: userData.created_at
            }
          ]);
          
          if (profileError) {
            console.error("Error creating profile:", profileError);
          } else {
            // Track signup activity
            trackUserActivity(userData.id!, 'signup', {}, {
              method: 'email',
              timestamp: new Date().toISOString()
            }).catch(err => console.error("Error tracking signup:", err));
          }
        }
      } catch (profileErr) {
        console.error("Error inserting profile:", profileErr);
      }
      
      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Return success
      return { success: true, user: userData };
    }
    
    return { success: true, user: null };
  }
  catch (error) {
    console.error("Error signing up:", error);
    let errorMessage = "An unexpected error occurred";
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error && 'message' in error) {
      errorMessage = String((error as any).message);
    }
    
    // Provide more user-friendly error messages
    if (errorMessage.includes("already registered")) {
      errorMessage = "This email is already registered. Try signing in instead.";
    } else if (errorMessage.includes("email")) {
      errorMessage = "Please provide a valid email address.";
    } else if (errorMessage.includes("password")) {
      errorMessage = "Password must be at least 6 characters long.";
    }
    
    return { success: false, error: { message: errorMessage } };
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
    // Try Supabase auth using signInWithPassword
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Login error:', error.message);
      
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
              name: user.name,
              created_at: user.created_at
            };
            
            console.log('Login success (offline mode):', userData);
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
      
      console.log('Login success:', userData);
      
      // Ensure user profile exists
      try {
        // Check if profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.id)
          .single();
        
        if (!profile) {
          // Create profile if it doesn't exist
          await supabase.from('profiles').insert([
            { 
              id: userData.id, 
              email: userData.email,
              created_at: userData.created_at
            }
          ]);
        }
        
        // Track login activity
        if (userData.id) {
          trackUserActivity(userData.id, 'login', {}, {
            method: 'email',
            timestamp: new Date().toISOString()
          }).catch(err => console.error("Error tracking login:", err));
        }
      } catch (err) {
        console.error("Error ensuring profile exists:", err);
      }
      
      // Store user in localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Return success
      return { success: true, user: userData };
    }
    
    return { success: true, user: null };
  } catch (error) {
    console.error("Error signing in:", error);
    let errorMessage = "An unexpected error occurred";
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error && 'message' in error) {
      errorMessage = String((error as any).message);
    }
    
    // Provide more user-friendly error messages
    if (errorMessage.includes("Invalid login credentials")) {
      errorMessage = "Invalid email or password. Please try again.";
    } else if (errorMessage.includes("Email not confirmed")) {
      errorMessage = "Please confirm your email before signing in.";
    }
    
    // Try local authentication as fallback for any error
    try {
      const localUsers = JSON.parse(localStorage.getItem("localUsers") || "[]");
      const user = localUsers.find((u: any) => u.email === email && u.password === password);
      
      if (user) {
        const userData: User = {
          id: user.id,
          email: user.email,
          name: user.name,
          created_at: user.created_at
        };
        
        localStorage.setItem("user", JSON.stringify(userData));
        return { success: true, user: userData };
      }
    } catch (err) {
      console.error("Error with local auth fallback:", err);
    }
    
    return { success: false, error: { message: errorMessage } };
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