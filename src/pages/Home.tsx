import Spline from '@splinetool/react-spline';
import { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Camera,
  FileText,
  Headphones,
  Vibrate,
  Download,
  ArrowRight,
  Loader2
} from "lucide-react";

const getThemeColors = () => ({
  background: "bg-[#121212]",
  cardBackground: "glass-morph glass-edge-highlight",
  textPrimary: "text-white",
  textSecondary: "text-white/70",
  border: "border-white/10",
  primary: "blue-500",
  secondary: "purple-500",
  light: "teal-400",
  buttonPrimaryBg: "bg-stem-blue hover:bg-stem-blue/90 text-white button-shimmer",
  buttonOutline: "border-white/20 text-white/90 hover:bg-white/5 hover:border-white/30",
  gradientText: "text-gradient",
  heroGradient: "bg-gradient-radial from-stem-blue/10 via-transparent to-transparent",
  featureTitleGradient: "text-gradient-accent",
});

const Home = () => {
  const colors = getThemeColors();
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [splineError, setSplineError] = useState(false);
  const [currentScene, setCurrentScene] = useState('');
  const particlesRef = useRef<HTMLDivElement>(null);

  // Single scene URL for dark mode
  const sceneUrl = "https://prod.spline.design/RBd5AtmImgeP5Q40/scene.splinecode";

  useEffect(() => {
    if (sceneUrl !== currentScene) {
      setSplineLoaded(false);
      setSplineError(false);
      setCurrentScene(sceneUrl);
      console.log(`Loading scene: ${sceneUrl}`);
    }
    
    // Create ambient particles
    if (particlesRef.current) {
      const container = particlesRef.current;
      container.innerHTML = '';
      
      // Create particles
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random size
        const size = Math.random() * 8 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Random color (blue/purple hues)
        const hue = 210 + Math.random() * 60;
        particle.style.backgroundColor = `hsla(${hue}, 100%, 70%, ${Math.random() * 0.3 + 0.1})`;
        
        // Random animation duration
        particle.style.animationDuration = `${Math.random() * 20 + 10}s`;
        
        // Random delay
        particle.style.animationDelay = `${Math.random() * 5}s`;
        
        container.appendChild(particle);
      }
    }
  }, [sceneUrl, currentScene]);

  const handleSplineLoad = () => {
    console.log(`Spline scene loaded successfully: ${sceneUrl}`);
    setSplineLoaded(true);
  };

  const handleSplineError = (err: any) => {
    console.error(`Error loading Spline scene (${sceneUrl}):`, err);
    setSplineError(true);
  };

  return (
    <div className={`min-h-screen relative ${colors.background}`}>
      {/* Particles background */}
      <div ref={particlesRef} className="particles-container"></div>
      
      <section className="relative py-20 px-4 overflow-hidden min-h-[600px] flex items-center">
        <div className={`absolute inset-0 ${colors.heroGradient} z-0`} />
        
        {/* Spline 3D background */}
        {!splineError && (
          <div className="absolute inset-0 w-full h-full z-0">
            <Spline
              key={sceneUrl}
              scene={sceneUrl}
              onLoad={handleSplineLoad}
              onError={handleSplineError}
              style={{ width: '100%', height: '100%' }}
              className="opacity-80"
            />

            {/* Loading indicator */}
            {!splineLoaded && (
              <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30">
                <div className="flex flex-col items-center p-4 rounded-lg bg-black/40 backdrop-blur-md border border-white/10">
                  <Loader2 className={`h-10 w-10 animate-spin ${colors.textPrimary} mb-2`} />
                  <p className={`text-sm ${colors.textSecondary}`}>Loading 3D scene...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="container mx-auto relative z-10">
          <div className="premium-glass-card flex flex-col items-center text-center space-y-6 animate-fade-in 
            p-8 max-w-3xl mx-auto">
            <h1 className={`text-5xl md:text-7xl font-bold tracking-tight
              ${colors.gradientText}
              animate-fade-in
              leading-tight mb-4`}>
              Empower Your STEM Journey
            </h1>
            
            <p className={`text-xl md:text-2xl font-light
              ${colors.textSecondary}
              max-w-3xl leading-relaxed animate-fade-in delay-100
              tracking-wide`}>
              Accessible learning for visually impaired students through audio and tactile experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button
                size="lg"
                className={colors.buttonPrimaryBg}
                asChild
              >
                <Link to="/download">
                  <Download className="mr-2 h-5 w-5" />
                  Download the App
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className={colors.buttonOutline}
                asChild
              >
                <Link to="/about">
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-16 px-4 ${colors.background}`}>
        <div className="container mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${colors.featureTitleGradient}`}>
              App Features
            </h2>
            <p className={`${colors.textSecondary} max-w-2xl mx-auto`}>
              Our app transforms STEM education into audio and tactile experiences, making learning inclusive for all.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Headphones, title: "Text-to-Speech", description: "Converts all STEM content into clear audio, including textbooks, equations, and notes.", color: "text-stem-blue" },
              { icon: Camera, title: "Camera Functionality", description: "Photograph textbooks or handwritten equations for instant audio explanation.", color: "text-stem-purple" },
              { icon: FileText, title: "PDF Processing", description: "Import PDFs like study guides and textbooks for audio conversion and summaries.", color: "text-stem-light" },
              { icon: Vibrate, title: "Haptic Feedback", description: "Unique vibration patterns signal different content types for intuitive navigation.", color: "text-stem-blue" },
              { icon: BookOpen, title: "STEM-Specific Tools", description: "Step-by-step audio explanations of complex math expressions and interactive exercises.", color: "text-stem-purple" }
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className={`${colors.cardBackground} 
                    p-6 rounded-xl text-center transform transition-all duration-300 
                    card-hover
                    animation-delay-${(index + 1) * 100}`}
                >
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full glass-morph transition-all duration-300 transform group-hover:scale-110">
                      <IconComponent className={`h-10 w-10 ${feature.color}`} />
                    </div>
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${colors.textPrimary}`}>
                    {feature.title}
                  </h3>
                  <p className={colors.textSecondary}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
