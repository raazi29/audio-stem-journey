import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, Mail, Github, Loader2, Eye, EyeOff, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getUserInfo } from "@/lib/database";
import Spline from '@splinetool/react-spline';
import { supabase } from "@/integrations/supabase/client";

// Login form schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false)
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [splineError, setSplineError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle Spline load events
  const handleSplineLoad = () => {
    console.log('Spline scene loaded successfully');
    setSplineLoaded(true);
  };

  const handleSplineError = (err: any) => {
    console.error('Error loading Spline scene:', err);
    setSplineError(true);
  };

  // Set up the form with react-hook-form and zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: localStorage.getItem('rememberedEmail') || "",
      password: "",
      rememberMe: Boolean(localStorage.getItem('rememberedEmail'))
    },
  });

  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    // Handle remember me functionality
    if (data.rememberMe) {
      localStorage.setItem('rememberedEmail', data.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    try {
      console.log('Attempting login for:', data.email);
      
      // Set a timeout for the login request
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout - network may be unavailable')), 10000)
      );
      
      // Race the login request against timeout
      const loginPromise = supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      // Try online login first
      try {
        const result = await Promise.race([loginPromise, timeoutPromise]) as any;
        const { data: authData, error: authError } = result || { data: null, error: new Error('Unknown error during login') };
        
        if (authError) {
          console.error('Auth error during login:', authError);
          
          // If it's not a network error, and it's a credentials error, don't try local login
          if (!authError.message?.includes('Failed to fetch') && 
              !authError.message?.includes('NetworkError') &&
              !authError.message?.includes('timeout') &&
              (authError.message?.includes('Invalid login credentials') || 
               authError.message?.includes('Email not confirmed'))) {
            throw authError;
          }
          
          // For network errors, try local login
          throw new Error('NetworkError');
        }
        
        if (!authData?.user) {
          throw new Error("No user returned from authentication");
        }
        
        console.log('Login successful for user:', authData.user.id);
        
        // Store user info in local storage
        localStorage.setItem('user', JSON.stringify({
          id: authData.user.id,
          email: authData.user.email,
          created_at: authData.user.created_at
        }));
        
        // Check if user has a profile, create one if not
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();
          
          if (profileError || !profileData) {
            console.log('Profile not found, creating new profile');
            
            // Create profile if it doesn't exist
            await supabase.from('profiles').upsert([
              {
                id: authData.user.id,
                email: authData.user.email,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ], { onConflict: 'id' });
          }
        } catch (profileErr) {
          console.error('Error checking/creating profile:', profileErr);
        }
        
        toast({
          title: "Signed in successfully!",
          description: "Welcome back to STEM Assistant.",
        });
        
        // Redirect to the home page
        navigate("/");
        return;
      } catch (onlineError) {
        // For non-network errors, propagate them
        if (!(onlineError instanceof Error) || 
            !onlineError.message.includes('Network')) {
          throw onlineError;
        }
        
        console.log('Network error, trying local login');
        
        // Try local login as fallback
        try {
          // Get locally stored users
          const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
          const localUser = localUsers.find((u: any) => 
            u.email === data.email && u.password === data.password
          );
          
          if (localUser) {
            console.log('Local login successful');
            
            // Remove password before storing in active user
            const { password, ...userWithoutPassword } = localUser;
            
            // Store user info
            localStorage.setItem('user', JSON.stringify({
              ...userWithoutPassword,
              isLocalOnly: true
            }));
            
            toast({
              title: "Signed in (offline mode)",
              description: "You have limited access until you're online.",
            });
            
            // Redirect to the home page
            navigate("/");
            return;
          } else {
            throw new Error('Invalid email or password for local login');
          }
        } catch (localError) {
          console.error('Local login error:', localError);
          throw new Error('Could not log in online or offline. Please check your credentials or internet connection.');
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      
      let errorMessage = (error as Error).message || "Authentication failed. Please try again.";
      
      // Provide more user-friendly error messages
      if (errorMessage.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (errorMessage.includes("Email not confirmed")) {
        errorMessage = "Please confirm your email before signing in.";
      } else if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
        errorMessage = "Network error. Please check your internet connection.";
      }
      
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  // Handle OAuth sign in (simulated)
  const handleOAuthSignIn = async (provider: string) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Simulate OAuth login with mock user data
      const mockUser = {
        id: `mock-${provider}-user-${Date.now()}`,
        email: `${provider.toLowerCase()}-user@example.com`,
        name: `${provider} User`,
        created_at: new Date().toISOString(),
      };
      
      // Store user info in local storage
      localStorage.setItem("user", JSON.stringify(mockUser));
      
      toast({
        title: `Signed in with ${provider}`,
        description: "You have been logged in successfully.",
      });
      
      // Redirect to home page
      navigate("/");
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      setError(`An error occurred with ${provider} sign in. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle guest login
  const handleGuestLogin = () => {
    setIsSubmitting(true);
    
    try {
      const guestUser = {
        id: `guest-${Date.now()}`,
        email: 'guest@stemassistant.com',
        name: 'Guest User',
        created_at: new Date().toISOString(),
        isGuest: true
      };
      
      localStorage.setItem("user", JSON.stringify(guestUser));
      
      toast({
        title: "Signed in as guest",
        description: "You have limited access. Create an account for full features.",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Guest login error:", error);
      setError("Unable to sign in as guest. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Fallback gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-stem-blue/30 via-stem-purple/20 to-[#0a0a0a]"></div>
      
      {/* Full screen 3D background */}
      <div className="absolute inset-0">
        <Spline 
          scene="https://prod.spline.design/fNRZodNupZx7Tzq3/scene.splinecode"
          onLoad={handleSplineLoad}
          onError={handleSplineError} 
        />
        
        {/* Loading indicator */}
        {!splineLoaded && !splineError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-white mb-2" />
              <p className="text-sm text-white/90">Loading 3D scene...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Floating login card with improved glassmorphism - centered with better positioning */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <Card className="w-full max-w-md backdrop-blur-xl bg-black/50 border border-white/20 shadow-2xl rounded-xl overflow-hidden">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-white">Sign In</CardTitle>
            <CardDescription className="text-center text-white/80">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="backdrop-blur-xl border-white/30 bg-black/30 focus:border-white/50 shadow-inner text-white"
                  aria-invalid={!!errors.email}
                  autoComplete="email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-stem-blue hover:text-stem-blue/80 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="backdrop-blur-xl border-white/30 bg-black/30 focus:border-white/50 shadow-inner text-white pr-10"
                    aria-invalid={!!errors.password}
                    autoComplete="current-password"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-me"
                  className="border-white/30 data-[state=checked]:bg-stem-blue data-[state=checked]:border-stem-blue"
                  {...register("rememberMe")}
                />
                <Label htmlFor="remember-me" className="text-sm text-white/80">
                  Remember me
                </Label>
              </div>
              
              <Button
                type="submit"
                className="w-full relative overflow-hidden bg-gradient-to-r from-stem-blue to-stem-purple hover:from-stem-blue/90 hover:to-stem-purple/90 border border-white/20 shadow-lg backdrop-blur-xl text-white transition-all duration-300 transform hover:translate-y-[-2px]"
                disabled={isSubmitting}
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]"></span>
                <span className="relative flex items-center justify-center">
                  {isSubmitting ? "Signing in..." : "Sign In"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Button>
            </form>
            
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative px-4 text-xs uppercase text-white/50 bg-black/30 backdrop-blur-sm rounded-full">
                or continue with
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant="outline"
                className="bg-black/30 backdrop-blur-md border-white/20 hover:bg-black/40 text-white transition-all duration-300 hover:scale-105 hover:border-white/40"
                onClick={() => handleOAuthSignIn('GitHub')}
                disabled={isSubmitting}
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="bg-black/30 backdrop-blur-md border-white/20 hover:bg-black/40 text-white transition-all duration-300 hover:scale-105 hover:border-white/40"
                onClick={() => handleOAuthSignIn('Google')}
                disabled={isSubmitting}
              >
                <GoogleIcon className="h-5 w-5" />
                <span className="sr-only">Google</span>
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="bg-black/30 backdrop-blur-md border-white/20 hover:bg-black/40 text-white transition-all duration-300 hover:scale-105 hover:border-white/40"
                onClick={() => handleOAuthSignIn('Microsoft')}
                disabled={isSubmitting}
              >
                <MicrosoftIcon className="h-5 w-5" />
                <span className="sr-only">Microsoft</span>
              </Button>
            </div>
            
            <Button
              type="button"
              variant="ghost"
              className="w-full border border-white/10 text-white/80 hover:text-white hover:bg-white/5 transition-all duration-300 group"
              onClick={handleGuestLogin}
              disabled={isSubmitting}
            >
              <LogIn className="mr-2 h-4 w-4 group-hover:animate-pulse" />
              <span className="group-hover:translate-x-1 transition-transform duration-300">Continue as Guest</span>
            </Button>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t border-white/10 pt-6">
            <p className="text-sm text-white/70">
              Don't have an account?{" "}
              <Link 
                to="/signup" 
                className="text-stem-blue hover:text-white font-medium transition-all duration-300 hover:underline relative group"
              >
                Sign up
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-stem-blue group-hover:w-full transition-all duration-300"></span>
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

// Custom icons
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    height="24" 
    width="24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      fill="currentColor" 
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
    />
  </svg>
);

const MicrosoftIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 23 23" 
    className={className}
    height="23" 
    width="23" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill="currentColor" d="M0 0h11v11H0z"/>
    <path fill="currentColor" d="M12 0h11v11H12z"/>
    <path fill="currentColor" d="M0 12h11v11H0z"/>
    <path fill="currentColor" d="M12 12h11v11H12z"/>
  </svg>
);

export default Login;
