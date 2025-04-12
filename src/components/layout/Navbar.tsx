import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, LogOut, User, Upload, Mail } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { theme } = useTheme();
  
  // Check if current page is home page
  const isHomePage = location.pathname === "/";

  // Check if user is logged in and if they're an admin
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Check if user is admin
        checkAdminStatus(userData.id);
      } catch (e) {
        console.error("Error parsing user data:", e);
        localStorage.removeItem("user");
      }
    }
  }, []);
  
  // Check if user is an admin
  const checkAdminStatus = async (userId: string) => {
    if (!userId) return;
    
    try {
      const { data } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      setIsAdmin(!!data);
    } catch (err) {
      console.error('Error checking admin status:', err);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsAdmin(false);
    navigate("/");
  };

  // Define navigation links
  const navigationLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Download", href: "/download" },
    { name: "Support", href: "/support" },
  ];
  
  // Admin links - only shown to admin users
  const adminLinks = [
    { name: "APK Manager", href: "/admin/apk-manager", icon: <Upload className="h-4 w-4 mr-2" /> }
  ];

  const isCurrentPage = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <header className="glass-nav sticky top-0 z-40 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl text-gradient">STEM Assistant</span>
          </Link>
        </div>
        
        {/* Mobile toggle */}
        <button
          className="block md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Desktop navigation */}
        <div className="hidden md:flex md:items-center md:gap-4">
          <nav className="flex gap-6 mr-6">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`text-sm font-medium hover:text-stem-blue transition-colors ${
                  isCurrentPage(link.href) 
                    ? "text-stem-blue relative after:absolute after:bottom-[-18px] after:left-0 after:w-full after:h-[2px] after:bg-stem-blue" 
                    : "text-foreground/80"
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Admin links */}
            {isAdmin && adminLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`text-sm font-medium hover:text-stem-blue transition-colors flex items-center ${
                  isCurrentPage(link.href) 
                    ? "text-stem-blue relative after:absolute after:bottom-[-18px] after:left-0 after:w-full after:h-[2px] after:bg-stem-blue" 
                    : "text-foreground/80"
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center gap-4">
            {/* Theme toggle - don't show on home page */}
            {!isHomePage && <ThemeToggle className="mr-2" />}
            
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-stem-blue" />
                  <span className="text-sm font-medium truncate max-w-[120px]">
                    {user.name || user.email}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                  className="min-w-[80px] font-medium hover:bg-white/10"
                >
                  <Link to="/login" className="flex items-center justify-center">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </Button>
                <Button 
                  size="sm"
                  asChild
                  className="min-w-[80px] font-medium shadow-md"
                >
                  <Link to="/signup" className="flex items-center justify-center">
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden pb-3 pt-3 mx-4">
          <div className="glass-morph rounded-lg px-4 py-4 space-y-2">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`block py-2 px-3 text-sm font-medium rounded-md hover:bg-muted/30 ${
                  isCurrentPage(link.href) ? "bg-muted/50 text-stem-blue" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Admin links in mobile menu */}
            {isAdmin && adminLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`flex items-center py-2 px-3 text-sm font-medium rounded-md hover:bg-muted/30 ${
                  isCurrentPage(link.href) ? "bg-muted/50 text-stem-blue" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            
            {/* Theme toggle in mobile menu - don't show on home page */}
            {!isHomePage && (
              <div className="py-2 px-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Theme</span>
                  <ThemeToggle />
                </div>
              </div>
            )}
            
            {/* Login/Signup in mobile menu */}
            {!user ? (
              <div className="flex flex-col gap-2 mt-2 p-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                  className="w-full"
                >
                  <Link to="/login" className="flex items-center justify-center">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </Button>
                <Button size="sm" asChild className="w-full">
                  <Link to="/signup" className="flex items-center justify-center">
                    Sign Up
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-2 py-2 px-1">
                  <User className="h-4 w-4 text-stem-blue" />
                  <span className="text-sm font-medium truncate">
                    {user.name || user.email}
                  </span>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;