
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
import { Github, Mail, ArrowRight } from "lucide-react";
import { useSupabaseAuth } from "@/lib/auth";

// Define the form schema with Zod
const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
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
  const { signUp, signInWithGoogle, signInWithGithub, user } = useSupabaseAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Set up the form with react-hook-form and zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  // If user is already logged in, redirect to home page
  if (user) {
    navigate("/");
    return null;
  }

  // Handle form submission
  const onSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const { error } = await signUp(data.email, data.password);
      
      if (error) {
        setAuthError(error.message);
        return;
      }
      
      // Show success message
      setSuccess(true);
    } catch (error) {
      console.error("Signup error:", error);
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OAuth sign in
  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setAuthError(null);
    
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else if (provider === 'github') {
        await signInWithGithub();
      }
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      setAuthError(`An error occurred with ${provider} sign in. Please try again.`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="glass-morph">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-gradient">Create an Account</CardTitle>
            <CardDescription className="text-center">
              Sign up to download the STEM Assistant app
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {authError && (
              <Alert variant="destructive">
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}
            
            {success ? (
              <Alert>
                <AlertDescription className="text-center py-4">
                  <p className="mb-4">Your account has been created successfully!</p>
                  <p>Please check your email to verify your account.</p>
                  <Button 
                    className="mt-4 glass-morph"
                    onClick={() => navigate("/login")}
                  >
                    Go to Sign In
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="glass-morph"
                      aria-invalid={!!errors.email}
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      className="glass-morph"
                      aria-invalid={!!errors.password}
                      {...register("password")}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="glass-morph"
                      aria-invalid={!!errors.confirmPassword}
                      {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms" 
                      {...register("terms")} 
                      aria-invalid={!!errors.terms}
                    />
                    <Label
                      htmlFor="terms"
                      className="text-sm font-normal"
                    >
                      I agree to the{" "}
                      <Link
                        to="/terms"
                        className="text-stem-blue hover:underline"
                      >
                        terms of service
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/privacy"
                        className="text-stem-blue hover:underline"
                      >
                        privacy policy
                      </Link>
                    </Label>
                  </div>
                  {errors.terms && (
                    <p className="text-sm text-destructive">{errors.terms.message}</p>
                  )}
                  
                  <Button
                    type="submit"
                    className="w-full glass-morph"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Signing up..." : "Sign Up"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="glass-morph"
                    onClick={() => handleOAuthSignIn('github')}
                  >
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                  <Button
                    variant="outline"
                    className="glass-morph"
                    onClick={() => handleOAuthSignIn('google')}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                </div>
              </>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-wrap items-center justify-center gap-1">
            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-stem-blue hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
