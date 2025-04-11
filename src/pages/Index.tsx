
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Camera, 
  FileText, 
  Headphones, 
  Vibrate, 
  Download, 
  ArrowRight 
} from "lucide-react";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-radial from-stem-blue/20 via-transparent to-transparent" />
        
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col items-center text-center space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-gradient max-w-4xl">
              Empower Your STEM Journey
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
              Accessible learning for visually impaired students through audio and tactile experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button size="lg" className="glass-morph" asChild>
                <Link to="/download">
                  <Download className="mr-2 h-5 w-5" />
                  Download the App
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="glass-morph" asChild>
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
      <section className="py-16 px-4 bg-gradient-to-b from-background to-background/80">
        <div className="container mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold mb-4 text-gradient-accent">App Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our app transforms STEM education into audio and tactile experiences, making learning inclusive for all.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                icon: <ArrowRight className="h-10 w-10 text-stem-light" />,
                title: "Accessible Interface",
                description: "High-contrast colors, large text, and screen reader compatibility for all users."
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="glass-morph p-6 rounded-lg card-hover animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 p-3 rounded-full glass-morph">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <Button size="lg" className="glass-morph" asChild>
              <Link to="/download">
                <Download className="mr-2 h-5 w-5" />
                Get the App
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto glass-morph p-8 rounded-lg">
            <blockquote className="text-xl italic text-center">
              <p>"This app has transformed how I engage with STEM subjects. The audio explanations and haptic feedback make complex concepts accessible in ways I never thought possible."</p>
              <footer className="mt-4 text-sm text-muted-foreground">
                <cite>— Alex, Computer Science Student</cite>
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-t from-background to-background/80">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-gradient">Ready to Transform Your Learning Experience?</h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of students using our app to make STEM education accessible and engaging.
            </p>
            <Button size="lg" className="glass-morph" asChild>
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
