import React, { useState, useEffect } from 'react';
import Spline from '@splinetool/react-spline';
import { useTheme } from '@/components/ThemeProvider';
import { useAnimationLoad } from '@/components/AnimationLoadProvider';
import { cn } from "@/lib/utils";

interface SplineAnimationProps {
  scene: string;
  className?: string;
  fallbackColor?: string;
}

// Add a style sheet for the component
const SplineStyleSheet = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
        .spline-min-height {
          min-height: 200px;
        }
        
        .spline-content {
          visibility: var(--spline-visibility, hidden);
          height: 100%;
          width: 100%;
        }
      `
    }}
  />
);

// SplineAnimation component that shows both a reliable gradient background
// and attempts to load a 3D Spline scene without breaking the UI
const SplineAnimation: React.FC<SplineAnimationProps> = ({
  scene,
  className = '',
  fallbackColor = 'bg-primary/10'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { theme } = useTheme();
  const { shouldLoadAnimation } = useAnimationLoad();

  // Function to hide the Spline watermark when loaded in light mode
  const handleLoad = () => {
    setIsLoaded(true);
    
    // Remove the watermark hiding code as we're using CSS to blur it instead
    // const watermarkElement = document.querySelector('[data-name="watermark"]');
    // if (watermarkElement && theme === 'light') {
    //   (watermarkElement as HTMLElement).style.display = 'none';
    // }
  };

  // Re-apply watermark hiding when theme changes
  useEffect(() => {
    if (isLoaded) {
      // Find and apply additional styling to the watermark
      const watermarkElement = document.querySelector('[data-name="watermark"]');
      if (watermarkElement) {
        // Apply additional styles for aggressive hiding
        const watermarkStyle = watermarkElement as HTMLElement;
        watermarkStyle.style.transition = 'filter 0.3s ease';
        watermarkStyle.style.zIndex = '-1'; // Push behind other elements
        
        // For light mode, be even more aggressive
        if (theme === 'light') {
          watermarkStyle.style.opacity = '0.02';
          watermarkStyle.style.transform = 'scale(0.3)';
          // Move it to a less visible position
          watermarkStyle.style.bottom = '-10px';
          watermarkStyle.style.right = '-10px';
        }
      }
      
      // Script to completely remove the logo watermark by targeting the shadow DOM
      const interval = setInterval(() => {
        const viewer = document.querySelector('spline-viewer');
        if (viewer && viewer.shadowRoot) {
          const logo = viewer.shadowRoot.querySelector('#logo');
          if (logo) {
            logo.remove(); // remove the logo element entirely
            console.log("Logo removed!");
            clearInterval(interval);
          }
        }
      }, 500);
      
      // Clean up interval on unmount
      return () => clearInterval(interval);
    }
  }, [theme, isLoaded]);

  const handleError = () => {
    setHasError(true);
    console.error('Error loading Spline scene');
  };

  // Apply a class based on theme for light mode styling
  const lightModeClass = theme === 'light' ? 'light-mode-spline' : '';

  // If animations should be skipped, show the fallback immediately
  if (!shouldLoadAnimation) {
    return (
      <div 
        className={cn(
          className,
          fallbackColor,
          lightModeClass,
          "rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 animate-gradient",
          "spline-min-height"
        )}
      >
        <SplineStyleSheet />
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-4">
            <p className="text-sm text-muted-foreground">Interactive content skipped for faster loading</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(className, lightModeClass, "relative rounded-lg overflow-hidden")}>
      <SplineStyleSheet />
      {!isLoaded && !hasError && (
        <div className={`absolute inset-0 ${fallbackColor} animate-pulse flex items-center justify-center`}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      
      {hasError && (
        <div className={`${fallbackColor} w-full h-full rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 animate-gradient`}>
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-4">
              <p className="text-sm text-muted-foreground">Could not load 3D experience</p>
            </div>
          </div>
        </div>
      )}
      
      <Spline
        scene={scene}
        onLoad={handleLoad}
        onError={handleError}
        className="spline-content"
        style={{ 
          '--spline-visibility': isLoaded ? 'visible' : 'hidden'
        } as React.CSSProperties}
      />
      
      {/* Always show the gradient background for reliability */}
      <div className={`absolute inset-0 -z-10 ${fallbackColor} bg-gradient-to-br from-blue-500/10 to-purple-500/10 animate-gradient pointer-events-none`}></div>
    </div>
  );
};

export default SplineAnimation; 