
import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Set up auth state listener
  useEffect(() => {
    try {
      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
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
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user || null);
        setIsLoading(false);
      });
      
      // Cleanup subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error("Error initializing auth:", error);
      setIsLoading(false);
    }
  }, [toast]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Authentication error:", error);
        throw error;
      }
      
      return { error: null };
    } catch (error) {
      console.error("Error signing in:", error);
      
      // More specific error messages
      const errorMessage = (error as any)?.message || "An unknown error occurred";
      let userFriendlyMessage = errorMessage;
      
      if (errorMessage.includes("Invalid login credentials")) {
        userFriendlyMessage = "Invalid email or password. Please try again.";
      } else if (errorMessage.includes("Email not confirmed")) {
        userFriendlyMessage = "Please confirm your email before signing in.";
      }
      
      toast({
        title: "Sign in failed",
        description: userFriendlyMessage,
        variant: "destructive",
      });
      
      return { error: error as Error };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
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
      
      // More specific error messages
      const errorMessage = (error as any)?.message || "An unknown error occurred";
      let userFriendlyMessage = errorMessage;
      
      if (errorMessage.includes("already registered")) {
        userFriendlyMessage = "This email is already registered. Try signing in instead.";
      }
      
      toast({
        title: "Sign up failed",
        description: userFriendlyMessage,
        variant: "destructive",
      });
      
      return { error: error as Error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error("Google auth error:", error);
        
        // Check if the provider is not enabled
        if (error.message.includes("provider is not enabled") || 
            error.message.includes("Unsupported provider")) {
          toast({
            title: "Google sign in failed",
            description: "Google authentication is not enabled for this application. Please contact the administrator.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      }
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error("GitHub auth error:", error);
        
        // Check if the provider is not enabled
        if (error.message.includes("provider is not enabled") || 
            error.message.includes("Unsupported provider")) {
          toast({
            title: "GitHub sign in failed",
            description: "GitHub authentication is not enabled for this application. Please contact the administrator.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      }
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
