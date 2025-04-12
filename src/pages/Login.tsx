import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, Mail, Github, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getUserInfo } from "@/lib/database";
import Spline from '@splinetool/react-spline';
import { signIn } from "@/lib/auth";

// Login form schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [splineError, setSplineError] = useState(false);

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
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { success, user, error } = await signIn(data.email, data.password);
      
      if (!success) {
        throw new Error(error?.message || "Authentication failed");
      }
      
      if (user) {
        // Store user in localStorage for persistence
        localStorage.setItem("user", JSON.stringify(user));
        
        toast({
          title: "Signed in successfully!",
          description: "You have been logged in.",
        });
        
        // Redirect to the home page
        navigate("/");
      } else {
        throw new Error("No user returned from authentication");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      let errorMessage = (error as Error).message || "An unexpected error occurred. Please try again.";
      
      // Provide a more user-friendly message for connection errors
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
        errorMessage = "Unable to connect to the server. Login will work in offline mode.";
        
        // Attempt offline login
        try {
          const localUsers = JSON.parse(localStorage.getItem("localUsers") || "[]");
          const localUser = localUsers.find((u: any) => u.email === data.email && u.password === data.password);
          
          if (localUser) {
            localStorage.setItem("user", JSON.stringify({
              id: localUser.id,
              email: localUser.email,
              created_at: localUser.created_at
            }));
            
            toast({
              title: "Signed in with offline mode",
              description: "Connected in local mode. Some features may be limited.",
            });
            
            navigate("/");
            return;
          }
        } catch (e) {
          console.error("Error with offline login:", e);
        }
      }
      
      setError(errorMessage);
    } finally {
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
                <Input
                  id="password"
                  type="password"
                  className="backdrop-blur-xl border-white/30 bg-black/30 focus:border-white/50 shadow-inner text-white"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full bg-stem-blue hover:bg-stem-blue/90 border border-white/20 shadow-lg backdrop-blur-xl text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-black/50 px-2 text-white/80 backdrop-blur-xl">
                  Or continue with
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="backdrop-blur-xl border-white/30 bg-black/30 hover:bg-white/10 hover:border-white/50 text-white shadow-lg"
                onClick={() => handleOAuthSignIn('GitHub')}
                disabled={isSubmitting}
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
              <Button
                variant="outline"
                className="backdrop-blur-xl border-white/30 bg-black/30 hover:bg-white/10 hover:border-white/50 text-white shadow-lg"
                onClick={() => handleOAuthSignIn('Google')}
                disabled={isSubmitting}
              >
                <Mail className="mr-2 h-4 w-4" />
                Google
              </Button>
            </div>
            
            <div className="flex justify-center mt-6">
              <Link to="/download" className="bg-stem-blue/80 hover:bg-stem-blue border border-white/20 shadow-lg text-white px-4 py-2 rounded-md text-sm flex items-center backdrop-blur-xl transition-all duration-200">
                <ArrowRight className="mr-2 h-4 w-4" />
                Skip to Download
              </Link>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <p className="text-white/80">
              Don't have an account?{" "}
              <Link to="/signup" className="text-stem-blue hover:text-stem-blue/80 hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
