import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

type Theme = "dark" | "light";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "stem-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const root = window.document.documentElement;
    
    // If it's home page, enforce dark mode
    if (isHomePage) {
      root.classList.remove("light");
      
      if (!root.classList.contains("dark")) {
        root.classList.add("dark");
      }
      
      if (localStorage.getItem(storageKey) !== "dark") {
        localStorage.setItem(storageKey, "dark");
      }
      return;
    }
    
    // For other pages, apply the selected theme
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey, isHomePage]);

  // Theme setter for non-home pages
  const handleSetTheme = (newTheme: Theme) => {
    if (isHomePage) {
      console.log("Theme switching is disabled on the home page - using dark mode only");
      return;
    }
    setTheme(newTheme);
  };

  const value = {
    theme: isHomePage ? "dark" : theme,
    setTheme: handleSetTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
