import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type AnimationLoadContextType = {
  shouldLoadAnimation: boolean;
  skipAnimationLoading: () => void;
  resetAnimationLoading: () => void;
};

const initialContext: AnimationLoadContextType = {
  shouldLoadAnimation: true,
  skipAnimationLoading: () => {},
  resetAnimationLoading: () => {},
};

const AnimationLoadContext = createContext<AnimationLoadContextType>(initialContext);

export const useAnimationLoad = () => useContext(AnimationLoadContext);

const ANIMATION_SKIP_KEY = 'skip-3d-animation';

export const AnimationLoadProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [shouldLoadAnimation, setShouldLoadAnimation] = useState(true);
  
  // Check if we should skip animation loading for this page
  useEffect(() => {
    const skipRoutes = ['/login', '/signup'];
    
    // Get stored preference
    const storedPreference = localStorage.getItem(ANIMATION_SKIP_KEY);
    
    // Skip animations on auth pages or if user has set preference to skip
    if (skipRoutes.includes(location.pathname) || storedPreference === 'true') {
      setShouldLoadAnimation(false);
    } else {
      setShouldLoadAnimation(true);
    }
  }, [location.pathname]);
  
  const skipAnimationLoading = () => {
    localStorage.setItem(ANIMATION_SKIP_KEY, 'true');
    setShouldLoadAnimation(false);
  };
  
  const resetAnimationLoading = () => {
    localStorage.removeItem(ANIMATION_SKIP_KEY);
    setShouldLoadAnimation(true);
  };
  
  return (
    <AnimationLoadContext.Provider 
      value={{ 
        shouldLoadAnimation, 
        skipAnimationLoading, 
        resetAnimationLoading 
      }}
    >
      {children}
    </AnimationLoadContext.Provider>
  );
};

export default AnimationLoadProvider; 