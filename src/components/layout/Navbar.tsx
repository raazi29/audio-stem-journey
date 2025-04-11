
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Download, LogIn, LogOut, Home, Info, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSupabaseAuth } from "@/lib/auth";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user, signOut } = useSupabaseAuth();
  
  const toggleMenu = () => setIsOpen(!isOpen);
  
  const closeMenu = () => setIsOpen(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
    closeMenu();
  };

  const menuItems = [
    { label: "Home", href: "/", icon: <Home className="mr-2 h-4 w-4" /> },
    { label: "About", href: "/about", icon: <Info className="mr-2 h-4 w-4" /> },
    { label: "Download", href: "/download", icon: <Download className="mr-2 h-4 w-4" /> },
    { label: "Support", href: "/support", icon: <LifeBuoy className="mr-2 h-4 w-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass-morph">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link 
            to="/" 
            className="flex items-center text-gradient space-x-2"
            onClick={closeMenu}
            aria-label="Go to home page"
          >
            <span className="sr-only">Skip to main content</span>
            <span className="text-xl font-bold tracking-tight">STEM Assistant</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center text-sm font-medium transition-colors hover:text-foreground dark:text-white light:text-gray-800"
                aria-label={`Go to ${item.label} page`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {user ? (
              <Button variant="outline" className="glass-morph ml-2 hidden md:flex dark:text-white light:text-gray-800" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <Button variant="outline" className="glass-morph ml-2 hidden md:flex dark:text-white light:text-gray-800" asChild>
                <Link to="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
            )}

            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden glass-morph dark:text-white light:text-gray-800"
              onClick={toggleMenu}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && isMobile && (
        <div className="glass-morph md:hidden animate-fade-in">
          <nav className="container mx-auto py-6 px-4 flex flex-col gap-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="flex w-full items-center py-2 text-base font-medium dark:text-white light:text-gray-800"
                onClick={closeMenu}
                aria-label={`Go to ${item.label} page`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            
            {user ? (
              <Button variant="outline" className="glass-morph w-full mt-2 dark:text-white light:text-gray-800" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <Button variant="outline" className="glass-morph w-full mt-2 dark:text-white light:text-gray-800" asChild>
                <Link to="/login" onClick={closeMenu}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
