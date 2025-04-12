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
  Music
} from "lucide-react";
// Import SplineAnimation component and direct Spline import
import SplineAnimation from "@/components/SplineAnimation";
import Spline from '@splinetool/react-spline';
import { useTheme } from "@/components/ThemeProvider";

const Index = () => {
  const { theme } = useTheme();
  
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="relative py-16 mb-16 overflow-hidden min-h-[500px] flex items-center rounded-lg glass-morph">
        {/* Background gradient - always visible */}
        <div className={`absolute inset-0 z-0 ${
          theme === 'light' 
            ? 'bg-gradient-radial from-indigo-100/80 via-blue-50/30 to-transparent' 
            : 'bg-gradient-radial from-stem-blue/20 via-transparent to-transparent'
        }`} />
        
        {/* New 3D animation */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <Spline
            scene="https://prod.spline.design/RBd5AtmImgeP5Q40/scene.splinecode"
            className={theme === 'light' ? 'light-spline-container' : ''}
          />
        </div>
        
        <div className="relative z-10 w-full">
          <div className={`flex flex-col items-center text-center space-y-6 animate-fade-in p-8 max-w-3xl mx-auto ${
            theme === 'light' ? 'bg-white/40 backdrop-blur-sm rounded-xl shadow-lg' : ''
          }`}>
            <h1 className="text-4xl md:text-6xl font-bold text-gradient max-w-4xl">
              Empower Your STEM Journey
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
              Accessible learning for visually impaired students through audio and tactile experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button size="lg" asChild>
                <Link to="/download">
                  <Download className="mr-2 h-5 w-5" />
                  Download the App
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/about">
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* App Description Section */}
      <section className="mb-16 animate-fade-in">
        <div className={`max-w-4xl mx-auto ${theme === 'light' ? 'py-6' : ''}`}>
          <h2 className="text-3xl font-bold mb-6 text-gradient">About the App</h2>
          <p className="text-xl text-muted-foreground mb-6">
            The Assistive STEM Learning Platform is designed to make STEM education accessible to everyone, 
            especially those with visual impairments.
          </p>
          
          <div className={`glass-morph rounded-lg p-8 mb-12 ${theme === 'light' ? 'bg-white/50' : ''}`}>
            <h3 className="text-2xl font-semibold mb-4">Our Mission</h3>
            <p className="mb-6 text-muted-foreground">
              We believe that education should be accessible to everyone, regardless of physical ability. 
              Our mission is to break down barriers in STEM education by transforming visual content into 
              accessible formats that work for visually impaired students.
            </p>
            <p className="text-muted-foreground">
              Through innovative technology and thoughtful design, we're creating tools that enable 
              independent learning, boost confidence, and open doors to STEM careers for visually 
              impaired individuals.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16 animate-fade-in">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gradient-accent">App Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our app transforms STEM education into audio and tactile experiences, making learning inclusive for all.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Headphones className="h-10 w-10 text-stem-blue" />,
              title: "Text-to-Speech",
              description: "Converts all STEM content into clear audio, including textbooks, equations, and notes."
            },
            {
              icon: <Camera className="h-10 w-10 text-stem-purple" />,
              title: "Camera Functionality",
              description: "Photograph textbooks or handwritten equations for instant audio explanation."
            },
            {
              icon: <FileText className="h-10 w-10 text-stem-light" />,
              title: "PDF Processing",
              description: "Import PDFs like study guides and textbooks for audio conversion and summaries."
            },
            {
              icon: <Vibrate className="h-10 w-10 text-stem-blue" />,
              title: "Haptic Feedback",
              description: "Unique vibration patterns signal different content types for intuitive navigation."
            },
            {
              icon: <BookOpen className="h-10 w-10 text-stem-purple" />,
              title: "STEM-Specific Tools",
              description: "Step-by-step audio explanations of complex math expressions and interactive exercises."
            },
            {
              icon: <Music className="h-10 w-10 text-emerald-400" />,
              title: "Audio Stem Separation",
              description: "Isolates important audio elements from lectures or educational content for enhanced focus and clarity."
            }
          ].map((feature, index) => (
            <div 
              key={index} 
              className={`glass-morph p-6 rounded-lg card-hover animate-fade-in ${theme === 'light' ? 'bg-white/60 animation-delay-custom' : ''} animation-delay-${(index + 1) * 100}`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`mb-4 p-3 rounded-full ${theme === 'light' ? 'bg-white/80 shadow-md' : 'glass-morph'}`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <Button size="lg" asChild>
            <Link to="/download">
              <Download className="mr-2 h-5 w-5" />
              Get the App
            </Link>
          </Button>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="mb-16 animate-fade-in">
        <div className={`max-w-3xl mx-auto glass-morph p-8 rounded-lg ${theme === 'light' ? 'shadow-xl bg-white/60' : ''}`}>
          <blockquote className="text-xl italic text-center">
            <p>"This app has transformed how I engage with STEM subjects. The audio explanations and haptic feedback make complex concepts accessible in ways I never thought possible."</p>
            <footer className="mt-4 text-sm text-muted-foreground">
              <cite>— Alex, Computer Science Student</cite>
            </footer>
          </blockquote>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mb-16 animate-fade-in">
        <div className={`text-center ${theme === 'light' ? 'p-8 rounded-lg glass-morph bg-white/60 shadow-lg' : ''}`}>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-gradient">Ready to Transform Your Learning Experience?</h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of students using our app to make STEM education accessible and engaging.
            </p>
            <Button size="lg" asChild>
              <Link to="/download">
                <Download className="mr-2 h-5 w-5" />
                Download Now
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
