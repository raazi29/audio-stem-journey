
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // When the OAuth provider redirects to this page, redirect to home
    // The auth state will be automatically handled by the Supabase client
    const timer = setTimeout(() => {
      navigate("/");
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <Loader2 className="h-12 w-12 animate-spin text-stem-blue mb-4" />
      <p className="text-lg">Completing authentication...</p>
    </div>
  );
};

export default AuthCallback;
