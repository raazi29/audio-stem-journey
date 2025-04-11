
import { createContext, useContext, useEffect, useState } from "react";
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

// Create a context to provide the authentication state
interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
  }>;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
  }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Create a provider component to wrap the application
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const { toast } = useToast();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize the Supabase client
  useEffect(() => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        const client = createClient(supabaseUrl, supabaseKey);
        setSupabase(client);
        
        // Set up auth state listener
        const { data: { subscription } } = client.auth.onAuthStateChange(
          (event, session) => {
            setUser(session?.user || null);
            setIsLoading(false);
            
            if (event === 'SIGNED_IN') {
              toast({
                title: "Signed in successfully",
                variant: "default",
              });
            }
            
            if (event === 'SIGNED_OUT') {
              toast({
                title: "Signed out successfully",
                variant: "default",
              });
            }
          }
        );
        
        // Check if there's an active session
        client.auth.getSession().then(({ data: { session } }) => {
          setUser(session?.user || null);
          setIsLoading(false);
        });
        
        // Cleanup subscription on unmount
        return () => {
          subscription.unsubscribe();
        };
      } else {
        console.error("Supabase credentials are missing");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error initializing Supabase:", error);
      setIsLoading(false);
    }
  }, [toast]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      if (!supabase) throw new Error("Supabase client is not initialized");
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error("Error signing in:", error);
      toast({
        title: "Sign in failed",
        description: (error as Error).message,
        variant: "destructive",
      });
      return { error: error as Error };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      if (!supabase) throw new Error("Supabase client is not initialized");
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Sign up successful",
        description: "Please check your email to verify your account.",
        variant: "default",
      });
      
      return { error: null };
    } catch (error) {
      console.error("Error signing up:", error);
      toast({
        title: "Sign up failed",
        description: (error as Error).message,
        variant: "destructive",
      });
      return { error: error as Error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      if (!supabase) throw new Error("Supabase client is not initialized");
      
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      if (!supabase) throw new Error("Supabase client is not initialized");
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast({
        title: "Google sign in failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  // Sign in with GitHub
  const signInWithGithub = async () => {
    try {
      if (!supabase) throw new Error("Supabase client is not initialized");
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
    } catch (error) {
      console.error("Error signing in with GitHub:", error);
      toast({
        title: "GitHub sign in failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  // Provide the authentication context to the application
  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      signIn,
      signUp,
      signOut,
      signInWithGoogle,
      signInWithGithub,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the authentication context
export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useSupabaseAuth must be used within an AuthProvider");
  }
  
  return context;
};
