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
import { Github, Mail, ArrowRight, Download, Loader2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveUserInfo } from "@/lib/database";
import Spline from '@splinetool/react-spline';
import { signUp } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

// Define the form schema with Zod
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must include uppercase, lowercase, number and special character"
    ),
  confirmPassword: z.string(),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and privacy policy",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
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
    setValue,
    watch,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  // Watch terms value for real-time validation
  const watchTerms = watch("terms");

  // Handle form submission
  const onSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { success, user, error: signupError } = await signUp(data.email, data.password);
      
      if (!success) {
        // Handle error message safely with type checking
        const errorMessage = typeof signupError === 'object' && signupError 
          ? (signupError as { message?: string }).message || "Failed to create account"
          : "Failed to create account";
        throw new Error(errorMessage);
      }
      
      // Save additional user profile data
      if (user && user.id) {
        try {
          // Insert additional profile information into the profiles table
          const { error: profileError } = await supabase.from('profiles').upsert([
            {
              id: user.id,
              full_name: data.name,
              email: user.email,
              preferences: {
                agreedToTerms: data.terms,
                signupDate: new Date().toISOString()
              },
              updated_at: new Date().toISOString()
            }
          ], { 
            onConflict: 'id',
            ignoreDuplicates: false 
          });
          
          if (profileError) {
            const errorMsg = typeof profileError === 'object' && profileError 
              ? (profileError as { message?: string }).message || "Unknown error"
              : String(profileError);
            console.error("Failed to save complete profile:", errorMsg);
            // Continue anyway as the account was created
          }
        } catch (profileErr) {
          console.error("Error saving user profile:", profileErr);
          // Continue anyway as the account was created
        }
      }
      
      // Show success message
      setSuccess(true);
      
      toast({
        title: "Account created successfully!",
        description: "You can now log in with your credentials.",
      });
      
      // Redirect to login page after short delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Signup error:", error);
      
      let errorMessage = (error as Error).message || "An unexpected error occurred. Please try again.";
      
      // Provide a more user-friendly message for connection errors
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
        errorMessage = "Unable to connect to the server. Account created in offline mode.";
        
        // Save user to local storage for offline use
        try {
          const mockUser = {
            id: `local-${Date.now()}`,
            email: data.email,
            name: data.name,
            created_at: new Date().toISOString()
          };
          
          const existingUsers = JSON.parse(localStorage.getItem("localUsers") || "[]");
          existingUsers.push({
            email: data.email,
            name: data.name,
            password: data.password,
            id: mockUser.id,
            created_at: mockUser.created_at,
            preferences: {
              agreedToTerms: data.terms,
              signupDate: new Date().toISOString()
            }
          });
          localStorage.setItem("localUsers", JSON.stringify(existingUsers));
          
          // Show success message
          setSuccess(true);
          
          toast({
            title: "Account created in offline mode",
            description: "You can log in locally, but data won't sync until you're back online.",
          });
          
          // Redirect to login page after short delay
          setTimeout(() => {
            navigate("/login");
          }, 2000);
          
          return;
        } catch (e) {
          console.error("Error creating local user:", e);
          errorMessage = "Failed to create account in offline mode.";
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
      // Simulate OAuth registration with mock user data
      const mockUser = {
        email: `${provider.toLowerCase()}-user-${Date.now()}@example.com`,
        name: `${provider} User`,
        preferences: {
          authProvider: provider,
          agreedToTerms: true,
          signupDate: new Date().toISOString()
        }
      };
      
      // Save mock user to database
      const { success: saveSuccess, error: saveError } = await saveUserInfo(mockUser);
      
      if (!saveSuccess) {
        // Handle error message safely with type checking
        const errorMessage = typeof saveError === 'object' && saveError 
          ? (saveError as { message?: string }).message || `Failed to register with ${provider}`
          : `Failed to register with ${provider}`;
        throw new Error(errorMessage);
      }
      
      // Store user info in local storage (simulating login after registration)
      localStorage.setItem("user", JSON.stringify(mockUser));
      
      toast({
        title: `Registered with ${provider}`,
        description: "Your account has been created successfully!",
      });
      
      // Redirect to home page
      navigate("/");
    } catch (error) {
      console.error(`${provider} registration error:`, error);
      setError(`An error occurred with ${provider} registration. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle checkbox change
  const handleTermsChange = (checked: boolean) => {
    setTermsChecked(checked);
    setValue("terms", checked, { shouldValidate: true });
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Fallback gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-stem-purple/30 via-stem-blue/20 to-[#0a0a0a]"></div>
      
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
      
      {/* Floating signup card with improved glassmorphism */}
      <div className="relative my-8 w-full max-w-md p-4">
        <Card className="backdrop-blur-xl bg-black/50 border border-white/20 shadow-2xl rounded-xl overflow-hidden">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-white">Create an Account</CardTitle>
            <CardDescription className="text-center text-white/80">
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success ? (
              <Alert>
                <AlertDescription className="text-center py-4">
                  <p className="mb-4">Your account has been created successfully!</p>
                  <p>You can now log in with your credentials.</p>
                  <div className="flex gap-3 mt-4 justify-center">
                    <Button 
                      className="bg-stem-purple hover:bg-stem-purple/90 border border-white/20 shadow-lg backdrop-blur-xl text-white"
                      onClick={() => navigate("/login")}
                    >
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                    <Button 
                      className="backdrop-blur-xl border-white/30 bg-black/30 hover:bg-white/10 hover:border-white/50 text-white shadow-lg"
                      variant="outline"
                      onClick={() => navigate("/download")}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download App
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      className="backdrop-blur-xl border-white/30 bg-black/30 focus:border-white/50 shadow-inner text-white"
                      aria-invalid={!!errors.name}
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-400">{errors.name.message}</p>
                    )}
                  </div>
                  
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
                    <Label htmlFor="password" className="text-white">Password</Label>
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="backdrop-blur-xl border-white/30 bg-black/30 focus:border-white/50 shadow-inner text-white"
                      aria-invalid={!!errors.confirmPassword}
                      {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms" 
                      checked={termsChecked}
                      onCheckedChange={handleTermsChange}
                      aria-invalid={!!errors.terms}
                      className="border-white/30 data-[state=checked]:bg-stem-purple"
                    />
                    <Label
                      htmlFor="terms"
                      className="text-sm font-normal text-white/90"
                    >
                      I agree to the{" "}
                      <Link
                        to="/terms"
                        className="text-stem-purple hover:underline"
                      >
                        terms of service
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/privacy"
                        className="text-stem-purple hover:underline"
                      >
                        privacy policy
                      </Link>
                    </Label>
                  </div>
                  {errors.terms && (
                    <p className="text-sm text-red-400">{errors.terms.message}</p>
                  )}
                  
                  <Button
                    type="submit"
                    className="w-full relative overflow-hidden bg-gradient-to-r from-stem-purple to-stem-blue hover:from-stem-purple/90 hover:to-stem-blue/90 border border-white/20 shadow-lg backdrop-blur-xl text-white transition-all duration-300 transform hover:translate-y-[-2px]"
                    disabled={isSubmitting || success}
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]"></span>
                    <span className="relative flex items-center justify-center">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : success ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Account Created!
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </span>
                  </Button>
                </form>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-black/50 px-4 py-1 text-white/80 backdrop-blur-xl rounded-full uppercase text-[10px] tracking-wider">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-black/30 backdrop-blur-md border-white/20 hover:bg-black/40 text-white transition-all duration-300 hover:scale-105 hover:border-white/40 group flex items-center justify-center"
                    onClick={() => handleOAuthSignIn('GitHub')}
                    disabled={isSubmitting}
                  >
                    <Github className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">GitHub</span>
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-black/30 backdrop-blur-md border-white/20 hover:bg-black/40 text-white transition-all duration-300 hover:scale-105 hover:border-white/40 group flex items-center justify-center"
                    onClick={() => handleOAuthSignIn('Google')}
                    disabled={isSubmitting}
                  >
                    <Mail className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">Google</span>
                  </Button>
                </div>
                
                <div className="flex justify-center mt-6">
                  <Link to="/download" className="bg-stem-purple/70 hover:bg-stem-purple/90 border border-white/20 shadow-md text-white px-4 py-2 rounded-md text-sm flex items-center backdrop-blur-md transition-all duration-200">
                    <Download className="mr-2 h-4 w-4" />
                    Skip to Download
                  </Link>
                </div>
              </>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <div className="mt-6 text-center">
              <p className="text-white/80">
                Have an account?{" "}
                <Link 
                  to="/login" 
                  className="text-stem-blue hover:text-white font-medium transition-all duration-300 hover:underline relative group"
                >
                  Sign in
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-stem-blue group-hover:w-full transition-all duration-300"></span>
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
